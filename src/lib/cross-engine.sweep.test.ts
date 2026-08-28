/**
 * CROSS-ENGINE SWEEP — NOT COMMITTED. Lives in this worktree only because it
 * needs three repos in one process: this site's engines, the vacei.com page
 * scripts (extracted from the HTML and evaluated as plain JS) and the portal
 * backend's re-pricer. Run with:  npx vitest run src/lib/cross-engine.sweep.test.ts
 *
 * Every pair below shares an input vocabulary; the sweep walks the whole space
 * and demands agreement to the euro. A single mismatch means one surface has
 * grown arithmetic of its own.
 */
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import {
  A4_QUOTE_PACK_VERSION, SECTORS, TXN_BANDS, EXPENSE_BANDS, RISK_TIERS, sectorTier, AUDIT_YEARLY, VAT_MONTHLY,
  managedMonthly, BOOKKEEPING_VOLUME_UPLIFT, BANK_ACCOUNT, banksMonthly, bankAccountMonthly, TAXRET_FACTOR, taxReturnYearly, payrollFee,
  PAYROLL_PER_HEAD, MBR_ANNUAL_RETURN, CAPITAL_BANDS,
  type TxnBand, type ManagedEntity,
} from "@/data/a4QuotePack";
import { evaluateA4Items, type A4Item, type A4Risk } from "@/lib/websiteQuotation";
import { calcAuditFee, type AuditInput } from "@/lib/audit-fee";
import { calcAccountingFee } from "@/lib/accounting-fee";
import { qCalc, qItems, qRisk, Q_INIT, type QState } from "@/components/a4-landing/LandingQuoteCalculator";
import { lpCalc, LP_INIT } from "@/components/a4-landing/LandingPlan";
import { buildQuote } from "@/lib/quotation";
// Backend re-pricer — the copy that decides whether a quotation is issued at all.
import { evaluateA4ServicesQuote, MALTA_QUOTE_PACK, MALTA_QUOTE_PACK_VERSION } from "../../../pb-parity/src/modules/quote-pack/malta-pack";

const AT = new Date("2026-09-01T12:00:00Z");
const VMS = "C:/Users/user/code-local/vms-parity/";

/* ------------------------------------------------------------------ */
/* vacei.com engines, lifted out of the HTML                            */
/* ------------------------------------------------------------------ */
function loadVaceiHome() {
  const html = fs.readFileSync(VMS + "index.html", "utf8");
  const tagAt = html.indexOf('<script type="text/x-dc" data-dc-script data-props="');
  const start = html.indexOf('">', tagAt) + 2;
  const end = html.indexOf("</script>", start);
  const script = html.slice(start, end);
  const top = script.slice(0, script.indexOf("class Component extends DCLogic"));
  const take = (from: string, to: string) => {
    const a = script.indexOf(from);
    const b = script.indexOf(to, a);
    if (a < 0 || b < 0) throw new Error(`cannot find ${from}`);
    // method body = after "name() {" up to (not including) the "\n  }" that closes it
    const body = script.slice(a + from.length, b);
    return body.slice(0, body.lastIndexOf("}"));
  };
  const qBody = take("qCalc() {", "\n  qVals() {").replace("const q = this.state.q;", "");
  const cBody = take("calcVals() {", "\n  loadFeed() {")
    .replace("const c = this.state.calc, inc = this.state.inc;", "")
    .replace(/this\./g, "self.");
  const src = `${top}
    function qCalc(q) { ${qBody} }
    function calcVals(calc, inc) {
      const self = { state: { calc, inc, cSend: { st: "" } }, setState() {}, _cSnap: null };
      const c = calc;
      const view = (function () { ${cBody} })();
      return { snap: self._cSnap, view };
    }
    return { PACK_ID, qCalc, calcVals, managedFee, upliftFee, banksFee, bankAccountFee, taxretFee, payrollFee, QT, MBR, QCAP, QSECT, QTIERS };`;
  return new Function("window", "document", "DCLogic", src)({}, {}, class {}) as {
    PACK_ID: string;
    managedFee: (e: string, b: string) => number | null;
    upliftFee: (t: string) => number | null;
    banksFee: (e: string, b: string, t: string, n: number) => number;
    bankAccountFee: (e: string, b: string, t: string) => number;
    taxretFee: (e: string, b: string) => number | null;
    payrollFee: (h: number) => number;
    MBR: unknown;
    qCalc: (q: Record<string, unknown>) => Record<string, any>;
    calcVals: (c: Record<string, unknown>, inc: Record<string, unknown>) => { snap: any; view: any };
    QT: { vat: Record<string, number>; assure: Record<string, number> };
    QCAP: [string, string, string][];
  };
}

