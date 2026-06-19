// @ts-nocheck
"use client";

import React, { useEffect, useRef } from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Button, Container, Eyebrow, Icon, Reveal, SectionHead } from "@/components/a4-landing/Primitives";
import { CASE_STUDIES } from "@/data/a4CaseStudiesData";
import { DEDICATED_TEAM } from "@/data/a4TeamData";
import { TRUSTED_SECTORS } from "@/data/a4TestimonialsData";
import { TestimonialsSwiper } from "@/components/a4-landing/TestimonialsSwiper";

export function TrustBar() {
  const items = [
    { label: "Authorised by the Malta Accountancy Board", icon: "badge-check" },
    { label: "BOKS International member", icon: "globe", logo: "/assets/boks-logo.png" },
    { label: "GAPSME & IFRS", icon: "scale" },
  ];

  return (
    <Reveal delay={60}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px 14px",
          marginTop: 28,
          maxWidth: 920,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {items.map((item) => (
          <span
            key={item.label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--a4-font-body)",
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--a4-on-dark-mute)",
              border: "1px solid var(--a4-hairline-dark)",
              borderRadius: 999,
              padding: "8px 14px",
              background: "rgba(255,255,255,.04)",
            }}
          >
            {item.logo ? (
              <img src={item.logo} alt="" width={18} height={18} style={{ display: "block", borderRadius: 4 }} />
            ) : (
              <Icon name={item.icon} size={15} color="var(--a4-primary-bright)" stroke={2} />
            )}
            {item.label}
          </span>
        ))}
      </div>
    </Reveal>
  );
}

