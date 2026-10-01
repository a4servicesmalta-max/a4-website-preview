"use client";

/**
 * Building blocks for the five paid-traffic landing pages — /accounting-services,
 * /audit-services, /automated-bookkeeping, /partner-program and /audit-outsourcing —
 * in the A4 design language (docs/DESIGN-LANGUAGE.md; reference implementation:
 * src/app/q/[id]/QuotationLanding.tsx).
 *
 * Visual layer only. Every page passes in its own copy, links, anchors and
 * behaviour; nothing here prices, validates or submits anything.
 */

import React, { useId, useState, type CSSProperties, type ReactNode } from "react";
import { Icon, SectionHead } from "@/components/a4-landing/Primitives";
import {
  A4Mark,
  DARK_GRID,
  DriftGlow,
  GRAD,
  LIGHT_GLOW,
  MUTED_GLOW,
  Slab,
  SweepSlab,
  TypeText,
  Words,
  gradText,
} from "@/components/fx/primitives";
import { INDIGO, INK, PERI } from "@/lib/fx/engine";

export { INDIGO, INK, PERI, GRAD, gradText };

export const SANS = "var(--a4x-display), Outfit, Inter, system-ui, sans-serif";
export const BODY = "var(--a4x-body), Inter, system-ui, sans-serif";

export const SURFACES = { dark: DARK_GRID, light: LIGHT_GLOW, muted: MUTED_GLOW, white: "#FFFFFF" } as const;
export type Surface = keyof typeof SURFACES;

/** Small-caps label (the design's kicker). */
export const kicker: CSSProperties = {
  fontFamily: BODY,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "#71717A",
};

export const pad2 = (n: number) => String(n).padStart(2, "0");

const EXPO = "cubic-bezier(.16,1,.3,1)";

/** The skewed square used for bullets and eyebrows. */
export function SkewMark({ color = INDIGO, size = 7, style }: { color?: string; size?: number; style?: CSSProperties }) {
  return (
    <span
      aria-hidden="true"
      style={{ display: "inline-block", flexShrink: 0, width: size, height: size, borderRadius: 1, background: color, transform: "skewX(-30deg)", ...style }}
    />
  );
}

/**
 * Scoped styles the inline-styled controls need (hover, focus, responsive
 * columns). Render once per page.
 */
export function KitStyles() {
  return (
    <style>{`
      .pk-hero-grid { display: grid; grid-template-columns: minmax(0, 1.18fr) minmax(0, .92fr); gap: clamp(48px, 5vw, 80px); align-items: center; }
      @media (max-width: 1023px) {
        .pk-hero-grid { grid-template-columns: minmax(0, 1fr); }
        .pk-hero-aside { transform: none !important; opacity: 1 !important; filter: none !important; }
        .pk-cue-wide { display: none !important; }
        .pk-sep { display: none !important; }
      }
      .pk-opt:hover { border-color: rgba(79,85,241,.45) !important; }
      .pk-opt[aria-pressed="true"]:hover { border-color: #09090B !important; }
      .pk-step:hover:not([aria-current="step"]) { background: rgba(9,9,11,.04) !important; }
      .pk-ghost:hover { border-color: #A1A1AA !important; }
      .pk-glass { background: rgba(24,24,27,.72); border: 1px solid rgba(255,255,255,.1); }
      .pk-glass:hover { border-color: rgba(139,143,247,.45); box-shadow: 0 24px 60px rgba(0,0,0,.35); }
      .pk-opt:focus-visible, .pk-step:focus-visible, .pk-faq-q:focus-visible, .pk-ghost:focus-visible,
      .pk-ink:focus-visible, .pk-seg button:focus-visible, .pk-drop:focus-visible, .pk-link:focus-visible {
        outline: 3px solid rgba(79,85,241,.55); outline-offset: 2px;
      }
      .pk-input { transition: border-color .25s, box-shadow .25s; }
      .pk-input:focus { border-color: #4F55F1 !important; box-shadow: 0 0 0 3px rgba(79,85,241,.15); outline: none; }
      .pk-input::placeholder { color: #A1A1AA; }
      .pk-check { -webkit-appearance: none; appearance: none; flex-shrink: 0; width: 24px; height: 24px; margin: 0; border-radius: 7px;
        border: 1.5px solid #71717A; background: #FFFFFF; display: inline-grid; place-content: center; cursor: pointer;
        transition: background .25s, border-color .25s; }
      .pk-check::after { content: ""; width: 11px; height: 6px; border-left: 2.5px solid #FFFFFF; border-bottom: 2.5px solid #FFFFFF;
        transform: translateY(-1px) rotate(-45deg) scale(0); transition: transform .25s ${EXPO}; }
      .pk-check:checked { background: #4F55F1; border-color: #4F55F1; }
      .pk-check:checked::after { transform: translateY(-1px) rotate(-45deg) scale(1); }
      .pk-check:focus-visible { outline: 3px solid rgba(79,85,241,.55); outline-offset: 2px; }
      .pk-range { width: 100%; accent-color: #4F55F1; cursor: pointer; height: 28px; }
      .pk-range:focus-visible { outline: 3px solid rgba(79,85,241,.55); outline-offset: 4px; border-radius: 6px; }
      @media (max-width: 640px) { .pk-info { min-height: 0 !important; } }
      @media (max-width: 560px) {
        .pk-head-aside { width: 100%; }
        .pk-seg { display: flex !important; width: 100%; }
        .pk-seg button { flex: 1 1 0; padding: 6px 10px !important; font-size: 14px !important; }
      }
      @media (max-width: 1080px) {
        .pk-step { width: 44px; padding: 0 !important; justify-content: center; }
        .pk-step .pk-step-label { display: none; }
        .pk-step[aria-current="step"] { width: auto; padding: 0 18px !important; }
        .pk-step[aria-current="step"] .pk-step-label { display: inline; }
      }
    `}</style>
  );
}

