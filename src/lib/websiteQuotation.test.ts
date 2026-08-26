import { describe, it, expect } from "vitest";
import {
  buildA4Selections,
  buildQuoteRecord,
  evaluateA4Items,
  isServiceStartMonth,
  type A4Item,
} from "./websiteQuotation";
import {
  A4_QUOTE_PACK_VERSION,
  EXPENSE_BANDS,
  LAUNCH_PROMO,
  catchUpAmount,
  catchUpLabel,
  managedMonthly,
  type ExpenseBand,
} from "@/data/a4QuotePack";

/** Inside the launch window, and safely after it. */
const DURING = new Date("2026-08-02T12:00:00Z");
const AFTER = new Date("2026-09-01T12:00:00Z");

const START = "2026-09";

/** Undiscounted per-cadence totals — the arithmetic before the promo. */
const gross = (items: A4Item[], risk?: Parameters<typeof evaluateA4Items>[1]) => {
  const t = evaluateA4Items(items, risk, AFTER);
  return { monthly: t.grossMonthly, yearly: t.grossYearly, oneOff: t.grossOneOff };
};

describe("A4 selections contract", () => {
  it("wraps items in the versioned envelope the backend evaluator expects", () => {
    expect(buildA4Selections([{ service: "registered-office" }], "standard", START)).toEqual({
      kind: "a4-services",
      version: 1,
      risk: "standard",
      serviceStartDate: START,
      items: [{ service: "registered-office" }],
      independence: { auditEligible: true, bookkeepingEligible: true, route: "neutral" },
    });
  });

  it("defaults the risk tier to standard", () => {
    expect(buildA4Selections([]).risk).toBe("standard");
    expect(buildA4Selections([], "high").risk).toBe("high");
  });

  it("only accepts a YYYY-MM start month", () => {
    expect(isServiceStartMonth("2026-09")).toBe(true);
    expect(isServiceStartMonth("2026-12")).toBe(true);
    expect(isServiceStartMonth("2026-13")).toBe(false);
    expect(isServiceStartMonth("2026-00")).toBe(false);
    expect(isServiceStartMonth("2026-09-01")).toBe(false);
    expect(isServiceStartMonth("")).toBe(false);
    expect(isServiceStartMonth(undefined)).toBe(false);
  });
});

