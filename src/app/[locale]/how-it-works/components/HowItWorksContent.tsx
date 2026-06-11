"use client";

import React from "react";
import { Button, Container, Eyebrow, Icon, Reveal } from "@/components/a4-landing/Primitives";
import { HOW_IT_WORKS_STEPS } from "@/data/a4HowItWorksSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";

export function HowItWorksContent() {
  const href = useLocalizedHref();

  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="How it works"
        title={
          <>
            Simple to start.
            <br />
            Easy to work with.
          </>
        }
        sub="From first hello to work delivered, A4 keeps every step clear, professional and on time — with one dedicated team and one secure portal."
      />

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <Container>
          <div className="flex flex-col gap-4">
            {HOW_IT_WORKS_STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 60}>
                <div
                  className="hiw-grid grid items-center bg-[var(--a4-surface-card)] border border-[var(--a4-hairline-light)] rounded-[var(--a4-r-lg)]"
                  style={{
                    gridTemplateColumns: "auto 56px 1fr",
                    gap: 24,
                    padding: "clamp(22px,3vw,32px)",
                  }}
                >
                  <span
                    className="a4-font-display font-medium text-[var(--a4-faint)] leading-none"
                    style={{ fontSize: "clamp(34px,5vw,56px)", letterSpacing: "-1px" }}
                  >
                    {s.n}
                  </span>
                  <span className="w-14 h-14 rounded-[var(--a4-r-md)] bg-[var(--a4-surface-soft)] grid place-items-center">
                    <Icon name={s.icon} size={26} color="var(--a4-primary)" stroke={1.75} />
                  </span>
                  <div>
                    <h3
                      className="a4-font-display font-medium text-[var(--a4-ink)] m-0"
                      style={{ fontSize: "clamp(20px,2.5vw,26px)", letterSpacing: "-.3px" }}
                    >
                      {s.t}
                    </h3>
                    <p
                      className="a4-font-body text-[var(--a4-mute)] mt-2 m-0 max-w-[640px]"
                      style={{ fontSize: 15.5, lineHeight: 1.6, textWrap: "pretty" }}
                    >
                      {s.s}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-black" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <div aria-hidden="true" className="hero-bg" />
        <Container style={{ position: "relative", textAlign: "center", maxWidth: 760 }}>
          <Eyebrow dark>Ongoing support &amp; visibility</Eyebrow>
          <h2
            className="a4-font-display font-medium text-white mx-auto mt-4 m-0"
            style={{ fontSize: "clamp(30px,4.4vw,52px)", lineHeight: 1.04, letterSpacing: "-.025em", textWrap: "balance" }}
          >
            It doesn&apos;t stop at delivery.
          </h2>
          <p
            className="a4-font-body text-[var(--a4-on-dark-mute)] mx-auto mt-4 max-w-[560px]"
            style={{ fontSize: 18, lineHeight: 1.6, textWrap: "pretty" }}
          >
            Your portal tracks deadlines, progress and completed work across accounting, compliance, corporate and audit — so
            nothing slips and you always have the full picture.
          </p>
          <div className="flex gap-3 mt-8 justify-center flex-wrap">
            <Button variant="primary" size="lg" href={href("/pricing-info")}>
              See how pricing works <Icon name="arrow-right" size={18} color="#000" />
            </Button>
            <Button variant="outline-dark" size="lg" href={href("/quote")}>
              Get a quote
            </Button>
          </div>
        </Container>
      </section>

      <ServicePortalBand serviceName="your engagement" />
    </div>
  );
}