function loadVaceiAudit() {
  const html = fs.readFileSync(VMS + "services/audit.html", "utf8");
  const tagAt = html.indexOf('<script type="text/x-dc" data-dc-script>');
  const start = tagAt + '<script type="text/x-dc" data-dc-script>'.length;
  const end = html.indexOf("</script>", start);
  const script = html.slice(start, end);
  const top = script.slice(0, script.indexOf("class Component extends DCLogic"));
  const a = script.indexOf("calc() {");
  const b = script.indexOf("\n  maybeQuote() {", a);
  let body = script.slice(a + "calc() {".length, b);
  body = body.slice(0, body.lastIndexOf("}")).replace("const s = this.state;", "");
  const src = `${top}\nfunction calc(s) { ${body} }\nreturn { calc, ASSURE, TAXRET_ESTIMATE_FROM };`;
  return new Function("window", "document", src)({}, {}) as {
    calc: (s: AuditInput) => any;
    ASSURE: Record<string, number>;
    TAXRET_ESTIMATE_FROM: number;
  };
}

const home = loadVaceiHome();
const vAudit = loadVaceiAudit();

const PRICEABLE = SECTORS.filter((s) => RISK_TIERS[sectorTier(s.id)].multiplier != null);
const RISK_OF = (id: string): A4Risk => sectorTier(id) as A4Risk;
const ENTITIES: ManagedEntity[] = ["sole", "company"];
const BANDS = EXPENSE_BANDS.map((b) => b.id);
const TXNS = TXN_BANDS.map((b) => b.id);
const tot = (t: { monthly: number; yearly: number; oneOff: number; catchup: number }) => [t.monthly, t.yearly, t.oneOff, t.catchup];

describe("pack identity", () => {
  it("all three copies carry the same pack version and the same rate tables", () => {
    expect(home.PACK_ID).toBe(A4_QUOTE_PACK_VERSION);
    expect(MALTA_QUOTE_PACK_VERSION).toBe(A4_QUOTE_PACK_VERSION);
    // Tables, not just the label: managed base, uplift, bank surcharge, VAT, audit, tax factor, payroll, MBR.
    for (const entity of ENTITIES) for (const b of BANDS) {
      expect(home.managedFee(entity, b), `vacei managed ${entity}/${b}`).toBe(managedMonthly(entity, b));
      expect(MALTA_QUOTE_PACK.managedBookkeeping[entity][b], `backend managed ${entity}/${b}`).toBe(managedMonthly(entity, b));
    }
    for (const t of TXNS) {
      expect(home.upliftFee(t), `vacei uplift ${t}`).toBe(BOOKKEEPING_VOLUME_UPLIFT[t]);
      expect(MALTA_QUOTE_PACK.bookkeepingVolumeUpliftMonthly[t], `backend uplift ${t}`).toBe(BOOKKEEPING_VOLUME_UPLIFT[t]);
      expect(home.QT.vat[t], `vacei vat ${t}`).toBe(VAT_MONTHLY[t]);
      expect(MALTA_QUOTE_PACK.tables.vat[t], `backend vat ${t}`).toBe(VAT_MONTHLY[t]);
      expect(home.QT.assure[t], `vacei audit ${t}`).toBe(AUDIT_YEARLY[t]);
      expect(MALTA_QUOTE_PACK.tables.assure[t], `backend audit ${t}`).toBe(AUDIT_YEARLY[t]);
      expect(vAudit.ASSURE[t], `vacei audit page ${t}`).toBe(AUDIT_YEARLY[t]);
    }
    // mt-2026-08-27-entry: FIRST account included; each EXTRA account =
    // round(40 + 15% × (base + uplift)) — per-account rounded, then × (count−1).
    expect(MALTA_QUOTE_PACK.bankAccount).toEqual({ baseMonthly: BANK_ACCOUNT.baseMonthly, pctOfBookkeeping: BANK_ACCOUNT.pctOfBookkeeping });
    for (const entity of ENTITIES) for (const b of BANDS) for (const t of TXNS) {
      expect(home.bankAccountFee(entity, b, t), `vacei per-account ${entity}/${b}/${t}`).toBe(bankAccountMonthly(entity, b, t));
      expect(home.banksFee(entity, b, t, 1), `vacei 1 account ${entity}/${b}/${t}`).toBe(0);
      expect(home.banksFee(entity, b, t, 3), `vacei 3 accounts ${entity}/${b}/${t}`).toBe(banksMonthly(entity, b, t, 3));
    }
    expect(bankAccountMonthly("company", "10-25k", "21-60")).toBe(52); // worked example: 69 + 10 = 79 → round(51.85)
    expect(banksMonthly("company", "10-25k", "21-60", 1)).toBe(0); // first account included
    expect(banksMonthly("company", "10-25k", "21-60", 3)).toBe(104); // 2 extras × 52
    expect(MALTA_QUOTE_PACK.taxReturnFactor).toBe(TAXRET_FACTOR);
    for (const entity of ENTITIES) for (const b of BANDS) expect(home.taxretFee(entity, b), `vacei taxret ${entity}/${b}`).toBe(taxReturnYearly(entity, b));
    for (const h of [1, 5, 11, 40]) {
      expect(home.payrollFee(h)).toBe(payrollFee(h));
      expect(MALTA_QUOTE_PACK.payrollMarginalTiers.map((t) => t.rate)).toEqual(PAYROLL_PER_HEAD.map((t) => t.rate));
    }
    expect(home.MBR).toEqual({ ourFee: MBR_ANNUAL_RETURN.ourFee, registry: MBR_ANNUAL_RETURN.registryFeeByCapital });
    expect(MALTA_QUOTE_PACK.mbrAnnualReturn).toEqual(MBR_ANNUAL_RETURN);
    // Capital-band labels read the same on both sites (a4 used to say "+ formula").
    expect(home.QCAP.map((c) => c[2])).toEqual(CAPITAL_BANDS.map((c) => c.note));
  });
});

