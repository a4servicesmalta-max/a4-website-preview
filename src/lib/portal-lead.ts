/**
 * Website enquiry → the portal's WebsiteLead table.
 *
 * `pushToPortal` (lib/portal.ts) posts to the A4 *internal ops* portal
 * (`A4_PORTAL_URL` → team.a4.com.mt) — a different system that does NOT create
 * a WebsiteLead. `pushChatToPortal` opens a Messages thread, which also creates
 * no lead. So neither of those puts a row in front of whoever works the lead
 * list; this does.
 *
 * Base URL is deliberately QUOTE_API_BASE — the same portal-backend origin the
 * quotation path already uses successfully. Resolving it from A4_PORTAL_URL
 * would silently post to the ops portal instead and create nothing.
 *
 * Contract verified against the backend's `websiteLeadSchema`
 * (vacei-portal-backend, modules/website-intake/website-intake.domain.ts):
 *   { name, email, phone?, message?, source: 'contact'|'callback',
 *     sourceDetail?: slug, company_website? }
 * `source` is the coarse category and is stored as WEBSITE_CONTACT;
 * `sourceDetail` is the free-form slug naming the specific form.
 *
 * Never throws — a portal outage must not cost the visitor their submission.
 *
 * KNOWN LIMIT — this is a server-side call, so every lead keys on our Vercel
 * egress IP rather than the visitor's, and the portal caps public intake at
 * **20 per IP per hour** (backend `websiteIntakePerIpRateLimiter`). The upload
 * routes are low volume so that ceiling is fine today, but it is site-wide, not
 * per-visitor: past 20 in an hour the portal returns 429 and we return false.
 * That is at least honest — the caller reports `leadCaptured: false` and the UI
 * tells the visitor to email us. If this path ever gets busy, move the call
 * client-side (as the calculator's `submitWebsiteQuotation` and vacei.com's
 * chat.js both do), so each visitor keys on their own IP. Do NOT work around it
 * by forging X-Forwarded-For — the backend sets `trust proxy`, and that would be
 * a rate-limit bypass, not a fix.
 */

import { QUOTE_API_BASE } from "@/lib/websiteQuotation";

/** Origin the portal maps to the A4 property; it reads this header, never the body. */
const A4_ORIGIN = "https://a4.com.mt";

type LeadInput = {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  /** Which form this came from, e.g. "fs-review". Lowercase slug. */
  sourceDetail?: string;
  source?: "contact" | "callback";
};

export async function pushLeadToPortal(input: LeadInput): Promise<boolean> {
  const base = QUOTE_API_BASE;
  if (!base) return false;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/public/website-leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Server-to-server has no Origin, which the portal records as UNKNOWN.
        // We are a4.com.mt's own server, so say so and the lead is filed to A4.
        Origin: A4_ORIGIN,
      },
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        ...(input.phone ? { phone: input.phone } : {}),
        ...(input.message ? { message: input.message } : {}),
        source: input.source ?? "contact",
        ...(input.sourceDetail ? { sourceDetail: input.sourceDetail } : {}),
      }),
      // Never hold the visitor's request open on a slow portal.
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.warn("website-leads push failed:", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("website-leads push errored:", err);
    return false;
  }
}
