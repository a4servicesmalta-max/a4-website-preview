"use client";

import React, { useState } from "react";
import { Button, Icon, Container, Eyebrow } from "@/components/a4-landing/Primitives";
import { MUTED_GLOW, TypeText, Words, gradText } from "@/components/fx/primitives";
import LocalizedLink from "@/components/common/LocalizedLink";
import { AUDIT_YEARLY, BOOKKEEPING_VOLUME_UPLIFT, BOOKKEEPING_MANAGED_MONTHLY, BOOKKEEPING_FROM, BOOKKEEPING_COMPANY, bankAccountMonthly, BANK_ACCOUNT, taxReturnYearly, VAT_MONTHLY, VAT_RULES, REVIEW_ENGAGEMENT_FACTOR, reviewYearlyBase, REGISTERED_OFFICE_YEARLY, payrollFee, payrollFeeLabel, CAPITAL_BANDS, MBR_ANNUAL_RETURN, EXPENSE_BANDS, LAUNCH_PROMO, catchUpAmount, catchUpLabel, fullMonthlyBookkeeping, isPromoActive, managedMonthly, type CapitalBand, type ExpenseBand, type ManagedEntity, type TxnBand } from "@/data/a4QuotePack";
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
// per-account bank fee for accounts BEYOND the first — the first is included
// in the fee — at €40/mo plus 15% of the bookkeeping fee (mt-2026-08-27-entry).

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
/* IESBA independence, in the site's own words (owner decision 2026-10-01): books
   + audit together — we keep the books and a partner audit firm we find does the
   audit or review, at the published price, inside the client's portal. The same
   wording as src/lib/independence.ts INDEPENDENCE_PARTNER_AUDIT and the /quote
   builder. Do not machine-translate. */
export const PARTNER_AUDIT_NOTE = "You have asked us to keep the books and for the audit or review. We keep the books. Independence rules mean we cannot audit them ourselves, so we find a partner audit firm for you — the audit is quoted here at our published price and included in your portal.";
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
  /** Bank accounts to reconcile — 1..8; the first is included in the bookkeeping fee, each extra is EUR 40 + 15% of the bookkeeping fee (mt-2026-08-27-entry). */
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
/** Books + audit: a partner audit firm carries out the audit or review (same price). */
const ASSURE_AUDIT_PARTNER_LABEL = "Financial audit — by a partner audit firm (if applicable)";
const ASSURE_REVIEW_PARTNER_LABEL = "Review engagement — by a partner audit firm (if applicable)";
const MBR_LABEL = "Annual return — filed with the MBR";

