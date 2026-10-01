"use client";

/* eslint-disable @next/next/no-img-element -- film frames place screenshots by frame units, not responsive images */
import React, { useId } from "react";
import { A4_F, A4_S } from "@/components/fx/primitives";
import { C, CENTER, FONT, GT, INDIGO, M, SKEW, SLAB_GRAD, blurF, clamp, fx, lerp, pr, rnd, type Seg } from "./core";

/**
 * The film's building blocks (a4-teaser.jsx), as React components driven by the
 * playhead T. Positions and sizes are frame units (the 1920×1080 frame).
 */

const ICONS: Record<string, string> = {
  sheet: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
  pdf: '<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4M9 12h6M9 16h6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  receipt: '<path d="M6 2h12v20l-3-2-3 2-3-2-3 2z"/><path d="M9 7h6M9 11h6M9 15h4"/>',
  sticky: '<path d="M4 4h16v10l-6 6H4z"/><path d="M14 20v-6h6"/>',
};

export function Icon({ name, size = 24, color = "currentColor", sw = 1.8 }: { name: string; size?: number; color?: string; sw?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: ICONS[name] || "" }}
    />
  );
}

/** A parallelogram at the slash angle of the A4 mark. */
export function Slab({
  w,
  h,
  r = 28,
  opacity = 0.75,
  bg = SLAB_GRAD,
  style,
  children,
}: {
  w: number;
  h: number;
  r?: number;
  opacity?: number;
  bg?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  return (
    <div style={{ position: "absolute", width: w, height: h, ...style }}>
      <div style={{ position: "absolute", inset: 0, transform: `skewX(${SKEW}deg)`, borderRadius: r, background: bg, opacity }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>{children}</div>
    </div>
  );
}

export function Cursor({ x, y, down = 0, scale = 1.7, opacity = 1 }: { x: number; y: number; down?: number; scale?: number; opacity?: number }) {
  return (
    <svg
      width={26 * scale}
      height={30 * scale}
      viewBox="0 0 26 30"
      style={{
        position: "absolute",
        left: x - 2 * scale,
        top: y - 2 * scale,
        transform: `scale(${1 - down * 0.16})`,
        transformOrigin: `${2 * scale}px ${2 * scale}px`,
        opacity,
        overflow: "visible",
        filter: "drop-shadow(0 6px 10px rgba(9,9,11,.35))",
        zIndex: 20,
      }}
    >
      <path d="M2 2 L2 24 L8 18.5 L12 27 L15.5 25.5 L11.5 17 L19 17 Z" fill="#fff" stroke={C.ink} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function Caret({ block, on, color = INDIGO, size }: { block: boolean; on: boolean; color?: string; size: number }) {
  const w = block ? "0.5em" : Math.max(3, size * 0.035);
  return (
    <span style={{ display: "inline-block", width: 0, height: "1em", position: "relative", marginRight: block ? "0.56em" : 0 }}>
      <span
        style={{
          position: "absolute",
          left: "0.05em",
          top: block ? "0.2em" : "0.12em",
          width: w,
          height: block ? "0.8em" : "1em",
          background: color,
          opacity: on ? 1 : 0,
          WebkitTextFillColor: "initial",
        }}
      />
    </span>
  );
}

/** Typewriter with the indigo caret; the untyped rest keeps its space so nothing jumps. */
export function Typed({
  segs,
  t0,
  t1,
  T,
  size,
  color = C.ink,
  block = false,
  caretColor = INDIGO,
  hideCaretAfter,
  wrap = false,
}: {
  segs: Seg[];
  t0: number;
  t1: number;
  T: number;
  size: number;
  color?: string;
  block?: boolean;
  caretColor?: string;
  hideCaretAfter?: number;
  /** Let the line wrap (portrait phones). */
  wrap?: boolean;
}) {
  const len = segs.reduce((a, s) => a + s.t.length, 0);
  const n = Math.floor(pr(T, t0, t1 - t0) * len + 1e-6);
  const on = (T < t1 || Math.floor((T - t1) / 0.25) % 2 === 0) && !(hideCaretAfter != null && T > hideCaretAfter);
  // Typed letters per segment, and the segment that carries the caret.
  const parts: { s: Seg; k: number; here: boolean }[] = [];
  let off = 0;
  let placed = false;
  for (const s of segs) {
    const here = !placed && n <= off + s.t.length;
    if (here) placed = true;
    parts.push({ s, k: clamp(n - off, 0, s.t.length), here });
    off += s.t.length;
  }
  return (
    <span style={{ whiteSpace: wrap ? "pre-wrap" : "pre" }}>
      {parts.map(({ s, k, here }, i) => {
        return (
          <span key={i} style={s.g ? GT : { color: s.c || color }}>
            {s.t.slice(0, k)}
            {here ? <Caret block={block} on={on} size={size} color={caretColor} /> : null}
            <span style={{ visibility: "hidden" }}>{s.t.slice(k)}</span>
          </span>
        );
      })}
    </span>
  );
}

/** Words that rise in one after another. */
export function Rise({
  units,
  T,
  t0,
  tout = null,
  stagger = 0.07,
  o = {},
  gap = "0.26em",
  color = C.ink,
  wrap = false,
}: {
  units: Seg[];
  T: number;
  t0: number;
  tout?: number | null;
  stagger?: number;
  o?: Parameters<typeof fx>[3];
  gap?: string;
  color?: string;
  wrap?: boolean;
}) {
  // Wrapping (portrait phones): split each unit into words so a long unit can break;
  // the words of one unit keep that unit's timing.
  const parts = wrap
    ? units.flatMap((u, i) => (u.t.match(/\S+\s*|\s+/g) || [u.t]).map((t) => ({ ...u, t, i })))
    : units.map((u, i) => ({ ...u, i }));
  return (
    <div style={{ display: "flex", gap: `0 ${gap}`, flexWrap: wrap ? "wrap" : "nowrap", alignItems: "baseline", justifyContent: "inherit" }}>
      {parts.map((u, k) => (
        <span key={k} style={{ display: "inline-block", whiteSpace: "pre", ...(u.g ? GT : { color: u.c || color }), ...fx(T, t0 + u.i * stagger, tout, o) }}>
          {u.t}
        </span>
      ))}
    </div>
  );
}

/** Echo cascade: the word and its fading copies slide in on the diagonal ("chase", Tax & VAT). */
export function Cascade({ T, a, x, word, top = 610, xoff = 0, color = C.ink }: { T: number; a: number; x: number; word: string; top?: number; xoff?: number; color?: string }) {
  const scroll = (T - a) * 90;
  return (
    <>
      {[5, 4, 3, 2, 1, 0].map((i) => {
        const e = M.enter(T, a + i * 0.05, 0.5);
        const px = 700 + xoff - i * 120 + scroll + x * 300;
        const py = top - i * 108 + scroll * 0.9 + x * 280;
        const op = i === 0 ? 1 : 0.5 * Math.pow(0.62, i - 1);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px - 280,
              top: py - 150,
              fontSize: 230,
              fontWeight: 600,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              whiteSpace: "nowrap",
              ...(i === 0 ? GT : { color }),
              opacity: op * Math.min(1, e * 2) * (1 - x),
              filter: blurF(i * 2.4 + (1 - e) * 10 + x * 10),
              transform: `translate(${-(1 - e) * 200}px, ${-(1 - e) * 180}px)`,
            }}
          >
            {word}
          </div>
        );
      })}
    </>
  );
}

/** Letters fly in from everywhere and assemble ("re-key", Accounting). */
export function Scatter({
  T,
  a,
  word,
  color = "#fff",
  size = 290,
  accent,
  stagger = 0.035,
}: {
  T: number;
  a: number;
  word: string;
  color?: string;
  size?: number;
  accent?: string;
  /** Seconds between letters landing. */
  stagger?: number;
}) {
  return (
    <div style={{ display: "flex", fontSize: size, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1 }}>
      {word.split("").map((ch, i) => {
        const p = M.enter(T, a + 0.05 + i * stagger, 0.5);
        const dx = (rnd(i, 1) - 0.5) * 1700;
        const dy = (rnd(i, 2) - 0.5) * 820;
        const s0 = 0.3 + rnd(i, 3) * 2.4;
        const b0 = 4 + rnd(i, 4) * 20;
        const f = 1 - p;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              color: ch === "-" ? accent || C.peri : color,
              transform: `translate(${dx * f}px, ${dy * f}px) scale(${lerp(s0, 1, p)})`,
              filter: blurF(b0 * f),
              opacity: lerp(0.25, 1, p),
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
}

/** Tightens from letter-spaced blur ("reconcile", Audit). */
export function Tighten({ T, a, x, word, size = 236 }: { T: number; a: number; x: number; word: string; size?: number }) {
  const p = M.enter(T, a, 0.6);
  const ls = lerp(0.9, -0.035, p);
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: 600,
        letterSpacing: `${ls}em`,
        paddingLeft: `${Math.max(0, ls)}em`,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
        ...GT,
        filter: blurF((1 - p) * 26 + x * 12),
        opacity: Math.min(1, p * 2) * (1 - x),
        transform: `scale(${1 + x * 0.12})`,
      }}
    >
      {word}
    </div>
  );
}

/** Vertical echo stack rolling upwards ("repeat", Payroll). */
export function Stack({ T, a, x, word, color = "#fff" }: { T: number; a: number; x: number; word: string; color?: string }) {
  const e = M.enter(T, a, 0.45);
  const step = 200;
  const scroll = (T - a) * 300 + (1 - e) * -260;
  const rows: React.ReactNode[] = [];
  for (let k = -5; k <= 7; k++) {
    const y = 540 + k * step - scroll;
    const d = Math.abs(y - 540);
    rows.push(
      <div
        key={k}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: y - 120,
          textAlign: "center",
          fontSize: 220,
          fontWeight: 600,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          color,
          opacity: Math.pow(Math.max(0, 1 - d / 600), 1.5) * e * (1 - x),
          filter: blurF(d / 42 + x * 10),
        }}
      >
        {word}
      </div>,
    );
  }
  return <>{rows}</>;
}

