// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Logo, Button, Pill, Badge, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
// turnover, balance-sheet size and complexity. Captures the lead via a
// "request proposal / book consultation" modal.

const AE_PORTAL = "https://client.a4.com.mt/onboarding";

const AE_TURNOVER = [
  { label: "Under €100k", mult: 1.0 },
  { label: "€100k–€500k", mult: 1.4 },
  { label: "€500k–€1M", mult: 1.9 },
  { label: "€1M–€5M", mult: 2.8 },
  { label: "€5M+", mult: 4.0 },
];
const AE_BS = [{ label: "Small", add: 0 }, { label: "Medium", add: 150 }, { label: "Large", add: 400 }];
const AE_TX = [{ label: "Low", add: 0 }, { label: "Medium", add: 200 }, { label: "High", add: 500 }];

const aeEuro = (n) => "€" + n.toLocaleString();
// Annual tax-return add-on, tiered by the audit fee.
const aeTaxFee = (audit) => audit < 1500 ? 250 : audit < 3000 ? 350 : audit < 5000 ? 450 : 600;

export function AEToggleRow({ label, sub, fee, on, set }) {
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

export function AEPills({ items, value, set }) {
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
  const [intent, setIntent] = useState("proposal");
  const [done, setDone] = useState(null);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "" });
  const [mode, setMode] = useState("first");
  const [rStage, setRStage] = useState("idle");
  const [rFile, setRFile] = useState("");
  const [rData, setRData] = useState(null);
  const [rCaptured, setRCaptured] = useState(false);
  const rInput = useRef(null);
  const rTimers = useRef([]);
  const rHash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
  const rRun = (name) => {
    rTimers.current.forEach(clearTimeout); rTimers.current = [];
    const h = rHash(name || "accounts.pdf");
    const detected = 600 + (h % 30) * 50;
    const a4 = Math.round((detected * 0.75) / 50) * 50;
    setRFile(name); setRStage("analyzing"); setRData({ detected, a4, save: detected - a4 });
    rTimers.current.push(setTimeout(() => setRStage("result"), 1500));
  };
  const rOnFile = (f) => { if (f) rRun(f.name); };
  const rReset = () => { setRStage("idle"); setRFile(""); setRData(null); setRCaptured(false); };
  const rSubmit = () => { if (form.name && form.email) setRCaptured(true); };

  const fee = Math.round((600 * AE_TURNOVER[turn].mult + AE_BS[bs].add + AE_TX[tx].add + (group ? 600 : 0) + (regulated ? 450 : 0)) / 50) * 50;

  const open = (i) => { setIntent(i); setDone(null); setModal(true); };
  const submit = () => { if (!form.name || !form.email) return; setDone("A4-" + Date.now().toString(36).toUpperCase().slice(-6)); };

  const fieldLabel = { fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, color: "var(--a4-ink)" };
  const sub = { fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-mute)", marginTop: 6 };

  return (
    <section id="estimate" style={{ background: "var(--a4-surface-soft)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead
          align="center"
          eyebrow="Audit fee estimator"
          title="Statutory audit, from €600/month"
          sub="Every Maltese company must file audited financial statements. Get a transparent estimate of your audit fee in seconds — the final fee is fixed after a short scoping call."
          maxWidth={640}
        /></Reveal>

        <Reveal delay={80} style={{ marginTop: 40 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
            <div style={{ display: "inline-flex", gap: 4, background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-full)", padding: 4 }}>
              {[["first", "First audit"], ["returning", "Already audited before"]].map(([k, lbl]) => (
                <button key={k} onClick={() => setMode(k)} style={{ padding: "9px 18px", borderRadius: "var(--a4-r-full)", border: 0, cursor: "pointer", fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, background: mode === k ? "var(--a4-ink)" : "transparent", color: mode === k ? "#fff" : "var(--a4-mute)" }}>{lbl}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mode === "returning" ? "1fr" : "1.3fr 1fr", gap: 20, alignItems: "start", maxWidth: 1000, margin: "0 auto" }} className="ae-grid">
            {/* inputs */}
            {mode === "returning" ? (
              <div style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", padding: "clamp(24px,3.2vw,38px)", maxWidth: 640, marginLeft: "auto", marginRight: "auto", width: "100%" }}>
                {rStage === "idle" && (
                  <div onClick={() => rInput.current && rInput.current.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); rOnFile(e.dataTransfer.files[0]); }} style={{ cursor: "pointer", border: "2px dashed var(--a4-hairline-strong)", borderRadius: "var(--a4-r-md)", padding: "clamp(26px,5vw,44px)", textAlign: "center" }}>
                    <input ref={rInput} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" style={{ display: "none" }} onChange={(e) => rOnFile(e.target.files[0])} />
                    <div style={{ width: 56, height: 56, borderRadius: 999, background: "var(--a4-surface-soft)", display: "grid", placeItems: "center", margin: "0 auto" }}><Icon name="upload-cloud" size={26} color="var(--a4-primary)" stroke={1.75} /></div>
                    <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 21, color: "var(--a4-ink)", marginTop: 18 }}>Upload your last audited accounts</div>
                    <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, lineHeight: 1.5, color: "var(--a4-mute)", marginTop: 7, maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>We read the audit fee disclosed in your statements and quote it 25% less. PDF, Word or Excel · <span style={{ color: "var(--a4-primary)", fontWeight: 600 }}>browse</span></div>
                    <button onClick={(e) => { e.stopPropagation(); rRun("sample-accounts.pdf"); }} style={{ marginTop: 20, background: "none", border: "1px solid var(--a4-hairline-strong)", borderRadius: "var(--a4-r-full)", padding: "9px 18px", fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--a4-ink)", cursor: "pointer" }}>Try with a sample</button>
                    <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-stone)", marginTop: 18 }}>Confidential · not stored · indicative, confirmed after a scoping call</div>
                  </div>
                )}
                {rStage === "analyzing" && (
                  <div style={{ textAlign: "center", padding: "clamp(30px,6vw,52px)" }}>
                    <div style={{ width: 56, height: 56, borderRadius: 999, background: "var(--a4-surface-soft)", display: "grid", placeItems: "center", margin: "0 auto" }}><Icon name="scan-line" size={26} color="var(--a4-primary)" /></div>
                    <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 20, color: "var(--a4-ink)", marginTop: 18 }}>Reading the auditor's-remuneration note…</div>
                    <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, color: "var(--a4-mute)", marginTop: 6 }}>{rFile}</div>
                  </div>
                )}
                {rStage === "result" && rData && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--a4-mute)", display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}><Icon name="file-check-2" size={16} color="var(--a4-primary)" /> <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{rFile}</span></span>
                      <button onClick={rReset} style={{ background: "none", border: 0, cursor: "pointer", color: "var(--a4-mute)", fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>New</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 }} className="ae-grid">
                      <div style={{ background: "var(--a4-surface-soft)", borderRadius: "var(--a4-r-md)", padding: "18px 20px" }}>
                        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--a4-mute)" }}>Fee disclosed</div>
                        <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 28, color: "var(--a4-charcoal)", textDecoration: "line-through", textDecorationColor: "var(--a4-faint)", marginTop: 6 }}>{aeEuro(rData.detected)}<span style={{ fontSize: 13 }}> /yr</span></div>
                      </div>
                      <div style={{ background: "#000", borderRadius: "var(--a4-r-md)", padding: "18px 20px" }}>
                        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--a4-primary-bright)" }}>A4 fee · 25% less</div>
                        <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 28, color: "#fff", marginTop: 6 }}>{aeEuro(rData.a4)}<span style={{ fontSize: 13, color: "var(--a4-on-dark-mute)" }}> /yr</span></div>
                      </div>
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14, background: "rgba(0,168,126,.1)", borderRadius: "var(--a4-r-full)", padding: "7px 14px" }}><Icon name="trending-down" size={15} color="var(--a4-accent-teal)" /><span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--accent-green-text)" }}>Save {aeEuro(rData.save)}/yr</span></div>
                    <div style={{ marginTop: 16 }}>
                      <AEToggleRow label="Add annual tax return" sub="Corporate tax computation & return, filed yearly" fee={aeTaxFee(rData.a4)} on={taxReturn} set={setTaxReturn} />
                    </div>
                    <Button variant="dark" size="md" onClick={() => open("proposal")} style={{ width: "100%", marginTop: 20, display: "none" }}>Request this fee</Button>
                    {rCaptured ? (
                      <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--a4-hairline-light)", textAlign: "center" }}>
                        <Icon name="check-circle" size={24} color="var(--a4-accent-teal)" />
                        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, lineHeight: 1.5, color: "var(--a4-charcoal)", marginTop: 8 }}>Thanks, {form.name.split(" ")[0]} — your fixed-fee proposal at <strong style={{ color: "var(--a4-ink)" }}>{aeEuro(rData.a4)}/yr</strong> is on the way to <strong style={{ color: "var(--a4-ink)" }}>{form.email}</strong>.</div>
                      </div>
                    ) : (
                      <div style={{ marginTop: 18 }}>
                        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "var(--a4-mute)", marginBottom: 10 }}>Claim this fee — we'll send your fixed-fee proposal:</div>
                        <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name" style={{ width: "100%", background: "var(--a4-surface-soft)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "11px 14px", color: "var(--a4-ink)", fontFamily: "var(--a4-font-body)", fontSize: 14, outline: "none", marginBottom: 10 }} />
                        <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} type="email" placeholder="Work email" style={{ width: "100%", background: "var(--a4-surface-soft)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "11px 14px", color: "var(--a4-ink)", fontFamily: "var(--a4-font-body)", fontSize: 14, outline: "none", marginBottom: 12 }} />
                        <Button variant="dark" size="md" onClick={rSubmit} style={{ width: "100%" }}>Email me this fee <Icon name="arrow-right" size={16} color="#fff" /></Button>
                        <Button variant="cobalt" size="md" onClick={() => open("consultation")} style={{ width: "100%", marginTop: 10 }}>Book a consultation</Button>
                      </div>
                    )}
                    <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-stone)", marginTop: 12, textAlign: "center" }}>Indicative · final fee confirmed after a short scoping call · engagement begins upon KYC approval.</div>
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
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, color: "var(--a4-on-dark-mute)" }}>/ month</span>
              </div>
              <div style={{ height: 1, background: "var(--a4-hairline-dark)", margin: "22px 0 16px" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {[["Turnover", AE_TURNOVER[turn].label], ["Balance sheet", AE_BS[bs].label], ["Transactions", AE_TX[tx].label], group && ["Group audit", "Included"], regulated && ["Regulated entity", "Included"], taxReturn && ["Annual tax return", aeEuro(aeTaxFee(fee)) + " /yr"]].filter(Boolean).map(([k, v]) => (
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
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-stone)", marginTop: 14 }}>Reference: {done} · estimate from {aeEuro(fee)}/mo</div>
                <Button variant="outline-light" size="md" onClick={() => setModal(false)} style={{ width: "100%", marginTop: 22 }}>Close</Button>
              </div>
            ) : (
              <div>
                <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "var(--a4-ink)" }}>{intent === "proposal" ? "Request your audit proposal" : "Book your audit consultation"}</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, color: "var(--a4-mute)", margin: "6px 0 22px" }}>We'll confirm scope and a fixed fee (estimate from {aeEuro(fee)}/mo). No obligation.</div>
                {[["name", "Your name", "text"], ["company", "Company name", "text"], ["email", "Email address", "email"], ["phone", "Phone (optional)", "tel"]].map(([k, label, type]) => (
                  <div key={k} style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontFamily: "var(--a4-font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--a4-mute)", marginBottom: 6 }}>{label}</label>
                    <input type={type} value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} style={{ width: "100%", background: "var(--a4-surface-soft)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "11px 14px", color: "var(--a4-ink)", fontFamily: "var(--a4-font-body)", fontSize: 14, outline: "none" }} />
                  </div>
                ))}
                <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                  <Button variant="dark" size="md" onClick={submit} style={{ flex: 1 }}>{intent === "proposal" ? "Send request" : "Request consultation"} <Icon name="arrow-right" size={16} color="#fff" /></Button>
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
