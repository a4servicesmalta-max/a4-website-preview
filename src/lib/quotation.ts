/**
 * Deterministic indicative-quote engine for the website quotation builder.
 *
 * Figures are INDICATIVE baselines (from A4's fee shapes) scaled by revenue
 * band; every output is labelled as subject to written confirmation within
 * 24 hours, matching the firm's published quoting process. No AI involved —
 * pure arithmetic so a quote is always reproducible.
 */

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

/** Baseline annual/monthly fees at multiplier 1.0 (€). */
const BASELINES: Record<
  QuoteServiceId,
  { name: string; hint: string; type: "monthly" | "annual" | "on-request"; base: number }
> = {
  accounts: { name: "Monthly bookkeeping", hint: "Categorisation, reconciliation & monthly reports", type: "monthly", base: 140 },
  audit: { name: "Statutory audit", hint: "GAPSME/IFRS, signed by a licensed audit firm", type: "annual", base: 1200 },
  vat: { name: "VAT returns", hint: "All quarterly returns filed with the CFR", type: "annual", base: 360 },
  mbr: { name: "MBR annual return", hint: "Filed within 42 days of the anniversary", type: "annual", base: 180 },
  payroll: { name: "Payroll processing", hint: "Depends on headcount — quoted on request", type: "on-request", base: 0 },
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
  /** "€1,200 / year", "€140 / month", "On request" */
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
    const fee = round5(b.base * band.mult);
    if (b.type === "monthly") {
      monthly += fee;
      lines.push({ id, name: b.name, hint: b.hint, display: `${euro(fee)} / month`, annualEur: fee * 12 });
    } else {
      annual += fee;
      lines.push({ id, name: b.name, hint: b.hint, display: `${euro(fee)} / year`, annualEur: fee });
    }
  }

  if (overdue > 0 && input.services.includes("accounts")) {
    const perYear = round5(BASELINES.accounts.base * band.mult * 12 * 0.8);
    const fee = perYear * overdue;
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
      "Figures are indicative and exclude VAT; confirmed in writing within 24 hours.",
      "Regulated-sector obligations (e.g. MGA reporting) may adjust scope.",
    ],
  };
}

export const QUOTE_SERVICE_CATALOG = Object.entries(BASELINES).map(([id, b]) => ({
  id: id as QuoteServiceId,
  name: b.name,
  hint: b.hint,
  type: b.type,
}));
