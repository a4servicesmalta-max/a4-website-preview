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
  AUDIT_PRE_TRADING,
  RISK_TIERS,
  SECTORS,
  TXN_BANDS,
  sectorTier,
  roundEur,
  type TxnBand,
} from "@/data/a4QuotePack";

export { SECTORS } from "@/data/a4QuotePack";

export const QUOTE_PACK_VERSION = A4_QUOTE_PACK_VERSION;

/**
 * Retained only so old saved quotes and links still typecheck. The builder no
 * longer asks for revenue: every calculator on the site asks for monthly
 * transaction volume, because that is the axis the pack prices on. Asking two
 * different questions was why /quote and /audit-services disagreed.
 */
export type RevenueBandId = "under100k" | "100k-500k" | "500k-1m" | "1m-5m" | "over5m";
export type QuoteServiceId = "accounts" | "audit" | "vat" | "mbr" | "payroll";

/** @deprecated The revenue-band multipliers are gone — the pack prices on volume. */
export const REVENUE_BANDS: { id: RevenueBandId; label: string }[] = [
  { id: "under100k", label: "Under €100k" },
  { id: "100k-500k", label: "€100k – €500k" },
  { id: "500k-1m", label: "€500k – €1M" },
  { id: "1m-5m", label: "€1M – €5M" },
  { id: "over5m", label: "Over €5M" },
];

/** The question every calculator asks, in the pack's own bands. */
export const QUOTE_TXN_BANDS = TXN_BANDS;

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
    /** Price for a transaction band, before the sector risk multiplier. */
    rate: (band: TxnBand) => number;
    /** Government fee charged at cost — no risk loading, no discount. */
    passThrough?: boolean;
  }
> = {
  accounts: {
    name: "Monthly bookkeeping",
    hint: `Categorisation, reconciliation & monthly reports — from €${BOOKKEEPING_FROM}/mo, set by transaction volume`,
    type: "monthly",
    rate: (b) => BOOKKEEPING_MONTHLY[b],
  },
  audit: {
    name: "Statutory audit",
    hint: `GAPSME/IFRS, signed by a licensed audit firm — from €${AUDIT_FROM}/yr`,
    type: "annual",
    rate: (b) => AUDIT_YEARLY[b],
  },
  vat: {
    name: "VAT returns",
    hint: `Every return prepared and filed with the CFR — from €${VAT_FROM}/mo, set by transaction volume`,
    type: "monthly",
    rate: (b) => VAT_MONTHLY[b],
  },
  // Our €50 fee. The MBR registry fee (€100–€379 by share capital) is added at
  // cost once the company's capital is known — see the assumptions.
  mbr: {
    name: "MBR annual return",
    hint: `Our €${MBR_ANNUAL_RETURN.ourFee} fee, filed within 42 days of the anniversary — MBR registry fee passed through at cost`,
    type: "annual",
    rate: () => MBR_ANNUAL_RETURN.ourFee,
    passThrough: true,
  },
  payroll: {
    name: "Payroll processing",
    hint: `€${PAYROLL_ENTRY_RATE}/head up to five, €${PAYROLL_BEST_RATE}/head at scale — quoted on headcount`,
    type: "on-request",
    rate: () => 0,
  },
};

export type QuoteInput = {
  company: string;
  regNo?: string;
  /** Canonical sector id from the pack's SECTORS — drives the risk multiplier. */
  sector: string;
  /** Monthly transaction band — the same axis every other calculator uses. */
  txnBand: TxnBand;
  services: QuoteServiceId[];
  /** Whole financial years of overdue accounts to catch up (0 = up to date). */
  overdueYears?: number;
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
  /** True when the sector must be priced by a director rather than instantly. */
  refer?: boolean;
  assumptions: string[];
};

export const euro = (n: number) => "€" + n.toLocaleString("en-MT");

export function buildQuote(input: QuoteInput): QuoteResult {
  const tierId = sectorTier(input.sector);
  const tier = RISK_TIERS[tierId];
  const band = input.txnBand;
  const overdue = Math.max(0, Math.min(5, Math.floor(input.overdueYears ?? 0)));
  const lines: QuoteLine[] = [];
  let monthly = 0;
  let annual = 0;
  let hasOnRequest = false;

  // A `refer` sector is never auto-priced — a director puts the number on it.
  if (tier.multiplier == null) {
    return {
      lines: input.services.map((id) => ({
        id, name: BASELINES[id].name, hint: BASELINES[id].hint,
        display: "On request", annualEur: null,
      })),
      monthlyTotalEur: 0,
      annualTotalEur: 0,
      indicativeAnnualEur: 0,
      hasOnRequestLines: true,
      refer: true,
      assumptions: [
        `Sector: ${SECTORS.find((x) => x.id === input.sector)?.label ?? "—"}`,
        "We price most sectors on the spot, but this one needs a short call with a director first — usually the same day.",
      ],
    };
  }
  const rm = tier.multiplier;

  for (const id of input.services) {
    const b = BASELINES[id];
    if (!b) continue;
    if (b.type === "on-request") {
      hasOnRequest = true;
      lines.push({ id, name: b.name, hint: b.hint, display: "On request", annualEur: null });
      continue;
    }
    // One rule for every line: the pack's rate for THIS transaction band, times
    // the sector risk multiplier. Government fees are charged at cost, so they
    // take no loading. The audit rounds to €50 exactly as calcAuditFee does, so
    // /quote and /audit-services cannot disagree.
    const raw = b.rate(band) * (b.passThrough ? 1 : rm);
    const fee = b.passThrough
      ? raw
      : id === "audit"
        ? Math.max(AUDIT_PRE_TRADING, Math.round(raw / 50) * 50)
        : roundEur(raw);
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
      `Sector: ${SECTORS.find((x) => x.id === input.sector)?.label ?? "—"} (${tier.label} risk) · Volume: ${TXN_BANDS.find((x) => x.id === band)?.label ?? band} transactions/month`,
      "Single Malta company.",
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
