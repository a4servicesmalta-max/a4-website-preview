"use client";

import React from "react";
import { LIGHT_GLOW } from "@/components/fx/primitives";
import { ResourceLinkCard } from "@/components/a4-site/ResourceLinkCard";
import { RESOURCE_CARDS } from "@/data/a4ResourcesSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";

export function ResourcesContent() {
  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="Resources"
        title="Everything in one place"
        sub="Guides, insights, tools and answers — a hub to help you get the most from A4 and stay ahead of what's next."
      />

      {/* Card grid — light and dark cards alternate, as in the design */}
      <section style={{ position: "relative", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", background: LIGHT_GLOW }}>
        <div className="cp-grid" style={{ maxWidth: 1280, margin: "0 auto" }}>
          {RESOURCE_CARDS.map((card, i) => (
            <ResourceLinkCard key={card.href} card={card} index={i} total={RESOURCE_CARDS.length} dark={i % 2 === 1} delay={(i % 3) * 80} />
          ))}
        </div>
      </section>

      <ServicePortalBand serviceName="your business" />
    </div>
  );
}
