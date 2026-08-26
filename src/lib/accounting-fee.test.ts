import { describe, it, expect } from "vitest";
import { calcAccountingFee, accountingSummary, quoteBreakdown, catchUpMonthsFrom, ongoingStartMonth, formatStartMonth, nextMonth, type AccountingInput } from "./accounting-fee";
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

  it("applies the sector risk multiplier to VAT but never to the books or the payroll", () => {
    const std = at({ vatreg: "art10" }) as { monthlyFull: number };
    const high = at({ vatreg: "art10", sector: "regulated" }) as { monthlyFull: number };
    // The €49 bookkeeping line is flat; the VAT line takes the ×1.45.
    expect(std.monthlyFull).toBe(CO + 45);
    expect(high.monthlyFull).toBe(CO + Math.round(45 * 1.45));
    // Payroll no longer takes the multiplier (mt-2026-08-17-corrections,
    // finding A3): a restaurant's payslips are the same work as a shop's.
    const payStd = at({ head: 3 }) as { monthlyFull: number };
    const payHigh = at({ head: 3, sector: "regulated" }) as { monthlyFull: number };
    expect(payStd.monthlyFull).toBe(CO + 36);
    expect(payHigh.monthlyFull).toBe(payStd.monthlyFull);
  });

  it("prices payroll at a flat €12/head — the total never falls as the team grows", () => {
    // mt-2026-08-26b-payroll: one rate, n × 12. A single rate cannot cliff.
    expect(at({ head: 3 })).toMatchObject({ monthlyFull: CO + 36 });
    expect(at({ head: 10 })).toMatchObject({ monthlyFull: CO + 120 });
    expect(at({ head: 11 })).toMatchObject({ monthlyFull: CO + 132 });
    expect(at({ head: 20 })).toMatchObject({ monthlyFull: CO + 240 });
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
    // The full monthly rate includes the volume uplift (default txn 21-60 →
    // +€10): 24 months at €59 = €1,416 outside the promo. The retired
    // €240/yr cap would have said €480.
    expect((at({ behind: "24" }, AFTER_PROMO) as { oneOffFull: number }).oneOffFull).toBe(24 * (CO + 10));
    expect((at({ behind: "24" }, AFTER_PROMO) as { oneOffFull: number }).oneOffFull).not.toBe(480);
    expect((at({ behind: "24", entity: "sole" }, AFTER_PROMO) as { oneOffFull: number }).oneOffFull).toBe(24 * (SOLE + 10));
    expect((at({ behind: "0" }) as { oneOffFull: number }).oneOffFull).toBe(0);
    // Inside the promo window the quarter comes off AT THE LINE (finding C3).
    expect((at({ behind: "24" }) as { oneOffFull: number }).oneOffFull).toBe(Math.round(24 * (CO + 10) * 0.75));
  });

  it("labels the catch-up line in the contracted form", () => {
    // Outside the promo: the plain contracted form.
    const off = at({ behind: "12" }, AFTER_PROMO) as { oneOff: { k: string; v: number }[] };
    expect(off.oneOff[0].k).toBe("Catch-up: 12 months x EUR 59 = EUR 708");
    expect(off.oneOff[0].v).toBe(708);
    // Inside it: the discount is written INTO the label (finding C3), so the
    // line still reproduces from its own text, and the amount matches.
    const on = at({ behind: "12" }) as { oneOff: { k: string; v: number }[] };
    expect(on.oneOff[0].k).toBe("Catch-up: 12 months x EUR 59 = EUR 708, less 25% launch promo = EUR 531");
    expect(on.oneOff[0].v).toBe(531);
  });

  it("carries the catch-up promo inside the line — net and full one-off totals stay equal", () => {
    // The discount lives IN the line's own amount and label (finding C3), so
    // there is no second cut at the total: net === full, and both are the
    // discounted figure the backend re-prices to.
    const during = at({ behind: "12" }) as { oneOffFull: number; oneOffNet: number; discountPct: number };
    expect(during.discountPct).toBe(LAUNCH_PROMO.pct);
    expect(during.oneOffNet).toBe(during.oneOffFull);
    expect(during.oneOffFull).toBe(531);
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

  it("shows the discounted catch-up in the breakdown, with the discount in its label", () => {
    // Since mt-2026-08-17-corrections (finding C3) the €441 IS the billed
    // figure — screen, payload and backend all carry it, and the label says
    // exactly how it was computed. (Before the corrections a €441 on screen
    // next to €588 in the email was a defect; now a bare €588 would be one.)
    const q = calcAccountingFee(withCatchUp, DURING_PROMO);
    if (q.refer) throw new Error("unpriceable");
    expect(q.discountPct).toBe(LAUNCH_PROMO.pct);
    const oneOff = quoteBreakdown(q).filter((l) => l.v.includes("one-off"));
    expect(oneOff).toHaveLength(1);
    expect(oneOff[0].k).toContain("less 25% launch promo = EUR 531");
    expect(oneOff[0].v).toBe("€531 one-off");
  });

  it("differs across the promo boundary by exactly the promo, label included", () => {
    const on = calcAccountingFee(withCatchUp, DURING_PROMO);
    const off = calcAccountingFee(withCatchUp, AFTER_PROMO);
    if (on.refer || off.refer) throw new Error("unpriceable");
    const oneOffOf = (q: typeof on) => quoteBreakdown(q).filter((l) => l.v.includes("one-off"));
    expect(oneOffOf(off)[0].v).toBe("€708 one-off");
    expect(oneOffOf(on)[0].v).toBe("€531 one-off");
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

describe("catchUpMonthsFrom — the question the wizards no longer ask twice", () => {
  // Pinned: an assertion about "how many months back" that reads the wall
  // clock flips every 1st of the month.
  const AUG_2026 = new Date(Date.UTC(2026, 7, 25));

  it("counts every month from the start month up to, but not including, this one", () => {
    // The visitor picks January and it is August: Jan–Jul is seven months of
    // catch-up, and the ongoing fee runs from August. Asking them for "7"
    // afterwards was asking them to restate their own answer.
    expect(catchUpMonthsFrom("2026-01", AUG_2026)).toBe(7);
    expect(catchUpMonthsFrom("2025-08", AUG_2026)).toBe(12);
  });

  it("is zero for this month and for any future month", () => {
    expect(catchUpMonthsFrom("2026-08", AUG_2026)).toBe(0);
    expect(catchUpMonthsFrom("2026-12", AUG_2026)).toBe(0);
  });

  it("is zero for an empty or malformed month rather than guessing one", () => {
    // The picker ships EMPTY and the quote is withheld until it is filled;
    // a fallback here would price a start month nobody chose.
    expect(catchUpMonthsFrom("")).toBe(0);
    expect(catchUpMonthsFrom("2026-13", AUG_2026)).toBe(0);
    expect(catchUpMonthsFrom("nonsense", AUG_2026)).toBe(0);
  });

  it("caps at 240, the most the shared pack will price", () => {
    // Above 240 the pack returns null, so an uncapped derivation would put an
    // unpriceable catch-up line into a basket the backend then rejects.
    expect(catchUpMonthsFrom("1990-01", AUG_2026)).toBe(240);
  });

  it("prices the derived months exactly as an answered count used to", () => {
    // The wire value is unchanged — only where it comes from changed. A start
    // month six months back must build the same quote as the old "6 months"
    // pill did, or every quotation the backend re-prices moves.
    const derived = calcAccountingFee({ ...base, behind: String(catchUpMonthsFrom("2026-02", AUG_2026)), startMonth: "2026-02" });
    const answered = calcAccountingFee({ ...base, behind: "6", startMonth: "2026-02" });
    if (derived.refer || answered.refer) throw new Error("unpriceable");
    expect(derived.oneOffFull).toBe(answered.oneOffFull);
    expect(derived.monthlyNet).toBe(answered.monthlyNet);
  });
});

describe("ongoingStartMonth — the month that goes on the wire", () => {
  const AUG_2026 = new Date(Date.UTC(2026, 7, 25));

  it("sends THIS month when the picked month is in the past", () => {
    // The failure this prevents: the portal seeds period services from
    // `serviceStartDate` and Books detects the months before it as held. Send
    // January and the client is billed ongoing bookkeeping from January AND
    // seven catch-up months — the same seven months, twice.
    expect(ongoingStartMonth("2026-01", AUG_2026)).toBe("2026-08");
    expect(catchUpMonthsFrom("2026-01", AUG_2026)).toBe(7);
  });

  it("passes this month and any future month straight through", () => {
    // Nothing is behind, so the month picked IS the first ongoing month.
    expect(ongoingStartMonth("2026-08", AUG_2026)).toBe("2026-08");
    expect(ongoingStartMonth("2026-11", AUG_2026)).toBe("2026-11");
  });

  it("passes a malformed month through for the caller's own guard to refuse", () => {
    // Every surface gates sending on its own `startOk`; inventing a month here
    // would hand that guard something valid to pass on.
    expect(ongoingStartMonth("", AUG_2026)).toBe("");
    expect(ongoingStartMonth("2026-13", AUG_2026)).toBe("2026-13");
  });
});
