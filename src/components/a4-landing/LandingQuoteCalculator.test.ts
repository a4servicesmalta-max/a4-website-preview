/**
 * The canonical homepage-calculator path, pinned.
 *
 * Shop/trade · company books · 20–60 transactions · 2 on payroll · up to date ·
 * VAT registered · default services. Every question added to this wizard must
 * default so that THIS quote does not move — a new question that changes the
 * price for a visitor who never touched it is a silent repricing.
 *
 * The wizard is a port of vacei.com's (owner ruling 2026-08-26: "exactly like
 * vacei.com"), so its DEFAULTS are vacei's: 'Up to 20' transactions, nobody on
 * the payroll, the tax return and the MBR annual return switched on. The
 * canonical fixture therefore states its own answers — txn, head, pay, taxret —
 * rather than inheriting them, and the pinned figures below did not move.
 */

import { describe, it, expect } from "vitest";
import { qCalc, qItems, qRisk, qIndependence, qAdvance, Q_INIT, QS, QSTEPS, QSTEP_QUOTE, type QState } from "./LandingQuoteCalculator";
import { CAPITAL_BANDS, MBR_ANNUAL_RETURN, LAUNCH_PROMO, catchUpLabel } from "@/data/a4QuotePack";
import { evaluateA4Items } from "@/lib/websiteQuotation";

/** The MBR line, named exactly as vacei names it — `qItems` keys the wire item off it. */
const MBR_LINE = "Annual return — filed with the MBR";

/**
 * Where the wizard lands after seven Next clicks, touching nothing. It is
 * UNPRICEABLE for ONE reason: `Q_INIT` does not pre-answer the monthly-spend
 * band, so there is no rate to price the books (or the tax return) at.
 *
 * It is NOT an independence conflict any more: vacei never switches the audit
 * on for the visitor, and neither do we. The fixture inherits the gap from
 * `Q_INIT` deliberately, so a regression that reinstates a default band fails
 * here first. The priced fixtures below each state their own answers.
 */
const DEFAULT_PATH: QState = { ...Q_INIT, step: QSTEP_QUOTE };

/**
 * "Keep the bookkeeping with us" — the canonical priced basket, a 21–60
 * company with two on the payroll and no tax return. Every answer that the
 * pinned figures depend on is stated EXPLICITLY here: the band and the start
 * month because a real visitor has to give them, the rest because the wizard's
 * defaults are vacei's and this fixture pre-dates them.
 */
const CANONICAL: QState = { ...DEFAULT_PATH, txn: "21-60", head: 2, pay: "we", taxret: "none", assure: "none", expenses: "10-25k", startMonth: "2026-09" };

/**
 * "Take the audit or review with us" — pins the assurance side of the pack.
 * Carries NO expenses band on purpose: the band prices bookkeeping only, so an
 * audit-only visitor must never be held on a question that prices nothing for
 * them.
 */
const ASSURED: QState = { ...CANONICAL, expenses: "", book: "none", vat: "none", assure: "we" };

/** Fixed clocks — the launch promo expires by data, so tests must pin the day
 *  or every total below silently changes on 1 September 2026. */
const PROMO_ON = new Date("2026-08-07T00:00:00.000Z");
const PROMO_OFF = new Date("2026-09-01T12:00:00.000Z");

const line = (r: ReturnType<typeof qCalc>, n: string) =>
  [...r.mo, ...r.yr, ...r.one].find((l) => l.n === n);

/** Walk the wizard with its own transition function, touching nothing. */
const walk = (from: QState, clicks: number) => {
  let q = { ...from };
  for (let i = 0; i < clicks; i++) q = { ...q, ...qAdvance(q, QSTEP_QUOTE) };
  return q;
};

