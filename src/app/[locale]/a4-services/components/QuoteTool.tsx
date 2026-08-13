// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Logo, Button, Pill, Badge, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
import { getCaptchaToken } from "@/lib/turnstileClient";
// Company search → mock MBR lookup → live fixed-price quote → booking capture.

const MBR_DATA = {
  seytravel:    { name: "Seytravel Ltd", reg: "C 44821", sector: "Tourism & Hospitality", size: "small", yearEnd: "December", overdue: 0,  auditFee: 1200, monthlyFee: 150, vatFee: 360, mbrFee: 180 },
  nexus:        { name: "Nexus Trading Ltd", reg: "C 48291", sector: "Import & Distribution", size: "small", yearEnd: "December", overdue: 19, auditFee: 1100, monthlyFee: 140, vatFee: 320, mbrFee: 180 },
  "blue lagoon":{ name: "Blue Lagoon Hospitality Ltd", reg: "C 61042", sector: "Tourism & Hospitality", size: "medium", yearEnd: "December", overdue: 18, auditFee: 2200, monthlyFee: 280, vatFee: 560, mbrFee: 280 },
  meridian:     { name: "Meridian Construct Ltd", reg: "C 39014", sector: "Construction & Property", size: "medium", yearEnd: "March", overdue: 28, auditFee: 1900, monthlyFee: 240, vatFee: 480, mbrFee: 280 },
  "island fresh":{ name: "Island Fresh Co. Ltd", reg: "C 72651", sector: "Retail & FMCG", size: "micro", yearEnd: "June", overdue: 15, auditFee: 800, monthlyFee: 110, vatFee: 280, mbrFee: 150 },
  techventures: { name: "TechVentures Malta Ltd", reg: "C 55187", sector: "iGaming & Technology", size: "small", yearEnd: "September", overdue: 16, auditFee: 1300, monthlyFee: 160, vatFee: 380, mbrFee: 180 },
};

const QT_SERVICES = [
  { id: "audit",    icon: "shield-check", name: "Statutory audit",     hint: "GAPSME compliant, signed by a licensed auditor",  feeKey: "auditFee",   type: "annual" },
  { id: "accounts", icon: "book-open",    name: "Monthly bookkeeping", hint: "Categorisation, reconciliation & reports", feeKey: "monthlyFee", type: "monthly" },
  { id: "vat",      icon: "scale",        name: "VAT returns",         hint: "All four quarters filed with the CFR",     feeKey: "vatFee",     type: "annual" },
  { id: "payroll",  icon: "users",        name: "Payroll processing",  hint: "Quoted on request — depends on headcount", feeKey: null,         type: "quote" },
  { id: "mbr",      icon: "landmark",     name: "MBR annual return",   hint: "Filed within 42 days of anniversary",      feeKey: "mbrFee",     type: "annual" },
];

const LOAD_STEPS = [
  ["Preparing your indicative estimate…", "Estimate prepared"],
  ["Reading company details…", "Company details loaded"],
  ["Checking selected services…", "Services checked"],
  ["Calculating your fixed-price quote…", "Quote calculated"],
];

const QT_INDUSTRIES = ["Tourism & Hospitality", "Import & Distribution", "Construction & Property", "Retail & FMCG", "iGaming & Technology", "Professional Services", "Financial Services", "Manufacturing", "Other"];

const QT_REVENUE = [
  { label: "Under €100k", mult: 0.85 },
  { label: "€100k – €500k", mult: 1.0 },
  { label: "€500k – €1M", mult: 1.15 },
  { label: "€1M – €5M", mult: 1.4 },
  { label: "Over €5M", mult: 1.8 },
];

function euro(n) { return "€" + n.toLocaleString(); }