/* ───────────────────────────── Sections ───────────────────────────── */

export function Section({
  id,
  surface = "light",
  tight = false,
  glow,
  sweep = false,
  children,
  style,
  innerStyle,
}: {
  id?: string;
  surface?: Surface;
  tight?: boolean;
  /** Drifting indigo glow (dark sections only). */
  glow?: { left?: string; top?: string; strength?: number } | false;
  /** The skewed slab that sweeps across the section with scroll (dark sections). */
  sweep?: boolean;
  children: ReactNode;
  style?: CSSProperties;
  innerStyle?: CSSProperties;
}) {
  const dark = surface === "dark";
  return (
    <section
      id={id}
      style={{
        position: "relative",
        overflow: dark ? "hidden" : undefined,
        padding: tight ? "clamp(72px,9vw,128px) clamp(20px,5vw,72px)" : "clamp(100px,13vw,180px) clamp(20px,5vw,72px)",
        background: SURFACES[surface],
        color: dark ? "#FFFFFF" : INK,
        fontFamily: SANS,
        ...style,
      }}
    >
      {dark && glow !== false ? <DriftGlow left={glow?.left ?? "40%"} top={glow?.top ?? "-10%"} strength={glow?.strength ?? 0.22} /> : null}
      {sweep ? <SweepSlab /> : null}
      <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", ...innerStyle }}>{children}</div>
    </section>
  );
}

