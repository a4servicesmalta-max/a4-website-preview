// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Logo, Button, Pill, Badge, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
import { HeroFX } from "@/components/a4-landing/HeroFX";
import { PartnerEarnings } from "./PartnerEarnings";
// animated earnings-dashboard mockup, how-it-works, who-it's-for, portal,
// why-partner, FAQ, CTA, footer. Reuses Primitives + HeroFX from the main app.

import { CLIENT_ONBOARDING_URL } from "@/lib/external-links";

// function PartnerNav() { ... } — using site-wide Navbar from layout

// Reseller commission chart — static generated image with a subtle entrance
// (fade + rise on load, then a slow gentle float). Respects reduced-motion.
function PortalDash() {
  return (
    <img
      src="/assets/commission-chart.png"
      alt="A4 partner commission by service for 2026 — €8,472 total, split across bookkeeping & VAT, audit & tax, payroll & accounts and other services"
      style={{ width: "100%", maxWidth: 470, height: "auto", display: "block" }}
    />
  );
}

function PartnerHero() {
  return (
    <section style={{ background: "#000", padding: "clamp(48px,7vw,92px) 0 clamp(56px,8vw,104px)", position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" className="hero-bg" />
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(90deg, rgba(0,0,0,.74) 0%, rgba(0,0,0,.34) 40%, transparent 64%), linear-gradient(180deg, transparent 58%, rgba(0,0,0,.6) 100%)" }} />
      <Container style={{ position: "relative", display: "flex", gap: 60, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 440px", minWidth: 300 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 26, height: 1, background: "var(--a4-hairline-strong)" }} />
            <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--a4-on-dark-mute)" }}>Partner program · Malta</span>
          </div>
          <h1 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "#fff", fontSize: "clamp(42px,5.6vw,78px)", lineHeight: 1.0, letterSpacing: "-.03em", margin: "20px 0 0", textWrap: "balance" }}>
            Refer clients.<br />Earn <span style={{ color: "var(--a4-primary-bright)" }}>40%</span> for<br />three years.
          </h1>
          <p style={{ fontFamily: "var(--a4-font-body)", color: "var(--a4-on-dark-mute)", fontSize: "clamp(16px,2.5vw,19px)", lineHeight: 1.6, maxWidth: 480, margin: "24px 0 0", textWrap: "pretty" }}>
            For accounting firms, lawyers and corporate service providers. Refer your clients' accounting, audit and tax work to A4 — earn 40% commission on every service they engage, for three full years, tracked in your own reseller portal.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
            <Button variant="primary" size="lg" href="#earnings">Calculate your earnings <Icon name="arrow-right" size={18} color="#000" /></Button>
            <Button variant="outline-dark" size="lg" href="#how">How it works</Button>
          </div>
          <div style={{ display: "flex", gap: 22, marginTop: 32, flexWrap: "wrap" }}>
            {["No cost to join", "Paid quarterly", "Recurring for 3 years"].map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="check" size={16} color="var(--a4-accent-teal)" stroke={2.4} />
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, color: "var(--a4-on-dark)" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: "1 1 380px", display: "flex", justifyContent: "center", minWidth: 300 }}>
          <PortalDash />
        </div>
      </Container>
    </section>
  );
}

