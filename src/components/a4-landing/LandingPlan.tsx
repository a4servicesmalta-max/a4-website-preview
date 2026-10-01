"use client";

import React, { useState } from "react";
import { Button, Icon, Container, Eyebrow } from "@/components/a4-landing/Primitives";
import { MUTED_GLOW, gradText } from "@/components/fx/primitives";
import { MANAGED_CAVEAT, MANAGED_CATCHUP_NOTE, MANAGED_SOLE, MANAGED_COMPANY } from "@/data/a4ManagedOffer";
import {
  VAT_MONTHLY, VAT_RULES, TAX_RETURN_FROM,
  PAYROLL_ENTRY_RATE, payrollFee, PRICING_VAT_NOTE,
  LAUNCH_PROMO, isPromoActive,
  catchUpAmount, catchUpLabel, fullMonthlyBookkeeping, EXPENSE_BANDS,
  type ManagedEntity, type ExpenseBand,
} from "@/data/a4QuotePack";
import { catchUpMonthsFrom } from "@/lib/accounting-fee";
import { INDEPENDENCE_BOOKKEEPING, flagsForServiceSelection, type IndependenceFlags } from "@/lib/independence";
// Confirm whose books + add-ons → live monthly price → two exits, both of
// which start a CONVERSATION: (1) request a proposal, (2) book a 30-minute call.
// A4 is not self-serve — we meet the client, then we open the account.


// One managed price per entity — see src/data/a4ManagedOffer.ts. The
// four-rung software ladder this used to render is retired: its bottom rung
// WAS the software-only tier the owner removed.
const LP_MANAGED: Record<"company" | "personal", { name: string; price: number; blurb: string; detail: string }> = {
  company: { name: MANAGED_COMPANY.name, price: MANAGED_COMPANY.price, blurb: MANAGED_COMPANY.tagline, detail: MANAGED_COMPANY.detail },
  personal: { name: MANAGED_SOLE.name, price: MANAGED_SOLE.price, blurb: MANAGED_SOLE.tagline, detail: MANAGED_SOLE.detail },
};
/**
 * Human label for an expenses band, for the lead email and the picker.
 * "not given" when unanswered — never the entry band's label, which is what
 * the old `?? EXPENSE_BANDS[0]` fallback would have put in the lead email.
 */
const LP_EXPENSE_LABEL = (id: ExpenseBand | "") =>
  EXPENSE_BANDS.find((b) => b.id === id)?.label ?? "not given";

// VAT returns — priced the way quote pack mt-2026-08-01 prices them: a monthly
// fee set by transaction volume, whatever the filing frequency. Art. 11 small-
// exempt businesses instead pay one flat yearly declaration.
const LP_VAT = {
  low: { label: "Up to 20 / mo", fee: VAT_MONTHLY["1-20"] },
  mid: { label: "20 to 60 / mo", fee: VAT_MONTHLY["21-60"] },
  high: { label: "60 to 150 / mo", fee: VAT_MONTHLY["61-150"] },
};

export type AnnualItemId = "accounts" | "tax";

/**
 * Once-a-year items (billed annually, not monthly). Both are "from" — the
 * final fee depends on size and complexity.
 *
 * M3 — THE STATUTORY AUDIT ITEM IS DELIBERATELY GONE. Do not put it back.
 *
 * Bookkeeping is not optional on this page: `lpCalc` puts the managed
 * bookkeeping line in every basket it prices, and the submission has always
 * declared `services: ["Bookkeeping"]`. So A4 can never be the auditor of
 * anyone who buys from here — an audit toggle was an offer we are barred by
 * IESBA from honouring. Worse, it had no independence path at all: the toggle
 * simply summed the audit fee into the displayed "€X/mo + €Y/yr" total, while
 * the homepage wizard, /pricing, /quote and /api/quotation all refuse that
 * exact basket unpriced. This page was the one survivor of that sweep.
 *
 * Removing the item is the fix that matches the page's purpose rather than
 * routing it to the conflict UI: on a page where bookkeeping cannot be
 * switched off, a conflict screen would be a dead end with no way out except
 * un-ticking the audit again. Visitors who need assurance are told what
 * happens instead — INDEPENDENCE_BOOKKEEPING is rendered on the page and says
 * A4 introduces an independent firm for the audit or review.
 */
export const LP_ANNUAL_ITEMS: Record<"company" | "personal", { id: AnnualItemId; label: string; sub: string; fee: number; from: boolean }[]> = {
  company: [
    { id: "accounts", label: "Annual financial statements", sub: "Year-end statutory accounts", fee: 300, from: true },
    { id: "tax", label: "Corporate tax return", sub: "Prepared & filed with the CFR", fee: TAX_RETURN_FROM, from: true },
  ],
  personal: [
    { id: "tax", label: "Personal tax return", sub: "Year-end income tax return, prepared & filed", fee: 250, from: true },
  ],
};

