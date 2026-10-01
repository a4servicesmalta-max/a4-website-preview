"use client";

import React, { useEffect, useRef } from "react";
import { Badge, Button, Eyebrow, Icon } from "@/components/a4-landing/Primitives";
import { DARK_CARD, DARK_GRID, LIGHT_GLOW, LetterWord, gradText } from "@/components/fx/primitives";
import { INK, PERI, gcol, prefersReducedMotion } from "@/lib/fx/engine";
import { CASE_STUDIES } from "@/data/a4CaseStudiesData";
import { DEDICATED_TEAM } from "@/data/a4TeamData";
import { TRUSTED_SECTORS } from "@/data/a4TestimonialsData";
import { TestimonialsSwiper } from "@/components/a4-landing/TestimonialsSwiper";

const SANS = "var(--a4x-display)";
const BODY = "var(--a4x-body)";

const KICKER: React.CSSProperties = {
  fontFamily: BODY,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "#71717A",
};

/** Card hover from the design: indigo hairline + soft indigo shadow, never a lift. */
const CARD_CSS = `
  .a4-hcs-card { transition: border-color .35s, box-shadow .35s; }
  .a4-hcs-card:hover { border-color: rgba(79,85,241,.45) !important; box-shadow: 0 24px 60px rgba(79,85,241,.12); }
  .a4-hcs-card[data-dark]:hover { border-color: rgba(139,143,247,.45) !important; box-shadow: 0 24px 60px rgba(9,9,11,.28); }
  .a4-hcs-link { color: inherit; text-decoration: none; transition: color .25s; }
  .a4-hcs-link:hover { color: #A1A1AA; }
`;

