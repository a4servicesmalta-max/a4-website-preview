"use client";

import React from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import {
  Button,
  Container,
  Eyebrow,
  Icon,
  Reveal,
  SectionHead,
} from "@/components/a4-landing/Primitives";
import {
  PRICING_COMMIT,
  PRICING_FACTORS,
  PRICING_HERO_CHIPS,
  PRICING_MODELS,
  PRICING_OUTLINES,
  PRICING_QUOTE_STEPS,
} from "@/data/a4PricingSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { useLocalizedHref } from "@/app/[locale]/pricing/components/useLocalizedHref";

export function PricingInfoContent() {
  const href = useLocalizedHref();

  return (
    <div className="a4-pricing-page">
      <PageHero
        eyebrow="Transparent pricing"
        title="Fair, transparent, and tailored to your needs"
        sub="Published monthly plans for everyday bookkeeping, VAT and payroll — with tailored quotes for audit and more complex engagements. Here's exactly how we price and how a quote comes together."
      >
        <div className="flex gap-[10px] justify-center flex-wrap mt-[30px]">
          {PRICING_HERO_CHIPS.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-2 a4-font-body text-[13.5px] font-semibold text-[var(--a4-on-dark)] rounded-[var(--a4-r-full)] py-[9px] px-4"
              style={{ border: "1px solid var(--a4-hairline-dark)" }}
            >
              <Icon name="check" size={14} color="var(--a4-accent-teal)" stroke={2.4} />
              {c}
            </span>
          ))}
        </div>
      </PageHero>

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <Container>
          <Reveal>
            <SectionHead
              align="center"
              eyebrow="How pricing is determined"
              title="Six things that shape your fee"
              sub="Every quote is built from the same transparent factors — no guesswork, no arbitrary tiers."
              maxWidth={600}
            />
          </Reveal>
          <div
            className="grid gap-5 mt-[52px]"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
          >
            {PRICING_FACTORS.map((f, i) => (
              <Reveal
                key={f.t}
                delay={i * 70}
                style={{
                  background: "var(--a4-surface-card)",
                  border: "1px solid var(--a4-hairline-light)",
                  borderRadius: "var(--a4-r-lg)",
                  padding: "clamp(24px,3vw,32px)",
                }}
              >
                <span className="w-12 h-12 rounded-[var(--a4-r-md)] bg-[var(--a4-surface-soft)] grid place-items-center inline-grid">
                  <Icon name={f.icon} size={23} color="var(--a4-primary)" stroke={1.75} />
                </span>
                <h3 className="a4-font-display font-medium text-[20px] text-[var(--a4-ink)] mt-5" style={{ letterSpacing: "-.2px" }}>
                  {f.t}
                </h3>
                <p className="a4-font-body text-[14.5px] leading-[1.55] text-[var(--a4-mute)] mt-[9px]" style={{ textWrap: "pretty" }}>
                  {f.s}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-black" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <Container>
          <Reveal>
            <SectionHead dark align="center" eyebrow="Service pricing models" title="Priced the way each service works" maxWidth={620} />
          </Reveal>
          <div className="two-col grid gap-5 mt-[52px]" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {PRICING_MODELS.map((m, i) => (
              <Reveal
                key={m.tag}
                delay={i * 90}
                style={{
                  background: "var(--a4-surface-elevated)",
                  border: "1px solid var(--a4-hairline-dark)",
                  borderRadius: "var(--a4-r-lg)",
                  padding: "clamp(28px,3.4vw,40px)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-12 h-12 rounded-[var(--a4-r-md)] grid place-items-center"
                    style={{ background: "rgba(73,79,223,.16)" }}
                  >
                    <Icon name={m.icon} size={23} color="var(--a4-primary-bright)" stroke={1.75} />
                  </span>
                  <span className="a4-font-body text-[11px] font-bold tracking-[.12em] uppercase text-[var(--a4-stone)]">
                    {m.tag}
                  </span>
                </div>
                <h3
                  className="a4-font-display font-medium text-white mt-5"
                  style={{ fontSize: "clamp(21px,2.5vw,26px)", letterSpacing: "-.3px", textWrap: "balance" }}
                >
                  {m.t}
                </h3>
                <p className="a4-font-body text-[15px] leading-[1.6] text-[var(--a4-on-dark-mute)] mt-3" style={{ textWrap: "pretty" }}>
                  {m.s}
                </p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={120}>
            <div
              className="flex items-center justify-center gap-[13px] mt-5 rounded-[var(--a4-r-lg)] py-5 px-6 flex-wrap text-center"
              style={{ background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)" }}
            >
              <Icon name="info" size={18} color="var(--a4-primary-bright)" />
              <span className="a4-font-body text-[15px] text-[var(--a4-on-dark)]" style={{ textWrap: "pretty" }}>
                Audit and complex engagements are scoped individually —{" "}
                <LocalizedLink href="/contact" className="text-white font-semibold no-underline">
                  book a call
                </LocalizedLink>{" "}
                for a fixed quote.
              </span>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <Container>
          <Reveal>
            <SectionHead align="center" eyebrow="How quotes work" title="From first chat to confirmed quote" maxWidth={560} />
          </Reveal>
          <div
            className="grid mt-[52px] border-t border-[var(--a4-hairline-light)]"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
          >
            {PRICING_QUOTE_STEPS.map((s, i) => (
              <Reveal
                key={s.n}
                delay={i * 70}
                style={{
                  padding: "28px 22px 28px 0",
                  borderRight: i < 3 ? "1px solid var(--a4-hairline-light)" : "none",
                  paddingLeft: i ? 22 : 0,
                }}
              >
                <div
                  className="w-10 h-10 rounded-[var(--a4-r-full)] grid place-items-center a4-font-display font-medium text-[16px] text-[var(--a4-ink)]"
                  style={{ border: "1px solid var(--a4-hairline-strong)" }}
                >
                  {s.n}
                </div>
                <h3 className="a4-font-display font-medium text-[19px] text-[var(--a4-ink)] mt-[18px]" style={{ letterSpacing: "-.2px" }}>
                  {s.t}
                </h3>
                <p className="a4-font-body text-[14.5px] leading-[1.5] text-[var(--a4-mute)] mt-2" style={{ textWrap: "pretty" }}>
                  {s.s}
                </p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={100}>
            <div
              className="mt-12 bg-[var(--a4-surface-card)] border border-[var(--a4-hairline-light)] rounded-[var(--a4-r-lg)]"
              style={{ padding: "clamp(28px,3.4vw,40px)" }}
            >
              <h3
                className="a4-font-display font-medium text-[var(--a4-ink)] m-0"
                style={{ fontSize: "clamp(20px,2.4vw,26px)", letterSpacing: "-.3px" }}
              >
                Every quote clearly outlines
              </h3>
              <div
                className="grid gap-[14px] mt-[22px]"
                style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))" }}
              >
                {PRICING_OUTLINES.map((o) => (
                  <div key={o} className="flex items-center gap-[11px]">
                    <Icon name="check-circle" size={18} color="var(--a4-accent-teal)" />
                    <span className="a4-font-body text-[15px] font-semibold text-[var(--a4-charcoal)]">{o}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-black" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <div aria-hidden="true" className="hero-bg" />
        <Container style={{ position: "relative", textAlign: "center", maxWidth: 720 }}>
          <Eyebrow dark>Our commitment</Eyebrow>
          <h2
            className="a4-font-display font-medium text-white mx-auto mt-4"
            style={{
              fontSize: "clamp(30px,4.4vw,52px)",
              lineHeight: 1.04,
              letterSpacing: "-.025em",
              textWrap: "balance",
            }}
          >
            Pricing you can trust.
          </h2>
          <div className="flex gap-x-7 gap-y-3 justify-center flex-wrap mt-7">
            {PRICING_COMMIT.map((c) => (
              <div key={c} className="flex items-center gap-[9px]">
                <Icon name="check" size={16} color="var(--a4-accent-teal)" stroke={2.4} />
                <span className="a4-font-body text-[15.5px] text-[var(--a4-on-dark)]">{c}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-9 justify-center flex-wrap">
            <Button variant="primary" size="lg" href={href("/quote")}>
              Get a tailored quote <Icon name="arrow-right" size={18} color="#000" />
            </Button>
            <LocalizedLink href="/pricing" className="inline-flex">
              <Button variant="outline-dark" size="lg">
                Try the price calculator
              </Button>
            </LocalizedLink>
          </div>
        </Container>
      </section>

      <ServicePortalBand serviceName="your services" />
    </div>
  );
}