/* -------------------------------------------------------------------------- */
/* The arithmetic, as a pure function                                          */
/* -------------------------------------------------------------------------- */

export type LPState = {
  entity: "company" | "personal";
  /** `""` = not answered. There is NO default band — see LP_INIT. */
  expenses: ExpenseBand | "";
  /** `YYYY-MM`, or `""` while unanswered. */
  startMonth: string;
  catchUpMonths: number;
  vat: boolean;
  vatFreq: keyof typeof LP_VAT;
  payroll: boolean;
  emps: number;
  annualSel: Record<AnnualItemId, boolean>;
};

/**
 * B1 — nothing about the price is pre-answered.
 *
 * `expenses` used to default to "10-25k" and `startMonth` to `nextMonth()`, so
 * a visitor who touched neither still saw a complete monthly figure and could
 * book a call against it. The band id was valid, so nothing downstream could
 * catch it.
 */
export const LP_INIT: LPState = {
  entity: "company",
  expenses: "",
  startMonth: "",
  catchUpMonths: 0,
  vat: true,
  vatFreq: "mid",
  payroll: false,
  emps: 2,
  annualSel: { accounts: true, tax: true },
};

/** This component's own entity vocabulary → the pack's. */
const LP_ENTITY: Record<"company" | "personal", ManagedEntity> = { company: "company", personal: "sole" };

export type LPQuote = {
  priced: boolean;
  reason: "ok" | "no-expenses";
  /** The client's own monthly bookkeeping rate, or null when unanswered. */
  base: number | null;
  lines: { k: string; v: number }[];
  /** Before the launch discount. */
  grossMonthly: number | null;
  /** After it, if it is running. */
  monthly: number | null;
  annualFee: number;
  /** One-off. Never discounted, never capped. */
  catchUp: number;
  catchUpLabel: string | null;
  promoApplied: boolean;
  independence: IndependenceFlags;
  selectedAnnual: { id: AnnualItemId; label: string; sub: string; fee: number; from: boolean }[];
};

/**
 * `now` is injectable so the promo window can be pinned in tests — otherwise
 * every total flips on 1 September 2026.
 */
export function lpCalc(s: LPState, now: Date = new Date()): LPQuote {
  const packEntity = LP_ENTITY[s.entity];
  const isCompany = s.entity === "company";

  // Bookkeeping is always in this basket, so A4 can never be the auditor of a
  // client who buys from this page. Said on the page, and carried on the lead.
  const independence = flagsForServiceSelection(["Bookkeeping"]);

  const annualItems = LP_ANNUAL_ITEMS[s.entity];
  const selectedAnnual = annualItems.filter((it) => s.annualSel[it.id]);
  const annualFee = selectedAnnual.reduce((t, it) => t + it.fee, 0);

  // M8: NO `?? plan.price`. An unknown or missing band defaults DOWN to the
  // entry band, which the pack docblock forbids in the strongest terms —
  // defaulting down loses money and is invisible. Null means unpriced.
  // mt-2026-08-26d-banks: this widget asks neither the transaction band nor
  // the account count, so it quotes the low-volume ONE-account figure — and
  // that one account is priced, so `base` here is the all-in monthly (spend
  // band + one bank account), the same number the "from" headlines carry.
  const base = s.expenses === "" ? null : fullMonthlyBookkeeping(packEntity, s.expenses, "1-20", 1);
  if (base == null) {
    return {
      priced: false, reason: "no-expenses", base: null, lines: [],
      grossMonthly: null, monthly: null, annualFee, catchUp: 0, catchUpLabel: null,
      promoApplied: false, independence, selectedAnnual,
    };
  }

  const vatFee = s.vat ? LP_VAT[s.vatFreq].fee : 0;
  // Marginal tiers (findings A2 + A3) — no flat whole-book rate any more.
  const payFee = isCompany && s.payroll ? payrollFee(s.emps) : 0;

  // `base` is proved non-null above, so the band is a real one from here down.
  const expenses = s.expenses as ExpenseBand;

  const lines = ([
    { k: `Managed bookkeeping — ${LP_MANAGED[s.entity].name}`, v: base },
    s.vat && { k: `VAT returns · ${LP_VAT[s.vatFreq].label.toLowerCase()}`, v: vatFee },
    isCompany && s.payroll && { k: `Payroll · ${s.emps} employee${s.emps > 1 ? "s" : ""}`, v: payFee },
  ] as ({ k: string; v: number } | false)[]).filter((l): l is { k: string; v: number } => Boolean(l));

  const grossMonthly = base + vatFee + payFee;
  // M9: this page ignored the launch promo entirely while the homepage wizard,
  // /pricing and the estimator all discounted the monthly — so the booking
  // email quoted full price to a visitor who had seen 25% off two pages
  // earlier. Same terms as every sibling surface: monthly yes, one-offs never.
  const promoApplied = isPromoActive(now);
  const monthly = promoApplied ? Math.round(grossMonthly * (1 - LAUNCH_PROMO.pct)) : grossMonthly;

  // One-off, at the same monthly rate, never capped — and inside the promo
  // window the quarter comes off at this line, in the label (finding C3).
  // This widget asks neither the transaction band nor the account count —
  // quoted at the low-volume single-account floor; the full quote prices both.
  const catchUp = s.catchUpMonths > 0 ? (catchUpAmount(s.catchUpMonths, packEntity, expenses, "1-20", 1, promoApplied) ?? 0) : 0;

  return {
    priced: true, reason: "ok", base, lines,
    grossMonthly, monthly, annualFee, catchUp,
    catchUpLabel: s.catchUpMonths > 0 ? catchUpLabel(s.catchUpMonths, packEntity, expenses, "1-20", 1, promoApplied) : null,
    promoApplied, independence, selectedAnnual,
  };
}

