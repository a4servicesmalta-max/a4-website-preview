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
import { evaluateA4Items, type A4Item, type A4Risk } from "./websiteQuotation";
import { calcAuditFee, type AuditInput } from "./audit-fee";
import { calcAccountingFee, type AccountingInput } from "./accounting-fee";
import {
  SECTORS, TXN_BANDS, RISK_TIERS, AUDIT_YEARLY, taxReturnYearly,
  BOOKKEEPING_MANAGED_MONTHLY, EXPENSE_BANDS, EXPENSE_BAND_CEILINGS, VAT_MONTHLY, PAYROLL_PER_HEAD, sectorTier,
  catchUpAmount, bandForMonthlyExpenses, fullMonthlyBookkeeping, bankAccountMonthly, banksMonthly,
  BANK_ACCOUNT, BOOKKEEPING_FROM, BOOKKEEPING_COMPANY, BOOKKEEPING_BASE_FROM, BOOKKEEPING_BASE_COMPANY,
  BOOKKEEPING_SOLE_TOP, BOOKKEEPING_COMPANY_TOP, A4_QUOTE_PACK_VERSION,
  type TxnBand, type ExpenseBand,
} from "@/data/a4QuotePack";
import { qCalc, qItems, qRisk, Q_INIT, QSTEP_QUOTE, type QState } from "@/components/a4-landing/LandingQuoteCalculator";

/** Promo is withdrawn; a fixed date keeps that true whatever the clock says. */
const AT = new Date("2026-09-01T12:00:00Z");
/** The /quote builder's answers for a company the wizard would also price. */
const quoteFor = (o: { sector?: string; txn?: TxnBand; banks?: number; expenses?: ExpenseBand; entity?: "sole" | "company"; services?: ("accounts" | "audit" | "vat" | "mbr" | "payroll")[]; catchUpMonths?: number }) =>
  buildQuote({
    company: "T", industry: "x", sector: o.sector ?? "shop", txn: o.txn ?? "1-20", banks: o.banks ?? 1,
    services: o.services ?? ["accounts"], entity: o.entity ?? "company", expenses: o.expenses ?? "0-10k",
    catchUpMonths: o.catchUpMonths, startMonth: "2026-09",
  });

/** Every sector × every volume band — the whole input space, not a sample. */
const COMBOS: { sector: string; band: TxnBand }[] = SECTORS.flatMap((s) =>
  TXN_BANDS.map((b) => ({ sector: s.id, band: b.id })),
);
const PRICEABLE = COMBOS.filter((c) => RISK_TIERS[sectorTier(c.sector)].multiplier != null);

