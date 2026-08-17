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
 * Where the wizard lands after eight Next clicks — and it is UNPRICEABLE, now
 * for TWO independent reasons:
 *
 *  1. the defaults ask A4 both to keep the books and to give assurance on
 *     them, which independence forbids; and
 *  2. `Q_INIT` no longer pre-answers the monthly-spend band, so there is no
 *     rate to price the books at even if (1) were resolved (B1).
 *
 * This fixture deliberately inherits BOTH gaps from `Q_INIT` rather than
 * papering over them, so a regression that reinstates either default fails
 * here first. The priced fixtures below each state their own answers.
 */
const DEFAULT_PATH: QState = { ...Q_INIT, step: 9, book: "managed", pay: "we", assure: "we" };

/**
 * "Keep the bookkeeping with us" — the canonical priced basket.
 *
 * The band and the start month are stated EXPLICITLY here, because that is what
 * a real visitor has to do: they are answers, not defaults. Every pinned figure
 * below is the €10–25k company band, exactly as before.
 */
const CANONICAL: QState = { ...DEFAULT_PATH, assure: "none", expenses: "10-25k", startMonth: "2026-09" };

/**
 * "Take the audit or review with us" — pins the assurance side of the pack.
 * Carries NO expenses band on purpose: the band prices bookkeeping only, so an
 * audit-only visitor must never be held on a question that prices nothing for
 * them.
 */
