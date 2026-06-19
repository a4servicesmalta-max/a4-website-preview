// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Logo, Button, Pill, Badge, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
// Pick a bookkeeping tier + add-ons → live monthly price → two exits:
// (1) Create account & request services, (2) Book a 15-min call.

import { CLIENT_ONBOARDING_URL } from "@/lib/external-links";

const LP_TIERS = [
  { id: "starter", name: "Starter", price: 25, docs: "Up to 100 documents / month", blurb: "Perfect for lighter monthly volumes." },
  { id: "unlimited", name: "Unlimited", price: 50, docs: "Unlimited documents", blurb: "Best value for active, growing books.", popular: true },
];

// VAT returns — frequency drives the monthly-equivalent fee. Quarterly is the
// Malta default; some businesses file monthly, some annually.
const LP_VAT = {
  annual: { label: "Annually", fee: 15 },
  quarterly: { label: "Quarterly", fee: 35 },
  monthly: { label: "Monthly", fee: 60 },
};

// Once-a-year items (billed annually, not monthly). Audit & tax are "from" —
// final fee depends on size/complexity.
const LP_ANNUAL_ITEMS = {
  company: [
    { id: "accounts", label: "Annual financial statements", sub: "Year-end statutory accounts", fee: 300, from: true },
    { id: "tax", label: "Corporate tax return", sub: "Prepared & filed with the CFR", fee: 250, from: true },
    { id: "audit", label: "Statutory audit", sub: "Independent audit, if your company requires one", fee: 600, from: true },
  ],
  personal: [
    { id: "tax", label: "Personal tax return", sub: "Year-end income tax return, prepared & filed", fee: 250, from: true },
  ],
};

export function LPStepper({ value, set, min = 1, max = 10 }) {
  const btn = { width: 34, height: 34, borderRadius: "var(--a4-r-md)", display: "grid", placeItems: "center", cursor: "pointer", background: "var(--a4-surface-soft)", border: "1px solid var(--a4-hairline-light)", color: "var(--a4-ink)" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button aria-label="decrease" onClick={() => set(Math.max(min, value - 1))} style={btn}><Icon name="minus" size={15} color="var(--a4-ink)" /></button>
      <span style={{ minWidth: 20, textAlign: "center", fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 18, color: "var(--a4-ink)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      <button aria-label="increase" onClick={() => set(Math.min(max, value + 1))} style={btn}><Icon name="plus" size={15} color="var(--a4-ink)" /></button>
    </div>
  );
}

export function LPToggle({ on, set }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => set(!on)} style={{
      width: 46, height: 27, borderRadius: 999, border: "1px solid " + (on ? "var(--a4-primary)" : "var(--a4-hairline-strong)"),
      background: on ? "var(--a4-primary)" : "var(--a4-surface-card)", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background .2s, border-color .2s",
    }}>
      <span style={{ position: "absolute", top: 2, left: on ? 21 : 2, width: 21, height: 21, borderRadius: 999, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "left .2s ease" }} />
    </button>
  );
}

const lpEuro = (n) => "€" + n.toLocaleString();

