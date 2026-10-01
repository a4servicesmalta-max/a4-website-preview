import { describe, expect, it } from "vitest";
import { RETAINER, retainerFor, retainerGroup, type RetainerLine } from "./retainer";

/** Shared vectors — the backend and partner-portal mirrors assert the same results. */
export const RETAINER_VECTORS: { name: string; lines: RetainerLine[]; monthly: number; offered: boolean; registry: number; oneOff: number; ownAnnual: number }[] = [
  {
    name: "A freelancer: books, VAT, tax return",
    lines: [
      { label: "Bookkeeping — managed (self-employed)", amount: 24, cadence: "monthly" },
      { label: "VAT returns", amount: 29, cadence: "monthly" },
      { label: "Annual tax return", amount: 115, cadence: "yearly" },
    ],
    monthly: 59,
    offered: true,
    registry: 0,
    oneOff: 0,
    ownAnnual: 751,
  },
  {
    name: "B small trading company",
    lines: [
      { label: "Bookkeeping — managed (company)", amount: 69, cadence: "monthly" },
      { label: "Bookkeeping — volume uplift", amount: 10, cadence: "monthly" },
      { label: "Additional bank accounts (1 x EUR 52)", amount: 52, cadence: "monthly" },
      { label: "VAT returns", amount: 45, cadence: "monthly" },
      { label: "Payroll", amount: 36, cadence: "monthly" },
      { label: "Annual tax return", amount: 331, cadence: "yearly" },
      { label: "Registered office", amount: 1200, cadence: "yearly" },
      { label: "Annual return — filed with the MBR", amount: 150, cadence: "yearly" },
    ],
    monthly: 325,
    offered: true,
    registry: 100,
    oneOff: 0,
    ownAnnual: 4125,
  },
  {
    name: "C restaurant company with catch-up (step €10 from €500)",
    lines: [
      { label: "Bookkeeping — managed (company)", amount: 149, cadence: "monthly" },
      { label: "Bookkeeping — volume uplift", amount: 25, cadence: "monthly" },
      { label: "Additional bank accounts (2 x EUR 66)", amount: 132, cadence: "monthly" },
      { label: "VAT returns", amount: 83, cadence: "monthly" },
      { label: "Payroll", amount: 144, cadence: "monthly" },
      { label: "Annual tax return", amount: 715, cadence: "yearly" },
      { label: "Registered office", amount: 1200, cadence: "yearly" },
      { label: "Annual return — filed with the MBR", amount: 344, cadence: "yearly" },
      { label: "Catch-up: 6 months x EUR 306 = EUR 1836", amount: 1836, cadence: "one-off" },
    ],
    monthly: 660,
    offered: true,
    registry: 294,
    oneOff: 1836,
    ownAnnual: 8361,
  },
  {
    name: "D audit-side holding company: nothing monthly",
    lines: [
      { label: "Annual tax return", amount: 235, cadence: "yearly" },
      { label: "Review engagement (if applicable)", amount: 495, cadence: "yearly" },
      { label: "Registered office", amount: 1200, cadence: "yearly" },
      { label: "Annual return — filed with the MBR", amount: 150, cadence: "yearly" },
    ],
    monthly: 0,
    offered: false,
    registry: 100,
    oneOff: 0,
    ownAnnual: 1485,
  },
  {
    name: "E bookkeeping alone: one service",
    lines: [{ label: "Bookkeeping — managed (company)", amount: 49, cadence: "monthly" }],
    monthly: 0,
    offered: false,
    registry: 0,
    oneOff: 0,
    ownAnnual: 588,
  },
];

describe("retainerFor", () => {
  for (const v of RETAINER_VECTORS) {
    it(v.name, () => {
      const r = retainerFor(v.lines);
      expect(r.offered).toBe(v.offered);
      expect(r.monthly).toBe(v.monthly);
      expect(r.registryYearly).toBe(v.registry);
      expect(r.oneOff).toBe(v.oneOff);
      expect(r.ownAnnual).toBe(v.ownAnnual);
      if (r.offered) {
        // Slightly less, never more than 10% off.
        expect(r.monthly * 12).toBeLessThan(r.ownAnnual);
        expect(r.savingPct).toBeGreaterThan(0);
        expect(r.savingPct).toBeLessThanOrEqual(RETAINER.maxDiscountPct);
      }
    });
  }

  it("keeps the audit outside and says why", () => {
    const r = retainerFor([
      { label: "Annual tax return", amount: 331, cadence: "yearly" },
      { label: "Payroll", amount: 24, cadence: "monthly" },
      { label: "Financial audit (if applicable)", amount: 750, cadence: "yearly" },
    ]);
    expect(r.offered).toBe(true);
    expect(r.outside.map((o) => o.reason)).toEqual(["audit"]);
    expect(r.covered).toEqual([0, 1]);
  });

  it("follows the client's selection", () => {
    const B = RETAINER_VECTORS[1].lines;
    // Only bookkeeping lines selected → one service → not offered.
    expect(retainerFor(B, [0, 1, 2]).offered).toBe(false);
    // Bookkeeping + VAT.
    const r = retainerFor(B, [0, 1, 2, 3]);
    expect(r.offered).toBe(true);
    expect(r.ownAnnual).toBe(12 * (69 + 10 + 52 + 45));
  });

  it("groups the site's and the backend's labels alike", () => {
    expect(retainerGroup("Managed bookkeeping — Company")).toBe("bookkeeping");
    expect(retainerGroup("Additional bank accounts · 2 × €52")).toBe("bookkeeping");
    expect(retainerGroup("VAT declaration (art. 11)")).toBe("vat");
    expect(retainerGroup("Annual return — filed with the MBR")).toBe("corporate");
    expect(retainerGroup("Registered office")).toBe("corporate");
  });
});
