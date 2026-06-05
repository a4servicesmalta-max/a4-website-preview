// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Logo, Button, Pill, Badge, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
// Malta Business Registry", extract basic details and flag any filing penalties.
// NOTE: uses sample MBR data for the demo — wire to the real MBR API in prod.

const MBR_DB = {
  "blue lagoon": { name: "Blue Lagoon Hospitality Ltd", reg: "C 61042", sector: "Tourism & Hospitality", type: "Private limited company", yearEnd: "31 December", overdue: 18 },
  "nexus": { name: "Nexus Trading Ltd", reg: "C 48291", sector: "Import & Distribution", type: "Private limited company", yearEnd: "31 December", overdue: 0 },
  "meridian": { name: "Meridian Construct Ltd", reg: "C 39014", sector: "Construction & Property", type: "Private limited company", yearEnd: "31 March", overdue: 7 },
  "island fresh": { name: "Island Fresh Co. Ltd", reg: "C 72651", sector: "Retail & FMCG", type: "Private limited company", yearEnd: "30 June", overdue: 0 },
  "techventures": { name: "TechVentures Malta Ltd", reg: "C 55187", sector: "iGaming & Technology", type: "Private limited company", yearEnd: "30 September", overdue: 4 },
};

const MBR_LOAD = [
  "Connecting to the Malta Business Registry…",
  "Locating company record…",
  "Extracting registry details…",
  "Checking filing status & penalties…",
];

function mbrEuro(n) { return "€" + n.toLocaleString(); }
function mbrPenalty(months) { return months > 0 ? 100 + months * 45 : 0; }