export function TrustBar() {
  const items: { label: string; href?: string }[] = [
    { label: "Malta Accountancy Board authorised" },
    { label: "BOKS International member" },
    { label: "GAPSME & IFRS" },
    { label: "Top 5 Firm in Malta — The Manifest 2026", href: "https://themanifest.com/mt/accounting/financial/firms" },
    { label: "Clutch Top Firms 2026", href: "https://clutch.co/mt/accounting" },
  ];

  const itemStyle: React.CSSProperties = { ...KICKER, letterSpacing: ".06em", textTransform: "none", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" };

  return (
    <div
      data-fx="rise"
      data-d="60"
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        columnGap: 12,
        rowGap: 6,
        marginTop: 24,
        maxWidth: 820,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <style>{CARD_CSS}</style>
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && (
            <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: 1, background: "#4F55F1", transform: "skewX(-30deg)", opacity: 0.8 }} />
          )}
          {item.href ? (
            <a href={item.href} target="_blank" rel="noopener noreferrer" className="a4-hcs-link" style={{ ...itemStyle, color: "#71717A" }}>
              {item.label}
            </a>
          ) : (
            <span style={itemStyle}>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/** Compact sector marquee — a quiet dark band between the heavier sections. */
export function TrustedSectorsBand() {
  const trackRef = useRef<HTMLDivElement>(null);
  const doubled = [...TRUSTED_SECTORS, ...TRUSTED_SECTORS];

  useEffect(() => {
    const el = trackRef.current;
    // A perpetual marquee is motion, not an entrance — it stands still for
    // people who asked for less of it.
    if (!el || prefersReducedMotion()) return;
    let x = 0;
    let raf = 0;
    const step = () => {
      x -= 0.35;
      if (x <= -el.scrollWidth / 2) x = 0;
      el.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      style={{
        position: "relative",
        background: "#09090B",
        padding: "26px clamp(20px,5vw,72px)",
        borderTop: "1px solid rgba(255,255,255,.08)",
        borderBottom: "1px solid rgba(255,255,255,.08)",
        overflow: "hidden",
        fontFamily: SANS,
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", gap: 24 }}>
        <span style={{ ...KICKER, flexShrink: 0 }}>Trusted across</span>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
            WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
          }}
        >
          <div ref={trackRef} style={{ display: "flex", gap: 10, width: "max-content", willChange: "transform" }}>
            {doubled.map((s, i) => (
              <span key={`${s}-${i}`} className="a4-chip a4-chip-dark" aria-hidden={i >= TRUSTED_SECTORS.length ? true : undefined} style={{ whiteSpace: "nowrap" }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  // Light on the homepage: it sits between the dark LinkedIn feed + sector
  // band and the dark insights section.
  return <TestimonialsSwiper variant="light" />;
}

/** @deprecated Use TrustedSectorsBand + TestimonialsSection separately */
export function SocialProof() {
  return (
    <>
      <TrustedSectorsBand />
      <TestimonialsSection />
    </>
  );
}

export function DedicatedTeam() {
  return (
    <section
      style={{ position: "relative", overflow: "hidden", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", color: "#FFFFFF", background: DARK_GRID, fontFamily: SANS }}
    >
      <style>{CARD_CSS}</style>
      <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 28 }}>
          <div style={{ maxWidth: 640 }}>
            <div data-fx="rise">
              <Eyebrow dark>Your dedicated team</Eyebrow>
            </div>
            <h2 data-fx="rise" data-d="100" style={{ margin: "16px 0 0", fontSize: "clamp(36px,4.6vw,72px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.03, textWrap: "balance" }}>
              Meet the qualified professionals behind the <span style={gradText}>portal</span>
            </h2>
            <p data-fx="rise" data-d="200" style={{ margin: "18px 0 0", fontFamily: BODY, fontSize: 17, lineHeight: 1.55, color: "#A1A1AA", textWrap: "pretty" }}>
              Regulated work is delivered by MIA-qualified accountants and a licensed audit firm — not anonymous support tickets.
            </p>
          </div>
          <div data-fx="rise" data-d="200">
            <Button variant="outline-dark" size="lg" href="/our-team">
              View our team <Icon name="arrow-right" size={17} color="#FFFFFF" />
            </Button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 16, marginTop: "clamp(40px,5vw,64px)" }}>
          {DEDICATED_TEAM.map((m, i) => {
            const light = i % 2 === 1;
            return (
              <div
                key={m.id}
                data-fx="rise"
                data-d={i * 80}
                data-dark={light ? undefined : ""}
                className="a4-hcs-card"
                style={{
                  borderRadius: 24,
                  padding: 28,
                  background: light ? "#FFFFFF" : DARK_CARD,
                  border: `1px solid ${light ? "#E4E4E7" : "rgba(255,255,255,.08)"}`,
                  color: light ? INK : "#FFFFFF",
                }}
              >
                <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: light ? "#52525B" : "#A1A1AA" }}>
                  <span style={{ color: light ? "#4F55F1" : PERI }}>{String(i + 1).padStart(2, "0")}</span> / {String(DEDICATED_TEAM.length).padStart(2, "0")}
                </div>
                <h3 style={{ margin: "28px 0 0", fontSize: 24, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15 }}>{m.name}</h3>
                <div style={{ marginTop: 8, fontSize: 15, fontWeight: 600, color: light ? "#4F55F1" : PERI }}>{m.title}</div>
                <div style={{ ...KICKER, marginTop: 10, color: light ? "#71717A" : "#A1A1AA" }}>{m.credentials}</div>
                <p style={{ margin: "14px 0 0", fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: light ? "#52525B" : "#A1A1AA", textWrap: "pretty" }}>{m.focus}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** One per-card letter effect each, in the design's order. */
const CASE_FX = ["scatter", "tighten", "cascade", "stack", "zoom", "type"] as const;

/** "Evidence, not claims" — the design's eyebrow + H2 head, then the alternating card grid. */
export function CaseStudiesTeaser() {
  const featured = CASE_STUDIES.slice(0, 3);
  const total = String(featured.length).padStart(2, "0");

  return (
    <section style={{ position: "relative", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", background: LIGHT_GLOW, color: INK, fontFamily: SANS }}>
      <style>{CARD_CSS}</style>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 28 }}>
          <div style={{ flex: "1 1 560px", maxWidth: 840 }}>
            <div data-fx="rise">
              <Eyebrow>Results</Eyebrow>
            </div>
            <h2 data-fx="rise" data-d="100" style={{ margin: "16px 0 0", fontSize: "clamp(40px,5.6vw,92px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.02 }}>
              <span style={{ ...gradText, paddingBottom: ".06em" }}>Evidence,</span> not claims
            </h2>
            <p data-fx="rise" data-d="200" style={{ margin: "20px 0 0", maxWidth: 520, fontFamily: BODY, fontSize: 17, lineHeight: 1.55, color: "#52525B", textWrap: "pretty" }}>
              Short stories from recent engagements — anonymised, with outcomes you can measure.
            </p>
          </div>
          <div data-fx="rise" data-d="200">
            <Button variant="dark" size="lg" href="/case-studies">
              View all case studies <Icon name="arrow-right" size={17} color="#FFFFFF" />
            </Button>
          </div>
        </div>

        <div style={{ marginTop: "clamp(40px,5vw,64px)", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: 16 }}>
          {featured.map((cs, i) => {
            const dark = i % 2 === 1;
            const letters = Array.from(cs.metric);
            const n = letters.length;
            const colors = letters.map((_, j) => (dark ? "#FFFFFF" : gcol(n > 1 ? j / (n - 1) : 0)));
            return (
              <article
                key={cs.id}
                data-fx="rise"
                data-d={i * 80}
                data-dark={dark ? "" : undefined}
                className="a4-hcs-card"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  minHeight: 460,
                  padding: 28,
                  borderRadius: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  background: dark ? DARK_CARD : "#FFFFFF",
                  border: `1px solid ${dark ? "rgba(255,255,255,.08)" : "#E4E4E7"}`,
                  color: dark ? "#FFFFFF" : INK,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: dark ? "#A1A1AA" : "#52525B" }}>
                    <span style={{ color: dark ? PERI : "#4F55F1" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span>/ {total}</span>
                  </div>
                  <Badge feature dark={dark}>
                    {cs.sector}
                  </Badge>
                </div>
                {/* The metric, its label and the story's hairline sit at the same
                    height on every card; any slack falls below the story. */}
                <div style={{ display: "flex", alignItems: "center", minHeight: 150 }}>
                  <LetterWord
                    text={cs.metric}
                    fx={CASE_FX[i % CASE_FX.length]}
                    d={220 + i * 90}
                    per={55}
                    colors={colors}
                    style={{ fontSize: "clamp(42px,4vw,60px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.1, whiteSpace: "nowrap" }}
                  />
                </div>
                <p style={{ margin: 0, fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.35, color: dark ? "#E4E4E7" : "#3F3F46", textWrap: "pretty" }}>
                  {cs.metricLabel}
                </p>
                <div style={{ marginTop: 6, paddingTop: 18, borderTop: `1px solid ${dark ? "rgba(255,255,255,.1)" : "#E4E4E7"}` }}>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.3, textWrap: "balance" }}>{cs.headline}</h3>
                  <p style={{ margin: "8px 0 0", fontFamily: BODY, fontSize: 14.5, lineHeight: 1.55, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}>{cs.result}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
