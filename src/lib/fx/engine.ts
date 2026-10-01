/**
 * A4 motion engine — a 1:1 port of the effects in the "A4 Quotation" landing design.
 *
 * Any element (server- or client-rendered) opts in with `data-fx="<effect>"`:
 *   rise · big · words · tighten · zoom · scatter · cascade · stack · type · draw · bar · slab · glitch
 * Tuning attributes (all optional): data-d (delay ms), data-dy (rise distance px),
 * data-per (ms per letter for `type`), data-stagger (ms between words), data-len (dash length for `draw`).
 *
 * The runtime (src/components/fx/FxRuntime.tsx) binds, prepares and fires these on scroll.
 */

export const INK = "#09090B";
export const INDIGO = "#4F55F1";
export const INDIGO_2 = "#6468F3";
export const PERI = "#8B8FF7";

/** easeOutExpo-ish and easeInOutCubic, exactly as in the design. */
export const EO = "cubic-bezier(0.16, 1, 0.3, 1)";
export const IO = "cubic-bezier(0.65, 0, 0.35, 1)";

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ioF = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
/** Deterministic pseudo-random in [0,1) — same seeds as the design so scatter/glitch look identical. */
export const rnd = (a: number, b = 0) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
};
/** Brand gradient (indigo → indigo-2 → periwinkle) sampled at t ∈ [0,1]. */
export const gcol = (t: number) => (t < 0.55 ? mix(INDIGO, INDIGO_2, t / 0.55) : mix(INDIGO_2, PERI, (t - 0.55) / 0.45));

export type FxEffect =
  | "rise"
  | "big"
  | "words"
  | "tighten"
  | "zoom"
  | "scatter"
  | "cascade"
  | "stack"
  | "type"
  | "draw"
  | "bar"
  | "slab"
  | "glitch";

type Animated = Element & { __fx?: Animation[] };

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

const num = (el: Element, attr: string, fallback: number) => {
  const v = el.getAttribute(attr);
  return v == null || v === "" ? fallback : Number(v);
};

