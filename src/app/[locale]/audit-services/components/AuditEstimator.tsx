"use client";

import React, { useState, useRef } from "react";
import { Button, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
// turnover, balance-sheet size and complexity. Captures the lead via a
// "request proposal / book consultation" modal.

import { Field, primaryBtn, outlineBtn } from "@/app/[locale]/accounting-health-check/components/Field";
import { FindingsList } from "@/app/[locale]/accounting-health-check/components/FindingsList";
import type { ReviewResponse } from "@/app/api/fs-gap-review/types";

const AE_TURNOVER = [
  { label: "Under €100k", mult: 1.0 },
  { label: "€100k–€500k", mult: 1.4 },
  { label: "€500k–€1M", mult: 1.9 },
  { label: "€1M–€5M", mult: 2.8 },
  { label: "€5M+", mult: 4.0 },
];
const AE_BS = [{ label: "Small", add: 0 }, { label: "Medium", add: 150 }, { label: "Large", add: 400 }];
const AE_TX = [{ label: "Low", add: 0 }, { label: "Medium", add: 200 }, { label: "High", add: 500 }];

const aeEuro = (n: number) => "€" + n.toLocaleString();
// Annual tax-return add-on, tiered by the audit fee.
const aeTaxFee = (audit: number) => audit < 1500 ? 250 : audit < 3000 ? 350 : audit < 5000 ? 450 : 600;

type ToggleRowProps = { label: string; sub: string; fee: number; on: boolean; set: (v: boolean) => void };
export function AEToggleRow({ label, sub, fee, on, set }: ToggleRowProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, borderRadius: "var(--a4-r-md)", border: "1px solid var(--a4-hairline-light)", padding: "14px 16px", background: on ? "var(--a4-surface-soft)" : "transparent", transition: "background .15s" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, fontWeight: 600, color: "var(--a4-ink)" }}>{label} <span style={{ color: "var(--a4-mute)", fontWeight: 500 }}>· +{aeEuro(fee)}</span></div>
        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-mute)", marginTop: 2 }}>{sub}</div>
      </div>
      <button role="switch" aria-checked={on} onClick={() => set(!on)} style={{
        width: 46, height: 27, borderRadius: 999, border: "1px solid " + (on ? "var(--a4-ink)" : "var(--a4-hairline-strong)"),
        background: on ? "var(--a4-ink)" : "var(--a4-surface-card)", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background .2s, border-color .2s",
      }}>
        <span style={{ position: "absolute", top: 2, left: on ? 21 : 2, width: 21, height: 21, borderRadius: 999, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "left .2s ease" }} />
      </button>
    </div>
  );
}

type PillItem = { label: string; mult?: number; add?: number };
type PillsProps = { items: PillItem[]; value: number; set: (i: number) => void };
export function AEPills({ items, value, set }: PillsProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
      {items.map((it, i) => {
        const on = value === i;
        return (
          <button key={it.label} onClick={() => set(i)} style={{
            fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer",
            padding: "8px 14px", borderRadius: "var(--a4-r-full)",
            background: on ? "var(--a4-ink)" : "transparent", color: on ? "#fff" : "var(--a4-mute)",
            border: "1px solid " + (on ? "var(--a4-ink)" : "var(--a4-hairline-light)"), transition: "background .15s, color .15s",
          }}>{it.label}</button>
        );
      })}
    </div>
  );
}

