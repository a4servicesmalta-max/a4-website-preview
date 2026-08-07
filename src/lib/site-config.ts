/** Public-facing support copy — override at launch if needed. */
export const SUPPORT_RESPONSE_LABEL =
  process.env.NEXT_PUBLIC_SUPPORT_RESPONSE_LABEL?.trim() || "Typical reply within one business day";

/**
 * The bookkeeping-software brand name shown to THIS site's customers.
 *
 * a4.com.mt (this repo) and vacei.com (a separate static site — see
 * `vacei-marketing-site/`) are two different marketing front ends that feed
 * the same portal backend. Both sell the same underlying software, under
 * different brand names. A quotation issued from a4.com.mt must always read
 * "A4 Books"; one issued from vacei.com must read "Vacei Books" — and each
 * site owns that decision for itself.
 *
 * This constant is that decision for a4.com.mt: the ONE place the label is
 * declared, so every quote/estimator call site imports it instead of
 * retyping the brand string. That is also the fix for how a literal
 * "Vacei Books" line ended up on an A4-issued quotation in the first place —
 * a label copy-pasted from the Vacei source design at one call site, never
 * swept when the rest of the site was rebranded.
 */
export const BOOKS_BRAND_NAME =
  process.env.NEXT_PUBLIC_BOOKS_BRAND_NAME?.trim() || "A4 Books";
