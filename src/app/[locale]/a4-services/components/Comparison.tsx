// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Logo, Button, Pill, Badge, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";

export function Comparison() {
  const traditional = ["Manual document collection", "Long email chains", "Limited visibility", "Reactive communication", "Delayed reporting", "Disorganised records"];
  const a4 = ["Dedicated client portal", "Digital document workflows", "Automated bookkeeping options", "Clear deadline tracking", "Professional review", "Faster communication"];
  return (
    <section style={{ background: "var(--a4-surface-soft)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead
          align="center"
          eyebrow="A modern alternative"
          title={<>From traditional firms<br className="a4-br" /> to modern accounting</>}
          sub="Many businesses are used to accounting firms that work reactively. A4 Services is built differently — we combine professional expertise with modern systems."
          maxWidth={640}
        /></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginTop: 56 }}>
          {/* traditional */}
          <Reveal style={{ background: "var(--a4-canvas-light)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", padding: "clamp(28px,3vw,38px)" }}>
            <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--a4-stone)" }}>Traditional accounting firm</div>
            <div style={{ height: 1, background: "var(--a4-hairline-light)", margin: "22px 0" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {traditional.map((t) => (
                <div key={t} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ width: 22, height: 22, borderRadius: 999, background: "var(--a4-surface-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="x" size={13} color="var(--a4-stone)" stroke={2.4} /></span>
                  <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 15.5, color: "var(--a4-charcoal)" }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--a4-stone)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-full)", padding: "4px 11px" }}>Before</span>
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "var(--a4-mute)" }}>The old way of working</span>
              </div>
              <video src="/assets/before-clip.webm" autoPlay loop muted playsInline preload="metadata" style={{ display: "block", width: "100%", borderRadius: "var(--a4-r-md)", border: "1px solid var(--a4-hairline-light)" }} />
            </div>
          </Reveal>
          {/* a4 */}
          <Reveal delay={100} style={{ background: "#000", borderRadius: "var(--a4-r-lg)", padding: "clamp(28px,3vw,38px)", position: "relative", overflow: "hidden" }}>
            <div aria-hidden="true" style={{ position: "absolute", top: -40, right: -40, width: 220, height: 220, background: "radial-gradient(circle, rgba(73,79,223,.22), transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
              <Logo height={16} />
              <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "#fff" }}>A4 Services</span>
            </div>
            <div style={{ height: 1, background: "var(--a4-hairline-dark)", margin: "22px 0" }} />
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 16 }}>
              {a4.map((t) => (
                <div key={t} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ width: 22, height: 22, borderRadius: 999, background: "rgba(73,79,223,.18)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="check" size={13} color="var(--a4-primary-bright)" stroke={2.6} /></span>
                  <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 15.5, color: "var(--a4-on-dark)" }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ position: "relative", marginTop: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#fff", background: "var(--a4-primary)", borderRadius: "var(--a4-r-full)", padding: "4px 11px" }}>After</span>
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "var(--a4-on-dark-mute)" }}>The same work, with A4</span>
              </div>
              <video src="/assets/after-clip.webm" autoPlay loop muted playsInline preload="metadata" style={{ display: "block", width: "100%", borderRadius: "var(--a4-r-md)", border: "1px solid var(--a4-hairline-dark)" }} />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