/* -------------------------------------------------------------------------- */
/* The look — the A4 design language (the quotation's "Build your quote" and   */
/* its document totals; see src/app/q/[id]/QuotationLanding.tsx).             */
/* -------------------------------------------------------------------------- */

const INK = "#09090B";
const INDIGO = "#4F55F1";
const HAIR = "#E4E4E7";
const DISPLAY = "var(--a4x-display)";
const BODY = "var(--a4x-body)";

/* Hover, focus and placeholder states can't be inline — scoped classes. */
const LP_CSS = `
.lp-input::placeholder { color: #A1A1AA; }
.lp-input:focus { border-color: #4F55F1 !important; box-shadow: 0 0 0 3px rgba(79,85,241,.14); }
.lp-pill[aria-pressed="false"]:hover { border-color: #A1A1AA !important; }
.lp-seg[aria-pressed="false"]:hover { color: #09090B !important; }
.lp-pill:focus-visible, .lp-seg:focus-visible, .lp-switch:focus-visible, .lp-round:focus-visible { outline: 3px solid rgba(79,85,241,.55); outline-offset: 2px; }
`;

type StepperProps = { value: number; set: (v: number) => void; min?: number; max?: number };
/** Round hairline pills either side of the figure. */
export function LPStepper({ value, set, min = 1, max = 10 }: StepperProps) {
  const btn: React.CSSProperties = { width: 36, height: 36, padding: 0, borderRadius: 999, display: "grid", placeItems: "center", cursor: "pointer", background: "#FFFFFF", border: "1px solid " + HAIR, color: INK };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button type="button" aria-label="decrease" className="lp-round" onClick={() => set(Math.max(min, value - 1))} style={btn}><Icon name="minus" size={15} color={INK} /></button>
      <span style={{ minWidth: 24, textAlign: "center", fontFamily: DISPLAY, fontWeight: 600, fontSize: 20, letterSpacing: "-0.02em", color: INK, fontVariantNumeric: "tabular-nums" }}>{value}</span>
      <button type="button" aria-label="increase" className="lp-round" onClick={() => set(Math.min(max, value + 1))} style={btn}><Icon name="plus" size={15} color={INK} /></button>
    </div>
  );
}

