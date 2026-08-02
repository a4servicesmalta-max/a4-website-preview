// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Logo, Button, Pill, Badge, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
import {
  SOFTWARE_TIERS,
  VAT_FROM,
  TAX_RETURN_FROM,
  PAYROLL_ENTRY_RATE,
  PAYROLL_BEST_RATE,
  payrollRate,
  PRICING_VAT_NOTE,
} from "@/data/a4QuotePack";
// A4 Books software €39/mo flat (unlimited documents), + bank reconciliations,
// accounting, and optional VAT / payroll / annual accounts. Every figure comes
// from quote pack mt-2026-08-01 (src/data/a4QuotePack.ts).
// Drives toward "create account".

const PR_BANDS = [
  { label: "Under €100k", acct: 0 },
  { label: "€100k–€250k", acct: 40 },
  { label: "€250k–€500k", acct: 65 },
  { label: "€500k–€1M", acct: 95 },
  { label: "€1M–€2.5M", acct: 150 },
  { label: "€2.5M+", acct: 240 },
];

const prEuro = (n) => "€" + n.toLocaleString();

export function Stepper({ value, set, min = 1, max = 12 }) {
  const btn = (dir) => ({ width: 34, height: 34, borderRadius: "var(--a4-r-md)", display: "grid", placeItems: "center", cursor: "pointer", background: "var(--a4-surface-deep)", border: "1px solid var(--a4-hairline-dark)", color: "#fff" });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button aria-label="decrease" onClick={() => set(Math.max(min, value - 1))} style={btn()}><Icon name="minus" size={15} color="#fff" /></button>
      <span style={{ minWidth: 22, textAlign: "center", fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 18, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      <button aria-label="increase" onClick={() => set(Math.min(max, value + 1))} style={btn()}><Icon name="plus" size={15} color="#fff" /></button>
    </div>
  );
}

export function Toggle({ on, set }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => set(!on)} style={{
      width: 46, height: 27, borderRadius: 999, border: "1px solid " + (on ? "var(--a4-primary)" : "var(--a4-hairline-dark)"),
      background: on ? "var(--a4-primary)" : "var(--a4-surface-deep)", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background .2s, border-color .2s",
    }}>
      <span style={{ position: "absolute", top: 2, left: on ? 21 : 2, width: 21, height: 21, borderRadius: 999, background: "#fff", transition: "left .2s ease" }} />
    </button>
  );
}

