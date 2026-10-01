/**
 * The A4 monthly retainer: one monthly fee for every recurring A4 service in a quote,
 * slightly less than buying them separately, rounded down to €5 (owner, 1 Oct 2026).
 *
 * MIRRORED IN THE BACKEND (vacei-portal-backend src/modules/quote-pack/retainer.ts) and the
 * partner portal (quotationModel) — same constants, same rules, same test vectors. Change all
 * three together.
 *
 * Rules
 * - Inside the retainer: every monthly line, and every yearly line converted to a month
 *   (÷ 12), at the price quoted.
 * - Outside (billed as quoted, in their own cadence):
 *   - the government registry part of the MBR annual return (at cost, no VAT, never discounted),
 *   - one-off items (catch-up, incorporation),
 *   - audit / review engagements ("if applicable", delivered separately),
 *   - lines without a cadence.
 * - Price: a year of the covered fees, 5% off, ÷ 12, rounded DOWN to €5 — always €5, at
 *   every size (owner, 1 Oct 2026: the earlier €10 step from €500 is gone).
 *   Never more than 10% off (small baskets would otherwise round too far): then it is
 *   rounded down to the euro instead.
 * - Offered only with at least two services inside it, at least one of them monthly.
 * - Billed monthly, 12-month minimum. Not an annual/prepay discount; never "per month
 *   billed annually".
 */
import { MBR_ANNUAL_RETURN } from "@/data/a4QuotePack";

export const RETAINER = {
  version: 1,
  discountPct: 0.05,
  maxDiscountPct: 0.1,
  /** Rounding step, €: always €5, however large the basket. */
  step: 5,
  minServices: 2,
  minTermMonths: 12,
} as const;

export type RetainerCadence = "monthly" | "yearly" | "one-off" | null;
export type RetainerLine = { label: string; amount: number; cadence: RetainerCadence };

export type RetainerOutside = { index: number; label: string; amount: number; cadence: RetainerCadence; reason: "registry" | "one-off" | "audit" | "no-cadence" };

export type RetainerResult = {
  offered: boolean;
  /** Why it isn't offered (when offered is false). */
  reason: "ok" | "too-few-services" | "no-monthly-service" | "nothing-recurring";
  /** The retainer, €/mo. 0 when not offered. */
  monthly: number;
  /** The covered services bought separately, as a monthly equivalent (2 dp). */
  separateMonthly: number;
  /** A year of the covered services bought separately. */
  ownAnnual: number;
  /** A year of the retainer. */
  retainerAnnual: number;
  /** ownAnnual − retainerAnnual. */
  savingYearly: number;
  /** savingYearly / ownAnnual (0..1, 4 dp). */
  savingPct: number;
  /** Registry fees passed through at cost, per year (outside the retainer). */
  registryYearly: number;
  /** One-off items, outside the retainer. */
  oneOff: number;
  /** Indexes (into the input) of the lines the retainer covers. */
  covered: number[];
  /** Service groups inside the retainer, e.g. ["bookkeeping","vat","tax"]. */
  groups: string[];
  outside: RetainerOutside[];
};

const ADJUSTMENT = (label: string) => {
  const l = label.trim().toLowerCase();
  return l === "adjustment" || l.includes("launch discount");
};
const AUDIT = /\baudit\b|review engagement/i;
const MBR = (label: string) => /annual return/i.test(label) && /\bmbr\b/i.test(label);

/** Service group of a line, for the "two services" gate. Works on both the site's and the backend's labels. */
export function retainerGroup(label: string): string {
  if (/bookkeeping|bank account/i.test(label)) return "bookkeeping";
  if (/\bvat\b/i.test(label)) return "vat";
  if (/tax return/i.test(label)) return "tax";
  if (/payroll/i.test(label)) return "payroll";
  if (/annual return|\bmbr\b|registered office|company secretary/i.test(label)) return "corporate";
  return "other:" + label.trim().toLowerCase();
}

/**
 * The retainer for a set of quote lines. `selected` limits it to those indexes (the lines a
 * client has switched on); adjustment lines follow their cadence.
 */