describe("per-item pricing", () => {
  it("prices managed bookkeeping by entity and expenses, with no risk uplift", () => {
    expect(gross([{ service: "bookkeeping-managed", entity: "sole", expenses: "0-10k", txn: "1-20", banks: 1 }]).monthly).toBe(24);
    expect(gross([{ service: "bookkeeping-managed", entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 }]).monthly).toBe(49);
    // Expenses moves it; the sector risk multiplier still must not touch it.
    expect(gross([{ service: "bookkeeping-managed", entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 }], "high").monthly).toBe(49);
    expect(gross([{ service: "bookkeeping-managed", entity: "sole", expenses: "0-10k", txn: "1-20", banks: 1 }], "elevated").monthly).toBe(24);
    expect(gross([{ service: "bookkeeping-managed", entity: "company", expenses: "200-300k", txn: "1-20", banks: 1 }], "high").monthly).toBe(299);
  });

  it("has no software-only tier and no volume-banded bookkeeping left", () => {
    // A stale cached page still sending a retired item must produce NOTHING —
    // the missing money makes the backend's reprice disagree, which is the
    // correct fail-loud outcome.
    const stale = [
      { service: "software", tier: "book" },
      { service: "bookkeeping-full", txn: "21-60" },
      { service: "review", txn: "61-150", cadence: "monthly" },
    ] as unknown as A4Item[];
    const t = evaluateA4Items(stale, "standard", AFTER);
    expect(t.lines).toEqual([]);
    expect(t.grossMonthly).toBe(0);
  });

  it("prices VAT by article", () => {
    // art. 10 — the band price, monthly
    expect(gross([{ service: "vat", txn: "21-60", vatreg: "art10" }])).toMatchObject({ monthly: 45, yearly: 0 });
    // art. 12 — 60% of the band, monthly. 45 × 0.6 = 27
    expect(gross([{ service: "vat", txn: "21-60", vatreg: "art12" }])).toMatchObject({ monthly: 27, yearly: 0 });
    // art. 11 — one flat yearly declaration, not a monthly return
    expect(gross([{ service: "vat", txn: "21-60", vatreg: "art11" }])).toMatchObject({ monthly: 0, yearly: 145 });
    // art. 11 still takes the risk uplift: 145 × 1.45 = 210.25 → €210
    expect(gross([{ service: "vat", txn: "21-60", vatreg: "art11" }], "high").yearly).toBe(210);
  });

  it("prices the tax return and the audit yearly", () => {
    // mt-2026-08-26-taxret: 420 -> 335, and no risk multiplier on it.
    // Formula since mt-2026-08-26c-volume: company 50-100k = 149 × 4.8 = 715.
    expect(gross([{ service: "taxret", entity: "company", expenses: "50-100k" }]).yearly).toBe(715);
    expect(gross([{ service: "audit", txn: "21-60" }]).yearly).toBe(995);
    // Review engagement — 995 × 0.55 = 547.25 → €547
    expect(gross([{ service: "audit", txn: "21-60", review: true }]).yearly).toBe(547);
    // 995 × 1.45 = 1442.75 → €1,443
    expect(gross([{ service: "audit", txn: "21-60" }], "high").yearly).toBe(1443);
  });

  it("bills payroll at a flat €12/head — the total never falls as the team grows", () => {
    // mt-2026-08-26b-payroll: one rate, n × 12; the marginal walk degenerates.
    expect(gross([{ service: "payroll", heads: 3 }]).monthly).toBe(36); // 3 × 12
    expect(gross([{ service: "payroll", heads: 5 }]).monthly).toBe(60);
    expect(gross([{ service: "payroll", heads: 8 }]).monthly).toBe(96);
    expect(gross([{ service: "payroll", heads: 10 }]).monthly).toBe(120);
    // The retired flat TIERS priced 11 people BELOW 10 (290 → 275). A single
    // rate cannot cliff. Never again.
    expect(gross([{ service: "payroll", heads: 11 }]).monthly).toBe(132);
    expect(gross([{ service: "payroll", heads: 20 }]).monthly).toBe(240);
    // And no risk multiplier on payroll (finding A3).
    expect(gross([{ service: "payroll", heads: 5 }], "high").monthly).toBe(60);
    expect(evaluateA4Items([{ service: "payroll", heads: 0 }], "standard", AFTER).lines).toEqual([]);
  });

  it("prices the MBR return as our fee plus the registry fee", () => {
    const t = evaluateA4Items([{ service: "mbr", capital: "5000" }], "standard", AFTER);
    expect(t.grossYearly).toBe(260); // 50 + 210
    expect(t.registryPassThrough).toBe(210);
    expect(evaluateA4Items([{ service: "mbr", capital: "1500" }], "standard", AFTER).grossYearly).toBe(150);
    expect(evaluateA4Items([{ service: "mbr", capital: "50000+" }], "standard", AFTER).grossYearly).toBe(429);
  });

  it("keeps the registered office flat and risk-free", () => {
    expect(gross([{ service: "registered-office" }]).yearly).toBe(1200);
    expect(gross([{ service: "registered-office" }], "high").yearly).toBe(1200);
  });

  it("emits no line at all for onboarding, and says so separately", () => {
    // Not a €0 line — a €0 line reads as "included, free". No line, plus a flag.
    const t = evaluateA4Items([{ service: "onboarding" }], "standard", AFTER);
    expect(t.lines).toEqual([]);
    expect(t.grossOneOff).toBe(0);
    expect(t.hasUnpricedOnboarding).toBe(true);
    // And the retired risk-tier onboarding fees must not come back.
    expect(gross([{ service: "onboarding" }], "high").oneOff).toBe(0);
  });

  it("charges catch-up at the monthly rate, per month, with no cap", () => {
    expect(gross([{ service: "catchup", months: 6, entity: "sole", expenses: "0-10k", txn: "1-20", banks: 1 }]).oneOff).toBe(144); // 6 × 24
    expect(gross([{ service: "catchup", months: 6, entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 }]).oneOff).toBe(294); // 6 × 49
    // The contract's worked example: 12 × 49 = 588. NOT 240, NOT 300.
    expect(gross([{ service: "catchup", months: 12, entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 }]).oneOff).toBe(588);
    // 24 months is simply twice that — no yearly cap survives.
    expect(gross([{ service: "catchup", months: 24, entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 }]).oneOff).toBe(1176);
    // And no risk uplift on it either.
    expect(gross([{ service: "catchup", months: 12, entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 }], "high").oneOff).toBe(588);
    expect(evaluateA4Items([{ service: "catchup", months: 0, entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 }], "standard", AFTER).lines).toEqual([]);
  });

  it("labels the catch-up line in exactly the contracted form", () => {
    const t = evaluateA4Items([{ service: "catchup", months: 12, entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 }], "standard", AFTER);
    expect(t.lines[0].label).toBe("Catch-up: 12 months x EUR 49 = EUR 588");
    expect(t.lines[0].label).toBe(catchUpLabel(12, "company", "0-10k", "1-20", 1));
    expect(catchUpLabel(6, "sole", "0-10k", "1-20", 1)).toBe("Catch-up: 6 months x EUR 24 = EUR 144");
  });

  it("reports the catch-up slice off the item, not off the label text", () => {
    const t = evaluateA4Items(
      [{ service: "bookkeeping-managed", entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 }, { service: "catchup", months: 3, entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 }],
      "standard",
      AFTER
    );
    expect(t.catchup).toBe(147); // 3 × 49
    expect(t.grossOneOff).toBe(147);
  });

  it("drops unpriceable items rather than sinking them into the totals", () => {
    const t = evaluateA4Items(
      [{ service: "bookkeeping-managed", entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 }, { service: "payroll", heads: -1 }],
      "standard",
      AFTER
    );
    expect(t.lines).toHaveLength(1);
    expect(t.grossMonthly).toBe(49);
  });
});

