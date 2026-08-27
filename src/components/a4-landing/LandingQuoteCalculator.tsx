"use client";

import React, { useState } from "react";
import { Button, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
import { AUDIT_YEARLY, BOOKKEEPING_VOLUME_UPLIFT, BOOKKEEPING_MANAGED_MONTHLY, bankAccountMonthly, BANK_ACCOUNT, taxReturnYearly, VAT_MONTHLY, VAT_RULES, REVIEW_ENGAGEMENT_FACTOR, REGISTERED_OFFICE_YEARLY, payrollFee, payrollFeeLabel, CAPITAL_BANDS, MBR_ANNUAL_RETURN, EXPENSE_BANDS, LAUNCH_PROMO, catchUpAmount, catchUpLabel, fullMonthlyBookkeeping, isPromoActive, managedMonthly, type CapitalBand, type ExpenseBand, type ManagedEntity, type TxnBand } from "@/data/a4QuotePack";
import { submitWebsiteQuotation, type A4Item, type A4Risk, type WebsiteQuoteResult } from "@/lib/websiteQuotation";
import { independenceFlags } from "@/lib/independence";
import { catchUpMonthsFrom, formatStartMonth, ongoingStartMonth } from "@/lib/accounting-fee";
import { trackConversion } from "@/lib/analytics";

// Homepage pricing calculator — a port of the Vacei site's cost calculator
// (vacei-marketing-site/index.html: QSTEPS / QS / qCalc / qVals). Owner ruling
// 2026-08-26: "make sure it is exactly like vacei.com — the calculator". The
// step order, questions, options, copy and gating below are vacei's, verbatim;
// only the visual primitives are a4's. If the vacei wizard changes, change it
// there first and mirror it here.
//
// Every figure is read from the pack (A4_QUOTE_PACK_VERSION) — the same tables
// vacei.com and the portal backend carry. Bookkeeping is priced by ENTITY ×
// MONTHLY EXPENSES across nine bands, plus a transaction-band uplift and a
// per-account bank fee — every account, the first included, at €40/mo plus
// 15% of the bookkeeping fee (mt-2026-08-26d-banks).

const QSECT: [string, string, keyof typeof QTIERS][] = [
  ["shop", "Shop, trade or services", "standard"],
  ["consulting", "Consulting or freelancing", "standard"],
  ["property", "Property or rentals", "standard"],
  ["hospitality", "Restaurant, bar or hotel", "elevated"],
  ["online", "Online sales or cross-border", "elevated"],
  ["holding", "Holding or investment company", "elevated"],
  ["regulated", "Gaming, crypto or financial services", "high"],
  ["other", "Something else", "refer"],
];
const QTIERS = {
  standard: { l: "Standard", mult: 1, refer: false, note: null as [string, string] | null },
  elevated: { l: "Elevated", mult: 1.2, refer: false, note: ["info", "Sectors like this need a few extra checks when we take you on. They are part of taking you on, not an extra charge."] as [string, string] },
  high: { l: "High", mult: 1.45, refer: false, note: ["warn", "Licensed and regulated sectors need full source-of-funds checks and closer monitoring. A director signs off before we take the work on."] as [string, string] },
  refer: { l: "Referral", mult: 1, refer: true, note: ["warn", "We price most companies on the spot, but yours needs a short call with a director before we put a number on it. Usually the same day."] as [string, string] },
};
const QENTITY: [ManagedEntity, string][] = [["sole", "Self-employed"], ["company", "A company"]];
const QTXN: [string, string, string][] = [
  ["0", "None yet", "not trading"],
  ["1-20", "Up to 20", "a few a week"],
  ["21-60", "20 to 60", "most days"],
  ["61-150", "60 to 150", "busy"],
  ["151-400", "150 to 400", "high volume"],
  ["401-1000", "400 to 1,000", "very high"],
  ["1000+", "1,000+", "enterprise"],
];
const QVATREG: [string, string, string][] = [
  ["none", "Not registered", "tax return only"],
  ["art10", "Yes", "charging and reclaiming"],
  ["art11", "Small exempt", "under the threshold"],
  ["art12", "EU purchases", "acquisitions only"],
  ["unsure", "Not sure", "we'll check"],
];
/* IESBA independence, in the site's own words — the single wording for the
   conflict, identical to vacei.com. Do not machine-translate. */
const CONFLICT_SUMMARY = "You have asked us to keep the books and to do the audit or review. We cannot do both for the same company — an auditor is not independent of books their own firm has kept, and a review engagement carries the same rule. So there is nothing to price until that is settled. Choose which one is ours below and the quote appears, or send this through and a director calls you.";
const CONFLICT_NOTE = "Whichever you leave with us, we arrange the other side with an independent firm — keep the bookkeeping here and we introduce you to an independent auditor, or take the audit or review here and we quote the bookkeeping out.";
const CONFLICT_SHORT = "The bookkeeping and the audit or review cannot both be ours — an auditor is not independent of books their own firm has kept. That is why the amounts have gone blank. Switch one of the two off, or carry on and the quote step gives you the choice.";
/** Onboarding carries NO figure. Vacei's wording; `qItems` gates the wire item on it. */
const ONBOARDING_NOTE = "Digital Onboarding and opening balances are not priced here. We quote those once we have seen your records, because what they take depends on the state they are in.";

// Every table reads the pack, so this calculator can never quote a different
// figure from /accounting-services, /audit-services, /quote or the Vacei side.
const QT: Record<string, Record<string, number>> = {
  vat: VAT_MONTHLY,
  assure: AUDIT_YEARLY,
};

/* Two volume questions, deliberately named apart on the rail: MONTHLY SPEND
   (inside "Your bookkeeping") prices the bookkeeping, TRANSACTIONS price the
   uplift, VAT and the audit. Step indices are named, not typed as literals. */
export const QSTEPS = ["Your bookkeeping", "What you do", "Transactions", "Payroll", "When we start", "VAT", "Your services", "Your quote"];
export const QS = { exp: 0, sector: 1, txn: 2, pay: 3, start: 4, vat: 5, svc: 6, quote: 7 } as const;
export const QSTEP_QUOTE = QSTEPS.length - 1;

export type QState = {
  step: number;
  sector: string;
  txn: string;
  /** Bank accounts to reconcile — 1..8; every one is priced, the first included (EUR 40 + 15% of the bookkeeping fee, each). */
  banks: number;
  /** Self-employed or a company — with `expenses`, what sets the bookkeeping price. */
  entity: ManagedEntity;
  /**
   * Monthly expenses band — the bookkeeping price driver. `""` means NOT YET
   * ANSWERED. There is no default band, deliberately — see `Q_INIT`.
   */
  expenses: ExpenseBand | "";
  /** Share-capital band — sets the MBR registry fee on the annual return. */
  cap: CapitalBand;
  /** "we" | "none" — the MBR annual return, asked in the services step. */
  annret: string;
  head: number;
  /** Earlier months still to do — DERIVED from `startMonth`, never asked. */
  behind: string;
  /** `YYYY-MM` — the EARLIEST month that still needs doing. REQUIRED to send. */
  startMonth: string;
  vatreg: string;
  /** Not asked (vacei asks no size step); inferred from the spend band and volume. */
  size: string;
  /** "none" | "managed" — A4 keeps the books, or does not. */
  book: string;
  pay: string;
  vat: string;
  taxret: string;
  assure: string;
  regoff: string;
};

/**
 * The wizard's opening state — vacei's defaults. `expenses` and `startMonth`
 * are EMPTY and must stay that way: the band and the month ARE the price, and
 * the wizard never invents either (see `noExpenses` in qCalc).
 */
export const Q_INIT: QState = {
  step: 0, sector: "shop", txn: "1-20", banks: 1, entity: "company", expenses: "", cap: "1500", annret: "we", head: 0, behind: "0",
  startMonth: "", vatreg: "art10", size: "small",
  book: "managed", pay: "none", vat: "none", taxret: "we", assure: "none", regoff: "none",
};

type Line = { n: string; e: string; v: number };
type Note = [string, string];

/** Volumes at which a company is unlikely to stay under the small-company thresholds. */
const QT_BIG_VOL = ["151-400", "401-1000", "1000+"];
/** €100k+ of MONTHLY spend cannot be under €93k of ANNUAL turnover. */
const BAND_BIG = ["100-200k", "200-300k", "300-400k", "400-500k", "500k+"];

/**
 * Whether the assurance line is a review engagement rather than a full audit.
 * Named so `qCalc` (what we show) and `qItems` (what we submit) can never
 * disagree about which of the two the visitor was quoted.
 */
function qAuditIsReview(q: QState) {
  const bandBig = BAND_BIG.indexOf(q.expenses) !== -1;
  return !bandBig && (q.size === "small" || q.size === "unsure") && QT_BIG_VOL.indexOf(q.txn) === -1;
}

/**
 * Wire-contract labels: `qItems` keys the basket off them and `lineAmt` looks
 * the amount up by them. Reword one and its item silently drops from the
 * submitted quote.
 */
const ASSURE_AUDIT_LABEL = "Financial audit (if applicable)";
const ASSURE_REVIEW_LABEL = "Review engagement (if applicable)";
const MBR_LABEL = "Annual return — filed with the MBR";

type Calc = {
  refer: boolean; conflict: boolean; noExpenses: boolean; noStart: boolean;
  notes: Note[]; mo: Line[]; yr: Line[]; one: Line[];
  moTot: number; yrTot: number; oneTot: number; grossMo: number; grossYr: number; promoApplied: boolean;
};
const unpriced = (flags: Partial<Pick<Calc, "refer" | "conflict" | "noExpenses">>, notes: Note[], noStart: boolean): Calc => ({
  refer: false, conflict: false, noExpenses: false, ...flags, noStart, notes,
  mo: [], yr: [], one: [], moTot: 0, yrTot: 0, oneTot: 0, grossMo: 0, grossYr: 0, promoApplied: false,
});

/** `now` is injectable so the promo window can be pinned in tests, exactly as
 *  `evaluateA4Items` does. The arithmetic is vacei's `qCalc`, line for line. */
export function qCalc(q: QState, now: Date = new Date()): Calc {
  const tier = QTIERS[(QSECT.find((s) => s[0] === q.sector) || QSECT[0])[2]];
  const notes: Note[] = [];
  if (tier.note) notes.push(tier.note);
  const noStart = !q.startMonth;
  if (tier.refer) return unpriced({ refer: true }, notes, noStart);
  const entity: ManagedEntity = q.entity === "sole" ? "sole" : "company";
  const rm = tier.mult;
  const mo: Line[] = [], yr: Line[] = [], one: Line[] = [];
  const managed = q.book === "managed";
  // IESBA independence, settled BEFORE anything is priced. A COMPANY matter:
  // a sole trader has no statutory audit, so there is nothing to conflict.
  if (managed && q.assure === "we" && entity === "company") {
    notes.push(["warn", CONFLICT_NOTE]);
    return unpriced({ conflict: true }, notes, noStart);
  }
  // Bookkeeping is priced on MONTHLY EXPENSES. With no band there is no rate —
  // it must NEVER fall back to the entry band.
  const band = managed ? q.expenses : "";
  const rate = managed ? (band === "" ? null : managedMonthly(entity, band)) : 0;
  if (managed && rate == null) return unpriced({ noExpenses: true }, notes, noStart);
  const nBanks = q.banks || 1;
  if (managed && rate != null) {
    const bandLabel = EXPENSE_BANDS.find((b) => b.id === band)?.label ?? "";
    mo.push({ n: "Bookkeeping", e: (entity === "sole" ? "self-employed" : "company") + ", " + bandLabel.toLowerCase() + " a month of expenses — you upload, we keep the books, an accountant approves every entry", v: rate });
    const up = BOOKKEEPING_VOLUME_UPLIFT[q.txn as TxnBand] ?? 0;
    if (up > 0) mo.push({ n: "Bookkeeping — volume uplift", e: "your transaction volume adds to the bookkeeping work", v: up });
    const per = bankAccountMonthly(entity, band as ExpenseBand, q.txn as TxnBand) ?? 0;
    mo.push({ n: "Bank accounts", e: nBanks + " × €" + per + " — every account reconciled separately, each at €" + BANK_ACCOUNT.baseMonthly + " plus " + Math.round(BANK_ACCOUNT.pctOfBookkeeping * 100) + "% of the bookkeeping fee", v: nBanks * per });
  }
  if (q.pay === "we" && q.head > 0) {
    // Marginal tiers, NO risk multiplier. The label spells out the exact sum.
    mo.push({ n: "Payroll", e: payrollFeeLabel(q.head) + " per person", v: payrollFee(q.head) });
  }
  if (q.vat === "we" && q.vatreg !== "none") {
    if (!managed) {
      notes.push(["warn", "We only put our name to a VAT return when we have kept the ledger behind it. Turn the bookkeeping back on in the services step and the returns unlock."]);
    } else {
      const vatreg = q.vatreg === "unsure" ? "art10" : q.vatreg;
      if (vatreg === "art11") {
        yr.push({ n: "VAT declaration", e: "small exempt — one declaration a year, priced on its own", v: VAT_RULES.art11FlatYearly * rm });
      } else {
        mo.push({ n: "VAT returns", e: "prepared and submitted quarterly, billed monthly — its own line, never folded into the bookkeeping", v: QT.vat[q.txn] * (vatreg === "art12" ? VAT_RULES.art12Factor : 1) * rm });
      }
      if (q.vatreg === "unsure") notes.push(["info", "We have priced you as fully VAT registered, the most common case. If the register says otherwise the price drops — we tell you before you commit."]);
    }
  }
  if (q.taxret === "we") {
    // Priced from the SPEND band, never from transactions and never × rm. With
    // no band there is nothing to price, so the basket degrades to the callback.
    const trFee = q.expenses === "" ? null : taxReturnYearly(entity, q.expenses);
    if (trFee == null) return unpriced({ noExpenses: true }, notes, noStart);
    yr.push({ n: "Annual tax return", e: "from the closed ledger, with schedules", v: trFee });
  }
  // Company-only: a Maltese sole trader has no statutory audit.
  if (q.assure === "we" && entity === "company") {
    const bigVol = QT_BIG_VOL.indexOf(q.txn) !== -1;
    const bandBig = BAND_BIG.indexOf(q.expenses) !== -1;
    const review = qAuditIsReview(q);
    yr.push({ n: review ? ASSURE_REVIEW_LABEL : ASSURE_AUDIT_LABEL, e: (review ? "review engagement — the lighter option" : "full financial audit") + ". Audits are carried out by our partner audit firms — we connect you with them, and the fee stays as quoted here.", v: QT.assure[q.txn] * (review ? REVIEW_ENGAGEMENT_FACTOR : 1) * rm });
    if (review) notes.push(["ok", "You likely qualify for a review instead of a full audit — about half the cost. We confirm it against your figures before anything is agreed."]);
    if (bigVol && q.size !== "big") notes.push(["warn", "At that volume a company is unlikely to stay under the small-company thresholds, so we priced a full audit. If your figures come in under, the price drops."]);
    if (bandBig && !bigVol) notes.push(["info", "At your monthly spend the company is above the small-company thresholds, so we priced a full audit rather than the lighter review. If your figures come in under them, the price drops."]);
  }
  // Company-only: a sole trader has no registered-office requirement.
  if (q.regoff === "we" && entity === "company") {
    yr.push({ n: "Registered office", e: "statutory address, post passed to you", v: REGISTERED_OFFICE_YEARLY });
  }
  // The MBR annual return is a COMPANY filing, and it is ASKED (the `annret`
  // toggle in the services step) — never inferred from other services.
  const mbrApplies = q.annret === "we" && entity === "company";
  const capRow = CAPITAL_BANDS.find((c) => c.id === (q.cap || "1500")) || CAPITAL_BANDS[0];
  /** Government money inside the yearly total — never discounted. */
  const registry = mbrApplies ? MBR_ANNUAL_RETURN.registryFeeByCapital[capRow.id] : 0;
  if (mbrApplies) yr.push({ n: MBR_LABEL, e: "€" + MBR_ANNUAL_RETURN.ourFee + " our fee + " + capRow.note + " registry fee (electronic), set by your share capital", v: MBR_ANNUAL_RETURN.ourFee + registry });
  // A backdated month costs the same as a live one, at the CLIENT'S OWN full
  // monthly rate, uncapped. The label is the arithmetic written out.
  const months = Math.max(0, Math.round(+q.behind || 0));
  if (months > 0 && managed && band !== "") {
    const promoNow = isPromoActive(now);
    const n = catchUpLabel(months, entity, band, q.txn as TxnBand, nBanks, promoNow);
    const v = catchUpAmount(months, entity, band, q.txn as TxnBand, nBanks, promoNow);
    if (n != null && v != null) one.push({ n, e: "the months before your start month, brought up to date and charged once, at your own full monthly rate", v });
  }
  [mo, yr, one].forEach((a) => a.forEach((l) => { l.v = Math.round(l.v); }));
  const sum = (a: Line[]) => a.reduce((s, l) => s + l.v, 0);
  const grossMo = sum(mo), grossYr = sum(yr), oneTot = sum(one);
  if (grossMo + grossYr + oneTot > 0) {
    notes.push(["info", ONBOARDING_NOTE]);
  } else if (tier.note && notes.indexOf(tier.note) !== -1) {
    notes.splice(notes.indexOf(tier.note), 1);
  }
  // The launch discount on the engine's own terms: the registry fee is never
  // discounted, one-offs are billed in full (catch-up carries its own discount
  // inside its line).
  const promo = isPromoActive(now) && grossMo + grossYr > 0;
  if (promo) notes.push(["ok", LAUNCH_PROMO.note]);
  const keep = 1 - LAUNCH_PROMO.pct;
  const moTot = promo ? Math.round(grossMo * keep) : grossMo;
  const yrTot = promo ? Math.round((grossYr - registry) * keep) + registry : grossYr;
  return { refer: false, conflict: false, noExpenses: false, noStart, mo, yr, one, notes, moTot, yrTot, oneTot, grossMo, grossYr, promoApplied: promo };
}

/* -------------------------------------------------------------------------- */
/* Submitting the quote                                                        */
/* -------------------------------------------------------------------------- */

/** The wizard's sector answer → the risk tier the backend prices on. */
export function qRisk(q: QState): A4Risk {
  const k = (QSECT.find((s) => s[0] === q.sector) || QSECT[0])[2];
  return k === "refer" ? "standard" : k;
}

/**
 * The visitor's answers → the priceable basket we submit. Every entry is gated
 * on a line `qCalc` ACTUALLY produced, so screen and wire cannot disagree.
 */
export function qItems(q: QState): A4Item[] {
  const r = qCalc(q);
  if (r.refer || r.conflict || r.noExpenses) return [];
  const all = [...r.mo, ...r.yr, ...r.one];
  const has = (n: string) => all.some((l) => l.n === n);
  const txn = q.txn as TxnBand;
  const entity: ManagedEntity = q.entity === "sole" ? "sole" : "company";
  const items: A4Item[] = [];
  const expenses = q.expenses as ExpenseBand;

  if (has("Bookkeeping")) items.push({ service: "bookkeeping-managed", entity, expenses, txn, banks: q.banks || 1 });
  if (has("Payroll")) items.push({ service: "payroll", heads: q.head });
  if (has("VAT returns")) items.push({ service: "vat", txn, vatreg: q.vatreg === "art12" ? "art12" : "art10" });
  if (has("VAT declaration")) items.push({ service: "vat", txn, vatreg: "art11" });
  if (has("Annual tax return")) items.push({ service: "taxret", entity, expenses });
  if (has(ASSURE_AUDIT_LABEL) || has(ASSURE_REVIEW_LABEL)) items.push({ service: "audit", txn, ...(qAuditIsReview(q) ? { review: true as const } : {}) });
  if (has("Registered office")) items.push({ service: "registered-office" });
  if (has(MBR_LABEL)) items.push({ service: "mbr", capital: q.cap || "1500" });
  if (r.one.length > 0 && q.book === "managed" && +q.behind > 0) items.push({ service: "catchup", months: +q.behind, entity, expenses, txn, banks: q.banks || 1 });
  // Onboarding carries NO figure but IS part of the basket — the backend reads
  // it to say so in the quotation. Gated on the note `qCalc` produced.
  if (r.notes.some(([, t]) => t === ONBOARDING_NOTE)) items.push({ service: "onboarding" });

  return items;
}

/**
 * One "Next" click, as a pure function — the wizard's ONLY step transition.
 * Vacei's `qNext`: the payroll answer is derived from the headcount when the
 * payroll step is left; nothing else is switched on for the visitor.
 */
export function qAdvance(q: QState, lastStep: number = QSTEP_QUOTE): Partial<QState> {
  const patch: Partial<QState> = { step: Math.min(lastStep, q.step + 1) };
  if (q.step === QS.pay) patch.pay = q.head > 0 ? "we" : "none";
  return patch;
}

/**
 * IESBA routing. `assure: "we"` is audit-side whether it prices as a full audit
 * or a review — but only for a COMPANY: a sole trader has no statutory audit,
 * so vacei prices nothing for it and flags no conflict.
 */
export function qIndependence(q: QState) {
  return independenceFlags({
    wantsBookkeeping: q.book === "managed",
    wantsAudit: q.assure === "we" && q.entity !== "sole",
  });
}

function qSummarise(q: QState) {
  const bits: string[] = [];
  if (q.book === "managed") bits.push("you upload and we keep the books, reviewed by an accountant before anything counts");
  if (q.pay === "we" && q.head > 0) bits.push("we run your payroll");
  if (q.vat === "we" && q.vatreg !== "none" && q.book === "managed") bits.push("we prepare and submit your VAT returns");
  if (q.taxret === "we") bits.push("we prepare your annual tax return");
  if (q.assure === "we" && q.entity !== "sole") bits.push("we handle your audit or review");
  if (q.regoff === "we" && q.entity !== "sole") bits.push("we provide your registered office");
  if (!bits.length) return "Nothing picked yet — choose what you need in the services step.";
  const j = bits.length === 1 ? bits[0] : bits.slice(0, -1).join(", ") + ", and " + bits[bits.length - 1];
  let out = "So: " + j + ".";
  if (+q.behind > 0 && q.book === "managed") out += " The " + (+q.behind) + " months from your start month up to this one are brought up to date first, charged once at the same monthly rate.";
  // Said whenever the figures are real but not yet final.
  if (!q.startMonth) out += " These figures are your running total: pick the month you need us from and we add any catch-up months, then the quote can be issued.";
  return out;
}

const euro = (n: number) => "€" + Math.round(n).toLocaleString("en-GB");

const NOTE_STYLE: Record<string, { bg: string; fg: string; bc: string }> = {
  ok: { bg: "rgba(0,168,126,.10)", fg: "#0b7a5d", bc: "rgba(0,168,126,.30)" },
  warn: { bg: "#FFF7E9", fg: "#8A6100", bc: "#E8D2A4" },
  info: { bg: "rgba(73,79,223,.08)", fg: "var(--a4-primary-deep)", bc: "rgba(73,79,223,.25)" },
};

const Q_INPUT: React.CSSProperties = {
  flex: "1 1 170px", minWidth: 0, height: 38, padding: "0 12px", borderRadius: "var(--a4-r-md)",
  border: "1px solid var(--a4-hairline-light)", background: "#fff", color: "var(--a4-ink)",
  fontFamily: "var(--a4-font-body)", fontSize: 13,
};

/** A labelled lead-form field — visible label above the input, an example
 *  value as the placeholder (vacei's form, not placeholder-as-label). */
const Q_FIELD: React.CSSProperties = { flex: "1 1 170px", minWidth: 0, display: "flex", flexDirection: "column", gap: 4 };
const Q_FIELD_LABEL: React.CSSProperties = { fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 600, color: "var(--a4-ink)" };
const Q_FIELD_OPT: React.CSSProperties = { fontWeight: 400, color: "var(--a4-mute)" };
const Q_FIELD_INPUT: React.CSSProperties = { ...Q_INPUT, flex: "none", width: "100%" };

/** Off-screen honeypot — a real visitor never sees it, a bot fills it in. */
const Q_HONEYPOT: React.CSSProperties = {
  position: "absolute", left: -9999, top: "auto", width: 1, height: 1, opacity: 0, pointerEvents: "none",
};

const SUB_LABEL: React.CSSProperties = { fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, color: "var(--a4-ink)" };
const SUB_HELP: React.CSSProperties = { marginTop: 2, fontFamily: "var(--a4-font-body)", fontSize: 11.5, lineHeight: 1.5, color: "var(--a4-mute)" };
const BOX: React.CSSProperties = { border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "14px 16px" };
const NOTE_P = (tone: string): React.CSSProperties => {
  const s = NOTE_STYLE[tone] || NOTE_STYLE.info;
  return { margin: "10px 0 0", padding: "11px 14px", borderRadius: 10, fontFamily: "var(--a4-font-body)", fontSize: 12, lineHeight: 1.55, background: s.bg, color: s.fg, border: "1px solid " + s.bc };
};

type Opt = { key: string; label: string; sub: string; on: boolean; pick: () => void };

function OptPills({ opts }: { opts: Opt[] }) {
  return (
    <div role="group" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {opts.map((o) => (
        <button key={o.key} type="button" onClick={o.pick} aria-pressed={o.on} style={{
          display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1, padding: "9px 16px",
          borderRadius: "var(--a4-r-md)", cursor: "pointer", textAlign: "left",
          border: "1px solid " + (o.on ? "var(--a4-primary)" : "var(--a4-hairline-light)"),
          background: o.on ? "var(--a4-primary)" : "transparent",
          color: o.on ? "#fff" : "var(--a4-body)",
          fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600,
          transition: "background .15s ease, color .15s ease, border-color .15s ease",
        }}>
          {o.label}
          {o.sub ? <span style={{ fontSize: 10.5, fontWeight: 400, opacity: 0.75 }}>{o.sub}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function LandingQuoteCalculator() {
  const [q, setQState] = useState<QState>(Q_INIT);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [hp, setHp] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<WebsiteQuoteResult | null>(null);
  const [info, setInfo] = useState(false);
  // Any answer changed after sending re-opens the form: the quote on screen is
  // no longer the quote we emailed, so the visitor must be able to send again.
  const setQ = (patch: Partial<QState>) => {
    setQState((prev) => ({ ...prev, ...patch }));
    if (Object.keys(patch).some((k) => k !== "step")) setSent(null);
  };

  const step = q.step;
  const r = qCalc(q);
  const entity: ManagedEntity = q.entity === "sole" ? "sole" : "company";
  const bandRate = q.expenses === "" ? null : managedMonthly(entity, q.expenses);
  const promoOn = isPromoActive();

  const opts = (list: [string, string, string][], key: keyof QState): Opt[] =>
    list.map(([k, label, sub]) => ({ key: k, label, sub: sub || "", pick: () => setQ({ [key]: k } as Partial<QState>), on: q[key] === k }));
  // The expense bands carry their own price as the sub-label, for the entity
  // already chosen. Nothing is pre-selected — see `noExpenses` in qCalc.
  const expOpts = (): Opt[] => EXPENSE_BANDS.map((b) => ({ key: b.id, label: b.label, sub: "base €" + managedMonthly(entity, b.id) + " / month", pick: () => setQ({ expenses: b.id }), on: q.expenses === b.id }));

  // Row shape: [title, one-line help, optsFn, longHelp?]. The one-liner renders
  // under the title; anything longer sits behind the "What counts, exactly?"
  // disclosure so the question reads at a glance.
  const STEP_META: [string, string, (() => Opt[]) | null, string?][] = [
    ["What do you spend a month?", "Entity and monthly spend set the base bookkeeping fee. Pick the band a typical month falls in — a rough figure is fine.", expOpts, "Your monthly expenses are the money that leaves the business in a typical month — supplier bills, wages, rent, software, everything you spend. Exclude VAT, loan repayments, and transfers between your own accounts. New or seasonal business? Use your average over the last three months. We confirm the figure before anything is agreed."],
    ["What does the company do?", "Some sectors carry heavier checks on our side. That moves the VAT and audit prices — never the bookkeeping fee you have already seen.", () => opts(QSECT.map((s) => [s[0], s[1], ""] as [string, string, string]), "sector")],
    ["About how many transactions a month?", "The COUNT, not the amount. Busy bands add to the bookkeeping fee — the two lowest add nothing — and the count also sets the VAT and audit prices.", () => opts(QTXN, "txn"), "One €40,000 supplier payment is a single transaction; forty €1,000 receipts are forty. Every bank account below is priced — €" + BANK_ACCOUNT.baseMonthly + " a month plus " + Math.round(BANK_ACCOUNT.pctOfBookkeeping * 100) + "% of the bookkeeping fee, each; share capital changes only the MBR registry fee."],
    ["How many people on the payroll?", "Count directors who take a salary. Payroll is priced per person, on its own line.", null],
    ["From which month do you need us?", "Pick the earliest month that still needs doing — months before it are catch-up, charged once at your own rate.", null, "That one month also tells us how far back to go: everything before it is catch-up at the same rate as a live month, charged once, and the monthly fee runs from now on. We need it before we can issue the quote."],
    ["Are you registered for VAT?", "Different registrations carry very different filing loads. Not sure? Pick the last option and we check the register for you.", () => QVATREG.map(([k, label, sub]) => ({ key: k, label, sub: sub || "", pick: () => setQ({ vatreg: k, vat: k === "none" ? "none" : "we" }), on: q.vatreg === k }))],
    ["What do you need from us?", "The bookkeeping is the offer. Everything else is priced separately — switch off anything you handle yourself. The total updates as you click.", null],
    ["Your quote", "Everything below is itemised — nothing appears later that is not on this list.", null],
  ];

  const stepTag = step === QSTEP_QUOTE ? "Your quote" : "Question " + (step + 1) + " of " + QSTEP_QUOTE;
  const helpMore = STEP_META[step][3] || "";
  const isOpts = !!STEP_META[step][2];
  const stepOpts = isOpts ? STEP_META[step][2]!() : [];
  const isExp = step === QS.exp;
  const isVol = step === QS.txn;
  const isNum = step === QS.pay;
  const isStart = step === QS.start;
  const isSvc = step === QS.svc;
  const isQuote = step === QSTEP_QUOTE;

  // The sub-label is the fee this entity would carry AT THE BAND ALREADY
  // PICKED — and "from the entry price" until one is.
  const entityOpts: Opt[] = QENTITY.map(([k, label]) => {
    const atBand = q.expenses === "" ? null : managedMonthly(k, q.expenses);
    return { key: k, label, sub: atBand != null ? "base €" + atBand + " / month" : "from €" + BOOKKEEPING_MANAGED_MONTHLY[k]["0-10k"] + " / month", pick: () => setQ({ entity: k }), on: entity === k };
  });
  const expEcho = bandRate != null
    ? "Your base bookkeeping is €" + bandRate + " a month at that spend, as a " + (entity === "sole" ? "self-employed person" : "company") + ". Switch the entity above if that is wrong."
    : "Pick a band — we cannot price the bookkeeping without one, and we will not guess at the cheapest.";

  // Share capital is a COMPANY fact whose only purpose is the MBR registry fee.
  const showCap = isVol && entity === "company";
  const capOpts: Opt[] = CAPITAL_BANDS.map((c) => ({
    key: c.id, label: c.label, sub: c.note, on: (q.cap || "1500") === c.id, pick: () => setQ({ cap: c.id }),
  }));

  // Start month. `behind` is DERIVED here and nowhere else.
  const startOk = /^\d{4}-(0[1-9]|1[0-2])$/.test(q.startMonth);
  const cuMonths = Math.max(0, Math.round(+q.behind || 0));
  const cuRate = q.expenses === "" ? null : fullMonthlyBookkeeping(entity, q.expenses, q.txn as TxnBand, q.banks || 1);
  const startEcho = startOk
    ? (cuMonths > 0
        ? cuMonths + " " + (cuMonths === 1 ? "month" : "months") + " of catch-up, from " + formatStartMonth(q.startMonth) + " up to last month. Then ongoing from this month."
        : "Nothing to catch up — we pick the books up at " + formatStartMonth(q.startMonth) + " and keep them from there.")
    : "Pick a month to carry on.";
  const catchHas = startOk && cuMonths > 0;
  const catchLine = cuRate == null
    ? "Tell us your monthly spend and we price the earlier months at your own rate."
    : "Catch-up: " + cuMonths + " months x EUR " + cuRate + " = EUR " + cuMonths * cuRate;
  const catchNote = "Charged once, at the same rate as a live month — your full monthly rate, volume and bank accounts included. There is no cap and no yearly bundle.";

  // Service rows — amount labels read from the live calc.
  const lineAmt = (name: string) => {
    const m = r.mo.find((l) => l.n === name);
    if (m && m.v > 0) return euro(m.v) + " /mo";
    const y = r.yr.find((l) => l.n === name || l.n.indexOf(name) === 0);
    if (y && y.v > 0) return euro(y.v) + " /yr";
    return "—";
  };
  type SvcRow = { name: string; desc: string; amt: string; hasInfo?: boolean; options: { key: string; label: string; on: boolean; pick: () => void }[] };
  const svc = (key: keyof QState, name: string, desc: string, list: [string, string][], amtName?: string): SvcRow => ({
    name, desc, amt: lineAmt(amtName || name),
    options: list.map(([k, label]) => ({ key: k, label, on: q[key] === k, pick: () => setQ({ [key]: k } as Partial<QState>) })),
  });
  const assureLine = r.yr.find((l) => l.n.indexOf("Financial audit") === 0 || l.n.indexOf("Review engagement") === 0);
  const svcRows: SvcRow[] = isSvc ? ([
    {
      name: "Bookkeeping",
      desc: "You upload the documents. They are read and coded within minutes, and a qualified accountant approves every entry before it counts. Priced at the " + (entity === "sole" ? "self-employed" : "company") + " rate — change that in the first step.",
      amt: lineAmt("Bookkeeping"),
      options: ([["none", "Not needed"], ["managed", "Yes"]] as [string, string][]).map(([k, label]) => ({ key: k, label, on: q.book === k, pick: () => setQ({ book: k }) })),
    },
    svc("pay", "Payroll", "Payslips, monthly employer filing, annual returns. Priced per person.", [["none", "No"], ["we", "Yes"]]),
    q.book !== "managed"
      ? { name: "VAT returns — blocked", desc: "We only put our name to a return when we have kept the ledger behind it. Turn the bookkeeping on above and this unlocks.", amt: "—", options: [] }
      : svc("vat", "VAT returns — prepared and submitted", "Its own line, never folded into the bookkeeping fee. Prepared and submitted quarterly, billed monthly so you pay the same each time.", [["none", "No"], ["we", "Yes"]], q.vatreg === "art11" ? "VAT declaration" : "VAT returns"),
    svc("taxret", "Annual tax return", "Prepared once a year from the closed ledger.", [["none", "No"], ["we", "Yes"]]),
    // Company-only rows: a sole trader files no MBR annual return, has no
    // statutory audit and no registered-office requirement — absent, not "—".
    entity === "company"
      ? svc("annret", MBR_LABEL, "€" + MBR_ANNUAL_RETURN.ourFee + " our fee + the MBR registry fee (electronic), set by your share capital — " + (CAPITAL_BANDS.find((c) => c.id === (q.cap || "1500")) || CAPITAL_BANDS[0]).note + " at your capital. Change it in the Transactions step.", [["none", "No"], ["we", "Yes"]], MBR_LABEL)
      : null,
    entity === "company"
      ? {
          ...svc("assure", "Financial audit — if applicable", "Most small companies qualify for a lighter review — tap the ? for the guidelines. Audits are carried out by our partner audit firms — we connect you with them, and the fee stays as quoted here. We cannot audit a company whose books we keep; ask for both and the quote says so.", [["none", "No"], ["we", "Yes"]]),
          hasInfo: true,
          amt: assureLine && assureLine.v > 0 ? euro(assureLine.v) + " /yr" : "—",
        }
      : null,
    entity === "company"
      ? svc("regoff", "Registered office", "Your company's official address, statutory post passed to you.", [["none", "No"], ["we", "Yes"]])
      : null,
  ] as (SvcRow | null)[]).filter((x): x is SvcRow => x !== null) : [];

  const quoteLines = [
    ...r.mo.filter((l) => l.v > 0).map((l) => ({ n: l.n, e: l.e, v: euro(l.v) + " /mo" })),
    ...r.yr.filter((l) => l.v > 0).map((l) => ({ n: l.n, e: l.e, v: euro(l.v) + " /yr" })),
    ...r.one.filter((l) => l.v > 0).map((l) => ({ n: l.n, e: l.e, v: euro(l.v) + " once" })),
  ];

  // Three unpriceable cases withhold every figure because there IS no figure.
  // A missing start month is different in kind: every line is priced and only
  // the catch-up one-off is still to come, so the figures stay lit.
  const priced = !(r.refer || r.conflict || r.noExpenses);
  const summary = r.conflict
    ? CONFLICT_SUMMARY
    : r.noExpenses
      ? "Bookkeeping is priced on what you spend in a month, and that question is still blank — so there is nothing to price yet. Go back to the monthly-spend question and pick a band, or send this through and a director calls you. We will not quote you the cheapest band and correct it later."
      : r.refer
        ? "We price most sectors instantly. This one needs a short conversation with a director before we put a number to it — usually the same day."
        : qSummarise(q);
  const moText = priced ? euro(r.moTot) : r.conflict ? "One or the other" : r.noExpenses ? "Monthly spend first" : "Let's talk first";
  const promo = priced && r.promoApplied && r.grossMo > 0;
  const totLabel = !priced ? "" : promo ? "Every month · " + LAUNCH_PROMO.label : "Every month";
  const yrHas = priced && r.yrTot > 0;
  const yrPromo = priced && r.promoApplied && r.yrTot < r.grossYr;
  const oneHas = priced && r.oneTot > 0;
  const panelNote = r.conflict
    ? "We cannot give assurance on books we keep ourselves. Tell us which of the two is ours and every figure fills in."
    // Same priority as vacei's panel: the spend band is the FIRST thing a
    // visitor is missing (step 1 has neither answer yet), so its sentence
    // wins over the start-month one.
    : r.noExpenses
      ? "Your monthly spend sets the bookkeeping fee. Pick a band and every figure fills in — we will not quote you the cheapest one and correct it later."
      : r.noStart
        ? "Running total, updating as you answer. Pick the month you need us from and we can add the catch-up months and issue the quote."
        : r.refer
          ? "We price most sectors on the spot. Yours needs a short call with a director first — usually the same day."
          : "Updates as you answer. Nothing is gated behind an email. An accountant reviews the quotation before it is issued. All fees exclude VAT.";

  // Capture. The basket is what the backend reprices, so the visitor gets a
  // real quotation record rather than an empty contact form.
  const items = isQuote && priced ? qItems(q) : [];
  const independence = qIndependence(q);
  // Honest button: with no start month (or nothing priceable) the send path
  // degrades to the callback, so the label must not promise a quotation.
  const callback = !priced || r.noStart;
  const canSend =
    !callback &&
    items.length > 0 &&
    startOk &&
    independence.route !== "conflict" &&
    name.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const send = async () => {
    if (!canSend || sending) return;
    // Honeypot: only a bot fills a field it cannot see.
    if (hp.trim()) {
      setSent({ status: "received", message: "We've got your details — your quote follows by email." });
      return;
    }
    setSending(true);
    const result = await submitWebsiteQuotation({
      name, email, phone, items, risk: qRisk(q),
      // The wire wants the first ONGOING month; the backlog travels as `catchup`.
      serviceStartDate: ongoingStartMonth(q.startMonth),
      sourceDetail: "a4-homepage",
    });
    setSent(result);
    if (result.status === "quoted" || result.status === "received") {
      trackConversion("quote_request_home_calculator");
    }
    setSending(false);
  };

  const next = () => setQ(qAdvance(q, QSTEP_QUOTE));
  // Two required answers, belt-and-braces: Next stays shut until they are
  // given, AND qCalc degrades to the callback if the rail is used to jump past.
  const nextDis = (isStart && !q.startMonth) || (isExp && bandRate == null);

  const railBtn = (i: number): { bg: string; fg: string; dotBg: string; dotFg: string } => {
    const done = i < step, active = i === step;
    return {
      bg: active ? "rgba(255,255,255,.13)" : "transparent",
      fg: active ? "#fff" : done ? "rgba(255,255,255,.78)" : "rgba(255,255,255,.5)",
      dotBg: done ? "rgba(255,255,255,.92)" : active ? "rgba(255,255,255,.26)" : "rgba(255,255,255,.1)",
      dotFg: done ? "var(--a4-primary)" : active ? "#fff" : "rgba(255,255,255,.6)",
    };
  };

  const svcPill = (on: boolean): React.CSSProperties => ({
    height: 30, padding: "0 13px", borderRadius: "var(--a4-r-full)", cursor: "pointer",
    border: "1px solid " + (on ? "var(--a4-primary)" : "var(--a4-hairline-light)"),
    background: on ? "var(--a4-primary)" : "transparent",
    color: on ? "#fff" : "var(--a4-body)",
    fontFamily: "var(--a4-font-body)", fontSize: 11.5, fontWeight: 600,
    transition: "background .15s ease, color .15s ease, border-color .15s ease",
  });
  const navBtn = (disabled: boolean, dark: boolean): React.CSSProperties => ({
    height: 36, padding: dark ? "0 18px" : "0 16px", borderRadius: "var(--a4-r-full)",
    border: "1px solid " + (dark ? "var(--a4-ink)" : "var(--a4-hairline-light)"),
    background: dark ? "var(--a4-ink)" : "transparent", color: dark ? "#fff" : "var(--a4-mute)",
    fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600,
    cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
  });
  const strike: React.CSSProperties = { fontFamily: "var(--a4-font-body)", fontVariantNumeric: "tabular-nums", fontSize: 12.5, color: "var(--a4-mute)", textDecoration: "line-through" };

  return (
    <section id="pricing" style={{ background: "linear-gradient(180deg, #16181f 0%, #101116 100%)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead
          dark
          align="center"
          eyebrow="What it costs"
          title={<>Pick what you need.<br />See the price.</>}
          sub={<>Answer a few questions. The price appears as you go — no form, no callback, no hidden &ldquo;from&rdquo; prices.</>}
          maxWidth={620}
        /></Reveal>

        <Reveal delay={100}>
          <div className="lqc-grid" style={{ margin: "32px auto 0", display: "grid", gridTemplateColumns: "230px 1fr 320px", gap: 24, alignItems: "start", maxWidth: 1180, width: "100%" }}>
            {/* step rail — the last item is the OUTCOME, not a question */}
            <div className="lqc-rail" style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left", position: "sticky", top: 84 }}>
              {QSTEPS.map((label, i) => {
                const c = railBtn(i);
                return (
                  <button key={label} type="button" data-rail-active={i === step ? "true" : "false"} onClick={() => setQ({ step: i })} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: "var(--a4-r-md)",
                    border: "none", background: c.bg, cursor: "pointer", fontFamily: "var(--a4-font-body)", textAlign: "left",
                    transition: "background .2s ease",
                  }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: "var(--a4-r-full)", display: "inline-flex", alignItems: "center",
                      justifyContent: "center", flex: "none", background: c.dotBg, color: c.dotFg,
                      fontVariantNumeric: "tabular-nums", fontSize: 10.5, fontWeight: 600, transition: "background .2s ease, color .2s ease",
                    }}>{i === QSTEP_QUOTE ? "✓" : "0" + (i + 1)}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: c.fg, transition: "color .2s ease" }}>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* question card */}
            <div style={{ background: "#fff", borderRadius: "var(--a4-r-lg)", padding: 34, textAlign: "left", display: "flex", flexDirection: "column", gap: 18, minHeight: 380 }}>
              <div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--a4-primary)", fontWeight: 600 }}>{stepTag}</div>
                <h3 style={{ margin: "8px 0 0", fontFamily: "var(--a4-font-display)", fontSize: 21, fontWeight: 600, letterSpacing: "-.015em", color: "var(--a4-ink)" }}>{STEP_META[step][0]}</h3>
                <p style={{ margin: "8px 0 0", fontFamily: "var(--a4-font-body)", fontSize: 13, lineHeight: 1.6, color: "var(--a4-mute)" }}>{STEP_META[step][1]}</p>
                {helpMore && (
                  <details style={{ marginTop: 8, fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-mute)" }}>
                    <summary style={{ cursor: "pointer", fontWeight: 600, color: "var(--a4-primary)" }}>What counts, exactly?</summary>
                    <p style={{ margin: "6px 0 0", lineHeight: 1.6 }}>{helpMore}</p>
                  </details>
                )}
              </div>

              {/* The entity toggle renders ABOVE the band pills: it is the first
                  half of the fee question, and each band pill prices at
                  whichever entity is selected here. */}
              {isExp && (
                <div style={BOX}>
                  <div style={SUB_LABEL}>Self-employed, or a company?</div>
                  <div style={SUB_HELP}>Together with the spend band below, this sets the base bookkeeping fee. High transaction volumes and extra bank accounts add to it later.</div>
                  <div role="group" aria-label="Self-employed or a company" style={{ marginTop: 10 }}><OptPills opts={entityOpts} /></div>
                </div>
              )}

              {isOpts && <OptPills opts={stepOpts} />}

              {isExp && (
                <div style={BOX}>
                  <div style={SUB_LABEL}>What this sets</div>
                  <div style={SUB_HELP}>{expEcho}</div>
                  <div style={SUB_HELP}>Spend, not turnover, and not the number of transactions — busy transaction bands and extra bank accounts are asked separately and add on top.</div>
                  {promoOn && <div style={SUB_HELP}>{"Full prices, before any discount. " + LAUNCH_PROMO.label + " comes off once your quote is built below."}</div>}
                </div>
              )}

              {isVol && (
                <div style={BOX}>
                  <div style={SUB_LABEL}>Bank accounts</div>
                  <div style={SUB_HELP}>Every account is reconciled separately and every account is priced, the first included: €{BANK_ACCOUNT.baseMonthly} a month plus {Math.round(BANK_ACCOUNT.pctOfBookkeeping * 100)}% of the bookkeeping fee, each.</div>
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 16 }}>
                    <input type="range" min={1} max={8} step={1} value={q.banks || 1} onChange={(e) => setQ({ banks: +e.target.value })} aria-label="Bank accounts" style={{ flex: 1, accentColor: "var(--a4-primary)", cursor: "pointer" }} />
                    <span style={{ minWidth: 92, textAlign: "right", fontFamily: "var(--a4-font-body)", fontVariantNumeric: "tabular-nums", fontSize: 14, fontWeight: 600, color: "var(--a4-ink)" }}>{(q.banks || 1) + ((q.banks || 1) === 1 ? " account" : " accounts")}</span>
                  </div>
                </div>
              )}

              {showCap && (
                <div style={BOX}>
                  {/* The label asks for ISSUED capital, which is the figure a
                      director actually knows; the MBR fee follows the AUTHORISED
                      capital, and for most companies the two are the same. */}
                  <div style={SUB_LABEL}>Issued share capital</div>
                  <div style={SUB_HELP}>Usually the same as your authorised capital, which is what the MBR registry fee on the annual return follows (electronic rates). Passed through at cost, plus our EUR {MBR_ANNUAL_RETURN.ourFee} filing fee - we confirm the figure before filing.</div>
                  <div style={{ marginTop: 10 }}><OptPills opts={capOpts} /></div>
                </div>
              )}

              {isNum && (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <input type="range" min={0} max={50} step={1} value={q.head} onChange={(e) => setQ({ head: +e.target.value })} aria-label="People on payroll" style={{ flex: 1, accentColor: "var(--a4-primary)", cursor: "pointer" }} />
                  <span style={{ minWidth: 90, textAlign: "right", fontFamily: "var(--a4-font-body)", fontVariantNumeric: "tabular-nums", fontSize: 14, fontWeight: 600, color: "var(--a4-ink)" }}>{q.head + (q.head === 1 ? " person" : " people")}</span>
                </div>
              )}

              {isStart && (
                <div style={BOX}>
                  <label htmlFor="lqc-start" style={SUB_LABEL}>Earliest month that still needs doing</label>
                  <input
                    id="lqc-start"
                    type="month"
                    value={q.startMonth}
                    onChange={(e) => setQ({ startMonth: e.target.value, behind: String(catchUpMonthsFrom(e.target.value)) })}
                    style={{ ...Q_INPUT, display: "block", marginTop: 10, width: 220 }}
                  />
                  <div style={{ ...SUB_HELP, marginTop: 8 }}>{startEcho}</div>
                  {catchHas && (
                    <div style={{ marginTop: 12, padding: "11px 14px", borderRadius: 10, background: NOTE_STYLE.info.bg, border: "1px solid " + NOTE_STYLE.info.bc, color: NOTE_STYLE.info.fg, fontFamily: "var(--a4-font-body)", fontSize: 12, lineHeight: 1.6 }}>
                      <div style={{ fontWeight: 600 }}>{catchLine}</div>
                      <div style={{ marginTop: 4 }}>{catchNote}</div>
                    </div>
                  )}
                </div>
              )}

              {isSvc && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {svcRows.map((row) => (
                    <div key={row.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px 16px", flexWrap: "wrap", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "12px 16px" }}>
                      <div style={{ minWidth: 170, flex: 1 }}>
                        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--a4-ink)", display: "flex", alignItems: "center", gap: 8 }}>
                          {row.name}
                          {row.hasInfo && (
                            <button type="button" onClick={() => setInfo(true)} aria-label="When does the audit apply?" style={{
                              width: 18, height: 18, borderRadius: "var(--a4-r-full)", border: "1px solid var(--a4-primary)", background: "transparent",
                              color: "var(--a4-primary)", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0,
                            }}>?</button>
                          )}
                        </div>
                        <div style={{ marginTop: 1, fontFamily: "var(--a4-font-body)", fontSize: 11.5, lineHeight: 1.5, color: "var(--a4-mute)" }}>{row.desc}</div>
                      </div>
                      <div role="group" aria-label={row.name} style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {row.options.map((opt) => (
                          <button key={opt.key} type="button" onClick={opt.pick} aria-pressed={opt.on} style={svcPill(opt.on)}>{opt.label}</button>
                        ))}
                      </div>
                      <span style={{ minWidth: 78, textAlign: "right", fontFamily: "var(--a4-font-body)", fontVariantNumeric: "tabular-nums", fontSize: 12.5, fontWeight: 600, color: "var(--a4-ink)" }}>{row.amt}</span>
                    </div>
                  ))}
                  {/* Said HERE as well as on the quote step: switching the audit
                      on next to the bookkeeping empties every amount above. */}
                  {r.conflict && <p role="note" style={{ ...NOTE_P("warn"), margin: "2px 0 0" }}>{CONFLICT_SHORT}</p>}
                </div>
              )}

              {isQuote && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {quoteLines.map((l) => (
                    <div key={l.n + l.v} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--a4-hairline-light)", fontSize: 12.5, alignItems: "baseline", fontFamily: "var(--a4-font-body)" }}>
                      <span style={{ color: "var(--a4-body)" }}>{l.n}<span style={{ display: "block", fontSize: 11, color: "var(--a4-mute)", marginTop: 1 }}>{l.e}</span></span>
                      <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 12.5, fontWeight: 500, color: "var(--a4-ink)", whiteSpace: "nowrap" }}>{l.v}</span>
                    </div>
                  ))}
                  <p style={{ margin: "14px 0 0", fontFamily: "var(--a4-font-body)", fontSize: 12.5, lineHeight: 1.6, color: "var(--a4-body)" }}>{summary}</p>
                  {r.notes.map(([tone, text], i) => (
                    <p key={i} style={NOTE_P(tone)}>{text}</p>
                  ))}
                  {/* The way out, on the spot: one tap drops either side of the
                      rule and the quote prices itself immediately. */}
                  {r.conflict && (
                    <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 10, background: NOTE_STYLE.info.bg, border: "1px solid " + NOTE_STYLE.info.bc }}>
                      <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 600, color: NOTE_STYLE.info.fg }}>Which one is ours?</div>
                      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button type="button" onClick={() => setQ({ assure: "none" })} style={svcPill(true)}>Keep the bookkeeping with us</button>
                        <button type="button" onClick={() => setQ({ book: "none", vat: "none" })} style={svcPill(true)}>Take the audit or review with us</button>
                      </div>
                      <p style={{ margin: "10px 0 0", fontFamily: "var(--a4-font-body)", fontSize: 11.5, lineHeight: 1.55, color: NOTE_STYLE.info.fg }}>
                        Pick one and the itemised quote appears straight away. Not sure which? Leave it and send this through — a director calls you and we work it out.
                      </p>
                    </div>
                  )}
                  {sent ? (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--a4-hairline-light)" }}>
                      <p style={{ margin: 0, fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, lineHeight: 1.55, color: "var(--a4-ink)" }}>{sent.message}</p>
                      {sent.status === "quoted" && (
                        <div style={{ marginTop: 12 }}>
                          <Button variant="dark" size="sm" href={sent.portalHref} target="_blank">Create your account <Icon name="arrow-right" size={14} color="#fff" /></Button>
                        </div>
                      )}
                    </div>
                  ) : callback ? (
                    // Nothing sendable as a quotation — a director calls instead.
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--a4-hairline-light)" }}>
                      <Button variant="dark" size="sm" href="/contact">Request a call <Icon name="arrow-right" size={14} color="#fff" /></Button>
                    </div>
                  ) : (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--a4-hairline-light)" }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <label style={Q_FIELD}>
                          <span style={Q_FIELD_LABEL}>Your name</span>
                          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Borg" autoComplete="name" style={Q_FIELD_INPUT} />
                        </label>
                        <label style={Q_FIELD}>
                          <span style={Q_FIELD_LABEL}>Email</span>
                          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="jane@borgtrading.mt" autoComplete="email" style={Q_FIELD_INPUT} />
                        </label>
                        <label style={Q_FIELD}>
                          <span style={Q_FIELD_LABEL}>Phone <span style={Q_FIELD_OPT}>optional</span></span>
                          <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+356 …" autoComplete="tel" style={Q_FIELD_INPUT} />
                        </label>
                      </div>
                      <input value={hp} onChange={(e) => setHp(e.target.value)} name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={Q_HONEYPOT} />
                      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <Button variant="dark" size="sm" onClick={send} style={{ opacity: canSend && !sending ? 1 : 0.55, pointerEvents: canSend && !sending ? "auto" : "none" }}>
                          {sending ? "Sending…" : "Send me this quote"}
                          {!sending && <Icon name="arrow-right" size={14} color="#fff" />}
                        </Button>
                      </div>
                    </div>
                  )}
                  <p style={{ margin: "10px 0 0", fontFamily: "var(--a4-font-body)", fontSize: 11, color: "var(--a4-mute)" }}>An accountant reviews your quotation before it is issued, then it lands in your inbox and your portal. KYC required before work starts. All fees exclude VAT.</p>
                </div>
              )}

              {/* footer: nav + running total */}
              <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--a4-hairline-light)", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                {!isQuote && (
                  <>
                    <button type="button" onClick={() => setQ({ step: Math.max(0, step - 1) })} disabled={step === 0} style={navBtn(step === 0, false)}>Back</button>
                    <button type="button" onClick={next} disabled={nextDis} style={navBtn(nextDis, true)}>{step === QSTEP_QUOTE - 1 ? "See my quote" : "Next"}</button>
                  </>
                )}
                <span style={{ marginLeft: "auto", display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--a4-mute)" }}>{totLabel}</span>
                  {promo && <span style={strike}>{euro(r.grossMo)}</span>}
                  <span style={{ fontFamily: "var(--a4-font-body)", fontVariantNumeric: "tabular-nums", fontSize: 18, fontWeight: 600, color: promo ? "#C4453C" : "var(--a4-ink)" }}>{moText}</span>
                  {yrPromo && <span style={strike}>{euro(r.grossYr)}</span>}
                  {yrHas && <span style={{ fontFamily: "var(--a4-font-body)", fontVariantNumeric: "tabular-nums", fontSize: 12.5, color: "var(--a4-mute)" }}>{euro(r.yrTot) + " /yr"}</span>}
                  {oneHas && <span style={{ fontFamily: "var(--a4-font-body)", fontVariantNumeric: "tabular-nums", fontSize: 12.5, color: "var(--a4-mute)" }}>{euro(r.oneTot) + " once"}</span>}
                </span>
              </div>
            </div>

            {/* live price panel — the SAME qCalc output the quote step renders,
                so the panel cannot show a price the quote contradicts. */}
            <div className="lqc-panel" style={{ background: "#000", borderRadius: "var(--a4-r-lg)", padding: "clamp(22px,3vw,30px)", color: "#fff", position: "sticky", top: 84, textAlign: "left" }}>
              <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--a4-stone)" }}>
                {priced ? totLabel : "Your price"}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                {promo && <span style={{ ...strike, color: "var(--a4-on-dark-mute)" }}>{euro(r.grossMo)}</span>}
                <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontVariantNumeric: "tabular-nums", fontSize: priced ? 38 : 20, letterSpacing: priced ? "-1.5px" : "-.4px", lineHeight: 1.15 }}>{moText}</span>
                {priced && <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "var(--a4-on-dark-mute)" }}>/ month</span>}
              </div>
              {(yrHas || oneHas) && (
                <div style={{ marginTop: 8, display: "flex", gap: 14, flexWrap: "wrap", fontFamily: "var(--a4-font-body)", fontVariantNumeric: "tabular-nums", fontSize: 12.5, color: "var(--a4-on-dark-mute)" }}>
                  {yrHas && <span>{euro(r.yrTot)} /yr</span>}
                  {oneHas && <span>{euro(r.oneTot)} once</span>}
                </div>
              )}
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--a4-hairline-dark)", display: quoteLines.length ? "flex" : "none", flexDirection: "column", gap: 9 }}>
                {quoteLines.map((l) => (
                  <span key={l.n + l.v} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontFamily: "var(--a4-font-body)", fontSize: 12.5 }}>
                    <span style={{ color: "var(--a4-on-dark-mute)" }}>{l.n}</span>
                    <span style={{ color: "#fff", fontWeight: 500, whiteSpace: "nowrap" }}>{l.v}</span>
                  </span>
                ))}
              </div>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, lineHeight: 1.6, color: "var(--a4-stone)", margin: "18px 0 0", paddingTop: 16, borderTop: "1px solid var(--a4-hairline-dark)" }}>{panelNote}</p>
              {!isQuote && (
                <Button variant="primary" size="md" onClick={() => setQ({ step: QSTEP_QUOTE })} style={{ width: "100%", marginTop: 18 }}>
                  See the full quote <Icon name="arrow-right" size={16} color="#000" />
                </Button>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <p style={{ margin: "28px auto 0", textAlign: "center", fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-on-dark-mute)" }}>The price appears instantly — nothing is gated behind an email. All fees exclude VAT.</p>
          {/* Same line, same wording, on the vacei.com homepage (index.html) — the
              two homepages reference the audit landing page identically. */}
          <p style={{ margin: "10px auto 0", textAlign: "center", fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-on-dark-mute)" }}>Need a statutory audit? <a href="/audit-services" style={{ color: "#fff", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>Get a financial audit quote</a> — four questions price it instantly on the audit page.</p>
        </Reveal>
      </Container>

      {/* Audit guidelines popup — opened from the "?" on the audit row. */}
      {info && (
        <div style={{ position: "fixed", inset: 0, zIndex: 70 }}>
          <div onClick={() => setInfo(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.55)" }} />
          <div role="dialog" aria-modal="true" aria-label="When does the audit apply?" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "min(520px, calc(100vw - 32px))", background: "#fff", borderRadius: "var(--a4-r-lg)", padding: 28, color: "var(--a4-ink)", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <h3 style={{ margin: 0, fontFamily: "var(--a4-font-display)", fontSize: 19, fontWeight: 600, letterSpacing: "-.015em" }}>When does the audit apply?</h3>
              <button type="button" onClick={() => setInfo(false)} aria-label="Close" style={{ width: 28, height: 28, borderRadius: "var(--a4-r-full)", border: "1px solid var(--a4-hairline-light)", background: "transparent", cursor: "pointer", color: "var(--a4-ink)", fontSize: 14 }}>×</button>
            </div>
            <div style={{ marginTop: 14, fontFamily: "var(--a4-font-body)", fontSize: 13, lineHeight: 1.65, color: "var(--a4-body)", display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ margin: 0 }}><strong>Every Maltese company files audited financial statements each year</strong> — regardless of size. That is why the line says &ldquo;if applicable&rdquo;: what changes is the kind of engagement, not whether one is due.</p>
              <p style={{ margin: 0 }}><strong>Small companies usually qualify for a review engagement instead</strong> — roughly under €93k turnover with a small balance sheet. It is the lighter option at about half the cost, and it is what we price by default.</p>
              <p style={{ margin: 0 }}><strong>High volume means a full audit.</strong> Above roughly 150 transactions a month a company rarely stays under the thresholds, so we price the full engagement — if your figures come in under, the fee drops.</p>
              <p style={{ margin: 0 }}><strong>We confirm which applies from your figures</strong> before anything is agreed — you would hear it from us first, never on the invoice.</p>
            </div>
            <div style={{ marginTop: 18 }}>
              <Button variant="dark" size="sm" onClick={() => setInfo(false)}>Got it</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
