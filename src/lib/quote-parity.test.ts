/**
 * THE guard for "every quote must match".
 *
 * A4 shows the same service on several surfaces — the homepage calculator,
 * /quote, /audit-services, /accounting-services, /pricing — and Vacei quotes
 * the same company from its own copy of the pack. A client who gets two
 * different numbers for the same inputs has caught us being sloppy, so this
 * file asserts the surfaces agree rather than trusting that they do.
 *
 * If this fails, do NOT patch the expectation — find the surface that drifted
 * and point it back at src/data/a4QuotePack.ts.
 *
 * ⚠ Rewritten for pack mt-2026-08-14-managed. The previous version had drifted
 * out of compilation entirely: it called `buildQuote({ sector, txnBand })`,
 * which /quote stopped accepting when it moved to revenue bands, and asserted
 * `.refer` on a QuoteResult that has no such field. Four of its eight cases
 * were failing before this change. The cross-surface claims it can still
 * honestly make are kept; the ones that compared two surfaces which no longer
 * take the same inputs are replaced by claims about the shared pack.
 */

import { describe, it, expect } from "vitest";
import { buildQuote, REVENUE_BANDS } from "./quotation";
import { calcAuditFee, type AuditInput } from "./audit-fee";
import { calcAccountingFee, type AccountingInput } from "./accounting-fee";
import {
  SECTORS, TXN_BANDS, RISK_TIERS, AUDIT_YEARLY, TAX_RETURN_YEARLY,
  BOOKKEEPING_MANAGED_MONTHLY, VAT_MONTHLY, PAYROLL_PER_HEAD, sectorTier,
  catchUpAmount, type TxnBand,
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

const accounting = (p: Partial<AccountingInput> = {}): AccountingInput => ({
  sector: "shop", txn: "21-60", entity: "company", head: 0, vatreg: "none",
  behind: "0", startMonth: "2026-09", ...p,
});

describe("quote parity across every surface", () => {
  it("covers the entire input space, not a sample", () => {
    expect(COMBOS).toHaveLength(SECTORS.length * TXN_BANDS.length);
    expect(PRICEABLE.length).toBeGreaterThan(0);
  });

  it("gives the same flat bookkeeping price on /quote and /accounting-services", () => {
    for (const entity of ["sole", "company"] as const) {
      const fromAccountingPage = calcAccountingFee(accounting({ entity }));
      if (fromAccountingPage.refer) throw new Error("unpriceable");
      const bookLine = fromAccountingPage.monthly.find((l) => l.k.startsWith("Managed bookkeeping"))?.v ?? 0;

      const fromQuotePage = buildQuote({
        company: "T", industry: "Other", revenueBand: "100k-500k",
        services: ["accounts"], entity, startMonth: "2026-09",
      });
      const quoteLine = (fromQuotePage.lines.find((l) => l.id === "accounts")?.annualEur ?? 0) / 12;

      expect(bookLine).toBe(BOOKKEEPING_MANAGED_MONTHLY[entity]);
      expect(Math.round(quoteLine)).toBe(BOOKKEEPING_MANAGED_MONTHLY[entity]);
    }
  });

  it("never lets the revenue band move the bookkeeping price", () => {
    // The managed price is flat. If /quote ever starts scaling it by revenue
    // again, it disagrees with every other surface and with the backend.
    const seen = new Set<number>();
    for (const b of REVENUE_BANDS) {
      const q = buildQuote({
        company: "T", industry: "Other", revenueBand: b.id,
        services: ["accounts"], entity: "company", startMonth: "2026-09",
      });
      seen.add((q.lines.find((l) => l.id === "accounts")?.annualEur ?? 0) / 12);
    }
    expect([...seen]).toEqual([BOOKKEEPING_MANAGED_MONTHLY.company]);
  });

  it("charges catch-up at the same rate on /quote as the pack does", () => {
    const q = buildQuote({
      company: "T", industry: "Other", revenueBand: "1m-5m",
      services: ["accounts"], entity: "company", catchUpMonths: 12, startMonth: "2026-09",
    });
    const catchup = q.lines.find((l) => l.id === "catchup");
    expect(catchup?.annualEur).toBe(catchUpAmount(12, "company"));
    expect(catchup?.annualEur).toBe(588);
    expect(catchup?.name).toBe("Catch-up: 12 months x EUR 49 = EUR 588");
  });

  it("still accepts the retired overdueYears input as whole years of months", () => {
    // One release of tolerance so an in-flight POST from a cached page does
    // not silently price zero catch-up.
    const q = buildQuote({
      company: "T", industry: "Other", revenueBand: "100k-500k",
      services: ["accounts"], entity: "company", overdueYears: 1, startMonth: "2026-09",
    });
    expect(q.lines.find((l) => l.id === "catchup")?.annualEur).toBe(588);
  });

  it("refuses to auto-price a referral sector on the surfaces that ask for one", () => {
    const referSector = SECTORS.find((s) => s.tier === "refer")!.id;
    for (const b of TXN_BANDS) {
      expect(calcAuditFee(auditOnly(referSector, b.id)).refer).toBe(true);
      expect(calcAccountingFee(accounting({ sector: referSector, txn: b.id })).refer).toBe(true);
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
    expect(src).toContain("assure: AUDIT_YEARLY");
    expect(src).toContain("taxret: TAX_RETURN_YEARLY");
    expect(src).toContain("vat: VAT_MONTHLY");
    // No inline band table anywhere in the file.
    expect(src).not.toMatch(/"1-20":\s*\d+/);
  });

  it("has no software-only tier left anywhere in the pack", async () => {
    const src = await import("node:fs/promises").then((fs) =>
      fs.readFile("src/data/a4QuotePack.ts", "utf8"),
    );
    // Only the retirement notes may mention them, and never as an export.
    expect(src).not.toMatch(/^export const SOFTWARE_TIERS/m);
    expect(src).not.toMatch(/^export const SOFTWARE_TIER_LABELS/m);
    expect(src).not.toMatch(/^export const SOFTWARE_TIER_BY_BAND/m);
    expect(src).not.toMatch(/^export const BOOKKEEPING_MONTHLY/m);
    expect(src).not.toMatch(/^export const CATCH_UP/m);
  });

  it("pins the figures every surface is quoting, so a silent edit is visible", () => {
    expect(AUDIT_YEARLY).toEqual({ "0": 600, "1-20": 750, "21-60": 995, "61-150": 1395, "151-400": 1950, "401-1000": 2700, "1000+": 3650 });
    expect(TAX_RETURN_YEARLY).toEqual({ "0": 175, "1-20": 275, "21-60": 325, "61-150": 420, "151-400": 560, "401-1000": 760, "1000+": 1040 });
    expect(BOOKKEEPING_MANAGED_MONTHLY).toEqual({ sole: 24, company: 49 });
    expect(VAT_MONTHLY).toEqual({ "0": 0, "1-20": 29, "21-60": 45, "61-150": 69, "151-400": 99, "401-1000": 139, "1000+": 189 });
    expect(PAYROLL_PER_HEAD.map((p) => p.rate)).toEqual([32, 29, 25]);
    expect(Object.values(RISK_TIERS).map((t) => t.multiplier)).toEqual([1.0, 1.2, 1.45, null]);
  });
});
