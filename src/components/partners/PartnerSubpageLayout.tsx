"use client";

import React from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Icon } from "@/components/a4-landing/Primitives";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import {
  BODY,
  Band,
  CtaCard,
  DarkCta,
  Eyebrow,
  G,
  Head,
  INK,
  NumberedRows,
  PERI,
  PillLink,
  Pills,
  ProseWithList,
  Timeline,
  pad2,
} from "@/app/[locale]/services/components/SiteKit";
import { PARTNER_MODELS } from "@/data/a4PartnersSiteData";

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

/** "Working as a Service Delivery Partner" → last word on the gradient. */
function withGradEnd(text: string) {
  const cut = text.trim().lastIndexOf(" ");
  if (cut <= 0) return <G>{text}</G>;
  return (
    <>
      {text.slice(0, cut + 1)}
      <G>{text.slice(cut + 1)}</G>
    </>
  );
}

/** Paragraphs and an optional list — the body of a numbered row. */
function SectionBody({ section }: { section: PartnerSection }) {
  return <ProseWithList content={section.content} list={section.list} />;
}

/**
 * The partner sub-pages (service delivery, white-label, technology support,
 * reseller): hero with the model switcher, 01 overview, the page's own block,
 * any process as the design's timeline, every other section as numbered rows,
 * the portal tour and the dark closing band.
 */
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
  const featured = sections[0];
  const rest = sections.slice(1);
  const process = rest.filter((s) => isProcessSection(s.title) && s.list && s.list.length > 0);
  const rows = rest.filter((s) => !process.includes(s));
  let next = 2;

  return (
    <div className="a4-site-page" style={{ background: "#09090B" }}>
      <PageHero eyebrow={`Partners · ${modelLabel}`} title={pageTitle} sub={heroDescription}>
        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <Pills>
            <PillLink href={ctaHref} variant="light">
              {ctaLabel}
            </PillLink>
            <PillLink href="/partners" variant="ghost">
              <Icon name="arrow-left" size={18} color="currentColor" />
              All partnership models
            </PillLink>
          </Pills>
          <nav aria-label="Partnership models" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PARTNER_MODELS.map((m) => {
              const active = m.href === currentHref;
              return (
                <LocalizedLink
                  key={m.href}
                  href={m.href}
                  aria-current={active ? "page" : undefined}
                  className="a4-chip a4-chip-dark"
                  style={{
                    textDecoration: "none",
                    fontWeight: 600,
                    ...(active ? { background: "#FFFFFF", color: INK, borderColor: "#FFFFFF" } : null),
                  }}
                >
                  <Icon name={m.icon} size={15} color={active ? INK : PERI} stroke={1.9} />
                  {m.t}
                </LocalizedLink>
              );
            })}
          </nav>
        </div>
      </PageHero>

      {/* 01 — OVERVIEW */}
      {featured ? (
        <Band surface="light" sec="overview">
          <div className="a4k-split a4k-split-top" style={{ alignItems: "start" }}>
            <div>
              <Eyebrow n="01">Overview</Eyebrow>
              <h2
                data-fx="rise"
                data-d="100"
                style={{ margin: "16px 0 0", fontSize: "clamp(36px,4.4vw,68px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.04, textWrap: "balance" }}
              >
                {withGradEnd(heroTitle)}
              </h2>
              <span
                data-fx="rise"
                data-d="200"
                aria-hidden="true"
                style={{ marginTop: 32, width: 56, height: 56, display: "grid", placeItems: "center", borderRadius: 999, background: "rgba(79,85,241,.08)" }}
              >
                <Icon name={icon} size={24} color="#4F55F1" stroke={1.8} />
              </span>
            </div>
            <div data-fx="rise" data-d="160">
              {featured.title ? (
                <h3 style={{ margin: 0, fontSize: "clamp(22px,2vw,28px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.2, textWrap: "balance" }}>{featured.title}</h3>
              ) : null}
              <div style={{ marginTop: featured.title ? 18 : 0, fontFamily: BODY, fontSize: 17, lineHeight: 1.65, color: "#3F3F46" }}>
                <SectionBody section={featured} />
              </div>
            </div>
          </div>
        </Band>
      ) : null}

      {children}

      {/* Process sections — the design's filling timeline. */}
      {process.map((section) => {
        const n = pad2(next++);
        return (
          <Band key={section.title} surface={children ? "light" : "muted"} sec="process">
            <Head n={n} eyebrow={modelLabel} title={section.title ? withGradEnd(section.title) : ""} size="lg" />
            {section.content.length ? (
              <div data-fx="rise" data-d="200" style={{ marginTop: 22, maxWidth: 680, fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: "#52525B" }}>
                {section.content.map((p, i) => (
                  <p key={i} style={{ margin: i ? "10px 0 0" : 0 }}>
                    {p}
                  </p>
                ))}
              </div>
            ) : null}
            <Timeline steps={(section.list ?? []).map((item, i) => ({ key: String(i), s: item }))} />
          </Band>
        );
      })}

      {/* Everything else — numbered rows beside a sticky heading. */}
      {rows.length ? (
        <Band surface="white" sec="details">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: "48px 72px", alignItems: "start" }}>
            <div className="a4k-sticky">
              <Eyebrow n={pad2(next)}>In detail</Eyebrow>
              <h2 style={{ margin: "18px 0 0", fontSize: "clamp(40px,5vw,80px)", lineHeight: 1.05, letterSpacing: "-0.035em" }}>
                <span data-fx="rise" data-d="100" style={{ display: "block", fontWeight: 500 }}>
                  How this partnership
                </span>
                <span data-fx="rise" data-d="200" style={{ display: "block", fontWeight: 600, letterSpacing: "-0.04em", paddingBottom: ".08em" }}>
                  <G>works.</G>
                </span>
              </h2>
            </div>
            <NumberedRows d={150} items={rows.map((s, i) => ({ key: s.title ?? String(i), t: s.title, body: <SectionBody section={s} /> }))} />
          </div>
        </Band>
      ) : null}

      <ServicePortalBand serviceName="partner engagements" />

      <DarkCta
        sec="cta"
        eyebrow="Next step"
        typed="Ready to explore"
        words={[{ t: `${modelLabel.toLowerCase()}?`, g: true }]}
        label={`Ready to explore ${modelLabel.toLowerCase()}?`}
      >
        <CtaCard>
          <p style={{ margin: 0, fontSize: "clamp(19px,1.7vw,22px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.45, color: "#E4E4E7", textWrap: "pretty" }}>
            Tell us about your firm and we&apos;ll assess fit, scope and the right collaboration model.
          </p>
          <PillLink href={ctaHref} variant="light" style={{ marginTop: 28, width: "100%", height: 64, fontSize: 19 }}>
            {ctaLabel}
          </PillLink>
          <PillLink href="/partners" variant="ghost" style={{ marginTop: 12, width: "100%" }}>
            Compare all models
          </PillLink>
        </CtaCard>
      </DarkCta>
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
