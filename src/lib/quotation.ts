/**
 * Deterministic indicative-quote engine for the website quotation builder.
 *
 * Every baseline comes from quote pack `mt-2026-08-01` (src/data/a4QuotePack.ts)
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
  BOOKKEEPING_FROM,
  BOOKKEEPING_MONTHLY,
  CATCH_UP,
  MBR_ANNUAL_RETURN,
  PAYROLL_BEST_RATE,
  PAYROLL_ENTRY_RATE,
  VAT_FROM,
  VAT_MONTHLY,
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
  // Full-service bookkeeping is banded by transaction volume in the pack; the
  // builder collects revenue, not transactions, so it quotes the middle band
  // and advertises the real floor in the hint.
  accounts: {
    name: "Monthly bookkeeping",
    hint: `Categorisation, reconciliation & monthly reports — from €${BOOKKEEPING_FROM}/mo, set by transaction volume`,
    type: "monthly",
    base: BOOKKEEPING_MONTHLY["21-60"],
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
    hint: `€${PAYROLL_ENTRY_RATE}/head up to five, €${PAYROLL_BEST_RATE}/head at scale — quoted on headcount`,
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
  /** Whole financial years of overdue accounts to catch up (0 = up to date). */
  overdueYears?: number;
};

export type QuoteLine = {
  id: QuoteServiceId | "catchup";
  name: string;
  hint: string;
  /** "€1,200 / year", "€79 / month", "On request" */
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
  const overdue = Math.max(0, Math.min(5, Math.floor(input.overdueYears ?? 0)));
  const lines: QuoteLine[] = [];
  let monthly = 0;
  let annual = 0;
  let hasOnRequest = false;

  for (const id of input.services) {
    const b = BASELINES[id];
    if (!b) continue;
    if (b.type === "on-request") {
      hasOnRequest = true;
      lines.push({ id, name: b.name, hint: b.hint, display: "On request", annualEur: null });
      continue;
    }
    // Bookkeeping and VAT are banded by transaction volume in the pack, not by
    // revenue, so they stay at their band price here rather than double-scaling.
    // Government fees are charged at cost. Everything else scales by band, with
    // the audit floored at the advertised "from" price.
    const fee = b.passThrough || id === "accounts" || id === "vat"
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

  if (overdue > 0 && input.services.includes("accounts")) {
    // Pack catch-up, full service: min(months × €25, years × €240). Whole years
    // in, so the yearly cap always wins.
    const fee = Math.min(overdue * 12 * CATCH_UP.fullPerMonth, overdue * CATCH_UP.fullPerYearCap);
    annual += fee;
    lines.push({
      id: "catchup",
      name: `Catch-up bookkeeping (${overdue} ${overdue === 1 ? "year" : "years"})`,
      hint: "One-off: bring overdue records current before the monthly cycle starts",
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
