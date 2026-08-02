"use client";

import React, { useRef, useState } from "react";
import { Button, Icon, Container } from "@/components/a4-landing/Primitives";
import { Field, primaryBtn, outlineBtn } from "@/app/[locale]/accounting-health-check/components/Field";
import { FindingsList } from "@/app/[locale]/accounting-health-check/components/FindingsList";
import type { ReviewResponse } from "@/app/api/fs-gap-review/types";
import {
  SECTORS, TXN, SIZES, PAYROLL, VAT, BANKS, TAX_RETURN, YEARS, NYRS, CHANGES, STEPS,
  calcAuditFee, feeLines, euro, type AuditInput,
} from "@/lib/audit-fee";
import { AUDIT_PRE_TRADING, TAX_RETURN_FROM, PRICING_VAT_NOTE } from "@/data/a4QuotePack";

type Opt = { id: string; label: string; sub?: string };

const labelOf = (list: Opt[], id: string) => (list.find((o) => o.id === id) ?? list[0]).label;

function download(b64: string, filename: string, mime: string) {
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([u8], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

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

const fieldLabel: React.CSSProperties = { fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, color: "var(--a4-ink)" };
const hintLabel: React.CSSProperties = { fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-stone)", marginTop: 2 };
const tagLabel: React.CSSProperties = { fontFamily: "var(--a4-font-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--a4-primary)" };
const cardStyle: React.CSSProperties = { background: "var(--a4-surface-card)", borderRadius: "var(--a4-r-lg)", padding: "clamp(22px,3vw,30px)", textAlign: "left" };

type AnswerKey = keyof Omit<AuditInput, "uploaded">;

const QUESTIONS: { key: AnswerKey; title: string; help: string; items: Opt[] }[] = [
  { key: "sector", title: "What does the company do?", help: "Some sectors carry heavier checks on our side — that is what moves the fee.", items: SECTORS },
  { key: "txn", title: "About how many transactions a month?", help: "Each invoice, receipt and bank line. More transactions means more sampling and testing.", items: TXN },
  { key: "size", title: "How big is the company?", help: "Small companies usually qualify for a lighter review engagement — about half the cost.", items: SIZES },
  { key: "pay", title: "Anyone on the payroll?", help: "Payroll means employer filings and payroll testing during the audit.", items: PAYROLL },
  { key: "vat", title: "Registered for VAT?", help: "VAT registration adds return reconciliations to the audit scope.", items: VAT },
  { key: "banks", title: "How many bank accounts?", help: "Every account is confirmed and reconciled — more accounts, more confirmations.", items: BANKS },
  { key: "taxret", title: "Need the annual tax return as well?", help: `Prepared from the audited figures, so nothing is rebuilt twice. From €${TAX_RETURN_FROM} a year, set by transaction volume.`, items: TAX_RETURN },
];
const LAST = QUESTIONS.length; // the fee step

export function AuditEstimator() {
  const [amode, setAmode] = useState<"ask" | "docs">("ask");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Omit<AuditInput, "uploaded">>({
    sector: "shop", txn: "21-60", size: "small", pay: "none", vat: "no", banks: "1",
    taxret: "no", year: "2025", nyrs: "2", chg: "no", doc: "fs",
  });
  const [notes, setNotes] = useState("");
  const set = (patch: Partial<Omit<AuditInput, "uploaded">>) => setAnswers((a) => ({ ...a, ...patch }));

  // ---- Real FS review (same engine as /api/fs-gap-review) ----
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [contact, setContact] = useState({ email: "", name: "", company: "" });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [data, setData] = useState<ReviewResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Email confirmation gate — the review only runs once the address is verified.
  const [verifiedToken, setVerifiedToken] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [vBusy, setVBusy] = useState(false);
  const [vErr, setVErr] = useState("");

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim());
  const verified = !!verifiedToken && verifiedEmail.toLowerCase() === contact.email.trim().toLowerCase();

  async function sendCode() {
    setVBusy(true); setVErr(""); setDevCode("");
    try {
      const r = await fetch("/api/verify/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: contact.email }) });
      const b = await r.json();
      if (!r.ok) { setVErr(b.error || "Could not send a code."); return; }
      // Server tells us whether the email actually went out — never claim "sent" when it didn't.
      if (!b.delivered && !b.devCode) { setVErr("We couldn't send the code email right now. Please try again in a few minutes, or email info@a4.com.mt."); return; }
      setChallengeToken(b.challengeToken); setCodeSent(true);
      if (b.devCode) setDevCode(b.devCode);
    } catch { setVErr("Could not send a code. Please try again."); }
    finally { setVBusy(false); }
  }

  async function confirmCode() {
    setVBusy(true); setVErr("");
    try {
      const r = await fetch("/api/verify/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: contact.email, code, challengeToken }) });
      const b = await r.json();
      if (!r.ok) { setVErr(b.error || "Verification failed."); return; }
      setVerifiedToken(b.verifiedToken); setVerifiedEmail(contact.email);
    } catch { setVErr("Verification failed. Please try again."); }
    finally { setVBusy(false); }
  }

  const submitDisabled = status === "loading" || !consent || !verified || !file;

  async function runReview() {
    if (submitDisabled || !file) return;
    setStatus("loading"); setError("");
    const scoping = [
      `Year to audit: ${labelOf(YEARS, answers.year)}${answers.year === "multi" ? ` (${labelOf(NYRS, answers.nyrs)})` : ""}`,
      `Major changes since: ${labelOf(CHANGES, answers.chg)}`,
      `Annual tax return: ${answers.taxret === "yes" ? "yes, with the audit" : "no"}`,
      `Document sent: ${answers.doc === "fs" ? "financial statements" : "management accounts"}`,
      notes.trim() ? `Notes: ${notes.trim()}` : "",
    ].filter(Boolean).join("\n");

    const fd = new FormData();
    fd.append("email", contact.email);
    fd.append("name", contact.name);
    fd.append("company", contact.company);
    fd.append("consent", String(consent));
    fd.append("verifiedToken", verifiedToken);
    fd.append("file", file);
    fd.append("kind", "fs");
    fd.append("scoping", scoping);
    try {
      const res = await fetch("/api/fs-gap-review", { method: "POST", body: fd });
      const body = await res.json();
      if (!res.ok) { setError(body.error || "Review failed."); setStatus("error"); return; }
      setData(body); setStatus("idle");
    } catch { setError("Review failed. Please try again or book a call."); setStatus("error"); }
  }

  const resetReview = () => {
    setFile(null); setData(null); setStatus("idle"); setError("");
    setConsent(false); setVerifiedToken(""); setVerifiedEmail(""); setCodeSent(false); setCode("");
  };

  // ---- The fee. Sending a real prior-year file unlocks the planning saving. ----
  const input: AuditInput = { ...answers, uploaded: !!data };
  const q = calcAuditFee(input);
  const lines = feeLines(input, q);
  const feeBig = q.refer ? "Let’s talk first" : euro(q.final);
  const feeMini = q.refer ? "Let’s talk" : euro(q.final) + " /yr";
  const ctaLabel = q.refer ? "Request a call" : "Request a proposal";
  const feeNote = q.refer
    ? "We price most sectors instantly. This one needs a short conversation with a director before we put a number to it — usually the same day."
    : (q.review ? "You likely qualify for a review instead of a full audit — we confirm it against your figures. " : "") +
      `The fee is fixed after a short scoping call and never below €${AUDIT_PRE_TRADING}. ${PRICING_VAT_NOTE}`;
  const summary = q.refer
    ? "We price most sectors instantly, but this one needs a short conversation with a director before we put a number to it — usually the same day."
    : `So: a ${q.review ? "review engagement" : "full financial audit"} at ${euro(q.final)} a year${answers.taxret === "yes" ? ", tax return included" : ""}, fixed after one short scoping call. Documents are collected once, in the portal, and we file on time at the MBR.`;
  // Only the engine returns a fee read from the actual file; never invent one.
  const engineFee = data?.quote?.fee ?? null;

  // ---- Lead capture ----
  const [modal, setModal] = useState(false);
  const [intent, setIntent] = useState<"proposal" | "consultation">("proposal");
  const [done, setDone] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "" });
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const openModal = (i: "proposal" | "consultation") => {
    setIntent(i); setDone(null); setModalError("");
    setForm((f) => ({ ...f, name: f.name || contact.name, company: f.company || contact.company, email: f.email || contact.email }));
    setModal(true);
  };
  const submitLead = async () => {
    if (!form.name || !form.email) return;
    setModalSubmitting(true); setModalError("");
    const ref = "A4-" + Date.now().toString(36).toUpperCase().slice(-6);
    const quoted = engineFee !== null ? `${euro(engineFee)}/yr (priced from uploaded statements)` : q.refer ? "referral — director to price" : `${euro(q.final)}/yr${q.yearsN > 1 ? ` × ${q.yearsN} years = ${euro(q.total)}` : ""}`;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: `Audit ${intent === "proposal" ? "proposal request" : "consultation booking"} — ${form.company || form.name}`,
          message: `Company: ${form.company}\nPhone: ${form.phone}\nEstimated audit fee: ${quoted}\n` +
            `Scope: ${labelOf(SECTORS, answers.sector)} · ${labelOf(TXN, answers.txn)} txn/mo · ${labelOf(SIZES, answers.size)} · payroll ${labelOf(PAYROLL, answers.pay)} · VAT ${answers.vat} · ${labelOf(BANKS, answers.banks)} bank account(s) · tax return ${answers.taxret}\n` +
            (notes.trim() ? `Notes: ${notes.trim()}\n` : "") +
            `Reference: ${ref}`,
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

  const modeBtn = (on: boolean): React.CSSProperties => ({
    height: 40, padding: "0 22px", borderRadius: "var(--a4-r-full)",
    border: "1px solid " + (on ? "#fff" : "rgba(255,255,255,.32)"),
    background: on ? "#fff" : "rgba(255,255,255,.12)",
    color: on ? "var(--a4-primary)" : "#fff",
    fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer",
    transition: "background .15s, color .15s",
  });

  return (
    <section
      id="estimate"
      style={{ background: "linear-gradient(180deg, #4f55f1 0%, #494fdf 50%, #3a40c4 100%)", padding: "clamp(56px,8vw,88px) 0 clamp(60px,8vw,96px)" }}
    >
      <Container>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,.75)" }}>• Audit fee calculator</div>
          <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: "clamp(28px,3.6vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em", color: "#fff", margin: "16px 0 0", textWrap: "balance" }}>
            Your audit fee, in sixty seconds
          </h2>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 15.5, lineHeight: 1.7, color: "rgba(255,255,255,.76)", margin: "14px auto 0", maxWidth: "56ch", textWrap: "pretty" }}>
            Seven quick questions — the fee builds as you answer. Or send last year&apos;s statements: we run a real compliance review on them and the planning saving comes off your fee.
          </p>
        </div>

        <div style={{ margin: "30px auto 0", display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <button type="button" onClick={() => setAmode("ask")} aria-pressed={amode === "ask"} style={modeBtn(amode === "ask")}>Answer seven questions</button>
          <button type="button" onClick={() => setAmode("docs")} aria-pressed={amode === "docs"} style={modeBtn(amode === "docs")}>Just upload last year&apos;s FS</button>
        </div>

        {amode === "ask" ? (
          <div className="af-grid" style={{ maxWidth: 1040, margin: "30px auto 0" }}>
            {/* step rail */}
            <div className="af-rail" style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left", position: "sticky", top: 90 }}>
              {STEPS.map((label, i) => {
                const doneStep = i < step, active = i === step;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setStep(i)}
                    aria-current={active ? "step" : undefined}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "var(--a4-r-md)",
                      border: 0, background: active ? "rgba(255,255,255,.15)" : "transparent",
                      cursor: "pointer", fontFamily: "var(--a4-font-body)", textAlign: "left", transition: "background .2s ease",
                    }}
                  >
                    <span style={{
                      width: 24, height: 24, borderRadius: "var(--a4-r-full)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none",
                      background: doneStep ? "rgba(255,255,255,.92)" : active ? "rgba(255,255,255,.26)" : "rgba(255,255,255,.1)",
                      color: doneStep ? "var(--a4-primary)" : active ? "#fff" : "rgba(255,255,255,.6)",
                      fontSize: 10.5, fontWeight: 700, fontVariantNumeric: "tabular-nums", transition: "background .2s ease, color .2s ease",
                    }}>{"0" + (i + 1)}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: active ? "#fff" : doneStep ? "rgba(255,255,255,.78)" : "rgba(255,255,255,.5)", transition: "color .2s ease" }}>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* question card */}
            <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 18, minHeight: 360 }}>
              <div>
                <div style={tagLabel}>{step === LAST ? "Your fee" : `Question ${step + 1} of ${LAST}`}</div>
                <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 21, letterSpacing: "-.015em", color: "var(--a4-ink)", margin: "8px 0 0" }}>
                  {step === LAST ? "Your fee" : QUESTIONS[step].title}
                </h3>
                <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, lineHeight: 1.6, color: "var(--a4-mute)", margin: "8px 0 0", textWrap: "pretty" }}>
                  {step === LAST ? "Everything on the right is itemised — nothing appears later that is not on that list." : QUESTIONS[step].help}
                </p>
              </div>

              {step === LAST ? (
                <div>
                  <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, lineHeight: 1.65, color: "var(--a4-body)", margin: 0, textWrap: "pretty" }}>{summary}</p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                    <Button variant="dark" size="md" onClick={() => openModal("proposal")}>{ctaLabel} <Icon name="arrow-right" size={16} color="#fff" /></Button>
                    <Button variant="outline-light" size="md" onClick={() => openModal("consultation")}>Book a consultation</Button>
                  </div>
                  <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, color: "var(--a4-stone)", margin: "10px 0 0" }}>Fixed after a short scoping call. Never below €{AUDIT_PRE_TRADING}. {PRICING_VAT_NOTE}</p>
                </div>
              ) : (
                <Pills items={QUESTIONS[step].items} value={String(answers[QUESTIONS[step].key])} set={(id) => set({ [QUESTIONS[step].key]: id } as Partial<AuditInput>)} />
              )}

              <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--a4-hairline-light)", display: "flex", alignItems: "center", gap: 12 }}>
                {step !== LAST && (
                  <>
                    <button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
                      style={{ height: 36, padding: "0 16px", borderRadius: "var(--a4-r-full)", border: "1px solid var(--a4-hairline-light)", background: "transparent", color: "var(--a4-mute)", fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, cursor: step === 0 ? "default" : "pointer", opacity: step === 0 ? 0.45 : 1 }}>Back</button>
                    <button type="button" onClick={() => setStep(Math.min(LAST, step + 1))}
                      style={{ height: 36, padding: "0 18px", borderRadius: "var(--a4-r-full)", border: "1px solid var(--a4-ink)", background: "var(--a4-ink)", color: "#fff", fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>{step === LAST - 1 ? "See my fee" : "Next"}</button>
                  </>
                )}
                <span style={{ marginLeft: "auto", fontFamily: "var(--a4-font-display)", fontVariantNumeric: "tabular-nums", fontSize: 15, fontWeight: 600, color: "var(--a4-ink)" }}>{feeMini}</span>
              </div>
            </div>

            {/* fee panel */}
            <div className="af-panel" style={{ background: "#000", borderRadius: "var(--a4-r-lg)", padding: "clamp(22px,3vw,30px)", color: "#fff", position: "sticky", top: 90, textAlign: "left" }}>
              <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--a4-stone)" }}>Estimated audit fee</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontVariantNumeric: "tabular-nums", fontSize: 38, letterSpacing: "-1.5px", lineHeight: 1 }}>{feeBig}</span>
                {!q.refer && <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "var(--a4-on-dark-mute)" }}>/ year</span>}
              </div>
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--a4-hairline-dark)", display: "flex", flexDirection: "column", gap: 9 }}>
                {lines.map((l) => (
                  <span key={l.k} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontFamily: "var(--a4-font-body)", fontSize: 12.5 }}>
                    <span style={{ color: "var(--a4-on-dark-mute)" }}>{l.k}</span>
                    <span style={{ color: "#fff", fontWeight: 500, whiteSpace: "nowrap" }}>{l.v}</span>
                  </span>
                ))}
              </div>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, lineHeight: 1.6, color: "var(--a4-stone)", margin: "18px 0 0", paddingTop: 16, borderTop: "1px solid var(--a4-hairline-dark)" }}>{feeNote}</p>
              <Button variant="primary" size="md" onClick={() => openModal("proposal")} style={{ width: "100%", marginTop: 18 }}>{ctaLabel} <Icon name="arrow-right" size={16} color="#000" /></Button>
            </div>
          </div>
        ) : (
          /* ---- Upload last year's FS: the design's scoping form, A4's real review engine ---- */
          <div style={{ ...cardStyle, maxWidth: 660, margin: "30px auto 0" }}>
            {data ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--a4-mute)", display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <Icon name="file-check-2" size={16} color="var(--a4-primary)" /> {data.framework} review — {data.company}
                  </span>
                  <button onClick={resetReview} style={{ background: "none", border: 0, cursor: "pointer", color: "var(--a4-mute)", fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>New</button>
                </div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "var(--a4-mute)", marginTop: 10 }}>
                  {data.stats.checks_run} checks · {data.stats.checks_passed} passed · {data.stats.checks_failed} flagged
                </div>

                <div style={{ background: "#000", borderRadius: "var(--a4-r-lg)", padding: "clamp(20px,3vw,26px)", color: "#fff", marginTop: 16 }}>
                  {engineFee !== null ? (
                    <>
                      <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--a4-stone)" }}>Priced from your statements</div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 12 }}>
                        <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontVariantNumeric: "tabular-nums", fontSize: 38, letterSpacing: "-1.5px", lineHeight: 1 }}>{euro(engineFee)}</span>
                        <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "var(--a4-on-dark-mute)" }}>/ year</span>
                      </div>
                      <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, lineHeight: 1.6, color: "var(--a4-stone)", margin: "12px 0 0" }}>
                        Read from the {data.quote?.docKind === "management_accounts" ? "management accounts" : "statements"} you sent{answers.year === "multi" ? `, per year — ${labelOf(NYRS, answers.nyrs).toLowerCase()} to audit` : ""}. Fixed after one short scoping call. Excludes VAT.
                      </p>
                    </>
                  ) : (
                    <>
                      <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--a4-stone)" }}>Your fee</div>
                      <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, lineHeight: 1.65, color: "var(--a4-on-dark-mute)", margin: "12px 0 0" }}>
                        Your file is reviewed — we&apos;ll confirm the fixed fee on a short scoping call. For a number right now, answer the seven questions: sending this file takes the planning saving off whatever it lands on.
                      </p>
                      <Button variant="outline-dark" size="md" onClick={() => { setAmode("ask"); setStep(0); }} style={{ marginTop: 16 }}>Answer seven questions <Icon name="arrow-right" size={16} color="#fff" /></Button>
                    </>
                  )}
                </div>

                <div style={{ marginTop: 16 }}><FindingsList findings={data.findings} /></div>

                <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--a4-hairline-light)", display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button type="button" style={primaryBtn()} onClick={() => download(data.reportBase64, data.reportName, "application/pdf")}>⬇ Download report (PDF)</button>
                  {data.annotatedDocxBase64 && (
                    <button type="button" style={outlineBtn} onClick={() => download(data.annotatedDocxBase64!, data.annotatedName || "review.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}>⬇ Annotated Word</button>
                  )}
                  <Button variant="dark" size="md" onClick={() => openModal("proposal")}>{ctaLabel} <Icon name="arrow-right" size={16} color="#fff" /></Button>
                </div>
                <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, color: "var(--a4-stone)", margin: "12px 0 0" }}>Indicative pre-check, not a substitute for audit. Fixed after a short scoping call, never below €{AUDIT_PRE_TRADING}. {PRICING_VAT_NOTE}</p>
              </div>
            ) : (
              <div>
                <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 21, letterSpacing: "-.015em", color: "var(--a4-ink)", margin: 0 }}>Skip the questions — send the numbers</h3>
                <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, lineHeight: 1.6, color: "var(--a4-mute)", margin: "8px 0 0", textWrap: "pretty" }}>
                  Upload last year&apos;s financial statements or management accounts. We run a real disclosure, consistency and casting review on the file and come back with the findings — and the planning saving comes off your audit fee.
                </p>

                <div style={{ marginTop: 18 }}>
                  <div style={fieldLabel}>Which year needs auditing?</div>
                  <div style={{ marginTop: 8 }}><Pills items={YEARS} value={answers.year} set={(id) => set({ year: id })} /></div>
                  {answers.year === "multi" && <div style={{ marginTop: 8 }}><Pills items={NYRS} value={answers.nyrs} set={(id) => set({ nyrs: id })} /></div>}
                </div>

                <div style={{ marginTop: 16 }}>
                  <div style={fieldLabel}>Any major changes since that year?</div>
                  <div style={hintLabel}>New activity, new owners, a big jump in volume — anything that makes last year a poor guide.</div>
                  <div style={{ marginTop: 8 }}><Pills items={CHANGES} value={answers.chg} set={(id) => set({ chg: id })} /></div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div style={fieldLabel}>Need the annual tax return as well?</div>
                  <div style={{ marginTop: 8 }}><Pills items={TAX_RETURN} value={answers.taxret} set={(id) => set({ taxret: id })} /></div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div style={fieldLabel}>What are you sending?</div>
                  <div style={{ marginTop: 8 }}>
                    <Pills items={[{ id: "fs", label: "Financial statements" }, { id: "mgmt", label: "Management accounts" }]} value={answers.doc} set={(id) => set({ doc: id as "fs" | "mgmt" })} />
                  </div>
                </div>

                {!file ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); }}
                    onClick={() => inputRef.current?.click()}
                    style={{
                      marginTop: 18, cursor: "pointer", padding: "clamp(24px,4vw,34px)", textAlign: "center",
                      borderRadius: "var(--a4-r-md)", borderStyle: "dashed", borderWidth: 2,
                      borderColor: drag ? "var(--a4-primary)" : "var(--a4-hairline-light)",
                      background: drag ? "var(--a4-surface-soft)" : "transparent", transition: "border-color .15s, background .15s",
                    }}
                  >
                    <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
                    <Icon name="upload-cloud" size={26} color="var(--a4-primary)" stroke={1.75} />
                    <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--a4-ink)", marginTop: 10 }}>Drop the file here or click to upload</div>
                    <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-stone)", marginTop: 6 }}>PDF or Word · confidential, processed in memory, never stored</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <Icon name="file-text" size={18} color="var(--a4-primary)" />
                      <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, fontWeight: 600, color: "var(--a4-ink)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{file.name}</span>
                      <button onClick={resetReview} style={{ background: "none", border: 0, cursor: "pointer", color: "var(--a4-mute)", fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600 }}>Change</button>
                    </div>

                    <Field required type="email" placeholder="Work email" autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                    <Field required placeholder="Your name" autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                    <Field placeholder="Company (optional)" autoComplete="organization" value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} />

                    <label style={{ display: "flex", flexDirection: "column", gap: 6, ...fieldLabel }}>
                      Anything else we should know?
                      <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                        placeholder="Foreign income, related-party loans, a pending dispute — whatever helps us quote well."
                        style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--a4-hairline-light)", background: "#fff", fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 400, color: "var(--a4-ink)", resize: "vertical" }} />
                    </label>

                    {!verified ? (
                      <div style={{ border: "1px solid var(--a4-hairline-light)", borderRadius: 12, padding: 14, background: "var(--a4-surface-soft)", display: "grid", gap: 10 }}>
                        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, color: "var(--a4-charcoal)", lineHeight: 1.5 }}>
                          <strong style={{ color: "var(--a4-ink)" }}>Confirm your email to run the review.</strong> We&apos;ll send a 6-digit code.
                        </div>
                        {!codeSent ? (
                          <button type="button" disabled={!emailValid || vBusy} onClick={sendCode}
                            style={{ ...outlineBtn, alignSelf: "start", opacity: !emailValid || vBusy ? 0.5 : 1, cursor: !emailValid || vBusy ? "default" : "pointer" }}>
                            {vBusy ? "Sending…" : "Send me a code"}
                          </button>
                        ) : (
                          <>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <Field placeholder="6-digit code" inputMode="numeric" maxLength={6} value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                                style={{ maxWidth: 170, letterSpacing: "3px", fontWeight: 600 }} />
                              <button type="button" disabled={code.length < 6 || vBusy} onClick={confirmCode} style={primaryBtn(code.length < 6 || vBusy)}>
                                {vBusy ? "Checking…" : "Confirm"}
                              </button>
                            </div>
                            <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-mute)" }}>
                              {devCode ? `Test mode — your code is ${devCode}. ` : `Code sent to ${contact.email}. `}
                              <button type="button" onClick={sendCode} disabled={vBusy} style={{ background: "none", border: 0, color: "var(--a4-primary)", cursor: "pointer", fontWeight: 600, fontSize: 12.5, padding: 0 }}>Resend</button>
                            </div>
                          </>
                        )}
                        {vErr && <p style={{ color: "#c2303d", fontSize: 13.5, margin: 0 }}>{vErr}</p>}
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--a4-font-body)", fontSize: 14, color: "#1a7f4b", fontWeight: 600 }}>
                        <span aria-hidden>✓</span> Email confirmed — {verifiedEmail}
                      </div>
                    )}

                    <label style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, display: "flex", gap: 9, alignItems: "flex-start", color: "var(--a4-charcoal)", lineHeight: 1.5 }}>
                      <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3, accentColor: "var(--a4-primary)", width: 16, height: 16 }} />
                      I understand my file is processed to generate this review and is not stored.
                    </label>

                    <button type="button" disabled={submitDisabled} onClick={runReview} style={primaryBtn(submitDisabled)}>
                      {status === "loading" ? "Analyzing… (up to ~60s)" : verified ? "Run my review" : "Confirm your email to run"}
                    </button>
                    {status === "error" && <p style={{ color: "#c2303d", fontFamily: "var(--a4-font-body)", fontSize: 14, margin: 0 }}>{error}</p>}
                  </div>
                )}

                <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, color: "var(--a4-stone)", margin: "14px 0 0" }}>
                  The file is only used to review and scope the audit. Fixed after a short scoping call, never below €{AUDIT_PRE_TRADING}. {PRICING_VAT_NOTE}
                </p>
              </div>
            )}
          </div>
        )}
      </Container>

      {/* lead modal */}
      {modal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", width: "100%", maxWidth: 450, padding: 30, boxShadow: "0 32px 80px rgba(0,0,0,.25)" }}>
            {done ? (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ width: 54, height: 54, borderRadius: 999, background: "rgba(0,168,126,.12)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Icon name="check" size={26} color="var(--a4-accent-teal)" stroke={2.5} /></div>
                <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "var(--a4-ink)" }}>{intent === "proposal" ? "Proposal request received" : "Consultation requested"}</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--a4-mute)", margin: "10px 0 0" }}>Thanks, {form.name.split(" ")[0]}. Our licensed audit firm will contact you within 1 business day at <strong style={{ color: "var(--a4-ink)" }}>{form.email}</strong>.</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-stone)", marginTop: 14 }}>Reference: {done}{q.refer ? "" : ` · estimate ${euro(engineFee ?? q.final)}/yr`}</div>
                <Button variant="outline-light" size="md" onClick={() => setModal(false)} style={{ width: "100%", marginTop: 22 }}>Close</Button>
              </div>
            ) : (
              <div>
                <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "var(--a4-ink)" }}>{intent === "proposal" ? "Request your audit proposal" : "Book your audit consultation"}</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, color: "var(--a4-mute)", margin: "6px 0 22px" }}>
                  We&apos;ll confirm scope and a fixed fee{q.refer ? "" : ` (estimate ${euro(engineFee ?? q.final)}/yr)`}. No obligation.
                </div>
                {([["name", "Your name", "text"], ["company", "Company name", "text"], ["email", "Email address", "email"], ["phone", "Phone (optional)", "tel"]] as const).map(([k, label, type]) => (
                  <div key={k} style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontFamily: "var(--a4-font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--a4-mute)", marginBottom: 6 }}>{label}</label>
                    <input type={type} value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} style={{ width: "100%", background: "var(--a4-surface-soft)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "11px 14px", color: "var(--a4-ink)", fontFamily: "var(--a4-font-body)", fontSize: 14, outline: "none" }} />
                  </div>
                ))}
                {modalError && <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "#c2303d", marginBottom: 10 }}>{modalError}</div>}
                <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                  <Button variant="dark" size="md" onClick={submitLead} style={{ flex: 1, opacity: modalSubmitting ? 0.6 : 1, pointerEvents: modalSubmitting ? "none" : "auto" }}>{modalSubmitting ? "Sending…" : intent === "proposal" ? "Send request" : "Request consultation"} <Icon name="arrow-right" size={16} color="#fff" /></Button>
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
