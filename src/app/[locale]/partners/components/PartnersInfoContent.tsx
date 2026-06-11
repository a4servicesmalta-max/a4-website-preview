"use client";

import React from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Button, Container, Icon, Reveal, SectionHead } from "@/components/a4-landing/Primitives";
import { PARTNER_CRITERIA, PARTNER_MODELS } from "@/data/a4PartnersSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";

export function PartnersInfoContent() {
  const href = useLocalizedHref();

  return (
    <div className="a4-site-page">
      <PageHero eyebrow="Partnerships" title="Partner with A4" sub="Grow your firm with A4 — whether you want us to deliver work, run on our technology, integrate our platform, or earn by referring clients.">
        <div className="flex gap-3 justify-center flex-wrap mt-[30px]">
          <Button variant="primary" size="lg" href={href("/contact")}>Become a partner <Icon name="arrow-right" size={18} color="#000" /></Button>
          <Button variant="outline-dark" size="lg" href={href("/partners-platform")}>Partner platform</Button>
        </div>
      </PageHero>

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <Container>
          <Reveal><SectionHead align="center" eyebrow="Partnership models" title="Four ways to work with us" maxWidth={600} /></Reveal>
          <div className="two-col grid gap-5 mt-[52px]" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {PARTNER_MODELS.map((m, i) => (
              <Reveal key={m.t} delay={i * 80} style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", padding: "clamp(26px,3vw,36px)" }}>
                <span className="w-12 h-12 rounded-[var(--a4-r-md)] bg-[var(--a4-surface-soft)] grid place-items-center inline-grid">
                  <Icon name={m.icon} size={23} color="var(--a4-primary)" stroke={1.75} />
                </span>
                <h3 className="a4-font-display font-medium text-[var(--a4-ink)] mt-5" style={{ fontSize: "clamp(20px,2.4vw,25px)", letterSpacing: "-.3px" }}>{m.t}</h3>
                <p className="a4-font-body text-[var(--a4-mute)] mt-[10px] text-[15px] leading-[1.6]" style={{ textWrap: "pretty" }}>{m.s}</p>
                {m.href && (
                  <LocalizedLink href={m.href} className="inline-flex items-center gap-1.5 mt-4 a4-font-body text-[14.5px] font-semibold no-underline" style={{ color: "var(--a4-link)" }}>
                    Learn more <Icon name="arrow-right" size={15} color="var(--a4-link)" />
                  </LocalizedLink>
                )}
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-black" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <Container>
          <Reveal><SectionHead dark align="center" eyebrow="How we evaluate partnerships" title="We choose partners carefully" sub="Our clients trust us — so we hold every partner to the same standard we hold ourselves." maxWidth={620} /></Reveal>
          <div className="grid gap-5 mt-[52px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))" }}>
            {PARTNER_CRITERIA.map((c, i) => (
              <Reveal key={c.t} delay={i * 60} style={{ background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", padding: "26px 24px" }}>
                <Icon name={c.icon} size={24} color="var(--a4-primary-bright)" stroke={1.75} />
                <h3 className="a4-font-display font-medium text-white mt-4 text-[19px]" style={{ letterSpacing: "-.2px" }}>{c.t}</h3>
                <p className="a4-font-body text-[var(--a4-on-dark-mute)] mt-2 text-[14.5px] leading-[1.5]" style={{ textWrap: "pretty" }}>{c.s}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <div className="text-center mt-11">
              <Button variant="primary" size="lg" href={href("/contact")}>Start a conversation <Icon name="arrow-right" size={18} color="#000" /></Button>
            </div>
          </Reveal>
        </Container>
      </section>

      <ServicePortalBand serviceName="partner engagements" />
    </div>
  );
}
