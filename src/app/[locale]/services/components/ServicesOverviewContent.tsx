"use client";

import React from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Button, Container, Icon, Reveal } from "@/components/a4-landing/Primitives";
import {
  A4_SERVICES_DATA,
  A4_SERVICES_LEFT,
  A4_SERVICES_RIGHT,
  SERVICE_KEY_TO_SLUG,
  type ServiceKey,
} from "@/data/a4ServicesSiteData";
import { PageHero } from "./PageHero";
import { ServiceClosing } from "./ServiceClosing";
import { ServicePortalBand } from "./ServicePortalBand";
import { useLocalizedHref } from "./useLocalizedHref";

function ServiceColumn({ slugs }: { slugs: ServiceKey[] }) {
  return (
    <div className="flex flex-col gap-[14px]">
      {slugs.map((key, i) => {
        const s = A4_SERVICES_DATA[key];
        const slug = SERVICE_KEY_TO_SLUG[key];
        const teaser = s.lead.split(" — ")[0].split(". ")[0].replace(/\.$/, "") + ".";
        return (
          <Reveal key={key} delay={i * 50}>
            <LocalizedLink
              href={`/services/${slug}`}
              className="flex items-center gap-4 bg-[var(--a4-surface-card)] border border-[var(--a4-hairline-light)] rounded-[var(--a4-r-lg)] py-5 px-[22px] no-underline hover:border-[var(--a4-hairline-strong)] transition-colors duration-150"
            >
              <span className="w-12 h-12 rounded-[var(--a4-r-md)] bg-[var(--a4-surface-soft)] grid place-items-center shrink-0">
                <Icon name={s.icon} size={22} color="var(--a4-primary)" stroke={1.75} />
              </span>
              <span className="flex-1 min-w-0">
                <span
                  className="block a4-font-display font-medium text-[var(--a4-ink)] text-[19px]"
                  style={{ letterSpacing: "-.2px" }}
                >
                  {s.name}
                </span>
                <span
                  className="block a4-font-body text-[var(--a4-mute)] mt-[3px]"
                  style={{ fontSize: 13.5, lineHeight: 1.5, textWrap: "pretty" }}
                >
                  {teaser}
                </span>
              </span>
              <Icon name="arrow-right" size={18} color="var(--a4-mute)" />
            </LocalizedLink>
          </Reveal>
        );
      })}
    </div>
  );
}

export function ServicesOverviewContent() {
  const href = useLocalizedHref();

  return (
    <div className="a4-services-page">
      <PageHero
        eyebrow="Our services"
        title="One licensed firm. Every obligation covered."
        sub="Assurance-led accounting, tax, corporate and audit services for businesses in and through Malta — scoped clearly, priced transparently, delivered through one portal."
      >
        <div className="flex gap-3 justify-center flex-wrap mt-8">
          <Button variant="primary" size="lg" href={href("/contact")}>
            Book a consultation <Icon name="arrow-right" size={18} color="#000" />
          </Button>
          <Button variant="outline-dark" size="lg" href={href("/pricing")}>
            How pricing works
          </Button>
        </div>
      </PageHero>

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(56px,8vw,96px) 0" }}>
        <Container>
          <div
            className="two-col grid gap-[14px] items-start"
            style={{ gridTemplateColumns: "1fr 1fr" }}
          >
            <ServiceColumn slugs={A4_SERVICES_LEFT} />
            <ServiceColumn slugs={A4_SERVICES_RIGHT} />
          </div>
        </Container>
      </section>

      <ServicePortalBand serviceName="any of our services" />
      <ServiceClosing serviceName="your business" />
    </div>
  );
}
