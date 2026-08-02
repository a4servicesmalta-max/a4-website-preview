import { describe, it, expect } from "vitest";
import { calcAuditFee, feeLines, type AuditInput } from "./audit-fee";

const base: AuditInput = {
  sector: "shop", txn: "21-60", size: "small", pay: "none", vat: "no", banks: "1",
  taxret: "no", year: "2025", nyrs: "2", chg: "no", uploaded: false, doc: "fs",
};
const at = (p: Partial<AuditInput>) => calcAuditFee({ ...base, ...p });

describe("audit fee engine", () => {
  it("prices the default small company as a review engagement", () => {
    const r = at({});
    // 1150 assure × 0.55 review = 632.50 → rounded to the nearest €50
    expect(r).toMatchObject({ refer: false, fee: 650, final: 650, review: true, yearsN: 1 });
  });

  it("never goes below the €750 floor", () => {
    expect(at({ txn: "0" })).toMatchObject({ fee: 750, final: 750 });
  });

  it("refers the sectors we do not price instantly", () => {
    expect(at({ sector: "other" })).toEqual({ refer: true, tier: expect.objectContaining({ refer: true }) });
  });

  it("drops the review discount once the company is big or the volume is heavy", () => {
    expect(at({ size: "big" })).toMatchObject({ review: false, fee: 1150 });
    expect(at({ txn: "151-400" })).toMatchObject({ review: false, bigVol: true, fee: 2600 });
  });

  it("stacks payroll, VAT, bank and sector-risk loadings", () => {
    // (5800 + 450 + 250 + 150) × 1.45 = 9642.50 → €9,650, plus 1650 × 1.45 tax return
    const r = at({ sector: "regulated", txn: "1000+", size: "big", pay: "21+", vat: "yes", banks: "4+", taxret: "yes" });
    expect(r).toMatchObject({ payAdd: 450, vatAdd: 150, bankAdd: 250, taxAdd: 2393, fee: 12043 });
  });

  it("passes the full 20% planning saving on for audited prior-year statements", () => {
    const r = at({ txn: "151-400", size: "big", uploaded: true, doc: "fs" });
    expect(r).toMatchObject({ disc: 0.2, fee: 2600, final: 2100 });
  });

  it("halves the saving when the file is a weaker guide", () => {
    expect(at({ txn: "151-400", size: "big", uploaded: true, doc: "mgmt" })).toMatchObject({ disc: 0.1, final: 2350 });
    expect(at({ txn: "151-400", size: "big", uploaded: true, doc: "fs", chg: "yes" })).toMatchObject({ disc: 0.05, final: 2450 });
  });

  it("refuses to discount below the floor instead of faking a saving", () => {
    const r = at({ txn: "0", uploaded: true, doc: "fs" });
    expect(r).toMatchObject({ disc: 0, fee: 750, final: 750 });
    expect(r.refer === false && r.reasons[0]).toMatch(/no honest room/);
  });

  it("multiplies the total by the number of years to audit", () => {
    const r = at({ year: "multi", nyrs: "3" });
    expect(r).toMatchObject({ yearsN: 3, final: 650, total: 1950 });
  });

  it("itemises every euro of the quote", () => {
    const s = { ...base, sector: "regulated", txn: "1000+", size: "big", pay: "21+", vat: "yes", banks: "4+", taxret: "yes" };
    const keys = feeLines(s, calcAuditFee(s)).map((l) => l.k);
    expect(keys).toEqual([
      "Sector risk", "Transactions", "Engagement",
      "Payroll · 21 or more", "VAT registered", "Bank accounts · four or more", "Annual tax return",
    ]);
  });
});
