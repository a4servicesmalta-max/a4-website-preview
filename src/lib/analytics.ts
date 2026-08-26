/**
 * Conversion reporting for the paid-ads funnel.
 *
 * The site had no ad tag of any kind — no gtag, no GTM, no Ads conversion ID —
 * so campaigns had nothing to optimise toward and no spend could be attributed
 * to a lead. This is the reporting half; `ConsentedAnalytics` loads the tag,
 * and only after the visitor has accepted cookies.
 *
 * Everything here is DARK until the owner sets the ids in the Vercel
 * environment. With nothing configured, `trackConversion` is a no-op — it never
 * throws and never blocks a submission, because a lead landing in the CRM
 * always matters more than a lead being counted.
 */

/** Google tag id — either an Ads id (AW-…) or a GA4 id (G-…). */
export const GOOGLE_TAG_ID = (process.env.NEXT_PUBLIC_GOOGLE_TAG_ID ?? "").trim();

/**
 * Conversion label, as Google Ads issues it: `AW-123456789/AbC-D_efGh`.
 * One label covers every lead form; splitting per form is a reporting choice
 * the owner can make later in the Ads UI by adding more ids here.
 */
export const GOOGLE_ADS_CONVERSION_LABEL = (
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL ?? ""
).trim();

export const analyticsConfigured = (): boolean => GOOGLE_TAG_ID.length > 0;

/** Which form produced the lead — carried through as an event parameter. */
export type ConversionSource =
  | "quote-calculator"
  | "services-wizard"
  | "audit-estimator"
  | "accounting-estimator"
  | "contact"
  | "book-a-call"
  | "fs-review";

type Gtag = (...args: unknown[]) => void;

function gtag(): Gtag | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { gtag?: Gtag };
  return typeof w.gtag === "function" ? w.gtag : null;
}

/**
 * Report a completed lead. Safe to call unconditionally from any submit
 * handler: if the tag was never configured, or the visitor declined cookies
 * (in which case the tag was never loaded and `window.gtag` is absent), this
 * quietly does nothing.
 */
export function trackConversion(source: ConversionSource, value?: number): void {
  const g = gtag();
  if (!g) return;
  try {
    if (GOOGLE_ADS_CONVERSION_LABEL) {
      g("event", "conversion", {
        send_to: GOOGLE_ADS_CONVERSION_LABEL,
        ...(value != null && Number.isFinite(value) ? { value, currency: "EUR" } : {}),
      });
    }
    // Also emit a plain named event so GA4 (and any GTM trigger) sees the
    // funnel step even before an Ads conversion label exists.
    g("event", "generate_lead", {
      lead_source: source,
      ...(value != null && Number.isFinite(value) ? { value, currency: "EUR" } : {}),
    });
  } catch {
    /* reporting must never break a submission */
  }
}
