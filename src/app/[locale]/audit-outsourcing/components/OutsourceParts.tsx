// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { Logo, Button, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";

// OutsourceParts — Audit outsourcing landing (from New website OutsourceParts.jsx)

const OS_PORTAL = "https://client.a4.com.mt";

function OSNav() {
  const [open, setOpen] = useState(false);
  const links = [{ label: "How it works", href: "#how" }, { label: "The portals", href: "#portals" }, { label: "Main site", href: "A4 Services.html" }];
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 60, background: "#000", borderBottom: "1px solid var(--a4-hairline-dark)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", height: 64, display: "flex", alignItems: "center", gap: 16, padding: "0 24px" }}>
        <a href="A4 Services.html" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
          <Logo height={24} />
          <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
            <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 18, color: "#fff", letterSpacing: "-.2px" }}>A4 Services</span>
            <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 10.5, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--a4-on-dark-mute)" }}>Audit Outsourcing</span>
          </span>
        </a>
        <div style={{ flex: 1 }} />
        {links.map((l) => (<a key={l.label} href={l.href} className="a4-navlinks" style={{ fontFamily: "var(--a4-font-body)", fontSize: 15, fontWeight: 500, color: "var(--a4-on-dark-mute)", textDecoration: "none" }}>{l.label}</a>))}
        <Button variant="primary" size="sm" href="#apply" style={{ height: 44, padding: "0 20px" }}>Partner with us <Icon name="arrow-right" size={16} color="#000" /></Button>
        <button className="a4-burger" onClick={() => setOpen(!open)} aria-label="Menu" style={{ display: "none", background: "none", border: 0, cursor: "pointer", color: "#fff", padding: 6 }}><Icon name={open ? "x" : "menu"} size={24} color="#fff" /></button>
      </div>
      {open && (<div style={{ borderTop: "1px solid var(--a4-hairline-dark)", padding: "12px 24px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
        {links.map((l) => (<a key={l.label} href={l.href} onClick={() => setOpen(false)} style={{ fontFamily: "var(--a4-font-body)", fontSize: 16, fontWeight: 500, color: "var(--a4-on-dark-mute)", textDecoration: "none", padding: "10px 0" }}>{l.label}</a>))}
        <a href="#apply" onClick={() => setOpen(false)} style={{ fontFamily: "var(--a4-font-body)", fontSize: 16, fontWeight: 600, color: "#fff", textDecoration: "none", padding: "10px 0" }}>Partner with us →</a>
      </div>)}
    </header>
  );
}