describe("IESBA independence routing", () => {
  it("rules A4 out as auditor once the basket asks us to keep the books", () => {
    const t = evaluateA4Items([{ service: "bookkeeping-managed", entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 }], "standard", AFTER);
    expect(t.wantsBookkeeping).toBe(true);
    expect(t.wantsAudit).toBe(false);
    expect(t.independenceConflict).toBe(false);
  });

  it("treats a catch-up-only basket as bookkeeping too", () => {
    const t = evaluateA4Items([{ service: "catchup", months: 6, entity: "sole", expenses: "0-10k", txn: "1-20", banks: 1 }], "standard", AFTER);
    expect(t.wantsBookkeeping).toBe(true);
  });

  it("rules A4 out of the books once the basket asks for an audit", () => {
    const t = evaluateA4Items([{ service: "audit", txn: "21-60" }], "standard", AFTER);
    expect(t.wantsAudit).toBe(true);
    expect(t.wantsBookkeeping).toBe(false);
  });

  it("treats a review engagement as an audit — it is assurance either way", () => {
    // A review is an assurance engagement and carries the same independence
    // requirement, which is why the portal's malta-pack flags every `audit`
    // item regardless of `review`. This used to assert the opposite, and that
    // disagreement is what let the DEFAULT homepage basket through the site
    // and straight into a server refusal.
    const t = evaluateA4Items([{ service: "audit", txn: "21-60", review: true }], "standard", AFTER);
    expect(t.wantsAudit).toBe(true);
  });

  it("flags the conflict when both are asked for at once", () => {
    const t = evaluateA4Items(
      [{ service: "bookkeeping-managed", entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 }, { service: "audit", txn: "21-60" }],
      "standard",
      AFTER
    );
    expect(t.independenceConflict).toBe(true);
  });

  it("flags the conflict for a review engagement alongside the books", () => {
    const t = evaluateA4Items(
      [{ service: "bookkeeping-managed", entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 }, { service: "audit", txn: "21-60", review: true }],
      "standard",
      AFTER
    );
    expect(t.independenceConflict).toBe(true);
  });

  it("carries the conclusion into the submitted selections", () => {
    const r = buildQuoteRecord(
      { name: "A", email: "a@b.com", items: [{ service: "bookkeeping-managed", entity: "sole", expenses: "0-10k", txn: "1-20", banks: 1 }], serviceStartDate: START },
      DURING
    );
    expect(r.selections.independence).toEqual({
      auditEligible: false,
      bookkeepingEligible: true,
      route: "bookkeeping",
    });
  });
});

