"use client";

import React, { useState } from "react";
import { Button, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
import { ScrollVideo } from "@/components/a4-landing/ScrollVideo";
import { AccountingEstimator } from "./AccountingEstimator";
import { BOOKKEEPING_COMPANY, BOOKKEEPING_FROM, PRICING_VAT_NOTE } from "@/data/a4QuotePack";
import { BOOK_A_CALL_PATH } from "@/lib/external-links";
import { ACCOUNTING_FAQS } from "@/data/serviceFaqs";

// Structure and copy ported from the A4 Accounting design
// (A4 New pages.zip → A4 Accounting.dc.html), rendered with A4's own
// primitives, nav and video.

function AccountingHero() {
  const proof = [
    "Documents read and coded for you",
    "Bank reconciled, not guessed",
    "VAT and reports from the same ledger",
    "A licensed Maltese firm, start to finish",
  ];
  return (
    <section style={{ background: "radial-gradient(900px 520px at 82% 6%, rgba(73,79,223,.42) 0%, rgba(73,79,223,0) 62%), #000", padding: "clamp(64px,9vw,120px) 0 clamp(60px,8vw,104px)", position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" className="hero-bg" />
      <Container style={{ position: "relative", textAlign: "center" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <span style={{ width: 28, height: 1, background: "rgba(255,255,255,.4)" }} />
            <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--a4-on-dark-mute)" }}>Accounting &amp; bookkeeping · Malta</span>
            <span style={{ width: 28, height: 1, background: "rgba(255,255,255,.4)" }} />
          </div>
          <h1 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "#fff", fontSize: "clamp(46px,6.6vw,88px)", lineHeight: 1.0, letterSpacing: "-.03em", margin: "22px auto 0", maxWidth: 900, textWrap: "balance" }}>
            Your books,<br /><span style={{ color: "var(--a4-primary-bright)" }}>always up to date.</span>
          </h1>
          <p style={{ fontFamily: "var(--a4-font-body)", color: "var(--a4-on-dark-mute)", fontSize: 19, lineHeight: 1.6, maxWidth: 660, margin: "24px auto 0", textWrap: "pretty" }}>
            We keep your books. You send the paperwork; our accountants code it, reconcile the bank, and hand you figures you can rely on each month — <strong style={{ color: "#fff", fontWeight: 600 }}>from &euro;{BOOKKEEPING_FROM} a month self-employed, from &euro;{BOOKKEEPING_COMPANY} for a company, set by your monthly spend</strong>.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 34, flexWrap: "wrap", justifyContent: "center" }}>
            <Button variant="primary" size="lg" href="#estimate">Get my price <Icon name="arrow-right" size={18} color="#000" /></Button>
            <Button variant="outline-dark" size="lg" href={BOOK_A_CALL_PATH}>Book a free call</Button>
          </div>
          <div style={{ display: "flex", gap: "10px 28px", marginTop: 38, flexWrap: "wrap", justifyContent: "center" }}>
            {proof.map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="check" size={16} color="var(--a4-primary-bright)" stroke={2.2} />
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, color: "var(--a4-on-dark)" }}>{t}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function WhyDifferent() {
  const points = [
    { icon: "scan-line", t: "The software does the work", s: "Every document is read, coded and matched to a bank line automatically. You are only asked about the handful of items it isn't sure of." },
    { icon: "users", t: "Accountants when you want them", s: "Run it yourself, have us review your workings, or hand the books over entirely. Change route any month — the price follows." },
    { icon: "search-check", t: "Every figure traceable", s: "Click a number and see the document behind it, who approved it, and when. Your VAT return is built only from entries already reconciled." },
  ];
  return (
    <section style={{ background: "var(--a4-surface-soft)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal>
          <SectionHead align="center" eyebrow="Why it's different here" title="Accounting done properly — not just processed." maxWidth={720} />
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

function WhatsCovered() {
  const items = [
    { t: "Bookkeeping", s: "Every transaction recorded, coded and posted — ongoing, without you keying anything." },
    { t: "Bank reconciliation", s: "Each entry matched to its bank line. Anything that doesn't match stays on screen instead of disappearing." },
    { t: "VAT returns", s: "Built only from entries already approved and reconciled, with a link back to every document behind them." },
    { t: "Management accounts", s: "Monthly figures that explain performance in plain language, out of a ledger that is already clean." },
  ];
  return (
    <section style={{ background: "var(--a4-surface-soft)", padding: "clamp(64px,9vw,104px) 0 0" }}>
      <Container>
        <Reveal>
          <SectionHead
            align="center"
            eyebrow="What's covered"
            title="Not just software. Not just a firm."
            sub="The platform does the volume work; qualified accountants do the judgement."
            maxWidth={580}
          />
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18, marginTop: 52 }}>
          {items.map((it, i) => (
            <Reveal key={it.t} delay={(i % 2) * 90} style={{ background: "linear-gradient(150deg, #EEEFFE 0%, #E2E4FC 55%, #D3D6FA 100%)", borderRadius: "var(--a4-r-lg)", padding: "clamp(22px,2.6vw,28px)" }}>
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 20, color: "var(--a4-ink)", margin: 0, letterSpacing: "-.2px" }}>{it.t}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, lineHeight: 1.55, color: "var(--a4-mute)", margin: "9px 0 0", textWrap: "pretty" }}>{it.s}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function MonthCloses() {
  const steps = [
    { n: "1", t: "Documents arrive", s: "Email them, drop them in the portal, or connect your bank. Everything lands in one place with a timestamp." },
    { n: "2", t: "Coded and proposed", s: "Supplier, net, VAT and account code are read from the document. Only genuine uncertainties come back to you." },
    { n: "3", t: "Approved and reconciled", s: "Entries post once approved, then match against the bank. Exceptions stay visible until they are resolved." },
    { n: "4", t: "Closed and reported", s: "The month closes, your figures update, and VAT and management accounts fall out of records that are already clean." },
  ];
  return (
    <section style={{ background: "var(--a4-surface-soft)", padding: "clamp(56px,8vw,88px) 0 clamp(64px,9vw,104px)" }}>
      <Container>
        <Reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
          <div>
            <Eyebrow>The process</Eyebrow>
            <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "var(--a4-ink)", fontSize: "clamp(34px,4.4vw,56px)", lineHeight: 1.02, letterSpacing: "-.02em", margin: "18px 0 0" }}>How a month closes</h2>
          </div>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 17, lineHeight: 1.55, color: "var(--a4-mute)", margin: 0, maxWidth: 340, textWrap: "pretty" }}>Four stages — most of it happens without you doing anything.</p>
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

function AccountingFAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section style={{ background: "var(--a4-canvas-light)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container style={{ display: "flex", gap: 64, flexWrap: "wrap", alignItems: "flex-start" }}>
        <Reveal style={{ flex: "1 1 300px", minWidth: 280 }}>
          <Eyebrow>FAQ</Eyebrow>
          <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "var(--a4-ink)", fontSize: "clamp(32px,4vw,48px)", lineHeight: 1.05, letterSpacing: "-.02em", margin: "18px 0 0", textWrap: "balance" }}>Bookkeeping questions, answered</h2>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 17, lineHeight: 1.55, color: "var(--a4-mute)", margin: "18px 0 28px", maxWidth: 340 }}>Still unsure? Book a free call and we&apos;ll talk it through.</p>
          <Button variant="dark" size="md" href={BOOK_A_CALL_PATH}>Book a free call <Icon name="arrow-right" size={17} color="#fff" /></Button>
        </Reveal>
        <Reveal delay={100} style={{ flex: "1 1 520px", minWidth: 300 }}>
          <div style={{ borderTop: "1px solid var(--a4-hairline-light)" }}>
            {ACCOUNTING_FAQS.map((f, i) => (
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

function AccountingCTA() {
  return (
    <section style={{ background: "var(--a4-canvas-light)", padding: "0 0 clamp(72px,10vw,110px)" }}>
      <Container>
        <Reveal style={{ background: "radial-gradient(700px 360px at 20% 0%, rgba(73,79,223,.28) 0%, rgba(73,79,223,0) 60%), #101114", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-xl)", padding: "clamp(38px,5vw,56px) clamp(24px,4vw,44px)", textAlign: "center", color: "#fff" }}>
          <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: "clamp(28px,3.6vw,40px)", letterSpacing: "-.025em", lineHeight: 1.06, margin: 0, textWrap: "balance" }}>Get your books closed on time</h2>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 15.5, lineHeight: 1.7, color: "var(--a4-on-dark-mute)", margin: "16px auto 0", maxWidth: "48ch", textWrap: "pretty" }}>
            Create your account and see your own figures in the portal, or talk it through with an accountant first.
          </p>
          <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Button variant="primary" size="lg" href="#estimate">Get my price <Icon name="arrow-right" size={18} color="#000" /></Button>
            <Button variant="outline-dark" size="lg" href={BOOK_A_CALL_PATH}>Book a free call</Button>
          </div>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, lineHeight: 1.6, color: "var(--a4-stone)", margin: "32px auto 0", maxWidth: 640 }}>
            A4 Services Limited is a licensed Maltese accounting and audit firm. {PRICING_VAT_NOTE}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

export function AccountingApp() {
  return (
    <main>
      <AccountingHero />
      <ScrollVideo label="See how the books run" />
      <WhyDifferent />
      <AccountingEstimator />
      <WhatsCovered />
      <MonthCloses />
      <AccountingFAQ />
      <AccountingCTA />
    </main>
  );
}
