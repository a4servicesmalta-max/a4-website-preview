// Push a website submission into BOTH inboxes that need to see it:
//   1. the A4 internal ops portal's Requests inbox (team.a4.com.mt), and
//   2. the partner portal's Leads CRM (partner.a4.com.mt / partner.vacei.com),
//      via the shared portal-backend endpoint vacei.com's forms already use.
// Both are fire-and-forget: neither throws, neither blocks the user response,
// and a failure of one never suppresses the other.
import { QUOTE_API_BASE, SOURCE_SITE } from "@/lib/websiteQuotation";

/** Shared secret proving a server-to-server intake call — see its use below. */
function portalServerKey(): string {
  return (process.env.WEBSITE_INTAKE_SERVER_KEY || "").trim();
}

type PortalRequest = {
  requester?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  service?: string;
  message?: string;
  source?: string;
  priority?: "High" | "Med" | "Low";
  meta?: Record<string, unknown>;
};

async function pushToOpsPortal(req: PortalRequest): Promise<void> {
  const url = process.env.A4_PORTAL_URL;
  const key = process.env.A4_PORTAL_INGEST_KEY;
  if (!url || !key) {
    // Not an error in local dev, but in production it means every enquiry is
    // missing from the ops Requests inbox — and silently, which is worse.
    console.warn("[portal] A4_PORTAL_URL / A4_PORTAL_INGEST_KEY unset — ops-portal push skipped");
    return;
  }
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/api/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-ingest-key": key },
      body: JSON.stringify(req),
    });
    // A rejected push is a lost lead. It must not break the response, but it
    // must not vanish either — an un-inspected 4xx looks exactly like success.
    if (!res.ok) {
      console.error(`[portal] ops-portal push rejected: ${res.status} ${res.statusText}`, {
        email: req.email,
        source: req.source,
        body: await res.text().catch(() => "").then((t) => t.slice(0, 300)),
      });
    }
  } catch (err) {
    console.error("[portal] ops-portal push failed", { email: req.email, source: req.source, err });
  }
}

/**
 * Mirror the same submission into the partner portal's Leads CRM.
 *
 * The public contract is narrow (portal-backend websiteLeadSchema): `name` and
 * `email` are required, and `source` is a two-value enum — every A4 enquiry is
 * a 'contact'. The richer A4 source ("fs-review", "lead-magnet", …) has no
 * field of its own, so it is prefixed onto `message`, which is what staff
 * actually read in the Leads list.
 */
async function pushToPartnerLeads(req: PortalRequest): Promise<void> {
  const email = req.email?.trim();
  if (!email) return; // nothing to file a lead against

  // `name` is required (min 1). Never invent one: fall back to what they gave.
  const name = (req.name?.trim() || req.company?.trim() || email.split("@")[0] || "Website enquiry").slice(0, 200);

  // Origin line first, so staff can tell at a glance which site and which form
  // produced the lead — a4.com.mt and vacei.com both land in the same list.
  const label = [
    req.service,
    req.source && `form: ${req.source}`,
    req.priority && `priority: ${req.priority}`,
    req.company?.trim() && `company: ${req.company.trim()}`,
  ]
    .filter(Boolean)
    .join(" · ");
  const message = [`[a4.com.mt${label ? ` — ${label}` : ""}]`, req.message?.trim()]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 4000);

  try {
    const res = await fetch(`${QUOTE_API_BASE}/public/website-leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // This call has no browser behind it and therefore no Turnstile token
        // to carry — the token was already verified and spent by the /api/*
        // route that is calling us. The backend's CAPTCHA middleware admits a
        // server-to-server caller on this shared secret instead. Without it,
        // turning enforcement on at the backend would silently discard every
        // lead a4.com.mt forwards. Unset here = header omitted = the backend
        // sees an ordinary tokenless caller (fine while it is not enforcing).
        ...(portalServerKey() ? { "x-website-intake-key": portalServerKey() } : {}),
      },
      body: JSON.stringify({
        name,
        email,
        ...(req.phone?.trim() ? { phone: req.phone.trim().slice(0, 50) } : {}),
        ...(message ? { message } : {}),
        source: "contact",
        // Structured origin, not just the "[a4.com.mt — …]" text stamp above.
        // This call is made server-side, so the backend's Origin/Referer
        // fallback has nothing to read: without this field every A4 lead is
        // stored with sourceSite = null and cannot be filtered in the portal.
        site: SOURCE_SITE,
      }),
    });
    // Validation failures, rate limiting and honeypot rejections all come back
    // as a non-2xx that this call used to discard unread — the lead simply
    // never appeared in the CRM and nothing said so.
    if (!res.ok) {
      console.error(`[portal] partner-Leads push rejected: ${res.status} ${res.statusText}`, {
        email,
        source: req.source,
        body: await res.text().catch(() => "").then((t) => t.slice(0, 300)),
      });
    }
  } catch (err) {
    console.error("[portal] partner-Leads push failed", { email, source: req.source, err });
  }
}

export async function pushToPortal(req: PortalRequest): Promise<void> {
  // allSettled: one inbox being down must not cost us the other.
  await Promise.allSettled([pushToOpsPortal(req), pushToPartnerLeads(req)]);
}
