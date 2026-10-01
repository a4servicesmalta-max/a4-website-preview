/**
 * Section building blocks for the pages rebuilt from the old white/zinc style,
 * lifted from the A4 Quotation design (src/app/q/[id]/QuotationLanding.tsx):
 * section surfaces, the centred statement, numbered rows, the scroll-filled
 * timeline, the document panel and its pieces.
 *
 * Hook-free on purpose — motion comes from `data-fx` attributes bound by
 * FxRuntime, so these render the same from server or client components.
 */
import type { CSSProperties, ReactNode } from "react";
import {
  A4Mark,
  DARK_CARD,
  DARK_GRID,
  DriftGlow,
  GRAD,
  LIGHT_GLOW,
  MUTED_GLOW,
  SweepSlab,
  TypeText,
  Words,
  gradText,
} from "@/components/fx/primitives";

export const SANS = "var(--a4x-display), Outfit, Inter, system-ui, sans-serif";
export const BODY = "var(--a4x-body), Inter, system-ui, sans-serif";
export const INK = "#09090B";
export const INDIGO = "#4F55F1";
export const PERI = "#8B8FF7";
export { GRAD, DARK_CARD, gradText };

/** Small-caps label (Inter 12 / 600 / .1em). */
export const kicker: CSSProperties = {
  fontFamily: BODY,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "#71717A",
};

export const SECTION_PAD = "clamp(100px,13vw,180px) clamp(20px,5vw,72px)";
export const SECTION_PAD_TIGHT = "clamp(72px,9vw,128px) clamp(20px,5vw,72px)";

export type Surface = "dark" | "light" | "muted" | "white";
const SURFACE_BG: Record<Surface, string> = { dark: DARK_GRID, light: LIGHT_GLOW, muted: MUTED_GLOW, white: "#FFFFFF" };

/** A full-width section on one of the design's surfaces, content capped at 1280. */
export function Band({
  surface = "light",
  id,
  glow,
  sweep = false,
  tight = false,
  width = 1280,
  children,
  style,
  innerStyle,
}: {
  surface?: Surface;
  id?: string;
  /** Drifting indigo glow (dark surfaces default to on). */
  glow?: boolean;
  /** The skewed slab that sweeps across with scroll. */
  sweep?: boolean;
  tight?: boolean;
  width?: number;
  children: ReactNode;
  style?: CSSProperties;
  innerStyle?: CSSProperties;
}) {
  const dark = surface === "dark";
  const showGlow = glow ?? dark;
  return (
    <section
      id={id}
      style={{
        position: "relative",
        overflow: "hidden",
        padding: tight ? SECTION_PAD_TIGHT : SECTION_PAD,
        background: SURFACE_BG[surface],
        color: dark ? "#FFFFFF" : INK,
        fontFamily: SANS,
        ...style,
      }}
    >
      {showGlow ? <DriftGlow left={dark ? "38%" : "-20%"} top="-35%" strength={dark ? 0.24 : 0.1} /> : null}
      {sweep ? <SweepSlab /> : null}
      <div style={{ position: "relative", maxWidth: width, margin: "0 auto", ...innerStyle }}>{children}</div>
    </section>
  );
}

/**
 * Card surfaces. Light cards use `.a4-card` (white, hairline, indigo border +
 * glow on hover); dark cards are the design's DARK_CARD with the periwinkle
 * hover. Spread `card(dark)` onto the element, then add padding etc.
 */
export const CARD_DARK_CLASS =
  "rounded-[24px] border border-white/[.06] transition-[border-color,box-shadow] duration-300 hover:border-[rgba(139,143,247,.45)] hover:shadow-[0_24px_60px_rgba(9,9,11,.28)]";
export function card(dark: boolean, style?: CSSProperties): { className: string; style: CSSProperties } {
  return dark
    ? { className: CARD_DARK_CLASS, style: { background: DARK_CARD, color: "#FFFFFF", ...style } }
    : { className: "a4-card", style: { color: INK, ...style } };
}

