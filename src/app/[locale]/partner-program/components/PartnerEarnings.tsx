"use client";

import React, { useState } from "react";
import { Button, Icon } from "@/components/a4-landing/Primitives";
import { MUTED_GLOW } from "@/components/fx/primitives";
import {
  BODY, DoneMark, FeeDoc, G, Head, INK, KitModal, SANS, fieldLabel, lightInput,
} from "@/app/[locale]/accounting-services/components/PaidLandingKit";
// program: 40% commission on everything a referred client engages, for 3 years.
// Left: inputs. Right: the commission, set like the quote document's totals,
// plus an apply modal. A4 design language (docs/DESIGN-LANGUAGE.md).

const PE_RATE = 0.4;     // 40% commission
const PE_YEARS = 3;      // for three years

const peEuro = (n: number) => "€" + Math.round(n).toLocaleString();

export function PEStepper({ value, set, min = 1, max = 50 }: { value: number; set: (n: number) => void; min?: number; max?: number }) {
  const btn: React.CSSProperties = {
    width: 44, height: 44, borderRadius: 999, display: "grid", placeItems: "center", cursor: "pointer",
    background: "#FFFFFF", border: "1px solid #E4E4E7", color: INK, transition: "border-color .25s",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <button type="button" className="pk-ghost" aria-label="decrease" onClick={() => set(Math.max(min, value - 1))} style={btn}><Icon name="minus" size={16} color={INK} /></button>
      <span style={{ minWidth: 34, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: "-0.03em", color: INK, fontVariantNumeric: "tabular-nums" }}>{value}</span>
      <button type="button" className="pk-ghost" aria-label="increase" onClick={() => set(Math.min(max, value + 1))} style={btn}><Icon name="plus" size={16} color={INK} /></button>
    </div>
  );
}

export function PESlider({ value, set, min, max, step, fmt, label }: { value: number; set: (n: number) => void; min: number; max: number; step: number; fmt: (v: number) => string; label?: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: "clamp(26px,2.4vw,32px)", letterSpacing: "-0.035em", color: INK, fontVariantNumeric: "tabular-nums" }}>{fmt(value)}</span>
      </div>
      <input type="range" className="pk-range" aria-label={label} min={min} max={max} step={step} value={value} onChange={(e) => set(+e.target.value)} />
    </div>
  );
}

