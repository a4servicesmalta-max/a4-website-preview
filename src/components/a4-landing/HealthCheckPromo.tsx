"use client";

import { Eyebrow, Icon } from "@/components/a4-landing/Primitives";
import LocalizedLink from "@/components/common/LocalizedLink";
import { DARK_CARD, DriftGlow, LIGHT_GLOW, TypeText, Words } from "@/components/fx/primitives";

const INK = "#09090B";
const PERI = "#8B8FF7";

const TYPE_D = 300;
const TYPE_PER = 30;
const TYPE_LINE = "See exactly where your";

/**
 * The free health check, as the design's dark CTA — a dark grid card with a
 * drifting indigo glow on a light surface: typewriter heading with one
 * gradient word, the explanation, and a white pill.
 */
export function HealthCheckPromo() {
  return (
    <section style={{ position: "relative", padding: "clamp(72px,9vw,128px) clamp(20px,5vw,72px)", background: LIGHT_GLOW, fontFamily: "var(--a4x-display)" }}>
      <div
        data-fx="rise"
        data-dy="70"
        style={{
          position: "relative",
          overflow: "hidden",
          maxWidth: 1280,
          margin: "0 auto",
          borderRadius: 28,
          background: DARK_CARD,
          border: "1px solid rgba(255,255,255,.08)",
          boxShadow: "0 50px 120px rgba(9,9,11,.18)",
          color: "#FFFFFF",
          padding: "clamp(32px,5vw,72px)",
        }}
      >
        <DriftGlow left="-24%" top="-90%" strength={0.3} />
        <div style={{ position: "relative", display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "36px 56px" }}>
          <div style={{ maxWidth: 760 }}>
            <Eyebrow dark>Free accounting &amp; FS health check</Eyebrow>
            <h2 style={{ margin: "18px 0 0", fontSize: "clamp(34px,4.6vw,72px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.06 }}>
              <span className="sr-only">See exactly where your accounting stands.</span>
              <div aria-hidden="true">
                <TypeText segments={[{ t: TYPE_LINE, c: "#FFFFFF" }]} per={TYPE_PER} d={TYPE_D} caret={PERI} style={{ display: "inline-block", textWrap: "balance" }} />
                <Words d={TYPE_D + TYPE_LINE.length * TYPE_PER + 120} style={{ fontWeight: 600, textWrap: "balance" }} parts={[{ t: "accounting" }, { t: "stands.", g: true }]} />
              </div>
            </h2>
            <p style={{ margin: "22px 0 0", maxWidth: 620, fontFamily: "var(--a4x-body)", fontSize: 17, lineHeight: 1.6, color: "#A1A1AA", textWrap: "pretty" }}>
              A two-minute score, then a real review of your trial balance or financial statements by A4&apos;s own engine — clarity on what to fix, no obligation.
            </p>
          </div>
          <LocalizedLink href="/accounting-health-check" className="a4-btn a4-btn-light" style={{ textDecoration: "none" }}>
            Run the free check <Icon name="arrow-right" size={18} color={INK} />
          </LocalizedLink>
        </div>
      </div>
    </section>
  );
}
