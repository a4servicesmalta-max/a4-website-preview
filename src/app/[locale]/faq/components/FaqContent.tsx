"use client";

import React from "react";
import { Icon } from "@/components/a4-landing/Primitives";
import { DARK_GRID, DriftGlow, LIGHT_GLOW, TypeText, Words, gradText } from "@/components/fx/primitives";
import { Accordion } from "@/components/a4-site/Accordion";
import { FAQ_GROUPS } from "@/data/a4FaqSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { CONTACT_PHONES } from "@/lib/contact";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";

const SANS = "var(--a4x-display)";
const BODY = "var(--a4x-body)";
const INDIGO = "#4F55F1";
const PERI = "#8B8FF7";
const INK = "#09090B";
const SECTION_PAD = "clamp(100px,13vw,180px) clamp(20px,5vw,72px)";

const two = (n: number) => String(n).padStart(2, "0");

/** "Services & delivery" → ["Services &", "delivery"]: the last word takes the gradient line. */
function splitHead(s: string): [string, string] {
  const cut = s.lastIndexOf(" ");
  return cut > 0 ? [s.slice(0, cut), s.slice(cut + 1)] : ["", s];
}

export function FaqContent() {
  const href = useLocalizedHref();
  const total = two(FAQ_GROUPS.length);

  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="FAQs"
        title="Frequently asked questions"
        sub="Everything you might want to know about working with A4 — and how the firm, the people and the technology fit together."
      />

      {/* Numbered FAQ lists, one group per row: heading left, questions right */}
      <section style={{ position: "relative", padding: SECTION_PAD, background: LIGHT_GLOW, color: INK }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: "clamp(80px,10vw,140px)" }}>
          {FAQ_GROUPS.map((g, gi) => {
            const [lead, last] = splitHead(g.cat);
            return (
              <div key={g.cat} className="cp-split" style={{ alignItems: "start" }}>
                <div className="cp-sticky">
                  <div data-fx="rise" style={{ display: "flex", alignItems: "baseline", gap: 8, fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: "#52525B" }}>
                    <span style={{ color: INDIGO }}>{two(gi + 1)}</span>
                    <span>/ {total}</span>
                  </div>
                  <h2 style={{ margin: "18px 0 0", fontFamily: SANS, fontSize: "clamp(38px,4.4vw,68px)", letterSpacing: "-0.04em", lineHeight: 1.04 }}>
                    {lead ? (
                      <span data-fx="rise" data-d="100" style={{ display: "block", fontWeight: 500 }}>
                        {lead}
                      </span>
                    ) : null}
                    <span data-fx="rise" data-d="200" style={{ display: "block", fontWeight: 600, paddingBottom: ".08em", ...gradText }}>
                      {last}
                    </span>
                  </h2>
                </div>
                <Accordion items={g.items} defaultOpen={gi === 0 ? 0 : -1} />
              </div>
            );
          })}
        </div>
      </section>

      {/* Dark CTA: heading left, call card right */}
      <section style={{ position: "relative", overflow: "hidden", padding: SECTION_PAD, color: "#FFFFFF", background: DARK_GRID }}>
        <DriftGlow left="-10%" top="-20%" strength={0.26} />
        <div
          style={{
            position: "relative",
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
            gap: "56px 72px",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontFamily: SANS, fontSize: "clamp(44px,6.4vw,112px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.06 }}>
              <TypeText as="span" segments={[{ t: "Need more", c: "#FFFFFF" }]} per={45} caret={PERI} style={{ display: "block" }} />
              <Words as="span" d={520} style={{ display: "block", fontWeight: 600 }} parts={[{ t: "help?", g: true }]} />
            </h2>
            <p data-fx="rise" data-d="650" style={{ margin: "28px 0 0", maxWidth: 520, fontFamily: SANS, fontSize: "clamp(18px,1.8vw,24px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.4, color: "#A1A1AA" }}>
              Chat to our friendly team — we&apos;re happy to talk it through.
            </p>
          </div>

          <div
            data-fx="rise"
            data-d="200"
            style={{
              position: "relative",
              padding: "clamp(24px,3.4vw,40px)",
              borderRadius: 28,
              background: "rgba(24,24,27,.92)",
              border: "1px solid rgba(255,255,255,.1)",
              boxShadow: "0 40px 100px rgba(0,0,0,.45)",
            }}
          >
            {CONTACT_PHONES.map((p, i) => (
              <a
                key={p.href}
                href={p.href}
                className="cp-focus"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 0",
                  borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,.1)",
                  textDecoration: "none",
                  color: "#FFFFFF",
                }}
              >
                <span style={{ width: 48, height: 48, flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.04)" }}>
                  <Icon name="phone" size={19} color={PERI} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: BODY, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#A1A1AA" }}>{p.label}</span>
                  <span style={{ display: "block", marginTop: 4, fontFamily: SANS, fontSize: "clamp(22px,2.2vw,28px)", fontWeight: 600, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>{p.display}</span>
                </span>
              </a>
            ))}
            <a href={href("/contact")} className="a4-btn a4-btn-light" style={{ marginTop: 22, width: "100%", height: 64, fontSize: 19, textDecoration: "none" }}>
              Contact us <Icon name="arrow-right" size={18} color={INK} />
            </a>
          </div>
        </div>
      </section>

      <ServicePortalBand serviceName="your account" />
    </div>
  );
}