describe("vacei.com homepage wizard ↔ a4.com.mt evaluateA4Items ↔ portal backend", () => {
  it("agrees to the euro on every managed-books basket", { timeout: 120000 }, () => {
    let n = 0;
    for (const { id: sector } of PRICEABLE) for (const entity of ENTITIES) for (const expenses of BANDS) for (const txn of TXNS)
      for (const banks of [1, 3]) for (const head of [0, 7]) for (const vatreg of ["art10", "art11", "art12", "none"]) for (const behind of [0, 5]) {
        const q = {
          sector, entity, expenses, txn, banks, book: "we", pay: head > 0 ? "we" : "none", head,
          vat: vatreg === "none" ? "none" : "we", vatreg, taxret: "we", assure: "none", size: "small",
          regoff: entity === "company" ? "we" : "none", annret: entity === "company" ? "we" : "none", cap: "5000",
          behind: String(behind), start: "2026-10",
        };
        const v = home.qCalc(q);
        expect(v.refer || v.conflict || v.noExpenses, `vacei refused ${JSON.stringify(q)}`).toBeFalsy();
        const items = v.items as A4Item[];
        const a4 = evaluateA4Items(items, RISK_OF(sector), AT);
        const be = evaluateA4ServicesQuote({ kind: "a4-services", version: 1, risk: RISK_OF(sector), serviceStartDate: "2026-10", items }, AT);
        const where = `${sector}/${entity}/${expenses}/${txn}/${banks}b/${head}h/${vatreg}/${behind}m`;
        expect(be, `backend nulled ${where}`).not.toBeNull();
        expect([v.moTot, v.yrTot, v.oneTot, v.catchup], `vacei vs a4 at ${where}`).toEqual(tot(a4));
        expect(tot(be!), `backend vs a4 at ${where}`).toEqual(tot(a4));
        n++;
      }
    console.log(`managed-books baskets compared: ${n}`);
  });

  it("agrees on every assurance basket", { timeout: 60000 }, () => {
    let n = 0;
    for (const { id: sector } of PRICEABLE) for (const expenses of BANDS) for (const txn of TXNS) for (const size of ["small", "big", "unsure"]) {
      const q = {
        sector, entity: "company", expenses, txn, banks: 1, book: "none", pay: "none", head: 0, vat: "none", vatreg: "none",
        taxret: "we", assure: "we", size, regoff: "we", annret: "we", cap: "50000", behind: "0", start: "2026-10",
      };
      const v = home.qCalc(q);
      const items = v.items as A4Item[];
      const a4 = evaluateA4Items(items, RISK_OF(sector), AT);
      const be = evaluateA4ServicesQuote({ kind: "a4-services", version: 1, risk: RISK_OF(sector), serviceStartDate: "2026-10", items }, AT);
      const where = `${sector}/${expenses}/${txn}/${size}`;
      expect(be, `backend nulled ${where}`).not.toBeNull();
      expect([v.moTot, v.yrTot, v.oneTot, v.catchup], `vacei vs a4 at ${where}`).toEqual(tot(a4));
      expect(tot(be!), `backend vs a4 at ${where}`).toEqual(tot(a4));
      n++;
    }
    console.log(`assurance baskets compared: ${n}`);
  });
});

