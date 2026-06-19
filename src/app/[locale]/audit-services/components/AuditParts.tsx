// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Logo, Button, Pill, Badge, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
import { HeroFX } from "@/components/a4-landing/HeroFX";
import { AuditEstimator } from "./AuditEstimator";
import { AuditOverdue } from "./AuditOverdue";
import { FSReview } from "./FSReview";
// services, process, overdue check, FAQ, final CTA, footer. Reuses Primitives
// and HeroFX from the main app.

import { CLIENT_ONBOARDING_URL } from "@/lib/external-links";

// export function AuditNav() {
//   const [open, setOpen] = useState(false);
//   return (
//     <header style={{ position: "sticky", top: 0, zIndex: 60, background: "#000", borderBottom: "1px solid var(--a4-hairline-dark)" }}>
//       <div style={{ maxWidth: 1200, margin: "0 auto", height: 64, display: "flex", alignItems: "center", gap: 16, padding: "0 24px" }}>
//         <a href="/a4-services" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
//           <Logo height={24} />
//           <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
//             <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 18, color: "#fff", letterSpacing: "-.2px" }}>A4 Services</span>
//             <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 10.5, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--a4-on-dark-mute)" }}>Accounting &amp; Audit · Malta</span>
//           </span>
//         </a>
//         <div style={{ flex: 1 }} />
//         <a href="#estimate" className="a4-navlinks" style={{ fontFamily: "var(--a4-font-body)", fontSize: 15, fontWeight: 500, color: "var(--a4-on-dark-mute)", textDecoration: "none" }}>Fee estimate</a>
//         <a href="/automated-bookkeeping" className="a4-navlinks" style={{ fontFamily: "var(--a4-font-body)", fontSize: 15, fontWeight: 500, color: "var(--a4-on-dark-mute)", textDecoration: "none" }}>Bookkeeping</a>
//         <Button variant="primary" size="sm" href="#estimate" style={{ height: 44, padding: "0 20px" }}>Request proposal <Icon name="arrow-right" size={16} color="#000" /></Button>
//         <button className="a4-burger" onClick={() => setOpen(!open)} aria-label="Menu" style={{ display: "none", background: "none", border: 0, cursor: "pointer", color: "#fff", padding: 6 }}>
//           <Icon name={open ? "x" : "menu"} size={24} color="#fff" />
//         </button>
//       </div>
//       {open && (
//         <div className="a4-mobilemenu" style={{ borderTop: "1px solid var(--a4-hairline-dark)", padding: "12px 24px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
//           {[["Fee estimate", "#estimate"], ["Bookkeeping", "/automated-bookkeeping"]].map(([label, href]) => (
//             <a key={label} href={href} onClick={() => setOpen(false)} style={{ fontFamily: "var(--a4-font-body)", fontSize: 16, fontWeight: 500, color: "var(--a4-on-dark-mute)", textDecoration: "none", padding: "10px 0" }}>{label}</a>
//           ))}
//           <a href="#estimate" onClick={() => setOpen(false)} style={{ fontFamily: "var(--a4-font-body)", fontSize: 16, fontWeight: 600, color: "#fff", textDecoration: "none", padding: "10px 0" }}>Request proposal →</a>
//         </div>
//       )}
//     </header>
//   );
// }

