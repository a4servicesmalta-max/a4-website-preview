"use client";

import React from "react";
import { Bg, Scene, useFilm } from "./Film";
import { C, CENTER, GT, INDIGO, IO, M, SKEW, blurF, chan, clamp, fx, lerp, pr, rnd, type Seg } from "./core";
import {
  A4MarkDraw,
  BAR,
  Cascade,
  Cursor,
  FH,
  FW,
  Icon,
  Lockup,
  PoweredBy,
  Rise,
  SampleTag,
  Scatter,
  SAMPLE,
  Screen,
  Slab,
  Stack,
  Tighten,
  Typed,
  camStyle,
} from "./parts";

/**
 * The scenes of the A4 Services teaser film, one component each, keyed to cue names.
 * A chapter (see chapters.tsx) lists the cues it plays; each scene reads its own start
 * and the next cue from the chapter's sheet. Copy is the film's, which was checked
 * against a4.com.mt (SCRIPT.md in the film's handoff folder).
 */

export const COPY = {
  runningOn: "You've been running on",
  spreadsheets: "spreadsheets",
  emailThreads: [{ t: "and endless " }, { t: "email threads", g: true }] as Seg[],
  sendReminder: "Send reminder",
  reminderBadge: "3rd",
  chase: "chase",
  rekey: "re-key",
  reconcile: "reconcile",
  repeat: "repeat",
  andNow: "and now",
  now: "now",
  timeFor: "it's time for",
  newWay: [{ t: "a" }, { t: "new", chip: true }, { t: "way" }, { t: "to" }, { t: "work" }] as { t: string; chip?: boolean }[],
  meet: "Meet",
  tagline: "An AI-native accounting & audit firm.",
  home: { src: "/brand/film/portal-companies.webp", focus: [800, 430], click: [546, 388] },
  headline: [[{ t: "Every service." }], [{ t: "One " }, { t: "portal.", g: true }]] as Seg[][],
  services: [
    { w: "Accounting", line: "Books that balance, every month.", fx: "scatter", bg: "light" },
    { w: "Audit", line: "Statutory audits under GAPSME and IFRS.", fx: "tighten", bg: "dark" },
    { w: "Tax & VAT", line: "Computed correctly. Filed on time.", fx: "cascade", bg: "light", xoff: 60 },
    { w: "Payroll", line: "Payslips, FS5s and SSC, every period.", fx: "stack", bg: "dark" },
    { w: "Corporate", line: "Incorporation and registered office, with licensed CSP partners.", fx: "zoom", bg: "light" },
    { w: "Advisory", line: "Fractional CFO, budgets and forecasts.", fx: "type", bg: "dark" },
  ] as { w: string; line: string; fx: string; bg: "light" | "dark"; xoff?: number }[],
  aiNative: ["AI-native", "audit."],
  aiNativeSub: "We rebuilt the firm around it.",
  machines: [
    [{ t: "The machines do the " }, { t: "volume.", g: true }],
    [{ t: "Our people do the " }, { t: "judgement.", g: true }],
  ] as Seg[][],
  portalHead: [[{ t: "Your own " }, { t: "portal.", g: true }], [{ t: "For every engagement." }]] as Seg[][],
  explained: [{ t: "every entry " }, { t: "explained", g: true }] as Seg[],
  evidencedA: "every figure",
  evidencedB: "evidenced",
  filedA: "every return",
  filedB: " filed",
  stamp: "ON TIME",
  close: [[{ t: "A licensed" }], [{ t: "accounting & audit firm" }], [{ t: "in " }, { t: "Malta.", g: true }]] as Seg[][],
  endTagline: "Accounting that works differently.",
  url: "a4.com.mt",
  cta: "Book a free consultation",
};

type PortalBeat = {
  n: string;
  title: string;
  sub: string;
  caption: string;
  src: string;
  h?: number;
  src2?: string;
  bg: "light" | "zinc";
  holdOut?: boolean;
  noEnter?: boolean;
  request?: boolean;
  upload?: boolean;
  uploadAt?: number;
  titleOut?: number;
  pillIn: number;
  keys: number[][];
};

/** keys: [t, cx, cy, fx, fy, scale, rotateY] from the beat start (the film's camera). */
export const PORTALS: PortalBeat[] = [
  {
    n: "01",
    title: "Every engagement",
    sub: "at a glance",
    caption: "What's done, what's in progress and what's coming up.",
    src: "/brand/film/portal-dashboard.webp",
    h: 1400,
    bg: "zinc",
    holdOut: true,
    titleOut: 1.15,
    pillIn: 1.75,
    keys: [
      [0, 1345, 560, 800, 720, 0.52, -34],
      [0.95, 1345, 560, 800, 720, 0.64, -7],
      [1.25, 1345, 560, 800, 715, 0.66, -5],
      [2.05, 960, 560, 800, 700, 1.55, 0],
      [3.0, 960, 560, 800, 705, 1.57, 0],
    ],
  },
  {
    n: "02",
    title: "Corporate services",
    sub: "with our CSP partners",
    caption: "The full package, requested and tracked in your portal.",
    src: "/brand/film/portal-dashboard.webp",
    h: 1400,
    src2: "/brand/film/portal-request.webp",
    bg: "zinc",
    request: true,
    noEnter: true,
    pillIn: 0.15,
    keys: [
      [0, 960, 560, 800, 705, 1.57, 0],
      [0.8, 960, 560, 790, 925, 1.62, 0],
      [1.2, 960, 560, 790, 925, 1.62, 0],
      [1.65, 960, 560, 800, 580, 1.85, 0],
      [4.0, 960, 560, 800, 590, 1.88, 0],
    ],
  },
  {
    n: "03",
    title: "Upload once",
    sub: "in one place",
    caption: "Collected once, not across a year of email attachments.",
    src: "/brand/film/portal-audit-engagement.webp",
    bg: "light",
    upload: true,
    uploadAt: 2.0,
    titleOut: 1.05,
    pillIn: 1.6,
    keys: [
      [0, 1345, 560, 800, 490, 0.54, -34],
      [0.95, 1345, 560, 800, 490, 0.66, -7],
      [1.15, 1345, 560, 800, 490, 0.67, -6],
      [1.85, 960, 560, 800, 650, 1.7, 0],
      [3.5, 960, 560, 805, 655, 1.72, 0],
    ],
  },
  {
    n: "04",
    title: "Ask about",
    sub: "your audit",
    caption: "Ask what's still needed, and see it in one answer.",
    src: "/brand/film/portal-ask.webp",
    bg: "light",
    titleOut: 1.0,
    pillIn: 1.5,
    keys: [
      [0, 1345, 560, 800, 490, 0.54, -34],
      [0.95, 1345, 560, 800, 490, 0.66, -7],
      [1.1, 1345, 560, 800, 490, 0.67, -6],
      [1.8, 960, 540, 740, 450, 1.75, 0],
      [3.0, 960, 540, 745, 455, 1.78, 0],
    ],
  },
];

const REQUEST = {
  chips: [
    ["As soon as possible", 625.5, 141],
    ["Within a month", 762.5, 118],
    ["Just exploring", 885, 111.5],
  ] as [string, number, number][],
  chipY: 650,
  chipH: 38.5,
  pick: 1,
  send: [800, 717, 490, 46],
  click: [736, 946],
  label: "Send request",
  done: "Request sent",
};

/** Start of a cue and the start of the next one in this chapter. */
function useAB(name: string): [number, number, number] {
  const { Q, T } = useFilm();
  const a = Q[name] ?? Infinity;
  let b = Infinity;
  for (const k in Q) if (Q[k] > a && Q[k] < b) b = Q[k];
  return [a, b, T];
}
const cue = (Q: Record<string, number>, k: string) => Q[k] ?? Infinity;
/** Start of the cue that follows `k` in this chapter (Infinity when `k` is last or absent). */
const nextAfter = (Q: Record<string, number>, k: string) => {
  const a = Q[k];
  if (a == null) return Infinity;
  let b = Infinity;
  for (const n in Q) if (Q[n] > a && Q[n] < b) b = Q[n];
  return b;
};

