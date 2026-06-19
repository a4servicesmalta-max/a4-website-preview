"use client";

import React from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Button, Container, Eyebrow, Icon, Reveal, SectionHead } from "@/components/a4-landing/Primitives";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { PARTNER_MODELS } from "@/data/a4PartnersSiteData";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";
import { cn } from "@/lib/utils";

export type PartnerSection = {
  title?: string;
  content: string[];
  list?: string[];
};

type PartnerSubpageLayoutProps = {
  icon: string;
  modelLabel: string;
  pageTitle: string;
  heroTitle: string;
  heroDescription: string;
  ctaLabel: string;
  ctaHref: string;
  sections: PartnerSection[];
  currentHref: string;
  children?: React.ReactNode;
};

function isProcessSection(title?: string) {
  if (!title) return false;
  return /how .* works|how a4 assists|process/i.test(title);
}

export function PartnerSubpageLayout({
  icon,
  modelLabel,
  pageTitle,
  heroTitle,
  heroDescription,
  ctaLabel,
  ctaHref,
  sections,
  currentHref,
  children,
}: PartnerSubpageLayoutProps) {
  const href = useLocalizedHref();
  const featured = sections[0];
  const rest = sections.slice(1);

  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow={`Partners · ${modelLabel}`}
        title={pageTitle}
        sub={heroDescription}
      >
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 mt-8 w-full max-w-lg mx-auto sm:max-w-none px-1">
          <LocalizedLink
            href="/partners"
            className="inline-flex items-center justify-center gap-1.5 a4-font-body text-[14px] font-semibold no-underline py-2"
            style={{ color: "var(--a4-on-dark-mute)" }}
          >
            <Icon name="arrow-left" size={15} color="var(--a4-on-dark-mute)" />
            All partnership models
          </LocalizedLink>
          <Button variant="primary" size="lg" href={href(ctaHref)} style={{ width: "100%", maxWidth: 360 }}>
            {ctaLabel} <Icon name="arrow-right" size={18} color="#000" />
          </Button>
        </div>
      </PageHero>

      <section
        className="border-b border-[var(--a4-hairline-dark)] bg-black"
        style={{ padding: "0 0 clamp(28px,4vw,40px)" }}
      >
        <Container>
          <div className="px-1 sm:px-0">
          <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory sm:mx-0">
            {PARTNER_MODELS.map((m) => {
              const active = m.href === currentHref;
              return (
                <LocalizedLink
                  key={m.href}
                  href={m.href}
                  className={cn(
                    "snap-start shrink-0 inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 sm:px-4 a4-font-body text-[12.5px] sm:text-[13px] font-semibold no-underline transition-colors",
                    active
                      ? "bg-[var(--a4-primary)] text-white"
                      : "bg-[var(--a4-surface-elevated)] text-[var(--a4-on-dark-mute)] border border-[var(--a4-hairline-dark)] hover:text-white"
                  )}
                >
                  <Icon name={m.icon} size={15} color={active ? "#fff" : "var(--a4-primary-bright)"} stroke={1.75} />
                  {m.t}
                </LocalizedLink>
              );
            })}
          </div>
          </div>
        </Container>
      </section>

      {children}

      {featured && (
        <section className="bg-black border-b border-[var(--a4-hairline-dark)]" style={{ padding: "clamp(56px,8vw,88px) 0" }}>
          <Container>
            <Reveal>
              <div
                className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr] items-start"
                style={{
                  background: "linear-gradient(145deg, rgba(73,79,223,.18) 0%, var(--a4-surface-elevated) 55%)",
                  border: "1px solid rgba(73,79,223,.35)",
                  borderRadius: "var(--a4-r-lg)",
                  padding: "clamp(28px,4vw,44px)",
                  boxShadow: "0 24px 48px -16px rgba(73,79,223,.25)",
                }}
              >
                <div>
                  <span
                    className="grid place-items-center w-14 h-14 rounded-[var(--a4-r-md)]"
                    style={{ background: "rgba(73,79,223,.25)", border: "1px solid rgba(73,79,223,.4)" }}
                  >
                    <Icon name={icon} size={26} color="var(--a4-primary-bright)" stroke={1.75} />
                  </span>
                  <div className="mt-5">
                    <Eyebrow dark>Overview</Eyebrow>
                  </div>
                  <h2
                    className="a4-font-display font-medium text-white mt-3"
                    style={{ fontSize: "clamp(24px,3vw,34px)", lineHeight: 1.12, letterSpacing: "-.02em", textWrap: "balance" }}
                  >
                    {heroTitle}
                  </h2>
                </div>
                <div className="space-y-4">
                  {featured.title && (
                    <h3 className="a4-font-body text-[13px] font-bold uppercase tracking-[.12em] text-[var(--a4-primary-bright)]">
                      {featured.title}
                    </h3>
                  )}
                  {featured.content.map((p, i) => (
                    <p key={i} className="a4-font-body text-[15.5px] leading-[1.65] text-[var(--a4-on-dark-mute)]" style={{ textWrap: "pretty" }}>
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>
          </Container>
        </section>
      )}

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(56px,8vw,96px) 0" }}>
        <Container>
          <Reveal>
            <SectionHead align="center" eyebrow="In detail" title="How this partnership works" maxWidth={560} />
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-12">
            {rest.map((section, i) => {
              const process = isProcessSection(section.title) && section.list && section.list.length > 0;

              if (process) {
                return (
                  <div key={section.title ?? i} className="lg:col-span-2">
                    <Reveal delay={i * 50}>
                    <div
                      style={{
                        background: "var(--a4-surface-card)",
                        border: "1px solid var(--a4-hairline-light)",
                        borderRadius: "var(--a4-r-lg)",
                        padding: "clamp(26px,3vw,36px)",
                      }}
                    >
                      {section.title && (
                        <h3 className="a4-font-display font-medium text-[var(--a4-ink)]" style={{ fontSize: "clamp(20px,2.4vw,26px)" }}>
                          {section.title}
                        </h3>
                      )}
                      {section.content.map((p, pi) => (
                        <p key={pi} className="a4-font-body text-[15px] leading-[1.6] text-[var(--a4-mute)] mt-3" style={{ textWrap: "pretty" }}>
                          {p}
                        </p>
                      ))}
                      <ol className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-6">
                        {section.list!.map((item, li) => (
                          <li
                            key={li}
                            className="flex flex-col gap-3 rounded-[var(--a4-r-md)] border border-[var(--a4-hairline-light)] bg-[var(--a4-surface-soft)] p-4"
                          >
                            <span
                              className="a4-font-display font-medium text-[var(--a4-primary)]"
                              style={{ fontSize: 28, lineHeight: 1, letterSpacing: "-.02em" }}
                            >
                              {String(li + 1).padStart(2, "0")}
                            </span>
                            <span className="a4-font-body text-[14px] leading-[1.55] text-[var(--a4-ink)]">{item}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    </Reveal>
                  </div>
                );
              }

              return (
                <Reveal
                  key={section.title ?? i}
                  delay={i * 50}
                  style={{
                    background: "var(--a4-surface-card)",
                    border: "1px solid var(--a4-hairline-light)",
                    borderRadius: "var(--a4-r-lg)",
                    padding: "clamp(24px,3vw,32px)",
                    height: "100%",
                  }}
                >
                  {section.title && (
                    <h3 className="a4-font-display font-medium text-[var(--a4-ink)]" style={{ fontSize: "clamp(18px,2.2vw,22px)", letterSpacing: "-.02em" }}>
                      {section.title}
                    </h3>
                  )}
                  <div className="space-y-3 mt-4">
                    {section.content.map((p, pi) => (
                      <p key={pi} className="a4-font-body text-[14.5px] leading-[1.6] text-[var(--a4-mute)]" style={{ textWrap: "pretty" }}>
                        {p}
                      </p>
                    ))}
                  </div>
                  {section.list && section.list.length > 0 && (
                    <ul className="mt-5 space-y-2.5">
                      {section.list.map((item, li) => (
                        <li key={li} className="flex items-start gap-2.5">
                          <Icon name="check" size={16} color="var(--a4-primary)" stroke={2.4} style={{ marginTop: 2, flexShrink: 0 }} />
                          <span className="a4-font-body text-[14px] leading-[1.55] text-[var(--a4-ink)]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-black" style={{ padding: "clamp(56px,8vw,88px) 0" }}>
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(73,79,223,.14) 0%, transparent 65%)" }}
        />
        <Container style={{ position: "relative", textAlign: "center", maxWidth: 640 }}>
          <Reveal>
            <Eyebrow dark>Next step</Eyebrow>
            <h2
              className="a4-font-display font-medium text-white mt-4"
              style={{ fontSize: "clamp(28px,4vw,42px)", lineHeight: 1.08, letterSpacing: "-.025em", textWrap: "balance" }}
            >
              Ready to explore {modelLabel.toLowerCase()}?
            </h2>
            <p className="a4-font-body text-[var(--a4-on-dark-mute)] mt-4 text-[17px] leading-[1.6]" style={{ textWrap: "pretty" }}>
              Tell us about your firm and we&apos;ll assess fit, scope and the right collaboration model.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center mt-8 w-full max-w-md sm:max-w-none mx-auto px-1">
              <Button variant="primary" size="lg" href={href(ctaHref)} style={{ width: "100%", maxWidth: 360 }}>
                {ctaLabel} <Icon name="arrow-right" size={18} color="#000" />
              </Button>
              <LocalizedLink href="/partners" className="w-full sm:w-auto" style={{ maxWidth: 360 }}>
                <Button variant="outline-dark" size="lg" style={{ width: "100%" }}>
                  Compare all models
                </Button>
              </LocalizedLink>
            </div>
          </Reveal>
        </Container>
      </section>

      <ServicePortalBand serviceName="partner engagements" />
    </div>
  );
}

export function usePartnerSections(
  t: (key: string, opts?: { returnObjects?: boolean }) => string | string[] | undefined,
  prefix: string,
  count: number,
) {
  return React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const list = t(`${prefix}.sections.${i}.list`, { returnObjects: true });
      const content = t(`${prefix}.sections.${i}.content`, { returnObjects: true });
      return {
        title: t(`${prefix}.sections.${i}.title`) as string | undefined,
        content: Array.isArray(content) ? content : [],
        list: Array.isArray(list) ? list : undefined,
      } satisfies PartnerSection;
    });
  }, [t, prefix, count]);
}
