"use client";

import React, { useState } from "react";
import { Button, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
import { AUDIT_YEARLY, TAX_RETURN_YEARLY, VAT_MONTHLY, payrollFee, payrollFeeLabel, CAPITAL_BANDS, MBR_ANNUAL_RETURN, MANAGED_ENTITY_OPTIONS, MANAGED_ENTITY_LABELS, EXPENSE_BANDS, BOOKKEEPING_FROM, BOOKKEEPING_COMPANY, ONBOARDING_UNPRICED_NOTE, LAUNCH_PROMO, catchUpAmount, catchUpLabel, isPromoActive, managedMonthly, type CapitalBand, type ExpenseBand, type ManagedEntity, type TxnBand } from "@/data/a4QuotePack";
import { submitWebsiteQuotation, type A4Item, type A4Risk, type WebsiteQuoteResult } from "@/lib/websiteQuotation";
import { independenceFlags, independenceNotice } from "@/lib/independence";
import { catchUpMonthsFrom, formatStartMonth, nextMonth } from "@/lib/accounting-fee";
import { trackConversion } from "@/lib/analytics";

// Homepage pricing calculator — ported from the Vacei site's cost calculator.
// The figures below are the Vacei figures, verbatim. If Vacei pricing changes,
// change it there first and mirror it here.
//
// CURRENT PACK: mt-2026-08-14-volume (see A4_QUOTE_PACK_VERSION). Bookkeeping
// is priced by ENTITY × MONTHLY EXPENSES across nine bands — it is not flat,
// and copy reading these figures must say "from", never "flat".
//
// History: the superseded mt-2026-08-14-managed pack removed the software-only
// route this wizard used to open with ("Only software" / "Software +
// accountants"). There is one bookkeeping service: A4 keeps the books.

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
// `onb` is gone: onboarding and opening balances carry no number in pack
// mt-2026-08-14-managed. They are still done, still mentioned, never priced here.
const QTIERS = {
  standard: { l: "Standard", mult: 1, refer: false, note: null as [string, string] | null },
  elevated: { l: "Elevated", mult: 1.2, refer: false, note: ["info", "Sectors like this need a few extra checks when we take you on. It is built into the price rather than added later."] as [string, string] },
  high: { l: "High", mult: 1.45, refer: false, note: ["warn", "Licensed and regulated sectors need full source-of-funds checks and closer monitoring. A director signs off before we take the work on."] as [string, string] },
  refer: { l: "Referral", mult: 1, refer: true, note: ["warn", "We price most companies on the spot, but yours needs a short call with a director before we put a number on it. Usually the same day."] as [string, string] },
};
const QTXN: [string, string, string][] = [
  ["0", "None yet", "not trading"],
  ["1-20", "Up to 20", "a few a week"],
  ["21-60", "20 to 60", "most days"],
  ["61-150", "60 to 150", "busy"],
  ["151-400", "150 to 400", "high volume"],
  ["401-1000", "400 to 1,000", "very high"],
  ["1000+", "1,000+", "enterprise"],
];
/* QBEHIND (the "how many months behind?" pill row) is GONE. It asked a second
   time for something the start month already says — see `catchUpMonthsFrom`. */
const QVATREG: [string, string, string][] = [
  ["none", "Not registered", "tax return only"],
  ["art10", "Yes", "charging and reclaiming"],
  ["art11", "Small exempt", "under the threshold"],
  ["art12", "EU purchases", "acquisitions only"],
  ["unsure", "Not sure", "we'll check"],
];
const QSIZE: [string, string, string][] = [
  ["small", "Small", "under €93k turnover"],
  ["big", "Bigger", "above that"],
  ["unsure", "Not sure", "we'll check"],
];
// Every table reads the pack, so this calculator can never quote a different
// figure from /accounting-services, /audit-services, /quote or the Vacei side.
// Owner decision 2026-08-02: the local `book` table (69/119/199/329/549/899)
// was retired in favour of the pack's BOOKKEEPING_MONTHLY.
// Bookkeeping is no longer volume-banded, so `book` is gone from this table.
const QT: Record<string, Record<string, number>> = {
  vat: VAT_MONTHLY,
  taxret: TAX_RETURN_YEARLY,
  assure: AUDIT_YEARLY,
};
/* QPAY (the flat whole-book tier alias) is gone with `payrollRate`: payroll is
   MARGINAL and un-multiplied since mt-2026-08-17-corrections (A2+A3). */
// Two separate volume questions, deliberately. "Monthly spend" (expenses) sets
// the BOOKKEEPING price; "Volume" (transactions) sets VAT, the tax return and
// the audit. They sit apart in the flow and are worded differently so neither
// reads as a repeat of the other.
const QSTEPS = ["What you do", "Whose books", "Monthly spend", "Volume", "Payroll", "When we start", "VAT", "Company size", "Your services", "Your quote"];

export type QState = {
  step: number;
  sector: string;
  txn: string;
  /** Whose books these are — with `expenses`, what sets the bookkeeping price. */
  entity: ManagedEntity;
  /**
   * Monthly expenses band — the bookkeeping price driver. Distinct from `txn`:
   * this one prices the books, `txn` prices VAT, the tax return and the audit.
   *
   * `""` means NOT YET ANSWERED. There is no default band, deliberately — see
   * `Q_INIT`.
   */
  expenses: ExpenseBand | "";
  /** Authorised share capital band — sets the MBR registry fee on the annual return. */
  cap: CapitalBand;
  head: number;
  /**
   * Earlier months that still need doing, as a whole number in a string.
   *
   * DERIVED, never asked: the start-month picker writes it through
   * `catchUpMonthsFrom`. It stays on the state (rather than being computed in
   * `qCalc`) because it is the wire value `qItems` submits and the pack prices
   * on — keeping it here means the quote on screen and the quote on the wire
   * read the same field, exactly as they did when a visitor answered it.
   */
  behind: string;
  /**
   * `YYYY-MM` — the EARLIEST month that still needs doing, and so the first
   * month in scope. REQUIRED before a quote can be sent. Everything from it up
   * to last month is catch-up; the monthly fee runs from this month on.
   */
  startMonth: string;
  vatreg: string;
  size: string;
  /** "none" | "managed" — A4 keeps the books, or does not. No third option. */
  book: string;
  pay: string;
  vat: string;
  taxret: string;
  assure: string;
  regoff: string;
};

/**
 * The wizard's opening state.
 *
 * `expenses` and `startMonth` are EMPTY, and must stay that way. They used to
 * ship `"10-25k"` and `nextMonth()`, which handed a visitor who clicked Next
 * without reading a complete, binding quote for two answers they never gave.
 * That is worse than a silent degrade: the band id is valid, so the backend
 * re-priced it, agreed within €1/1%, and issued a real quotation. A company
 * spending €300k/month was quoted €69/mo instead of €379; one spending €8k/mo
 * was quoted €69 instead of €49 — the pack docblock names both directions of
 * loss and the single default produced both at once. The copy claimed
 * "Suggested, not assumed — the visitor confirms it"; nothing required a
 * confirmation, and `startOk` passed on the suggestion.
 *
 * Everything else here IS a safe default: they shape the quote (which sector,
 * whose books, how many staff) but none of them is the price driver, and each
 * is visible on a step the visitor passes through.
 */
export const Q_INIT: QState = {
  step: 0, sector: "shop", txn: "21-60", entity: "company", expenses: "", cap: "1500", head: 2, behind: "0",
  startMonth: "", vatreg: "art10", size: "small",
  book: "managed", pay: "none", vat: "none", taxret: "none", assure: "none", regoff: "none",
};

type Line = { n: string; e: string; v: number };
type Note = [string, string];

/** Volumes at which a company is unlikely to stay under the small-company thresholds. */
const QT_BIG_VOL = ["151-400", "401-1000", "1000+"];

/**
 * The human label for an expenses band, for use inside prose.
 *
 * Returns null when nothing is picked — the old `?? EXPENSE_BANDS[0]` fallback
 * would have described the entry band to a visitor who chose nothing, which is
 * exactly the pre-answering this component was fixed to stop doing.
 */
const prettyBand = (id: ExpenseBand | "") =>
  EXPENSE_BANDS.find((b) => b.id === id)?.label ?? null;

/**
 * Whether the assurance line is a review engagement rather than a full audit.
 * Named so `qCalc` (what we show) and `qItems` (what we submit) can never
 * disagree about which of the two the visitor was quoted.
 */
function qAuditIsReview(q: QState) {
  // The size answer cannot beat arithmetic (finding A1, mirrored from
  // vacei.com): €100k+ of MONTHLY spend cannot be under €93k of ANNUAL
  // turnover, so those bands price a full audit whatever was ticked.
  const bandBig = ["100-200k", "200-300k", "300-400k", "400-500k", "500k+"].indexOf(q.expenses) !== -1;
  return !bandBig && (q.size === "small" || q.size === "unsure") && QT_BIG_VOL.indexOf(q.txn) === -1;
}

/**
 * The assurance line NAMES what was priced. A small company is quoted a REVIEW
 * ENGAGEMENT at 0.55× the audit fee, so a line reading "Financial audit" over
 * that figure sold the wrong assurance level — vacei.com and the portal pack
 * both use the pair below, verbatim, and now so does this wizard.
 *
 * These are wire-contract labels: `qItems` keys the basket off them and
 * `lineAmt` looks the amount up by them. Reword either and the audit item is
 * silently dropped from the submitted quote.
 */
const ASSURE_AUDIT_LABEL = "Financial audit (if applicable)";
const ASSURE_REVIEW_LABEL = "Review engagement (if applicable)";

/** `now` is injectable so the promo window can be pinned in tests, exactly as
 *  `evaluateA4Items` does — otherwise every assertion here flips on 1 Sep. */
export function qCalc(q: QState, now: Date = new Date()) {
  const tier = QTIERS[(QSECT.find((s) => s[0] === q.sector) || QSECT[0])[2]];
  const notes: Note[] = [];
  if (tier.note) notes.push(tier.note);
  if (tier.refer) return { refer: true as const, conflict: false as const, noExpenses: false as const, notes, mo: [] as Line[], yr: [] as Line[], one: [] as Line[], moTot: 0, yrTot: 0, oneTot: 0, grossMo: 0, grossYr: 0, promoApplied: false };
  // IESBA independence, settled BEFORE anything is priced — the same shape
  // vacei.com uses, and for the same reason. A4 is not permitted to keep the
  // books AND give assurance on them, so there is no such engagement to put a
  // figure on: producing the figures and then hiding the send button would put
  // a price on screen for something we cannot sell, and a number is what a
  // visitor anchors on. `qAdvance` turns the assurance question on by default,
  // so this is the path most homepage visitors take, not an edge case. The
  // wizard asks which of the two is ours; either answer prices instantly.
  const entity: ManagedEntity = q.entity === "sole" ? "sole" : "company";
  // null when the band is missing OR unrecognised. Only asked of a visitor who
  // actually wants the books kept — the band prices bookkeeping and nothing
  // else, so an audit-only enquiry is never held on it.
  const bookRate = q.expenses === "" ? null : managedMonthly(entity, q.expenses);
  const wantsBooks = q.book === "managed";
  /** B1: the spend answer is missing, so the books cannot be priced at all. */
  const noExpenses = wantsBooks && bookRate == null;
  /** Both sides of the independence rule at once. */
  const conflict = wantsBooks && q.assure === "we";
  // Both flags are computed independently and reported independently: the
  // untouched default path trips BOTH, and telling the visitor about only one
  // sends them round a second time. Either one withholds every figure —
  // producing lines and then hiding the button still puts a number on screen,
  // and a number is what a visitor anchors on.
  if (conflict || noExpenses) {
    return { refer: false as const, conflict, noExpenses, notes, mo: [] as Line[], yr: [] as Line[], one: [] as Line[], moTot: 0, yrTot: 0, oneTot: 0, grossMo: 0, grossYr: 0, promoApplied: false };
  }
  const rm = tier.mult;
  const mo: Line[] = [], yr: Line[] = [], one: Line[] = [];
  // Flat, and deliberately NOT × rm — the sector loading applies to the
  // compliance work, not to keeping the books.
  if (wantsBooks && bookRate != null) {
    mo.push({
      n: "Bookkeeping",
      e: MANAGED_ENTITY_LABELS[entity] + " — you send the paperwork, we keep the books",
      v: bookRate,
    });
  }
  if (q.pay === "we" && q.head > 0) {
    // Marginal tiers, NOT risk-multiplied (findings A2 + A3). The label is the
    // arithmetic, so the amount always reproduces from it.
    mo.push({ n: "Payroll", e: payrollFeeLabel(q.head) + " per person", v: payrollFee(q.head) });
  }
  // We only put our name to a VAT return when we have worked the ledger.
  const selfFile = q.book !== "managed";
  if (q.vat === "we" && q.vatreg !== "none") {
    if (selfFile) {
      notes.push(["warn", "You would be filing your own VAT returns. We only put our name to a return when we have worked the ledger — switch bookkeeping on above and we take the returns over."]);
    } else if (q.vatreg === "art11") {
      yr.push({ n: "VAT declaration", e: "small exempt — one declaration a year", v: 145 * rm });
    } else {
      const mult = q.vatreg === "art12" ? 0.6 : 1;
      mo.push({ n: "VAT returns", e: "filed quarterly, billed monthly", v: QT.vat[q.txn] * mult * rm });
      if (q.vatreg === "unsure") notes.push(["info", "We have priced you as fully VAT registered, the most common case. If the register says otherwise the price drops — we tell you before you commit."]);
    }
  }
  if (q.taxret === "we") yr.push({ n: "Annual tax return", e: "from the closed ledger, with schedules", v: QT.taxret[q.txn] * rm });
  if (q.assure === "we") {
    const bigVol = QT_BIG_VOL.indexOf(q.txn) !== -1;
    const review = qAuditIsReview(q);
    yr.push({ n: review ? ASSURE_REVIEW_LABEL : ASSURE_AUDIT_LABEL, e: review ? "review engagement — the lighter option" : "full financial audit", v: QT.assure[q.txn] * (review ? 0.55 : 1) * rm });
    if (review) notes.push(["ok", "You likely qualify for a review instead of a full audit — about half the cost. We confirm it against your figures before anything is agreed."]);
    if (bigVol && q.size !== "big") notes.push(["warn", "At that volume a company is unlikely to stay under the small-company thresholds, so we priced a full audit. If your figures come in under, the price drops."]);
  }
  if (q.regoff === "we") yr.push({ n: "Registered office", e: "statutory address, post passed to you", v: 1200 });
  // Every remaining line is A4 labour now that the software-only line is gone.
  const labour = mo.reduce((s, l) => s + l.v, 0) + yr.reduce((s, l) => s + l.v, 0) > 0;
  /** Government money inside the yearly total — never discounted. */
  let registry = 0;
  // The annual return is a COMPANY filing. A Malta sole trader is not on the
  // Business Registry, files no annual return, and has no authorised share
  // capital for the registry fee to be keyed on — so quoting it to one bills
  // for a filing we could not make on their behalf even if they paid. This was
  // live: `labour` alone gated it, so every self-employed prospect who bought
  // any service at all was quoted €150/yr for it. Found by walking a real
  // sole-trader journey end to end, not by any test. vacei.com carries the
  // same predicate as `mbrApplies` — keep the two in step.
  if (labour && entity === "company") {
    // The registry fee is set by authorised share capital (electronic rates) and
    // passed through at cost. Read from the pack — never a literal, or every
    // prospect above €1,500 capital is silently under-quoted.
    const capRow = CAPITAL_BANDS.find((c) => c.id === (q.cap || "1500")) || CAPITAL_BANDS[0];
    registry = MBR_ANNUAL_RETURN.registryFeeByCapital[capRow.id];
    // Our fee AND the registry fee, exactly as the shared engine bills it. The
    // registry slice alone was quoted here, so the annual return came out €50
    // light against /pricing, vacei.com and the quotation we actually email.
    // NOTE: the line NAME is the key `qItems` matches on to build the basket —
    // renaming it silently drops the MBR item from the submitted quote.
    yr.push({ n: "MBR annual return fee", e: "our €" + MBR_ANNUAL_RETURN.ourFee + " fee to prepare and file it, plus the government registry fee passed through at cost, set by your share capital (" + capRow.note + ")", v: MBR_ANNUAL_RETURN.ourFee + registry });
  }
  if (labour) {
    // Onboarding and opening balances are done but NOT priced here — no €0
    // line either, which would read as "included, free". This applies to every
    // entity, which is why it is not inside the company-only block above.
    notes.push(["info", ONBOARDING_UNPRICED_NOTE]);
  }
  if (!labour && tier.note && notes.indexOf(tier.note) !== -1) notes.splice(notes.indexOf(tier.note), 1);
  // Earlier months, at the same monthly rate, uncapped. `n` is the exact
  // wire-contract label — `qItems` keys the basket off it, so it must not be
  // reworded here without changing catchUpLabel in the pack.
  const months = +q.behind;
  // Proved a real band by the `noExpenses` guard above whenever the books are
  // ours; an audit-only basket has no catch-up line to price.
  const catchUpName = q.expenses === "" ? null : catchUpLabel(months, entity, q.expenses, isPromoActive(now));
  const catchUpFee = q.expenses === "" ? null : catchUpAmount(months, entity, q.expenses, isPromoActive(now));
  if (months > 0 && wantsBooks && catchUpName != null && catchUpFee != null) {
    one.push({
      n: catchUpName,
      e: "the same monthly rate for each earlier month — no catch-up premium, no cap",
      v: catchUpFee,
    });
  }
  [mo, yr, one].forEach((a) => a.forEach((l) => { l.v = Math.round(l.v); }));
  const sum = (a: Line[]) => a.reduce((s, l) => s + l.v, 0);

  // The launch discount, on the same terms the shared engine applies it: the
  // government registry fee is never discounted (it is not ours to discount),
  // and one-off charges are billed in full. This wizard previously applied no
  // discount at all, so it showed the list price while /pricing and the emailed
  // quotation both showed 25% less — the same journey, two different prices.
  const grossMo = sum(mo), grossYr = sum(yr);
  const promo = isPromoActive(now);
  const keep = 1 - LAUNCH_PROMO.pct;
  const moTot = promo ? Math.round(grossMo * keep) : grossMo;
  const yrTot = promo ? Math.round((grossYr - registry) * keep) + registry : grossYr;
  if (promo && (grossMo > 0 || grossYr > 0)) notes.push(["ok", LAUNCH_PROMO.note]);

  return {
    refer: false as const, conflict: false as const, noExpenses: false as const, mo, yr, one, notes,
    moTot, yrTot, oneTot: sum(one),
    /** List prices, for the struck-through originals. */
    grossMo, grossYr, promoApplied: promo && (grossMo > 0 || grossYr > 0),
  };
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
 * The visitor's answers → the priceable basket we submit.
 *
 * Every entry is gated on a line `qCalc` ACTUALLY produced rather than on the
 * raw answers, so the two can never disagree about what was quoted: the VAT
 * block and the "no labour, no MBR" rule are decided once, in `qCalc`, and
 * read back here.
 *
 * The two old divergences are closed by pack mt-2026-08-14-managed: the
 * "Additional bank accounts" line no longer exists (flat price), and
 * `qCalc` now applies the launch discount and bills the full MBR fee, so
 * `evaluateA4Items(qItems(q))` matches what is on screen.
 */
export function qItems(q: QState): A4Item[] {
  const r = qCalc(q);
  // Nothing was priced, so there is nothing to submit. An empty basket is what
  // keeps `canSend` false and what stops a quotation the server would refuse —
  // or, for `noExpenses`, one the server would happily ACCEPT at a band nobody
  // chose — from ever leaving the page. That second case is the money bug: the
  // band id was valid, so no downstream check could have caught it.
  if (r.refer || r.conflict || r.noExpenses) return [];
  const all = [...r.mo, ...r.yr, ...r.one];
  const has = (n: string) => all.some((l) => l.n === n);
  const txn = q.txn as TxnBand;
  const entity: ManagedEntity = q.entity === "sole" ? "sole" : "company";
  const items: A4Item[] = [];
  // `qCalc` returned priced lines, which it only does once the band resolved,
  // so `q.expenses` is a real band wherever a bookkeeping or catch-up item is
  // built below. Narrowed once here rather than asserted at each use.
  const expenses = q.expenses as ExpenseBand;

  if (has("Bookkeeping")) items.push({ service: "bookkeeping-managed", entity, expenses });
  if (has("Payroll")) items.push({ service: "payroll", heads: q.head });
  if (has("VAT returns")) items.push({ service: "vat", txn, vatreg: q.vatreg === "art12" ? "art12" : "art10" });
  if (has("VAT declaration")) items.push({ service: "vat", txn, vatreg: "art11" });
  if (has("Annual tax return")) items.push({ service: "taxret", txn });
  if (has(ASSURE_AUDIT_LABEL) || has(ASSURE_REVIEW_LABEL)) items.push({ service: "audit", txn, ...(qAuditIsReview(q) ? { review: true as const } : {}) });
  if (has("Registered office")) items.push({ service: "registered-office" });
  if (has("MBR annual return fee")) items.push({ service: "mbr", capital: q.cap || "1500" });
  // Catch-up is keyed on the answer, not on the (now dynamic) line label.
  if (q.book === "managed" && +q.behind > 0) items.push({ service: "catchup", months: +q.behind, entity, expenses });
  // Onboarding carries NO figure, but it IS part of the basket — the backend
  // reads `hasUnpricedOnboarding` off the items to add "onboarding is not
  // included in the figures below" to the quotation description. Omitting it
  // here meant a4.com.mt said that on screen and never in the emailed quote,
  // while vacei.com (which does emit it) said it in both. Gated on the note
  // `qCalc` actually produced, so screen and wire cannot disagree.
  if (r.notes.some(([, t]) => t === ONBOARDING_UNPRICED_NOTE)) items.push({ service: "onboarding" });

  return items;
}

/**
 * IESBA routing for what this wizard has been asked for.
 *
 * `assure: "we"` is audit-side whether it prices as a full audit or as a review
 * engagement. A review IS an assurance engagement: the firm reports on figures
 * it would otherwise have prepared, which is the self-review threat the rule
 * exists to stop. The exclusion that used to sit here (`&& !qAuditIsReview(q)`)
 * disagreed with the portal's pack, which flags any `audit` item regardless of
 * `review` — and because the wizard's own defaults land on a small company with
 * a review, the DEFAULT homepage basket was the one that diverged.
 */
/**
 * One "Next" click, as a pure function — the wizard's ONLY step transition.
 *
 * Exported so a test can walk the default journey the way a visitor does rather
 * than restate the rules and then prove its own restatement. Two of the three
 * lines below are answer defaults applied on the visitor's behalf, and the
 * third (`assure`) is what puts the default homepage basket on the audit side
 * of the independence rule without the visitor ever choosing it.
 */
export function qAdvance(q: QState, lastStep: number): Partial<QState> {
  const patch: Partial<QState> = { step: Math.min(lastStep, q.step + 1) };
  // M12: the step-3 patch that re-enabled bookkeeping and the tax return
  // (`if (q.step === 3 && q.book === "none") { book = "managed"; taxret = "we"; }`)
  // is GONE. It was vestigial from the pre-managed flow, and it overrode an
  // EXPLICIT choice: a visitor who switched bookkeeping off on the services
  // step and then walked back through the wizard (Back ×5, Next) had it — and
  // the tax return — switched silently back on, adding services and money they
  // had already declined. A default may fill a blank; it may never overwrite an
  // answer.
  if (q.step === 4) patch.pay = q.head > 0 ? "we" : "none";
  if (q.step === 7 && q.assure === "none") patch.assure = "we";
  return patch;
}

export function qIndependence(q: QState) {
  return independenceFlags({
    wantsBookkeeping: q.book === "managed",
    wantsAudit: q.assure === "we",
  });
}

function qSummarise(q: QState) {
  const bits: string[] = [];
  if (q.book === "managed") bits.push("you send us the paperwork and we keep the books");
  if (q.pay === "we" && q.head > 0) bits.push("we run your payroll");
  if (q.vat === "we" && q.vatreg !== "none" && q.book === "managed") bits.push("we file your VAT");
  if (q.taxret === "we") bits.push("we prepare your annual tax return");
  if (q.assure === "we") bits.push("we handle your audit or review");
  if (q.regoff === "we") bits.push("we provide your registered office");
  if (!bits.length) return "Nothing picked yet — choose what you need in the services step.";
  const j = bits.length === 1 ? bits[0] : bits.slice(0, -1).join(", ") + ", and " + bits[bits.length - 1];
  let out = "So: " + j;
  const start = formatStartMonth(q.startMonth);
  out += start ? `, from ${start} onwards.` : ".";
  // Derived from that same month, not asked separately: everything before this
  // month is catch-up, billed once at the client's own monthly rate.
  if (+q.behind > 0 && q.book === "managed") out += ` The ${q.behind} months from ${start} up to this one are catch-up, charged once at the same monthly rate.`;
  return out;
}

const euro = (n: number) => "€" + Math.round(n).toLocaleString("en-GB");

/** `YYYY-MM` for the month `back` months before now — 0 is this month. */
const monthKey = (back: number, now: Date = new Date()) => {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

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

/** Off-screen honeypot — a real visitor never sees it, a bot fills it in. */
const Q_HONEYPOT: React.CSSProperties = {
  position: "absolute", left: -9999, top: "auto", width: 1, height: 1, opacity: 0, pointerEvents: "none",
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
  const [hp, setHp] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<WebsiteQuoteResult | null>(null);
  // Any answer changed after sending re-opens the form: the quote on screen is
  // no longer the quote we emailed, so the visitor must be able to send again.
  const setQ = (patch: Partial<QState>) => {
    setQState((prev) => ({ ...prev, ...patch }));
    if (Object.keys(patch).some((k) => k !== "step")) setSent(null);
  };

  const step = q.step;
  const r = qCalc(q);
  // The client's own monthly rate, or null while the band is unanswered. Every
  // place that used to interpolate a figure reads this and says so when null,
  // rather than printing the entry band's number as if it were theirs.
  const bandRate = q.expenses === "" ? null : managedMonthly(q.entity === "sole" ? "sole" : "company", q.expenses);
  const bandLabel = prettyBand(q.expenses);
  /** Derived from the start month, never answered — see `catchUpMonthsFrom`. */
  const startBehind = +q.behind || 0;
  const catchUpEuro = q.expenses === "" || startBehind <= 0
    ? null
    : catchUpAmount(startBehind, q.entity === "sole" ? "sole" : "company", q.expenses, isPromoActive());

  const pill = (on: boolean) => ({ on });
  const opts = (list: [string, string, string][], key: keyof QState): Opt[] =>
    list.map(([k, label, sub]) => ({ key: k, label, sub: sub || "", pick: () => setQ({ [key]: k } as Partial<QState>), ...pill(q[key] === k) }));

  const STEP_META: [string, string, (() => Opt[]) | null][] = [
    ["What does the company do?", "Some sectors carry heavier checks on our side. That is what moves the price — not the bookkeeping.", () => opts(QSECT.map((s) => [s[0], s[1], ""] as [string, string, string]), "sector")],
    ["Are these a company's books, or your own?", "It sets the bookkeeping price together with your monthly spend, which we ask next: from €" + BOOKKEEPING_FROM + " a month if you are self-employed, from €" + BOOKKEEPING_COMPANY + " for a company." + (q.entity === "company" ? " Then tell us the company's authorised share capital." : ""), () => MANAGED_ENTITY_OPTIONS.map((o) => ({ key: o.id, label: o.label, sub: o.sub, pick: () => setQ({ entity: o.id }), on: q.entity === o.id }))],
    ["About how much do you spend a month?", "Your monthly expenses are the money that leaves the business in a typical month — supplier bills, wages, rent, software, everything you spend. Exclude VAT, loan repayments, and transfers between your own accounts. New or seasonal business? Use your average over the last three months. It is what sets your bookkeeping price." + (bandRate == null || bandLabel == null ? " Pick a band and the figure appears here — we do not assume one for you." : " " + bandLabel + " works out at €" + bandRate + " a month for " + (q.entity === "sole" ? "a self-employed person" : "a company") + "."), () => EXPENSE_BANDS.map((b) => ({ key: b.id, label: b.label, sub: b.hint, pick: () => setQ({ expenses: b.id }), on: q.expenses === b.id }))],
    ["About how many transactions a month?", "A different question from your spend above: this one counts DOCUMENTS AND LINES — each invoice, receipt and bank line. A rough number is fine. It sets your VAT, tax-return and audit fees; it does not move the bookkeeping price.", () => opts(QTXN, "txn")],
    ["How many people on the payroll?", "Count directors who take a salary. Payroll is priced per person.", null],
    ["From which month do you need us?", "Pick the earliest month that still needs doing. Anything before this month is catch-up, charged at the same monthly rate — no premium, no cap — and the monthly fee runs from now on. One question, because the month you pick already tells us how far back to go.", null],
    ["Are you registered for VAT?", "Different registrations carry very different filing loads. Not sure? Pick the last option and we check the register for you.", () => QVATREG.map(([k, label, sub]) => ({ key: k, label, sub: sub || "", pick: () => setQ({ vatreg: k, vat: k === "none" ? "none" : "we" }), on: q.vatreg === k }))],
    ["How big is the company?", "Only matters if you need an audit. Small companies usually qualify for a lighter review instead.", () => opts(QSIZE, "size")],
    ["What do you need from us?", "Switch anything off that you handle yourself. The total updates as you click.", null],
    ["Your quote", "Everything below is itemised — nothing appears later that is not on this list.", null],
  ];

  const LAST_STEP = STEP_META.length - 1; // 8 — the quote step
  const stepTag = step === LAST_STEP ? "Your quote" : "Question " + Math.min(step + 1, LAST_STEP) + " of " + LAST_STEP;
  const isOpts = !!STEP_META[step][2];
  const stepOpts = isOpts ? STEP_META[step][2]!() : [];
  // Indices track STEP_META above; "Monthly spend" was inserted at 2 and
  // pushed everything after it down by one.
  const isEntity = step === 1;
  const isNum = step === 4;
  const isStart = step === 5;
  const isSvc = step === 8;
  const isQuote = step === LAST_STEP;

  // Bands and labels come straight from the pack — the same five rows the
  // registry fee table is keyed on, so a label can never describe a band we
  // do not price.
  const capOpts: Opt[] = CAPITAL_BANDS.map((c) => ({
    key: c.id, label: c.label, sub: c.note, on: (q.cap || "1500") === c.id, pick: () => setQ({ cap: c.id }),
  }));

  // Service rows for step 6 — amount labels read from the live calc.
  const lineAmt = (name: string) => {
    const m = r.mo.find((l) => l.n === name);
    if (m && m.v > 0) return euro(m.v) + " /mo";
    const y = r.yr.find((l) => l.n === name || l.n.indexOf(name) === 0);
    if (y && y.v > 0) return euro(y.v) + " /yr";
    return "—";
  };
  type SvcRow = { name: string; desc: string; amt: string; options: { key: string; label: string; on: boolean; pick: () => void }[] };
  const svc = (key: keyof QState, name: string, desc: string, list: [string, string][], amtName?: string): SvcRow => ({
    name, desc, amt: lineAmt(amtName || name),
    options: list.map(([k, label]) => ({ key: k, label, on: q[key] === k, pick: () => setQ({ [key]: k } as Partial<QState>) })),
  });
  let svcRows: SvcRow[] = [];
  if (isSvc) {
    svcRows = [
      svc("book", "Bookkeeping", "You send us the paperwork and we keep the books. There is no software-only option — a qualified accountant is on the file.", [["none", "Not needed"], ["managed", "Yes — you keep our books"]]),
    ];
    const sf = q.book !== "managed";
    svcRows.push(
      svc("pay", "Payroll", "Payslips, monthly employer filing, annual returns. Priced per person.", [["none", "No"], ["we", "Yes"]]),
      sf
        ? { name: "VAT returns — blocked", desc: "We only put our name to a return when we have worked the ledger. Switch bookkeeping on above and this unlocks.", amt: "—", options: [] }
        : svc("vat", "VAT returns", "Filed quarterly, billed monthly so you pay the same each time.", [["none", "No"], ["we", "Yes"]], q.vatreg === "art11" ? "VAT declaration" : "VAT returns"),
      svc("taxret", "Annual tax return", "Prepared once a year from the closed ledger.", [["none", "No"], ["we", "Yes"]]),
      // The assurance line is named conditionally (audit vs review engagement),
      // so its amount is looked up by either label rather than by one of them.
      {
        ...svc("assure", "Audit or review", "Most small companies qualify for a lighter review — we work out which applies. We cannot give assurance on books we keep ourselves; ask for both and the quote says so.", [["none", "No"], ["we", "Yes"]]),
        amt: lineAmt(qAuditIsReview(q) ? ASSURE_REVIEW_LABEL : ASSURE_AUDIT_LABEL),
      },
      svc("regoff", "Registered office", "Your company's official address, statutory post passed to you.", [["none", "No"], ["we", "Yes"]]),
    );
  }

  const quoteLines = r.refer ? [] : [
    ...r.mo.filter((l) => l.v > 0).map((l) => ({ n: l.n, e: l.e, v: euro(l.v) + " /mo" })),
    ...r.yr.filter((l) => l.v > 0).map((l) => ({ n: l.n, e: l.e, v: euro(l.v) + " /yr" })),
    ...r.one.filter((l) => l.v > 0).map((l) => ({ n: l.n, e: l.e, v: euro(l.v) + " once" })),
  ];

  // The live panel reads the SAME `qCalc` result as the quote step, so the two
  // can never quote differently. `panelDark` is the union of the three states
  // that withhold every figure.
  const panelDark = r.refer || r.conflict || r.noExpenses;
  const panelBig = r.refer ? "Let's talk first" : r.conflict ? "One or the other" : r.noExpenses ? "Tell us your spend" : euro(r.moTot);
  const panelNote = r.refer
    ? "We price most companies on the spot. Yours needs a short call with a director first — usually the same day."
    : r.conflict
      ? "We cannot give assurance on books we keep ourselves. Tell us which of the two is ours and every figure fills in."
      : r.noExpenses
        ? "Your monthly spend sets the bookkeeping price. Pick a band on “Monthly spend” and every figure fills in — we will not guess it."
        : "Updates as you answer. Nothing is gated behind an email. KYC before work starts. All fees exclude VAT.";

  // Capture. The basket is what the backend reprices, so the visitor gets a
  // real quotation record rather than an empty contact form.
  const items = isQuote && !r.refer ? qItems(q) : [];
  const independence = qIndependence(q);
  const independenceText = independenceNotice(independence.route);
  const startOk = /^\d{4}-(0[1-9]|1[0-2])$/.test(q.startMonth);
  // No start month, or both sides of the independence rule at once → the quote
  // is not sendable. Both are stated on the form rather than silently disabling
  // the button, so the visitor knows what to fix.
  const canSend =
    items.length > 0 &&
    startOk &&
    independence.route !== "conflict" &&
    name.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const send = async () => {
    if (!canSend || sending) return;
    // Honeypot: only a bot fills a field it cannot see. Rejected before submit,
    // with the same acknowledgement a person gets so it learns nothing.
    if (hp.trim()) {
      setSent({ status: "received", message: "We've got your details — your quote follows by email." });
      return;
    }
    setSending(true);
    const result = await submitWebsiteQuotation({
      name, email, items, risk: qRisk(q),
      serviceStartDate: q.startMonth,
      sourceDetail: "a4-homepage",
    });
    setSent(result);
    // Conversion on a CONFIRMED backend result only. `error` covers a 502 and a
    // rejected fetch alike — nothing was written, so nothing is reported. The
    // honeypot branch above returns before this and never counts either.
    if (result.status === "quoted" || result.status === "received") {
      trackConversion("quote_request_home_calculator");
    }
    setSending(false);
  };

  const next = () => setQ(qAdvance(q, LAST_STEP));

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

        {/* The "Only software" / "Software + accountants" mode switch is gone
            with pack mt-2026-08-14-managed. There is one bookkeeping service. */}

        <Reveal delay={100}>
          <div className="lqc-grid" style={{ margin: "32px auto 0", display: "grid", gridTemplateColumns: "230px 1fr 320px", gap: 24, alignItems: "start", maxWidth: 1180, width: "100%" }}>
            {/* step rail */}
            <div className="lqc-rail" style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left", position: "sticky", top: 84 }}>
              {QSTEPS.map((label, i) => {
                const c = railBtn(i);
                return (
                  <button key={label} type="button" onClick={() => setQ({ step: i })} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: "var(--a4-r-md)",
                    border: "none", background: c.bg, cursor: "pointer", fontFamily: "var(--a4-font-body)", textAlign: "left",
                    transition: "background .2s ease",
                  }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: "var(--a4-r-full)", display: "inline-flex", alignItems: "center",
                      justifyContent: "center", flex: "none", background: c.dotBg, color: c.dotFg,
                      fontVariantNumeric: "tabular-nums", fontSize: 10.5, fontWeight: 600, transition: "background .2s ease, color .2s ease",
                    }}>{"0" + (i + 1)}</span>
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
              </div>

              {isOpts && <OptPills opts={stepOpts} />}

              {/* Share capital exists only to price the MBR annual return, which is a
                  company filing. Asking a sole trader for it is asking a question with
                  no answer, about a fee they will not be charged — so it follows the
                  same predicate as the line itself. */}
              {isEntity && q.entity === "company" && (
                <div style={{ border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "14px 16px" }}>
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, color: "var(--a4-ink)" }}>Authorised share capital</div>
                  <div style={{ marginTop: 2, fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-mute)" }}>
                    Sets the MBR registry fee on your annual return (electronic rates) — passed through at cost.
                  </div>
                  <div style={{ marginTop: 10 }}><OptPills opts={capOpts} /></div>
                </div>
              )}

              {isStart && (
                <div style={{ border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "14px 16px" }}>
                  <label htmlFor="lqc-start" style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, color: "var(--a4-ink)" }}>
                    Earliest month that still needs doing
                  </label>
                  <div style={{ marginTop: 2, fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-mute)" }}>
                    Required — the price depends on it, so we do not guess. Already up to date? Pick this month.
                  </div>
                  <input
                    id="lqc-start"
                    type="month"
                    value={q.startMonth}
                    onChange={(e) => setQ({ startMonth: e.target.value, behind: String(catchUpMonthsFrom(e.target.value)) })}
                    style={{ ...Q_INPUT, marginTop: 10, flex: "0 1 220px" }}
                  />
                  {/* The split the visitor is buying, in their own months and
                      their own rate — said HERE rather than asked as a second
                      question, because the month they just picked is the whole
                      answer to it. */}
                  {startOk ? (
                    <div style={{ marginTop: 12, padding: "11px 14px", borderRadius: 10, background: NOTE_STYLE.info.bg, border: "1px solid " + NOTE_STYLE.info.bc, color: NOTE_STYLE.info.fg, fontFamily: "var(--a4-font-body)", fontSize: 12, lineHeight: 1.6 }}>
                      {startBehind > 0 ? (
                        <>
                          <div>
                            <strong>{formatStartMonth(q.startMonth)} to {formatStartMonth(monthKey(1))}</strong> — {startBehind} {startBehind === 1 ? "month" : "months"} of catch-up
                            {catchUpEuro != null ? `, ${euro(catchUpEuro)} charged once` : bandRate == null ? ", at your own monthly rate once you tell us your monthly spend" : ""}.
                          </div>
                          <div style={{ marginTop: 4 }}>Then ongoing from <strong>{formatStartMonth(monthKey(0))}</strong>{bandRate == null ? "" : `, €${bandRate} a month`}. No catch-up premium, no cap.</div>
                        </>
                      ) : (
                        <>Nothing to catch up — we pick the books up at <strong>{formatStartMonth(q.startMonth)}</strong> and keep them from there.</>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginTop: 8, fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "#8A6100" }}>
                      Pick a month before we can price this.
                    </div>
                  )}
                </div>
              )}

              {isNum && (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <input type="range" min={0} max={50} step={1} value={q.head} onChange={(e) => setQ({ head: +e.target.value })} aria-label="People on payroll" style={{ flex: 1, accentColor: "var(--a4-primary)", cursor: "pointer" }} />
                  <span style={{ minWidth: 90, textAlign: "right", fontFamily: "var(--a4-font-body)", fontVariantNumeric: "tabular-nums", fontSize: 14, fontWeight: 600, color: "var(--a4-ink)" }}>{q.head + (q.head === 1 ? " person" : " people")}</span>
                </div>
              )}

              {isSvc && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {svcRows.map((row) => (
                    <div key={row.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px 16px", flexWrap: "wrap", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "12px 16px" }}>
                      <div style={{ minWidth: 170, flex: 1 }}>
                        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--a4-ink)" }}>{row.name}</div>
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
                  {/* Said here as well as on the quote step: switching the
                      assurance row on next to the bookkeeping blanks every
                      amount in the list above, and a column of dashes with no
                      reason given reads as a bug. */}
                  {r.conflict && (
                    <p role="note" style={{ margin: "2px 0 0", padding: "11px 14px", borderRadius: 10, fontFamily: "var(--a4-font-body)", fontSize: 12, lineHeight: 1.55, background: NOTE_STYLE.warn.bg, color: NOTE_STYLE.warn.fg, border: "1px solid " + NOTE_STYLE.warn.bc }}>
                      The bookkeeping and the audit or review cannot both be ours — we cannot give assurance on books we keep ourselves. That is why the amounts have gone blank. Switch one of the two off, or carry on and the quote step gives you the choice.
                    </p>
                  )}
                  {/* Same reason the conflict note exists: a column of dashes
                      with no explanation reads as a bug, not as a question. */}
                  {r.noExpenses && (
                    <p role="note" style={{ margin: "2px 0 0", padding: "11px 14px", borderRadius: 10, fontFamily: "var(--a4-font-body)", fontSize: 12, lineHeight: 1.55, background: NOTE_STYLE.warn.bg, color: NOTE_STYLE.warn.fg, border: "1px solid " + NOTE_STYLE.warn.bc }}>
                      The amounts are blank because we do not know your monthly spend yet — it is what sets the bookkeeping price. Go back to “Monthly spend”, pick a band, and every figure here fills in straight away.
                    </p>
                  )}
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
                  <p style={{ margin: "14px 0 0", fontFamily: "var(--a4-font-body)", fontSize: 12.5, lineHeight: 1.6, color: "var(--a4-body)" }}>
                    {r.refer
                      ? "We price most sectors instantly. This one needs a short conversation with a director before we put a number to it — usually the same day."
                      : r.conflict
                        ? "Nothing is priced yet. Tell us which of the two is ours and the itemised quote appears here, in full, straight away."
                        : /* B1: a DIFFERENT sentence from both of the above. The
                             band is missing, which is neither a sector problem
                             nor an independence problem — it is one unanswered
                             question, and saying which one is the whole fix. */
                          r.noExpenses
                          ? "Nothing is priced yet. Go back to “Monthly spend” and pick a band — it is what sets your bookkeeping price, and we will not guess it for you."
                          : qSummarise(q)}
                  </p>
                  {(r.notes || []).map(([tone, text], i) => {
                    const s = NOTE_STYLE[tone] || NOTE_STYLE.info;
                    return <p key={i} style={{ margin: "10px 0 0", padding: "11px 14px", borderRadius: 10, fontFamily: "var(--a4-font-body)", fontSize: 12, lineHeight: 1.55, background: s.bg, color: s.fg, border: "1px solid " + s.bc }}>{text}</p>;
                  })}
                  {/* The independence consequence, said before they send —
                      not discovered later. Same words as every other surface. */}
                  {independenceText && (
                    <p
                      role="note"
                      style={{
                        margin: "10px 0 0", padding: "11px 14px", borderRadius: 10,
                        fontFamily: "var(--a4-font-body)", fontSize: 12, lineHeight: 1.55,
                        ...(independence.route === "conflict" ? NOTE_STYLE.warn : NOTE_STYLE.info),
                        background: (independence.route === "conflict" ? NOTE_STYLE.warn : NOTE_STYLE.info).bg,
                        color: (independence.route === "conflict" ? NOTE_STYLE.warn : NOTE_STYLE.info).fg,
                        border: "1px solid " + (independence.route === "conflict" ? NOTE_STYLE.warn : NOTE_STYLE.info).bc,
                      }}
                    >
                      {independenceText}
                    </p>
                  )}
                  {/* The way out, on the spot. The default wizard path lands on
                      the conflict (managed books + a review engagement), so a
                      greyed-out button with nothing next to it would be where
                      most visitors stop. One tap drops either side of the rule
                      and the quote becomes sendable immediately. */}
                  {independence.route === "conflict" && (
                    <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 10, background: NOTE_STYLE.info.bg, border: "1px solid " + NOTE_STYLE.info.bc }}>
                      <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 600, color: NOTE_STYLE.info.fg }}>Which one is ours?</div>
                      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button type="button" onClick={() => setQ({ assure: "none" })} style={svcPill(true)}>Keep the bookkeeping with us</button>
                        <button type="button" onClick={() => setQ({ book: "none", vat: "none" })} style={svcPill(true)}>Take the audit or review with us</button>
                      </div>
                      <p style={{ margin: "10px 0 0", fontFamily: "var(--a4-font-body)", fontSize: 11.5, lineHeight: 1.55, color: NOTE_STYLE.info.fg }}>
                        Pick one and this quote can be sent straight away. Not sure which? Ask for a call instead and we work it out with you.
                      </p>
                    </div>
                  )}
                  {r.refer ? (
                    <div style={{ marginTop: 16, alignSelf: "flex-start" }}>
                      <Button variant="dark" size="sm" href="/contact">Request a call <Icon name="arrow-right" size={14} color="#fff" /></Button>
                    </div>
                  ) : sent ? (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--a4-hairline-light)" }}>
                      <p style={{ margin: 0, fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, lineHeight: 1.55, color: "var(--a4-ink)" }}>{sent.message}</p>
                      {sent.status === "quoted" && (
                        <div style={{ marginTop: 12 }}>
                          <Button variant="dark" size="sm" href={sent.portalHref} target="_blank">Create your account <Icon name="arrow-right" size={14} color="#fff" /></Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--a4-hairline-light)" }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Your name" placeholder="Your name" autoComplete="name" style={Q_INPUT} />
                        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" aria-label="Work email" placeholder="Work email" autoComplete="email" style={Q_INPUT} />
                      </div>
                      <input value={hp} onChange={(e) => setHp(e.target.value)} name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={Q_HONEYPOT} />
                      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <Button variant="dark" size="sm" onClick={send} style={{ opacity: canSend && !sending ? 1 : 0.55, pointerEvents: canSend && !sending ? "auto" : "none" }}>
                          {sending ? "Sending your quote…" : "Send me this quote"}
                          {!sending && <Icon name="arrow-right" size={14} color="#fff" />}
                        </Button>
                        <Button variant="soft" size="sm" href="/contact">Prefer to talk?</Button>
                      </div>
                      {!startOk && (
                        <p style={{ margin: "10px 0 0", fontFamily: "var(--a4-font-body)", fontSize: 11.5, lineHeight: 1.5, color: "#8A6100" }}>
                          Go back to “When we start” and pick a month — we will not price a quote without it.
                        </p>
                      )}
                      {r.noExpenses && (
                        <p style={{ margin: "10px 0 0", fontFamily: "var(--a4-font-body)", fontSize: 11.5, lineHeight: 1.5, color: "#8A6100" }}>
                          Go back to “Monthly spend” and pick a band — it is what sets your bookkeeping price, and we will not guess it.
                        </p>
                      )}
                    </div>
                  )}
                  <p style={{ margin: "10px 0 0", fontFamily: "var(--a4-font-body)", fontSize: 11, color: "var(--a4-mute)" }}>KYC required before work starts. All fees exclude VAT.</p>
                </div>
              )}

              {/* footer: nav + running total */}
              <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--a4-hairline-light)", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                {!isQuote && (
                  <>
                    <button type="button" onClick={() => setQ({ step: Math.max(0, step - 1) })} disabled={step === 0} style={{
                      height: 36, padding: "0 16px", borderRadius: "var(--a4-r-full)", border: "1px solid var(--a4-hairline-light)",
                      background: "transparent", color: "var(--a4-mute)", fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600,
                      cursor: step === 0 ? "default" : "pointer", opacity: step === 0 ? 0.5 : 1,
                    }}>Back</button>
                    <button type="button" onClick={next} style={{
                      height: 36, padding: "0 18px", borderRadius: "var(--a4-r-full)", border: "1px solid var(--a4-ink)",
                      background: "var(--a4-ink)", color: "#fff", fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                    }}>{step === LAST_STEP - 1 ? "See my quote" : "Next"}</button>
                  </>
                )}
                <span style={{ marginLeft: "auto", display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                  {/* The running total is a figure too — it must go dark on a
                      conflict as well, or the quote step shows nothing while
                      the footer still quotes a monthly price. */}
                  {/* The running total is a figure too, so it goes dark on the
                      missing band exactly as it does on a conflict — otherwise
                      the quote step shows nothing while the footer still quotes
                      a monthly price for a band nobody picked. */}
                  <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--a4-mute)" }}>{r.refer || r.conflict || r.noExpenses ? "" : "Every month"}</span>
                  <span style={{ fontFamily: "var(--a4-font-body)", fontVariantNumeric: "tabular-nums", fontSize: 18, fontWeight: 600, color: "var(--a4-ink)" }}>{r.refer ? "Let's talk first" : r.conflict ? "One or the other" : r.noExpenses ? "Tell us your spend" : euro(r.moTot)}</span>
                  {!r.refer && !r.conflict && !r.noExpenses && r.yrTot > 0 && <span style={{ fontFamily: "var(--a4-font-body)", fontVariantNumeric: "tabular-nums", fontSize: 12.5, color: "var(--a4-mute)" }}>{euro(r.yrTot) + " /yr"}</span>}
                  {!r.refer && !r.conflict && !r.noExpenses && r.oneTot > 0 && <span style={{ fontFamily: "var(--a4-font-body)", fontVariantNumeric: "tabular-nums", fontSize: 12.5, color: "var(--a4-mute)" }}>{euro(r.oneTot) + " once"}</span>}
                </span>
              </div>
            </div>

            {/* live price panel — the audit calculator's third column, brought
                to the homepage. Every figure here is `qCalc`'s, so the panel
                cannot show a price the quote step would contradict: it is the
                same object, rendered twice. It goes dark on exactly the three
                states that withhold figures (referral sector, the independence
                conflict, no spend band), because a running total left showing
                a number while the quote step shows none is the bug that makes
                a visitor believe the higher of the two. */}
            <div className="lqc-panel" style={{ background: "#000", borderRadius: "var(--a4-r-lg)", padding: "clamp(22px,3vw,30px)", color: "#fff", position: "sticky", top: 84, textAlign: "left" }}>
              <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--a4-stone)" }}>
                {panelDark ? "Your price" : "Every month"}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontVariantNumeric: "tabular-nums", fontSize: panelDark ? 22 : 38, letterSpacing: panelDark ? "-.4px" : "-1.5px", lineHeight: 1.15 }}>{panelBig}</span>
                {!panelDark && <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "var(--a4-on-dark-mute)" }}>/ month</span>}
              </div>
              {!panelDark && (r.yrTot > 0 || r.oneTot > 0) && (
                <div style={{ marginTop: 8, display: "flex", gap: 14, flexWrap: "wrap", fontFamily: "var(--a4-font-body)", fontVariantNumeric: "tabular-nums", fontSize: 12.5, color: "var(--a4-on-dark-mute)" }}>
                  {r.yrTot > 0 && <span>{euro(r.yrTot)} / year</span>}
                  {r.oneTot > 0 && <span>{euro(r.oneTot)} once</span>}
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
                <Button variant="primary" size="md" onClick={() => setQ({ step: LAST_STEP })} style={{ width: "100%", marginTop: 18 }}>
                  See the full quote <Icon name="arrow-right" size={16} color="#000" />
                </Button>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <p style={{ margin: "28px auto 0", textAlign: "center", fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-on-dark-mute)" }}>The price appears instantly — nothing is gated behind an email. All fees exclude VAT.</p>
        </Reveal>
      </Container>
    </section>
  );
}