export function QuoteTool() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState([]);
  const [ddOpen, setDdOpen] = useState(false);
  const [stage, setStage] = useState("idle"); // idle | details | loading | quote
  const [loadStep, setLoadStep] = useState(0);
  const [company, setCompany] = useState(null);
  const [industry, setIndustry] = useState("");
  const [revenue, setRevenue] = useState("€100k – €500k");
  const [submitted, setSubmitted] = useState(false);
  const [selected, setSelected] = useState(() => new Set(["audit"]));
  const [modal, setModal] = useState(false);
  const [booked, setBooked] = useState(null);
  const [booking, setBooking] = useState(false);
  const [bookErr, setBookErr] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", time: "Morning (9:00 – 12:00)" });
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
    const m = Object.entries(MBR_DATA).filter(([k, v]) => v.name.toLowerCase().includes(q) || k.includes(q)).slice(0, 5);
    setMatches(m); setDdOpen(m.length > 0);
  };

  const pick = (key) => {
    const co = { ...MBR_DATA[key], isDemo: true };
    setDdOpen(false); setQuery(co.name); setCompany(co); setSubmitted(false);
    setIndustry(co.sector || ""); setRevenue("€100k – €500k");
    setSelected(new Set(co.overdue > 0 ? ["audit", "mbr"] : ["audit"]));
    setStage("details");
  };

  const trigger = () => {
    const q = query.toLowerCase().trim();
    const key = Object.keys(MBR_DATA).find((k) => MBR_DATA[k].name.toLowerCase().includes(q) || k.includes(q));
    if (key) { pick(key); return; }
    if (q.length > 2) {
      const co = { name: query.replace(/\b\w/g, (c) => c.toUpperCase()) + (/(ltd|limited)$/i.test(query) ? "" : " Ltd"), reg: null, isDemo: false, sector: "Professional Services", size: "small", yearEnd: "December", overdue: 0, auditFee: 1200, monthlyFee: 150, vatFee: 360, mbrFee: 180 };
      setCompany(co); setSubmitted(false); setIndustry(co.sector); setRevenue("€100k – €500k"); setSelected(new Set(["audit"])); setDdOpen(false); setStage("details");
    }
  };

  const runLoading = () => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setStage("loading"); setLoadStep(0);
    [600, 1300, 1900, 2400].forEach((ms, i) => { timers.current.push(setTimeout(() => setLoadStep(i + 1), ms)); });
    timers.current.push(setTimeout(() => setStage("quote"), 2700));
  };

  const toggleService = (id) => {
    setSelected((prev) => { const next = new Set(prev); if (next.has(id)) { if (next.size > 1) next.delete(id); } else next.add(id); return next; });
  };

  // pricing — fees scale with the company's average revenue band
  const revMult = (QT_REVENUE.find((r) => r.label === revenue) || { mult: 1 }).mult;
  const adjFee = (s) => (s.feeKey ? Math.round(company[s.feeKey] * revMult) : 0);
  let annual = 0, monthly = 0, count = 0;
  if (company) {
    QT_SERVICES.forEach((s) => {
      if (!selected.has(s.id)) return;
      count++;
      if (s.type === "quote") return;
      const fee = adjFee(s);
      if (s.type === "monthly") monthly += fee; else annual += fee;
    });
  }
  let discount = 0;
  const gross = annual + monthly * 12;
  if (count >= 3) discount = Math.round(gross * 0.10);
  if (count >= 4) discount = Math.round(gross * 0.15);
  const totalAnnual = gross - discount;
  const penalty = company ? company.overdue * 120 : 0;

  const submitBooking = async () => {
    if (!form.name || !form.email) return;
    setBooking(true); setBookErr(false);
    try {
      const captchaToken = await getCaptchaToken("quote");
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captchaToken,
          name: form.name,
          email: form.email,
          subject: `Quote tool booking — ${company ? company.name : form.company}`,
          message: `Quote tool booking request. Preferred call time: ${form.time}`,
          meta: {
            service: "Quote tool booking",
            companyName: company ? company.name : form.company,
            companyRegistration: company ? (company.isDemo ? company.reg : "not verified") : undefined,
            phone: form.phone,
            jurisdiction: "Malta",
            communicationChannel: form.time,
            serviceDetails: company ? {
              industry: industry || company.sector,
              revenueBand: revenue,
              selectedServices: QT_SERVICES.filter((s) => selected.has(s.id)).map((s) => ({ name: s.name, fee: s.type === "quote" ? "On request" : `${euro(adjFee(s))}${s.type === "monthly" ? "/mo" : "/yr"}` })),
              estimatedAnnualTotal: totalAnnual,
            } : undefined,
          },
        }),
      });
      if (!res.ok) throw new Error("Booking request failed");
      setBooked("A4-" + Date.now().toString(36).toUpperCase().slice(-6));
    } catch {
      setBookErr(true);
    } finally {
      setBooking(false);
    }
  };
  const openModal = () => { setForm((f) => ({ ...f, company: company ? company.name : "" })); setBooked(null); setBookErr(false); setModal(true); };

  // light-mode surfaces
  const panel = { background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)" };
  const labelStyle = { display: "block", fontFamily: "var(--a4-font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--a4-mute)", marginBottom: 8 };
  const selectStyle = { width: "100%", background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "12px 14px", color: "var(--a4-ink)", fontFamily: "var(--a4-font-body)", fontSize: 14, outline: "none", appearance: "none", cursor: "pointer" };

  return (
    <section style={{ background: "var(--a4-surface-soft)", padding: "clamp(72px,9vw,108px) 0 clamp(64px,9vw,104px)" }}>
      <Container>
        <Reveal><SectionHead
          align="center"
          eyebrow="Request a quote"
          title={<>Get a fixed-price quote in&nbsp;60&nbsp;seconds</>}
          sub="Search your company and we pull the details from the Malta Business Registry to generate a transparent, fixed-price quote — instantly."
          maxWidth={640}
        /></Reveal>

        {/* search */}
        <Reveal delay={80} style={{ maxWidth: 680, margin: "44px auto 0" }}>
          <div ref={wrapRef} style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-full)", padding: "7px 7px 7px 20px", boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}>
              <Icon name="search" size={18} color="var(--a4-stone)" />
              <input
                value={query}
                onChange={(e) => search(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") trigger(); if (e.key === "Escape") setDdOpen(false); }}
                onFocus={() => matches.length && setDdOpen(true)}
                placeholder="Type your company name…"
                style={{ flex: 1, background: "none", border: 0, outline: "none", color: "var(--a4-ink)", fontFamily: "var(--a4-font-body)", fontSize: 16, fontWeight: 500, padding: "10px 0" }}
              />
              <Button variant="dark" size="md" onClick={trigger} style={{ flexShrink: 0 }}>Get quote <Icon name="arrow-right" size={16} color="#fff" /></Button>
            </div>
            <div style={{ textAlign: "center", marginTop: 10, fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-mute)" }}>
              Try <button onClick={() => pick("blue lagoon")} style={{ background: "none", border: 0, color: "var(--a4-link)", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600 }}>“Blue Lagoon”</button> · powered by Malta Business Registry data · quotes are free and instant
            </div>
            {ddOpen && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", overflow: "hidden", zIndex: 20, boxShadow: "0 16px 48px rgba(0,0,0,.12)" }}>
                {matches.map(([k, v]) => (
                  <div key={k} onClick={() => pick(k)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", cursor: "pointer", borderBottom: "1px solid var(--a4-hairline-light)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--a4-surface-soft)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <div>
                      <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, fontWeight: 600, color: "var(--a4-ink)" }}>{v.name}</div>
                      <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-mute)", marginTop: 2 }}>{v.reg} · {v.sector}</div>
                    </div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--a4-font-body)", fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: "var(--a4-r-full)", color: v.overdue ? "var(--accent-danger)" : "var(--a4-accent-teal)", border: "1px solid var(--a4-hairline-light)" }}><span style={{ width: 5, height: 5, borderRadius: 999, background: "currentColor" }} />{v.overdue ? v.overdue + " mo overdue" : "Up to date"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        {/* result */}
        {stage !== "idle" && (
          <div style={{ maxWidth: 720, margin: "28px auto 0" }}>
            {stage === "details" && company && (
              <div style={{ ...panel, padding: "clamp(24px,3vw,32px)" }}>
                <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 21, color: "var(--a4-ink)", letterSpacing: "-.2px" }}>A couple of details about {company.name}</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, color: "var(--a4-mute)", margin: "8px 0 24px" }}>This helps us size your audit and accounting fee accurately before we issue the quote.</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="qt-cols">
                  <div>
                    <label style={labelStyle}>Industry</label>
                    <select value={industry} onChange={(e) => setIndustry(e.target.value)} style={selectStyle}>
                      {QT_INDUSTRIES.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Average annual revenue</label>
                    <select value={revenue} onChange={(e) => setRevenue(e.target.value)} style={selectStyle}>
                      {QT_REVENUE.map((o) => <option key={o.label} value={o.label}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
                  <Button variant="dark" size="md" onClick={runLoading} style={{ flex: "1 1 220px" }}>Generate my quote <Icon name="arrow-right" size={16} color="#fff" /></Button>
                  <Button variant="outline-light" size="md" onClick={() => { setStage("idle"); setQuery(""); }}>Start over</Button>
                </div>
              </div>
            )}

            {stage === "loading" && (
              <div style={{ ...panel, padding: "26px 28px" }}>
                <div style={{ height: 2, background: "var(--a4-hairline-light)", borderRadius: 2, overflow: "hidden", marginBottom: 18 }}>
                  <div style={{ height: "100%", width: `${(loadStep / LOAD_STEPS.length) * 100}%`, background: "var(--a4-primary)", transition: "width .4s ease" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {LOAD_STEPS.map(([active, done], i) => {
                    const isDone = i < loadStep, isActive = i === loadStep;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, fontFamily: "var(--a4-font-body)", fontSize: 13, color: isDone ? "var(--a4-accent-teal)" : isActive ? "var(--a4-ink)" : "var(--a4-stone)" }}>
                        <span style={{ width: 8, height: 8, borderRadius: 999, flexShrink: 0, background: isDone ? "var(--a4-accent-teal)" : isActive ? "var(--a4-primary)" : "var(--a4-faint)" }} />
                        {isDone ? done : active}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {stage === "quote" && company && (
              <div style={{ ...panel, overflow: "hidden" }}>
                {/* header */}
                <div style={{ padding: "22px 26px", borderBottom: "1px solid var(--a4-hairline-light)" }}>
                  <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "var(--a4-ink)" }}>{company.name}</div>
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-mute)", marginTop: 3 }}>{company.isDemo ? `Registration no.: ${company.reg}` : "Registration no.: not verified"} · {industry || company.sector} · {company.yearEnd} year-end</div>
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-stone)", marginTop: 6 }}>Indicative estimate — final quote confirmed after a short call.</div>
                </div>

                <div style={{ padding: "22px 26px" }}>
                  {/* captured context */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                    {[industry || company.sector, revenue + " revenue"].map((v) => (
                      <span key={v} style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-mute)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-full)", padding: "5px 12px" }}>{v}</span>
                    ))}
                    <button onClick={() => setStage("details")} style={{ background: "none", border: 0, cursor: "pointer", fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 600, color: "var(--a4-link)" }}>Adjust</button>
                  </div>

                  {/* overdue alert */}
                  {company.overdue > 0 && (
                    <div style={{ background: "transparent", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", padding: "16px 18px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <Icon name={submitted ? "clock" : "alert-triangle"} size={18} color={submitted ? "var(--a4-primary)" : "var(--accent-danger)"} style={{ marginTop: 1, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--a4-ink)", marginBottom: 3 }}>{submitted ? "Accounts submitted — awaiting MBR approval" : `Accounts ${company.overdue} months overdue at MBR`}</div>
                        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, lineHeight: 1.5, color: "var(--a4-mute)" }}>
                          {submitted ? "No penalty applies while your submission is under review. We can assist with MBR queries or prepare next year's accounts." : <>Estimated penalty: <strong style={{ color: "var(--accent-danger)" }}>{euro(penalty)}</strong> and growing daily.</>}
                        </div>
                        <label style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--a4-hairline-light)", cursor: "pointer" }}>
                          <input type="checkbox" checked={submitted} onChange={(e) => { setSubmitted(e.target.checked); setSelected((prev) => { const n = new Set(prev); if (e.target.checked) n.delete("mbr"); else n.add("mbr"); return n; }); }} style={{ width: 15, height: 15, accentColor: "var(--a4-primary)", cursor: "pointer" }} />
                          <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-mute)" }}>I have already submitted my accounts to MBR</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* services */}
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--a4-mute)", marginBottom: 12 }}>Select services</div>
                  <div style={{ border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", overflow: "hidden", marginBottom: 20 }}>
                    {QT_SERVICES.map((s, i) => {
                      const on = selected.has(s.id);
                      const price = s.type === "quote" ? "On request" : `${euro(adjFee(s))}${s.type === "monthly" ? "/mo" : "/yr"}`;
                      return (
                        <div key={s.id} onClick={() => toggleService(s.id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", cursor: "pointer", borderTop: i ? "1px solid var(--a4-hairline-light)" : "none", background: on ? "var(--a4-surface-soft)" : "transparent", transition: "background .15s" }}>
                          <span style={{ width: 36, height: 36, borderRadius: "var(--a4-r-md)", flexShrink: 0, display: "grid", placeItems: "center", background: "var(--a4-surface-soft)" }}>
                            <Icon name={s.icon} size={18} color={on ? "var(--a4-primary)" : "var(--a4-ash)"} />
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 15.5, color: "var(--a4-ink)", letterSpacing: "-.1px" }}>{s.name}</div>
                            <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-mute)", marginTop: 1 }}>{s.hint}</div>
                          </div>
                          <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, color: on ? "var(--a4-primary)" : "var(--a4-ash)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{price}</div>
                          <span style={{ width: 22, height: 22, borderRadius: 999, flexShrink: 0, display: "grid", placeItems: "center", background: on ? "var(--a4-primary)" : "transparent", border: on ? "none" : "1.5px solid var(--a4-faint)", transition: "background .15s" }}>
                            {on && <Icon name="check" size={13} color="#fff" stroke={3} />}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* breakdown */}
                  <div style={{ background: "var(--a4-surface-soft)", borderRadius: "var(--a4-r-lg)", padding: "16px 18px", marginBottom: 20 }}>
                    {QT_SERVICES.filter((s) => selected.has(s.id)).map((s) => (
                      <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "7px 0", borderBottom: "1px solid var(--a4-hairline-light)" }}>
                        <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "var(--a4-mute)" }}>{s.name}</span>
                        <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 500, color: s.type === "quote" ? "var(--a4-stone)" : "var(--a4-ink)", fontVariantNumeric: "tabular-nums" }}>{s.type === "quote" ? "On request" : `${euro(adjFee(s))}${s.type === "monthly" ? "/mo" : "/yr"}`}</span>
                      </div>
                    ))}
                    {discount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--a4-hairline-light)" }}>
                        <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--accent-green-text)" }}>Bundle discount</span>
                        <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, color: "var(--accent-green-text)" }}>−{euro(discount)}/yr</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 12 }}>
                      <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, color: "var(--a4-ink)" }}>Your fixed price</span>
                      <span style={{ fontFamily: "var(--a4-font-display)", fontSize: 24, fontWeight: 500, color: "var(--a4-ink)", fontVariantNumeric: "tabular-nums" }}>{euro(totalAnnual)}<span style={{ fontSize: 13, color: "var(--a4-stone)", fontWeight: 400 }}>/yr · {euro(Math.round(totalAnnual / 12))}/mo</span></span>
                    </div>
                  </div>

                  {/* guarantees */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                    {[["calendar-check", "14 days", "avg. turnaround"], ["lock", "Fixed price", "no surprises"], ["landmark", "Licensed", "audit firm"], ["check-check", "MBR included", "we file for you"]].map(([ic, t, s]) => (
                      <div key={t} style={{ flex: "1 1 130px", textAlign: "center", padding: "16px 12px", borderRadius: "var(--a4-r-lg)", background: "transparent", border: "1px solid var(--a4-hairline-light)" }}>
                        <span style={{ width: 38, height: 38, borderRadius: "var(--a4-r-md)", display: "grid", placeItems: "center", background: "var(--a4-surface-soft)", margin: "0 auto 9px" }}>
                          <Icon name={ic} size={18} color="var(--a4-primary)" />
                        </span>
                        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, color: "var(--a4-ink)" }}>{t}</div>
                        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 10.5, color: "var(--a4-stone)", marginTop: 2 }}>{s}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Button variant="dark" size="md" onClick={openModal} style={{ flex: "1 1 220px" }}><Icon name="phone" size={16} color="#fff" /> Book free 15-min call</Button>
                    <Button variant="outline-light" size="md" onClick={openModal}><Icon name="mail" size={16} color="var(--a4-ink)" /> Email me this quote</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Container>

      {/* booking modal */}
      {modal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", width: "100%", maxWidth: 460, padding: 30, boxShadow: "0 32px 80px rgba(0,0,0,.25)" }}>
            {booked ? (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: 999, background: "rgba(0,168,126,.12)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Icon name="check" size={28} color="var(--a4-accent-teal)" stroke={2.5} /></div>
                <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 23, color: "var(--a4-ink)" }}>Booking confirmed</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--a4-mute)", margin: "10px 0 0" }}>Thank you, {form.name.split(" ")[0]}. Our team will contact you within 2 business hours to confirm your time, and email your quote to <strong style={{ color: "var(--a4-ink)" }}>{form.email}</strong>.</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-stone)", marginTop: 16 }}>Reference: {booked}</div>
                <Button variant="outline-light" size="md" onClick={() => setModal(false)} style={{ width: "100%", marginTop: 22 }}>Close</Button>
              </div>
            ) : (
              <div>
                <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 23, color: "var(--a4-ink)" }}>Book your free consultation</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, color: "var(--a4-mute)", margin: "6px 0 22px" }}>15 minutes, no obligation. We'll confirm your quote and answer any questions.</div>
                {[["name", "Your name", "Director name", "text"], ["email", "Email address", "you@company.com.mt", "email"], ["phone", "Phone number", "+356 ____", "tel"], ["company", "Company name", "From your quote", "text"]].map(([key, label, ph, type]) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>{label}</label>
                    <input type={type} value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={ph} style={{ width: "100%", background: "var(--a4-surface-soft)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "11px 14px", color: "var(--a4-ink)", fontFamily: "var(--a4-font-body)", fontSize: 14, outline: "none" }} />
                  </div>
                ))}
                {bookErr && (
                  <div style={{ background: "rgba(220,38,38,.08)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "12px 14px", marginBottom: 14, fontFamily: "var(--a4-font-body)", fontSize: 12.5, lineHeight: 1.5, color: "var(--a4-mute)" }}>
                    Something went wrong sending your request. Please try again, or reach us directly at <a href="mailto:info@a4.com.mt" style={{ color: "var(--a4-link)" }}>info@a4.com.mt</a> / <a href="tel:+35627900007" style={{ color: "var(--a4-link)" }}>+356 2790 0007</a>.
                  </div>
                )}
                <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                  <Button variant="dark" size="md" onClick={submitBooking} disabled={booking} style={{ flex: 1, opacity: booking ? 0.7 : 1 }}>{booking ? "Sending…" : "Confirm booking"} {!booking && <Icon name="arrow-right" size={16} color="#fff" />}</Button>
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
