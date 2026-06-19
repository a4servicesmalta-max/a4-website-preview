"use client";

import React, { useState } from "react";
import { Icon, Button, Container, SectionHead, Reveal } from "./Primitives";

import { CLIENT_ONBOARDING_URL } from "@/lib/external-links";

const LP_TIERS = [
  { id: "starter", name: "Starter", price: 25, docs: "Up to 100 documents / month", blurb: "Perfect for sole traders and small companies." },
  { id: "unlimited", name: "Unlimited", price: 50, docs: "Unlimited documents", blurb: "Best value for active, growing businesses.", popular: true },
];

function LPStepper({ value, set, min = 1, max = 10 }: { value: number, set: (v: number) => void, min?: number, max?: number }) {
  const btnClass = "w-[34px] h-[34px] rounded-[var(--a4-r-md)] grid place-items-center cursor-pointer bg-[var(--a4-surface-soft)] border border-[var(--a4-hairline-light)] text-[var(--a4-ink)] transition-colors hover:bg-[var(--a4-hairline-light)]";
  return (
    <div className="flex items-center gap-[12px]">
      <button aria-label="decrease" onClick={() => set(Math.max(min, value - 1))} className={btnClass}><Icon name="minus" size={15} color="var(--a4-ink)" /></button>
      <span className="min-w-[20px] text-center a4-font-display font-medium text-[18px] text-[var(--a4-ink)] tabular-nums">{value}</span>
      <button aria-label="increase" onClick={() => set(Math.min(max, value + 1))} className={btnClass}><Icon name="plus" size={15} color="var(--a4-ink)" /></button>
    </div>
  );
}

function LPToggle({ on, set }: { on: boolean, set: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => set(!on)} className="w-[46px] h-[27px] rounded-full relative shrink-0 transition-colors duration-200 cursor-pointer" style={{
      border: "1px solid " + (on ? "var(--a4-primary)" : "var(--a4-hairline-strong)"),
      background: on ? "var(--a4-primary)" : "var(--a4-surface-card)",
    }}>
      <span className="absolute top-[2px] w-[21px] h-[21px] rounded-full bg-[#fff] shadow-[0_1px_3px_rgba(0,0,0,.2)] transition-all duration-200" style={{ left: on ? 21 : 2 }} />
    </button>
  );
}

const lpEuro = (n: number) => "€" + n.toLocaleString();

