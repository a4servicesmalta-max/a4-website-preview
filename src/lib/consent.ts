/**
 * One place that decides whether a non-essential script may run.
 *
 * The cookie banner has always persisted the answer and its own source comment
 * has always said "non-essential scripts/cookies should only be loaded once
 * this value is 'accepted'" — but nothing read it, and Microsoft Clarity was
 * injected unconditionally from the root layout on every page. This module is
 * the missing half: the banner writes through `setConsent`, analytics reads
 * through `readConsent`, and `CONSENT_EVENT` lets the page react the moment the
 * visitor chooses, without a reload.
 */

export const CONSENT_COOKIE = "A4_cookie_consent";
export const CONSENT_EVENT = "a4:consent-change";

export type Consent = "accepted" | "rejected" | null;

/**
 * The stored choice, or null when the visitor has not chosen yet.
 *
 * Fails CLOSED: on the server, and on anything unrecognised, the answer is
 * "no consent". Analytics must never run on a guess.
 */
export function readConsent(): Consent {
  if (typeof document === "undefined") return null;
  const hit = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  if (!hit) return null;
  const value = hit.slice(CONSENT_COOKIE.length + 1);
  return value === "accepted" || value === "rejected" ? value : null;
}

/** Persist the choice for a year and tell the page about it immediately. */
export function setConsent(value: Exclude<Consent, null>): void {
  if (typeof document === "undefined") return;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

/** Subscribe to consent changes. Returns an unsubscribe function. */
export function onConsentChange(fn: (value: Consent) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => fn(readConsent());
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}