describe("the canonical quote", () => {
  const r = qCalc(CANONICAL, PROMO_ON);

  it("bills the full list price once the promo ends", () => {
    const after = qCalc(CANONICAL, PROMO_OFF);
    if (after.refer) throw new Error("unpriceable");
    expect(after.promoApplied).toBe(false);
    // Bookkeeping 69 + volume uplift 10 (21-60 band) + payroll 2 × 12 =
    // 103/mo — the one bank account is included (mt-2026-08-27-entry); MBR
    // (our 50 + registry 100)/yr.
    expect([after.moTot, after.yrTot]).toEqual([103, 150]);
    // The assurance side, priced on its own: payroll 24/mo, review 547 + MBR 150.
    const assured = qCalc(ASSURED, PROMO_OFF);
    if (assured.refer) throw new Error("unpriceable");
    expect([assured.moTot, assured.yrTot]).toEqual([24, 697]);
  });

  it("opens on vacei's defaults", () => {
    expect(Q_INIT.entity).toBe("company");
    expect(Q_INIT.cap).toBe("1500");
    expect(Q_INIT.book).toBe("managed");
    expect(Q_INIT.sector).toBe("shop");
    // Owner ruling: every calculator defaults to the "Up to 20" band.
    expect(Q_INIT.txn).toBe("1-20");
    expect(Q_INIT.banks).toBe(1);
    expect(Q_INIT.head).toBe(0);
    expect(Q_INIT.annret).toBe("we");
    expect(Q_INIT.taxret).toBe("we");
    expect(Q_INIT.assure).toBe("none");
    // …but NEVER the price drivers themselves. See the B1 block at the foot of
    // this file: entity and capital shape the quote, the spend band and the
    // start month ARE the quote, and those two are the visitor's to give.
    expect(Q_INIT.expenses).toBe("");
    expect(Q_INIT.startMonth).toBe("");
  });

  it("holds the pinned totals", () => {
    if (r.refer) throw new Error("the canonical path must be priceable");
    // List: bookkeeping 69 + uplift 10 (21-60) + payroll 2 × 12 = 103/mo
    // (the one bank account is included); MBR (our 50 + registry 100) = 150/yr.
    // Onboarding is UNPRICED.
    expect(r.grossMo).toBe(103);
    expect(r.grossYr).toBe(150);
    // As quoted, with the 25% launch discount and the registry fee exempt.
    expect(r.moTot).toBe(77); // 103 × 0.75 = 77.25 → 77
    expect(r.yrTot).toBe(138); // (150 − 100) × 0.75 = 37.5 → 38, + 100
    expect(r.oneTot).toBe(0); // nothing one-off: onboarding carries no number
  });

  it("holds the pinned totals on the assurance side too", () => {
    const a = qCalc(ASSURED, PROMO_ON);
    if (a.refer) throw new Error("the assurance path must be priceable");
    expect(a.grossMo).toBe(24);
    expect(a.grossYr).toBe(697); // review 547 + MBR 150
    expect(a.moTot).toBe(18); // 24 × 0.75
    expect(a.yrTot).toBe(548); // (697 − 100) × 0.75 = 447.75 → 448, + 100
    expect(line(a, "Review engagement (if applicable)")?.v).toBe(547);
  });

  it("does not put a number on onboarding, but does say it exists", () => {
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "Onboarding and due diligence")).toBeUndefined();
    expect(r.notes.some(([, t]) => t.includes("Onboarding and opening balances"))).toBe(true);
  });

  it("bills the MBR annual return at our fee plus the registry fee, under vacei's line name", () => {
    if (r.refer) throw new Error("unpriceable");
    // mt-2026-08-27-entry: the first account is INCLUDED — at one account
    // there is no bank line at all, under either name.
    expect(line(r, "Bank accounts")).toBeUndefined(); // the 26d name is gone
    expect(line(r, "Additional bank accounts")).toBeUndefined(); // one account prices nothing
    // Extras appear under the new name: 2 extra × €52 at the canonical band.
    const three = qCalc({ ...CANONICAL, banks: 3 }, PROMO_ON);
    if (three.refer) throw new Error("unpriceable");
    expect(line(three, "Additional bank accounts")?.v).toBe(104);
    expect(line(three, "Additional bank accounts")?.e).toContain("2 × €52");
    expect(line(r, "MBR annual return fee")).toBeUndefined(); // the old a4 name is gone
    expect(line(r, MBR_LINE)?.v)
      .toBe(MBR_ANNUAL_RETURN.ourFee + MBR_ANNUAL_RETURN.registryFeeByCapital["1500"]);
  });

  it("does not move the bookkeeping base with transaction volume", () => {
    // Transactions add an uplift line; the base line follows the expenses band only.
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
    const expected: Record<string, [number, number]> = {
      // band: [sole, company]
      "0-10k": [24, 49],
      "10-25k": [39, 69],
      "25-50k": [59, 99],
      "50-100k": [89, 149],
      "100-200k": [129, 219],
      "200-300k": [179, 299],
      "300-400k": [229, 379],
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
      txn: "21-60",
      banks: 1,
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

  it("names the bookkeeping line the way vacei does", () => {
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "Bookkeeping")?.e).toBe("company, over €10,000, up to €25,000 a month of expenses — you upload, we keep the books, an accountant approves every entry");
  });
});

