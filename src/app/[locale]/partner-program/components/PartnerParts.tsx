"use client";

import React from "react";
import { Button, Icon } from "@/components/a4-landing/Primitives";
import { A4Mark, DARK_CARD } from "@/components/fx/primitives";
import { PartnerEarnings } from "./PartnerEarnings";
import {
  BODY, CardGrid, CtaBand, FaqSection, G, GRAD, Head, InfoCard, KitStyles, PERI, PaidHero, Section, Timeline, ctaPill, gradText, kicker,
} from "@/app/[locale]/accounting-services/components/PaidLandingKit";
// animated earnings-dashboard mockup, how-it-works, who-it's-for, portal,
// why-partner, FAQ, CTA. Set in the A4 design language (docs/DESIGN-LANGUAGE.md).

// function PartnerNav() { ... } — using site-wide Navbar from layout

// Reseller commission by service — the reseller-portal card, drawn in the A4
// palette (it used to be a PNG with green and blue segments). Part-to-whole of
// four services: each row carries its own label and figures, and a one-hue
// meter shows its share of the total, so colour never has to tell them apart.
const COMMISSION = [
  { k: "Bookkeeping & VAT", v: "€2,542", pct: 30 },
  { k: "Audit & tax", v: "€2,372", pct: 28 },
  { k: "Payroll & accounts", v: "€1,864", pct: 22 },
  { k: "Other services", v: "€1,694", pct: 20 },
];

