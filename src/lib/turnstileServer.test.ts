/**
 * The site's own Turnstile gate. Siteverify is stubbed, so what is pinned here
 * is the DECISION — which is the part that can quietly cost leads.
 *
 * Cloudflare's published dummy keys are named in the constants below for the
 * owner's staging env; they are not exercised here because these tests must
 * not make a network call.
 * https://developers.cloudflare.com/turnstile/troubleshooting/testing/
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { captchaGate, readCaptchaToken, verifyCaptcha } from "./turnstileServer";

export const TURNSTILE_TEST_KEYS = {
  sitekeyInvisibleAlwaysPasses: "1x00000000000000000000BB",
  secretAlwaysPasses: "1x0000000000000000000000000000000AA",
  secretAlwaysFails: "2x0000000000000000000000000000000AA",
} as const;

const REAL_ENV = { ...process.env };

function siteverifyReturns(body: unknown, ok = true) {
  return vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 502,
    json: async () => body,
  } as unknown as Response);
}

beforeEach(() => {
  process.env.TURNSTILE_SECRET_KEY = TURNSTILE_TEST_KEYS.secretAlwaysPasses;
  process.env.TURNSTILE_ENFORCE = "true";
});

afterEach(() => {
  process.env = { ...REAL_ENV };
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("readCaptchaToken", () => {
  it("reads either field name out of a JSON body", () => {
    expect(readCaptchaToken({ captchaToken: "  tok  " })).toBe("tok");
    expect(readCaptchaToken({ "cf-turnstile-response": "tok2" })).toBe("tok2");
    expect(readCaptchaToken({ captchaToken: "" })).toBeNull();
    expect(readCaptchaToken(null)).toBeNull();
  });

  it("reads a token out of FormData — the upload surfaces post multipart", () => {
    const fd = new FormData();
    fd.append("email", "a@b.com");
    fd.append("captchaToken", "from-multipart");
    expect(readCaptchaToken(fd)).toBe("from-multipart");
    expect(readCaptchaToken(new FormData())).toBeNull();
  });

  it("caps an oversized token rather than forwarding it to Cloudflare", () => {
    expect(readCaptchaToken({ captchaToken: "x".repeat(5000) })).toHaveLength(2048);
  });
});

describe("verifyCaptcha", () => {
  it("is inert until a secret key is set — no network call, nothing refused", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    const fetchSpy = siteverifyReturns({ success: false });
    vi.stubGlobal("fetch", fetchSpy);

    const decision = await verifyCaptcha({});
    expect(decision).toEqual({ ok: true, reason: "not-configured" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("passes a verified token", async () => {
    vi.stubGlobal("fetch", siteverifyReturns({ success: true }));
    expect(await verifyCaptcha({ captchaToken: "t" })).toEqual({ ok: true, reason: "verified" });
  });

  it("refuses a missing token only once enforcement is on", async () => {
    process.env.TURNSTILE_ENFORCE = "false";
    expect(await verifyCaptcha({})).toEqual({
      ok: true,
      reason: "missing-token-not-enforced",
    });

    process.env.TURNSTILE_ENFORCE = "true";
    expect(await verifyCaptcha({})).toEqual({ ok: false, reason: "missing-token" });
  });

  it("refuses a failed token only once enforcement is on, keeping the codes", async () => {
    vi.stubGlobal(
      "fetch",
      siteverifyReturns({ success: false, "error-codes": ["invalid-input-response"] })
    );

    process.env.TURNSTILE_ENFORCE = "false";
    expect(await verifyCaptcha({ captchaToken: "t" })).toEqual({
      ok: true,
      reason: "failed-not-enforced:invalid-input-response",
    });

    process.env.TURNSTILE_ENFORCE = "true";
    expect(await verifyCaptcha({ captchaToken: "t" })).toEqual({
      ok: false,
      reason: "failed:invalid-input-response",
    });
  });

  it("NEVER loses a lead to a Cloudflare outage, even while enforcing", async () => {
    // Network error.
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(Object.assign(new Error("x"), { name: "TimeoutError" })));
    expect(await verifyCaptcha({ captchaToken: "t" })).toEqual({
      ok: true,
      reason: "unreachable:TimeoutError",
    });

    // Non-2xx from Cloudflare.
    vi.stubGlobal("fetch", siteverifyReturns({}, false));
    expect(await verifyCaptcha({ captchaToken: "t" })).toEqual({
      ok: true,
      reason: "unreachable:http-502",
    });

    // 200 that is not JSON.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("not json");
        },
      } as unknown as Response)
    );
    expect(await verifyCaptcha({ captchaToken: "t" })).toEqual({
      ok: true,
      reason: "unreachable:bad-json",
    });
  });

  it("sends the secret, the token and the visitor IP to siteverify", async () => {
    const fetchSpy = siteverifyReturns({ success: true });
    vi.stubGlobal("fetch", fetchSpy);

    await verifyCaptcha({ captchaToken: "the-token" }, "203.0.113.7");

    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("challenges.cloudflare.com");
    const sent = new URLSearchParams(String(init.body));
    expect(sent.get("secret")).toBe(TURNSTILE_TEST_KEYS.secretAlwaysPasses);
    expect(sent.get("response")).toBe("the-token");
    expect(sent.get("remoteip")).toBe("203.0.113.7");
  });
});

describe("captchaGate", () => {
  const reqWith = (forwardedFor: string | null) => ({
    headers: { get: (name: string) => (name === "x-forwarded-for" ? forwardedFor : null) },
  });

  it("returns null when the submission may proceed", async () => {
    vi.stubGlobal("fetch", siteverifyReturns({ success: true }));
    expect(await captchaGate({ captchaToken: "t" }, "contact", reqWith(null))).toBeNull();
  });

  it("refuses with an actionable 400, not a silent fake success", async () => {
    const res = await captchaGate({}, "contact", reqWith(null));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(400);
    const body = (await res!.json()) as { error: string; code: string };
    expect(body.code).toBe("CAPTCHA_FAILED");
    // A person whose token expired has to be told to retry, or they walk away
    // believing they contacted us.
    expect(body.error).toMatch(/try again/i);
  });

  it("survives a request with no headers at all rather than 500ing a lead form", async () => {
    vi.stubGlobal("fetch", siteverifyReturns({ success: true }));
    // This gate sits in front of every form on the site; it must never be the
    // thing that breaks one. Each of these once threw.
    expect(await captchaGate({ captchaToken: "t" }, "contact", {} as never)).toBeNull();
    expect(await captchaGate({ captchaToken: "t" }, "contact", { headers: {} } as never)).toBeNull();
    expect(await captchaGate({ captchaToken: "t" }, "contact", undefined)).toBeNull();
  });

  it("takes the first hop of x-forwarded-for as the visitor IP", async () => {
    const fetchSpy = siteverifyReturns({ success: true });
    vi.stubGlobal("fetch", fetchSpy);

    await captchaGate({ captchaToken: "t" }, "contact", reqWith("203.0.113.7, 70.41.3.18"));

    const sent = new URLSearchParams(String((fetchSpy.mock.calls[0] as [string, RequestInit])[1].body));
    expect(sent.get("remoteip")).toBe("203.0.113.7");
  });
});
