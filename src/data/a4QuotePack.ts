/**
 * THE single source of truth for every A4 fee shown on this website.
 *
 * It transcribes quote pack `mt-2026-08-02b` — the pack that already drives the
 * Vacei calculator (`vacei-marketing-site/index.html`) and the portal backend
 * (`portal-backend/src/modules/quote-pack/malta-pack.ts`). Those three copies
 * are byte-equivalent by design: if a fee changes, bump `A4_QUOTE_PACK_VERSION`
 * and change the number in ALL THREE places in the same change.
 *
 * Copy conventions every surface reading this file must follow:
 *   - "from €X" whenever the figure is a floor rather than the final price
 *   - "/mo", "/yr", "one-off" — never "per month billed annually" games
 *   - "All fees exclude VAT" wherever a total is shown  → PRICING_VAT_NOTE
 *   - government / registry fees are "passed through at cost" → PRICING_GOV_NOTE
 *
 * Nothing in here is confidential — it is the published price list.
 */

/**
 * mt-2026-08-02b flattens the audit volume curve and mirrors the cut onto the
 * tax-return table (owner decision 2026-08-02): entry bands held, reductions
 * deepening from −13% to −37% as volume rises. Top audit band 5,800 → 3,650.
 *
 * mt-2026-08-02 adds the pre-trading band only: AUDIT_YEARLY["0"] 0 → 600 and
 * TAX_RETURN_YEARLY["0"] 0 → 175 (owner decision 2026-08-02, so that the
 * "audit from €600/yr" headline on /audit-services is a price the calculator
 * will actually quote). Every other fee is unchanged from mt-2026-08-01.
 *
 * VERIFIED IN SYNC 2026-08-03. The two sibling copies carry the same figures,
 * pre-trading band included — checked line by line against
 * `GET https://vacei-portal-backend.onrender.com/api/v1/public/quote-pack` and
 * against vacei.com:
 *   - vacei-marketing-site/index.html
 *   - portal-backend/src/modules/quote-pack/malta-pack.ts
 * In particular AUDIT_YEARLY["0"] = 600 and TAX_RETURN_YEARLY["0"] = 175 are
 * canonical, not local to this file. An earlier note here claimed the canonical
 * pack still had 0 in that band; it does not, and that note was wrong.
 */
export const A4_QUOTE_PACK_VERSION = "mt-2026-08-02b";

export const PRICING_CURRENCY = "EUR";

/* -------------------------------------------------------------------------- */
/* Bands and tiers                                                             */
/* -------------------------------------------------------------------------- */

export type TxnBand = "0" | "1-20" | "21-60" | "61-150" | "151-400" | "401-1000" | "1000+";

export const TXN_BANDS: { id: TxnBand; label: string; hint: string }[] = [
  { id: "0", label: "None yet", hint: "not trading" },
  { id: "1-20", label: "Up to 20", hint: "a few a week" },
  { id: "21-60", label: "20 to 60", hint: "most days" },
  { id: "61-150", label: "60 to 150", hint: "busy" },
  { id: "151-400", label: "150 to 400", hint: "high volume" },
  { id: "401-1000", label: "400 to 1,000", hint: "very high" },
  { id: "1000+", label: "1,000+", hint: "enterprise" },
];

export type RiskTier = "standard" | "elevated" | "high" | "refer";

/** Risk multiplier + the one-off onboarding & due-diligence fee it carries. */
export const RISK_TIERS: Record<RiskTier, { label: string; multiplier: number | null; onboarding: number | null }> = {
  standard: { label: "Standard", multiplier: 1.0, onboarding: 95 },
  elevated: { label: "Elevated", multiplier: 1.2, onboarding: 250 },
  high: { label: "High", multiplier: 1.45, onboarding: 550 },
  refer: { label: "Referral", multiplier: null, onboarding: null },
};

/**
 * Which risk tier a sector falls into. Transcribed from the canonical pack's
 * `sectorRiskMap` — the backend already serves exactly this, so a surface that
 * resolves risk through here agrees with the server's re-pricing by
 * construction. `other` is deliberately 'refer': it has no multiplier, so it
 * can never be quoted instantly and must go down the lead path.
 */
export const SECTOR_RISK: Record<string, RiskTier> = {
  shop: "standard",
  consulting: "standard",
  property: "standard",
  hospitality: "elevated",
  online: "elevated",
  holding: "elevated",
  regulated: "high",
  other: "refer",
};