describe("bookkeeping by monthly expenses (pack mt-2026-08-14-volume)", () => {
  /** The contract's table, restated here so a silent edit to the pack fails. */
  const TABLE: Record<ExpenseBand, { sole: number; company: number }> = {
    "0-10k": { sole: 24, company: 49 },
    "10-25k": { sole: 39, company: 69 },
    "25-50k": { sole: 59, company: 99 },
    "50-100k": { sole: 89, company: 149 },
    "100-200k": { sole: 129, company: 219 },
    "200-300k": { sole: 179, company: 299 },
    "300-400k": { sole: 229, company: 379 },
    // mt-2026-08-17-corrections (finding C1): company 449 -> 459.
    "400-500k": { sole: 279, company: 459 },
    "500k+": { sole: 339, company: 549 },
  };

  it("prices every band, for both entities, exactly as the contract says", () => {
    for (const band of EXPENSE_BANDS) {
      for (const entity of ["sole", "company"] as const) {
        const got = gross([{ service: "bookkeeping-managed", entity, expenses: band.id, txn: "1-20", banks: 1 }]).monthly;
        expect(`${entity}/${band.id} = ${got}`).toBe(`${entity}/${band.id} = ${TABLE[band.id][entity]}`);
      }
    }
  });

  it("prices the top band instantly — 500k+ is a real price, not a 'talk to us'", () => {
    // The whole point of the band: no unpriceable arm is left in bookkeeping.
    const t = evaluateA4Items(
      [{ service: "bookkeeping-managed", entity: "company", expenses: "500k+", txn: "1-20", banks: 1 }],
      "standard",
      AFTER
    );
    expect(t.lines).toHaveLength(1);
    expect(t.grossMonthly).toBe(549);
    expect(gross([{ service: "bookkeeping-managed", entity: "sole", expenses: "500k+", txn: "1-20", banks: 1 }]).monthly).toBe(339);
  });

  it("rises monotonically and never cliffs, for both entities", () => {
    for (const entity of ["sole", "company"] as const) {
      const rates = EXPENSE_BANDS.map((b) => managedMonthly(entity, b.id)!);
      for (let i = 1; i < rates.length; i++) {
        expect(rates[i]).toBeGreaterThan(rates[i - 1]);
        // Each step is a real increase but never more than a doubling.
        expect(rates[i] / rates[i - 1]).toBeLessThanOrEqual(2);
      }
    }
  });

  it("holds the entry price, so no already-issued quote is invalidated", () => {
    expect(managedMonthly("sole", "0-10k")).toBe(24);
    expect(managedMonthly("company", "0-10k")).toBe(49);
  });

  it("nulls an unknown band to the lead path, and NEVER to the cheapest band", () => {
    // This is the load-bearing one. Defaulting down is the direction that
    // loses money invisibly, so an unrecognised band must price nothing.
    for (const bad of ["", "0", "unknown", "10k", "500K+", "constructor", "toString", "__proto__"]) {
      expect(managedMonthly("company", bad as ExpenseBand)).toBeNull();
      const t = evaluateA4Items(
        [{ service: "bookkeeping-managed", entity: "company", expenses: bad as ExpenseBand, txn: "1-20", banks: 1 }],
        "standard",
        AFTER
      );
      expect(t.lines).toEqual([]);
      expect(t.grossMonthly).toBe(0);
      // Specifically NOT the entry band.
      expect(t.grossMonthly).not.toBe(24);
      expect(t.grossMonthly).not.toBe(49);
    }
  });

  it("drops a catch-up whose band is unknown rather than charging the entry rate", () => {
    expect(catchUpAmount(12, "company", "nope" as ExpenseBand, "1-20", 1)).toBeNull();
    expect(catchUpLabel(12, "company", "nope" as ExpenseBand, "1-20", 1)).toBeNull();
    const t = evaluateA4Items(
      [{ service: "catchup", months: 12, entity: "company", expenses: "nope" as ExpenseBand, txn: "1-20", banks: 1 }],
      "standard",
      AFTER
    );
    expect(t.lines).toEqual([]);
    expect(t.grossOneOff).toBe(0);
    expect(t.grossOneOff).not.toBe(588); // the entry-band figure
  });

  it("charges a backdated month at the client's OWN rate — worked example at €25–50k", () => {
    // A company at the 25-50k band pays €99/mo, so 9 backdated months is
    // 9 × 99 = 891 — NOT 9 × 49 = 441, which is what defaulting to the entry
    // band would have charged. Deliberately a non-entry band.
    const t = evaluateA4Items(
      [
        { service: "bookkeeping-managed", entity: "company", expenses: "25-50k", txn: "1-20", banks: 1 },
        { service: "catchup", months: 9, entity: "company", expenses: "25-50k", txn: "1-20", banks: 1 },
      ],
      "standard",
      AFTER
    );
    expect(t.grossMonthly).toBe(99);
    expect(t.grossOneOff).toBe(891);
    expect(t.catchup).toBe(891);
    expect(t.grossOneOff).not.toBe(9 * 49);
    // The label carries the client's own rate, in the contracted form.
    expect(catchUpLabel(9, "company", "25-50k", "1-20", 1)).toBe("Catch-up: 9 months x EUR 99 = EUR 891");
    expect(t.lines.find((l) => l.cadence === "oneoff")?.label).toBe(
      "Catch-up: 9 months x EUR 99 = EUR 891"
    );
    // And a live month costs exactly what a backdated one does: 891 / 9 = 99.
    expect(t.grossOneOff / 9).toBe(t.grossMonthly);
  });

  it("prices a sole trader's catch-up off the sole table, at a non-entry band", () => {
    // 100-200k sole = €129/mo. 6 months = 774.
    expect(catchUpAmount(6, "sole", "100-200k", "1-20", 1)).toBe(774);
    expect(catchUpLabel(6, "sole", "100-200k", "1-20", 1)).toBe("Catch-up: 6 months x EUR 129 = EUR 774");
  });

  it("keeps the other services on their own drivers, untouched by the bookkeeping band", () => {
    // VAT and audit stay on the transaction band; the tax return declares its
    // OWN entity/band (50-100k -> 715); payroll, MBR and the registered
    // office are flat. None of them move when bookkeeping joins the basket.
    const others: A4Item[] = [
      { service: "vat", txn: "21-60", vatreg: "art10" },
      { service: "taxret", entity: "company", expenses: "50-100k" },
      { service: "audit", txn: "21-60" },
      { service: "payroll", heads: 3 },
      { service: "mbr", capital: "5000" },
      { service: "registered-office" },
    ];
    const baseline = gross(others);
    expect(baseline.monthly).toBe(45 + 36);
    expect(baseline.yearly).toBe(715 + 995 + 260 + 1200);
    // Adding bookkeeping at the TOP band moves only the bookkeeping line.
    const withTopBand = gross([
      ...others,
      { service: "bookkeeping-managed", entity: "company", expenses: "500k+", txn: "1-20", banks: 1 },
    ]);
    expect(withTopBand.monthly).toBe(baseline.monthly + 549);
    expect(withTopBand.yearly).toBe(baseline.yearly);
  });
});

