import { describe, expect, it } from "vitest";
import { buildQuoteRecord, evaluateA4Items } from "@/lib/websiteQuotation";
import { ongoingStartMonth } from "@/lib/accounting-fee";
import {
  BUILDER_INIT,
  auditIsReview,
  basketRetainer,
  basketSignature,
  buildBasket,
  effectivePlan,
  isOn,
  nativePrice,
  retainerReason,
  separately,
  serviceItems,
  servicePreview,
  viewTotals,
  visibleServices,
  type BuilderState,
} from "./builderModel";

/** Retainer vectors A and B of src/lib/retainer.test.ts (RETAINER_VECTORS), reached from the page's answers. */
const VECTOR_A = { monthly: 59 };
const VECTOR_B = { amounts: [69, 10, 52, 45, 36, 331, 1200, 150], monthly: 325, ownAnnual: 4125 };

/** A fixed "today" — after the launch promo, so no line carries a discount. */
const NOW = new Date("2026-10-15T12:00:00Z");

const state = (patch: Partial<BuilderState>, on: Partial<BuilderState["on"]> = {}): BuilderState => ({
  ...BUILDER_INIT,
  startMonth: "2026-10",
  ...patch,
  on: { ...BUILDER_INIT.on, ...on },
});

/** Vector A of src/lib/retainer.test.ts, built from the page's answers. */
const FREELANCER = state({ entity: "sole", expenses: "0-10k", txn: "1-20", vatreg: "art10" });
/** Vector B: small trading company. */
const TRADING = state(
  { entity: "company", expenses: "10-25k", txn: "21-60", banks: 2, heads: 3, capital: "1500", regoff: true },
  { pay: true, csp: true }
);

describe("the opening state", () => {
  it("prices nothing until the monthly spend is answered", () => {
    const b = buildBasket({ ...BUILDER_INIT }, NOW);
    expect(BUILDER_INIT.expenses).toBe("");
    expect(BUILDER_INIT.startMonth).toBe("");
    expect(b.gate).toBe("no-expenses");
    expect(b.items).toEqual([]);
    expect(b.lines).toEqual([]);
  });
});

