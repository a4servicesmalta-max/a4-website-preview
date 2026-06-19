// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Logo, Button, Pill, Badge, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
// program: 40% commission on everything a referred client engages, for 3 years.
// Left: inputs. Right: black summary with the 3-year commission + an apply modal.

import { CLIENT_ONBOARDING_URL } from "@/lib/external-links";
const PE_RATE = 0.4;     // 40% commission
const PE_YEARS = 3;      // for three years

const peEuro = (n) => "€" + Math.round(n).toLocaleString();

export function PEStepper({ value, set, min = 1, max = 50 }) {
  const btn = { width: 34, height: 34, borderRadius: "var(--a4-r-md)", display: "grid", placeItems: "center", cursor: "pointer", background: "var(--a4-surface-soft)", border: "1px solid var(--a4-hairline-light)", color: "var(--a4-ink)" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button aria-label="decrease" onClick={() => set(Math.max(min, value - 1))} style={btn}><Icon name="minus" size={15} color="var(--a4-ink)" /></button>
      <span style={{ minWidth: 28, textAlign: "center", fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 18, color: "var(--a4-ink)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      <button aria-label="increase" onClick={() => set(Math.min(max, value + 1))} style={btn}><Icon name="plus" size={15} color="var(--a4-ink)" /></button>
    </div>
  );
}

export function PESlider({ value, set, min, max, step, fmt }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "var(--a4-ink)", letterSpacing: "-.4px" }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(+e.target.value)}
        style={{ width: "100%", accentColor: "var(--a4-primary)", cursor: "pointer" }} />
    </div>
  );
}

export function PartnerEarnings() {
  const [clients, setClients] = useState(5);
  const [monthly, setMonthly] = useState(150);
  const [annual, setAnnual] = useState(1200);

  const [modal, setModal] = useState(false);
  const [done, setDone] = useState(null);
  const [form, setForm] = useState({ name: "", firm: "", email: "" });

  // Per client over 3 years: monthly fees ×36 + annual fees ×3, at 40%.
  const perClientRevenue = monthly * 12 * PE_YEARS + annual * PE_YEARS;
  const perClientCommission = perClientRevenue * PE_RATE;
  const total = perClientCommission * clients;
  const monthlyRecurring = monthly * clients * PE_RATE;          // passive monthly
  const firstYear = (monthly * 12 + annual) * clients * PE_RATE;

  const submit = () => { if (form.name && form.email) setDone("A4P-" + Date.now().toString(36).toUpperCase().slice(-6)); };

  const lbl = { fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, color: "var(--a4-ink)" };
  const sub = { fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-mute)", marginTop: 3 };

  return (
    <section id="earnings" style={{ background: "var(--a4-surface-soft)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead
          align="center"
          eyebrow="Earnings calculator"
          title="See what referrals could earn you"
          sub="You earn 40% of everything your referred clients engage A4 for — across bookkeeping, VAT, payroll, audit and tax — for three full years. Estimate your commission below."
          maxWidth={660}
        /></Reveal>

        <Reveal delay={80} style={{ marginTop: 52 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 20, alignItems: "start", maxWidth: 1000, margin: "0 auto" }} className="pe-grid">
            {/* inputs */}
            <div style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", padding: "clamp(24px,3vw,34px)", display: "flex", flexDirection: "column", gap: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div><div style={lbl}>Clients you refer</div><div style={sub}>Over the next year</div></div>
                <PEStepper value={clients} set={setClients} min={1} max={50} />
              </div>
              <div style={{ height: 1, background: "var(--a4-hairline-light)" }} />
              <div>
                <div style={lbl}>Average monthly fee per client</div>
                <div style={{ ...sub, marginBottom: 14 }}>Bookkeeping, accounting, VAT, payroll</div>
                <PESlider value={monthly} set={setMonthly} min={50} max={600} step={5} fmt={(v) => peEuro(v) + " / mo"} />
              </div>
              <div>
                <div style={lbl}>Average annual fee per client</div>
                <div style={{ ...sub, marginBottom: 14 }}>Statutory audit &amp; tax return</div>
                <PESlider value={annual} set={setAnnual} min={0} max={4000} step={50} fmt={(v) => (v === 0 ? "None" : peEuro(v) + " / yr")} />
              </div>
            </div>

            {/* summary */}
            <div className="a4-sum" style={{ background: "#000", borderRadius: "var(--a4-r-lg)", padding: "clamp(24px,3vw,32px)", position: "sticky", top: 88, color: "#fff" }}>
              <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--a4-on-dark-mute)" }}>Your commission · 3 years</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
                <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 50, letterSpacing: "-2px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{peEuro(total)}</span>
              </div>
              <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-stone)", marginTop: 6 }}>From {clients} client{clients > 1 ? "s" : ""} at 40% commission.</div>

              <div style={{ height: 1, background: "var(--a4-hairline-dark)", margin: "22px 0 16px" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[["Per client (3 yrs)", peEuro(perClientCommission)], ["First-year commission", peEuro(firstYear)], ["Recurring / month", peEuro(monthlyRecurring)]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, color: "var(--a4-on-dark-mute)" }}>{k}</span>
                    <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{v}</span>
                  </div>
                ))}
              </div>

              <Button variant="primary" size="md" onClick={() => { setDone(null); setModal(true); }} style={{ width: "100%", marginTop: 24 }}>Become a partner <Icon name="arrow-right" size={16} color="#000" /></Button>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 14 }}>
                <Icon name="shield-check" size={13} color="var(--a4-stone)" />
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-stone)" }}>Tracked in your reseller portal · paid quarterly</span>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>

      {modal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", width: "100%", maxWidth: 450, padding: 30, boxShadow: "0 32px 80px rgba(0,0,0,.25)" }}>
            {done ? (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ width: 54, height: 54, borderRadius: 999, background: "rgba(0,168,126,.12)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Icon name="check" size={26} color="var(--a4-accent-teal)" stroke={2.5} /></div>
                <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "var(--a4-ink)" }}>Application received</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--a4-mute)", margin: "10px 0 0" }}>Thanks, {form.name.split(" ")[0]}. Our partnerships team will set up your reseller portal and be in touch at <strong style={{ color: "var(--a4-ink)" }}>{form.email}</strong> within 1 business day.</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-stone)", marginTop: 14 }}>Reference: {done}</div>
                <Button variant="outline-light" size="md" onClick={() => setModal(false)} style={{ width: "100%", marginTop: 22 }}>Close</Button>
              </div>
            ) : (
              <div>
                <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "var(--a4-ink)" }}>Become an A4 partner</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, color: "var(--a4-mute)", margin: "6px 0 22px" }}>We'll set up your reseller portal and walk you through the program. No cost to join.</div>
                {[["name", "Your name", "text"], ["firm", "Firm name", "text"], ["email", "Work email", "email"]].map(([k, label, type]) => (
                  <div key={k} style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontFamily: "var(--a4-font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--a4-mute)", marginBottom: 6 }}>{label}</label>
                    <input type={type} value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} style={{ width: "100%", background: "var(--a4-surface-soft)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "11px 14px", color: "var(--a4-ink)", fontFamily: "var(--a4-font-body)", fontSize: 14, outline: "none" }} />
                  </div>
                ))}
                <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                  <Button variant="dark" size="md" onClick={submit} style={{ flex: 1 }}>Submit application <Icon name="arrow-right" size={16} color="#fff" /></Button>
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