type Calc = {
  refer: boolean; noExpenses: boolean; noStart: boolean;
  notes: Note[]; mo: Line[]; yr: Line[]; one: Line[];
  moTot: number; yrTot: number; oneTot: number; grossMo: number; grossYr: number; promoApplied: boolean;
};
const unpriced = (flags: Partial<Pick<Calc, "refer" | "noExpenses">>, notes: Note[], noStart: boolean): Calc => ({
  refer: false, noExpenses: false, ...flags, noStart, notes,
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
    // mt-2026-08-27-entry: the first account is included in the bookkeeping
    // fee; the line prices only the extras and is absent at one account.
    const per = bankAccountMonthly(entity, band as ExpenseBand, q.txn as TxnBand) ?? 0;
    if (nBanks > 1) mo.push({ n: "Additional bank accounts", e: (nBanks - 1) + " × €" + per + " — the first account is included; each extra is €" + BANK_ACCOUNT.baseMonthly + " plus " + Math.round(BANK_ACCOUNT.pctOfBookkeeping * 100) + "% of the bookkeeping fee, reconciled separately", v: (nBanks - 1) * per });
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
    // mt-2026-10-01-review: a review is €350 at the "0"/"1-20" bands, else 55% of
    // the audit — unrounded here, × risk, rounded once below.
    const base = review ? reviewYearlyBase(q.txn as TxnBand) ?? QT.assure[q.txn] * REVIEW_ENGAGEMENT_FACTOR : QT.assure[q.txn];
    if (managed) {
      // IESBA independence (owner decision 2026-10-01): we keep the books, so a
      // partner audit firm we find carries out the audit or review — same fee.
      yr.push({ n: review ? ASSURE_REVIEW_PARTNER_LABEL : ASSURE_AUDIT_PARTNER_LABEL, e: (review ? "review engagement — the lighter option" : "full financial audit") + ", carried out by a partner audit firm we find for you — we keep your books, so we cannot audit them ourselves. The fee stays as quoted and the audit runs in your portal.", v: base * rm });
      notes.push(["info", PARTNER_AUDIT_NOTE]);
    } else {
      yr.push({ n: review ? ASSURE_REVIEW_LABEL : ASSURE_AUDIT_LABEL, e: (review ? "review engagement — the lighter option" : "full financial audit") + ". Audits are carried out by our partner audit firms — we connect you with them, and the fee stays as quoted here.", v: base * rm });
    }
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
  return { refer: false, noExpenses: false, noStart, mo, yr, one, notes, moTot, yrTot, oneTot, grossMo, grossYr, promoApplied: promo };
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
  if (r.refer || r.noExpenses) return [];
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
  if (has(ASSURE_AUDIT_LABEL) || has(ASSURE_REVIEW_LABEL) || has(ASSURE_AUDIT_PARTNER_LABEL) || has(ASSURE_REVIEW_PARTNER_LABEL))
    items.push({ service: "audit", txn, ...(qAuditIsReview(q) ? { review: true as const } : {}), ...(q.book === "managed" ? { partner: true as const } : {}) });
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
 * so nothing is priced for it. Books + audit route to a partner audit firm.
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
  if (q.assure === "we" && q.entity !== "sole")
    bits.push(q.book === "managed" ? "a partner audit firm we find for you carries out your audit or review, inside your portal" : "we handle your audit or review");
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

/* -------------------------------------------------------------------------- */
/* The look — the A4 design language: the design's "Build your quote" section */
/* and its quote document (see src/app/q/[id]/QuotationLanding.tsx).          */
/* -------------------------------------------------------------------------- */

const INK = "#09090B";
const INDIGO = "#4F55F1";
const HAIR = "#E4E4E7";
const DISPLAY = "var(--a4x-display)";
const BODY = "var(--a4x-body)";

/**
 * Note tones, inside the palette: a positive note and an informational one
 * read in indigo, a caution reads in ink — the design has no amber or green.
 */
const NOTE_STYLE: Record<string, { bg: string; fg: string; bc: string; mark: string }> = {
  ok: { bg: "rgba(79,85,241,.07)", fg: "#27272A", bc: "rgba(79,85,241,.24)", mark: INDIGO },
  warn: { bg: "#18181B", fg: "#E4E4E7", bc: "#18181B", mark: "#8B8FF7" },
  info: { bg: "#FAFAFA", fg: "#3F3F46", bc: HAIR, mark: INDIGO },
};

/** A labelled lead-form field — visible label above the input, an example
 *  value as the placeholder (vacei's form, not placeholder-as-label). */
const Q_FIELD: React.CSSProperties = { flex: "1 1 180px", minWidth: 0, display: "flex", flexDirection: "column", gap: 8 };
const Q_FIELD_LABEL: React.CSSProperties = { fontFamily: DISPLAY, fontSize: 15, fontWeight: 600, color: INK };
const Q_FIELD_OPT: React.CSSProperties = { fontFamily: BODY, fontSize: 13, fontWeight: 500, color: "#71717A" };
/** The design's input on light: white, hairline, radius 14, indigo on focus (`.lqc-input`). */
const Q_FIELD_INPUT: React.CSSProperties = {
  width: "100%", height: 52, padding: "0 16px", borderRadius: 14, border: "1px solid " + HAIR,
  background: "#FFFFFF", color: INK, fontFamily: DISPLAY, fontSize: 16, fontWeight: 500, outline: "none",
};

/** Off-screen honeypot — a real visitor never sees it, a bot fills it in. */
const Q_HONEYPOT: React.CSSProperties = {
  position: "absolute", left: -9999, top: "auto", width: 1, height: 1, opacity: 0, pointerEvents: "none",
};

const SUB_LABEL: React.CSSProperties = { fontFamily: DISPLAY, fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", color: INK };
const SUB_HELP: React.CSSProperties = { marginTop: 6, fontFamily: BODY, fontSize: 14, lineHeight: 1.55, color: "#52525B" };
/** One block of the question card — a hairline above it, like a row of the quote document. */
const BLOCK: React.CSSProperties = { paddingTop: 22, borderTop: "1px solid " + HAIR };
/** Read-only context inside the card — the document's #FAFAFA totals ground. */
const INFO_BOX: React.CSSProperties = { padding: "18px 20px", borderRadius: 18, background: "#FAFAFA", border: "1px solid " + HAIR };
const KICKER: React.CSSProperties = { fontFamily: BODY, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#71717A" };
const NOTE_P = (tone: string): React.CSSProperties => {
  const s = NOTE_STYLE[tone] || NOTE_STYLE.info;
  return {
    display: "flex", gap: 12, margin: "10px 0 0", padding: "14px 16px", borderRadius: 16,
    fontFamily: BODY, fontSize: 14, lineHeight: 1.55, background: s.bg, color: s.fg, border: "1px solid " + s.bc,
  };
};

/** The skewed square the design uses for its scope bullets. */
function Mark({ tone = "info" }: { tone?: string }) {
  return <span className="a4-bullet" aria-hidden="true" style={{ marginTop: 7, background: (NOTE_STYLE[tone] || NOTE_STYLE.info).mark }} />;
}

function CheckGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: size, height: size, display: "inline-block", verticalAlign: "-2px" }}>
      <path d="M5 12l4 4 10-10" />
    </svg>
  );
}

