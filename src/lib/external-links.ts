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

/**
 * Client login (existing accounts). PINNED, not env-resolved (owner
 * 2026-08-29): both sites send existing clients to the one client portal at
 * this exact URL. It is deliberately not read from
 * NEXT_PUBLIC_CLIENT_LOGIN_URL — an env-resolved CTA is exactly how the
 * "Open the portal" button ended up cross-branded to another site (#46), and a
 * login link that silently follows an env var is not worth that risk.
 *
 * There is NO self-service signup behind it: accounts are opened by us after a
 * call, so this is a door for people who already have one.
 */
export const CLIENT_LOGIN_URL = "https://client.vacei.com/login";

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
