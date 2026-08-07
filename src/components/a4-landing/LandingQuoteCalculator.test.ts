/**
 * The canonical homepage-calculator path, pinned.
 *
 * Shop/trade · 20–60 transactions · 2 on payroll · records up to date ·
 * VAT registered · default services. Every question added to this wizard must
 * default so that THIS quote does not move — a new question that changes the
 * price for a visitor who never touched it is a silent repricing.
 *
 * The two questions added for audit task 3 (bank accounts, authorised share
 * capital) are covered both at their defaults and off them, so the pack's
 * registry-fee table and extra-bank rate can never be replaced by a literal.
 */

import { describe, it, expect } from "vitest";
import { qCalc, qItems, qRisk, Q_INIT, type QState } from "./LandingQuoteCalculator";
import { CAPITAL_BANDS, MBR_ANNUAL_RETURN, EXTRA_BANK_MONTHLY, LAUNCH_PROMO } from "@/data/a4QuotePack";
import { evaluateA4Items } from "@/lib/websiteQuotation";

/** Where the wizard lands after "Software + accountants" and six Next clicks. */
const CANONICAL: QState = { ...Q_INIT, step: 7, book: "full", pay: "we", assure: "we" };

/** Fixed clocks — the launch promo expires by data, so tests must pin the day
 *  or every total below silently changes on 1 September 2026. */
const PROMO_ON = new Date("2026-08-07T00:00:00.000Z");
const PROMO_OFF = new Date("2026-09-01T12:00:00.000Z");

const line = (r: ReturnType<typeof qCalc>, n: string) =>
  [...r.mo, ...r.yr, ...r.one].find((l) => l.n === n);

describe("the canonical quote", () => {
  const r = qCalc(CANONICAL, PROMO_ON);

  it("bills the full list price once the promo ends", () => {
    const after = qCalc(CANONICAL, PROMO_OFF);
    if (after.refer) throw new Error("unpriceable");
    expect(after.promoApplied).toBe(false);
    expect([after.moTot, after.yrTot]).toEqual([163, 697]);
  });

  it("defaults to one bank account and the €1,500 capital band", () => {
    expect(Q_INIT.banks).toBe(1);
    expect(Q_INIT.cap).toBe("1500");
  });

  it("holds the pinned totals", () => {
    if (r.refer) throw new Error("the canonical path must be priceable");
    // List: bookkeeping 99 + payroll 2 × 32 = 163/mo; review engagement 547 +
    // MBR (our 50 + registry 100) = 697/yr; standard-risk onboarding 95.
    expect(r.grossMo).toBe(163);
    expect(r.grossYr).toBe(697);
    // As quoted, with the 25% launch discount and the registry fee exempt.
    expect(r.moTot).toBe(122);
    expect(r.yrTot).toBe(548);
    expect(r.oneTot).toBe(95);
  });

  it("adds nothing for the new questions at their defaults", () => {
    expect(line(r, "Additional bank accounts")).toBeUndefined();
    // Our fee plus the registry fee — the line bills both, as the engine does.
    expect(line(r, "MBR annual return fee")?.v)
      .toBe(MBR_ANNUAL_RETURN.ourFee + MBR_ANNUAL_RETURN.registryFeeByCapital["1500"]);
  });
});

describe("authorised share capital", () => {
  it("prices every band off the pack's registry table, never a literal", () => {
    for (const band of CAPITAL_BANDS) {
      const r = qCalc({ ...CANONICAL, cap: band.id }, PROMO_ON);
      if (r.refer) throw new Error("unpriceable");
      expect(line(r, "MBR annual return fee")?.v)
        .toBe(MBR_ANNUAL_RETURN.ourFee + MBR_ANNUAL_RETURN.registryFeeByCapital[band.id]);
    }
  });

  it("stops under-quoting companies above the smallest band", () => {
    const small = qCalc({ ...CANONICAL, cap: "1500" }, PROMO_ON);
    const large = qCalc({ ...CANONICAL, cap: "50000" }, PROMO_ON);
    if (small.refer || large.refer) throw new Error("unpriceable");
    expect(large.yrTot - small.yrTot).toBe(379 - 100);
  });
});

