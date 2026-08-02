/**
 * THE guard for "every quote must match".
 *
 * A4 shows the same service on several surfaces — the homepage calculator,
 * /quote, /audit-services, /accounting-services — and Vacei quotes the same
 * company from its own copy of the pack. A client who gets two different
 * numbers for the same inputs has caught us being sloppy, so this file asserts
 * the surfaces agree rather than trusting that they do.
 *
 * If this fails, do NOT patch the expectation — find the surface that drifted
 * and point it back at src/data/a4QuotePack.ts.
 */

import { describe, it, expect } from "vitest";
import { buildQuote } from "./quotation";
import { calcAuditFee, type AuditInput } from "./audit-fee";
import { calcAccountingFee, type AccountingInput } from "./accounting-fee";
import {
  SECTORS, TXN_BANDS, RISK_TIERS, AUDIT_YEARLY, TAX_RETURN_YEARLY, BOOKKEEPING_MONTHLY,
  VAT_MONTHLY, SOFTWARE_TIERS, PAYROLL_PER_HEAD, sectorTier, type TxnBand,
} from "@/data/a4QuotePack";

/** Every sector × every volume band — the whole input space, not a sample. */
const COMBOS: { sector: string; band: TxnBand }[] = SECTORS.flatMap((s) =>
  TXN_BANDS.map((b) => ({ sector: s.id, band: b.id })),
);
const PRICEABLE = COMBOS.filter((c) => RISK_TIERS[sectorTier(c.sector)].multiplier != null);

const auditOnly = (sector: string, band: TxnBand): AuditInput => ({
  sector, txn: band, size: "big", pay: "none", vat: "no", banks: "1",
  taxret: "no", year: "2025", nyrs: "2", chg: "no", uploaded: false, doc: "fs",
});

