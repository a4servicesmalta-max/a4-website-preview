"use client";

import React from "react";
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
import {
  BODY,
  Band,
  Bullets,
  DOC_PAD,
  Doc,
  DocFoot,
  DocHead,
  DocRow,
  Eyebrow,
  GRID3,
  Head,
  Lead,
  LinkRows,
  PillLink,
  Pills,
  Statement,
  TextCard,
  kicker,
  pad2,
} from "./SiteKit";

/** First sentence of a service lead, for related-service rows. */
function teaser(lead: string) {
  return lead.split(" — ")[0].split(". ")[0].replace(/\.$/, "") + ".";
}

/**
 * The template behind all 18 service pages (also /accounting-malta and
 * /bookkeeping): hero → 01 the offering (copy, the portal visual, three cards)
 * → 02 what's included as the quote document → 03 who it's for with related
 * services as numbered rows → the portal tour → the dark closing band.
 */
export function ServicePageContent({ service }: { service: A4SiteService }) {
  const details = A4_SERVICE_DETAILS[service.key];
  const related = service.related
    .map((key) => ({ key, s: A4_SERVICES_DATA[key as ServiceKey], slug: SERVICE_KEY_TO_SLUG[key as ServiceKey] }))
    .filter((r) => r.s && r.slug);

  return (
    <div className="a4-services-page">
      <PageHero eyebrow="Services" title={service.name} sub={service.lead}>
        <Pills>
          <PillLink href="/contact" variant="light">
            Book a consultation
          </PillLink>
          <PillLink href="/contact" variant="ghost">
            Contact
          </PillLink>
        </Pills>
      </PageHero>

      {/* 01 — THE OFFERING */}
      <Band surface="light" sec="offering">
        <div className="a4k-split">
          <div>
            <Head n="01" eyebrow="The offering" title="What we do" />
            <Lead d={200} style={{ marginTop: 26 }}>
              {service.intro}
            </Lead>
            {details?.detail ? (
              <p data-fx="rise" data-d="280" style={{ margin: "20px 0 0", maxWidth: 640, fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: "#52525B", textWrap: "pretty" }}>
                {details.detail}
              </p>
            ) : null}
          </div>
          <div data-fx="rise" data-d="160" data-dy="70">
            <ServiceOfferingVisual serviceKey={service.key} title={service.name} />
          </div>
        </div>

        <div style={{ ...GRID3, marginTop: "clamp(72px,9vw,120px)" }}>
          {service.cards.map((c, i) => (
            <TextCard
              key={c.t}
              i={i}
              total={service.cards.length}
              icon={c.icon}
              title={c.t}
              text={c.s}
              tone={i % 2 === 1 ? "dark" : "light"}
              d={i * 80}
              minHeight={320}
            />
          ))}
        </div>
      </Band>

      {/* 02 — WHAT'S INCLUDED, as the quote document */}
      <Band surface="muted" sec="included">
        <Eyebrow n="02">What&apos;s included</Eyebrow>
        <Statement
          typed="Scoped clearly,"
          words={[{ t: "delivered" }, { t: "fully.", g: true }]}
          label="Scoped clearly, delivered fully."
          d={120}
          style={{ marginTop: 18 }}
        />

        <Doc rise={false} style={{ marginTop: "clamp(48px,6vw,80px)" }}>
          <DocHead rise k="Service" title={service.name} />
          <div data-fx="rise" data-dy="30" style={{ padding: `32px ${DOC_PAD} 36px` }}>
            <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.03em" }}>What&apos;s included</div>
            <Bullets items={service.included} cols={280} style={{ marginTop: 20 }} />
          </div>
          {details?.bullets?.length ? (
            <>
              <div data-fx="rise" data-dy="30" style={{ padding: `0 ${DOC_PAD} 24px`, fontSize: 24, fontWeight: 600, letterSpacing: "-0.03em" }}>
                Scope, process &amp; deliverables
              </div>
              {details.bullets.map(([k, v], i) => (
                <DocRow key={k} rise n={pad2(i + 1)} word={k}>
                  <p style={{ margin: 0, fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: "#3F3F46", textWrap: "pretty" }}>{v}</p>
                </DocRow>
              ))}
            </>
          ) : null}
          <DocFoot style={{ alignItems: "center" }}>
            <p style={{ margin: 0, maxWidth: 560, fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: "#3F3F46", textWrap: "pretty" }}>
              Every engagement is set out in writing — services, scope and a fixed fee agreed before work begins.
            </p>
            <PillLink href="/contact" variant="ink" size="md">
              Book a consultation
            </PillLink>
          </DocFoot>
        </Doc>
      </Band>

      {/* 03 — WHO IT'S FOR */}
      <Band surface="white" sec="who">
        <div className="a4k-split a4k-split-top" style={{ alignItems: "start" }}>
          <div>
            <Eyebrow n="03">Who it&apos;s for</Eyebrow>
            <p
              data-fx="rise"
              data-d="100"
              style={{ margin: "20px 0 0", fontSize: "clamp(26px,2.5vw,38px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.22, color: "#09090B", textWrap: "pretty" }}
            >
              {service.who}
            </p>
          </div>
          {related.length ? (
            <div data-fx="rise" data-d="180">
              <div style={{ ...kicker, marginBottom: 6 }}>Related services</div>
              <LinkRows items={related.map((r) => ({ key: r.key, href: `/services/${r.slug}`, t: r.s.name, s: teaser(r.s.lead) }))} />
            </div>
          ) : null}
        </div>
      </Band>

      <ServicePortalBand serviceName={service.name} />

      <ServiceClosing serviceName={service.name} />
    </div>
  );
}
