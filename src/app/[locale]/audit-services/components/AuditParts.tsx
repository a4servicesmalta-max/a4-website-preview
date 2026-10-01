"use client";

import React from "react";
import { Button, Icon } from "@/components/a4-landing/Primitives";
import { AuditEstimator } from "./AuditEstimator";
import { AUDIT_PRE_TRADING, REVIEW_ENGAGEMENT_FACTOR } from "@/data/a4QuotePack";
import {
  BODY, CardGrid, CenterEyebrow, CtaBand, FaqSection, G, Head, InfoCard, KitStyles, PaidHero, Section, Statement, Timeline, ctaPill,
} from "@/app/[locale]/accounting-services/components/PaidLandingKit";
import { AiNativeFilm } from "@/components/film/chapters";
// NOTE: `./FSReview` was imported here but has never existed — no file on disk,
// no history in any branch, not gitignored. The import has been present since
// the "pages added" commit, so this module has never typechecked and
// /audit-services has never built from this repo. Removed 2026-08-13 so the
// build passes; nothing is lost, because the section could never have rendered.
// services, process, overdue check, FAQ, final CTA, footer. Reuses Primitives
// and HeroFX from the main app.
//
// Set in the A4 design language (docs/DESIGN-LANGUAGE.md) — the page-scoped
// lime/charcoal theme is gone (owner, Oct 2026: one design language site-wide).


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

function AuditHero() {
  return (
    <PaidHero
      eyebrow="Licensed audit firm · Malta"
      first="Need an audit?"
      accent="We make it simple."
      lead={
        <>
          Every company in Malta must file audited financial statements. As a licensed audit firm, A4 delivers a rigorous, independent, on-time audit — with a fixed fee agreed up front, <strong style={{ color: "#fff", fontWeight: 600 }}>from &euro;{AUDIT_PRE_TRADING}/year</strong>. Where a review engagement is enough, it is {Math.round(REVIEW_ENGAGEMENT_FACTOR * 100)}% of the audit fee.
        </>
      }
      chips={["Licensed audit firm", "On-time filing, guaranteed", "Fixed fee, no surprises", "Portal-based document collection"]}
      actions={
        <>
          <Button variant="primary" size="lg" href="#estimate">Get your audit estimate <Icon name="arrow-right" size={18} color="#09090B" /></Button>
          <Button variant="outline-dark" size="lg" href="/book-a-call">Book a consultation</Button>
        </>
      }
    />
  );
}

function WhyMalta() {
  const points = [
    { icon: "scale", t: "It's the law in Malta", s: "Unlike many countries, every Maltese company — regardless of size — must file audited financial statements each year." },
    { icon: "alarm-clock", t: "Deadlines that bite", s: "Late filing at the MBR triggers penalties that grow over time. We keep you ahead of every deadline." },
    { icon: "handshake", t: "More than a signature", s: "A good audit gives banks, investors and your board confidence in your numbers — and surfaces issues early." },
  ];
  return (
    <Section surface="light">
      <Head
        n="01"
        eyebrow="Why it matters"
        title={<>Audit isn&apos;t <G>optional</G> in Malta</>}
        sub="Which is exactly why it should be painless. Here's what's at stake — and how we take it off your plate."
      />
      <CardGrid style={{ marginTop: "clamp(48px,6vw,80px)" }}>
        {points.map((p, i) => (
          <InfoCard key={p.t} i={i} total={points.length} dark={i % 2 === 1} icon={p.icon} title={p.t} body={p.s} />
        ))}
      </CardGrid>
    </Section>
  );
}