describe("server input bounds", () => {
  it("rejects a headcount outside 1..500, and fractional people", () => {
    const heads = (n: number) => evaluateA4Items([{ service: "payroll", heads: n }], "standard", AFTER).lines;
    expect(heads(1)).toHaveLength(1);
    expect(heads(500)).toHaveLength(1);
    expect(heads(0)).toEqual([]);
    expect(heads(501)).toEqual([]);
    expect(heads(-3)).toEqual([]);
    expect(heads(2.5)).toEqual([]);
    expect(heads(Number.NaN)).toEqual([]);
  });

  it("rejects catch-up months outside 1..240", () => {
    const m = (n: number) =>
      evaluateA4Items(
        [{ service: "catchup", months: n, entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 }],
        "standard",
        AFTER
      ).lines;
    expect(m(1)).toHaveLength(1);
    expect(m(240)).toHaveLength(1);
    expect(m(0)).toEqual([]);
    expect(m(241)).toEqual([]);
    expect(m(6.5)).toEqual([]);
  });

  it("prices the top of each range at the pack rate", () => {
    // 500 heads × €12 flat = 6,000.
    expect(gross([{ service: "payroll", heads: 500 }]).monthly).toBe(6_000);
    // 240 months = 20 years of a company's books at €49/mo, uncapped.
    expect(gross([{ service: "catchup", months: 240, entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 }]).oneOff).toBe(240 * 49);
  });

  it("rounds every line to whole euros, like the server", () => {
    // 45 × 0.6 (art. 12) × 1.45 (high) = 39.15 → €39, not 39.15
    const t = evaluateA4Items([{ service: "vat", txn: "21-60", vatreg: "art12" }], "high", AFTER);
    expect(t.lines[0].amount).toBe(39);
    expect(Number.isInteger(t.lines[0].amount)).toBe(true);
  });
});