/** The A4 mark drawing on: `l` draws the slash, `r` wipes the 4 on from the top. */
export function A4MarkDraw({ size = 100, l = 1, r = 1, color = C.ink }: { size?: number; l?: number; r?: number; color?: string }) {
  const id = "am" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const part = (d: string, p: number, key: string, mp: string, sw: number, evenodd: boolean) => {
    if (p <= 0.002) return null;
    if (p >= 0.998) return <path key={key} d={d} fill={color} fillRule={evenodd ? "evenodd" : undefined} />;
    return (
      <g key={key}>
        <mask id={id + key} maskUnits="userSpaceOnUse" x="-120" y="-120" width="760" height="760">
          <path d={mp} fill="none" stroke="#fff" strokeWidth={sw} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
        </mask>
        <path d={d} fill={color} fillRule={evenodd ? "evenodd" : undefined} mask={`url(#${id + key})`} />
      </g>
    );
  };
  return (
    <svg width={(size * 515.6) / 516.5} height={size} viewBox="0 0 515.6 516.5" style={{ display: "block", overflow: "visible", flexShrink: 0 }}>
      {part(A4_S, l, "s", "M 340 -40 L 20 560", 280, false)}
      {part(A4_F, r, "f", "M 330 -20 L 330 540", 640, true)}
    </svg>
  );
}

