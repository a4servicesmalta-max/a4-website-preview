import { describe, expect, it } from "vitest";
import {
  acceptPlan,
  acceptedLineIndexes,
  buildCards,
  cardPrice,
  clientDisplayName,
  computeRetainerTotals,
  computeTotals,
  pageState,
  quoteRetainer,
  readLines,
  retainerUnavailableText,
} from "./quotation-page";

// Fictional figures in the shape the portal backend issues.
const ITEMS = [
  { label: "Managed bookkeeping — Limited company", amount: 149, cadence: "monthly" },
  { label: "Bookkeeping — volume uplift", amount: 25, cadence: "monthly" },
  { label: "VAT returns", amount: 45, cadence: "monthly" },
  { label: "Annual tax return", amount: 715, cadence: "yearly" },
  { label: "Annual return — filed with the MBR", amount: 150, cadence: "yearly" },
  { label: "Catch-up: 3 months x EUR 174 = EUR 522", amount: 522, cadence: "one-off" },
];

describe("quotation page cards", () => {
  const lines = readLines(ITEMS);
  const cards = buildCards(lines);

  it("groups lines into services in the order a client reads them", () => {
    expect(cards.map((c) => c.key)).toEqual(["acc", "catch", "vat", "tax", "csp"]);
    expect(cards[0].lines.map((l) => l.index)).toEqual([0, 1]);
    expect(cards[0].monthly).toBe(174);
  });

  it("keeps every fee in its own cadence in the monthly view", () => {
    expect(cardPrice(cards[0], "monthly")).toMatchObject({ amount: 174, per: "/ mo" });
    expect(cardPrice(cards[3], "monthly")).toMatchObject({ amount: 715, per: "/ yr" });
    expect(cardPrice(cards[1], "monthly")).toMatchObject({ amount: 522, per: "one-off" });
    expect(cardPrice(cards[0], "year")).toMatchObject({ amount: 2088, per: "first year" });
  });

  it("monthly headline covers monthly fees and lists the rest", () => {
    const on = new Set(cards.map((c) => c.key));
    const t = computeTotals(lines, cards, on, "monthly");
    expect(t.net).toBe(219);
    expect(t.vat).toBe(39.42);
    expect(t.total).toBe(258.42);
    expect(t.alsoYearly).toBe(865);
    expect(t.alsoOneOff).toBe(522);
  });

  it("first-year total includes everything, with no VAT on the registry fee", () => {
    const on = new Set(cards.map((c) => c.key));
    const t = computeTotals(lines, cards, on, "year");
    // 219×12 + 865 + 522
    expect(t.net).toBe(4015);
    // registry = 150 − 50 (our fee) = 100 → VAT on 3,915
    expect(t.registry).toBe(100);
    expect(t.vat).toBe(704.7);
    expect(t.per).toBe("first year");
  });

  it("switching a service off removes it from totals and from the accepted lines", () => {
    const on = new Set(["acc", "tax"]);
    expect(acceptedLineIndexes(cards, on)).toEqual([0, 1, 3]);
    const t = computeTotals(lines, cards, on, "monthly");
    expect(t.net).toBe(174);
    expect(t.count).toBe(2);
  });

  it("adjustment lines never become cards but follow their cadence", () => {
    const withAdj = readLines([...ITEMS, { label: "Adjustment", amount: -10, cadence: "monthly" }]);
    const c = buildCards(withAdj);
    expect(c.some((x) => x.key.startsWith("other"))).toBe(false);
    expect(computeTotals(withAdj, c, new Set(["vat"]), "monthly").net).toBe(35);
    expect(computeTotals(withAdj, c, new Set(["tax"]), "monthly").net).toBe(715);
  });

  it("an audit-only quote has no monthly view to offer", () => {
    const l = readLines([{ label: "Financial audit (if applicable)", amount: 1450, cadence: "yearly" }]);
    const c = buildCards(l);
    expect(c[0].word).toBe("Audit");
    const t = computeTotals(l, c, new Set(["aud"]), "monthly");
    expect(t.per).toBe("/ yr");
    expect(t.net).toBe(1450);
  });

  it("staff-typed lines without a cadence still render", () => {
    const l = readLines([{ label: "Advisory — board pack", amount: 600 }, { label: "Group reporting pack", amount: 400 }]);
    const c = buildCards(l);
    expect(c.map((x) => x.word)).toEqual(["Advisory", "Group"]);
    expect(cardPrice(c[0], "monthly")).toMatchObject({ amount: 600, per: "fixed fee" });
  });
});

