// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Logo, Button, Pill, Badge, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
// page. Upload (or sample) → animated AI analysis → severity-tagged findings +
// the audit fee detected from the auditor's-remuneration note → A4's fixed fee
// at 25% less → capture/CTA.
// NOTE: indicative demo. Findings + detected fee are generated client-side from
// the file name (deterministic) — wire to the real internal FS-review engine in
// production, with explicit consent + no-retention handling.

const FS_PORTAL = "https://client.a4.com.mt/onboarding";

const FS_STEPS = [
  "Reading the document…",
  "Checking disclosures & accounting policies…",
  "Casting & cross-referencing the notes…",
  "Detecting the auditor's remuneration…",
  "Comparing against A4 fixed pricing…",
];

const FS_FINDINGS = [
  { sev: "high", cat: "Disclosure", t: "Related-party transactions not fully disclosed" },
  { sev: "high", cat: "Going concern", t: "Going concern note missing required wording" },
  { sev: "high", cat: "Consistency", t: "Audit-fee disclosure differs from prior year" },
  { sev: "med", cat: "Policies", t: "Depreciation rates not stated for all asset classes" },
  { sev: "med", cat: "Tax", t: "Deferred tax not reconciled to the applicable rate" },
  { sev: "med", cat: "Cash flow", t: "Cash-flow classification differs from the notes" },
  { sev: "low", cat: "Presentation", t: "Rounding inconsistencies across the notes" },
  { sev: "low", cat: "Comparatives", t: "Comparative figures not relabelled" },
  { sev: "low", cat: "Directors' report", t: "A required directors' statement is missing" },
];

const FS_SEV = {
  high: { label: "High", color: "var(--accent-danger)", bg: "rgba(214,69,69,.1)" },
  med: { label: "Medium", color: "var(--accent-warning)", bg: "rgba(214,150,40,.12)" },
  low: { label: "Low", color: "var(--accent-blue-link)", bg: "rgba(42,111,219,.1)" },
};

const fsEuro = (n) => "€" + Math.round(n).toLocaleString();
// Deterministic small hash so the same file always yields the same result.
function fsHash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