function PartnerHow() {
  const steps = [
    { icon: "user-plus", t: "Refer a client", s: "Introduce a client through your reseller portal, or simply send them our way with your referral link." },
    { icon: "briefcase", t: "We do the work", s: "A4 onboards them and delivers the accounting, audit, VAT, payroll or tax services they need — to our standard." },
    { icon: "wallet", t: "You earn 40%, for 3 years", s: "Earn 40% commission on every service that client engages, for three years — paid quarterly, tracked in real time." },
  ];
  return (
    <section id="how" style={{ background: "var(--a4-canvas-light)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead align="center" eyebrow="How it works" title="Three steps to recurring income" sub="Add a new revenue stream to your firm without taking on the delivery." maxWidth={560} /></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 52 }}>
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 90} style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", padding: "clamp(26px,3vw,34px)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ width: 46, height: 46, borderRadius: "var(--a4-r-md)", background: "var(--a4-surface-soft)", display: "grid", placeItems: "center" }}><Icon name={s.icon} size={22} color="var(--a4-primary)" stroke={1.75} /></span>
                <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 15, color: "var(--a4-faint)" }}>0{i + 1}</span>
              </div>
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 21, color: "var(--a4-ink)", margin: "22px 0 0", letterSpacing: "-.2px" }}>{s.t}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 15, lineHeight: 1.55, color: "var(--a4-mute)", margin: "9px 0 0", textWrap: "pretty" }}>{s.s}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function PartnerWho() {
  const who = [
    { icon: "calculator", t: "Accounting firms", s: "Refer work that's outside your capacity or service range — audit, payroll, overflow bookkeeping." },
    { icon: "scale", t: "Lawyers & notaries", s: "Send clients who need company accounts, audit or tax alongside your legal work." },
    { icon: "briefcase", t: "Corporate service providers", s: "Offer your portfolio companies a licensed accounting & audit partner, and earn on every engagement." },
    { icon: "users", t: "Consultants & advisors", s: "Monetise the introductions you already make to clients who need finance support." },
  ];
  return (
    <section style={{ background: "#000", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead dark align="center" eyebrow="Who it's for" title="Built for firms with clients to refer" sub="If you advise businesses, you already have the relationships. We handle the delivery." maxWidth={580} /></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 52 }}>
          {who.map((w, i) => (
            <Reveal key={w.t} delay={i * 80} style={{ background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", padding: "28px 26px" }}>
              <Icon name={w.icon} size={24} color="var(--a4-primary-bright)" stroke={1.75} />
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 19, color: "#fff", margin: "20px 0 0", letterSpacing: "-.2px" }}>{w.t}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, lineHeight: 1.5, color: "var(--a4-on-dark-mute)", margin: "9px 0 0", textWrap: "pretty" }}>{w.s}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function PartnerWhy() {
  const items = [
    { icon: "percent", t: "40% commission", s: "On every service your referred clients engage — not just the first." },
    { icon: "calendar-range", t: "For three years", s: "Recurring commission on each client for three full years, paid quarterly." },
    { icon: "layout-dashboard", t: "Your reseller portal", s: "Track referrals, live earnings and payouts in one dedicated dashboard." },
  ];
  return (
    <section style={{ background: "var(--a4-canvas-light)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead align="center" eyebrow="Why partner with A4" title="Recurring revenue, zero delivery" sub="A licensed accounting & audit firm doing the work — while you earn on the introduction." maxWidth={580} /></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 52 }}>
          {items.map((it, i) => (
            <Reveal key={it.t} delay={i * 80} style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", padding: "28px 26px" }}>
              <Icon name={it.icon} size={24} color="var(--a4-primary)" stroke={1.75} />
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 19, color: "var(--a4-ink)", margin: "18px 0 0", letterSpacing: "-.2px" }}>{it.t}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, lineHeight: 1.5, color: "var(--a4-mute)", margin: "9px 0 0", textWrap: "pretty" }}>{it.s}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function PartnerFAQ() {
  const faqs = [
    { q: "How and when am I paid?", a: "Commission is calculated on what each referred client actually pays A4, and paid out quarterly to your nominated account. Everything is itemised in your reseller portal." },
    { q: "What does the 40% apply to?", a: "Every service a referred client engages — bookkeeping, accounting, VAT, payroll, statutory audit and tax — for three years from their first engagement." },
    { q: "Do I lose my client?", a: "No. The client relationship stays with you. A4 acts as your delivery partner for the financial work you refer." },
    { q: "Is there a cost to join?", a: "No. Joining the partner program and using the reseller portal is free. You only ever earn." },
    { q: "Can I refer clients outside Malta?", a: "Yes — through our BOKS International membership we can support many cross-border engagements. Talk to us about your specific case." },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section style={{ background: "var(--a4-surface-soft)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container style={{ display: "flex", gap: 64, flexWrap: "wrap", alignItems: "flex-start" }}>
        <Reveal style={{ flex: "1 1 300px", minWidth: 280 }}>
          <Eyebrow>FAQ</Eyebrow>
          <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "var(--a4-ink)", fontSize: "clamp(32px,4vw,48px)", lineHeight: 1.05, letterSpacing: "-.02em", margin: "18px 0 0", textWrap: "balance" }}>Partner questions</h2>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 17, lineHeight: 1.55, color: "var(--a4-mute)", margin: "18px 0 28px", maxWidth: 340 }}>Want the full terms? We'll walk you through everything when you apply.</p>
          <Button variant="dark" size="md" href="#earnings">Become a partner <Icon name="arrow-right" size={17} color="#fff" /></Button>
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

function PartnerCTA() {
  return (
    <section style={{ background: "#000", padding: "clamp(72px,10vw,120px) 0", position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(900px,90%)", height: 420, background: "radial-gradient(50% 50% at 50% 50%, rgba(73,79,223,.2), transparent 72%)", pointerEvents: "none" }} />
      <Container style={{ position: "relative", textAlign: "center" }}>
        <Reveal>
          <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "#fff", fontSize: "clamp(34px,5vw,64px)", lineHeight: 1.02, letterSpacing: "-.025em", margin: "0 auto", maxWidth: 720, textWrap: "balance" }}>Turn your introductions into income</h2>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 19, lineHeight: 1.6, color: "var(--a4-on-dark-mute)", margin: "22px auto 0", maxWidth: 540, textWrap: "pretty" }}>Join the A4 partner program, get your reseller portal, and start earning 40% on every client you refer — for three years.</p>
          <div style={{ display: "flex", gap: 12, marginTop: 34, flexWrap: "wrap", justifyContent: "center" }}>
            <Button variant="primary" size="lg" href="#earnings">Become a partner <Icon name="arrow-right" size={18} color="#000" /></Button>
            <Button variant="outline-dark" size="lg" href="/a4-services">Back to main site</Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

// function PartnerFooter() { ... } — using site-wide Footer from layout

function VideoExplainer() {
  return (
    <section style={{ background: "var(--a4-canvas-light)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead align="center" eyebrow="Watch" title="See the partner program in 90 seconds" sub="A quick walkthrough of how referrals, the reseller portal and your commission work." maxWidth={580} /></Reveal>
        <Reveal delay={80} style={{ marginTop: 44, maxWidth: 900, marginLeft: "auto", marginRight: "auto" }}>
          <div style={{ position: "relative", aspectRatio: "16 / 9", borderRadius: "var(--a4-r-xl)", overflow: "hidden", background: "#000", border: "1px solid var(--a4-hairline-light)", display: "grid", placeItems: "center" }}>
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 60% at 50% 45%, rgba(73,79,223,.22), transparent 70%)" }} />
            <button aria-label="Play video" style={{ position: "relative", width: 84, height: 84, borderRadius: 999, border: 0, cursor: "pointer", background: "#fff", display: "grid", placeItems: "center", boxShadow: "0 18px 50px rgba(0,0,0,.5)", paddingLeft: 5 }}>
              <Icon name="play" size={32} color="#000" />
            </button>
            <span style={{ position: "absolute", bottom: 16, left: 20, fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, color: "var(--a4-on-dark-mute)" }}>Video placeholder — add your explainer</span>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export function PartnerApp() {
  return (
    <div>
      {/* <PartnerNav /> */}
      <main>
        <PartnerHero />
        <PartnerHow />
        <VideoExplainer />
        <PartnerEarnings />
        <PartnerWho />
        <PartnerWhy />
        <PartnerFAQ />
        <PartnerCTA />
      </main>
      {/* <PartnerFooter /> */}
    </div>
  );
}
