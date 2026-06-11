"use client";

import React from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Button, Container, Eyebrow, Icon, Reveal, SectionHead } from "@/components/a4-landing/Primitives";
import { WL_STEPS, WL_USE_CASES, WL_WHAT, WL_WHY } from "@/data/a4WhiteLabelPlatformSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";

export function WhiteLabelPlatformContent() {
  const href = useLocalizedHref();

  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="White-label platform"
        title="Launch your own branded client platform"
        sub="Run your firm on A4's technology — your brand on the outside, our secure, structured platform on the inside."
      >
        <div className="flex gap-3 justify-center flex-wrap mt-[30px]">
          <Button variant="primary" size="lg" href={href("/contact")}>
            Request a demo <Icon name="arrow-right" size={18} color="#000" />
          </Button>
          <Button variant="outline-dark" size="lg" href={href("/partners-platform")}>
            Partner platform
          </Button>
        </div>
      </PageHero>

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <Container>
          <Reveal>
            <SectionHead align="center" eyebrow="What you get" title="A complete platform, in your name" maxWidth={600} />
          </Reveal>
          <div className="grid gap-5 mt-[52px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {WL_WHAT.map((w, i) => (
              <Reveal
                key={w.t}
                delay={i * 60}
                style={{
                  background: "var(--a4-surface-card)",
                  border: "1px solid var(--a4-hairline-light)",
                  borderRadius: "var(--a4-r-lg)",
                  padding: "clamp(24px,3vw,32px)",
                }}
              >
                <span className="w-12 h-12 rounded-[var(--a4-r-md)] bg-[var(--a4-surface-soft)] grid place-items-center inline-grid">
                  <Icon name={w.icon} size={23} color="var(--a4-primary)" stroke={1.75} />
                </span>
                <h3 className="a4-font-display font-medium text-[var(--a4-ink)] mt-[18px] text-[20px] tracking-[-.2px]">{w.t}</h3>
                <p className="a4-font-body text-[var(--a4-mute)] mt-2 text-[14.5px] leading-[1.55]" style={{ textWrap: "pretty" }}>
                  {w.s}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-black" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <Container>
          <Reveal>
            <SectionHead dark align="center" eyebrow="How it works" title="Live in three steps" maxWidth={560} />
          </Reveal>
          <div className="grid gap-5 mt-[52px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {WL_STEPS.map((s, i) => (
              <Reveal
                key={s.n}
                delay={i * 80}
                style={{
                  background: "var(--a4-surface-elevated)",
                  border: "1px solid var(--a4-hairline-dark)",
                  borderRadius: "var(--a4-r-lg)",
                  padding: "30px 28px",
                }}
              >
                <span className="a4-font-display font-medium text-[30px] text-[var(--a4-primary-bright)] tracking-[-1px]">{s.n}</span>
                <h3 className="a4-font-display font-medium text-white mt-[14px] text-[21px] tracking-[-.2px]">{s.t}</h3>
                <p className="a4-font-body text-[var(--a4-on-dark-mute)] mt-2 text-[14.5px] leading-[1.55]" style={{ textWrap: "pretty" }}>
                  {s.s}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <Container>
          <div className="two-col grid items-center gap-12" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <Reveal>
              <Eyebrow>Why firms choose white-label</Eyebrow>
              <h2
                className="a4-font-display font-medium text-[var(--a4-ink)] mt-4 mb-6"
                style={{ fontSize: "clamp(28px,3.6vw,46px)", lineHeight: 1.05, letterSpacing: "-.025em", textWrap: "balance" }}
              >
                Your brand, our engine.
              </h2>
              <div className="flex flex-col gap-[14px]">
                {WL_WHY.map((w) => (
                  <div
                    key={w.t}
                    className="flex gap-[14px] bg-[var(--a4-surface-card)] border border-[var(--a4-hairline-light)] rounded-[var(--a4-r-lg)] py-[18px] px-5"
                  >
                    <span className="w-[42px] h-[42px] rounded-[var(--a4-r-md)] bg-[var(--a4-surface-soft)] grid place-items-center shrink-0">
                      <Icon name={w.icon} size={20} color="var(--a4-primary)" stroke={1.75} />
                    </span>
                    <div>
                      <h3 className="a4-font-display font-medium text-[18px] text-[var(--a4-ink)] m-0">{w.t}</h3>
                      <p className="a4-font-body text-[14px] leading-[1.5] text-[var(--a4-mute)] mt-[3px] mb-0">{w.s}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal
              delay={100}
              style={{ background: "#000", borderRadius: "var(--a4-r-xl)", padding: "clamp(28px,3.4vw,40px)" }}
            >
              <div className="a4-font-body text-[11px] font-bold tracking-[.12em] uppercase text-[var(--a4-stone)]">Use cases</div>
              <div className="flex flex-col gap-3 mt-[18px]">
                {WL_USE_CASES.map((u) => (
                  <div key={u} className="flex items-center gap-3 border-b border-[var(--a4-hairline-dark)] pb-[14px]">
                    <Icon name="check-circle" size={20} color="var(--a4-accent-teal)" />
                    <span className="a4-font-display font-medium text-[20px] text-white tracking-[-.2px]">{u}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-[18px_20px] bg-[var(--a4-surface-elevated)] rounded-[var(--a4-r-md)]">
                <div className="a4-font-body text-[13px] font-semibold text-[var(--a4-on-dark-mute)]">Pricing</div>
                <p className="a4-font-body text-[14.5px] leading-[1.5] text-white mt-[6px] mb-0">
                  Custom to your firm, with full access to the platform. Talk to us for a tailored proposal.
                </p>
              </div>
              <Button variant="primary" size="md" href={href("/contact")} style={{ width: "100%", marginTop: 18 }}>
                Get a proposal <Icon name="arrow-right" size={16} color="#000" />
              </Button>
            </Reveal>
          </div>
        </Container>
      </section>

      <ServicePortalBand serviceName="white-label platform" />
    </div>
  );
}