export function FSReview() {
  const [stage, setStage] = useState("idle"); // idle | analyzing | result
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState("");
  const [drag, setDrag] = useState(false);
  const [data, setData] = useState(null);
  const [captured, setCaptured] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const timers = useRef([]);
  const inputRef = useRef(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const analyse = (name) => {
    const h = fsHash(name || "sample-financial-statements.pdf");
    const detected = 1800 + (h % 25) * 100;          // €1,800–€4,200
    const a4 = Math.round((detected * 0.75) / 50) * 50; // 25% less, rounded
    const high = 1 + (h % 2);                          // 1–2
    const med = 1 + ((h >> 2) % 3);                    // 1–3
    const low = 1 + ((h >> 4) % 3);                    // 1–3
    const pick = (sev, n) => FS_FINDINGS.filter((f) => f.sev === sev).slice(0, n);
    const findings = [...pick("high", high), ...pick("med", med), ...pick("low", low)];
    const total = findings.length;
    const score = Math.max(58, 96 - high * 12 - med * 5 - low * 2);
    setData({ detected, a4, save: detected - a4, findings, total, high, med, low, score });
  };

  const run = (name) => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setFileName(name); setStage("analyzing"); setStep(0); setCaptured(false);
    analyse(name);
    FS_STEPS.forEach((_, i) => timers.current.push(setTimeout(() => setStep(i + 1), 600 * (i + 1))));
    timers.current.push(setTimeout(() => setStage("result"), 600 * FS_STEPS.length + 500));
  };

  const onFile = (f) => { if (f) run(f.name); };
  const submit = () => { if (form.name && form.email) setCaptured(true); };
  const reset = () => { setStage("idle"); setFileName(""); setData(null); setCaptured(false); setForm({ name: "", email: "" }); };

  const cardBase = { background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)" };

  return (
    <section id="fs-review" style={{ background: "var(--a4-surface-soft)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead
          align="center"
          eyebrow="Free FS review"
          title="Free financial-statements review"
          sub="Upload your latest financial statements and our automated review flags potential disclosure, consistency and casting issues — in seconds, free. Detailed findings and recommended fixes come with your full review."
          maxWidth={700}
        /></Reveal>

        <Reveal delay={80} style={{ maxWidth: 920, margin: "44px auto 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: stage === "result" ? "1fr" : "1fr", gap: 20 }}>

            {/* IDLE — dropzone */}
            {stage === "idle" && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]); }}
                onClick={() => inputRef.current && inputRef.current.click()}
                style={{
                  ...cardBase, cursor: "pointer", padding: "clamp(36px,6vw,64px)", textAlign: "center",
                  borderStyle: "dashed", borderWidth: 2, borderColor: drag ? "var(--a4-primary)" : "var(--a4-hairline-strong)",
                  background: drag ? "var(--a4-surface-soft)" : "var(--a4-surface-card)", transition: "border-color .15s, background .15s",
                }}>
                <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" style={{ display: "none" }} onChange={(e) => onFile(e.target.files[0])} />
                <div style={{ width: 60, height: 60, borderRadius: "var(--a4-r-full)", background: "var(--a4-surface-soft)", display: "grid", placeItems: "center", margin: "0 auto" }}>
                  <Icon name="upload-cloud" size={28} color="var(--a4-primary)" stroke={1.75} />
                </div>
                <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "var(--a4-ink)", marginTop: 20 }}>Drop your financial statements here</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, color: "var(--a4-mute)", marginTop: 8 }}>PDF, Word or Excel · or <span style={{ color: "var(--a4-primary)", fontWeight: 600 }}>browse your files</span></div>
                <button onClick={(e) => { e.stopPropagation(); run("sample-financial-statements.pdf"); }} style={{ marginTop: 22, background: "none", border: "1px solid var(--a4-hairline-strong)", borderRadius: "var(--a4-r-full)", padding: "9px 18px", fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--a4-ink)", cursor: "pointer" }}>Try it with a sample statement</button>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 22 }}>
                  <Icon name="lock" size={13} color="var(--a4-stone)" />
                  <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-stone)" }}>Confidential · not stored · indicative pre-check, not a substitute for audit</span>
                </div>
              </div>
            )}

            {/* ANALYZING */}
            {stage === "analyzing" && (
              <div style={{ ...cardBase, padding: "clamp(28px,4vw,40px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 22 }}>
                  <Icon name="file-text" size={18} color="var(--a4-primary)" />
                  <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, fontWeight: 600, color: "var(--a4-ink)", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fileName}</span>
                  <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-mute)" }}>Analysing…</span>
                </div>
                <div style={{ height: 3, background: "var(--a4-hairline-light)", borderRadius: 3, overflow: "hidden", marginBottom: 22 }}>
                  <div style={{ height: "100%", width: `${(step / FS_STEPS.length) * 100}%`, background: "var(--a4-primary)", transition: "width .5s ease" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {FS_STEPS.map((t, i) => {
                    const done = i < step, active = i === step;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontFamily: "var(--a4-font-body)", fontSize: 14, color: done ? "var(--a4-ink)" : active ? "var(--a4-charcoal)" : "var(--a4-faint)" }}>
                        {done ? <Icon name="check" size={16} color="var(--a4-accent-teal)" stroke={2.5} /> : <span style={{ width: 16, height: 16, borderRadius: 999, border: "2px solid " + (active ? "var(--a4-primary)" : "var(--a4-hairline-strong)"), flexShrink: 0 }} />}
                        {t}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RESULT */}
            {stage === "result" && data && (
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, alignItems: "start" }} className="fs-resultgrid">
                {/* findings */}
                <div style={{ ...cardBase, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "20px 24px", borderBottom: "1px solid var(--a4-hairline-light)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                      <Icon name="file-check-2" size={18} color="var(--a4-primary)" />
                      <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, color: "var(--a4-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fileName}</span>
                    </div>
                    <button onClick={reset} style={{ background: "none", border: 0, cursor: "pointer", color: "var(--a4-mute)", fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="rotate-ccw" size={14} color="var(--a4-mute)" /> New</button>
                  </div>

                  {/* score + counts */}
                  <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 24px", borderBottom: "1px solid var(--a4-hairline-light)", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 42, color: "var(--a4-ink)", letterSpacing: "-1.5px" }}>{data.score}</span>
                      <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 15, color: "var(--a4-mute)" }}>/100</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, color: "var(--a4-ink)" }}>{data.total} potential issues found</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                        {[["high", data.high], ["med", data.med], ["low", data.low]].map(([s, n]) => (
                          <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 600, color: FS_SEV[s].color, background: FS_SEV[s].bg, borderRadius: "var(--a4-r-full)", padding: "4px 10px" }}>{n} {FS_SEV[s].label}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* finding rows */}
                  <div>
                    {data.findings.map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 24px", borderBottom: i < data.findings.length - 1 ? "1px solid var(--a4-hairline-light)" : "none" }}>
                        <span style={{ width: 7, height: 7, borderRadius: 999, background: FS_SEV[f.sev].color, flexShrink: 0 }} />
                        <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, color: "var(--a4-charcoal)", flex: 1, textWrap: "pretty" }}>{f.t}</span>
                        <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, fontWeight: 600, color: "var(--a4-mute)", whiteSpace: "nowrap" }}>{f.cat}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "14px 24px", background: "var(--a4-surface-soft)" }}>
                    <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-mute)" }}>Detailed findings &amp; recommended fixes are included in your full review.</span>
                  </div>
                </div>

                {/* capture */}
                <div className="a4-sum" style={{ background: "#000", borderRadius: "var(--a4-r-lg)", padding: "clamp(24px,3vw,30px)", color: "#fff", position: "sticky", top: 88 }}>
                  {captured ? (
                    <div style={{ textAlign: "center", padding: "6px 0" }}>
                      <Icon name="check-circle" size={28} color="var(--a4-accent-teal)" />
                      <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, lineHeight: 1.55, color: "var(--a4-on-dark)", marginTop: 12 }}>Thanks, {form.name.split(" ")[0]} — your full findings report is on the way to <strong>{form.email}</strong>.</div>
                      <Button variant="cobalt" size="md" href="#estimate" style={{ width: "100%", marginTop: 20 }}>Get an audit quote <Icon name="arrow-right" size={16} color="#fff" /></Button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "#fff", letterSpacing: "-.3px" }}>Get the full findings report</div>
                      <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, lineHeight: 1.55, color: "var(--a4-on-dark-mute)", margin: "10px 0 18px" }}>We'll email every issue we found, the detail behind it, and exactly how we'd put it right.</p>
                      <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name" style={{ width: "100%", background: "var(--a4-surface-deep)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-md)", padding: "11px 14px", color: "#fff", fontFamily: "var(--a4-font-body)", fontSize: 14, outline: "none", marginBottom: 10 }} />
                      <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} type="email" placeholder="Work email" style={{ width: "100%", background: "var(--a4-surface-deep)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-md)", padding: "11px 14px", color: "#fff", fontFamily: "var(--a4-font-body)", fontSize: 14, outline: "none", marginBottom: 14 }} />
                      <Button variant="primary" size="md" onClick={submit} style={{ width: "100%" }}>Email me the full report <Icon name="arrow-right" size={16} color="#000" /></Button>
                      <Button variant="cobalt" size="md" href="#estimate" style={{ width: "100%", marginTop: 10 }}>Looking for an audit quote?</Button>
                    </div>
                  )}
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 10.5, lineHeight: 1.5, color: "var(--a4-stone)", marginTop: 14, textAlign: "center" }}>Confidential · indicative automated review, not a substitute for audit.</div>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