/** "Task and Documents Upload" → "Task and Documents" + gradient "Upload". */
export function gradTail(text: string, words = 1): ReactNode {
  const parts = text.trim().split(/\s+/);
  if (parts.length <= words) return <span style={{ ...gradText, paddingBottom: ".06em" }}>{text}</span>;
  const head = parts.slice(0, parts.length - words).join(" ");
  const tail = parts.slice(parts.length - words).join(" ");
  return (
    <>
      {head} <span style={{ ...gradText, paddingBottom: ".06em" }}>{tail}</span>
    </>
  );
}

/**
 * Eyebrows read in sentence case in the design ("Build your quote"); labels
 * stored in capitals ("RISK-BASED AUDIT") are shown that way. Mixed-case text
 * is left alone.
 */
export function sentence(text: string): string {
  const s = String(text ?? "");
  if (!/[A-Z]/.test(s) || s !== s.toUpperCase()) return s;
  const lower = s.toLocaleLowerCase();
  return lower.charAt(0).toLocaleUpperCase() + lower.slice(1);
}

/** Splits a phrase in two lines for the statement pattern, roughly in half by words. */
export function splitPhrase(text: string): [string, string] {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 2) return [text, ""];
  const cut = Math.ceil(parts.length / 2);
  return [parts.slice(0, cut).join(" "), parts.slice(cut).join(" ")];
}

/**
 * The design's statement: a typewriter first line and a second line whose
 * words rise in, the last one on the brand gradient ("Every service. / One portal.").
 */
export function Statement({
  first,
  second,
  dark = false,
  align = "center",
  size = "clamp(42px,6.4vw,112px)",
  as: Tag = "div",
  style,
}: {
  first: string;
  second?: string;
  dark?: boolean;
  align?: "center" | "left";
  size?: string;
  as?: "div" | "h2" | "h1";
  style?: CSSProperties;
}) {
  const words = second ? second.trim().split(/\s+/) : [];
  const parts =
    words.length > 1
      ? [{ t: words.slice(0, -1).join(" ") }, { t: words[words.length - 1], g: true }]
      : words.length === 1
        ? [{ t: words[0], g: true }]
        : [];
  return (
    <Tag
      style={{
        margin: 0,
        textAlign: align,
        fontFamily: SANS,
        fontSize: size,
        fontWeight: 500,
        letterSpacing: "-0.035em",
        lineHeight: 1.1,
        color: dark ? "#FFFFFF" : INK,
        textWrap: "balance",
        ...style,
      }}
    >
      <TypeText
        segments={[{ t: first, c: dark ? "#FFFFFF" : INK }]}
        per={40}
        caret={dark ? PERI : INDIGO}
        style={{ display: align === "center" ? "inline-block" : "block" }}
      />
      {parts.length ? <Words d={Math.min(1400, 260 + Array.from(first).length * 40)} style={{ fontWeight: 600 }} parts={parts} /> : null}
    </Tag>
  );
}

/** Two-line heading for the numbered-list pattern: plain line, then the gradient line. */
export function TwoLineHeading({
  first,
  second,
  dark = false,
  size = "clamp(40px,5.2vw,84px)",
  d = 100,
}: {
  first: ReactNode;
  second?: ReactNode;
  dark?: boolean;
  size?: string;
  d?: number;
}) {
  return (
    <h2 style={{ margin: "18px 0 0", fontFamily: SANS, fontSize: size, letterSpacing: "-0.035em", lineHeight: 1.05, color: dark ? "#FFFFFF" : INK }}>
      <span data-fx="rise" data-d={d} style={{ display: "block", fontWeight: 500 }}>
        {first}
      </span>
      {second ? (
        <span data-fx="rise" data-d={d + 100} style={{ display: "block", fontWeight: 600, letterSpacing: "-0.04em", paddingBottom: ".08em", ...gradText }}>
          {second}
        </span>
      ) : null}
    </h2>
  );
}