describe("authorised share capital", () => {
  it("prices every band off the pack's registry table, never a literal", () => {
    for (const band of CAPITAL_BANDS) {
      const r = qCalc({ ...CANONICAL, cap: band.id }, PROMO_ON);
      if (r.refer) throw new Error("unpriceable");
      expect(line(r, MBR_LINE)?.v)
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

/**
 * The MBR annual return is ASKED, exactly as vacei asks it — the `annret`
 * toggle in the services step. It used to be inferred from "any labour at
 * all", which quoted a filing nobody had chosen and could not be switched off.
 */
describe("the MBR annual return is a service the visitor chooses", () => {
  it("is quoted only while annret is 'we'", () => {
    const off = qCalc({ ...CANONICAL, annret: "none" }, PROMO_OFF);
    if (off.refer) throw new Error("unpriceable");
    expect(line(off, MBR_LINE)).toBeUndefined();
    expect(off.yrTot).toBe(0);
    expect(qItems({ ...CANONICAL, annret: "none" }).some((i) => i.service === "mbr")).toBe(false);
    // …and on the wire exactly when it is on screen.
    expect(qItems(CANONICAL)).toContainEqual({ service: "mbr", capital: "1500" });
  });

  it("no longer needs any other service to be quoted — an MBR-only basket prices and agrees with the engine", () => {
    const only: QState = { ...CANONICAL, book: "none", pay: "none", vat: "none", taxret: "none", assure: "none", regoff: "none", annret: "we" };
    const r = qCalc(only, PROMO_OFF);
    if (r.refer) throw new Error("unpriceable");
    expect(r.moTot).toBe(0);
    expect(r.yrTot).toBe(150);
    expect(qItems(only)).toEqual([{ service: "mbr", capital: "1500" }, { service: "onboarding" }]);
    const engine = evaluateA4Items(qItems(only), qRisk(only), PROMO_OFF);
    expect([engine.monthly, engine.yearly, engine.oneOff]).toEqual([0, 150, 0]);
  });

  it("explains the fee the way vacei does", () => {
    const r = qCalc(CANONICAL, PROMO_OFF);
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, MBR_LINE)?.e).toBe("€50 our fee + MBR €100 registry fee (electronic), set by your share capital");
  });
});

describe("catch-up", () => {
  it("charges the same monthly rate per earlier month, uncapped", () => {
    const r = qCalc({ ...CANONICAL, behind: "24" }, PROMO_OFF);
    if (r.refer) throw new Error("unpriceable");
    expect(r.oneTot).toBe(24 * 79); // 1,896 (69 base + 10 uplift; the one account included) — the retired cap would have said 480
    expect(r.oneTot).not.toBe(480);
  });

  it("uses the exact contracted label", () => {
    const r = qCalc({ ...CANONICAL, behind: "12" }, PROMO_OFF);
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "Catch-up: 12 months x EUR 79 = EUR 948")?.v).toBe(948);
    // Non-null: "10-25k" is a real band, so the pack always has a label for it.
    expect(line(r, catchUpLabel(12, "company", "10-25k", "21-60", 1)!)?.v).toBe(948);
    // The owner's worked example, three accounts: 79 + 2 extra × 52 = 183 a month.
    const three = qCalc({ ...CANONICAL, banks: 3, behind: "12" }, PROMO_OFF);
    if (three.refer) throw new Error("unpriceable");
    expect(line(three, "Additional bank accounts")?.v).toBe(104);
    expect(line(three, "Catch-up: 12 months x EUR 183 = EUR 2196")?.v).toBe(2196);
    expect(three.grossMo).toBe(183 + 24); // + payroll 2 × 12
  });

  it("follows the entity, like the monthly price does", () => {
    const r = qCalc({ ...CANONICAL, entity: "sole", behind: "12" }, PROMO_OFF);
    if (r.refer) throw new Error("unpriceable");
    expect(r.oneTot).toBe(12 * 49); // sole 39 + 10 uplift at the €10–25k band, its one account included
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
      { service: "bookkeeping-managed", entity: "company", expenses: "10-25k", txn: "21-60", banks: 1 },
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
    // …and never when there is nothing at all to onboard for.
    const nothing: QState = { ...CANONICAL, book: "none", pay: "none", assure: "none", vat: "none", taxret: "none", regoff: "none", annret: "none" };
    expect(qItems(nothing)).toEqual([]);
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
    const q: QState = { ...CANONICAL, pay: "none", assure: "none", vat: "none", taxret: "none", regoff: "none", annret: "none" };
    expect(qItems(q)).toEqual([
      { service: "bookkeeping-managed", entity: "company", expenses: "10-25k", txn: "21-60", banks: 1 },
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
      .toContainEqual({ service: "catchup", months: 6, entity: "company", expenses: "10-25k", txn: "21-60", banks: 1 });
    expect(qItems({ ...CANONICAL, entity: "sole", behind: "6" }))
      .toContainEqual({ service: "catchup", months: 6, entity: "sole", expenses: "10-25k", txn: "21-60", banks: 1 });
  });

  it("drops nothing at all — every displayed line has an item behind it", () => {
    const everything: QState = { ...CANONICAL, behind: "6", vat: "we", taxret: "we", regoff: "we", banks: 3 };
    const shown = qCalc(everything);
    if (shown.refer) throw new Error("unpriceable");
    const shownNames = [...shown.mo, ...shown.yr, ...shown.one].map((l) => l.n);
    expect(shownNames).toContain("Additional bank accounts");
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
    // A small company, so `assure: "we"` is a REVIEW — and a review is still an
    // assurance engagement, so the books cannot also be ours.
    expect(qIndependence({ ...CANONICAL, assure: "we" }).route).toBe("conflict");
  });

  it("puts NO figure on a conflict basket — not a line, not a total — and says why", () => {
    const q: QState = { ...CANONICAL, assure: "we" };
    const r = qCalc(q, PROMO_ON);
    expect(r.conflict).toBe(true);
    expect([...r.mo, ...r.yr, ...r.one]).toEqual([]);
    expect([r.moTot, r.yrTot, r.oneTot, r.grossMo, r.grossYr]).toEqual([0, 0, 0, 0, 0]);
    expect(r.promoApplied).toBe(false);
    // Vacei's conflict note rides in the notes, as a warning.
    expect(r.notes).toContainEqual(["warn", expect.stringContaining("Whichever you leave with us, we arrange the other side with an independent firm")]);
    // Nothing to submit either, so `canSend` (which needs items) stays false.
    expect(qItems(q)).toEqual([]);
  });

  /**
   * The conflict is a COMPANY matter, exactly as on vacei.com: a Maltese sole
   * trader has no statutory audit, so `assure: "we"` prices nothing for them,
   * conflicts with nothing, and never blocks the send.
   */
  it("flags the conflict for a company only — a sole trader with the audit ticked is simply not sold one", () => {
    const sole: QState = { ...CANONICAL, entity: "sole", assure: "we" };
    expect(qIndependence(sole).route).toBe("bookkeeping");
    expect(qIndependence(sole).auditEligible).toBe(false);
    const r = qCalc(sole, PROMO_OFF);
    expect(r.conflict).toBe(false);
    expect(line(r, "Bookkeeping")?.v).toBe(39);
    expect(r.yr.some((l) => l.n.startsWith("Financial audit") || l.n.startsWith("Review engagement"))).toBe(false);
    expect(qItems(sole).some((i) => i.service === "audit")).toBe(false);
    // Same shape for the company: switch the entity and the same answers conflict.
    expect(qCalc({ ...sole, entity: "company" }, PROMO_OFF).conflict).toBe(true);
  });

  it("either button clears the conflict on the spot", () => {
    const stuck: QState = { ...CANONICAL, assure: "we" };
    const keptBooks: QState = { ...stuck, assure: "none" };
    expect(qIndependence(keptBooks).route).toBe("bookkeeping");
    expect(qCalc(keptBooks, PROMO_ON).conflict).toBe(false);
    expect(qCalc(keptBooks, PROMO_ON).moTot).toBeGreaterThan(0);
    expect(evaluateA4Items(qItems(keptBooks), qRisk(keptBooks)).independenceConflict).toBe(false);

    // The assurance side needs NO band — it does not buy bookkeeping.
    const tookAssurance: QState = { ...stuck, book: "none", vat: "none", expenses: "" };
    expect(qIndependence(tookAssurance).route).toBe("audit");
    const ta = qCalc(tookAssurance, PROMO_ON);
    expect(ta.conflict).toBe(false);
    expect(ta.noExpenses).toBe(false);
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
 * Company-only services, exactly as vacei gates them: a sole trader has no
 * statutory audit and no registered-office requirement, so neither is priced
 * for one whatever the toggle says — the rows are absent on screen and the
 * items absent on the wire.
 */
describe("company-only services", () => {
  it("does not price a registered office or an audit for a sole trader", () => {
    const sole: QState = { ...CANONICAL, entity: "sole", regoff: "we", assure: "we", book: "none", vat: "none" };
    const r = qCalc(sole, PROMO_OFF);
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "Registered office")).toBeUndefined();
    expect(r.yrTot).toBe(0);
    expect(qItems(sole).map((i) => i.service)).toEqual(["payroll", "onboarding"]);
  });

  it("prices both for a company, and agrees with the engine", () => {
    const co: QState = { ...CANONICAL, regoff: "we" };
    const r = qCalc(co, PROMO_OFF);
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "Registered office")?.v).toBe(1200);
    const engine = evaluateA4Items(qItems(co), qRisk(co), PROMO_OFF);
    expect([r.moTot, r.yrTot, r.oneTot]).toEqual([engine.monthly, engine.yearly, engine.oneOff]);
  });

  it("prices a full audit above the small-company spend bands, and says so", () => {
    const big: QState = { ...ASSURED, expenses: "200-300k", txn: "21-60" };
    const r = qCalc(big, PROMO_OFF);
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "Financial audit (if applicable)")?.v).toBe(995);
    expect(r.notes.some(([tone, t]) => tone === "info" && t.startsWith("At your monthly spend the company is above the small-company thresholds"))).toBe(true);
    expect(qItems(big)).toContainEqual({ service: "audit", txn: "21-60" });
  });
});

/**
 * The wizard prices with its own tables; the backend reprices the basket with
 * the shared engine. What is on screen and what we email MUST agree — the
 * visitor is quoted the number they were shown. These pin that.
 */
describe("what we show equals what we quote", () => {
  // Pin the date on BOTH sides, or this suite tests the calendar.
  const shown = qCalc(CANONICAL, PROMO_ON);
  const items = qItems(CANONICAL);

  it("agrees with the engine line-for-line before any discount", () => {
    const engine = evaluateA4Items(items, qRisk(CANONICAL), PROMO_OFF);
    if (shown.refer) throw new Error("unpriceable");
    expect(engine.grossMonthly).toBe(shown.grossMo); // 103
    expect(engine.grossYearly).toBe(shown.grossYr);  // 150 — includes our €50 MBR fee
    expect(engine.grossOneOff).toBe(shown.oneTot);   // 0
  });

  it("applies the launch discount on the engine's own terms", () => {
    const engine = evaluateA4Items(items, qRisk(CANONICAL), PROMO_ON);
    if (shown.refer) throw new Error("unpriceable");
    expect(engine.promoApplied).toBe(true);
    expect(LAUNCH_PROMO.pct).toBe(0.25);
    expect([engine.monthly, engine.yearly, engine.oneOff]).toEqual([77, 138, 0]);
    expect([shown.moTot, shown.yrTot, shown.oneTot]).toEqual([77, 138, 0]);
    const yearOne = (m: number, y: number, o: number) => m * 12 + y + o;
    expect(yearOne(shown.moTot, shown.yrTot, shown.oneTot))
      .toBe(yearOne(engine.monthly, engine.yearly, engine.oneOff));
  });

  it("agrees with the engine on the assurance side as well", () => {
    const s = qCalc(ASSURED, PROMO_ON);
    const engine = evaluateA4Items(qItems(ASSURED), qRisk(ASSURED), PROMO_ON);
    if (s.refer) throw new Error("unpriceable");
    expect([s.moTot, s.yrTot, s.oneTot]).toEqual([engine.monthly, engine.yearly, engine.oneOff]);
    expect([engine.monthly, engine.yearly]).toEqual([18, 548]);
  });

  it("still agrees once the basket grows — canonical path plus VAT and catch-up", () => {
    const bigger: QState = { ...CANONICAL, vat: "we", behind: "12" };
    const s = qCalc(bigger, PROMO_ON);
    const engine = evaluateA4Items(qItems(bigger), qRisk(bigger), PROMO_ON);
    if (s.refer) throw new Error("unpriceable");
    expect([s.moTot, s.yrTot, s.oneTot]).toEqual([engine.monthly, engine.yearly, engine.oneOff]);
    // 12 x 79 (69 base + 10 uplift; the one account included) = 948, less the 25% promo at the line (C3) = 711.
    expect(s.oneTot).toBe(711);
  });

  it("agrees on vacei's own defaults once the two required answers are given", () => {
    // The untouched wizard, plus the band and the month — a real visitor's
    // shortest path. Tax return and MBR are on by default, payroll is not.
    const q: QState = { ...DEFAULT_PATH, expenses: "10-25k", startMonth: "2026-09" };
    const s = qCalc(q, PROMO_OFF);
    if (s.refer) throw new Error("unpriceable");
    // mt-2026-08-27-entry: the one bank account is included, so the monthly
    // is the bare band rate — €69, one line.
    expect(s.mo.map((l) => l.n)).toEqual(["Bookkeeping"]);
    expect(s.yr.map((l) => l.n)).toEqual(["Annual tax return", MBR_LINE]);
    expect([s.moTot, s.yrTot]).toEqual([69, 331 + 150]);
    const engine = evaluateA4Items(qItems(q), qRisk(q), PROMO_OFF);
    expect([s.moTot, s.yrTot, s.oneTot]).toEqual([engine.monthly, engine.yearly, engine.oneOff]);
  });

  it("never discounts the government registry fee", () => {
    const top: QState = { ...CANONICAL, cap: "50000" };
    const s = qCalc(top, PROMO_ON);   // same instant as the engine call below
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
    expect(r.notes.some(([tone, t]) => tone === "warn" && t.includes("We only put our name to a VAT return when we have kept the ledger behind it"))).toBe(true);
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
 * for the registry fee to key on. vacei.com carries the same predicate as
 * `mbrApplies`. Keep the two in step.
 */
describe("a sole trader is never quoted a company filing", () => {
  const SOLE: QState = { ...CANONICAL, entity: "sole" };

  it("does not quote the MBR annual return, even with annret left on", () => {
    expect(SOLE.annret).toBe("we");
    const r = qCalc(SOLE, PROMO_OFF);
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, MBR_LINE)).toBeUndefined();
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
    const mbr = line(r, MBR_LINE);
    expect(mbr?.v).toBe(MBR_ANNUAL_RETURN.ourFee + MBR_ANNUAL_RETURN.registryFeeByCapital["1500"]);
    expect(qItems({ ...CANONICAL, entity: "company" }).some((i) => i.service === "mbr")).toBe(true);
  });

  it("what the sole trader is spared is exactly the company's annual-return line", () => {
    const sole = qCalc(SOLE, PROMO_OFF);
    const company = qCalc({ ...CANONICAL, entity: "company" }, PROMO_OFF);
    if (sole.refer || company.refer) throw new Error("unpriceable");
    const mbr = line(company, MBR_LINE)!.v;
    expect(company.yrTot - sole.yrTot).toBe(mbr);
  });
});

/**
 * Step order and the Next transition — vacei's, exactly.
 */
describe("the wizard walks vacei's steps", () => {
  it("has vacei's eight steps in vacei's order", () => {
    expect(QSTEPS).toEqual(["Your bookkeeping", "What you do", "Transactions", "Payroll", "When we start", "VAT", "Your services", "Your quote"]);
    expect(QS).toEqual({ exp: 0, sector: 1, txn: 2, pay: 3, start: 4, vat: 5, svc: 6, quote: 7 });
    expect(QSTEP_QUOTE).toBe(7);
  });

  it("reaches the quote in seven clicks and never overshoots", () => {
    expect(walk(Q_INIT, 7).step).toBe(QSTEP_QUOTE);
    expect(walk(Q_INIT, 12).step).toBe(QSTEP_QUOTE);
  });

  it("derives the payroll answer from the headcount when the payroll step is left, and nowhere else", () => {
    const atPay: QState = { ...Q_INIT, step: QS.pay, head: 3 };
    expect(qAdvance(atPay, QSTEP_QUOTE)).toEqual({ step: QS.start, pay: "we" });
    expect(qAdvance({ ...atPay, head: 0 }, QSTEP_QUOTE)).toEqual({ step: QS.start, pay: "none" });
    for (const step of [QS.exp, QS.sector, QS.txn, QS.start, QS.vat, QS.svc]) {
      expect(qAdvance({ ...Q_INIT, step, head: 3 }, QSTEP_QUOTE)).toEqual({ step: step + 1 });
    }
  });

  it("switches nothing else on for the visitor — the audit is never defaulted", () => {
    const atQuote = walk(Q_INIT, 7);
    expect(atQuote.assure).toBe("none");
    expect(atQuote.pay).toBe("none"); // nobody on the payroll by default
    expect(atQuote.book).toBe("managed");
    expect(qIndependence(atQuote).route).toBe("bookkeeping");
    expect(qCalc(atQuote, PROMO_ON).conflict).toBe(false);
  });
});

/**
 * B1 — the wizard must not pre-answer the monthly spend or the start month.
 * vacei.com holds Next on an empty band and degrades to `noExpenses`. These
 * pin the same behaviour here, walking the wizard's own `qAdvance`.
 */
describe("nothing about the price is pre-answered", () => {
  it("ships no band and no start month", () => {
    expect(Q_INIT.expenses).toBe("");
    expect(Q_INIT.startMonth).toBe("");
  });

  it("prices NOTHING on the untouched default path, and says the band is why", () => {
    const atQuote = walk(Q_INIT, 7);
    expect(atQuote.step).toBe(QSTEP_QUOTE);
    expect(atQuote.expenses).toBe("");

    const shown = qCalc(atQuote, PROMO_ON);
    expect(shown.noExpenses).toBe(true);
    expect(shown.conflict).toBe(false);
    expect(shown.noStart).toBe(true);
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

  it("holds the tax return on the band too — it is priced from spend, and there is no spend", () => {
    const taxOnly: QState = { ...CANONICAL, book: "none", vat: "none", pay: "none", annret: "none", taxret: "we", expenses: "" };
    expect(qCalc(taxOnly, PROMO_OFF).noExpenses).toBe(true);
    expect(qItems(taxOnly)).toEqual([]);
  });

  it("prices instantly the moment the band is picked — the visitor is never stuck", () => {
    const atQuote = walk(Q_INIT, 7);
    const answered: QState = { ...atQuote, expenses: "10-25k", startMonth: "2026-09" };
    const r = qCalc(answered, PROMO_OFF);
    expect(r.noExpenses).toBe(false);
    expect(r.conflict).toBe(false);
    expect(r.noStart).toBe(false);
    expect(line(r, "Bookkeeping")?.v).toBe(69);
    expect(qItems(answered).length).toBeGreaterThan(0);
  });

  it("keeps the figures lit without a start month, but flags it", () => {
    // A missing month is different in kind from a missing band: everything is
    // priced and only the catch-up one-off is still to come.
    const r = qCalc({ ...CANONICAL, startMonth: "" }, PROMO_OFF);
    expect(r.noStart).toBe(true);
    expect(r.moTot).toBe(103);
    // `startOk` is the wizard's own send gate; an empty month must fail it.
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