function AuditHero({ accent = "#494fdf" }) {
  return (
    <section style={{ background: "#000", padding: "clamp(64px,9vw,120px) 0 clamp(60px,8vw,104px)", position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" className="hero-bg" />
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(120% 80% at 50% 0%, transparent 40%, rgba(0,0,0,.55) 100%), linear-gradient(180deg, transparent 60%, rgba(0,0,0,.7) 100%)" }} />
      <Container style={{ position: "relative", textAlign: "center" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <span style={{ width: 28, height: 1, background: "var(--a4-hairline-strong)" }} />
            <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--a4-on-dark-mute)" }}>Licensed audit firm · Malta</span>
            <span style={{ width: 28, height: 1, background: "var(--a4-hairline-strong)" }} />
          </div>
          <h1 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "#fff", fontSize: "clamp(46px,6.6vw,88px)", lineHeight: 1.0, letterSpacing: "-.03em", margin: "22px auto 0", maxWidth: 900, textWrap: "balance" }}>
            Need an audit?<br /><span style={{ color: "var(--a4-primary-bright)" }}>We make it simple.</span>
          </h1>
          <p style={{ fontFamily: "var(--a4-font-body)", color: "var(--a4-on-dark-mute)", fontSize: 19, lineHeight: 1.6, maxWidth: 620, margin: "24px auto 0", textWrap: "pretty" }}>
            Every company in Malta must file audited financial statements. As a licensed audit firm, A4 delivers a rigorous, independent, on-time audit — with a fixed fee agreed up front, <strong style={{ color: "#fff", fontWeight: 600 }}>from &euro;600/month</strong>.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 34, flexWrap: "wrap", justifyContent: "center" }}>
            <Button variant="primary" size="lg" href="#estimate">Get your audit estimate <Icon name="arrow-right" size={18} color="#000" /></Button>
            <Button variant="outline-dark" size="lg" href="#estimate">Book a consultation</Button>
          </div>
          <div style={{ display: "flex", gap: "10px 28px", marginTop: 38, flexWrap: "wrap", justifyContent: "center" }}>
            {[["badge-check", "Licensed audit firm"], ["calendar-check", "On-time filing, guaranteed"], ["lock", "Fixed fee, no surprises"], ["folder-check", "Portal-based document collection"]].map(([ic, t]) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name={ic} size={16} color="var(--a4-primary-bright)" />
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, color: "var(--a4-on-dark)" }}>{t}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function WhyMalta() {
  const points = [
    { icon: "scale", t: "It's the law in Malta", s: "Unlike many countries, every Maltese company — regardless of size — must file audited financial statements each year." },
    { icon: "alarm-clock", t: "Deadlines that bite", s: "Late filing at the MBR triggers penalties that grow over time. We keep you ahead of every deadline." },
    { icon: "handshake", t: "More than a signature", s: "A good audit gives banks, investors and your board confidence in your numbers — and surfaces issues early." },
  ];
  return (
    <section style={{ background: "var(--a4-canvas-light)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead align="center" eyebrow="Why it matters" title="Audit isn't optional in Malta" sub="Which is exactly why it should be painless. Here's what's at stake — and how we take it off your plate." maxWidth={600} /></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 52 }}>
          {points.map((p, i) => (
            <Reveal key={p.t} delay={i * 90} style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", padding: "clamp(26px,3vw,34px)" }}>
              <span style={{ width: 46, height: 46, borderRadius: "var(--a4-r-md)", background: "var(--a4-surface-soft)", display: "grid", placeItems: "center" }}><Icon name={p.icon} size={22} color="var(--a4-primary)" stroke={1.75} /></span>
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 21, color: "var(--a4-ink)", margin: "22px 0 0", letterSpacing: "-.2px" }}>{p.t}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 15, lineHeight: 1.55, color: "var(--a4-mute)", margin: "9px 0 0", textWrap: "pretty" }}>{p.s}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function AuditServices() {
  const items = [
    { icon: "file-check-2", t: "Statutory audit", s: "Full audit of your annual financial statements under Maltese law (GAPSME / IFRS), signed by our licensed audit firm." },
    { icon: "layers", t: "Group & consolidated audit", s: "Consolidation and audit for parent companies and groups, including intercompany reconciliations." },
    { icon: "shield-check", t: "Regulated-entity audit", s: "Specialist audits for iGaming, financial-services and other regulated businesses, with the reporting regulators expect." },
    { icon: "clipboard-check", t: "Assurance & special purpose", s: "Agreed-upon procedures, grant certifications and special-purpose reports when you need independent assurance." },
  ];
  return (
    <section style={{ background: "#000", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead dark align="center" eyebrow="Audit & assurance" title="One firm for every assurance need" sub="From a first statutory audit to complex group and regulated engagements." maxWidth={580} /></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 1, marginTop: 52, background: "var(--a4-hairline-dark)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", overflow: "hidden" }}>
          {items.map((it, i) => (
            <Reveal key={it.t} delay={(i % 2) * 90} style={{ background: "#000", padding: "clamp(26px,3vw,36px)" }}>
              <Icon name={it.icon} size={24} color="var(--a4-primary-bright)" stroke={1.75} />
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 21, color: "#fff", margin: "20px 0 0", letterSpacing: "-.2px" }}>{it.t}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 15, lineHeight: 1.55, color: "var(--a4-on-dark-mute)", margin: "9px 0 0", textWrap: "pretty" }}>{it.s}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function AuditProcess() {
  const steps = [
    { n: "1", t: "Scope & fixed fee", s: "A short call to understand your company; we agree the scope and a fixed fee up front." },
    { n: "2", t: "Upload to the portal", s: "Share your trial balance and documents securely — no endless email chains." },
    { n: "3", t: "Fieldwork & review", s: "Our team performs the audit and a partner reviews every file." },
    { n: "4", t: "Signed & filed", s: "You receive your signed audit opinion and we help file on time at the MBR." },
  ];
  return (
    <section style={{ background: "var(--a4-canvas-light)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
          <div>
            <Eyebrow>The process</Eyebrow>
            <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "var(--a4-ink)", fontSize: "clamp(34px,4.4vw,56px)", lineHeight: 1.02, letterSpacing: "-.02em", margin: "18px 0 0" }}>A smooth audit, start to finish</h2>
          </div>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 17, lineHeight: 1.55, color: "var(--a4-mute)", margin: 0, maxWidth: 340, textWrap: "pretty" }}>Four clear stages — most of the work happens behind the scenes.</p>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 0, marginTop: 56, borderTop: "1px solid var(--a4-hairline-light)" }}>
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 70} style={{ padding: "28px 22px 28px 0", borderRight: i < steps.length - 1 ? "1px solid var(--a4-hairline-light)" : "none", paddingLeft: i ? 22 : 0 }}>
              <div style={{ width: 40, height: 40, borderRadius: "var(--a4-r-full)", border: "1px solid var(--a4-hairline-strong)", display: "grid", placeItems: "center", fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 17, color: "var(--a4-ink)" }}>{s.n}</div>
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 19, color: "var(--a4-ink)", margin: "20px 0 0", letterSpacing: "-.2px" }}>{s.t}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, lineHeight: 1.5, color: "var(--a4-mute)", margin: "9px 0 0", textWrap: "pretty" }}>{s.s}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function AuditFAQ() {
  const faqs = [
    { q: "Does my company really need an audit?", a: "In Malta, yes — almost all companies must file audited financial statements annually, regardless of turnover or size. If you're unsure about your specific obligations, we'll confirm them on a quick call." },
    { q: "How is the audit fee set?", a: "We agree a fixed fee up front based on your turnover, balance-sheet size and complexity — no hourly surprises. The estimator above gives a realistic starting point." },
    { q: "Can you take over from our current auditor?", a: "Yes. We handle the professional clearance and transition, and can pick up even where prior years are behind." },
    { q: "What if our accounts are overdue?", a: "We regularly help companies bring overdue audits and filings up to date and manage any MBR penalty exposure. The sooner we start, the better." },
    { q: "How long does an audit take?", a: "Once we have your records, a typical small-company audit is completed in a few weeks. We'll give you a clear timeline when we scope the engagement." },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section style={{ background: "var(--a4-surface-soft)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container style={{ display: "flex", gap: 64, flexWrap: "wrap", alignItems: "flex-start" }}>
        <Reveal style={{ flex: "1 1 300px", minWidth: 280 }}>
          <Eyebrow>FAQ</Eyebrow>
          <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "var(--a4-ink)", fontSize: "clamp(32px,4vw,48px)", lineHeight: 1.05, letterSpacing: "-.02em", margin: "18px 0 0", textWrap: "balance" }}>Audit questions, answered</h2>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 17, lineHeight: 1.55, color: "var(--a4-mute)", margin: "18px 0 28px", maxWidth: 340 }}>Still unsure? Book a free consultation and we'll talk it through.</p>
          <Button variant="dark" size="md" href="#estimate">Book a consultation <Icon name="arrow-right" size={17} color="#fff" /></Button>
        </Reveal>
        <Reveal delay={100} style={{ flex: "1 1 520px", minWidth: 300 }}>
          <div style={{ borderTop: "1px solid var(--a4-hairline-light)" }}>
            {faqs.map((f, i) => (
              <div key={f.q} style={{ borderBottom: "1px solid var(--a4-hairline-light)" }}>
                <button onClick={() => setOpen(open === i ? -1 : i)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, background: "none", border: 0, cursor: "pointer", padding: "22px 0", textAlign: "left" }}>
                  <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: "clamp(17px,2.1vw,21px)", color: "var(--a4-ink)", letterSpacing: "-.2px" }}>{f.q}</span>
                  <span style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "var(--a4-r-full)", border: "1px solid var(--a4-hairline-strong)", display: "grid", placeItems: "center", transition: "transform .25s, background .2s", transform: open === i ? "rotate(45deg)" : "none", background: open === i ? "var(--a4-ink)" : "transparent" }}>
                    <Icon name="plus" size={16} color={open === i ? "#fff" : "var(--a4-ink)"} />
                  </span>
                </button>
                <div style={{ maxHeight: open === i ? 260 : 0, overflow: "hidden", transition: "max-height .3s ease" }}>
                  <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 16, lineHeight: 1.6, color: "var(--a4-mute)", margin: "0 0 24px", maxWidth: 640, textWrap: "pretty" }}>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function AuditCTA() {
  return (
    <section style={{ background: "#000", padding: "clamp(72px,10vw,120px) 0", position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(900px,90%)", height: 420, background: "radial-gradient(50% 50% at 50% 50%, rgba(73,79,223,.2), transparent 72%)", pointerEvents: "none" }} />
      <Container style={{ position: "relative", textAlign: "center" }}>
        <Reveal>
          <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "#fff", fontSize: "clamp(34px,5vw,64px)", lineHeight: 1.02, letterSpacing: "-.025em", margin: "0 auto", maxWidth: 720, textWrap: "balance" }}>Get your fixed audit fee today</h2>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 19, lineHeight: 1.6, color: "var(--a4-on-dark-mute)", margin: "22px auto 0", maxWidth: 560, textWrap: "pretty" }}>A two-minute estimate, then a quick call to confirm scope. On-time filing, by registered auditors.</p>
          <div style={{ display: "flex", gap: 12, marginTop: 34, flexWrap: "wrap", justifyContent: "center" }}>
            <Button variant="primary" size="lg" href="#estimate">Get your audit estimate <Icon name="arrow-right" size={18} color="#000" /></Button>
            <Button variant="outline-dark" size="lg" href={CLIENT_ONBOARDING_URL} target="_blank">Create your account</Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

// function AuditFooter() {
//   return (
//     <footer style={{ background: "#000", borderTop: "1px solid var(--a4-hairline-dark)", padding: "40px 0" }}>
//       <Container style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
//         <a href="/a4-services" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
//           <Logo height={20} />
//           <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 16, color: "#fff" }}>A4 Services</span>
//         </a>
//         <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "var(--a4-stone)" }}>© {new Date().getFullYear()} A4 Services Limited · Accounting &amp; audit firm in Malta · info@a4.com.mt</span>
//         <a href="/a4-services" style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--a4-on-dark-mute)", textDecoration: "none" }}>Back to main site →</a>
//       </Container>
//     </footer>
//   );
// }

export function AuditApp() {
  return (
    <div>
      {/* <AuditNav /> */}
      <main>
        <AuditHero />
        <FSReview />
        <WhyMalta />
        <AuditOverdue />
        <AuditEstimator />
        <AuditServices />
        <AuditProcess />
        <AuditFAQ />
        <AuditCTA />
      </main>
      {/* <AuditFooter /> */}
    </div>
  );
}
