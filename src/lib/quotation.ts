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
  BOOKKEEPING_MANAGED_MONTHLY,
  MBR_ANNUAL_RETURN,
  PAYROLL_BEST_RATE,
  PAYROLL_ENTRY_RATE,
  VAT_FROM,
  VAT_MONTHLY,
  catchUpAmount,
  catchUpLabel,
  managedMonthly,
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
  // Managed bookkeeping is FLAT — €24 self-employed, €49 company — so it does
  // not scale with the revenue band and there is no "from" to hedge. This
  // builder is a company-facing form (it asks for a company name and an MBR
  // number), so the company rate is the baseline; `entity` overrides it.
  accounts: {
    name: "Managed bookkeeping",
    hint: `We keep the books: documents coded, bank reconciled, monthly figures — €${BOOKKEEPING_MANAGED_MONTHLY.company}/mo for a company, €${BOOKKEEPING_MANAGED_MONTHLY.sole}/mo self-employed`,
    type: "monthly",
    base: BOOKKEEPING_MANAGED_MONTHLY.company,
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
  /**
   * Whose books these are. Sets the flat managed bookkeeping rate and, with
   * it, the per-month catch-up rate. Defaults to `company` — this builder asks
   * for a company name and an MBR number.
   */
  entity?: ManagedEntity;
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
    const fee = id === "accounts"
      // Managed bookkeeping is flat and set only by the entity — never by
      // revenue and never by volume.
      ? managedMonthly(entity)
      : b.passThrough || id === "vat"
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

  if (catchUpMonths > 0 && input.services.includes("accounts")) {
    // Same monthly rate, per month, uncapped. The label is the exact form the
    // wire contract fixes, so the figure reads identically everywhere.
    const fee = catchUpAmount(catchUpMonths, entity);
    annual += fee;
    lines.push({
      id: "catchup",
      name: catchUpLabel(catchUpMonths, entity),
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
