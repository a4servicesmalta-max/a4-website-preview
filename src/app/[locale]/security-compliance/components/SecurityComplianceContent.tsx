"use client";

import React from "react";
import { Button, Container, Icon, Reveal } from "@/components/a4-landing/Primitives";
import { SECURITY_COMPLIANCE_BLOCKS } from "@/data/a4SecurityComplianceSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";

export function SecurityComplianceContent() {
  const href = useLocalizedHref();

  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="Security & compliance"
        title="Your data, protected. Your standards, upheld."
        sub="Security and professional integrity aren't features — they're the foundation. Here's how A4 keeps your information safe and your engagements sound."
      />

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(56px,8vw,96px) 0" }}>
        <Container>
          <div className="two-col grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {SECURITY_COMPLIANCE_BLOCKS.map((b, i) => (
              <Reveal
                key={b.t}
                delay={i * 50}
                style={{
                  background: "var(--a4-surface-card)",
                  border: "1px solid var(--a4-hairline-light)",
                  borderRadius: "var(--a4-r-lg)",
                  padding: "clamp(24px,3vw,32px)",
                }}
              >
                <div className="flex items-center gap-[13px]">
                  <span className="w-[46px] h-[46px] rounded-[var(--a4-r-md)] bg-[var(--a4-surface-soft)] grid place-items-center shrink-0">
                    <Icon name={b.icon} size={22} color="var(--a4-primary)" stroke={1.75} />
                  </span>
                  <h3
                    className="a4-font-display font-medium text-[var(--a4-ink)] m-0"
                    style={{ fontSize: "clamp(19px,2.2vw,23px)", letterSpacing: "-.2px" }}
                  >
                    {b.t}
                  </h3>
                </div>
                <div className="flex flex-col gap-[11px] mt-[18px]">
                  {b.p.map((x) => (
                    <div key={x} className="flex gap-[11px]">
                      <Icon name="check" size={17} color="var(--a4-accent-teal)" stroke={2.4} style={{ marginTop: 2, flexShrink: 0 }} />
                      <span className="a4-font-body text-[14.5px] leading-normal text-[var(--a4-charcoal)]" style={{ textWrap: "pretty" }}>
                        {x}
                      </span>
                    </div>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-black" style={{ padding: "clamp(56px,8vw,88px) 0" }}>
        <div aria-hidden="true" className="hero-bg" />
        <Container style={{ position: "relative", textAlign: "center", maxWidth: 640 }}>
          <h2
            className="a4-font-display font-medium text-white m-0"
            style={{ fontSize: "clamp(28px,4vw,46px)", lineHeight: 1.05, letterSpacing: "-.025em", textWrap: "balance" }}
          >
            Questions about security?
          </h2>
          <p className="a4-font-body text-[18px] text-[var(--a4-on-dark-mute)] mt-[14px] mx-auto max-w-[480px]">
            We&apos;re happy to walk your team through our controls in detail.
          </p>
          <div className="mt-7">
            <Button variant="primary" size="lg" href={href("/contact")}>
              Talk to us <Icon name="arrow-right" size={18} color="#000" />
            </Button>
          </div>
        </Container>
      </section>

      <ServicePortalBand serviceName="your data" />
    </div>
  );
}
