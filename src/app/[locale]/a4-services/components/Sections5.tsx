// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Logo, Button, Pill, Badge, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
import { getNextComplianceDeadline, formatComplianceDate } from "@/lib/compliance-deadlines";
import { SUPPORT_RESPONSE_LABEL } from "@/lib/site-config";
import { CLIENT_ONBOARDING_URL } from "@/lib/external-links";

export function ContactCTA() {
  return (
    <section style={{ background: "#000", padding: "clamp(72px,10vw,128px) 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(900px,90%)", height: 500, background: "radial-gradient(50% 50% at 50% 50%, rgba(73,79,223,.18), transparent 72%)", pointerEvents: "none" }} />
      <Container style={{ position: "relative", textAlign: "center" }}>
        <Reveal>
          <Eyebrow dark color="var(--a4-primary-bright)"><span style={{ justifyContent: "center" }}>Get started</span></Eyebrow>
          <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "#fff", fontSize: "clamp(36px,5.4vw,68px)", lineHeight: 1.02, letterSpacing: "-.025em", margin: "18px auto 0", maxWidth: 760, textWrap: "balance" }}>
            When should you contact A4 Services?
          </h2>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 19, lineHeight: 1.6, color: "var(--a4-on-dark-mute)", margin: "24px auto 0", maxWidth: 660, textWrap: "pretty" }}>
            Speak to us if you need an accounting firm in Malta, your company requires a statutory audit, your bookkeeping is behind, or you want better visibility over your business numbers.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 38, flexWrap: "wrap", justifyContent: "center" }}>
            <Button variant="primary" size="lg" href={CLIENT_ONBOARDING_URL} target="_blank" rel="noopener noreferrer">Create your account <Icon name="arrow-right" size={18} color="#000" /></Button>
            <Button variant="outline-dark" size="lg" href="/contact">Book a consultation</Button>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginTop: 30, background: "rgba(255,255,255,.05)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-full)", padding: "8px 16px" }}>
            <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
              <span style={{ position: "absolute", inset: 0, borderRadius: 999, background: "var(--a4-accent-teal)" }} />
            </span>
            <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, color: "var(--a4-on-dark-mute)" }}>{SUPPORT_RESPONSE_LABEL}</span>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export function FAQItem({ q, a, open, onToggle }) {
  const ref = useRef(null);
  return (
    <div style={{ borderBottom: "1px solid var(--a4-hairline-light)" }}>
      <button onClick={onToggle} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
        background: "none", border: 0, cursor: "pointer", padding: "24px 0", textAlign: "left",
      }}>
        <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: "clamp(18px,2.2vw,22px)", color: "var(--a4-ink)", letterSpacing: "-.2px" }}>{q}</span>
        <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: "var(--a4-r-full)", border: "1px solid var(--a4-hairline-strong)", display: "grid", placeItems: "center", transition: "transform .25s ease, background .2s", transform: open ? "rotate(45deg)" : "none", background: open ? "var(--a4-ink)" : "transparent" }}>
          <Icon name="plus" size={17} color={open ? "#fff" : "var(--a4-ink)"} />
        </span>
      </button>
      <div style={{ maxHeight: open ? (ref.current ? ref.current.scrollHeight + 8 : 400) : 0, overflow: "hidden", transition: "max-height .3s ease" }}>
        <p ref={ref} style={{ fontFamily: "var(--a4-font-body)", fontSize: 16.5, lineHeight: 1.6, color: "var(--a4-mute)", margin: "0 0 26px", maxWidth: 720, textWrap: "pretty" }}>{a}</p>
      </div>
    </div>
  );
}

export function FAQ() {
  const faqs = [
    { q: "Is A4 Services an accounting firm in Malta?", a: "Yes. A4 Services Limited is a Malta-based accounting and audit firm providing accounting, statutory audit, tax, VAT, payroll, fractional CFO and automated bookkeeping services for modern businesses." },
    { q: "Do you provide statutory audit services?", a: "Yes. We provide statutory audit and assurance services for companies in Malta, including audit preparation and coordination managed through the client portal." },
    { q: "How does the client portal work?", a: "You upload documents to one secure workspace. Our systems process, extract and match the information, and our team reviews, reconciles and finalises your records — with deadlines, requests and reports tracked in one place." },
    { q: "Can you take over bookkeeping that is behind?", a: "Yes. We regularly help businesses bring overdue bookkeeping up to date, then keep it current through automated monthly workflows reviewed by our team." },
    { q: "Do you support international or cross-border clients?", a: "Yes. As an independent member of BOKS International, we can support clients who require cross-border professional assistance." },
    { q: "What size businesses do you work with?", a: "From startups, freelancers and consultants to scaling companies, local and international trading businesses, regulated entities and high-net-worth individuals." },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section style={{ background: "var(--a4-canvas-light)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container style={{ display: "flex", gap: 64, flexWrap: "wrap", alignItems: "flex-start" }}>
        <Reveal style={{ flex: "1 1 320px", minWidth: 280, position: "sticky", top: 96 }}>
          <Eyebrow>FAQ</Eyebrow>
          <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "var(--a4-ink)", fontSize: "clamp(32px,4vw,48px)", lineHeight: 1.05, letterSpacing: "-.02em", margin: "18px 0 0", textWrap: "balance" }}>
            Frequently asked questions
          </h2>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 17, lineHeight: 1.55, color: "var(--a4-mute)", margin: "18px 0 28px", maxWidth: 340, textWrap: "pretty" }}>
            Answers about our services, processes and how we support your business in Malta.
          </p>
          <Button variant="outline-light" size="md">View all FAQs <Icon name="arrow-right" size={17} color="var(--a4-ink)" /></Button>
        </Reveal>
        <Reveal delay={100} style={{ flex: "1 1 520px", minWidth: 300 }}>
          <div style={{ borderTop: "1px solid var(--a4-hairline-light)" }}>
            {faqs.map((f, i) => (
              <FAQItem key={f.q} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

// export function Footer() { ... } — using site-wide Footer from layout
