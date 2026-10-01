"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { FONT, FRAME_H, FRAME_W, clamp, cueSheet, pr, type SceneDef } from "./core";

/**
 * A scroll film: a section that pins a full-screen stage while the film's playhead
 * follows the scroll, so scrolling plays the scenes forwards and backwards like
 * scrubbing a video. The playhead eases after the scroll position, which keeps fast
 * wheels and flicks reading as motion rather than jumps.
 *
 * Scenes are laid out in the film's 1920×1080 frame. The frame always covers the
 * screen: on a portrait phone it is 1920 wide and taller than 1080, on an ultra-wide
 * screen wider than 1920, and each scene's 1920×1080 box sits in the middle, so the
 * film's coordinates work everywhere. `tb` is the boost small captions get so they
 * stay readable on phones.
 *
 * Reduced motion: the playhead jumps between held frames (one per cue), no motion.
 * The stage is decorative (aria-hidden); the transcript carries the words.
 */

export type FilmState = {
  T: number;
  Q: Record<string, number>;
  total: number;
  still: boolean;
  /** Screen pixels per frame unit. */
  u: number;
  /** Frame size in frame units (≥ 1920×1080). */
  FW: number;
  FH: number;
  /** Boost for small text so captions stay ≥ ~15px on screen. */
  tb: number;
  /** Portrait boost for statement lines, which then wrap (1 on landscape screens). */
  pt: number;
  portrait: boolean;
};

const FilmContext = createContext<FilmState>({
  T: 0,
  Q: {},
  total: 0,
  still: false,
  u: 1,
  FW: FRAME_W,
  FH: FRAME_H,
  tb: 1,
  pt: 1,
  portrait: false,
});

export const useFilm = () => useContext(FilmContext);

/** Next cue after `name` in the sheet (Infinity for the last one). */
export function useCue(name: string): [number, number] {
  const { Q } = useFilm();
  const a = Q[name] ?? Infinity;
  let b = Infinity;
  for (const k in Q) if (Q[k] > a && Q[k] < b) b = Q[k];
  return [a, b];
}

type BgKind = "light" | "zinc" | "dark" | "blue" | "grad";

const GRID =
  "linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px) 0 0 / 64px 64px, linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px) 0 0 / 64px 64px";

/** The film's backgrounds: a4.com.mt's black with its faint grid, and white / zinc with drifting glows. */
export function Bg({ kind, T }: { kind: BgKind; T: number }) {
  const s = Math.sin;
  const c = Math.cos;
  let bg: string;
  if (kind === "dark") bg = `radial-gradient(1100px 760px at ${58 + 6 * s(T * 0.6)}% ${36 + 5 * c(T * 0.5)}%, rgba(79,85,241,.26), rgba(79,85,241,0) 70%), ${GRID}, #09090B`;
  else if (kind === "blue") bg = "#4F55F1";
  else if (kind === "grad") bg = "linear-gradient(112deg,#3F45E0 0%,#4F55F1 50%,#7479F5 100%)";
  else {
    const base = kind === "zinc" ? "#F4F4F5" : "#FFFFFF";
    const pa = kind === "zinc" ? 0.14 : 0.08;
    bg = `radial-gradient(1000px 800px at ${24 + 8 * s(T * 0.45)}% ${30 + 6 * c(T * 0.4)}%, rgba(79,85,241,${pa}), rgba(79,85,241,0) 70%), radial-gradient(900px 700px at ${80 - 6 * s(T * 0.35)}% ${74 + 5 * s(T * 0.5)}%, rgba(161,161,170,.14), rgba(161,161,170,0) 70%), ${base}`;
  }
  return <div style={{ position: "absolute", inset: 0, background: bg }} />;
}

/** Renders while the playhead is inside [from, to). */
export function Shot({ from, to, children }: { from: number; to: number; children: React.ReactNode }) {
  const { T } = useFilm();
  return T >= from && T < to ? <>{children}</> : null;
}

/**
 * One scene: its background fills the frame; its content sits in the 1920×1080 box in
 * the middle, pushing in slowly over the scene like the film's camera.
 */
