"use client";

import React, { useState } from "react";
import { Button, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
import { MANAGED_CAVEAT, MANAGED_CATCHUP_NOTE, MANAGED_SOLE, MANAGED_COMPANY } from "@/data/a4ManagedOffer";
import {
  VAT_MONTHLY, VAT_RULES, TAX_RETURN_FROM,
  PAYROLL_ENTRY_RATE, PAYROLL_BEST_RATE, payrollRate, PRICING_VAT_NOTE,
  LAUNCH_PROMO, isPromoActive,
  catchUpAmount, catchUpLabel, managedMonthly, EXPENSE_BANDS,
  type ManagedEntity, type ExpenseBand,
} from "@/data/a4QuotePack";
import { INDEPENDENCE_BOOKKEEPING, flagsForServiceSelection, type IndependenceFlags } from "@/lib/independence";
// Confirm whose books + add-ons → live monthly price → two exits:
// (1) Create account & request services, (2) Book a 15-min call.


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
  const base = s.expenses === "" ? null : managedMonthly(packEntity, s.expenses);
  if (base == null) {
    return {
      priced: false, reason: "no-expenses", base: null, lines: [],
      grossMonthly: null, monthly: null, annualFee, catchUp: 0, catchUpLabel: null,
      promoApplied: false, independence, selectedAnnual,
    };
  }

  const vatFee = s.vat ? LP_VAT[s.vatFreq].fee : 0;
  const payFee = isCompany && s.payroll ? s.emps * payrollRate(s.emps) : 0;

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

  // One-off, at the same monthly rate. Never discounted, never capped.
  const catchUp = s.catchUpMonths > 0 ? (catchUpAmount(s.catchUpMonths, packEntity, expenses) ?? 0) : 0;

  return {
    priced: true, reason: "ok", base, lines,
    grossMonthly, monthly, annualFee, catchUp,
    catchUpLabel: s.catchUpMonths > 0 ? catchUpLabel(s.catchUpMonths, packEntity, expenses) : null,
    promoApplied, independence, selectedAnnual,
  };
}

