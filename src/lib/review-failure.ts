/**
 * Shared failure state for the file-upload review calls
 * (`/api/fs-gap-review`, `/api/accounting-health`).
 *
 * Both endpoints answer a failed upstream engine call with their own JSON 502,
 * so the browser must distinguish three cases and never leave the user staring
 * at a button that has silently stopped doing anything:
 *
 *   - `server`  — our API answered with a non-2xx. The request reached us, so
 *                 the lead is normally already in the portal; the route says so
 *                 explicitly via `leadCaptured` on the error body.
 *   - `network` — `fetch` rejected (offline, DNS, TLS, request aborted). Nothing
 *                 reached us, so we must NOT claim the details were received.
 *
 * The response body is only read *after* the status check, so a non-JSON error
 * page from the platform edge is reported as a server failure rather than being
 * mislabelled a network problem by a thrown `res.json()`.
 */

export type ReviewFailure =
  | {
      kind: "server";
      status: number;
      /** Human-readable reason from our API, when it sent one. */
      detail: string;
      /** True when the API confirmed the lead reached the portal. */
      leadCaptured: boolean;
    }
  | { kind: "network" };

export const NETWORK_FAILURE: ReviewFailure = { kind: "network" };

export async function readReviewFailure(res: Response): Promise<ReviewFailure> {
  let detail = "";
  let leadCaptured = false;
  try {
    const body: unknown = await res.json();
    if (body && typeof body === "object") {
      const b = body as { error?: unknown; leadCaptured?: unknown };
      if (typeof b.error === "string") detail = b.error;
      leadCaptured = b.leadCaptured === true;
    }
  } catch {
    /* Gateway HTML / empty body — the status alone drives the message. */
  }
  return { kind: "server", status: res.status, detail, leadCaptured };
}
