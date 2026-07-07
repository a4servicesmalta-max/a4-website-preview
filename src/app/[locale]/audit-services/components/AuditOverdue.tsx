"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
// Enter a company → query MBR (sample data) → flag overdue audited accounts +
// estimated penalty, with an "already submitted (awaiting approval)" option.
// NOTE: sample data for the demo — wire to the real MBR API in production.

type Company = { name: string; reg: string; sector: string; lastAudited: string; overdue: number };

const AO_DB: Record<string, Company> = {
  "blue lagoon": { name: "Blue Lagoon Hospitality Ltd", reg: "C 61042", sector: "Tourism & Hospitality", lastAudited: "FY2023", overdue: 18 },
  "nexus": { name: "Nexus Trading Ltd", reg: "C 48291", sector: "Import & Distribution", lastAudited: "FY2024", overdue: 0 },
  "meridian": { name: "Meridian Construct Ltd", reg: "C 39014", sector: "Construction & Property", lastAudited: "FY2023", overdue: 9 },
  "island fresh": { name: "Island Fresh Co. Ltd", reg: "C 72651", sector: "Retail & FMCG", lastAudited: "FY2024", overdue: 0 },
  "techventures": { name: "TechVentures Malta Ltd", reg: "C 55187", sector: "iGaming & Technology", lastAudited: "FY2023", overdue: 6 },
};

const AO_LOAD = [
  "Connecting to the Malta Business Registry…",
  "Locating company record…",
  "Checking last audited financial statements…",
  "Calculating overdue period & penalties…",
];

const aoEuro = (n: number) => "€" + n.toLocaleString();
const aoPenalty = (m: number) => (m > 0 ? 100 + m * 45 : 0);