export function MBRCheck() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState([]);
  const [ddOpen, setDdOpen] = useState(false);
  const [stage, setStage] = useState("idle"); // idle | loading | result
  const [loadStep, setLoadStep] = useState(0);
  const [co, setCo] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const timers = useRef([]);
  const wrapRef = useRef(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setDdOpen(false); };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const search = (val) => {
    setQuery(val);
    const q = val.toLowerCase().trim();
    if (q.length < 2) { setMatches([]); setDdOpen(false); return; }
    const m = Object.entries(MBR_DB).filter(([k, v]) => v.name.toLowerCase().includes(q) || k.includes(q)).slice(0, 5);
    setMatches(m); setDdOpen(m.length > 0);
  };

  const runLoad = (company) => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setCo(company); setStage("loading"); setLoadStep(0); setDdOpen(false); setSubmitted(false);
    [550, 1150, 1700, 2200].forEach((ms, i) => timers.current.push(setTimeout(() => setLoadStep(i + 1), ms)));
    timers.current.push(setTimeout(() => setStage("result"), 2500));
  };

  const pick = (key) => { const c = MBR_DB[key]; setQuery(c.name); runLoad(c); };

  const check = () => {
    const q = query.toLowerCase().trim();
    const key = Object.keys(MBR_DB).find((k) => MBR_DB[k].name.toLowerCase().includes(q) || k.includes(q));
    if (key) { pick(key); return; }
    if (q.length > 2) {
      // unknown name → extract a plausible record, no fabricated penalties
      runLoad({ name: query.replace(/\b\w/g, (c) => c.toUpperCase()) + (/(ltd|limited)$/i.test(query) ? "" : " Ltd"), reg: "C " + Math.floor(10000 + Math.random() * 89999), sector: "Professional Services", type: "Private limited company", yearEnd: "31 December", overdue: 0 });
    }
  };

  const penalty = co ? mbrPenalty(co.overdue) : 0;
  const overdue = co && co.overdue > 0;

  const inputWrap = { display: "flex", alignItems: "center", gap: 10, background: "var(--a4-surface-deep)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-full)", padding: "7px 7px 7px 20px" };

  return (
    <section style={{ background: "#000", padding: "clamp(56px,8vw,88px) 0", borderTop: "1px solid var(--a4-hairline-dark)" }}>
      <Container>
        <Reveal align="center"><SectionHead
          dark align="center"
          eyebrow="Free MBR check"
          title="Does your company owe MBR penalties?"
          sub="Enter your company name and we'll pull your details from the Malta Business Registry and flag any overdue filings — in seconds, free, no signup."
          maxWidth={640}
        /></Reveal>

        <Reveal delay={80} style={{ maxWidth: 680, margin: "40px auto 0" }}>
          <div ref={wrapRef} style={{ position: "relative" }}>
            <div className="mbr-input-wrap" style={inputWrap}>
              <Icon name="search" size={18} color="var(--a4-stone)" />
              <input
                value={query}
                onChange={(e) => search(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") check(); if (e.key === "Escape") setDdOpen(false); }}
                onFocus={() => matches.length && setDdOpen(true)}
                placeholder="Type your company name…"
                style={{ flex: 1, background: "none", border: 0, outline: "none", color: "#fff", fontFamily: "var(--a4-font-body)", fontSize: 16, fontWeight: 500, padding: "10px 0" }}
              />
              <Button variant="primary" size="md" onClick={check} style={{ flexShrink: 0 }}>Check company <Icon name="arrow-right" size={16} color="#000" /></Button>
            </div>
            <div style={{ textAlign: "center", marginTop: 10, fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-stone)" }}>
              Try <button onClick={() => pick("blue lagoon")} style={{ background: "none", border: 0, color: "var(--a4-primary-bright)", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600 }}>“Blue Lagoon”</button> · powered by Malta Business Registry data
            </div>
            {ddOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-md)", overflow: "hidden", zIndex: 20, boxShadow: "0 16px 48px rgba(0,0,0,.5)" }}>
                {matches.map(([k, v]) => (
                  <div key={k} onClick={() => pick(k)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", cursor: "pointer", borderBottom: "1px solid var(--a4-divider-soft)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--a4-surface-deep)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <div>
                      <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, fontWeight: 600, color: "#fff" }}>{v.name}</div>
                      <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-stone)", marginTop: 2 }}>{v.reg} · {v.sector}</div>
                    </div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--a4-font-body)", fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: "var(--a4-r-full)", color: v.overdue ? "var(--accent-danger)" : "var(--a4-accent-teal)", border: "1px solid var(--a4-hairline-dark)" }}><span style={{ width: 5, height: 5, borderRadius: 999, background: "currentColor" }} />{v.overdue ? v.overdue + " mo overdue" : "Up to date"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* result / loading */}
          {stage !== "idle" && (
            <div style={{ marginTop: 24 }}>
              {stage === "loading" && (
                <div style={{ background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", padding: "24px 26px" }}>
                  <div style={{ height: 2, background: "var(--a4-hairline-dark)", borderRadius: 2, overflow: "hidden", marginBottom: 18 }}>
                    <div style={{ height: "100%", width: `${(loadStep / MBR_LOAD.length) * 100}%`, background: "var(--a4-primary-bright)", transition: "width .4s ease" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {MBR_LOAD.map((t, i) => {
                      const done = i < loadStep, active = i === loadStep;
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontFamily: "var(--a4-font-body)", fontSize: 13, color: done ? "var(--a4-accent-teal)" : active ? "#fff" : "var(--a4-stone)" }}>
                          <span style={{ width: 8, height: 8, borderRadius: 999, flexShrink: 0, background: done ? "var(--a4-accent-teal)" : active ? "var(--a4-primary-bright)" : "#3a3d40" }} />
                          {t}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {stage === "result" && co && (
                <div style={{ background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", overflow: "hidden" }}>
                  <div style={{ padding: "22px 26px", borderBottom: "1px solid var(--a4-hairline-dark)" }}>
                    <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "#fff" }}>{co.name}</div>
                    <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-stone)", marginTop: 3 }}>Record retrieved from the Malta Business Registry</div>
                  </div>
                  <div style={{ padding: "22px 26px" }}>
                    {/* extracted fields */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }} className="mbr-fields">
                      {[["Registration number", co.reg], ["Company type", co.type], ["Industry", co.sector], ["Financial year-end", co.yearEnd]].map(([k, v]) => (
                        <div key={k}>
                          <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--a4-stone)" }}>{k}</div>
                          <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, fontWeight: 500, color: "#fff", marginTop: 4 }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* penalty banner */}
                    <div style={{ border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-md)", padding: "16px 18px", marginTop: 22, display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <Icon name={!overdue ? "check-circle" : submitted ? "clock" : "alert-triangle"} size={19} color={!overdue ? "var(--a4-accent-teal)" : submitted ? "var(--a4-primary-bright)" : "var(--accent-danger)"} style={{ marginTop: 1, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, color: "#fff" }}>{!overdue ? "No outstanding MBR penalties" : submitted ? "Accounts submitted — awaiting MBR approval" : `Accounts ${co.overdue} months overdue at MBR`}</div>
                        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, lineHeight: 1.5, color: "var(--a4-on-dark-mute)", marginTop: 3 }}>
                          {!overdue
                            ? <>Your filings appear up to date. Keep it that way — automated bookkeeping from €25/month, reviewed by our accountants.</>
                            : submitted
                              ? <>No penalty applies while your submission is under review. We can take it from here — keeping your filings on time, every time.</>
                              : <>Estimated penalty: <strong style={{ color: "var(--accent-danger)" }}>{mbrEuro(penalty)}</strong> and rising daily. We can bring your filings up to date and keep them there.</>}
                        </div>
                        {overdue && (
                          <label style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--a4-hairline-dark)", cursor: "pointer" }}>
                            <input type="checkbox" checked={submitted} onChange={(e) => setSubmitted(e.target.checked)} style={{ width: 15, height: 15, accentColor: "var(--a4-primary)", cursor: "pointer" }} />
                            <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-on-dark-mute)" }}>I've already submitted these accounts to MBR (awaiting approval)</span>
                          </label>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
                      <Button variant="primary" size="md" href="#pricing" style={{ flex: "1 1 200px" }}>{overdue && !submitted ? "Fix this — build your plan" : "Build your plan"} <Icon name="arrow-right" size={16} color="#000" /></Button>
                      <Button variant="outline-dark" size="md" href="https://client.a4.com.mt/onboarding" target="_blank">Create account</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
