import { describe, it, expect } from "vitest";
import { calcAccountingFee, accountingSummary, quoteBreakdown, formatStartMonth, nextMonth, type AccountingInput } from "./accounting-fee";
import { BOOKKEEPING_MANAGED_MONTHLY, LAUNCH_PROMO } from "@/data/a4QuotePack";

// The entry expenses band, which `base` below pins. Bookkeeping is banded by
// monthly expenses now, so these are a band rate, not a flat rate.
const SOLE = BOOKKEEPING_MANAGED_MONTHLY.sole["0-10k"]; // 24
const CO = BOOKKEEPING_MANAGED_MONTHLY.company["0-10k"]; // 49

const base: AccountingInput = {
  sector: "shop", txn: "21-60", entity: "company", expenses: "0-10k", head: 0, vatreg: "none", behind: "0",
  startMonth: "2026-09",
};
// Inside the launch-promo window, so the discount branch is exercised.
const DURING_PROMO = new Date("2026-08-02T00:00:00Z");
const AFTER_PROMO = new Date("2026-09-01T12:00:00Z");
const at = (p: Partial<AccountingInput>, now = DURING_PROMO) => calcAccountingFee({ ...base, ...p }, now);

describe("accounting fee engine", () => {
  it("bills managed bookkeeping by entity and expenses, never by transaction volume", () => {
    expect(at({ entity: "sole" })).toMatchObject({ entityLabel: "Self-employed", monthlyFull: SOLE });
    expect(at({ entity: "company" })).toMatchObject({ entityLabel: "Company", monthlyFull: CO });
    // The TRANSACTION band must not move it — expenses is the only driver.
    expect(at({ entity: "company", txn: "1-20" })).toMatchObject({ monthlyFull: CO });
    expect(at({ entity: "company", txn: "1000+" })).toMatchObject({ monthlyFull: CO });
  });

  it("refers the sectors we do not price instantly", () => {
    expect(at({ sector: "other" })).toEqual({ refer: true, reason: "sector" });
  });

  it("applies the sector risk multiplier to our compliance work but never to the books", () => {
    const std = at({ head: 3 }) as { monthlyFull: number };
    const high = at({ head: 3, sector: "regulated" }) as { monthlyFull: number };
    // The €49 bookkeeping line is flat; only the payroll line takes the ×1.45.
    expect(std.monthlyFull).toBe(CO + 3 * 32);
    expect(high.monthlyFull).toBe(CO + Math.round(3 * 32 * 1.45));
  });

  it("prices payroll per head and gets cheaper as the team grows", () => {
    expect(at({ head: 3 })).toMatchObject({ monthlyFull: CO + 3 * 32 });
    expect(at({ head: 20 })).toMatchObject({ monthlyFull: CO + 20 * 25 });
  });

  it("distinguishes the three VAT articles instead of charging art. 10 for all", () => {
    const a10 = at({ vatreg: "art10" }) as { monthlyFull: number };
    const a12 = at({ vatreg: "art12" }) as { monthlyFull: number };
    const a11 = at({ vatreg: "art11" }) as { monthlyFull: number };
    expect(a10.monthlyFull).toBe(CO + 45); // art. 10 band price
    expect(a12.monthlyFull).toBe(CO + Math.round(45 * 0.6));
    expect(a11.monthlyFull).toBe(CO + Math.round(145 / 12));
  });

  it("charges catch-up at the monthly rate per month, with no cap", () => {
    // 24 months at €49 = €1,176. The retired €240/yr cap would have said €480.
    expect((at({ behind: "24" }) as { oneOffFull: number }).oneOffFull).toBe(24 * CO);
    expect((at({ behind: "24" }) as { oneOffFull: number }).oneOffFull).not.toBe(480);
    expect((at({ behind: "24", entity: "sole" }) as { oneOffFull: number }).oneOffFull).toBe(24 * SOLE);
    expect((at({ behind: "0" }) as { oneOffFull: number }).oneOffFull).toBe(0);
  });

  it("labels the catch-up line in the contracted form", () => {
    const q = at({ behind: "12" }) as { oneOff: { k: string; v: number }[] };
    expect(q.oneOff[0].k).toBe("Catch-up: 12 months x EUR 49 = EUR 588");
    expect(q.oneOff[0].v).toBe(588);
  });

  it("never discounts the one-off catch-up, even inside the promo window", () => {
    const during = at({ behind: "12" }) as { oneOffFull: number; oneOffNet: number; discountPct: number };
    expect(during.discountPct).toBe(LAUNCH_PROMO.pct);
    expect(during.oneOffNet).toBe(during.oneOffFull);
  });

  it("applies the launch discount to the monthly while it runs, and drops it afterwards", () => {
    const during = at({}) as { monthlyFull: number; monthlyNet: number; discountPct: number };
    expect(during.discountPct).toBe(LAUNCH_PROMO.pct);
    expect(during.monthlyNet).toBe(Math.round(during.monthlyFull * 0.75));

    const after = at({}, AFTER_PROMO) as { monthlyFull: number; monthlyNet: number; discountPct: number };
    expect(after.discountPct).toBe(0);
    expect(after.monthlyNet).toBe(after.monthlyFull);
  });

  it("recaps the configuration in plain language, including the start month", () => {
    const s: AccountingInput = { ...base, head: 4, vatreg: "art10", behind: "6", startMonth: "2026-10" };
    const text = accountingSummary(s, calcAccountingFee(s, DURING_PROMO));
    expect(text).toContain("we keep the books");
    expect(text).toContain("payroll for 4");
    expect(text).toContain("file your VAT");
    expect(text).toContain("6 earlier months");
    expect(text).toContain("October 2026");
  });
});

