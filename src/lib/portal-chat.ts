/**
 * Website chat → the portal's Support inbox (partner.vacei.com).
 *
 * Opens a public website-chat SESSION on the portal backend
 * (`POST /public/chat/sessions`, vacei-portal-backend modules/website-chat).
 * The backend turns it into a SUPPORT room staff answer from Messages /
 * Support inbox, notifies every ORG staff member, AND records the WebsiteLead
 * itself (`websiteChatService` → `websiteIntakeService.recordLead`), so the
 * caller must NOT file a second lead when this succeeds.
 *
 * History: this used to POST `/public/website-chat`, a route that never
 * existed on the backend (404) — every A4 chat silently fell back to a
 * lead-only submission and no thread ever reached the Support inbox.
 *
 * Base URL is QUOTE_API_BASE (already ends in /api/v1) — the same
 * portal-backend origin the quotation and lead paths use. `A4_PORTAL_URL`
 * points at the ops portal (team.a4.com.mt) and must not be used here.
 *
 * Fire-and-forget by design — the caller keeps its Requests/email fallback, so
 * a conversation is never lost if the portal is unreachable. The session token
 * is a credential: it stays server-side and is never logged or returned.
 */

import { QUOTE_API_BASE } from "@/lib/websiteQuotation";

/** Origin the portal maps to the A4 property; it reads this header, never the body. */
const A4_ORIGIN = "https://a4.com.mt";

type IngestInput = {
  name: string;
  email: string;
  message: string;
  pageUrl?: string;
};

/** Backend replies `{success, data: {sessionToken, expiresAt}}`; tolerate a flat body too. */
export function readSessionToken(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const b = body as { data?: unknown; sessionToken?: unknown };
  const inner = b.data && typeof b.data === "object" ? (b.data as { sessionToken?: unknown }) : null;
  const token = inner?.sessionToken ?? b.sessionToken;
  return typeof token === "string" && token.length > 0 ? token : null;
}

export async function pushChatToPortal(input: IngestInput): Promise<{ threadId: string } | null> {
  try {
    const res = await fetch(`${QUOTE_API_BASE}/public/chat/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: A4_ORIGIN },
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        message: input.message,
        provenance: {
          siteOrigin: A4_ORIGIN,
          formName: "website-chat",
          formLabel: "Website chat",
          pageUrl: input.pageUrl,
        },
        company_website: "",
      }),
      // Never hold the visitor's request open on a slow portal.
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const token = readSessionToken(await res.json().catch(() => null));
    // Only "opened" matters to the caller; the token itself never leaves this module.
    return token ? { threadId: "opened" } : null;
  } catch {
    return null; // swallowed on purpose — the caller still has its fallback
  }
}
