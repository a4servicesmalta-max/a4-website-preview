/**
 * Design primitives for the A4 look (from the "A4 Quotation" landing design).
 * Server-safe: no hooks, no "use client". Motion comes from `data-fx` attributes that
 * FxRuntime binds on the client.
 */
import type { CSSProperties, ReactNode } from "react";
import { typeLetters, type TypeSegment } from "@/lib/fx/engine";

export const GRAD = "linear-gradient(90deg,#4F55F1 0%,#6468F3 55%,#8B8FF7 100%)";
export const DARK_GRID =
  "linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px) 0 0 / 64px 64px, linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px) 0 0 / 64px 64px, #09090B";
export const LIGHT_GLOW =
  "radial-gradient(1000px 800px at 24% 20%, rgba(79,85,241,.08), rgba(79,85,241,0) 70%), radial-gradient(900px 700px at 80% 74%, rgba(161,161,170,.14), rgba(161,161,170,0) 70%), #FFFFFF";
export const MUTED_GLOW =
  "radial-gradient(1000px 800px at 24% 20%, rgba(79,85,241,.14), rgba(79,85,241,0) 70%), radial-gradient(900px 700px at 80% 74%, rgba(161,161,170,.14), rgba(161,161,170,0) 70%), #F4F4F5";
export const DARK_CARD =
  "radial-gradient(420px 320px at 85% 0%, rgba(79,85,241,.30), rgba(79,85,241,0) 70%), linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px) 0 0 / 32px 32px, linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px) 0 0 / 32px 32px, #09090B";

export const gradText: CSSProperties = {
  backgroundImage: GRAD,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
};

type FxProps = { d?: number; className?: string; style?: CSSProperties };

/** Letter-by-letter typewriter with the indigo caret. */
export function TypeText({
  segments,
  per = 45,
  d,
  caret = "#4F55F1",
  className,
  style,
  as: Tag = "div",
}: FxProps & { segments: TypeSegment[]; per?: number; caret?: string; as?: "div" | "span" }) {
  const letters = typeLetters(segments);
  const label = segments.map((s) => s.t).join("");
  return (
    <Tag
      data-fx="type"
      data-d={d}
      data-per={per}
      aria-label={label}
      className={className}
      style={{ position: "relative", ...style }}
    >
      {letters.map((l, i) => (
        <span key={i} data-l="" aria-hidden="true" style={{ color: l.c }}>
          {l.ch}
        </span>
      ))}
      <span
        data-caret=""
        aria-hidden="true"
        style={{ position: "absolute", left: 0, top: ".1em", width: ".06em", height: ".9em", background: caret, opacity: 0 }}
      />
    </Tag>
  );
}

/** Words (or phrases) that rise in sequence. `g` marks a gradient part. */
export function Words({
  parts,
  d,
  stagger,
  className,
  style,
  as: Tag = "div",
}: FxProps & { parts: { t: ReactNode; g?: boolean; style?: CSSProperties }[]; stagger?: number; as?: "div" | "span" | "h1" | "h2" | "h3" | "p" }) {
  return (
    <Tag data-fx="words" data-d={d} data-stagger={stagger} className={className} style={style}>
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 ? " " : null}
          <span data-w="" style={{ display: "inline-block", ...(p.g ? { ...gradText, paddingBottom: ".06em" } : null), ...p.style }}>
            {p.t}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/** Per-letter word effects used on the service cards: scatter · tighten · cascade · stack · zoom · type. */
export function LetterWord({
  text,
  fx,
  colors,
  per = 55,
  d,
  wordKey,
  className,
  style,
  letterStyle,
}: FxProps & {
  text: string;
  fx: "scatter" | "tighten" | "cascade" | "stack" | "zoom" | "type";
  colors?: string[];
  per?: number;
  /** data-word — lets a client component find and replay this word. */
  wordKey?: string;
  letterStyle?: CSSProperties;
}) {
  const chars = Array.from(text);
  return (
    <div
      data-fx={fx}
      data-d={d}
      data-per={per}
      data-word={wordKey}
      aria-label={text}
      className={className}
      style={{ position: "relative", display: "flex", ...style }}
    >
      {chars.map((ch, i) => (
        <span key={i} data-l="" aria-hidden="true" style={{ display: "inline-block", whiteSpace: "pre", color: colors?.[i], ...letterStyle }}>
          {ch}
        </span>
      ))}
      <span
        data-caret=""
        aria-hidden="true"
        style={{ position: "absolute", left: 0, top: ".2em", width: ".42em", height: ".78em", background: "#8B8FF7", opacity: 0 }}
      />
    </div>
  );
}

/** "01  Build your quote" — numbered eyebrow. */
export function Eyebrow({
  n,
  children,
  dark = false,
  d,
  className,
  style,
}: FxProps & { n?: string; children: ReactNode; dark?: boolean }) {
  return (
    <div
      data-fx="rise"
      data-d={d}
      className={className}
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 12,
        fontSize: 18,
        fontWeight: 600,
        letterSpacing: ".02em",
        color: dark ? "#A1A1AA" : "#52525B",
        ...style,
      }}
    >
      {n ? <span style={{ color: dark ? "#8B8FF7" : "#4F55F1" }}>{n}</span> : null}
      <span>{children}</span>
    </div>
  );
}