/** AI-native positioning band — audit rebuilt around AI, licensed auditors on the judgement and the opinion. */
function AuditManifesto() {
  return (
    <Section surface="dark" sweep glow={{ left: "40%", top: "-10%", strength: 0.24 }}>
      <CenterEyebrow n="03" dark>Built AI-native</CenterEyebrow>
      <Statement dark first="We’re not adding AI to audit." parts={[{ t: "We’re" }, { t: "rebuilding it.", g: true }]} />
      <div style={{ maxWidth: 760, margin: "clamp(40px,5vw,64px) auto 0", textAlign: "center" }}>
        <p data-fx="rise" data-d="700" style={{ fontFamily: BODY, fontSize: "clamp(17px,1.6vw,20px)", lineHeight: 1.65, color: "#A1A1AA", margin: 0, textWrap: "pretty" }}>
          Audit is the last layer of finance nobody rebuilt — decades-old methods, brilliant people buried in repetitive work, fees billed by the hour. A4 works the other way around. The machines do the volume: collecting evidence, reconciling, documenting, analysing every transaction. Our licensed auditors do the judgement, the risk, the call and the hard conversations — and they sign the opinion.
        </p>
        <p data-fx="rise" data-d="820" style={{ fontFamily: BODY, fontSize: "clamp(17px,1.6vw,20px)", lineHeight: 1.65, color: "#E4E4E7", margin: "22px 0 0", textWrap: "pretty" }}>
          AI agents check every transaction in real time. Licensed auditors own the judgement and the sign-off. <strong style={{ color: "#fff", fontWeight: 600 }}>Faster closes, deeper assurance, no year-end surprises</strong> — at a fixed fee agreed up front.
        </p>
      </div>
    </Section>
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
    <Section surface="light">
      <Head
        n="04"
        eyebrow="Audit & assurance"
        title={<>One firm for every <G>assurance</G> need</>}
        sub="From a first statutory audit to complex group and regulated engagements."
      />
      <CardGrid min={260} style={{ marginTop: "clamp(48px,6vw,80px)" }}>
        {items.map((it, i) => (
          <InfoCard key={it.t} i={i} total={items.length} dark={i % 2 === 1} icon={it.icon} title={it.t} body={it.s} minHeight={330} />
        ))}
      </CardGrid>
    </Section>
  );
}

function AuditProcess() {
  const steps = [
    { title: "Scope & fixed fee", body: "A short call to understand your company; we agree the scope and a fixed fee up front." },
    { title: "Upload to the portal", body: "Share your trial balance and documents securely — no endless email chains." },
    { title: "Fieldwork & review", body: "Our team performs the audit and a partner reviews every file." },
    { title: "Signed & filed", body: "You receive your signed audit opinion and we help file on time at the MBR." },
  ];
  return (
    <Section surface="muted">
      <Head n="05" eyebrow="The process" title={<>A smooth audit, <G>start to finish</G></>} sub="Four clear stages — most of the work happens behind the scenes." />
      <div style={{ marginTop: "clamp(56px,7vw,96px)" }}>
        <Timeline steps={steps} />
      </div>
    </Section>
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
  return (
    <FaqSection
      n="06"
      surface="white"
      line1="Audit questions,"
      line2="answered"
      sub={<>Still unsure? Book a free consultation and we&apos;ll talk it through.</>}
      action={<Button variant="dark" size="lg" href="/book-a-call">Book a consultation <Icon name="arrow-right" size={18} color="#fff" /></Button>}
      faqs={faqs}
    />
  );
}

function AuditCTA() {
  return (
    <CtaBand
      first="Get your fixed"
      accent="audit fee today"
      lead="A two-minute estimate, then a quick call to confirm scope. On-time filing, by registered auditors."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Button variant="primary" size="lg" href="#estimate" style={ctaPill}>Get your audit estimate <Icon name="arrow-right" size={18} color="#09090B" /></Button>
        <Button variant="outline-dark" size="lg" href="/contact" style={ctaPill}>Request information</Button>
      </div>
    </CtaBand>
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
      <main id="main-content">
        <KitStyles />
        <AuditHero />
        <AiNativeFilm />
        <WhyMalta />
        <AuditEstimator />
        <AuditManifesto />
        <AuditServices />
        <AuditProcess />
        <AuditFAQ />
        <AuditCTA />
      </main>
      {/* <AuditFooter /> */}
    </div>
  );
}
