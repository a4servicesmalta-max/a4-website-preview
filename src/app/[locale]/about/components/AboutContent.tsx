"use client";

import React from "react";
import { Button, Container, Eyebrow, Icon, Reveal, SectionHead } from "@/components/a4-landing/Primitives";
import { ABOUT_GET, ABOUT_OUTCOMES, ABOUT_PILLARS, ABOUT_WHO } from "@/data/a4AboutSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";

export function AboutContent() {
  const href = useLocalizedHref();

  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="About A4"
        title="A modern accounting, audit and corporate services firm"
        sub="A4 is a firm — not software, and not a marketplace. We do the work for you, supported by a secure, structured client portal that keeps everything visible and on track."
      />

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <Container>
          <div className="two-col grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {ABOUT_PILLARS.map((p, i) => (
              <Reveal key={p.t} delay={i * 80} style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", padding: "clamp(26px,3vw,36px)" }}>
                <span className="w-12 h-12 rounded-[var(--a4-r-md)] bg-[var(--a4-surface-soft)] grid place-items-center inline-grid">
                  <Icon name={p.icon} size={23} color="var(--a4-primary)" stroke={1.75} />
                </span>
                <h3 className="a4-font-display font-medium text-[var(--a4-ink)] mt-5" style={{ fontSize: "clamp(20px,2.4vw,25px)", letterSpacing: "-.3px" }}>{p.t}</h3>
                <p className="a4-font-body text-[var(--a4-mute)] mt-[10px]" style={{ fontSize: 15.5, lineHeight: 1.6, textWrap: "pretty" }}>{p.s}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-black" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <Container>
          <Reveal><SectionHead dark align="center" eyebrow="Who it's for" title="Built for businesses that want a real partner" maxWidth={620} /></Reveal>
          <div className="grid gap-5 mt-[52px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))" }}>
            {ABOUT_WHO.map((w, i) => (
              <Reveal key={w.t} delay={i * 70} style={{ background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", padding: "28px 26px" }}>
                <Icon name={w.icon} size={24} color="var(--a4-primary-bright)" stroke={1.75} />
                <h3 className="a4-font-display font-medium text-white mt-[18px] text-[19px]" style={{ letterSpacing: "-.2px", textWrap: "balance" }}>{w.t}</h3>
                <p className="a4-font-body text-[var(--a4-on-dark-mute)] mt-[9px] text-[14.5px] leading-[1.5]" style={{ textWrap: "pretty" }}>{w.s}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <Container>
          <div className="two-col grid gap-12 items-start" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <Reveal>
              <Eyebrow>What you get</Eyebrow>
              <h2 className="a4-font-display font-medium text-[var(--a4-ink)] mt-4" style={{ fontSize: "clamp(28px,3.6vw,46px)", lineHeight: 1.05, letterSpacing: "-.025em", textWrap: "balance" }}>Everything a finance function should be.</h2>
              <div className="flex flex-col gap-[14px] mt-[26px]">
                {ABOUT_GET.map((g) => (
                  <div key={g} className="flex items-center gap-3">
                    <Icon name="check-circle" size={20} color="var(--a4-accent-teal)" />
                    <span className="a4-font-body text-[16px] font-semibold text-[var(--a4-charcoal)]">{g}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="flex flex-col gap-[14px]">
                {ABOUT_OUTCOMES.map(([ic, t, s]) => (
                  <div key={t} className="flex items-center gap-4 bg-[var(--a4-surface-card)] border border-[var(--a4-hairline-light)] rounded-[var(--a4-r-lg)] py-[22px] px-6">
                    <span className="w-[46px] h-[46px] rounded-[var(--a4-r-md)] bg-[var(--a4-surface-soft)] grid place-items-center shrink-0">
                      <Icon name={ic} size={22} color="var(--a4-primary)" stroke={1.75} />
                    </span>
                    <div>
                      <h3 className="a4-font-display font-medium text-[19px] text-[var(--a4-ink)] m-0" style={{ letterSpacing: "-.2px" }}>{t}</h3>
                      <p className="a4-font-body text-[14.5px] leading-[1.5] text-[var(--a4-mute)] mt-1" style={{ textWrap: "pretty" }}>{s}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-black" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <div aria-hidden="true" className="hero-bg" />
        <Container style={{ position: "relative", textAlign: "center", maxWidth: 720 }}>
          <h2 className="a4-font-display font-medium text-white m-0" style={{ fontSize: "clamp(30px,4.4vw,54px)", lineHeight: 1.04, letterSpacing: "-.025em", textWrap: "balance" }}>Let&apos;s build something solid together.</h2>
          <div className="flex gap-3 mt-8 justify-center flex-wrap">
            <Button variant="primary" size="lg" href={href("/contact")}>Talk to A4 <Icon name="arrow-right" size={18} color="#000" /></Button>
            <Button variant="outline-dark" size="lg" href={href("/how-it-works")}>See how it works</Button>
          </div>
        </Container>
      </section>

      <ServicePortalBand serviceName="your business" />
    </div>
  );
}
