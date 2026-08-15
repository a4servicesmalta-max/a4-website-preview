/**
 * IESBA independence routing — decided at the point of enquiry, not later.
 *
 * A firm that keeps a client's books cannot also audit them. That is an
 * independence rule (IESBA Code, self-review threat; Malta's Accountancy
 * Profession Act applies the Code), not a preference and not a warning: it
 * decides which of two services A4 can take on before anyone spends time on a
 * proposal. So the site resolves it at the moment the prospect chooses, tells
 * them plainly, and carries the answer onto the lead record.
 *
 * THE single source of both the flag and the words. Every surface that can
 * capture a bookkeeping or audit request reads this file, so the site can
 * never explain the rule two different ways.
 *
 * Wire note — the flag names below (`auditEligible`, `bookkeepingEligible`)
 * are OURS. At the time of writing the portal backend's `WebsiteLead` model
 * and its `websiteLeadSchema` have no such field, so today the portal's zod
 * schema strips them silently. Two consequences, both deliberate:
 *   1. Sending them now is forward-compatible and harmless.
 *   2. Because they can be stripped, the same conclusion is ALSO written into
 *      the lead's `message` body by `independenceLeadNote()` — a human working
 *      the lead sees it whatever the backend does with the fields.
 * Delete the message line only once the field is persisted and verified.
 */

export type IndependenceRoute = "bookkeeping" | "audit" | "conflict" | "neutral";

export type IndependenceFlags = {
  /** False once the prospect asks A4 to keep the books. */
  auditEligible: boolean;
  /** False once the prospect asks A4 to audit. */
  bookkeepingEligible: boolean;
  route: IndependenceRoute;
};

export function independenceRoute(opts: {
  wantsBookkeeping: boolean;
  wantsAudit: boolean;
}): IndependenceRoute {
  if (opts.wantsBookkeeping && opts.wantsAudit) return "conflict";
  if (opts.wantsBookkeeping) return "bookkeeping";
  if (opts.wantsAudit) return "audit";
  return "neutral";
}

export function independenceFlags(opts: {
  wantsBookkeeping: boolean;
  wantsAudit: boolean;
}): IndependenceFlags {
  const route = independenceRoute(opts);
  return {
    // In the conflict case neither is asserted as available — a person decides
    // which service A4 takes, and the lead must not carry a guess.
    auditEligible: !opts.wantsBookkeeping,
    bookkeepingEligible: !opts.wantsAudit,
    route,
  };
}

/* -------------------------------------------------------------------------- */
/* What the prospect is told, at the moment they choose                        */
/* -------------------------------------------------------------------------- */

/**
 * Plain, factual, no alarm. It is a professional rule with a consequence, and
 * the consequence is stated once, in the same breath as the choice.
 *
 * ⚠ EN ONLY. These three strings are professional-independence wording and
 * must NOT be machine-translated. See src/i18n/locales/ — the other five
 * locales deliberately fall back to English until a human translator with the
 * relevant professional wording signs them off.
 */
export const INDEPENDENCE_BOOKKEEPING =
  "If we keep your books, we cannot also give assurance on them — neither a statutory audit nor the lighter review engagement. Independence rules do not allow the same firm to do both, so we would introduce you to an independent firm for the audit or review.";

export const INDEPENDENCE_AUDIT =
  "If we give assurance on your figures — a statutory audit or a review engagement — we cannot also keep your books. Independence rules do not allow the same firm to do both, so the bookkeeping would stay with you or with another firm.";

export const INDEPENDENCE_CONFLICT =
  "You have asked us both to keep the books and to give assurance on them. We cannot do both for the same client — independence rules do not allow it, and a review engagement carries the same requirement as a full audit. Tell us which one you want from A4 and we will arrange the other with an independent firm. Nothing is priced until that is settled.";

export const INDEPENDENCE_HEADING = "One thing to know before you send this";

/** The sentence the prospect sees for a given route, or null when nothing applies. */
export function independenceNotice(route: IndependenceRoute): string | null {
  switch (route) {
    case "bookkeeping":
      return INDEPENDENCE_BOOKKEEPING;
    case "audit":
      return INDEPENDENCE_AUDIT;
    case "conflict":
      return INDEPENDENCE_CONFLICT;
    default:
      return null;
  }
}