/** Compact sector marquee — sits mid-page without heavy quote cards */
export function TrustedSectorsBand() {
  const trackRef = useRef(null);
  const doubled = [...TRUSTED_SECTORS, ...TRUSTED_SECTORS];

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let x = 0;
    let raf;
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
        background: "#000",
        padding: "28px 0",
        borderTop: "1px solid var(--a4-hairline-dark)",
        borderBottom: "1px solid var(--a4-hairline-dark)",
        overflow: "hidden",
      }}
    >
      <Container>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span
            style={{
              flexShrink: 0,
              fontFamily: "var(--a4-font-body)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--a4-stone)",
            }}
          >
            Trusted across
          </span>
          <div style={{ flex: 1, overflow: "hidden", maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" }}>
            <div ref={trackRef} style={{ display: "flex", gap: 12, width: "max-content", willChange: "transform" }}>
              {doubled.map((s, i) => (
                <span
                  key={`${s}-${i}`}
                  style={{
                    fontFamily: "var(--a4-font-display)",
                    fontWeight: 500,
                    fontSize: 15,
                    color: "var(--a4-on-dark-mute)",
                    border: "1px solid var(--a4-hairline-dark)",
                    borderRadius: 999,
                    padding: "8px 18px",
                    whiteSpace: "nowrap",
                    background: "rgba(255,255,255,.03)",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function TestimonialsSection() {
  return <TestimonialsSwiper variant="dark" />;
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
    <section style={{ background: "#000", padding: "clamp(56px,8vw,96px) 0", borderTop: "1px solid var(--a4-hairline-dark)" }}>
      <Container>
        <Reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
          <div style={{ maxWidth: 560 }}>
            <Eyebrow dark>Your dedicated team</Eyebrow>
            <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "#fff", fontSize: "clamp(30px,4vw,48px)", lineHeight: 1.05, letterSpacing: "-.02em", margin: "16px 0 0", textWrap: "balance" }}>
              Meet the qualified professionals behind the portal
            </h2>
            <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 17, lineHeight: 1.55, color: "var(--a4-on-dark-mute)", margin: "14px 0 0", textWrap: "pretty" }}>
              Regulated work is delivered by MIA-qualified accountants and a licensed audit firm — not anonymous support tickets.
            </p>
          </div>
          <LocalizedLink href="/our-team">
            <Button variant="outline-dark" size="md">View our team <Icon name="arrow-right" size={16} color="#fff" /></Button>
          </LocalizedLink>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 44 }}>
          {DEDICATED_TEAM.map((m, i) => (
            <Reveal
              key={m.id}
              delay={i * 80}
              style={{
                background: i === 1 ? "rgba(73,79,223,.12)" : "var(--a4-surface-elevated)",
                border: `1px solid ${i === 1 ? "rgba(73,79,223,.35)" : "var(--a4-hairline-dark)"}`,
                borderRadius: "var(--a4-r-lg)",
                padding: "28px 24px",
                transform: i === 1 ? "scale(1.02)" : undefined,
              }}
            >
              <span style={{ width: 48, height: 48, borderRadius: "var(--a4-r-md)", background: "rgba(73,79,223,.16)", display: "grid", placeItems: "center" }}>
                <Icon name="user-round" size={24} color="var(--a4-primary-bright)" stroke={1.75} />
              </span>
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 20, color: "#fff", margin: "18px 0 0", letterSpacing: "-.2px" }}>{m.name}</h3>
              <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, color: "var(--a4-primary-bright)", marginTop: 6 }}>{m.title}</div>
              <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--a4-stone)", marginTop: 8 }}>{m.credentials}</div>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, lineHeight: 1.55, color: "var(--a4-on-dark-mute)", margin: "12px 0 0", textWrap: "pretty" }}>{m.focus}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function CaseStudiesTeaser() {
  const featured = CASE_STUDIES.slice(0, 3);

  return (
    <section style={{ background: "var(--a4-canvas-light)", padding: "clamp(56px,8vw,96px) 0" }}>
      <Container>
        <Reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
          <SectionHead align="left" eyebrow="Results" title="Evidence, not claims" sub="Short stories from recent engagements — anonymised, with outcomes you can measure." maxWidth={520} />
          <LocalizedLink href="/case-studies">
            <Button variant="dark" size="md">View all case studies <Icon name="arrow-right" size={16} color="#fff" /></Button>
          </LocalizedLink>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 16, marginTop: 40 }} className="max-[900px]:!grid-cols-1">
          {featured.map((cs, i) => (
            <Reveal
              key={cs.id}
              delay={i * 90}
              style={{
                background: i === 0 ? "#000" : "var(--a4-surface-card)",
                border: `1px solid ${i === 0 ? "var(--a4-hairline-dark)" : "var(--a4-hairline-light)"}`,
                borderRadius: "var(--a4-r-lg)",
                padding: i === 0 ? "32px 28px" : "26px 22px",
                display: "flex",
                flexDirection: "column",
                gridRow: i === 0 ? "span 1" : undefined,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--a4-font-body)",
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: i === 0 ? "var(--a4-primary-bright)" : "var(--a4-primary)",
                }}
              >
                {cs.sector}
              </div>
              <h3
                style={{
                  fontFamily: "var(--a4-font-display)",
                  fontWeight: 500,
                  fontSize: i === 0 ? 24 : 19,
                  color: i === 0 ? "#fff" : "var(--a4-ink)",
                  margin: "12px 0 0",
                  lineHeight: 1.2,
                  textWrap: "balance",
                }}
              >
                {cs.headline}
              </h3>
              {i === 0 && (
                <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, lineHeight: 1.55, color: "var(--a4-on-dark-mute)", margin: "12px 0 0", flex: 1, textWrap: "pretty" }}>
                  {cs.result}
                </p>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  marginTop: 20,
                  paddingTop: i === 0 ? 18 : 14,
                  borderTop: `1px solid ${i === 0 ? "var(--a4-hairline-dark)" : "var(--a4-hairline-light)"}`,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--a4-font-display)",
                    fontWeight: 500,
                    fontSize: i === 0 ? 36 : 28,
                    color: i === 0 ? "#fff" : "var(--a4-ink)",
                    letterSpacing: "-1px",
                  }}
                >
                  {cs.metric}
                </span>
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: i === 0 ? "var(--a4-stone)" : "var(--a4-mute)" }}>
                  {cs.metricLabel}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
