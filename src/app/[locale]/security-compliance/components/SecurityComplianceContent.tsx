"use client";

import React from "react";
import { Button, Icon } from "@/components/a4-landing/Primitives";
import { DARK_GRID, DriftGlow, LIGHT_GLOW, TypeText, Words } from "@/components/fx/primitives";
import { SECURITY_COMPLIANCE_BLOCKS } from "@/data/a4SecurityComplianceSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";
import { ProofFilm } from "@/components/film/chapters";

const SANS = "var(--a4x-display)";
const BODY = "var(--a4x-body)";
const INDIGO = "#4F55F1";
const PERI = "#8B8FF7";
const INK = "#09090B";
const SECTION_PAD = "clamp(100px,13vw,180px) clamp(20px,5vw,72px)";
const two = (n: number) => String(n).padStart(2, "0");

export function SecurityComplianceContent() {
  const href = useLocalizedHref();
  const total = SECURITY_COMPLIANCE_BLOCKS.length;

  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="Security & compliance"
        title="Your data, protected. Your standards, upheld."
        sub="Security and professional integrity aren't features — they're the foundation. Here's how A4 keeps your information safe and your engagements sound."
      />
      <ProofFilm />

      {/* Card grid: one card per control area, light and dark alternating */}
      <section style={{ position: "relative", padding: SECTION_PAD, background: LIGHT_GLOW, color: INK }}>
        <div className="cp-grid" style={{ maxWidth: 1280, margin: "0 auto" }}>
          {SECURITY_COMPLIANCE_BLOCKS.map((b, i) => {
            const dark = i % 2 === 1;
            return (
              <article
                key={b.t}
                data-fx="rise"
                data-d={(i % 3) * 80}
                className={`cp-card${dark ? " cp-dark" : ""}`}
                style={{ padding: 28, display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: dark ? "#A1A1AA" : "#52525B" }}>
                    <span style={{ color: dark ? PERI : INDIGO }}>{two(i + 1)}</span>
                    <span>/ {two(total)}</span>
                  </div>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      border: `1px solid ${dark ? "rgba(255,255,255,.14)" : "#E4E4E7"}`,
                      background: dark ? "rgba(255,255,255,.04)" : "#FAFAFA",
                    }}
                  >
                    <Icon name={b.icon} size={20} color={dark ? PERI : INDIGO} />
                  </span>
                </div>
                <h3 style={{ margin: "40px 0 0", fontFamily: SANS, fontSize: "clamp(26px,2.3vw,32px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.1, textWrap: "balance" }}>{b.t}</h3>
                <ul style={{ margin: "6px 0 0", padding: "16px 0 0", listStyle: "none", display: "flex", flexDirection: "column", gap: 10, borderTop: `1px solid ${dark ? "rgba(255,255,255,.1)" : "#E4E4E7"}` }}>
                  {b.p.map((x) => (
                    <li key={x} style={{ display: "flex", gap: 12, fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: dark ? "#D4D4D8" : "#3F3F46", textWrap: "pretty" }}>
                      <span className="a4-bullet" style={dark ? { background: PERI } : undefined} />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* Dark CTA */}
      <section style={{ position: "relative", overflow: "hidden", padding: SECTION_PAD, color: "#FFFFFF", background: DARK_GRID }}>
        <DriftGlow left="-10%" top="-20%" strength={0.26} />
        <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto" }}>
          <h2 style={{ margin: 0, fontFamily: SANS, fontSize: "clamp(44px,6.4vw,112px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.06 }}>
            <TypeText as="span" segments={[{ t: "Questions about", c: "#FFFFFF" }]} per={42} caret={PERI} style={{ display: "block" }} />
            <Words as="span" d={700} style={{ display: "block", fontWeight: 600 }} parts={[{ t: "security?", g: true }]} />
          </h2>
          <div style={{ marginTop: "clamp(36px,4vw,56px)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "24px 40px" }}>
            <p data-fx="rise" data-d="800" style={{ margin: 0, maxWidth: 560, fontFamily: SANS, fontSize: "clamp(18px,1.6vw,22px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.45, color: "#A1A1AA" }}>
              We&apos;re happy to walk your team through our controls in detail.
            </p>
            <div data-fx="rise" data-d="920">
              <Button variant="primary" size="lg" href={href("/contact")}>
                Talk to us <Icon name="arrow-right" size={18} color={INK} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ServicePortalBand serviceName="your data" />
    </div>
  );
}