/** Extra frame space around the 1920×1080 box (portrait phones, ultra-wide screens). */
function useExtra() {
  const { FW: W, FH: H } = useFilm();
  return { ex: (W - 1920) / 2, ey: (H - 1080) / 2, vs: Math.min(H / 1080, 2.2) };
}

/** Captions: boosted and wrapping on phones so they stay readable. */
function Caption({ size, color, style, children }: { size: number; color: string; style?: React.CSSProperties; children: React.ReactNode }) {
  const { tb } = useFilm();
  return (
    <div
      style={{
        position: "absolute",
        left: 110,
        right: 110,
        textAlign: "center",
        fontSize: size * tb,
        fontWeight: 500,
        letterSpacing: "-0.015em",
        lineHeight: 1.25,
        color,
        textWrap: "balance",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── ACT 1: the old way ───────────────────────────────────────────────────── */

export function SOpen() {
  const { T, Q, pt, portrait } = useFilm();
  const { ex, ey } = useExtra();
  const g = cue(Q, "Glow");
  const a = cue(Q, "Typewriter");
  const w = cue(Q, "Wipe");
  const wp = M.enter(T, w, 0.42);
  const k = 0.577 * ey;
  return (
    <Scene from={g} to={nextAfter(Q, "Wipe")}>
      <div
        style={{
          position: "absolute",
          left: lerp(-300, 560, IO(pr(T, g, 2.4))),
          top: 20 + 50 * Math.sin(T * 1.2),
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,85,241,.20) 0%, rgba(79,85,241,0) 65%)",
        }}
      />
      <div style={{ ...CENTER, padding: "0 110px", textAlign: "center", fontSize: 104 * pt, fontWeight: 500, letterSpacing: "-0.03em", opacity: T >= a ? 1 : 0 }}>
        <Typed segs={[{ t: COPY.runningOn }]} t0={a} t1={a + 0.42} T={T} size={104 * pt} wrap={portrait} />
      </div>
      <div
        style={{
          position: "absolute",
          top: -20 - ey,
          height: 1120 + 2 * ey,
          left: lerp(-3900, -600, wp) - k - ex,
          width: 3600 + 2 * k + 2 * ex,
          background: INDIGO,
          transform: `skewX(${SKEW}deg)`,
          filter: blurF((1 - wp) * 8),
          opacity: T >= w ? 1 : 0,
        }}
      />
    </Scene>
  );
}

export function SSheets() {
  const [a, b, T] = useAB("Spreadsheets");
  const p = M.enter(T, a, 0.45);
  return (
    <Scene from={a} to={b} bg="grad" push={0.06}>
      <div style={CENTER}>
        <div
          style={{
            fontSize: 292,
            fontWeight: 600,
            letterSpacing: "-0.045em",
            color: "#fff",
            transform: `scale(${lerp(1.35, 1, p)})`,
            filter: blurF((1 - p) * 18),
            opacity: Math.min(1, p * 3),
            whiteSpace: "nowrap",
          }}
        >
          {COPY.spreadsheets}
        </div>
      </div>
    </Scene>
  );
}

export function SLine() {
  const [a, b, T] = useAB("Line");
  const { pt, portrait } = useFilm();
  const p = M.enter(T, a, 0.5);
  const x = M.exit(T, b - 0.3, 0.3);
  return (
    <Scene from={a} to={b}>
      <div style={CENTER}>
        <div
          style={{
            fontSize: 92 * pt,
            fontWeight: 500,
            letterSpacing: "-0.03em",
            color: C.ink,
            whiteSpace: portrait ? "normal" : "nowrap",
            maxWidth: 1700,
            textAlign: "center",
            transform: `translateY(${-70 * x}px)`,
            opacity: 1 - x,
            filter: blurF(x * 10),
          }}
        >
          {COPY.runningOn}{" "}
          <span style={{ display: "inline-block", ...GT, transform: `scale(${lerp(1.5, 1, p)})`, transformOrigin: "0% 70%", filter: blurF((1 - p) * 14) }}>{COPY.spreadsheets}</span>
        </div>
      </div>
    </Scene>
  );
}

const OLD_TILES = [
  { ic: "sheet", x: 360, y: 270, s: 230, z: 1.0, d: 0 },
  { ic: "pdf", x: 1560, y: 250, s: 190, z: 0.8, d: 0.08 },
  { ic: "mail", x: 1280, y: 830, s: 250, z: 1.15, d: 0.16 },
  { ic: "receipt", x: 600, y: 840, s: 170, z: 0.65, d: 0.24 },
  { ic: "sticky", x: 1740, y: 620, s: 150, z: 0.55, d: 0.3 },
];

export function SOldWay() {
  const [a, b, T] = useAB("OldWay");
  const { vs } = useExtra();
  const { pt, portrait } = useFilm();
  return (
    <Scene from={a} to={b} bg="dark">
      {OLD_TILES.map((t, i) => {
        const e = M.enter(T, a + t.d, 0.6);
        const x = M.exit(T, b - 0.3, 0.3);
        const drift = (T - a) * 70 * t.z;
        const px = t.x + (1 - e) * 500 * t.z - drift;
        const py = 540 + (t.y - 540) * vs + Math.sin(T * 2 + i) * 10 - (T - a) * 16 * t.z;
        return (
          <Slab
            key={i}
            w={t.s}
            h={t.s}
            style={{
              left: px - t.s / 2,
              top: py - t.s / 2,
              opacity: Math.min(1, e * 1.5) * (1 - x),
              transform: `scale(${t.z * (1 + x * 0.3)})`,
              filter: blurF((1 - e) * 14 + (1 - t.z) * 5 + x * 8),
            }}
          >
            <Icon name={t.ic} size={t.s * 0.36} color="#fff" sw={1.6} />
          </Slab>
        );
      })}
      <div style={{ ...CENTER, padding: "0 110px", textAlign: "center", fontSize: 92 * pt, fontWeight: 500, letterSpacing: "-0.03em", ...fx(T, a + 0.2, b - 0.3, { dy: 0, blur: 0 }) }}>
        <Typed segs={COPY.emailThreads} t0={a + 0.3} t1={a + 1.15} T={T} size={92 * pt} color="#fff" wrap={portrait} />
      </div>
    </Scene>
  );
}

export function SReminder() {
  const [a, b, T] = useAB("Reminder");
  const click = a + 0.9;
  const cp = M.glide(T, a + 0.1, 0.75);
  const cx = lerp(1560, 1040, cp) + Math.sin(cp * Math.PI) * 60;
  const cy = lerp(960, 572, cp);
  const down = T > click && T < click + 0.12 ? 1 : 0;
  const bs = 1 - down * 0.05 + (T > click + 0.12 ? 0.05 * Math.sin(pr(T, click + 0.12, 0.3) * Math.PI) : 0);
  return (
    <Scene from={a} to={b} bg="dark" push={0.07} origin="54% 52%">
      <div style={CENTER}>
        <div style={{ position: "relative", ...fx(T, a, null, { dy: 40, ds: 0.1 }) }}>
          {[0, 1].map((k) => {
            const rp = pr(T, click + 0.1 + k * 0.18, 0.55);
            return (
              <div
                key={k}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 999,
                  border: `3px solid ${C.peri}`,
                  transform: `scale(${1 + rp * 0.5}, ${1 + rp * 1.2})`,
                  opacity: rp > 0 && rp < 1 ? 1 - rp : 0,
                }}
              />
            );
          })}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              height: 116,
              padding: "0 64px",
              borderRadius: 999,
              background: INDIGO,
              color: "#fff",
              fontSize: 46,
              fontWeight: 500,
              transform: `scale(${bs})`,
              boxShadow: "0 24px 60px rgba(79,85,241,.45)",
              whiteSpace: "nowrap",
            }}
          >
            <Icon name="mail" size={44} color="#fff" sw={1.8} />
            {COPY.sendReminder}
          </div>
          <div
            style={{
              position: "absolute",
              right: -22,
              top: -24,
              padding: "8px 16px",
              borderRadius: 999,
              background: "#fff",
              color: C.ink,
              fontSize: 28,
              fontWeight: 600,
              ...fx(T, a + 0.3, null, { dy: 0, ds: -0.6, blur: 4 }),
            }}
          >
            {COPY.reminderBadge}
          </div>
        </div>
      </div>
      <Cursor x={cx} y={cy} down={down} scale={2.2} opacity={T > a + 0.1 ? 1 : 0} />
    </Scene>
  );
}

