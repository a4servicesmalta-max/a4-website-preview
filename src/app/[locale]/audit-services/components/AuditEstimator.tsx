"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button, Icon } from "@/components/a4-landing/Primitives";
import { DARK_CARD, MUTED_GLOW } from "@/components/fx/primitives";
import { Field, primaryBtn as fieldPrimaryBtn, outlineBtn as fieldOutlineBtn } from "@/app/[locale]/accounting-health-check/components/Field";
import { ReviewFailureNotice } from "@/app/[locale]/accounting-health-check/components/ReviewFailureNotice";
import { NETWORK_FAILURE, readReviewFailure, type ReviewFailure } from "@/lib/review-failure";
import type { ReviewResponse } from "@/app/api/fs-gap-review/types";
import {
  SECTORS, TXN, SIZES, TAX_RETURN, YEARS, NYRS, CHANGES, STEPS,
  calcAuditFee, auditFloor, feeLines, euro, type AuditInput,
} from "@/lib/audit-fee";
import { AUDIT_PRE_TRADING, TAX_RETURN_FROM, PRICING_VAT_NOTE } from "@/data/a4QuotePack";
import { BOOK_A_CALL_PATH } from "@/lib/external-links";
import { trackConversion } from "@/lib/analytics";
import { validateAuditReviewFile } from "@/lib/review-file";
import {
  BODY, DoneMark, FeeDoc, G, Head, INDIGO, INK, KitModal, MiniTotal, OptionPills, QuestionCard, SANS, Segmented, StepRail,
  fieldLabel as kitLabel, ghostPill, gradText, inkPill, kicker, lightInput, softNote, type Opt,
} from "@/app/[locale]/accounting-services/components/PaidLandingKit";

const labelOf = (list: Opt[], id: string) => (list.find((o) => o.id === id) ?? list[0]).label;

// The fee calculator in the A4 design language (owner, Oct 2026: one design
// language site-wide). It used to carry the vacei.com/services/audit palette
// and a page-scoped lime theme; the questions, the fee maths, the review
// engine, the email gate and the lead capture are unchanged.

// Field's shared button helpers, set as the design's pills.
const primaryBtn = (disabled?: boolean): React.CSSProperties => ({
  ...fieldPrimaryBtn(disabled), height: 52, padding: "0 26px", background: INK, fontFamily: SANS, fontSize: 16, letterSpacing: 0,
});
const outlineBtn: React.CSSProperties = {
  ...fieldOutlineBtn, height: 44, padding: "0 20px", border: "1px solid #E4E4E7", background: "#FFFFFF", color: INK, fontFamily: SANS, fontSize: 15,
};
/** Inline text button (indigo link). */
const linkBtn: React.CSSProperties = {
  background: "none", border: 0, padding: 0, color: INDIGO, fontFamily: SANS, fontSize: 15, fontWeight: 600, cursor: "pointer",
};

const Pills = OptionPills;

