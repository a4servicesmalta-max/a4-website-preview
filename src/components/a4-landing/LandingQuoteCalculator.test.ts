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
import { qCalc, qItems, qRisk, qIndependence, qAdvance, Q_INIT, type QState } from "./LandingQuoteCalculator";
import { CAPITAL_BANDS, MBR_ANNUAL_RETURN, LAUNCH_PROMO, catchUpLabel } from "@/data/a4QuotePack";
import { evaluateA4Items } from "@/lib/websiteQuotation";

/**
 * Where the wizard lands after eight Next clicks — and it is UNPRICEABLE: the
 * defaults ask A4 both to keep the books and to give assurance on them, which
 * independence forbids, so `qCalc` produces no figures at all. The visitor is
 * asked which of the two is ours; the two fixtures below are the two answers.
 */
const DEFAULT_PATH: QState = { ...Q_INIT, step: 8, book: "managed", pay: "we", assure: "we", startMonth: "2026-09" };

/** "Keep the bookkeeping with us" — the canonical priced basket. */
const CANONICAL: QState = { ...DEFAULT_PATH, assure: "none" };

/** "Take the audit or review with us" — pins the assurance side of the pack. */
const ASSURED: QState = { ...DEFAULT_PATH, book: "none", vat: "none" };

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
    // Bookkeeping 49 + payroll 2 × 32 = 113/mo; MBR (our 50 + registry 100)/yr.
    expect([after.moTot, after.yrTot]).toEqual([113, 150]);
    // The assurance side, priced on its own: payroll 64/mo, review 547 + MBR 150.
    const assured = qCalc(ASSURED, PROMO_OFF);
    if (assured.refer) throw new Error("unpriceable");
    expect([assured.moTot, assured.yrTot]).toEqual([64, 697]);
  });

  it("defaults to a company's books and the €1,500 capital band", () => {
    expect(Q_INIT.entity).toBe("company");
    expect(Q_INIT.cap).toBe("1500");
    expect(Q_INIT.book).toBe("managed");
  });

  it("holds the pinned totals", () => {
    if (r.refer) throw new Error("the canonical path must be priceable");
    // List: bookkeeping 49 (flat) + payroll 2 × 32 = 113/mo; MBR (our 50 +
    // registry 100) = 150/yr. Onboarding is UNPRICED.
    expect(r.grossMo).toBe(113);
    expect(r.grossYr).toBe(150);
    // As quoted, with the 25% launch discount and the registry fee exempt.
    expect(r.moTot).toBe(85); // 113 × 0.75 = 84.75 → 85
    expect(r.yrTot).toBe(138); // (150 − 100) × 0.75 = 37.5 → 38, + 100
    expect(r.oneTot).toBe(0); // nothing one-off: onboarding carries no number
  });

  it("holds the pinned totals on the assurance side too", () => {
    const a = qCalc(ASSURED, PROMO_ON);
    if (a.refer) throw new Error("the assurance path must be priceable");
    expect(a.grossMo).toBe(64);
    expect(a.grossYr).toBe(697); // review 547 + MBR 150
    expect(a.moTot).toBe(48); // 64 × 0.75
    expect(a.yrTot).toBe(548); // (697 − 100) × 0.75 = 447.75 → 448, + 100
    expect(line(a, "Review engagement (if applicable)")?.v).toBe(547);
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
      { service: "mbr", capital: "1500" },
      // Unpriced, but IN the basket — it is what makes the backend name
      // onboarding in `unpricedItems` and say so in the quotation.
      { service: "onboarding" },
    ]);
  });

  it("carries the review engagement when the assurance side is the one we keep", () => {
    expect(qItems(ASSURED)).toEqual([
      { service: "payroll", heads: 2 },
      { service: "audit", txn: "21-60", review: true },
      { service: "mbr", capital: "1500" },
      { service: "onboarding" },
    ]);
    // Big company at heavy volume is a FULL audit, and says so.
    expect(qItems({ ...ASSURED, size: "big", txn: "401-1000" }))
      .toContainEqual({ service: "audit", txn: "401-1000" });
  });

  it("names onboarding on the wire whenever it names it on screen", () => {
    const r = qCalc(CANONICAL, PROMO_OFF);
    if (r.refer) throw new Error("unpriceable");
    expect(r.notes.some(([, t]) => t.includes("Onboarding and opening balances"))).toBe(true);
    expect(evaluateA4Items(qItems(CANONICAL), qRisk(CANONICAL), PROMO_OFF).hasUnpricedOnboarding).toBe(true);
    // …and never when there is no labour to onboard for.
    const nothing: QState = { ...CANONICAL, book: "none", pay: "none", assure: "none", vat: "none", taxret: "none", regoff: "none" };
    expect(qItems(nothing).some((i) => i.service === "onboarding")).toBe(false);
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
      { service: "onboarding" },
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

  it("treats the review engagement as assurance, exactly as the server does", () => {
    // The default path is a small company, so `assure: "we"` is a REVIEW — and
    // a review is still an assurance engagement, so the books cannot also be
    // ours. This assertion used to expect "bookkeeping", which is how the
    // default homepage basket reached a server that refuses it.
    expect(qIndependence(DEFAULT_PATH).route).toBe("conflict");
  });

  it("puts NO figure on a conflict basket — not a line, not a total", () => {
    const r = qCalc(DEFAULT_PATH, PROMO_ON);
    expect(r.conflict).toBe(true);
    expect([...r.mo, ...r.yr, ...r.one]).toEqual([]);
    expect([r.moTot, r.yrTot, r.oneTot, r.grossMo, r.grossYr]).toEqual([0, 0, 0, 0, 0]);
    expect(r.promoApplied).toBe(false);
    // Nothing to submit either, so `canSend` (which needs items) stays false.
    expect(qItems(DEFAULT_PATH)).toEqual([]);
  });

  /**
   * The DEFAULT homepage journey, driven exactly as a visitor who answers
   * nothing does: `Q_INIT` ships small/21-60/managed, and `next()` turns the
   * assurance question on at step 6 when it is left alone. That path must be
   * caught client-side, or the visitor is priced a basket the server refuses.
   */
  it("catches the conflict on the untouched default path", () => {
    // Eight Next clicks from Q_INIT, touching nothing — the wizard's own
    // transition function, not a restatement of it.
    let atQuote: QState = { ...Q_INIT };
    expect(atQuote.book).toBe("managed");
    expect(atQuote.assure).toBe("none");
    for (let i = 0; i < 8; i++) atQuote = { ...atQuote, ...qAdvance(atQuote, 8) };
    expect(atQuote.step).toBe(8);
    // Nobody chose this: `next()` switches the assurance question on at step 6.
    expect(atQuote.assure).toBe("we");
    expect(atQuote.book).toBe("managed");
    expect(qIndependence(atQuote).route).toBe("conflict");
    expect(qIndependence(atQuote).auditEligible).toBe(false);
    expect(qIndependence(atQuote).bookkeepingEligible).toBe(false);
    // Nothing is priced and nothing is submittable on that path.
    const shown = qCalc(atQuote, PROMO_ON);
    expect(shown.conflict).toBe(true);
    expect([...shown.mo, ...shown.yr, ...shown.one]).toEqual([]);
    expect([shown.moTot, shown.yrTot, shown.oneTot]).toEqual([0, 0, 0]);
    expect(qItems(atQuote)).toEqual([]);

    // Either button clears it AND prices immediately — the visitor is never
    // denied a price, only asked one question first.
    const keptBooks = { ...atQuote, assure: "none" };
    expect(qIndependence(keptBooks).route).toBe("bookkeeping");
    const kb = qCalc(keptBooks, PROMO_ON);
    expect(kb.conflict).toBe(false);
    expect(kb.moTot).toBeGreaterThan(0);
    expect(qItems(keptBooks).length).toBeGreaterThan(0);
    expect(evaluateA4Items(qItems(keptBooks), qRisk(keptBooks)).independenceConflict).toBe(false);

    const tookAssurance = { ...atQuote, book: "none", vat: "none" };
    expect(qIndependence(tookAssurance).route).toBe("audit");
    const ta = qCalc(tookAssurance, PROMO_ON);
    expect(ta.conflict).toBe(false);
    // …and at that size and volume it prices as a REVIEW, not a full audit.
    expect(ta.yr.some((l) => l.n === "Review engagement (if applicable)")).toBe(true);
    expect(evaluateA4Items(qItems(tookAssurance), qRisk(tookAssurance)).independenceConflict).toBe(false);
  });

  it("flags the conflict when a full audit is asked for alongside the books", () => {
    // size "big" + heavy volume makes it a full audit, not a review.
    const q: QState = { ...CANONICAL, size: "big", txn: "401-1000", assure: "we" };
    const f = qIndependence(q);
    expect(f.route).toBe("conflict");
    expect(f.auditEligible).toBe(false);
    expect(f.bookkeepingEligible).toBe(false);
    // Full audit or review, the same silence: no figures either way.
    expect(qCalc(q, PROMO_ON).conflict).toBe(true);
    expect(qItems(q)).toEqual([]);
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
    expect(engine.grossYearly).toBe(shown.grossYr);  // 150 — includes our €50 MBR fee
    expect(engine.grossOneOff).toBe(shown.oneTot);   // 0
  });

  it("applies the launch discount on the engine's own terms", () => {
    const engine = evaluateA4Items(items, qRisk(CANONICAL), PROMO_ON);
    if (shown.refer) throw new Error("unpriceable");
    expect(engine.promoApplied).toBe(true);
    expect(LAUNCH_PROMO.pct).toBe(0.25);
    expect([engine.monthly, engine.yearly, engine.oneOff]).toEqual([85, 138, 0]);
    expect([shown.moTot, shown.yrTot, shown.oneTot]).toEqual([85, 138, 0]);
    const yearOne = (m: number, y: number, o: number) => m * 12 + y + o;
    expect(yearOne(shown.moTot, shown.yrTot, shown.oneTot))
      .toBe(yearOne(engine.monthly, engine.yearly, engine.oneOff));
  });

  it("agrees with the engine on the assurance side as well", () => {
    const s = qCalc(ASSURED, PROMO_ON);
    const engine = evaluateA4Items(qItems(ASSURED), qRisk(ASSURED), PROMO_ON);
    if (s.refer) throw new Error("unpriceable");
    expect([s.moTot, s.yrTot, s.oneTot]).toEqual([engine.monthly, engine.yearly, engine.oneOff]);
    expect([engine.monthly, engine.yearly]).toEqual([48, 548]);
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