describe("quote parity across every surface", () => {
  it("covers the entire input space, not a sample", () => {
    expect(COMBOS).toHaveLength(SECTORS.length * TXN_BANDS.length);
    expect(PRICEABLE.length).toBeGreaterThan(0);
  });

  it("/quote and /audit-services give the same audit fee for the same company", () => {
    const mismatches: string[] = [];
    for (const { sector, band } of PRICEABLE) {
      const fromAuditPage = calcAuditFee(auditOnly(sector, band));
      const fromQuotePage = buildQuote({ company: "T", sector, txnBand: band, services: ["audit"] });
      const quoteLine = fromQuotePage.lines.find((l) => l.id === "audit")?.annualEur;
      const auditPageFee = fromAuditPage.refer ? null : fromAuditPage.fee;
      if (auditPageFee !== quoteLine) {
        mismatches.push(`${sector}/${band}: /audit-services €${auditPageFee} vs /quote €${quoteLine}`);
      }
    }
    expect(mismatches).toEqual([]);
  });

  it("/quote and /accounting-services give the same bookkeeping fee", () => {
    const mismatches: string[] = [];
    for (const { sector, band } of PRICEABLE) {
      if (BOOKKEEPING_MONTHLY[band] === 0) continue; // pre-trading has no bookkeeping
      const acc: AccountingInput = { sector, txn: band, banks: 1, route: "full", head: 0, vatreg: "none", behind: "0" };
      const fromAccountingPage = calcAccountingFee(acc);
      if (fromAccountingPage.refer) continue;
      // Isolate the bookkeeping line — the software plan is a separate product.
      const bookLine = fromAccountingPage.monthly.find((l) => l.k === "Bookkeeping by us")?.v ?? 0;
      const fromQuotePage = buildQuote({ company: "T", sector, txnBand: band, services: ["accounts"] });
      const quoteLine = (fromQuotePage.lines.find((l) => l.id === "accounts")?.annualEur ?? 0) / 12;
      if (Math.round(bookLine) !== Math.round(quoteLine)) {
        mismatches.push(`${sector}/${band}: /accounting-services €${Math.round(bookLine)} vs /quote €${Math.round(quoteLine)}`);
      }
    }
    expect(mismatches).toEqual([]);
  });

  it("/quote and /accounting-services give the same VAT fee", () => {
    const mismatches: string[] = [];
    for (const { sector, band } of PRICEABLE) {
      if (VAT_MONTHLY[band] === 0) continue;
      const acc: AccountingInput = { sector, txn: band, banks: 1, route: "full", head: 0, vatreg: "art10", behind: "0" };
      const q = calcAccountingFee(acc);
      if (q.refer) continue;
      const vatLine = q.monthly.find((l) => l.k.startsWith("VAT returns"))?.v ?? 0;
      const fromQuotePage = buildQuote({ company: "T", sector, txnBand: band, services: ["vat"] });
      const quoteLine = (fromQuotePage.lines.find((l) => l.id === "vat")?.annualEur ?? 0) / 12;
      if (Math.round(vatLine) !== Math.round(quoteLine)) {
        mismatches.push(`${sector}/${band}: /accounting-services €${Math.round(vatLine)} vs /quote €${Math.round(quoteLine)}`);
      }
    }
    expect(mismatches).toEqual([]);
  });

  it("refuses to auto-price a referral sector on any surface", () => {
    const referSector = SECTORS.find((s) => s.tier === "refer")!.id;
    for (const b of TXN_BANDS) {
      expect(calcAuditFee(auditOnly(referSector, b.id)).refer).toBe(true);
      expect(calcAccountingFee({ sector: referSector, txn: b.id, banks: 1, route: "full", head: 0, vatreg: "none", behind: "0" }).refer).toBe(true);
      expect(buildQuote({ company: "T", sector: referSector, txnBand: b.id, services: ["audit"] }).refer).toBe(true);
    }
  });

  it("keeps every calculator on one sector list and one set of bands", () => {
    // Re-exported, never redefined — a second copy is how the drift starts.
    expect(SECTORS.map((s) => s.id)).toEqual([
      "shop", "consulting", "property", "hospitality", "online", "holding", "regulated", "other",
    ]);
    expect(TXN_BANDS.map((b) => b.id)).toEqual(["0", "1-20", "21-60", "61-150", "151-400", "401-1000", "1000+"]);
  });

  it("has exactly one definition of each rate table", async () => {
    // The homepage calculator used to hold its own copies of these. If anyone
    // reintroduces a literal table, this catches it.
    const src = await import("node:fs/promises").then((fs) =>
      fs.readFile("src/components/a4-landing/LandingQuoteCalculator.tsx", "utf8"),
    );
    expect(src).toContain("book: BOOKKEEPING_MONTHLY");
    expect(src).toContain("assure: AUDIT_YEARLY");
    expect(src).toContain("taxret: TAX_RETURN_YEARLY");
    expect(src).toContain("vat: VAT_MONTHLY");
    // No inline band table anywhere in the file.
    expect(src).not.toMatch(/"1-20":\s*\d+/);
  });

  it("pins the figures every surface is quoting, so a silent edit is visible", () => {
    expect(AUDIT_YEARLY).toEqual({ "0": 600, "1-20": 750, "21-60": 995, "61-150": 1395, "151-400": 1950, "401-1000": 2700, "1000+": 3650 });
    expect(TAX_RETURN_YEARLY).toEqual({ "0": 175, "1-20": 275, "21-60": 325, "61-150": 420, "151-400": 560, "401-1000": 760, "1000+": 1040 });
    expect(BOOKKEEPING_MONTHLY).toEqual({ "0": 0, "1-20": 59, "21-60": 99, "61-150": 169, "151-400": 279, "401-1000": 469, "1000+": 769 });
    expect(VAT_MONTHLY).toEqual({ "0": 0, "1-20": 29, "21-60": 45, "61-150": 69, "151-400": 99, "401-1000": 139, "1000+": 189 });
    expect(SOFTWARE_TIERS).toEqual({ book: 39, senior: 99, manager: 198, cfo: 357 });
    expect(PAYROLL_PER_HEAD.map((p) => p.rate)).toEqual([32, 29, 25]);
    expect(Object.values(RISK_TIERS).map((t) => t.multiplier)).toEqual([1.0, 1.2, 1.45, null]);
  });
});
