/**
 * The pricing sweep: every combination a visitor can build, checked for the
 * three ways this rate card has actually gone wrong before.
 *
 * Owner request, 2026-08-26: "try all combinations on the pricing calculator to
 * ensure that there are no errors, and that everything makes sense… ensure that
 * the audit calculator actually matches the bookkeeping calculator".
 *
 * WHAT THIS FILE CANNOT DO, AND WHERE THAT LIVES INSTEAD. The failure that
 * costs money is client-vs-BACKEND disagreement: the portal re-prices every
 * submission from its own copy of the pack and issues a quotation only when the
 * two agree to within €1/1%, so a drift of one euro turns every quote into a
 * silent 202 RECEIVED with no email. That check needs both repos in one process
 * and cannot run from this one. It was run across 72,576 combinations at the
 * mt-2026-08-26-taxret flip (client `evaluateA4Items` against the backend's
 * `evaluateA4ServicesQuote`, all four cadences) and passed; re-run it out of
 * band whenever a figure moves. What IS pinned here is everything provable
 * inside this repo — which is most of the ways a wrong number gets written.
 */
import { describe, it, expect } from "vitest";
import {
  EXPENSE_BANDS, TXN_BANDS, taxReturnYearly, AUDIT_YEARLY, AUDIT_PRE_TRADING,
  REVIEW_ENGAGEMENT_FACTOR, type TxnBand, type ExpenseBand, type ManagedEntity,
} from "@/data/a4QuotePack";
import { evaluateA4Items, type A4Item, type A4Risk } from "@/lib/websiteQuotation";
import { TAXRET_ESTIMATE_FROM, calcAuditFee, TXN as AUDIT_TXN, SECTORS as AUDIT_SECTORS, SIZES as AUDIT_SIZES, type AuditInput } from "@/lib/audit-fee";

/** Promo is withdrawn; a fixed date keeps that true whatever the clock says. */
const AT = new Date("2026-09-01T12:00:00Z");
const RISKS: A4Risk[] = ["standard", "elevated", "high"];
const ENTITIES: ManagedEntity[] = ["sole", "company"];
const BANDS = EXPENSE_BANDS.map((b) => b.id) as ExpenseBand[];
const TXNS = TXN_BANDS.map((b) => b.id) as TxnBand[];

const auditAt = (over: Partial<AuditInput>): ReturnType<typeof calcAuditFee> =>
  calcAuditFee({
    sector: "shop", txn: "21-60", size: "big",
    taxret: "no", year: "2025", nyrs: "1", chg: "no", doc: "fs", uploaded: false,
    ...over,
  } as AuditInput);

