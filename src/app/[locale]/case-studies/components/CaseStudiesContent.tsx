"use client";

import React, { useState } from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Button, Container, Icon, Reveal } from "@/components/a4-landing/Primitives";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { CASE_STUDIES, CASE_STUDY_STATS, type CaseStudy } from "@/data/a4CaseStudiesData";
import { TestimonialsSwiper } from "@/components/a4-landing/TestimonialsSwiper";

const ALL_FILTER = "All";

function CaseStudyHero() {
  return (
    <section
      className="relative overflow-hidden bg-black pt-24 sm:pt-28 lg:pt-32"
      style={{ paddingBottom: "clamp(48px,6vw,80px)" }}
    >
      <div aria-hidden="true" className="hero-bg" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(73,79,223,.35) 0%, transparent 70%)",
        }}
      />
      <Container style={{ position: "relative", textAlign: "center" }}>
        <Reveal>
          <div className="flex items-center justify-center gap-[14px]">
            <span className="w-[28px] h-[1px] bg-[var(--a4-hairline-strong)]" />
            <span className="a4-font-body text-[12.5px] font-semibold tracking-[.14em] uppercase text-[var(--a4-on-dark-mute)]">
              Client results
            </span>
            <span className="w-[28px] h-[1px] bg-[var(--a4-hairline-strong)]" />
          </div>
          <h1
            className="a4-font-display font-medium text-white mx-auto mt-[22px]"
            style={{
              fontSize: "clamp(36px,5.4vw,72px)",
              lineHeight: 1.03,
              letterSpacing: "-.03em",
              maxWidth: 860,
              textWrap: "balance",
            }}
          >
            Real outcomes from{" "}
            <span style={{ color: "var(--a4-primary-bright)" }}>Malta businesses</span>
          </h1>
          <p
            className="a4-font-body text-[var(--a4-on-dark-mute)] mx-auto mt-[22px]"
            style={{ fontSize: "clamp(17px,1.8vw,20px)", lineHeight: 1.6, maxWidth: 580, textWrap: "pretty" }}
          >
            Anonymised stories with measurable results — overdue work brought current, audits filed on time, and
            compliance made predictable.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div
            className="flex flex-wrap justify-center gap-3 mt-12 mx-auto max-w-[720px]"
          >
            {CASE_STUDY_STATS.map((s, i) => (
              <div
                key={s.label}
                className="flex flex-col items-center rounded-[var(--a4-r-lg)] border border-[var(--a4-hairline-dark)] px-8 py-5 min-w-[140px]"
                style={{
                  background: "rgba(255,255,255,.04)",
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <span
                  className="a4-font-display font-medium text-white"
                  style={{ fontSize: 32, letterSpacing: "-1px", lineHeight: 1 }}
                >
                  {s.value}
                </span>
                <span className="a4-font-body text-[12.5px] text-[var(--a4-stone)] mt-2 text-center">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function CaseStudyCard({ cs, index }: { cs: CaseStudy; index: number }) {
  const isSpotlight = cs.variant === "spotlight";
  const isDark = cs.variant === "dark";
  const isTinted = cs.variant === "tinted";

  if (isSpotlight) {
    return (
      <Reveal delay={index * 60}>
        <article
          className="relative overflow-hidden rounded-[var(--a4-r-lg)] border border-[var(--a4-hairline-dark)]"
          style={{
            background: "linear-gradient(135deg, #0a0a0a 0%, #141428 100%)",
            padding: "clamp(32px,4vw,48px)",
          }}
        >
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl"
            style={{ background: "var(--a4-primary)" }}
          />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="a4-font-body text-[11px] font-bold tracking-[.12em] uppercase text-[var(--a4-primary-bright)]">
                  Featured · {cs.sector}
                </span>
                <span className="a4-font-body text-[11px] text-[var(--a4-stone)]">· {cs.service}</span>
              </div>
              <h2
                className="a4-font-display font-medium text-white mt-4"
                style={{ fontSize: "clamp(26px,3.2vw,38px)", lineHeight: 1.1, letterSpacing: "-.02em", textWrap: "balance" }}
              >
                {cs.headline}
              </h2>
              <p className="a4-font-body text-[15px] leading-relaxed text-[var(--a4-on-dark-mute)] mt-4 max-w-xl">
                {cs.challenge}
              </p>
              <p className="a4-font-body text-[15px] leading-relaxed text-white/90 mt-3 max-w-xl">{cs.result}</p>
            </div>
            <div
              className="rounded-[var(--a4-r-lg)] border border-[var(--a4-hairline-dark)] p-8 text-center"
              style={{ background: "rgba(255,255,255,.06)" }}
            >
              <div
                className="a4-font-display font-medium text-white"
                style={{ fontSize: 56, letterSpacing: "-2px", lineHeight: 1 }}
              >
                {cs.metric}
              </div>
              <div className="a4-font-body text-[14px] text-[var(--a4-stone)] mt-3">{cs.metricLabel}</div>
              <div className="a4-font-body text-[11.5px] text-[var(--a4-stone)] mt-4 uppercase tracking-wide">
                {cs.timeline}
              </div>
            </div>
          </div>
        </article>
      </Reveal>
    );
  }

  const cardStyle = isDark
    ? { background: "#000", borderColor: "var(--a4-hairline-dark)", color: "#fff" }
    : isTinted
      ? { background: "rgba(73,79,223,.06)", borderColor: "rgba(73,79,223,.18)" }
      : { background: "var(--a4-surface-card)", borderColor: "var(--a4-hairline-light)" };

  const textInk = isDark ? "#fff" : "var(--a4-ink)";
  const textMute = isDark ? "var(--a4-on-dark-mute)" : "var(--a4-mute)";

  return (
    <Reveal delay={index * 60}>
      <article
        className="group relative flex flex-col h-full rounded-[var(--a4-r-lg)] border overflow-hidden transition-transform duration-300 hover:-translate-y-1"
        style={{ ...cardStyle, padding: "clamp(24px,2.8vw,32px)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <span
              className="a4-font-body text-[11px] font-bold tracking-[.12em] uppercase"
              style={{ color: isDark ? "var(--a4-primary-bright)" : "var(--a4-primary)" }}
            >
              {cs.sector}
            </span>
            <span className="a4-font-body text-[11px] ml-2" style={{ color: textMute }}>
              {cs.service}
            </span>
          </div>
          <span
            className="shrink-0 rounded-full px-2.5 py-1 a4-font-body text-[10.5px] font-semibold uppercase tracking-wide"
            style={{
              background: isDark ? "rgba(255,255,255,.08)" : "var(--a4-surface-soft)",
              color: textMute,
            }}
          >
            {cs.timeline.split("·")[0]?.trim()}
          </span>
        </div>

        <h2
          className="a4-font-display font-medium mt-4"
          style={{
            fontSize: "clamp(20px,2.2vw,26px)",
            lineHeight: 1.15,
            letterSpacing: "-.02em",
            color: textInk,
            textWrap: "balance",
          }}
        >
          {cs.headline}
        </h2>

        <div className="mt-5 space-y-3 flex-1">
          <div>
            <div className="a4-font-body text-[11px] font-semibold uppercase tracking-wide" style={{ color: textMute }}>
              Challenge
            </div>
            <p className="a4-font-body text-[14.5px] leading-relaxed mt-1.5" style={{ color: textInk, opacity: 0.9 }}>
              {cs.challenge}
            </p>
          </div>
          <div>
            <div className="a4-font-body text-[11px] font-semibold uppercase tracking-wide" style={{ color: textMute }}>
              Outcome
            </div>
            <p className="a4-font-body text-[14.5px] leading-relaxed mt-1.5" style={{ color: textInk, opacity: 0.85 }}>
              {cs.result}
            </p>
          </div>
        </div>

        <div
          className="flex items-baseline gap-2 mt-6 pt-5 border-t"
          style={{ borderColor: isDark ? "var(--a4-hairline-dark)" : "var(--a4-hairline-light)" }}
        >
          <span
            className="a4-font-display font-medium"
            style={{ fontSize: 36, letterSpacing: "-1px", color: textInk, lineHeight: 1 }}
          >
            {cs.metric}
          </span>
          <span className="a4-font-body text-[13px]" style={{ color: textMute }}>
            {cs.metricLabel}
          </span>
        </div>
      </article>
    </Reveal>
  );
}

export function CaseStudiesContent() {
  const services = [ALL_FILTER, ...Array.from(new Set(CASE_STUDIES.map((c) => c.service)))];
  const [filter, setFilter] = useState(ALL_FILTER);

  const spotlight = CASE_STUDIES.find((c) => c.variant === "spotlight") ?? CASE_STUDIES[0];
  const rest = CASE_STUDIES.filter((c) => c.id !== spotlight.id);
  const filtered =
    filter === ALL_FILTER ? rest : rest.filter((c) => c.service === filter);

  return (
    <div className="a4-site-page">
      <CaseStudyHero />

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(48px,7vw,88px) 0" }}>
        <Container>
          <Reveal>
            <CaseStudyCard cs={spotlight} index={0} />
          </Reveal>

          <Reveal delay={60}>
            <div className="flex flex-wrap gap-2 mt-12 mb-8">
              {services.map((s) => {
                const on = filter === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFilter(s)}
                    className="a4-font-body text-[13px] font-semibold rounded-full px-4 py-2 transition-all duration-200"
                    style={{
                      background: on ? "#000" : "var(--a4-surface-card)",
                      color: on ? "#fff" : "var(--a4-mute)",
                      border: `1px solid ${on ? "#000" : "var(--a4-hairline-light)"}`,
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </Reveal>

          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}
          >
            {filtered.map((cs, i) => (
              <CaseStudyCard key={cs.id} cs={cs} index={i + 1} />
            ))}
          </div>

          <Reveal delay={100} style={{ textAlign: "center", marginTop: 56 }}>
            <p className="a4-font-body text-[16px] text-[var(--a4-mute)] max-w-md mx-auto mb-6">
              Every engagement starts with a clear scope and fixed quote.
            </p>
            <LocalizedLink href="/contact">
              <Button variant="primary" size="lg">
                Discuss your case <Icon name="arrow-right" size={18} color="#000" />
              </Button>
            </LocalizedLink>
          </Reveal>
        </Container>
      </section>

      <TestimonialsSwiper variant="light" />
      <ServicePortalBand serviceName="your engagement" />
    </div>
  );
}
