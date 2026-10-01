"use client";

import React from "react";
import { Eyebrow, Icon } from "@/components/a4-landing/Primitives";
import { DARK_CARD, LIGHT_GLOW, gradText } from "@/components/fx/primitives";
import { INDIGO, INK, PERI } from "@/lib/fx/engine";
import { BOOKKEEPING_COMPANY, BOOKKEEPING_FROM } from "@/data/a4QuotePack";
import { PortalFilm } from "@/components/film/chapters";

// "What you get" bento in the A4 design language: four 24px cards on a light
// glow, alternating white and dark grid cards — a published-pricing tile, an
// "always compliant" card with a filing-status snippet, a visibility card with
// a sparkline, and a "filed faster" confirmation tile.
//
// The pricing tile shows "from" prices: bookkeeping is set by monthly expenses
// across nine bands, plus volume and additional bank accounts (pack
// mt-2026-08-27-entry — the first account is included), so €24/€49 are the
// entry band with one account, not a flat fee. Figures come from
// src/data/a4QuotePack.ts.

const BODY = "var(--a4x-body)";

export function FBChart() {
  // simple rising area sparkline (data-viz UI element)
  return (
    <svg viewBox="0 0 320 110" preserveAspectRatio="none" style={{ width: "100%", height: 110, display: "block" }} aria-hidden="true">
      <defs>
        <linearGradient id="fbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PERI} stopOpacity="0.34" />
          <stop offset="100%" stopColor={PERI} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="fbs" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={INDIGO} />
          <stop offset="55%" stopColor="#6468F3" />
          <stop offset="100%" stopColor={PERI} />
        </linearGradient>
      </defs>
      <path d="M0,92 L30,86 L60,88 L90,72 L120,76 L150,58 L180,60 L210,40 L240,44 L270,24 L300,20 L320,12 L320,110 L0,110 Z" fill="url(#fbg)" />
      <path
        d="M0,92 L30,86 L60,88 L90,72 L120,76 L150,58 L180,60 L210,40 L240,44 L270,24 L300,20 L320,12"
        fill="none"
        stroke="url(#fbs)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

const BENTO_CSS = `
  .a4-fb-card { transition: border-color .35s, box-shadow .35s; }
  .a4-fb-card:hover { border-color: rgba(79,85,241,.45) !important; box-shadow: 0 24px 60px rgba(79,85,241,.12); }
  .a4-fb-card[data-dark]:hover { border-color: rgba(139,143,247,.45) !important; box-shadow: 0 24px 60px rgba(9,9,11,.28); }
`;

function CardNo({ i, dark }: { i: number; dark?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: dark ? "#A1A1AA" : "#52525B" }}>
      <span style={{ color: dark ? PERI : INDIGO }}>{String(i).padStart(2, "0")}</span>
      <span>/ 04</span>
    </div>
  );
}