// Hero white-label portal mock — mock firm logo + branding-theme switcher
function OSFileMock() {
  const THEMES = ["#494fdf", "#16b08a", "#2a6fdb", "#d4693c"];
  const [t, setT] = useState("#494fdf");
  return (
    <div style={{ width: "100%", maxWidth: 460, background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", overflow: "hidden", boxShadow: "0 30px 80px -36px rgba(0,0,0,.9)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderBottom: "1px solid var(--a4-hairline-dark)", background: "var(--a4-surface-deep)" }}>
        <span style={{ flex: 1, height: 26, background: "#000", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-full)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}><Icon name="lock" size={11} color="var(--a4-stone)" /><span style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-on-dark-mute)" }}>audit.yourfirm.com</span></span>
      </div>
      <div style={{ padding: "20px 22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px dashed var(--a4-hairline-strong)", borderRadius: "var(--a4-r-md)", padding: "8px 14px" }}><Icon name="image" size={14} color="var(--a4-stone)" /><span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 600, color: "var(--a4-on-dark-mute)" }}>Your logo here</span></span>
          </div>
          <span style={{ width: 30, height: 30, borderRadius: 999, background: "var(--a4-surface-deep)", display: "grid", placeItems: "center", fontFamily: "var(--a4-font-body)", fontSize: 11, fontWeight: 700, color: "#fff" }}>JT</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18, padding: "11px 13px", background: "var(--a4-surface-deep)", borderRadius: "var(--a4-r-md)" }}>
          <Icon name="palette" size={15} color="var(--a4-on-dark-mute)" />
          <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-on-dark-mute)", flex: 1 }}>Brand theme</span>
          <div style={{ display: "flex", gap: 8 }}>
            {THEMES.map((c) => (<button key={c} onClick={() => setT(c)} aria-label="theme" style={{ width: 20, height: 20, borderRadius: 999, background: c, cursor: "pointer", border: t === c ? "2px solid #fff" : "2px solid transparent", padding: 0, boxShadow: "0 0 0 1px var(--a4-hairline-dark)" }} />))}
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--a4-stone)" }}>Statutory audit · 2025</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "#fff", letterSpacing: "-.3px" }}>Blue Harbour Ltd</span>
            <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 18, color: t, transition: "color .3s" }}>40%</span>
          </div>
          <div style={{ height: 6, background: "var(--a4-surface-deep)", borderRadius: 999, overflow: "hidden", marginTop: 10 }}><div style={{ height: "100%", width: "40%", background: t, borderRadius: 999, transition: "background .3s" }} /></div>
        </div>
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 9, background: "var(--a4-surface-deep)", borderRadius: "var(--a4-r-md)", padding: "11px 14px" }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: "#d69628" }} />
          <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "#fff", flex: 1 }}>2 items awaiting your review</span>
          <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, fontWeight: 600, color: t, transition: "color .3s" }}>Open →</span>
        </div>
      </div>
    </div>
  );
}

function OSCollab() {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 11, background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-full)", padding: "7px 15px 7px 12px", marginBottom: 22 }}>
      <Logo height={17} />
      <span style={{ color: "var(--a4-stone)", fontFamily: "var(--a4-font-display)", fontSize: 15, fontWeight: 500 }}>×</span>
      <span style={{ color: "var(--a4-stone)", fontFamily: "var(--a4-font-display)", fontSize: 15, fontWeight: 500 }}>V</span>
      <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, color: "var(--a4-on-dark-mute)" }}>Vacei, in collaboration with A4 Services</span>
    </div>
  );
}

function OSHero() {
  return (
    <section style={{ background: "#000", padding: "clamp(48px,7vw,92px) 0 clamp(56px,8vw,104px)", position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" className="hero-bg" />
      <Container style={{ position: "relative", display: "flex", gap: 60, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 440px", minWidth: 300 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 26, height: 1, background: "var(--a4-hairline-strong)" }} />
            <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--a4-on-dark-mute)" }}>Audit outsourcing · worldwide</span>
          </div>
          <h1 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "#fff", fontSize: "clamp(42px,5.6vw,78px)", lineHeight: 1.02, letterSpacing: "-.03em", margin: "20px 0 0", textWrap: "balance" }}>
            Outsource your audits.<br /><span style={{ color: "var(--a4-primary-bright)" }}>Keep the final say.</span>
          </h1>
          <p style={{ fontFamily: "var(--a4-font-body)", color: "var(--a4-on-dark-mute)", fontSize: 19, lineHeight: 1.6, maxWidth: 500, margin: "24px 0 0", textWrap: "pretty" }}>
            For accounting and audit firms worldwide. We run the full engagement — automation plus a dedicated team of auditors — and deliver a completed, <strong style={{ color: "#fff", fontWeight: 600 }}>fully white-label</strong> audit file from <strong style={{ color: "#fff", fontWeight: 600 }}>just 15% of the audit fee</strong>. You review every judgement and sign off — and your <strong style={{ color: "#fff", fontWeight: 600 }}>first small-client audit is free</strong>.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
            <Button variant="primary" size="lg" href="#apply">Partner with us <Icon name="arrow-right" size={18} color="#000" /></Button>
            <Button variant="outline-dark" size="lg" href="#how">How it works</Button>
          </div>
          <div style={{ display: "flex", gap: 22, marginTop: 32, flexWrap: "wrap" }}>
            {["First small audit free", "100% white-label", "You keep the final say"].map((t) => (<div key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon name="check" size={16} color="var(--a4-accent-teal)" stroke={2.4} /><span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, color: "var(--a4-on-dark)" }}>{t}</span></div>))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 38, paddingTop: 24, borderTop: "1px solid var(--a4-hairline-dark)", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--a4-stone)" }}>In collaboration</span>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Logo height={28} />
              <span style={{ color: "var(--a4-stone)", fontFamily: "var(--a4-font-display)", fontSize: 20, fontWeight: 500 }}>×</span>
              <span style={{ color: "var(--a4-stone)", fontFamily: "var(--a4-font-display)", fontSize: 20, fontWeight: 500 }}>Vacei</span>
            </div>
          </div>
        </div>
        <div style={{ flex: "1 1 380px", display: "flex", justifyContent: "center", minWidth: 300 }}><OSFileMock /></div>
      </Container>
    </section>
  );
}

