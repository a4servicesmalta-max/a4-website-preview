/**
 * THE single source of truth for every A4 fee shown on this website.
 *
 * It transcribes quote pack `mt-2026-08-01` — the pack that already drives the
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
 * mt-2026-08-14-managed is the MANAGED BOOKKEEPING pack (owner decision
 * 2026-08-13). It retires the software-only SME offer entirely:
 *
 *   RETIRED  SOFTWARE_TIERS {book 39, senior 99, manager 198, cfo 357}
 *   RETIRED  BOOKKEEPING_MONTHLY transaction bands {59,99,169,279,469,769}
 *   RETIRED  CATCH_UP {selfPerMonth 10, fullPerMonth 25, fullPerYearCap 240}
 *   RETIRED  RISK_TIERS[…].onboarding {95, 250, 550}
 *
 *   NEW      BOOKKEEPING_MANAGED_MONTHLY — flat, by entity, NOT risk-uplifted:
 *            self-employed €24/mo · company €49/mo
 *   NEW      catch-up is the SAME monthly rate per backdated month, uncapped
 *   NEW      onboarding / opening balances carries NO number at all
 *
 * Inherited pack history, still live in the tables below:
 *   mt-2026-08-02b flattened the audit volume curve and mirrored the cut onto
 *   the tax-return table (owner 2026-08-02): entry bands held, reductions
 *   deepening from −13% to −37% as volume rises. Top audit band 5,800 → 3,650.
 *   mt-2026-08-02 added the pre-trading band: AUDIT_YEARLY["0"] 0 → 600 and
 *   TAX_RETURN_YEARLY["0"] 0 → 175, so the "audit from €600/yr" headline on
 *   /audit-services is a price the calculator will actually quote.
 * Both are carried forward here unchanged.
 *
 * ⚠ Three copies of this pack must carry the SAME version string, or the
 * backend hard-rejects the record before it even reprices (which is the
 * intent while the three lanes land at different times):
 *   - vacei-marketing-site/index.html
 *   - portal-backend/src/modules/quote-pack/malta-pack.ts
 */
export const A4_QUOTE_PACK_VERSION = "mt-2026-08-14-managed";

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

/**
 * Risk multiplier by sector.
 *
 * The one-off onboarding fee that used to hang off each tier (95 / 250 / 550)
 * is RETIRED in mt-2026-08-14-managed: onboarding and opening balances now
 * carry no published number at all, on any surface. Do not reintroduce a
 * fallback here — an unpriced line is the intended output.
 *
 * The managed bookkeeping price is deliberately NOT uplifted by this
 * multiplier: €24 / €49 are flat. The multiplier still applies to VAT, tax
 * returns, audit, review and payroll.
 */
export const RISK_TIERS: Record<RiskTier, { label: string; multiplier: number | null }> = {
  standard: { label: "Standard", multiplier: 1.0 },
  elevated: { label: "Elevated", multiplier: 1.2 },
  high: { label: "High", multiplier: 1.45 },
  refer: { label: "Referral", multiplier: null },
};

/**
 * What the company does → which risk tier it carries.
 *
 * THE canonical sector list. Every calculator asks this same question with
 * these same options, so two surfaces can never put the same company in
 * different tiers. `refer` is never auto-priced — it goes to a director.
 */
export const SECTORS: { id: string; label: string; tier: RiskTier }[] = [
  { id: "shop", label: "Shop, trade or services", tier: "standard" },
  { id: "consulting", label: "Consulting or freelancing", tier: "standard" },
  { id: "property", label: "Property or rentals", tier: "standard" },
  { id: "hospitality", label: "Restaurant, bar or hotel", tier: "elevated" },
  { id: "online", label: "Online sales or cross-border", tier: "elevated" },
  { id: "holding", label: "Holding or investment company", tier: "elevated" },
  { id: "regulated", label: "Gaming, crypto or financial services", tier: "high" },
  { id: "other", label: "Something else", tier: "refer" },
];

export const sectorTier = (id: string): RiskTier =>
  (SECTORS.find((s) => s.id === id) ?? SECTORS[0]).tier;

/* -------------------------------------------------------------------------- */
/* Recurring service tables                                                    */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Managed bookkeeping — the only bookkeeping offer                            */
/* -------------------------------------------------------------------------- */

/** Who the books belong to. The one thing that moves the bookkeeping price. */
export type ManagedEntity = "sole" | "company";

