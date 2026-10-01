"use client";

import React from "react";
import { Icon } from "@/components/a4-landing/Primitives";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { CtaCard, DarkCta, PillLink, Pills } from "@/app/[locale]/services/components/SiteKit";
import ContentSection from "./ContentSection";

type Section = { title?: string; content: string[]; list?: string[] };

/**
 * /partners/white-label/client-portal and /audit-portal: the shared hero, the
 * page's content in the terms layout, the portal tour and the dark closing
 * band of the white-label model.
 */
export default function WhiteLabelPortalPage({
  crumb,
  pageTitle,
  heroSub,
  title,
  description,
  sections,
}: {
  /** Last breadcrumb ("Client Portal"). */
  crumb: string;
  pageTitle: string;
  heroSub: string;
  title: string;
  description: string;
  sections: Section[];
}) {
  return (
    <div className="a4-site-page" style={{ background: "#09090B" }}>
      <PageHero eyebrow={`Partners · White Label · ${crumb}`} title={pageTitle} sub={heroSub}>
        <Pills>
          <PillLink href="/contact" variant="light">
            Discuss Partnership
          </PillLink>
          <PillLink href="/partners/white-label" variant="ghost">
            <Icon name="arrow-left" size={18} color="currentColor" />
            White Label
          </PillLink>
        </Pills>
      </PageHero>

      <ContentSection title={title} description={description} sections={sections} />

      <ServicePortalBand serviceName="white-label portals" />

      <DarkCta sec="cta" eyebrow="Next step" typed="Ready to explore" words={[{ t: "white-label?", g: true }]} label="Ready to explore white-label?">
        <CtaCard>
          <p style={{ margin: 0, fontSize: "clamp(19px,1.7vw,22px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.45, color: "#E4E4E7", textWrap: "pretty" }}>
            Tell us about your firm and we&apos;ll assess fit, scope and the right collaboration model.
          </p>
          <PillLink href="/contact" variant="light" style={{ marginTop: 28, width: "100%", height: 64, fontSize: 19 }}>
            Discuss Partnership
          </PillLink>
          <PillLink href="/partners" variant="ghost" style={{ marginTop: 12, width: "100%" }}>
            Compare all models
          </PillLink>
        </CtaCard>
      </DarkCta>
    </div>
  );
}