describe("answers → basket → lines (one engine)", () => {
  it("prices the freelancer exactly like retainer vector A", () => {
    const b = buildBasket(FREELANCER, NOW);
    expect(b.gate).toBeNull();
    expect(b.lines.map((l) => [l.key, l.amount, l.cadence])).toEqual([
      ["book", 24, "monthly"],
      ["vat", 29, "monthly"],
      ["tax", 115, "yearly"],
    ]);
    expect(b.items.at(-1)).toEqual({ service: "onboarding" });
    const r = basketRetainer(b);
    expect(r.offered).toBe(true);
    expect(r.monthly).toBe(VECTOR_A.monthly);
  });

  it("prices the trading company exactly like retainer vector B", () => {
    const b = buildBasket(TRADING, NOW);
    expect([...b.lines.map((l) => l.amount)].sort((x, y) => x - y)).toEqual([...VECTOR_B.amounts].sort((x, y) => x - y));
    const r = basketRetainer(b);
    expect(r.monthly).toBe(VECTOR_B.monthly);
    expect(r.registryYearly).toBe(100);
    expect(r.ownAnnual).toBe(VECTOR_B.ownAnnual);
  });

  it("reaches retainer vectors C, D and E from the page's answers", () => {
    // C: restaurant company, six months behind — the €10 step from €500, catch-up outside.
    const c = buildBasket(
      state({ entity: "company", sector: "hospitality", expenses: "50-100k", txn: "61-150", banks: 3, heads: 12, capital: "10000", regoff: true, startMonth: "2026-04" }, { pay: true, csp: true }),
      NOW
    );
    expect([...c.lines.map((l) => l.amount)].sort((x, y) => x - y)).toEqual([149, 25, 132, 83, 144, 715, 1200, 344, 1836].sort((x, y) => x - y));
    const rc = basketRetainer(c);
    expect(rc).toMatchObject({ offered: true, monthly: 660, registryYearly: 294, oneOff: 1836, ownAnnual: 8361 });
    // D: audit-side holding company — nothing monthly, so no retainer.
    const d = buildBasket(
      state({ entity: "company", sector: "holding", expenses: "0-10k", txn: "1-20", capital: "1500", regoff: true }, { book: false, vat: false, assure: true, csp: true }),
      NOW
    );
    expect([...d.lines.map((l) => l.amount)].sort((x, y) => x - y)).toEqual([235, 495, 1200, 150].sort((x, y) => x - y));
    expect(basketRetainer(d)).toMatchObject({ offered: false, monthly: 0, registryYearly: 100, ownAnnual: 1485 });
    // E: bookkeeping alone — one service, no retainer.
    const e = buildBasket(state({ entity: "company", expenses: "0-10k" }, { vat: false, tax: false }), NOW);
    expect(e.lines.map((l) => l.amount)).toEqual([49]);
    expect(basketRetainer(e)).toMatchObject({ offered: false, monthly: 0, ownAnnual: 588 });
  });

  it("shows exactly the lines that are sent (screen = wire)", () => {
    for (const s of [FREELANCER, TRADING, state({ expenses: "25-50k", txn: "61-150", startMonth: "2026-04" }, { csp: true, pay: true }), state({ expenses: "", sector: "holding" }, { book: false, tax: false, assure: true, csp: true })]) {
      const b = buildBasket(s, NOW);
      const wire = evaluateA4Items(b.items, b.risk, NOW);
      expect(b.lines.map(({ label, amount }) => ({ label, amount }))).toEqual(wire.lines.map(({ label, amount }) => ({ label, amount })));
      expect(b.totals).toEqual(wire);
      const record = buildQuoteRecord({ name: "A", email: "a@b.mt", items: b.items, risk: b.risk, serviceStartDate: "2026-10" }, NOW);
      expect(record.lines.map((l) => l.amount)).toEqual(b.lines.map((l) => l.amount));
      expect(b.lines.map((l) => l.index)).toEqual(b.lines.map((_, i) => i));
    }
  });

  it("carries the sector risk on VAT and the audit only", () => {
    const std = buildBasket(state({ expenses: "10-25k", txn: "21-60" }), NOW);
    const high = buildBasket(state({ expenses: "10-25k", txn: "21-60", sector: "regulated" }), NOW);
    expect(high.risk).toBe("high");
    const amt = (b: typeof std, key: string) => b.lines.filter((l) => l.key === key).reduce((t, l) => t + l.amount, 0);
    expect(amt(high, "book")).toBe(amt(std, "book"));
    expect(amt(high, "tax")).toBe(amt(std, "tax"));
    expect(amt(high, "vat")).toBe(Math.round(45 * 1.45));
  });
});

describe("gates", () => {
  it("never prices a refer sector — a director calls", () => {
    const b = buildBasket(state({ expenses: "10-25k", sector: "other" }), NOW);
    expect(b.gate).toBe("refer");
    expect(b.items).toEqual([]);
  });

  it("prices nothing while the books and the audit are both asked for (company)", () => {
    const b = buildBasket(state({ expenses: "10-25k" }, { assure: true }), NOW);
    expect(b.gate).toBe("conflict");
    expect(b.items).toEqual([]);
    // Either side resolves it.
    expect(buildBasket(state({ expenses: "10-25k" }, { assure: false }), NOW).gate).toBeNull();
    const auditSide = buildBasket(state({ expenses: "10-25k" }, { assure: true, book: false }), NOW);
    expect(auditSide.gate).toBeNull();
    expect(auditSide.priced).toEqual(["tax", "assure"]);
    expect(auditSide.totals.independenceConflict).toBe(false);
  });

  it("a sole trader has no audit, so no conflict, and no corporate services", () => {
    const s = state({ entity: "sole", expenses: "10-25k" }, { assure: true, csp: true });
    expect(visibleServices(s, NOW)).not.toContain("assure");
    expect(visibleServices(s, NOW)).not.toContain("csp");
    expect(isOn(s, "assure", NOW)).toBe(false);
    const b = buildBasket(s, NOW);
    expect(b.gate).toBeNull();
    expect(b.items.some((i) => i.service === "audit" || i.service === "mbr")).toBe(false);
  });

  it("says when nothing is picked", () => {
    const b = buildBasket(state({ expenses: "10-25k" }, { book: false, vat: false, tax: false }), NOW);
    expect(b.gate).toBe("nothing");
  });
});

