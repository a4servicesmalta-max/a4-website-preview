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
 * mt-2026-08-14-volume SUPERSEDES that: bookkeeping is priced by MONTHLY
 * EXPENSES across nine bands (owner direction 2026-08-14), replacing the flat
 * two-price table above. BOOKKEEPING ONLY — VAT, tax, audit, payroll, MBR and
 * the registered office keep their current prices and stay driven by the
 * TRANSACTION band. See BOOKKEEPING_MANAGED_MONTHLY below.
 *
 * ⚠ Three copies of this pack must carry the SAME version string, or the
 * backend hard-rejects the record before it even reprices (which is the
 * intent while the three lanes land at different times):
 *   - vacei-marketing-site/index.html
 *   - portal-backend/src/modules/quote-pack/malta-pack.ts
 */
/*
 * mt-2026-08-17-corrections — the external pricing review's corrections
 * (17 Aug): marginal un-multiplied payroll (A2+A3), VAT nil-return floor €19
 * (A4), company 400-500k 449→459 (C1), catch-up joins the launch promo at its
 * own line (C3), incorporation promo on recurring lines (B1).
 */
export const A4_QUOTE_PACK_VERSION = "mt-2026-08-17-corrections";

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
 * How much the business spends in a month. THE bookkeeping price driver.
 *
 * Deliberately NOT the transaction band. A client knows their monthly spend
 * without counting anything, and it tracks document volume — which is what
 * actually consumes reviewer minutes. The transaction band still drives VAT,
 * tax returns and audit, so both questions are asked; they are not duplicates
 * of each other and must never be presented as one.
 */
export type ExpenseBand =
  | "0-10k"
  | "10-25k"
  | "25-50k"
  | "50-100k"
  | "100-200k"
  | "200-300k"
  | "300-400k"
  | "400-500k"
  | "500k+";

/**
 * THE band ceilings, in euro of monthly spend. `null` is the open top band.
 *
 * Ceilings are INCLUSIVE (QUOTE-WIRE-CONTRACT-V2 amendment, 2026-08-15): a
 * client at exactly €10,000/month is in `0-10k`, exactly €25,000 is `10-25k`,
 * exactly €500,000 is `400-500k`. That resolves every boundary in the CLIENT's
 * favour, which is the defensible direction in a dispute, and it matches the
 * plain reading of "Up to €10,000".
 *
 * The labels below are the client-facing statement of this same rule, so the
 * two are pinned against each other in the pack tests.
 */
export const EXPENSE_BAND_CEILINGS: { id: ExpenseBand; ceiling: number | null }[] = [
  { id: "0-10k", ceiling: 10_000 },
  { id: "10-25k", ceiling: 25_000 },
  { id: "25-50k", ceiling: 50_000 },
  { id: "50-100k", ceiling: 100_000 },
  { id: "100-200k", ceiling: 200_000 },
  { id: "200-300k", ceiling: 300_000 },
  { id: "300-400k", ceiling: 400_000 },
  { id: "400-500k", ceiling: 500_000 },
  { id: "500k+", ceiling: null },
];

/**
 * Which band a given monthly spend falls in, applying the inclusive-ceiling
 * rule above. Returns `null` for a negative or non-finite amount — there is no
 * honest band for a nonsense number, and the same "never guess" contract as
 * `managedMonthly` applies.
 */
export function bandForMonthlyExpenses(amount: number): ExpenseBand | null {
  if (!Number.isFinite(amount) || amount < 0) return null;
  for (const { id, ceiling } of EXPENSE_BAND_CEILINGS) {
    if (ceiling == null || amount <= ceiling) return id;
  }
  return "500k+";
}

/**
 * Band labels, DISJOINT in words.
 *
 * These used to read "Up to €10,000" / "€10,000 – 25,000" / "€25,000 – 50,000",
 * which claimed each boundary amount twice: a client spending exactly €25,000
 * matched two labels, saw €69 on one button and €99 on the next, and had no
 * rule anywhere on either site to choose between them. The "Over X, up to Y"
 * form states the inclusive-ceiling rule in the label itself, so the picker
 * answers the question without a footnote.
 */
export const EXPENSE_BANDS: { id: ExpenseBand; label: string; hint: string }[] = [
  { id: "0-10k", label: "Up to €10,000", hint: "just starting" },
  { id: "10-25k", label: "Over €10,000, up to €25,000", hint: "small and steady" },
  { id: "25-50k", label: "Over €25,000, up to €50,000", hint: "growing" },
  { id: "50-100k", label: "Over €50,000, up to €100,000", hint: "established" },
  { id: "100-200k", label: "Over €100,000, up to €200,000", hint: "busy" },
  { id: "200-300k", label: "Over €200,000, up to €300,000", hint: "high volume" },
  { id: "300-400k", label: "Over €300,000, up to €400,000", hint: "very high" },
  { id: "400-500k", label: "Over €400,000, up to €500,000", hint: "large" },
  { id: "500k+", label: "Over €500,000", hint: "enterprise" },
];