export function SFlash() {
  const [a, b, T] = useAB("Flash");
  const { ex, ey } = useExtra();
  const sl = M.exit(T, a, 0.18);
  const w = T < a + 0.12 ? pr(T, a, 0.12) : 1 - M.enter(T, a + 0.12, 0.38);
  return (
    <Scene from={a} to={b} bg={null} push={0}>
      <div style={{ position: "absolute", left: -ex, top: -ey, right: -ex, bottom: -ey, transform: `translateX(${-2100 * sl}px)`, filter: blurF(sl * 40) }}>
        <Bg kind="dark" T={T} />
      </div>
      <div style={{ position: "absolute", left: -ex, top: -ey, right: -ex, bottom: -ey, background: "#fff", opacity: w }} />
    </Scene>
  );
}

export function SChase() {
  const [a, b, T] = useAB("Chase");
  const x = M.exit(T, b - 0.28, 0.28);
  return (
    <Scene from={a} to={b}>
      <Cascade T={T} a={a} x={x} word={COPY.chase} />
    </Scene>
  );
}

export function SRekey() {
  const [a, b, T] = useAB("Rekey");
  const x = M.exit(T, b - 0.28, 0.28);
  return (
    <Scene from={a} to={b} bg="dark">
      <div style={{ ...CENTER, transform: `scale(${1 + x * 0.25})`, opacity: 1 - x, filter: blurF(x * 12) }}>
        <Scatter T={T} a={a} word={COPY.rekey} />
      </div>
    </Scene>
  );
}

export function SReconcile() {
  const [a, b, T] = useAB("Reconcile");
  const x = M.exit(T, b - 0.28, 0.28);
  return (
    <Scene from={a} to={b}>
      <div style={CENTER}>
        <Tighten T={T} a={a} x={x} word={COPY.reconcile} />
      </div>
    </Scene>
  );
}

export function SRepeat() {
  const [a, b, T] = useAB("Repeat");
  const x = M.exit(T, b - 0.28, 0.28);
  return (
    <Scene from={a} to={b} bg="dark">
      <Stack T={T} a={a} x={x} word={COPY.repeat} />
    </Scene>
  );
}

/* ── ACT 2: the turn ──────────────────────────────────────────────────────── */

export function SNow() {
  const { T, Q, pt } = useFilm();
  const n = cue(Q, "Now");
  const a = Q.AndNow ?? n;
  const b = nextAfter(Q, "Now");
  const zp = M.enter(T, n, 0.45);
  const x = M.exit(T, b - 0.25, 0.25);
  return (
    <Scene from={a} to={b} push={0.06}>
      <div style={{ ...CENTER, opacity: T < n ? 1 : 0 }}>
        <div style={{ fontSize: 64 * pt, fontWeight: 500, letterSpacing: "-0.02em", color: C.ink, ...fx(T, a, null, { dy: 24, blur: 8, din: 0.35 }) }}>{COPY.andNow}</div>
      </div>
      <div style={{ ...CENTER, opacity: T >= n ? 1 - x : 0 }}>
        <div
          style={{
            fontSize: 820,
            fontWeight: 600,
            letterSpacing: "-0.06em",
            lineHeight: 1,
            paddingBottom: 60,
            ...GT,
            transform: `scale(${lerp(0.09, 1, zp) * (1 + x * 0.2)})`,
            filter: blurF((1 - zp) * 10 + x * 14),
          }}
        >
          {COPY.now}
        </div>
      </div>
    </Scene>
  );
}

export function SNewWay() {
  const { T, Q, pt } = useFilm();
  const a = cue(Q, "TimeFor");
  const w = cue(Q, "NewWay");
  const b = nextAfter(Q, "NewWay");
  const x = M.exit(T, b - 0.3, 0.3);
  const sp = M.enter(T, a, 0.55);
  return (
    <Scene from={a} to={b}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250 - (pt - 1) * 200, display: "flex", justifyContent: "center", fontSize: 104 * pt, fontWeight: 500, letterSpacing: "-0.03em", color: C.ink }}>
        <div style={fx(T, a, b - 0.3)}>{COPY.timeFor}</div>
      </div>
      <Slab
        w={1700}
        h={360}
        opacity={0.85}
        style={{ left: 110, top: 470, transform: `translate(${(1 - sp) * 1300 - x * 1600}px, ${(1 - sp) * 700 - x * 300}px)`, filter: blurF((1 - sp) * 16 + x * 16) }}
      >
        <div style={{ display: "flex", gap: "0 0.26em", alignItems: "baseline", fontSize: 150, fontWeight: 600, letterSpacing: "-0.035em", color: "#fff" }}>
          {COPY.newWay.map((un, i) => {
            const st = fx(T, w + i * 0.07, b - 0.3, { dy: 70, ex: -200, ey: 0 });
            if (!un.chip)
              return (
                <span key={i} style={{ display: "inline-block", ...st }}>
                  {un.t}
                </span>
              );
            return (
              <span key={i} style={{ display: "inline-block", position: "relative", padding: "0 0.18em", ...st }}>
                <span style={{ position: "absolute", left: 0, right: 0, top: "0.12em", bottom: "-0.02em", background: C.ink, borderRadius: 24, transform: `skewX(${SKEW}deg)` }} />
                <span style={{ position: "relative", color: C.peri }}>{un.t}</span>
              </span>
            );
          })}
        </div>
      </Slab>
    </Scene>
  );
}

export function SMeet() {
  const [a, b, T] = useAB("Meet");
  const sm = M.exit(T, b - 0.22, 0.22);
  return (
    <Scene from={a} to={b} bg="zinc">
      <div style={{ ...CENTER, fontSize: 300, fontWeight: 600, letterSpacing: "-0.04em", color: C.ink }}>
        {[4, 3, 2, 1].map((k) => (
          <div key={k} style={{ position: "absolute", transform: `translateX(${sm * k * 150}px) scaleX(${1 + sm * 0.4})`, opacity: sm * (0.5 - k * 0.1), filter: blurF(8 + k * 4) }}>
            {COPY.meet}
            <span style={{ display: "inline-block", width: "0.56em" }} />
          </div>
        ))}
        <div style={{ transform: `translateX(${sm * 240}px) scaleX(${1 + sm * 0.6})`, filter: blurF(sm * 24), opacity: 1 - sm * 0.4 }}>
          <Typed segs={[{ t: COPY.meet }]} t0={a + 0.02} t1={a + 0.36} T={T} size={300} block />
        </div>
      </div>
    </Scene>
  );
}

