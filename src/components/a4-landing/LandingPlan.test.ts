/**
 * The "Build your plan" page's pricing, pinned.
 *
 * This component had no test at all, which is how four separate defects
 * survived the merge in it: the forbidden entry-band fallback (M8), the missing
 * launch promo (M9), the unpriceable bookkeeping+audit basket (M3) and the
 * pre-answered expenses band (B1). Its arithmetic is a pure function now,
 * exactly like the homepage wizard's `qCalc`, so all four are assertable.
 */
import { describe, it, expect } from "vitest";
import { lpCalc, LP_INIT, LP_ANNUAL_ITEMS, type LPState } from "./LandingPlan";
import { BOOKKEEPING_MANAGED_MONTHLY, LAUNCH_PROMO, VAT_MONTHLY, fullMonthlyBookkeeping } from "@/data/a4QuotePack";

// mt-2026-08-26d-banks: this page asks neither volume nor account count, so
// it quotes the low-volume ONE-account figure — and that account is priced,
// so the company 10–25k figure is 69 + round(40 + 0.15 × 69) = 69 + 50 = 119.
const CO_10_25K = fullMonthlyBookkeeping("company", "10-25k", "1-20", 1)!; // 119

/** The promo expires by DATA, so every total here must pin its clock. */
const PROMO_ON = new Date("2026-08-07T00:00:00.000Z");
const PROMO_OFF = new Date("2026-09-01T12:00:00.000Z");

/** A fully answered company basket — bookkeeping only, VAT on, entry band. */
const ANSWERED: LPState = { ...LP_INIT, expenses: "10-25k", startMonth: "2026-09" };

describe("B1 — the band is not pre-answered", () => {
  it("ships empty, on both price drivers", () => {
    expect(LP_INIT.expenses).toBe("");
    expect(LP_INIT.startMonth).toBe("");
  });

  it("prices nothing at all until the band is picked", () => {
    const r = lpCalc(LP_INIT, PROMO_ON);
    expect(r.priced).toBe(false);
    expect(r.reason).toBe("no-expenses");
    expect(r.monthly).toBeNull();
    expect(r.lines).toEqual([]);
  });

  it("prices instantly once it is", () => {
    const r = lpCalc(ANSWERED, PROMO_OFF);
    expect(r.priced).toBe(true);
    expect(r.base).toBe(CO_10_25K); // 119 = 69 + one bank account 50
    expect(r.base).toBe(119);
  });
});

describe("M8 — the forbidden entry-band fallback is gone", () => {
  it("never falls back to the entry band on an unknown band", () => {
    // `managedMonthly(...) ?? plan.price` defaulted DOWN to the entry band —
    // the one thing the pack docblock says callers must never do. Unreachable
    // through the pill UI, one constant desync from a silent under-quote.
    const r = lpCalc({ ...ANSWERED, expenses: "500K+" as LPState["expenses"] }, PROMO_OFF);
    expect(r.priced).toBe(false);
    expect(r.base).toBeNull();
    expect(r.base).not.toBe(BOOKKEEPING_MANAGED_MONTHLY.company["0-10k"]); // 49
    expect(r.base).not.toBe(96); // nor the all-in entry figure
  });

  it("moves with the band, for both entities", () => {
    for (const [entity, packEntity] of [["company", "company"], ["personal", "sole"]] as const) {
      for (const band of ["0-10k", "100-200k", "500k+"] as const) {
        const r = lpCalc({ ...ANSWERED, entity, expenses: band }, PROMO_OFF);
        expect(`${entity}/${band}=${r.base}`).toBe(`${entity}/${band}=${fullMonthlyBookkeeping(packEntity, band, "1-20", 1)}`);
      }
    }
  });
});

describe("M9 — the launch promo applies here too", () => {
  it("discounts the monthly while the promo runs", () => {
    const on = lpCalc(ANSWERED, PROMO_ON);
    const off = lpCalc(ANSWERED, PROMO_OFF);
    expect(on.promoApplied).toBe(true);
    expect(off.promoApplied).toBe(false);
    // 119 bookkeeping (69 + one account) + 45 VAT (the "mid" 21-60 band) = 164 gross.
    expect(off.grossMonthly).toBe(CO_10_25K + VAT_MONTHLY["21-60"]);
    expect(on.grossMonthly).toBe(off.grossMonthly);
    expect(on.monthly).toBe(Math.round(off.grossMonthly! * (1 - LAUNCH_PROMO.pct)));
    // The booking email used to quote full price while the same visitor had
    // seen 25% off two pages earlier — "the same journey, two different prices".
    expect(on.monthly).toBeLessThan(off.monthly!);
  });

  it("discounts the catch-up at its own line inside the promo window (finding C3)", () => {
    const on = lpCalc({ ...ANSWERED, catchUpMonths: 12 }, PROMO_ON);
    const off = lpCalc({ ...ANSWERED, catchUpMonths: 12 }, PROMO_OFF);
    expect(off.catchUp).toBe(12 * 119);
    expect(on.catchUp).toBe(Math.round(12 * 119 * 0.75));
    expect(on.catchUpLabel).toContain("less 25% launch promo = EUR 1071");
  });
});

describe("M3 — this page cannot sell an audit alongside the books", () => {
  it("offers no audit item, for either entity", () => {
    // Bookkeeping is not optional on this page — every basket contains it, so
    // A4 can never be the auditor of anyone who buys from here. An audit toggle
    // was therefore an offer we are barred from honouring, and it summed the
    // audit fee into the displayed total with no independence path at all.
    for (const entity of ["company", "personal"] as const) {
      // Cast, because `AnnualItemId` no longer HAS an "audit" member — the
      // type itself is now the primary guard and this is the runtime backstop.
      expect(LP_ANNUAL_ITEMS[entity].some((i) => (i.id as string) === "audit")).toBe(false);
    }
  });

  it("keeps the annual items that do not conflict", () => {
    expect(LP_ANNUAL_ITEMS.company.map((i) => i.id)).toEqual(["accounts", "tax"]);
    expect(LP_ANNUAL_ITEMS.personal.map((i) => i.id)).toEqual(["tax"]);
  });

  it("still carries the bookkeeping independence conclusion on the lead", () => {
    const r = lpCalc(ANSWERED, PROMO_ON);
    expect(r.independence.route).toBe("bookkeeping");
    expect(r.independence.auditEligible).toBe(false);
  });
});