export function Pricing() {
  const [rev, setRev] = useState(1);
  const [banks, setBanks] = useState(1);
  const [vat, setVat] = useState(true);
  const [payroll, setPayroll] = useState(false);
  const [emps, setEmps] = useState(2);
  const [annual, setAnnual] = useState(false);

  const book = SOFTWARE_TIERS.book;
  const recon = banks * 15;
  const acct = PR_BANDS[rev].acct;
  const vatFee = vat ? VAT_FROM : 0;
  const payFee = payroll ? emps * payrollRate(emps) : 0;
  const annualFee = annual ? Math.round(TAX_RETURN_FROM / 12) : 0;
  const total = book + recon + acct + vatFee + payFee + annualFee;

  const lines = [
    { k: "A4 Books — unlimited documents", v: book },
    { k: `Bank reconciliations · ${banks} account${banks > 1 ? "s" : ""}`, v: recon },
    { k: "Accounting & management reports", v: acct, included: acct === 0 },
    vat && { k: "VAT returns", v: vatFee },
    payroll && { k: `Payroll · ${emps} employee${emps > 1 ? "s" : ""}`, v: payFee },
    annual && { k: "Annual accounts & tax", v: annualFee },
  ].filter(Boolean);

  const fieldLabel = { fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, color: "#fff" };
  const fieldSub = { fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-stone)", marginTop: 2 };

  return (
    <section id="pricing" style={{ background: "#000", padding: "clamp(64px,9vw,120px) 0" }}>
      <Container>
        <Reveal><SectionHead
          dark align="center"
          eyebrow="Pricing calculator"
          title={<>Build your plan — from €{SOFTWARE_TIERS.book}/month</>}
          sub="Transparent, fixed monthly pricing that scales with your business. Adjust the inputs to see your estimate, then create your account to confirm."
          maxWidth={640}
        /></Reveal>

        <Reveal delay={80} style={{ marginTop: 52 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 20, alignItems: "start", maxWidth: 1000, margin: "0 auto" }} className="pr-grid">
            {/* inputs */}
            <div style={{ background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", padding: "clamp(24px,3vw,34px)", display: "flex", flexDirection: "column", gap: 26 }}>
              {/* revenue */}
              <div>
                <div style={fieldLabel}>Annual revenue</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                  {PR_BANDS.map((b, i) => (
                    <button key={b.label} onClick={() => setRev(i)} style={{
                      fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                      padding: "8px 14px", borderRadius: "var(--a4-r-full)",
                      background: i === rev ? "#fff" : "transparent", color: i === rev ? "#000" : "var(--a4-on-dark-mute)",
                      border: "1px solid " + (i === rev ? "#fff" : "var(--a4-hairline-dark)"), transition: "background .15s, color .15s",
                    }}>{b.label}</button>
                  ))}
                </div>
              </div>

              {/* bookkeeping — flat */}
              <div>
                <div style={fieldLabel}>A4 Books — €{SOFTWARE_TIERS.book}/mo flat</div>
                <div style={fieldSub}>Unlimited documents, no per-document fees — invoices, expenses and bank lines included. Software only; add a Senior accountant from €{SOFTWARE_TIERS.senior}/mo.</div>
              </div>

              {/* bank accounts */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                <div>
                  <div style={fieldLabel}>Bank accounts to reconcile</div>
                  <div style={fieldSub}>Each account is matched and reconciled monthly.</div>
                </div>
                <Stepper value={banks} set={setBanks} min={1} max={10} />
              </div>

              <div style={{ height: 1, background: "var(--a4-hairline-dark)" }} />

              {/* add-ons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--a4-stone)" }}>Optional add-ons</div>
                {[
                  { label: "VAT returns", sub: "Every return prepared and filed with the CFR", on: vat, set: setVat, fee: `from €${VAT_FROM}/mo` },
                  { label: "Payroll", sub: `FS5 submissions & payslips · €${PAYROLL_ENTRY_RATE}/head up to five, €${PAYROLL_BEST_RATE}/head at scale`, on: payroll, set: setPayroll, fee: `from €${PAYROLL_ENTRY_RATE}/head/mo`, emps: true },
                  { label: "Annual accounts & tax", sub: "Year-end financial statements & return", on: annual, set: setAnnual, fee: `from €${Math.round(TAX_RETURN_FROM / 12)}/mo` },
                ].map((a) => (
                  <div key={a.label}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ ...fieldLabel, fontWeight: 500, fontSize: 14 }}>{a.label} <span style={{ color: "var(--a4-stone)", fontWeight: 500 }}>· {a.fee}</span></div>
                        <div style={fieldSub}>{a.sub}</div>
                      </div>
                      <Toggle on={a.on} set={a.set} />
                    </div>
                    {a.emps && payroll && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingLeft: 2 }}>
                        <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-on-dark-mute)" }}>Number of employees</span>
                        <Stepper value={emps} set={setEmps} min={1} max={50} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* summary */}
            <div className="a4-sum" style={{ background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", padding: "clamp(24px,3vw,32px)", position: "sticky", top: 88 }}>
              <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--a4-stone)" }}>Your estimated plan</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
                <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 52, color: "#fff", letterSpacing: "-2px", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{prEuro(total)}</span>
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, color: "var(--a4-on-dark-mute)" }}>/ month</span>
              </div>
              <div style={{ height: 1, background: "var(--a4-hairline-dark)", margin: "22px 0 18px" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {lines.map((l) => (
                  <div key={l.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                    <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, color: "var(--a4-on-dark-mute)" }}>{l.k}</span>
                    <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 500, color: l.included ? "var(--a4-accent-teal)" : "#fff", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{l.included ? "Included" : prEuro(l.v) + "/mo"}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24 }}>
                <Button variant="primary" size="md" href="/contact" style={{ width: "100%" }}>Request information <Icon name="arrow-right" size={16} color="#000" /></Button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 14 }}>
                <Icon name="lock" size={13} color="var(--a4-stone)" />
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-stone)" }}>Fixed price confirmed on signup · cancel anytime · {PRICING_VAT_NOTE}</span>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