function PortalDash() {
  return (
    <figure
      role="img"
      aria-label="A4 partner commission by service for 2026 — €8,472 total, split across bookkeeping & VAT, audit & tax, payroll & accounts and other services"
      style={{
        margin: 0,
        width: "100%",
        maxWidth: 470,
        borderRadius: 28,
        background: DARK_CARD,
        border: "1px solid rgba(255,255,255,.1)",
        boxShadow: "0 40px 100px rgba(0,0,0,.5)",
        padding: "clamp(24px,3vw,34px)",
        color: "#FFFFFF",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <A4Mark size={20} />
          <span style={{ width: 1.5, height: 16, margin: "0 10px", background: "#FFFFFF", opacity: 0.35 }} />
          <span style={{ ...kicker, color: "#A1A1AA" }}>Commission by service · 2026</span>
        </div>
      </div>
      <div style={{ marginTop: 26, display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "6px 12px" }}>
        <span style={{ fontSize: "clamp(48px,5vw,64px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1, fontVariantNumeric: "tabular-nums", paddingBottom: ".04em", ...gradText }}>€8,472</span>
        <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: "#A1A1AA" }}>total · 3-yr at 40%</span>
      </div>
      <span style={{ marginTop: 14, height: 30, padding: "0 12px", display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999, background: "rgba(139,143,247,.16)", color: "#FFFFFF", fontSize: 13, fontWeight: 600 }}>
        <Icon name="trending-up" size={14} color={PERI} stroke={2.2} /> +18% vs 2025
      </span>
      <div style={{ marginTop: 24 }}>
        {COMMISSION.map((c, i) => (
          <div key={c.k} style={{ padding: "14px 0", borderTop: "1px solid rgba(255,255,255,.1)", ...(i === COMMISSION.length - 1 ? { paddingBottom: 0 } : null) }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: 15.5, fontWeight: 500, letterSpacing: "-0.01em", color: "#E4E4E7" }}>{c.k}</span>
              <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{c.v}</span>
              <span style={{ width: 40, textAlign: "right", fontFamily: BODY, fontSize: 13, fontWeight: 500, color: "#A1A1AA", fontVariantNumeric: "tabular-nums" }}>{c.pct}%</span>
            </div>
            <div aria-hidden="true" style={{ marginTop: 10, height: 6, borderRadius: 999, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
              <div style={{ width: `${c.pct}%`, height: "100%", borderRadius: 999, background: GRAD }} />
            </div>
          </div>
        ))}
      </div>
    </figure>
  );
}

function PartnerHero() {
  return (
    <PaidHero
      eyebrow="Partner program · Malta"
      first="Refer clients."
      accent="Earn 40% for three years."
      lead="For accounting firms, lawyers and corporate service providers. Refer your clients' accounting, audit and tax work to A4 — earn 40% commission on every service they engage, for three full years, tracked in your own reseller portal."
      chips={["No cost to join", "Paid quarterly", "Recurring for 3 years"]}
      actions={
        <>
          <Button variant="primary" size="lg" href="#earnings">Calculate your earnings <Icon name="arrow-right" size={18} color="#09090B" /></Button>
          <Button variant="outline-dark" size="lg" href="#how">How it works</Button>
        </>
      }
      aside={<PortalDash />}
    />
  );
}

function PartnerHow() {
  const steps = [
    { title: "Refer a client", body: "Introduce a client through your reseller portal, or simply send them our way with your referral link." },
    { title: "We do the work", body: "A4 onboards them and delivers the accounting, audit, VAT, payroll or tax services they need — to our standard." },
    { title: "You earn 40%, for 3 years", body: "Earn 40% commission on every service that client engages, for three years — paid quarterly, tracked in real time." },
  ];
  return (
    <Section id="how" surface="light">
      <Head n="01" eyebrow="How it works" title={<>Three steps to <G>recurring income</G></>} sub="Add a new revenue stream to your firm without taking on the delivery." />
      <div style={{ marginTop: "clamp(56px,7vw,96px)" }}>
        <Timeline steps={steps} min={260} />
      </div>
    </Section>
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
    <Section surface="dark" glow={{ left: "50%", top: "-20%", strength: 0.22 }}>
      <Head dark n="04" eyebrow="Who it's for" title={<>Built for firms with <G>clients to refer</G></>} sub="If you advise businesses, you already have the relationships. We handle the delivery." />
      <CardGrid min={260} style={{ marginTop: "clamp(48px,6vw,80px)" }}>
        {who.map((w, i) => (
          <InfoCard key={w.t} i={i} total={who.length} glass icon={w.icon} title={w.t} body={w.s} minHeight={300} />
        ))}
      </CardGrid>
    </Section>
  );
}

function PartnerWhy() {
  const items = [
    { icon: "percent", t: "40% commission", s: "On every service your referred clients engage — not just the first." },
    { icon: "calendar-range", t: "For three years", s: "Recurring commission on each client for three full years, paid quarterly." },
    { icon: "layout-dashboard", t: "Your reseller portal", s: "Track referrals, live earnings and payouts in one dedicated dashboard." },
  ];
  return (
    <Section surface="light">
      <Head n="05" eyebrow="Why partner with A4" title={<>Recurring revenue, <G>zero delivery</G></>} sub="A licensed accounting & audit firm doing the work — while you earn on the introduction." />
      <CardGrid style={{ marginTop: "clamp(48px,6vw,80px)" }}>
        {items.map((it, i) => (
          <InfoCard key={it.t} i={i} total={items.length} dark={i % 2 === 1} icon={it.icon} title={it.t} body={it.s} minHeight={280} />
        ))}
      </CardGrid>
    </Section>
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
  return (
    <FaqSection
      n="06"
      surface="muted"
      line1="Partner"
      line2="questions"
      sub={<>Want the full terms? We&apos;ll walk you through everything when you apply.</>}
      action={<Button variant="dark" size="lg" href="#earnings">Become a partner <Icon name="arrow-right" size={18} color="#fff" /></Button>}
      faqs={faqs}
    />
  );
}

function PartnerCTA() {
  return (
    <CtaBand
      first="Turn your introductions"
      accent="into income"
      lead="Join the A4 partner program, get your reseller portal, and start earning 40% on every client you refer — for three years."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Button variant="primary" size="lg" href="#earnings" style={ctaPill}>Become a partner <Icon name="arrow-right" size={18} color="#09090B" /></Button>
        <Button variant="outline-dark" size="lg" href="/a4-services" style={ctaPill}>Back to main site</Button>
      </div>
    </CtaBand>
  );
}

// function PartnerFooter() { ... } — using site-wide Footer from layout

function VideoExplainer() {
  return (
    <Section surface="dark" glow={{ left: "10%", top: "-30%", strength: 0.24 }}>
      <Head dark n="02" eyebrow="Watch" title={<>See the partner program in <G>90 seconds</G></>} sub="A quick walkthrough of how referrals, the reseller portal and your commission work." />
      <div data-fx="rise" data-d="120" style={{ marginTop: "clamp(48px,6vw,80px)" }}>
        <div style={{ position: "relative", aspectRatio: "16 / 9", borderRadius: 28, overflow: "hidden", background: DARK_CARD, border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 40px 100px rgba(0,0,0,.45)", display: "grid", placeItems: "center" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 60% at 50% 45%, rgba(79,85,241,.28), rgba(79,85,241,0) 70%)" }} />
          <button type="button" aria-label="Play video" style={{ position: "relative", width: 88, height: 88, borderRadius: 999, border: 0, cursor: "pointer", background: "#FFFFFF", display: "grid", placeItems: "center", boxShadow: "0 24px 60px rgba(0,0,0,.5)", paddingLeft: 5 }}>
            <Icon name="play" size={32} color="#09090B" />
          </button>
          <span style={{ position: "absolute", bottom: 18, left: 22, fontFamily: BODY, fontSize: 13, fontWeight: 600, color: "#A1A1AA" }}>Video placeholder — add your explainer</span>
        </div>
      </div>
    </Section>
  );
}

export function PartnerApp() {
  return (
    <div>
      {/* <PartnerNav /> */}
      <main id="main-content">
        <KitStyles />
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
