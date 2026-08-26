/**
 * Google conversion measurement (GA4 + Google Ads) and Consent Mode v2.
 *
 * Design rules, all deliberate:
 *
 *  1. NOTHING is hardcoded. Every ID and every Ads conversion label comes from a
 *     `NEXT_PUBLIC_*` environment variable. With none of them set, `TRACKING_ENABLED`
 *     is false, `<GoogleTags />` renders nothing, `window.gtag` never exists, and
 *     every function here is a silent no-op. A missing ID is never a crash.
 *
 *  2. `process.env.NEXT_PUBLIC_*` is read through STATIC member expressions only.
 *     Next inlines those at build time; a dynamic `process.env[key]` lookup would
 *     silently be `undefined` in the browser bundle.
 *
 *  3. IDs are format-checked before they are ever interpolated into an inline
 *     script tag. A malformed value is treated as unset rather than injected.
 *
 *  4. `trackConversion` fires ONLY through `window.gtag`, which only exists once
 *     the tag script has run. Call it on a CONFIRMED success branch — never on a
 *     button click. The lead routes return 502 when the write fails, so a
 *     click-triggered conversion would report leads that never arrived.
 */

/* -------------------------------------------------------------------------- */
/* Consent                                                                     */
/* -------------------------------------------------------------------------- */

/** The cookie CookieConsentBanner already writes. Single source of truth. */
export const CONSENT_COOKIE_NAME = "A4_cookie_consent";

export type ConsentChoice = "accepted" | "rejected";

/**
 * Consent Mode v2 defaults — everything non-essential DENIED until the visitor
 * says otherwise. `security_storage` is the one exception: it is strictly
 * necessary and is granted by default, as Google specifies.
 */
export const CONSENT_DEFAULT = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
  functionality_storage: "denied",
  personalization_storage: "denied",
  security_storage: "granted",
} as const;

export const CONSENT_GRANTED = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
  functionality_storage: "granted",
  personalization_storage: "granted",
  security_storage: "granted",
} as const;

/** An explicit refusal. Identical to the default, sent so the update is logged. */
export const CONSENT_DENIED = CONSENT_DEFAULT;

/* -------------------------------------------------------------------------- */
/* Configuration                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Google measurement IDs and Ads conversion labels are all of the form
 * `G-XXXXXXX`, `AW-123456789`, `AbC-D_efGh1jKlm`. Anything outside this
 * character set is not a Google ID, and we refuse to write it into a script tag.
 */
const ID_PATTERN = /^[A-Za-z0-9_-]+$/;

function readId(raw: string | undefined): string {
  const value = (raw ?? "").trim();
  return value && ID_PATTERN.test(value) ? value : "";
}

/** GA4 measurement ID, e.g. `G-XXXXXXXXXX`. Empty string when unset. */
export const GA4_ID = readId(process.env.NEXT_PUBLIC_GA4_ID);

/** Google Ads conversion ID, e.g. `AW-123456789`. Empty string when unset. */
export const GADS_ID = readId(process.env.NEXT_PUBLIC_GADS_ID);

/** No IDs, no scripts. The whole tracking layer disappears from the page. */
export const TRACKING_ENABLED = Boolean(GA4_ID || GADS_ID);

/* -------------------------------------------------------------------------- */
/* Conversion events                                                           */
/* -------------------------------------------------------------------------- */

/**
 * One name per lead action, closed union. Distinct names so Google Ads can bid
 * on them separately — a single lumped "lead" event cannot be optimised against.
 *
 * Names follow GA4 rules: lowercase, alphanumeric + underscore, under 40 chars.
 */
export type ConversionEvent =
  /** Homepage calculator — quote submitted and accepted by the backend. */
  | "quote_request_home_calculator"
  /** /pricing calculator — quote submitted and accepted by the backend. */
  | "quote_request_pricing"
  /** /contact — the contact form posted successfully. */
  | "contact_form_submit"
  /** /quote — the quote request form posted successfully. */
  | "quote_form_submit"
  /** FS / trial-balance upload accepted by the review engine. */
  | "financial_upload_submit"
  /** /book-a-call — a demo slot booked through the in-house scheduler. */
  | "book_a_call_submit";

