import { describe, it, expect } from "vitest";
import { calcAccountingFee, accountingSummary, type AccountingInput } from "./accounting-fee";
import { SOFTWARE_TIERS, BOOKKEEPING_MONTHLY, LAUNCH_PROMO } from "@/data/a4QuotePack";

const base: AccountingInput = {
  sector: "shop", txn: "21-60", banks: 1, route: "review", head: 0, vatreg: "none", behind: "0",
};
// Inside the launch-promo window, so the discount branch is exercised.
const DURING_PROMO = new Date("2026-08-02T00:00:00Z");
const AFTER_PROMO = new Date("2026-09-01T12:00:00Z");
const at = (p: Partial<AccountingInput>, now = DURING_PROMO) => calcAccountingFee({ ...base, ...p }, now);

describe("accounting fee engine", () => {
  it("always bills the software plan, and picks it by volume", () => {
    expect(at({ txn: "1-20", route: "self" })).toMatchObject({ softwareTier: "Bookkeeper", monthlyFull: SOFTWARE_TIERS.book });
    expect(at({ txn: "61-150", route: "self" })).toMatchObject({ softwareTier: "Senior", monthlyFull: SOFTWARE_TIERS.senior });
    expect(at({ txn: "1000+", route: "self" })).toMatchObject({ softwareTier: "CFO", monthlyFull: SOFTWARE_TIERS.cfo });
  });

  it("charges review at 35% of the band price and full service at 100%", () => {
    const band = BOOKKEEPING_MONTHLY["21-60"]; // 99
    expect(at({ route: "review" })).toMatchObject({ monthlyFull: SOFTWARE_TIERS.book + Math.round(band * 0.35) });
    expect(at({ route: "full" })).toMatchObject({ monthlyFull: SOFTWARE_TIERS.book + band });
  });

  it("refers the sectors we do not price instantly", () => {
    expect(at({ sector: "other" })).toEqual({ refer: true });
  });

  it("applies the sector risk multiplier to our work but not to the software", () => {
    const std = at({ route: "full" }) as { monthlyFull: number };
    const high = at({ route: "full", sector: "regulated" }) as { monthlyFull: number };
    // Software (€39) is flat; only the €99 bookkeeping line takes the ×1.45.
    expect(high.monthlyFull - SOFTWARE_TIERS.book).toBe(Math.round((std.monthlyFull - SOFTWARE_TIERS.book) * 1.45));
  });

  it("bills extra bank accounts only when we are in the books", () => {
    expect(at({ banks: 3, route: "self" })).toMatchObject({ monthlyFull: SOFTWARE_TIERS.book });
    expect(at({ banks: 3, route: "full" })).toMatchObject({ monthlyFull: SOFTWARE_TIERS.book + 99 + 50 });
    expect(at({ banks: 3, route: "review" })).toMatchObject({ monthlyFull: SOFTWARE_TIERS.book + 35 + 20 });
  });

  it("prices payroll per head and gets cheaper as the team grows", () => {
    expect(at({ head: 3 })).toMatchObject({ monthlyFull: SOFTWARE_TIERS.book + 35 + 3 * 32 });
    expect(at({ head: 20 })).toMatchObject({ monthlyFull: SOFTWARE_TIERS.book + 35 + 20 * 25 });
  });

  it("distinguishes the three VAT articles instead of charging art. 10 for all", () => {
    const a10 = at({ vatreg: "art10" }) as { monthlyFull: number };
    const a12 = at({ vatreg: "art12" }) as { monthlyFull: number };
    const a11 = at({ vatreg: "art11" }) as { monthlyFull: number };
    expect(a10.monthlyFull).toBe(SOFTWARE_TIERS.book + 35 + 45); // art. 10 band price
    expect(a12.monthlyFull).toBe(SOFTWARE_TIERS.book + 35 + Math.round(45 * 0.6));
    expect(a11.monthlyFull).toBe(SOFTWARE_TIERS.book + 35 + Math.round(145 / 12));
    // Self-service files its own VAT — we do not charge for it.
    expect(at({ vatreg: "art10", route: "self" })).toMatchObject({ monthlyFull: SOFTWARE_TIERS.book });
  });

  it("caps full-service catch-up per year behind", () => {
    // 24 months at €25/mo = €600 uncapped, but the cap is 2 × €240.
    expect((at({ behind: "24", route: "full" }) as { oneOffFull: number }).oneOffFull).toBe(480);
    // Self-service catch-up is a flat €10/mo and uncapped.
    expect((at({ behind: "24", route: "self" }) as { oneOffFull: number }).oneOffFull).toBe(240);
    expect((at({ behind: "0" }) as { oneOffFull: number }).oneOffFull).toBe(0);
  });

  it("applies the launch discount while it runs and drops it afterwards", () => {
    const during = at({ route: "full" }) as { monthlyFull: number; monthlyNet: number; discountPct: number };
    expect(during.discountPct).toBe(LAUNCH_PROMO.pct);
    expect(during.monthlyNet).toBe(Math.round(during.monthlyFull * 0.75));

    const after = at({ route: "full" }, AFTER_PROMO) as { monthlyFull: number; monthlyNet: number; discountPct: number };
    expect(after.discountPct).toBe(0);
    expect(after.monthlyNet).toBe(after.monthlyFull);
  });

  it("recaps the configuration in plain language", () => {
    const s = { ...base, route: "full" as const, head: 4, vatreg: "art10" as const, behind: "6" };
    const text = accountingSummary(s, calcAccountingFee(s, DURING_PROMO));
    expect(text).toContain("we do the bookkeeping");
    expect(text).toContain("payroll for 4");
    expect(text).toContain("file your VAT");
    expect(text).toContain("catch up 6 months");
  });
});