export function AuditOverdue() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<[string, Company][]>([]);
  const [ddOpen, setDdOpen] = useState(false);
  const [stage, setStage] = useState("idle");
  const [loadStep, setLoadStep] = useState(0);
  const [co, setCo] = useState<Company | null>(null);
  const [notFoundName, setNotFoundName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [nfEmail, setNfEmail] = useState("");
  const [nfStatus, setNfStatus] = useState("idle"); // idle | sending | done | error
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setDdOpen(false); };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const search = (val: string) => {
    setQuery(val);
    const q = val.toLowerCase().trim();
    if (q.length < 2) { setMatches([]); setDdOpen(false); return; }
    const m = Object.entries(AO_DB).filter(([k, v]) => v.name.toLowerCase().includes(q) || k.includes(q)).slice(0, 5);
    setMatches(m); setDdOpen(m.length > 0);
  };

  const runLoad = (company: Company | null) => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setCo(company); setStage("loading"); setLoadStep(0); setDdOpen(false); setSubmitted(false);
    setNfEmail(""); setNfStatus("idle");
    [550, 1150, 1700, 2200].forEach((ms, i) => timers.current.push(setTimeout(() => setLoadStep(i + 1), ms)));
    timers.current.push(setTimeout(() => setStage("result"), 2500));
  };
  const pick = (key: string) => { const c = AO_DB[key]; setQuery(c.name); runLoad(c); };
  // Only the 5 sample companies above have real demo data. Any other name gets
  // an honest "we'll check for you" lead capture — never a fabricated record.
  const check = () => {
    const q = query.toLowerCase().trim();
    const key = Object.keys(AO_DB).find((k) => AO_DB[k].name.toLowerCase().includes(q) || k.includes(q));
    if (key) { pick(key); return; }
    if (q.length > 2) { setNotFoundName(query.trim()); runLoad(null); }
  };
  const submitNotFound = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nfEmail.trim())) return;
    setNfStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: nfEmail,
          subject: `Audit overdue check — ${notFoundName}`,
          message: `Company: ${notFoundName}\nRequesting a manual Malta Business Registry check for overdue statutory audit filings.`,
          context: "audit-overdue-check",
        }),
      });
      if (!res.ok) throw new Error("failed");
      setNfStatus("done");
    } catch {
      setNfStatus("error");
    }
  };

  const penalty = co ? aoPenalty(co.overdue) : 0;
  const overdue = co && co.overdue > 0;

  return (
    <section style={{ background: "#000", padding: "clamp(56px,8vw,88px) 0", borderTop: "1px solid var(--a4-hairline-dark)" }}>
      <Container>
        <Reveal><SectionHead
          dark align="center"
          eyebrow="Free overdue check"
          title="Is your audit overdue?"
          sub="Enter your company name and we'll check the Malta Business Registry for your last audited accounts — and flag any overdue filing and penalty exposure, free."
          maxWidth={640}
        /></Reveal>

        <Reveal delay={80} style={{ maxWidth: 680, margin: "40px auto 0" }}>
          <div ref={wrapRef} style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--a4-surface-deep)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-full)", padding: "7px 7px 7px 20px" }}>
              <Icon name="search" size={18} color="var(--a4-stone)" />
              <input value={query} onChange={(e) => search(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") check(); if (e.key === "Escape") setDdOpen(false); }} onFocus={() => matches.length && setDdOpen(true)} placeholder="Type your company name…" style={{ flex: 1, background: "none", border: 0, outline: "none", color: "#fff", fontFamily: "var(--a4-font-body)", fontSize: 16, fontWeight: 500, padding: "10px 0" }} />
              <Button variant="primary" size="md" onClick={check} style={{ flexShrink: 0 }}>Check audit status <Icon name="arrow-right" size={16} color="#000" /></Button>
            </div>
            <div style={{ textAlign: "center", marginTop: 10, fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-stone)" }}>
              Try our sample record: <button onClick={() => pick("blue lagoon")} style={{ background: "none", border: 0, color: "var(--a4-primary-bright)", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600 }}>“Blue Lagoon”</button> · other companies are checked manually by our team
            </div>
            {ddOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-md)", overflow: "hidden", zIndex: 20, boxShadow: "0 16px 48px rgba(0,0,0,.5)" }}>
                {matches.map(([k, v]) => (
                  <div key={k} onClick={() => pick(k)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", cursor: "pointer", borderBottom: "1px solid var(--a4-divider-soft)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--a4-surface-deep)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
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

          {stage !== "idle" && (
            <div style={{ marginTop: 24 }}>
              {stage === "loading" && (
                <div style={{ background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", padding: "24px 26px" }}>
                  <div style={{ height: 2, background: "var(--a4-hairline-dark)", borderRadius: 2, overflow: "hidden", marginBottom: 18 }}>
                    <div style={{ height: "100%", width: `${(loadStep / AO_LOAD.length) * 100}%`, background: "var(--a4-primary-bright)", transition: "width .4s ease" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {AO_LOAD.map((t, i) => {
                      const d = i < loadStep, a = i === loadStep;
                      return (<div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontFamily: "var(--a4-font-body)", fontSize: 13, color: d ? "var(--a4-accent-teal)" : a ? "#fff" : "var(--a4-stone)" }}><span style={{ width: 8, height: 8, borderRadius: 999, flexShrink: 0, background: d ? "var(--a4-accent-teal)" : a ? "var(--a4-primary-bright)" : "#3a3d40" }} />{t}</div>);
                    })}
                  </div>
                </div>
              )}

              {stage === "result" && !co && (
                <div style={{ background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", padding: "22px 26px" }}>
                  {nfStatus === "done" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Icon name="check-circle" size={19} color="var(--a4-accent-teal)" />
                      <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, color: "#fff" }}>Thanks — we&apos;ll check the registry for <strong>{notFoundName}</strong> and get back to you at {nfEmail}.</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, color: "#fff" }}>We couldn&apos;t find &quot;{notFoundName}&quot; in our sample records</div>
                      <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, lineHeight: 1.5, color: "var(--a4-on-dark-mute)", marginTop: 6 }}>Leave your email and our team will check the Malta Business Registry for you and follow up — free, no obligation.</div>
                      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                        <input value={nfEmail} onChange={(e) => setNfEmail(e.target.value)} type="email" placeholder="Work email" style={{ flex: "1 1 220px", background: "var(--a4-surface-deep)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-md)", padding: "11px 14px", color: "#fff", fontFamily: "var(--a4-font-body)", fontSize: 14, outline: "none" }} />
                        <Button variant="primary" size="md" onClick={submitNotFound} style={{ opacity: nfStatus === "sending" ? 0.6 : 1, pointerEvents: nfStatus === "sending" ? "none" : "auto" }}>{nfStatus === "sending" ? "Sending…" : "Check for me"} <Icon name="arrow-right" size={16} color="#000" /></Button>
                      </div>
                      {nfStatus === "error" && <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--accent-danger)", marginTop: 10 }}>Something went wrong. Please try again or email info@a4.com.mt.</div>}
                    </>
                  )}
                </div>
              )}

              {stage === "result" && co && (
                <div style={{ background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", overflow: "hidden" }}>
                  <div style={{ padding: "22px 26px", borderBottom: "1px solid var(--a4-hairline-dark)" }}>
                    <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "#fff" }}>{co.name}</div>
                    <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-stone)", marginTop: 3 }}>{co.reg} · {co.sector} · last audited {co.lastAudited}</div>
                  </div>
                  <div style={{ padding: "22px 26px" }}>
                    <div style={{ border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-md)", padding: "16px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <Icon name={!overdue ? "check-circle" : submitted ? "clock" : "alert-triangle"} size={19} color={!overdue ? "var(--a4-accent-teal)" : submitted ? "var(--a4-primary-bright)" : "var(--accent-danger)"} style={{ marginTop: 1, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, color: "#fff" }}>{!overdue ? "Audit appears up to date" : submitted ? "Accounts submitted — awaiting MBR approval" : `Audited accounts ${co.overdue} months overdue`}</div>
                        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, lineHeight: 1.5, color: "var(--a4-on-dark-mute)", marginTop: 3 }}>
                          {!overdue
                            ? <>No overdue audit detected. We can take care of your next statutory audit on time, with a fixed fee.</>
                            : submitted
                              ? <>No penalty applies while your submission is under review. We can complete and file your next audit on time.</>
                              : <>Estimated MBR penalty: <strong style={{ color: "var(--accent-danger)" }}>{aoEuro(penalty)}</strong> and rising daily. We can bring your audit up to date fast.</>}
                        </div>
                        {overdue && (
                          <label style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--a4-hairline-dark)", cursor: "pointer" }}>
                            <input type="checkbox" checked={submitted} onChange={(e) => setSubmitted(e.target.checked)} style={{ width: 15, height: 15, accentColor: "var(--a4-primary)", cursor: "pointer" }} />
                            <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-on-dark-mute)" }}>I&apos;ve already submitted these accounts to MBR (awaiting approval)</span>
                          </label>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
                      <Button variant="primary" size="md" href="#estimate" style={{ flex: "1 1 200px" }}>{overdue && !submitted ? "Sort your audit — get a fee" : "Get your audit estimate"} <Icon name="arrow-right" size={16} color="#000" /></Button>
                      <Button variant="outline-dark" size="md" href="#estimate">Book a consultation</Button>
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
