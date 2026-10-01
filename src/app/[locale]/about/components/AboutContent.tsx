"use client";

import React from "react";
import { Button, Icon, SectionHead } from "@/components/a4-landing/Primitives";
import { DARK_GRID, DriftGlow, LIGHT_GLOW, MUTED_GLOW, SweepSlab, TypeText, Words, gradText } from "@/components/fx/primitives";
import { ABOUT_GET, ABOUT_OUTCOMES, ABOUT_PILLARS, ABOUT_WHO } from "@/data/a4AboutSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";
import { CloseFilm } from "@/components/film/chapters";

const SANS = "var(--a4x-display)";
const BODY = "var(--a4x-body)";
const INDIGO = "#4F55F1";
const PERI = "#8B8FF7";
const INK = "#09090B";
const SECTION_PAD = "clamp(100px,13vw,180px) clamp(20px,5vw,72px)";

const two = (n: number) => String(n).padStart(2, "0");

/** "01 / 04" on the left, the item's icon in a ring on the right — the design's card header. */
function CardHead({ i, total, icon, dark }: { i: number; total: number; icon: string; dark: boolean }) {
  return (
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
          flexShrink: 0,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          border: `1px solid ${dark ? "rgba(255,255,255,.14)" : "#E4E4E7"}`,
          background: dark ? "rgba(255,255,255,.04)" : "#FAFAFA",
        }}
      >
        <Icon name={icon} size={20} color={dark ? PERI : INDIGO} />
      </span>
    </div>
  );
}

