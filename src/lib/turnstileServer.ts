/**
 * Cloudflare Turnstile — server side, for this site's own `/api/*` intake
 * routes.
 *
 * a4.com.mt has TWO kinds of lead surface and they are verified in two
 * different places, which is worth stating plainly because it is the thing
 * that is easy to get wrong:
 *
 *   - Forms posting to THIS site's `/api/*` routes (contact, health check,
 *     FS gap review, lead magnets, support): verified HERE, before the route
 *     does any work. The route then forwards the enquiry to the portal
 *     backend server-to-server using WEBSITE_INTAKE_SERVER_KEY — it does not
 *     forward the token, which is single-use and already spent.
 *   - The two quote calculators, which post from the BROWSER straight to the
 *     portal backend's `/public/website-quotations`: verified THERE, by the
 *     same token travelling in the request body.
 *
 * Rollout mirrors the backend's exactly, so the two cannot drift into
 * disagreeing about what is enforced:
 *   TURNSTILE_SECRET_KEY unset -> dark. TURNSTILE_ENFORCE=false -> log only.
 *   TURNSTILE_ENFORCE=true     -> a missing or failed token is refused.
 *
 * And, as on the backend: a Cloudflare outage never rejects a submission.
 * A lost genuine enquiry costs more than spam admitted during an outage.
 */

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 5000;
const MAX_TOKEN_LENGTH = 2048;

export type CaptchaDecision = {
  ok: boolean;
  /** Why, for the log line and for the observation window before enforcing. */
  reason: string;
};

function secretKey(): string {
  return (process.env.TURNSTILE_SECRET_KEY || "").trim();
}

function isEnforcing(): boolean {
  return (process.env.TURNSTILE_ENFORCE || "false").toLowerCase() === "true";
}

const TOKEN_FIELDS = ["captchaToken", "cf-turnstile-response"] as const;

function clean(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, MAX_TOKEN_LENGTH) : null;
}

/**
 * Pull the token out of a submission, whichever name the form used.
 *
 * Handles BOTH shapes this site posts: a parsed JSON object, and `FormData` —
 * the upload surfaces (`/api/accounting-health`, `/api/fs-gap-review`, and the
 * multipart branch of `/api/quote`) send multipart because they carry files.
 */
export function readCaptchaToken(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  if (typeof FormData !== "undefined" && body instanceof FormData) {
    for (const field of TOKEN_FIELDS) {
      const found = clean(body.get(field));
      if (found) return found;
    }
    return null;
  }
  const record = body as Record<string, unknown>;
  for (const field of TOKEN_FIELDS) {
    const found = clean(record[field]);
    if (found) return found;
  }
  return null;
}

type SiteverifyOutcome =
  | { outcome: "success" }
  | { outcome: "failed"; errorCodes: string[] }
  | { outcome: "unreachable"; reason: string };

async function siteverify(token: string, remoteIp?: string): Promise<SiteverifyOutcome> {
  const form = new URLSearchParams();
  form.set("secret", secretKey());
  form.set("response", token);
  if (remoteIp) form.set("remoteip", remoteIp);

  let res: Response;
  try {
    res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });
  } catch (err) {
    return { outcome: "unreachable", reason: err instanceof Error ? err.name : "fetch-error" };
  }
  if (!res.ok) return { outcome: "unreachable", reason: `http-${res.status}` };

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return { outcome: "unreachable", reason: "bad-json" };
  }
  const parsed = body as { success?: unknown; "error-codes"?: unknown };
  if (parsed?.success === true) return { outcome: "success" };
  const errorCodes = Array.isArray(parsed?.["error-codes"])
    ? (parsed["error-codes"] as unknown[]).map(String).slice(0, 10)
    : [];
  return { outcome: "failed", errorCodes };
}

/**
 * Verify one submission. Never throws — a throw here would turn a lead form
 * into a 500.
 *
 * @param body    the already-parsed JSON request body.
 * @param remoteIp the visitor's IP, when the route has it (`x-forwarded-for`).
 */
export async function verifyCaptcha(body: unknown, remoteIp?: string): Promise<CaptchaDecision> {
  if (!secretKey()) return { ok: true, reason: "not-configured" };

  const token = readCaptchaToken(body);
  const enforce = isEnforcing();

  if (!token) {
    return enforce
      ? { ok: false, reason: "missing-token" }
      : { ok: true, reason: "missing-token-not-enforced" };
  }

  const result = await siteverify(token, remoteIp);
  if (result.outcome === "success") return { ok: true, reason: "verified" };
  if (result.outcome === "unreachable") {
    return { ok: true, reason: `unreachable:${result.reason}` };
  }
  const codes = result.errorCodes.join(",") || "unknown";
  return enforce
    ? { ok: false, reason: `failed:${codes}` }
    : { ok: true, reason: `failed-not-enforced:${codes}` };
}

/**
 * Route-level guard. Returns a ready-to-return 400 when the submission must be
 * refused, or `null` to carry on.
 *
 * 400 with a real message, not a silent fake success: someone who left the tab
 * open long enough for the token to expire has to be told to try again, or
 * they walk away believing they contacted us.
 */
export async function captchaGate(
  body: unknown,
  surface: string,
  req?: { headers?: { get?(name: string): string | null } }
): Promise<Response | null> {
  // `remoteip` is optional to Cloudflare, so nothing here is worth throwing
  // over. Every hop is optional-chained: this gate sits in front of every lead
  // form on the site and must not be the thing that 500s one.
  const forwardedFor = req?.headers?.get?.("x-forwarded-for") ?? null;
  const remoteIp = forwardedFor?.split(",")[0]?.trim() || undefined;
  const decision = await verifyCaptcha(body, remoteIp);

  if (!decision.ok) {
    console.warn(`[captcha] refused ${surface}: ${decision.reason}`);
    return Response.json(
      {
        error: "We could not verify that you are human. Please reload the page and try again.",
        code: "CAPTCHA_FAILED",
      },
      { status: 400 }
    );
  }
  // The observation window lives on these lines — they are what shows real
  // traffic is carrying good tokens before TURNSTILE_ENFORCE is turned on.
  if (decision.reason !== "verified" && decision.reason !== "not-configured") {
    console.warn(`[captcha] allowed ${surface} without a verified token: ${decision.reason}`);
  }
  return null;
}