/* Hover, focus and the range track can't be inline styles — scoped classes. */
const LQC_CSS = `
.lqc-input::placeholder { color: #A1A1AA; }
.lqc-input:focus { border-color: #4F55F1 !important; box-shadow: 0 0 0 3px rgba(79,85,241,.14); }
.lqc-pill[aria-pressed="false"]:hover { border-color: #A1A1AA !important; }
.lqc-seg[aria-pressed="false"]:hover { color: #09090B !important; }
.lqc-pill:focus-visible, .lqc-seg:focus-visible, .lqc-switch:focus-visible, .lqc-step:focus-visible,
.lqc-more > summary:focus-visible, .lqc-round:focus-visible { outline: 3px solid rgba(79,85,241,.55); outline-offset: 2px; }
.lqc-range { -webkit-appearance: none; appearance: none; height: 28px; margin: 0; background: transparent; cursor: pointer; }
.lqc-range:focus { outline: none; }
.lqc-range::-webkit-slider-runnable-track { height: 6px; border-radius: 999px; background: linear-gradient(90deg, #4F55F1 0, #4F55F1 var(--p), #E4E4E7 var(--p), #E4E4E7 100%); }
.lqc-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 24px; height: 24px; margin-top: -9px; border: 0; border-radius: 50%; background: #FFFFFF; box-shadow: 0 1px 3px rgba(9,9,11,.35), 0 0 0 1px rgba(9,9,11,.06); transition: box-shadow .25s; }
.lqc-range::-moz-range-track { height: 6px; border-radius: 999px; background: #E4E4E7; }
.lqc-range::-moz-range-progress { height: 6px; border-radius: 999px; background: #4F55F1; }
.lqc-range::-moz-range-thumb { width: 24px; height: 24px; border: 0; border-radius: 50%; background: #FFFFFF; box-shadow: 0 1px 3px rgba(9,9,11,.35), 0 0 0 1px rgba(9,9,11,.06); }
.lqc-range:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 4px rgba(79,85,241,.35), 0 1px 3px rgba(9,9,11,.35); }
.lqc-range:focus-visible::-moz-range-thumb { box-shadow: 0 0 0 4px rgba(79,85,241,.35), 0 1px 3px rgba(9,9,11,.35); }
.lqc-more > summary { list-style: none; cursor: pointer; }
.lqc-more > summary::-webkit-details-marker { display: none; }
.lqc-more[open] .lqc-plus { transform: rotate(45deg); }
.lqc-steps { display: flex; flex-direction: column; }
.lqc-step { position: relative; display: grid; grid-template-columns: 40px minmax(0, 1fr); align-items: baseline; gap: 4px; width: 100%; padding: 16px 2px 15px; border: 0; background: transparent; text-align: left; cursor: pointer; }
.lqc-step::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 1px; background: #D4D4D8; transition: background .3s; }
.lqc-step[data-state="done"]::before { background: rgba(79,85,241,.45); }
.lqc-step[data-state="active"]::before { height: 2px; background: linear-gradient(90deg, #4F55F1 0%, #6468F3 55%, #8B8FF7 100%); }
.lqc-step:hover .lqc-step-label { color: #09090B !important; }
.lqc-step:last-child::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: #D4D4D8; }
@media (max-width: 1080px) {
  .lqc-steps { position: static !important; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); column-gap: 20px; }
  .lqc-step:last-child::after { display: none; }
}
@media (max-width: 600px) {
  .lqc-steps { grid-template-columns: repeat(8, minmax(0, 1fr)); column-gap: 6px; }
  .lqc-step { grid-template-columns: 1fr; justify-items: center; padding: 14px 0 4px; }
  .lqc-step-label { position: absolute !important; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
}
`;

type Opt = { key: string; label: string; sub: string; on: boolean; pick: () => void };

/** Answer options as the design's pills — ink when chosen. */
function OptPills({ opts }: { opts: Opt[] }) {
  return (
    <div role="group" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {opts.map((o) => (
        <button key={o.key} type="button" onClick={o.pick} aria-pressed={o.on} className="lqc-pill" style={{
          display: "inline-flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", gap: 2,
          minHeight: 48, padding: o.sub ? "8px 20px" : "0 20px", borderRadius: 999, cursor: "pointer", textAlign: "left",
          border: "1px solid " + (o.on ? INK : HAIR), background: o.on ? INK : "#FFFFFF", color: o.on ? "#FFFFFF" : INK,
          fontFamily: DISPLAY, fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.25,
          transition: "background .3s, color .3s, border-color .3s",
        }}>
          {o.label}
          {o.sub ? <span style={{ fontFamily: BODY, fontSize: 12.5, fontWeight: 500, letterSpacing: 0, color: o.on ? "#A1A1AA" : "#71717A" }}>{o.sub}</span> : null}
        </button>
      ))}
    </div>
  );
}

/** The design's segmented switch (its Monthly / First year control) — the active side is ink. */
function Segmented({ opts, label }: { opts: Opt[]; label: string }) {
  return (
    <div role="group" aria-label={label} style={{
      display: "grid", gridTemplateColumns: `repeat(${opts.length}, minmax(0, 1fr))`, gap: 4, maxWidth: 460,
      padding: 5, borderRadius: 999, background: "#F4F4F5", border: "1px solid " + HAIR,
    }}>
      {opts.map((o) => (
        <button key={o.key} type="button" onClick={o.pick} aria-pressed={o.on} className="lqc-seg" style={{
          minWidth: 0, minHeight: 52, padding: "6px 14px", borderRadius: 999, border: 0, cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, textAlign: "center",
          background: o.on ? INK : "transparent", color: o.on ? "#FFFFFF" : "#52525B",
          fontFamily: DISPLAY, fontSize: 15, fontWeight: 600, lineHeight: 1.25, transition: "background .3s, color .3s",
        }}>
          {o.label}
          {o.sub ? <span style={{ fontFamily: BODY, fontSize: 12.5, fontWeight: 500, color: o.on ? "#A1A1AA" : "#71717A" }}>{o.sub}</span> : null}
        </button>
      ))}
    </div>
  );
}

