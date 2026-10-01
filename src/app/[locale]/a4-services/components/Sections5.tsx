"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { Button, Eyebrow, Icon, Container } from "@/components/a4-landing/Primitives";
import { DARK_GRID, DriftGlow, TypeText, Words, gradText } from "@/components/fx/primitives";
import { getNextComplianceDeadline, formatComplianceDate } from "@/lib/compliance-deadlines";
import { SUPPORT_RESPONSE_LABEL } from "@/lib/site-config";
import { BOOK_A_CALL_PATH } from "@/lib/external-links";

const INK = "#09090B";
const INDIGO = "#4F55F1";
const PERI = "#8B8FF7";
const BODY = "var(--a4x-body)";

const dayCount = (a: Date, b: Date) => Math.max(0, Math.ceil((a.getTime() - b.getTime()) / 86400000));
const noopSubscribe = () => () => {};

/**
 * "When should you contact A4 Services?" — the design's dark acceptance band:
 * typewriter first line and gradient second line on the left, the card on the
 * right (here: the next statutory deadline, and the two ways to reach us).
 */
export function ContactCTA() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);
  const next = getNextComplianceDeadline(now);
  const days = dayCount(next.date, now);
  // The day count moves every day, and the page is cached (ISR) — render it on
  // the client only, so a cached page never hydrates with yesterday's number.
  const onClient = useSyncExternalStore(noopSubscribe, () => true, () => false);

  return (
    <section data-sec="contact-cta" style={{ position: "relative", overflow: "hidden", padding: "clamp(110px,14vw,190px) 0", color: "#FFFFFF", background: DARK_GRID, borderTop: "1px solid rgba(255,255,255,.08)" }}>
      <DriftGlow left="-10%" top="-20%" strength={0.26} />
      <Container style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))", gap: "56px 72px", alignItems: "center" }}>
        <div style={{ minWidth: 0 }}>
          <div data-fx="rise">
            <Eyebrow dark>Get started</Eyebrow>
          </div>
          <h2 style={{ margin: "20px 0 0", fontFamily: "var(--a4x-display)", fontSize: "clamp(42px,6vw,104px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.06, color: "#FFFFFF" }}>
            <span className="sr-only">When should you contact A4 Services?</span>
            <span aria-hidden="true" style={{ display: "block" }}>
              <TypeText as="span" segments={[{ t: "When should you contact", c: "#FFFFFF" }]} per={40} caret={PERI} style={{ display: "block" }} />
              <Words as="span" d={1020} style={{ display: "block", fontWeight: 600 }} parts={[{ t: "A4 Services?", g: true }]} />
            </span>
          </h2>
          <p data-fx="rise" data-d="700" style={{ margin: "28px 0 0", maxWidth: 620, fontFamily: "var(--a4x-display)", fontSize: "clamp(18px,1.6vw,22px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.45, color: "#A1A1AA", textWrap: "pretty" }}>
            Speak to us if you need an accounting firm in Malta, your company requires a statutory audit, your bookkeeping is behind, or you want better visibility over your business numbers.
          </p>
          <div data-fx="rise" data-d="820" style={{ marginTop: 28 }}>
            <span className="a4-chip a4-chip-dark">
              <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 999, background: PERI, boxShadow: "0 0 0 4px rgba(139,143,247,.18)" }} />
              {SUPPORT_RESPONSE_LABEL}
            </span>
          </div>
        </div>

        <div data-fx="rise" data-d="200" style={{ position: "relative", minWidth: 0, padding: "clamp(24px,3.4vw,40px)", borderRadius: 28, background: "rgba(24,24,27,.92)", border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 40px 100px rgba(0,0,0,.45)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", minHeight: 30 }}>
            <span style={{ fontFamily: BODY, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#A1A1AA" }}>Next up</span>
            {onClient ? <span style={{ height: 30, padding: "0 13px", display: "inline-flex", alignItems: "center", borderRadius: 999, background: "rgba(139,143,247,.18)", color: "#FFFFFF", fontFamily: "var(--a4x-display)", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
              {days === 1 ? "in 1 day" : `in ${days} days`}
            </span> : null}
          </div>
          <div style={{ marginTop: 16, fontFamily: "var(--a4x-display)", fontSize: "clamp(24px,2.2vw,30px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15 }}>{next.name}</div>
          <div style={{ marginTop: 6, fontFamily: "var(--a4x-display)", fontSize: "clamp(34px,3.6vw,52px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.1, paddingBottom: ".06em", ...gradText }}>
            {formatComplianceDate(next.date)}
          </div>
          <div style={{ height: 1, margin: "26px 0", background: "rgba(255,255,255,.1)" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Button variant="primary" size="lg" href="/contact" style={{ width: "100%" }}>Request information <Icon name="arrow-right" size={18} color={INK} /></Button>
            <Button variant="outline-dark" size="lg" href={BOOK_A_CALL_PATH} style={{ width: "100%" }}>Book a consultation</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function FAQItem({ q, a, open, onToggle, n, id }: { q: string; a: string; open: boolean; onToggle: () => void; n: string; id: string }) {
  return (
    <div style={{ borderTop: "1px solid #E4E4E7" }}>
      <button
        type="button"
        id={`${id}-q`}
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className="faq-q"
        style={{ width: "100%", display: "grid", gridTemplateColumns: "48px minmax(0, 1fr) 36px", alignItems: "center", gap: 12, background: "none", border: 0, cursor: "pointer", padding: "24px 0", textAlign: "left", color: INK }}
      >
        <span style={{ fontFamily: "var(--a4x-display)", fontSize: 16, fontWeight: 600, letterSpacing: ".02em", color: INDIGO }}>{n}</span>
        <span style={{ fontFamily: "var(--a4x-display)", fontWeight: 600, fontSize: "clamp(19px,1.7vw,24px)", letterSpacing: "-0.02em", lineHeight: 1.25 }}>{q}</span>
        <span aria-hidden="true" style={{ justifySelf: "end", width: 36, height: 36, borderRadius: 999, border: `1px solid ${open ? INK : "#E4E4E7"}`, background: open ? INK : "#FFFFFF", display: "grid", placeItems: "center", transition: "transform .45s cubic-bezier(.16,1,.3,1), background .3s, border-color .3s", transform: open ? "rotate(45deg)" : "none" }}>
          <Icon name="plus" size={17} color={open ? "#fff" : INK} />
        </span>
      </button>
      {/* Rows collapse to 0fr and open to 1fr — the height follows the text
          at any width, with no measuring. */}
      <div id={id} role="region" aria-labelledby={`${id}-q`} aria-hidden={!open} style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .45s cubic-bezier(.16,1,.3,1)" }}>
        <div style={{ minHeight: 0, overflow: "hidden" }}>
          <p className="faq-a" style={{ fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: "#3F3F46", margin: 0, padding: "0 48px 26px 60px", maxWidth: 760, textWrap: "pretty" }}>{a}</p>
        </div>
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
    <section data-sec="faq" style={{ position: "relative", background: "#FFFFFF", color: INK, padding: "clamp(100px,13vw,180px) 0" }}>
      <style>{`
        .faq-q:hover > span:nth-child(3) { border-color: #09090B !important; }
        .faq-q:focus-visible { outline: 3px solid rgba(79,85,241,.55); outline-offset: 4px; border-radius: 12px; }
        @media (max-width: 640px) { .faq-a { padding-left: 0 !important; padding-right: 0 !important; } }
      `}</style>
      {/* The design's "Terms & validity": eyebrow and a big two-line heading
          left (sticky where the columns sit side by side — stacked on mobile a
          stuck header would paint over the list), numbered rows right. */}
      <Container style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "56px 72px", alignItems: "start" }}>
        <div className="a4-faq-aside" style={{ minWidth: 0 }}>
          <div data-fx="rise">
            <Eyebrow>FAQ</Eyebrow>
          </div>
          <h2 style={{ margin: "18px 0 0", fontFamily: "var(--a4x-display)", fontSize: "clamp(40px,5.2vw,84px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.05, color: INK }}>
            <span data-fx="rise" data-d="100" style={{ display: "block" }}>Frequently asked</span>
            <span data-fx="rise" data-d="200" style={{ display: "block", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.1, paddingBottom: ".08em", ...gradText }}>questions</span>
          </h2>
          <p data-fx="rise" data-d="300" style={{ fontFamily: BODY, fontSize: 17, lineHeight: 1.55, color: "#52525B", margin: "22px 0 30px", maxWidth: 380, textWrap: "pretty" }}>
            Answers about our services, processes and how we support your business in Malta.
          </p>
          <div data-fx="rise" data-d="400">
            {/* Went nowhere before (no href) — /faq is the full list. */}
            <Button variant="outline-light" size="md" href="/faq">View all FAQs <Icon name="arrow-right" size={17} color={INK} /></Button>
          </div>
        </div>
        <div data-fx="rise" data-d="150" style={{ minWidth: 0, borderBottom: "1px solid #E4E4E7" }}>
          {faqs.map((f, i) => (
            <FAQItem key={f.q} n={String(i + 1).padStart(2, "0")} id={`faq-a-${i}`} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>
      </Container>
    </section>
  );
}

// export function Footer() { ... } — using site-wide Footer from layout
