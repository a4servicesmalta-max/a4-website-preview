// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Logo, Button, Pill, Badge, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
// size cards (a fixed-pricing tile, a tinted "always compliant" card with a
// filing-status snippet, a dark visibility card with a sparkline, and a
// "filed faster" confirmation tile). Light band, on-brand cobalt/teal.

export function FBChart() {
  // simple rising area sparkline (data-viz UI element)
  return (
    <svg viewBox="0 0 320 110" preserveAspectRatio="none" style={{ width: "100%", height: 110, display: "block" }}>
      <defs>
        <linearGradient id="fbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--a4-primary-bright)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--a4-primary-bright)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0,92 L30,86 L60,88 L90,72 L120,76 L150,58 L180,60 L210,40 L240,44 L270,24 L300,20 L320,12 L320,110 L0,110 Z" fill="url(#fbg)" />
      <path d="M0,92 L30,86 L60,88 L90,72 L120,76 L150,58 L180,60 L210,40 L240,44 L270,24 L300,20 L320,12" fill="none" stroke="var(--a4-primary-bright)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function FeatureBento() {
  const cardBase = { background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", padding: "clamp(24px,3vw,34px)" };
  const h3 = { fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: "clamp(21px,2.4vw,26px)", color: "var(--a4-ink)", letterSpacing: "-.3px", margin: 0 };
  const p = { fontFamily: "var(--a4-font-body)", fontSize: 15, lineHeight: 1.55, color: "var(--a4-mute)", margin: "10px 0 0", textWrap: "pretty" };

  return (
    <section style={{ background: "var(--a4-canvas-light)", padding: "clamp(64px,9vw,112px) 0" }}>
      <Container>
        <Reveal><SectionHead align="center" eyebrow="What you get" title="Everything your finances need" sub="One licensed firm, one portal — the tools and the team to keep your business compliant and clear." maxWidth={580} /></Reveal>

        <div style={{ marginTop: 52 }}>
          {/* row 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "0.92fr 1.5fr", gap: 20 }} className="fb-row">
            {/* fixed pricing */}
            <Reveal style={{ ...cardBase, display: "flex", flexDirection: "column" }}>
              <span style={{ width: 52, height: 52, borderRadius: "var(--a4-r-md)", background: "var(--a4-surface-soft)", display: "grid", placeItems: "center" }}><Icon name="badge-euro" size={26} color="var(--a4-primary)" stroke={1.75} /></span>
              <h3 style={{ ...h3, marginTop: 22 }}>Fixed monthly pricing</h3>
              <p style={p}>Know exactly what you'll pay. No hourly surprises, no hidden fees — just a clear fixed fee.</p>
              <div style={{ marginTop: "auto", paddingTop: 22, display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 40, color: "var(--a4-ink)", letterSpacing: "-1.5px" }}>€39</span>
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, color: "var(--a4-mute)" }}>/ mo software</span>
              </div>
            </Reveal>

            {/* always compliant (tinted + snippet) */}
            <Reveal delay={90} style={{ ...cardBase, background: "rgba(73,79,223,.05)", borderColor: "rgba(73,79,223,.16)", display: "flex", flexDirection: "column" }}>
              <h3 style={h3}>Always compliant</h3>
              <p style={{ ...p, maxWidth: 420 }}>Every VAT return, payroll submission and statutory filing tracked and filed on time, reviewed by our accountants.</p>
              <div style={{ marginTop: "auto", paddingTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                {[["VAT return · Q1 2026", "Filed"], ["FS5 payroll · May", "Filed"], ["MBR annual return", "Scheduled"]].map(([k, v], i) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "12px 14px" }}>
                    <span style={{ width: 30, height: 30, borderRadius: 999, background: i < 2 ? "rgba(0,168,126,.12)" : "var(--a4-surface-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <Icon name={i < 2 ? "check" : "clock"} size={15} color={i < 2 ? "var(--a4-accent-teal)" : "var(--a4-mute)"} stroke={2.4} />
                    </span>
                    <span style={{ flex: 1, fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, color: "var(--a4-ink)" }}>{k}</span>
                    <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, color: i < 2 ? "var(--a4-accent-teal)" : "var(--a4-mute)" }}>{v}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* row 2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 0.92fr", gap: 20, marginTop: 20 }} className="fb-row">
            {/* visibility (dark + chart) */}
            <Reveal style={{ background: "#000", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", padding: "clamp(24px,3vw,34px)", display: "flex", flexDirection: "column" }}>
              <h3 style={{ ...h3, color: "#fff" }}>Clear financial visibility</h3>
              <p style={{ ...p, color: "var(--a4-on-dark-mute)", maxWidth: 440 }}>Live monthly reporting through your portal — see exactly how your business is performing, whenever you want.</p>
              <div style={{ marginTop: "auto", paddingTop: 26 }}>
                <span style={{ display: "inline-block", fontFamily: "var(--a4-font-body)", fontSize: 10.5, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--a4-stone)", marginBottom: 10 }}>Illustrative example</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 30, color: "#fff", letterSpacing: "-1px", fontVariantNumeric: "tabular-nums" }}>€1,876,580</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, color: "var(--a4-accent-teal)" }}><Icon name="trending-up" size={14} color="var(--a4-accent-teal)" />+14%</span>
                </div>
                <FBChart />
              </div>
            </Reveal>

            {/* filed faster (snippet) */}
            <Reveal delay={90} style={{ ...cardBase, display: "flex", flexDirection: "column" }}>
              <h3 style={h3}>Get filed faster</h3>
              <p style={p}>Upload once and we handle the rest — most filings completed in days, not weeks.</p>
              <div style={{ marginTop: "auto", paddingTop: 22 }}>
                <div style={{ background: "var(--a4-surface-soft)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "18px 16px", textAlign: "center" }}>
                  <span style={{ width: 44, height: 44, borderRadius: 999, background: "rgba(0,168,126,.12)", display: "grid", placeItems: "center", margin: "0 auto" }}><Icon name="check" size={22} color="var(--a4-accent-teal)" stroke={2.6} /></span>
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, color: "var(--a4-ink)", marginTop: 12 }}>Return submitted</div>
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-mute)", marginTop: 2 }}>Confirmed with the CFR</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
