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

export function flagsForServiceSelection(selected: readonly string[]): IndependenceFlags {
  const has = (ids: readonly string[]) => selected.some((s) => ids.includes(s));
  return independenceFlags({
    wantsBookkeeping: has(BOOKKEEPING_SERVICE_IDS),
    wantsAudit: has(AUDIT_SERVICE_IDS),
  });
}