const auditOnly = (sector: string, band: TxnBand): AuditInput => ({
  sector, txn: band, size: "big",
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

  it("gives the same bookkeeping price on /quote and /accounting-services, at every band, volume and account count", () => {
    // The whole expenses × entity × volume × banks space, not just the entry
    // band — that is where a drift between two surfaces would actually hide.
    // /accounting-services used to leave the volume uplift off its monthly
    // line (while charging it on catch-up); both now read fullMonthlyBookkeeping.
    for (const entity of ["sole", "company"] as const) {
      for (const band of EXPENSE_BANDS) for (const txn of TXN_BANDS) for (const banks of [1, 2, 5]) {
        const fromAccountingPage = calcAccountingFee(accounting({ entity, expenses: band.id, txn: txn.id, banks }));
        if (fromAccountingPage.refer) throw new Error("unpriceable");
        const fromQuote = buildQuote({
          company: "T", industry: "Other", sector: "shop", txn: txn.id, banks,
          services: ["accounts"], entity, expenses: band.id, startMonth: "2026-09",
        });
        const want = fullMonthlyBookkeeping(entity, band.id, txn.id, banks)!;
        const where = `${entity}/${band.id}/${txn.id}/${banks}b`;
        expect(fromAccountingPage.monthlyFull, `accounting page at ${where}`).toBe(want);
        expect((fromQuote.lines.find((l) => l.id === "accounts")?.annualEur ?? 0) / 12, `/quote at ${where}`).toBe(want);
        // And the base line on the accounting page is still the bare band rate.
        expect(fromAccountingPage.monthly[0].v, `base at ${where}`).toBe(BOOKKEEPING_MANAGED_MONTHLY[entity][band.id]);
      }
    }
  });

  it("refuses to price the books on either surface when the band is unknown", () => {
    // Never the cheapest band. /accounting-services refers it; /quote puts it
    // on request. Neither invents €24 or €49.
    const bad = "not-a-band" as (typeof EXPENSE_BANDS)[number]["id"];
    // M10: the reason is the BAND, not the sector — the two outcomes are
    // distinct now, and each carries its own copy.
    expect(calcAccountingFee(accounting({ expenses: bad }))).toEqual({ refer: true, reason: "no-expenses" });

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
        company: "T", industry: "Other", revenueBand: b.id, sector: "shop", txn: "1-20", banks: 1,
        services: ["accounts"], entity: "company", expenses: "0-10k", startMonth: "2026-09",
      });
      seen.add((q.lines.find((l) => l.id === "accounts")?.annualEur ?? 0) / 12);
    }
    // mt-2026-08-27-entry: the one account is included, so the entry figure is
    // the bare base — €49, the published company floor.
    expect([...seen]).toEqual([BOOKKEEPING_COMPANY]);
    expect([...seen]).toEqual([49]);
  });

  it("charges catch-up at the same rate on /quote as the pack does", () => {
    const q = buildQuote({
      company: "T", industry: "Other", sector: "shop", txn: "1-20", banks: 1,
      services: ["accounts"], entity: "company", expenses: "0-10k", catchUpMonths: 12, startMonth: "2026-09",
    });
    const catchup = q.lines.find((l) => l.id === "catchup");
    expect(catchup?.annualEur).toBe(catchUpAmount(12, "company", "0-10k", "1-20", 1));
    expect(catchup?.annualEur).toBe(588);
    expect(catchup?.name).toBe("Catch-up: 12 months x EUR 49 = EUR 588");
  });

  it("still accepts the retired overdueYears input as whole years of months", () => {
    // One release of tolerance so an in-flight POST from a cached page does
    // not silently price zero catch-up. 1 year → 12 months × €49 (entry band, one account included).
    const q = buildQuote({
      company: "T", industry: "Other", revenueBand: "100k-500k", sector: "shop", txn: "1-20", banks: 1,
      services: ["accounts"], entity: "company", expenses: "0-10k",
      overdueYears: 1, startMonth: "2026-09",
    });
    expect(q.lines.find((l) => l.id === "catchup")?.annualEur).toBe(588);
  });

  it("prices the owner's worked example identically on /quote, the homepage wizard and /accounting-services (mt-2026-08-27-entry)", () => {
    // Company, €10–25k a month, 21–60 transactions, THREE bank accounts:
    // base 69 + uplift 10 = 79; per account round(40 + 0.15 × 79) = 52;
    // the first account is included, so 2 extra × 52 = 104; full monthly €183.
    // Catch-up = months × 183.
    expect(bankAccountMonthly("company", "10-25k", "21-60")).toBe(52);
    expect(banksMonthly("company", "10-25k", "21-60", 3)).toBe(104);
    expect(fullMonthlyBookkeeping("company", "10-25k", "21-60", 3)).toBe(183);

    const fromQuote = quoteFor({ txn: "21-60", banks: 3, expenses: "10-25k", entity: "company", catchUpMonths: 6 });
    expect((fromQuote.lines.find((l) => l.id === "accounts")?.annualEur ?? 0) / 12).toBe(183);
    expect(fromQuote.lines.find((l) => l.id === "catchup")?.annualEur).toBe(6 * 183);
    expect(fromQuote.lines.find((l) => l.id === "catchup")?.name).toBe("Catch-up: 6 months x EUR 183 = EUR 1098");

    const fromAccountingPage = calcAccountingFee(accounting({ txn: "21-60", banks: 3, expenses: "10-25k", behind: "6" }), AT);
    if (fromAccountingPage.refer) throw new Error("unpriceable");
    expect(fromAccountingPage.monthlyFull).toBe(183);
    expect(fromAccountingPage.monthly).toEqual([
      { k: "Managed bookkeeping · Company", v: 69 },
      { k: "Bookkeeping · volume uplift", v: 10 },
      { k: "Additional bank accounts · 2 × €52", v: 104 },
    ]);
    expect(fromAccountingPage.oneOffFull).toBe(6 * 183);

    const wizard: QState = { ...Q_INIT, step: QSTEP_QUOTE, txn: "21-60", banks: 3, expenses: "10-25k", startMonth: "2026-09", behind: "6", taxret: "none", annret: "none" };
    const fromWizard = qCalc(wizard, AT);
    if (fromWizard.refer) throw new Error("unpriceable");
    expect(fromWizard.grossMo).toBe(183);
    expect(fromWizard.mo.find((l) => l.n === "Additional bank accounts")?.v).toBe(104);
    expect(fromWizard.mo.find((l) => l.n === "Additional bank accounts")?.e).toContain("2 × €52");
    expect(fromWizard.oneTot).toBe(6 * 183);
    const engine = evaluateA4Items(qItems(wizard), qRisk(wizard), AT);
    expect(engine.grossMonthly).toBe(183);
    expect(engine.grossOneOff).toBe(6 * 183);

    // …and the annual tax return does not move with any of it: round(69 × 4.8) = 331.
    expect(taxReturnYearly("company", "10-25k")).toBe(331);
    expect(evaluateA4Items([{ service: "taxret", entity: "company", expenses: "10-25k" }, ...qItems(wizard)], "standard", AT).grossYearly).toBe(331);
  });

  it("prices one bank account into the published floors — from €24 self-employed, €49 company", () => {
    // Only accounts beyond the first are priced (mt-2026-08-27-entry) — the
    // first is included — so the "from" headline IS the base: 24 sole, 49 company.
    expect(BANK_ACCOUNT).toEqual({ baseMonthly: 40, pctOfBookkeeping: 0.15 });
    expect([BOOKKEEPING_BASE_FROM, BOOKKEEPING_BASE_COMPANY]).toEqual([24, 49]);
    expect([BOOKKEEPING_FROM, BOOKKEEPING_COMPANY]).toEqual([24, 49]);
    expect(BOOKKEEPING_FROM).toBe(fullMonthlyBookkeeping("sole", "0-10k", "1-20", 1));
    expect(BOOKKEEPING_COMPANY).toBe(fullMonthlyBookkeeping("company", "0-10k", "1-20", 1));
    // Tops on the same basis: top spend band, lowest volume, one account.
    expect([BOOKKEEPING_SOLE_TOP, BOOKKEEPING_COMPANY_TOP]).toEqual([339, 549]);
    expect(BOOKKEEPING_COMPANY_TOP).toBe(fullMonthlyBookkeeping("company", "500k+", "1-20", 1));
    // The floors are prices every surface actually produces.
    expect(quoteFor({ entity: "sole" }).monthlyTotalEur).toBe(24);
    expect(quoteFor({ entity: "company" }).monthlyTotalEur).toBe(49);
    const page = calcAccountingFee(accounting({ entity: "sole", txn: "1-20" }), AT);
    if (page.refer) throw new Error("unpriceable");
    expect(page.monthlyFull).toBe(24);
    // Rounding is per account, THEN × count: company 0–10k, 2 extras = 2 × 47 = 94, not 95.
    expect(banksMonthly("company", "0-10k", "1-20", 3)).toBe(94);
    expect(A4_QUOTE_PACK_VERSION).toBe("mt-2026-08-27-entry");
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

  it("prices the same basket on /quote as the homepage wizard, across the whole sector × volume × spend space", () => {
    // /quote used to scale the audit by an annual-revenue multiplier of its own
    // and pin VAT to the 21-60 band; the same company got a different figure
    // here and on the homepage. Both now read the pack through the same
    // drivers, so every priceable combination must agree to the euro.
    const risks: Record<string, A4Risk> = { standard: "standard", elevated: "elevated", high: "high" };
    for (const sector of SECTORS) {
      const tier = sectorTier(sector.id);
      if (RISK_TIERS[tier].multiplier == null) continue;
      for (const txn of TXN_BANDS) for (const expenses of EXPENSE_BANDS) for (const banks of [1, 3]) {
        for (const entity of ["sole", "company"] as const) {
          const q = quoteFor({ sector: sector.id, txn: txn.id, banks, expenses: expenses.id, entity, services: ["accounts", "vat"], catchUpMonths: 4 });
          const items: A4Item[] = [
            { service: "bookkeeping-managed", entity, expenses: expenses.id, txn: txn.id, banks },
            { service: "vat", txn: txn.id, vatreg: "art10" },
            { service: "catchup", months: 4, entity, expenses: expenses.id, txn: txn.id, banks },
          ];
          const w = evaluateA4Items(items, risks[tier], AT);
          const where = `${sector.id}/${txn.id}/${expenses.id}/${banks}b/${entity}`;
          expect(q.monthlyTotalEur, `monthly at ${where}`).toBe(w.monthly);
          expect(q.lines.find((l) => l.id === "catchup")?.annualEur, `catch-up at ${where}`).toBe(w.catchup);
          expect(q.lines.find((l) => l.id === "accounts")?.annualEur, `books at ${where}`).toBe(fullMonthlyBookkeeping(entity, expenses.id, txn.id, banks)! * 12);
        }
        // The audit is a company-only basket on the wizard side (independence bars it beside the books).
        const qa = quoteFor({ sector: sector.id, txn: txn.id, expenses: expenses.id, services: ["audit"] });
        const wa = evaluateA4Items([{ service: "audit", txn: txn.id }], risks[tier], AT);
        expect(qa.annualTotalEur, `audit at ${sector.id}/${txn.id}`).toBe(wa.yearly);
      }
    }
  });

  it("quotes VAT and the audit 'On request' rather than at the cheapest tier when the sector or volume is missing", () => {
    for (const missing of [{ sector: undefined }, { txn: undefined }, { sector: "other" }] as const) {
      const q = buildQuote({ company: "T", industry: "x", sector: "shop", txn: "21-60", banks: 1, services: ["audit", "vat"], entity: "company", startMonth: "2026-09", ...missing });
      expect(q.lines.map((l) => l.display)).toEqual(["On request", "On request"]);
      expect(q.annualTotalEur + q.monthlyTotalEur).toBe(0);
      expect(q.hasOnRequestLines).toBe(true);
    }
  });

  it("keeps the revenue band inert — it no longer moves any price on /quote", () => {
    const seen = new Set<string>();
    for (const b of REVENUE_BANDS) {
      const q = buildQuote({ company: "T", industry: "x", revenueBand: b.id, sector: "regulated", txn: "1000+", banks: 2, services: ["accounts", "audit", "vat"], entity: "company", expenses: "500k+", catchUpMonths: 3, startMonth: "2026-09" });
      seen.add(JSON.stringify([q.monthlyTotalEur, q.annualTotalEur]));
    }
    expect(seen.size).toBe(1);
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
    // The taxret table is gone — the wizard reads the formula helper.
    expect(src).toContain("taxReturnYearly(");
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
    // mt-2026-08-26c-volume: the tax return is the formula, not a table.
    // Worked example pinned in all three repos: company 10-25k → 69 × 4.8 = 331.
    expect(taxReturnYearly("company", "10-25k")).toBe(331);
    expect(taxReturnYearly("sole", "0-10k")).toBe(115);
    expect(taxReturnYearly("company", "500k+")).toBe(2635);
    expect(BOOKKEEPING_MANAGED_MONTHLY).toEqual({
      sole: { "0-10k": 24, "10-25k": 39, "25-50k": 59, "50-100k": 89, "100-200k": 129, "200-300k": 179, "300-400k": 229, "400-500k": 279, "500k+": 339 },
      company: { "0-10k": 49, "10-25k": 69, "25-50k": 99, "50-100k": 149, "100-200k": 219, "200-300k": 299, "300-400k": 379, "400-500k": 459, "500k+": 549 },
    });
    // "0" is €19 since mt-2026-08-17-corrections (finding A4): nil-return floor.
    expect(VAT_MONTHLY).toEqual({ "0": 19, "1-20": 29, "21-60": 45, "61-150": 69, "151-400": 99, "401-1000": 139, "1000+": 189 });
    expect(PAYROLL_PER_HEAD.map((p) => p.rate)).toEqual([12]);
    expect(Object.values(RISK_TIERS).map((t) => t.multiplier)).toEqual([1.0, 1.2, 1.45, null]);
  });
});

