"use client";

import React, { useState, useRef } from "react";
import { Button, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
import { Field, primaryBtn, outlineBtn, type Contact } from "@/app/[locale]/accounting-health-check/components/Field";
import { FindingsList } from "@/app/[locale]/accounting-health-check/components/FindingsList";
import type { ReviewResponse } from "@/app/api/fs-gap-review/types";

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

export function FSReview() {
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [contact, setContact] = useState<Contact>({ email: "", name: "", company: "" });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [data, setData] = useState<ReviewResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Email confirmation gate — the real review only runs once the email is verified.
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

  const onFile = (f: File | null | undefined) => { if (f) setFile(f); };

  const submitDisabled = status === "loading" || !consent || !verified || !file;

  async function runReview() {
    if (submitDisabled || !file) return;
    setStatus("loading"); setError("");
    const fd = new FormData();
    fd.append("email", contact.email);
    fd.append("name", contact.name);
    fd.append("company", contact.company);
    fd.append("consent", String(consent));
    fd.append("verifiedToken", verifiedToken);
    fd.append("file", file);
    fd.append("kind", "fs");
    try {
      const res = await fetch("/api/fs-gap-review", { method: "POST", body: fd });
      const body = await res.json();
      if (!res.ok) { setError(body.error || "Review failed."); setStatus("error"); return; }
      setData(body); setStatus("idle");
    } catch {
      setError("Review failed. Please try again or book a call.");
      setStatus("error");
    }
  }

  const reset = () => {
    setFile(null); setData(null); setStatus("idle"); setError("");
    setConsent(false); setVerifiedToken(""); setVerifiedEmail(""); setCodeSent(false); setCode("");
  };

  const cardBase = { background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)" };

  return (
    <section id="fs-review" style={{ background: "var(--a4-surface-soft)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead
          align="center"
          eyebrow="Free FS review"
          title="Free financial-statements review"
          sub="Upload your latest financial statements and our real review engine flags disclosure, consistency and casting issues — free. Confirm your email to run it; a full findings report follows."
          maxWidth={700}
        /></Reveal>

        <Reveal delay={80} style={{ maxWidth: 700, margin: "44px auto 0" }}>
          {data ? (
            <div style={{ ...cardBase, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "20px 24px", borderBottom: "1px solid var(--a4-hairline-light)" }}>
                <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 18, color: "var(--a4-ink)" }}>{data.framework} review — {data.company}</div>
                <button onClick={reset} style={{ background: "none", border: 0, cursor: "pointer", color: "var(--a4-mute)", fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="rotate-ccw" size={14} color="var(--a4-mute)" /> New</button>
              </div>
              <div style={{ padding: "18px 24px", fontFamily: "var(--a4-font-body)", fontSize: 13.5, color: "var(--a4-mute)" }}>
                {data.stats.checks_run} checks · {data.stats.checks_passed} passed · {data.stats.checks_failed} flagged
              </div>
              <div style={{ padding: "0 24px 22px" }}>
                <FindingsList findings={data.findings} />
              </div>
              <div style={{ padding: "16px 24px", background: "var(--a4-surface-soft)", display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" style={primaryBtn()} onClick={() => download(data.reportBase64, data.reportName, "application/pdf")}>⬇ Download report (PDF)</button>
                {data.annotatedDocxBase64 && (
                  <button type="button" style={outlineBtn} onClick={() => download(data.annotatedDocxBase64!, data.annotatedName || "review.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}>⬇ Annotated Word</button>
                )}
                <Button variant="cobalt" size="md" href="#estimate">Get an audit quote <Icon name="arrow-right" size={16} color="#fff" /></Button>
              </div>
            </div>
          ) : (
            <div style={{ ...cardBase, padding: "clamp(28px,4vw,40px)" }}>
              {!file ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]); }}
                  onClick={() => inputRef.current?.click()}
                  style={{
                    cursor: "pointer", padding: "clamp(28px,5vw,48px)", textAlign: "center",
                    borderRadius: "var(--a4-r-md)", borderStyle: "dashed", borderWidth: 2,
                    borderColor: drag ? "var(--a4-primary)" : "var(--a4-hairline-strong)",
                    background: drag ? "var(--a4-surface-soft)" : "transparent", transition: "border-color .15s, background .15s",
                  }}>
                  <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => onFile(e.target.files?.[0])} />
                  <div style={{ width: 60, height: 60, borderRadius: "var(--a4-r-full)", background: "var(--a4-surface-soft)", display: "grid", placeItems: "center", margin: "0 auto" }}>
                    <Icon name="upload-cloud" size={28} color="var(--a4-primary)" stroke={1.75} />
                  </div>
                  <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "var(--a4-ink)", marginTop: 20 }}>Drop your financial statements here</div>
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, color: "var(--a4-mute)", marginTop: 8 }}>PDF or Word · or <span style={{ color: "var(--a4-primary)", fontWeight: 600 }}>browse your files</span></div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 22 }}>
                    <Icon name="lock" size={13} color="var(--a4-stone)" />
                    <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-stone)" }}>Confidential · processed in memory, never stored · indicative pre-check, not a substitute for audit</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <Icon name="file-text" size={18} color="var(--a4-primary)" />
                    <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, fontWeight: 600, color: "var(--a4-ink)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{file.name}</span>
                    <button onClick={reset} style={{ background: "none", border: 0, cursor: "pointer", color: "var(--a4-mute)", fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600 }}>Change</button>
                  </div>

                  <Field required type="email" placeholder="Work email" autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                  <Field required placeholder="Your name" autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                  <Field placeholder="Company (optional)" autoComplete="organization" value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} />

                  {!verified ? (
                    <div style={{ border: "1px solid var(--a4-hairline-light)", borderRadius: 12, padding: 14, background: "var(--a4-surface-soft)", display: "grid", gap: 10 }}>
                      <div style={{ fontSize: 13.5, color: "var(--a4-charcoal)", lineHeight: 1.5 }}>
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
                          <div style={{ fontSize: 12.5, color: "var(--a4-mute)" }}>
                            {devCode ? `Test mode — your code is ${devCode}. ` : `Code sent to ${contact.email}. `}
                            <button type="button" onClick={sendCode} disabled={vBusy} style={{ background: "none", border: 0, color: "var(--a4-primary)", cursor: "pointer", fontWeight: 600, fontSize: 12.5, padding: 0 }}>Resend</button>
                          </div>
                        </>
                      )}
                      {vErr && <p style={{ color: "#c2303d", fontSize: 13.5, margin: 0 }}>{vErr}</p>}
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#1a7f4b", fontWeight: 600 }}>
                      <span aria-hidden>✓</span> Email confirmed — {verifiedEmail}
                    </div>
                  )}

                  <label style={{ fontSize: 13.5, display: "flex", gap: 9, alignItems: "flex-start", color: "var(--a4-charcoal)", lineHeight: 1.5 }}>
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3, accentColor: "var(--a4-primary)", width: 16, height: 16 }} />
                    I understand my file is processed to generate this review and is not stored.
                  </label>

                  <button type="button" disabled={submitDisabled} onClick={runReview} style={primaryBtn(submitDisabled)}>
                    {status === "loading" ? "Analyzing… (up to ~60s)" : verified ? "Run my review" : "Confirm your email to run"}
                  </button>
                  {status === "error" && <p style={{ color: "#c2303d", fontSize: 14, margin: 0 }}>{error}</p>}
                </div>
              )}
            </div>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
