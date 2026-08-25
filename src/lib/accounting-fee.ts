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
  PAYROLL_PER_HEAD, payrollFee, payrollFeeLabel, LAUNCH_PROMO, isPromoActive, roundEur, sectorTier,
  MANAGED_ENTITY_LABELS, MANAGED_ENTITY_OPTIONS, EXPENSE_BANDS,
  catchUpAmount, catchUpLabel, managedMonthly,
  type TxnBand, type RiskTier, type ManagedEntity, type ExpenseBand,
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

/**
 * Monthly-expenses options — the BOOKKEEPING price driver. Presented as its
 * own question, never merged with TXN above: `txn` prices VAT, the tax return
 * and the audit; `expenses` prices the books. Two drivers, two questions.
 */
export const EXPENSES = EXPENSE_BANDS.map((b) => ({ id: b.id, label: b.label, sub: b.hint }));

/* "Earlier months" is gone: the start month already says how many there are,
   and asking twice made visitors think one of the two had been ignored. */
export const STEPS = ["What you do", "Whose books", "Monthly spend", "Payroll", "VAT", "When we start", "Your price"];

export type AccountingInput = {
  sector: string;
  /** Transactions a month — drives VAT, tax returns and audit. NOT bookkeeping. */
  txn: TxnBand;
  entity: ManagedEntity;
  /**
   * Monthly expenses — drives BOOKKEEPING only. A different question from `txn`.
   *
   * `""` means NOT YET ANSWERED, and it is the honest initial value: there is
   * no default band. Pre-selecting one produces a binding price for an answer
   * the prospect never gave, and the band id is valid so nothing downstream can
   * catch it — a company spending €300k/month would be quoted the €69 band.
   * The engine withholds the whole quote until this is a real band.
   */
  expenses: ExpenseBand | "";
  head: number;
  vatreg: VatRegId;
  /** Whole months of backlog, as a string id from BEHIND. */
  behind: string;
  /** `YYYY-MM` — the first month in scope. Required before any figure is final. */
  startMonth: string;
};

export type Line = { k: string; v: number };

/**
 * Why a quote carries no figures.
 *
 * These were one outcome (`{ refer: true }`) and had to be split: "your sector
 * needs a director call" and "we do not have your monthly spend yet" are
 * different facts about different things, and only one of them is the
 * visitor's to fix in a click. Collapsing them told prospects their industry
 * was the problem when the real answer was one unanswered question.
 */
export type UnpricedReason = "sector" | "no-expenses";

export type AccountingQuote =
  | { refer: true; reason: UnpricedReason }
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
  if (tierDef.multiplier == null) return { refer: true, reason: "sector" };
  const rm = tierDef.multiplier;

  // No usable spend answer → NOTHING is priced, and the reason is the band, not
  // the sector. Checked before any line is built: a partial price (payroll and
  // VAT without the books) is still a figure the visitor anchors on, and it
  // would be a figure for an engagement we have not been told the shape of.
  const bookRateEarly = s.expenses === "" ? null : managedMonthly(s.entity === "sole" ? "sole" : "company", s.expenses);
  if (bookRateEarly == null) return { refer: true, reason: "no-expenses" };

  const monthly: Line[] = [];
  const oneOff: Line[] = [];

  // Managed bookkeeping — by entity × monthly expenses, and deliberately NOT
  // × rm. The sector loading applies to the compliance work below it, not to
  // keeping the books.
  const entity: ManagedEntity = s.entity === "sole" ? "sole" : "company";
  const entityLabel = MANAGED_ENTITY_LABELS[entity];
  // Proved non-null by the `no-expenses` guard above, so `s.expenses` is a real
  // band from here down and the catch-up below can rely on it too.
  const bookRate = bookRateEarly;
  const expenses = s.expenses as ExpenseBand;
  monthly.push({ k: `Managed bookkeeping · ${entityLabel}`, v: bookRate });

  if (s.head > 0) {
    // Marginal tiers, NOT risk-multiplied (findings A2 + A3) — and the label
    // is the arithmetic, so the amount reproduces from it.
    monthly.push({ k: `Payroll · ${payrollFeeLabel(s.head)}`, v: payrollFee(s.head) });
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

  // Earlier months, at the same monthly rate. No cap, no premium — and inside
  // the promo window the quarter comes off AT THIS LINE, with the discount
  // written into the wire-contract label (finding C3).
  const months = parseInt(s.behind, 10) || 0;
  if (months > 0) {
    const promoNow = isPromoActive(now);
    const k = catchUpLabel(months, entity, expenses, promoNow);
    const v = catchUpAmount(months, entity, expenses, promoNow);
    // Both are non-null here — bookRate above already proved the band — but the
    // guard keeps the null contract explicit rather than asserting it away.
    if (k != null && v != null) oneOff.push({ k, v });
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
    // Catch-up already carries its promo discount at its own line (finding
    // C3), and the other one-offs are never discounted — so no further cut is
    // applied to the one-off total. Kept as a field so callers that render
    // "one-off net" do not have to know the rule.
    oneOffNet: oneOffFull,
    discountPct,
    entityLabel,
  };
}

