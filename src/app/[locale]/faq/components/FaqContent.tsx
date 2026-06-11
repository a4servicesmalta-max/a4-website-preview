"use client";

import React from "react";
import { Button, Container, Icon, Reveal } from "@/components/a4-landing/Primitives";
import { Accordion } from "@/components/a4-site/Accordion";
import { FAQ_GROUPS } from "@/data/a4FaqSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";

export function FaqContent() {
  const href = useLocalizedHref();

  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="FAQs"
        title="Frequently asked questions"
        sub="Everything you might want to know about working with A4 — and how the firm, the people and the technology fit together."
      />

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(56px,8vw,96px) 0" }}>
        <Container style={{ maxWidth: 920 }}>
          {FAQ_GROUPS.map((g, gi) => (
            <Reveal key={g.cat} delay={gi * 50} style={{ marginBottom: 44 }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="a4-font-body text-[12.5px] font-bold tracking-[.12em] uppercase text-[var(--a4-primary)]">
                  {g.cat}
                </span>
                <span className="flex-1 h-px bg-[var(--a4-hairline-light)]" />
              </div>
              <Accordion items={g.items} defaultOpen={gi === 0 ? 0 : -1} />
            </Reveal>
          ))}
        </Container>
      </section>

      <section className="relative overflow-hidden bg-black" style={{ padding: "clamp(56px,8vw,88px) 0" }}>
        <div aria-hidden="true" className="hero-bg" />
        <Container style={{ position: "relative", textAlign: "center", maxWidth: 640 }}>
          <h2
            className="a4-font-display font-medium text-white m-0"
            style={{ fontSize: "clamp(28px,4vw,46px)", lineHeight: 1.05, letterSpacing: "-.025em", textWrap: "balance" }}
          >
            Need more help?
          </h2>
          <p className="a4-font-body text-[18px] text-[var(--a4-on-dark-mute)] mt-[14px] mx-auto max-w-[460px]">
            Chat to our friendly team — we&apos;re happy to talk it through.
          </p>
          <div className="flex gap-x-7 gap-y-[10px] justify-center flex-wrap mt-6">
            {["+356 7714 2418", "+44 7400 487907"].map((v) => (
              <div key={v} className="flex items-center gap-[9px]">
                <Icon name="phone" size={16} color="var(--a4-primary-bright)" />
                <span className="a4-font-body text-[16px] font-semibold text-white">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-[30px]">
            <Button variant="primary" size="lg" href={href("/contact")}>
              Contact us <Icon name="arrow-right" size={18} color="#000" />
            </Button>
          </div>
        </Container>
      </section>

      <ServicePortalBand serviceName="your account" />
    </div>
  );
}