export function SBlurThrough() {
  const { T, Q } = useFilm();
  const { ex, ey } = useExtra();
  const a = cue(Q, "BlurThrough");
  const b = nextAfter(Q, "BlurThrough");
  const p = pr(T, a, b - a);
  return (
    <Scene from={a} to={b} bg="zinc" push={0}>
      <div
        style={{
          position: "absolute",
          left: lerp(1900, -1500, IO(p)),
          top: -300 - ey,
          width: 1500,
          height: 1500 + 2 * ey,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,85,241,.9), rgba(79,85,241,0) 68%)",
          filter: "blur(40px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: lerp(2300, -1100, IO(p)),
          top: -ey,
          width: 1300,
          height: 1300 + 2 * ey,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(24,24,27,.85), rgba(24,24,27,0) 68%)",
          filter: "blur(40px)",
        }}
      />
      <div style={{ position: "absolute", left: -ex, top: -ey, right: -ex, bottom: -ey, background: "#fff", opacity: Math.max(0, (p - 0.55) / 0.45) }} />
    </Scene>
  );
}

export function SReveal() {
  const { T, Q, tb } = useFilm();
  const a = cue(Q, "Reveal");
  const pu = cue(Q, "PushIn");
  const out = M.exit(T, pu, 0.5);
  const l = M.glide(T, a, 0.38);
  const r = M.glide(T, a + 0.16, 0.4);
  const bar = M.enter(T, a + 0.38, 0.4);
  const wp = M.enter(T, a + 0.45, 0.55);
  return (
    <Scene from={a} to={Q.PushIn != null ? nextAfter(Q, "PushIn") : nextAfter(Q, "Reveal")} wrap={{ opacity: 1 - out }} push={0.04}>
      <div style={{ ...CENTER, flexDirection: "column", gap: 64, transform: `scale(${1 + out * 5})`, filter: blurF(out * 20), transformOrigin: "42% 46%" }}>
        <Lockup size={240} l={l} r={r} bar={bar} spread={lerp(0.45, 0, wp)} wordStyle={{ opacity: Math.min(1, wp * 2), filter: blurF((1 - wp) * 20) }} />
        <div style={{ fontSize: 46 * tb, fontWeight: 500, letterSpacing: "-0.015em", color: C.zinc6, textAlign: "center", maxWidth: 1700, ...fx(T, a + 0.75, null, { dy: 24, blur: 8 }) }}>{COPY.tagline}</div>
      </div>
    </Scene>
  );
}

/* ── ACT 3: the firm ──────────────────────────────────────────────────────── */

export function SHome() {
  const { T, Q } = useFilm();
  const a = cue(Q, "PushIn");
  const b = nextAfter(Q, "Home");
  const H = COPY.home;
  const [fX, fY] = H.focus;
  const [kx, ky] = H.click;
  const ts = [a, a + 0.5, a + 1.35, a + 1.6, a + 2.2, b];
  const fxv = chan(ts, [800, 800, 800, 800, fX, fX], T);
  const fyv = chan(ts, [490, 490, 490, 470, fY, fY], T);
  const s = chan(ts, [0.6, 0.85, 1.05, 1.15, 1.7, 1.74], T);
  const rx = chan([a, a + 0.5, a + 1.35], [34, 25, 0], T);
  const rz = chan([a, a + 0.5, a + 1.35], [-11, -8, 0], T);
  const op = M.enter(T, a, 0.4);
  const x = M.exit(T, b - 0.25, 0.25);
  const click = b - 0.55;
  const cp = M.glide(T, click - 0.75, 0.7);
  const cur = { x: lerp(kx + 420, kx + 8, cp), y: lerp(ky + 360, ky + 6, cp) - Math.sin(cp * Math.PI) * 40 };
  const down = T > click && T < click + 0.12 ? 1 : 0;
  const ring = pr(T, click + 0.06, 0.5);
  return (
    <Scene from={a} to={b} push={0}>
      <div style={{ position: "absolute", inset: 0, perspective: 2200, perspectiveOrigin: "960px 540px", opacity: op * (1 - x), filter: blurF((1 - op) * 12 + x * 10) }}>
        <div style={camStyle(fxv, fyv, s, rx, rz)}>
          <Screen src={H.src}>
            {ring > 0 && ring < 1 ? (
              <div
                style={{
                  position: "absolute",
                  left: kx - 30,
                  top: ky - 30,
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  border: `3px solid ${INDIGO}`,
                  transform: `scale(${1 + ring * 1.4})`,
                  opacity: 1 - ring,
                }}
              />
            ) : null}
            <Cursor x={cur.x} y={cur.y} down={down} scale={1.4} opacity={T > click - 0.8 ? 1 : 0} />
          </Screen>
        </div>
      </div>
      <SampleTag on={clamp((s - 1.1) / 0.3, 0, 1) * (1 - x)} />
    </Scene>
  );
}

function STwoLines({
  from,
  to,
  lines,
  bg = "light",
  size = 130,
  dark = false,
  after,
}: {
  from: number;
  to: number;
  lines: Seg[][];
  bg?: "light" | "dark";
  size?: number;
  dark?: boolean;
  /** A row under the two lines, in the same column, so it always follows the wrapped text. */
  after?: React.ReactNode;
}) {
  const { T, pt, portrait } = useFilm();
  const a = from;
  const b = to;
  const x = M.exit(T, b - 0.3, 0.3);
  const [l1, l2] = lines;
  const fs = size * pt;
  const col = dark ? "#fff" : C.ink;
  return (
    <Scene from={a} to={b} bg={bg}>
      <div
        style={{
          ...CENTER,
          flexDirection: "column",
          gap: 10,
          padding: "0 110px",
          textAlign: "center",
          fontSize: fs,
          fontWeight: 500,
          letterSpacing: "-0.035em",
          lineHeight: 1.1,
          opacity: 1 - x,
          filter: blurF(x * 10),
          transform: `translateY(${-x * 60}px)`,
        }}
      >
        <div>
          <Typed segs={l1} t0={a + 0.02} t1={a + 0.45} T={T} size={fs} color={col} hideCaretAfter={a + 0.6} wrap={portrait} />
        </div>
        <div style={{ fontWeight: 600, justifyContent: "center" }}>
          <Rise units={l2} T={T} t0={a + 0.6} o={{ dy: 60 }} gap="0" color={col} wrap={portrait} />
        </div>
        {after}
      </div>
    </Scene>
  );
}

export function SHeadline() {
  const [a, b] = useAB("Headline");
  return <STwoLines from={a} to={b} lines={COPY.headline} size={150} />;
}

/** One service, one beat; each borrows a different move from Act 1. */
export function SService({ i }: { i: number }) {
  const [a, b, T] = useAB("S" + (i + 1));
  const { tb } = useFilm();
  const S = COPY.services[i];
  // Short beats: the caption arrives early and the exit is quick, so each beat holds.
  const x = M.exit(T, b - 0.15, 0.15);
  const dark = S.bg === "dark";
  const col = dark ? "#fff" : C.ink;
  let word: React.ReactNode;
  if (S.fx === "scatter")
    word = (
      <div style={{ ...CENTER, top: -80 }}>
        <Scatter T={T} a={a} word={S.w} color={col} size={250} stagger={0.022} />
      </div>
    );
  else if (S.fx === "tighten")
    word = (
      <div style={{ ...CENTER, top: -80 }}>
        <Tighten T={T} a={a} x={0} word={S.w} size={280} />
      </div>
    );
  else if (S.fx === "cascade") word = <Cascade T={T} a={a} x={0} word={S.w} top={540} xoff={S.xoff == null ? 300 : S.xoff} />;
  else if (S.fx === "stack")
    word = (
      <div style={{ position: "absolute", inset: 0, top: -80 }}>
        <Stack T={T} a={a} x={0} word={S.w} color={col} />
      </div>
    );
  else if (S.fx === "zoom") {
    const zp = M.enter(T, a, 0.45);
    word = (
      <div style={{ ...CENTER, top: -80 }}>
        <div style={{ fontSize: 330, fontWeight: 600, letterSpacing: "-0.05em", lineHeight: 1, ...GT, transform: `scale(${lerp(0.12, 1, zp)})`, filter: blurF((1 - zp) * 10) }}>{S.w}</div>
      </div>
    );
  } else
    word = (
      <div style={{ ...CENTER, top: -80, fontSize: 250, fontWeight: 600, letterSpacing: "-0.04em" }}>
        <Typed segs={[{ t: S.w }]} t0={a + 0.02} t1={a + 0.4} T={T} size={250} color={col} block caretColor={C.peri} />
      </div>
    );
  return (
    <Scene from={a} to={b} bg={S.bg} push={0.05}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - x, filter: blurF(x * 12), transform: `scale(${1 + x * 0.08})` }}>
        <div
          style={{
            position: "absolute",
            left: 120,
            top: 100,
            display: "flex",
            alignItems: "baseline",
            gap: 14,
            fontSize: 34 * Math.min(tb, 1.8),
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: dark ? C.zinc4 : C.zinc6,
            ...fx(T, a, null, { dy: 20, blur: 6, din: 0.3 }),
          }}
        >
          <span style={{ color: dark ? C.peri : INDIGO }}>{String(i + 1).padStart(2, "0")}</span>
          <span>/ 06</span>
        </div>
        {word}
        <Caption size={46} color={dark ? "#E4E4E7" : "#3F3F46"} style={{ top: 760, ...fx(T, a + 0.12, null, { dy: 26, blur: 8, din: 0.3 }) }}>
          {S.line}
        </Caption>
      </div>
    </Scene>
  );
}

