/**
 * Website chat → the portal's Messages area.
 *
 * The support widget used to be a one-way form: it landed in the Requests
 * inbox and an email, and there was nowhere for staff to reply. This posts the
 * same conversation into the portal's chat module instead, where it becomes a
 * real thread staff can answer from Messages.
 *
 * Fire-and-forget by design — the caller keeps its Requests/email fallback, so
 * a conversation is never lost if the portal is unreachable.
 */

type IngestInput = {
  name: string;
  email: string;
  message: string;
  pageUrl?: string;
  threadId?: string;
};

export async function pushChatToPortal(input: IngestInput): Promise<{ threadId: string } | null> {
  const base = process.env.A4_PORTAL_API_URL || process.env.A4_PORTAL_URL;
  if (!base) return null;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/api/v1/public/website-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      // Never hold the visitor's request open on a slow portal.
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const body = await res.json().catch(() => null);
    const threadId = body?.data?.threadId;
    return typeof threadId === "string" ? { threadId } : null;
  } catch {
    return null; // swallowed on purpose — the caller still has its fallback
  }
}
