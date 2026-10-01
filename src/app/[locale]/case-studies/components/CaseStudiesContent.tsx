"use client";

import React, { useState } from "react";
import { Button, Icon } from "@/components/a4-landing/Primitives";
import { DARK_CARD, LIGHT_GLOW, LetterWord, gradText } from "@/components/fx/primitives";
import { gcol } from "@/lib/fx/engine";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { CASE_STUDIES, CASE_STUDY_STATS, type CaseStudy } from "@/data/a4CaseStudiesData";
import { TestimonialsSwiper } from "@/components/a4-landing/TestimonialsSwiper";

const SANS = "var(--a4x-display)";
const BODY = "var(--a4x-body)";
const INDIGO = "#4F55F1";
const PERI = "#8B8FF7";
const INK = "#09090B";

const ALL_FILTER = "All";

const kicker = (dark: boolean): React.CSSProperties => ({
  fontFamily: BODY,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: dark ? "#A1A1AA" : "#71717A",
});

/** The featured case: the design's dark document panel, metric in gradient. */
function Spotlight({ cs }: { cs: CaseStudy }) {
  return (
    <article
      data-fx="rise"
      data-dy="80"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 28,
        border: "1px solid rgba(255,255,255,.08)",
        background: DARK_CARD,
        color: "#FFFFFF",
        boxShadow: "0 50px 120px rgba(9,9,11,.18)",
        padding: "clamp(28px,4.4vw,64px)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
        gap: "40px 64px",
        alignItems: "end",
      }}
    >
      <div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "6px 12px", fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: ".02em" }}>
          <span style={{ color: PERI }}>Featured · {cs.sector}</span>
          <span style={{ color: "#A1A1AA" }}>· {cs.service}</span>
        </div>
        <h2 style={{ margin: "20px 0 0", fontFamily: SANS, fontSize: "clamp(32px,3.6vw,54px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.04, textWrap: "balance" }}>{cs.headline}</h2>
        <p style={{ margin: "22px 0 0", maxWidth: 620, fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: "#A1A1AA", textWrap: "pretty" }}>{cs.challenge}</p>
        <p style={{ margin: "12px 0 0", maxWidth: 620, fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: "#E4E4E7", textWrap: "pretty" }}>{cs.result}</p>
      </div>
      <div style={{ padding: "clamp(24px,3vw,36px)", borderRadius: 24, border: "1px solid rgba(255,255,255,.1)", background: "rgba(24,24,27,.72)" }}>
        <div style={kicker(true)}>{cs.timeline}</div>
        <LetterWord
          text={cs.metric}
          fx="cascade"
          d={250}
          colors={Array.from(cs.metric).map((_, j, a) => gcol(a.length > 1 ? j / (a.length - 1) : 0))}
          style={{ marginTop: 14, fontFamily: SANS, fontSize: "clamp(52px,5.6vw,92px)", fontWeight: 600, letterSpacing: "-0.05em", lineHeight: 1.05, whiteSpace: "nowrap" }}
        />
        <div style={{ marginTop: 10, fontFamily: SANS, fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em", color: "#E4E4E7" }}>{cs.metricLabel}</div>
      </div>
    </article>
  );
}

function CaseStudyCard({ cs, index }: { cs: CaseStudy; index: number }) {
  const dark = index % 2 === 1;
  return (
    <article
      data-fx="rise"
      data-d={(index % 3) * 80}
      className={`cp-card${dark ? " cp-dark" : ""}`}
      style={{ display: "flex", flexDirection: "column", gap: 14, padding: 28 }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, letterSpacing: ".02em", color: dark ? PERI : INDIGO }}>{cs.sector}</div>
          <div style={{ marginTop: 2, fontFamily: BODY, fontSize: 13.5, color: dark ? "#A1A1AA" : "#52525B" }}>{cs.service}</div>
        </div>
        <span
          style={{
            flexShrink: 0,
            height: 30,
            padding: "0 13px",
            display: "inline-flex",
            alignItems: "center",
            borderRadius: 999,
            fontFamily: SANS,
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: "nowrap",
            border: `1px solid ${dark ? "rgba(255,255,255,.18)" : "#E4E4E7"}`,
            color: dark ? "#E4E4E7" : "#52525B",
          }}
        >
          {cs.timeline.split("·")[0]?.trim()}
        </span>
      </div>

      <h2 style={{ margin: "18px 0 0", fontFamily: SANS, fontSize: "clamp(24px,2.2vw,30px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.12, textWrap: "balance" }}>{cs.headline}</h2>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
        <div>
          <div style={kicker(dark)}>Challenge</div>
          <p style={{ margin: "6px 0 0", fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: dark ? "#D4D4D8" : "#3F3F46", textWrap: "pretty" }}>{cs.challenge}</p>
        </div>
        <div>
          <div style={kicker(dark)}>Outcome</div>
          <p style={{ margin: "6px 0 0", fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: dark ? "#D4D4D8" : "#3F3F46", textWrap: "pretty" }}>{cs.result}</p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "4px 10px", marginTop: 8, paddingTop: 18, borderTop: `1px solid ${dark ? "rgba(255,255,255,.1)" : "#E4E4E7"}` }}>
        <span style={{ fontFamily: SANS, fontSize: 34, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.05, paddingBottom: ".04em", ...gradText }}>{cs.metric}</span>
        <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: dark ? "#A1A1AA" : "#52525B" }}>{cs.metricLabel}</span>
      </div>
    </article>
  );
}

