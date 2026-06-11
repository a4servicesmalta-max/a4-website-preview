"use client";

import React from "react";
import { Button, Container, Icon, Reveal, SectionHead } from "@/components/a4-landing/Primitives";
import {
  PP_CAPABILITIES,
  PP_CONTROL,
  PP_OPPORTUNITIES,
  PP_PILLARS,
  PP_STEPS,
} from "@/data/a4PartnersPlatformSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";

export function PartnersPlatformContent() {
  const href = useLocalizedHref();

  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="Partner platform"
        title="Run your firm on A4 — and access new client opportunities"
        sub="Manage your existing clients more efficiently, then grow by tapping into live work shared across the A4 Network."
      >
        <div className="flex items-baseline gap-[10px] justify-center mt-7">
          <span
            className="a4-font-display font-medium text-white"
            style={{ fontSize: "clamp(34px,5vw,52px)", letterSpacing: "-1.5px" }}
          >
            €4
          </span>
          <span className="a4-font-body text-[16px] text-[var(--a4-on-dark-mute)]">per client / month</span>
        </div>
        <div className="mt-[26px]">
          <Button variant="primary" size="lg" href={href("/contact")}>
            Join the network <Icon name="arrow-right" size={18} color="#000" />
          </Button>
        </div>
      </PageHero>

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <Container>
          <Reveal>
            <SectionHead
              align="center"
              eyebrow="Live opportunities"
              title="Work shared across the A4 Network"
              sub="A sample of the kinds of engagements partners pick up when they have capacity."
              maxWidth={620}
            />
          </Reveal>
          <div className="grid gap-5 mt-[52px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {PP_OPPORTUNITIES.map((o, i) => (
              <Reveal
                key={o.t}
                delay={i * 60}
                style={{
                  background: "var(--a4-surface-card)",
                  border: "1px solid var(--a4-hairline-light)",
                  borderRadius: "var(--a4-r-lg)",
                  padding: "24px",
                }}
              >
                <span
                  className="inline-block a4-font-body text-[11px] font-bold tracking-[.08em] uppercase text-white rounded-[var(--a4-r-full)] py-1 px-[11px]"
                  style={{ background: o.c }}
                >
                  {o.tag}
                </span>
                <h3 className="a4-font-display font-medium text-[var(--a4-ink)] mt-4 text-[19px] tracking-[-.2px]" style={{ textWrap: "balance" }}>
                  {o.t}
                </h3>
                <p className="a4-font-body text-[var(--a4-mute)] mt-2 text-[14px] leading-[1.5] mb-0" style={{ textWrap: "pretty" }}>
                  {o.s}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-black" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <Container>
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {PP_PILLARS.map((p, i) => (
              <Reveal
                key={p.t}
                delay={i * 70}
                style={{
                  background: "var(--a4-surface-elevated)",
                  border: "1px solid var(--a4-hairline-dark)",
                  borderRadius: "var(--a4-r-lg)",
                  padding: "28px 26px",
                }}
              >
                <Icon name={p.icon} size={24} color="var(--a4-primary-bright)" stroke={1.75} />
                <h3 className="a4-font-display font-medium text-white mt-4 text-[20px] tracking-[-.2px]">{p.t}</h3>
                <p className="a4-font-body text-[var(--a4-on-dark-mute)] mt-2 text-[14.5px] leading-[1.5] mb-0" style={{ textWrap: "pretty" }}>
                  {p.s}
                </p>
              </Reveal>
            ))}
          </div>
          <Reveal
            delay={120}
            style={{
              marginTop: 20,
              background: "var(--a4-surface-elevated)",
              border: "1px solid var(--a4-hairline-dark)",
              borderRadius: "var(--a4-r-lg)",
              padding: "clamp(26px,3vw,34px)",
            }}
          >
            <div className="flex items-center gap-[11px] mb-[18px]">
              <Icon name="lock" size={20} color="var(--a4-accent-teal)" />
              <h3 className="a4-font-display font-medium text-[22px] text-white m-0 tracking-[-.2px]">
                Control & ownership, built in
              </h3>
            </div>
            <div className="grid gap-[14px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {PP_CONTROL.map((c) => (
                <div key={c} className="flex items-center gap-[10px]">
                  <Icon name="check" size={16} color="var(--a4-accent-teal)" stroke={2.4} />
                  <span className="a4-font-body text-[15px] text-[var(--a4-on-dark)]">{c}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <Container>
          <Reveal>
            <SectionHead align="center" eyebrow="How it works" title="From joining to growing" maxWidth={560} />
          </Reveal>
          <div
            className="grid gap-0 mt-[52px] border-t border-[var(--a4-hairline-light)]"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
          >
            {PP_STEPS.map((s, i) => (
              <Reveal
                key={s.n}
                delay={i * 60}
                style={{
                  padding: "28px 22px 28px 0",
                  borderRight: i < PP_STEPS.length - 1 ? "1px solid var(--a4-hairline-light)" : "none",
                  paddingLeft: i ? 22 : 0,
                }}
              >
                <div className="w-10 h-10 rounded-full border border-[var(--a4-hairline-strong)] grid place-items-center a4-font-display font-medium text-[16px] text-[var(--a4-ink)]">
                  {s.n}
                </div>
                <h3 className="a4-font-display font-medium text-[var(--a4-ink)] mt-[18px] text-[19px] tracking-[-.2px]">{s.t}</h3>
                <p className="a4-font-body text-[var(--a4-mute)] mt-2 text-[14.5px] leading-[1.5] mb-0" style={{ textWrap: "pretty" }}>
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
                Platform capabilities
              </h3>
              <div className="grid gap-[14px] mt-[22px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
                {PP_CAPABILITIES.map((c) => (
                  <div key={c} className="flex items-center gap-[11px]">
                    <Icon name="check-circle" size={18} color="var(--a4-accent-teal)" />
                    <span className="a4-font-body text-[15px] font-semibold text-[var(--a4-charcoal)]">{c}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-[26px] pt-[22px] border-t border-[var(--a4-hairline-light)] flex-wrap">
                <div className="flex items-baseline gap-2">
                  <span className="a4-font-display font-medium text-[34px] text-[var(--a4-ink)] tracking-[-1px]">€4</span>
                  <span className="a4-font-body text-[14px] text-[var(--a4-mute)]">per client / month</span>
                </div>
                <div className="flex-1" />
                <Button variant="dark" size="md" href={href("/contact")}>
                  Join the network <Icon name="arrow-right" size={16} color="#fff" />
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <ServicePortalBand serviceName="partner platform" />
    </div>
  );
}