export function Scene({
  from,
  to,
  bg = "light",
  push = 0.04,
  origin = "50% 50%",
  wrap,
  children,
}: {
  from: number;
  to: number;
  bg?: BgKind | null;
  push?: number;
  origin?: string;
  wrap?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const { T, FW, FH, still } = useFilm();
  if (!(T >= from && T < to)) return null;
  const p = Number.isFinite(to) ? pr(T, from, to - from) : 0;
  return (
    <div style={{ position: "absolute", inset: 0, ...wrap }}>
      {bg ? <Bg kind={bg} T={still ? from : T} /> : null}
      <div
        style={{
          position: "absolute",
          left: (FW - FRAME_W) / 2,
          top: (FH - FRAME_H) / 2,
          width: FRAME_W,
          height: FRAME_H,
          transform: still ? undefined : `scale(${1 + push * p})`,
          transformOrigin: origin,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function prefersReduced() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function Film({
  scenes,
  per = 0.5,
  tail = 0.8,
  lead = 0,
  base = "#FFFFFF",
  label,
  transcript,
  children,
  id,
}: {
  scenes: SceneDef[];
  /** Screen heights of scroll per film second. */
  per?: number;
  /** Seconds of scroll that hold the last frame before the section releases. */
  tail?: number;
  /** Film time the chapter opens on (skips an empty first beat). */
  lead?: number;
  base?: string;
  label: string;
  transcript: React.ReactNode;
  children: React.ReactNode;
  id?: string;
}) {
  const { Q, total } = useMemo(() => cueSheet(scenes), [scenes]);
  const secRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [T, setT] = useState(0);
  const [dims, setDims] = useState({ W: FRAME_W, H: FRAME_H });
  const [still, setStill] = useState(false);

  // Frame size follows the stage.
  useEffect(() => {
    const st = stageRef.current;
    if (!st) return;
    const measure = () => setDims({ W: st.clientWidth || FRAME_W, H: st.clientHeight || FRAME_H });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(st);
    return () => ro.disconnect();
  }, []);

  // Playhead follows the scroll.
  useEffect(() => {
    const sec = secRef.current;
    if (!sec) return;
    const reduced = prefersReduced();
    setStill(reduced);
    const starts = scenes.map((s) => Q[s.name]);
    const target = () => {
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const span = r.height - vh;
      const p = span > 0 ? clamp(-r.top / span, 0, 1) : 0;
      return Math.min(total, lead + p * (total - lead + tail));
    };
    // Reduced motion: hold each cue at a settled frame.
    const hold = (tg: number) => {
      let i = 0;
      while (i + 1 < starts.length && starts[i + 1] <= tg) i++;
      const d = scenes[i]?.dur ?? 0;
      return Math.min(total, starts[i] + Math.min(d * 0.8, Math.max(0, d - 0.05)));
    };
    let cur = target();
    if (reduced) cur = hold(cur);
    setT(cur);
    let raf = 0;
    let last = 0;
    let running = false;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const tg = target();
      let next: number;
      if (reduced) next = hold(tg);
      else {
        next = cur + (tg - cur) * (1 - Math.exp(-dt * 9));
        if (Math.abs(tg - next) < 0.0015) next = tg;
      }
      if (next !== cur) {
        cur = next;
        setT(next);
      }
      if (next !== (reduced ? hold(tg) : tg)) raf = requestAnimationFrame(tick);
      else running = false;
    };
    const kick = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    kick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, [Q, scenes, total, tail, lead]);

  const { W, H } = dims;
  const u = Math.min(W / FRAME_W, H / FRAME_H);
  const FW = W / u;
  const FH = H / u;
  const state: FilmState = {
    T,
    Q,
    total,
    still,
    u,
    FW,
    FH,
    tb: clamp(15 / (46 * u), 1, 2.6),
    pt: H > W ? clamp((H / W) * 0.72, 1, 1.7) : 1,
    portrait: H > W,
  };

  return (
    <section ref={secRef} id={id} aria-label={label} style={{ position: "relative", height: `calc(${((total - lead + tail) * per * 100).toFixed(2)}svh + 100svh)`, background: base }}>
      <div className="sr-only">{transcript}</div>
      <div ref={stageRef} aria-hidden="true" style={{ position: "sticky", top: 0, height: "100svh", overflow: "hidden", background: base, contain: "layout paint" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: FW,
            height: FH,
            transform: `scale(${u})`,
            transformOrigin: "0 0",
            fontFamily: FONT,
            WebkitFontSmoothing: "antialiased",
            color: "#09090B",
          }}
        >
          <FilmContext.Provider value={state}>{children}</FilmContext.Provider>
        </div>
      </div>
    </section>
  );
}
