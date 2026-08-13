/**
 * Managed bookkeeping monthly price engine — the calculator on
 * /accounting-services.
 *
 * Every figure comes from `src/data/a4QuotePack.ts`. Pack
 * mt-2026-08-14-managed removed the three-route choice this engine used to
 * offer (software only / software + our review / we do it): there is one
 * service now, A4 keeps the books, and the only thing that moves the
 * bookkeeping price is whether the books belong to a company or to a
 * self-employed person. Catch-up months cost the same as current months.
 *
 * VAT still follows the pack rather than the old design mock: art. 11 is a
 * flat yearly declaration and art. 12 is 60% of the art. 10 band price.
 */

import {
  TXN_BANDS, RISK_TIERS, VAT_MONTHLY, VAT_RULES,
  PAYROLL_PER_HEAD, payrollRate, LAUNCH_PROMO, isPromoActive, roundEur, sectorTier,
  MANAGED_ENTITY_LABELS, MANAGED_ENTITY_OPTIONS, catchUpAmount, catchUpLabel, managedMonthly,
  type TxnBand, type RiskTier, type ManagedEntity,
} from "@/data/a4QuotePack";

// The sector list is pack data — one definition for every calculator.
export { SECTORS } from "@/data/a4QuotePack";

export const TXN = TXN_BANDS.map((b) => ({ id: b.id, label: b.label, sub: b.hint }));

/** Whose books these are. Replaces the retired `RouteId` self/review/full. */
export const ENTITIES = MANAGED_ENTITY_OPTIONS;

export type VatRegId = "none" | "art10" | "art11" | "art12";
export const VAT_REG: { id: VatRegId; label: string; sub: string }[] = [
  { id: "none", label: "Not registered", sub: "no VAT returns" },
  { id: "art10", label: "Yes — Article 10", sub: "charging and reclaiming" },
  { id: "art11", label: "Small exempt", sub: "under the threshold" },
  { id: "art12", label: "Article 12", sub: "EU acquisitions" },
];

/**
 * Earlier months that still need doing. THE one "how far behind are you"
 * vocabulary on this site: a count of MONTHS, priced at the monthly rate.
 * `/quote`'s builder converts its whole-year answer into this, and the
 * homepage wizard's `behind` uses the same ids.
 */
export const BEHIND: { id: string; label: string; sub: string }[] = [
  { id: "0", label: "Up to date", sub: "nothing to catch up" },
  { id: "3", label: "3 months", sub: "behind" },
  { id: "6", label: "6 months", sub: "behind" },
  { id: "12", label: "1 year", sub: "behind" },
  { id: "24", label: "2 years", sub: "behind" },
  { id: "36", label: "3 years +", sub: "behind" },
];

export const STEPS = ["What you do", "Whose books", "Payroll", "VAT", "Start month", "Earlier months", "Your price"];

export type AccountingInput = {
  sector: string;
  txn: TxnBand;
  entity: ManagedEntity;
  head: number;
  vatreg: VatRegId;
  /** Whole months of backlog, as a string id from BEHIND. */
  behind: string;
  /** `YYYY-MM` — the first month in scope. Required before any figure is final. */
  startMonth: string;
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
      /** Client-facing name for the entity the price was set by. */
      entityLabel: string;
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

  // Managed bookkeeping — flat, and deliberately NOT × rm. The sector loading
  // applies to the compliance work below it, not to keeping the books.
  const entity: ManagedEntity = s.entity === "sole" ? "sole" : "company";
  const entityLabel = MANAGED_ENTITY_LABELS[entity];
  monthly.push({ k: `Managed bookkeeping · ${entityLabel}`, v: managedMonthly(entity) });

  if (s.head > 0) {
    const rate = payrollRate(s.head);
    monthly.push({ k: `Payroll · ${s.head} × ${euro(rate)}`, v: s.head * rate * rm });
  }

  // VAT is built from a ledger we have worked, which is now always the case.
  if (s.vatreg !== "none") {
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

  // Earlier months, at the same monthly rate. No cap, no premium, and no
  // launch discount — it is a one-off. The label is the wire-contract form.
  const months = parseInt(s.behind, 10) || 0;
  if (months > 0) {
    oneOff.push({ k: catchUpLabel(months, entity), v: catchUpAmount(months, entity) });
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
    // One-offs are NOT discounted (pack rule). Catch-up is a one-off, so the
    // net and full figures are the same — kept as a field so callers that
    // render "one-off net" do not have to know the rule.
    oneOffNet: oneOffFull,
    discountPct,
    entityLabel,
  };
}

/** Plain-language recap of what the client just configured. */
export function accountingSummary(s: AccountingInput, q: AccountingQuote): string {
  if (q.refer) return "Your sector needs a short call with a director before we put a number on it — usually the same day.";
  const bits: string[] = ["you send us the paperwork and we keep the books"];
  if (s.head > 0) bits.push(`we run payroll for ${s.head}`);
  if (s.vatreg !== "none") bits.push("we file your VAT");
  const months = parseInt(s.behind, 10) || 0;
  if (months > 0) bits.push(`we do the ${months} earlier months first`);
  const start = s.startMonth ? `, starting ${formatStartMonth(s.startMonth)}` : "";
  return `So: ${bits.join(", ")}${start} — ${euro(q.monthlyNet)} a month${q.oneOffFull > 0 ? `, plus ${euro(q.oneOffNet)} once for the earlier months` : ""}${q.discountPct > 0 ? ", with the launch discount applied" : ""}.`;
}

/** `2026-09` → `September 2026`. Empty in, empty out — never invent a month. */
export function formatStartMonth(v: string): string {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(v)) return "";
  const [y, m] = v.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-MT", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * The month after this one, as `YYYY-MM` — the sensible DEFAULT SUGGESTION for
 * a start-month picker. It is only a suggestion: the field is still required
 * and the visitor must confirm it, because a wrong start month silently
 * changes what is and is not a catch-up month.
 */
export function nextMonth(now: Date = new Date()): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