/** Numbered rows with hairlines (terms / FAQ pattern). */
export function NumberedRows({
  items,
  dark = false,
  start = 1,
  d = 150,
  size = 17,
}: {
  items: ReactNode[];
  dark?: boolean;
  start?: number;
  d?: number;
  size?: number;
}) {
  const line = dark ? "rgba(255,255,255,.1)" : "#E4E4E7";
  return (
    <div data-fx="rise" data-d={d} style={{ display: "flex", flexDirection: "column" }}>
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "48px 1fr",
            gap: 12,
            padding: "22px 0",
            borderTop: `1px solid ${line}`,
            ...(i === items.length - 1 ? { borderBottom: `1px solid ${line}` } : null),
          }}
        >
          <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: dark ? PERI : INDIGO, paddingTop: 2 }}>
            {String(i + start).padStart(2, "0")}
          </span>
          <div style={{ fontFamily: BODY, fontSize: size, lineHeight: 1.6, color: dark ? "#D4D4D8" : "#3F3F46", minWidth: 0 }}>{it}</div>
        </div>
      ))}
    </div>
  );
}

/** The skewed indigo bullet list. */
export function Bullets({
  items,
  dark = false,
  size = 16,
  gap = 10,
  color,
}: {
  items: ReactNode[];
  dark?: boolean;
  size?: number;
  gap?: number;
  color?: string;
}) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap }}>
      {items.map((it, i) => (
        <li key={i} style={{ display: "flex", gap: 12, fontFamily: BODY, fontSize: size, lineHeight: 1.55, color: color ?? (dark ? "#D4D4D8" : "#3F3F46") }}>
          <span className="a4-bullet" style={dark ? { background: PERI } : undefined} />
          <span style={{ minWidth: 0 }}>{it}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Copy written as "Intro.\n\nThis includes:\n• one\n• two" — paragraphs and
 * "•" lines become paragraphs and the design's bullet list.
 */
export function RichText({ text, dark = false, size = 16 }: { text: string; dark?: boolean; size?: number }) {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = (key: string) => {
    if (bullets.length) {
      blocks.push(
        <div key={key} style={{ margin: "4px 0" }}>
          <Bullets items={bullets} dark={dark} size={size - 1} gap={8} />
        </div>
      );
      bullets = [];
    }
  };
  text.split("\n").forEach((raw, i) => {
    const line = raw.trim();
    if (!line) {
      flush(`b${i}`);
      return;
    }
    const m = line.match(/^[•\-–·]\s*(.+)$/);
    if (m) bullets.push(m[1]);
    else {
      flush(`b${i}`);
      blocks.push(
        <p key={`p${i}`} style={{ margin: 0, fontFamily: BODY, fontSize: size, lineHeight: 1.55, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}>
          {line}
        </p>
      );
    }
  });
  flush("end");
  return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{blocks}</div>;
}

/** Numbered steps on a line that fills as the section scrolls in (data-tl). */
export function Timeline({
  steps,
  dark = false,
  min = 220,
  style,
}: {
  steps: { title: ReactNode; body?: ReactNode }[];
  dark?: boolean;
  min?: number;
  style?: CSSProperties;
}) {
  return (
    <div data-tl="" style={{ position: "relative", ...style }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 11, height: 2, background: dark ? "rgba(255,255,255,.12)" : "#E4E4E7" }} />
      <div data-tl-fill="" style={{ position: "absolute", left: 0, right: 0, top: 11, height: 2, background: GRAD }} />
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`, gap: "48px 32px" }}>
        {steps.map((s, i) => (
          <div key={i} data-fx="rise" data-d={i * 100} style={{ minWidth: 0 }}>
            <div style={{ position: "relative", width: 24, height: 24, borderRadius: "50%", background: dark ? INK : "#FFFFFF", border: `2px solid ${dark ? "#3F3F46" : "#E4E4E7"}` }}>
              <span data-tl-dot="" style={{ position: "absolute", inset: 3, borderRadius: "50%", background: dark ? PERI : INDIGO, transition: "transform .45s cubic-bezier(.16,1,.3,1)" }} />
            </div>
            <div style={{ marginTop: 28, fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: dark ? PERI : INDIGO }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{ marginTop: 8, fontFamily: SANS, fontSize: "clamp(24px,2.2vw,30px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.12, color: dark ? "#FFFFFF" : INK, textWrap: "balance" }}>
              {s.title}
            </div>
            {s.body ? <div style={{ marginTop: 12 }}>{s.body}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/** White document panel (radius 28, the long soft shadow). */
export function DocPanel({ children, style, label }: { children: ReactNode; style?: CSSProperties; label?: string }) {
  return (
    <div
      role={label ? "img" : undefined}
      aria-label={label}
      style={{
        position: "relative",
        background: "#FFFFFF",
        border: "1px solid #E4E4E7",
        borderRadius: 28,
        boxShadow: "0 50px 120px rgba(9,9,11,.12)",
        overflow: "hidden",
        color: INK,
        fontFamily: SANS,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Document header: the mark + name on the left, a kicker over a figure on the right. */
export function DocHead({ title, label, value, pad = "24px 28px 0" }: { title: ReactNode; label?: ReactNode; value?: ReactNode; pad?: string }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, padding: pad }}>
      <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
        <A4Mark size={26} color={INK} />
        <span style={{ width: 1.5, height: 22, margin: "0 10px", background: INK, opacity: 0.35, flexShrink: 0 }} />
        <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
      </div>
      {label || value ? (
        <div style={{ textAlign: "right" }}>
          {label ? <div style={kicker}>{label}</div> : null}
          {value ? <div style={{ marginTop: 2, fontSize: 20, fontWeight: 600, letterSpacing: "-0.03em" }}>{value}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

/** A labelled block inside a document: kicker title, then hairline rows. */
export function DocRows({ title, rows, pad = "0 28px" }: { title?: ReactNode; rows: ReactNode[]; pad?: string }) {
  return (
    <div style={{ padding: pad }}>
      {title ? <div style={{ ...kicker, padding: "18px 0 10px" }}>{title}</div> : null}
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderTop: "1px solid #E4E4E7", fontSize: 15, fontWeight: 500, minWidth: 0 }}>
          {r}
        </div>
      ))}
    </div>
  );
}

export type Tone = "indigo" | "ink" | "line" | "muted";

/** Status pill in the palette: indigo tint (done / included), ink (flag), hairline (open), muted. */
export function StatusPill({ tone = "line", children, dark = false, style }: { tone?: Tone; children: ReactNode; dark?: boolean; style?: CSSProperties }) {
  const t = {
    indigo: { background: dark ? "rgba(139,143,247,.18)" : "rgba(79,85,241,.1)", color: dark ? "#FFFFFF" : INDIGO, border: "1px solid transparent" },
    ink: { background: dark ? "#FFFFFF" : INK, color: dark ? INK : "#FFFFFF", border: "1px solid transparent" },
    line: { background: "transparent", color: dark ? "#D4D4D8" : "#52525B", border: `1px solid ${dark ? "rgba(255,255,255,.18)" : "#E4E4E7"}` },
    muted: { background: dark ? "rgba(255,255,255,.06)" : "#F4F4F5", color: dark ? "#A1A1AA" : "#52525B", border: "1px solid transparent" },
  }[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 28,
        padding: "0 12px",
        borderRadius: 999,
        fontFamily: SANS,
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: "nowrap",
        flexShrink: 0,
        ...t,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** Browser chrome for a product frame: three dots and a centred label pill. */
export function FrameBar({ label, dark = false }: { label?: ReactNode; dark?: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        height: 40,
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "0 16px",
        background: dark ? "#18181B" : "#FAFAFA",
        borderBottom: `1px solid ${dark ? "rgba(255,255,255,.08)" : "#E4E4E7"}`,
      }}
    >
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 10, height: 10, borderRadius: 5, background: dark ? "#3F3F46" : "#E4E4E7" }} />
      ))}
      {label ? (
        <span
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            maxWidth: "calc(100% - 120px)",
            height: 24,
            padding: "0 12px",
            borderRadius: 12,
            background: dark ? "rgba(255,255,255,.06)" : "#F4F4F5",
            fontFamily: SANS,
            fontSize: 12.5,
            fontWeight: 600,
            color: dark ? "#D4D4D8" : "#27272A",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <A4Mark size={12} color={dark ? "#FFFFFF" : INK} />
          {label}
        </span>
      ) : null}
    </div>
  );
}

/** The dark stage a product mock floats on (ink, 32px grid, indigo corner glow). */
export function DarkStage({ children, style, minHeight = 460 }: { children: ReactNode; style?: CSSProperties; minHeight?: number | string }) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 28,
        background: DARK_CARD,
        border: "1px solid rgba(255,255,255,.06)",
        minHeight,
        padding: "clamp(20px,4vw,44px)",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
