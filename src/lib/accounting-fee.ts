/**
 * Bookkeeping / accounting monthly price engine — the calculator on
 * /accounting, ported from the "A4 Accounting" design (A4 New pages.zip →
 * A4 Accounting.dc.html).
 *
 * Every figure comes from `src/data/a4QuotePack.ts`. Two rules deliberately
 * follow the pack rather than the design mock, because the pack is the firm's
 * dated price list and the mock is a visual:
 *   - catch-up is €25/mo capped at €240/yr (pack), not `max(35, base×0.55)`;
 *   - VAT art. 11 is a flat yearly declaration and art. 12 is 60% of the
 *     art. 10 band price (pack), where the mock charged art. 10 for all three.
 */

import {
  TXN_BANDS, RISK_TIERS, BOOKKEEPING_MONTHLY, VAT_MONTHLY, VAT_RULES, ACCOUNTING_REVIEW,
  PAYROLL_PER_HEAD, payrollRate, EXTRA_BANK_MONTHLY, CATCH_UP, SOFTWARE_TIERS,
  SOFTWARE_TIER_BY_BAND, SOFTWARE_TIER_LABELS, LAUNCH_PROMO, isPromoActive, roundEur, sectorTier,
  type TxnBand, type RiskTier,
} from "@/data/a4QuotePack";

// The sector list is pack data — one definition for every calculator.
export { SECTORS } from "@/data/a4QuotePack";

export const TXN = TXN_BANDS.map((b) => ({ id: b.id, label: b.label, sub: b.hint }));

export type RouteId = "self" | "review" | "full";
export const ROUTES: { id: RouteId; label: string; sub: string }[] = [
  { id: "self", label: "Just the software", sub: "you approve, we stay out" },
  { id: "review", label: "Software + our review", sub: "you keep them, we check" },
  { id: "full", label: "You upload, we do it", sub: "hands off entirely" },
];

export type VatRegId = "none" | "art10" | "art11" | "art12";
export const VAT_REG: { id: VatRegId; label: string; sub: string }[] = [
  { id: "none", label: "Not registered", sub: "no VAT returns" },
  { id: "art10", label: "Yes — Article 10", sub: "charging and reclaiming" },
  { id: "art11", label: "Small exempt", sub: "under the threshold" },
  { id: "art12", label: "Article 12", sub: "EU acquisitions" },
];

export const BEHIND: { id: string; label: string; sub: string }[] = [
  { id: "0", label: "Up to date", sub: "" },
  { id: "3", label: "3 months", sub: "behind" },
  { id: "6", label: "6 months", sub: "behind" },
  { id: "12", label: "1 year", sub: "behind" },
  { id: "24", label: "2 years +", sub: "behind" },
];

export const STEPS = ["What you do", "Volume", "Who keeps them", "Payroll", "VAT", "Up to date?", "Your price"];

export type AccountingInput = {
  sector: string;
  txn: TxnBand;
  banks: number;
  route: RouteId;
  head: number;
  vatreg: VatRegId;
  behind: string;
};

export type Line = { k: string; v: number };

export type AccountingQuote =
  | { refer: true }
  | {
      refer: false;
      tier: { label: string; mult: number };
      /** Recurring monthly lines, before the launch discount. */
      monthly: Line[];
      /** One-off lines (catch-up), before the launch discount. */
      oneOff: Line[];
      monthlyFull: number;
      oneOffFull: number;
      /** After the launch discount, if it is still running. */
      monthlyNet: number;
      oneOffNet: number;
      discountPct: number;
      softwareTier: string;
    };

export const euro = (n: number) => "€" + Math.round(n).toLocaleString("en-GB");

const find = <T extends { id: string }>(list: T[], id: string) => list.find((x) => x.id === id) ?? list[0];

