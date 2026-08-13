/**
 * The canonical homepage-calculator path, pinned.
 *
 * Shop/trade · company books · 20–60 transactions · 2 on payroll · up to date ·
 * VAT registered · default services. Every question added to this wizard must
 * default so that THIS quote does not move — a new question that changes the
 * price for a visitor who never touched it is a silent repricing.
 *
 * Pack mt-2026-08-14-managed retired the software-only route, the volume-banded
 * bookkeeping table, the per-bank-account charge and the priced onboarding fee.
 * The assertions below are the managed offer's numbers, hand-computed.
 */

import { describe, it, expect } from "vitest";
import { qCalc, qItems, qRisk, qIndependence, Q_INIT, type QState } from "./LandingQuoteCalculator";
import { CAPITAL_BANDS, MBR_ANNUAL_RETURN, LAUNCH_PROMO, catchUpLabel } from "@/data/a4QuotePack";
import { evaluateA4Items } from "@/lib/websiteQuotation";

/** Where the wizard lands after eight Next clicks. */
const CANONICAL: QState = { ...Q_INIT, step: 8, book: "managed", pay: "we", assure: "we", startMonth: "2026-09" };

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
    expect([after.moTot, after.yrTot]).toEqual([113, 697]);
  });

  it("defaults to a company's books and the €1,500 capital band", () => {
    expect(Q_INIT.entity).toBe("company");
    expect(Q_INIT.cap).toBe("1500");
    expect(Q_INIT.book).toBe("managed");
  });

  it("holds the pinned totals", () => {
    if (r.refer) throw new Error("the canonical path must be priceable");
    // List: bookkeeping 49 (flat) + payroll 2 × 32 = 113/mo; review engagement
    // 547 + MBR (our 50 + registry 100) = 697/yr. Onboarding is UNPRICED.
    expect(r.grossMo).toBe(113);
    expect(r.grossYr).toBe(697);
    // As quoted, with the 25% launch discount and the registry fee exempt.
    expect(r.moTot).toBe(85); // 113 × 0.75 = 84.75 → 85
    expect(r.yrTot).toBe(548); // (697 − 100) × 0.75 = 447.75 → 448, + 100
    expect(r.oneTot).toBe(0); // nothing one-off: onboarding carries no number
  });

  it("does not put a number on onboarding, but does say it exists", () => {
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "Onboarding and due diligence")).toBeUndefined();
    expect(r.notes.some(([, t]) => t.includes("Onboarding and opening balances"))).toBe(true);
  });

  it("no longer charges for extra bank accounts at all", () => {
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "Additional bank accounts")).toBeUndefined();
    // Our fee plus the registry fee — the line bills both, as the engine does.
    expect(line(r, "MBR annual return fee")?.v)
      .toBe(MBR_ANNUAL_RETURN.ourFee + MBR_ANNUAL_RETURN.registryFeeByCapital["1500"]);
  });

  it("does not move the bookkeeping price with transaction volume", () => {
    for (const txn of ["1-20", "21-60", "61-150", "1000+"]) {
      const q = qCalc({ ...CANONICAL, txn }, PROMO_OFF);
      if (q.refer) throw new Error("unpriceable");
      expect(line(q, "Bookkeeping")?.v).toBe(49);
    }
  });

  it("charges the self-employed rate when the books are not a company's", () => {
    const q = qCalc({ ...CANONICAL, entity: "sole" }, PROMO_OFF);
    if (q.refer) throw new Error("unpriceable");
    expect(line(q, "Bookkeeping")?.v).toBe(24);
  });

  it("keeps the bookkeeping price flat across every risk sector", () => {
    for (const sector of ["shop", "hospitality", "regulated"]) {
      const q = qCalc({ ...CANONICAL, sector }, PROMO_OFF);
      if (q.refer) throw new Error("unpriceable");
      expect(line(q, "Bookkeeping")?.v).toBe(49);
    }
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

describe("catch-up", () => {
  it("charges the same monthly rate per earlier month, uncapped", () => {
    const r = qCalc({ ...CANONICAL, behind: "24" }, PROMO_OFF);
    if (r.refer) throw new Error("unpriceable");
    expect(r.oneTot).toBe(24 * 49); // 1,176 — the retired cap would have said 480
    expect(r.oneTot).not.toBe(480);
  });

  it("uses the exact contracted label", () => {
    const r = qCalc({ ...CANONICAL, behind: "12" }, PROMO_OFF);
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "Catch-up: 12 months x EUR 49 = EUR 588")?.v).toBe(588);
    expect(line(r, catchUpLabel(12, "company"))?.v).toBe(588);
  });

  it("follows the entity, like the monthly price does", () => {
    const r = qCalc({ ...CANONICAL, entity: "sole", behind: "12" }, PROMO_OFF);
    if (r.refer) throw new Error("unpriceable");
    expect(r.oneTot).toBe(12 * 24);
  });

  it("is never discounted by the launch promo", () => {
    const on = qCalc({ ...CANONICAL, behind: "12" }, PROMO_ON);
    const off = qCalc({ ...CANONICAL, behind: "12" }, PROMO_OFF);
    if (on.refer || off.refer) throw new Error("unpriceable");
    expect(on.oneTot).toBe(off.oneTot);
  });

  it("charges nothing when bookkeeping is switched off", () => {
    const r = qCalc({ ...CANONICAL, book: "none", behind: "12" }, PROMO_OFF);
    if (r.refer) throw new Error("unpriceable");
    expect(r.oneTot).toBe(0);
  });
});