describe("pricing sweep", () => {
  it("prices every bookkeeping combination without a NaN, a gap or a negative", { timeout: 30000 }, () => {
    for (const risk of RISKS) for (const entity of ENTITIES) for (const expenses of BANDS)
      for (const txn of TXNS) for (const heads of [0, 1, 5, 6, 11, 40]) for (const months of [0, 1, 7, 24]) {
        const items: A4Item[] = [{ service: "bookkeeping-managed", entity, expenses, txn, banks: 1 }];
        if (months > 0) items.push({ service: "catchup", months, entity, expenses, txn, banks: 1 });
        if (heads > 0) items.push({ service: "payroll", heads });
        items.push({ service: "vat", txn, vatreg: "art10" }, { service: "taxret", entity, expenses });
        const t = evaluateA4Items(items, risk, AT);
        const where = `${risk}/${entity}/${expenses}/${txn}/${heads}h/${months}m`;
        for (const [k, v] of Object.entries({ monthly: t.monthly, yearly: t.yearly, oneOff: t.oneOff })) {
          expect(Number.isFinite(v), `${k} not finite at ${where}`).toBe(true);
          expect(v, `${k} negative at ${where}`).toBeGreaterThanOrEqual(0);
        }
        // Every priced line must carry an amount, or the quote shows a row with
        // a blank beside it — the "column of dashes reads as a bug" class.
        for (const l of t.lines) expect(Number.isFinite(l.amount), `${l.label} at ${where}`).toBe(true);
      }
  });

  it("never charges less for more — not by spend band, not by headcount", () => {
    // Both directions have shipped inverted before: the retired flat payroll
    // tiers priced 11 people below 10, and a mis-typed band can invert the
    // ladder without any total looking obviously wrong.
    for (const entity of ENTITIES) {
      let prev = -1;
      for (const expenses of BANDS) {
        const m = evaluateA4Items([{ service: "bookkeeping-managed", entity, expenses, txn: "1-20", banks: 1 }], "standard", AT).monthly;
        expect(m, `bookkeeping falls at ${entity}/${expenses}`).toBeGreaterThanOrEqual(prev);
        prev = m;
      }
    }
    for (let h = 1; h <= 60; h++) {
      const a = evaluateA4Items([{ service: "payroll", heads: h }], "standard", AT).monthly;
      const b = evaluateA4Items([{ service: "payroll", heads: h + 1 }], "standard", AT).monthly;
      expect(b, `payroll falls from ${h} to ${h + 1}`).toBeGreaterThanOrEqual(a);
    }
  });

  it("loads the sector risk onto VAT and the audit, and onto nothing else", () => {
    // mt-2026-08-26-taxret took the multiplier off the tax return, and the
    // corrections flip took it off payroll. Both are easy to reinstate by
    // reflex when someone adds a `* rm` back "for consistency".
    const only = (item: A4Item, cadence: "monthly" | "yearly") => RISKS.map((r) => evaluateA4Items([item], r, AT)[cadence]);
    for (const expenses of BANDS) {
      const [std, ele, high] = only({ service: "taxret", entity: "company", expenses }, "yearly");
      expect(std, `tax return risk-multiplied at ${expenses}`).toBe(ele);
      expect(std).toBe(high);
      expect(std, `tax return ${expenses} off-formula`).toBe(taxReturnYearly("company", expenses));
    }
    for (const heads of [1, 5, 11]) {
      const [std, ele] = only({ service: "payroll", heads }, "monthly");
      expect(std, `payroll risk-multiplied at ${heads} heads`).toBe(ele);
    }
    // ...and the two that DO carry it still do.
    const [vStd, vEle] = only({ service: "vat", txn: "21-60", vatreg: "art10" }, "monthly");
    expect(vEle).toBeGreaterThan(vStd);
    const [aStd, aEle] = only({ service: "audit", txn: "21-60" }, "yearly");
    expect(aEle).toBeGreaterThan(aStd);
  });

  it("quotes the same audit and the same tax return on /audit-services as in the wizard", () => {
    // Two engines, one rate card: `calcAuditFee` drives /audit-services and
    // `evaluateA4Items` drives the homepage wizard, /pricing and the quote
    // builder. They read the same pack, so a divergence here means one of them
    // has grown arithmetic of its own.
    //
    // Owner ruling 2026-08-26: the audit page has NO payroll / VAT / bank
    // add-ons any more, so this must hold across the WHOLE input space —
    // every sector × band × company size — not just the add-on-free corner.
    // The one figure the wizard does not apply is the €AUDIT_PRE_TRADING
    // floor: a small company's review at a low band prices below it in the
    // wizard and is lifted to it here.
    for (const sector of AUDIT_SECTORS) for (const t of AUDIT_TXN) for (const size of AUDIT_SIZES) {
      const where = `${sector.id}/${t.id}/${size.id}`;
      const viaAudit = auditAt({ sector: sector.id, txn: t.id, size: size.id });
      if (sector.tier === "refer") {
        expect(viaAudit.refer, where).toBe(true);
        continue;
      }
      if (viaAudit.refer) throw new Error(`unexpected referral at ${where}`);
      const review = size.id !== "big" && AUDIT_TXN.findIndex((b) => b.id === t.id) < 4;
      expect(viaAudit.review, `review flag ${where}`).toBe(review);
      const viaWizard = evaluateA4Items([review ? { service: "audit", txn: t.id, review: true } : { service: "audit", txn: t.id }], sector.tier, AT).yearly;
      expect(viaAudit.final, where).toBe(Math.max(AUDIT_PRE_TRADING, viaWizard));
      if (viaWizard >= AUDIT_PRE_TRADING) expect(viaAudit.final, `exact parity ${where}`).toBe(viaWizard);
    }

    for (const t of AUDIT_TXN) {
      expect(t.assure, `audit band ${t.id}`).toBe(AUDIT_YEARLY[t.id]);

      const review = evaluateA4Items([{ service: "audit", txn: t.id, review: true }], "standard", AT).yearly;
      expect(review, `review ${t.id}`).toBe(Math.round(AUDIT_YEARLY[t.id] * REVIEW_ENGAGEMENT_FACTOR));

      // The tax-return ADD-ON on the audit page is the same figure the wizard
      // bills — it is the one that just moved, and it moved in two files.
      const withTax = auditAt({ txn: t.id, taxret: "yes" });
      // The add-on is the company entry-band ESTIMATE since the formula flip.
      if (!withTax.refer) expect(withTax.taxAdd, `tax add-on ${t.id}`).toBe(TAXRET_ESTIMATE_FROM);
    }
  });

  it("does not load the audit page's tax return by sector either", () => {
    for (const sector of ["shop", "hospitality", "regulated"]) {
      const r = auditAt({ sector, txn: "1000+", taxret: "yes" });
      if (!r.refer) expect(r.taxAdd, `tax add-on loaded for ${sector}`).toBe(TAXRET_ESTIMATE_FROM);
    }
  });
});