/** Numbered columns on hairlines — the terms-list rows of the design, set side by side. */
export function NumberedColumns({
  items,
  dark = false,
  min = 240,
}: {
  items: { t: ReactNode; s: ReactNode }[];
  dark?: boolean;
  min?: number;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`, gap: "40px 32px" }}>
      {items.map((it, i) => (
        <div key={i} data-fx="rise" data-d={i * 80} style={{ paddingTop: 24, borderTop: `1px solid ${dark ? "rgba(255,255,255,.16)" : "#E4E4E7"}` }}>
          <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: ".02em", color: dark ? PERI : INDIGO }}>{pad2(i + 1)}</div>
          <h3 style={{ margin: "14px 0 0", fontSize: "clamp(22px,1.9vw,26px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.2 }}>{it.t}</h3>
          <p style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}>{it.s}</p>
        </div>
      ))}
    </div>
  );
}

/** Centred eyebrow (for statement sections). */
export function CenterEyebrow({ n, children, dark = false }: { n?: string; children: ReactNode; dark?: boolean }) {
  return (
    <div data-fx="rise" className="a4-eyebrow" style={{ justifyContent: "center", color: dark ? "#A1A1AA" : "#52525B", marginBottom: "clamp(24px,3vw,36px)" }}>
      {n ? <span style={{ color: dark ? PERI : INDIGO }}>{n}</span> : <SkewMark color={dark ? PERI : INDIGO} size={9} style={{ alignSelf: "center" }} />}
      <span>{children}</span>
    </div>
  );
}

/** Eyebrow + H2 + sub (SectionHead), with an optional control on the right. */
export function Head({
  n,
  eyebrow,
  title,
  sub,
  dark = false,
  aside,
  maxWidth = 760,
}: {
  n?: string;
  eyebrow?: string;
  title: ReactNode;
  sub?: ReactNode;
  dark?: boolean;
  aside?: ReactNode;
  maxWidth?: number;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 28 }}>
      <div style={{ flex: "1 1 520px", maxWidth }}>
        <SectionHead n={n} eyebrow={eyebrow} title={title} sub={sub} dark={dark} maxWidth={maxWidth} />
      </div>
      {aside ? (
        <div data-fx="rise" data-d="150" className="pk-head-aside">
          {aside}
        </div>
      ) : null}
    </div>
  );
}

/** One gradient word or phrase inside a heading. */
export function G({ children }: { children: ReactNode }) {
  return (
    <span style={{ ...gradText, paddingBottom: ".06em" }}>
      {children}
    </span>
  );
}

/** "Every service. / One portal." — centred typewriter line, then a rising line with one gradient word. */
export function Statement({
  first,
  parts,
  dark = false,
  align = "center",
  size = "clamp(42px,6.4vw,112px)",
  as: Tag = "h2",
}: {
  first: string;
  parts: { t: ReactNode; g?: boolean; style?: CSSProperties }[];
  dark?: boolean;
  align?: "center" | "left";
  size?: string;
  as?: "h2" | "div";
}) {
  return (
    <Tag style={{ margin: 0, textAlign: align, fontFamily: SANS, fontSize: size, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.08, textWrap: "balance" }}>
      <TypeText as="span" segments={[{ t: first, c: dark ? "#FFFFFF" : INK }]} per={40} caret={dark ? PERI : INDIGO} style={{ display: "inline-block" }} />
      <Words as="span" d={620} style={{ display: "block", fontWeight: 600 }} parts={parts} />
    </Tag>
  );
}

/* ───────────────────────────── Hero ───────────────────────────── */

function ScrollCue({ d, hideNarrow = false }: { d: string; hideNarrow?: boolean }) {
  return (
    <div
      data-fx="rise"
      data-d={d}
      aria-hidden="true"
      className={hideNarrow ? "pk-cue-wide" : undefined}
      style={{ position: "absolute", left: 0, right: 0, bottom: 28, zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, pointerEvents: "none" }}
    >
      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: "#A1A1AA" }}>Scroll</span>
      <span style={{ position: "relative", width: 1, height: 44, overflow: "hidden", background: "rgba(255,255,255,.14)" }}>
        <span data-loop="" style={{ position: "absolute", left: 0, top: 0, width: 1, height: 44, background: PERI }} />
      </span>
    </div>
  );
}

/** Proof point in the hero — the design's dark chip with a skewed bullet. */
export function HeroChip({ children }: { children: ReactNode }) {
  return (
    <span className="a4-chip a4-chip-dark" style={{ height: "auto", minHeight: 36, padding: "7px 16px", lineHeight: 1.3, color: "#E4E4E7", fontFamily: SANS }}>
      <SkewMark color={PERI} />
      {children}
    </span>
  );
}

/**
 * The design hero: dark grid, drifting glow, the skewed slab (parallax), the
 * periwinkle eyebrow, a typewriter first line and a gradient second line, the
 * lead, chips, pills and the scroll cue. `aside` adds a visual on the right.
 */
export function PaidHero({
  eyebrow,
  first,
  accent,
  lead,
  chips,
  actions,
  after,
  aside,
}: {
  eyebrow: ReactNode;
  first: string;
  accent: ReactNode;
  lead?: ReactNode;
  chips?: ReactNode[];
  actions: ReactNode;
  /** Extra rows under the actions (logos, service chips). */
  after?: ReactNode;
  aside?: ReactNode;
}) {
  const per = 40;
  const start = 320;
  const typed = start + Array.from(first).length * per;
  const at = (ms: number) => String(Math.min(typed, 1500) + ms);
  const wide = !!aside;

  const copy = (
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(22px,2.6vw,34px)", minWidth: 0 }}>
      <div
        data-fx="rise"
        data-d="100"
        style={{ display: "flex", alignItems: "baseline", gap: 12, fontSize: "clamp(16px,1.5vw,22px)", fontWeight: 600, letterSpacing: ".02em", color: PERI }}
      >
        <SkewMark color={PERI} size={10} style={{ alignSelf: "center" }} />
        <span>{eyebrow}</span>
      </div>
      <h1
        style={{
          margin: 0,
          fontSize: wide ? "clamp(42px,5.4vw,84px)" : "clamp(46px,7.6vw,128px)",
          fontWeight: 500,
          letterSpacing: "-0.035em",
          lineHeight: 1.03,
          textWrap: "balance",
        }}
      >
        <TypeText as="span" segments={[{ t: first, c: "#FFFFFF" }]} per={per} d={start} style={{ display: "block" }} />
        <span data-fx="rise" data-d={at(120)} data-dy="60" style={{ display: "inline-block", fontWeight: 600, paddingBottom: ".08em", marginBottom: "-.08em", ...gradText }}>
          {accent}
        </span>
      </h1>
      {lead ? (
        <p
          data-fx="rise"
          data-d={at(300)}
          style={{ margin: 0, maxWidth: 760, fontSize: "clamp(18px,1.7vw,24px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.45, color: "#A1A1AA", textWrap: "pretty" }}
        >
          {lead}
        </p>
      ) : null}
      {chips?.length ? (
        <div data-fx="rise" data-d={at(420)} style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {chips.map((c, i) => (
            <HeroChip key={i}>{c}</HeroChip>
          ))}
        </div>
      ) : null}
      <div data-fx="rise" data-d={at(520)} style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {actions}
      </div>
      {after ? (
        <div data-fx="rise" data-d={at(640)} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {after}
        </div>
      ) : null}
    </div>
  );

  return (
    <section
      data-hero=""
      style={{ position: "relative", minHeight: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", color: "#FFFFFF", background: DARK_GRID, fontFamily: SANS }}
    >
      <DriftGlow left="28%" top="-30%" strength={0.28} />
      <div data-hero-par="" aria-hidden="true" style={{ position: "absolute", right: "-16vw", top: "16vh", width: "50vw", height: "96vh", pointerEvents: "none" }}>
        <div data-fx="slab" data-d="100" style={{ position: "absolute", inset: 0 }}>
          <Slab opacity={0.55} />
        </div>
      </div>
      <div
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
          padding: "clamp(124px,13vw,160px) clamp(20px,5vw,72px) clamp(116px,10vw,136px)",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* The exit (lift + blur on scroll) is per column: stacked on a phone
            the visual sits below the fold, and must not blur out while it is
            still scrolling into view (.pk-hero-aside, KitStyles). */}
        {wide ? (
          <div className="pk-hero-grid" style={{ width: "100%" }}>
            <div data-hero-exit="" style={{ minWidth: 0 }}>
              {copy}
            </div>
            <div data-hero-exit="" className="pk-hero-aside" style={{ minWidth: 0 }}>
              <div data-fx="rise" data-d={at(240)} data-dy="80" style={{ display: "flex", justifyContent: "center" }}>
                {aside}
              </div>
            </div>
          </div>
        ) : (
          <div data-hero-exit="" style={{ width: "100%" }}>
            {copy}
          </div>
        )}
      </div>
      <ScrollCue d={at(900)} hideNarrow={wide} />
    </section>
  );
}

/* ───────────────────────────── Cards ───────────────────────────── */

export function CardGrid({ children, min = 340, style }: { children: ReactNode; min?: number; style?: CSSProperties }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`, gap: 16, ...style }}>
      {children}
    </div>
  );
}