describe("launch promo", () => {
  it("takes 25% off monthly, yearly and the catch-up line — other one-offs never", () => {
    const items: A4Item[] = [
      { service: "bookkeeping-managed", entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 }, // 49 / mo
      { service: "taxret", entity: "company", expenses: "0-10k" }, // 235 / yr
      { service: "catchup", months: 3, entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 }, // 147 one-off
    ];
    const t = evaluateA4Items(items, "standard", DURING);
    expect(t.promoApplied).toBe(true);
    expect(t.monthly).toBe(37); // 49 × 0.75 = 36.75 → 37
    expect(t.yearly).toBe(176); // 235 × 0.75 = 176.25 → 176
    // Catch-up is discounted AT ITS LINE since mt-2026-08-17-corrections
    // (finding C3): 147 × 0.75 = 110.25 → 110, and the label says so.
    expect(t.oneOff).toBe(110);
    expect(t.catchup).toBe(110);
    expect(t.lines.find((l) => l.label.startsWith("Catch-up"))!.label).toBe(
      "Catch-up: 3 months x EUR 49 = EUR 147, less 25% launch promo = EUR 110"
    );
    expect(LAUNCH_PROMO.pct).toBe(0.25);
  });

  it("exempts the MBR registry fee from the discount", () => {
    // Our €50 fee + €210 registry. Only the €50 may be discounted:
    // (260 − 210) × 0.75 + 210 = 37.5 → 38 + 210 = 248
    const t = evaluateA4Items([{ service: "mbr", capital: "5000" }], "standard", DURING);
    expect(t.grossYearly).toBe(260);
    expect(t.yearly).toBe(248);
    // Naively discounting the whole line would have produced €195.
    expect(t.yearly).not.toBe(195);
  });

  it("stops discounting once the window closes, with no code change", () => {
    const items: A4Item[] = [{ service: "bookkeeping-managed", entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 }];
    expect(evaluateA4Items(items, "standard", AFTER)).toMatchObject({
      promoApplied: false,
      monthly: 49,
    });
  });

  it("a pure catch-up basket: line discounted (self-explaining label), promo flag stays off", () => {
    // `promoApplied` still describes the monthly/yearly totals — there are
    // none here, so it is false — but the catch-up line itself carries its
    // promo inside its own label and amount (finding C3): 48 × 0.75 = 36.
    const t = evaluateA4Items([{ service: "catchup", months: 2, entity: "sole", expenses: "0-10k", txn: "1-20", banks: 1 }], "standard", DURING);
    expect(t.promoApplied).toBe(false);
    expect(t.oneOff).toBe(36);
    expect(t.lines[0].label).toContain("less 25% launch promo = EUR 36");
  });
});