/** The highlight: AI-native audit, with the slab sweeping behind. */
export function SAINative() {
  const [a, b, T] = useAB("AINative");
  const { tb } = useFilm();
  const { ey } = useExtra();
  const x = M.exit(T, b - 0.3, 0.3);
  const sx = lerp(-900, 2600, M.glide(T, a, 0.9));
  return (
    <Scene from={a} to={b} bg="dark" push={0.05}>
      <Slab w={760} h={1500 + 2 * ey} opacity={0.5} style={{ left: sx - 380, top: -210 - ey, filter: "blur(2px)" }} />
      <div style={{ ...CENTER, flexDirection: "column", gap: 0, opacity: 1 - x, filter: blurF(x * 12), transform: `translateY(${-x * 60}px)` }}>
        <div style={{ fontSize: 250, fontWeight: 600, letterSpacing: "-0.05em", lineHeight: 0.98, ...GT, ...fx(T, a + 0.05, null, { dy: 120, blur: 20, ds: 0.15 }) }}>{COPY.aiNative[0]}</div>
        <div style={{ fontSize: 250, fontWeight: 600, letterSpacing: "-0.05em", lineHeight: 0.98, color: "#fff", ...fx(T, a + 0.2, null, { dy: 120, blur: 20, ds: 0.15 }) }}>{COPY.aiNative[1]}</div>
        <div style={{ marginTop: 44, fontSize: 46 * tb, fontWeight: 500, letterSpacing: "-0.015em", color: C.zinc4, ...fx(T, a + 0.7, null, { dy: 24, blur: 8 }) }}>{COPY.aiNativeSub}</div>
      </div>
    </Scene>
  );
}

export function SMachines() {
  const [a, b, T] = useAB("Machines");
  const { portrait } = useFilm();
  const x = M.exit(T, b - 0.3, 0.3);
  const [l1, l2] = COPY.machines;
  const size = portrait ? 150 : 118;
  return (
    <Scene from={a} to={b} bg="light">
      <div
        style={{
          ...CENTER,
          flexDirection: "column",
          alignItems: "flex-start",
          left: portrait ? 90 : 150,
          right: portrait ? 90 : "auto",
          gap: 22,
          fontSize: size,
          fontWeight: 500,
          letterSpacing: "-0.035em",
          lineHeight: 1.05,
          opacity: 1 - x,
          filter: blurF(x * 10),
          transform: `translateX(${-x * 120}px)`,
        }}
      >
        <Rise units={l1} T={T} t0={a + 0.02} stagger={0.1} o={{ dy: 70 }} gap="0" wrap={portrait} />
        <Rise units={l2} T={T} t0={a + 0.55} stagger={0.1} o={{ dy: 70 }} gap="0" wrap={portrait} />
      </div>
    </Scene>
  );
}

/* ── ACT 3: the portal ────────────────────────────────────────────────────── */

/** Your own portal. For every engagement. — then Powered by Vacei, with the second line. */
export function SPortalHead() {
  const [a, b, T] = useAB("PortalHead");
  const { tb } = useFilm();
  return (
    <STwoLines
      from={a}
      to={b}
      lines={COPY.portalHead}
      bg="dark"
      size={140}
      dark
      after={
        <div style={{ marginTop: 70, display: "flex", justifyContent: "center", ...fx(T, a + 0.62, null, { dy: 30, blur: 8, din: 0.3 }) }}>
          <PoweredBy h={52 * Math.min(tb, 1.8)} />
        </div>
      }
    />
  );
}

