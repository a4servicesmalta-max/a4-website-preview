"use client";

import React from "react";
import { Button, Eyebrow, Icon } from "@/components/a4-landing/Primitives";
import { DARK_GRID, DriftGlow, LIGHT_GLOW, SweepSlab, TypeText, Words } from "@/components/fx/primitives";
import { HOW_IT_WORKS_STEPS } from "@/data/a4HowItWorksSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";
import { PortalFilm } from "@/components/film/chapters";

const SANS = "var(--a4x-display)";
const BODY = "var(--a4x-body)";
const INDIGO = "#4F55F1";
const PERI = "#8B8FF7";
const INK = "#09090B";
const SECTION_PAD = "clamp(100px,13vw,180px) clamp(20px,5vw,72px)";

export function HowItWorksContent() {
  const href = useLocalizedHref();

  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="How it works"
        title="Simple to start. Easy to work with."
        sub="From first hello to work delivered, A4 keeps every step clear, professional and on time — with one dedicated team and one secure portal."
      />
      <PortalFilm />

      {/* The five steps on the design's timeline: the line fills as you scroll */}
      <section style={{ position: "relative", padding: SECTION_PAD, background: LIGHT_GLOW, color: INK }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div data-tl="" className="cp-tl" style={{ ["--tl-n" as string]: HOW_IT_WORKS_STEPS.length }}>
            <div className="cp-tl-track" />
            <div data-tl-fill="" className="cp-tl-fill" />
            <ol className="cp-tl-steps" style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {HOW_IT_WORKS_STEPS.map((s, i) => (
                <li key={s.n} className="cp-tl-step" data-fx="rise" data-d={i * 100}>
                  <div className="cp-tl-dot" aria-hidden="true">
                    <span data-tl-dot="" />
                  </div>
                  <div className="cp-tl-num" style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: INDIGO }}>
                    {s.n}
                    <Icon name={s.icon} size={18} color="#A1A1AA" />
                  </div>
                  <h3 style={{ margin: "10px 0 0", fontFamily: SANS, fontSize: "clamp(23px,1.9vw,27px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15, textWrap: "balance" }}>{s.t}</h3>
                  <p style={{ margin: "12px 0 0", maxWidth: 560, fontFamily: BODY, fontSize: 15.5, lineHeight: 1.6, color: "#52525B", textWrap: "pretty" }}>{s.s}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Ongoing support — dark CTA */}
      <section style={{ position: "relative", overflow: "hidden", padding: SECTION_PAD, color: "#FFFFFF", background: DARK_GRID }}>
        <DriftGlow left="-10%" top="-20%" strength={0.26} />
        <SweepSlab />
        <div
          style={{
            position: "relative",
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
            gap: "48px 72px",
            alignItems: "end",
          }}
        >
          <div>
            <div data-fx="rise">
              <Eyebrow dark>Ongoing support &amp; visibility</Eyebrow>
            </div>
            <h2 style={{ margin: "20px 0 0", fontFamily: SANS, fontSize: "clamp(44px,6.4vw,112px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.06 }}>
              <TypeText as="span" segments={[{ t: "It doesn't stop", c: "#FFFFFF" }]} per={42} caret={PERI} style={{ display: "block" }} />
              <Words as="span" d={720} style={{ display: "block", fontWeight: 600 }} parts={[{ t: "at delivery.", g: true }]} />
            </h2>
          </div>
          <div>
            <p data-fx="rise" data-d="300" style={{ margin: 0, maxWidth: 560, fontFamily: SANS, fontSize: "clamp(18px,1.6vw,22px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.45, color: "#A1A1AA", textWrap: "pretty" }}>
              Your portal tracks deadlines, progress and completed work across accounting, compliance, corporate and audit — so
              nothing slips and you always have the full picture.
            </p>
            <div data-fx="rise" data-d="420" style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Button variant="primary" size="lg" href={href("/pricing-info")}>
                See how pricing works <Icon name="arrow-right" size={18} color={INK} />
              </Button>
              <Button variant="outline-dark" size="lg" href={href("/quote")}>
                Get a quote
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ServicePortalBand serviceName="your engagement" />
    </div>
  );
}