/** Background ornaments for dark sections. */
export function DriftGlow({ left = "28%", top = "-30%", strength = 0.28 }: { left?: string; top?: string; strength?: number }) {
  return (
    <div
      data-drift=""
      aria-hidden="true"
      style={{
        position: "absolute",
        left,
        top,
        width: 1100,
        height: 1100,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(79,85,241,${strength}) 0%, rgba(79,85,241,0) 65%)`,
        pointerEvents: "none",
      }}
    />
  );
}

export function Slab({ opacity = 0.55, blur = false }: { opacity?: number; blur?: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: "skewX(-30deg)",
        borderRadius: 28,
        background: "linear-gradient(120deg,#4F55F1 0%,#27272A 100%)",
        opacity,
        filter: blur ? "blur(2px)" : undefined,
      }}
    />
  );
}

/** Skewed slab that sweeps across its section as you scroll. */
export function SweepSlab() {
  return (
    <div data-sweep="" aria-hidden="true" style={{ position: "absolute", left: 0, top: "-20%", width: "38vw", height: "140%", pointerEvents: "none" }}>
      <Slab opacity={0.5} blur />
    </div>
  );
}

export const A4_S = "M302.6,2 L359,2 L355.6,10 L58.1,514 L2,514.1 L60.7,413 L4.7,412 L30.5,368 L36,359.5 L93,358.7 Z";
export const A4_F =
  "M394.9,2 L444.7,3 L444.7,359 L513.6,360 L482,412.6 L444.9,413 L444,514.5 L393.2,514 L393.2,418 L392,412.6 L152.4,412 Z M393,103.8 L240.2,359 L393.1,359 Z";

export function A4Mark({ size = 26, color = "#FFFFFF", className }: { size?: number | string; color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 515.6 516.5" className={className} style={{ height: size, width: size, display: "block", flexShrink: 0 }} aria-hidden="true">
      <path d={A4_S} fill={color} />
      <path d={A4_F} fill={color} fillRule="evenodd" />
    </svg>
  );
}

/** The hero mark that draws itself (stroke masks), then the divider bar and the tightening wordmark. */
export function A4DrawnLockup({ id = "hm", dark = true, label = "A4 Services" }: { id?: string; dark?: boolean; label?: string }) {
  const c = dark ? "#FFFFFF" : "#09090B";
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <svg
        viewBox="0 0 515.6 516.5"
        aria-hidden="true"
        style={{ height: "clamp(56px,6.4vw,92px)", width: "clamp(56px,6.4vw,92px)", display: "block", overflow: "visible", flexShrink: 0 }}
      >
        <defs>
          <mask id={`${id}-s`}>
            <path
              data-fx="draw"
              data-d="150"
              data-len="680"
              d="M 340 -40 L 20 560"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="280"
              style={{ strokeDasharray: "680px 680px", ["--fx-len" as string]: "680px" }}
            />
          </mask>
          <mask id={`${id}-f`}>
            <path
              data-fx="draw"
              data-d="320"
              data-len="560"
              d="M 330 -20 L 330 540"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="640"
              style={{ strokeDasharray: "560px 560px", ["--fx-len" as string]: "560px" }}
            />
          </mask>
        </defs>
        <path d={A4_S} fill={c} mask={`url(#${id}-s)`} />
        <path d={A4_F} fill={c} fillRule="evenodd" mask={`url(#${id}-f)`} />
      </svg>
      <span
        data-fx="bar"
        data-d="520"
        aria-hidden="true"
        style={{ width: 2, height: "clamp(45px,5.1vw,74px)", margin: "0 clamp(17px,1.9vw,28px)", background: c, opacity: 0.35, flexShrink: 0 }}
      />
      <span
        data-fx="tighten"
        data-d="600"
        style={{ fontSize: "clamp(26px,2.95vw,42px)", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1, whiteSpace: "nowrap", color: c }}
      >
        {label}
      </span>
    </div>
  );
}

/** The closing glitch lockup: A4 logo slices, colour blocks, underline, then the tagline block. */
export function GlitchLockup({ tagline, children }: { tagline?: ReactNode; children?: ReactNode }) {
  const slices = [0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5];
  const blocks: [string, string, string, string, string][] = [
    ["-14%", "12%", "24%", "8%", "#4F55F1"],
    ["62%", "4%", "18%", "5%", "#8B8FF7"],
    ["30%", "46%", "30%", "6%", "#3F3F46"],
    ["88%", "58%", "22%", "9%", "#4F55F1"],
    ["8%", "78%", "14%", "5%", "#8B8FF7"],
    ["52%", "88%", "26%", "7%", "#3F3F46"],
  ];
  return (
    <div data-fx="glitch" style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div style={{ position: "relative", width: "clamp(260px,38vw,520px)", aspectRatio: "1583 / 446" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-glitch-base="" src="/brand/a4/A4-lockup-white.png" alt="A4 Services" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
        {slices.map((top, i) => (
          <div
            key={i}
            data-slice=""
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, clipPath: `inset(${top}% -12% ${100 - top - 12.5}% -12%)`, opacity: 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/a4/A4-lockup-white.png" alt="" style={{ width: "100%", height: "100%", display: "block" }} />
          </div>
        ))}
        {blocks.map(([left, top, width, height, bg], i) => (
          <span key={i} data-gblock="" aria-hidden="true" style={{ position: "absolute", left, top, width, height, background: bg, opacity: 0 }} />
        ))}
        <span data-uline="" aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: -28, height: 3, borderRadius: 2, background: "#4F55F1" }} />
      </div>
      {tagline ? (
        <p data-glitch-after="" style={{ margin: "64px 0 0", fontSize: "clamp(22px,2.4vw,40px)", fontWeight: 500, letterSpacing: "-0.015em", color: "#E4E4E7" }}>
          {tagline}
        </p>
      ) : null}
      {children}
    </div>
  );
}

/** Pill buttons from the design. */
export const pill = {
  light: {
    height: 58,
    padding: "0 30px",
    borderRadius: 29,
    border: 0,
    background: "#FFFFFF",
    color: "#09090B",
    fontSize: 18,
    fontWeight: 600,
  } as CSSProperties,
  ghostDark: {
    height: 58,
    padding: "0 28px",
    borderRadius: 29,
    border: "1px solid rgba(255,255,255,.22)",
    background: "rgba(255,255,255,.06)",
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: 500,
  } as CSSProperties,
  ink: {
    height: 58,
    padding: "0 30px",
    borderRadius: 29,
    border: 0,
    background: "#09090B",
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: 600,
  } as CSSProperties,
  ghostLight: {
    height: 58,
    padding: "0 28px",
    borderRadius: 29,
    border: "1px solid #E4E4E7",
    background: "#FFFFFF",
    color: "#09090B",
    fontSize: 18,
    fontWeight: 500,
  } as CSSProperties,
};