function UploadOverlay({ T, a, at = 0.95 }: { T: number; a: number; at?: number }) {
  const row = { x: 378, y: 661 };
  const due = { x: 1189, y: 661 };
  const t0 = a + at;
  const t1 = a + at + 0.7;
  const p = M.glide(T, t0, t1 - t0);
  const fxp = lerp(1480, row.x + 170, p);
  const fyp = lerp(990, row.y - 18, p) - Math.sin(p * Math.PI) * 80;
  const drop = M.enter(T, t1, 0.35);
  const on = T >= t0 - 0.1 && T < t1 + 0.1;
  return (
    <>
      {drop > 0.01 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: row.x - 16,
              top: row.y - 16,
              width: 32,
              height: 32,
              borderRadius: 16,
              background: INDIGO,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${lerp(0.4, 1, drop)})`,
              boxShadow: "0 0 0 6px #E4E8EA",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l4 4 10-10" />
            </svg>
          </div>
          <div
            style={{
              position: "absolute",
              left: due.x - 70,
              top: due.y - 17,
              width: 116,
              height: 34,
              borderRadius: 17,
              background: INDIGO,
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 10px #fff",
              opacity: drop,
            }}
          >
            Uploaded
          </div>
        </>
      ) : null}
      {on ? (
        <div
          style={{
            position: "absolute",
            left: fxp,
            top: fyp,
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 50,
            padding: "0 18px",
            borderRadius: 12,
            background: "#fff",
            border: `1px solid ${C.line}`,
            boxShadow: "0 18px 40px rgba(9,9,11,.22)",
            fontSize: 17,
            fontWeight: 600,
            color: C.ink,
            whiteSpace: "nowrap",
            transform: `rotate(${-4 * (1 - p)}deg) scale(${1 - 0.1 * p})`,
          }}
        >
          <Icon name="pdf" size={22} color={INDIGO} sw={1.9} />
          Aged debtors 31-12-2025.pdf
        </div>
      ) : null}
      <Cursor x={fxp + 26} y={fyp + 30} down={T > t0 - 0.1 && T < t1 ? 1 : 0} scale={1.4} opacity={T > t0 - 0.35 && T < t1 + 0.6 ? 1 : 0} />
    </>
  );
}

/** 02: Request on Corporate (CSP); the form opens; "Within a month"; Send request; Request sent. */
function RequestOverlay({ T, a }: { T: number; a: number }) {
  const R = REQUEST;
  const [kx, ky] = R.click;
  const cy = R.chipY;
  const ch = R.chipH;
  const c0x = R.chips[0][1];
  const cx = R.chips[R.pick][1];
  const [sx, sy, sw, sh] = R.send;
  const c1 = a + 1.05;
  const page = pr(T, a + 1.25, 0.35);
  const c2 = a + 2.1;
  const c3 = a + 2.65;
  let cur: { x: number; y: number };
  if (T < a + 1.3) {
    const p = M.glide(T, a + 0.4, 0.62);
    cur = { x: lerp(kx + 520, kx + 8, p), y: lerp(ky + 330, ky + 6, p) - Math.sin(p * Math.PI) * 60 };
  } else if (T < c2 + 0.1) {
    const p1 = M.glide(T, a + 1.5, 0.35);
    const p2 = M.glide(T, a + 1.93, 0.17);
    const x0 = lerp(kx + 8, c0x - 6, p1);
    const y0 = lerp(ky + 6, cy + 4, p1) - Math.sin(p1 * Math.PI) * 40;
    cur = { x: lerp(x0, cx - 18, p2), y: lerp(y0, cy + 4, p2) - Math.sin(p2 * Math.PI) * 14 };
  } else {
    const p = M.glide(T, c2 + 0.12, 0.4);
    const q = M.glide(T, c3 + 0.18, 0.45);
    cur = { x: lerp(cx - 18, sx + 22, p) + q * 150, y: lerp(cy + 4, sy + 4, p) - Math.sin(p * Math.PI) * 30 + q * 70 };
  }
  const down = (T > c1 && T < c1 + 0.12) || (T > c2 && T < c2 + 0.12) || (T > c3 && T < c3 + 0.12) ? 1 : 0;
  const r1 = pr(T, c1 + 0.04, 0.45);
  const chipOn = M.enter(T, c2 + 0.02, 0.25);
  const sendOn = M.enter(T, c2 + 0.08, 0.3);
  const sent = M.enter(T, c3 + 0.08, 0.35);
  const hov = (i: number) => (i === 0 ? pr(T, a + 1.78, 0.08) * (1 - pr(T, a + 1.95, 0.08)) : i === R.pick ? pr(T, a + 2.03, 0.06) : 0);
  return (
    <>
      {r1 > 0 && r1 < 1 && page < 1 ? (
        <div
          style={{
            position: "absolute",
            left: kx - 36,
            top: ky - 36,
            width: 72,
            height: 72,
            borderRadius: 36,
            border: `3px solid ${INDIGO}`,
            transform: `scale(${1 + r1 * 1.4})`,
            opacity: (1 - r1) * (1 - page),
          }}
        />
      ) : null}
      {page > 0 ? (
        <>
          <div style={{ position: "absolute", left: 480, top: 836, width: 640, height: 34, background: "#E5E8EA", opacity: page }} />
          {R.chips.map(([label, x, w], i) => {
            const sel = i === R.pick ? chipOn : 0;
            const h = hov(i) * (1 - sel);
            return (
              <div
                key={label}
                style={{
                  position: "absolute",
                  left: x - w / 2,
                  top: cy - ch / 2,
                  width: w,
                  height: ch,
                  boxSizing: "border-box",
                  borderRadius: ch / 2,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  whiteSpace: "nowrap",
                  opacity: page,
                  border: `1.5px solid ${sel > 0.5 ? INDIGO : h > 0.5 ? "#52525B" : "#A1A1AA"}`,
                  background: sel > 0 ? `rgb(${255 - 17 * sel},${255 - 16 * sel},${255 - sel})` : h > 0 ? "#F4F4F5" : "#fff",
                  color: sel > 0.5 ? INDIGO : "#27272A",
                  fontWeight: sel > 0.5 ? 600 : 500,
                }}
              >
                {label}
              </div>
            );
          })}
          {sendOn > 0 ? (
            <div
              style={{
                position: "absolute",
                left: sx - sw / 2,
                top: sy - sh / 2,
                width: sw,
                height: sh,
                borderRadius: sh / 2,
                background: sent > 0 ? INDIGO : "#18181B",
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: sendOn * page,
                transform: `scale(${T > c3 && T < c3 + 0.12 ? 0.97 : 1})`,
              }}
            >
              {sent > 0 ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `scale(${lerp(0.3, 1, sent)})` }}>
                    <path d="M5 12l4 4 10-10" />
                  </svg>
                  {R.done}
                </>
              ) : (
                R.label
              )}
            </div>
          ) : null}
        </>
      ) : null}
      <Cursor x={cur.x} y={cur.y} down={down} scale={1.3} opacity={T > a + 0.4 && T < a + 3.6 ? 1 : 0} />
    </>
  );
}

function camAt(T: number, a: number, keys: number[][]) {
  const ts = keys.map((k) => a + k[0]);
  const at = (j: number) => chan(ts, keys.map((k) => k[j]), T);
  return { cx: at(1), cy: at(2), fx: at(3), fy: at(4), s: at(5), ry: at(6) };
}

function PortalPill({ P, num, T, t0, tout }: { P: PortalBeat; num: string; T: number; t0: number; tout: number | null }) {
  const { tb, portrait, u } = useFilm();
  const phone = portrait && tb > 1;
  const { ey } = useExtra();
  const e = M.enter(T, t0, 0.5);
  const x = tout == null ? 0 : M.exit(T, tout, 0.25);
  if (e <= 0.001 || x >= 0.999) return null;
  const k = Math.min(tb, 1.9);
  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        right: portrait ? 64 : undefined,
        // Phones: in the empty band under the shot, not over it.
        bottom: portrait ? 60 - ey + 120 : 60,
        zIndex: 30,
        padding: "24px 34px 26px",
        borderRadius: 26,
        background: "rgba(255,255,255,.96)",
        boxShadow: "0 30px 80px rgba(9,9,11,.28)",
        border: `1px solid ${C.line}`,
        opacity: Math.min(1, e * 1.5) * (1 - x),
        transform: `translateY(${(1 - e) * 40 + x * 30}px)`,
        filter: blurF((1 - e) * 8 + x * 8),
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "0 18px" }}>
        <span style={{ fontSize: 52 * k, fontWeight: 600, letterSpacing: "-0.04em", ...GT }}>{num}</span>
        <span style={{ fontSize: 46 * k, fontWeight: 600, letterSpacing: "-0.03em", color: C.ink }}>{P.title}</span>
        <span style={{ fontSize: 46 * k, fontWeight: 500, letterSpacing: "-0.03em", color: C.zinc6 }}>{P.sub}</span>
      </div>
      <div style={{ marginTop: 8, fontSize: phone ? 14 / u : 26 * k, fontWeight: 500, letterSpacing: "-0.01em", color: C.mute }}>{P.caption}</div>
      {/* Phones: the sample label lives in the pill, clear of the navbar. */}
      {phone ? <div style={{ marginTop: 6, fontSize: 11 / u, fontWeight: 500, color: C.zinc4 }}>{SAMPLE}</div> : null}
    </div>
  );
}

/** One portal beat. `n` is its number within the chapter (a chapter may show a subset). */
export function SPortal({ i, n }: { i: number; n?: number }) {
  const [a, b, T] = useAB("P" + (i + 1));
  const { tb, portrait, Q, u } = useFilm();
  const { ey } = useExtra();
  const phone = portrait && tb > 1;
  const P = PORTALS[i];
  const num = n == null ? P.n : String(n).padStart(2, "0");
  // 01 hands its zoomed camera straight to 02 when 02 follows in this chapter.
  const holdOut = !!P.holdOut && !!PORTALS[i + 1]?.noEnter && Q["P" + (i + 2)] === b;
  const x = holdOut ? 0 : M.exit(T, b - 0.3, 0.3);
  const e = P.noEnter ? 1 : M.enter(T, a + 0.2, 0.75);
  let cam = camAt(T, a, P.keys);
  if (portrait) {
    // Portrait: the screen flies in centred below the title. On phones the zoomed shots
    // also go a little closer (x1.2, which still frames each beat's action end to end).
    const zf = clamp((cam.s - 0.9) / 0.6, 0, 1);
    const intro = 1 - clamp((cam.s - 0.7) / 0.6, 0, 1);
    // 01 keeps its framing (its grid spans the whole width); 03 goes x1.2 closer.
    const boost = phone && P.upload ? 0.2 : 0;
    cam = { ...cam, cx: 960, cy: cam.cy + 0.45 * ey * intro, s: cam.s * (1 + boost * zf) };
  }
  const tx = (1 - e) * 820 - x * 300;
  const h = P.h || FH - BAR;
  const mix = P.src2 ? pr(T, a + 1.25, 0.35) : 0;
  const zoomed = clamp((cam.s - 0.9) / 0.4, 0, 1);
  const tOut = P.titleOut == null ? -1 : a + P.titleOut;
  const tx2 = P.titleOut == null ? 1 : M.exit(T, tOut, 0.3);
  const k = Math.min(tb, 2);
  return (
    <Scene from={a} to={b} bg={P.bg} push={0}>
      <div style={{ position: "absolute", inset: 0, perspective: 2400, perspectiveOrigin: "1300px 560px", opacity: Math.min(1, e * 1.4) * (1 - x), filter: blurF((1 - e) * 14 + x * 10) }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: FW,
            height: BAR + h,
            transformOrigin: "0 0",
            transform: `translate(${cam.cx + tx}px, ${cam.cy}px) rotateY(${cam.ry}deg) scale(${cam.s}) translate(${-cam.fx}px, ${-cam.fy}px)`,
          }}
        >
          <Screen src={P.src} h={h} src2={P.src2} mix={mix}>
            {P.upload ? <UploadOverlay T={T} a={a} at={P.uploadAt} /> : null}
            {P.request ? <RequestOverlay T={T} a={a} /> : null}
          </Screen>
        </div>
      </div>
      {P.titleOut != null && tx2 < 0.999 ? (
        <div
          style={{
            position: "absolute",
            left: 120,
            top: portrait ? -160 : 0,
            bottom: portrait ? undefined : 0,
            width: portrait ? 1680 : 600,
            height: portrait ? 560 : undefined,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            opacity: (1 - x) * (1 - tx2),
            filter: blurF(x * 10 + tx2 * 10),
            transform: `translateX(${-x * 160 - tx2 * 200}px)`,
          }}
        >
          <div style={{ fontSize: 150, fontWeight: 600, letterSpacing: "-0.05em", lineHeight: 0.9, ...GT, ...fx(T, a, null, { dy: 80, ds: 0.3 }) }}>{num}</div>
          <div style={{ marginTop: 26, fontSize: 60 * k, fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.02, color: C.ink, whiteSpace: "nowrap", ...fx(T, a + 0.08, null, { dy: 50 }) }}>{P.title}</div>
          <div style={{ fontSize: 60 * k, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.02, color: C.zinc6, whiteSpace: "nowrap", ...fx(T, a + 0.16, null, { dy: 50 }) }}>{P.sub}</div>
          <div style={{ marginTop: 30, width: portrait ? 1600 : 460, fontSize: phone ? 15 / u : 28 * k, fontWeight: 500, lineHeight: 1.3, letterSpacing: "-0.01em", color: C.mute, ...fx(T, a + 0.5, null, { dy: 24, blur: 6 }) }}>{P.caption}</div>
        </div>
      ) : null}
      <PortalPill P={P} num={num} T={T} t0={a + P.pillIn} tout={holdOut ? b - 0.25 : b - 0.3} />
      {/* Phones: readable, in the empty band above the shot. */}
      {phone ? null : <SampleTag on={zoomed * (1 - x)} />}
    </Scene>
  );
}

/* ── ACT 4: the proof ─────────────────────────────────────────────────────── */

export function SExplained() {
  const [a, b, T] = useAB("Explained");
  const { pt, portrait } = useFilm();
  const { ey } = useExtra();
  const x = M.exit(T, b - 0.25, 0.25);
  const sx = lerp(-900, 2600, M.glide(T, a, 0.7));
  const reveal = clamp((sx + 200) / 1920, 0, 1);
  return (
    <Scene from={a} to={b}>
      <div
        style={{
          ...CENTER,
          padding: "0 110px",
          fontSize: 130 * pt,
          fontWeight: 500,
          letterSpacing: "-0.035em",
          clipPath: `inset(-20% ${(1 - reveal) * 100}% -20% 0)`,
          opacity: 1 - x,
          filter: blurF(x * 10),
          transform: `translateY(${-x * 60}px)`,
        }}
      >
        <Rise units={COPY.explained} T={T} t0={a + 0.05} stagger={0.12} o={{ dy: 0, dx: -80 }} gap="0" wrap={portrait} />
      </div>
      <Slab w={900} h={1500 + 2 * ey} style={{ left: sx - 450, top: -210 - ey, filter: "blur(1px)" }} />
    </Scene>
  );
}

export function SEvidenced() {
  const [a, b, T] = useAB("Evidenced");
  const { pt, portrait } = useFilm();
  const x = M.exit(T, b - 0.28, 0.28);
  const sp = M.enter(T, a + 0.45, 0.28) * (1 - M.exit(T, a + 0.78, 0.18));
  const snap = Math.max(0, 1 - Math.abs(T - (a + 0.97)) / 0.12);
  const N = 7;
  return (
    <Scene from={a} to={b}>
      <div
        style={{
          ...CENTER,
          flexDirection: portrait ? "column" : "row",
          gap: portrait ? "0.06em" : "0.26em",
          fontSize: 130 * pt,
          fontWeight: 500,
          letterSpacing: "-0.035em",
          color: C.ink,
          whiteSpace: "nowrap",
          opacity: 1 - x,
          filter: blurF(x * 10),
          transform: `translateY(${-x * 60}px)`,
        }}
      >
        <span style={{ display: "inline-block", ...fx(T, a, null) }}>{COPY.evidencedA}</span>
        <span style={{ display: "inline-block", position: "relative", ...fx(T, a + 0.08, null), transform: `scale(${1 + snap * 0.05})` }}>
          <span style={{ visibility: "hidden" }}>{COPY.evidencedB}</span>
          {Array.from({ length: N }).map((_, j) => (
            <span
              key={j}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                ...GT,
                clipPath: `inset(-20% ${100 - ((j + 1) / N) * 100}% -20% ${(j / N) * 100}%)`,
                transform: `translate(${(j - 3) * 26 * sp}px, ${(j % 2 ? 1 : -1) * (60 + rnd(j, 9) * 70) * sp}px) rotate(${(j % 2 ? 1 : -1) * 6 * sp}deg)`,
                filter: blurF(sp * 3),
              }}
            >
              {COPY.evidencedB}
            </span>
          ))}
        </span>
      </div>
    </Scene>
  );
}

/** "every return filed", and a stamp slams down: ON TIME. */
export function SFiled() {
  const [a, b, T] = useAB("Filed");
  const { portrait, pt } = useFilm();
  const x = M.exit(T, b - 0.3, 0.3);
  const hit = a + 0.62;
  const st = M.enter(T, hit - 0.16, 0.2);
  const shake = T > hit && T < hit + 0.18 ? Math.sin((T - hit) * 90) * 10 * (1 - pr(T, hit, 0.18)) : 0;
  return (
    <Scene from={a} to={b} bg="zinc">
      <div
        style={{
          ...CENTER,
          flexDirection: portrait ? "column" : "row",
          gap: 34,
          fontSize: 124 * pt,
          fontWeight: 500,
          letterSpacing: "-0.035em",
          color: C.ink,
          whiteSpace: "pre",
          opacity: 1 - x,
          filter: blurF(x * 10),
          transform: `translate(${shake}px, ${-x * 60}px)`,
        }}
      >
        <span style={{ display: "inline-flex" }}>
          <span style={{ display: "inline-block", ...GT, ...fx(T, a, null) }}>{COPY.filedA}</span>
          <span style={{ display: "inline-block", ...fx(T, a + 0.08, null) }}>{COPY.filedB}</span>
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            padding: "14px 34px",
            border: `6px solid ${INDIGO}`,
            borderRadius: 22,
            color: INDIGO,
            fontSize: 84 * Math.min(pt, 1.3),
            fontWeight: 700,
            letterSpacing: "0.06em",
            transform: `rotate(-8deg) scale(${lerp(2.6, 1, st)})`,
            opacity: T >= hit - 0.16 ? Math.min(1, st * 2) : 0,
            filter: blurF((1 - st) * 16),
            background: "rgba(79,85,241,.06)",
          }}
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={INDIGO} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l4 4 10-10" />
          </svg>
          {COPY.stamp}
        </span>
      </div>
    </Scene>
  );
}

/* ── Close: the line portrait flows into the A4 mark ─────────────────────── */

const PORTRAIT =
  "M 980 822 L 1110 822 C 1100 760 1086 660 1074 596 C 1071 580 1082 574 1089 588 C 1104 664 1120 760 1134 806 L 1390 808 C 1404 808 1410 796 1400 790 C 1432 778 1470 760 1505 745 C 1530 722 1568 662 1572 620 C 1570 598 1556 575 1540 562 C 1515 560 1497 548 1495 530 C 1494 518 1486 512 1488 504 C 1480 498 1474 490 1484 484 C 1488 470 1482 450 1494 432 C 1510 400 1560 390 1596 412 C 1630 432 1636 480 1614 506 C 1604 518 1600 540 1606 560 C 1640 600 1662 660 1664 730 C 1666 770 1660 800 1648 822 L 1790 822";
const TAIL_A4 = "M 1790 822 C 1900 900 1500 1040 1150 960 C 860 900 700 820 792 728 L 1013 352 L 1060 352 L 882 653 L 1147 634 L 1078 634 L 1078 728";
const seg = (a: number, b: number): React.CSSProperties => ({ strokeDasharray: `${Math.max(0, b - a)} 2`, strokeDashoffset: -a });

export function SClose() {
  const { T, Q, portrait, pt } = useFilm();
  const a = cue(Q, "Close");
  const l2 = cue(Q, "LineToLogo");
  const b = nextAfter(Q, "LineToLogo");
  const draw = M.glide(T, a + 0.15, 1.85);
  const erase = M.glide(T, l2 + 0.25, 1.0);
  const tail = M.glide(T, l2, 1.45);
  const tailErase = M.glide(T, l2 + 0.9, 0.7) * 0.72;
  const vfill = M.enter(T, l2 + 1.35, 0.45);
  const textTop = portrait ? -260 : 320;
  return (
    <Scene from={a} to={b} push={0.03}>
      <div style={{ position: "absolute", left: 150, top: textTop, display: "flex", flexDirection: "column", gap: 16, fontSize: 84 * pt, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.05 }}>
        {COPY.close.map((ln, i) => (
          <div key={i} style={{ display: "flex", whiteSpace: "pre", ...fx(T, a + i * 0.22, l2, { dy: 50, ex: -260, ey: 0 }) }}>
            {ln.map((un, j) => (
              <span key={j} style={un.g ? GT : { color: C.ink }}>
                {un.t}
              </span>
            ))}
          </div>
        ))}
      </div>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id="film-a4-line" gradientUnits="userSpaceOnUse" x1="980" y1="0" x2="1800" y2="0">
            <stop offset="0" stopColor="#A1A1AA" />
            <stop offset="0.55" stopColor={INDIGO} />
            <stop offset="1" stopColor={C.peri} />
          </linearGradient>
          <linearGradient id="film-a4-tail" gradientUnits="userSpaceOnUse" x1="1800" y1="0" x2="800" y2="0">
            <stop offset="0" stopColor={C.peri} />
            <stop offset="0.5" stopColor={INDIGO} />
            <stop offset="1" stopColor={C.ink} />
          </linearGradient>
        </defs>
        <path
          d={PORTRAIT}
          fill="none"
          stroke="url(#film-a4-line)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          style={seg(erase, draw)}
          opacity={draw > 0.002 && erase < 0.998 ? 1 : 0}
        />
        <path
          d={TAIL_A4}
          fill="none"
          stroke="url(#film-a4-tail)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          style={seg(tailErase, tail)}
          opacity={(tail > 0.002 ? 1 : 0) * (1 - vfill)}
        />
      </svg>
      <div style={{ position: "absolute", left: 770, top: 350, opacity: vfill }}>
        <A4MarkDraw size={380} l={vfill} r={vfill} />
      </div>
    </Scene>
  );
}

/** The end card: the white lockup glitches into place on the black grid. */
export function SFinale() {
  const { T, Q, tb } = useFilm();
  const a = cue(Q, "Glitch");
  const e = cue(Q, "EndCard");
  const N = 12;
  const q = Math.floor(T * 24);
  const settle = M.enter(T, a + 0.7, 0.9);
  const glitching = T < a + 0.8;
  const lockup = (extra?: React.CSSProperties) => (
    <div style={{ ...extra }}>
      <Lockup size={170} color="#fff" />
    </div>
  );
  return (
    <Scene from={a} to={Infinity} bg="dark" push={0}>
      <div style={{ ...CENTER, top: -140, transform: `scale(${lerp(1.03, 1, settle)})` }}>
        <div style={{ position: "relative" }}>
          <div style={{ visibility: glitching ? "hidden" : "visible" }}>{lockup()}</div>
          {glitching
            ? Array.from({ length: N }).map((_, i) => {
                const t0 = a + rnd(i, 5) * 0.45;
                const p = M.enter(T, t0, 0.35);
                const jit = (rnd(i, q) - 0.5) * 520 * (1 - p);
                const clip = `inset(calc(${(i / N) * 100}% - 1px) -10% calc(${100 - ((i + 1) / N) * 100}% - 1px) -10%)`;
                return (
                  <div key={i} style={{ position: "absolute", inset: 0, clipPath: clip, opacity: T >= t0 ? 1 : 0 }}>
                    {p < 1 ? (
                      <div style={{ position: "absolute", inset: 0, transform: `translateX(${jit + 14}px)`, opacity: 0.7 * (1 - p), mixBlendMode: "screen" }}>{lockup({ opacity: 0.8 })}</div>
                    ) : null}
                    <div style={{ position: "absolute", inset: 0, transform: `translateX(${jit}px)` }}>{lockup()}</div>
                  </div>
                );
              })
            : null}
          {glitching
            ? Array.from({ length: 18 }).map((_, i) => {
                const on = rnd(i, q + 3) > 0.45 && T < a + 0.7;
                return (
                  <div
                    key={"b" + i}
                    style={{
                      position: "absolute",
                      left: -200 + rnd(i, 11) * 1100,
                      top: -60 + rnd(i, 12) * 300,
                      width: 20 + rnd(i, q) * 140,
                      height: 8 + rnd(i, q + 1) * 34,
                      background: [INDIGO, C.peri, "#3F3F46"][i % 3],
                      opacity: on ? 0.9 : 0,
                    }}
                  />
                );
              })
            : null}
          <div style={{ position: "absolute", left: "50%", bottom: -40, height: 3, width: `${M.enter(T, e, 0.6) * 100}%`, transform: "translateX(-50%)", background: INDIGO, borderRadius: 2 }} />
        </div>
      </div>
      <Caption size={46} color="#E4E4E7" style={{ top: 600, ...fx(T, e + 0.1, null, { dy: 24, blur: 8 }) }}>
        {COPY.endTagline}
      </Caption>
      <div style={{ position: "absolute", left: 0, right: 0, top: 600 + 90 * tb, display: "flex", justifyContent: "center", ...fx(T, e + 0.2, null, { dy: 20, blur: 6 }) }}>
        <span style={{ display: "inline-flex", alignItems: "center", height: 66 * Math.min(tb, 1.6), padding: "0 30px", borderRadius: 999, border: "1px solid rgba(255,255,255,.22)", background: "rgba(255,255,255,.06)" }}>
          <PoweredBy h={36 * Math.min(tb, 1.6)} />
        </span>
      </div>
    </Scene>
  );
}