/** The sector question, worded the same wherever it is asked. */
export const SECTOR_OPTIONS: { id: string; label: string }[] = [
  { id: "shop", label: "Shop, trade or services" },
  { id: "consulting", label: "Consulting or freelancing" },
  { id: "property", label: "Property or rentals" },
  { id: "hospitality", label: "Restaurant, bar or hotel" },
  { id: "online", label: "Online sales or cross-border" },
  { id: "holding", label: "Holding or investment company" },
  { id: "regulated", label: "Gaming, crypto or financial services" },
  { id: "other", label: "Something else" },
];

/**
 * Audit SCOPE surcharges — extra audit work driven by what the company has,
 * not by transaction volume. Lifted out of `src/lib/audit-fee.ts` so the
 * numbers live with every other fee rather than buried in one calculator.
 *
 * ⚠ NOT part of the instant-quotation contract. The portal backend's
 * `evaluateA4ServicesQuote` has no concept of these, so a surface that ADDS
 * them to a submitted total would put it out of the server's €1/1% tolerance
 * and turn every quote into a silent 202. They are therefore used only by the
 * /audit-services estimator, which is a lead-path surface. Applying them on
 * /pricing or /a4-services requires the same entries to land in the backend
 * pack and evaluator first, in a coordinated release that bumps
 * A4_QUOTE_PACK_VERSION in all three copies at once.
 */
export const AUDIT_SCOPE_SURCHARGES = {
  payrollByHeadcount: { none: 0, "1-5": 100, "6-20": 250, "21+": 450 } as Record<string, number>,
  vatRegistered: 150,
  banksByCount: { "1": 0, "2-3": 100, "4+": 250 } as Record<string, number>,
};

/* -------------------------------------------------------------------------- */
/* Recurring service tables                                                    */
/* -------------------------------------------------------------------------- */

/** Full-service bookkeeping — €/mo by transaction band, × risk multiplier. */
export const BOOKKEEPING_MONTHLY: Record<TxnBand, number> = {
  "0": 0,
  "1-20": 59,
  "21-60": 99,
  "61-150": 169,
  "151-400": 279,
  "401-1000": 469,
  "1000+": 769,
};

/** VAT returns at art. 10 — €/mo by transaction band, × art factor × risk. */
export const VAT_MONTHLY: Record<TxnBand, number> = {
  "0": 0,
  "1-20": 29,
  "21-60": 45,
  "61-150": 69,
  "151-400": 99,
  "401-1000": 139,
  "1000+": 189,
};

/**
 * Annual company tax return — €/yr by transaction band, × risk.
 *
 * Owner decision 2026-08-02 (pack mt-2026-08-02b): same volume-flattening cut
 * as AUDIT_YEARLY, band for band, so the combined audit + tax-return quote
 * stays coherent. Entry bands held; reductions deepen with volume.
 *   21-60 −13% · 61-150 −20% · 151-400 −25% · 401-1000 −31% · 1000+ −37%
 */
export const TAX_RETURN_YEARLY: Record<TxnBand, number> = {
  // Pre-trading company: still a return to file, just a much smaller one.
  "0": 175, //   unchanged
  "1-20": 275, // unchanged
  "21-60": 325, //    was 375
  "61-150": 420, //   was 525
  "151-400": 560, //  was 750
  "401-1000": 760, // was 1100
  "1000+": 1040, //   was 1650
};

/**
 * Statutory audit — €/yr by transaction band, × risk.
 *
 * Owner decision 2026-08-02 (pack mt-2026-08-02b): the volume escalation was
 * too steep — the top band was 7.7× the entry, which priced busy ledgers out.
 * Entry bands are held so the advertised "from" price does not move; the cut
 * deepens with volume, bringing the top band to 4.9× the entry.
 */
export const AUDIT_YEARLY: Record<TxnBand, number> = {
  // Pre-trading / dormant company. Priced rather than left unpriced, so the
  // "audit from €600/yr" headline on /audit-services is true of an actual
  // quote the calculator will produce. Any trading company starts at €750.
  "0": 600, //     unchanged
  "1-20": 750, //  unchanged
  "21-60": 995, //    was 1150  −13%
  "61-150": 1395, //  was 1750  −20%
  "151-400": 1950, // was 2600  −25%
  "401-1000": 2700, //was 3900  −31%
  "1000+": 3650, //   was 5800  −37%
};

/** An independent review engagement is 55% of the audit fee, where eligible. */
export const REVIEW_ENGAGEMENT_FACTOR = 0.55;

export const VAT_RULES = {
  /** Art. 12 (EU acquisitions only) is 60% of the art. 10 band price. */
  art12Factor: 0.6,
  /** Art. 11 (small exempt) is one flat yearly declaration. */
  art11FlatYearly: 145,
};