/**
 * Managed bookkeeping — flat €/mo, by entity. NOT banded by transaction
 * volume, NOT uplifted by the sector risk multiplier, and NOT a software
 * licence: A4 keeps the books.
 *
 * These two numbers ARE the pack as far as bookkeeping is concerned. The
 * backend reprices from its own copy and refuses to issue a quotation if we
 * disagree by more than €1 / 1%, so they are not decorative.
 */
export const BOOKKEEPING_MANAGED_MONTHLY: Record<ManagedEntity, number> = {
  sole: 24,
  company: 49,
};

export const MANAGED_ENTITY_LABELS: Record<ManagedEntity, string> = {
  sole: "Self-employed",
  company: "Company",
};

export const MANAGED_ENTITY_OPTIONS: { id: ManagedEntity; label: string; sub: string }[] = [
  { id: "sole", label: "Self-employed", sub: "sole trader or freelancer" },
  { id: "company", label: "Company", sub: "a Malta limited company" },
];

/** The monthly rate for an entity — the single reader for both price and catch-up. */
export function managedMonthly(entity: ManagedEntity): number {
  return BOOKKEEPING_MANAGED_MONTHLY[entity] ?? BOOKKEEPING_MANAGED_MONTHLY.company;
}

/**
 * Catch-up / backdated months. Charged at the SAME monthly rate, per month,
 * uncapped and never discounted (it is a one-off).
 *
 *   12 months of a company's books = 12 × €49 = €588.
 */
export function catchUpAmount(months: number, entity: ManagedEntity): number {
  const m = Math.max(0, Math.floor(Number(months) || 0));
  return m * managedMonthly(entity);
}

/**
 * The catch-up line label, in the EXACT form all three repos must emit — the
 * backend matches on it and the client reads it on the quotation.
 *
 *   "Catch-up: 12 months x EUR 49 = EUR 588"
 *
 * Plain ASCII "x" and "EUR" on purpose: this string travels over the wire and
 * is compared literally, so it must not depend on a locale or a × glyph.
 */
export function catchUpLabel(months: number, entity: ManagedEntity): string {
  const m = Math.max(0, Math.floor(Number(months) || 0));
  const rate = managedMonthly(entity);
  return `Catch-up: ${m} months x EUR ${rate} = EUR ${m * rate}`;
}

/** Onboarding / opening balances is quoted by a person, never by the calculator. */
export const ONBOARDING_UNPRICED_NOTE =
  "Onboarding and opening balances are scoped with you before we start — they are not priced here.";

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

/*
 * ACCOUNTING_REVIEW is GONE with mt-2026-08-14-managed. It priced an
 * accountant's review OVER self-service books as a fraction of the volume
 * band — both of which the managed offer retires. There is no "you keep the
 * books, we check them" product any more: A4 keeps the books.
 *
 * EXTRA_BANK_MONTHLY is gone for the same reason. The managed price is FLAT;
 * charging per bank account on top contradicts the word "flat", and that line
 * had no wire item so it silently pushed the on-screen total away from the
 * total the backend reprices.
 */

/** Payroll — €/head/mo; the whole book bills at its headcount tier. */
export const PAYROLL_PER_HEAD: { upTo: number | null; rate: number }[] = [
  { upTo: 5, rate: 32 },
  { upTo: 10, rate: 29 },
  { upTo: null, rate: 25 },
];

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

/*
 * There is NO software-only SME tier. `SOFTWARE_TIERS`, `SOFTWARE_TIER_LABELS`
 * and `SOFTWARE_TIER_BY_BAND` are retired — the owner removed the ladder
 * (Junior/Senior/Manager/CFO at 39/99/198/357) on 2026-08-13. Anything that
 * needs a bookkeeping price reads BOOKKEEPING_MANAGED_MONTHLY above.
 *
 * `CATCH_UP` (selfPerMonth 10 / fullPerMonth 25 / fullPerYearCap 240) is
 * retired with it — see catchUpAmount / catchUpLabel above.
 */

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
  // Always carry the year. An undated "until 31 Aug" reads as evergreen and
  // will outlive the campaign pointing at it.
  label: "25% off until 31 August 2026",
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

/**
 * Managed bookkeeping floor — the "from €24/mo" headline. It is the
 * self-employed rate; a company is €49. Not a "from" in the old banded sense:
 * there are exactly two prices and both are published.
 */
export const BOOKKEEPING_FROM = BOOKKEEPING_MANAGED_MONTHLY.sole;
/** Managed bookkeeping for a limited company. */
export const BOOKKEEPING_COMPANY = BOOKKEEPING_MANAGED_MONTHLY.company;
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