describe("a4.com.mt homepage wizard (qCalc) ↔ evaluateA4Items ↔ backend", () => {
  it("agrees on its own basket across the space", { timeout: 120000 }, () => {
    let n = 0;
    for (const { id: sector } of PRICEABLE) for (const entity of ENTITIES) for (const expenses of BANDS) for (const txn of TXNS)
      for (const banks of [1, 4]) for (const head of [0, 3]) for (const vatreg of ["art10", "art11", "art12"]) for (const behind of ["0", "9"]) for (const assure of ["none", "we"]) {
        if (assure === "we" && entity !== "company") continue;
        const q: QState = {
          ...Q_INIT, sector, entity, expenses, txn, banks, head, vatreg, behind, size: "small", cap: "10000",
          book: assure === "we" ? "none" : "managed", pay: head > 0 ? "we" : "none", vat: assure === "we" ? "none" : "we",
          taxret: "we", assure, regoff: entity === "company" ? "we" : "none",
        };
        const r = qCalc(q, AT);
        if (r.refer || r.conflict || r.noExpenses) throw new Error(`a4 wizard refused ${JSON.stringify(q)}`);
        const items = qItems(q);
        const a4 = evaluateA4Items(items, qRisk(q), AT);
        const be = evaluateA4ServicesQuote({ kind: "a4-services", version: 1, risk: qRisk(q), serviceStartDate: "2026-10", items }, AT);
        const where = `${sector}/${entity}/${expenses}/${txn}/${banks}b/${head}h/${vatreg}/${behind}m/${assure}`;
        expect(be, `backend nulled ${where}`).not.toBeNull();
        expect([r.moTot, r.yrTot, r.oneTot], `wizard vs evaluateA4Items at ${where}`).toEqual([a4.monthly, a4.yearly, a4.oneOff]);
        expect(tot(be!), `backend vs a4 at ${where}`).toEqual(tot(a4));
        n++;
      }
    console.log(`a4 wizard baskets compared: ${n}`);
  });

  it("prices the same company identically to the vacei.com wizard", { timeout: 60000 }, () => {
    for (const { id: sector } of PRICEABLE) for (const entity of ENTITIES) for (const expenses of BANDS) for (const txn of TXNS) for (const banks of [1, 2]) {
      const a = qCalc({ ...Q_INIT, sector, entity, expenses, txn, banks, head: 4, vatreg: "art10", behind: "3", book: "managed", pay: "we", vat: "we", taxret: "we", regoff: entity === "company" ? "we" : "none", cap: "1500" }, AT);
      const v = home.qCalc({ sector, entity, expenses, txn, banks, book: "we", pay: "we", head: 4, vat: "we", vatreg: "art10", taxret: "we", assure: "none", size: "small", regoff: entity === "company" ? "we" : "none", annret: entity === "company" ? "we" : "none", cap: "1500", behind: "3", start: "2026-10" });
      if (a.refer || a.conflict || a.noExpenses) throw new Error("refused");
      expect([a.moTot, a.yrTot, a.oneTot], `${sector}/${entity}/${expenses}/${txn}/${banks}`).toEqual([v.moTot, v.yrTot, v.oneTot]);
    }
  });
});