/**
 * The line written into the lead's message body, so the conclusion survives a
 * backend that does not yet persist the flags. Kept short and machine-greppable.
 */
export function independenceLeadNote(flags: IndependenceFlags): string | null {
  if (flags.route === "neutral") return null;
  return [
    `[independence] route=${flags.route}`,
    `audit_eligible=${flags.auditEligible}`,
    `bookkeeping_eligible=${flags.bookkeepingEligible}`,
  ].join(" · ");
}

/**
 * Which service selections count as which side of the rule.
 *
 * Keyed on the ids in `src/data/serviceRequestForms.ts` (SERVICE_FORMS[].id).
 * A new service form that touches either side must be added here, or it will
 * be treated as neutral and no flag will be set.
 */
export const BOOKKEEPING_SERVICE_IDS = ["Bookkeeping"] as const;
export const AUDIT_SERVICE_IDS = ["Audit & Annual Accounts"] as const;

/**
 * Page-level service LABELS that mean one of the canonical ids above.
 *
 * Surfaces that are not the multi-select request form describe themselves in
 * their own words — the accounting estimator hands off
 * `service: "Accounting & bookkeeping"`, which is a page title, not a form id.
 * Without this map that lead routed `neutral` while its own payload asserted
 * `Audit eligible: false`, so one record made two contradictory statements
 * about whether A4 may ever audit that client.
 *
 * Keep this SMALL and explicit. It is a compatibility shim for known surfaces,
 * not fuzzy matching: a label nobody has mapped stays neutral, loudly, rather
 * than being guessed into an independence conclusion.
 */
const SERVICE_LABEL_ALIASES: Record<string, string> = {
  "accounting & bookkeeping": "Bookkeeping",
  "accounting and bookkeeping": "Bookkeeping",
  "managed bookkeeping": "Bookkeeping",
  "audit & annual accounts": "Audit & Annual Accounts",
  "audit and annual accounts": "Audit & Annual Accounts",
  "audit or review": "Audit & Annual Accounts",
  "statutory audit": "Audit & Annual Accounts",
  "review engagement": "Audit & Annual Accounts",
};

/**
 * Whatever a client sent → the canonical service ids, ready for exact matching.
 *
 * Clients disagree about the wire shape and always have:
 *   - `ProcessStepsSection` sends a real array of ids;
 *   - `QuoteContent` sends ONE COMMA-JOINED STRING in both `services` and
 *     `service` (`sel.join(", ")`);
 *   - `QuoteActions` sends a single page LABEL in `service`.
 *
 * The route used to do `Array.isArray(x) ? x.map(String) : [String(x)]`, which
 * turned the joined string into a single element that could never equal
 * `"Bookkeeping"` — so the derivation silently never fired for the very case
 * it exists to catch (someone asking for the books AND the audit).
 *
 * Splitting on commas is safe because no canonical id contains one; the ids use
 * `&` and `/` as separators precisely so a join round-trips.
 */
export function normaliseServiceSelection(raw: unknown): string[] {
  const flat: string[] = [];
  const push = (v: unknown) => {
    if (v == null) return;
    if (Array.isArray(v)) return v.forEach(push);
    // Split a joined string back into its parts, then trim the join's spaces.
    String(v)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((s) => flat.push(s));
  };
  push(raw);

  const canonical = [...BOOKKEEPING_SERVICE_IDS, ...AUDIT_SERVICE_IDS] as readonly string[];
  return flat.map((s) => {
    // Exact id wins; otherwise a known label alias; otherwise pass it through
    // unchanged so it stays visibly unmatched rather than silently reshaped.
    if (canonical.includes(s)) return s;
    return SERVICE_LABEL_ALIASES[s.toLowerCase()] ?? s;
  });
}

/**
 * `selected` may be raw client input in any of the shapes above — it is
 * normalised here so no caller can forget to.
 */
export function flagsForServiceSelection(selected: readonly string[] | unknown): IndependenceFlags {
  const ids = normaliseServiceSelection(selected);
  const has = (want: readonly string[]) => ids.some((s) => want.includes(s));
  return independenceFlags({
    wantsBookkeeping: has(BOOKKEEPING_SERVICE_IDS),
    wantsAudit: has(AUDIT_SERVICE_IDS),
  });
}
