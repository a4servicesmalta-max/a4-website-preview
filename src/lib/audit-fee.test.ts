import { describe, it, expect } from "vitest";
import { calcAuditFee, feeLines, TXN, type AuditInput } from "./audit-fee";
import { AUDIT_YEARLY, AUDIT_FROM, AUDIT_PRE_TRADING } from "@/data/a4QuotePack";

const base: AuditInput = {
  sector: "shop", txn: "21-60", size: "small", pay: "none", vat: "no", banks: "1",
  taxret: "no", year: "2025", nyrs: "2", chg: "no", uploaded: false, doc: "fs",
};
const at = (p: Partial<AuditInput>) => calcAuditFee({ ...base, ...p });

describe("audit fee engine", () => {
  it("takes every fee from the price pack, never a local copy", () => {
    expect(TXN.map((t) => t.assure)).toEqual(TXN.map((t) => AUDIT_YEARLY[t.id]));
  });

  it("prices the default small company as a review engagement", () => {
    const r = at({});
    // 995 assure × 0.55 review = 547.50, which lands under the €600 floor
    expect(r).toMatchObject({ refer: false, fee: 600, final: 600, review: true, yearsN: 1 });
  });

  it("never goes below the pre-trading floor", () => {
    // The advertised "from" is the cheapest TRADING company, not the dormant one.
    expect(AUDIT_FROM).toBe(750);
    expect(AUDIT_PRE_TRADING).toBe(600);
    expect(at({ txn: "0" })).toMatchObject({ fee: 600, final: 600 });
    // Any company that actually trades starts at the advertised floor.
    expect(at({ txn: "1-20", size: "big" })).toMatchObject({ fee: AUDIT_FROM });
  });

  it("refers the sectors we do not price instantly", () => {
    expect(at({ sector: "other" })).toEqual({ refer: true, tier: expect.objectContaining({ refer: true }) });
  });

  it("drops the review discount once the company is big or the volume is heavy", () => {
    expect(at({ size: "big" })).toMatchObject({ review: false, fee: 1000 });
    expect(at({ txn: "151-400" })).toMatchObject({ review: false, bigVol: true, fee: 1950 });
  });

  it("stacks payroll, VAT, bank and sector-risk loadings", () => {
    // (3650 + 450 + 250 + 150) × 1.45 = 6525 → €6,550, plus 1040 × 1.45 tax return
    const r = at({ sector: "regulated", txn: "1000+", size: "big", pay: "21+", vat: "yes", banks: "4+", taxret: "yes" });
    expect(r).toMatchObject({ payAdd: 450, vatAdd: 150, bankAdd: 250, taxAdd: 1508, fee: 8058 });
  });

  it("passes the full 20% planning saving on for audited prior-year statements", () => {
    const r = at({ txn: "151-400", size: "big", uploaded: true, doc: "fs" });
    expect(r).toMatchObject({ disc: 0.2, fee: 1950, final: 1550 });
  });

  it("halves the saving when the file is a weaker guide", () => {
    expect(at({ txn: "151-400", size: "big", uploaded: true, doc: "mgmt" })).toMatchObject({ disc: 0.1, final: 1750 });
    expect(at({ txn: "151-400", size: "big", uploaded: true, doc: "fs", chg: "yes" })).toMatchObject({ disc: 0.05, final: 1850 });
  });

  it("refuses to discount below the floor instead of faking a saving", () => {
    const r = at({ txn: "0", uploaded: true, doc: "fs" });
    expect(r).toMatchObject({ disc: 0, fee: 600, final: 600 });
    expect(r.refer === false && r.reasons[0]).toMatch(/no honest room/);
  });

  it("multiplies the total by the number of years to audit", () => {
    const r = at({ year: "multi", nyrs: "3" });
    expect(r).toMatchObject({ yearsN: 3, final: 600, total: 1800 });
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