export function LandingPlan() {
  const [entity, setEntity] = useState("company");
  const [tier, setTier] = useState("unlimited");
  const [recon, setRecon] = useState(true);
  const [banks, setBanks] = useState(1);
  const [vat, setVat] = useState(true);
  const [vatFreq, setVatFreq] = useState("quarterly");
  const [payroll, setPayroll] = useState(false);
  const [emps, setEmps] = useState(2);
  const [review, setReview] = useState(false);
  const [annualSel, setAnnualSel] = useState({ accounts: true, tax: true, audit: false });

  const [modal, setModal] = useState(false);
  const [booked, setBooked] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const isCompany = entity === "company";
  // Switching to personal turns off company-only payroll.
  const setEntityAndSync = (e) => { setEntity(e); if (e === "personal") setPayroll(false); };
  const toggleAnnual = (id) => setAnnualSel((s) => ({ ...s, [id]: !s[id] }));

  const base = LP_TIERS.find((t) => t.id === tier).price;
  const reconFee = recon ? banks * 15 : 0;
  const vatFee = vat ? LP_VAT[vatFreq].fee : 0;
  const payFee = isCompany && payroll ? 15 + emps * 5 : 0;
  const reviewFee = review ? 40 : 0;
  const monthly = base + reconFee + vatFee + payFee + reviewFee;       // recurring
  const annualItems = LP_ANNUAL_ITEMS[entity];
  const selectedAnnual = annualItems.filter((it) => annualSel[it.id]);
  const annualFee = selectedAnnual.reduce((s, it) => s + it.fee, 0); // once a year

  const lines = [
    { k: `Bookkeeping — ${LP_TIERS.find((t) => t.id === tier).name}`, v: base },
    recon && { k: `Bank reconciliation · ${banks} acct${banks > 1 ? "s" : ""}`, v: reconFee },
    vat && { k: `VAT returns · ${LP_VAT[vatFreq].label.toLowerCase()}`, v: vatFee },
    isCompany && payroll && { k: `Payroll · ${emps} employee${emps > 1 ? "s" : ""}`, v: payFee },
    review && { k: "Accountant review", v: reviewFee },
  ].filter(Boolean);

  const submit = () => { if (!form.name || !form.email) return; setBooked("A4-" + Date.now().toString(36).toUpperCase().slice(-6)); };

  const monthlyAddons = [
    { id: "recon", label: "Bank reconciliation", sub: "We match & reconcile every account", on: recon, set: setRecon, fee: "€15 / account", stepper: true },
    { id: "vat", label: "VAT returns", sub: "Filed with the CFR", on: vat, set: setVat, fee: `€${LP_VAT[vatFreq].fee} / mo`, freq: true },
    isCompany && { id: "pay", label: "Payroll", sub: "FS5 submissions & payslips", on: payroll, set: setPayroll, fee: "from €25 / mo", emps: true },
    { id: "review", label: "Accountant review", sub: "A qualified accountant reviews your postings and passes the necessary journal entries", on: review, set: setReview, fee: "€40 / mo" },
  ].filter(Boolean);

  const fieldLabel = { fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, color: "var(--a4-ink)" };
  const fieldSub = { fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-mute)", marginTop: 2 };

  return (
    <section id="pricing" style={{ background: "var(--a4-surface-soft)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead
          align="center"
          eyebrow="Build your price"
          title="Bookkeeping from €25/month"
          sub="Create your account and run your bookkeeping in the A4 app — you upload, our automation does the rest. Add an accountant review whenever you want a qualified accountant to check the postings. Fixed monthly price, cancel anytime."
          maxWidth={620}
        /></Reveal>

        <Reveal delay={80} style={{ marginTop: 52 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20, alignItems: "start", maxWidth: 1000, margin: "0 auto" }} className="lp-grid">
            {/* picker */}
            <div style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", padding: "clamp(24px,3vw,34px)", display: "flex", flexDirection: "column", gap: 26 }}>
              {/* entity toggle */}
              <div>
                <div style={fieldLabel}>I'm a…</div>
                <div style={{ display: "flex", gap: 6, marginTop: 12, background: "var(--a4-surface-soft)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-full)", padding: 5 }}>
                  {[["company", "Company", "building-2"], ["personal", "Personal / sole trader", "user"]].map(([id, label, icon]) => {
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

              {/* tier */}
              <div>
                <div style={fieldLabel}>1 · Choose your bookkeeping plan</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }} className="lp-tiers">
                  {LP_TIERS.map((t) => {
                    const on = tier === t.id;
                    return (
                      <button key={t.id} onClick={() => setTier(t.id)} style={{
                        textAlign: "left", cursor: "pointer", position: "relative",
                        background: on ? "var(--a4-surface-soft)" : "transparent",
                        border: "1.5px solid " + (on ? "var(--a4-primary)" : "var(--a4-hairline-light)"),
                        borderRadius: "var(--a4-r-md)", padding: "18px 18px 20px", transition: "border-color .15s, background .15s",
                      }}>
                        {t.popular && <span style={{ position: "absolute", top: 14, right: 14, fontFamily: "var(--a4-font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".04em", color: "#fff", background: "var(--a4-primary)", borderRadius: "var(--a4-r-full)", padding: "3px 9px" }}>POPULAR</span>}
                        <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 19, color: "var(--a4-ink)" }}>{t.name}</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 6 }}>
                          <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 30, color: "var(--a4-ink)", letterSpacing: "-1px" }}>{lpEuro(t.price)}</span>
                          <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "var(--a4-mute)" }}>/mo</span>
                        </div>
                        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, color: on ? "var(--a4-primary)" : "var(--a4-charcoal)", marginTop: 8 }}>{t.docs}</div>
                        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, lineHeight: 1.45, color: "var(--a4-mute)", marginTop: 4 }}>{t.blurb}</div>
                      </button>
                    );
                  })}
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
                      {a.stepper && recon && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 13, paddingTop: 13, borderTop: "1px solid var(--a4-hairline-light)" }}>
                          <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-charcoal)" }}>Bank accounts</span>
                          <LPStepper value={banks} set={setBanks} min={1} max={10} />
                        </div>
                      )}
                      {a.emps && payroll && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 13, paddingTop: 13, borderTop: "1px solid var(--a4-hairline-light)" }}>
                          <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-charcoal)" }}>Employees</span>
                          <LPStepper value={emps} set={setEmps} min={1} max={50} />
                        </div>
                      )}
                      {a.freq && vat && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 13, paddingTop: 13, borderTop: "1px solid var(--a4-hairline-light)" }}>
                          <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-charcoal)" }}>Filing frequency</span>
                          <div style={{ display: "flex", gap: 5, background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-full)", padding: 4 }}>
                            {Object.entries(LP_VAT).map(([k, v]) => {
                              const on = vatFreq === k;
                              return (
                                <button key={k} onClick={() => setVatFreq(k)} style={{
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
                  {annualItems.map((it) => {
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
                <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 54, letterSpacing: "-2px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{lpEuro(monthly)}</span>
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, color: "var(--a4-on-dark-mute)" }}>/ mo</span>
              </div>
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
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-stone)", marginTop: 8 }}>Billed once a year. Audit &amp; tax fees are estimates, confirmed after a quick review.</div>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
                <Button variant="primary" size="md" href={CLIENT_ONBOARDING_URL} target="_blank" style={{ width: "100%" }}>Create account &amp; request <Icon name="arrow-right" size={16} color="#000" /></Button>
                <Button variant="outline-dark" size="md" onClick={() => { setBooked(null); setModal(true); }} style={{ width: "100%" }}><Icon name="calendar" size={16} color="#fff" /> Book a 15-min call</Button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 14 }}>
                <Icon name="shield-check" size={13} color="var(--a4-stone)" />
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-stone)" }}>Fixed price · reviewed by a licensed audit firm · service begins upon KYC approval</span>
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
                <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "var(--a4-ink)" }}>You're booked in</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--a4-mute)", margin: "10px 0 0" }}>Thanks, {form.name.split(" ")[0]}. We'll confirm your 15-minute call by email at <strong style={{ color: "var(--a4-ink)" }}>{form.email}</strong> within 2 business hours.</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-stone)", marginTop: 14 }}>Reference: {booked} · {lpEuro(monthly)}/mo{annualFee > 0 ? ` + ${lpEuro(annualFee)}/yr` : ""}</div>
                <Button variant="outline-light" size="md" onClick={() => setModal(false)} style={{ width: "100%", marginTop: 22 }}>Close</Button>
              </div>
            ) : (
              <div>
                <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "var(--a4-ink)" }}>Book your free 15-min call</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, color: "var(--a4-mute)", margin: "6px 0 22px" }}>We'll confirm your {lpEuro(monthly)}/mo{annualFee > 0 ? ` + ${lpEuro(annualFee)}/yr` : ""} plan and get you set up. No obligation.</div>
                {[["name", "Your name", "text"], ["email", "Email address", "email"], ["phone", "Phone (optional)", "tel"]].map(([k, label, type]) => (
                  <div key={k} style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontFamily: "var(--a4-font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--a4-mute)", marginBottom: 6 }}>{label}</label>
                    <input type={type} value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} style={{ width: "100%", background: "var(--a4-surface-soft)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "11px 14px", color: "var(--a4-ink)", fontFamily: "var(--a4-font-body)", fontSize: 14, outline: "none" }} />
                  </div>
                ))}
                <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                  <Button variant="dark" size="md" onClick={submit} style={{ flex: 1 }}>Confirm call <Icon name="arrow-right" size={16} color="#fff" /></Button>
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
