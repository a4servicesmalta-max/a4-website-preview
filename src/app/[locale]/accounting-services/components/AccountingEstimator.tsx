"use client";

import React, { useState } from "react";
import { Button, Icon, Container } from "@/components/a4-landing/Primitives";
import { useQuoteActions } from "@/components/a4-landing/QuoteActions";
import type { QuotePayload } from "@/lib/quote-handoff";
import {
  SECTORS, TXN, ROUTES, VAT_REG, BEHIND, STEPS,
  calcAccountingFee, accountingSummary, euro,
  type AccountingInput, type RouteId, type VatRegId,
} from "@/lib/accounting-fee";
import { LAUNCH_PROMO, PRICING_VAT_NOTE, type TxnBand } from "@/data/a4QuotePack";

type Opt = { id: string; label: string; sub?: string };
const labelOf = (list: Opt[], id: string) => (list.find((o) => o.id === id) ?? list[0]).label;

function Pills({ items, value, set }: { items: Opt[]; value: string; set: (id: string) => void }) {
  return (
    <div role="group" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => set(o.id)}
            aria-pressed={on}
            style={{
              display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1,
              padding: "9px 16px", borderRadius: "var(--a4-r-md)",
              border: "1px solid " + (on ? "var(--a4-primary)" : "var(--a4-hairline-light)"),
              background: on ? "var(--a4-primary)" : "transparent",
              color: on ? "#fff" : "var(--a4-body)",
              fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600,
              cursor: "pointer", textAlign: "left",
              transition: "background .15s, color .15s, border-color .15s",
            }}
          >
            {o.label}
            {o.sub ? <span style={{ fontSize: 10.5, fontWeight: 400, opacity: 0.75 }}>{o.sub}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

const sliderStyle: React.CSSProperties = { flex: 1, accentColor: "var(--a4-primary)", cursor: "pointer" };
const readoutStyle: React.CSSProperties = { minWidth: 96, textAlign: "right", fontFamily: "var(--a4-font-display)", fontVariantNumeric: "tabular-nums", fontSize: 15, fontWeight: 600, color: "var(--a4-ink)" };
const tagLabel: React.CSSProperties = { fontFamily: "var(--a4-font-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--a4-primary)" };

const QUESTIONS: { title: string; help: string }[] = [
  { title: "What does the company do?", help: "Some sectors need extra checks when we take you on. It is built into the price rather than added later." },
  { title: "About how many transactions a month?", help: "Count each invoice, receipt and bank line. A rough number is fine — we confirm it before anything is agreed." },
  { title: "Who keeps the books?", help: "The software codes and reconciles either way. This is about how much of the judgement you want to hand over — review is cheaper because you do the bulk of the work." },
  { title: "Anyone on payroll?", help: "Payslips, monthly employer filing and annual returns, priced per person and cheaper as the team grows." },
  { title: "Are you VAT registered?", help: "VAT returns are built only from entries already approved and reconciled. On the software-only route you file them yourself." },
  { title: "Are the books up to date?", help: "If you are behind, we reconstruct the missed months as a one-off and your monthly plan takes over from there." },
  { title: "Your price", help: "Everything on the right is itemised — nothing appears later that is not on that list." },
];
const LAST = QUESTIONS.length - 1; // the price step

export function AccountingEstimator() {
  const [step, setStep] = useState(0);
  const [s, setS] = useState<AccountingInput>({
    sector: "shop", txn: "21-60", banks: 1, route: "review", head: 2, vatreg: "art10", behind: "0",
  });
  const set = (patch: Partial<AccountingInput>) => setS((a) => ({ ...a, ...patch }));

  const q = calcAccountingFee(s);
  const summary = accountingSummary(s, q);
  // Referral quotes carry no figures at all — read the discount through a
  // narrowed local so the referral branch stays type-safe.
  const discountPct = q.refer ? 0 : q.discountPct;
  const feeBig = q.refer ? "Let’s talk" : euro(q.monthlyNet);
  const feeMini = q.refer ? "Referral" : euro(q.monthlyNet) + " / mo";
  const feeNote = q.refer
    ? "We price most companies on the spot, but yours needs a short call with a director first. Usually the same day."
    : (q.discountPct > 0 ? `${LAUNCH_PROMO.label.replace("25% off", "25% launch discount")} already applied. ` : "") +
      (q.tier.label === "Standard" ? "" : `${q.tier.label}-risk sector loading included. `) +
      PRICING_VAT_NOTE;

  // The quote handed to sales — built fresh at submit time so it always
  // matches what is on screen.
  const payload = (): QuotePayload => ({
    page: "accounting",
    service: "Accounting & bookkeeping",
    headline: q.refer ? "Referral — needs a director call" : `${euro(q.monthlyNet)} / month${q.oneOffFull > 0 ? ` + ${euro(q.oneOffNet)} one-off` : ""}`,
    lines: q.refer ? [{ k: "Sector", v: "Needs a director call" }] : [
      ...q.monthly.map((l) => ({ k: l.k, v: euro(l.v) + " /mo" })),
      ...q.oneOff.map((l) => ({ k: l.k, v: euro(l.v) + " one-off" })),
      ...(q.discountPct > 0 ? [{ k: `Launch discount (${Math.round(q.discountPct * 100)}%)`, v: "− " + euro(q.monthlyFull - q.monthlyNet) + " /mo" }] : []),
    ],
    services: q.refer ? ["Accounting — referral"] : [
      s.route === "self" ? `A4 Books ${q.softwareTier} plan — software only` : s.route === "review" ? `A4 Books ${q.softwareTier} plan + accountant review` : `A4 Books ${q.softwareTier} plan + full bookkeeping by A4`,
      ...(s.head > 0 ? [`Payroll for ${s.head} ${s.head === 1 ? "person" : "people"}`] : []),
      ...(s.vatreg !== "none" && s.route !== "self" ? [`VAT returns (${labelOf(VAT_REG, s.vatreg)})`] : []),
      ...(s.banks > 1 ? [`${s.banks} bank accounts`] : []),
      ...(parseInt(s.behind, 10) > 0 ? [`Catch-up: ${s.behind} months behind`] : []),
    ],
    answers: [
      { k: "Sector", v: labelOf(SECTORS, s.sector) },
      { k: "Transactions / month", v: labelOf(TXN, s.txn) },
      { k: "Who keeps the books", v: labelOf(ROUTES, s.route) },
      { k: "Payroll headcount", v: String(s.head) },
      { k: "VAT registration", v: labelOf(VAT_REG, s.vatreg) },
      { k: "Bank accounts", v: String(s.banks) },
      { k: "Books up to date", v: labelOf(BEHIND, s.behind) },
      { k: "Risk tier", v: q.refer ? "Referral" : q.tier.label },
    ],
    plan: q.refer ? undefined : q.softwareTier,
    note: q.refer ? undefined : feeNote,
  });
  const { start, modal } = useQuoteActions(payload);

  return (
    <section
      id="estimate"
      style={{ background: "radial-gradient(800px 420px at 15% 0%, rgba(73,79,223,.30) 0%, rgba(73,79,223,0) 65%), #0A0A0A", padding: "clamp(56px,8vw,88px) 0 clamp(60px,8vw,96px)" }}
    >
      <Container>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,.75)" }}>• Bookkeeping calculator</div>
          <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: "clamp(28px,3.6vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em", color: "#fff", margin: "16px 0 0", textWrap: "balance" }}>
            Your monthly price, in sixty seconds
          </h2>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 15.5, lineHeight: 1.7, color: "rgba(255,255,255,.7)", margin: "14px auto 0", maxWidth: "56ch", textWrap: "pretty" }}>
            Six quick questions — the figure builds as you answer{discountPct > 0 ? ", with the 25% launch discount already applied" : ""}. No form, no call.
          </p>
        </div>

        <div className="af-grid" style={{ maxWidth: 1040, margin: "32px auto 0" }}>
          {/* step rail */}
          <div className="af-rail" style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left", position: "sticky", top: 90 }}>
            {STEPS.map((label, i) => {
              const active = i === step;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setStep(i)}
                  aria-current={active ? "step" : undefined}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "var(--a4-r-md)",
                    border: 0, background: active ? "rgba(255,255,255,.14)" : "transparent",
                    cursor: "pointer", fontFamily: "var(--a4-font-body)", textAlign: "left", transition: "background .2s ease",
                  }}
                >
                  <span style={{
                    width: 24, height: 24, borderRadius: "var(--a4-r-full)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none",
                    background: active ? "#fff" : "rgba(255,255,255,.16)",
                    color: active ? "var(--a4-ink)" : "rgba(255,255,255,.7)",
                    fontSize: 10.5, fontWeight: 700, fontVariantNumeric: "tabular-nums", transition: "background .2s ease, color .2s ease",
                  }}>{i === LAST ? "✓" : i + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: active ? "#fff" : "rgba(255,255,255,.62)", transition: "color .2s ease" }}>{label}</span>
                </button>
              );
            })}
          </div>

          {/* question card */}
          <div style={{ background: "var(--a4-surface-card)", borderRadius: "var(--a4-r-lg)", padding: "clamp(22px,3vw,30px)", display: "flex", flexDirection: "column", gap: 18, textAlign: "left", minHeight: 380 }}>
            <div>
              <div style={tagLabel}>{step === LAST ? "Your price" : `Question ${step + 1} of ${LAST}`}</div>
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 21, letterSpacing: "-.015em", color: "var(--a4-ink)", margin: "8px 0 0" }}>{QUESTIONS[step].title}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, lineHeight: 1.6, color: "var(--a4-mute)", margin: "8px 0 0", textWrap: "pretty" }}>{QUESTIONS[step].help}</p>
            </div>

            {step === 0 && (
              <Pills
                items={SECTORS.map((x) => ({ id: x.id, label: x.label, sub: x.tier === "standard" ? "" : x.tier === "refer" ? "needs a call" : `${x.tier} risk` }))}
                value={s.sector}
                set={(id) => set({ sector: id })}
              />
            )}

            {step === 1 && (
              <>
                <Pills items={TXN} value={s.txn} set={(id) => set({ txn: id as TxnBand })} />
                <div style={{ border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "14px 16px" }}>
                  <label htmlFor="ae-banks" style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, color: "var(--a4-ink)" }}>Bank accounts</label>
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-stone)", marginTop: 2 }}>
                    The first is included — each additional account adds €25 a month when we keep the books, €10 on review.
                  </div>
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 16 }}>
                    <input id="ae-banks" type="range" min={1} max={8} step={1} value={s.banks} onChange={(e) => set({ banks: +e.target.value })} style={sliderStyle} />
                    <span style={readoutStyle}>{s.banks} {s.banks === 1 ? "account" : "accounts"}</span>
                  </div>
                </div>
              </>
            )}

            {step === 2 && <Pills items={ROUTES} value={s.route} set={(id) => set({ route: id as RouteId })} />}

            {step === 3 && (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <label htmlFor="ae-head" className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>People on payroll</label>
                <input id="ae-head" type="range" min={0} max={50} step={1} value={s.head} onChange={(e) => set({ head: +e.target.value })} style={sliderStyle} />
                <span style={readoutStyle}>{s.head === 0 ? "Nobody" : `${s.head} ${s.head === 1 ? "person" : "people"}`}</span>
              </div>
            )}

            {step === 4 && <Pills items={VAT_REG} value={s.vatreg} set={(id) => set({ vatreg: id as VatRegId })} />}

            {step === 5 && <Pills items={BEHIND} value={s.behind} set={(id) => set({ behind: id })} />}

            {step === LAST && (
              <div>
                <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, lineHeight: 1.65, color: "var(--a4-body)", margin: 0, textWrap: "pretty" }}>{summary}</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                  <Button variant="dark" size="md" onClick={() => start("proposal")}>Request a proposal <Icon name="arrow-right" size={16} color="#fff" /></Button>
                  {!q.refer && <Button variant="cobalt" size="md" onClick={() => start("account")}>Create my account</Button>}
                </div>
                <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, color: "var(--a4-stone)", margin: "10px 0 0" }}>Confirmed after a short call. {PRICING_VAT_NOTE}</p>
              </div>
            )}

            <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--a4-hairline-light)", display: "flex", alignItems: "center", gap: 12 }}>
              {step !== LAST && (
                <>
                  <button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
                    style={{ height: 36, padding: "0 16px", borderRadius: "var(--a4-r-full)", border: "1px solid var(--a4-hairline-light)", background: "transparent", color: "var(--a4-mute)", fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, cursor: step === 0 ? "default" : "pointer", opacity: step === 0 ? 0.45 : 1 }}>Back</button>
                  <button type="button" onClick={() => setStep(Math.min(LAST, step + 1))}
                    style={{ height: 36, padding: "0 18px", borderRadius: "var(--a4-r-full)", border: "1px solid var(--a4-ink)", background: "var(--a4-ink)", color: "#fff", fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>{step === LAST - 1 ? "See my price" : "Next"}</button>
                </>
              )}
              <span style={{ marginLeft: "auto", fontFamily: "var(--a4-font-display)", fontVariantNumeric: "tabular-nums", fontSize: 15, fontWeight: 600, color: "var(--a4-ink)" }}>{feeMini}</span>
            </div>
          </div>

          {/* price panel */}
          <div className="af-panel" style={{ background: "#101114", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", padding: "clamp(22px,3vw,30px)", color: "#fff", position: "sticky", top: 90, textAlign: "left" }}>
            <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--a4-stone)" }}>Your monthly price</div>

            {!q.refer && q.discountPct > 0 && (
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--a4-font-display)", fontVariantNumeric: "tabular-nums", fontSize: 16, color: "rgba(255,255,255,.45)", textDecoration: "line-through" }}>{euro(q.monthlyFull)}</span>
                <span style={{ padding: "3px 10px", borderRadius: "var(--a4-r-full)", background: "rgba(224,105,94,.18)", border: "1px solid rgba(224,105,94,.45)", color: "#F2A49C", fontFamily: "var(--a4-font-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
                  {Math.round(q.discountPct * 100)}% off
                </span>
              </div>
            )}

            <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontVariantNumeric: "tabular-nums", fontSize: 38, letterSpacing: "-1.5px", lineHeight: 1, color: q.refer ? "#fff" : "#F2A49C" }}>{feeBig}</span>
              {!q.refer && <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "var(--a4-on-dark-mute)" }}>/ month</span>}
            </div>

            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--a4-hairline-dark)", display: "flex", flexDirection: "column", gap: 9 }}>
              {(q.refer ? [{ k: "Sector", v: "Needs a call" }] : [
                ...q.monthly.map((l) => ({ k: l.k, v: euro(l.v) })),
                ...q.oneOff.map((l) => ({ k: l.k, v: euro(q.discountPct > 0 ? l.v * (1 - q.discountPct) : l.v) + " one-off" })),
              ]).map((l) => (
                <span key={l.k} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontFamily: "var(--a4-font-body)", fontSize: 12.5 }}>
                  <span style={{ color: "var(--a4-on-dark-mute)" }}>{l.k}</span>
                  <span style={{ color: "#fff", fontWeight: 500, whiteSpace: "nowrap" }}>{l.v}</span>
                </span>
              ))}
            </div>

            <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, lineHeight: 1.6, color: "var(--a4-stone)", margin: "18px 0 0", paddingTop: 16, borderTop: "1px solid var(--a4-hairline-dark)" }}>{feeNote}</p>

            <Button variant="primary" size="md" onClick={() => start("proposal")} style={{ width: "100%", marginTop: 18 }}>
              Request a proposal <Icon name="arrow-right" size={16} color="#000" />
            </Button>
            {!q.refer && (
              <Button variant="outline-dark" size="md" onClick={() => start("account")} style={{ width: "100%", marginTop: 10 }}>
                Create my account
              </Button>
            )}
          </div>
        </div>
      </Container>
      {modal}
    </section>
  );
}