/** Accountant review over self-service books — a fraction of the band price, floored. */
export const ACCOUNTING_REVIEW = {
  quarter: { minEur: 18, shareOfBook: 0.18 },
  month: { minEur: 24, shareOfBook: 0.35 },
};

/** Payroll — €/head/mo; the whole book bills at its headcount tier. */
export const PAYROLL_PER_HEAD: { upTo: number | null; rate: number }[] = [
  { upTo: 5, rate: 32 },
  { upTo: 10, rate: 29 },
  { upTo: null, rate: 25 },
];

/** Each bank account beyond the first, €/mo. */
export const EXTRA_BANK_MONTHLY = { bookFull: 25, selfWithReview: 10 };

/** Registered office — flat €/yr, no risk multiplier. */
export const REGISTERED_OFFICE_YEARLY = 1200;

/* -------------------------------------------------------------------------- */
/* Government / pass-through                                                   */
/* -------------------------------------------------------------------------- */

export type CapitalBand = "1500" | "5000" | "10000" | "50000" | "50000+";

/**
 * MBR annual return: our €50 fee plus the MBR registry fee (electronic), which
 * is set by share capital and passed through AT COST — never discounted.
 */
export const MBR_ANNUAL_RETURN = {
  ourFee: 50,
  registryFeeByCapital: {
    "1500": 100,
    "5000": 210,
    "10000": 294,
    "50000": 379,
    "50000+": 379,
  } as Record<CapitalBand, number>,
};

export const CAPITAL_BANDS: { id: CapitalBand; label: string; note: string }[] = [
  { id: "1500", label: "Up to €1,500", note: "MBR €100" },
  { id: "5000", label: "€1,501–5,000", note: "MBR €210 + formula" },
  { id: "10000", label: "€5,001–10,000", note: "MBR €294 + formula" },
  { id: "50000", label: "€10,001–50,000", note: "MBR €379 + formula" },
  { id: "50000+", label: "Over €50,000", note: "MBR from €379, by formula" },
];

/* -------------------------------------------------------------------------- */
/* One-offs                                                                    */
/* -------------------------------------------------------------------------- */

/** Catch-up: self-service is per month behind; full service is capped per year. */
export const CATCH_UP = { selfPerMonth: 10, fullPerMonth: 25, fullPerYearCap: 240 };

/** A4 Books software plans — €/mo, risk-independent. Mirrors src/data/a4Ladder.ts. */
export const SOFTWARE_TIERS = { book: 39, senior: 99, manager: 198, cfo: 357 };

export type SoftwareTierId = keyof typeof SOFTWARE_TIERS;

/** Client-facing names for the software plans. */
export const SOFTWARE_TIER_LABELS: Record<SoftwareTierId, string> = {
  book: "Bookkeeper",
  senior: "Senior",
  manager: "Manager",
  cfo: "CFO",
};

/**
 * Which software plan a company needs, by transaction volume. Volume is what
 * drives the plan — a busier ledger needs the heavier review tooling.
 */
export const SOFTWARE_TIER_BY_BAND: Record<TxnBand, SoftwareTierId> = {
  "0": "book",
  "1-20": "book",
  "21-60": "book",
  "61-150": "senior",
  "151-400": "manager",
  "401-1000": "cfo",
  "1000+": "cfo",
};

/** Company formation. MGA licence → priced on a director call, never instantly. */
export const INCORPORATION = {
  base: 2000,
  typeSurcharge: { ltd: 0, holding: 0, partner: 300, branch: 600 },
  extraShareholder: 250,
  corporateShareholderChecks: 750,
  extraDirector: 150,
  regulatedOnboarding: 550,
  vatTaxRegistrations: 150,
  bankAssistance: 500,
  registeredOfficeYearly: REGISTERED_OFFICE_YEARLY,
  companySecretaryYearly: 400,
};

/* -------------------------------------------------------------------------- */
/* Launch promo                                                                */
/* -------------------------------------------------------------------------- */

/**
 * 25% off the monthly and yearly totals. One-off charges and the MBR registry
 * fee are excluded — government fees stay at cost. Expires by DATA: once the
 * date passes, `isPromoActive` returns false with no code change.
 */
export const LAUNCH_PROMO = {
  pct: 0.25,
  until: "2026-08-31",
  label: "25% off until 31 Aug",
  note: "25% launch discount — a quarter off your whole quote, already deducted. Valid until 31 August 2026. Government fees stay at cost.",
};

export function isPromoActive(now: Date = new Date()): boolean {
  return now.getTime() <= Date.parse(`${LAUNCH_PROMO.until}T23:59:59.999Z`);
}

/* -------------------------------------------------------------------------- */
/* Shared copy                                                                 */
/* -------------------------------------------------------------------------- */

