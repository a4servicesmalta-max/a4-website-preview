// Push a website submission into the A4 internal portal's Requests inbox.
// Fire-and-forget: never throws, never blocks the user response.
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

export async function pushToPortal(req: PortalRequest): Promise<void> {
  const url = process.env.A4_PORTAL_URL;
  const key = process.env.A4_PORTAL_INGEST_KEY;
  if (!url || !key) return;
  try {
    await fetch(`${url.replace(/\/$/, "")}/api/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-ingest-key": key },
      body: JSON.stringify(req),
    });
  } catch {
    /* swallow — portal push must never break the user-facing flow */
  }
}
