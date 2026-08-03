import { describe, expect, it } from "vitest";
import { A4_QUOTE_PACK_VERSION } from "@/data/a4QuotePack";
import { Q_INIT, qCalc, qLines, qSelections, type QState } from "./LandingQuoteCalculator";

/**
 * Parity guard for the homepage calculator.
 *
 * The portal backend re-prices the submitted `selections` from its own copy of
 * the quote pack and refuses to auto-issue a quotation whose totals differ from
 * ours by more than €1 / 1%. So a drift between this component and the pack is
 * not a cosmetic bug: it silently turns "here is your quote" into "a human will
 * follow up", with nothing in the UI to show it happened.
 *
 * EXPECTED FIGURES BELOW ARE NOT HAND-DERIVED. They are the literal output of
 * the backend's `evaluateSiteQuote` (vacei-portal-backend
 * src/modules/quote-pack/malta-pack.ts) run against the same selections at the
 * same instant. If the pack changes, re-run it and paste the new numbers —
 * never "fix" the test by adjusting the component to whatever it now prints.
 */

// Inside the launch-promo window, so the discount path is the one under test.
// Fixed, because the promo expires 2026-08-31 and a test that quietly changes
// behaviour on a date is worse than no test.
const NOW = new Date("2026-08-10T12:00:00Z");

const state = (over: Partial<QState>): QState => ({ ...Q_INIT, ...over });

/** Same four baskets the server was run against. */
const BASKETS: { name: string; q: QState; server: { monthly: number; yearly: number; oneOff: number; catchup: number } }[] = [
  {
    name: "full service — bookkeeping, payroll, VAT, tax return",
    q: state({
      sector: "consulting", txn: "21-60", head: 2, behind: "0", vatreg: "art10", size: "small",
      book: "full", tier: "book", review: "none", pay: "we", vat: "we", taxret: "we", assure: "none", regoff: "none",
    }),
    server: { monthly: 156, yearly: 381, oneOff: 95, catchup: 0 },
  },
  {
    name: "software plan + quarterly review, behind 6 months, audit and reg. office",
    q: state({
      sector: "shop", txn: "61-150", head: 0, behind: "6", vatreg: "art10", size: "small",
      book: "self", tier: "senior", review: "quarter", pay: "none", vat: "we", taxret: "we", assure: "we", regoff: "we",
    }),
    server: { monthly: 149, yearly: 1928, oneOff: 155, catchup: 60 },
  },
  {
    name: "elevated risk, art. 12 VAT, big company audit",
    q: state({
      sector: "hospitality", txn: "151-400", head: 8, behind: "0", vatreg: "art12", size: "big",
      book: "full", tier: "book", review: "none", pay: "we", vat: "we", taxret: "we", assure: "we", regoff: "none",
    }),
    server: { monthly: 513, yearly: 2397, oneOff: 250, catchup: 0 },
  },
  {
    name: "nothing selected — no labour, so no MBR return and no onboarding",
    q: state({ sector: "shop", txn: "21-60", head: 0, vatreg: "none" }),
    server: { monthly: 0, yearly: 0, oneOff: 0, catchup: 0 },
  },
];

describe("homepage calculator ↔ portal backend parity", () => {
  it("submits the pack version the backend is currently serving", () => {
    // A stale pack version is rejected outright — lead kept, no quote issued.
    expect(A4_QUOTE_PACK_VERSION).toBe("mt-2026-08-02b");
  });

  for (const { name, q, server } of BASKETS) {
    it(`prices "${name}" exactly as the server does`, () => {
      const r = qCalc(q, NOW);
      expect(r.refer).toBe(false);
      if (r.refer) return;
      expect({
        monthly: r.moTot,
        yearly: r.yrTot,
        oneOff: r.oneTot,
        catchup: r.catchup,
      }).toEqual(server);
    });
  }

  it("sends the fields the server's evaluator reads, incl. the ones the wizard never asks", () => {
    const q = BASKETS[0].q;
    const sel = qSelections(q, true);
    // banks/cap/annret are not wizard questions; omitting them would make the
    // server price a different basket (no MBR return, a different registry fee).
    expect(sel.banks).toBe(1);
    expect(sel.cap).toBe("1500");
    expect(sel.annret).toBe("we");
    expect(sel).toMatchObject({
      sector: "consulting", txn: "21-60", book: "full", pay: "we", vat: "we",
      taxret: "we", vatreg: "art10", size: "small", head: 2, behind: "0",
    });
    // No MBR annual return when nothing was actually quoted.
    expect(qSelections(q, false).annret).toBe("none");
  });

  it("emits undiscounted line items with a cadence on each", () => {
    const r = qCalc(BASKETS[0].q, NOW);
    const lines = qLines(r);
    expect(lines.length).toBeGreaterThan(0);
    for (const l of lines) {
      expect(["monthly", "yearly", "oneoff"]).toContain(l.cadence);
      expect(l.amount).toBeGreaterThan(0);
    }
    // The lines are STANDARD fees, so they deliberately exceed the discounted
    // headline — the backend shows the workings and the discount separately.
    const monthlyLines = lines.filter((l) => l.cadence === "monthly").reduce((s, l) => s + l.amount, 0);
    expect(monthlyLines).toBeGreaterThan(r.moTot);
  });

  it("applies the launch discount to monthly and yearly, never to one-offs", () => {
    const r = qCalc(BASKETS[0].q, NOW);
    expect(r.promoApplied).toBe(true);
    expect(r.moTot).toBeLessThan(r.grossMo);
    // One-off onboarding is charged in full.
    expect(r.oneTot).toBe(95);
  });

  it("stops discounting once the promo window closes", () => {
    const after = qCalc(BASKETS[0].q, new Date("2026-09-01T12:00:00Z"));
    expect(after.promoApplied).toBe(false);
    expect(after.moTot).toBe(after.grossMo);
  });

  it("a referral sector yields no price at all — that path books a call", () => {
    const r = qCalc(state({ sector: "other" }), NOW);
    expect(r.refer).toBe(true);
    expect(r.moTot).toBe(0);
  });
});