export const PRICING_VAT_NOTE = "All fees exclude VAT.";
export const PRICING_GOV_NOTE = "Government and registry fees are passed through at cost.";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

export const roundEur = (n: number) => Math.round(n);

export const packEuro = (n: number) => "€" + Math.round(n).toLocaleString("en-MT");

/** Lowest non-zero fee in a band table — what a "from €X" headline must say. */
export function fromPrice(table: Record<TxnBand, number>): number {
  return Math.min(...Object.values(table).filter((v) => v > 0));
}

/** Payroll rate for a given headcount. */
export function payrollRate(headcount: number): number {
  const row = PAYROLL_PER_HEAD.find((t) => t.upTo != null && headcount <= t.upTo);
  return (row ?? PAYROLL_PER_HEAD[PAYROLL_PER_HEAD.length - 1]).rate;
}

/** Entry payroll rate (small teams) — the honest "from" for payroll copy. */
export const PAYROLL_ENTRY_RATE = PAYROLL_PER_HEAD[0].rate; // €32/head, up to five
/** Best payroll rate at scale. */
export const PAYROLL_BEST_RATE = PAYROLL_PER_HEAD[PAYROLL_PER_HEAD.length - 1].rate; // €25/head

/** Full-service bookkeeping floor — the "from €59/mo" headline. */
export const BOOKKEEPING_FROM = fromPrice(BOOKKEEPING_MONTHLY);
/**
 * Statutory audit floor for a company that actually TRADES — the "from €750/yr"
 * headline. Deliberately the "1-20" band, not the table minimum: the "0" band
 * below is a dormant/pre-trading company, which is a different conversation and
 * must not set the advertised price for a real business.
 */
export const AUDIT_FROM = AUDIT_YEARLY["1-20"];
/** Dormant / pre-trading audit — the absolute floor the estimator may quote. */
export const AUDIT_PRE_TRADING = AUDIT_YEARLY["0"];
/** Review engagement floor, where a review rather than an audit is eligible. */
export const REVIEW_FROM = roundEur(AUDIT_FROM * REVIEW_ENGAGEMENT_FACTOR);
/** VAT returns floor (art. 10 monthly band). */
export const VAT_FROM = fromPrice(VAT_MONTHLY);
/** Annual tax return floor. */
export const TAX_RETURN_FROM = TAX_RETURN_YEARLY["1-20"];
/** Company formation floor — one shareholder, one director, filed with the MBR. */
export const INCORPORATION_FROM = INCORPORATION.base;

/** Incorporation add-ons, in the order the fee table should present them. */
export const INCORPORATION_ADDONS: { label: string; detail: string; amount: number; cadence: "one-off" | "yearly" }[] = [
  {
    label: "Partnership instead of a limited company",
    detail: "Added to the base fee",
    amount: INCORPORATION.typeSurcharge.partner,
    cadence: "one-off",
  },
  {
    label: "Branch of a foreign company",
    detail: "Added to the base fee",
    amount: INCORPORATION.typeSurcharge.branch,
    cadence: "one-off",
  },
  {
    label: "Each additional shareholder",
    detail: "Beyond the first individual shareholder",
    amount: INCORPORATION.extraShareholder,
    cadence: "one-off",
  },
  {
    label: "Corporate shareholder checks",
    detail: "KYC on each company in the structure",
    amount: INCORPORATION.corporateShareholderChecks,
    cadence: "one-off",
  },
  {
    label: "Each additional director",
    detail: "Beyond the first director",
    amount: INCORPORATION.extraDirector,
    cadence: "one-off",
  },
  {
    label: "Regulated-sector onboarding",
    detail: "Source-of-funds checks, director sign-off",
    amount: INCORPORATION.regulatedOnboarding,
    cadence: "one-off",
  },
  {
    label: "VAT and tax registrations",
    detail: "Filed together with the incorporation",
    amount: INCORPORATION.vatTaxRegistrations,
    cadence: "one-off",
  },
  {
    label: "Bank account assistance",
    detail: "Introductions and application support",
    amount: INCORPORATION.bankAssistance,
    cadence: "one-off",
  },
  {
    label: "Registered office",
    detail: "Statutory address, post passed to you",
    amount: INCORPORATION.registeredOfficeYearly,
    cadence: "yearly",
  },
  {
    label: "Company secretary",
    detail: "Registers, minutes and MBR filings",
    amount: INCORPORATION.companySecretaryYearly,
    cadence: "yearly",
  },
];

/** An MGA gaming licence is never priced instantly. */
export const INCORPORATION_MGA_NOTE =
  "An MGA gaming licence changes the whole engagement — a director prices it on a short call.";