/** The design's service card, for information: numbered, light or dark, hairline, 24 radius. */
export function InfoCard({
  i,
  total,
  dark: darkProp = false,
  glass = false,
  icon,
  title,
  body,
  children,
  minHeight = 300,
  style,
}: {
  i: number;
  total?: number;
  dark?: boolean;
  /** Translucent card for dark sections. */
  glass?: boolean;
  icon?: string;
  title: ReactNode;
  body?: ReactNode;
  children?: ReactNode;
  minHeight?: number;
  style?: CSSProperties;
}) {
  const dark = darkProp || glass;
  return (
    <div
      data-fx="rise"
      data-d={i * 80}
      className={`pk-info ${glass ? "pk-glass" : dark ? "a4-dark-card a4-card-dark" : "a4-card"}`}
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight,
        padding: 28,
        borderRadius: 24,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        color: dark ? "#FFFFFF" : INK,
        transition: "border-color .35s, box-shadow .35s",
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: dark ? "#A1A1AA" : "#52525B" }}>
          <span style={{ color: dark ? PERI : INDIGO }}>{pad2(i + 1)}</span>
          {total ? <span>/ {pad2(total)}</span> : null}
        </div>
        {icon ? (
          <span
            aria-hidden="true"
            style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: dark ? "rgba(139,143,247,.14)" : "rgba(79,85,241,.08)" }}
          >
            <Icon name={icon} size={20} color={dark ? PERI : INDIGO} stroke={1.75} />
          </span>
        ) : null}
      </div>
      <div style={{ flex: 1, minHeight: 20 }} />
      <h3 style={{ margin: 0, fontSize: "clamp(24px,2vw,28px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15, textWrap: "balance" }}>{title}</h3>
      {body ? (
        <p style={{ margin: 0, fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}>{body}</p>
      ) : null}
      {children}
    </div>
  );
}

/** Bulleted line (skewed square). */
export function Bullet({ children, dark = false, size = 15 }: { children: ReactNode; dark?: boolean; size?: number }) {
  return (
    <div style={{ display: "flex", gap: 12, fontFamily: BODY, fontSize: size, lineHeight: 1.5, color: dark ? "#E4E4E7" : "#3F3F46" }}>
      <span className="a4-bullet" style={dark ? { background: PERI } : undefined} />
      <span>{children}</span>
    </div>
  );
}

/* ───────────────────────────── Timeline ───────────────────────────── */

/** Numbered steps on the filling line (data-tl), as in the design's onboarding section. */
export function Timeline({ steps, min = 220, dark = false }: { steps: { title: ReactNode; body: ReactNode }[]; min?: number; dark?: boolean }) {
  return (
    <div data-tl="" style={{ position: "relative" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 11, height: 2, background: dark ? "rgba(255,255,255,.12)" : "#E4E4E7" }} />
      <div data-tl-fill="" style={{ position: "absolute", left: 0, right: 0, top: 11, height: 2, background: GRAD }} />
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`, gap: "48px 32px" }}>
        {steps.map((s, i) => (
          <div key={i} data-fx="rise" data-d={i * 100}>
            <div style={{ position: "relative", width: 24, height: 24, borderRadius: "50%", background: dark ? INK : "#FFFFFF", border: `2px solid ${dark ? "#3F3F46" : "#E4E4E7"}` }}>
              <span data-tl-dot="" style={{ position: "absolute", inset: 3, borderRadius: "50%", background: INDIGO, transition: `transform .45s ${EXPO}` }} />
            </div>
            <div style={{ marginTop: 28, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: dark ? PERI : INDIGO }}>{pad2(i + 1)}</div>
            <h3 style={{ margin: "8px 0 0", fontSize: "clamp(24px,2.2vw,30px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15 }}>{s.title}</h3>
            <p style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}>{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────── FAQ ───────────────────────────── */

/** Numbered FAQ rows with hairlines; one open at a time, like the accordions they replace. */
export function FaqList({ faqs, defaultOpen = 0, line = "#E4E4E7" }: { faqs: { q: string; a: ReactNode }[]; defaultOpen?: number; line?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  const uid = useId();
  return (
    <div data-fx="rise" data-d="150">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        const panelId = `${uid}-a${i}`;
        return (
          <div key={f.q} style={{ borderTop: `1px solid ${line}`, ...(i === faqs.length - 1 ? { borderBottom: `1px solid ${line}` } : null) }}>
            <button
              type="button"
              className="pk-faq-q"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? -1 : i)}
              style={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: "44px minmax(0,1fr) auto",
                gap: 12,
                alignItems: "center",
                padding: "22px 0",
                background: "none",
                border: 0,
                cursor: "pointer",
                textAlign: "left",
                color: INK,
                fontFamily: SANS,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 600, color: INDIGO }}>{pad2(i + 1)}</span>
              <span style={{ fontSize: "clamp(18px,1.6vw,22px)", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.3 }}>{f.q}</span>
              <span
                aria-hidden="true"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  border: `1px solid ${isOpen ? INK : line}`,
                  background: isOpen ? INK : "transparent",
                  transform: isOpen ? "rotate(45deg)" : "none",
                  transition: `transform .4s ${EXPO}, background .25s, border-color .25s`,
                }}
              >
                <Icon name="plus" size={16} color={isOpen ? "#FFFFFF" : INK} />
              </span>
            </button>
            <div id={panelId} style={{ display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr", transition: `grid-template-rows .45s ${EXPO}` }}>
              <div style={{ overflow: "hidden" }} aria-hidden={!isOpen}>
                <p style={{ margin: 0, padding: "0 0 26px 56px", maxWidth: 720, fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: "#3F3F46", textWrap: "pretty" }}>{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Left: eyebrow + big two-line heading (second line gradient) + sub + action. Right: numbered rows. */
export function FaqSection({
  n,
  eyebrow = "FAQ",
  line1,
  line2,
  sub,
  action,
  faqs,
  surface = "white",
}: {
  n?: string;
  eyebrow?: string;
  line1: ReactNode;
  line2: ReactNode;
  sub?: ReactNode;
  action?: ReactNode;
  faqs: { q: string; a: ReactNode }[];
  surface?: Surface;
}) {
  return (
    <Section surface={surface}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "56px 72px", alignItems: "start" }}>
        <div className="a4-faq-aside">
          <div data-fx="rise" className="a4-eyebrow" style={{ color: "#52525B" }}>
            {n ? <span style={{ color: INDIGO }}>{n}</span> : <SkewMark size={9} style={{ alignSelf: "center" }} />}
            <span>{eyebrow}</span>
          </div>
          <h2 style={{ margin: "18px 0 0", fontSize: "clamp(40px,4.6vw,72px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.05 }}>
            <span data-fx="rise" data-d="100" style={{ display: "block" }}>
              {line1}
            </span>
            <span data-fx="rise" data-d="200" style={{ display: "inline-block", fontWeight: 600, letterSpacing: "-0.04em", paddingBottom: ".08em", ...gradText }}>
              {line2}
            </span>
          </h2>
          {sub ? (
            <p data-fx="rise" data-d="280" style={{ margin: "20px 0 0", maxWidth: 420, fontFamily: BODY, fontSize: 17, lineHeight: 1.55, color: "#52525B", textWrap: "pretty" }}>
              {sub}
            </p>
          ) : null}
          {action ? (
            <div data-fx="rise" data-d="360" style={{ marginTop: 28 }}>
              {action}
            </div>
          ) : null}
        </div>
        <FaqList faqs={faqs} line={surface === "muted" ? "#D4D4D8" : "#E4E4E7"} />
      </div>
    </Section>
  );
}

/* ───────────────────────────── Dark CTA ───────────────────────────── */

/** "Accept your / quotation." — heading left, a card with the pills right. */
export function CtaBand({
  id,
  first,
  accent,
  lead,
  children,
  note,
}: {
  id?: string;
  first: string;
  accent: ReactNode;
  lead?: ReactNode;
  children: ReactNode;
  note?: ReactNode;
}) {
  return (
    <section
      id={id}
      style={{ position: "relative", overflow: "hidden", padding: "clamp(110px,14vw,190px) clamp(20px,5vw,72px)", color: "#FFFFFF", background: DARK_GRID, fontFamily: SANS }}
    >
      <DriftGlow left="-10%" top="-20%" strength={0.26} />
      <div
        style={{ position: "relative", maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))", gap: "56px 72px", alignItems: "center" }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "clamp(40px,5vw,84px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.06, textWrap: "balance" }}>
            <TypeText as="span" segments={[{ t: first, c: "#FFFFFF" }]} per={45} caret={PERI} style={{ display: "block" }} />
            <Words as="span" d={560} style={{ display: "block", fontWeight: 600 }} parts={[{ t: accent, g: true }]} />
          </h2>
          {lead ? (
            <p
              data-fx="rise"
              data-d="700"
              style={{ margin: "28px 0 0", maxWidth: 560, fontSize: "clamp(18px,1.8vw,24px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.4, color: "#A1A1AA", textWrap: "pretty" }}
            >
              {lead}
            </p>
          ) : null}
        </div>
        <div
          data-fx="rise"
          data-d="200"
          style={{ position: "relative", padding: "clamp(24px,3.4vw,40px)", borderRadius: 28, background: "rgba(24,24,27,.92)", border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 40px 100px rgba(0,0,0,.45)" }}
        >
          {children}
          {note ? <p style={{ margin: "20px 0 0", textAlign: "center", fontFamily: BODY, fontSize: 14, lineHeight: 1.55, color: "#A1A1AA", textWrap: "pretty" }}>{note}</p> : null}
        </div>
      </div>
    </section>
  );
}

/** Full-width stacked pill style for the CTA card. */
export const ctaPill: CSSProperties = { width: "100%", height: 64, fontSize: 19 };

/* ───────────────────────────── Quote builder ───────────────────────────── */

export type Opt = { id: string; label: string; sub?: string };

/** Choice pills — active is the ink fill of the design's segmented switch. */
export function OptionPills({
  items,
  value,
  set,
  compact = false,
  label,
}: {
  items: Opt[];
  value: string;
  set: (id: string) => void;
  compact?: boolean;
  label?: string;
}) {
  return (
    <div role="group" aria-label={label} style={{ display: "flex", flexWrap: "wrap", gap: compact ? 8 : 10 }}>
      {items.map((o) => {
        const on = value === o.id;
        const sub = o.sub && !compact ? o.sub : "";
        return (
          <button
            key={o.id}
            type="button"
            className="pk-opt"
            onClick={() => set(o.id)}
            aria-pressed={on}
            style={{
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              gap: 2,
              minHeight: compact ? 42 : 48,
              padding: sub ? "8px 20px" : "0 20px",
              borderRadius: 999,
              border: `1px solid ${on ? INK : "#E4E4E7"}`,
              background: on ? INK : "#FFFFFF",
              color: on ? "#FFFFFF" : INK,
              fontFamily: SANS,
              fontSize: compact ? 14.5 : 15,
              fontWeight: 600,
              lineHeight: 1.2,
              textAlign: "left",
              cursor: "pointer",
              transition: "background .25s, color .25s, border-color .25s",
            }}
          >
            {o.label}
            {sub ? <span style={{ fontFamily: BODY, fontSize: 12.5, fontWeight: 500, color: on ? "#A1A1AA" : "#71717A" }}>{sub}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

/** Segmented switch (design: Monthly / First year). */
export function Segmented<T extends string>({
  options,
  value,
  set,
  label,
}: {
  options: { id: T; label: ReactNode }[];
  value: T;
  set: (id: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="pk-seg" style={{ display: "inline-flex", flexWrap: "wrap", maxWidth: "100%", padding: 5, borderRadius: 999, background: "#FFFFFF", border: "1px solid #E4E4E7" }}>
      {options.map((o) => {
        const a = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => set(o.id)}
            aria-pressed={a}
            style={{
              minHeight: 44,
              padding: "6px 22px",
              borderRadius: 999,
              border: 0,
              background: a ? INK : "transparent",
              color: a ? "#FFFFFF" : "#52525B",
              fontFamily: SANS,
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1.2,
              cursor: "pointer",
              transition: "background .3s, color .3s",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** The numbered step rail (indigo numbers; the current step is the ink pill). */
export function StepRail({ steps, step, setStep, label = "Steps" }: { steps: string[]; step: number; setStep: (i: number) => void; label?: string }) {
  return (
    <nav aria-label={label} className="af-rail" style={{ display: "flex", flexDirection: "column", gap: 4, position: "sticky", top: 96 }}>
      {steps.map((s, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <button
            key={s}
            type="button"
            className="pk-step"
            onClick={() => setStep(i)}
            aria-current={active ? "step" : undefined}
            aria-label={`${pad2(i + 1)} ${s}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              height: 44,
              padding: "0 18px",
              borderRadius: 999,
              border: `1px solid ${active ? INK : "transparent"}`,
              background: active ? INK : "transparent",
              color: active ? "#FFFFFF" : done ? INK : "#52525B",
              fontFamily: SANS,
              fontSize: 15,
              fontWeight: 600,
              textAlign: "left",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "background .3s, color .3s, border-color .3s",
            }}
          >
            <span style={{ fontVariantNumeric: "tabular-nums", color: active ? PERI : done ? INDIGO : "#52525B" }}>{pad2(i + 1)}</span>
            <span className="pk-step-label">{s}</span>
          </button>
        );
      })}
    </nav>
  );
}

