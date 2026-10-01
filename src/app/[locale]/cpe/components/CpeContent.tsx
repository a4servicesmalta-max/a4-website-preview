"use client";

import React from "react";
import { Button, Icon, SectionHead } from "@/components/a4-landing/Primitives";
import { DARK_GRID, DriftGlow, LIGHT_GLOW, gradText } from "@/components/fx/primitives";
import { CPE_ITEMS, PODCAST_ITEMS, type CpeItem } from "@/data/a4CpeSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";

const SANS = "var(--a4x-display)";
const BODY = "var(--a4x-body)";
const two = (n: number) => String(n).padStart(2, "0");

/** "Continuing professional education" → the last word carries the gradient. */
function gradLast(title: string) {
  const cut = title.lastIndexOf(" ");
  if (cut < 0) return <span style={{ ...gradText, paddingBottom: ".06em" }}>{title}</span>;
  return (
    <>
      {title.slice(0, cut + 1)}
      <span style={{ ...gradText, paddingBottom: ".06em" }}>{title.slice(cut + 1)}</span>
    </>
  );
}

function CpeBlock({
  n,
  eyebrow,
  title,
  items,
  dark,
  id,
}: {
  n: string;
  eyebrow: string;
  title: string;
  items: CpeItem[];
  dark?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)",
        background: dark ? DARK_GRID : LIGHT_GLOW,
        color: dark ? "#FFFFFF" : "#09090B",
        scrollMarginTop: 72,
      }}
    >
      {dark ? <DriftGlow left="36%" top="-30%" strength={0.24} /> : null}
      <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto" }}>
        <SectionHead dark={dark} n={n} eyebrow={eyebrow} title={gradLast(title)} />
        <div className="cp-grid" style={{ marginTop: "clamp(48px,6vw,80px)" }}>
          {items.map((it, i) => {
            // Cards alternate: on light the odd card is ink, on dark it is white.
            const cardDark = dark ? i % 2 === 0 : i % 2 === 1;
            return (
              <article
                key={it.t}
                data-fx="rise"
                data-d={i * 80}
                className={`cp-card${cardDark ? " cp-dark" : ""}`}
                style={{ minHeight: 300, padding: 28, display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: cardDark ? "#A1A1AA" : "#52525B" }}>
                    <span style={{ color: cardDark ? "#8B8FF7" : "#4F55F1" }}>{two(i + 1)}</span>
                    <span>/ {two(items.length)}</span>
                  </div>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      border: `1px solid ${cardDark ? "rgba(255,255,255,.14)" : "#E4E4E7"}`,
                      background: cardDark ? "rgba(255,255,255,.04)" : "#FAFAFA",
                    }}
                  >
                    <Icon name={it.icon} size={20} color={cardDark ? "#8B8FF7" : "#4F55F1"} />
                  </span>
                </div>
                <div style={{ flex: 1, minHeight: 28 }} />
                <h3 style={{ margin: 0, fontFamily: SANS, fontSize: "clamp(28px,2.6vw,36px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.08 }}>{it.t}</h3>
                <p style={{ margin: 0, fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: cardDark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}>{it.s}</p>
              </article>
            );
          })}
        </div>
      </div>
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Button variant="primary" size="lg" href={href("/contact")}>
            Register for CPE <Icon name="arrow-right" size={18} color="#09090B" />
          </Button>
          <Button variant="outline-dark" size="lg" href="#podcast">
            Listen to the podcast
          </Button>
        </div>
      </PageHero>

      <CpeBlock n="01" eyebrow="CPE" title="Continuing professional education" items={CPE_ITEMS} />
      <CpeBlock n="02" id="podcast" eyebrow="Podcast" title="The A4 podcast" items={PODCAST_ITEMS} dark />

      <ServicePortalBand serviceName="your learning" />
    </div>
  );
}
