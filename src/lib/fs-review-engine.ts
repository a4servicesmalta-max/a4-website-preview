/**
 * Server-to-server client for the A4 FS-review engine (Railway).
 *
 * The engine runs in "accounts" mode (session-cookie auth), so the website
 * signs in with a dedicated service account (admin => unlimited checks) and
 * reuses the session cookie across requests. Falls back to legacy basic auth
 * for open-mode deployments where no service account is configured.
 */

const SESSION_TTL_MS = 6 * 24 * 3600 * 1000; // engine cookie lives 7 days; refresh a day early

let cachedCookie: string | null = null;
let cookieExpiresAt = 0;

function engineBase(): string | null {
  return process.env.A4_FSREVIEW_URL || null;
}

async function login(base: string): Promise<string | null> {
  const email = process.env.A4_FSREVIEW_SVC_EMAIL;
  const password = process.env.A4_FSREVIEW_SVC_PASSWORD;
  if (!email || !password) return null;
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    console.error(`fs-review-engine login failed: ${res.status}`);
    return null;
  }
  const setCookies = res.headers.getSetCookie?.() ?? [];
  const session = setCookies.find((c) => c.startsWith("vsession="));
  if (!session) {
    console.error("fs-review-engine login: no vsession cookie in response");
    return null;
  }
  cachedCookie = session.split(";")[0];
  cookieExpiresAt = Date.now() + SESSION_TTL_MS;
  return cachedCookie;
}

async function sessionCookie(base: string, forceRefresh = false): Promise<string | null> {
  if (!forceRefresh && cachedCookie && Date.now() < cookieExpiresAt) return cachedCookie;
  return login(base);
}

/**
 * POST to the engine with service-account session auth (re-login once on 401),
 * or legacy basic auth when no service account is configured.
 */
export async function engineFetch(path: string, body: FormData): Promise<Response> {
  const base = engineBase();
  if (!base) throw new Error("A4_FSREVIEW_URL not configured");

  const cookie = await sessionCookie(base);
  if (cookie) {
    let res = await fetch(`${base}${path}`, { method: "POST", headers: { Cookie: cookie }, body });
    if (res.status === 401) {
      const fresh = await sessionCookie(base, true);
      if (fresh) res = await fetch(`${base}${path}`, { method: "POST", headers: { Cookie: fresh }, body });
    }
    return res;
  }

  // Legacy open-mode deployments: basic auth.
  const auth = Buffer.from(`${process.env.A4_FSREVIEW_USER || "a4"}:${process.env.A4_FSREVIEW_PASS || ""}`).toString("base64");
  return fetch(`${base}${path}`, { method: "POST", headers: { Authorization: `Basic ${auth}` }, body });
}
