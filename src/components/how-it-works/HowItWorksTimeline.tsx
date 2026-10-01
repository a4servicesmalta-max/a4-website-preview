"use client";

import React from "react";
import { Eyebrow } from "@/components/fx/primitives";
import { BODY, Band, INK, RichText, Timeline, gradTail } from "@/components/services/SectionKit";

export interface HowItWorksStep {
  id: string;
  number: string;
  title: string;
  description: string;
  /** Kept for compatibility — the timeline is typographic now. */
  image: string;
}

export type HowItWorksTimelineHeader = {
  badge: string;
  title: string;
  subtitle: string;
};

interface HowItWorksTimelineProps {
  steps: HowItWorksStep[];
  /** A class containing `transparent` renders without its own section (when nested). */
  backgroundClassName?: string;
  mode?: "light" | "dark";
  showHeader?: boolean;
  /** Localized header when `showHeader` is true */
  sectionHeader?: HowItWorksTimelineHeader;
  /** Section number for the eyebrow ("03"). */
  n?: string;
}

/**
 * Process steps as the design's timeline: numbered steps on a line that fills
 * as the section scrolls in (`data-tl`), dots popping in turn. Step copy
 * written with "•" lines renders as the skewed-bullet list.
 */
const HowItWorksTimeline = ({ steps, backgroundClassName = "", mode = "light", showHeader = true, sectionHeader, n }: HowItWorksTimelineProps) => {
  const dark = mode === "dark";

  const content = (
    <>
      {showHeader && sectionHeader ? (
        <div style={{ maxWidth: 860, marginBottom: "clamp(56px,7vw,96px)" }}>
          <Eyebrow n={n} dark={dark}>
            {sectionHeader.badge}
          </Eyebrow>
          <h2
            data-fx="rise"
            data-d="100"
            style={{ margin: "16px 0 0", fontSize: "clamp(40px,5.6vw,92px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.02, color: dark ? "#FFFFFF" : INK, textWrap: "balance" }}
          >
            {gradTail(sectionHeader.title)}
          </h2>
          {sectionHeader.subtitle ? (
            <p data-fx="rise" data-d="200" style={{ margin: "22px 0 0", maxWidth: 680, fontFamily: BODY, fontSize: 18, lineHeight: 1.55, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}>
              {sectionHeader.subtitle}
            </p>
          ) : null}
        </div>
      ) : null}
      <Timeline
        dark={dark}
        min={220}
        steps={steps.map((s) => ({ title: s.title, body: <RichText text={s.description} dark={dark} size={15.5} /> }))}
      />
    </>
  );

  if (backgroundClassName.includes("transparent")) return <div style={{ position: "relative" }}>{content}</div>;
  return <Band surface={dark ? "dark" : "light"}>{content}</Band>;
};

export default HowItWorksTimeline;