function OSHow() {
  const steps = [
    { icon: "send", c: "#494fdf", bg: "rgba(73,79,223,.12)", t: "Send us the engagement", s: "Hand over the audit through your dashboard — we onboard it and agree scope and timeline." },
    { icon: "cpu", c: "#16b08a", bg: "rgba(22,176,138,.12)", t: "We plan, assess & test", s: "Automation and our auditors do the heavy lifting: planning, risk assessment and full testing." },
    { icon: "clipboard-check", c: "#2a6fdb", bg: "rgba(42,111,219,.12)", t: "You review & decide", s: "Approve our work and answer any uncertain go-aheads in your portal — a simple questionnaire. You keep the final say." },
    { icon: "file-check-2", c: "#d4693c", bg: "rgba(212,105,60,.12)", t: "We deliver final drafts", s: "Completion, financial statements and audit report — mapped, referenced and ready for your sign-off." },
  ];
  const [active, setActive] = useState(0);
  useEffect(() => { const id = setInterval(() => setActive((a) => (a + 1) % steps.length), 1500); return () => clearInterval(id); }, []);
  return (
    <section id="how" style={{ background: "var(--a4-canvas-light)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead align="center" eyebrow="How it works" title="A complete audit, run for you" sub="You stay in control of every judgement — we do the work behind it." maxWidth={560} /></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 52 }}>
          {steps.map((s, i) => { const on = i === active; return (
            <Reveal key={s.t} delay={i * 80} style={{ background: "var(--a4-surface-card)", border: "1px solid " + (on ? s.c : "var(--a4-hairline-light)"), borderRadius: "var(--a4-r-lg)", padding: "clamp(24px,3vw,32px)", transform: on ? "translateY(-5px)" : "none", boxShadow: on ? "0 20px 44px -22px " + s.c : "none", transition: "border-color .4s, transform .4s, box-shadow .4s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ width: 48, height: 48, borderRadius: "var(--a4-r-md)", background: on ? s.c : s.bg, display: "grid", placeItems: "center", transition: "background .4s" }}><Icon name={s.icon} size={22} color={on ? "#fff" : s.c} stroke={1.85} /></span>
                <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 16, color: on ? s.c : "var(--a4-faint)", transition: "color .4s" }}>0{i + 1}</span>
              </div>
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 20, color: "var(--a4-ink)", margin: "20px 0 0", letterSpacing: "-.2px" }}>{s.t}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, lineHeight: 1.55, color: "var(--a4-mute)", margin: "9px 0 0", textWrap: "pretty" }}>{s.s}</p>
            </Reveal>
          ); })}
        </div>
      </Container>
    </section>
  );
}

