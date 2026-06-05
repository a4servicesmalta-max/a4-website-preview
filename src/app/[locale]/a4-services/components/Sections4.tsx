// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Logo, Button, Pill, Badge, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
// (Bookkeeping tiers replaced by the interactive Pricing calculator — see Pricing.jsx)

export function International() {
  const benefits = ["Professional advice from qualified experts", "Digital efficiency through one portal", "Cross-border support via BOKS International", "A move from reactive admin to structured management"];
  return (
    <section style={{ background: "var(--a4-canvas-light)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container style={{ display: "flex", gap: 64, flexWrap: "wrap", alignItems: "center" }}>
        <Reveal style={{ flex: "1 1 420px", minWidth: 300 }}>
          <Eyebrow>Local expertise · international reach</Eyebrow>
          <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "var(--a4-ink)", fontSize: "clamp(30px,3.8vw,46px)", lineHeight: 1.08, letterSpacing: "-.02em", margin: "18px 0 0", textWrap: "balance" }}>
            We combine professional advice with digital efficiency.
          </h2>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 17.5, lineHeight: 1.6, color: "var(--a4-mute)", margin: "20px 0 0", maxWidth: 460, textWrap: "pretty" }}>
            A4 Services Limited is an independent member of BOKS International. Through this association, we support clients who require cross-border professional assistance — moving you from reactive finance administration to structured financial management.
          </p>
        </Reveal>
        <Reveal delay={120} style={{ flex: "1 1 360px", minWidth: 300 }}>
          <div style={{ background: "var(--a4-canvas-dark)", borderRadius: "var(--a4-r-lg)", padding: "clamp(28px,3vw,40px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 22 }}>
              <span style={{ width: 46, height: 46, borderRadius: "var(--a4-r-md)", background: "#fff", display: "grid", placeItems: "center", flexShrink: 0, overflow: "hidden" }}>
                <img src="/assets/boks-logo.png" alt="BOKS International" style={{ width: 32, height: 32, display: "block" }} />
              </span>
              <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 18, color: "#fff" }}>BOKS International member</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {benefits.map((b) => (
                <div key={b} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <Icon name="check" size={17} color="var(--a4-accent-teal)" stroke={2.4} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 15, lineHeight: 1.45, color: "var(--a4-on-dark)" }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export function WhoWeWorkWith() {
  const clients = [
    { icon: "rocket", t: "Startups & growing companies", s: "From first incorporation through scale-up and funding." },
    { icon: "globe", t: "Local & international trading businesses", s: "Cross-border trade, VAT and multi-entity reporting." },
    { icon: "landmark", t: "Regulated entities & HNW individuals", s: "Statutory audit, compliance and private structures." },
  ];
  return (
    <section style={{ background: "var(--a4-canvas-light)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal style={{ maxWidth: 720 }}>
          <Eyebrow>Our clients</Eyebrow>
          <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "var(--a4-ink)", fontSize: "clamp(30px,4vw,48px)", lineHeight: 1.05, letterSpacing: "-.02em", margin: "18px 0 0", textWrap: "balance" }}>
            We support businesses operating in Malta — across a wide range of sectors.
          </h2>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 17.5, lineHeight: 1.6, color: "var(--a4-mute)", margin: "20px 0 0", textWrap: "pretty" }}>
            We understand the local compliance environment, reporting obligations, VAT requirements and practical challenges faced by businesses in Malta. Whether you are launching a new company, managing growth, or preparing for audit, A4 Services can support you.
          </p>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 48 }}>
          {clients.map((c, i) => (
            <Reveal key={c.t} delay={i * 80} style={{ background: "var(--a4-canvas-light)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", padding: "30px 28px" }}>
              <Icon name={c.icon} size={26} color="var(--a4-primary)" />
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 20, color: "var(--a4-ink)", margin: "20px 0 0", letterSpacing: "-.2px" }}>{c.t}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 15, lineHeight: 1.5, color: "var(--a4-mute)", margin: "9px 0 0", textWrap: "pretty" }}>{c.s}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={120} style={{ marginTop: 40 }}>
          <Button variant="dark" size="lg">Speak to our team <Icon name="arrow-right" size={18} color="#fff" /></Button>
        </Reveal>
      </Container>
    </section>
  );
}