/**
 * Managed bookkeeping — €/mo by ENTITY × MONTHLY EXPENSES. NOT uplifted by the
 * sector risk multiplier, and NOT a software licence: A4 keeps the books.
 *
 * These eighteen numbers ARE the pack as far as bookkeeping is concerned. The
 * backend reprices from its own copy and refuses to issue a quotation if we
 * disagree by more than €1 / 1%, so they are not decorative — all three copies
 * (this file, vacei-marketing-site/index.html and the portal's malta-pack)
 * must carry identical figures under pack mt-2026-08-14-volume.
 *
 * The steps TAPER on purpose — each is a smaller multiple than the one below
 * it (company: 1.41× 1.43× 1.51× 1.47× 1.36× 1.27× 1.18× 1.22×). Fixed
 * onboarding and month-end overhead amortises as a client grows, so a flat
 * multiple would over-charge the top and read as a penalty for scaling.
 *
 * `500k+` is a REAL priced band with a real number, not a "talk to us". Every
 * band prices instantly; there is no unpriceable arm left in bookkeeping.
 *
 * The entry price is unchanged at €24 / €49, so the launch promise still holds
 * and no existing quote is invalidated.
 */
export const BOOKKEEPING_MANAGED_MONTHLY: Record<ManagedEntity, Record<ExpenseBand, number>> = {
  sole: {
    "0-10k": 24,
    "10-25k": 39,
    "25-50k": 59,
    "50-100k": 89,
    "100-200k": 129,
    "200-300k": 179,
    "300-400k": 229,
    "400-500k": 279,
    "500k+": 339,
  },
  company: {
    "0-10k": 49,
    "10-25k": 69,
    "25-50k": 99,
    "50-100k": 149,
    "100-200k": 219,
    "200-300k": 299,
    "300-400k": 379,
    // mt-2026-08-17-corrections (finding C1): 449 → 459 so the euro
    // increments never shrink on the way up (20/30/50/70/80/80/80/90).
    "400-500k": 459,
    "500k+": 549,
  },
};

export const MANAGED_ENTITY_LABELS: Record<ManagedEntity, string> = {
  sole: "Self-employed",
  company: "Company",
};

export const MANAGED_ENTITY_OPTIONS: { id: ManagedEntity; label: string; sub: string }[] = [
  { id: "sole", label: "Self-employed", sub: "sole trader or freelancer" },
  { id: "company", label: "Company", sub: "a Malta limited company" },
];

/**
 * The monthly rate for an entity at an expenses band — the single reader for
 * both the price and the catch-up.
 *
 * Returns `null` for a MISSING or UNRECOGNISED band, and callers must degrade
 * to the lead path on null. It must NEVER fall back to the cheapest band:
 * defaulting down is the direction that loses money and is invisible;
 * defaulting up is the direction that loses the customer. A stale cached page
 * sending a retired band id has to fail loudly, exactly like a retired service.
 */
export function managedMonthly(entity: ManagedEntity, expenses: ExpenseBand): number | null {
  const row = BOOKKEEPING_MANAGED_MONTHLY[entity];
  if (!row) return null;
  // Own-property + typeof guard: an arbitrary runtime string (including
  // "constructor" and friends) must miss, not inherit something off the
  // prototype chain.
  const rate = Object.prototype.hasOwnProperty.call(row, expenses) ? row[expenses] : undefined;
  return typeof rate === "number" ? rate : null;
}

/**
 * Catch-up / backdated months. Charged at the SAME monthly rate as a live
 * month for that client, per month, uncapped and never discounted (it is a
 * one-off).
 *
 *   12 months of a company's books at €25–50k/mo = 12 × €99 = €1,188.
 *
 * A backdated month costing exactly what a live month costs is deliberate: it
 * keeps the quote-stage price identical to the held-period billing price, so
 * declaring a backlog honestly costs the same as under-declaring it.
 *
 * Returns `null` when the band is unknown — see managedMonthly.
 */
export function catchUpAmount(
  months: number,
  entity: ManagedEntity,
  expenses: ExpenseBand,
  /** Pass `isPromoActive(now)` — catch-up joins the launch promo (finding C3). */
  promoNow = false
): number | null {
  const rate = managedMonthly(entity, expenses);
  if (rate == null) return null;
  const m = Math.max(0, Math.floor(Number(months) || 0));
  const full = m * rate;
  return promoNow ? roundEur(full * (1 - LAUNCH_PROMO.pct)) : full;
}

/**
 * The catch-up line label, in the EXACT form all three repos must emit — the
 * backend matches on it and the client reads it on the quotation.
 *
 *   "Catch-up: 12 months x EUR 99 = EUR 1188"
 *
 * Plain ASCII "x" and "EUR" on purpose: this string travels over the wire and
 * is compared literally, so it must not depend on a locale or a × glyph.
 *
 * Returns `null` when the band is unknown — there is no honest label for a
 * price we cannot compute.
 */
