"use client";

import React from "react";
import { Icon } from "@/components/a4-landing/Primitives";
import { PARTNER_CRITERIA, PARTNER_MODELS } from "@/data/a4PartnersSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import {
  Band,
  CtaCard,
  DarkCta,
  Eyebrow,
  G,
  GRID2,
  Head,
  NumberedRows,
  PillLink,
  Pills,
  WordCard,
  type CardFx,
} from "@/app/[locale]/services/components/SiteKit";

/** The big card word per model (the design's "Accounting" / "Audit" cards). */
const MODEL_WORD: Record<string, [string, CardFx]> = {
  "/partners/service-delivery": ["Delivery", "scatter"],
  "/partners/white-label": ["White-label", "tighten"],
  "/partners/technology-support": ["Integration", "cascade"],
  "/partners/reseller-program": ["Reseller", "zoom"],
};

/**
 * /partners — hero, 01 the four partnership models as the design's card grid,
 * the portal tour, 02 how partners are evaluated as numbered rows, and the
 * dark closing band.
 */
export function PartnersInfoContent() {
  return (
    <div className="a4-site-page" style={{ background: "#09090B" }}>
      <PageHero eyebrow="Partnerships" title="Partner with A4" sub="Grow your firm with A4 — whether you want us to deliver work, run on our technology, integrate our platform, or earn by referring clients.">
        <Pills>
          <PillLink href="/contact" variant="light">
            Become a partner
          </PillLink>
          <PillLink href="/partners-platform" variant="ghost">
            Partner platform
          </PillLink>
        </Pills>
      </PageHero>

      {/* 01 — PARTNERSHIP MODELS */}
      <Band surface="light" sec="models">
        <Head
          n="01"
          eyebrow="Partnership models"
          title={
            <>
              Four ways to work <G>with us.</G>
            </>
          }
        />
        <div style={{ ...GRID2, marginTop: 40 }}>
          {PARTNER_MODELS.map((m, i) => {
            const [word, fx] = MODEL_WORD[m.href] ?? [m.t, "scatter"];
            const dark = i % 2 === 1;
            return (
              <WordCard
                key={m.t}
                href={m.href}
                ariaLabel={m.t}
                i={i}
                total={PARTNER_MODELS.length}
                word={word}
                fx={fx}
                icon={m.icon}
                line={m.s}
                dark={dark}
                d={(i % 2) * 80}
                foot={<span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", color: dark ? "#FFFFFF" : "#09090B" }}>{m.t}</span>}
                go={
                  <>
                    Learn more <Icon name="arrow-right" size={14} color="currentColor" />
                  </>
                }
              />
            );
          })}
        </div>
      </Band>

      <ServicePortalBand serviceName="partner engagements" />

      {/* 02 — HOW WE EVALUATE PARTNERSHIPS */}
      <Band surface="white" sec="criteria">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "56px 72px", alignItems: "start" }}>
          <div>
            <Eyebrow n="02">How we evaluate partnerships</Eyebrow>
            <h2 style={{ margin: "18px 0 0", fontSize: "clamp(40px,5.2vw,84px)", lineHeight: 1.05, letterSpacing: "-0.035em" }}>
              <span data-fx="rise" data-d="100" style={{ display: "block", fontWeight: 500 }}>
                We choose
              </span>
              <span data-fx="rise" data-d="200" style={{ display: "block", fontWeight: 600, letterSpacing: "-0.04em", paddingBottom: ".08em" }}>
                <G>partners carefully.</G>
              </span>
            </h2>
            <p data-fx="rise" data-d="300" style={{ margin: "24px 0 0", maxWidth: 460, fontFamily: "var(--a4x-body)", fontSize: 17, lineHeight: 1.6, color: "#52525B", textWrap: "pretty" }}>
              Our clients trust us — so we hold every partner to the same standard we hold ourselves.
            </p>
          </div>
          <NumberedRows d={150} items={PARTNER_CRITERIA.map((c) => ({ key: c.t, t: c.t, body: c.s }))} />
        </div>
      </Band>

      <DarkCta sec="cta" typed="Start a" words={[{ t: "conversation.", g: true }]} label="Start a conversation.">
        <CtaCard>
          <p style={{ margin: 0, fontSize: "clamp(19px,1.7vw,22px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.45, color: "#E4E4E7", textWrap: "pretty" }}>
            Grow your firm with A4 — whether you want us to deliver work, run on our technology, integrate our platform, or earn by referring clients.
          </p>
          <PillLink href="/contact" variant="light" style={{ marginTop: 28, width: "100%", height: 64, fontSize: 19 }}>
            Become a partner
          </PillLink>
          <PillLink href="/partners-platform" variant="ghost" style={{ marginTop: 12, width: "100%" }}>
            Partner platform
          </PillLink>
        </CtaCard>
      </DarkCta>
    </div>
  );
}
