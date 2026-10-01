"use client";

import React from "react";
import { WL_STEPS, WL_USE_CASES, WL_WHAT, WL_WHY } from "@/data/a4WhiteLabelPlatformSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { DARK_CARD } from "@/components/fx/primitives";
import {
  BODY,
  Band,
  CtaCard,
  Eyebrow,
  G,
  GRID3,
  Head,
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
import { PortalFilm } from "@/components/film/chapters";

/** The big card word for each part of the platform, and its letter effect. */
const WHAT_WORD: Record<string, [string, CardFx]> = {
  "Fully branded platform": ["Branded", "scatter"],
  "Client portals": ["Portals", "tighten"],
  "Engagement management": ["Engagements", "cascade"],
  "Document requests": ["Documents", "stack"],
  "Compliance calendar": ["Calendar", "zoom"],
};

/**
 * /white-label-platform — hero, 01 what you get as the card grid, 02 the three
 * steps as the timeline on dark, 03 why firms choose it as numbered rows with
 * the use-case card, then the portal tour.
 */
export function WhiteLabelPlatformContent() {
  return (
    <div className="a4-site-page" style={{ background: "#09090B" }}>
      <PageHero
        eyebrow="White-label platform"
        title="Launch your own branded client platform"
        sub="Run your firm on A4's technology — your brand on the outside, our secure, structured platform on the inside."
      >
        <Pills>
          <PillLink href="/contact" variant="light">
            Request a demo
          </PillLink>
          <PillLink href="/partners-platform" variant="ghost">
            Partner platform
          </PillLink>
        </Pills>
      </PageHero>
      <PortalFilm />

      {/* 01 — WHAT YOU GET */}
      <Band surface="light" sec="what">
        <Head
          n="01"
          eyebrow="What you get"
          title={
            <>
              A complete platform, <G>in your name</G>
            </>
          }
        />
        <div style={{ ...GRID3, marginTop: 40 }}>
          {WL_WHAT.map((w, i) => {
            const [word, fx] = WHAT_WORD[w.t] ?? [w.t, "scatter"];
            const dark = i % 2 === 1;
            return (
              <WordCard
                key={w.t}
                i={i}
                total={WL_WHAT.length}
                word={word}
                fx={fx}
                icon={w.icon}
                line={w.t}
                dark={dark}
                d={(i % 3) * 80}
                minHeight={340}
              >
                <p style={{ margin: 0, fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}>{w.s}</p>
              </WordCard>
            );
          })}
        </div>
      </Band>

      {/* 02 — HOW IT WORKS, the timeline on dark */}
      <Band surface="dark" sec="how" glow={{ left: "40%", top: "-10%", strength: 0.24 }}>
        <Head n="02" eyebrow="How it works" dark size="lg" title={<>Live in three <G>steps</G></>} />
        <Timeline dark steps={WL_STEPS.map((s) => ({ key: s.n, t: s.t, s: s.s }))} />
      </Band>

      {/* 03 — WHY FIRMS CHOOSE WHITE-LABEL */}
      <Band surface="white" sec="why">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))", gap: "56px 72px", alignItems: "start" }}>
          <div>
            <Eyebrow n="03">Why firms choose white-label</Eyebrow>
            <h2 style={{ margin: "18px 0 0", fontSize: "clamp(40px,5.2vw,84px)", lineHeight: 1.05, letterSpacing: "-0.035em" }}>
              <span data-fx="rise" data-d="100" style={{ display: "block", fontWeight: 500 }}>
                Your brand,
              </span>
              <span data-fx="rise" data-d="200" style={{ display: "block", fontWeight: 600, letterSpacing: "-0.04em", paddingBottom: ".08em" }}>
                <G>our engine.</G>
              </span>
            </h2>
            <div style={{ marginTop: 40 }}>
              <NumberedRows d={250} items={WL_WHY.map((w) => ({ key: w.t, t: w.t, body: w.s }))} />
            </div>
          </div>

          <CtaCard d={150} style={{ background: DARK_CARD, boxShadow: "0 50px 120px rgba(9,9,11,.22)" }}>
            <div style={{ ...kicker, color: "#A1A1AA" }}>Use cases</div>
            <ol style={{ listStyle: "none", margin: "14px 0 0", padding: 0 }}>
              {WL_USE_CASES.map((u, i) => (
                <li key={u} style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: PERI }}>{pad2(i + 1)}</span>
                  <span style={{ fontSize: "clamp(22px,2vw,26px)", fontWeight: 600, letterSpacing: "-0.03em" }}>{u}</span>
                </li>
              ))}
            </ol>
            <div style={{ marginTop: 26, padding: "18px 20px", borderRadius: 18, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}>
              <div style={{ ...kicker, color: "#A1A1AA" }}>Pricing</div>
              <p style={{ margin: "8px 0 0", fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: "#E4E4E7" }}>
                Custom to your firm, with full access to the platform. Talk to us for a tailored proposal.
              </p>
            </div>
            <PillLink href="/contact" variant="light" style={{ marginTop: 22, width: "100%", height: 64, fontSize: 19 }}>
              Get a proposal
            </PillLink>
          </CtaCard>
        </div>
      </Band>

      <ServicePortalBand serviceName="white-label platform" />
    </div>
  );
}