const fieldLabel: React.CSSProperties = { fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em", color: INK };
const hintLabel: React.CSSProperties = { fontFamily: BODY, fontSize: 14, lineHeight: 1.55, color: "#52525B", marginTop: 4 };
/** White 28-radius document panel. */
const cardStyle: React.CSSProperties = {
  background: "#FFFFFF", color: INK, border: "1px solid #E4E4E7", borderRadius: 28, padding: "clamp(24px,4vw,44px)", textAlign: "left",
  boxShadow: "0 50px 120px rgba(9,9,11,.12)",
};
const fieldInput: React.CSSProperties = { height: 52, borderRadius: 14, fontSize: 16 };
const block: React.CSSProperties = { marginTop: 22, paddingTop: 22, borderTop: "1px solid #E4E4E7" };

type AnswerKey = keyof Omit<AuditInput, "uploaded">;

const QUESTIONS: { key: AnswerKey; title: string; help: string; items: Opt[] }[] = [
  { key: "sector", title: "What does the company do?", help: "Some sectors carry heavier checks on our side — that is what moves the fee.", items: SECTORS },
  { key: "txn", title: "About how many transactions a month?", help: "Each invoice, receipt and bank line. More transactions means more sampling and testing.", items: TXN },
  { key: "size", title: "How big is the company?", help: "Small companies usually qualify for a lighter review engagement — about half the cost.", items: SIZES },
  { key: "taxret", title: "Need the annual tax return as well?", help: `Prepared from the audited figures, so nothing is rebuilt twice. From €${TAX_RETURN_FROM} a year, set by your monthly spend — priced exactly in the final quote.`, items: TAX_RETURN },
];
const LAST = QUESTIONS.length; // the fee step

export function AuditEstimator() {
  const [amode, setAmode] = useState<"ask" | "docs">("ask");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Omit<AuditInput, "uploaded">>({
    sector: "shop", txn: "1-20", size: "small",
    taxret: "no", year: "2025", nyrs: "2", chg: "no", doc: "fs",
  });
  const [notes, setNotes] = useState("");
  const set = (patch: Partial<Omit<AuditInput, "uploaded">>) => setAnswers((a) => ({ ...a, ...patch }));

  // ---- Real FS review (same engine as /api/fs-gap-review) ----
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [drag, setDrag] = useState(false);
  const [contact, setContact] = useState({ email: "", name: "", company: "" });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [failure, setFailure] = useState<ReviewFailure | null>(null);
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

  const chooseFile = (candidate: File | null | undefined) => {
    if (!candidate) return;
    const error = validateAuditReviewFile(candidate);
    if (error) {
      setFile(null);
      setFileError(error);
      return;
    }
    setFileError("");
    setFile(candidate);
  };

  async function runReview() {
    if (submitDisabled || !file) return;
    setStatus("loading"); setFailure(null);
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
      // Status first: a gateway error page is not JSON, and letting res.json()
      // throw here would report a server fault as a network one.
      if (!res.ok) { setFailure(await readReviewFailure(res)); setStatus("error"); return; }
      const body = await res.json();
      // The engine accepted the statements and the lead is recorded. Only here —
      // a 502 from the review route lands on the !res.ok branch above.
      trackConversion("financial_upload_submit");
      setData(body); setStatus("idle");
    } catch {
      // fetch rejected, or a 2xx body that would not parse — nothing reached us
      // on a rejected fetch, so we must not claim the lead was captured.
      setFailure(NETWORK_FAILURE); setStatus("error");
    }
  }

  const resetReview = () => {
    setFile(null); setFileError(""); setData(null); setStatus("idle"); setFailure(null);
    setConsent(false); setVerifiedToken(""); setVerifiedEmail(""); setCodeSent(false); setCode("");
  };

  // ---- A fee we have already quoted this visitor wins over a fresh estimate. ----
  // Someone who uploaded their statements and then came back on a new tab must
  // see the same number, not a second opinion from the rate card — and must not
  // be able to shop the tool for a cheaper one by declining to upload.
  // Identity is the signed cookie plus the verified email (never IP): see
  // src/lib/quote-lock.ts.
  const [lock, setLock] = useState<{ fee: number; issuedAt: number } | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/quote-lock?kind=audit")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!cancelled && j?.locked && typeof j.fee === "number") {
          setLock({ fee: j.fee, issuedAt: j.issuedAt });
        }
      })
      .catch(() => {
        // A quote we cannot look up is not a reason to fail the estimator;
        // the visitor simply gets a fresh estimate, as they did before this.
      });
    return () => { cancelled = true; };
  }, []);

  // ---- The fee. Sending a real prior-year file unlocks the planning saving. ----
  const input: AuditInput = { ...answers, uploaded: !!data };
  const q = calcAuditFee(input);
  // A referral sector still needs a director, even if we quoted before.
  const freshEngineFee = data?.quote?.fee ?? null;
  const held = !q.refer ? freshEngineFee ?? lock?.fee ?? null : null;
  // The derived breakdown explains how q.final was built, so it must not sit
  // under a held figure it does not add up to.
  const lines = held === null ? feeLines(input, q) : [];
  const heldOn = lock
    ? new Date(lock.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" })
    : "";
  const feeBig = q.refer ? "Let’s talk first" : euro(held ?? q.final);
  const feeMini = q.refer ? "Let’s talk" : euro(held ?? q.final) + " /yr";
  const ctaLabel = q.refer ? "Request a call" : "Request a proposal";
  const feeNote = q.refer
    ? "We price most sectors instantly. This one needs a short conversation with a director before we put a number to it — usually the same day."
    : freshEngineFee !== null
      ? `This fee was priced from the statements you just sent. It is held for 30 days and the questionnaire cannot replace it. ${PRICING_VAT_NOTE}`
      : held !== null
        ? `This is the fee we quoted you on ${heldOn}, from the statements you sent. It stands for 30 days — answering the questions again will not change it. ${PRICING_VAT_NOTE}`

      : (q.review ? "You likely qualify for a review instead of a full audit — we confirm it against your figures. " : "") +
        `The fee is fixed after a short scoping call and never below the pre-trading figure of our scale (€${AUDIT_PRE_TRADING} for a full audit, €${auditFloor(true)} for a review). Audits are carried out by our partner audit firms — we connect you with them, and the fee stays as quoted here. ${PRICING_VAT_NOTE}`;
  const summary = q.refer
    ? "We price most sectors instantly, but this one needs a short conversation with a director before we put a number to it — usually the same day."
    : freshEngineFee !== null
      ? `Your fee is ${euro(freshEngineFee)} a year, priced from the statements you just sent. We hold it for 30 days, so there is nothing to re-answer.`
      : held !== null
        ? `Your fee is ${euro(held)} a year — the figure we gave you on ${heldOn} after reading your statements. We hold it for 30 days, so there is nothing to re-answer.`
      : `So: a ${q.review ? "review engagement" : "full financial audit"} at ${euro(q.final)} a year${answers.taxret === "yes" ? ", tax return included" : ""}, fixed after one short scoping call. Documents are collected once, in the portal, and we file on time at the MBR.`;
  // Only the engine returns a fee read from the actual file; never invent one.
  // A held fee came from that same engine on an earlier visit, so it counts.
  const engineFee = held;

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
            `Scope: ${labelOf(SECTORS, answers.sector)} · ${labelOf(TXN, answers.txn)} txn/mo · ${labelOf(SIZES, answers.size)} · tax return ${answers.taxret}\n` +
            (notes.trim() ? `Notes: ${notes.trim()}\n` : "") +
            `Reference: ${ref}`,
          context: `audit-estimator-${intent}`,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      trackConversion(intent === "proposal" ? "audit_proposal_submit" : "audit_consultation_submit");
      setDone(ref);
    } catch {
      setModalError("Something went wrong sending your request. Please try again or email info@a4.com.mt.");
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <section
      id="estimate"
      // scrollMarginTop keeps the heading clear of the fixed nav when a
      // "#estimate" link jumps here.
      style={{ position: "relative", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", background: MUTED_GLOW, color: INK, fontFamily: SANS, scrollMarginTop: 40 }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Head
          n="02"
          eyebrow="Audit fee calculator"
          title={<>Your audit fee, in <G>sixty seconds</G></>}
          sub={<>Four quick questions — the fee builds as you answer. Or send last year&apos;s statements and we run a real compliance review on them.</>}
          aside={
            <Segmented
              label="How would you like your fee?"
              value={amode}
              set={setAmode}
              options={[
                { id: "ask", label: "Answer four questions" },
                { id: "docs", label: <>I have last year&apos;s FS</> },
              ]}
            />
          }
        />

        {amode === "ask" ? (
          <div className="af-grid" style={{ marginTop: "clamp(48px,6vw,80px)" }}>
            {/* step rail — numbered steps, the current one is the ink pill */}
            <StepRail steps={STEPS} step={step} setStep={setStep} label="Calculator steps" />

            {/* question card */}
            <QuestionCard
              tag={step === LAST ? <span style={{ color: INDIGO }}>Your fee</span> : <><span style={{ color: INDIGO }}>Question {step + 1}</span><span>of {LAST}</span></>}
              title={step === LAST ? "Your fee" : QUESTIONS[step].title}
              help={step === LAST ? "Everything on the right is itemised — nothing appears later that is not on that list." : QUESTIONS[step].help}
              footer={
                <>
                  {step !== LAST && (
                    <>
                      <button type="button" className="pk-ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={ghostPill(step === 0)}>Back</button>
                      <button type="button" className="pk-ink" onClick={() => setStep(Math.min(LAST, step + 1))} style={inkPill()}>{step === LAST - 1 ? "See my fee" : "Next"}</button>
                    </>
                  )}
                  <MiniTotal>{feeMini}</MiniTotal>
                </>
              }
            >
              {step === LAST ? (
                <div>
                  <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: "#3F3F46", margin: 0, textWrap: "pretty" }}>{summary}</p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
                    <Button variant="dark" size="md" onClick={() => openModal("proposal")}>{ctaLabel} <Icon name="arrow-right" size={16} color="#fff" /></Button>
                    <Button variant="outline-light" size="md" onClick={() => openModal("consultation")}>Book a consultation</Button>
                  </div>
                  {/* Upload-and-save upsell removed (owner 2026-08-27) — the
                      box now only appears as confirmation once statements have
                      actually been read or a held quote applies. */}
                  {(data || held !== null) && (
                    <div style={{ ...softNote, marginTop: 18, display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <Icon name="file-check-2" size={17} color={INDIGO} style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>
                        {held !== null
                          ? "Priced from the statements you sent us — the fee above is the one we quoted you."
                          : "Your statements have been read, and the planning saving is already off the fee above."}
                        {data && (
                          <> <button type="button" className="pk-link" onClick={() => setAmode("docs")} style={{ ...linkBtn, fontSize: 14 }}>See your quote</button></>
                        )}
                      </span>
                    </div>
                  )}
                  <p style={{ fontFamily: BODY, fontSize: 13, color: "#71717A", margin: "14px 0 0" }}>Fixed after a short scoping call. Never below €{AUDIT_PRE_TRADING}. {PRICING_VAT_NOTE}</p>
                </div>
              ) : (
                <Pills items={QUESTIONS[step].items} value={String(answers[QUESTIONS[step].key])} set={(id) => set({ [QUESTIONS[step].key]: id } as Partial<AuditInput>)} />
              )}
            </QuestionCard>

            {/* fee panel — set like the quote document's totals */}
            <FeeDoc
              label="Estimated audit fee"
              rows={lines}
              amount={feeBig}
              per={!q.refer ? "/ year" : undefined}
              gradient={!q.refer}
              note={feeNote}
            >
              <Button variant="dark" size="md" onClick={() => openModal("proposal")} style={{ width: "100%" }}>{ctaLabel} <Icon name="arrow-right" size={16} color="#fff" /></Button>
            </FeeDoc>
          </div>
        ) : (
          /* ---- Upload last year's FS: the scoping form, A4's real review engine ---- */
          <div style={{ ...cardStyle, maxWidth: 760, margin: "clamp(48px,6vw,80px) auto 0" }}>
            {data ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: "#52525B", display: "inline-flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <Icon name="file-check-2" size={18} color={INDIGO} /> {data.framework} review — {data.company}
                  </span>
                  <button type="button" className="pk-link" onClick={resetReview} style={{ ...linkBtn, color: "#52525B", flexShrink: 0 }}>New</button>
                </div>
                <div style={{ background: DARK_CARD, border: "1px solid rgba(255,255,255,.08)", borderRadius: 24, padding: "clamp(22px,3vw,30px)", color: "#FFFFFF", marginTop: 18 }}>
                  {engineFee !== null ? (
                    <>
                      <div style={{ ...kicker, color: "#A1A1AA" }}>Priced from your statements</div>
                      <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
                        <span style={{ fontFamily: SANS, fontWeight: 600, fontVariantNumeric: "tabular-nums", fontSize: "clamp(40px,4.4vw,56px)", letterSpacing: "-0.04em", lineHeight: 1.1, ...gradText }}>{euro(engineFee)}</span>
                        <span style={{ fontFamily: BODY, fontSize: 15, fontWeight: 500, color: "#A1A1AA" }}>/ year</span>
                      </div>
                      <p style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.6, color: "#A1A1AA", margin: "14px 0 0" }}>
                        Read from the {data.quote?.docKind === "management_accounts" ? "management accounts" : "statements"} you sent{answers.year === "multi" ? `, per year — ${labelOf(NYRS, answers.nyrs).toLowerCase()} to audit` : ""}. Fixed after one short scoping call. Excludes VAT and the annual tax return.
                      </p>
                      {data.emailed && (
                        <p style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.6, color: "#A1A1AA", margin: "8px 0 0" }}>
                          We&apos;ve emailed this quote to {contact.email}, with a link to book your scoping call.
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <div style={{ ...kicker, color: "#A1A1AA" }}>Your fee</div>
                      <p style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.65, color: "#D4D4D8", margin: "12px 0 0" }}>
                        Your file is reviewed — we&apos;ll confirm the fixed fee on a short scoping call. For a number right now, answer the four questions: sending this file takes the planning saving off whatever it lands on.
                      </p>
                      <Button variant="outline-dark" size="md" onClick={() => { setAmode("ask"); setStep(0); }} style={{ marginTop: 18 }}>Answer four questions <Icon name="arrow-right" size={16} color="#fff" /></Button>
                    </>
                  )}
                </div>

                {/* Findings, AI commentary, check counts and report downloads are all
                    deliberately NOT rendered here (owner 2026-08-28): this page sells the
                    audit, so the visitor gets the fee and nothing else. The engine still
                    runs the full review — the findings travel with the lead and we walk
                    the client through them on the scoping call. /accounting-health-check
                    remains the page whose product IS the findings. */}
                <div style={{ marginTop: 22, paddingTop: 22, borderTop: "1px solid #E4E4E7", display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Button variant="dark" size="md" onClick={() => openModal("proposal")}>{ctaLabel} <Icon name="arrow-right" size={16} color="#fff" /></Button>
                  <Button variant="outline-light" size="md" href={BOOK_A_CALL_PATH}>Book a call</Button>
                </div>
                <p style={{ fontFamily: BODY, fontSize: 13, lineHeight: 1.55, color: "#71717A", margin: "14px 0 0" }}>Indicative pre-check, not a substitute for audit. Fixed after a short scoping call, never below the pre-trading figure of our scale (€{AUDIT_PRE_TRADING} for a full audit, €{auditFloor(true)} for a review). {PRICING_VAT_NOTE}</p>
              </div>
            ) : (
              <div>
                <h3 style={{ fontFamily: SANS, fontWeight: 600, fontSize: "clamp(26px,2.4vw,34px)", letterSpacing: "-0.035em", lineHeight: 1.1, color: INK, margin: 0 }}>Send the numbers</h3>
                <p style={{ fontFamily: BODY, fontSize: 15.5, lineHeight: 1.6, color: "#52525B", margin: "12px 0 0", textWrap: "pretty" }}>
                  Upload last year&apos;s financial statements or management accounts. We run a real disclosure, consistency and casting review on the file, price the audit from it, and take the planning saving off your fee. We go through what we found on the scoping call.
                </p>
                {/* The way back. Nothing here clears an answer, so a visitor who
                    opened this from the fee step returns to exactly what they
                    left — saying so is what makes the trip safe to take. */}
                <button type="button" className="pk-link" onClick={() => setAmode("ask")} style={{ ...linkBtn, marginTop: 14 }}>
                  ← Back to the questions — your answers are kept
                </button>

                <div style={block}>
                  <div style={fieldLabel}>Which year needs auditing?</div>
                  <div style={{ marginTop: 12 }}><Pills compact items={YEARS} value={answers.year} set={(id) => set({ year: id })} /></div>
                  {answers.year === "multi" && <div style={{ marginTop: 10 }}><Pills compact items={NYRS} value={answers.nyrs} set={(id) => set({ nyrs: id })} /></div>}
                </div>

                <div style={block}>
                  <div style={fieldLabel}>Any major changes since that year?</div>
                  <div style={hintLabel}>New activity, new owners, a big jump in volume — anything that makes last year a poor guide.</div>
                  <div style={{ marginTop: 12 }}><Pills compact items={CHANGES} value={answers.chg} set={(id) => set({ chg: id })} /></div>
                </div>

                <div style={block}>
                  <div style={fieldLabel}>Need the annual tax return as well?</div>
                  <div style={{ marginTop: 12 }}><Pills compact items={TAX_RETURN} value={answers.taxret} set={(id) => set({ taxret: id })} /></div>
                </div>

                <div style={block}>
                  <div style={fieldLabel}>What are you sending?</div>
                  <div style={{ marginTop: 12 }}>
                    <Pills compact items={[{ id: "fs", label: "Financial statements" }, { id: "mgmt", label: "Management accounts" }]} value={answers.doc} set={(id) => set({ doc: id as "fs" | "mgmt" })} />
                  </div>
                </div>

                {!file ? (
                  <div
                    className="pk-drop"
                    role="button"
                    tabIndex={0}
                    aria-label="Upload your financial statements (PDF or Word)"
                    onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={(e) => { e.preventDefault(); setDrag(false); chooseFile(e.dataTransfer.files[0]); }}
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
                    style={{
                      marginTop: 22, cursor: "pointer", padding: "30px 22px", textAlign: "center",
                      borderRadius: 20, borderStyle: "dashed", borderWidth: 1.5,
                      borderColor: drag ? INDIGO : "#D4D4D8",
                      background: drag ? "rgba(79,85,241,.06)" : "#FAFAFA", transition: "border-color .25s, background .25s",
                    }}
                  >
                    <input ref={inputRef} name="financial_statements" type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => { chooseFile(e.target.files?.[0]); e.currentTarget.value = ""; }} />
                    <span aria-hidden="true" style={{ width: 52, height: 52, margin: "0 auto", borderRadius: 16, display: "grid", placeItems: "center", background: "rgba(79,85,241,.08)" }}>
                      <Icon name="upload-cloud" size={24} color={INDIGO} stroke={1.75} />
                    </span>
                    <div style={{ fontFamily: SANS, fontSize: 17, fontWeight: 600, color: INK, marginTop: 14 }}>Drop the file here or click to upload</div>
                    <div style={{ fontFamily: BODY, fontSize: 13.5, color: "#71717A", marginTop: 6 }}>PDF or Word · confidential, processed in memory, never stored</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 14, marginTop: 22 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, background: "#FAFAFA", border: "1px solid #E4E4E7" }}>
                      <Icon name="file-text" size={18} color={INDIGO} />
                      <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: INK, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{file.name}</span>
                      <button type="button" className="pk-link" onClick={resetReview} style={{ ...linkBtn, color: "#52525B" }}>Change</button>
                    </div>

                    <Field required name="email" type="email" placeholder="Work email" autoComplete="email" aria-label="Work email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} style={fieldInput} />
                    <Field required name="name" placeholder="Your name" autoComplete="name" aria-label="Your name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} style={fieldInput} />
                    <Field name="company" placeholder="Company (optional)" autoComplete="organization" aria-label="Company (optional)" value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} style={fieldInput} />

                    <label style={{ display: "flex", flexDirection: "column", gap: 8, ...fieldLabel, fontSize: 15 }}>
                      Anything else we should know?
                      <textarea name="notes" rows={3} className="pk-input" value={notes} onChange={(e) => setNotes(e.target.value)}
                        placeholder="Foreign income, related-party loans, a pending dispute — whatever helps us quote well."
                        style={{ ...lightInput, height: "auto", minHeight: 96, padding: "14px 16px", fontFamily: BODY, fontSize: 15, fontWeight: 400, lineHeight: 1.5, resize: "vertical" }} />
                    </label>

                    {!verified ? (
                      <div style={{ border: "1px solid #E4E4E7", borderRadius: 18, padding: 18, background: "#FAFAFA", display: "grid", gap: 12 }}>
                        <div style={{ fontFamily: BODY, fontSize: 15, color: "#3F3F46", lineHeight: 1.5 }}>
                          <strong style={{ color: INK }}>Confirm your email to run the review.</strong> We&apos;ll send a 6-digit code.
                        </div>
                        {!codeSent ? (
                          <button type="button" className="pk-ghost" disabled={!emailValid || vBusy} onClick={sendCode}
                            style={{ ...outlineBtn, alignSelf: "start", opacity: !emailValid || vBusy ? 0.5 : 1, cursor: !emailValid || vBusy ? "default" : "pointer" }}>
                            {vBusy ? "Sending…" : "Send me a code"}
                          </button>
                        ) : (
                          <>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                              <Field placeholder="6-digit code" inputMode="numeric" maxLength={6} aria-label="6-digit code" value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                                style={{ ...fieldInput, maxWidth: 180, letterSpacing: "3px", fontWeight: 600 }} />
                              <button type="button" className="pk-ink" disabled={code.length < 6 || vBusy} onClick={confirmCode} style={primaryBtn(code.length < 6 || vBusy)}>
                                {vBusy ? "Checking…" : "Confirm"}
                              </button>
                            </div>
                            <div style={{ fontFamily: BODY, fontSize: 14, color: "#52525B" }}>
                              {devCode ? `Test mode — your code is ${devCode}. ` : `Code sent to ${contact.email}. `}
                              <button type="button" className="pk-link" onClick={sendCode} disabled={vBusy} style={{ ...linkBtn, fontSize: 14 }}>Resend</button>
                            </div>
                          </>
                        )}
                        {vErr && <p style={{ color: "#c2303d", fontFamily: BODY, fontSize: 14, margin: 0 }}>{vErr}</p>}
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: SANS, fontSize: 15, color: INDIGO, fontWeight: 600 }}>
                        <Icon name="check" size={17} color={INDIGO} stroke={2.6} /> Email confirmed — {verifiedEmail}
                      </div>
                    )}

                    <label style={{ fontFamily: BODY, fontSize: 14.5, display: "flex", gap: 12, alignItems: "flex-start", color: "#3F3F46", lineHeight: 1.55, cursor: "pointer" }}>
                      <input type="checkbox" className="pk-check" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                      I understand my file is processed — including by AI models — to generate this review, and is kept securely with my enquiry. Ask us at any time and we will delete it.
                    </label>

                    <button type="button" className="pk-ink" disabled={submitDisabled} onClick={runReview} style={primaryBtn(submitDisabled)}>
                      {status === "loading" ? "Analyzing… (up to ~60s)" : verified ? "Run my review" : "Confirm your email to run"}
                    </button>
                    {status === "error" && failure && <ReviewFailureNotice failure={failure} />}
                  </div>
                )}
                {fileError && <p role="alert" style={{ color: "#c2303d", fontFamily: BODY, fontSize: 14, margin: "10px 0 0" }}>{fileError}</p>}

                <p style={{ fontFamily: BODY, fontSize: 13, lineHeight: 1.55, color: "#71717A", margin: "18px 0 0" }}>
                  The file is only used to review and scope the audit. Fixed after a short scoping call, never below the pre-trading figure of our scale (€{AUDIT_PRE_TRADING} for a full audit, €{auditFloor(true)} for a review). {PRICING_VAT_NOTE}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* lead modal */}
      {modal && (
        <KitModal onClose={() => setModal(false)} labelledBy="audit-lead-title">
          {done ? (
            <div style={{ textAlign: "center", padding: "6px 0" }}>
              <DoneMark />
              <div id="audit-lead-title" style={{ fontWeight: 600, fontSize: 26, letterSpacing: "-0.03em" }}>{intent === "proposal" ? "Proposal request received" : "Consultation requested"}</div>
              <div style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: "#52525B", margin: "10px 0 0" }}>Thanks, {form.name.split(" ")[0]}. Our licensed audit firm will contact you within 1 business day at <strong style={{ color: INK }}>{form.email}</strong>.</div>
              <div style={{ fontFamily: BODY, fontSize: 13, color: "#71717A", marginTop: 14 }}>Reference: {done}{q.refer ? "" : ` · estimate ${euro(engineFee ?? q.final)}/yr`}</div>
              <Button variant="outline-light" size="md" onClick={() => setModal(false)} style={{ width: "100%", marginTop: 22 }}>Close</Button>
            </div>
          ) : (
            <div>
              <div id="audit-lead-title" style={{ fontWeight: 600, fontSize: 26, letterSpacing: "-0.03em", lineHeight: 1.15 }}>{intent === "proposal" ? "Request your audit proposal" : "Book your audit consultation"}</div>
              <div style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: "#52525B", margin: "8px 0 22px" }}>
                We&apos;ll confirm scope and a fixed fee{q.refer ? "" : ` (estimate ${euro(engineFee ?? q.final)}/yr)`}. No obligation.
              </div>
              {([["name", "Your name", "text"], ["company", "Company name", "text"], ["email", "Email address", "email"], ["phone", "Phone (optional)", "tel"]] as const).map(([k, label, type]) => (
                <div key={k} style={{ marginBottom: 14 }}>
                  <label htmlFor={`audit-${k}`} style={kitLabel}>{label}</label>
                  <input id={`audit-${k}`} name={k} type={type} className="pk-input" autoComplete={k === "name" ? "name" : k === "company" ? "organization" : k === "email" ? "email" : "tel"} value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} style={lightInput} />
                </div>
              ))}
              {modalError && <div style={{ fontFamily: BODY, fontSize: 14, color: "#c2303d", marginBottom: 10 }}>{modalError}</div>}
              <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                <Button variant="dark" size="md" onClick={submitLead} style={{ flex: 1, opacity: modalSubmitting ? 0.6 : 1, pointerEvents: modalSubmitting ? "none" : "auto" }}>{modalSubmitting ? "Sending…" : intent === "proposal" ? "Send request" : "Request consultation"} <Icon name="arrow-right" size={16} color="#fff" /></Button>
                <Button variant="outline-light" size="md" onClick={() => setModal(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </KitModal>
      )}
    </section>
  );
}
