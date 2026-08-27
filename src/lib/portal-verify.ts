/**
 * Email verification + prospect quote email, delegated to the portal backend.
 *
 * The site's own SMTP credentials are dead, so the backend (which has working
 * mail) owns the whole code-mail → confirm → check loop and the quote email.
 * The site's /api/verify/* routes are thin proxies; the AI-consuming routes
 * call `checkVerified` server-side and FAIL CLOSED on any doubt.
 *
 * Contract: JSON envelope `{success, data, message}`; on non-2xx read `message`.
 */
import { QUOTE_API_BASE } from "@/lib/websiteQuotation";

/** Origin the portal maps to the A4 property (brands mails + links as A4). */
export const A4_ORIGIN = "https://a4.com.mt";

const TIMEOUT_MS = 8000;

export type BackendResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

/** POST a JSON body to `{base}/public/{path}`; never throws. */
export async function postBackend<T>(path: string, body: unknown, fallbackMessage: string): Promise<BackendResult<T>> {
  if (!QUOTE_API_BASE) return { ok: false, status: 503, message: fallbackMessage };
  try {
    const res = await fetch(`${QUOTE_API_BASE}/public/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: A4_ORIGIN },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const json = (await res.json().catch(() => null)) as { data?: T; message?: string } | null;
    if (!res.ok) return { ok: false, status: res.status, message: json?.message || fallbackMessage };
    return { ok: true, data: (json?.data ?? {}) as T };
  } catch (err) {
    console.warn(`portal ${path} errored:`, err);
    return { ok: false, status: 503, message: fallbackMessage };
  }
}

/** True ONLY when the backend positively confirms the token; anything else is false. */
export async function checkVerified(email: string, verifiedToken: string): Promise<boolean> {
  if (!email || !verifiedToken) return false;
  const r = await postBackend<{ verified?: boolean }>("email-verify/check", { email, verifiedToken }, "check failed");
  return r.ok && r.data.verified === true;
}

/** Best-effort prospect quote email; returns whether the backend sent it. */
export async function sendAuditQuoteEmail(input: {
  email: string;
  verifiedToken: string;
  name?: string;
  fee: number;
  docKind?: string;
}): Promise<boolean> {
  const r = await postBackend<{ emailed?: boolean }>(
    "audit-quote-email",
    { ...input, fee: Math.round(input.fee) },
    "quote email failed",
  );
  return r.ok && r.data.emailed === true;
}