export function LandingPlan() {
  const [tier, setTier] = useState("unlimited");
  const [recon, setRecon] = useState(true);
  const [banks, setBanks] = useState(1);
  const [vat, setVat] = useState(true);
  const [payroll, setPayroll] = useState(false);
  const [emps, setEmps] = useState(2);
  const [annual, setAnnual] = useState(false);

  const [modal, setModal] = useState(false);
  const [booked, setBooked] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const selectedTier = LP_TIERS.find((t) => t.id === tier);
  const base = selectedTier ? selectedTier.price : 0;
  const reconFee = recon ? banks * 15 : 0;
  const vatFee = vat ? 35 : 0;
  const payFee = payroll ? 15 + emps * 5 : 0;
  const annualFee = annual ? 40 : 0;
  const total = base + reconFee + vatFee + payFee + annualFee;

  const lines = [
    { k: `Bookkeeping — ${selectedTier?.name}`, v: base },
    recon ? { k: `Bank reconciliation · ${banks} acct${banks > 1 ? "s" : ""}`, v: reconFee } : null,
    vat ? { k: "VAT returns", v: vatFee } : null,
    payroll ? { k: `Payroll · ${emps} employee${emps > 1 ? "s" : ""}`, v: payFee } : null,
    annual ? { k: "Annual accounts & tax", v: annualFee } : null,
  ].filter(Boolean) as { k: string; v: number }[];

  const submit = () => { if (!form.name || !form.email) return; setBooked("A4-" + Date.now().toString(36).toUpperCase().slice(-6)); };

  const addons = [
    { label: "Bank reconciliation", sub: "We match & reconcile every account", on: recon, set: setRecon, fee: "€15 / account", stepper: true },
    { label: "VAT returns", sub: "All four quarters filed with the CFR", on: vat, set: setVat, fee: "€35 / mo" },
    { label: "Payroll", sub: "FS5 submissions & payslips", on: payroll, set: setPayroll, fee: "from €25 / mo", emps: true },
    { label: "Annual accounts & tax", sub: "Year-end statements & return", on: annual, set: setAnnual, fee: "€40 / mo" },
  ];

  return (
    <section id="pricing" className="bg-[var(--a4-surface-soft)] py-[clamp(64px,9vw,104px)]">
      <Container>
        <Reveal><SectionHead
          align="center"
          eyebrow="Build your price"
          title="Bookkeeping from €25/month"
          sub="Choose your plan, add what you need, and see your fixed monthly price instantly. No long contracts — cancel anytime."
          maxWidth={620}
        /></Reveal>

        <Reveal delay={80} style={{ marginTop: 52 }}>
          <div className="lp-grid grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-[20px] items-start max-w-[1000px] mx-auto">
            {/* picker */}
            <div className="bg-[var(--a4-surface-card)] border border-[var(--a4-hairline-light)] rounded-[var(--a4-r-lg)] p-[clamp(24px,3vw,34px)] flex flex-col gap-[26px]">
              {/* tier */}
              <div>
                <div className="a4-font-body text-[14px] font-semibold text-[var(--a4-ink)]">1 · Choose your bookkeeping plan</div>
                <div className="lp-tiers grid grid-cols-1 sm:grid-cols-2 gap-[12px] mt-[14px]">
                  {LP_TIERS.map((t) => {
                    const on = tier === t.id;
                    return (
                      <button key={t.id} onClick={() => setTier(t.id)} className="text-left cursor-pointer relative rounded-[var(--a4-r-md)] p-[18px_18px_20px] transition-colors duration-150" style={{
                        background: on ? "var(--a4-surface-soft)" : "transparent",
                        border: "1.5px solid " + (on ? "var(--a4-primary)" : "var(--a4-hairline-light)"),
                      }}>
                        {t.popular && <span className="absolute top-[14px] right-[14px] a4-font-body text-[10px] font-bold tracking-[.04em] text-[#fff] bg-[var(--a4-primary)] rounded-full px-[9px] py-[3px]">POPULAR</span>}
                        <div className="a4-font-display font-medium text-[19px] text-[var(--a4-ink)]">{t.name}</div>
                        <div className="flex items-baseline gap-[4px] mt-[6px]">
                          <span className="a4-font-display font-medium text-[30px] text-[var(--a4-ink)] tracking-[-1px]">{lpEuro(t.price)}</span>
                          <span className="a4-font-body text-[13px] text-[var(--a4-mute)]">/mo</span>
                        </div>
                        <div className="a4-font-body text-[13px] font-semibold mt-[8px]" style={{ color: on ? "var(--a4-primary)" : "var(--a4-charcoal)" }}>{t.docs}</div>
                        <div className="a4-font-body text-[12.5px] leading-[1.45] text-[var(--a4-mute)] mt-[4px]">{t.blurb}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* add-ons */}
              <div>
                <div className="a4-font-body text-[14px] font-semibold text-[var(--a4-ink)]">2 · Add what you need</div>
                <div className="flex flex-col gap-[14px] mt-[14px]">
                  {addons.map((a) => (
                    <div key={a.label} className="rounded-[var(--a4-r-md)] border border-[var(--a4-hairline-light)] p-[15px_16px] transition-colors duration-150" style={{ background: a.on ? "var(--a4-surface-soft)" : "transparent" }}>
                      <div className="flex items-center gap-[14px]">
                        <div className="flex-1">
                          <div className="a4-font-body font-semibold text-[14.5px] text-[var(--a4-ink)]">{a.label} <span className="text-[var(--a4-mute)] font-medium">· {a.fee}</span></div>
                          <div className="a4-font-body text-[12.5px] text-[var(--a4-mute)] mt-[2px]">{a.sub}</div>
                        </div>
                        <LPToggle on={a.on} set={a.set} />
                      </div>
                      {a.stepper && recon && (
                        <div className="flex justify-between items-center mt-[13px] pt-[13px] border-t border-[var(--a4-hairline-light)]">
                          <span className="a4-font-body text-[12.5px] text-[var(--a4-charcoal)]">Bank accounts</span>
                          <LPStepper value={banks} set={setBanks} min={1} max={10} />
                        </div>
                      )}
                      {a.emps && payroll && (
                        <div className="flex justify-between items-center mt-[13px] pt-[13px] border-t border-[var(--a4-hairline-light)]">
                          <span className="a4-font-body text-[12.5px] text-[var(--a4-charcoal)]">Employees</span>
                          <LPStepper value={emps} set={setEmps} min={1} max={50} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* summary */}
            <div className="bg-[#000] rounded-[var(--a4-r-lg)] p-[clamp(24px,3vw,32px)] sticky top-[88px] text-[#fff]">
              <div className="a4-font-body text-[11px] uppercase tracking-[.12em] text-[var(--a4-on-dark-mute)]">Your monthly price</div>
              <div className="flex items-baseline gap-[8px] mt-[12px]">
                <span className="a4-font-display font-medium text-[54px] tracking-[-2px] leading-none tabular-nums">{lpEuro(total)}</span>
                <span className="a4-font-body text-[14px] text-[var(--a4-on-dark-mute)]">/ mo</span>
              </div>
              <div className="h-[1px] bg-[var(--a4-hairline-dark)] my-[22px_16px]" />
              <div className="flex flex-col gap-[10px]">
                {lines.map((l) => (
                  <div key={l.k} className="flex justify-between gap-[12px]">
                    <span className="a4-font-body text-[13.5px] text-[var(--a4-on-dark-mute)]">{l.k}</span>
                    <span className="a4-font-body text-[13.5px] font-medium whitespace-nowrap tabular-nums">{lpEuro(l.v)}/mo</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-[10px] mt-[24px]">
                <Button variant="primary" size="md" href={CLIENT_ONBOARDING_URL} target="_blank" style={{ width: "100%" }}>Create account &amp; request <Icon name="arrow-right" size={16} color="#000" /></Button>
                <Button variant="outline-dark" size="md" onClick={() => { setBooked(null); setModal(true); }} style={{ width: "100%" }}><Icon name="calendar" size={16} color="#fff" /> Book a 15-min call</Button>
              </div>
              <div className="flex items-center justify-center gap-[7px] mt-[14px]">
                <Icon name="shield-check" size={13} color="var(--a4-stone)" />
                <span className="a4-font-body text-[11.5px] text-[var(--a4-stone)]">Fixed price · reviewed by MIA-licensed accountants</span>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>

      {/* booking modal */}
      {modal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }} className="fixed inset-0 z-[300] bg-[rgba(0,0,0,.45)] backdrop-blur-[4px] flex items-center justify-center p-[24px]">
          <div className="bg-[var(--a4-surface-card)] border border-[var(--a4-hairline-light)] rounded-[var(--a4-r-lg)] w-full max-w-[440px] p-[30px] shadow-[0_32px_80px_rgba(0,0,0,.25)]">
            {booked ? (
              <div className="text-center py-[10px]">
                <div className="w-[54px] h-[54px] rounded-full bg-[rgba(0,168,126,.12)] grid place-items-center mx-auto mb-[16px]"><Icon name="check" size={26} color="var(--a4-accent-teal)" stroke={2.5} /></div>
                <div className="a4-font-display font-medium text-[22px] text-[var(--a4-ink)]">You're booked in</div>
                <div className="a4-font-body text-[14px] leading-[1.6] text-[var(--a4-mute)] mt-[10px]">Thanks, {form.name.split(" ")[0]}. We'll confirm your 15-minute call by email at <strong className="text-[var(--a4-ink)]">{form.email}</strong> within 2 business hours.</div>
                <div className="a4-font-body text-[12px] text-[var(--a4-stone)] mt-[14px]">Reference: {booked} · estimated {lpEuro(total)}/mo</div>
                <Button variant="outline-light" size="md" onClick={() => setModal(false)} style={{ width: "100%", marginTop: 22 }}>Close</Button>
              </div>
            ) : (
              <div>
                <div className="a4-font-display font-medium text-[22px] text-[var(--a4-ink)]">Book your free 15-min call</div>
                <div className="a4-font-body text-[13.5px] text-[var(--a4-mute)] my-[6px_0_22px]">We'll confirm your {lpEuro(total)}/mo plan and get you set up. No obligation.</div>
                {(Object.keys(form) as (keyof typeof form)[]).map((k) => {
                    const labels: Record<string, string> = { name: "Your name", email: "Email address", phone: "Phone (optional)" };
                    const types: Record<string, string> = { name: "text", email: "email", phone: "tel" };
                    return (
                        <div key={k} className="mb-[14px]">
                            <label className="block a4-font-body text-[11px] uppercase tracking-[.08em] text-[var(--a4-mute)] mb-[6px]">{labels[k]}</label>
                            <input type={types[k]} value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} className="w-full bg-[var(--a4-surface-soft)] border border-[var(--a4-hairline-light)] rounded-[var(--a4-r-md)] p-[11px_14px] text-[var(--a4-ink)] a4-font-body text-[14px] outline-none focus:border-[var(--a4-primary)]" />
                        </div>
                    );
                })}
                <div className="flex gap-[10px] mt-[22px]">
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
