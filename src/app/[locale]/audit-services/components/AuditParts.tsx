"use client";

import React, { useState } from "react";
import { Button, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
import { AuditEstimator } from "./AuditEstimator";
import { ScrollVideo } from "@/components/a4-landing/ScrollVideo";
import { AUDIT_FAQS } from "@/data/serviceFaqs";

// Structure and copy ported from the Vacei "Audit" design
// (Vacei Marketing Site Design.zip → Audit.dc.html), rendered in A4's palette,
// type and primitives so the page still reads as part of a4.com.mt.

function AuditHero() {
  const proof = [
    ["check", "Fixed fee, agreed up front"],
    ["check", "On-time MBR filing"],
    ["check", "Documents collected in the portal"],
    ["check", "Upload last year's FS for your fee"],
  ];
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
          <p style={{ fontFamily: "var(--a4-font-body)", color: "var(--a4-on-dark-mute)", fontSize: 19, lineHeight: 1.6, maxWidth: 640, margin: "24px auto 0", textWrap: "pretty" }}>
            A rigorous, independent, on-time audit with a fixed fee agreed up front — <strong style={{ color: "#fff", fontWeight: 600 }}>from &euro;600 a year</strong>. See your figure in sixty seconds, before you talk to anyone.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 34, flexWrap: "wrap", justifyContent: "center" }}>
            <Button variant="primary" size="lg" href="#estimate">Get my audit fee <Icon name="arrow-right" size={18} color="#000" /></Button>
            <Button variant="outline-dark" size="lg" href="#estimate">Book a consultation</Button>
          </div>
          <div style={{ display: "flex", gap: "10px 28px", marginTop: 38, flexWrap: "wrap", justifyContent: "center" }}>
            {proof.map(([ic, t]) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name={ic} size={16} color="var(--a4-primary-bright)" stroke={2.2} />
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, color: "var(--a4-on-dark)" }}>{t}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function WhyPainless() {
  const points = [
    { icon: "alarm-clock", t: "Deadlines handled", s: "Late filing at the MBR triggers penalties that grow over time. We track every deadline against your company and file ahead of it." },
    { icon: "folder-check", t: "One request list", s: "Documents are collected once, in the portal — not across a year of email attachments. You see exactly what is outstanding." },
    { icon: "handshake", t: "More than a signature", s: "A good audit gives banks, investors and your board confidence in your numbers — and surfaces issues early enough to fix them." },
  ];
  return (
    <section style={{ background: "var(--a4-canvas-light)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal>
          <SectionHead
            align="center"
            eyebrow="Why it's painless here"
            title="Every Maltese company files audited accounts. Yours can be the easy one."
            maxWidth={760}
          />
        </Reveal>
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
    { icon: "file-check-2", t: "Statutory audit", s: "Full audit of your annual financial statements under Maltese law (GAPSME or IFRS), signed by our licensed audit firm." },
    { icon: "layers", t: "Group audit", s: "Consolidation and audit for parent companies and groups, including intercompany reconciliations." },
    { icon: "shield-check", t: "Regulated entities", s: "Specialist audits for iGaming, financial services and other regulated businesses, with the reporting regulators expect." },
    { icon: "clipboard-check", t: "Special purpose", s: "Agreed-upon procedures, grant certifications and special-purpose reports when you need independent assurance." },
  ];
  return (
    <section style={{ background: "var(--a4-canvas-light)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal>
          <SectionHead
            align="center"
            eyebrow="Audit and assurance"
            title="One firm for every assurance need"
            sub="From a first statutory audit to complex group and regulated engagements."
            maxWidth={580}
          />
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18, marginTop: 52 }}>
          {items.map((it, i) => (
            <Reveal key={it.t} delay={(i % 2) * 90} style={{ background: "linear-gradient(150deg, #EFF0FE 0%, #E4E6FC 55%, #D6D9F8 100%)", borderRadius: "var(--a4-r-lg)", padding: "clamp(22px,2.6vw,28px)" }}>
              <Icon name={it.icon} size={24} color="var(--a4-primary-deep)" stroke={1.75} />
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 20, color: "var(--a4-ink)", margin: "18px 0 0", letterSpacing: "-.2px" }}>{it.t}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, lineHeight: 1.55, color: "var(--a4-mute)", margin: "9px 0 0", textWrap: "pretty" }}>{it.s}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function AuditProcess() {
  const steps = [
    { n: "1", t: "Scope and fixed fee", s: "A short call to understand your company; we agree the scope and a fixed fee up front." },
    { n: "2", t: "Upload to the portal", s: "Share your trial balance and documents securely — one request list, no endless email chains." },
    { n: "3", t: "Fieldwork and review", s: "Our team performs the audit and a partner reviews every file before anything is signed." },
    { n: "4", t: "Signed and filed", s: "You receive your signed audit opinion and we file on time at the MBR." },
  ];
  return (
    <section style={{ background: "var(--a4-canvas-light)", padding: "0 0 clamp(64px,9vw,104px)" }}>
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
              <div style={{ width: 40, height: 40, borderRadius: "var(--a4-r-full)", border: i === steps.length - 1 ? "1px solid var(--a4-primary)" : "1px solid var(--a4-hairline-light)", background: i === steps.length - 1 ? "var(--a4-primary)" : "transparent", display: "grid", placeItems: "center", fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 17, color: i === steps.length - 1 ? "#fff" : "var(--a4-primary)" }}>{s.n}</div>
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
  const [open, setOpen] = useState(0);
  return (
    <section style={{ background: "var(--a4-surface-soft)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container style={{ display: "flex", gap: 64, flexWrap: "wrap", alignItems: "flex-start" }}>
        <Reveal style={{ flex: "1 1 300px", minWidth: 280 }}>
          <Eyebrow>FAQ</Eyebrow>
          <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "var(--a4-ink)", fontSize: "clamp(32px,4vw,48px)", lineHeight: 1.05, letterSpacing: "-.02em", margin: "18px 0 0", textWrap: "balance" }}>Audit questions, answered</h2>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 17, lineHeight: 1.55, color: "var(--a4-mute)", margin: "18px 0 28px", maxWidth: 340 }}>Still unsure? Book a free consultation and we&apos;ll talk it through.</p>
          <Button variant="dark" size="md" href="#estimate">Book a consultation <Icon name="arrow-right" size={17} color="#fff" /></Button>
        </Reveal>
        <Reveal delay={100} style={{ flex: "1 1 520px", minWidth: 300 }}>
          <div style={{ borderTop: "1px solid var(--a4-hairline-light)" }}>
            {AUDIT_FAQS.map((f, i) => (
              <div key={f.q} style={{ borderBottom: "1px solid var(--a4-hairline-light)" }}>
                <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, background: "none", border: 0, cursor: "pointer", padding: "22px 0", textAlign: "left" }}>
                  <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: "clamp(17px,2.1vw,21px)", color: "var(--a4-ink)", letterSpacing: "-.2px" }}>{f.q}</span>
                  <span style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "var(--a4-r-full)", border: "1px solid var(--a4-hairline-light)", display: "grid", placeItems: "center", transition: "transform .25s, background .2s", transform: open === i ? "rotate(45deg)" : "none", background: open === i ? "var(--a4-ink)" : "transparent" }}>
                    <Icon name="plus" size={16} color={open === i ? "#fff" : "var(--a4-ink)"} />
                  </span>
                </button>
                <div style={{ maxHeight: open === i ? 320 : 0, overflow: "hidden", transition: "max-height .3s ease" }}>
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
    <section style={{ background: "#000", padding: "clamp(72px,10vw,120px) 0 clamp(40px,5vw,60px)", position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" style={{ position: "absolute", top: "45%", left: "50%", transform: "translate(-50%,-50%)", width: "min(900px,90%)", height: 420, background: "radial-gradient(50% 50% at 50% 50%, rgba(73,79,223,.2), transparent 72%)", pointerEvents: "none" }} />
      <Container style={{ position: "relative", textAlign: "center" }}>
        <Reveal>
          <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "#fff", fontSize: "clamp(34px,5vw,64px)", lineHeight: 1.02, letterSpacing: "-.025em", margin: "0 auto", maxWidth: 720, textWrap: "balance" }}>Get your fixed audit fee today</h2>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 19, lineHeight: 1.6, color: "var(--a4-on-dark-mute)", margin: "22px auto 0", maxWidth: 560, textWrap: "pretty" }}>A sixty-second estimate, then a short call to confirm scope. On-time filing, by registered auditors.</p>
          <div style={{ display: "flex", gap: 12, marginTop: 34, flexWrap: "wrap", justifyContent: "center" }}>
            <Button variant="primary" size="lg" href="#estimate">Get my audit fee <Icon name="arrow-right" size={18} color="#000" /></Button>
            <Button variant="outline-dark" size="lg" href="/contact">Request information</Button>
          </div>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, lineHeight: 1.6, color: "var(--a4-stone)", margin: "48px auto 0", maxWidth: 640 }}>
            Audits are delivered by A4 Services Limited, a licensed Maltese audit firm. All fees exclude VAT.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

export function AuditApp() {
  return (
    <main>
      <AuditHero />
      <ScrollVideo label="See how the audit runs" />
      <WhyPainless />
      <AuditEstimator />
      <AuditServices />
      <AuditProcess />
      <AuditFAQ />
      <AuditCTA />
    </main>
  );
}