describe("mixed basket, hand-computed", () => {
  // An elevated-risk (×1.2) company whose books A4 keeps, with art. 10 VAT,
  // payroll for 8, the annual return at €5,000 capital, unpriced onboarding,
  // and a year of catch-up.
  const items: A4Item[] = [
    { service: "bookkeeping-managed", entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 },
    { service: "vat", txn: "61-150", vatreg: "art10" },
    { service: "taxret", entity: "company", expenses: "0-10k" },
    { service: "payroll", heads: 8 },
    { service: "mbr", capital: "5000" },
    { service: "onboarding" },
    { service: "catchup", months: 12, entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 },
  ];

  it("totals every cadence correctly before the promo", () => {
    const t = evaluateA4Items(items, "elevated", AFTER);
    // Monthly: bookkeeping 49 (flat, NO uplift)
    //        + VAT      69 × 1.2 = 82.8 → 83
    //        + payroll  8 × 12 = 96 (flat, NO uplift — A2+A3)
    expect(t.grossMonthly).toBe(49 + 83 + 96);
    expect(t.grossMonthly).toBe(228);
    // Yearly: tax return 235 (formula off the 0-10k band, NOT × 1.2),
    //        + MBR (50 + 210) = 260
    expect(t.grossYearly).toBe(235 + 260);
    expect(t.grossYearly).toBe(495);
    // One-off: onboarding is UNPRICED, so only catch-up 12 × 49 = 588
    expect(t.grossOneOff).toBe(588);
    expect(t.catchup).toBe(588);
    expect(t.hasUnpricedOnboarding).toBe(true);
    expect(t.registryPassThrough).toBe(210);
    // Seven items in, six priced lines out — onboarding emits none.
    expect(t.lines).toHaveLength(6);
  });

  it("applies the promo to the right slices", () => {
    const t = evaluateA4Items(items, "elevated", DURING);
    expect(t.monthly).toBe(171); // 228 × 0.75 = 171
    expect(t.yearly).toBe(424); // (495 − 210) × 0.75 = 213.75 → 214, + 210 = 424
    expect(t.oneOff).toBe(441); // catch-up discounted at its line (C3): 588 × 0.75
    expect(t.catchup).toBe(441);
  });

  it("submits exactly the totals it displays", () => {
    // The record must agree with the on-screen figures, or the backend's
    // reprice disagrees and the quote silently falls back to 202 RECEIVED.
    const displayed = evaluateA4Items(items, "elevated", DURING);
    const record = buildQuoteRecord(
      { name: "A", email: "a@b.com", items, risk: "elevated", serviceStartDate: START },
      DURING
    );
    expect(record.monthly).toBe(displayed.monthly);
    expect(record.yearly).toBe(displayed.yearly);
    expect(record.oneOff).toBe(displayed.oneOff);
    expect(record.catchup).toBe(displayed.catchup);
    expect(record.lines).toEqual(displayed.lines);
  });
});