describe("services", () => {
  it("only prices VAT returns on books we keep, and art. 11 as a yearly declaration", () => {
    expect(serviceItems(state({ expenses: "10-25k" }, { book: false }), "vat", NOW).needs).toMatch(/kept the ledger/);
    expect(serviceItems(state({ expenses: "10-25k", vatreg: "none" }), "vat", NOW).items).toEqual([]);
    const art11 = buildBasket(state({ expenses: "10-25k", vatreg: "art11" }), NOW);
    expect(art11.lines.find((l) => l.key === "vat")).toMatchObject({ label: "VAT declaration (art. 11)", cadence: "yearly" });
    const unsure = buildBasket(state({ expenses: "10-25k", vatreg: "unsure" }), NOW);
    expect(unsure.items).toContainEqual({ service: "vat", txn: "1-20", vatreg: "art10" });
    expect(unsure.notes.some((n) => /fully VAT registered/.test(n))).toBe(true);
  });

  it("prices payroll per person and drops it at zero people", () => {
    expect(serviceItems(state({ heads: 0 }), "pay", NOW).needs).toMatch(/payroll/);
    const b = buildBasket(state({ expenses: "10-25k", heads: 4 }, { pay: true }), NOW);
    expect(b.lines.find((l) => l.key === "pay")).toMatchObject({ label: "Payroll", amount: 48, cadence: "monthly" });
  });

  it("derives the catch-up from a start month in the past", () => {
    const s = state({ expenses: "25-50k", txn: "21-60", startMonth: "2026-07" });
    expect(visibleServices(s, NOW)).toContain("catch");
    const b = buildBasket(s, NOW);
    const catchLine = b.lines.find((l) => l.key === "catch");
    expect(catchLine).toMatchObject({ label: "Catch-up: 3 months x EUR 109 = EUR 327", amount: 327, cadence: "one-off" });
    expect(ongoingStartMonth(s.startMonth, NOW)).toBe("2026-10");
    // Not without the bookkeeping, and not for a current start month.
    expect(isOn({ ...s, on: { ...s.on, book: false } }, "catch", NOW)).toBe(false);
    expect(visibleServices(state({ startMonth: "2026-10" }), NOW)).not.toContain("catch");
  });

  it("corporate is the annual return, with the registered office when asked", () => {
    const s = state({ expenses: "10-25k", capital: "10000" }, { csp: true });
    expect(serviceItems(s, "csp", NOW).items).toEqual([{ service: "mbr", capital: "10000" }]);
    expect(serviceItems({ ...s, regoff: true }, "csp", NOW).items).toEqual([{ service: "mbr", capital: "10000" }, { service: "registered-office" }]);
    const b = buildBasket(s, NOW);
    expect(b.lines.find((l) => l.key === "csp")).toMatchObject({ amount: 344, registry: 294 });
  });

  it("prices a review for a small company, a full audit at volume", () => {
    expect(auditIsReview({ expenses: "10-25k", txn: "21-60" })).toBe(true);
    expect(auditIsReview({ expenses: "10-25k", txn: "151-400" })).toBe(false);
    expect(auditIsReview({ expenses: "200-300k", txn: "1-20" })).toBe(false);
    const b = buildBasket(state({ expenses: "10-25k", txn: "21-60" }, { book: false, vat: false, assure: true }), NOW);
    expect(b.lines.find((l) => l.key === "assure")?.label).toBe("Review engagement (if applicable)");
  });

  it("previews a card's price before it is switched on", () => {
    const s = state({ expenses: "10-25k", heads: 2 });
    expect(servicePreview(s, "pay", "standard", NOW).price).toEqual({ amount: 24, per: "/ mo", extra: "" });
    expect(servicePreview({ ...s, regoff: true }, "csp", "standard", NOW).price).toEqual({ amount: 1350, per: "/ yr", extra: "" });
  });
});