const ASSURED: QState = { ...DEFAULT_PATH, book: "none", vat: "none", startMonth: "2026-09" };

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
    // Bookkeeping 69 (company at the €10–25k default band) + payroll 2 × 32
    // = 133/mo; MBR (our 50 + registry 100)/yr.
    expect([after.moTot, after.yrTot]).toEqual([133, 150]);
    // The assurance side, priced on its own: payroll 64/mo, review 547 + MBR 150.
    const assured = qCalc(ASSURED, PROMO_OFF);
    if (assured.refer) throw new Error("unpriceable");
    expect([assured.moTot, assured.yrTot]).toEqual([64, 697]);
  });

  it("defaults to a company's books and the €1,500 capital band", () => {
    expect(Q_INIT.entity).toBe("company");
    expect(Q_INIT.cap).toBe("1500");
    expect(Q_INIT.book).toBe("managed");
    // …but NEVER the price drivers themselves. See the B1 block at the foot of
    // this file: entity and capital shape the quote, the spend band and the
    // start month ARE the quote, and those two are the visitor's to give.
    expect(Q_INIT.expenses).toBe("");
    expect(Q_INIT.startMonth).toBe("");
  });

  it("holds the pinned totals", () => {
    if (r.refer) throw new Error("the canonical path must be priceable");
    // List: bookkeeping 69 (company, €10–25k band) + payroll 2 × 32 = 133/mo;
    // MBR (our 50 + registry 100) = 150/yr. Onboarding is UNPRICED.
    expect(r.grossMo).toBe(133);
    expect(r.grossYr).toBe(150);
    // As quoted, with the 25% launch discount and the registry fee exempt.
    expect(r.moTot).toBe(100); // 133 × 0.75 = 99.75 → 100
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
    // Transactions price VAT/tax/audit. Only the expenses band moves the books.
    for (const txn of ["1-20", "21-60", "61-150", "1000+"]) {
      const q = qCalc({ ...CANONICAL, txn }, PROMO_OFF);
      if (q.refer) throw new Error("unpriceable");
      expect(line(q, "Bookkeeping")?.v).toBe(69);
    }
  });

  it("charges the self-employed rate when the books are not a company's", () => {
    const q = qCalc({ ...CANONICAL, entity: "sole" }, PROMO_OFF);
    if (q.refer) throw new Error("unpriceable");
    expect(line(q, "Bookkeeping")?.v).toBe(39); // sole at the €10–25k band
  });

  it("moves the bookkeeping price with the expenses band, for both entities", () => {
    // The whole point of mt-2026-08-14-volume: nine bands, both entities, every
    // one priced on the homepage without a call.
    const expected: Record<string, [number, number]> = {
      // band: [sole, company]
      "0-10k": [24, 49],
      "10-25k": [39, 69],
      "25-50k": [59, 99],
      "50-100k": [89, 149],
      "100-200k": [129, 219],
      "200-300k": [179, 299],
      "300-400k": [229, 379],
      // mt-2026-08-17-corrections (finding C1): company 449 -> 459.
      "400-500k": [279, 459],
      "500k+": [339, 549],
    };
    for (const [band, [sole, company]] of Object.entries(expected)) {
      for (const [entity, want] of [["sole", sole], ["company", company]] as const) {
        const q = qCalc({ ...CANONICAL, entity, expenses: band as QState["expenses"] }, PROMO_OFF);
        if (q.refer) throw new Error("unpriceable");
        expect(`${entity}/${band}=${line(q, "Bookkeeping")?.v}`).toBe(`${entity}/${band}=${want}`);
      }
    }
  });

  it("puts the chosen band on the wire, so the backend reprices the same figure", () => {
    const q: QState = { ...CANONICAL, entity: "sole", expenses: "300-400k" };
    expect(qItems(q)).toContainEqual({
      service: "bookkeeping-managed",
      entity: "sole",
      expenses: "300-400k",
    });
    const shown = qCalc(q, PROMO_OFF);
    if (shown.refer) throw new Error("unpriceable");
    expect(line(shown, "Bookkeeping")?.v).toBe(229);
  });

  it("never lets the sector risk multiplier touch the bookkeeping price", () => {
    for (const sector of ["shop", "hospitality", "regulated"]) {
      const q = qCalc({ ...CANONICAL, sector }, PROMO_OFF);
      if (q.refer) throw new Error("unpriceable");
      expect(line(q, "Bookkeeping")?.v).toBe(69);
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
    expect(r.oneTot).toBe(24 * 69); // 1,656 — the retired cap would have said 480
    expect(r.oneTot).not.toBe(480);
  });

  it("uses the exact contracted label", () => {
    const r = qCalc({ ...CANONICAL, behind: "12" }, PROMO_OFF);
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "Catch-up: 12 months x EUR 69 = EUR 828")?.v).toBe(828);
    // Non-null: "10-25k" is a real band, so the pack always has a label for it.
    expect(line(r, catchUpLabel(12, "company", "10-25k")!)?.v).toBe(828);
  });

  it("follows the entity, like the monthly price does", () => {
    const r = qCalc({ ...CANONICAL, entity: "sole", behind: "12" }, PROMO_OFF);
    if (r.refer) throw new Error("unpriceable");
    expect(r.oneTot).toBe(12 * 39); // sole at the €10–25k band
  });

  it("is discounted at its own line inside the promo window (finding C3)", () => {
    const on = qCalc({ ...CANONICAL, behind: "12" }, PROMO_ON);
    const off = qCalc({ ...CANONICAL, behind: "12" }, PROMO_OFF);
    if (on.refer || off.refer) throw new Error("unpriceable");
    expect(on.oneTot).toBe(Math.round(off.oneTot * 0.75));
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
      { service: "bookkeeping-managed", entity: "company", expenses: "10-25k" },
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
      { service: "bookkeeping-managed", entity: "company", expenses: "10-25k" },
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
      .toContainEqual({ service: "catchup", months: 6, entity: "company", expenses: "10-25k" });
    expect(qItems({ ...CANONICAL, entity: "sole", behind: "6" }))
      .toContainEqual({ service: "catchup", months: 6, entity: "sole", expenses: "10-25k" });
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
    // Nine Next clicks from Q_INIT, touching nothing — the wizard's own
    // transition function, not a restatement of it.
    let atQuote: QState = { ...Q_INIT };
    expect(atQuote.book).toBe("managed");
    expect(atQuote.assure).toBe("none");
    for (let i = 0; i < 9; i++) atQuote = { ...atQuote, ...qAdvance(atQuote, 9) };
    expect(atQuote.step).toBe(9);
    // Nobody chose this: `next()` switches the assurance question on at step 7.
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

    // Either button clears the CONFLICT immediately. The bookkeeping side then
    // still needs the spend band — the untouched default path trips both gates,
    // and B1 is why the second one now exists at all. Answering it prices at
    // once; that is the whole journey, and no step of it invents an answer.
    const keptBooks = { ...atQuote, assure: "none" as const };
    expect(qIndependence(keptBooks).route).toBe("bookkeeping");
    expect(qCalc(keptBooks, PROMO_ON).conflict).toBe(false);
    expect(qCalc(keptBooks, PROMO_ON).noExpenses).toBe(true);
    expect(qItems(keptBooks)).toEqual([]);

    const banded = { ...keptBooks, expenses: "10-25k" as const };
    const kb = qCalc(banded, PROMO_ON);
    expect(kb.conflict).toBe(false);
    expect(kb.noExpenses).toBe(false);
    expect(kb.moTot).toBeGreaterThan(0);
    expect(qItems(banded).length).toBeGreaterThan(0);
    expect(evaluateA4Items(qItems(banded), qRisk(banded)).independenceConflict).toBe(false);

    // The assurance side needs NO band — it does not buy bookkeeping, so it is
    // never held on a question that prices nothing for it.
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
    expect(engine.grossMonthly).toBe(shown.grossMo); // 133
    expect(engine.grossYearly).toBe(shown.grossYr);  // 150 — includes our €50 MBR fee
    expect(engine.grossOneOff).toBe(shown.oneTot);   // 0
  });

  it("applies the launch discount on the engine's own terms", () => {
    const engine = evaluateA4Items(items, qRisk(CANONICAL), PROMO_ON);
    if (shown.refer) throw new Error("unpriceable");
    expect(engine.promoApplied).toBe(true);
    expect(LAUNCH_PROMO.pct).toBe(0.25);
    expect([engine.monthly, engine.yearly, engine.oneOff]).toEqual([100, 138, 0]);
    expect([shown.moTot, shown.yrTot, shown.oneTot]).toEqual([100, 138, 0]);
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
    // Pin `now` inside the promo window on BOTH sides, or this flips on 1 Sep.
    const s = qCalc(bigger, PROMO_ON);
    const engine = evaluateA4Items(qItems(bigger), qRisk(bigger), PROMO_ON);
    if (s.refer) throw new Error("unpriceable");
    expect([s.moTot, s.yrTot, s.oneTot]).toEqual([engine.monthly, engine.yearly, engine.oneOff]);
    // 12 x 69 = 828, less the 25% promo at the line (finding C3) = 621.
    expect(s.oneTot).toBe(621);
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

/**
 * The MBR annual return is a COMPANY filing. A Malta sole trader is not on the
 * Business Registry, files no annual return, and has no authorised share capital
 * for the registry fee to key on.
 *
 * This was live: the line was gated on `labour` alone — i.e. on the prospect
 * having bought anything at all — so every self-employed visitor was quoted
 * EUR 150/yr for a filing we could not have made on their behalf, and was asked
 * for a share-capital band that has no meaning for them. Found by walking a real
 * sole-trader journey end to end; no unit test covered the combination, because
 * every existing case built on CANONICAL, which is a company.
 *
 * vacei.com carries the same predicate as `mbrApplies`. Keep the two in step.
 */
describe("a sole trader is never quoted a company filing", () => {
  const SOLE: QState = { ...CANONICAL, entity: "sole" };

  it("does not quote the MBR annual return", () => {
    const r = qCalc(SOLE, PROMO_OFF);
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "MBR annual return fee")).toBeUndefined();
  });

  it("does not put the mbr item on the wire", () => {
    const r = qCalc(SOLE, PROMO_OFF);
    if (r.refer) throw new Error("unpriceable");
    expect(qItems(SOLE).some((i) => i.service === "mbr")).toBe(false);
  });

  it("still tells them onboarding is unpriced — that note is not company-only", () => {
    const r = qCalc(SOLE, PROMO_OFF);
    if (r.refer) throw new Error("unpriceable");
    expect(r.notes.some(([tone]) => tone === "info")).toBe(true);
  });

  it("the share capital band cannot move a sole trader's total", () => {
    const small = qCalc({ ...SOLE, cap: "1500" }, PROMO_OFF);
    const large = qCalc({ ...SOLE, cap: "50000" }, PROMO_OFF);
    if (small.refer || large.refer) throw new Error("unpriceable");
    expect(large.yrTot).toBe(small.yrTot);
  });

  it("a company in the same basket still gets it, at our fee plus the registry fee", () => {
    const r = qCalc({ ...CANONICAL, entity: "company", cap: "1500" }, PROMO_OFF);
    if (r.refer) throw new Error("unpriceable");
    const mbr = line(r, "MBR annual return fee");
    expect(mbr?.v).toBe(MBR_ANNUAL_RETURN.ourFee + MBR_ANNUAL_RETURN.registryFeeByCapital["1500"]);
    expect(qItems({ ...CANONICAL, entity: "company" }).some((i) => i.service === "mbr")).toBe(true);
  });

  it("what the sole trader is spared is exactly the company's annual-return line", () => {
    const sole = qCalc(SOLE, PROMO_OFF);
    const company = qCalc({ ...CANONICAL, entity: "company" }, PROMO_OFF);
    if (sole.refer || company.refer) throw new Error("unpriceable");
    const mbr = line(company, "MBR annual return fee")!.v;
    expect(company.yrTot - sole.yrTot).toBe(mbr);
  });
});