type ToggleProps = { on: boolean; set: (v: boolean) => void; label?: string };
/** The design's 48×28 switch — indigo track when on, white knob, .35s expo. */
export function LPToggle({ on, set, label }: ToggleProps) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className="lp-switch" onClick={() => set(!on)} style={{
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

const lpEuro = (n: number) => "€" + n.toLocaleString();
/**
 * A price that may not exist yet. Renders an em dash rather than a number —
 * every figure on this page is withheld until the band is answered, so there
 * is nothing here for a visitor to anchor on.
 */
const lpEuroOr = (n: number | null) => (n == null ? "—" : lpEuro(n));

export function LandingPlan() {
  const [s, setS] = useState<LPState>(LP_INIT);
  const patch = (p: Partial<LPState>) => setS((prev) => ({ ...prev, ...p }));

  const [modal, setModal] = useState(false);
  const [booked, setBooked] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { entity, expenses, startMonth, catchUpMonths, vat, vatFreq, payroll, emps, annualSel } = s;
  const isCompany = entity === "company";
  // Switching to personal turns off company-only payroll.
  const setEntityAndSync = (e: "company" | "personal") => patch({ entity: e, ...(e === "personal" ? { payroll: false } : {}) });
  const toggleAnnual = (id: AnnualItemId) => patch({ annualSel: { ...annualSel, [id]: !annualSel[id] } });

  const packEntity = LP_ENTITY[entity];
  const plan = LP_MANAGED[entity];
  // All the arithmetic, in one pure function — see `lpCalc`. It carries the
  // M8 (no entry-band fallback), M9 (launch promo) and B1 (no default band)
  // fixes, and it is what the tests assert against.
  const q = lpCalc(s);
  const { base, lines, monthly, annualFee, selectedAnnual, independence, promoApplied } = q;
  const catchUpFee = q.catchUp;
  /** Required before anything is booked: both price drivers must be answered. */
  const startOk = /^\d{4}-(0[1-9]|1[0-2])$/.test(startMonth);
  const canBook = q.priced && startOk;

  const submit = async () => {
    if (!form.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setSubmitError("Enter your name and a valid email address.");
      return;
    }
    setSubmitting(true); setSubmitError("");
    const ref = "A4-" + crypto.randomUUID().slice(0, 6).toUpperCase();
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: `Bookkeeping call booking — ${form.name}`,
          message: [
            `Phone: ${form.phone}`,
            `Entity: ${entity}`,
            `Start month: ${startMonth || "not given"}`,
            `Monthly expenses: ${LP_EXPENSE_LABEL(expenses)}`,
            q.catchUpLabel ?? "No earlier months",
            // Degrades honestly: a lead that says "not priced" is worth far
            // more than one carrying a figure we never actually computed.
            monthly == null
              ? "Monthly total: not priced — monthly spend not given"
              : `Monthly total: ${lpEuro(monthly)}/mo${annualFee > 0 ? ` + ${lpEuro(annualFee)}/yr` : ""}${promoApplied ? " (launch discount applied)" : ""}`,
            `Reference: ${ref}`,
          ].join("\n"),
          context: "automated-bookkeeping-booking",
          // IESBA: this is a bookkeeping enquiry, so A4 cannot audit them.
          services: ["Bookkeeping"],
          auditEligible: independence.auditEligible,
          bookkeepingEligible: independence.bookkeepingEligible,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setBooked(ref);
    } catch {
      setSubmitError("Something went wrong booking your call. Please try again or email info@a4.com.mt.");
    } finally {
      setSubmitting(false);
    }
  };

  type Addon = { id: string; label: string; sub: string; on: boolean; set: (v: boolean) => void; fee: string; stepper?: boolean; freq?: boolean; emps?: boolean };
  // "Bank reconciliation · €15/account" is gone: this widget prices one bank
  // account inside the monthly figure; further accounts are priced by the
  // full quote (€40/mo plus 15% of the bookkeeping fee, each).
  const monthlyAddons = ([
    { id: "vat", label: "VAT returns", sub: `Every return filed with the CFR · art. 11 small-exempt is €${VAT_RULES.art11FlatYearly}/yr instead`, on: vat, set: (v: boolean) => patch({ vat: v }), fee: `€${LP_VAT[vatFreq].fee} / mo`, freq: true },
    isCompany && { id: "pay", label: "Payroll", sub: `FS5 submissions & payslips · flat €${PAYROLL_ENTRY_RATE}/head/mo, any team size`, on: payroll, set: (v: boolean) => patch({ payroll: v }), fee: `€${PAYROLL_ENTRY_RATE} / head / mo`, emps: true },
  ] as (Addon | false)[]).filter((a): a is Addon => Boolean(a));

  const fieldLabel: React.CSSProperties = { fontFamily: DISPLAY, fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.3, color: INK };
  const fieldSub: React.CSSProperties = { fontFamily: BODY, fontSize: 14, lineHeight: 1.55, color: "#52525B", marginTop: 4 };
  const kicker: React.CSSProperties = { fontFamily: BODY, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#71717A" };
  /** A row of the picker — a hairline above, like a row of the quote document. */
  const row: React.CSSProperties = { padding: "18px 0", borderTop: "1px solid " + HAIR };
  const lastRow: React.CSSProperties = { ...row, borderBottom: "1px solid " + HAIR };
  /** "01  Your bookkeeping" — the design's numbered eyebrow. */
  const stepHead = (n: string, label: string) => (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, fontFamily: DISPLAY, fontSize: 18, fontWeight: 600, letterSpacing: ".02em", color: "#52525B" }}>
      <span style={{ color: INDIGO }}>{n}</span>
      <span>{label}</span>
    </div>
  );
  const fieldInput: React.CSSProperties = { height: 52, padding: "0 16px", borderRadius: 14, border: "1px solid " + HAIR, background: "#FFFFFF", color: INK, fontFamily: DISPLAY, fontSize: 16, fontWeight: 500, outline: "none" };
  const PAD = "clamp(24px,3vw,32px)";

  return (
    <section id="pricing" style={{ position: "relative", background: MUTED_GLOW, color: INK, padding: "clamp(100px,13vw,180px) 0" }}>
      <style>{LP_CSS}</style>
      <Container>
        {/* Head — the design's "Build your quote": eyebrow, H2, then the lead. */}
        <div style={{ maxWidth: 880 }}>
          <div style={{ minWidth: 0 }}>
            <div data-fx="rise">
              <Eyebrow>Build your price</Eyebrow>
            </div>
            <h2 data-fx="rise" data-d="100" style={{ margin: "16px 0 0", fontFamily: DISPLAY, fontSize: "clamp(40px,5.6vw,92px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.02, color: INK }}>
              Build your <span style={{ ...gradText, paddingBottom: ".06em" }}>plan</span>
            </h2>
          </div>
          <p data-fx="rise" data-d="200" style={{ margin: "22px 0 0", maxWidth: 760, fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: "#52525B", textWrap: "pretty" }}>
            {`We keep your books — you send us the paperwork. ${MANAGED_CAVEAT} ${MANAGED_CATCHUP_NOTE} One agreed monthly price, no per-document fees, cancel anytime.`}
          </p>
        </div>

        <div className="lp-grid" style={{ marginTop: "clamp(48px,6vw,80px)", display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(0, 1fr)", gap: 24, alignItems: "start" }}>
          {/* picker — the white document panel */}
          <div data-fx="rise" data-d="120" style={{ minWidth: 0, background: "#FFFFFF", border: "1px solid " + HAIR, borderRadius: 28, boxShadow: "0 50px 120px rgba(9,9,11,.10)", padding: "clamp(24px,3.4vw,40px)", display: "flex", flexDirection: "column", gap: 36 }}>
            {/* entity toggle — the design's segmented switch */}
            <div>
              <div style={fieldLabel}>I&apos;m a…</div>
              <div role="group" aria-label="Company or personal" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 4, marginTop: 12, padding: 5, borderRadius: 999, background: "#F4F4F5", border: "1px solid " + HAIR }}>
                {([["company", "Company", "building-2"], ["personal", "Personal / sole trader", "user"]] as const).map(([id, label, icon]) => {
                  const on = entity === id;
                  return (
                    <button key={id} type="button" aria-pressed={on} className="lp-seg" onClick={() => setEntityAndSync(id)} style={{
                      minWidth: 0, minHeight: 46, padding: "6px 14px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      borderRadius: 999, cursor: "pointer", border: 0, textAlign: "center",
                      background: on ? INK : "transparent", color: on ? "#FFFFFF" : "#52525B",
                      fontFamily: DISPLAY, fontSize: 15, fontWeight: 600, lineHeight: 1.2, transition: "background .3s, color .3s",
                    }}>
                      <Icon name={icon} size={16} color={on ? "#FFFFFF" : "#52525B"} /> {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* the managed price for the chosen entity — one price, no ladder */}
            <div>
              {stepHead("01", "Your bookkeeping")}
              <div style={{ marginTop: 16, padding: "22px 22px 24px", borderRadius: 20, background: "#FAFAFA", border: "1px solid rgba(79,85,241,.45)", boxShadow: "0 24px 60px rgba(79,85,241,.12)" }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 20, letterSpacing: "-0.02em", lineHeight: 1.25, color: INK }}>Managed bookkeeping — {plan.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
                  <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 40, letterSpacing: "-0.04em", lineHeight: 1.1, paddingBottom: ".04em", fontVariantNumeric: "tabular-nums", ...(base == null ? { color: INK } : gradText) }}>{lpEuroOr(base)}</span>
                  <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: "#52525B" }}>/mo</span>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 12, fontFamily: DISPLAY, fontSize: 15, fontWeight: 600, color: INDIGO }}>
                  <span className="a4-bullet" style={{ marginTop: 7 }} />
                  A qualified accountant on the file
                </div>
                <div style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.55, color: "#52525B", marginTop: 6 }}>{plan.detail}</div>
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={row}>
                  <label htmlFor="lp-start" style={{ ...fieldLabel, display: "block" }}>From which month do you need us?</label>
                  <div style={fieldSub}>Required. Pick the earliest month that still needs doing — everything before this month is catch-up, and the monthly fee runs from now on.</div>
                  <input
                    id="lp-start"
                    type="month"
                    value={startMonth}
                    onChange={(e) => patch({ startMonth: e.target.value, catchUpMonths: catchUpMonthsFrom(e.target.value) })}
                    className="lp-input"
                    style={{ ...fieldInput, marginTop: 12, display: "block", width: "min(100%, 260px)" }}
                  />
                </div>

                <div style={row}>
                  <div style={fieldLabel}>About how much do you spend a month?</div>
                  <div style={fieldSub}>
                    Total money out — suppliers, wages, rent, everything. It is what sets the bookkeeping
                    price, and you already know it without counting anything.
                  </div>
                  <div role="group" aria-label="Monthly spend" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                    {EXPENSE_BANDS.map((b) => {
                      const on = expenses === b.id;
                      return (
                        <button key={b.id} type="button" aria-pressed={on} className="lp-pill" onClick={() => patch({ expenses: b.id })} style={{
                          minHeight: 42, padding: "0 16px", borderRadius: 999, cursor: "pointer",
                          border: "1px solid " + (on ? INK : HAIR), background: on ? INK : "#FFFFFF", color: on ? "#FFFFFF" : INK,
                          fontFamily: DISPLAY, fontSize: 14, fontWeight: 600, transition: "background .3s, color .3s, border-color .3s",
                        }}>{b.label}</button>
                      );
                    })}
                  </div>
                  {/* Nothing is pre-selected. Say what the blank means, or a
                      row of unfilled pills reads as a broken control. */}
                  {!expenses && (
                    <div style={{ display: "flex", gap: 10, marginTop: 12, fontFamily: BODY, fontSize: 14, fontWeight: 500, color: INDIGO }}>
                      <span className="a4-bullet" style={{ marginTop: 7 }} />
                      Pick a band and your price appears — we do not assume one for you.
                    </div>
                  )}
                </div>

                <div style={lastRow}>
                  {/* READ BACK, not asked. The chip row that used to sit
                     here asked for the same fact the start month above
                     already gives: a start month in the past IS the count
                     of earlier months. */}
                  <div style={fieldLabel}>Earlier months that still need doing</div>
                  <div style={fieldSub}>{MANAGED_CATCHUP_NOTE} Each one is {lpEuroOr(base)}.</div>
                  <div style={{ marginTop: 10, fontFamily: DISPLAY, fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums", color: INK }}>
                    {!startOk
                      ? "Pick a start month above and we work them out from it."
                      : catchUpMonths === 0
                        ? "None — we pick the books up at your start month."
                        : q.catchUpLabel ?? `${catchUpMonths} ${catchUpMonths === 1 ? "month" : "months"}, once your monthly spend is picked.`}
                  </div>
                </div>
              </div>

              {/* The independence consequence, before they book anything. */}
              <div role="note" style={{ marginTop: 18, padding: "16px 18px", borderRadius: 16, background: "rgba(79,85,241,.06)", border: "1px solid rgba(79,85,241,.2)" }}>
                <span style={{ display: "block", ...kicker, color: INDIGO }}>Independence</span>
                <span style={{ display: "block", marginTop: 6, fontFamily: BODY, fontSize: 14, lineHeight: 1.55, color: "#3F3F46" }}>{INDEPENDENCE_BOOKKEEPING}</span>
              </div>
            </div>

            {/* monthly add-ons */}
            <div>
              {stepHead("02", "Add monthly services")}
              <div style={{ marginTop: 14 }}>
                {monthlyAddons.map((a, i) => (
                  <div key={a.label} style={i === monthlyAddons.length - 1 ? lastRow : row}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={fieldLabel}>{a.label} <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, letterSpacing: 0, color: "#71717A" }}>· {a.fee}</span></div>
                        <div style={fieldSub}>{a.sub}</div>
                      </div>
                      <LPToggle on={a.on} set={a.set} label={a.label} />
                    </div>
                    {a.emps && payroll && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: 14, padding: "10px 12px 10px 16px", borderRadius: 16, background: "#FAFAFA", border: "1px solid " + HAIR }}>
                        <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: "#3F3F46" }}>Employees</span>
                        <LPStepper value={emps} set={(v) => patch({ emps: v })} min={1} max={50} />
                      </div>
                    )}
                    {a.freq && vat && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
                        <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: "#3F3F46" }}>Filing frequency</span>
                        <div role="group" aria-label="Filing frequency" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {Object.entries(LP_VAT).map(([k, v]) => {
                            const on = vatFreq === k;
                            return (
                              <button key={k} type="button" aria-pressed={on} className="lp-pill" onClick={() => patch({ vatFreq: k as keyof typeof LP_VAT })} style={{
                                height: 38, padding: "0 14px", borderRadius: 999, cursor: "pointer",
                                border: "1px solid " + (on ? INK : HAIR), background: on ? INK : "#FFFFFF", color: on ? "#FFFFFF" : "#3F3F46",
                                fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", transition: "background .3s, color .3s, border-color .3s",
                              }}>{v.label}</button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* once-a-year */}
            <div>
              {stepHead("03", "Once a year")}
              <div style={{ marginTop: 14 }}>
                {LP_ANNUAL_ITEMS[entity].map((it, i, all) => {
                  const on = !!annualSel[it.id];
                  return (
                    <div key={it.id} style={i === all.length - 1 ? lastRow : row}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={fieldLabel}>{it.label} <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, letterSpacing: 0, color: "#71717A" }}>· {it.from ? "from " : ""}{lpEuro(it.fee)} / year</span></div>
                          <div style={fieldSub}>{it.sub} — billed once a year, not monthly.</div>
                        </div>
                        <LPToggle on={on} set={() => toggleAnnual(it.id)} label={it.label} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* summary — the quote document's totals */}
          <aside className="a4-sum" data-fx="rise" data-d="220" style={{ position: "sticky", top: 96, minWidth: 0, background: "#FFFFFF", border: "1px solid " + HAIR, borderRadius: 28, boxShadow: "0 50px 120px rgba(9,9,11,.12)", overflow: "hidden", color: INK }}>
            <div style={{ padding: `${PAD} ${PAD} 22px` }}>
              <div style={kicker}>Your monthly price</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
                <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "clamp(46px,4.4vw,60px)", letterSpacing: "-0.04em", lineHeight: 1.05, paddingBottom: ".04em", fontVariantNumeric: "tabular-nums", ...(monthly == null ? { color: INK } : gradText) }}>{lpEuroOr(monthly)}</span>
                {q.priced && <span style={{ fontFamily: BODY, fontSize: 15, fontWeight: 500, color: "#52525B" }}>/ mo</span>}
              </div>
              {/* M9: the launch discount applies here exactly as it does on the
                  homepage wizard, /pricing and the estimator. This page ignored
                  it entirely, so a visitor who had seen 25% off two pages
                  earlier got a booking email quoting full price. */}
              {q.priced && promoApplied && q.grossMonthly != null && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 500, color: "#71717A", textDecoration: "line-through", fontVariantNumeric: "tabular-nums" }}>{lpEuro(q.grossMonthly)}</span>
                  <span style={{ height: 26, padding: "0 11px", display: "inline-flex", alignItems: "center", borderRadius: 999, background: "rgba(79,85,241,.1)", color: INDIGO, fontFamily: DISPLAY, fontSize: 12.5, fontWeight: 600 }}>
                    {Math.round(LAUNCH_PROMO.pct * 100)}% off
                  </span>
                </div>
              )}
              {!q.priced && (
                <p style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 14, lineHeight: 1.55, color: "#52525B" }}>
                  Tell us roughly what you spend a month and every figure here fills in. We do not guess it — the monthly spend is what sets the price.
                </p>
              )}
            </div>
            {lines.length > 0 && (
              <div style={{ padding: `0 ${PAD} 8px` }}>
                {lines.map((l) => (
                  <div key={l.k} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "12px 0", borderTop: "1px solid " + HAIR, fontFamily: BODY, fontSize: 14, lineHeight: 1.45 }}>
                    <span style={{ minWidth: 0, color: "#3F3F46" }}>{l.k}</span>
                    <span style={{ color: INK, fontWeight: 600, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{lpEuro(l.v)}/mo</span>
                  </div>
                ))}
              </div>
            )}
            {selectedAnnual.length > 0 && (
              <div style={{ padding: `16px ${PAD} 6px`, borderTop: "1px solid " + HAIR }}>
                <div style={kicker}>Once a year</div>
                {selectedAnnual.map((it) => (
                  <div key={it.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", padding: "10px 0 0", fontFamily: BODY, fontSize: 14, lineHeight: 1.45 }}>
                    <span style={{ minWidth: 0, color: "#3F3F46" }}>{it.label}</span>
                    <span style={{ color: INDIGO, fontWeight: 600, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{it.from ? "from " : ""}{lpEuro(it.fee)}/yr</span>
                  </div>
                ))}
                <div style={{ fontFamily: BODY, fontSize: 12.5, lineHeight: 1.5, color: "#71717A", margin: "10px 0 12px" }}>Billed once a year. Tax fees are estimates, confirmed after a quick review.</div>
              </div>
            )}
            {/* The one-off, shown where the client will actually be billed
                it, and never discounted — a one-off is not in the promo. */}
            {catchUpFee > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", padding: `14px ${PAD}`, borderTop: "1px solid " + HAIR, fontFamily: BODY, fontSize: 14 }}>
                <span style={{ color: "#3F3F46" }}>Earlier months</span>
                <span style={{ color: INK, fontWeight: 600, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{lpEuro(catchUpFee)} once</span>
              </div>
            )}
            <div style={{ padding: `22px ${PAD} ${PAD}`, borderTop: "1px solid " + HAIR, background: "#FAFAFA" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Button variant="dark" size="md" href="/contact" style={{ width: "100%" }}>Request information <Icon name="arrow-right" size={16} color="#fff" /></Button>
                {/* Inert until there is a price to book against: the modal
                    quotes the monthly figure back at the visitor and the lead
                    email repeats it, so booking without one would confirm a
                    plan nobody priced. */}
                <Button variant="outline-light" size="md" onClick={() => { if (canBook) { setBooked(null); setModal(true); } }} style={{ width: "100%", opacity: canBook ? 1 : 0.45, pointerEvents: canBook ? "auto" : "none" }}><Icon name="calendar" size={16} color={INK} /> Request a 30-minute call</Button>
                {!canBook && (
                  <span style={{ fontFamily: BODY, fontSize: 13, lineHeight: 1.5, fontWeight: 500, color: INDIGO, textAlign: "center" }}>
                    {!q.priced ? "Pick your monthly spend above and this unlocks." : "Pick the month we should start from and this unlocks."}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 8, marginTop: 16 }}>
                <Icon name="shield-check" size={14} color="#71717A" style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontFamily: BODY, fontSize: 12, lineHeight: 1.5, color: "#71717A" }}>Price agreed before we start · reviewed by a licensed audit firm · service begins upon KYC approval · {PRICING_VAT_NOTE}</span>
              </div>
            </div>
          </aside>
        </div>
      </Container>

      {/* booking modal */}
      {modal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(9,9,11,.55)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div role="dialog" aria-modal="true" aria-labelledby="books-call-title" style={{ background: "#FFFFFF", border: "1px solid " + HAIR, borderRadius: 28, width: "100%", maxWidth: 460, maxHeight: "calc(100vh - 48px)", overflowY: "auto", padding: "clamp(24px,3.4vw,36px)", boxShadow: "0 50px 120px rgba(9,9,11,.28)", color: INK }}>
            {booked ? (
              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: 999, background: "rgba(79,85,241,.1)", display: "grid", placeItems: "center", margin: "0 auto 18px" }}><Icon name="check" size={26} color={INDIGO} stroke={2.5} /></div>
                <div id="books-call-title" style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 26, letterSpacing: "-0.03em", lineHeight: 1.15 }}>Call request received</div>
                <div style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: "#52525B", margin: "10px 0 0" }}>Thanks, {form.name.split(" ")[0]}. We&apos;ll confirm your 30-minute call by email at <strong style={{ color: INK }}>{form.email}</strong> within 2 business hours.</div>
                <div style={{ fontFamily: BODY, fontSize: 13, color: "#71717A", marginTop: 14 }}>Reference: {booked} · {lpEuroOr(monthly)}/mo{annualFee > 0 ? ` + ${lpEuro(annualFee)}/yr` : ""}</div>
                <Button variant="outline-light" size="md" onClick={() => setModal(false)} style={{ width: "100%", marginTop: 22 }}>Close</Button>
              </div>
            ) : (
              <div>
                <div id="books-call-title" style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 26, letterSpacing: "-0.03em", lineHeight: 1.15 }}>Request your free 30-minute call</div>
                <div style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: "#52525B", margin: "8px 0 22px" }}>We&apos;ll confirm your {lpEuroOr(monthly)}/mo{annualFee > 0 ? ` + ${lpEuro(annualFee)}/yr` : ""} plan and get you set up. No obligation.</div>
                {([["name", "Your name", "text"], ["email", "Email address", "email"], ["phone", "Phone (optional)", "tel"]] as const).map(([k, label, type]) => (
                  <div key={k} style={{ marginBottom: 14 }}>
                    <label htmlFor={`books-${k}`} style={{ display: "block", fontFamily: DISPLAY, fontSize: 15, fontWeight: 600, color: INK, marginBottom: 8 }}>{label}</label>
                    <input id={`books-${k}`} name={k} type={type} autoComplete={k === "name" ? "name" : k === "email" ? "email" : "tel"} value={form[k]} onChange={(e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setSubmitError(""); }} className="lp-input" style={{ ...fieldInput, width: "100%" }} />
                  </div>
                ))}
                {submitError && (
                  <div role="alert" style={{ display: "flex", gap: 10, fontFamily: BODY, fontSize: 14, fontWeight: 600, lineHeight: 1.5, color: INK, marginBottom: 10 }}>
                    <span className="a4-bullet" style={{ marginTop: 7, background: INK }} />
                    {submitError}
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                  <Button variant="dark" size="md" onClick={submit} style={{ flex: 1, opacity: submitting ? 0.6 : 1, pointerEvents: submitting ? "none" : "auto" }}>{submitting ? "Sending…" : "Send request"} <Icon name="arrow-right" size={16} color="#fff" /></Button>
                  <Button variant="outline-light" size="md" onClick={() => setModal(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
