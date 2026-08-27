/**
 * Deterministic indicative-quote engine for the website quotation builder.
 *
 * Every figure comes from the quote pack (src/data/a4QuotePack.ts), priced by
 * the SAME drivers the homepage wizard, /pricing and vacei.com use: the sector
 * sets the risk tier, the transaction band prices VAT and the audit, the
 * monthly spend prices the books, and extra bank accounts add to them. Until
 * pack mt-2026-08-26c-volume this builder asked for an ANNUAL REVENUE band
 * instead and scaled the audit by a multiplier of its own (0.85x .. 1.8x on the
 * 21-60 figure) while pinning VAT to the 21-60 band whatever the volume — so
 * the same company got one audit price on /quote and another on the homepage.
 * That engine is gone: /quote now asks the wizard's questions and reads the
 * wizard's tables, and a missing answer degrades the line to "On request"
 * rather than guessing a cheaper band (the doctrine every other surface holds).
 *
 * Every output is labelled as subject to written confirmation within 24 hours,
 * matching the firm's published quoting process. No AI involved — pure
 * arithmetic so a quote is always reproducible.
 */

import {
  A4_QUOTE_PACK_VERSION,
  AUDIT_FROM,
  AUDIT_YEARLY,
  BOOKKEEPING_COMPANY,
  BOOKKEEPING_FROM,
  BANK_ACCOUNT,
  bankAccountMonthly,
  MBR_ANNUAL_RETURN,
  PAYROLL_ENTRY_RATE,
  RISK_TIERS,
  SECTORS,
  TXN_BANDS,
  VAT_FROM,
  VAT_MONTHLY,
  catchUpAmount,
  catchUpLabel,
  fullMonthlyBookkeeping,
  roundEur,
  sectorTier,
  type ExpenseBand,
  type ManagedEntity,
  type TxnBand,
} from "@/data/a4QuotePack";

export const QUOTE_PACK_VERSION = A4_QUOTE_PACK_VERSION;

/**
 * RETIRED as a price driver (mt-2026-08-26c-volume). Kept only so an in-flight
 * POST from a page loaded before the change still parses; nothing reads a
 * multiplier off it any more and the builder no longer asks the question.
 */
export type RevenueBandId = "under100k" | "100k-500k" | "500k-1m" | "1m-5m" | "over5m";
export type QuoteServiceId = "accounts" | "audit" | "vat" | "mbr" | "payroll";

export const REVENUE_BANDS: { id: RevenueBandId; label: string }[] = [
  { id: "under100k", label: "Under €100k" },
  { id: "100k-500k", label: "€100k – €500k" },
  { id: "500k-1m", label: "€500k – €1M" },
  { id: "1m-5m", label: "€1M – €5M" },
  { id: "over5m", label: "Over €5M" },
];

/** Bank accounts the builder lets a visitor declare — same ceiling as the wizard. */
export const QUOTE_MAX_BANKS = 8;

/**
 * Baseline monthly/annual fees at multiplier 1.0 (€), straight from the pack.
 *
 * `passThrough` marks a government fee: it is charged at cost, so it never
 * scales with the revenue band and is never discounted.
 */
const BASELINES: Record<
  QuoteServiceId,
  {
    name: string;
    hint: string;
    type: "monthly" | "annual" | "on-request";
    base: number;
    /** Government fee charged at cost — no band scaling, no discount. */
    passThrough?: boolean;
  }
> = {
  // Managed bookkeeping is set by entity × monthly expenses (pack
  // mt-2026-08-14-volume), so it does not scale with the revenue band this
  // builder otherwise uses. This is a company-facing form (it asks for a
  // company name and an MBR number), so the company entry rate is the
  // baseline; `entity` and `expenses` set the real figure.
  accounts: {
    name: "Managed bookkeeping",
    hint: `We keep the books: documents coded, bank reconciled, monthly figures — from €${BOOKKEEPING_COMPANY}/mo for a company, from €${BOOKKEEPING_FROM}/mo self-employed, including one bank account, set by your monthly expenses`,
    type: "monthly",
    base: BOOKKEEPING_COMPANY,
  },
  // Floored at the pack's audit floor so the cheapest band can never quote
  // below the advertised "from €750/year".
  audit: {
    name: "Statutory audit",
    hint: `GAPSME/IFRS, signed by a licensed audit firm — from €${AUDIT_FROM}/yr. Audits are carried out by our partner audit firms — we connect you with them, and the fee stays as quoted here.`,
    type: "annual",
    base: AUDIT_YEARLY["21-60"],
  },
  vat: {
    name: "VAT returns",
    hint: `Every return prepared and filed with the CFR — from €${VAT_FROM}/mo, set by transaction volume`,
    type: "monthly",
    base: VAT_MONTHLY["21-60"],
  },
  // Our €50 fee. The MBR registry fee (€100–€379 by share capital) is added at
  // cost once the company's capital is known — see the assumptions.
  mbr: {
    name: "MBR annual return",
    hint: `Our €${MBR_ANNUAL_RETURN.ourFee} fee, filed within 42 days of the anniversary — MBR registry fee passed through at cost`,
    type: "annual",
    base: MBR_ANNUAL_RETURN.ourFee,
    passThrough: true,
  },
  payroll: {
    name: "Payroll processing",
    hint: `flat €${PAYROLL_ENTRY_RATE}/head/mo, any team size — quoted on headcount`,
    type: "on-request",
    base: 0,
  },
};

