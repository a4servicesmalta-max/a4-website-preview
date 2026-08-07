/**
 * Website chat → the portal's WebsiteLead table.
 *
 * `pushChatToPortal` opens a thread staff can reply to, but it does NOT create
 * a lead row — which is why A4 chat sessions surface in the portal as an
 * anonymous "Website visitor" with no name, no email and nothing to follow up.
 * vacei.com's widget avoids that by also filing the enquiry through
 * /public/website-leads, and this mirrors that call exactly.
 *
 * Fire-and-forget by design, same as portal-chat: the thread, the Requests
 * fallback and the email are all independent, so a portal outage costs the
 * visitor nothing.
 */

type LeadInput = {
  name: string;
  email: string;
  message: string;
};

export async function pushLeadToPortal(input: LeadInput): Promise<boolean> {
  const base = process.env.A4_PORTAL_API_URL || process.env.A4_PORTAL_URL;
  if (!base) return false;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/api/v1/public/website-leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        // The prefix is what tells staff a "contact" lead arrived through the
        // chat widget — vacei.com tags its own the same way.
        message: `[a4.com.mt — Website chat] ${input.message}`,
        source: "contact",
      }),
      // Never hold the visitor's request open on a slow portal.
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false; // swallowed on purpose — the caller still has its fallbacks
  }
}
