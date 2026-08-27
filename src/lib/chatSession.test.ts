import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  POLL_BASE_MS,
  POLL_MAX_MS,
  buildProvenance,
  extractIdentity,
  fetchChatMessages,
  isSessionGone,
  isStoredSessionUsable,
  mergeServerMessages,
  nextPollDelayMs,
  nextSinceCursor,
  openChatSession,
  patchChatIdentity,
  postChatMessage,
  unwrapEnvelope,
  type ChatServerMessage,
} from "./chatSession";

/**
 * The live chat's sharp edges, all of which are silent failures if they regress:
 *   - the honeypot must be sent and must be empty on every write;
 *   - a 429 must slow the poll down, never stop it and never spin;
 *   - a duplicate message id must not render a staff reply twice;
 *   - an unreachable endpoint (which is what a 404 looks like until the backend
 *     lane merges) must resolve to a plain failure so the caller falls back to
 *     /api/support instead of throwing at the visitor.
 */

const NOW = Date.parse("2026-08-03T10:00:00.000Z");

const msg = (id: string, over: Partial<ChatServerMessage> = {}): ChatServerMessage => ({
  id,
  role: "staff",
  content: `body ${id}`,
  sentAt: "2026-08-03T10:00:05.000Z",
  ...over,
});

const jsonResponse = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers });

/** The portal backend's REAL success shape: {success, data, message}. */
const envelope = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  jsonResponse({ success: true, data, message: "ok" }, status, headers);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isStoredSessionUsable", () => {
  it("accepts a session with time left on it", () => {
    expect(isStoredSessionUsable({ token: "t", expiresAt: "2026-08-03T11:00:00.000Z" }, NOW)).toBe(true);
  });

  it("rejects expired, empty, and malformed blobs", () => {
    expect(isStoredSessionUsable({ token: "t", expiresAt: "2026-08-03T09:00:00.000Z" }, NOW)).toBe(false);
    expect(isStoredSessionUsable({ token: "", expiresAt: "2026-08-03T11:00:00.000Z" }, NOW)).toBe(false);
    expect(isStoredSessionUsable({ token: "t", expiresAt: "not-a-date" }, NOW)).toBe(false);
    expect(isStoredSessionUsable(null, NOW)).toBe(false);
  });

  it("rejects a session about to lapse rather than resuming into a dead thread", () => {
    expect(isStoredSessionUsable({ token: "t", expiresAt: "2026-08-03T10:00:10.000Z" }, NOW)).toBe(false);
  });
});

describe("nextPollDelayMs", () => {
  it("polls at the base cadence while healthy", () => {
    expect(nextPollDelayMs(0)).toBe(POLL_BASE_MS);
  });

  it("backs off exponentially and caps — it never spins and never gives up", () => {
    expect(nextPollDelayMs(1)).toBe(10_000);
    expect(nextPollDelayMs(2)).toBe(20_000);
    expect(nextPollDelayMs(99)).toBe(POLL_MAX_MS);
    expect(nextPollDelayMs(99)).toBeGreaterThan(0);
  });

  it("obeys Retry-After from a 429, capped at the ceiling", () => {
    expect(nextPollDelayMs(0, 30)).toBe(30_000);
    expect(nextPollDelayMs(0, 9_999)).toBe(POLL_MAX_MS);
  });
});

describe("mergeServerMessages", () => {
  it("drops ids already on screen so a staff reply never doubles up", () => {
    const existing = [msg("a"), msg("b")];
    expect(mergeServerMessages(existing, [msg("b"), msg("c")]).map((m) => m.id)).toEqual(["a", "b", "c"]);
  });

  it("returns the same array when nothing is new", () => {
    const existing = [msg("a")];
    expect(mergeServerMessages(existing, [msg("a")])).toBe(existing);
  });
});