describe("bank accounts", () => {
  it("charges the full-service rate for each account beyond the first", () => {
    const r = qCalc({ ...CANONICAL, banks: 3 }, PROMO_ON);
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "Additional bank accounts")?.v).toBe(2 * EXTRA_BANK_MONTHLY.bookFull);
    // The line is a list price; the total carries the launch discount.
    expect(r.grossMo).toBe(163 + 2 * EXTRA_BANK_MONTHLY.bookFull);
  });

  it("charges the cheaper review rate when the client keeps the books", () => {
    const r = qCalc({ ...CANONICAL, book: "self", review: "month", banks: 3 }, PROMO_ON);
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "Additional bank accounts")?.v).toBe(2 * EXTRA_BANK_MONTHLY.selfWithReview);
  });

  it("charges nothing on software-only — there is no reconciliation on our side", () => {
    const r = qCalc({ ...CANONICAL, book: "self", review: "none", banks: 8 }, PROMO_ON);
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "Additional bank accounts")).toBeUndefined();
  });

  it("takes the sector risk uplift, like every other labour line", () => {
    const r = qCalc({ ...CANONICAL, sector: "hospitality", banks: 2 }, PROMO_ON);
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "Additional bank accounts")?.v).toBe(Math.round(EXTRA_BANK_MONTHLY.bookFull * 1.2));
  });
});

/* -------------------------------------------------------------------------- */
/* The submitted basket (FIXES-2 task 4)                                       */
/* -------------------------------------------------------------------------- */

describe("the basket we submit", () => {
  it("carries the canonical quote as priceable items", () => {
    expect(qItems(CANONICAL)).toEqual([
      { service: "bookkeeping-full", txn: "21-60" },
      { service: "payroll", heads: 2 },
      { service: "audit", txn: "21-60", review: true },
      { service: "mbr", capital: "1500" },
      { service: "onboarding" },
    ]);
  });

  it("never submits a sector we refuse to price on the spot", () => {
    expect(qItems({ ...CANONICAL, sector: "other" })).toEqual([]);
  });

  it("maps the sector answer to the backend's risk tier", () => {
    expect(qRisk(CANONICAL)).toBe("standard");
    expect(qRisk({ ...CANONICAL, sector: "hospitality" })).toBe("elevated");
    expect(qRisk({ ...CANONICAL, sector: "regulated" })).toBe("high");
    // `refer` is not an A4Risk; those baskets are empty and never submitted.
    expect(qRisk({ ...CANONICAL, sector: "other" })).toBe("standard");
  });

  it("submits software only — no MBR or onboarding without labour", () => {
    const q: QState = { ...CANONICAL, book: "self", tier: "senior", review: "none", pay: "none", assure: "none" };
    expect(qItems(q)).toEqual([{ service: "software", tier: "senior" }]);
  });

  it("submits the review cadence the visitor picked", () => {
    const q: QState = { ...CANONICAL, book: "self", review: "month" };
    expect(qItems(q)).toContainEqual({ service: "review", txn: "21-60", cadence: "monthly" });
  });

  it("submits VAT only when the wizard actually quoted it", () => {
    expect(qItems({ ...CANONICAL, vat: "we" })).toContainEqual({ service: "vat", txn: "21-60", vatreg: "art10" });
    expect(qItems({ ...CANONICAL, vat: "we", vatreg: "art11" })).toContainEqual({ service: "vat", txn: "21-60", vatreg: "art11" });
    expect(qItems({ ...CANONICAL, vat: "we", vatreg: "unsure" })).toContainEqual({ service: "vat", txn: "21-60", vatreg: "art10" });
    // Blocked on screen → blocked in the basket.
    const blocked = qItems({ ...CANONICAL, book: "self", review: "none", vat: "we" });
    expect(blocked.some((i) => i.service === "vat")).toBe(false);
  });

  it("submits the catch-up on the same basis the wizard charged it", () => {
    expect(qItems({ ...CANONICAL, behind: "6" })).toContainEqual({ service: "catchup", months: 6, mode: "full" });
    expect(qItems({ ...CANONICAL, book: "self", review: "month", behind: "6" })).toContainEqual({ service: "catchup", months: 6, mode: "self" });
  });

  it("drops nothing but the one line the backend cannot price", () => {
    const everything: QState = { ...CANONICAL, banks: 3, behind: "6", vat: "we", taxret: "we", regoff: "we" };
    const shown = qCalc(everything);
    if (shown.refer) throw new Error("unpriceable");
    const shownNames = [...shown.mo, ...shown.yr, ...shown.one].map((l) => l.n);
    expect(shownNames).toContain("Additional bank accounts");
    // Every other displayed line has an item behind it.
    expect(evaluateA4Items(qItems(everything), qRisk(everything), PROMO_OFF).lines).toHaveLength(shownNames.length - 1);
  });
});