type StepperProps = { value: number; set: (v: number) => void; min?: number; max?: number };
export function LPStepper({ value, set, min = 1, max = 10 }: StepperProps) {
  const btn = { width: 34, height: 34, borderRadius: "var(--a4-r-md)", display: "grid", placeItems: "center", cursor: "pointer", background: "var(--a4-surface-soft)", border: "1px solid var(--a4-hairline-light)", color: "var(--a4-ink)" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button aria-label="decrease" onClick={() => set(Math.max(min, value - 1))} style={btn}><Icon name="minus" size={15} color="var(--a4-ink)" /></button>
      <span style={{ minWidth: 20, textAlign: "center", fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 18, color: "var(--a4-ink)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      <button aria-label="increase" onClick={() => set(Math.min(max, value + 1))} style={btn}><Icon name="plus" size={15} color="var(--a4-ink)" /></button>
    </div>
  );
}

type ToggleProps = { on: boolean; set: (v: boolean) => void };
export function LPToggle({ on, set }: ToggleProps) {
  return (
    <button role="switch" aria-checked={on} onClick={() => set(!on)} style={{
      width: 46, height: 27, borderRadius: 999, border: "1px solid " + (on ? "var(--a4-primary)" : "var(--a4-hairline-strong)"),
      background: on ? "var(--a4-primary)" : "var(--a4-surface-card)", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background .2s, border-color .2s",
    }}>
      <span style={{ position: "absolute", top: 2, left: on ? 21 : 2, width: 21, height: 21, borderRadius: 999, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "left .2s ease" }} />
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
    if (!form.name || !form.email) return;
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
  // "Bank reconciliation · €15/account" is gone: reconciling every account IS
  // managed bookkeeping, so it is not a separate charge.
  const monthlyAddons = ([
    { id: "vat", label: "VAT returns", sub: `Every return filed with the CFR · art. 11 small-exempt is €${VAT_RULES.art11FlatYearly}/yr instead`, on: vat, set: (v: boolean) => patch({ vat: v }), fee: `€${LP_VAT[vatFreq].fee} / mo`, freq: true },
    isCompany && { id: "pay", label: "Payroll", sub: `FS5 submissions & payslips · €${PAYROLL_ENTRY_RATE}/head up to five, €${PAYROLL_BEST_RATE}/head at scale`, on: payroll, set: (v: boolean) => patch({ payroll: v }), fee: `from €${PAYROLL_ENTRY_RATE} / head / mo`, emps: true },
  ] as (Addon | false)[]).filter((a): a is Addon => Boolean(a));

  const fieldLabel = { fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, color: "var(--a4-ink)" };
  const fieldSub = { fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-mute)", marginTop: 2 };

  return (
    <section id="pricing" style={{ background: "var(--a4-surface-soft)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead
          align="center"
          eyebrow="Build your price"
          title="Build your plan"
          sub={`We keep your books — you send us the paperwork. ${MANAGED_CAVEAT} ${MANAGED_CATCHUP_NOTE} One agreed monthly price, no per-document fees, cancel anytime.`}
          maxWidth={620}
        /></Reveal>

        <Reveal delay={80} style={{ marginTop: 52 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20, alignItems: "start", maxWidth: 1000, margin: "0 auto" }} className="lp-grid">
            {/* picker */}
            <div style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", padding: "clamp(24px,3vw,34px)", display: "flex", flexDirection: "column", gap: 26 }}>
              {/* entity toggle */}
              <div>
                <div style={fieldLabel}>I&apos;m a…</div>
                <div style={{ display: "flex", gap: 6, marginTop: 12, background: "var(--a4-surface-soft)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-full)", padding: 5 }}>
                  {([["company", "Company", "building-2"], ["personal", "Personal / sole trader", "user"]] as const).map(([id, label, icon]) => {
                    const on = entity === id;
                    return (
                      <button key={id} onClick={() => setEntityAndSync(id)} style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        height: 42, borderRadius: "var(--a4-r-full)", cursor: "pointer", border: 0,
                        background: on ? "var(--a4-ink)" : "transparent", color: on ? "#fff" : "var(--a4-mute)",
                        fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, transition: "background .15s, color .15s",
                      }}>
                        <Icon name={icon} size={16} color={on ? "#fff" : "var(--a4-mute)"} /> {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* the managed price for the chosen entity — one price, no ladder */}
              <div>
                <div style={fieldLabel}>1 · Your bookkeeping</div>
                <div style={{
                  marginTop: 14, background: "var(--a4-surface-soft)",
                  border: "1.5px solid var(--a4-primary)", borderRadius: "var(--a4-r-md)", padding: "18px 18px 20px",
                }}>
                  <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 19, color: "var(--a4-ink)" }}>Managed bookkeeping — {plan.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 6 }}>
                    <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 30, color: "var(--a4-ink)", letterSpacing: "-1px" }}>{lpEuroOr(base)}</span>
                    <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "var(--a4-mute)" }}>/mo</span>
                  </div>
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, color: "var(--a4-primary)", marginTop: 8 }}>A qualified accountant on the file</div>
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, lineHeight: 1.45, color: "var(--a4-mute)", marginTop: 4 }}>{plan.detail}</div>
                </div>

                <div style={{ marginTop: 14, borderRadius: "var(--a4-r-md)", border: "1px solid var(--a4-hairline-light)", padding: "15px 16px" }}>
                  <label htmlFor="lp-start" style={{ ...fieldLabel, display: "block" }}>From which month should we start?</label>
                  <div style={fieldSub}>Required. The first month we keep the books — anything before it is catch-up.</div>
                  <input
                    id="lp-start"
                    type="month"
                    value={startMonth}
                    onChange={(e) => patch({ startMonth: e.target.value })}
                    style={{
                      marginTop: 10, height: 40, padding: "0 12px", borderRadius: "var(--a4-r-md)",
                      border: "1px solid var(--a4-hairline-light)", background: "var(--a4-surface-card)",
                      color: "var(--a4-ink)", fontFamily: "var(--a4-font-body)", fontSize: 13.5,
                    }}
                  />

                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--a4-hairline-light)" }}>
                    <div style={fieldLabel}>About how much do you spend a month?</div>
                    <div style={fieldSub}>
                      Total money out — suppliers, wages, rent, everything. It is what sets the bookkeeping
                      price, and you already know it without counting anything.
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                      {EXPENSE_BANDS.map((b) => {
                        const on = expenses === b.id;
                        return (
                          <button key={b.id} type="button" onClick={() => patch({ expenses: b.id })} style={{
                            padding: "7px 13px", borderRadius: "var(--a4-r-full)", cursor: "pointer",
                            border: "1px solid " + (on ? "var(--a4-primary)" : "var(--a4-hairline-light)"),
                            background: on ? "var(--a4-primary)" : "transparent",
                            color: on ? "#fff" : "var(--a4-body)",
                            fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600,
                          }}>{b.label}</button>
                        );
                      })}
                    </div>
                    {/* Nothing is pre-selected. Say what the blank means, or a
                        row of unfilled pills reads as a broken control. */}
                    {!expenses && (
                      <div style={{ marginTop: 10, fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "#8A6100" }}>
                        Pick a band and your price appears — we do not assume one for you.
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--a4-hairline-light)" }}>
                    <div style={fieldLabel}>Earlier months that still need doing</div>
                    <div style={fieldSub}>{MANAGED_CATCHUP_NOTE} Each one is {lpEuroOr(base)}.</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                      {[0, 3, 6, 12, 24, 36].map((m) => {
                        const on = catchUpMonths === m;
                        return (
                          <button key={m} type="button" onClick={() => patch({ catchUpMonths: m })} style={{
                            padding: "7px 13px", borderRadius: "var(--a4-r-full)", cursor: "pointer",
                            border: "1px solid " + (on ? "var(--a4-primary)" : "var(--a4-hairline-light)"),
                            background: on ? "var(--a4-primary)" : "transparent",
                            color: on ? "#fff" : "var(--a4-body)",
                            fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600,
                          }}>{m === 0 ? "None" : `${m} months`}</button>
                        );
                      })}
                    </div>
                    {catchUpFee > 0 && (
                      <div style={{ marginTop: 10, fontFamily: "var(--a4-font-body)", fontSize: 13, fontVariantNumeric: "tabular-nums", color: "var(--a4-ink)", fontWeight: 600 }}>
                        {q.catchUpLabel}
                      </div>
                    )}
                  </div>
                </div>

                {/* The independence consequence, before they book anything. */}
                <div role="note" style={{
                  marginTop: 14, padding: "12px 14px", borderRadius: "var(--a4-r-md)",
                  background: "rgba(73,79,223,.06)", border: "1px solid rgba(73,79,223,.25)",
                }}>
                  <span style={{ display: "block", fontFamily: "var(--a4-font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--a4-primary-deep)" }}>Independence</span>
                  <span style={{ display: "block", marginTop: 4, fontFamily: "var(--a4-font-body)", fontSize: 12.5, lineHeight: 1.55, color: "var(--a4-body)" }}>{INDEPENDENCE_BOOKKEEPING}</span>
                </div>
              </div>

              {/* monthly add-ons */}
              <div>
                <div style={fieldLabel}>2 · Add monthly services</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
                  {monthlyAddons.map((a) => (
                    <div key={a.label} style={{ borderRadius: "var(--a4-r-md)", border: "1px solid var(--a4-hairline-light)", padding: "15px 16px", background: a.on ? "var(--a4-surface-soft)" : "transparent", transition: "background .15s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ ...fieldLabel, fontWeight: 600, fontSize: 14.5 }}>{a.label} <span style={{ color: "var(--a4-mute)", fontWeight: 500 }}>· {a.fee}</span></div>
                          <div style={fieldSub}>{a.sub}</div>
                        </div>
                        <LPToggle on={a.on} set={a.set} />
                      </div>
                      {a.emps && payroll && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 13, paddingTop: 13, borderTop: "1px solid var(--a4-hairline-light)" }}>
                          <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-charcoal)" }}>Employees</span>
                          <LPStepper value={emps} set={(v) => patch({ emps: v })} min={1} max={50} />
                        </div>
                      )}
                      {a.freq && vat && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 13, paddingTop: 13, borderTop: "1px solid var(--a4-hairline-light)" }}>
                          <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-charcoal)" }}>Filing frequency</span>
                          <div style={{ display: "flex", gap: 5, background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-full)", padding: 4 }}>
                            {Object.entries(LP_VAT).map(([k, v]) => {
                              const on = vatFreq === k;
                              return (
                                <button key={k} onClick={() => patch({ vatFreq: k as keyof typeof LP_VAT })} style={{
                                  padding: "6px 12px", borderRadius: "var(--a4-r-full)", border: 0, cursor: "pointer",
                                  fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600,
                                  background: on ? "var(--a4-ink)" : "transparent", color: on ? "#fff" : "var(--a4-mute)", transition: "background .15s, color .15s",
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
                <div style={fieldLabel}>3 · Once a year</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
                  {LP_ANNUAL_ITEMS[entity].map((it) => {
                    const on = !!annualSel[it.id];
                    return (
                      <div key={it.id} style={{ borderRadius: "var(--a4-r-md)", border: "1px solid var(--a4-hairline-light)", padding: "15px 16px", background: on ? "var(--a4-surface-soft)" : "transparent", transition: "background .15s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ ...fieldLabel, fontWeight: 600, fontSize: 14.5 }}>{it.label} <span style={{ color: "var(--a4-mute)", fontWeight: 500 }}>· {it.from ? "from " : ""}{lpEuro(it.fee)} / year</span></div>
                            <div style={fieldSub}>{it.sub} — billed once a year, not monthly.</div>
                          </div>
                          <LPToggle on={on} set={() => toggleAnnual(it.id)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* summary */}
            <div className="a4-sum" style={{ background: "#000", borderRadius: "var(--a4-r-lg)", padding: "clamp(24px,3vw,32px)", position: "sticky", top: 88, color: "#fff" }}>
              <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--a4-on-dark-mute)" }}>Your monthly price</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
                <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 54, letterSpacing: "-2px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{lpEuroOr(monthly)}</span>
                {q.priced && <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, color: "var(--a4-on-dark-mute)" }}>/ mo</span>}
              </div>
              {/* M9: the launch discount applies here exactly as it does on the
                  homepage wizard, /pricing and the estimator. This page ignored
                  it entirely, so a visitor who had seen 25% off two pages
                  earlier got a booking email quoting full price. */}
              {q.priced && promoApplied && q.grossMonthly != null && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
                  <span style={{ fontFamily: "var(--a4-font-display)", fontSize: 16, color: "var(--a4-on-dark-mute)", textDecoration: "line-through", fontVariantNumeric: "tabular-nums" }}>{lpEuro(q.grossMonthly)}</span>
                  <span style={{ padding: "3px 10px", borderRadius: "var(--a4-r-full)", background: "rgba(224,105,94,.18)", border: "1px solid rgba(224,105,94,.45)", color: "#F2A49C", fontFamily: "var(--a4-font-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
                    {Math.round(LAUNCH_PROMO.pct * 100)}% off
                  </span>
                </div>
              )}
              {!q.priced && (
                <p style={{ margin: "10px 0 0", fontFamily: "var(--a4-font-body)", fontSize: 12.5, lineHeight: 1.55, color: "var(--a4-on-dark-mute)" }}>
                  Tell us roughly what you spend a month and every figure here fills in. We do not guess it — the monthly spend is what sets the price.
                </p>
              )}
              <div style={{ height: 1, background: "var(--a4-hairline-dark)", margin: "22px 0 16px" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {lines.map((l) => (
                  <div key={l.k} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, color: "var(--a4-on-dark-mute)" }}>{l.k}</span>
                    <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{lpEuro(l.v)}/mo</span>
                  </div>
                ))}
              </div>
              {selectedAnnual.length > 0 && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--a4-hairline-dark)" }}>
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--a4-stone)", marginBottom: 10 }}>Once a year</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {selectedAnnual.map((it) => (
                      <div key={it.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                        <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, color: "var(--a4-on-dark-mute)" }}>{it.label}</span>
                        <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{it.from ? "from " : ""}{lpEuro(it.fee)}/yr</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-stone)", marginTop: 8 }}>Billed once a year. Tax fees are estimates, confirmed after a quick review.</div>
                </div>
              )}
              {/* The one-off, shown where the client will actually be billed
                  it, and never discounted — a one-off is not in the promo. */}
              {catchUpFee > 0 && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--a4-hairline-dark)", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                  <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, color: "var(--a4-on-dark-mute)" }}>Earlier months</span>
                  <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{lpEuro(catchUpFee)} once</span>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
                <Button variant="primary" size="md" href="/contact" style={{ width: "100%" }}>Request information <Icon name="arrow-right" size={16} color="#000" /></Button>
                {/* Inert until there is a price to book against: the modal
                    quotes the monthly figure back at the visitor and the lead
                    email repeats it, so booking without one would confirm a
                    plan nobody priced. */}
                <Button variant="outline-dark" size="md" onClick={() => { if (canBook) { setBooked(null); setModal(true); } }} style={{ width: "100%", opacity: canBook ? 1 : 0.55, pointerEvents: canBook ? "auto" : "none" }}><Icon name="calendar" size={16} color="#fff" /> Book a 15-min call</Button>
                {!canBook && (
                  <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, lineHeight: 1.5, color: "#E8C08A", textAlign: "center" }}>
                    {!q.priced ? "Pick your monthly spend above and this unlocks." : "Pick the month we should start from and this unlocks."}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 14 }}>
                <Icon name="shield-check" size={13} color="var(--a4-stone)" />
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-stone)" }}>Price agreed before we start · reviewed by a licensed audit firm · service begins upon KYC approval · {PRICING_VAT_NOTE}</span>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>

      {/* booking modal */}
      {modal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", width: "100%", maxWidth: 440, padding: 30, boxShadow: "0 32px 80px rgba(0,0,0,.25)" }}>
            {booked ? (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ width: 54, height: 54, borderRadius: 999, background: "rgba(0,168,126,.12)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Icon name="check" size={26} color="var(--a4-accent-teal)" stroke={2.5} /></div>
                <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "var(--a4-ink)" }}>You&apos;re booked in</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--a4-mute)", margin: "10px 0 0" }}>Thanks, {form.name.split(" ")[0]}. We&apos;ll confirm your 15-minute call by email at <strong style={{ color: "var(--a4-ink)" }}>{form.email}</strong> within 2 business hours.</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-stone)", marginTop: 14 }}>Reference: {booked} · {lpEuroOr(monthly)}/mo{annualFee > 0 ? ` + ${lpEuro(annualFee)}/yr` : ""}</div>
                <Button variant="outline-light" size="md" onClick={() => setModal(false)} style={{ width: "100%", marginTop: 22 }}>Close</Button>
              </div>
            ) : (
              <div>
                <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "var(--a4-ink)" }}>Book your free 15-min call</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, color: "var(--a4-mute)", margin: "6px 0 22px" }}>We&apos;ll confirm your {lpEuroOr(monthly)}/mo{annualFee > 0 ? ` + ${lpEuro(annualFee)}/yr` : ""} plan and get you set up. No obligation.</div>
                {([["name", "Your name", "text"], ["email", "Email address", "email"], ["phone", "Phone (optional)", "tel"]] as const).map(([k, label, type]) => (
                  <div key={k} style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontFamily: "var(--a4-font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--a4-mute)", marginBottom: 6 }}>{label}</label>
                    <input type={type} value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} style={{ width: "100%", background: "var(--a4-surface-soft)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "11px 14px", color: "var(--a4-ink)", fontFamily: "var(--a4-font-body)", fontSize: 14, outline: "none" }} />
                  </div>
                ))}
                {submitError && <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--accent-danger)", marginBottom: 10 }}>{submitError}</div>}
                <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                  <Button variant="dark" size="md" onClick={submit} style={{ flex: 1, opacity: submitting ? 0.6 : 1, pointerEvents: submitting ? "none" : "auto" }}>{submitting ? "Sending…" : "Confirm call"} <Icon name="arrow-right" size={16} color="#fff" /></Button>
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
