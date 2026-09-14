/**
 * First-touch ad attribution for a4.com.mt.
 *
 * THE PROBLEM THIS SOLVES: every lead form on this site posts SERVER-SIDE (a
 * Next route handler calls the portal backend). The browser's URL — the only
 * place `utm_*` and `gclid` ever exist — is not visible to that handler, so
 * until now every a4.com.mt lead reached the portal with NO campaign
 * attribution whatsoever. Paid campaigns pointed here would show spend against
 * zero attributable leads.
 *
 * WHY A COOKIE, and not a hidden field on each form: a first-party cookie is
 * sent automatically with the same-origin POST that every form already makes,
 * so attribution works for all five existing forms AND every form added later,
 * with no per-form wiring to forget. The alternative — threading a provenance
 * prop through each form component — is the same information carried by hand,
 * and the first form that forgets it fails silently.
 *
 * FIRST-touch, not last: someone lands on an ad, reads three pages, then fills
 * a form. The campaign that earned the lead is the one that brought them, so an
 * existing cookie is never overwritten within its lifetime.
 *
 * PRIVACY: this stores campaign labels and the ad platforms' own opaque click
 * IDs. No name, no email, no cross-site identifier, no third-party script, and
 * nothing that identifies a person on its own. It is same-site, first-party,
 * and expires in 30 days.
 */

/** First-party, readable by our own route handlers. Namespaced to avoid clashes. */
export const ATTRIBUTION_COOKIE = "a4_ft";

/**
 * 30 days. Long enough to cover the real gap between clicking an ad and asking
 * an accountant for a quote (rarely same-day for this kind of service), short
 * enough that a campaign cannot claim credit for a lead half a year later.
 */
export const ATTRIBUTION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const MAX_UTM_LEN = 160;
const MAX_CLICK_ID_LEN = 512;

/** Exactly the shape the portal's `websiteProvenanceSchema` accepts. */
export type Attribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  liFatId?: string;
};

const PARAM_MAP: Array<[keyof Attribution, string, number]> = [
  ["utmSource", "utm_source", MAX_UTM_LEN],
  ["utmMedium", "utm_medium", MAX_UTM_LEN],
  ["utmCampaign", "utm_campaign", MAX_UTM_LEN],
  ["utmTerm", "utm_term", MAX_UTM_LEN],
  ["utmContent", "utm_content", MAX_UTM_LEN],
  // Google and LinkedIn append these to ad landing URLs by default — they
  // arrive whether or not anyone set up a tracking template, which makes them
  // the one signal that survives a mistyped UTM.
  ["gclid", "gclid", MAX_CLICK_ID_LEN],
  ["liFatId", "li_fat_id", MAX_CLICK_ID_LEN],
];

/**
 * Pull attribution out of a URL query string. Returns null when there is
 * nothing to record, so the caller can tell "no ad click" from "empty values".
 */
export function parseAttribution(search: string): Attribution | null {
  const params = new URLSearchParams(search || "");
  const out: Attribution = {};
  let found = false;
  for (const [field, param, max] of PARAM_MAP) {
    const value = (params.get(param) || "").trim();
    if (!value) continue;
    out[field] = value.slice(0, max);
    found = true;
  }
  return found ? out : null;
}

/**
 * JSON, then encodeURIComponent — a cookie value may not contain `;` or `,` and
 * campaign names routinely do.
 */
export function encodeAttribution(attribution: Attribution): string {
  return encodeURIComponent(JSON.stringify(attribution));
}

/**
 * Decode a cookie value back to attribution.
 *
 * Hostile-input rule: this value round-trips through the visitor's browser, so
 * it is attacker-controlled. Every field is re-validated — unknown keys are
 * dropped, non-strings are dropped, and lengths are re-capped — rather than
 * trusted because we wrote it. Anything unparseable yields null, never a throw:
 * a mangled cookie must cost a lead its attribution, never its submission.
 */
export function decodeAttribution(raw: string | undefined | null): Attribution | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const source = parsed as Record<string, unknown>;
    const out: Attribution = {};
    let found = false;
    for (const [field, , max] of PARAM_MAP) {
      const value = source[field];
      if (typeof value !== "string") continue;
      const trimmed = value.trim();
      if (!trimmed) continue;
      out[field] = trimmed.slice(0, max);
      found = true;
    }
    return found ? out : null;
  } catch {
    return null;
  }
}

/**
 * Read attribution off an incoming request. Used by the route handlers that
 * push leads to the portal — this is the whole point of the cookie.
 */
export function attributionFromRequest(req: {
  headers?: { get(name: string): string | null };
}): Attribution | undefined {
  // Defensive on purpose. This sits on the path of every lead submission, and
  // the rule for the whole module is that attribution is a nice-to-have that
  // must never cost someone their enquiry. A caller with no readable headers
  // is simply unattributed.
  let header: string | null = null;
  try {
    header = req?.headers?.get?.("cookie") ?? null;
  } catch {
    return undefined;
  }
  if (!header) return undefined;
  // Cookie values are percent-encoded by `encodeAttribution`, so they can never
  // themselves contain `;` or `=` — a plain split is safe here.
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() !== ATTRIBUTION_COOKIE) continue;
    return decodeAttribution(part.slice(eq + 1).trim()) ?? undefined;
  }
  return undefined;
}
