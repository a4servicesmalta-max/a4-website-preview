"use client";

import React from "react";
import { Button, Eyebrow, Icon, Container } from "@/components/a4-landing/Primitives";
import { DARK_CARD, LIGHT_GLOW, gradText } from "@/components/fx/primitives";
import { A4H_CARD_CSS, FeatureCard } from "./Sections2";
// (Bookkeeping tiers replaced by the interactive Pricing calculator — see Pricing.jsx)

const INK = "#09090B";
const PERI = "#8B8FF7";
const BODY = "var(--a4x-body)";

export function International() {
  const benefits = ["Professional advice from qualified experts", "Digital efficiency through one portal", "Cross-border support via BOKS International", "A move from reactive admin to structured management"];
  return (
    <section data-sec="international" style={{ position: "relative", background: LIGHT_GLOW, color: INK, padding: "clamp(100px,13vw,180px) 0" }}>
      <Container style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))", gap: "56px 72px", alignItems: "center" }}>
        <div style={{ minWidth: 0 }}>
          <div data-fx="rise">
            <Eyebrow>Local expertise · international reach</Eyebrow>
          </div>
          <h2 data-fx="rise" data-d="100" style={{ margin: "16px 0 0", fontFamily: "var(--a4x-display)", fontSize: "clamp(36px,4.6vw,72px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.04, color: INK, textWrap: "balance" }}>
            We combine professional advice with <span style={{ ...gradText, paddingBottom: ".06em" }}>digital efficiency.</span>
          </h2>
          <p data-fx="rise" data-d="200" style={{ margin: "22px 0 0", maxWidth: 540, fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: "#52525B", textWrap: "pretty" }}>
            A4 Services Limited is an independent member of BOKS International. Through this association, we support clients who require cross-border professional assistance — moving you from reactive finance administration to structured financial management.
          </p>
        </div>
        {/* The design's dark card, carrying the benefits as numbered rows. */}
        <div data-fx="rise" data-d="150" style={{ position: "relative", overflow: "hidden", minWidth: 0, borderRadius: 28, background: DARK_CARD, border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 50px 120px rgba(9,9,11,.18)", padding: "clamp(26px,3.4vw,44px)", color: "#FFFFFF" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ width: 52, height: 52, borderRadius: 14, background: "#FFFFFF", display: "grid", placeItems: "center", flexShrink: 0, overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/boks-logo.png" alt="BOKS International" style={{ width: 36, height: 36, display: "block" }} />
            </span>
            <span style={{ fontFamily: "var(--a4x-display)", fontSize: "clamp(20px,1.8vw,24px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.2 }}>BOKS International member</span>
          </div>
          <div style={{ marginTop: 28 }}>
            {benefits.map((b, i) => (
              <div key={b} style={{ display: "grid", gridTemplateColumns: "44px minmax(0, 1fr)", gap: 8, padding: "18px 0", borderTop: "1px solid rgba(255,255,255,.1)" }}>
                <span style={{ fontFamily: "var(--a4x-display)", fontSize: 16, fontWeight: 600, letterSpacing: ".02em", color: PERI }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.5, color: "#E4E4E7" }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
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
    <section data-sec="who-we-work-with" style={{ position: "relative", background: LIGHT_GLOW, color: INK, padding: "clamp(100px,13vw,180px) 0" }}>
      <style>{A4H_CARD_CSS}</style>
      <Container>
        <div style={{ maxWidth: 940 }}>
          <div data-fx="rise">
            <Eyebrow>Our clients</Eyebrow>
          </div>
          <h2 data-fx="rise" data-d="100" style={{ margin: "16px 0 0", fontFamily: "var(--a4x-display)", fontSize: "clamp(34px,4.4vw,68px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.05, color: INK, textWrap: "balance" }}>
            We support businesses operating in Malta — <span style={{ ...gradText, paddingBottom: ".06em" }}>across a wide range of sectors.</span>
          </h2>
          <p data-fx="rise" data-d="200" style={{ margin: "22px 0 0", maxWidth: 760, fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: "#52525B", textWrap: "pretty" }}>
            We understand the local compliance environment, reporting obligations, VAT requirements and practical challenges faced by businesses in Malta. Whether you are launching a new company, managing growth, or preparing for audit, A4 Services can support you.
          </p>
        </div>
        <div style={{ marginTop: "clamp(48px,6vw,80px)", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: 16 }}>
          {clients.map((c, i) => (
            <FeatureCard key={c.t} i={i} total={clients.length} icon={c.icon} title={c.t} body={c.s} d={i * 80} />
          ))}
        </div>
        <div data-fx="rise" style={{ marginTop: 40 }}>
          {/* Went nowhere before (no href) — a CTA that does nothing is breakage. */}
          <Button variant="dark" size="lg" href="/contact">Speak to our team <Icon name="arrow-right" size={18} color="#fff" /></Button>
        </div>
      </Container>
    </section>
  );
}