describe("start month", () => {
  it("formats a YYYY-MM and refuses anything else", () => {
    expect(formatStartMonth("2026-09")).toBe("September 2026");
    expect(formatStartMonth("2027-01")).toBe("January 2027");
    // Never invent a month from junk.
    expect(formatStartMonth("2026-13")).toBe("");
    expect(formatStartMonth("")).toBe("");
    expect(formatStartMonth("next month")).toBe("");
  });

  it("suggests the following month, and rolls the year over", () => {
    expect(nextMonth(new Date("2026-08-13T00:00:00Z"))).toBe("2026-09");
    expect(nextMonth(new Date("2026-12-31T00:00:00Z"))).toBe("2027-01");
    expect(nextMonth(new Date("2026-01-01T00:00:00Z"))).toBe("2026-02");
  });
});

/**
 * B1 / M10 — the missing expenses band must be its OWN outcome, with its own
 * words, and it must never be pre-answered on the visitor's behalf.
 *
 * The engine used to collapse "we do not have your spend answer" into
 * `{ refer: true }`, which is the SECTOR-referral outcome. A visitor who simply
 * had not reached the spend question was told their industry needed a director
 * call — a statement about them that is not true, and one that hides the real
 * (and instantly fixable) reason no price appeared. vacei.com has always kept
 * `noExpenses` and `refer` apart with separate copy; this engine now does too.
 */
describe("a missing expenses band is not a sector referral", () => {
  it("returns a distinct no-expenses outcome, not the referral one", () => {
    const q = at({ expenses: "" });
    expect(q).toEqual({ refer: true, reason: "no-expenses" });
    // …and the sector case keeps its own reason, so the two never merge again.
    expect(at({ sector: "other" })).toEqual({ refer: true, reason: "sector" });
  });

  it("says different words for the two — the visitor is told the real reason", () => {
    const noBand = accountingSummary({ ...base, expenses: "" }, at({ expenses: "" }));
    const sector = accountingSummary({ ...base, sector: "other" }, at({ sector: "other" }));
    expect(noBand).not.toBe(sector);
    // The fixable one names the thing to fix, and does not blame the sector.
    expect(noBand).toMatch(/spend/i);
    expect(noBand).not.toMatch(/sector/i);
    expect(sector).toMatch(/sector/i);
  });

  it("treats an unrecognised band the same way as a missing one", () => {
    // A stale cached page sending a retired band id is "we have no usable
    // answer", not "your industry needs a call".
    const stale = at({ expenses: "500K+" as AccountingInput["expenses"] });
    expect(stale).toEqual({ refer: true, reason: "no-expenses" });
    // Never, ever the cheapest band.
    expect(stale).not.toMatchObject({ refer: false });
  });

  it("never prices anything at all without the band — not even the payroll line", () => {
    // The whole quote is withheld, not just the bookkeeping line. A partial
    // price is still a price the visitor anchors on.
    const q = at({ expenses: "", head: 4, vatreg: "art10" });
    expect(q).toEqual({ refer: true, reason: "no-expenses" });
  });
});

/**
 * M2 — the estimator's price PANEL and its emailed PAYLOAD showed two
 * different figures for the same one-off, on the same screen.
 *
 * The panel mapped one-offs through `l.v * (1 - q.discountPct)` while the
 * engine, the tests and the payload all keep one-offs undiscounted (pack
 * rule). Inside the live promo window a 12-month company catch-up read €441 on
 * screen and €588 in the proposal email — and the €588 is the one the backend
 * will bill. The renderers are one function now, so they cannot disagree again.
 */
describe("the price breakdown shown equals the price breakdown sent", () => {
  const withCatchUp = { ...base, entity: "company" as const, expenses: "0-10k" as const, behind: "12" };

  it("never discounts the one-off in the breakdown, inside the promo window", () => {
    const q = calcAccountingFee(withCatchUp, DURING_PROMO);
    if (q.refer) throw new Error("unpriceable");
    expect(q.discountPct).toBe(LAUNCH_PROMO.pct);
    const oneOff = quoteBreakdown(q).filter((l) => l.v.includes("one-off"));
    expect(oneOff).toHaveLength(1);
    // 12 × €49 = €588 — the full figure, NOT €441 (which is 588 × 0.75).
    expect(oneOff[0].v).toBe("€588 one-off");
    expect(oneOff[0].v).not.toContain("441");
  });

  it("gives the identical breakdown whether the promo is on or off", () => {
    // The one-off is the same money either way; only the monthly moves.
    const on = calcAccountingFee(withCatchUp, DURING_PROMO);
    const off = calcAccountingFee(withCatchUp, AFTER_PROMO);
    if (on.refer || off.refer) throw new Error("unpriceable");
    const oneOffOf = (q: typeof on) => quoteBreakdown(q).filter((l) => l.v.includes("one-off"));
    expect(oneOffOf(on)).toEqual(oneOffOf(off));
  });

  it("is the same list the panel renders and the payload sends", () => {
    // One function, two call sites — this is the property that makes the
    // divergence unrepresentable rather than merely fixed today.
    const q = calcAccountingFee(withCatchUp, DURING_PROMO);
    if (q.refer) throw new Error("unpriceable");
    const breakdown = quoteBreakdown(q);
    expect(breakdown.map((l) => l.k)).toEqual([...q.monthly, ...q.oneOff].map((l) => l.k));
    expect(breakdown).toEqual(quoteBreakdown(q));
  });
});
