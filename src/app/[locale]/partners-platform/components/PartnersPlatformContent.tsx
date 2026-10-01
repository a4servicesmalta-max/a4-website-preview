"use client";

import React from "react";
import {
  PP_CAPABILITIES,
  PP_CONTROL,
  PP_OPPORTUNITIES,
  PP_PILLARS,
  PP_STEPS,
} from "@/data/a4PartnersPlatformSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import {
  BODY,
  Band,
  Bullets,
  DOC_PAD,
  Doc,
  DocFoot,
  DocHead,
  G,
  GRID2,
  GRID3,
  Head,
  NumberedRows,
  PillLink,
  Pills,
  TextCard,
  Timeline,
  WordCard,
  gradText,
  type CardFx,
} from "@/app/[locale]/services/components/SiteKit";

const OPP_FX: CardFx[] = ["zoom", "type", "stack", "scatter"];

/** "€4 per client / month" — the design's gradient figure. */
function Price({ dark = false, size = "clamp(40px,4.4vw,64px)" }: { dark?: boolean; size?: string }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10 }}>
      <span style={{ fontSize: size, fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.05, paddingBottom: ".04em", ...gradText }}>€4</span>
      <span style={{ fontFamily: BODY, fontSize: 16, fontWeight: 500, color: dark ? "#A1A1AA" : "#52525B" }}>per client / month</span>
    </div>
  );
}

/**
 * /partners-platform — hero with the price, 01 live opportunities as the card
 * grid, the three pillars and the control terms on dark, 02 the joining
 * timeline with the capabilities as a quote document, then the portal tour.
 */
export function PartnersPlatformContent() {
  return (
    <div className="a4-site-page" style={{ background: "#09090B" }}>
      <PageHero
        eyebrow="Partner platform"
        title="Run your firm on A4 — and access new client opportunities"
        sub="Manage your existing clients more efficiently, then grow by tapping into live work shared across the A4 Network."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Price dark />
          <Pills>
            <PillLink href="/contact" variant="light">
              Join the network
            </PillLink>
          </Pills>
        </div>
      </PageHero>

      {/* 01 — LIVE OPPORTUNITIES */}
      <Band surface="light" sec="opportunities">
        <Head
          n="01"
          eyebrow="Live opportunities"
          title={
            <>
              Work shared across the <G>A4 Network.</G>
            </>
          }
          sub="A sample of the kinds of engagements partners pick up when they have capacity."
        />
        <div style={{ ...GRID2, marginTop: 40 }}>
          {PP_OPPORTUNITIES.map((o, i) => {
            const dark = i % 2 === 1;
            return (
              <WordCard key={o.t} i={i} total={PP_OPPORTUNITIES.length} word={o.tag} fx={OPP_FX[i % OPP_FX.length]} line={o.t} dark={dark} d={(i % 2) * 80} minHeight={300}>
                <p style={{ margin: 0, fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}>{o.s}</p>
              </WordCard>
            );
          })}
        </div>
      </Band>

      {/* 02 — PILLARS + CONTROL, on dark */}
      <Band surface="dark" sec="pillars" glow={{ left: "40%", top: "-10%", strength: 0.24 }} sweep>
        <div style={GRID3}>
          {PP_PILLARS.map((p, i) => (
            <TextCard key={p.t} i={i} total={PP_PILLARS.length} icon={p.icon} title={p.t} text={p.s} tone="glass" d={i * 80} minHeight={280} />
          ))}
        </div>
        <div style={{ marginTop: "clamp(96px,11vw,160px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "48px 72px", alignItems: "start" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "clamp(40px,5.2vw,84px)", lineHeight: 1.05, letterSpacing: "-0.035em", color: "#FFFFFF" }}>
              <span data-fx="rise" data-d="100" style={{ display: "block", fontWeight: 500 }}>
                Control &amp; ownership,
              </span>
              <span data-fx="rise" data-d="200" style={{ display: "block", fontWeight: 600, letterSpacing: "-0.04em", paddingBottom: ".08em" }}>
                <G>built in</G>
              </span>
            </h2>
          </div>
          <NumberedRows dark d={150} items={PP_CONTROL.map((c) => ({ key: c, t: c }))} />
        </div>
      </Band>

      {/* 03 — HOW IT WORKS + CAPABILITIES */}
      <Band surface="light" sec="how">
        <Head
          n="02"
          eyebrow="How it works"
          size="lg"
          title={
            <>
              From joining to <G>growing</G>
            </>
          }
        />
        <Timeline steps={PP_STEPS.map((s) => ({ key: s.n, t: s.t, s: s.s }))} />

        <Doc style={{ marginTop: "clamp(88px,10vw,140px)" }}>
          <DocHead k="Partner platform" title="Platform capabilities" />
          <div style={{ padding: `32px ${DOC_PAD} 40px` }}>
            <Bullets items={PP_CAPABILITIES} cols={260} size={16} />
          </div>
          <DocFoot style={{ alignItems: "center" }}>
            <Price />
            <PillLink href="/contact" variant="ink" size="md">
              Join the network
            </PillLink>
          </DocFoot>
        </Doc>
      </Band>

      <ServicePortalBand serviceName="partner platform" />
    </div>
  );
}