/** The mark, a hairline divider and "A4 Services" in Outfit Medium. `spread` is the tracking collapse (em). */
export function Lockup({
  size = 160,
  color = C.ink,
  l = 1,
  r = 1,
  bar = 1,
  spread = 0,
  wordStyle,
}: {
  size?: number;
  color?: string;
  l?: number;
  r?: number;
  bar?: number;
  spread?: number;
  wordStyle?: React.CSSProperties;
}) {
  const h = size;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <A4MarkDraw size={h} l={l} r={r} color={color} />
      <div
        style={{
          width: Math.max(2, h * 0.022),
          height: h * 0.8,
          margin: `0 ${h * 0.3}px`,
          background: color,
          opacity: 0.35 * Math.min(1, bar * 2),
          transform: `scaleY(${bar})`,
          flexShrink: 0,
        }}
      />
      <div style={{ fontFamily: FONT, fontSize: h * 0.46, fontWeight: 500, letterSpacing: `${-0.02 + spread}em`, lineHeight: 1, color, whiteSpace: "nowrap", ...wordStyle }}>
        A4 Services
      </div>
    </div>
  );
}

/** "Powered by Vacei", from the official lockup artwork. */
export function PoweredBy({ h = 46, dark = false }: { h?: number; dark?: boolean }) {
  return (
    <img
      src={dark ? "/brand/a4/powered-by-vacei-ink.png" : "/brand/a4/powered-by-vacei-white.png"}
      alt=""
      draggable={false}
      style={{ display: "block", height: h, width: (h * 630) / 96 }}
    />
  );
}