export function catchUpLabel(
  months: number,
  entity: ManagedEntity,
  expenses: ExpenseBand,
  /** Pass `isPromoActive(now)` — inside the promo the discount is written INTO
   *  the label so the line still reproduces from its own text (finding C3). */
  promoNow = false
): string | null {
  const rate = managedMonthly(entity, expenses);
  if (rate == null) return null;
  const m = Math.max(0, Math.floor(Number(months) || 0));
  const full = m * rate;
  if (!promoNow) return `Catch-up: ${m} months x EUR ${rate} = EUR ${full}`;
  const net = roundEur(full * (1 - LAUNCH_PROMO.pct));
  return `Catch-up: ${m} months x EUR ${rate} = EUR ${full}, less ${Math.round(LAUNCH_PROMO.pct * 100)}% launch promo = EUR ${net}`;
}

/** Onboarding / opening balances is quoted by a person, never by the calculator. */
export const ONBOARDING_UNPRICED_NOTE =
  "Onboarding and opening balances are scoped with you before we start — they are not priced here.";

/** VAT returns at art. 10 — €/mo by transaction band, × art factor × risk. */
export const VAT_MONTHLY: Record<TxnBand, number> = {
  // mt-2026-08-17-corrections (finding A4): '0' 0 → 19 — a registered,
  // not-yet-trading company still has nil returns prepared and filed.
  "0": 19,
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

/**
 * Payroll — €/head/mo, MARGINAL tiers since mt-2026-08-17-corrections
 * (finding A2): the first five heads bill at €32, the next five at €29,
 * everyone after at €25, so the total never FALLS as headcount grows (the
 * retired flat tiers priced 11 people at €275 vs €290 for 10). And it is no
 * longer risk-multiplied (finding A3) — AML sector risk is priced on VAT, the
 * tax return and the audit, where the extra checking actually happens.
 */
export const PAYROLL_PER_HEAD: { upTo: number | null; rate: number }[] = [
  { upTo: 5, rate: 32 },
  { upTo: 10, rate: 29 },
  { upTo: null, rate: 25 },
];

/** The MARGINAL payroll fee for a whole book — €/mo. */
export function payrollFee(headcount: number): number {
  let fee = 0;
  let prev = 0;
  for (const t of PAYROLL_PER_HEAD) {
    const cap = t.upTo ?? Number.POSITIVE_INFINITY;
    const n = Math.max(0, Math.min(headcount, cap) - prev);
    fee += n * t.rate;
    prev = cap;
  }
  return fee;
}

/** The payroll arithmetic as prose — "5 × €32 + 3 × €29" — so the amount
 *  beside it is always reproducible by the person reading it. */
export function payrollFeeLabel(headcount: number): string {
  const parts: string[] = [];
  let prev = 0;
  for (const t of PAYROLL_PER_HEAD) {
    const cap = t.upTo ?? Number.POSITIVE_INFINITY;
    const n = Math.max(0, Math.min(headcount, cap) - prev);
    if (n > 0) parts.push(`${n} × €${t.rate}`);
    prev = cap;
  }
  return parts.join(" + ");
}

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
  note: "25% launch discount — a quarter off your monthly and yearly totals and any catch-up months, already deducted. Valid until 31 August 2026. Other one-off charges and government fees stay at cost.",
};

export function isPromoActive(now: Date = new Date()): boolean {
  // Inclusive of the 'until' date, whole day, MALTA TIME (+02:00 in August) —
  // the same clock as vacei.com and the portal backend, or the three engines
  // disagree for two hours on expiry night.
  return now.getTime() <= Date.parse(`${LAUNCH_PROMO.until}T23:59:59.999+02:00`);
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
/* `payrollRate` (the flat whole-book tier rate) is DELETED, not deprecated:
   flat arithmetic on marginal tiers is exactly the silent mispricing the
   corrections removed, so any caller still doing `heads * rate` must fail to
   compile and be moved to `payrollFee`. */

/** Entry payroll rate (small teams) — the honest "from" for payroll copy. */
export const PAYROLL_ENTRY_RATE = PAYROLL_PER_HEAD[0].rate; // €32/head, up to five
/** Best payroll rate at scale. */
export const PAYROLL_BEST_RATE = PAYROLL_PER_HEAD[PAYROLL_PER_HEAD.length - 1].rate; // €25/head

/**
 * Managed bookkeeping ENTRY-BAND floors — the honest "from €X/mo" headline.
 *
 * Under mt-2026-08-14-volume these are genuine "from" prices: the entry
 * expenses band (up to €10,000/mo), the cheapest rung of nine. Copy reading
 * them MUST say "from", never "flat" and never "the price does not move with
 * your volume" — it does now, it moves with monthly expenses.
 */
export const BOOKKEEPING_FROM = BOOKKEEPING_MANAGED_MONTHLY.sole["0-10k"];
/** Managed bookkeeping for a limited company, entry band. Also a "from". */
export const BOOKKEEPING_COMPANY = BOOKKEEPING_MANAGED_MONTHLY.company["0-10k"];
/** Top of the published bookkeeping range — the ceiling both entities top out at. */
export const BOOKKEEPING_SOLE_TOP = BOOKKEEPING_MANAGED_MONTHLY.sole["500k+"];
export const BOOKKEEPING_COMPANY_TOP = BOOKKEEPING_MANAGED_MONTHLY.company["500k+"];
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
