"use client";

import React from "react";
import { Button } from "@/components/a4-landing/Primitives";
import { DARK_GRID, DriftGlow, LIGHT_GLOW, MUTED_GLOW } from "@/components/fx/primitives";
import GetInstantQuoteButton from "../common/GetInstantQuoteButton";
import { BODY, Bullets, INDIGO, INK, PERI, SANS, SECTION_PAD, gradTail } from "./SectionKit";

interface ServiceFeatureProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;

  features: {
    title: React.ReactNode;
    items: string[];
  }[];
  /** Kept for compatibility — bullets are the design's skewed indigo mark. */
  bulletIconSrc?: string;
  bulletIconAlt?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  description?: React.ReactNode;
  /** When true, hides the CTA buttons block entirely */
  hideCta?: boolean;
}

/**
 * The design's numbered-list pattern: the heading block on the left (sticky on
 * wide screens) with its gradient emphasis and the CTAs, the feature groups on
 * the right as numbered rows with hairlines and skewed bullets.
 * `theme="dark"` (default) sits on the ink grid, `"light"` on the light glow.
 */
const ServiceFeatures = ({
  title,
  subtitle,
  features,
  backgroundColor,
  theme = "dark",
  showRadials = true,
  primaryCtaText,
  primaryCtaHref,
  secondaryCtaText,
  secondaryCtaHref,
  description,
  hideCta = false,
}: ServiceFeatureProps & {
  /** Light theme only: a background class asking for the muted (grey) surface. */
  backgroundColor?: string;
  theme?: "light" | "dark";
  showRadials?: boolean;
}) => {
  const dark = theme === "dark";
  const muted = !dark && !!backgroundColor && /F3F5F7|F4F4F5|section|secondary|muted|zinc-100/i.test(backgroundColor);
  const heading = typeof title === "string" ? gradTail(title) : title;
  const long = typeof title === "string" && title.length > 42;
  const lede = subtitle || description;

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        padding: SECTION_PAD,
        background: dark ? DARK_GRID : muted ? MUTED_GLOW : LIGHT_GLOW,
        color: dark ? "#FFFFFF" : INK,
        fontFamily: SANS,
      }}
    >
      {dark && showRadials ? <DriftGlow left="-18%" top="-30%" strength={0.22} /> : null}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-14 lg:gap-[72px] items-start" style={{ position: "relative", maxWidth: 1280, margin: "0 auto" }}>
        <div className="lg:sticky lg:top-28">
          <h2
            data-fx="rise"
            style={{
              margin: 0,
              fontSize: long ? "clamp(34px,3.8vw,60px)" : "clamp(40px,5.2vw,84px)",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 1.04,
              color: dark ? "#FFFFFF" : INK,
              textWrap: "balance",
            }}
          >
            {heading}
          </h2>
          {lede ? (
            <p
              data-fx="rise"
              data-d="120"
              style={{ margin: "24px 0 0", maxWidth: 520, fontFamily: BODY, fontSize: 18, lineHeight: 1.55, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}
            >
              {lede}
            </p>
          ) : null}
          {!hideCta ? (
            <div data-fx="rise" data-d="220" style={{ marginTop: 36, display: "flex", flexWrap: "wrap", gap: 12 }}>
              {primaryCtaText || secondaryCtaText ? (
                <>
                  {primaryCtaText ? (
                    <Button variant={dark ? "primary" : "dark"} size="md" href={primaryCtaHref || "/quote"}>
                      {primaryCtaText}
                    </Button>
                  ) : null}
                  {secondaryCtaText ? (
                    <Button variant={dark ? "outline-dark" : "outline-light"} size="md" href={secondaryCtaHref || "/quote"}>
                      {secondaryCtaText}
                    </Button>
                  ) : null}
                </>
              ) : (
                <GetInstantQuoteButton className={dark ? "" : "bg-[#09090B] text-white hover:bg-[#27272A]"} />
              )}
            </div>
          ) : null}
        </div>

        <div data-fx="rise" data-d="150" style={{ display: "flex", flexDirection: "column" }}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns: "48px minmax(0,1fr)",
                gap: 12,
                padding: "30px 0",
                borderTop: `1px solid ${dark ? "rgba(255,255,255,.1)" : "#E4E4E7"}`,
                ...(index === features.length - 1 ? { borderBottom: `1px solid ${dark ? "rgba(255,255,255,.1)" : "#E4E4E7"}` } : null),
              }}
            >
              <span style={{ paddingTop: 6, fontSize: 16, fontWeight: 600, color: dark ? PERI : INDIGO }}>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 style={{ margin: 0, fontSize: "clamp(22px,2vw,28px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15, color: dark ? "#FFFFFF" : INK }}>
                  {feature.title}
                </h3>
                <div style={{ marginTop: 16 }}>
                  <Bullets items={feature.items} dark={dark} size={16} gap={10} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceFeatures;
