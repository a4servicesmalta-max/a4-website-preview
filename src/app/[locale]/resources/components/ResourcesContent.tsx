"use client";

import React from "react";
import { Container } from "@/components/a4-landing/Primitives";
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

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(56px,8vw,96px) 0" }}>
        <Container>
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {RESOURCE_CARDS.map((card, i) => (
              <ResourceLinkCard key={card.href} card={card} delay={i * 60} />
            ))}
          </div>
        </Container>
      </section>

      <ServicePortalBand serviceName="your business" />
    </div>
  );
}