/** White 28-radius question panel with the numbered header and a hairline footer. */
export function QuestionCard({
  tag,
  title,
  help,
  children,
  footer,
}: {
  tag: ReactNode;
  title: ReactNode;
  help?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E4E4E7",
        borderRadius: 28,
        padding: "clamp(24px,3vw,36px)",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        minHeight: 440,
        textAlign: "left",
        color: INK,
        boxShadow: "0 30px 80px rgba(9,9,11,.06)",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 15, fontWeight: 600, letterSpacing: ".02em", color: "#52525B" }}>{tag}</div>
        <h3 style={{ margin: "12px 0 0", fontSize: "clamp(26px,2.4vw,34px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.1, textWrap: "balance" }}>{title}</h3>
        {help ? <p style={{ margin: "12px 0 0", fontFamily: BODY, fontSize: 15.5, lineHeight: 1.6, color: "#52525B", textWrap: "pretty" }}>{help}</p> : null}
      </div>
      {children}
      <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid #E4E4E7", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>{footer}</div>
    </div>
  );
}

/** A sub-question inside the question panel, separated by a hairline. */
export function SubQuestion({ label, hint, htmlFor, children }: { label: ReactNode; hint?: ReactNode; htmlFor?: string; children: ReactNode }) {
  const L = htmlFor ? "label" : "div";
  return (
    <div style={{ paddingTop: 20, borderTop: "1px solid #E4E4E7" }}>
      <L htmlFor={htmlFor} style={{ display: "block", fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em", color: INK }}>
        {label}
      </L>
      {hint ? <div style={{ marginTop: 4, fontFamily: BODY, fontSize: 14, lineHeight: 1.55, color: "#52525B", textWrap: "pretty" }}>{hint}</div> : null}
      <div style={{ marginTop: 14 }}>{children}</div>
    </div>
  );
}

/** Indigo prompt line ("Pick a band — we do not assume one."). */
export function Prompt({ children }: { children: ReactNode }) {
  return (
    <div style={{ marginTop: 12, display: "flex", gap: 10, fontFamily: BODY, fontSize: 14, lineHeight: 1.5, color: INDIGO }}>
      <span className="a4-bullet" style={{ marginTop: 7 }} />
      <span>{children}</span>
    </div>
  );
}

/** Soft indigo note box (read-backs, the independence note). */
export const softNote: CSSProperties = {
  margin: 0,
  padding: "14px 16px",
  borderRadius: 16,
  background: "rgba(79,85,241,.06)",
  border: "1px solid rgba(79,85,241,.2)",
  fontFamily: BODY,
  fontSize: 14,
  lineHeight: 1.6,
  color: "#3F3F46",
};

/** Back / Next pills for the question footer. */
export const ghostPill = (disabled = false): CSSProperties => ({
  height: 44,
  padding: "0 20px",
  borderRadius: 999,
  border: "1px solid #E4E4E7",
  background: "#FFFFFF",
  color: INK,
  fontFamily: SANS,
  fontSize: 15,
  fontWeight: 600,
  cursor: disabled ? "default" : "pointer",
  opacity: disabled ? 0.4 : 1,
  transition: "border-color .25s, opacity .25s",
});
export const inkPill = (disabled = false): CSSProperties => ({
  height: 44,
  padding: "0 22px",
  borderRadius: 999,
  border: 0,
  background: INK,
  color: "#FFFFFF",
  fontFamily: SANS,
  fontSize: 15,
  fontWeight: 600,
  cursor: disabled ? "default" : "pointer",
  opacity: disabled ? 0.5 : 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  transition: "background .3s, opacity .3s",
});

/** Light text input (white, hairline, radius 14; focus indigo via .pk-input). */
export const lightInput: CSSProperties = {
  width: "100%",
  height: 52,
  padding: "0 16px",
  boxSizing: "border-box",
  borderRadius: 14,
  border: "1px solid #E4E4E7",
  background: "#FFFFFF",
  color: INK,
  fontFamily: SANS,
  fontSize: 16,
  fontWeight: 500,
  outline: "none",
};

/** Running total in the question footer. */
export function MiniTotal({ children }: { children: ReactNode }) {
  return (
    <span style={{ marginLeft: "auto", fontFamily: SANS, fontVariantNumeric: "tabular-nums", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: INK }}>
      {children}
    </span>
  );
}

/**
 * The fee panel, set like the quote document: a kicker header, the lines on
 * hairlines, then the #FAFAFA totals footer with the gradient total.
 */
export function FeeDoc({
  label,
  rows,
  totalLabel,
  amount,
  per,
  gradient = true,
  strike,
  badge,
  note,
  children,
  className = "af-panel",
  sticky = true,
  footer,
}: {
  label: ReactNode;
  rows: { k: ReactNode; v: ReactNode }[];
  totalLabel?: ReactNode;
  amount: ReactNode;
  per?: ReactNode;
  gradient?: boolean;
  strike?: ReactNode;
  badge?: ReactNode;
  note?: ReactNode;
  children?: ReactNode;
  className?: string;
  sticky?: boolean;
  footer?: ReactNode;
}) {
  return (
    <div
      className={className}
      style={{
        position: sticky ? "sticky" : "relative",
        top: 96,
        background: "#FFFFFF",
        border: "1px solid #E4E4E7",
        borderRadius: 28,
        boxShadow: "0 50px 120px rgba(9,9,11,.12)",
        overflow: "hidden",
        textAlign: "left",
        color: INK,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "24px 26px 18px" }}>
        <A4Mark size={22} color={INK} />
        <span aria-hidden="true" style={{ width: 1.5, height: 18, margin: "0 10px", background: INK, opacity: 0.35 }} />
        <span style={kicker}>{label}</span>
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 14, padding: "12px 26px", borderTop: "1px solid #E4E4E7", fontFamily: BODY, fontSize: 14.5, lineHeight: 1.45 }}
        >
          <span style={{ color: "#52525B", minWidth: 0 }}>{r.k}</span>
          <span
            style={{
              color: INK,
              fontWeight: 500,
              textAlign: "right",
              minWidth: 0,
              // Figures stay on one line; a worded value ("Review — the lighter option") may wrap.
              whiteSpace: typeof r.v === "string" && r.v.length > 16 ? "normal" : "nowrap",
            }}
          >
            {r.v}
          </span>
        </div>
      ))}
      <div style={{ padding: "22px 26px 26px", borderTop: "1px solid #E4E4E7", background: "#FAFAFA" }}>
        {strike || badge ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
            {strike ? <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 17, fontWeight: 500, color: "#71717A", textDecoration: "line-through" }}>{strike}</span> : null}
            {badge ? (
              <span style={{ height: 28, padding: "0 12px", display: "inline-flex", alignItems: "center", borderRadius: 999, background: "rgba(79,85,241,.1)", color: INDIGO, fontSize: 13, fontWeight: 600 }}>{badge}</span>
            ) : null}
          </div>
        ) : null}
        {totalLabel ? <div style={{ marginBottom: 4, fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em", color: INK }}>{totalLabel}</div> : null}
        <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
          <span
            aria-live="polite"
            style={{ fontSize: "clamp(38px,3.4vw,48px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.1, fontVariantNumeric: "tabular-nums", paddingBottom: ".04em", ...(gradient ? gradText : { color: INK }) }}
          >
            {amount}
          </span>
          {per ? <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: "#52525B" }}>{per}</span> : null}
        </div>
        {note ? <p style={{ margin: "16px 0 0", fontFamily: BODY, fontSize: 13, lineHeight: 1.6, color: "#52525B", textWrap: "pretty" }}>{note}</p> : null}
        {children ? <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>{children}</div> : null}
        {footer}
      </div>
    </div>
  );
}

/* ───────────────────────────── Modal ───────────────────────────── */

/** Dialog shell in the design's document style. */
export function KitModal({ onClose, labelledBy, children }: { onClose: () => void; labelledBy?: string; children: ReactNode }) {
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(9,9,11,.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        style={{ background: "#FFFFFF", border: "1px solid #E4E4E7", borderRadius: 28, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", padding: "clamp(24px,4vw,34px)", boxShadow: "0 50px 120px rgba(9,9,11,.35)", color: INK, fontFamily: SANS, textAlign: "left" }}
      >
        {children}
      </div>
    </div>
  );
}

/** Success mark for modals (indigo, never green). */
export function DoneMark() {
  return (
    <div style={{ width: 56, height: 56, borderRadius: 999, background: "rgba(79,85,241,.1)", display: "grid", placeItems: "center", margin: "0 auto 18px" }}>
      <Icon name="check" size={26} color={INDIGO} stroke={2.5} />
    </div>
  );
}

/** Label above a light input (kicker style). */
export const fieldLabel: CSSProperties = { ...kicker, display: "block", marginBottom: 8 };