export type QuoteInput = {
  company: string;
  regNo?: string;
  /** Free text for the PDF header — the builder sends the chosen sector's label. */
  industry: string;
  /** Canonical sector id from `SECTORS`; sets the risk tier on VAT and the audit. */
  sector?: string;
  /** Transactions a month; prices VAT, the audit and the bookkeeping uplift. */
  txn?: TxnBand;
  /** Bank accounts to reconcile, 1..QUOTE_MAX_BANKS; every one is priced, the first included. */
  banks?: number;
  /** Retired driver — accepted, ignored. */
  revenueBand?: RevenueBandId;
  services: QuoteServiceId[];
  /**
   * Whose books these are. With `expenses` it sets the managed bookkeeping
   * rate and, with it, the per-month catch-up rate. Defaults to `company` —
   * this builder asks for a company name and an MBR number.
   */
  entity?: ManagedEntity;
  /**
   * Monthly expenses band — the OTHER half of the bookkeeping price under pack
   * mt-2026-08-14-volume.
   *
   * Deliberately NOT defaulted. If it is missing or unrecognised the
   * bookkeeping line is quoted "On request" and the catch-up line is dropped,
   * because there is no rate to charge a backdated month at. Falling back to
   * the entry band would silently under-quote every client who skipped the
   * question, which is the one direction that loses money invisibly.
   */
  expenses?: ExpenseBand;
  /**
   * Earlier months that still need doing. THE catch-up input.
   *
   * This used to be `overdueYears` (whole financial years) because catch-up
   * was capped per year. It is now priced per month at the monthly rate, so
   * years were the wrong unit — a year is simply 12 here, and the builder
   * converts its year picker before calling in. `overdueYears` is still
   * accepted for one release so an in-flight POST does not silently price zero.
   */
  catchUpMonths?: number;
  /** @deprecated pass `catchUpMonths`. Multiplied by 12 when present. */
  overdueYears?: number;
  /** `YYYY-MM` — the first month in scope. Echoed into the assumptions. */
  startMonth?: string;
};

export type QuoteLine = {
  id: QuoteServiceId | "catchup";
  name: string;
  hint: string;
  /** "€1,200 / year", "€99 / month", "On request" */
  display: string;
  annualEur: number | null;
};

export type QuoteResult = {
  lines: QuoteLine[];
  monthlyTotalEur: number;
  annualTotalEur: number;
  /** Total including monthlies annualised — the headline figure. */
  indicativeAnnualEur: number;
  hasOnRequestLines: boolean;
  assumptions: string[];
};

export const euro = (n: number) => "€" + n.toLocaleString("en-MT");