describe("quotation page retainer", () => {
  const lines = readLines(ITEMS);
  const cards = buildCards(lines);
  const all = new Set(cards.map((c) => c.key));

  it("prices every ticked service as one monthly retainer, with the rest outside", () => {
    const t = computeRetainerTotals(lines, cards, all);
    // Own fees a year: 219×12 + 715 + (150 − 100 registry) = 3,393 → ×95% ÷ 12 = 268.6 → €265 (step €5).
    expect(t.retainer.offered).toBe(true);
    expect(t.retainer.ownAnnual).toBe(3393);
    expect(t.net).toBe(265);
    expect(t.vat).toBe(47.7);
    expect(t.total).toBe(312.7);
    expect(t.per).toBe("/ mo");
    expect(t.retainer.savingYearly).toBe(3393 - 265 * 12);
    expect([...t.covered]).toEqual([0, 1, 2, 3, 4]);
    // Outside: the registry part of the MBR line, and the catch-up.
    expect(t.registryYearly).toBe(100);
    expect(t.alsoYearly).toBe(100);
    expect(t.alsoOneOff).toBe(522);
    expect(t.firstYear).toBe(265 * 12 + 100 + 522);
    // No VAT on the registry fee.
    expect(t.firstYearVat).toBe(666.36);
    expect(t.count).toBe(5);
  });

  it("matches the canonical vector B through the page's own line reader", () => {
    const b = readLines([
      { label: "Bookkeeping — managed (company)", amount: 69, cadence: "monthly" },
      { label: "Bookkeeping — volume uplift", amount: 10, cadence: "monthly" },
      { label: "Additional bank accounts (1 x EUR 52)", amount: 52, cadence: "monthly" },
      { label: "VAT returns", amount: 45, cadence: "monthly" },
      { label: "Payroll", amount: 36, cadence: "monthly" },
      { label: "Annual tax return", amount: 331, cadence: "yearly" },
      { label: "Registered office", amount: 1200, cadence: "yearly" },
      { label: "Annual return — filed with the MBR", amount: 150, cadence: "yearly" },
    ]);
    const t = computeRetainerTotals(b, buildCards(b), new Set(buildCards(b).map((c) => c.key)));
    expect(t.net).toBe(325);
    expect(t.registryYearly).toBe(100);
  });

  it("follows the services switched on, and says why when it no longer applies", () => {
    const acc = computeRetainerTotals(lines, cards, new Set(["acc"]));
    expect(acc.retainer.offered).toBe(false);
    expect(retainerUnavailableText(acc.retainer.reason)).toBe("The retainer needs at least two services.");
    const yearlyOnly = computeRetainerTotals(lines, cards, new Set(["tax", "csp"]));
    expect(yearlyOnly.retainer.reason).toBe("no-monthly-service");
    expect(computeRetainerTotals(lines, cards, new Set(["catch"])).retainer.reason).toBe("nothing-recurring");
    const accVat = computeRetainerTotals(lines, cards, new Set(["acc", "vat"]));
    expect(accVat.retainer.offered).toBe(true);
    expect(accVat.retainer.ownAnnual).toBe(219 * 12);
    expect(accVat.alsoOneOff).toBe(0);
  });

  it("keeps audit fees outside, per year", () => {
    const l = readLines([
      { label: "Managed bookkeeping — Limited company", amount: 99, cadence: "monthly" },
      { label: "VAT returns", amount: 45, cadence: "monthly" },
      { label: "Financial audit (if applicable)", amount: 1450, cadence: "yearly" },
    ]);
    const c = buildCards(l);
    const t = computeRetainerTotals(l, c, new Set(c.map((x) => x.key)));
    expect(t.retainer.offered).toBe(true);
    expect(t.auditYearly).toBe(1450);
    expect(t.alsoYearly).toBe(1450);
    expect(t.covered.has(2)).toBe(false);
  });

  it("reports lineItems indexes even when a malformed row was skipped", () => {
    const l = readLines([null, ...ITEMS]);
    expect(l[0].index).toBe(1);
    const r = quoteRetainer(l, [1, 3, 6, 99]);
    // Bookkeeping (1) + VAT (3) inside, the catch-up (6) outside; an unknown index is ignored.
    expect(r.covered).toEqual([1, 3]);
    expect(r.outside).toEqual([expect.objectContaining({ index: 6, reason: "one-off" })]);
  });

  it("records the plan and billing the client accepted in", () => {
    expect(acceptPlan("retainer")).toEqual({ plan: "retainer", billing: "monthly" });
    expect(acceptPlan("monthly")).toEqual({ plan: "separate", billing: "monthly" });
    expect(acceptPlan("year")).toEqual({ plan: "separate", billing: "annual" });
  });
});

describe("quotation page state", () => {
  it("expires on validUntil even before the backend flips the status", () => {
    expect(pageState({ status: "SENT", validUntil: "2026-09-01T00:00:00Z" }, new Date("2026-10-01"))).toBe("expired");
    expect(pageState({ status: "SENT", validUntil: "2026-11-01T00:00:00Z" }, new Date("2026-10-01"))).toBe("open");
    expect(pageState({ status: "ACCEPTED", validUntil: "2026-09-01T00:00:00Z" }, new Date("2026-10-01"))).toBe("accepted");
  });

  it("addresses the business before the person", () => {
    expect(clientDisplayName({ companyName: "Harborlight Ltd", contactName: "Pat", clientName: null, clientEmail: "p@x.mt" })).toBe("Harborlight Ltd");
    expect(clientDisplayName({ companyName: null, contactName: "Pat Quill", clientName: null, clientEmail: "p@x.mt" })).toBe("Pat Quill");
    expect(clientDisplayName({ companyName: null, contactName: null, clientName: null, clientEmail: "pat@x.mt" })).toBe("pat");
  });
});