/**
 * THE itemised breakdown, formatted — for every surface that renders one.
 *
 * There used to be two hand-written copies of this mapping in
 * AccountingEstimator: one in the on-screen price panel and one in the payload
 * handed to sales. They disagreed. The panel discounted one-off lines
 * (`l.v * (1 - discountPct)`) while the payload did not, so inside the live
 * promo window a 12-month company catch-up read €441 on screen and €588 in the
 * proposal email — and €588 is what the pack rule and the backend actually
 * bill, because ONE-OFFS ARE NEVER DISCOUNTED. The screen was the wrong one.
 *
 * Both call sites read this function now, so the two cannot drift apart again:
 * there is one mapping, and the promo is applied where the engine applies it
 * (the monthly) and nowhere else.
 */
export function quoteBreakdown(q: Extract<AccountingQuote, { refer: false }>): { k: string; v: string }[] {
  return [
    ...q.monthly.map((l) => ({ k: l.k, v: euro(l.v) })),
    // No discount here, deliberately. See the docblock above.
    ...q.oneOff.map((l) => ({ k: l.k, v: euro(l.v) + " one-off" })),
  ];
}

/**
 * What the visitor is told when the sector cannot be priced instantly.
 * A fact about their industry, and not their fault or their fix.
 */
export const ACCOUNTING_REFER_NOTE =
  "Your sector needs a short call with a director before we put a number on it — usually the same day.";

/**
 * What the visitor is told when we simply do not have their spend answer yet.
 *
 * Deliberately NOT the sector line: nothing is wrong, one question is
 * unanswered, and saying so is both true and immediately actionable. Pricing
 * the entry band instead would be worse than either — it is a real, binding
 * figure for an answer nobody gave.
 */
export const ACCOUNTING_NO_EXPENSES_NOTE =
  "Tell us roughly how much you spend a month and your price appears straight away. We do not guess it — the monthly spend is what sets the bookkeeping fee, and a guess would be someone else's price.";

/** Plain-language recap of what the client just configured. */
export function accountingSummary(s: AccountingInput, q: AccountingQuote): string {
  if (q.refer) return q.reason === "no-expenses" ? ACCOUNTING_NO_EXPENSES_NOTE : ACCOUNTING_REFER_NOTE;
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

/**
 * Earlier months still to do, DERIVED from the start month.
 *
 * The wizards used to ask twice: "from which month should we start?" and then
 * "how many earlier months are behind?". Two questions about one fact — the
 * visitor picks a start month in the past and is then asked, in different
 * words, how far in the past it was. Owner call 2026-08-25: ask ONCE. The start
 * month is the earliest month that still needs doing; every month from it up to
 * (but not including) the current one is catch-up, priced at the client's own
 * monthly rate, and the ongoing fee runs from the current month.
 *
 * A start month this month or later is not behind at all → 0. Capped at 240:
 * the shared pack prices 1–240 and returns null above it, so a 25-year-old
 * start date must degrade to "talk to us", never to an unpriceable line.
 */
export function catchUpMonthsFrom(startMonth: string, now: Date = new Date()): number {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(startMonth)) return 0;
  const [y, m] = startMonth.split("-").map(Number);
  const started = y * 12 + (m - 1);
  const current = now.getUTCFullYear() * 12 + now.getUTCMonth();
  return Math.max(0, Math.min(240, current - started));
}

/**
 * The month that goes ON THE WIRE as `serviceStartDate` / `startMonth`.
 *
 * THE TWO MONTHS ARE NOT THE SAME MONTH, and conflating them double-bills.
 * What the visitor now picks is the EARLIEST month that still needs doing.
 * What every consumer downstream means by a start month is the first ONGOING
 * month, with the backlog being whatever falls before it: the portal's
 * `websiteQuoteMeta` calls it "the period anchor" the accept fan-out seeds
 * period services from, Books detects the months before it as held, and the
 * quotation PDF prints "Bookkeeping starts X; N earlier months quoted
 * separately". Send a past month there and the client is quoted ongoing
 * bookkeeping from January AND seven catch-up months for the same seven
 * months.
 *
 * So the picker's answer is split at this boundary and only here: the count
 * goes out as catch-up, and the ongoing month goes out as the start. A month
 * this month or later is already the ongoing month and passes through
 * unchanged; an invalid one passes through too, for the caller's own
 * `startOk` guard to refuse.
 */
export function ongoingStartMonth(startMonth: string, now: Date = new Date()): string {
  if (catchUpMonthsFrom(startMonth, now) <= 0) return startMonth;
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}