describe("call-site baskets", () => {
  // The exact baskets /pricing builds, one per tab. Each must reprice to the
  // same totals it shows, or the backend 202s and no quote email is sent.
  const baskets: Record<string, A4Item[]> = {
    "bookkeeping · self-employed": [{ service: "bookkeeping-managed", entity: "sole", expenses: "0-10k", txn: "1-20", banks: 1 }],
    "bookkeeping · company": [{ service: "bookkeeping-managed", entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 }],
    "bookkeeping · company + 12 months catch-up": [
      { service: "bookkeeping-managed", entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 },
      { service: "catchup", months: 12, entity: "company", expenses: "0-10k", txn: "1-20", banks: 1 },
    ],
    "vat · up to 20": [{ service: "vat", txn: "1-20", vatreg: "art10" }],
    "vat · 20 to 60": [{ service: "vat", txn: "21-60", vatreg: "art10" }],
    "vat · 60 to 150": [{ service: "vat", txn: "61-150", vatreg: "art10" }],
    "vat · 150 to 400": [{ service: "vat", txn: "151-400", vatreg: "art10" }],
    "audit · up to 20": [{ service: "audit", txn: "1-20" }],
    "audit · 20 to 60": [{ service: "audit", txn: "21-60" }],
    "audit · 60 to 150": [{ service: "audit", txn: "61-150" }],
  };

  for (const [label, items] of Object.entries(baskets)) {
    it(`submits what it displays — ${label}`, () => {
      const displayed = evaluateA4Items(items, "standard", DURING);
      const record = buildQuoteRecord(
        { name: "A", email: "a@b.com", items, serviceStartDate: START },
        DURING
      );
      expect(record.monthly).toBe(displayed.monthly);
      expect(record.yearly).toBe(displayed.yearly);
      expect(record.oneOff).toBe(displayed.oneOff);
      // Every basket must actually price to something, or the tab is broken.
      expect(displayed.monthly + displayed.yearly + displayed.oneOff).toBeGreaterThan(0);
      // And every item must have produced a line — a silently dropped item
      // means the visitor sees a total the server will not agree with.
      expect(record.lines).toHaveLength(items.length);
    });
  }

  it("prices the entry band for both entities — the published 'from' prices", () => {
    const at = (entity: "sole" | "company") =>
      evaluateA4Items(
        [{ service: "bookkeeping-managed", entity, expenses: "0-10k", txn: "1-20", banks: 1 }],
        "standard",
        AFTER
      ).grossMonthly;
    expect([at("sole"), at("company")]).toEqual([24, 49]);
  });
});

describe("the submitted record", () => {
  const items: A4Item[] = [{ service: "audit", txn: "21-60" }];

  it("stamps the pack version and currency the backend validates against", () => {
    const r = buildQuoteRecord({ name: "A", email: "a@b.com", items, serviceStartDate: START }, DURING);
    expect(r.pack).toBe(A4_QUOTE_PACK_VERSION);
    expect(r.pack).toBe("mt-2026-08-26c-volume");
    expect(r.currency).toBe("EUR");
    expect(r.quotedAt).toBe(DURING.toISOString());
  });

  it("carries the normalized selections, not raw UI state", () => {
    const r = buildQuoteRecord(
      { name: "A", email: "a@b.com", items, risk: "high", serviceStartDate: START },
      DURING
    );
    expect(r.selections).toEqual({
      kind: "a4-services",
      version: 1,
      risk: "high",
      serviceStartDate: START,
      items: [{ service: "audit", txn: "21-60" }],
      independence: { auditEligible: true, bookkeepingEligible: false, route: "audit" },
    });
  });

  it("sends undiscounted line detail alongside discounted totals", () => {
    const r = buildQuoteRecord({ name: "A", email: "a@b.com", items, serviceStartDate: START }, DURING);
    expect(r.lines).toEqual([
      { label: "Financial audit (if applicable)", amount: 995, cadence: "yearly" },
    ]);
    expect(r.yearly).toBe(746); // 995 × 0.75 = 746.25 → 746
  });
});