export function retainerFor(lines: RetainerLine[], selected?: Iterable<number>): RetainerResult {
  const pick = selected ? new Set(selected) : null;
  const covered: number[] = [];
  const outside: RetainerOutside[] = [];
  const groups = new Set<string>();
  let monthlySum = 0;
  let yearlyOwn = 0;
  let registry = 0;
  let oneOff = 0;
  let hasMonthlyService = false;
  const adjustments: { index: number; amount: number; cadence: RetainerCadence }[] = [];
  const keptCadences = new Set<RetainerCadence>();

  lines.forEach((ln, index) => {
    const amount = Number(ln.amount) || 0;
    if (ADJUSTMENT(ln.label)) {
      adjustments.push({ index, amount, cadence: ln.cadence });
      return;
    }
    if (pick && !pick.has(index)) return;
    if (ln.cadence === "one-off") {
      oneOff += amount;
      outside.push({ index, label: ln.label, amount, cadence: ln.cadence, reason: "one-off" });
      return;
    }
    if (ln.cadence == null) {
      outside.push({ index, label: ln.label, amount, cadence: ln.cadence, reason: "no-cadence" });
      return;
    }
    if (AUDIT.test(ln.label)) {
      outside.push({ index, label: ln.label, amount, cadence: ln.cadence, reason: "audit" });
      return;
    }
    keptCadences.add(ln.cadence);
    groups.add(retainerGroup(ln.label));
    covered.push(index);
    if (ln.cadence === "monthly") {
      monthlySum += amount;
      hasMonthlyService = true;
      return;
    }
    // yearly
    if (MBR(ln.label)) {
      const reg = Math.max(0, amount - MBR_ANNUAL_RETURN.ourFee);
      registry += reg;
      yearlyOwn += amount - reg;
      if (reg > 0) outside.push({ index, label: ln.label, amount: reg, cadence: "yearly", reason: "registry" });
    } else yearlyOwn += amount;
  });
  // Adjustment lines (e.g. a promo) belong to the cadence they adjust.
  for (const adj of adjustments) {
    if (adj.cadence === "monthly" && keptCadences.has("monthly")) monthlySum += adj.amount;
    else if (adj.cadence === "yearly" && keptCadences.has("yearly")) yearlyOwn += adj.amount;
  }

  const ownAnnual = Math.max(0, 12 * monthlySum + yearlyOwn);
  const base = {
    separateMonthly: Math.round((ownAnnual / 12) * 100) / 100,
    ownAnnual,
    registryYearly: registry,
    oneOff,
    covered,
    groups: [...groups],
    outside,
  };
  const none = (reason: RetainerResult["reason"]): RetainerResult => ({
    ...base,
    offered: false,
    reason,
    monthly: 0,
    retainerAnnual: 0,
    savingYearly: 0,
    savingPct: 0,
  });
  if (ownAnnual <= 0) return none("nothing-recurring");
  if (!hasMonthlyService) return none("no-monthly-service");
  if (groups.size < RETAINER.minServices) return none("too-few-services");

  // Integer-safe: floor(ownAnnual × 95% / 12 / €5) × €5, capped at 10% off.
  const keep = Math.round((1 - RETAINER.discountPct) * 100); // 95
  const target = (ownAnnual * keep) / 1200;
  const step = RETAINER.step;
  let monthly = Math.floor((ownAnnual * keep) / (1200 * step)) * step;
  const floorPct = Math.round((1 - RETAINER.maxDiscountPct) * 100); // 90
  if (monthly * 1200 < ownAnnual * floorPct) monthly = Math.floor(target);
  const retainerAnnual = monthly * 12;
  const savingYearly = ownAnnual - retainerAnnual;
  return {
    ...base,
    offered: monthly > 0 && retainerAnnual < ownAnnual,
    reason: "ok",
    monthly,
    retainerAnnual,
    savingYearly,
    savingPct: Math.round((savingYearly / ownAnnual) * 10000) / 10000,
  };
}