/* -------------------------------------------------------------------------- */
/* The submitted basket                                                        */
/* -------------------------------------------------------------------------- */

describe("the basket we submit", () => {
  it("carries the canonical quote as priceable items", () => {
    expect(qItems(CANONICAL)).toEqual([
      { service: "bookkeeping-managed", entity: "company" },
      { service: "payroll", heads: 2 },
      { service: "audit", txn: "21-60", review: true },
      { service: "mbr", capital: "1500" },
    ]);
  });

  it("never submits a retired software or banded-bookkeeping item", () => {
    const services = qItems({ ...CANONICAL, behind: "6" }).map((i) => i.service);
    expect(services).not.toContain("software");
    expect(services).not.toContain("bookkeeping-full");
    expect(services).not.toContain("review");
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

  it("submits bookkeeping alone when nothing else is switched on", () => {
    const q: QState = { ...CANONICAL, pay: "none", assure: "none", vat: "none", taxret: "none", regoff: "none" };
    expect(qItems(q)).toEqual([
      { service: "bookkeeping-managed", entity: "company" },
      { service: "mbr", capital: "1500" },
    ]);
  });

  it("submits VAT only when the wizard actually quoted it", () => {
    expect(qItems({ ...CANONICAL, vat: "we" })).toContainEqual({ service: "vat", txn: "21-60", vatreg: "art10" });
    expect(qItems({ ...CANONICAL, vat: "we", vatreg: "art11" })).toContainEqual({ service: "vat", txn: "21-60", vatreg: "art11" });
    expect(qItems({ ...CANONICAL, vat: "we", vatreg: "unsure" })).toContainEqual({ service: "vat", txn: "21-60", vatreg: "art10" });
    // Blocked on screen (nobody worked the ledger) → blocked in the basket.
    const blocked = qItems({ ...CANONICAL, book: "none", vat: "we" });
    expect(blocked.some((i) => i.service === "vat")).toBe(false);
  });

  it("submits the catch-up with the entity that priced it", () => {
    expect(qItems({ ...CANONICAL, behind: "6" }))
      .toContainEqual({ service: "catchup", months: 6, entity: "company" });
    expect(qItems({ ...CANONICAL, entity: "sole", behind: "6" }))
      .toContainEqual({ service: "catchup", months: 6, entity: "sole" });
  });

  it("drops nothing at all — every displayed line has an item behind it", () => {
    const everything: QState = { ...CANONICAL, behind: "6", vat: "we", taxret: "we", regoff: "we" };
    const shown = qCalc(everything);
    if (shown.refer) throw new Error("unpriceable");
    const shownNames = [...shown.mo, ...shown.yr, ...shown.one].map((l) => l.n);
    expect(shownNames).not.toContain("Additional bank accounts");
    expect(evaluateA4Items(qItems(everything), qRisk(everything), PROMO_OFF).lines)
      .toHaveLength(shownNames.length);
  });
});

describe("IESBA independence", () => {
  it("rules A4 out as auditor once bookkeeping is switched on", () => {
    const f = qIndependence({ ...CANONICAL, assure: "none" });
    expect(f.auditEligible).toBe(false);
    expect(f.route).toBe("bookkeeping");
  });

  it("does not treat the review engagement as an audit", () => {
    // The canonical path is a small company, so `assure: "we"` is a REVIEW.
    expect(qIndependence(CANONICAL).route).toBe("bookkeeping");
  });

  it("flags the conflict when a full audit is asked for alongside the books", () => {
    // size "big" + heavy volume makes it a full audit, not a review.
    const f = qIndependence({ ...CANONICAL, size: "big", txn: "401-1000", assure: "we" });
    expect(f.route).toBe("conflict");
    expect(f.auditEligible).toBe(false);
    expect(f.bookkeepingEligible).toBe(false);
  });

  it("rules A4 out of the books for an audit-only enquiry", () => {
    const f = qIndependence({ ...CANONICAL, book: "none", size: "big", txn: "401-1000", assure: "we" });
    expect(f.route).toBe("audit");
    expect(f.bookkeepingEligible).toBe(false);
    expect(f.auditEligible).toBe(true);
  });
});

/**
 * The wizard prices with its own tables; the backend reprices the basket with
 * the shared engine. What is on screen and what we email MUST agree — the
 * visitor is quoted the number they were shown. These pin that.
 */
describe("what we show equals what we quote", () => {
  const shown = qCalc(CANONICAL);
  const items = qItems(CANONICAL);

  it("agrees with the engine line-for-line before any discount", () => {
    const engine = evaluateA4Items(items, qRisk(CANONICAL), PROMO_OFF);
    if (shown.refer) throw new Error("unpriceable");
    expect(engine.grossMonthly).toBe(shown.grossMo); // 113
    expect(engine.grossYearly).toBe(shown.grossYr);  // 697 — includes our €50 MBR fee
    expect(engine.grossOneOff).toBe(shown.oneTot);   // 0
  });

  it("applies the launch discount on the engine's own terms", () => {
    const engine = evaluateA4Items(items, qRisk(CANONICAL), PROMO_ON);
    if (shown.refer) throw new Error("unpriceable");
    expect(engine.promoApplied).toBe(true);
    expect(LAUNCH_PROMO.pct).toBe(0.25);
    expect([engine.monthly, engine.yearly, engine.oneOff]).toEqual([85, 548, 0]);
    expect([shown.moTot, shown.yrTot, shown.oneTot]).toEqual([85, 548, 0]);
    const yearOne = (m: number, y: number, o: number) => m * 12 + y + o;
    expect(yearOne(shown.moTot, shown.yrTot, shown.oneTot))
      .toBe(yearOne(engine.monthly, engine.yearly, engine.oneOff));
  });

  it("still agrees once the basket grows — canonical path plus VAT and catch-up", () => {
    const bigger: QState = { ...CANONICAL, vat: "we", behind: "12" };
    const s = qCalc(bigger);
    const engine = evaluateA4Items(qItems(bigger), qRisk(bigger), PROMO_ON);
    if (s.refer) throw new Error("unpriceable");
    expect([s.moTot, s.yrTot, s.oneTot]).toEqual([engine.monthly, engine.yearly, engine.oneOff]);
    expect(s.oneTot).toBe(588);
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

describe("VAT gating (Vacei parity)", () => {
  it("blocks VAT returns when we have not worked the ledger", () => {
    const r = qCalc({ ...CANONICAL, book: "none", vat: "we" }, PROMO_ON);
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "VAT returns")).toBeUndefined();
    expect(r.notes.some(([tone, t]) => tone === "warn" && t.includes("We only put our name to a return"))).toBe(true);
  });

  it("unlocks VAT returns once we keep the books", () => {
    const r = qCalc({ ...CANONICAL, book: "managed", vat: "we" }, PROMO_ON);
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "VAT returns")?.v).toBe(45);
  });
});