export function PartnerEarnings() {
  const [clients, setClients] = useState(5);
  const [monthly, setMonthly] = useState(150);
  const [annual, setAnnual] = useState(1200);

  const [modal, setModal] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", firm: "", email: "" });

  // Per client over 3 years: monthly fees ×36 + annual fees ×3, at 40%.
  const perClientRevenue = monthly * 12 * PE_YEARS + annual * PE_YEARS;
  const perClientCommission = perClientRevenue * PE_RATE;
  const total = perClientCommission * clients;
  const monthlyRecurring = monthly * clients * PE_RATE;          // passive monthly
  const firstYear = (monthly * 12 + annual) * clients * PE_RATE;

  const submit = () => { if (form.name && form.email) setDone("A4P-" + Date.now().toString(36).toUpperCase().slice(-6)); };

  const lbl: React.CSSProperties = { fontFamily: SANS, fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em", color: INK };
  const sub: React.CSSProperties = { fontFamily: BODY, fontSize: 14, lineHeight: 1.5, color: "#52525B", marginTop: 4 };
  const rule: React.CSSProperties = { height: 1, background: "#E4E4E7" };

  return (
    <section
      id="earnings"
      style={{ position: "relative", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", background: MUTED_GLOW, color: INK, fontFamily: SANS }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Head
          n="03"
          eyebrow="Earnings calculator"
          title={<>See what referrals could <G>earn you</G></>}
          sub="You earn 40% of everything your referred clients engage A4 for — across bookkeeping, VAT, payroll, audit and tax — for three full years. Estimate your commission below."
          maxWidth={820}
        />

        <div data-fx="rise" data-d="120" className="pe-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.25fr) minmax(0,1fr)", gap: 24, alignItems: "start", marginTop: "clamp(48px,6vw,80px)" }}>
          {/* inputs */}
          <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E7", borderRadius: 28, padding: "clamp(26px,3.4vw,40px)", display: "flex", flexDirection: "column", gap: 28, boxShadow: "0 30px 80px rgba(9,9,11,.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div><div style={lbl}>Clients you refer</div><div style={sub}>Over the next year</div></div>
              <PEStepper value={clients} set={setClients} min={1} max={50} />
            </div>
            <div style={rule} />
            <div>
              <div style={lbl}>Average monthly fee per client</div>
              <div style={{ ...sub, marginBottom: 14 }}>Bookkeeping, accounting, VAT, payroll</div>
              <PESlider label="Average monthly fee per client" value={monthly} set={setMonthly} min={50} max={600} step={5} fmt={(v) => peEuro(v) + " / mo"} />
            </div>
            <div style={rule} />
            <div>
              <div style={lbl}>Average annual fee per client</div>
              <div style={{ ...sub, marginBottom: 14 }}>Statutory audit &amp; tax return</div>
              <PESlider label="Average annual fee per client" value={annual} set={setAnnual} min={0} max={4000} step={50} fmt={(v) => (v === 0 ? "None" : peEuro(v) + " / yr")} />
            </div>
          </div>

          {/* summary — set like the quote document's totals */}
          <FeeDoc
            className="a4-sum"
            label="Your commission · 3 years"
            rows={[
              { k: "Per client (3 yrs)", v: peEuro(perClientCommission) },
              { k: "First-year commission", v: peEuro(firstYear) },
              { k: "Recurring / month", v: peEuro(monthlyRecurring) },
            ]}
            amount={peEuro(total)}
            note={<>From {clients} client{clients > 1 ? "s" : ""} at 40% commission.</>}
            footer={
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 14 }}>
                <Icon name="shield-check" size={14} color="#71717A" />
                <span style={{ fontFamily: BODY, fontSize: 13, color: "#52525B" }}>Tracked in your reseller portal · paid quarterly</span>
              </div>
            }
          >
            <Button variant="dark" size="md" onClick={() => { setDone(null); setModal(true); }} style={{ width: "100%" }}>Become a partner <Icon name="arrow-right" size={16} color="#fff" /></Button>
          </FeeDoc>
        </div>
      </div>

      {modal && (
        <KitModal onClose={() => setModal(false)} labelledBy="partner-apply-title">
          {done ? (
            <div style={{ textAlign: "center", padding: "6px 0" }}>
              <DoneMark />
              <div id="partner-apply-title" style={{ fontWeight: 600, fontSize: 26, letterSpacing: "-0.03em" }}>Application received</div>
              <div style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: "#52525B", margin: "10px 0 0" }}>Thanks, {form.name.split(" ")[0]}. Our partnerships team will set up your reseller portal and be in touch at <strong style={{ color: INK }}>{form.email}</strong> within 1 business day.</div>
              <div style={{ fontFamily: BODY, fontSize: 13, color: "#71717A", marginTop: 14 }}>Reference: {done}</div>
              <Button variant="outline-light" size="md" onClick={() => setModal(false)} style={{ width: "100%", marginTop: 22 }}>Close</Button>
            </div>
          ) : (
            <div>
              <div id="partner-apply-title" style={{ fontWeight: 600, fontSize: 26, letterSpacing: "-0.03em", lineHeight: 1.15 }}>Become an A4 partner</div>
              <div style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: "#52525B", margin: "8px 0 22px" }}>We&apos;ll set up your reseller portal and walk you through the program. No cost to join.</div>
              {([["name", "Your name", "text", "name"], ["firm", "Firm name", "text", "organization"], ["email", "Work email", "email", "email"]] as const).map(([k, label, type, ac]) => (
                <div key={k} style={{ marginBottom: 14 }}>
                  <label htmlFor={`partner-${k}`} style={fieldLabel}>{label}</label>
                  <input id={`partner-${k}`} name={k} type={type} autoComplete={ac} className="pk-input" value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} style={lightInput} />
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                <Button variant="dark" size="md" onClick={submit} style={{ flex: 1 }}>Submit application <Icon name="arrow-right" size={16} color="#fff" /></Button>
                <Button variant="outline-light" size="md" onClick={() => setModal(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </KitModal>
      )}
    </section>
  );
}
