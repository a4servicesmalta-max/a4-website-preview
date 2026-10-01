import { describe, expect, it } from "vitest";
import {
  acceptedLineIndexes,
  buildCards,
  cardPrice,
  clientDisplayName,
  computeTotals,
  pageState,
  readLines,
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
