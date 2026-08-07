/**
 * The canonical homepage-calculator path, pinned.
 *
 * Shop/trade · 20–60 transactions · 2 on payroll · records up to date ·
 * VAT registered · default services. Every question added to this wizard must
 * default so that THIS quote does not move — a new question that changes the
 * price for a visitor who never touched it is a silent repricing.
 *
 * The two questions added for audit task 3 (bank accounts, authorised share
 * capital) are covered both at their defaults and off them, so the pack's
 * registry-fee table and extra-bank rate can never be replaced by a literal.
 */

import { describe, it, expect } from "vitest";
import { qCalc, Q_INIT, type QState } from "./LandingQuoteCalculator";
import { CAPITAL_BANDS, MBR_ANNUAL_RETURN, EXTRA_BANK_MONTHLY } from "@/data/a4QuotePack";

/** Where the wizard lands after "Software + accountants" and six Next clicks. */
const CANONICAL: QState = { ...Q_INIT, step: 7, book: "full", pay: "we", assure: "we" };

const line = (r: ReturnType<typeof qCalc>, n: string) =>
  [...r.mo, ...r.yr, ...r.one].find((l) => l.n === n);

describe("the canonical quote", () => {
  const r = qCalc(CANONICAL);

  it("defaults to one bank account and the €1,500 capital band", () => {
    expect(Q_INIT.banks).toBe(1);
    expect(Q_INIT.cap).toBe("1500");
  });

  it("holds the pinned totals", () => {
    if (r.refer) throw new Error("the canonical path must be priceable");
    expect(r.moTot).toBe(163); // bookkeeping 99 + payroll 2 × 32
    expect(r.yrTot).toBe(647); // review engagement 547 + MBR registry 100
    expect(r.oneTot).toBe(95); // standard-risk onboarding
  });

  it("adds nothing for the new questions at their defaults", () => {
    expect(line(r, "Additional bank accounts")).toBeUndefined();
    expect(line(r, "MBR annual return fee")?.v).toBe(MBR_ANNUAL_RETURN.registryFeeByCapital["1500"]);
  });
});

describe("authorised share capital", () => {
  it("prices every band off the pack's registry table, never a literal", () => {
    for (const band of CAPITAL_BANDS) {
      const r = qCalc({ ...CANONICAL, cap: band.id });
      if (r.refer) throw new Error("unpriceable");
      expect(line(r, "MBR annual return fee")?.v).toBe(MBR_ANNUAL_RETURN.registryFeeByCapital[band.id]);
    }
  });

  it("stops under-quoting companies above the smallest band", () => {
    const small = qCalc({ ...CANONICAL, cap: "1500" });
    const large = qCalc({ ...CANONICAL, cap: "50000" });
    if (small.refer || large.refer) throw new Error("unpriceable");
    expect(large.yrTot - small.yrTot).toBe(379 - 100);
  });
});

describe("bank accounts", () => {
  it("charges the full-service rate for each account beyond the first", () => {
    const r = qCalc({ ...CANONICAL, banks: 3 });
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "Additional bank accounts")?.v).toBe(2 * EXTRA_BANK_MONTHLY.bookFull);
    expect(r.moTot).toBe(163 + 2 * EXTRA_BANK_MONTHLY.bookFull);
  });

  it("charges the cheaper review rate when the client keeps the books", () => {
    const r = qCalc({ ...CANONICAL, book: "self", review: "month", banks: 3 });
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "Additional bank accounts")?.v).toBe(2 * EXTRA_BANK_MONTHLY.selfWithReview);
  });

  it("charges nothing on software-only — there is no reconciliation on our side", () => {
    const r = qCalc({ ...CANONICAL, book: "self", review: "none", banks: 8 });
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "Additional bank accounts")).toBeUndefined();
  });

  it("takes the sector risk uplift, like every other labour line", () => {
    const r = qCalc({ ...CANONICAL, sector: "hospitality", banks: 2 });
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "Additional bank accounts")?.v).toBe(Math.round(EXTRA_BANK_MONTHLY.bookFull * 1.2));
  });
});

describe("VAT gating (task 7e — Vacei parity)", () => {
  it("blocks VAT returns when nobody has worked or reviewed the ledger", () => {
    const r = qCalc({ ...CANONICAL, book: "self", review: "none", vat: "we" });
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "VAT returns")).toBeUndefined();
    expect(r.notes.some(([tone, t]) => tone === "warn" && t.includes("We only put our name to a return"))).toBe(true);
  });

  it("unlocks VAT returns once we keep the books", () => {
    const r = qCalc({ ...CANONICAL, book: "full", vat: "we" });
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "VAT returns")?.v).toBe(45);
  });

  it("unlocks VAT returns once an accounting review is added", () => {
    const r = qCalc({ ...CANONICAL, book: "self", review: "quarter", vat: "we" });
    if (r.refer) throw new Error("unpriceable");
    expect(line(r, "VAT returns")?.v).toBe(45);
  });
});