describe("views and the retainer", () => {
  const b = buildBasket(TRADING, NOW);
  const r = basketRetainer(b);

  it("monthly: the monthly fees plus VAT, everything else alongside", () => {
    const t = viewTotals(b, "monthly", r);
    expect(t).toMatchObject({ net: 212, vat: 38.16, total: 250.16, per: "/ mo", alsoYearly: 1681, alsoOneOff: 0 });
  });

  it("first year: every fee once, VAT on all but the registry fee", () => {
    const t = viewTotals(b, "year", r);
    expect(t).toMatchObject({ net: 4225, vat: 742.5, per: "first year" });
  });

  it("retainer: one monthly fee, VAT on it, the registry fee outside at cost", () => {
    const t = viewTotals(b, "retainer", r);
    expect(t).toMatchObject({ view: "retainer", net: 325, vat: 58.5, total: 383.5, per: "/ mo", alsoYearly: 100, registry: 100, firstYear: 4000 });
    expect(separately(b, r)).toEqual({ monthly: 212, yearly: 1581 });
    expect(r.savingYearly).toBe(225);
  });

  it("keeps one-offs and the audit outside the retainer", () => {
    const c = buildBasket(state({ expenses: "25-50k", txn: "21-60", startMonth: "2026-07", heads: 2 }, { pay: true }), NOW);
    const rc = basketRetainer(c);
    expect(rc.offered).toBe(true);
    expect(rc.oneOff).toBe(327);
    const t = viewTotals(c, "retainer", rc);
    expect(t.alsoOneOff).toBe(327);
    expect(t.firstYear).toBe(rc.retainerAnnual + 327);
  });

  it("falls back to the monthly view when the retainer is not offered", () => {
    const one = buildBasket(state({ expenses: "10-25k" }, { vat: false, tax: false }), NOW);
    const r1 = basketRetainer(one);
    expect(r1.offered).toBe(false);
    expect(retainerReason(r1)).toMatch(/two services/);
    expect(viewTotals(one, "retainer", r1).view).toBe("monthly");
  });

  it("is yearly when nothing is monthly", () => {
    const yearly = buildBasket(state({ expenses: "10-25k" }, { book: false, vat: false, csp: true }), NOW);
    expect(viewTotals(yearly, "monthly", basketRetainer(yearly)).per).toBe("/ yr");
  });
});

describe("the plan and the sent quotation", () => {
  it("follows the view until the visitor picks, and never asks for a retainer that is not offered", () => {
    expect(effectivePlan("retainer", null, true)).toBe("retainer");
    expect(effectivePlan("monthly", null, true)).toBe("separate");
    expect(effectivePlan("monthly", "retainer", true)).toBe("retainer");
    expect(effectivePlan("retainer", "retainer", false)).toBe("separate");
  });

  it("a change to the basket, the month or the plan makes a new quotation", () => {
    const b = buildBasket(FREELANCER, NOW);
    const sig = basketSignature(b, "2026-10", "separate");
    expect(basketSignature(b, "2026-10", "separate")).toBe(sig);
    expect(basketSignature(b, "2026-11", "separate")).not.toBe(sig);
    expect(basketSignature(b, "2026-10", "retainer")).not.toBe(sig);
    expect(basketSignature(buildBasket(TRADING, NOW), "2026-10", "separate")).not.toBe(sig);
  });

  it("formats native cadence", () => {
    expect(nativePrice([{ amount: 69, cadence: "monthly" }, { amount: 331, cadence: "yearly" }])).toEqual({ amount: 69, per: "/ mo", extra: "+ €331 /yr" });
    expect(nativePrice([{ amount: 327, cadence: "one-off" }])).toEqual({ amount: 327, per: "one-off", extra: "" });
  });
});
