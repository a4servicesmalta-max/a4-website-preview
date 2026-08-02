/** Client app origin — used when env vars are path-only (e.g. `/onboarding`). */
const CLIENT_ORIGIN = (
  process.env.NEXT_PUBLIC_CLIENT_ORIGIN?.trim() ||
  process.env.NEXT_PUBLIC_CLIENT_LOGIN_URL?.trim() ||
  "https://client.a4.com.mt"
).replace(/\/$/, "");

export function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

/** Turn `/onboarding` or full URL into absolute client-app link (never site-local). */
export function resolveClientUrl(pathOrUrl?: string, fallbackPath = "/"): string {
  const raw = (pathOrUrl?.trim() || fallbackPath).trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  const origin = /^https?:\/\//i.test(CLIENT_ORIGIN)
    ? CLIENT_ORIGIN.replace(/\/$/, "")
    : `https://${CLIENT_ORIGIN.replace(/\/$/, "")}`;
  return `${origin}${path}`;
}

/** Client login (existing accounts) */
export const CLIENT_LOGIN_URL = resolveClientUrl(process.env.NEXT_PUBLIC_CLIENT_LOGIN_URL, "/");

/** Client registration / onboarding (new accounts) — Access Portal navbar target */
export const CLIENT_ONBOARDING_URL = resolveClientUrl(
  process.env.NEXT_PUBLIC_CLIENT_ONBOARDING_URL,
  "/onboarding",
);

/**
 * Calendly booking link — the 30-minute consultation, shared by A4 and Vacei
 * so a prospect books the same slot whichever brand they came through.
 * Owner-supplied 2026-08-02. Override with NEXT_PUBLIC_CALENDLY_BOOKING_URL.
 *
 * The previous default (calendly.com/a4-info) was a placeholder and no env var
 * was set in production, so every "Book a consultation" button on the live site
 * was pointing at it.
 */
export const CALENDLY_BOOKING_URL =
  process.env.NEXT_PUBLIC_CALENDLY_BOOKING_URL?.trim() ||
  "https://calendly.com/cleven-a4/30min";

/** @deprecated Use CALENDLY_BOOKING_URL */
export const CALENDLY_DEMO_URL = CALENDLY_BOOKING_URL;
