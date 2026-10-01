"use client";

import React from "react";
import { DARK_GRID, DriftGlow, Slab, TypeText, gradText } from "@/components/fx/primitives";
import type { TypeSegment } from "@/lib/fx/engine";

/**
 * Page hero in the A4 design language: the dark grid with a drifting indigo
 * glow and the skewed slab, an eyebrow, a typewriter headline whose second
 * line rises in on the brand gradient, then the subtitle and actions.
 *
 * Plain-string titles are split the way the design reads: "Keep learning.
 * Stay current." types the first sentence and lifts the second in gradient;
 * a single sentence types in full with its last word in gradient. `accent`
 * overrides the second line.
 */

const PER = 34;

function splitTitle(title: string): { first: string; second: string | null } {
  const m = title.match(/^(.+?[.?!:—–])\s+(.+)$/);
  if (m && m[1].length >= 6 && m[2].length >= 3) return { first: m[1], second: m[2] };
  return { first: title, second: null };
}

function titleSize(len: number): string {
  if (len <= 26) return "clamp(46px,7.4vw,124px)";
  if (len <= 46) return "clamp(40px,5.8vw,96px)";
  return "clamp(34px,4.6vw,76px)";
}

export function PageHero({
  eyebrow,
  title,
  sub,
  accent,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  /** Gradient second line; defaults from the title (see above). */
  accent?: string;
  children?: React.ReactNode;
}) {
  const plain = typeof title === "string" ? title : null;
  const parts = plain ? splitTitle(plain) : null;
  const second = accent ?? parts?.second ?? null;
  const first = parts ? parts.first : null;
  let segments: TypeSegment[] | null = null;
  if (first != null) {
    if (second) segments = [{ t: first, c: "#FFFFFF" }];
    else {
      const cut = first.lastIndexOf(" ");
      segments =
        cut > 0
          ? [
              { t: first.slice(0, cut + 1), c: "#FFFFFF" },
              { t: first.slice(cut + 1), g: true },
            ]
          : [{ t: first, g: true }];
    }
  }
  const typeLen = first ? Array.from(first).length : 0;
  const tEnd = 260 + typeLen * PER;
  const after = (ms: number) => String(Math.min(tEnd, 1900) + ms);

  return (
    <section
      id="top"
      data-hero=""
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "clamp(560px, 82vh, 920px)",
        display: "flex",
        flexDirection: "column",
        color: "#FFFFFF",
        background: DARK_GRID,
      }}
    >
      <DriftGlow left="28%" top="-30%" strength={0.28} />
      <div data-hero-par="" aria-hidden="true" style={{ position: "absolute", right: "-18vw", top: "14vh", width: "46vw", height: "90vh", pointerEvents: "none" }}>
        <div data-fx="slab" data-d="80" style={{ position: "absolute", inset: 0 }}>
          <Slab opacity={0.5} />
        </div>
      </div>
      <div
        data-hero-exit=""
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
          padding: "clamp(128px,14vw,168px) clamp(20px,5vw,72px) clamp(72px,8vw,112px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "clamp(22px,2.8vw,36px)",
        }}
      >
        <div data-fx="rise" data-d="100" style={{ display: "flex", alignItems: "baseline", gap: 12, fontSize: "clamp(16px,1.5vw,22px)", fontWeight: 600, letterSpacing: ".02em", color: "#8B8FF7" }}>
          <span aria-hidden="true" style={{ display: "inline-block", width: 10, height: 10, borderRadius: 1, background: "#8B8FF7", transform: "skewX(-30deg)", alignSelf: "center" }} />
          {eyebrow}
        </div>
        <h1 style={{ margin: 0, maxWidth: 1180, fontSize: titleSize(plain ? plain.length : 40), fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.03, textWrap: "balance" }}>
          {segments ? (
            <TypeText segments={segments} per={PER} d={260} />
          ) : (
            <div data-fx="rise" data-d="260">
              {title}
            </div>
          )}
          {second ? (
            <div data-fx="rise" data-d={after(120)} data-dy="60" style={{ fontWeight: 600, paddingBottom: ".08em", marginBottom: "-.08em", ...gradText }}>
              {second}
            </div>
          ) : null}
        </h1>
        {sub ? (
          <p
            data-fx="rise"
            data-d={after(300)}
            style={{ margin: 0, maxWidth: 760, fontSize: "clamp(18px,1.7vw,24px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.45, color: "#A1A1AA", textWrap: "pretty" }}
          >
            {sub}
          </p>
        ) : null}
        {children ? (
          <div data-fx="rise" data-d={after(440)}>
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