/**
 * M5 — the band boundary, which was previously defined by nothing anywhere in
 * either repo.
 *
 * The old labels overlapped in words: "Up to €10,000" and "€10,000 – 25,000"
 * both read as containing exactly €10,000, so a client at a boundary saw two
 * buttons that each claimed them and two different prices with no rule to
 * choose between. Mechanically harmless (the wire carries the band ID), but it
 * is a billing dispute the first time the firm corrects a boundary client.
 *
 * QUOTE-WIRE-CONTRACT-V2 amendment, 2026-08-15, normative: band ceilings are
 * INCLUSIVE, so exactly 10,000 is `0-10k`, exactly 25,000 is `10-25k`, exactly
 * 500,000 is `400-500k`. It resolves every edge in the CLIENT's favour, which
 * is the defensible direction in a dispute.
 */
describe("expenses band boundaries (contract v2)", () => {
  it("labels the bands disjointly — no amount is claimed by two labels", () => {
    expect(EXPENSE_BANDS.map((b) => b.label)).toEqual([
      "Up to €10,000",
      "Over €10,000, up to €25,000",
      "Over €25,000, up to €50,000",
      "Over €50,000, up to €100,000",
      "Over €100,000, up to €200,000",
      "Over €200,000, up to €300,000",
      "Over €300,000, up to €400,000",
      "Over €400,000, up to €500,000",
      "Over €500,000",
    ]);
  });

  it("puts a client at exactly €25,000 in 10-25k — the inclusive-ceiling rule", () => {
    // THE boundary sentence. Ceilings are inclusive, so the client at the edge
    // gets the cheaper of the two bands they could read themselves into.
    expect(bandForMonthlyExpenses(25_000)).toBe("10-25k");
    expect(bandForMonthlyExpenses(25_000.01)).toBe("25-50k");
  });

  it("resolves every other edge inclusively too", () => {
    expect(bandForMonthlyExpenses(0)).toBe("0-10k");
    expect(bandForMonthlyExpenses(10_000)).toBe("0-10k");
    expect(bandForMonthlyExpenses(10_001)).toBe("10-25k");
    expect(bandForMonthlyExpenses(50_000)).toBe("25-50k");
    expect(bandForMonthlyExpenses(100_000)).toBe("50-100k");
    expect(bandForMonthlyExpenses(200_000)).toBe("100-200k");
    expect(bandForMonthlyExpenses(300_000)).toBe("200-300k");
    expect(bandForMonthlyExpenses(400_000)).toBe("300-400k");
    // Exactly 500,000 is the TOP of 400-500k, not the floor of 500k+.
    expect(bandForMonthlyExpenses(500_000)).toBe("400-500k");
    expect(bandForMonthlyExpenses(500_001)).toBe("500k+");
    expect(bandForMonthlyExpenses(9_999_999)).toBe("500k+");
  });

  it("has no honest answer for a nonsense amount, and says so rather than guessing", () => {
    // Same contract as managedMonthly: null degrades to the lead path, and
    // never to the cheapest band.
    expect(bandForMonthlyExpenses(-1)).toBeNull();
    expect(bandForMonthlyExpenses(Number.NaN)).toBeNull();
  });

  it("keeps the label ceilings and the resolver in step", () => {
    // The labels are the client-facing statement of the same rule the resolver
    // applies. If someone edits one, this catches the other going stale.
    for (const { id, ceiling } of EXPENSE_BAND_CEILINGS) {
      if (ceiling == null) continue;
      expect(`${id}@${ceiling}=${bandForMonthlyExpenses(ceiling)}`).toBe(`${id}@${ceiling}=${id}`);
    }
  });
});