/* ── The client portal (A4's portal runs on Vacei) ─────────────────────────── */

export const FW = 1600;
export const FH = 980;
export const BAR = 40;
export const SAMPLE = "Sample data · fictional companies";

/** A browser window around a portal capture; `src2` cross-fades in over `src` by `mix`. */
export function Screen({ src, h = FH - BAR, src2, mix = 0, children }: { src: string; h?: number; src2?: string; mix?: number; children?: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: FW,
        height: BAR + h,
        borderRadius: 18,
        overflow: "hidden",
        background: "#E5E8EA",
        border: `1px solid ${C.line}`,
        boxShadow: "0 50px 120px rgba(9,9,11,.28)",
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: BAR,
          background: "#FAFAFA",
          borderBottom: `1px solid ${C.line}`,
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          gap: 8,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 11, height: 11, borderRadius: 6, background: "#E4E4E7" }} />
        ))}
        <span
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 26,
            padding: "0 14px",
            borderRadius: 13,
            background: "#F4F4F5",
            fontSize: 14,
            fontWeight: 600,
            color: "#27272A",
            whiteSpace: "nowrap",
          }}
        >
          <A4MarkDraw size={14} />
          Your client portal<span style={{ fontWeight: 500, color: C.zinc4 }}>Powered by Vacei</span>
        </span>
      </div>
      <img src={src} alt="" draggable={false} style={{ position: "absolute", left: 0, top: BAR, width: FW, height: h, display: "block", opacity: 1 - mix }} />
      {src2 ? (
        <img
          src={src2}
          alt=""
          draggable={false}
          style={{ position: "absolute", left: 0, top: BAR, width: FW, height: FH - BAR, display: "block", opacity: mix, transform: `translateY(${(1 - mix) * 28}px)` }}
        />
      ) : null}
      {children}
      <div style={{ position: "absolute", left: 16, bottom: 14, padding: "5px 12px", borderRadius: 999, background: "rgba(9,9,11,.78)", color: "#fff", fontSize: 13, fontWeight: 500 }}>{SAMPLE}</div>
    </div>
  );
}

/** Camera onto the screen: frame point (cx, cy) shows screen point (fx, fy) at scale s, tilted by rx/rz. */
export function camStyle(fx0: number, fy0: number, s: number, rx: number, rz: number, cx = 960, cy = 540): React.CSSProperties {
  return {
    position: "absolute",
    left: 0,
    top: 0,
    width: FW,
    height: FH,
    transformOrigin: "0 0",
    transform: `translate(${cx}px,${cy}px) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${s}) translate(${-fx0}px,${-fy0}px)`,
  };
}

/** Frame-level sample label for zoomed shots, where the window's own label is off frame. */
export function SampleTag({ on, k = 1 }: { on: number; /** Text boost on phones. */ k?: number }) {
  if (on <= 0.01) return null;
  return (
    <div
      style={{
        position: "absolute",
        right: 40,
        top: 36,
        padding: "8px 16px",
        borderRadius: 999,
        background: "rgba(9,9,11,.78)",
        color: "#fff",
        fontSize: 20 * k,
        fontWeight: 500,
        fontFamily: FONT,
        opacity: on,
        zIndex: 30,
      }}
    >
      {SAMPLE}
    </div>
  );
}

export { CENTER };