export function FeatureBento() {
  const card = (dark: boolean): React.CSSProperties => ({
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    borderRadius: 24,
    padding: "clamp(24px,2.6vw,32px)",
    background: dark ? DARK_CARD : "#FFFFFF",
    border: `1px solid ${dark ? "rgba(255,255,255,.08)" : "#E4E4E7"}`,
    color: dark ? "#FFFFFF" : INK,
  });
  const h3: React.CSSProperties = { margin: "26px 0 0", fontSize: "clamp(24px,2.4vw,30px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.12 };
  const p = (dark: boolean): React.CSSProperties => ({
    margin: "12px 0 0",
    fontFamily: BODY,
    fontSize: 16,
    lineHeight: 1.55,
    color: dark ? "#A1A1AA" : "#52525B",
    textWrap: "pretty",
  });

  return (
    <>
      <PortalFilm />
      <section style={{ position: "relative", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", background: LIGHT_GLOW, color: INK, fontFamily: "var(--a4x-display)" }}>
        <style>{BENTO_CSS}</style>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ maxWidth: 720 }}>
            <div data-fx="rise">
              <Eyebrow>What you get</Eyebrow>
            </div>
            <h2 data-fx="rise" data-d="100" style={{ margin: "16px 0 0", fontSize: "clamp(40px,5.6vw,92px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.02, textWrap: "balance" }}>
              Everything your finances <span style={{ ...gradText, paddingBottom: ".06em" }}>need</span>
            </h2>
            <p data-fx="rise" data-d="200" style={{ margin: "20px 0 0", maxWidth: 560, fontFamily: BODY, fontSize: 17, lineHeight: 1.55, color: "#52525B", textWrap: "pretty" }}>
              One licensed firm, one portal — the tools and the team to keep your business compliant and clear.
            </p>
          </div>

          <div style={{ marginTop: "clamp(40px,5vw,64px)" }}>
            {/* row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "0.92fr 1.5fr", gap: 16 }} className="fb-row">
              {/* published pricing */}
              <div data-fx="rise" className="a4-fb-card" style={card(false)}>
                <CardNo i={1} />
                <h3 style={h3}>Published monthly pricing</h3>
                <p style={p(false)}>
                  Know exactly what you&apos;ll pay. No hourly surprises, no hidden fees — one monthly price, set by what your business spends each month.
                </p>
                <div style={{ marginTop: "auto", paddingTop: 22 }}>
                  <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "4px 8px", paddingTop: 18, borderTop: "1px solid #E4E4E7" }}>
                    <span style={{ fontFamily: BODY, fontSize: 16, fontWeight: 500, color: "#52525B" }}>from</span>
                    <span style={{ fontSize: "clamp(44px,4.4vw,60px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1, paddingBottom: ".04em", ...gradText }}>
                      €{BOOKKEEPING_FROM}
                    </span>
                    <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: "#52525B" }}>
                      / mo self-employed · from €{BOOKKEEPING_COMPANY} company
                    </span>
                  </div>
                </div>
              </div>

              {/* always compliant (dark + filing-status snippet) */}
              <div data-fx="rise" data-d="90" data-dark="" className="a4-fb-card" style={card(true)}>
                <CardNo i={2} dark />
                <h3 style={h3}>Always compliant</h3>
                <p style={{ ...p(true), maxWidth: 440 }}>
                  Every VAT return, payroll submission and statutory filing tracked and filed on time, reviewed by our accountants.
                </p>
                <div style={{ marginTop: "auto", paddingTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    ["VAT return · Q1 2026", "Filed"],
                    ["FS5 payroll · May", "Filed"],
                    ["MBR annual return", "Scheduled"],
                  ].map(([k, v], i) => {
                    const done = i < 2;
                    return (
                      <div
                        key={k}
                        style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "12px 14px" }}
                      >
                        <span
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 999,
                            background: done ? "rgba(139,143,247,.18)" : "rgba(255,255,255,.06)",
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon name={done ? "check" : "clock"} size={15} color={done ? PERI : "#A1A1AA"} stroke={2.4} />
                        </span>
                        <span style={{ flex: 1, fontSize: 15, fontWeight: 500, letterSpacing: "-0.01em" }}>{k}</span>
                        <span
                          style={{
                            height: 28,
                            padding: "0 12px",
                            display: "inline-flex",
                            alignItems: "center",
                            borderRadius: 999,
                            fontSize: 13,
                            fontWeight: 600,
                            background: done ? "rgba(139,143,247,.18)" : "transparent",
                            border: `1px solid ${done ? "transparent" : "rgba(255,255,255,.18)"}`,
                            color: done ? "#FFFFFF" : "#A1A1AA",
                          }}
                        >
                          {v}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 0.92fr", gap: 16, marginTop: 16 }} className="fb-row">
              {/* visibility (dark + chart) */}
              <div data-fx="rise" data-dark="" className="a4-fb-card" style={card(true)}>
                <CardNo i={3} dark />
                <h3 style={h3}>Clear financial visibility</h3>
                <p style={{ ...p(true), maxWidth: 440 }}>Live monthly reporting through your portal — see exactly how your business is performing, whenever you want.</p>
                <div style={{ marginTop: "auto", paddingTop: 26 }}>
                  <span style={{ display: "inline-block", fontFamily: BODY, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#A1A1AA", marginBottom: 10 }}>
                    Illustrative example
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: "clamp(30px,3vw,40px)", fontWeight: 600, letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums" }}>€1,876,580</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 14, fontWeight: 600, color: PERI }}>
                      <Icon name="trending-up" size={15} color={PERI} />
                      +14%
                    </span>
                  </div>
                  <FBChart />
                </div>
              </div>

              {/* filed faster (snippet) */}
              <div data-fx="rise" data-d="90" className="a4-fb-card" style={card(false)}>
                <CardNo i={4} />
                <h3 style={h3}>Get filed faster</h3>
                <p style={p(false)}>Upload once and we handle the rest — most filings completed in days, not weeks.</p>
                <div style={{ marginTop: "auto", paddingTop: 22 }}>
                  <div style={{ background: "#FAFAFA", border: "1px solid #E4E4E7", borderRadius: 18, padding: "20px 16px", textAlign: "center" }}>
                    <span style={{ width: 46, height: 46, borderRadius: 999, background: "rgba(79,85,241,.1)", display: "grid", placeItems: "center", margin: "0 auto" }}>
                      <Icon name="check" size={22} color={INDIGO} stroke={2.6} />
                    </span>
                    <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", marginTop: 12 }}>Return submitted</div>
                    <div style={{ fontFamily: BODY, fontSize: 13.5, color: "#71717A", marginTop: 3 }}>Confirmed with the CFR</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