/** The design's 48×28 switch — indigo track when on, white knob, .35s expo. */
function Switch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onToggle} className="lqc-switch" style={{
      position: "relative", flexShrink: 0, width: 48, height: 28, padding: 0, border: 0, borderRadius: 14,
      background: on ? INDIGO : "#D4D4D8", cursor: "pointer", transition: "background .3s",
    }}>
      <span aria-hidden="true" style={{
        position: "absolute", left: 3, top: 3, width: 22, height: 22, borderRadius: 11, background: "#FFFFFF",
        boxShadow: "0 1px 3px rgba(9,9,11,.3)", transform: `translateX(${on ? 20 : 0}px)`, transition: "transform .35s cubic-bezier(.16,1,.3,1)",
      }} />
    </button>
  );
}

/** A range in the design's colours — indigo fill, white knob (`.lqc-range`). */
function Range({ value, min, max, label, onChange }: { value: number; min: number; max: number; label: string; onChange: (v: number) => void }) {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <input
      type="range" min={min} max={max} step={1} value={value} aria-label={label} className="lqc-range"
      onChange={(e) => onChange(+e.target.value)}
      style={{ flex: 1, minWidth: 0, ["--p" as string]: pct + "%" } as React.CSSProperties}
    />
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
    // Unpicked: the entry floor (one bank account included in the fee),
    // €24/€49 — the same figure vacei's entity pills show.
    return { key: k, label, sub: atBand != null ? "base €" + atBand + " / month" : "from €" + (k === "sole" ? BOOKKEEPING_FROM : BOOKKEEPING_COMPANY) + " / month", pick: () => setQ({ entity: k }), on: entity === k };
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
          ...svc("assure", "Financial audit — if applicable", "Most small companies qualify for a lighter review — tap the ? for the guidelines. If we also keep your books, we find a partner audit firm for you and include the audit in your portal; the fee stays as quoted here.", [["none", "No"], ["we", "Yes"]]),
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

  // Two unpriceable cases withhold every figure because there IS no figure.
  // A missing start month is different in kind: every line is priced and only
  // the catch-up one-off is still to come, so the figures stay lit.
  const priced = !(r.refer || r.noExpenses);
  const summary = r.noExpenses
    ? "Bookkeeping is priced on what you spend in a month, and that question is still blank — so there is nothing to price yet. Go back to the monthly-spend question and pick a band, or send this through and a director calls you. We will not quote you the cheapest band and correct it later."
    : r.refer
      ? "We price most sectors instantly. This one needs a short conversation with a director before we put a number to it — usually the same day."
      : qSummarise(q);
  const moText = priced ? euro(r.moTot) : r.noExpenses ? "Monthly spend first" : "Let's talk first";
  const promo = priced && r.promoApplied && r.grossMo > 0;
  const totLabel = !priced ? "" : promo ? "Every month · " + LAUNCH_PROMO.label : "Every month";
  const yrHas = priced && r.yrTot > 0;
  const yrPromo = priced && r.promoApplied && r.yrTot < r.grossYr;
  const oneHas = priced && r.oneTot > 0;
  // Same priority as vacei's panel: the spend band is the FIRST thing a
  // visitor is missing (step 1 has neither answer yet), so its sentence
  // wins over the start-month one.
  const panelNote = r.noExpenses
    ? "Your monthly spend sets the bookkeeping fee. Pick a band and every figure fills in — we will not quote you the cheapest one and correct it later."
    : r.noStart
      ? "Running total, updating as you answer. Pick the month you need us from and we can add the catch-up months and issue the quote."
      : r.refer
        ? "We price most sectors on the spot. Yours needs a short call with a director first — usually the same day."
        : "Updates as you answer. Nothing is gated behind an email. Send it and your quotation arrives by email, ready to accept online. All fees exclude VAT.";

  // Capture. The basket is what the backend reprices, so the visitor gets a
  // real quotation record rather than an empty contact form.
  const items = isQuote && priced ? qItems(q) : [];
  // Honest button: with no start month (or nothing priceable) the send path
  // degrades to the callback, so the label must not promise a quotation.
  const callback = !priced || r.noStart;
  const canSend =
    !callback &&
    items.length > 0 &&
    startOk &&
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

  const strike: React.CSSProperties = { fontFamily: BODY, fontVariantNumeric: "tabular-nums", fontSize: 14, fontWeight: 500, color: "#71717A", textDecoration: "line-through" };
  const navBtn = (disabled: boolean): React.CSSProperties => ({ height: 46, padding: "0 22px", fontSize: 15, opacity: disabled ? 0.45 : 1, cursor: disabled ? "default" : "pointer" });
  const amount = (big: boolean): React.CSSProperties => ({ fontFamily: DISPLAY, fontWeight: 600, fontVariantNumeric: "tabular-nums", letterSpacing: big ? "-0.04em" : "-0.02em", ...(priced ? gradText : { color: INK }) });

  return (
    <section id="pricing" style={{ position: "relative", padding: "clamp(100px,13vw,180px) 0", scrollMarginTop: 96, background: MUTED_GLOW, color: INK }}>
      <style>{LQC_CSS}</style>
      <Container>
        {/* Head — the design's "Build your quote": eyebrow and display H2 left, the lead right. */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "24px 64px" }}>
          <div style={{ maxWidth: 820 }}>
            <div data-fx="rise">
              <Eyebrow>What it costs</Eyebrow>
            </div>
            <h2 style={{ margin: "18px 0 0", fontFamily: DISPLAY, fontSize: "clamp(38px,5.6vw,92px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.04, color: INK }}>
              <span className="sr-only">Pick what you need. See the price.</span>
              <span aria-hidden="true" style={{ display: "block" }}>
                <TypeText as="span" segments={[{ t: "Pick what you need.", c: INK }]} per={38} d={100} style={{ display: "block" }} />
                <Words as="span" d={880} style={{ display: "block", fontWeight: 600 }} parts={[{ t: "See the" }, { t: "price.", g: true }]} />
              </span>
            </h2>
          </div>
          <p data-fx="rise" data-d="300" style={{ margin: 0, maxWidth: 400, fontFamily: BODY, fontSize: 17, lineHeight: 1.55, color: "#52525B", textWrap: "pretty" }}>
            Answer a few questions. The price appears as you go — no form, no callback, no hidden &ldquo;from&rdquo; prices.
          </p>
        </div>

        <div className="lqc-grid" style={{ marginTop: "clamp(48px,6vw,80px)", display: "grid", gridTemplateColumns: "230px minmax(0, 1fr) 320px", gap: 24, alignItems: "start" }}>
          {/* step rail — numbered rows; the last item is the OUTCOME, not a question */}
          <nav aria-label="Quote steps" data-fx="rise" data-d="100" className="lqc-steps" style={{ position: "sticky", top: 96 }}>
            {QSTEPS.map((label, i) => {
              const state = i < step ? "done" : i === step ? "active" : "next";
              return (
                <button
                  key={label}
                  type="button"
                  className="lqc-step"
                  data-state={state}
                  data-rail-active={i === step ? "true" : "false"}
                  aria-current={i === step ? "step" : undefined}
                  onClick={() => setQ({ step: i })}
                >
                  <span style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 600, letterSpacing: ".02em", fontVariantNumeric: "tabular-nums", color: state === "next" ? "#A1A1AA" : INDIGO, transition: "color .3s" }}>
                    {i === QSTEP_QUOTE ? <CheckGlyph /> : String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="lqc-step-label" style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: state === "active" ? 600 : 500, letterSpacing: "-0.015em", lineHeight: 1.3, color: state === "active" ? INK : state === "done" ? "#3F3F46" : "#71717A", transition: "color .3s" }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* question card — the white 28-radius document panel */}
          <div data-fx="rise" data-d="180" style={{ minWidth: 0, minHeight: 420, padding: "clamp(24px,3.4vw,40px)", background: "#FFFFFF", border: "1px solid " + HAIR, borderRadius: 28, boxShadow: "0 50px 120px rgba(9,9,11,.10)", textAlign: "left", display: "flex", flexDirection: "column", gap: 22 }}>
            <div>
              <div style={{ ...KICKER, color: INDIGO }}>{stepTag}</div>
              <h3 style={{ margin: "12px 0 0", fontFamily: DISPLAY, fontSize: "clamp(26px,2.4vw,34px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.12, color: INK, textWrap: "balance" }}>{STEP_META[step][0]}</h3>
              <p style={{ margin: "12px 0 0", fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: "#52525B", textWrap: "pretty" }}>{STEP_META[step][1]}</p>
              {helpMore && (
                <details className="lqc-more" style={{ marginTop: 14 }}>
                  <summary style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: DISPLAY, fontSize: 15, fontWeight: 600, color: INDIGO }}>
                    <span className="lqc-plus" aria-hidden="true" style={{ display: "grid", placeItems: "center", width: 24, height: 24, borderRadius: 12, border: "1px solid rgba(79,85,241,.4)", transition: "transform .35s cubic-bezier(.16,1,.3,1)" }}>
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                    </span>
                    What counts, exactly?
                  </summary>
                  <p style={{ margin: "12px 0 0", fontFamily: BODY, fontSize: 14.5, lineHeight: 1.6, color: "#52525B" }}>{helpMore}</p>
                </details>
              )}
            </div>

            {/* The entity toggle renders ABOVE the band pills: it is the first
                half of the fee question, and each band pill prices at
                whichever entity is selected here. */}
            {isExp && (
              <div style={BLOCK}>
                <div style={SUB_LABEL}>Self-employed, or a company?</div>
                <div style={SUB_HELP}>Together with the spend band below, this sets the base bookkeeping fee. High transaction volumes and extra bank accounts add to it later.</div>
                <div style={{ marginTop: 14 }}><Segmented opts={entityOpts} label="Self-employed or a company" /></div>
              </div>
            )}

            {isOpts && <div style={BLOCK}><OptPills opts={stepOpts} /></div>}

            {isExp && (
              <div style={INFO_BOX}>
                <div style={SUB_LABEL}>What this sets</div>
                <div style={SUB_HELP}>{expEcho}</div>
                <div style={SUB_HELP}>Spend, not turnover, and not the number of transactions — busy transaction bands and extra bank accounts are asked separately and add on top.</div>
                {promoOn && <div style={SUB_HELP}>{"Full prices, before any discount. " + LAUNCH_PROMO.label + " comes off once your quote is built below."}</div>}
              </div>
            )}

            {isVol && (
              <div style={BLOCK}>
                <div style={SUB_LABEL}>Bank accounts</div>
                <div style={SUB_HELP}>Every account is reconciled separately. The first is included in the bookkeeping fee; each extra account is €{BANK_ACCOUNT.baseMonthly} a month plus {Math.round(BANK_ACCOUNT.pctOfBookkeeping * 100)}% of the bookkeeping fee.</div>
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 20 }}>
                  <Range value={q.banks || 1} min={1} max={8} label="Bank accounts" onChange={(v) => setQ({ banks: v })} />
                  <span style={{ minWidth: 112, textAlign: "right", fontFamily: DISPLAY, fontVariantNumeric: "tabular-nums", fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: INK }}>{(q.banks || 1) + ((q.banks || 1) === 1 ? " account" : " accounts")}</span>
                </div>
              </div>
            )}

            {showCap && (
              <div style={BLOCK}>
                {/* The label asks for ISSUED capital, which is the figure a
                    director actually knows; the MBR fee follows the AUTHORISED
                    capital, and for most companies the two are the same. */}
                <div style={SUB_LABEL}>Issued share capital</div>
                <div style={SUB_HELP}>Usually the same as your authorised capital, which is what the MBR registry fee on the annual return follows (electronic rates). Passed through at cost, plus our EUR {MBR_ANNUAL_RETURN.ourFee} filing fee - we confirm the figure before filing.</div>
                <div style={{ marginTop: 14 }}><OptPills opts={capOpts} /></div>
              </div>
            )}

            {isNum && (
              <div style={{ ...BLOCK, display: "flex", alignItems: "center", gap: 20 }}>
                <Range value={q.head} min={0} max={50} label="People on payroll" onChange={(v) => setQ({ head: v })} />
                <span style={{ minWidth: 104, textAlign: "right", fontFamily: DISPLAY, fontVariantNumeric: "tabular-nums", fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: INK }}>{q.head + (q.head === 1 ? " person" : " people")}</span>
              </div>
            )}

            {isStart && (
              <div style={BLOCK}>
                <label htmlFor="lqc-start" style={{ ...SUB_LABEL, display: "block" }}>Earliest month that still needs doing</label>
                <input
                  id="lqc-start"
                  name="start_month"
                  type="month"
                  value={q.startMonth}
                  onChange={(e) => setQ({ startMonth: e.target.value, behind: String(catchUpMonthsFrom(e.target.value)) })}
                  className="lqc-input"
                  style={{ ...Q_FIELD_INPUT, display: "block", marginTop: 12, width: "min(100%, 260px)" }}
                />
                <div style={{ ...SUB_HELP, marginTop: 10 }}>{startEcho}</div>
                {catchHas && (
                  <div style={{ marginTop: 14, padding: "14px 16px", borderRadius: 16, background: NOTE_STYLE.ok.bg, border: "1px solid " + NOTE_STYLE.ok.bc, color: NOTE_STYLE.ok.fg, fontFamily: BODY, fontSize: 14, lineHeight: 1.6 }}>
                    <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", color: INK }}>{catchLine}</div>
                    <div style={{ marginTop: 4 }}>{catchNote}</div>
                  </div>
                )}
              </div>
            )}

            {isSvc && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {svcRows.map((row) => {
                  const [offOpt, onOpt] = row.options;
                  const isOn = !!onOpt?.on;
                  const current = isOn ? onOpt : offOpt;
                  return (
                    <div key={row.name} style={{ display: "flex", alignItems: "center", gap: "12px 20px", flexWrap: "wrap", padding: "18px 0", borderTop: "1px solid " + HAIR }}>
                      <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: DISPLAY, fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", color: INK }}>
                          {row.name}
                          {row.hasInfo && (
                            <button type="button" onClick={() => setInfo(true)} aria-label="When does the audit apply?" className="lqc-round" style={{
                              flexShrink: 0, width: 22, height: 22, padding: 0, borderRadius: 11, border: "1px solid rgba(79,85,241,.45)", background: "transparent",
                              color: INDIGO, fontFamily: DISPLAY, fontSize: 12, fontWeight: 700, lineHeight: 1, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center",
                            }}>?</button>
                          )}
                        </div>
                        <div style={{ marginTop: 4, fontFamily: BODY, fontSize: 13.5, lineHeight: 1.55, color: "#52525B" }}>{row.desc}</div>
                      </div>
                      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
                        <span style={{ minWidth: 84, textAlign: "right", fontFamily: DISPLAY, fontVariantNumeric: "tabular-nums", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: row.amt === "—" ? "#A1A1AA" : INK }}>{row.amt}</span>
                        {offOpt && onOpt ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                            <span style={{ minWidth: 30, textAlign: "right", fontFamily: BODY, fontSize: 13, fontWeight: 600, color: isOn ? INDIGO : "#71717A" }}>{current?.label}</span>
                            <Switch on={isOn} label={row.name} onToggle={() => (isOn ? offOpt : onOpt).pick()} />
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {isQuote && (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {quoteLines.length > 0 && (
                  <div style={{ borderTop: "1px solid " + HAIR }}>
                    {quoteLines.map((l, i) => (
                      <div key={l.n + l.v} style={{ display: "grid", gridTemplateColumns: "34px minmax(0, 1fr) auto", gap: "4px 12px", alignItems: "baseline", padding: "16px 0", borderBottom: "1px solid " + HAIR }}>
                        <span style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 600, letterSpacing: ".02em", color: INDIGO }}>{String(i + 1).padStart(2, "0")}</span>
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: "block", fontFamily: DISPLAY, fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", color: INK }}>{l.n}</span>
                          <span style={{ display: "block", marginTop: 3, fontFamily: BODY, fontSize: 13.5, lineHeight: 1.5, color: "#52525B" }}>{l.e}</span>
                        </span>
                        <span style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", color: INK, whiteSpace: "nowrap" }}>{l.v}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p style={{ margin: quoteLines.length > 0 ? "18px 0 0" : 0, fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: "#3F3F46" }}>{summary}</p>
                {r.notes.map(([tone, text], i) => (
                  <p key={i} style={NOTE_P(tone)}><Mark tone={tone} /><span>{text}</span></p>
                ))}
                {sent ? (
                  <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid " + HAIR }}>
                    <p style={{ margin: 0, fontFamily: DISPLAY, fontSize: 17, fontWeight: 600, lineHeight: 1.45, letterSpacing: "-0.01em", color: INK }}>{sent.message}</p>
                    {sent.status === "quoted" && (
                      <p style={{ margin: "8px 0 0", fontFamily: BODY, fontSize: 14, lineHeight: 1.55, color: "#52525B" }}>
                        Quotation {sent.reference} — the email links to your quotation page, where you can switch services on or off and accept online.
                      </p>
                    )}
                  </div>
                ) : callback ? (
                  // Nothing sendable as a quotation — a director calls instead.
                  <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid " + HAIR }}>
                    <Button variant="dark" size="md" href="/contact">Request a call <Icon name="arrow-right" size={16} color="#fff" /></Button>
                  </div>
                ) : (
                  <div style={{ marginTop: 18, paddingTop: 20, borderTop: "1px solid " + HAIR }}>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <label style={Q_FIELD}>
                        <span style={Q_FIELD_LABEL}>Your name</span>
                        <input name="name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Your name" placeholder="Jane Borg" autoComplete="name" className="lqc-input" style={Q_FIELD_INPUT} />
                      </label>
                      <label style={Q_FIELD}>
                        <span style={Q_FIELD_LABEL}>Email</span>
                        <input name="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" aria-label="Work email" placeholder="jane@borgtrading.mt" autoComplete="email" className="lqc-input" style={Q_FIELD_INPUT} />
                      </label>
                      <label style={Q_FIELD}>
                        <span style={Q_FIELD_LABEL}>Phone <span style={Q_FIELD_OPT}>optional</span></span>
                        <input name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" aria-label="Phone" placeholder="+356 …" autoComplete="tel" className="lqc-input" style={Q_FIELD_INPUT} />
                      </label>
                    </div>
                    <input value={hp} onChange={(e) => setHp(e.target.value)} name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={Q_HONEYPOT} />
                    <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <Button variant="dark" size="md" onClick={send} style={{ opacity: canSend && !sending ? 1 : 0.45, pointerEvents: canSend && !sending ? "auto" : "none" }}>
                        {sending ? "Sending…" : "Send me this quote"}
                        {!sending && <Icon name="arrow-right" size={16} color="#fff" />}
                      </Button>
                    </div>
                  </div>
                )}
                <p style={{ margin: "14px 0 0", fontFamily: BODY, fontSize: 12.5, lineHeight: 1.55, color: "#71717A" }}>Your quotation arrives by email, ready to review and accept online — or, if your answers need a closer look, from our team within one working day. KYC is required before work starts. All fees exclude VAT.</p>
              </div>
            )}

            {/* footer: nav + running total */}
            <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid " + HAIR, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              {!isQuote && (
                <>
                  <button type="button" onClick={() => setQ({ step: Math.max(0, step - 1) })} disabled={step === 0} className="a4-btn a4-btn-outline" style={navBtn(step === 0)}>Back</button>
                  <button type="button" onClick={next} disabled={nextDis} className="a4-btn a4-btn-ink" style={navBtn(nextDis)}>{step === QSTEP_QUOTE - 1 ? "See my quote" : "Next"}</button>
                </>
              )}
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: "4px 12px", flexWrap: "wrap" }}>
                <span style={KICKER}>{totLabel}</span>
                {promo && <span style={strike}>{euro(r.grossMo)}</span>}
                <span style={{ ...amount(false), fontSize: priced ? 26 : 18 }}>{moText}</span>
                {yrPromo && <span style={strike}>{euro(r.grossYr)}</span>}
                {yrHas && <span style={{ fontFamily: BODY, fontVariantNumeric: "tabular-nums", fontSize: 14, fontWeight: 500, color: "#52525B" }}>{euro(r.yrTot) + " /yr"}</span>}
                {oneHas && <span style={{ fontFamily: BODY, fontVariantNumeric: "tabular-nums", fontSize: 14, fontWeight: 500, color: "#52525B" }}>{euro(r.oneTot) + " once"}</span>}
              </span>
            </div>
          </div>

          {/* live price panel — the SAME qCalc output the quote step renders,
              so the panel cannot show a price the quote contradicts. Styled as
              the quote document's totals. */}
          <aside className="lqc-panel" data-fx="rise" data-d="260" style={{ position: "sticky", top: 96, minWidth: 0, background: "#FFFFFF", border: "1px solid " + HAIR, borderRadius: 28, boxShadow: "0 50px 120px rgba(9,9,11,.12)", overflow: "hidden", textAlign: "left" }}>
            <div style={{ padding: "26px 26px 20px" }}>
              <div style={KICKER}>{priced ? totLabel : "Your price"}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                <span style={{ ...amount(true), fontSize: priced ? "clamp(40px,3.6vw,52px)" : 24, lineHeight: 1.1, paddingBottom: ".04em" }}>{moText}</span>
                {priced && <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: "#52525B" }}>/ month</span>}
              </div>
              {promo && <div style={{ ...strike, marginTop: 4 }}>{euro(r.grossMo)}</div>}
              {(yrHas || oneHas) && (
                <div style={{ marginTop: 10, display: "flex", gap: "4px 14px", flexWrap: "wrap", fontFamily: BODY, fontVariantNumeric: "tabular-nums", fontSize: 14, fontWeight: 500, color: INDIGO }}>
                  {yrHas && <span>{euro(r.yrTot)} /yr</span>}
                  {oneHas && <span>{euro(r.oneTot)} once</span>}
                </div>
              )}
            </div>
            {quoteLines.length > 0 && (
              <div style={{ padding: "0 26px 16px" }}>
                {quoteLines.map((l) => (
                  <div key={l.n + l.v} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "11px 0", borderTop: "1px solid " + HAIR, fontFamily: BODY, fontSize: 13.5, lineHeight: 1.45 }}>
                    <span style={{ minWidth: 0, color: "#3F3F46" }}>{l.n}</span>
                    <span style={{ color: INK, fontWeight: 600, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{l.v}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ padding: "20px 26px 26px", borderTop: "1px solid " + HAIR, background: "#FAFAFA" }}>
              <span style={{ display: "inline-flex", padding: "6px 13px", borderRadius: 999, background: "rgba(9,9,11,.78)", color: "#FFFFFF", fontFamily: DISPLAY, fontSize: 13, fontWeight: 500 }}>Fees before VAT</span>
              <p style={{ margin: "12px 0 0", fontFamily: BODY, fontSize: 13.5, lineHeight: 1.6, color: "#52525B" }}>{panelNote}</p>
              {!isQuote && (
                <Button variant="dark" size="md" onClick={() => setQ({ step: QSTEP_QUOTE })} style={{ width: "100%", marginTop: 18 }}>
                  See the full quote <Icon name="arrow-right" size={16} color="#fff" />
                </Button>
              )}
            </div>
          </aside>
        </div>

        <div data-fx="rise" style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
          {/* The same services on one page — every service at once, and the monthly retainer. */}
          <LocalizedLink href="/quote" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 6, fontFamily: DISPLAY, fontSize: 16, fontWeight: 600, color: INDIGO, textDecoration: "none" }}>
            Open the full quote builder <Icon name="arrow-right" size={16} color={INDIGO} />
          </LocalizedLink>
          <p style={{ margin: 0, fontFamily: BODY, fontSize: 14, lineHeight: 1.55, color: "#52525B" }}>The price appears instantly — nothing is gated behind an email. All fees exclude VAT.</p>
          {/* Same line, same wording, on the vacei.com homepage (index.html) — the
              two homepages reference the audit landing page identically. */}
          <p style={{ margin: 0, fontFamily: BODY, fontSize: 14, lineHeight: 1.55, color: "#52525B" }}>Need a statutory audit? <LocalizedLink href="/audit-services" style={{ color: INDIGO, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>Get a financial audit quote</LocalizedLink> — four questions price it instantly on the audit page.</p>
        </div>
      </Container>

      {/* Audit guidelines popup — opened from the "?" on the audit row. */}
      {info && (
        <div style={{ position: "fixed", inset: 0, zIndex: 70 }}>
          <div onClick={() => setInfo(false)} style={{ position: "absolute", inset: 0, background: "rgba(9,9,11,.55)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }} />
          <div role="dialog" aria-modal="true" aria-label="When does the audit apply?" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "min(560px, calc(100vw - 32px))", maxHeight: "calc(100vh - 48px)", overflowY: "auto", background: "#FFFFFF", border: "1px solid " + HAIR, borderRadius: 28, padding: "clamp(24px,3.4vw,36px)", boxShadow: "0 50px 120px rgba(9,9,11,.28)", color: INK, textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <h3 style={{ margin: 0, fontFamily: DISPLAY, fontSize: 26, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15 }}>When does the audit apply?</h3>
              <button type="button" onClick={() => setInfo(false)} aria-label="Close" className="lqc-round" style={{ flexShrink: 0, width: 40, height: 40, padding: 0, borderRadius: 20, border: "1px solid " + HAIR, background: "#FFFFFF", cursor: "pointer", color: INK, display: "grid", placeItems: "center" }}>
                <Icon name="x" size={18} color={INK} />
              </button>
            </div>
            <div style={{ marginTop: 18, fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: "#3F3F46" }}>
              {[
                <p key="1" style={{ margin: 0 }}><strong style={{ color: INK }}>Every Maltese company files audited financial statements each year</strong> — regardless of size. That is why the line says &ldquo;if applicable&rdquo;: what changes is the kind of engagement, not whether one is due.</p>,
                <p key="2" style={{ margin: 0 }}><strong style={{ color: INK }}>Small companies usually qualify for a review engagement instead</strong> — roughly under €93k turnover with a small balance sheet. It is the lighter option at about half the cost, and it is what we price by default.</p>,
                <p key="3" style={{ margin: 0 }}><strong style={{ color: INK }}>High volume means a full audit.</strong> Above roughly 150 transactions a month a company rarely stays under the thresholds, so we price the full engagement — if your figures come in under, the fee drops.</p>,
                <p key="4" style={{ margin: 0 }}><strong style={{ color: INK }}>We confirm which applies from your figures</strong> before anything is agreed — you would hear it from us first, never on the invoice.</p>,
              ].map((p, i, all) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "36px minmax(0, 1fr)", gap: 8, padding: "14px 0", borderTop: "1px solid " + HAIR, ...(i === all.length - 1 ? { borderBottom: "1px solid " + HAIR } : null) }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 600, color: INDIGO }}>{String(i + 1).padStart(2, "0")}</span>
                  {p}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <Button variant="dark" size="md" onClick={() => setInfo(false)}>Got it</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