/**
 * The wizard prices with its own tables; the backend reprices the basket with
 * the shared engine. What is on screen and what we email MUST agree — the
 * visitor is quoted the number they were shown. These pin that.
 *
 * They used to diverge by €591 over year one (the wizard applied no launch
 * discount and its MBR line omitted MBR_ANNUAL_RETURN.ourFee). Both are fixed
 * in qCalc; if either regresses, these fail.
 */
describe("what we show equals what we quote", () => {
  const shown = qCalc(CANONICAL);
  const items = qItems(CANONICAL);

  it("agrees with the engine line-for-line before any discount", () => {
    const engine = evaluateA4Items(items, qRisk(CANONICAL), PROMO_OFF);
    if (shown.refer) throw new Error("unpriceable");
    expect(engine.grossMonthly).toBe(shown.grossMo); // 163
    expect(engine.grossYearly).toBe(shown.grossYr);  // 697 — includes our €50 MBR fee
    expect(engine.grossOneOff).toBe(shown.oneTot);   // 95
  });

  it("applies the launch discount on the engine's own terms", () => {
    const engine = evaluateA4Items(items, qRisk(CANONICAL), PROMO_ON);
    if (shown.refer) throw new Error("unpriceable");
    expect(engine.promoApplied).toBe(true);
    expect(LAUNCH_PROMO.pct).toBe(0.25);
    // The documented baseline: €163 list → €122/mo, €548/yr, €95 once.
    expect([engine.monthly, engine.yearly, engine.oneOff]).toEqual([122, 548, 95]);
    expect([shown.moTot, shown.yrTot, shown.oneTot]).toEqual([122, 548, 95]);
    const yearOne = (m: number, y: number, o: number) => m * 12 + y + o;
    expect(yearOne(shown.moTot, shown.yrTot, shown.oneTot))
      .toBe(yearOne(engine.monthly, engine.yearly, engine.oneOff));
  });

  it("still agrees once the basket grows — canonical path plus VAT filing", () => {
    const withVat: QState = { ...CANONICAL, vat: "we" };
    const s = qCalc(withVat);
    const engine = evaluateA4Items(qItems(withVat), qRisk(withVat), PROMO_ON);
    if (s.refer) throw new Error("unpriceable");
    expect([s.moTot, s.yrTot, s.oneTot]).toEqual([156, 548, 95]);
    expect([engine.monthly, engine.yearly, engine.oneOff]).toEqual([156, 548, 95]);
  });

  it("never discounts the government registry fee", () => {
    const top: QState = { ...CANONICAL, cap: "50000" };
    const s = qCalc(top);
    const engine = evaluateA4Items(qItems(top), qRisk(top), PROMO_ON);
    if (s.refer) throw new Error("unpriceable");
    expect(s.yrTot).toBe(engine.yearly);
    // The €379 registry slice survives the 25% intact on both sides.
    expect(engine.registryPassThrough).toBe(379);
  });
});

describe("VAT gating (task 7e — Vacei parity)", () => {
  it("blocks VAT returns when nobody has worked or reviewed the ledger", () => {
    const r = qCalc({ ...CANONICAL, book: "self", review: "none", vat: "we" }, PROMO_ON);
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "VAT returns")).toBeUndefined();
    expect(r.notes.some(([tone, t]) => tone === "warn" && t.includes("We only put our name to a return"))).toBe(true);
  });

  it("unlocks VAT returns once we keep the books", () => {
    const r = qCalc({ ...CANONICAL, book: "full", vat: "we" }, PROMO_ON);
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "VAT returns")?.v).toBe(45);
  });

  it("unlocks VAT returns once an accounting review is added", () => {
    const r = qCalc({ ...CANONICAL, book: "self", review: "quarter", vat: "we" }, PROMO_ON);
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "VAT returns")?.v).toBe(45);
  });
});
