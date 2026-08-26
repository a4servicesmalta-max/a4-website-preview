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
 * In-house booking page (site-local, locale-aware via the usual link helpers).
 * Replaces the old external Calendar-service links.
 */
export const BOOK_A_CALL_PATH = "/book-a-call";