/** Build (but do not start) the animations for one `[data-fx]` element. */
export function buildFx(el: Element, subtle: boolean, delayOverride?: number): Animation[] {
  const fx = el.getAttribute("data-fx") as FxEffect | null;
  const d = delayOverride ?? num(el, "data-d", 0);
  const S = subtle;
  const k = S ? 0.35 : 1;
  const B = (b: number) => (S ? "none" : `blur(${b}px)`);
  const A = (n: Element, kf: Keyframe[], dur: number, delay: number, ease?: string) =>
    n.animate(kf, { duration: dur, delay, easing: ease || EO, fill: "both" });
  const kids = (s: string) => Array.from(el.querySelectorAll(s));
  const rise = (n: Element, dy: number, blur: number, delay: number, dur = 700, s0 = 1) =>
    A(
      n,
      [
        { opacity: 0, transform: `translateY(${dy * k}px) scale(${S ? 1 : s0})`, filter: B(blur) },
        { opacity: 1, offset: 0.6 },
        { opacity: 1, transform: "none", filter: "none" },
      ],
      dur,
      delay,
    );
  const out: Animation[] = [];

  if (fx === "rise") out.push(rise(el, num(el, "data-dy", 50), 12, d));
  else if (fx === "big") out.push(rise(el, 120, 20, d, 850, 1.15));
  else if (fx === "words") {
    const st = num(el, "data-stagger", 80);
    kids("[data-w]").forEach((w, i) => out.push(rise(w, 60, 12, d + i * st)));
  } else if (fx === "tighten") {
    const ls = getComputedStyle(el).letterSpacing;
    out.push(
      A(
        el,
        [
          { opacity: 0, letterSpacing: S ? ls : "0.6em", filter: B(22) },
          { opacity: 1, offset: 0.5 },
          { opacity: 1, letterSpacing: ls, filter: "none" },
        ],
        750,
        d,
      ),
    );
  } else if (fx === "zoom")
    out.push(
      A(
        el,
        [
          { opacity: 0, transform: `scale(${S ? 0.92 : 0.12})`, filter: B(10) },
          { opacity: 1, offset: 0.4 },
          { opacity: 1, transform: "none", filter: "none" },
        ],
        620,
        d,
      ),
    );
  else if (fx === "scatter")
    kids("[data-l]").forEach((l, i) => {
      const dx = (rnd(i, 1) - 0.5) * 700 * k;
      const dy = (rnd(i, 2) - 0.5) * 360 * k;
      const s0 = S ? 1 : 0.3 + rnd(i, 3) * 2.4;
      out.push(
        A(
          l,
          [
            { opacity: 0, transform: `translate(${dx}px,${dy}px) scale(${s0})`, filter: B(4 + rnd(i, 4) * 18) },
            { opacity: 1, offset: 0.5 },
            { opacity: 1, transform: "none", filter: "none" },
          ],
          620,
          d + 50 + i * 35,
        ),
      );
    });
  else if (fx === "cascade")
    kids("[data-l]").forEach((l, i) =>
      out.push(
        A(
          l,
          [
            { opacity: 0, transform: `translate(${-90 * k}px,${-70 * k}px)`, filter: B(10) },
            { opacity: 1, offset: 0.5 },
            { opacity: 1, transform: "none", filter: "none" },
          ],
          620,
          d + i * 40,
        ),
      ),
    );
  else if (fx === "stack")
    kids("[data-l]").forEach((l, i) =>
      out.push(
        A(
          l,
          [
            { opacity: 0, transform: `translateY(${(i % 2 ? -1 : 1) * 80 * k}px)`, filter: B(12) },
            { opacity: 1, offset: 0.5 },
            { opacity: 1, transform: "none", filter: "none" },
          ],
          560,
          d + i * 30,
        ),
      ),
    );
  else if (fx === "type") {
    const per = num(el, "data-per", 45);
    kids("[data-l]").forEach((l, i) => out.push(A(l, [{ opacity: 0 }, { opacity: 1 }], 1, d + (i + 1) * per, "linear")));
  } else if (fx === "draw") {
    const len = num(el, "data-len", 0);
    out.push(A(el, [{ strokeDashoffset: `${len}px` }, { strokeDashoffset: "0px" }], 420, d, IO));
  } else if (fx === "bar") out.push(A(el, [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], 450, d));
  else if (fx === "slab")
    out.push(
      A(
        el,
        [
          { opacity: 0, transform: `translate(${40 * k}vw,${30 * k}vh)`, filter: B(16) },
          { opacity: 1, offset: 0.4 },
          { opacity: 1, transform: "none", filter: "none" },
        ],
        1200,
        d,
      ),
    );
  else if (fx === "glitch") {
    const D = 900;
    const J = S ? 30 : 380;
    const base = el.querySelector("[data-glitch-base]");
    const ul = el.querySelector("[data-uline]");
    if (base) out.push(A(base, [{ opacity: 0 }, { opacity: 0, offset: 0.82 }, { opacity: 1 }], D, d, "linear"));
    kids("[data-slice]").forEach((s, i) => {
      const t0 = rnd(i, 5) * 0.45;
      const j = (a: number) => (rnd(i, a) - 0.5) * J;
      const st = "steps(1, end)";
      out.push(
        A(
          s,
          [
            { opacity: 0, transform: `translateX(${j(7)}px)`, offset: 0, easing: st },
            { opacity: 0, transform: `translateX(${j(7)}px)`, offset: t0, easing: st },
            { opacity: 1, transform: `translateX(${j(8)}px)`, offset: t0 + 0.02, easing: st },
            { opacity: 1, transform: `translateX(${j(9) * 0.6}px)`, offset: t0 + 0.12, easing: st },
            { opacity: 1, transform: `translateX(${j(10) * 0.3}px)`, offset: t0 + 0.22 },
            { opacity: 1, transform: "translateX(0px)", offset: 0.8 },
            { opacity: 0, transform: "translateX(0px)", offset: 1 },
          ],
          D,
          d,
          "linear",
        ),
      );
    });
    kids("[data-gblock]").forEach((b, i) => {
      const kf: Keyframe[] = [{ opacity: 0, offset: 0 }];
      let t = 0.02 + rnd(i, 21) * 0.15;
      while (t < 0.68) {
        kf.push({ opacity: 0, offset: t });
        kf.push({ opacity: 0.9, offset: t + 0.001 });
        t += 0.04 + rnd(i, t * 100) * 0.08;
        kf.push({ opacity: 0.9, offset: t });
        kf.push({ opacity: 0, offset: t + 0.001 });
        t += 0.05 + rnd(t * 50, i) * 0.1;
      }
      kf.push({ opacity: 0, offset: 1 });
      out.push(A(b, kf, D, d, "linear"));
    });
    if (ul) out.push(A(ul, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], 700, d + D + 50));
    kids("[data-glitch-after]").forEach((a, i) => out.push(rise(a, 24, 8, d + D + 150 + i * 110)));
  }
  return out;
}

