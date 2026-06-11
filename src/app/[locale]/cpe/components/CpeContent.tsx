"use client";

import React from "react";
import { Button, Container, Icon, Reveal, SectionHead } from "@/components/a4-landing/Primitives";
import { CPE_ITEMS, PODCAST_ITEMS, type CpeItem } from "@/data/a4CpeSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";

function CpeBlock({
  eyebrow,
  title,
  items,
  dark,
  id,
}: {
  eyebrow: string;
  title: string;
  items: CpeItem[];
  dark?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={dark ? "relative overflow-hidden bg-black" : "bg-[var(--a4-canvas-light)]"}
      style={{ padding: "clamp(56px,8vw,96px) 0" }}
    >
      {dark && <div aria-hidden="true" className="hero-bg" />}
      <Container style={{ position: "relative" }}>
        <Reveal>
          <SectionHead dark={dark} align="center" eyebrow={eyebrow} title={title} maxWidth={560} />
        </Reveal>
        <div className="grid gap-5 mt-12" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {items.map((it, i) => (
            <Reveal
              key={it.t}
              delay={i * 70}
              style={{
                background: dark ? "var(--a4-surface-elevated)" : "var(--a4-surface-card)",
                border: `1px solid ${dark ? "var(--a4-hairline-dark)" : "var(--a4-hairline-light)"}`,
                borderRadius: "var(--a4-r-lg)",
                padding: "clamp(24px,3vw,32px)",
              }}
            >
              <span
                className="w-12 h-12 rounded-[var(--a4-r-md)] grid place-items-center"
                style={{ background: dark ? "rgba(73,79,223,.16)" : "var(--a4-surface-soft)" }}
              >
                <Icon name={it.icon} size={23} color={dark ? "var(--a4-primary-bright)" : "var(--a4-primary)"} stroke={1.75} />
              </span>
              <h3
                className="a4-font-display font-medium mt-[18px] m-0 tracking-[-.2px] text-[20px]"
                style={{ color: dark ? "#fff" : "var(--a4-ink)" }}
              >
                {it.t}
              </h3>
              <p
                className="a4-font-body mt-2 m-0 text-[14.5px] leading-[1.55]"
                style={{ color: dark ? "var(--a4-on-dark-mute)" : "var(--a4-mute)", textWrap: "pretty" }}
              >
                {it.s}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function CpeContent() {
  const href = useLocalizedHref();

  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="CPE & Podcast"
        title="Keep learning. Stay current."
        sub="Accredited continuing education and candid conversations from the A4 team — to help you and your firm stay sharp."
      >
        <div className="flex gap-3 justify-center flex-wrap mt-[30px]">
          <Button variant="primary" size="lg" href={href("/contact")}>
            Register for CPE <Icon name="arrow-right" size={18} color="#000" />
          </Button>
          <Button variant="outline-dark" size="lg" href="#podcast">
            Listen to the podcast
          </Button>
        </div>
      </PageHero>

      <CpeBlock eyebrow="CPE" title="Continuing professional education" items={CPE_ITEMS} />
      <CpeBlock id="podcast" eyebrow="Podcast" title="The A4 podcast" items={PODCAST_ITEMS} dark />

      <ServicePortalBand serviceName="your learning" />
    </div>
  );
}
