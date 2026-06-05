// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Logo, Button, Pill, Badge, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";

export function Capabilities() {
  const items = [
    { icon: "award", t: "Professional expertise", s: "Qualified accountants and auditors who know Malta's compliance environment inside out." },
    { icon: "workflow", t: "Technology-driven workflows", s: "Automated processing that removes manual document chasing, rekeying and delay." },
    { icon: "layout-dashboard", t: "Dedicated client portal", s: "One secure workspace for documents, deadlines, reports and communication." },
    { icon: "messages-square", t: "Clear communication", s: "Structured requests and updates — never scattered across email threads." },
    { icon: "globe", t: "International reach through BOKS", s: "Cross-border professional support through our BOKS International membership." },
    { icon: "git-branch", t: "Structured internal processes", s: "Defined processes and reviews so nothing slips between deadlines." },
  ];
  return (
    <section style={{ background: "var(--a4-canvas-light)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead
          eyebrow="Why A4"
          title={<>A Malta accounting &amp; audit firm<br className="a4-br" /> built around your business</>}
          sub="We do not just process numbers. We help businesses understand them, manage them, and use them to grow."
          maxWidth={620}
        /></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 1, marginTop: 56, background: "var(--a4-hairline-light)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", overflow: "hidden" }}>
          {items.map((it, i) => (
            <Reveal key={it.t} delay={(i % 3) * 80} style={{ background: "var(--a4-canvas-light)", padding: "clamp(26px,3vw,38px)" }}>
              <div style={{ width: 46, height: 46, borderRadius: "var(--a4-r-md)", background: "var(--a4-surface-soft)", display: "grid", placeItems: "center", marginBottom: 22 }}>
                <Icon name={it.icon} size={22} color="var(--a4-primary)" stroke={1.75} />
              </div>
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 21, color: "var(--a4-ink)", margin: 0, letterSpacing: "-.2px" }}>{it.t}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 15.5, lineHeight: 1.55, color: "var(--a4-mute)", margin: "10px 0 0", textWrap: "pretty" }}>{it.s}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function Outcomes() {
  const cards = [
    { n: "01", t: "Cleaner records", s: "Your financial documents, transactions and reports are kept organised and easier to review." },
    { n: "02", t: "Better compliance", s: "We help you manage accounting, audit, tax, VAT and payroll obligations more effectively." },
    { n: "03", t: "Less administration", s: "Our portal and automated workflows reduce manual document chasing and scattered communication." },
    { n: "04", t: "More control", s: "Visibility over pending items, deadlines, financial performance and compliance requirements." },
  ];
  return (
    <section style={{ background: "var(--a4-surface-soft)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead
          eyebrow="Client outcomes"
          title="What we help businesses achieve"
          sub="Strategic advantages designed for modern business scale."
          maxWidth={560}
        /></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 52 }}>
          {cards.map((c, i) => (
            <Reveal key={c.t} delay={(i % 4) * 70} style={{ background: "var(--a4-canvas-light)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", padding: "30px 28px", display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 15, color: "var(--a4-primary)", letterSpacing: ".06em" }}>{c.n}</div>
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 23, color: "var(--a4-ink)", margin: "16px 0 0", letterSpacing: "-.3px" }}>{c.t}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 15.5, lineHeight: 1.55, color: "var(--a4-mute)", margin: "10px 0 0", textWrap: "pretty" }}>{c.s}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120}>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 19, lineHeight: 1.6, color: "var(--a4-charcoal)", margin: "44px auto 0", maxWidth: 720, textAlign: "center", textWrap: "pretty" }}>
            Our goal is simple: to help you remain compliant, reduce financial administration, and make better business decisions.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
