import { describe, it, expect } from "vitest";
import {
  buildA4Selections,
  buildQuoteRecord,
  evaluateA4Items,
  submitWebsiteQuotation,
  SOURCE_SITE,
  type A4Item,
} from "./websiteQuotation";
import { A4_QUOTE_PACK_VERSION, LAUNCH_PROMO } from "@/data/a4QuotePack";

/** Inside the launch window, and safely after it. */
const DURING = new Date("2026-08-02T12:00:00Z");
const AFTER = new Date("2026-09-01T12:00:00Z");

/** Undiscounted per-cadence totals — the arithmetic before the promo. */
const gross = (items: A4Item[], risk?: Parameters<typeof evaluateA4Items>[1]) => {
  const t = evaluateA4Items(items, risk, AFTER);
  return { monthly: t.grossMonthly, yearly: t.grossYearly, oneOff: t.grossOneOff };
};

describe("A4 selections contract", () => {
  it("wraps items in the versioned envelope the backend evaluator expects", () => {
    expect(buildA4Selections([{ service: "registered-office" }])).toEqual({
      kind: "a4-services",
      version: 1,
      risk: "standard",
      items: [{ service: "registered-office" }],
    });
  });

  it("defaults the risk tier to standard", () => {
    expect(buildA4Selections([]).risk).toBe("standard");
    expect(buildA4Selections([], "high").risk).toBe("high");
  });
});