describe("vacei.com /services/audit ↔ a4.com.mt /audit-services ↔ the wizards", () => {
  it("is the same engine, over the whole input space, and equals the wizard's audit line", { timeout: 120000 }, () => {
    let n = 0;
    for (const sector of SECTORS) for (const txn of TXNS) for (const size of ["small", "big", "unsure"]) for (const taxret of ["yes", "no"])
      for (const year of ["2025", "multi"]) for (const nyrs of ["2", "4"]) for (const chg of ["no", "yes"]) for (const uploaded of [false, true]) for (const doc of ["fs", "mgmt"] as const) {
        if (year !== "multi" && nyrs !== "2") continue;
        if (!uploaded && (chg !== "no" || doc !== "fs")) continue;
        const s = { sector: sector.id, txn, size, taxret, year, nyrs, chg, uploaded, doc } as unknown as AuditInput;
        const a = calcAuditFee(s);
        const v = vAudit.calc(s);
        const where = JSON.stringify(s);
        expect(v.refer, where).toBe(a.refer);
        if (!a.refer && !v.refer) {
          expect([v.fee, v.final, v.disc, v.total, v.taxAdd, v.review], where).toEqual([a.fee, a.final, a.disc, a.total, a.taxAdd, a.review]);
          // No add-ons: the questionnaire fee (before any upload discount) IS the wizard's audit line plus the flat tax-return estimate.
          const tier = sectorTier(sector.id) as A4Risk;
          const w = evaluateA4Items([{ service: "audit", txn: txn as TxnBand, ...(a.review ? { review: true as const } : {}) }], tier, AT).yearly;
          expect(a.fee, `audit page vs wizard at ${where}`).toBe(w + a.taxAdd);
        }
        n++;
      }
    console.log(`audit combinations compared: ${n}`);
  });

  it("quotes the tax-return add-on flat at the company entry estimate, never risk-loaded", () => {
    expect(vAudit.TAXRET_ESTIMATE_FROM).toBe(235);
    for (const sector of PRICEABLE) for (const txn of TXNS) {
      const v = vAudit.calc({ sector: sector.id, txn, size: "big", taxret: "yes", year: "2025", nyrs: "2", chg: "no", uploaded: false, doc: "fs" } as unknown as AuditInput);
      expect(v.taxAdd).toBe(235);
    }
  });
});

describe("vacei.com popup estimator ↔ pack arithmetic", () => {
  it("prices each line at the entry-band figure the wizard would give for one bank account", () => {
    for (const entity of ENTITIES) for (const tx of [5, 20, 21, 60, 61, 150, 151, 400, 401, 1000, 1001]) for (const hc of [0, 1, 6]) for (const backlog of ["none", "yes"]) {
      const c = { entity, tx, hc, backlog, bm: 6, vat: "full", payroll: hc > 0 ? "full" : "none", mbr: "none", audit: "full" };
      const { snap } = home.calcVals(c, { added: false, sh: 0 });
      const band: TxnBand = tx <= 20 ? "1-20" : tx <= 60 ? "21-60" : tx <= 150 ? "61-150" : tx <= 400 ? "151-400" : tx <= 1000 ? "401-1000" : "1000+";
      const items: A4Item[] = [
        { service: "bookkeeping-managed", entity, expenses: "0-10k", txn: band, banks: 1 },
        { service: "vat", txn: band, vatreg: "art10" },
        ...(hc > 0 ? [{ service: "payroll", heads: hc } as A4Item] : []),
        { service: "audit", txn: band, review: true },
        ...(backlog === "yes" ? [{ service: "catchup", months: 6, entity, expenses: "0-10k", txn: band, banks: 1 } as A4Item] : []),
      ];
      const a4 = evaluateA4Items(items, "standard", AT);
      const where = `${entity}/${tx}tx/${hc}h/${backlog}`;
      expect(snap.monthly, `popup monthly ${where}`).toBe(a4.monthly);
      expect(snap.yearly, `popup yearly ${where}`).toBe(a4.yearly);
      expect(snap.catchup, `popup catch-up ${where}`).toBe(a4.catchup);
    }
  });
});