describe("nextSinceCursor", () => {
  it("advances to the newest message we have actually seen", () => {
    const cursor = nextSinceCursor(
      [msg("a", { sentAt: "2026-08-03T10:00:01.000Z" }), msg("b", { sentAt: "2026-08-03T10:00:09.000Z" })],
      "2026-08-03T10:00:20.000Z",
      ""
    );
    expect(cursor).toBe("2026-08-03T10:00:09.000Z");
  });

  it("falls back to server time — never the browser clock — when nothing arrived", () => {
    expect(nextSinceCursor([], "2026-08-03T10:00:20.000Z", "old")).toBe("2026-08-03T10:00:20.000Z");
  });
});

describe("isSessionGone", () => {
  it("treats only terminal statuses as terminal", () => {
    expect([401, 403, 404, 410].every(isSessionGone)).toBe(true);
    expect([429, 500, 502, null].some(isSessionGone)).toBe(false);
  });
});

describe("buildProvenance", () => {
  it("captures the site, the form, the page and the campaign", () => {
    const p = buildProvenance(
      "https://www.a4.com.mt/en/services?utm_source=google&utm_campaign=audit",
      "https://news.mt/"
    );
    expect(p.siteOrigin).toBe("a4.com.mt");
    expect(p.formName).toBe("support-chat");
    expect(p.utmSource).toBe("google");
    expect(p.utmCampaign).toBe("audit");
    expect(p.referrer).toBe("https://news.mt/");
  });

  it("omits empty fields instead of sending nulls", () => {
    const p = buildProvenance("https://a4.com.mt/en");
    expect("utmSource" in p).toBe(false);
    expect("referrer" in p).toBe(false);
  });
});

describe("network wrappers", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn() as unknown as typeof fetch;
  });

  const lastBody = () =>
    JSON.parse(
      (globalThis.fetch as unknown as { mock: { calls: [string, { body: string }][] } }).mock.calls.at(-1)![1].body
    );

  it("always sends an EMPTY honeypot on session open and on every message", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      envelope({ sessionToken: "tok", expiresAt: "2026-08-03T11:00:00.000Z" }, 201)
    );
    await openChatSession({ name: "Jane", email: "jane@borg.mt", message: "hi" });
    expect(lastBody().company_website).toBe("");

    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      envelope({ messageId: "m1", sentAt: "2026-08-03T10:00:01.000Z" }, 201)
    );
    await postChatMessage("tok", "second message");
    expect(lastBody().company_website).toBe("");
  });

  it("returns a token on the happy path", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      envelope({ sessionToken: "tok", expiresAt: "2026-08-03T11:00:00.000Z" }, 201)
    );
    const res = await openChatSession({ name: "Jane", email: "jane@borg.mt" });
    expect(res).toEqual({ ok: true, data: { token: "tok", expiresAt: "2026-08-03T11:00:00.000Z" } });
  });

  it("treats a 404 as a plain failure so the caller can fall back to /api/support", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse({ error: "nope" }, 404));
    const res = await openChatSession({ name: "Jane", email: "jane@borg.mt" });
    expect(res.ok).toBe(false);
    expect(res.ok === false && res.status).toBe(404);
  });

  it("never throws when the network is down", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("ENOTFOUND"));
    await expect(openChatSession({ name: "J", email: "j@b.mt" })).resolves.toEqual({ ok: false, status: null });
    await expect(postChatMessage("tok", "x")).resolves.toEqual({ ok: false, status: null });
    await expect(fetchChatMessages("tok")).resolves.toEqual({ ok: false, status: null });
  });

  it("rejects a 201 that came back without a token rather than faking a live thread", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse({}, 201));
    const res = await openChatSession({ name: "J", email: "j@b.mt" });
    expect(res.ok).toBe(false);
  });

  it("surfaces Retry-After from a 429 so the poll can honour it", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ error: "slow down" }, 429, { "retry-after": "12" })
    );
    const res = await fetchChatMessages("tok", "2026-08-03T10:00:00.000Z");
    expect(res.ok).toBe(false);
    expect(res.ok === false && res.retryAfterSeconds).toBe(12);
    expect(nextPollDelayMs(1, res.ok === false ? res.retryAfterSeconds : undefined)).toBe(12_000);
  });

  it("passes the since cursor and tolerates a body with no messages array", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ serverTime: "2026-08-03T10:00:20.000Z" }, 200)
    );
    const res = await fetchChatMessages("to/ken", "2026-08-03T10:00:00.000Z");
    const url = (globalThis.fetch as unknown as { mock: { calls: [string][] } }).mock.calls.at(-1)![0];
    expect(url).toContain("/public/chat/sessions/to%2Fken/messages?since=");
    expect(res.ok && res.data.messages).toEqual([]);
  });
});

