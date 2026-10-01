"use client";

/**
 * Section patterns of the A4 design language for the services, partners,
 * pricing and quote pages — ported from src/app/q/[id]/QuotationLanding.tsx
 * (the design on real data) so every page here reads the same: surfaces,
 * numbered eyebrows, display statements, the 24px card grid, the quote
 * document, numbered rows, the filling timeline and the dark CTA band.
 *
 * Motion is declarative (`data-fx`, bound by FxRuntime); nothing here runs an
 * entrance animation of its own.
 */

import type { CSSProperties, ReactNode } from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Icon } from "@/components/a4-landing/Primitives";
import {
  A4Mark,
  DARK_GRID,
  DriftGlow,
  GRAD,
  LIGHT_GLOW,
  LetterWord,
  MUTED_GLOW,
  SweepSlab,
  TypeText,
  Words,
  gradText,
} from "@/components/fx/primitives";
import { gcol } from "@/lib/fx/engine";
import { isExternalHref } from "@/lib/external-links";
import "./site-kit.css";

export const SANS = "var(--a4x-display), Outfit, Inter, system-ui, sans-serif";
export const BODY = "var(--a4x-body), Inter, system-ui, sans-serif";
export const INK = "#09090B";
export const INDIGO = "#4F55F1";
export const PERI = "#8B8FF7";
export { GRAD, gradText };

/** Small-caps label: Inter 12 / 600 / .1em, #71717A. */
export const kicker: CSSProperties = {
  fontFamily: BODY,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "#71717A",
};

export const pad2 = (n: number) => String(n).padStart(2, "0");