describe("per-item pricing", () => {
  it("prices software plans flat, with no risk uplift", () => {
    expect(gross([{ service: "software", tier: "book" }]).monthly).toBe(39);
    expect(gross([{ service: "software", tier: "senior" }]).monthly).toBe(99);
    expect(gross([{ service: "software", tier: "manager" }]).monthly).toBe(198);
    expect(gross([{ service: "software", tier: "cfo" }]).monthly).toBe(357);
    // Software is a fixed product price, NOT labour: no risk uplift at any
    // tier. Applying one here would put every elevated/high-risk software
    // quote outside the server's tolerance and silently drop it to 202.
    expect(gross([{ service: "software", tier: "book" }], "elevated").monthly).toBe(39);
    expect(gross([{ service: "software", tier: "book" }], "high").monthly).toBe(39);
    expect(gross([{ service: "software", tier: "cfo" }], "high").monthly).toBe(357);
  });

  it("prices full bookkeeping off the band table, with risk uplift", () => {
    expect(gross([{ service: "bookkeeping-full", txn: "1-20" }]).monthly).toBe(59);
    expect(gross([{ service: "bookkeeping-full", txn: "21-60" }]).monthly).toBe(99);
    expect(gross([{ service: "bookkeeping-full", txn: "1000+" }]).monthly).toBe(769);
    // 99 × 1.2 = 118.8 → €119
    expect(gross([{ service: "bookkeeping-full", txn: "21-60" }], "elevated").monthly).toBe(119);
  });

  it("floors the accounting review at its minimum", () => {
    // 59 × 0.18 = 10.62 → floored at the €18 quarterly minimum
    expect(gross([{ service: "review", txn: "1-20", cadence: "quarterly" }]).monthly).toBe(18);
    // 279 × 0.18 = 50.22 → €50, above the floor
    expect(gross([{ service: "review", txn: "151-400", cadence: "quarterly" }]).monthly).toBe(50);
    // 59 × 0.35 = 20.65 → floored at the €24 monthly minimum
    expect(gross([{ service: "review", txn: "1-20", cadence: "monthly" }]).monthly).toBe(24);
    // 169 × 0.35 = 59.15 → €59
    expect(gross([{ service: "review", txn: "61-150", cadence: "monthly" }]).monthly).toBe(59);
  });

  it("has nothing to review when the band does not trade", () => {
    expect(evaluateA4Items([{ service: "review", txn: "0", cadence: "monthly" }], "standard", AFTER).lines).toEqual([]);
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
    expect(gross([{ service: "taxret", txn: "61-150" }]).yearly).toBe(420);
    expect(gross([{ service: "audit", txn: "21-60" }]).yearly).toBe(995);
    // Review engagement — 995 × 0.55 = 547.25 → €547
    expect(gross([{ service: "audit", txn: "21-60", review: true }]).yearly).toBe(547);
    // 995 × 1.45 = 1442.75 → €1,443
    expect(gross([{ service: "audit", txn: "21-60" }], "high").yearly).toBe(1443);
  });

  it("bills the whole payroll at its headcount tier", () => {
    expect(gross([{ service: "payroll", heads: 3 }]).monthly).toBe(96); // 3 × 32
    expect(gross([{ service: "payroll", heads: 5 }]).monthly).toBe(160); // 5 × 32
    expect(gross([{ service: "payroll", heads: 8 }]).monthly).toBe(232); // 8 × 29, not 5×32+3×29
    expect(gross([{ service: "payroll", heads: 20 }]).monthly).toBe(500); // 20 × 25
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

  it("prices onboarding off the risk tier", () => {
    expect(gross([{ service: "onboarding" }]).oneOff).toBe(95);
    expect(gross([{ service: "onboarding" }], "elevated").oneOff).toBe(250);
    expect(gross([{ service: "onboarding" }], "high").oneOff).toBe(550);
  });

  it("caps full-service catch-up per year and charges self-service per month", () => {
    expect(gross([{ service: "catchup", months: 6, mode: "self" }]).oneOff).toBe(60); // 6 × 10
    expect(gross([{ service: "catchup", months: 6, mode: "full" }]).oneOff).toBe(150); // 6 × 25 < 240
    // 24 × 25 = 600, but the cap is 2 × 240
    expect(gross([{ service: "catchup", months: 24, mode: "full" }]).oneOff).toBe(480);
    expect(evaluateA4Items([{ service: "catchup", months: 0, mode: "full" }], "standard", AFTER).lines).toEqual([]);
  });

  it("drops unpriceable items rather than sinking them into the totals", () => {
    const t = evaluateA4Items(
      [{ service: "software", tier: "book" }, { service: "payroll", heads: -1 }],
      "standard",
      AFTER
    );
    expect(t.lines).toHaveLength(1);
    expect(t.grossMonthly).toBe(39);
  });
});

describe("launch promo", () => {
  it("takes 25% off monthly and yearly, never off one-offs", () => {
    const items: A4Item[] = [
      { service: "bookkeeping-full", txn: "21-60" }, // 99 / mo
      { service: "taxret", txn: "21-60" }, // 325 / yr
      { service: "onboarding" }, // 95 one-off
    ];
    const t = evaluateA4Items(items, "standard", DURING);
    expect(t.promoApplied).toBe(true);
    expect(t.monthly).toBe(74); // 99 × 0.75 = 74.25 → 74
    expect(t.yearly).toBe(244); // 325 × 0.75 = 243.75 → 244
    expect(t.oneOff).toBe(95); // untouched
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
    const items: A4Item[] = [{ service: "bookkeeping-full", txn: "21-60" }];
    expect(evaluateA4Items(items, "standard", AFTER)).toMatchObject({
      promoApplied: false,
      monthly: 99,
    });
  });

  it("does not claim a discount on a basket of pure one-offs", () => {
    const t = evaluateA4Items([{ service: "onboarding" }], "standard", DURING);
    expect(t.promoApplied).toBe(false);
    expect(t.oneOff).toBe(95);
  });
});

describe("mixed basket, hand-computed", () => {
  // An elevated-risk (×1.2) company that keeps its own books on the Senior
  // plan, with a quarterly review, art. 10 VAT, payroll for 8, the annual
  // return at €5,000 capital, onboarding, and a year of catch-up.
  const items: A4Item[] = [
    { service: "software", tier: "senior" },
    { service: "review", txn: "61-150", cadence: "quarterly" },
    { service: "vat", txn: "61-150", vatreg: "art10" },
    { service: "taxret", txn: "61-150" },
    { service: "payroll", heads: 8 },
    { service: "mbr", capital: "5000" },
    { service: "onboarding" },
    { service: "catchup", months: 12, mode: "self" },
  ];

  it("totals every cadence correctly before the promo", () => {
    const t = evaluateA4Items(items, "elevated", AFTER);
    // Monthly: software 99 (no uplift)
    //        + review   max(18, 169 × 0.18 = 30.42) × 1.2 = 36.504 → 37
    //        + VAT      69 × 1.2 = 82.8            → 83
    //        + payroll  8 × 29 = 232 × 1.2 = 278.4 → 278
    expect(t.grossMonthly).toBe(99 + 37 + 83 + 278);
    expect(t.grossMonthly).toBe(497);
    // Yearly: tax return 420 × 1.2 = 504, + MBR (50 + 210) = 260
    expect(t.grossYearly).toBe(504 + 260);
    expect(t.grossYearly).toBe(764);
    // One-off: onboarding 250 (elevated) + catch-up 12 × 10 = 120
    expect(t.grossOneOff).toBe(370);
    expect(t.catchup).toBe(120);
    expect(t.registryPassThrough).toBe(210);
    expect(t.lines).toHaveLength(8);
  });

  it("applies the promo to the right slices", () => {
    const t = evaluateA4Items(items, "elevated", DURING);
    expect(t.monthly).toBe(373); // 497 × 0.75 = 372.75 → 373
    expect(t.yearly).toBe(626); // (764 − 210) × 0.75 = 416, + 210 = 626
    expect(t.oneOff).toBe(370); // one-offs never discounted
  });

  it("submits exactly the totals it displays", () => {
    // The record must agree with the on-screen figures, or the backend's
    // reprice disagrees and the quote silently falls back to 202 RECEIVED.
    const displayed = evaluateA4Items(items, "elevated", DURING);
    const record = buildQuoteRecord(
      { name: "A", email: "a@b.com", items, risk: "elevated" },
      DURING
    );
    expect(record.monthly).toBe(displayed.monthly);
    expect(record.yearly).toBe(displayed.yearly);
    expect(record.oneOff).toBe(displayed.oneOff);
    expect(record.catchup).toBe(displayed.catchup);
    expect(record.lines).toEqual(displayed.lines);
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
      evaluateA4Items([{ service: "catchup", months: n, mode: "full" }], "standard", AFTER).lines;
    expect(m(1)).toHaveLength(1);
    expect(m(240)).toHaveLength(1);
    expect(m(0)).toEqual([]);
    expect(m(241)).toEqual([]);
    expect(m(6.5)).toEqual([]);
  });

  it("prices the top of each range at the pack rate", () => {
    // 500 heads is comfortably past the >10 tier, so €25/head throughout.
    expect(gross([{ service: "payroll", heads: 500 }]).monthly).toBe(12_500);
    // 240 months = 20 years, capped at 20 × €240.
    expect(gross([{ service: "catchup", months: 240, mode: "full" }]).oneOff).toBe(4_800);
  });

  it("rounds every line to whole euros, like the server", () => {
    // 45 × 0.6 (art. 12) × 1.45 (high) = 39.15 → €39, not 39.15
    const t = evaluateA4Items([{ service: "vat", txn: "21-60", vatreg: "art12" }], "high", AFTER);
    expect(t.lines[0].amount).toBe(39);
    expect(Number.isInteger(t.lines[0].amount)).toBe(true);
  });
});

describe("call-site baskets", () => {
  // The exact baskets /pricing builds, one per tab. Each must reprice to the
  // same totals it shows, or the backend 202s and no quote email is sent.
  const baskets: Record<string, A4Item[]> = {
    "accounting · Bookkeeper": [{ service: "software", tier: "book" }],
    "accounting · Senior": [{ service: "software", tier: "senior" }],
    "accounting · Manager": [{ service: "software", tier: "manager" }],
    "accounting · CFO": [{ service: "software", tier: "cfo" }],
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
      const record = buildQuoteRecord({ name: "A", email: "a@b.com", items }, DURING);
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

  it("prices the ladder tabs at the advertised ladder totals", () => {
    const at = (tier: "book" | "senior" | "manager" | "cfo") =>
      evaluateA4Items([{ service: "software", tier }], "standard", AFTER).grossMonthly;
    expect([at("book"), at("senior"), at("manager"), at("cfo")]).toEqual([39, 99, 198, 357]);
  });
});

describe("the submitted record", () => {
  const items: A4Item[] = [{ service: "audit", txn: "21-60" }];

  it("stamps the pack version and currency the backend validates against", () => {
    const r = buildQuoteRecord({ name: "A", email: "a@b.com", items }, DURING);
    expect(r.pack).toBe(A4_QUOTE_PACK_VERSION);
    expect(r.pack).toBe("mt-2026-08-02b");
    expect(r.currency).toBe("EUR");
    expect(r.quotedAt).toBe(DURING.toISOString());
  });

  it("carries the normalized selections, not raw UI state", () => {
    const r = buildQuoteRecord({ name: "A", email: "a@b.com", items, risk: "high" }, DURING);
    expect(r.selections).toEqual({
      kind: "a4-services",
      version: 1,
      risk: "high",
      items: [{ service: "audit", txn: "21-60" }],
    });
  });

  it("sends undiscounted line detail alongside discounted totals", () => {
    const r = buildQuoteRecord({ name: "A", email: "a@b.com", items }, DURING);
    expect(r.lines).toEqual([
      { label: "Financial audit (if applicable)", amount: 995, cadence: "yearly" },
    ]);
    expect(r.yearly).toBe(746); // 995 × 0.75 = 746.25 → 746
  });
});

describe("submission", () => {
  const items: A4Item[] = [{ service: "audit", txn: "21-60" }];

  /** Capture the outgoing request without hitting the network. */
  function captureSubmit(response: { ok: boolean; body?: unknown }) {
    const calls: { url: string; body: Record<string, unknown> }[] = [];
    const original = globalThis.fetch;
    globalThis.fetch = (async (url: string, init: { body: string }) => {
      calls.push({ url: String(url), body: JSON.parse(init.body) });
      return {
        ok: response.ok,
        json: async () => response.body ?? {},
      } as unknown as Response;
    }) as unknown as typeof fetch;
    return { calls, restore: () => { globalThis.fetch = original; } };
  }

  it("declares the originating site so the backend can set sourceSite", async () => {
    const { calls, restore } = captureSubmit({ ok: true, body: { data: { reference: "Q-1", status: "QUOTED" } } });
    try {
      const res = await submitWebsiteQuotation({ name: "A", email: "a@b.com", items });
      expect(res.status).toBe("quoted");
    } finally {
      restore();
    }
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toContain("/public/website-quotations");
    // The enum the backend accepts is ['vacei','a4'] — vacei.com sends the
    // other member from the same contract.
    expect(calls[0].body.site).toBe("a4");
    expect(SOURCE_SITE).toBe("a4");
  });

  it("refuses to post a basket with nothing priceable in it", async () => {
    const { calls, restore } = captureSubmit({ ok: true });
    try {
      const res = await submitWebsiteQuotation({ name: "A", email: "a@b.com", items: [] });
      expect(res.status).toBe("error");
    } finally {
      restore();
    }
    expect(calls).toHaveLength(0);
  });
});