export function calcAccountingFee(s: AccountingInput, now: Date = new Date()): AccountingQuote {
  const tierId = sectorTier(s.sector);
  const tierDef = RISK_TIERS[tierId];
  if (tierDef.multiplier == null) return { refer: true };
  const rm = tierDef.multiplier;

  const monthly: Line[] = [];
  const oneOff: Line[] = [];

  // The software plan itself is risk-independent — same product either way.
  const tierKey = SOFTWARE_TIER_BY_BAND[s.txn];
  const softwareTier = SOFTWARE_TIER_LABELS[tierKey];
  monthly.push({ k: `${softwareTier} plan`, v: SOFTWARE_TIERS[tierKey] });

  const base = BOOKKEEPING_MONTHLY[s.txn];
  if (s.route === "review" && base > 0) {
    monthly.push({ k: "Accounting review", v: Math.max(ACCOUNTING_REVIEW.month.minEur, base * ACCOUNTING_REVIEW.month.shareOfBook) * rm });
  }
  if (s.route === "full" && base > 0) {
    monthly.push({ k: "Bookkeeping by us", v: base * rm });
  }

  const extraBanks = Math.max(0, s.banks - 1);
  if (extraBanks > 0 && s.route !== "self") {
    const rate = s.route === "full" ? EXTRA_BANK_MONTHLY.bookFull : EXTRA_BANK_MONTHLY.selfWithReview;
    monthly.push({ k: `Bank accounts · ${extraBanks} extra`, v: extraBanks * rate * rm });
  }

  if (s.head > 0) {
    const rate = payrollRate(s.head);
    monthly.push({ k: `Payroll · ${s.head} × ${euro(rate)}`, v: s.head * rate * rm });
  }

  // VAT: we only file it when we are in the books at all.
  if (s.vatreg !== "none" && s.route !== "self") {
    if (s.vatreg === "art11") {
      // One flat yearly declaration — shown as its monthly share so the
      // "your monthly price" figure stays honest.
      monthly.push({ k: "VAT · art. 11 declaration", v: (VAT_RULES.art11FlatYearly / 12) * rm });
    } else {
      const bandFee = VAT_MONTHLY[s.txn];
      const factor = s.vatreg === "art12" ? VAT_RULES.art12Factor : 1;
      if (bandFee > 0) monthly.push({ k: `VAT returns · ${s.vatreg === "art12" ? "art. 12" : "art. 10"}`, v: bandFee * factor * rm });
    }
  }

  const months = parseInt(s.behind, 10) || 0;
  if (months > 0) {
    const perMonth = s.route === "self" ? CATCH_UP.selfPerMonth : CATCH_UP.fullPerMonth * rm;
    const uncapped = months * perMonth;
    // Full service caps per year behind, so a long backlog never runs away.
    const cap = s.route === "self" ? Infinity : Math.ceil(months / 12) * CATCH_UP.fullPerYearCap * rm;
    oneOff.push({ k: `Catch-up · ${months} months`, v: Math.min(uncapped, cap) });
  }

  const sum = (a: Line[]) => a.reduce((t, l) => t + l.v, 0);
  const monthlyFull = roundEur(sum(monthly));
  const oneOffFull = roundEur(sum(oneOff));
  const discountPct = isPromoActive(now) ? LAUNCH_PROMO.pct : 0;

  return {
    refer: false,
    tier: { label: tierDef.label, mult: rm },
    monthly,
    oneOff,
    monthlyFull,
    oneOffFull,
    monthlyNet: roundEur(monthlyFull * (1 - discountPct)),
    oneOffNet: roundEur(oneOffFull * (1 - discountPct)),
    discountPct,
    softwareTier,
  };
}

/** Plain-language recap of what the client just configured. */
export function accountingSummary(s: AccountingInput, q: AccountingQuote): string {
  if (q.refer) return "Your sector needs a short call with a director before we put a number on it — usually the same day.";
  const bits: string[] = [];
  bits.push(
    s.route === "self" ? `you run the ${q.softwareTier} plan yourself`
      : s.route === "review" ? "you keep the books and we review them"
      : "you upload and we do the bookkeeping",
  );
  if (s.head > 0) bits.push(`we run payroll for ${s.head}`);
  if (s.vatreg !== "none" && s.route !== "self") bits.push("we file your VAT");
  const months = parseInt(s.behind, 10) || 0;
  if (months > 0) bits.push(`we catch up ${months} months first`);
  return `So: ${bits.join(", ")} — ${euro(q.monthlyNet)} a month${q.oneOffFull > 0 ? `, plus ${euro(q.oneOffNet)} one-off to get current` : ""}${q.discountPct > 0 ? ", with the launch discount applied" : ""}.`;
}
