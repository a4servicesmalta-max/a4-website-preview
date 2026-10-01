/**
 * Motion core of the A4 Services teaser film (handoff/A4 Services Teaser/a4-teaser.jsx),
 * ported 1:1 so the website's scroll films move exactly like the film: the same
 * easings, the same enter/exit/glide timings and the same `fx` move.
 *
 * Every scene is a pure function of the playhead T (seconds). On the site T comes from
 * scroll (see Film.tsx), so scrolling plays the film forwards and backwards.
 */
import type { CSSProperties } from "react";

export const INDIGO = "#4F55F1";
export const C = {
  ink: "#09090B",
  zinc9: "#18181B",
  zinc8: "#27272A",
  zinc6: "#52525B",
  zinc4: "#A1A1AA",
  peri: "#8B8FF7",
  line: "#E4E4E7",
  mute: "#52525B",
};
export const FONT = "var(--font-outfit), Outfit, Inter, system-ui, sans-serif";
export const GRAD = "linear-gradient(90deg,#4F55F1 0%,#6468F3 55%,#8B8FF7 100%)";
export const SLAB_GRAD = "linear-gradient(120deg,#4F55F1 0%,#27272A 100%)";
export const GT: CSSProperties = {
  backgroundImage: GRAD,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
};
/** The slash of the A4 mark (30.4° off vertical). */
export const SKEW = -30;
export const CENTER: CSSProperties = { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" };
/** The film frame. Scenes are laid out in these units and scaled to the screen. */
export const FRAME_W = 1920;
export const FRAME_H = 1080;

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeInExpo = (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1)));
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);
export const EO = easeOutExpo;
export const EI = easeInExpo;
export const IO = easeInOutCubic;

/** Progress of T through [t0, t0 + d]. */
export const pr = (T: number, t0: number, d: number) => clamp((T - t0) / d, 0, 1);
export const M = {
  enter: (T: number, t0: number, d = 0.5) => EO(pr(T, t0, d)),
  exit: (T: number, t0: number, d = 0.3) => EI(pr(T, t0, d)),
  glide: (T: number, t0: number, d = 0.6) => IO(pr(T, t0, d)),
};
export const blurF = (b: number) => (b > 0.05 ? `blur(${b.toFixed(2)}px)` : "none");
/** Deterministic pseudo-random, the film's seeds. */
export const rnd = (a: number, b = 0) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Piecewise keyframes, eased per segment (the film runtime's interpolate). */
export function interpolate(input: number[], output: number[], ease: (t: number) => number = (t) => t) {
  return (t: number) => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        return output[i] + (output[i + 1] - output[i]) * ease(local);
      }
    }
    return output[output.length - 1];
  };
}
export const chan = (ts: number[], vs: number[], T: number) => interpolate(ts, vs, IO)(T);

export type FxOpts = {
  din?: number;
  dout?: number;
  dx?: number;
  dy?: number;
  ex?: number;
  ey?: number;
  ds?: number;
  es?: number;
  blur?: number;
  eblur?: number;
};

/** The film's entrance/exit move: rise in from blur, leave upwards into blur. */
export function fx(T: number, tin: number, tout: number | null, o: FxOpts = {}): CSSProperties {
  const a = M.enter(T, tin, o.din || 0.5);
  const b = tout == null ? 0 : M.exit(T, tout, o.dout || 0.3);
  const dx = (o.dx || 0) * (1 - a) + (o.ex || 0) * b;
  const dy = (o.dy == null ? 50 : o.dy) * (1 - a) + (o.ey == null ? -50 : o.ey) * b;
  const sc = 1 + (o.ds || 0) * (1 - a) + (o.es || 0) * b;
  const bl = (o.blur == null ? 12 : o.blur) * (1 - a) + (o.eblur == null ? 10 : o.eblur) * b;
  return { opacity: Math.min(1, a * 1.6) * (1 - b), transform: `translate(${dx}px,${dy}px) scale(${sc})`, filter: blurF(bl) };
}

export type SceneDef = { name: string; dur: number };

/** Cue start times from scene durations, plus the total length. */
export function cueSheet(scenes: SceneDef[]) {
  const Q: Record<string, number> = {};
  let t = 0;
  for (const s of scenes) {
    Q[s.name] = t;
    t += s.dur;
  }
  return { Q, total: t };
}

/** A segment of text, optionally on the brand gradient. */
export type Seg = { t: string; g?: boolean; c?: string };
