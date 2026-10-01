"use client";

import React from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Icon } from "@/components/a4-landing/Primitives";
import {
  PRICING_COMMIT,
  PRICING_FACTORS,
  PRICING_HERO_CHIPS,
  PRICING_MODELS,
  PRICING_OUTLINES,
  PRICING_QUOTE_STEPS,
} from "@/data/a4PricingSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import {
  BODY,
  Band,
  CtaCard,
  DOC_PAD,
  DarkCta,
  Doc,
  DocHead,
  G,
  GRID2,
  GRID3,
  Head,
  INDIGO,
  NumberedRows,
  PERI,
  PillLink,
  Pills,
  Timeline,
  WordCard,
  kicker,
  pad2,
  type CardFx,
} from "@/app/[locale]/services/components/SiteKit";

/** Each factor's big card word — the first word of its title. */
const FACTOR_WORD: Record<string, [string, CardFx]> = {
  "Scope of work": ["Scope", "scatter"],
  "Business size & structure": ["Size", "tighten"],
  "Volume & activity levels": ["Volume", "cascade"],
  "Regulatory & compliance": ["Regulatory", "stack"],
  "Risk & responsibility": ["Risk", "zoom"],
  "Duration & timing": ["Duration", "type"],
};

/**
 * /pricing-info — hero with the pricing chips, 01 the six factors as the card
 * grid, 02 the two pricing models on dark, 03 how a quote comes together (the
 * timeline, then what every quote outlines as a quote document), the portal
 * tour, and the commitment as the dark closing band.
 */
export function PricingInfoContent() {
  return (
    <div className="a4-pricing-page">
      <PageHero
        eyebrow="Transparent pricing"
        title="Fair, transparent, and tailored to your needs"
        sub="Published monthly plans for everyday bookkeeping, VAT and payroll — with tailored quotes for audit and more complex engagements. Here's exactly how we price and how a quote comes together."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {PRICING_HERO_CHIPS.map((c) => (
              <span key={c} className="a4-chip a4-chip-dark" style={{ height: "auto", minHeight: 36, padding: "7px 16px", lineHeight: 1.35 }}>
                <span aria-hidden="true" style={{ flexShrink: 0, width: 7, height: 7, borderRadius: 1, background: PERI, transform: "skewX(-30deg)" }} />
                <span style={{ color: "#E4E4E7" }}>{c}</span>
              </span>
            ))}
          </div>
          <Pills>
            <PillLink href="/pricing" variant="light">
              Try the price calculator
            </PillLink>
            <PillLink href="/quote" variant="ghost">
              Get a tailored quote
            </PillLink>
          </Pills>
        </div>
      </PageHero>

      {/* 01 — SIX FACTORS */}
      <Band surface="light" sec="factors">
        <Head
          n="01"
          eyebrow="How pricing is determined"
          title={
            <>
              Six things that shape <G>your fee</G>
            </>
          }
          sub="Every quote is built from the same transparent factors — no guesswork, no arbitrary tiers."
        />
        <div style={{ ...GRID3, marginTop: 40 }}>
          {PRICING_FACTORS.map((f, i) => {
            const [word, fx] = FACTOR_WORD[f.t] ?? [f.t.split(" ")[0], "scatter"];
            const dark = i % 2 === 1;
            return (
              <WordCard key={f.t} i={i} total={PRICING_FACTORS.length} word={word} fx={fx} icon={f.icon} line={f.t} dark={dark} d={(i % 3) * 80} minHeight={340}>
                <p style={{ margin: 0, fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}>{f.s}</p>
              </WordCard>
            );
          })}
        </div>
      </Band>

      {/* 02 — PRICING MODELS, on dark */}
      <Band surface="dark" sec="models" glow={{ left: "40%", top: "-10%", strength: 0.24 }} sweep>
        <Head
          n="02"
          dark
          eyebrow="Service pricing models"
          title={
            <>
              Priced the way each service <G>works</G>
            </>
          }
        />
        <div style={{ ...GRID2, marginTop: 40 }}>
          {PRICING_MODELS.map((m, i) => (
            <div key={m.tag} className="a4k-card a4k-card-glass" style={{ minHeight: 300, gap: 0 }} data-fx="rise" data-d={i * 90 || undefined}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span style={{ ...kicker, color: PERI }}>{m.tag}</span>
                <span aria-hidden="true" style={{ width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 999, background: "rgba(139,143,247,.14)" }}>
                  <Icon name={m.icon} size={20} color={PERI} stroke={1.8} />
                </span>
              </div>
              <h3 style={{ margin: "auto 0 0", paddingTop: 40, fontSize: "clamp(26px,2.4vw,34px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.12, color: "#FFFFFF", textWrap: "balance" }}>{m.t}</h3>
              <p style={{ margin: "14px 0 0", fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: "#A1A1AA", textWrap: "pretty" }}>{m.s}</p>
            </div>
          ))}
        </div>
        <div
          data-fx="rise"
          data-d="120"
          style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "20px 24px", borderRadius: 24, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.03)" }}
        >
          <span className="a4-bullet" style={{ marginTop: 0, background: PERI }} />
          <span style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: "#E4E4E7", textWrap: "pretty" }}>
            Audit and complex engagements are scoped individually —{" "}
            <LocalizedLink href="/contact" style={{ color: "#FFFFFF", fontWeight: 600, textDecoration: "underline", textDecorationColor: "rgba(139,143,247,.6)", textUnderlineOffset: 4 }}>
              book a call
            </LocalizedLink>{" "}
            for a fixed quote.
          </span>
        </div>
      </Band>

      {/* 03 — HOW QUOTES WORK */}
      <Band surface="light" sec="quotes">
        <Head
          n="03"
          eyebrow="How quotes work"
          size="lg"
          title={
            <>
              From first chat to confirmed <G>quote</G>
            </>
          }
        />
        <Timeline steps={PRICING_QUOTE_STEPS.map((s) => ({ key: s.n, t: s.t, s: s.s }))} />

        <Doc style={{ marginTop: "clamp(88px,10vw,140px)" }}>
          <DocHead k="Quotation" title="Every quote clearly outlines" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", columnGap: 40, padding: `28px ${DOC_PAD} 40px` }}>
            {PRICING_OUTLINES.map((o, i) => (
              <div key={o} style={{ display: "flex", alignItems: "baseline", gap: 16, padding: "18px 0", borderTop: "1px solid #E4E4E7" }}>
                <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: ".02em", color: INDIGO }}>{pad2(i + 1)}</span>
                <span style={{ fontSize: "clamp(20px,1.8vw,24px)", fontWeight: 600, letterSpacing: "-0.03em" }}>{o}</span>
              </div>
            ))}
          </div>
        </Doc>
      </Band>

      <ServicePortalBand serviceName="your services" />

      {/* OUR COMMITMENT — the dark closing band */}
      <DarkCta sec="commitment" eyebrow="Our commitment" typed="Pricing you" words={[{ t: "can trust.", g: true }]} label="Pricing you can trust.">
        <CtaCard>
          <NumberedRows dark items={PRICING_COMMIT.map((c) => ({ key: c, t: c }))} />
          <PillLink href="/quote" variant="light" style={{ marginTop: 28, width: "100%", height: 64, fontSize: 19 }}>
            Get a tailored quote
          </PillLink>
          <PillLink href="/pricing" variant="ghost" style={{ marginTop: 12, width: "100%" }}>
            Try the price calculator
          </PillLink>
        </CtaCard>
      </DarkCta>
    </div>
  );
}
