"use client";

import React from "react";
import { Eyebrow, Icon, Container, SectionHead } from "@/components/a4-landing/Primitives";
import { DARK_CARD, LIGHT_GLOW, gradText } from "@/components/fx/primitives";

const INK = "#09090B";
const INDIGO = "#4F55F1";
const PERI = "#8B8FF7";
const BODY = "var(--a4x-body)";

/* Card hover from the design (indigo hairline + soft shadow, never a lift).
   !important because the cards carry their resting border inline. */
export const A4H_CARD_CSS = `
.a4h-card { transition: border-color .35s, box-shadow .35s; }
.a4h-card:hover { border-color: rgba(79,85,241,.45) !important; box-shadow: 0 24px 60px rgba(79,85,241,.12); }
.a4h-card.a4h-dark:hover { border-color: rgba(139,143,247,.45) !important; box-shadow: 0 24px 60px rgba(9,9,11,.28); }
`;

/**
 * The design's service card, for a grid of short features: "01 / 06" in the
 * corner, the icon opposite, the title low and the line under a hairline.
 * Dark cards alternate with light ones (`i % 2`), exactly as on the quotation.
 */
export function FeatureCard({ i, total, icon, title, body, d }: { i: number; total: number; icon?: string; title: React.ReactNode; body: React.ReactNode; d?: number }) {
  const dark = i % 2 === 1;
  return (
    <div
      data-fx="rise"
      data-d={d ?? (i % 3) * 80}
      className={dark ? "a4h-card a4h-dark" : "a4h-card"}
      style={{
        position: "relative", overflow: "hidden", minHeight: 300, padding: 28, borderRadius: 24,
        display: "flex", flexDirection: "column", gap: 14,
        background: dark ? DARK_CARD : "#FFFFFF",
        border: `1px solid ${dark ? "rgba(255,255,255,.06)" : "#E4E4E7"}`,
        color: dark ? "#FFFFFF" : INK,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontFamily: "var(--a4x-display)", fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: dark ? "#A1A1AA" : "#52525B" }}>
          <span style={{ color: dark ? PERI : INDIGO }}>{String(i + 1).padStart(2, "0")}</span>
          <span>/ {String(total).padStart(2, "0")}</span>
        </div>
        {icon ? <Icon name={icon} size={24} color={dark ? PERI : INDIGO} stroke={1.75} /> : null}
      </div>
      <div style={{ flex: 1, minHeight: 40 }} />
      <h3 style={{ margin: 0, fontFamily: "var(--a4x-display)", fontSize: "clamp(24px,2.1vw,30px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.12, textWrap: "balance" }}>{title}</h3>
      <p style={{ margin: 0, paddingTop: 16, borderTop: `1px solid ${dark ? "rgba(255,255,255,.1)" : "#E4E4E7"}`, fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}>{body}</p>
    </div>
  );
}

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
    <section data-sec="capabilities" style={{ position: "relative", background: LIGHT_GLOW, color: INK, padding: "clamp(100px,13vw,180px) 0" }}>
      <style>{A4H_CARD_CSS}</style>
      <Container>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "20px 64px" }}>
          <div style={{ maxWidth: 860, minWidth: 0 }}>
            <div data-fx="rise">
              <Eyebrow>Why A4</Eyebrow>
            </div>
            <h2 data-fx="rise" data-d="100" style={{ margin: "16px 0 0", fontFamily: "var(--a4x-display)", fontSize: "clamp(36px,4.6vw,72px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.04, color: INK, textWrap: "balance" }}>
              A Malta accounting &amp; audit firm<br className="a4-br" /> built around <span style={{ ...gradText, paddingBottom: ".06em" }}>your business</span>
            </h2>
          </div>
          <p data-fx="rise" data-d="200" style={{ margin: 0, maxWidth: 380, fontFamily: BODY, fontSize: 17, lineHeight: 1.55, color: "#52525B", textWrap: "pretty" }}>
            We do not just process numbers. We help businesses understand them, manage them, and use them to grow.
          </p>
        </div>
        <div style={{ marginTop: "clamp(48px,6vw,80px)", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: 16 }}>
          {items.map((it, i) => (
            <FeatureCard key={it.t} i={i} total={items.length} icon={it.icon} title={it.t} body={it.s} />
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
    <section style={{ position: "relative", background: LIGHT_GLOW, color: INK, padding: "clamp(100px,13vw,180px) 0" }}>
      <style>{A4H_CARD_CSS}</style>
      <Container>
        <SectionHead
          eyebrow="Client outcomes"
          title="What we help businesses achieve"
          sub="Strategic advantages designed for modern business scale."
          maxWidth={560}
        />
        <div style={{ marginTop: "clamp(48px,6vw,80px)", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
          {cards.map((c, i) => (
            <FeatureCard key={c.t} i={i} total={cards.length} title={c.t} body={c.s} d={(i % 4) * 80} />
          ))}
        </div>
        <p data-fx="rise" data-d="120" style={{ fontFamily: "var(--a4x-display)", fontSize: "clamp(19px,1.9vw,28px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.35, color: "#52525B", margin: "56px auto 0", maxWidth: 760, textAlign: "center", textWrap: "pretty" }}>
          Our goal is simple: to help you remain compliant, reduce financial administration, and make better business decisions.
        </p>
      </Container>
    </section>
  );
}