describe("a4.com.mt /accounting-services ↔ evaluateA4Items", () => {
  it("prices the same monthly and catch-up as the wizard for the same answers", { timeout: 60000 }, () => {
    for (const sector of PRICEABLE) for (const entity of ENTITIES) for (const expenses of BANDS) for (const txn of TXNS) for (const head of [0, 5]) for (const vatreg of ["none", "art10", "art11", "art12"] as const) for (const behind of ["0", "12"]) for (const banks of [1, 2]) {
      const r = calcAccountingFee({ sector: sector.id, txn, entity, expenses, head, vatreg, behind, startMonth: "2026-09", banks }, AT);
      if (r.refer) throw new Error("refused");
      const items: A4Item[] = [{ service: "bookkeeping-managed", entity, expenses, txn, banks }];
      if (head > 0) items.push({ service: "payroll", heads: head });
      if (vatreg !== "none") items.push({ service: "vat", txn, vatreg });
      if (+behind > 0) items.push({ service: "catchup", months: +behind, entity, expenses, txn, banks });
      const a4 = evaluateA4Items(items, RISK_OF(sector.id), AT);
      const where = `${sector.id}/${entity}/${expenses}/${txn}/${head}h/${vatreg}/${behind}m/${banks}b`;
      // art. 11 is a yearly declaration the estimator shows as a monthly share, so compare that one on the yearly figure.
      if (vatreg === "art11") expect(Math.round(r.monthlyFull), where).toBe(Math.round(a4.monthly + a4.yearly / 12));
      else expect(r.monthlyFull, where).toBe(a4.monthly);
      expect(r.oneOffFull, where).toBe(a4.catchup);
    }
  });
});

describe("a4.com.mt /automated-bookkeeping plan widget (floor surface)", () => {
  it("quotes the single-account low-volume figure the wizard gives for the same spend band", () => {
    const vatBand: Record<string, TxnBand> = { low: "1-20", mid: "21-60", high: "61-150" };
    for (const entity of ["company", "personal"] as const) for (const expenses of BANDS) for (const vatFreq of ["low", "mid", "high"] as const) for (const emps of [1, 4]) {
      const s = { ...LP_INIT, entity, expenses, vat: true, vatFreq, payroll: entity === "company", emps, catchUpMonths: 3 };
      const r = lpCalc(s, AT);
      const packEntity: ManagedEntity = entity === "company" ? "company" : "sole";
      const items: A4Item[] = [
        { service: "bookkeeping-managed", entity: packEntity, expenses, txn: "1-20", banks: 1 },
        { service: "vat", txn: vatBand[vatFreq], vatreg: "art10" },
        ...(entity === "company" ? [{ service: "payroll", heads: emps } as A4Item] : []),
        { service: "catchup", months: 3, entity: packEntity, expenses, txn: "1-20", banks: 1 },
      ];
      const a4 = evaluateA4Items(items, "standard", AT);
      expect(r.monthly, `${entity}/${expenses}/${vatFreq}/${emps}`).toBe(a4.monthly);
      expect(r.catchUp, `${entity}/${expenses}`).toBe(a4.catchup);
    }
  });
});

describe("a4.com.mt /quote builder ↔ vacei.com wizard", () => {
  it("prices books + VAT + audit the same as vacei.com for the same sector, volume, spend and banks", () => {
    for (const sector of PRICEABLE) for (const txn of TXNS) for (const expenses of BANDS) for (const banks of [1, 2]) {
      const q = buildQuote({ company: "T", industry: sector.label, sector: sector.id, txn, banks, services: ["accounts", "vat"], entity: "company", expenses, catchUpMonths: 2, startMonth: "2026-09" });
      const v = home.qCalc({ sector: sector.id, entity: "company", expenses, txn, banks, book: "we", pay: "none", head: 0, vat: "we", vatreg: "art10", taxret: "none", assure: "none", size: "small", regoff: "none", annret: "none", cap: "1500", behind: "2", start: "2026-10" });
      const where = `${sector.id}/${txn}/${expenses}/${banks}`;
      expect(q.monthlyTotalEur, where).toBe(v.moTot);
      expect(q.lines.find((l) => l.id === "catchup")?.annualEur, where).toBe(v.catchup);
      const qa = buildQuote({ company: "T", industry: sector.label, sector: sector.id, txn, banks, services: ["audit"], entity: "company", expenses, startMonth: "2026-09" });
      const va = home.qCalc({ sector: sector.id, entity: "company", expenses, txn, banks, book: "none", pay: "none", head: 0, vat: "none", vatreg: "none", taxret: "none", assure: "we", size: "big", regoff: "none", annret: "none", cap: "1500", behind: "0", start: "2026-10" });
      expect(qa.annualTotalEur, `audit ${where}`).toBe(va.yrTot);
    }
  });
});