export function AuditEstimator() {
  const [turn, setTurn] = useState(1);
  const [bs, setBs] = useState(0);
  const [tx, setTx] = useState(1);
  const [group, setGroup] = useState(false);
  const [regulated, setRegulated] = useState(false);
  const [taxReturn, setTaxReturn] = useState(false);

  const [modal, setModal] = useState(false);
  const [intent, setIntent] = useState<"proposal" | "consultation">("proposal");
  const [done, setDone] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "" });
  const [mode, setMode] = useState<"first" | "returning">("first");
  const [rFile, setRFile] = useState<File | null>(null);
  const [rStatus, setRStatus] = useState<"idle" | "loading" | "error">("idle");
  const [rError, setRError] = useState("");
  const [rData, setRData] = useState<ReviewResponse | null>(null);
  const rInput = useRef<HTMLInputElement>(null);

  // Email confirmation gate — the real review only runs once the email is verified.
  const [rConsent, setRConsent] = useState(false);
  const [rVerifiedToken, setRVerifiedToken] = useState("");
  const [rVerifiedEmail, setRVerifiedEmail] = useState("");
  const [rChallengeToken, setRChallengeToken] = useState("");
  const [rCode, setRCode] = useState("");
  const [rCodeSent, setRCodeSent] = useState(false);
  const [rDevCode, setRDevCode] = useState("");
  const [rVBusy, setRVBusy] = useState(false);
  const [rVErr, setRVErr] = useState("");

  const rEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const rVerified = !!rVerifiedToken && rVerifiedEmail.toLowerCase() === form.email.trim().toLowerCase();

  const rSendCode = async () => {
    setRVBusy(true); setRVErr(""); setRDevCode("");
    try {
      const r = await fetch("/api/verify/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.email }) });
      const b = await r.json();
      if (!r.ok) { setRVErr(b.error || "Could not send a code."); return; }
      // Server tells us whether the email actually went out — never claim "sent" when it didn't.
      if (!b.delivered && !b.devCode) { setRVErr("We couldn't send the code email right now. Please try again in a few minutes, or email info@a4.com.mt."); return; }
      setRChallengeToken(b.challengeToken); setRCodeSent(true);
      if (b.devCode) setRDevCode(b.devCode);
    } catch { setRVErr("Could not send a code. Please try again."); }
    finally { setRVBusy(false); }
  };

  const rConfirmCode = async () => {
    setRVBusy(true); setRVErr("");
    try {
      const r = await fetch("/api/verify/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.email, code: rCode, challengeToken: rChallengeToken }) });
      const b = await r.json();
      if (!r.ok) { setRVErr(b.error || "Verification failed."); return; }
      setRVerifiedToken(b.verifiedToken); setRVerifiedEmail(form.email);
    } catch { setRVErr("Verification failed. Please try again."); }
    finally { setRVBusy(false); }
  };

  const rOnFile = (f: File | null | undefined) => { if (f) setRFile(f); };
  const rReset = () => {
    setRFile(null); setRData(null); setRStatus("idle"); setRError("");
    setRConsent(false); setRVerifiedToken(""); setRVerifiedEmail(""); setRCodeSent(false); setRCode("");
  };
  const rSubmitDisabled = rStatus === "loading" || !rConsent || !rVerified || !rFile;
  const rRunReview = async () => {
    if (rSubmitDisabled || !rFile) return;
    setRStatus("loading"); setRError("");
    const fd = new FormData();
    fd.append("email", form.email); fd.append("name", form.name); fd.append("company", form.company);
    fd.append("consent", String(rConsent)); fd.append("verifiedToken", rVerifiedToken);
    fd.append("file", rFile); fd.append("kind", "fs");
    try {
      const res = await fetch("/api/fs-gap-review", { method: "POST", body: fd });
      const body = await res.json();
      if (!res.ok) { setRError(body.error || "Review failed."); setRStatus("error"); return; }
      setRData(body); setRStatus("idle");
    } catch { setRError("Review failed. Please try again or book a call."); setRStatus("error"); }
  };

  const fee = Math.round((600 * AE_TURNOVER[turn].mult + AE_BS[bs].add + AE_TX[tx].add + (group ? 600 : 0) + (regulated ? 450 : 0)) / 50) * 50;
  // When a real engine quote exists (returning-client review), use it in the
  // proposal/consultation request instead of the size-model estimator fee.
  const modalFee = rData?.quote?.fee ?? fee;

  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const open = (i: "proposal" | "consultation") => { setIntent(i); setDone(null); setModalError(""); setModal(true); };
  const submit = async () => {
    if (!form.name || !form.email) return;
    setModalSubmitting(true); setModalError("");
    const ref = "A4-" + Date.now().toString(36).toUpperCase().slice(-6);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: `Audit ${intent === "proposal" ? "proposal request" : "consultation booking"} — ${form.company || form.name}`,
          message: `Company: ${form.company}\nPhone: ${form.phone}\nEstimated audit fee: ${aeEuro(modalFee)}/yr\nReference: ${ref}`,
          context: `audit-estimator-${intent}`,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setDone(ref);
    } catch {
      setModalError("Something went wrong sending your request. Please try again or email info@a4.com.mt.");
    } finally {
      setModalSubmitting(false);
    }
  };

  const fieldLabel = { fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, color: "var(--a4-ink)" };
  const sub = { fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-mute)", marginTop: 6 };

  return (
    <section id="estimate" style={{ background: "var(--a4-surface-soft)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead
          align="center"
          eyebrow="Audit fee estimator"
          title="Statutory audit, from €600/year"
          sub="Every Maltese company must file audited financial statements. Get a transparent estimate of your audit fee in seconds — the final fee is fixed after a short scoping call."
          maxWidth={640}
        /></Reveal>

        <Reveal delay={80} style={{ marginTop: 40 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
            <div style={{ display: "inline-flex", gap: 4, background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-full)", padding: 4 }}>
              {([["first", "First audit"], ["returning", "Already audited before"]] as const).map(([k, lbl]) => (
                <button key={k} onClick={() => setMode(k)} style={{ padding: "9px 18px", borderRadius: "var(--a4-r-full)", border: 0, cursor: "pointer", fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, background: mode === k ? "var(--a4-ink)" : "transparent", color: mode === k ? "#fff" : "var(--a4-mute)" }}>{lbl}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mode === "returning" ? "1fr" : "1.3fr 1fr", gap: 20, alignItems: "start", maxWidth: 1000, margin: "0 auto" }} className="ae-grid">
            {/* inputs */}
            {mode === "returning" ? (
              <div style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", padding: "clamp(24px,3.2vw,38px)", maxWidth: 640, marginLeft: "auto", marginRight: "auto", width: "100%" }}>
                {rData ? (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--a4-mute)", display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}><Icon name="file-check-2" size={16} color="var(--a4-primary)" /> {rData.framework} review — {rData.company}</span>
                      <button onClick={rReset} style={{ background: "none", border: 0, cursor: "pointer", color: "var(--a4-mute)", fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>New</button>
                    </div>
                    <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "var(--a4-mute)", marginTop: 10 }}>{rData.stats.checks_run} checks · {rData.stats.checks_passed} passed · {rData.stats.checks_failed} flagged</div>
                    {rData.quote && (
                      <div style={{ background: "#000", borderRadius: "var(--a4-r-lg)", padding: "clamp(20px,3vw,28px)", color: "#fff", marginTop: 16 }}>
                        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--a4-on-dark-mute)" }}>Estimated A4 audit fee</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 10 }}>
                          <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 40, letterSpacing: "-1.5px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{aeEuro(rData.quote.fee)}</span>
                          <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, color: "var(--a4-on-dark-mute)" }}>/ year</span>
                        </div>
                        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "var(--a4-on-dark-mute)", marginTop: 10, lineHeight: 1.5 }}>
                          {rData.quote.docKind === "management_accounts"
                            ? "Based on the size and complexity of your management accounts — fixed after a short scoping call."
                            : "From our own scoping model — fixed after a short scoping call."}
                        </div>
                      </div>
                    )}
                    <div style={{ marginTop: 14 }}><FindingsList findings={rData.findings} /></div>
                    <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--a4-hairline-light)" }}>
                      <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "var(--a4-mute)", marginBottom: 10 }}>Want a fixed fee for your next audit?</div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <Button variant="dark" size="md" onClick={() => open("proposal")} style={{ flex: "1 1 200px" }}>Request a fixed fee <Icon name="arrow-right" size={16} color="#fff" /></Button>
                        <Button variant="cobalt" size="md" onClick={() => open("consultation")} style={{ flex: "1 1 200px" }}>Book a consultation</Button>
                      </div>
                    </div>
                    <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-stone)", marginTop: 12, textAlign: "center" }}>Indicative pre-check, not a substitute for audit · final fee confirmed after a short scoping call.</div>
                  </div>
                ) : !rFile ? (
                  <div onClick={() => rInput.current && rInput.current.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); rOnFile(e.dataTransfer.files[0]); }} style={{ cursor: "pointer", border: "2px dashed var(--a4-hairline-strong)", borderRadius: "var(--a4-r-md)", padding: "clamp(26px,5vw,44px)", textAlign: "center" }}>
                    <input ref={rInput} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => rOnFile(e.target.files?.[0])} />
                    <div style={{ width: 56, height: 56, borderRadius: 999, background: "var(--a4-surface-soft)", display: "grid", placeItems: "center", margin: "0 auto" }}><Icon name="upload-cloud" size={26} color="var(--a4-primary)" stroke={1.75} /></div>
                    <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 21, color: "var(--a4-ink)", marginTop: 18 }}>Upload your last audited accounts</div>
                    <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, lineHeight: 1.5, color: "var(--a4-mute)", marginTop: 7, maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>We run a real compliance check and flag any issues — then get your fixed audit fee. PDF or Word · <span style={{ color: "var(--a4-primary)", fontWeight: 600 }}>browse</span></div>
                    <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-stone)", marginTop: 18 }}>Confidential · processed in memory, never stored · indicative, confirmed after a scoping call</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <Icon name="file-text" size={18} color="var(--a4-primary)" />
                      <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, fontWeight: 600, color: "var(--a4-ink)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{rFile.name}</span>
                      <button onClick={rReset} style={{ background: "none", border: 0, cursor: "pointer", color: "var(--a4-mute)", fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600 }}>Change</button>
                    </div>

                    <Field required type="email" placeholder="Work email" autoComplete="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                    <Field required placeholder="Your name" autoComplete="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                    <Field placeholder="Company (optional)" autoComplete="organization" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />

                    {!rVerified ? (
                      <div style={{ border: "1px solid var(--a4-hairline-light)", borderRadius: 12, padding: 14, background: "var(--a4-surface-soft)", display: "grid", gap: 10 }}>
                        <div style={{ fontSize: 13.5, color: "var(--a4-charcoal)", lineHeight: 1.5 }}>
                          <strong style={{ color: "var(--a4-ink)" }}>Confirm your email to run the review.</strong> We&apos;ll send a 6-digit code.
                        </div>
                        {!rCodeSent ? (
                          <button type="button" disabled={!rEmailValid || rVBusy} onClick={rSendCode}
                            style={{ ...outlineBtn, alignSelf: "start", opacity: !rEmailValid || rVBusy ? 0.5 : 1, cursor: !rEmailValid || rVBusy ? "default" : "pointer" }}>
                            {rVBusy ? "Sending…" : "Send me a code"}
                          </button>
                        ) : (
                          <>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <Field placeholder="6-digit code" inputMode="numeric" maxLength={6} value={rCode}
                                onChange={(e) => setRCode(e.target.value.replace(/\D/g, ""))}
                                style={{ maxWidth: 170, letterSpacing: "3px", fontWeight: 600 }} />
                              <button type="button" disabled={rCode.length < 6 || rVBusy} onClick={rConfirmCode} style={primaryBtn(rCode.length < 6 || rVBusy)}>
                                {rVBusy ? "Checking…" : "Confirm"}
                              </button>
                            </div>
                            <div style={{ fontSize: 12.5, color: "var(--a4-mute)" }}>
                              {rDevCode ? `Test mode — your code is ${rDevCode}. ` : `Code sent to ${form.email}. `}
                              <button type="button" onClick={rSendCode} disabled={rVBusy} style={{ background: "none", border: 0, color: "var(--a4-primary)", cursor: "pointer", fontWeight: 600, fontSize: 12.5, padding: 0 }}>Resend</button>
                            </div>
                          </>
                        )}
                        {rVErr && <p style={{ color: "#c2303d", fontSize: 13.5, margin: 0 }}>{rVErr}</p>}
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#1a7f4b", fontWeight: 600 }}>
                        <span aria-hidden>✓</span> Email confirmed — {rVerifiedEmail}
                      </div>
                    )}

                    <label style={{ fontSize: 13.5, display: "flex", gap: 9, alignItems: "flex-start", color: "var(--a4-charcoal)", lineHeight: 1.5 }}>
                      <input type="checkbox" checked={rConsent} onChange={(e) => setRConsent(e.target.checked)} style={{ marginTop: 3, accentColor: "var(--a4-primary)", width: 16, height: 16 }} />
                      I understand my file is processed to generate this review and is not stored.
                    </label>

                    <button type="button" disabled={rSubmitDisabled} onClick={rRunReview} style={primaryBtn(rSubmitDisabled)}>
                      {rStatus === "loading" ? "Analyzing… (up to ~60s)" : rVerified ? "Run my review" : "Confirm your email to run"}
                    </button>
                    {rStatus === "error" && <p style={{ color: "#c2303d", fontSize: 14, margin: 0 }}>{rError}</p>}
                  </div>
                )}
              </div>
            ) : (
            <div style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", padding: "clamp(24px,3vw,34px)", display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <div style={fieldLabel}>Annual turnover</div>
                <AEPills items={AE_TURNOVER} value={turn} set={setTurn} />
              </div>
              <div>
                <div style={fieldLabel}>Balance-sheet size</div>
                <AEPills items={AE_BS} value={bs} set={setBs} />
              </div>
              <div>
                <div style={fieldLabel}>Transaction volume</div>
                <div style={sub}>Roughly how busy the ledgers are — drives audit testing.</div>
                <AEPills items={AE_TX} value={tx} set={setTx} />
              </div>
              <div style={{ height: 1, background: "var(--a4-hairline-light)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--a4-mute)" }}>Complexity</div>
                <AEToggleRow label="Group / consolidated accounts" sub="Parent with one or more subsidiaries" fee={600} on={group} set={setGroup} />
                <AEToggleRow label="Regulated entity" sub="iGaming, financial services or similar" fee={450} on={regulated} set={setRegulated} />
                <AEToggleRow label="Annual tax return" sub="Corporate tax computation & return, filed yearly" fee={aeTaxFee(fee)} on={taxReturn} set={setTaxReturn} />
              </div>
            </div>
            )}

            {/* summary */}
            {mode === "first" && (
            <div className="a4-sum" style={{ background: "#000", borderRadius: "var(--a4-r-lg)", padding: "clamp(24px,3vw,32px)", position: "sticky", top: 88, color: "#fff" }}>
              <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--a4-on-dark-mute)" }}>Estimated audit fee</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 18, color: "var(--a4-on-dark-mute)" }}>from</span>
                <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 52, letterSpacing: "-2px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{aeEuro(fee)}</span>
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, color: "var(--a4-on-dark-mute)" }}>/ year</span>
              </div>
              <div style={{ height: 1, background: "var(--a4-hairline-dark)", margin: "22px 0 16px" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {([
                  ["Turnover", AE_TURNOVER[turn].label],
                  ["Balance sheet", AE_BS[bs].label],
                  ["Transactions", AE_TX[tx].label],
                  group && ["Group audit", "Included"],
                  regulated && ["Regulated entity", "Included"],
                  taxReturn && ["Annual tax return", aeEuro(aeTaxFee(fee)) + " /yr"],
                ] as (string[] | false)[]).filter((row): row is string[] => Boolean(row)).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, color: "var(--a4-on-dark-mute)" }}>{k}</span>
                    <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
                <Button variant="primary" size="md" onClick={() => open("proposal")} style={{ width: "100%" }}>Request audit proposal <Icon name="arrow-right" size={16} color="#000" /></Button>
                <Button variant="cobalt" size="md" onClick={() => open("consultation")} style={{ width: "100%" }}><Icon name="calendar" size={16} color="#fff" /> Book a consultation</Button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 14 }}>
                <Icon name="shield-check" size={13} color="var(--a4-stone)" />
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-stone)" }}>Fixed fee · signed by a licensed audit firm · engagement begins upon KYC approval</span>
              </div>
            </div>
            )}
          </div>
        </Reveal>
      </Container>

      {/* modal */}
      {modal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", width: "100%", maxWidth: 450, padding: 30, boxShadow: "0 32px 80px rgba(0,0,0,.25)" }}>
            {done ? (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ width: 54, height: 54, borderRadius: 999, background: "rgba(0,168,126,.12)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Icon name="check" size={26} color="var(--a4-accent-teal)" stroke={2.5} /></div>
                <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "var(--a4-ink)" }}>{intent === "proposal" ? "Proposal request received" : "Consultation requested"}</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--a4-mute)", margin: "10px 0 0" }}>Thanks, {form.name.split(" ")[0]}. Our licensed audit firm will contact you within 1 business day at <strong style={{ color: "var(--a4-ink)" }}>{form.email}</strong>.</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-stone)", marginTop: 14 }}>Reference: {done} · estimate from {aeEuro(modalFee)}/yr</div>
                <Button variant="outline-light" size="md" onClick={() => setModal(false)} style={{ width: "100%", marginTop: 22 }}>Close</Button>
              </div>
            ) : (
              <div>
                <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "var(--a4-ink)" }}>{intent === "proposal" ? "Request your audit proposal" : "Book your audit consultation"}</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, color: "var(--a4-mute)", margin: "6px 0 22px" }}>We&apos;ll confirm scope and a fixed fee (estimate from {aeEuro(modalFee)}/yr). No obligation.</div>
                {([["name", "Your name", "text"], ["company", "Company name", "text"], ["email", "Email address", "email"], ["phone", "Phone (optional)", "tel"]] as const).map(([k, label, type]) => (
                  <div key={k} style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontFamily: "var(--a4-font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--a4-mute)", marginBottom: 6 }}>{label}</label>
                    <input type={type} value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} style={{ width: "100%", background: "var(--a4-surface-soft)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "11px 14px", color: "var(--a4-ink)", fontFamily: "var(--a4-font-body)", fontSize: 14, outline: "none" }} />
                  </div>
                ))}
                {modalError && <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--accent-danger)", marginBottom: 10 }}>{modalError}</div>}
                <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                  <Button variant="dark" size="md" onClick={submit} style={{ flex: 1, opacity: modalSubmitting ? 0.6 : 1, pointerEvents: modalSubmitting ? "none" : "auto" }}>{modalSubmitting ? "Sending…" : intent === "proposal" ? "Send request" : "Request consultation"} <Icon name="arrow-right" size={16} color="#fff" /></Button>
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
