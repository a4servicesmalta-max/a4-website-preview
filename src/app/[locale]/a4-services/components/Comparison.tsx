"use client";

import React from "react";
import { Eyebrow, Icon, Container } from "@/components/a4-landing/Primitives";
import { A4Mark, DARK_CARD, DARK_GRID, DriftGlow, TypeText, Words } from "@/components/fx/primitives";

const PERI = "#8B8FF7";
const BODY = "var(--a4x-body)";
const DISPLAY = "var(--a4x-display)";

/**
 * "From traditional firms to modern accounting" — a statement head on the dark
 * grid, then the two ways of working side by side: the old one as a muted
 * glass card, A4 as the design's dark card with the indigo glow.
 */
export function Comparison() {
  const traditional = ["Manual document collection", "Long email chains", "Limited visibility", "Reactive communication", "Delayed reporting", "Disorganised records"];
  const a4 = ["Dedicated client portal", "Digital document workflows", "Automated bookkeeping options", "Clear deadline tracking", "Professional review", "Faster communication"];
  return (
    <section data-sec="comparison" style={{ position: "relative", overflow: "hidden", color: "#FFFFFF", background: DARK_GRID, padding: "clamp(100px,13vw,180px) 0" }}>
      <DriftGlow left="38%" top="-24%" strength={0.24} />
      <Container style={{ position: "relative" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", textAlign: "center" }}>
          <div data-fx="rise" style={{ display: "flex", justifyContent: "center" }}>
            <Eyebrow dark>A modern alternative</Eyebrow>
          </div>
          <h2 style={{ margin: "20px 0 0", fontFamily: DISPLAY, fontSize: "clamp(40px,6vw,104px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.06, color: "#FFFFFF" }}>
            <span className="sr-only">From traditional firms to modern accounting</span>
            <span aria-hidden="true" style={{ display: "block" }}>
              <TypeText as="span" segments={[{ t: "From traditional firms", c: "#FFFFFF" }]} per={36} caret={PERI} style={{ display: "inline-block" }} />
              <Words as="span" d={880} style={{ display: "block", fontWeight: 600 }} parts={[{ t: "to modern" }, { t: "accounting", g: true }]} />
            </span>
          </h2>
          <p data-fx="rise" data-d="600" style={{ margin: "28px auto 0", maxWidth: 700, fontFamily: DISPLAY, fontSize: "clamp(18px,1.6vw,22px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.45, color: "#A1A1AA", textWrap: "pretty" }}>
            Many businesses are used to accounting firms that work reactively. A4 Services is built differently — we combine professional expertise with modern systems.
          </p>
        </div>

        <div style={{ marginTop: "clamp(56px,7vw,96px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 16 }}>
          {/* traditional */}
          <div data-fx="rise" style={{ minWidth: 0, borderRadius: 28, padding: "clamp(24px,3vw,36px)", background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.1)" }}>
            <div style={{ display: "flex", alignItems: "center", minHeight: 26, fontFamily: BODY, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#A1A1AA" }}>Traditional accounting firm</div>
            <div style={{ marginTop: 22 }}>
              {traditional.map((t) => (
                <div key={t} style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 0", borderTop: "1px solid rgba(255,255,255,.08)" }}>
                  <span style={{ width: 24, height: 24, borderRadius: 999, border: "1px solid rgba(255,255,255,.14)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="x" size={12} color="#71717A" stroke={2.4} /></span>
                  <span style={{ fontFamily: BODY, fontSize: 16, color: "#A1A1AA" }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 26 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ height: 28, padding: "0 12px", display: "inline-flex", alignItems: "center", borderRadius: 999, border: "1px solid rgba(255,255,255,.14)", fontFamily: DISPLAY, fontSize: 13, fontWeight: 600, color: "#A1A1AA" }}>Before</span>
                <span style={{ fontFamily: BODY, fontSize: 14, color: "#71717A" }}>The old way of working</span>
              </div>
              <video src="/assets/before-clip.webm" autoPlay loop muted playsInline preload="metadata" style={{ display: "block", width: "100%", borderRadius: 16, border: "1px solid rgba(255,255,255,.08)", opacity: 0.85 }} />
            </div>
          </div>
          {/* a4 */}
          <div data-fx="rise" data-d="100" style={{ position: "relative", overflow: "hidden", minWidth: 0, borderRadius: 28, padding: "clamp(24px,3vw,36px)", background: DARK_CARD, border: "1px solid rgba(139,143,247,.45)", boxShadow: "0 40px 100px rgba(0,0,0,.45)" }}>
            <div style={{ display: "flex", alignItems: "center", minHeight: 26 }}>
              <A4Mark size={22} />
              <span aria-hidden="true" style={{ width: 1.5, height: 18, margin: "0 10px", background: "#FFFFFF", opacity: 0.35 }} />
              <span style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 500, letterSpacing: "-0.02em" }}>A4 Services</span>
            </div>
            <div style={{ marginTop: 22 }}>
              {a4.map((t) => (
                <div key={t} style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 0", borderTop: "1px solid rgba(255,255,255,.1)" }}>
                  <span style={{ width: 24, height: 24, borderRadius: 999, background: "rgba(139,143,247,.18)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="check" size={13} color={PERI} stroke={2.6} /></span>
                  <span style={{ fontFamily: BODY, fontSize: 16, color: "#FFFFFF" }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 26 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ height: 28, padding: "0 12px", display: "inline-flex", alignItems: "center", borderRadius: 999, background: "#4F55F1", fontFamily: DISPLAY, fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>After</span>
                <span style={{ fontFamily: BODY, fontSize: 14, color: "#A1A1AA" }}>The same work, with A4</span>
              </div>
              <video src="/assets/after-clip.webm" autoPlay loop muted playsInline preload="metadata" style={{ display: "block", width: "100%", borderRadius: 16, border: "1px solid rgba(255,255,255,.1)" }} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