describe("unwrapEnvelope — the production body shape", () => {
  it("unwraps {success, data} and tolerates a flat body", () => {
    expect(unwrapEnvelope({ success: true, data: { sessionToken: "t" }, message: "ok" })).toEqual({
      sessionToken: "t",
    });
    expect(unwrapEnvelope({ sessionToken: "t" })).toEqual({ sessionToken: "t" });
    // `data` key without the envelope marker is payload, not wrapper.
    expect(unwrapEnvelope({ data: [1], other: true })).toEqual({ data: [1], other: true });
  });
});

describe("live-first session open", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn() as unknown as typeof fetch;
  });

  const lastBody = () =>
    JSON.parse(
      (globalThis.fetch as unknown as { mock: { calls: [string, { body: string }][] } }).mock.calls.at(-1)![1].body
    );

  it("opens with a message alone — no name/email keys at all", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      envelope({ sessionToken: "tok", expiresAt: "2026-08-03T11:00:00.000Z" }, 201)
    );
    const res = await openChatSession({ message: "hi there" });
    expect(res.ok).toBe(true);
    const body = lastBody();
    expect(body.message).toBe("hi there");
    expect("name" in body).toBe(false);
    expect("email" in body).toBe(false);
    expect(body.company_website).toBe("");
  });

  it("patchChatIdentity PATCHes only the provided fields plus the honeypot", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(envelope({ ok: true }, 200));
    const res = await patchChatIdentity("tok", { email: "pat@example.com" });
    expect(res.ok).toBe(true);
    const call = (globalThis.fetch as unknown as { mock: { calls: [string, RequestInit][] } }).mock.calls.at(-1)!;
    expect(call[0]).toContain("/public/chat/sessions/tok/identity");
    expect(call[1].method).toBe("PATCH");
    const body = lastBody();
    expect(body).toEqual({ email: "pat@example.com", company_website: "" });
  });

  it("patchChatIdentity failure is a plain result, never a throw", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));
    await expect(patchChatIdentity("tok", { name: "Pat" })).resolves.toEqual({ ok: false, status: null });
  });
});

describe("extractIdentity — conservative parsing of a free-text reply", () => {
  it("finds an email and treats the remainder as the name", () => {
    expect(extractIdentity("Pat Prospect, pat@example.com")).toEqual({
      email: "pat@example.com",
      name: "Pat Prospect",
    });
    expect(extractIdentity("pat@example.com")).toEqual({ email: "pat@example.com" });
    expect(extractIdentity("My name is Pat and my email is PAT@Example.COM")).toEqual({
      email: "pat@example.com",
      name: "Pat",
    });
  });

  it("accepts a short plain name without an email", () => {
    expect(extractIdentity("Pat Prospect")).toEqual({ name: "Pat Prospect" });
  });

  it("refuses to guess from questions, sentences or URLs", () => {
    expect(extractIdentity("what are your opening hours?")).toEqual({});
    expect(
      extractIdentity("we run a shipping company in Valletta with about forty employees on the payroll")
    ).toEqual({});
    expect(extractIdentity("see https://example.com for context")).toEqual({});
  });
});
