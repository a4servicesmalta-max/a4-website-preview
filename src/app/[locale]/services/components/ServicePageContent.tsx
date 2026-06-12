"use client";

import React from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Button, Container, Eyebrow, Icon, Reveal } from "@/components/a4-landing/Primitives";
import {
  A4_SERVICE_DETAILS,
  A4_SERVICES_DATA,
  SERVICE_KEY_TO_SLUG,
  type A4SiteService,
  type ServiceKey,
} from "@/data/a4ServicesSiteData";
import { PageHero } from "./PageHero";
import { ServiceClosing } from "./ServiceClosing";
import { ServiceOfferingVisual } from "./ServiceOfferingVisual";
import { ServicePortalBand } from "./ServicePortalBand";
import { useLocalizedHref } from "./useLocalizedHref";

export function ServicePageContent({ service }: { service: A4SiteService }) {
  const details = A4_SERVICE_DETAILS[service.key];
  const href = useLocalizedHref();

  return (
    <div className="a4-services-page">
      <PageHero eyebrow="Services" title={service.name} sub={service.lead}>
        <div className="flex gap-3 justify-center flex-wrap mt-8">
          <Button variant="primary" size="lg" href={href("/contact")}>
            Book a consultation <Icon name="arrow-right" size={18} color="#000" />
          </Button>
          <Button variant="outline-dark" size="lg" href={href("/contact")}>
            Contact
          </Button>
        </div>
      </PageHero>

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <Container>
          <div className="two-col grid items-center gap-12" style={{ gridTemplateColumns: "1.15fr .85fr" }}>
            <Reveal>
              <Eyebrow>The offering</Eyebrow>
              <h2
                className="a4-font-display font-medium text-[var(--a4-ink)] mt-4"
                style={{
                  fontSize: "clamp(28px,3.6vw,46px)",
                  lineHeight: 1.05,
                  letterSpacing: "-.025em",
                  textWrap: "balance",
                }}
              >
                What we do
              </h2>
              <p
                className="a4-font-body text-[var(--a4-charcoal)] mt-[18px] max-w-[640px]"
                style={{ fontSize: 17, lineHeight: 1.65, textWrap: "pretty" }}
              >
                {service.intro}
              </p>
              {details?.detail && (
                <p
                  className="a4-font-body text-[var(--a4-mute)] mt-[14px] max-w-[640px]"
                  style={{ fontSize: 15.5, lineHeight: 1.65, textWrap: "pretty" }}
                >
                  {details.detail}
                </p>
              )}
            </Reveal>
            <Reveal delay={90} style={{ display: "flex", justifyContent: "center" }}>
              <ServiceOfferingVisual serviceKey={service.key} title={service.name} />
            </Reveal>
          </div>

          <div
            className="grid gap-5 mt-[52px]"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))" }}
          >
            {service.cards.map((c, i) => (
              <Reveal
                key={c.t}
                delay={i * 80}
                style={{
                  background: "var(--a4-surface-card)",
                  border: "1px solid var(--a4-hairline-light)",
                  borderRadius: "var(--a4-r-lg)",
                  padding: "clamp(24px,3vw,32px)",
                }}
              >
                <span className="w-12 h-12 rounded-[var(--a4-r-md)] bg-[var(--a4-surface-soft)] grid place-items-center inline-grid">
                  <Icon name={c.icon} size={23} color="var(--a4-primary)" stroke={1.75} />
                </span>
                <h3
                  className="a4-font-display font-medium text-[var(--a4-ink)] mt-5 text-[20px]"
                  style={{ letterSpacing: "-.2px" }}
                >
                  {c.t}
                </h3>
                <p
                  className="a4-font-body text-[var(--a4-mute)] mt-[9px]"
                  style={{ fontSize: 14.5, lineHeight: 1.55, textWrap: "pretty" }}
                >
                  {c.s}
                </p>
              </Reveal>
            ))}
          </div>

          {details?.bullets && (
            <Reveal delay={60}>
              <div
                className="mt-12 bg-[var(--a4-surface-card)] border border-[var(--a4-hairline-light)] rounded-[var(--a4-r-lg)]"
                style={{ padding: "clamp(26px,3.2vw,38px)" }}
              >
                <h3
                  className="a4-font-display font-medium text-[var(--a4-ink)] m-0"
                  style={{
                    fontSize: "clamp(20px,2.4vw,26px)",
                    letterSpacing: "-.3px",
                  }}
                >
                  Scope, process &amp; deliverables
                </h3>
                <div
                  className="grid gap-x-7 gap-y-4 mt-[22px]"
                  style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))" }}
                >
                  {details.bullets.map(([k, v]) => (
                    <div key={k} className="flex items-start gap-[11px]">
                      <Icon
                        name="check-circle"
                        size={18}
                        color="var(--a4-accent-teal)"
                        style={{ marginTop: 3, flexShrink: 0 }}
                      />
                      <span
                        className="a4-font-body text-[var(--a4-charcoal)]"
                        style={{ fontSize: 15, lineHeight: 1.55, textWrap: "pretty" }}
                      >
                        <strong className="text-[var(--a4-ink)] font-semibold">{k}.</strong> {v}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </Container>
      </section>

      <ServicePortalBand serviceName={service.name} />

      <section className="bg-black" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <Container>
          <div className="two-col grid items-start gap-12" style={{ gridTemplateColumns: "1fr 1.2fr" }}>
          <Reveal>
            <Eyebrow dark>What&apos;s included</Eyebrow>
            <h2
              className="a4-font-display font-medium text-white mt-4"
              style={{
                fontSize: "clamp(28px,3.6vw,46px)",
                lineHeight: 1.05,
                letterSpacing: "-.025em",
                textWrap: "balance",
              }}
            >
              Scoped clearly, delivered fully.
            </h2>
            <p
              className="a4-font-body text-[var(--a4-on-dark-mute)] mt-4 max-w-[380px]"
              style={{ fontSize: 16, lineHeight: 1.6, textWrap: "pretty" }}
            >
              Every engagement is set out in writing — services, scope and a fixed fee agreed before work begins.
            </p>
          </Reveal>
          <Reveal delay={90}>
            <div className="two-col grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {service.included.map((it) => (
                <div
                  key={it}
                  className="flex items-center gap-[11px] bg-[var(--a4-surface-elevated)] border border-[var(--a4-hairline-dark)] rounded-[var(--a4-r-md)] py-[15px] px-4"
                >
                  <Icon name="check" size={16} color="var(--a4-accent-teal)" stroke={2.4} />
                  <span className="a4-font-body text-[14px] font-semibold text-white">{it}</span>
                </div>
              ))}
            </div>
          </Reveal>
          </div>
        </Container>
      </section>

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <Container>
          <div className="two-col grid items-start gap-12" style={{ gridTemplateColumns: "1.2fr .8fr" }}>
          <Reveal>
            <Eyebrow>Who it&apos;s for</Eyebrow>
            <p
              className="a4-font-display font-medium text-[var(--a4-ink)] mt-4"
              style={{
                fontSize: "clamp(21px,2.6vw,28px)",
                lineHeight: 1.35,
                letterSpacing: "-.3px",
                textWrap: "pretty",
              }}
            >
              {service.who}
            </p>
          </Reveal>
          <Reveal delay={90}>
            <div className="a4-font-body text-[12.5px] font-bold tracking-[.12em] uppercase text-[var(--a4-mute)] mb-[14px]">
              Related services
            </div>
            <div className="flex flex-col gap-[10px]">
              {service.related.map((relatedKey) => {
                const related = A4_SERVICES_DATA[relatedKey as ServiceKey];
                const slug = SERVICE_KEY_TO_SLUG[relatedKey as ServiceKey];
                return (
                  <LocalizedLink
                    key={relatedKey}
                    href={`/services/${slug}`}
                    className="flex items-center justify-between gap-3 bg-[var(--a4-surface-card)] border border-[var(--a4-hairline-light)] rounded-[var(--a4-r-md)] py-[14px] px-4 no-underline hover:border-[var(--a4-hairline-strong)] transition-colors duration-150"
                  >
                    <span className="flex items-center gap-[11px]">
                      <Icon name={related.icon} size={18} color="var(--a4-primary)" stroke={1.8} />
                      <span className="a4-font-body text-[14.5px] font-semibold text-[var(--a4-ink)]">
                        {related.name}
                      </span>
                    </span>
                    <Icon name="arrow-right" size={16} color="var(--a4-mute)" />
                  </LocalizedLink>
                );
              })}
            </div>
          </Reveal>
          </div>
        </Container>
      </section>

      <ServiceClosing serviceName={service.name} />
    </div>
  );
}