/* ────────────────────────────────────────────────────────────────────────── */
/* Surfaces                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

export type Surface = "dark" | "light" | "muted" | "white";
const SURFACE_BG: Record<Surface, string> = { dark: DARK_GRID, light: LIGHT_GLOW, muted: MUTED_GLOW, white: "#FFFFFF" };
export const SECTION_PAD = "clamp(100px,13vw,180px) clamp(20px,5vw,72px)";

/** A full-width section on one of the design's surfaces, content capped at 1280. */
export function Band({
  surface = "light",
  id,
  sec,
  pad,
  max = 1280,
  glow,
  sweep = false,
  style,
  children,
}: {
  surface?: Surface;
  id?: string;
  /** data-sec — a stable hook for tests and screenshots. */
  sec?: string;
  pad?: string;
  max?: number;
  glow?: false | { left?: string; top?: string; strength?: number };
  sweep?: boolean;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const dark = surface === "dark";
  return (
    <section
      id={id}
      data-sec={sec}
      className={dark ? "a4k-dark" : undefined}
      style={{
        position: "relative",
        overflow: dark ? "hidden" : undefined,
        padding: pad ?? SECTION_PAD,
        background: SURFACE_BG[surface],
        color: dark ? "#FFFFFF" : INK,
        fontFamily: SANS,
        ...style,
      }}
    >
      {dark && glow !== false ? <DriftGlow {...(glow || {})} /> : null}
      {sweep ? <SweepSlab /> : null}
      <div style={{ position: "relative", maxWidth: max, margin: "0 auto" }}>{children}</div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Type                                                                       */
/* ────────────────────────────────────────────────────────────────────────── */

/** The one emphasised word, on the brand gradient. */
export function G({ children }: { children: ReactNode }) {
  return <span style={{ ...gradText, paddingBottom: ".06em" }}>{children}</span>;
}

/** "01  Build your quote" — numbered eyebrow (rises in). */
export function Eyebrow({
  n,
  children,
  dark = false,
  d,
  center = false,
  style,
}: {
  n?: string;
  children: ReactNode;
  dark?: boolean;
  d?: number;
  center?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      data-fx="rise"
      data-d={d || undefined}
      className="a4-eyebrow"
      style={{ color: dark ? "#A1A1AA" : "#52525B", justifyContent: center ? "center" : undefined, ...style }}
    >
      {n ? (
        <span style={{ color: dark ? PERI : INDIGO }}>{n}</span>
      ) : (
        <span
          aria-hidden="true"
          style={{ display: "inline-block", width: 9, height: 9, borderRadius: 1, background: dark ? PERI : INDIGO, transform: "skewX(-30deg)", alignSelf: "center", flexShrink: 0 }}
        />
      )}
      <span>{children}</span>
    </div>
  );
}

/** Eyebrow + H2 + sub — "01 Build your quote / Choose what you need." */
export function Head({
  n,
  eyebrow,
  title,
  sub,
  dark = false,
  align = "left",
  size = "md",
  maxWidth = 680,
  d = 0,
  as: Tag = "h2",
}: {
  n?: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  dark?: boolean;
  align?: "left" | "center";
  size?: "md" | "lg";
  maxWidth?: number;
  d?: number;
  as?: "h2" | "h3";
}) {
  const center = align === "center";
  const lg = size === "lg";
  return (
    <div style={{ textAlign: align, maxWidth: center ? Math.max(maxWidth, 760) : undefined, margin: center ? "0 auto" : undefined }}>
      {eyebrow ? (
        <Eyebrow n={n} dark={dark} d={d} center={center}>
          {eyebrow}
        </Eyebrow>
      ) : null}
      <Tag
        data-fx="rise"
        data-d={d + 100}
        style={{
          margin: eyebrow ? `${lg ? 16 : 14}px 0 0` : 0,
          fontFamily: SANS,
          fontSize: lg ? "clamp(40px,5.6vw,92px)" : "clamp(32px,3.6vw,52px)",
          fontWeight: 600,
          letterSpacing: lg ? "-0.04em" : "-0.035em",
          lineHeight: lg ? 1.02 : 1.04,
          color: dark ? "#FFFFFF" : INK,
          textWrap: "balance",
        }}
      >
        {title}
      </Tag>
      {sub ? (
        <p
          data-fx="rise"
          data-d={d + 200}
          style={{
            margin: `${lg ? 22 : 14}px ${center ? "auto" : "0"} 0`,
            maxWidth,
            fontFamily: BODY,
            fontSize: 17,
            lineHeight: 1.55,
            color: dark ? "#A1A1AA" : "#52525B",
            textWrap: "pretty",
          }}
        >
          {sub}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The display statement — a typewriter line, then a line that rises in with
 * one gradient word ("The quote, / line by line."). Rendered as a real heading
 * with the visual letters hidden from assistive tech.
 */
export function Statement({
  typed,
  words,
  label,
  dark = false,
  align = "left",
  size = "section",
  per = 42,
  d = 0,
  as: Tag = "h2",
  style,
}: {
  typed: string;
  words: { t: ReactNode; g?: boolean }[];
  /** Plain-text reading of the whole heading, for screen readers. */
  label: string;
  dark?: boolean;
  align?: "left" | "center";
  size?: "section" | "big" | "cta";
  per?: number;
  d?: number;
  as?: "h1" | "h2" | "div";
  style?: CSSProperties;
}) {
  const fontSize =
    size === "big" ? "clamp(44px,7.4vw,132px)" : size === "cta" ? "clamp(44px,6.4vw,112px)" : "clamp(42px,6.4vw,112px)";
  const after = d + Array.from(typed).length * per + 80;
  return (
    <Tag style={{ margin: 0, textAlign: align, fontFamily: SANS, fontSize, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: size === "cta" ? 1.06 : 1.08, ...style }}>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" style={{ display: "block" }}>
        <TypeText as="span" segments={[{ t: typed, c: dark ? "#FFFFFF" : INK }]} per={per} d={d || undefined} caret={dark ? PERI : INDIGO} style={{ display: "inline-block" }} />
        <Words as="span" d={after} style={{ display: "block", fontWeight: 600 }} parts={words} />
      </span>
    </Tag>
  );
}

/** Lead line: Outfit 500, the design's `clamp(19px,1.9vw,28px)` family. */
export function Lead({ children, dark = false, d, style }: { children: ReactNode; dark?: boolean; d?: number; style?: CSSProperties }) {
  return (
    <p
      data-fx="rise"
      data-d={d || undefined}
      style={{ margin: 0, fontFamily: SANS, fontSize: "clamp(19px,1.7vw,24px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.42, color: dark ? "#A1A1AA" : "#3F3F46", textWrap: "pretty", ...style }}
    >
      {children}
    </p>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Controls                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */

const PILL_CLASS = {
  light: "a4-btn-light",
  ghost: "a4-btn-ghost",
  ink: "a4-btn-ink",
  outline: "a4-btn-outline",
  indigo: "a4-btn-indigo",
} as const;

export type PillVariant = keyof typeof PILL_CLASS;

/** Pill link — local links go through LocalizedLink, external ones stay plain anchors. */
export function PillLink({
  href,
  variant = "light",
  size = "lg",
  children,
  target,
  style,
  ariaLabel,
}: {
  href: string;
  variant?: PillVariant;
  size?: "lg" | "md" | "sm";
  children: ReactNode;
  target?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}) {
  const sizing: CSSProperties = size === "md" ? { height: 48, padding: "0 24px", fontSize: 16 } : size === "sm" ? { height: 40, padding: "0 18px", fontSize: 14.5 } : {};
  const className = `a4-btn ${PILL_CLASS[variant]}`;
  const s = { textDecoration: "none", ...sizing, ...style };
  if (isExternalHref(href)) {
    return (
      <a href={href} target={target} rel={target === "_blank" ? "noopener noreferrer" : undefined} className={className} style={s} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }
  return (
    <LocalizedLink href={href} className={className} style={s} aria-label={ariaLabel}>
      {children}
    </LocalizedLink>
  );
}

/** Row of pills under a heading. */
export function Pills({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, ...style }}>{children}</div>;
}

/** The design's segmented control (Monthly / Annual). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  style,
}: {
  options: { id: T; label: ReactNode; icon?: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  style?: CSSProperties;
}) {
  return (
    <div role="group" aria-label={label} className="a4k-seg" style={style}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button key={o.id} type="button" aria-pressed={on} onClick={() => onChange(o.id)}>
            {o.icon ? <Icon name={o.icon} size={17} color={on ? "#FFFFFF" : "#71717A"} /> : null}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Single-select option pills (bands, entity, volume). `value` -1 = nothing picked. */
export function OptionPills({
  items,
  value,
  onPick,
  label,
  min = 150,
  style,
}: {
  items: string[];
  value: number;
  onPick: (i: number) => void;
  label: string;
  /** Minimum pill width before the grid wraps. */
  min?: number;
  style?: CSSProperties;
}) {
  return (
    <div role="group" aria-label={label} className="a4k-opts" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${min}px), 1fr))`, ...style }}>
      {items.map((it, i) => (
        <button key={it} type="button" className="a4k-opt" aria-pressed={value === i} onClick={() => onPick(i)}>
          {it}
        </button>
      ))}
    </div>
  );
}

/** The design's 48×28 toggle. */
export function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className="a4k-switch" onClick={() => onChange(!on)}>
      <span />
    </button>
  );
}

/** − n + stepper with pill buttons. */
export function Stepper({ value, onChange, min = 1, max = 10, label }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label: string }) {
  return (
    <div role="group" aria-label={label} style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
      <button type="button" className="a4k-step" aria-label={`Fewer ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
        <Icon name="minus" size={16} color={INK} />
      </button>
      <span aria-live="polite" style={{ minWidth: 22, textAlign: "center", fontFamily: SANS, fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
      <button type="button" className="a4k-step" aria-label={`More ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
        <Icon name="plus" size={16} color={INK} />
      </button>
    </div>
  );
}

/** Check mark used in the design's checkbox and stamp. */
export function Check({ size = 14, color = "#FFFFFF", width = 3.2 }: { size?: number; color?: string; width?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, display: "block" }} aria-hidden="true">
      <path d="M5 12l4 4 10-10" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Cards                                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

export const GRID3: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: 16 };
export const GRID2: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))", gap: 16 };

/** Size the big card word so the longest still fits a 340px card on one line. */
export function wordSize(word: string): string {
  const n = Array.from(word).length;
  if (n <= 8) return "clamp(42px,4vw,60px)";
  if (n <= 11) return "clamp(38px,3.4vw,52px)";
  if (n <= 13) return "clamp(34px,3vw,46px)";
  return "clamp(30px,2.7vw,40px)";
}

export type CardFx = "scatter" | "tighten" | "cascade" | "stack" | "zoom" | "type";
export const FX_CYCLE: CardFx[] = ["scatter", "tighten", "cascade", "stack", "zoom", "type"];

/** "01 / 06" counter. */
export function Counter({ i, total, dark = false }: { i: number; total: number; dark?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: dark ? "#A1A1AA" : "#52525B" }}>
      <span style={{ color: dark ? PERI : INDIGO }}>{pad2(i + 1)}</span>
      <span>/ {pad2(total)}</span>
    </div>
  );
}

/**
 * The design's service card: counter, big letter-effect word, a line, and a
 * foot row over a hairline. Alternate `dark` with `i % 2`. With `href` the
 * whole card is the link.
 */
export function WordCard({
  i,
  total,
  word,
  fx,
  line,
  dark = false,
  icon,
  topRight,
  foot,
  go,
  href,
  ariaLabel,
  d,
  wordDelay,
  minHeight = 330,
  children,
}: {
  i: number;
  total: number;
  word: string;
  fx?: CardFx;
  line?: ReactNode;
  dark?: boolean;
  icon?: string;
  topRight?: ReactNode;
  foot?: ReactNode;
  /** Label of the foot chip (arrow chip when the card is a link). */
  go?: ReactNode;
  href?: string;
  ariaLabel?: string;
  d?: number;
  wordDelay?: number;
  minHeight?: number;
  children?: ReactNode;
}) {
  const chars = Array.from(word);
  const n = chars.length;
  const colors = chars.map((_, j) => (dark ? "#FFFFFF" : gcol(n > 1 ? j / (n - 1) : 0)));
  const rule = dark ? "rgba(255,255,255,.1)" : "#E4E4E7";
  const inner = (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Counter i={i} total={total} dark={dark} />
        {topRight ??
          (icon ? (
            <span
              aria-hidden="true"
              style={{ width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 999, background: dark ? "rgba(139,143,247,.14)" : "rgba(79,85,241,.08)" }}
            >
              <Icon name={icon} size={20} color={dark ? PERI : INDIGO} stroke={1.8} />
            </span>
          ) : null)}
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", minHeight: 110 }}>
        <LetterWord
          text={word}
          fx={fx ?? FX_CYCLE[i % FX_CYCLE.length]}
          d={wordDelay ?? 220 + (i % 3) * 90}
          per={55}
          colors={colors}
          style={{ fontSize: wordSize(word), fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.1, whiteSpace: "nowrap" }}
        />
      </div>
      {line ? (
        <p style={{ margin: 0, fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.35, color: dark ? "#E4E4E7" : "#3F3F46", textWrap: "pretty" }}>{line}</p>
      ) : null}
      {children}
      {foot || go ? (
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 16, borderTop: `1px solid ${rule}` }}>
          <div style={{ minWidth: 0 }}>{foot}</div>
          {go ? (
            <span className="a4k-go" aria-hidden={href ? true : undefined}>
              {go}
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );
  const className = `a4k-card${dark ? " a4k-card-dark" : ""}`;
  const style: CSSProperties = { minHeight };
  if (href) {
    return (
      <LocalizedLink href={href} className={className} style={style} aria-label={ariaLabel} data-fx="rise" data-d={d || undefined}>
        {inner}
      </LocalizedLink>
    );
  }
  return (
    <div className={className} style={style} data-fx="rise" data-d={d || undefined}>
      {inner}
    </div>
  );
}

/** A plain design card (title + text), alternating light/dark or glass on dark sections. */
export function TextCard({
  i,
  total,
  title,
  text,
  icon,
  tone = "light",
  d,
  minHeight,
  children,
}: {
  i?: number;
  total?: number;
  title: ReactNode;
  text?: ReactNode;
  icon?: string;
  tone?: "light" | "dark" | "glass";
  d?: number;
  minHeight?: number;
  children?: ReactNode;
}) {
  const dark = tone !== "light";
  return (
    <div className={`a4k-card${tone === "dark" ? " a4k-card-dark" : tone === "glass" ? " a4k-card-glass" : ""}`} style={{ minHeight, gap: 0 }} data-fx="rise" data-d={d || undefined}>
      {i != null || icon ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: "clamp(40px,4.4vw,64px)" }}>
          {i != null && total ? <Counter i={i} total={total} dark={dark} /> : <span />}
          {icon ? (
            <span aria-hidden="true" style={{ width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 999, background: dark ? "rgba(139,143,247,.14)" : "rgba(79,85,241,.08)" }}>
              <Icon name={icon} size={20} color={dark ? PERI : INDIGO} stroke={1.8} />
            </span>
          ) : null}
        </div>
      ) : null}
      <h3 style={{ margin: 0, fontFamily: SANS, fontSize: "clamp(24px,2.1vw,30px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15, color: dark ? "#FFFFFF" : INK, textWrap: "balance" }}>{title}</h3>
      {text ? (
        <p style={{ margin: "12px 0 0", fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}>{text}</p>
      ) : null}
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Lists                                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

/** Skewed indigo bullets — the quote document's scope list. */
export function Bullets({
  items,
  dark = false,
  cols,
  size = 15,
  style,
}: {
  items: ReactNode[];
  dark?: boolean;
  /** Minimum column width; omit for a single column. */
  cols?: number;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "grid",
        gridTemplateColumns: cols ? `repeat(auto-fill, minmax(min(100%, ${cols}px), 1fr))` : "minmax(0,1fr)",
        gap: "10px 28px",
        ...style,
      }}
    >
      {items.map((it, k) => (
        <li key={k} style={{ display: "flex", gap: 12, fontFamily: BODY, fontSize: size, lineHeight: 1.5, color: dark ? "#D4D4D8" : "#3F3F46" }}>
          <span className="a4-bullet" style={dark ? { background: PERI } : undefined} />
          <span style={{ minWidth: 0 }}>{it}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Paragraphs with their list. A paragraph that introduces the list ("…clients
 * can:") is followed by it; otherwise the list closes the block.
 */
export function ProseWithList({ content, list, size = 16 }: { content: string[]; list?: string[]; size?: number }) {
  const hasList = !!list && list.length > 0;
  const lead = hasList ? content.findIndex((p) => p.trim().endsWith(":")) : -1;
  const at = lead >= 0 ? lead + 1 : content.length;
  const para = (p: string, i: number) => (
    <p key={i} style={{ margin: i ? "12px 0 0" : 0, textWrap: "pretty" }}>
      {p}
    </p>
  );
  return (
    <>
      {content.slice(0, at).map((p, i) => para(p, i))}
      {hasList ? <Bullets items={list!} size={size} style={{ margin: `${at ? 16 : 0}px 0 ${at < content.length ? 4 : 0}px` }} /> : null}
      {content.slice(at).map((p, i) => para(p, at + i))}
    </>
  );
}

/** Numbered rows with hairlines — the design's terms list. */
export function NumberedRows({
  items,
  dark = false,
  start = 1,
  d,
}: {
  items: { t?: ReactNode; body?: ReactNode; key?: string }[];
  dark?: boolean;
  start?: number;
  d?: number;
}) {
  const rule = dark ? "rgba(255,255,255,.1)" : "#E4E4E7";
  // Each row rises on its own: a long list rising as one block would stay
  // blank on a phone until 12% of its whole height is on screen.
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column" }}>
      {items.map((it, i) => (
        <li
          key={it.key ?? i}
          data-fx="rise"
          data-d={(d ?? 0) + Math.min(i, 4) * 60 || undefined}
          style={{
            display: "grid",
            gridTemplateColumns: "clamp(34px,3.4vw,48px) minmax(0,1fr)",
            gap: 12,
            padding: "22px 0",
            borderTop: `1px solid ${rule}`,
            ...(i === items.length - 1 ? { borderBottom: `1px solid ${rule}` } : null),
          }}
        >
          <span style={{ paddingTop: it.t ? 4 : 2, fontFamily: SANS, fontSize: 16, fontWeight: 600, color: dark ? PERI : INDIGO }}>{pad2(start + i)}</span>
          <div style={{ minWidth: 0 }}>
            {it.t ? (
              <div style={{ fontFamily: SANS, fontSize: "clamp(20px,1.8vw,24px)", fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.2, color: dark ? "#FFFFFF" : INK }}>{it.t}</div>
            ) : null}
            {it.body ? (
              <div style={{ marginTop: it.t ? 10 : 0, fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: dark ? "#A1A1AA" : "#3F3F46" }}>{it.body}</div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Numbered link rows — "01  Audit Readiness  →". */
export function LinkRows({ items, start = 1 }: { items: { href: string; t: ReactNode; s?: ReactNode; key?: string }[]; start?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {items.map((it, i) => (
        <LocalizedLink key={it.key ?? it.href} href={it.href} className="a4k-rowlink">
          <span style={{ alignSelf: "start", paddingTop: 5, fontFamily: SANS, fontSize: 16, fontWeight: 600, color: INDIGO }}>{pad2(start + i)}</span>
          <span style={{ minWidth: 0 }}>
            <span className="a4k-rowlink-t" style={{ display: "block", fontFamily: SANS, fontSize: "clamp(21px,1.9vw,26px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.2 }}>
              {it.t}
            </span>
            {it.s ? <span style={{ display: "block", marginTop: 6, fontFamily: BODY, fontSize: 15, lineHeight: 1.5, color: "#52525B" }}>{it.s}</span> : null}
          </span>
          <span className="a4k-rowlink-arrow" aria-hidden="true">
            <Icon name="arrow-right" size={22} color="currentColor" />
          </span>
        </LocalizedLink>
      ))}
    </div>
  );
}

/** Numbered steps with the line that fills as you scroll (data-tl). */
export function Timeline({ steps, dark = false, min = 220 }: { steps: { t?: ReactNode; s?: ReactNode; key?: string }[]; dark?: boolean; min?: number }) {
  return (
    <div data-tl="" style={{ position: "relative", marginTop: "clamp(56px,7vw,96px)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 11, height: 2, background: dark ? "rgba(255,255,255,.12)" : "#E4E4E7" }} />
      <div data-tl-fill="" style={{ position: "absolute", left: 0, right: 0, top: 11, height: 2, background: GRAD }} />
      <ol style={{ position: "relative", listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`, gap: "48px 32px" }}>
        {steps.map((st, i) => (
          <li key={st.key ?? i} data-fx="rise" data-d={i * 100 || undefined}>
            <div style={{ position: "relative", width: 24, height: 24, borderRadius: "50%", background: dark ? INK : "#FFFFFF", border: `2px solid ${dark ? "#3F3F46" : "#E4E4E7"}` }}>
              <span data-tl-dot="" style={{ position: "absolute", inset: 3, borderRadius: "50%", background: dark ? PERI : INDIGO, transition: "transform .45s cubic-bezier(.16,1,.3,1)" }} />
            </div>
            <div style={{ marginTop: 28, fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: dark ? PERI : INDIGO }}>{pad2(i + 1)}</div>
            {st.t ? (
              <div style={{ marginTop: 8, fontFamily: SANS, fontSize: "clamp(24px,2.2vw,30px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15, color: dark ? "#FFFFFF" : INK }}>{st.t}</div>
            ) : null}
            {st.s ? (
              st.t ? (
                <p style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}>{st.s}</p>
              ) : (
                <p style={{ margin: "10px 0 0", fontFamily: SANS, fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.4, color: dark ? "#E4E4E7" : "#3F3F46", textWrap: "pretty" }}>{st.s}</p>
              )
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* The quote document                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

export const DOC_PAD = "clamp(24px,4vw,48px)";

/** White 28-radius document panel with the big soft shadow. */
export function Doc({ children, style, d, rise = true }: { children: ReactNode; style?: CSSProperties; d?: number; rise?: boolean }) {
  return (
    <div
      data-fx={rise ? "rise" : undefined}
      data-dy={rise ? 80 : undefined}
      data-d={rise ? d || undefined : undefined}
      style={{ background: "#FFFFFF", color: INK, border: "1px solid #E4E4E7", borderRadius: 28, boxShadow: "0 50px 120px rgba(9,9,11,.12)", overflow: "hidden", fontFamily: SANS, ...style }}
    >
      {children}
    </div>
  );
}

/** Document header: the mark and "A4 Services" left, a kicker and a title right. */
export function DocHead({ k, title, compact = false, rise = false }: { k: ReactNode; title: ReactNode; compact?: boolean; rise?: boolean }) {
  return (
    <div
      data-fx={rise ? "rise" : undefined}
      style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px 24px", padding: compact ? "28px 28px 0" : `${DOC_PAD} ${DOC_PAD} 0` }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <A4Mark size={compact ? 30 : 40} color={INK} />
        <span style={{ width: 1.5, height: compact ? 24 : 32, margin: "0 12px", background: INK, opacity: 0.35 }} />
        <span style={{ fontSize: compact ? 17 : 20, fontWeight: 500, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>A4 Services</span>
      </div>
      <div style={{ textAlign: "right", minWidth: 0, marginLeft: "auto" }}>
        <div style={kicker}>{k}</div>
        <div style={{ marginTop: 4, fontSize: compact ? 22 : 28, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15 }}>{title}</div>
      </div>
    </div>
  );
}

/** One document row over a hairline: number + word + line left, detail right. */
export function DocRow({
  n,
  word,
  line,
  children,
  aside,
  compact = false,
  rise = false,
}: {
  n?: string;
  word: ReactNode;
  line?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
  compact?: boolean;
  /** Rise on its own — for long documents whose panel does not rise as a whole. */
  rise?: boolean;
}) {
  return (
    <div
      data-fx={rise ? "rise" : undefined}
      data-dy={rise ? 30 : undefined}
      style={{ display: "flex", flexWrap: "wrap", alignItems: compact ? "baseline" : undefined, gap: "10px 36px", padding: `${compact ? 20 : 28}px ${DOC_PAD}`, borderTop: "1px solid #E4E4E7" }}
    >
      <div style={{ flex: "1 1 240px", display: "flex", gap: 16, minWidth: 0 }}>
        {n ? <span style={{ paddingTop: compact ? 3 : 7, fontSize: 15, fontWeight: 600, letterSpacing: ".02em", color: INDIGO }}>{n}</span> : null}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: compact ? 19 : 26, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15 }}>{word}</div>
          {line ? <div style={{ marginTop: 6, fontFamily: BODY, fontSize: 15, lineHeight: 1.5, color: "#52525B" }}>{line}</div> : null}
        </div>
      </div>
      {children ? <div style={{ flex: "1.4 1 280px", minWidth: 0, paddingTop: compact ? 0 : 4 }}>{children}</div> : null}
      {aside ? <div style={{ flex: "0 0 auto", marginLeft: "auto", textAlign: "right" }}>{aside}</div> : null}
    </div>
  );
}

/** The #FAFAFA footer of a document. */
export function DocFoot({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 24, padding: `32px ${DOC_PAD} 40px`, borderTop: "1px solid #E4E4E7", background: "#FAFAFA", ...style }}>
      {children}
    </div>
  );
}

/** The dark note chip in a document footer ("VAT added at 18% · registry fees at cost"). */
export function DocChip({ children }: { children: ReactNode }) {
  return (
    <span style={{ display: "inline-block", padding: "6px 13px", borderRadius: 999, background: "rgba(9,9,11,.78)", color: "#FFFFFF", fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>
      {children}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Dark CTA band                                                              */
/* ────────────────────────────────────────────────────────────────────────── */

/** The dark card on the right of a CTA band (the design's accept card). */
export function CtaCard({ children, style, d = 200 }: { children: ReactNode; style?: CSSProperties; d?: number }) {
  return (
    <div
      data-fx="rise"
      data-d={d || undefined}
      style={{ position: "relative", padding: "clamp(24px,3.4vw,40px)", borderRadius: 28, background: "rgba(24,24,27,.92)", border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 40px 100px rgba(0,0,0,.45)", color: "#FFFFFF", ...style }}
    >
      {children}
    </div>
  );
}

/**
 * "Accept your / quotation." — the closing dark band: a typed heading with a
 * gradient second line on the left, a lead, and a card (or pills) on the right.
 * Ends on a hairline so it hands over cleanly to the footer's own band.
 */
export function DarkCta({
  id,
  sec,
  eyebrow,
  n,
  typed,
  words,
  label,
  lead,
  below,
  children,
}: {
  id?: string;
  sec?: string;
  eyebrow?: ReactNode;
  n?: string;
  typed: string;
  words: { t: ReactNode; g?: boolean }[];
  label: string;
  lead?: ReactNode;
  /** Anything under the lead (a price, a note). */
  below?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Band surface="dark" id={id} sec={sec} glow={{ left: "-10%", top: "-20%", strength: 0.26 }} pad="clamp(110px,14vw,190px) clamp(20px,5vw,72px) clamp(72px,8vw,112px)">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))", gap: "56px 72px", alignItems: "center" }}>
        <div>
          {eyebrow ? (
            <Eyebrow n={n} dark style={{ marginBottom: 22 }}>
              {eyebrow}
            </Eyebrow>
          ) : null}
          <Statement typed={typed} words={words} label={label} dark size="cta" per={45} />
          {lead ? (
            <p data-fx="rise" data-d="700" style={{ margin: "28px 0 0", maxWidth: 560, fontFamily: SANS, fontSize: "clamp(18px,1.8vw,24px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.4, color: "#A1A1AA", textWrap: "pretty" }}>
              {lead}
            </p>
          ) : null}
          {below}
        </div>
        {children}
      </div>
      <div aria-hidden="true" style={{ marginTop: "clamp(88px,10vw,140px)", height: 1, background: "rgba(255,255,255,.08)" }} />
    </Band>
  );
}