/**
 * B1 — the wizard must not pre-answer the monthly spend or the start month.
 *
 * `Q_INIT` used to ship `expenses: "10-25k"` and `startMonth: nextMonth()`, so
 * a visitor who clicked Next through the wizard without reading it was given a
 * complete, binding quote for two answers they never gave. The failure mode is
 * worse than a silent degrade: the band id is VALID, so the backend re-prices
 * it, agrees to within €1/1%, and issues a real quotation. A company spending
 * €300k/month was quoted €69/mo (should be €379); a company spending €8k/month
 * was quoted €69/mo (should be €49). The pack docblock names both directions of
 * loss and the default produced both at once.
 *
 * vacei.com holds Next on an empty band and degrades to `noExpenses`. These
 * pin the same behaviour here, walking the wizard's own `qAdvance` rather than
 * restating the rules — the shape the independence default-path test uses.
 */
describe("nothing about the price is pre-answered", () => {
  it("ships no band and no start month", () => {
    expect(Q_INIT.expenses).toBe("");
    expect(Q_INIT.startMonth).toBe("");
  });

  it("prices NOTHING on the untouched default path, and says the band is why", () => {
    // Nine Next clicks from Q_INIT, touching nothing — the visitor's own path.
    let atQuote: QState = { ...Q_INIT };
    for (let i = 0; i < 9; i++) atQuote = { ...atQuote, ...qAdvance(atQuote, 9) };
    expect(atQuote.step).toBe(9);
    expect(atQuote.expenses).toBe("");

    const shown = qCalc(atQuote, PROMO_ON);
    expect(shown.noExpenses).toBe(true);
    // Not one figure anywhere — not a line, not a total, not a struck-through
    // "before discount" price to anchor on.
    expect([...shown.mo, ...shown.yr, ...shown.one]).toEqual([]);
    expect([shown.moTot, shown.yrTot, shown.oneTot, shown.grossMo, shown.grossYr]).toEqual([0, 0, 0, 0, 0]);
    expect(shown.promoApplied).toBe(false);
    // Nothing submittable either, so `canSend` (which needs items) stays false.
    expect(qItems(atQuote)).toEqual([]);
  });

  it("never falls back to the cheapest band — the one direction that loses money invisibly", () => {
    const noBand = qCalc({ ...CANONICAL, expenses: "" }, PROMO_OFF);
    expect(line(noBand, "Bookkeeping")).toBeUndefined();
    expect(noBand.grossMo).not.toBe(49); // the entry company band
    expect(noBand.grossMo).toBe(0);
  });

  it("treats an unrecognised band as unanswered, not as the entry band", () => {
    const stale = qCalc({ ...CANONICAL, expenses: "500K+" as QState["expenses"] }, PROMO_OFF);
    expect(stale.noExpenses).toBe(true);
    expect(stale.moTot).toBe(0);
    expect(qItems({ ...CANONICAL, expenses: "500K+" as QState["expenses"] })).toEqual([]);
  });

  it("prices instantly the moment the band is picked — the visitor is never stuck", () => {
    let atQuote: QState = { ...Q_INIT };
    for (let i = 0; i < 9; i++) atQuote = { ...atQuote, ...qAdvance(atQuote, 9) };
    // The default path is ALSO an independence conflict, so clear both.
    const answered: QState = { ...atQuote, assure: "none", expenses: "10-25k", startMonth: "2026-09" };
    const r = qCalc(answered, PROMO_OFF);
    expect(r.noExpenses).toBe(false);
    expect(r.conflict).toBe(false);
    expect(line(r, "Bookkeeping")?.v).toBe(69);
    expect(qItems(answered).length).toBeGreaterThan(0);
  });

  it("holds the send on an unconfirmed start month, so 'suggested not assumed' is true", () => {
    // `startOk` is the wizard's own gate; an empty month must fail it. It used
    // to be pre-filled, so this passed on an answer nobody gave.
    const startOk = (v: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(v);
    expect(startOk(Q_INIT.startMonth)).toBe(false);
    expect(startOk("2026-09")).toBe(true);
  });

  it("catch-up cannot be priced without the band either", () => {
    const r = qCalc({ ...CANONICAL, expenses: "", behind: "12" }, PROMO_OFF);
    expect(r.oneTot).toBe(0);
    expect(r.one).toEqual([]);
  });
});
