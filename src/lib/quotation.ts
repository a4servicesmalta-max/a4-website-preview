/**
 * Deterministic indicative-quote engine for the website quotation builder.
 *
 * Every baseline comes from the current quote pack (A4_QUOTE_PACK_VERSION in src/data/a4QuotePack.ts)
 * so /quote can never contradict /pricing or the Vacei calculator. The builder
 * asks for a revenue band rather than a transaction count, so where the pack
 * bands by volume this engine takes the middle '21-60' band as its default and
 * advertises the real floor as "from €X".
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
  MBR_ANNUAL_RETURN,
  PAYROLL_ENTRY_RATE,
  VAT_FROM,
  VAT_MONTHLY,
  catchUpLabel,
  managedMonthly,
  type ExpenseBand,
  type ManagedEntity,
} from "@/data/a4QuotePack";

export const QUOTE_PACK_VERSION = A4_QUOTE_PACK_VERSION;

export type RevenueBandId = "under100k" | "100k-500k" | "500k-1m" | "1m-5m" | "over5m";
export type QuoteServiceId = "accounts" | "audit" | "vat" | "mbr" | "payroll";

export const REVENUE_BANDS: { id: RevenueBandId; label: string; mult: number }[] = [
  { id: "under100k", label: "Under €100k", mult: 0.85 },
  { id: "100k-500k", label: "€100k – €500k", mult: 1.0 },
  { id: "500k-1m", label: "€500k – €1M", mult: 1.15 },
  { id: "1m-5m", label: "€1M – €5M", mult: 1.4 },
  { id: "over5m", label: "Over €5M", mult: 1.8 },
];

export const QUOTE_INDUSTRIES = [
  "Tourism & Hospitality",
  "Import & Distribution",
  "Construction & Property",
  "Retail & FMCG",
  "iGaming & Technology",
  "Professional Services",
  "Financial Services",
  "Manufacturing",
  "Other",
] as const;

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
    hint: `We keep the books: documents coded, bank reconciled, monthly figures — from €${BOOKKEEPING_COMPANY}/mo for a company, from €${BOOKKEEPING_FROM}/mo self-employed, set by your monthly expenses`,
    type: "monthly",
    base: BOOKKEEPING_COMPANY,
  },
  // Floored at the pack's audit floor so the cheapest band can never quote
  // below the advertised "from €750/year".
  audit: {
    name: "Statutory audit",
    hint: `GAPSME/IFRS, signed by a licensed audit firm — from €${AUDIT_FROM}/yr`,
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
  industry: string;
  revenueBand: RevenueBandId;
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

const round5 = (n: number) => Math.round(n / 5) * 5;
export const euro = (n: number) => "€" + n.toLocaleString("en-MT");

export function buildQuote(input: QuoteInput): QuoteResult {
  const band = REVENUE_BANDS.find((b) => b.id === input.revenueBand) ?? REVENUE_BANDS[1];
  const entity: ManagedEntity = input.entity === "sole" ? "sole" : "company";
  // 20 years of backlog is already implausible; the ceiling is a guard against
  // a fat-fingered or hostile number, not a commercial cap. There is no cap.
  const catchUpMonths = Math.max(
    0,
    Math.min(240, Math.floor(input.catchUpMonths ?? (input.overdueYears ?? 0) * 12))
  );
  const lines: QuoteLine[] = [];
  let monthly = 0;
  let annual = 0;
  let hasOnRequest = false;
  // null when the expenses band is missing or unrecognised. Resolved once and
  // shared by the bookkeeping line and the catch-up line below, so the two can
  // never disagree about the client's own monthly rate.
  const bookRate = input.expenses == null ? null : managedMonthly(entity, input.expenses);

  for (const id of input.services) {
    const b = BASELINES[id];
    if (!b) continue;
    // The MBR annual return is a COMPANY filing. A Malta sole trader is not on
    // the Business Registry, files no annual return, and has no authorised
    // share capital for the registry fee to key on — so quoting it bills for a
    // filing we could not make on their behalf even if they paid. Dropped
    // rather than priced at zero: a €0 line reads as "included, free".
    // Mirrors `mbrApplies` on vacei.com and the homepage wizard's
    // `labour && entity === "company"`. /api/quotation refuses it as well.
    if (id === "mbr" && entity !== "company") continue;
    if (b.type === "on-request") {
      hasOnRequest = true;
      lines.push({ id, name: b.name, hint: b.hint, display: "On request", annualEur: null });
      continue;
    }
    // Managed bookkeeping is set by entity × monthly expenses — never by the
    // revenue band this builder otherwise scales on. With no usable expenses
    // band there is no price, so it is quoted "On request" rather than guessed.
    if (id === "accounts") {
      const bookFee = bookRate;
      if (bookFee == null) {
        hasOnRequest = true;
        lines.push({ id, name: b.name, hint: b.hint, display: "On request", annualEur: null });
        continue;
      }
      monthly += bookFee;
      lines.push({ id, name: b.name, hint: b.hint, display: `${euro(bookFee)} / month`, annualEur: bookFee * 12 });
      continue;
    }
    // VAT stays at its band price rather than double-scaling on revenue.
    // Government fees are charged at cost. Everything else scales by band, with
    // the audit floored at the advertised "from" price.
    const fee = b.passThrough || id === "vat"
      ? b.base
      : id === "audit"
        ? Math.max(AUDIT_FROM, round5(b.base * band.mult))
        : round5(b.base * band.mult);
    if (b.type === "monthly") {
      monthly += fee;
      lines.push({ id, name: b.name, hint: b.hint, display: `${euro(fee)} / month`, annualEur: fee * 12 });
    } else {
      annual += fee;
      lines.push({ id, name: b.name, hint: b.hint, display: `${euro(fee)} / year`, annualEur: fee });
    }
  }

  // Needs a known band: a backdated month is charged at the client's own
  // monthly rate, so without that rate there is nothing to charge.
  if (catchUpMonths > 0 && input.services.includes("accounts") && input.expenses != null && bookRate != null) {
    // Same monthly rate, per month, uncapped. The label is the exact form the
    // wire contract fixes, so the figure reads identically everywhere.
    const fee = catchUpMonths * bookRate;
    annual += fee;
    lines.push({
      id: "catchup",
      // No transaction/account questions on this builder — the label quotes
      // the low-volume single-account floor; the full quote prices both.
      name: catchUpLabel(catchUpMonths, entity, input.expenses, "1-20", 1) ?? "Catch-up",
      hint: "One-off: earlier months brought up to date before the monthly cycle starts. Charged at the same monthly rate — no catch-up premium, no cap.",
      display: `${euro(fee)} one-off`,
      annualEur: fee,
    });
  }

  return {
    lines,
    monthlyTotalEur: monthly,
    annualTotalEur: annual,
    indicativeAnnualEur: monthly * 12 + annual,
    hasOnRequestLines: hasOnRequest,
    assumptions: [
      `Revenue band: ${band.label} · Industry: ${input.industry || "—"}`,
      input.startMonth
        ? `Bookkeeping starts ${input.startMonth}${catchUpMonths > 0 ? `; ${catchUpMonths} earlier month${catchUpMonths === 1 ? "" : "s"} quoted separately above` : ""}.`
        : "Start month to be confirmed — it decides which months are catch-up.",
      "Single Malta company; standard transaction volumes for the size band.",
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