export function AboutContent() {
  const href = useLocalizedHref();

  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="About A4"
        title="A modern accounting, audit and corporate services firm"
        sub="A4 is a firm — not software, and not a marketplace. We do the work for you, supported by a secure, structured client portal that keeps everything visible and on track."
      />
      <CloseFilm />

      {/* Pillars — 2×2 card grid, light and dark cards in a checkerboard */}
      <section style={{ position: "relative", padding: SECTION_PAD, background: LIGHT_GLOW, color: INK }}>
        <div className="cp-grid-2" style={{ maxWidth: 1280, margin: "0 auto" }}>
          {ABOUT_PILLARS.map((p, i) => {
            const dark = i === 1 || i === 2;
            return (
              <article
                key={p.t}
                data-fx="rise"
                data-d={i * 80}
                className={`cp-card${dark ? " cp-dark" : ""}`}
                style={{ minHeight: 340, padding: "clamp(26px,3vw,36px)", display: "flex", flexDirection: "column", gap: 16 }}
              >
                <CardHead i={i} total={ABOUT_PILLARS.length} icon={p.icon} dark={dark} />
                <div style={{ flex: 1, minHeight: 40 }} />
                <h3 style={{ margin: 0, fontFamily: SANS, fontSize: "clamp(28px,2.6vw,38px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.08, textWrap: "balance" }}>
                  {p.t}
                </h3>
                <p style={{ margin: 0, maxWidth: 560, fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}>{p.s}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* 01 Who it's for — dark */}
      <section style={{ position: "relative", overflow: "hidden", padding: SECTION_PAD, color: "#FFFFFF", background: DARK_GRID }}>
        <DriftGlow left="40%" top="-30%" strength={0.24} />
        <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto" }}>
          <SectionHead
            dark
            n="01"
            eyebrow="Who it's for"
            title={
              <>
                Built for businesses that want a <span style={{ ...gradText, paddingBottom: ".06em" }}>real partner</span>
              </>
            }
            maxWidth={900}
          />
          <div
            style={{ marginTop: "clamp(48px,6vw,80px)", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 16 }}
          >
            {ABOUT_WHO.map((w, i) => {
              const light = i % 2 === 1;
              return (
                <article
                  key={w.t}
                  data-fx="rise"
                  data-d={i * 80}
                  className={`cp-card${light ? "" : " cp-dark"}`}
                  style={{ minHeight: 300, padding: 28, display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <CardHead i={i} total={ABOUT_WHO.length} icon={w.icon} dark={!light} />
                  <div style={{ flex: 1, minHeight: 24 }} />
                  <h3 style={{ margin: 0, fontFamily: SANS, fontSize: 23, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15, textWrap: "balance" }}>{w.t}</h3>
                  <p style={{ margin: 0, fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: light ? "#52525B" : "#A1A1AA", textWrap: "pretty" }}>{w.s}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 02 What you get — numbered list, then the outcomes */}
      <section style={{ position: "relative", padding: SECTION_PAD, background: MUTED_GLOW, color: INK }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="cp-split" style={{ alignItems: "start" }}>
            <div>
              <div data-fx="rise" className="a4-eyebrow" style={{ color: "#52525B" }}>
                <span style={{ color: INDIGO }}>02</span>
                <span>What you get</span>
              </div>
              <h2 style={{ margin: "18px 0 0", fontFamily: SANS, fontSize: "clamp(38px,4.4vw,68px)", letterSpacing: "-0.035em", lineHeight: 1.05 }}>
                <span data-fx="rise" data-d="100" style={{ display: "block", fontWeight: 500 }}>
                  Everything a finance
                </span>
                <span data-fx="rise" data-d="200" style={{ display: "block", fontWeight: 600, letterSpacing: "-0.04em", paddingBottom: ".08em", ...gradText }}>
                  function should be.
                </span>
              </h2>
            </div>
            <div data-fx="rise" data-d="150" style={{ display: "flex", flexDirection: "column" }}>
              {ABOUT_GET.map((g, i) => (
                <div
                  key={g}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "48px 1fr",
                    gap: 12,
                    padding: "22px 0",
                    borderTop: "1px solid #E4E4E7",
                    ...(i === ABOUT_GET.length - 1 ? { borderBottom: "1px solid #E4E4E7" } : null),
                  }}
                >
                  <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, letterSpacing: ".02em", color: INDIGO, paddingTop: 3 }}>{two(i + 1)}</span>
                  <span style={{ fontFamily: SANS, fontSize: "clamp(19px,1.6vw,22px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.35, color: INK }}>{g}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="cp-grid" style={{ marginTop: "clamp(72px,9vw,120px)" }}>
            {ABOUT_OUTCOMES.map(([ic, t, s], i) => {
              const dark = i % 2 === 1;
              return (
                <article
                  key={t}
                  data-fx="rise"
                  data-d={i * 80}
                  className={`cp-card${dark ? " cp-dark" : ""}`}
                  style={{ minHeight: 260, padding: 28, display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <CardHead i={i} total={ABOUT_OUTCOMES.length} icon={ic} dark={dark} />
                  <div style={{ flex: 1, minHeight: 24 }} />
                  <h3 style={{ margin: 0, fontFamily: SANS, fontSize: "clamp(26px,2.4vw,32px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.1 }}>{t}</h3>
                  <p style={{ margin: 0, fontFamily: SANS, fontSize: 18, fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.4, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}>{s}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dark CTA */}
      <section style={{ position: "relative", overflow: "hidden", padding: SECTION_PAD, color: "#FFFFFF", background: DARK_GRID }}>
        <DriftGlow left="-10%" top="-20%" strength={0.26} />
        <SweepSlab />
        <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto" }}>
          <h2 style={{ margin: 0, maxWidth: 1100, fontFamily: SANS, fontSize: "clamp(44px,6.4vw,112px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.06 }}>
            <TypeText as="span" segments={[{ t: "Let's build something", c: "#FFFFFF" }]} per={42} caret={PERI} style={{ display: "block" }} />
            <Words as="span" d={900} style={{ display: "block", fontWeight: 600 }} parts={[{ t: "solid together.", g: true }]} />
          </h2>
          <div data-fx="rise" data-d="1100" style={{ marginTop: "clamp(36px,4vw,56px)", display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Button variant="primary" size="lg" href={href("/contact")}>
              Talk to A4 <Icon name="arrow-right" size={18} color={INK} />
            </Button>
            <Button variant="outline-dark" size="lg" href={href("/how-it-works")}>
              See how it works
            </Button>
          </div>
        </div>
      </section>

      <ServicePortalBand serviceName="your business" />
    </div>
  );
}