export function CaseStudiesContent() {
  const [filter, setFilter] = useState(ALL_FILTER);

  const spotlight = CASE_STUDIES.find((c) => c.variant === "spotlight") ?? CASE_STUDIES[0];
  const rest = CASE_STUDIES.filter((c) => c.id !== spotlight.id);
  // Filters come from the grid's own cases: the featured case is never in the
  // grid, so a filter for its service alone would always come up empty.
  const services = [ALL_FILTER, ...Array.from(new Set(rest.map((c) => c.service)))];
  const filtered = filter === ALL_FILTER ? rest : rest.filter((c) => c.service === filter);

  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="Client results"
        title="Real outcomes from"
        accent="Malta businesses"
        sub="Anonymised stories with measurable results — overdue work brought current, audits filed on time, and compliance made predictable."
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {CASE_STUDY_STATS.map((s) => (
            <span key={s.label} className="a4-chip a4-chip-dark">
              <span style={{ color: "#FFFFFF", fontWeight: 600 }}>{s.value}</span> {s.label}
            </span>
          ))}
        </div>
      </PageHero>

      <section style={{ position: "relative", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", background: LIGHT_GLOW, color: INK }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <Spotlight cs={spotlight} />

          <div data-fx="rise" style={{ marginTop: "clamp(56px,7vw,96px)", marginBottom: 28 }}>
            <div className="cp-seg" role="group" aria-label="Filter case studies by service">
              {services.map((s) => (
                <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="cp-grid">
            {filtered.map((cs, i) => (
              <CaseStudyCard key={cs.id} cs={cs} index={i} />
            ))}
          </div>

          <div
            data-fx="rise"
            style={{ marginTop: "clamp(56px,7vw,96px)", paddingTop: 32, borderTop: "1px solid #E4E4E7", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}
          >
            <p style={{ margin: 0, maxWidth: 560, fontFamily: SANS, fontSize: "clamp(20px,1.9vw,26px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.35, color: "#3F3F46" }}>
              Every engagement starts with a clear scope and fixed quote.
            </p>
            <Button variant="dark" size="lg" href="/contact">
              Discuss your case <Icon name="arrow-right" size={18} color="#FFFFFF" />
            </Button>
          </div>
        </div>
      </section>

      <TestimonialsSwiper variant="light" />
      <ServicePortalBand serviceName="your engagement" />
    </div>
  );
}