/**
 * Per-event Google Ads conversion label (the part after the slash in
 * `AW-123456789/AbC-D_efGh1jKlm`). Static reads — see rule 2 above.
 *
 * An event with no label set still sends its GA4 event; it simply does not
 * report an Ads conversion. That is the intended half-configured behaviour.
 */
const CONVERSION_LABELS: Record<ConversionEvent, string> = {
  quote_request_home_calculator: readId(process.env.NEXT_PUBLIC_GADS_CONVERSION_LABEL_HOME_CALCULATOR),
  quote_request_pricing: readId(process.env.NEXT_PUBLIC_GADS_CONVERSION_LABEL_PRICING),
  contact_form_submit: readId(process.env.NEXT_PUBLIC_GADS_CONVERSION_LABEL_CONTACT),
  quote_form_submit: readId(process.env.NEXT_PUBLIC_GADS_CONVERSION_LABEL_QUOTE),
  financial_upload_submit: readId(process.env.NEXT_PUBLIC_GADS_CONVERSION_LABEL_UPLOAD),
  book_a_call_submit: readId(process.env.NEXT_PUBLIC_GADS_CONVERSION_LABEL_BOOK_A_CALL),
};

/* -------------------------------------------------------------------------- */
/* The gtag bridge                                                             */
/* -------------------------------------------------------------------------- */

type GtagFn = (...args: unknown[]) => void;

/**
 * The page's gtag function, or null. Null whenever we are on the server, or the
 * tracking layer was never rendered because no IDs are configured. Every public
 * function below returns early on null — that is the no-op guarantee.
 */
function getGtag(): GtagFn | null {
  if (typeof window === "undefined") return null;
  const fn = (window as unknown as { gtag?: unknown }).gtag;
  return typeof fn === "function" ? (fn as GtagFn) : null;
}

/**
 * Report a completed lead action.
 *
 * ⚠ Call this on the CONFIRMED success branch only — after the response has been
 * checked. Firing on click reports conversions for leads that 502'd.
 *
 * Never throws: an unknown event name, a missing gtag, or an unconfigured site
 * all end in a quiet return.
 */
export function trackConversion(
  event: ConversionEvent,
  params: { value?: number; currency?: string } = {},
): void {
  const gtag = getGtag();
  if (!gtag) return;
  if (!Object.prototype.hasOwnProperty.call(CONVERSION_LABELS, event)) return;

  const payload: Record<string, unknown> = {};
  if (typeof params.value === "number" && Number.isFinite(params.value)) {
    payload.value = params.value;
    payload.currency = params.currency ?? "EUR";
  }

  // GA4 event. Harmless when GA4 is unconfigured — there is no GA4 destination
  // for gtag to deliver it to.
  gtag("event", event, payload);

  // Google Ads conversion. Needs BOTH the account ID and this event's label;
  // without a label there is no conversion action to credit.
  const label = CONVERSION_LABELS[event];
  if (GADS_ID && label) {
    gtag("event", "conversion", { ...payload, send_to: `${GADS_ID}/${label}` });
  }
}

/**
 * Push the visitor's cookie-banner choice into Consent Mode. Called by
 * CookieConsentBanner the moment Accept or Reject is clicked.
 *
 * On accept we also lift `ads_data_redaction`, which the default script sets
 * while consent is denied.
 */
export function updateConsent(choice: ConsentChoice): void {
  const gtag = getGtag();
  if (!gtag) return;
  const granted = choice === "accepted";
  gtag("consent", "update", granted ? CONSENT_GRANTED : CONSENT_DENIED);
  gtag("set", "ads_data_redaction", !granted);
}