export function buildQuote(input: QuoteInput): QuoteResult {
  const entity: ManagedEntity = input.entity === "sole" ? "sole" : "company";
  const catchUpMonths = Math.max(
    0,
    Math.min(240, Math.floor(input.catchUpMonths ?? (input.overdueYears ?? 0) * 12))
  );
  const lines: QuoteLine[] = [];
  let monthly = 0;
  let annual = 0;
  let hasOnRequest = false;

  // The wizard's drivers. Each is optional on the wire and REQUIRED to price:
  // an unknown sector, band or volume takes the line to "On request" — never
  // to the cheapest tier, which is the one direction that loses money silently.
  const sectorRow = SECTORS.find((x) => x.id === input.sector);
  const mult = sectorRow ? RISK_TIERS[sectorTier(sectorRow.id)].multiplier : null;
  const txn = TXN_BANDS.some((b) => b.id === input.txn) ? (input.txn as TxnBand) : null;
  const banks = Math.min(QUOTE_MAX_BANKS, Math.max(1, Math.floor(Number(input.banks) || 1)));
  const bookRate = input.expenses == null || txn == null ? null : fullMonthlyBookkeeping(entity, input.expenses, txn, banks);

  const onRequest = (id: QuoteServiceId, b: (typeof BASELINES)[QuoteServiceId]) => {
    hasOnRequest = true;
    lines.push({ id, name: b.name, hint: b.hint, display: "On request", annualEur: null });
  };

  for (const id of input.services) {
    const b = BASELINES[id];
    if (!b) continue;
    if (id === "mbr" && entity !== "company") continue;
    if (b.type === "on-request") { onRequest(id, b); continue; }
    if (id === "accounts") {
      if (bookRate == null) { onRequest(id, b); continue; }
      monthly += bookRate;
      lines.push({ id, name: b.name, hint: b.hint, display: `${euro(bookRate)} / month`, annualEur: bookRate * 12 });
      continue;
    }
    let fee: number;
    if (b.passThrough) fee = b.base;
    else if (id === "vat") {
      if (txn == null || mult == null) { onRequest(id, b); continue; }
      fee = roundEur(VAT_MONTHLY[txn] * mult);
    } else if (id === "audit") {
      if (txn == null || mult == null) { onRequest(id, b); continue; }
      fee = roundEur(AUDIT_YEARLY[txn] * mult);
    } else fee = b.base;
    if (b.type === "monthly") {
      monthly += fee;
      lines.push({ id, name: b.name, hint: b.hint, display: `${euro(fee)} / month`, annualEur: fee * 12 });
    } else {
      annual += fee;
      lines.push({ id, name: b.name, hint: b.hint, display: `${euro(fee)} / year`, annualEur: fee });
    }
  }

  if (catchUpMonths > 0 && input.services.includes("accounts") && input.expenses != null && txn != null && bookRate != null) {
    // A backdated month bills at the same FULL monthly rate as a live one —
    // base + volume uplift + extra bank accounts — exactly as the wizard and
    // the portal price it. No premium, no cap.
    const fee = catchUpAmount(catchUpMonths, entity, input.expenses, txn, banks) ?? catchUpMonths * bookRate;
    annual += fee;
    lines.push({
      id: "catchup",
      name: catchUpLabel(catchUpMonths, entity, input.expenses, txn, banks) ?? "Catch-up",
      hint: "One-off: earlier months brought up to date before the monthly cycle starts. Charged at the same monthly rate — no catch-up premium, no cap.",
      display: `${euro(fee)} one-off`,
      annualEur: fee,
    });
  }

  const txnLabel = txn ? TXN_BANDS.find((b) => b.id === txn)?.label : null;
  const tierLabel = sectorRow ? RISK_TIERS[sectorTier(sectorRow.id)].label.toLowerCase() : "unconfirmed";
  return {
    lines,
    monthlyTotalEur: monthly,
    annualTotalEur: annual,
    indicativeAnnualEur: monthly * 12 + annual,
    hasOnRequestLines: hasOnRequest,
    assumptions: [
      `Sector: ${sectorRow?.label ?? input.industry ?? "—"} (${tierLabel} risk tier) · Transactions: ${txnLabel ? `${txnLabel} a month` : "not given"} · Bank accounts: ${banks}${input.expenses != null && txn != null && bankAccountMonthly(entity, input.expenses, txn) != null ? ` (each €${bankAccountMonthly(entity, input.expenses, txn)}/mo — €${BANK_ACCOUNT.baseMonthly} plus ${Math.round(BANK_ACCOUNT.pctOfBookkeeping * 100)}% of the bookkeeping fee, the first included)` : ""}.`,
      input.startMonth
        ? `Bookkeeping starts ${input.startMonth}${catchUpMonths > 0 ? `; ${catchUpMonths} earlier month${catchUpMonths === 1 ? "" : "s"} quoted separately above` : ""}.`
        : "Start month to be confirmed — it decides which months are catch-up.",
      "Single Malta company. VAT priced as an Article 10 registration; the audit as a full statutory audit — where a review engagement is enough it is 55% of that figure, confirmed against your accounts.",
      "All fees exclude VAT. Figures are indicative and confirmed in writing within 24 hours.",
      "Government and registry fees (including the MBR registry fee, €100–€379 by share capital) are passed through at cost.",
      "Regulated-sector obligations (e.g. MGA reporting) may adjust scope.",
      `Priced on fee schedule ${QUOTE_PACK_VERSION}.`,
    ],
  };
}

export const QUOTE_SERVICE_CATALOG = Object.entries(BASELINES).map(([id, b]) => ({
  id: id as QuoteServiceId,
  name: b.name,
  hint: b.hint,
  type: b.type,
}));