function OSPortals() {
  const cards = [
    { icon: "users-round", tag: "Your client", t: "A progress portal for your client", s: "Give your client a clean, branded window into their audit — milestones, what's been provided, what's outstanding and where things stand. Confidence, without the email chasing.", points: ["Live engagement progress", "Document requests & uploads", "Milestones and target dates"] },
    { icon: "list-checks", tag: "Your team", t: "A review portal for your auditors", s: "Your team reviews all of our testing, sees the working papers, and answers any uncertain go-aheads as a simple questionnaire — so the application of judgement is always yours.", points: ["Every test & working paper", "Go / no-go questionnaire", "You hold the final sign-off"] },
  ];
  return (
    <section id="portals" style={{ background: "#000", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead dark align="center" eyebrow="Full transparency" title="Two portals. Total visibility." sub="One for your client to follow progress, one for your team to review and approve every judgement." maxWidth={620} /></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginTop: 52 }}>
          {cards.map((c, i) => (
            <Reveal key={c.t} delay={i * 100} style={{ background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", padding: "clamp(28px,3.4vw,38px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 48, height: 48, borderRadius: "var(--a4-r-md)", background: "rgba(73,79,223,.16)", display: "grid", placeItems: "center" }}><Icon name={c.icon} size={24} color="var(--a4-primary-bright)" stroke={1.75} /></span>
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--a4-stone)" }}>{c.tag}</span>
              </div>
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 23, color: "#fff", margin: "20px 0 0", letterSpacing: "-.3px", textWrap: "balance" }}>{c.t}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 15, lineHeight: 1.55, color: "var(--a4-on-dark-mute)", margin: "12px 0 0", textWrap: "pretty" }}>{c.s}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--a4-hairline-dark)" }}>
                {c.points.map((p) => (<div key={p} style={{ display: "flex", alignItems: "center", gap: 10 }}><Icon name="check" size={15} color="var(--a4-accent-teal)" stroke={2.4} /><span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, color: "var(--a4-on-dark)" }}>{p}</span></div>))}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function OSDeliverables() {
  const items = [
    { icon: "compass", t: "Planning", s: "Scope, materiality and audit strategy." },
    { icon: "shield-alert", t: "Risk assessment", s: "Understanding the entity and risk response." },
    { icon: "list-checks", t: "Testing", s: "Substantive and controls testing, fully documented." },
    { icon: "clipboard-check", t: "Completion", s: "Review, conclusions and the completion memo." },
    { icon: "file-check-2", t: "Final drafts", s: "Financial statements and the audit report." },
  ];
  return (
    <section style={{ background: "var(--a4-canvas-light)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead align="center" eyebrow="What you get" title="The complete audit file — mapped" sub="Every phase delivered, cross-referenced and review-ready in your portal." maxWidth={580} /></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 1, background: "var(--a4-hairline-light)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", overflow: "hidden", marginTop: 52 }}>
          {items.map((it) => (
            <div key={it.t} style={{ background: "var(--a4-surface-card)", padding: "26px 22px" }}>
              <Icon name={it.icon} size={22} color="var(--a4-primary)" stroke={1.75} />
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 18, color: "var(--a4-ink)", margin: "16px 0 0", letterSpacing: "-.2px" }}>{it.t}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, lineHeight: 1.5, color: "var(--a4-mute)", margin: "7px 0 0", textWrap: "pretty" }}>{it.s}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function OSWhy() {
  const items = [
    { icon: "percent", t: "From 15% of the fee", s: "Keep the client and the margin — we deliver the engagement for a fraction of your cost." },
    { icon: "cpu", t: "Automation + auditors", s: "Software speed with a dedicated, qualified audit team behind every file." },
    { icon: "scale", t: "You keep control", s: "Every judgement is yours to approve — we never apply your sign-off." },
    { icon: "globe", t: "Built for firms abroad", s: "Scale your audit capacity without hiring — across borders and busy seasons." },
  ];
  return (
    <section style={{ background: "#000", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead dark align="center" eyebrow="Why A4" title="Your capacity, multiplied" sub="The work off your plate, the relationship and the final say still yours." maxWidth={580} /></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 52 }}>
          {items.map((it, i) => (
            <Reveal key={it.t} delay={i * 80} style={{ background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", padding: "28px 26px" }}>
              <Icon name={it.icon} size={24} color="var(--a4-primary-bright)" stroke={1.75} />
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 19, color: "#fff", margin: "18px 0 0", letterSpacing: "-.2px" }}>{it.t}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, lineHeight: 1.5, color: "var(--a4-on-dark-mute)", margin: "9px 0 0", textWrap: "pretty" }}>{it.s}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function OSApply() {
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", firm: "", country: "", email: "" });
  const submit = () => { if (form.name && form.email && form.firm) setDone(true); };
  const inp = { width: "100%", background: "var(--a4-surface-deep)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-md)", padding: "12px 14px", color: "#fff", fontFamily: "var(--a4-font-body)", fontSize: 14.5, outline: "none", marginBottom: 12 };
  return (
    <section id="apply" style={{ background: "var(--a4-surface-soft)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <div style={{ background: "#000", borderRadius: "var(--a4-r-xl)", padding: "clamp(32px,5vw,64px)", display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 44, alignItems: "center" }} className="os-apply">
          <div>
            <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "#fff", fontSize: "clamp(30px,4vw,52px)", lineHeight: 1.04, letterSpacing: "-.025em", margin: 0, textWrap: "balance" }}>Outsource your next audit</h2>
            <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 18, lineHeight: 1.6, color: "var(--a4-on-dark-mute)", margin: "18px 0 0", maxWidth: 420, textWrap: "pretty" }}>Tell us about your firm and we'll set up a pilot with your two <strong style={{ color: "#fff" }}>white-label portals</strong>, branded with your logo. Your first audit for a small client is on us.</p>
          </div>
          <div style={{ background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", padding: "clamp(22px,3vw,30px)" }}>
            {done ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <Icon name="check-circle" size={30} color="var(--a4-accent-teal)" />
                <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 21, color: "#fff", marginTop: 12 }}>Thanks, {form.name.split(" ")[0]}</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, lineHeight: 1.55, color: "var(--a4-on-dark-mute)", marginTop: 8 }}>Our outsourcing team will reach out to <strong style={{ color: "#fff" }}>{form.email}</strong> to set up your pilot.</div>
              </div>
            ) : (
              <div>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name" style={inp} />
                <input value={form.firm} onChange={(e) => setForm((f) => ({ ...f, firm: e.target.value }))} placeholder="Firm name" style={inp} />
                <input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} placeholder="Country" style={inp} />
                <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} type="email" placeholder="Work email" style={{ ...inp, marginBottom: 16 }} />
                <Button variant="primary" size="md" onClick={submit} style={{ width: "100%" }}>Request a pilot <Icon name="arrow-right" size={16} color="#000" /></Button>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-stone)", marginTop: 12, textAlign: "center" }}>White-label · confidential · no obligation</div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

function OSFooter() {
  return (
    <footer style={{ background: "#000", borderTop: "1px solid var(--a4-hairline-dark)", padding: "40px 0" }}>
      <Container style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
        <a href="A4 Services.html" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}><Logo height={20} /><span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 16, color: "#fff" }}>A4 Services</span></a>
        <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "var(--a4-stone)" }}>© {new Date().getFullYear()} A4 Services Limited · Accounting &amp; audit firm in Malta · info@a4.com.mt</span>
        <a href="A4 Services.html" style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--a4-on-dark-mute)", textDecoration: "none" }}>Back to main site →</a>
      </Container>
    </footer>
  );
}

function OutsourceApp() {
  return (
    <div>
      <main>
        <OSHero />
        <OSHow />
        <OSPortals />
        <OSDeliverables />
        <OSWhy />
        <OSApply />
      </main>
    </div>
  );
}

export { OutsourceApp };
