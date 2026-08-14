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
  BOOKKEEPING_MANAGED_MONTHLY, EXPENSE_BANDS, VAT_MONTHLY, PAYROLL_PER_HEAD, sectorTier,
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
  sector: "shop", txn: "21-60", entity: "company", expenses: "0-10k", head: 0, vatreg: "none",
  behind: "0", startMonth: "2026-09", ...p,
});

describe("quote parity across every surface", () => {
  it("covers the entire input space, not a sample", () => {
    expect(COMBOS).toHaveLength(SECTORS.length * TXN_BANDS.length);
    expect(PRICEABLE.length).toBeGreaterThan(0);
  });

  it("gives the same bookkeeping price on /quote and /accounting-services, at every band", () => {
    // The whole expenses × entity space, not just the entry band — that is
    // where a drift between two surfaces would actually hide.
    for (const entity of ["sole", "company"] as const) {
      for (const band of EXPENSE_BANDS) {
        const fromAccountingPage = calcAccountingFee(accounting({ entity, expenses: band.id }));
        if (fromAccountingPage.refer) throw new Error("unpriceable");
        const bookLine = fromAccountingPage.monthly.find((l) => l.k.startsWith("Managed bookkeeping"))?.v ?? 0;

        const fromQuotePage = buildQuote({
          company: "T", industry: "Other", revenueBand: "100k-500k",
          services: ["accounts"], entity, expenses: band.id, startMonth: "2026-09",
        });
        const quoteLine = (fromQuotePage.lines.find((l) => l.id === "accounts")?.annualEur ?? 0) / 12;

        const want = BOOKKEEPING_MANAGED_MONTHLY[entity][band.id];
        expect(`${entity}/${band.id} accounting=${bookLine}`).toBe(`${entity}/${band.id} accounting=${want}`);
        expect(`${entity}/${band.id} quote=${Math.round(quoteLine)}`).toBe(`${entity}/${band.id} quote=${want}`);
      }
    }
  });

  it("refuses to price the books on either surface when the band is unknown", () => {
    // Never the cheapest band. /accounting-services refers it; /quote puts it
    // on request. Neither invents €24 or €49.
    const bad = "not-a-band" as (typeof EXPENSE_BANDS)[number]["id"];
    expect(calcAccountingFee(accounting({ expenses: bad }))).toEqual({ refer: true });

    const q = buildQuote({
      company: "T", industry: "Other", revenueBand: "100k-500k",
      services: ["accounts"], entity: "company", expenses: bad, startMonth: "2026-09",
    });
    const accounts = q.lines.find((l) => l.id === "accounts");
    expect(accounts?.display).toBe("On request");
    expect(accounts?.annualEur).toBeNull();
    expect(q.monthlyTotalEur).toBe(0);
  });

  it("never lets the revenue band move the bookkeeping price", () => {
    // The managed price is flat. If /quote ever starts scaling it by revenue
    // again, it disagrees with every other surface and with the backend.
    const seen = new Set<number>();
    for (const b of REVENUE_BANDS) {
      const q = buildQuote({
        company: "T", industry: "Other", revenueBand: b.id,
        services: ["accounts"], entity: "company", expenses: "0-10k", startMonth: "2026-09",
      });
      seen.add((q.lines.find((l) => l.id === "accounts")?.annualEur ?? 0) / 12);
    }
    expect([...seen]).toEqual([BOOKKEEPING_MANAGED_MONTHLY.company["0-10k"]]);
  });

  it("charges catch-up at the same rate on /quote as the pack does", () => {
    const q = buildQuote({
      company: "T", industry: "Other", revenueBand: "1m-5m",
      services: ["accounts"], entity: "company", expenses: "0-10k", catchUpMonths: 12, startMonth: "2026-09",
    });
    const catchup = q.lines.find((l) => l.id === "catchup");
    expect(catchup?.annualEur).toBe(catchUpAmount(12, "company", "0-10k"));
    expect(catchup?.annualEur).toBe(588);
    expect(catchup?.name).toBe("Catch-up: 12 months x EUR 49 = EUR 588");
  });

  it("still accepts the retired overdueYears input as whole years of months", () => {
    // One release of tolerance so an in-flight POST from a cached page does
    // not silently price zero catch-up. 1 year → 12 months × €49 (entry band).
    const q = buildQuote({
      company: "T", industry: "Other", revenueBand: "100k-500k",
      services: ["accounts"], entity: "company", expenses: "0-10k",
      overdueYears: 1, startMonth: "2026-09",
    });
    expect(q.lines.find((l) => l.id === "catchup")?.annualEur).toBe(588);
  });

  it("drops the catch-up line, rather than guessing a rate, when no band came with it", () => {
    // A genuinely old POST carries overdueYears AND no expenses band. There is
    // no rate to charge a backdated month at, so the line is dropped and the
    // books go "On request" — a person finishes it. It must NOT fall back to
    // the entry band and invoice €588 nobody quoted.
    const q = buildQuote({
      company: "T", industry: "Other", revenueBand: "100k-500k",
      services: ["accounts"], entity: "company", overdueYears: 1, startMonth: "2026-09",
    });
    expect(q.lines.find((l) => l.id === "catchup")).toBeUndefined();
    expect(q.lines.find((l) => l.id === "accounts")?.display).toBe("On request");
    expect(q.annualTotalEur).toBe(0);
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
    expect(BOOKKEEPING_MANAGED_MONTHLY).toEqual({
      sole: { "0-10k": 24, "10-25k": 39, "25-50k": 59, "50-100k": 89, "100-200k": 129, "200-300k": 179, "300-400k": 229, "400-500k": 279, "500k+": 339 },
      company: { "0-10k": 49, "10-25k": 69, "25-50k": 99, "50-100k": 149, "100-200k": 219, "200-300k": 299, "300-400k": 379, "400-500k": 449, "500k+": 549 },
    });
    expect(VAT_MONTHLY).toEqual({ "0": 0, "1-20": 29, "21-60": 45, "61-150": 69, "151-400": 99, "401-1000": 139, "1000+": 189 });
    expect(PAYROLL_PER_HEAD.map((p) => p.rate)).toEqual([32, 29, 25]);
    expect(Object.values(RISK_TIERS).map((t) => t.multiplier)).toEqual([1.0, 1.2, 1.45, null]);
  });
});