/** Create paused animations at t=0 so the element sits in its "before" state until fired. */
export function prepFx(el: Element, subtle: boolean) {
  const a = el as Animated;
  a.__fx = buildFx(el, subtle);
  a.__fx.forEach((anim) => {
    anim.pause();
    anim.currentTime = 0;
  });
}

/** Typewriter caret that hops letter to letter, blinks three times, then hides. */
export function runCaret(el: Element, d: number) {
  const c = el.querySelector<HTMLElement>("[data-caret]");
  const ls = Array.from(el.querySelectorAll<HTMLElement>("[data-l]"));
  if (!c || !ls.length) return;
  c.getAnimations().forEach((a) => a.cancel());
  const per = num(el, "data-per", 45);
  const n = ls.length;
  const D = n * per;
  const y0 = ls[0].offsetTop;
  const pos = (i: number) =>
    i === 0
      ? `translate(${ls[0].offsetLeft}px,0px)`
      : `translate(${ls[i - 1].offsetLeft + ls[i - 1].offsetWidth}px,${ls[i - 1].offsetTop - y0}px)`;
  const kf: Keyframe[] = [];
  for (let i = 0; i <= n; i++) kf.push({ transform: pos(i), opacity: 1, offset: i / n, easing: "step-end" });
  c.animate(kf, { duration: D, delay: d, fill: "both" });
  c.animate([{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0, offset: 0.5 }, { opacity: 0 }], {
    duration: 500,
    delay: d + D,
    iterations: 3,
  });
  c.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 1, delay: d + D + 1500, fill: "forwards" });
}

/**
 * Play an element's effect. With `delayOverride` the animations are rebuilt (used for replays,
 * e.g. a service word re-typing when it is switched back on).
 */
export function fireFx(el: Element | null | undefined, subtle: boolean, delayOverride?: number) {
  if (!el || prefersReducedMotion()) return;
  const a = el as Animated;
  if (!a.__fx || delayOverride != null) {
    (a.__fx || []).forEach((anim) => anim.cancel());
    a.__fx = buildFx(el, subtle, delayOverride);
  }
  // Once playing, the animation owns the element's appearance; the CSS pre-hide can step aside.
  el.setAttribute("data-fx-done", "");
  if (el.getAttribute("data-fx") === "type") runCaret(el, delayOverride ?? num(el, "data-d", 0));
  a.__fx.forEach((anim) => {
    anim.play();
    anim.finished.then(
      () => anim.cancel(),
      () => {},
    );
  });
}

/** Split text into typewriter letters, colouring gradient segments per letter like the design. */
export type TypeSegment = { t: string; c?: string; g?: boolean };
export function typeLetters(segs: TypeSegment[]): { ch: string; c: string }[] {
  const out: { ch: string; c: string }[] = [];
  segs.forEach((s) => {
    const chars = Array.from(s.t);
    const n = chars.length;
    chars.forEach((ch, j) => out.push({ ch, c: s.g ? gcol(n > 1 ? j / (n - 1) : 0) : s.c || "currentColor" }));
  });
  return out;
}
