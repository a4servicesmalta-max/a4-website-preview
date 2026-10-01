"use client";

import { useEffect } from "react";
import { EO, IO, clamp, fireFx, ioF, lerp, prefersReducedMotion, prepFx, unprepFx } from "@/lib/fx/engine";

/**
 * Site-wide motion runtime (mounted once in the root layout).
 *
 * - Binds every `[data-fx]` element — server- or client-rendered, now or later (MutationObserver) —
 *   prepares it in its "before" state and fires it when it scrolls into view. Elements inside
 *   `[data-hero]` fire straight away once fonts are ready.
 * - Drives the design's ambient/scroll-linked effects declared with data attributes:
 *   data-drift (floating glow), data-loop (scroll cue), data-hero-exit, data-hero-par,
 *   data-sweep (slab sweeping across its section), data-tl (timeline fill + dots),
 *   data-stage/data-cam (3D screenshot stage that flattens as it arrives).
 *
 * Pre-hiding before hydration is done in CSS under `html.fx` (see globals.css); a head script adds
 * the class and removes it again if this runtime never boots, so content can never stay hidden.
 *
 * Hydration: page content can hydrate after this runtime starts (it sits behind the
 * `[locale]/loading.tsx` Suspense boundary), so the runtime leaves a server-rendered node alone
 * until React has claimed it — React's hydration check then never sees the runtime's attributes or
 * inline styles. Nodes React never claims (HTML injected as a string) are picked up after a grace period.
 */

type Win = Window & { __fxReady?: boolean };

const SEL = "[data-fx],[data-drift],[data-loop]";
const AMB = "fx-ambient";
const GRACE_MS = 3000;

/** React stamps each node it creates or hydrates with a `__reactFiber$…` key; from then on it is safe to touch. */
const claimed = (el: Element) => Object.keys(el).some((k) => k.startsWith("__reactFiber$"));

export function subtleMotion() {
  return prefersReducedMotion();
}

/** Replay an element's effect (e.g. a word that re-types when a service is switched back on). */
export function replayFx(el: Element | null | undefined, delay = 0) {
  fireFx(el, subtleMotion(), delay);
}

export default function FxRuntime() {
  useEffect(() => {
    const w = window as Win;
    const html = document.documentElement;
    const reduced = prefersReducedMotion();
    const subtle = reduced;
    // If the head failsafe already fired (very slow boot), don't hide what people are reading.
    const late = !html.classList.contains("fx");
    w.__fxReady = true;
    if (!reduced) html.classList.add("fx");

    let ready = false;
    let io: IntersectionObserver | null = null;
    const pending: Element[] = [];
    const bound = new WeakSet<Element>();
    const ambient = new WeakSet<Element>();
    const waiting = new Map<Element, { initial: boolean; since: number }>();
    let retryTimer = 0;
    let driftIndex = 0;

    const inView = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
    };

    const bindFx = (el: Element, initial: boolean) => {
      if (bound.has(el)) return;
      bound.add(el);
      // Already played (or playing) — e.g. before a strict-mode remount of this runtime.
      if (el.hasAttribute("data-fx-done")) return;
      if (reduced || (initial && late && inView(el))) {
        el.setAttribute("data-fx-done", "");
        return;
      }
      prepFx(el, subtle);
      if (ready) observe(el);
      else pending.push(el);
    };

    const observe = (el: Element) => {
      if (el.closest("[data-hero]")) fireFx(el, subtle);
      else io?.observe(el);
    };

    const bindAmbient = (el: Element) => {
      if (reduced || ambient.has(el)) return;
      ambient.add(el);
      if (el.hasAttribute("data-drift")) {
        const i = driftIndex++;
        el.animate(
          [{ transform: "translate(0,0)" }, { transform: `translate(${i % 2 ? -10 : 12}vw, ${i % 2 ? 6 : -5}vh)` }],
          { id: AMB, duration: 9000 + i * 1700, direction: "alternate", iterations: Infinity, easing: "ease-in-out" },
        );
      }
      if (el.hasAttribute("data-loop")) {
        el.animate([{ transform: "translateY(-100%)" }, { transform: "translateY(100%)" }], {
          id: AMB,
          duration: 1600,
          iterations: Infinity,
          easing: IO,
        });
      }
    };

    const bind = (el: Element, initial: boolean, force = false) => {
      if (!force && !claimed(el)) {
        if (!waiting.has(el)) waiting.set(el, { initial, since: performance.now() });
        if (!retryTimer) retryTimer = window.setTimeout(retry, 80);
        return;
      }
      if (el.hasAttribute("data-fx")) bindFx(el, initial);
      if (el.hasAttribute("data-drift") || el.hasAttribute("data-loop")) bindAmbient(el);
    };

    const retry = () => {
      retryTimer = 0;
      const now = performance.now();
      waiting.forEach((wait, el) => {
        if (!el.isConnected) waiting.delete(el);
        else if (claimed(el) || now - wait.since > GRACE_MS) {
          waiting.delete(el);
          bind(el, wait.initial, true);
        }
      });
      if (waiting.size) retryTimer = window.setTimeout(retry, 80);
      onScroll();
    };

    const scan = (root: ParentNode, initial: boolean) => {
      if (root instanceof Element && root.matches(SEL)) bind(root, initial);
      root.querySelectorAll(SEL).forEach((el) => bind(el, initial));
    };

    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (n.nodeType === 1) scan(n as Element, false);
        });
      }
      onScroll();
    });

    const fontsReady: Promise<unknown> = document.fonts
      ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))])
      : Promise.resolve();
    let dead = false;
    fontsReady.then(() => {
      if (dead) return;
      io = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (e.isIntersecting) {
              fireFx(e.target, subtle);
              io?.unobserve(e.target);
            }
          }),
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      );
      ready = true;
      pending.splice(0).forEach(observe);
    });

    // ── scroll-linked effects ── (a section's own nodes hydrate before it, so checking it covers them)
    const each = (sel: string, fn: (el: HTMLElement) => void) =>
      document.querySelectorAll<HTMLElement>(sel).forEach((el) => {
        if (claimed(el)) fn(el);
      });
    const scrollFx = () => {
      const vh = window.innerHeight || 800;
      const y = window.scrollY || document.documentElement.scrollTop || 0;

      each("[data-hero-exit]", (hx) => {
        const p = clamp(y / (vh * 0.9), 0, 1);
        hx.style.transform = `translateY(${-p * 140}px)`;
        hx.style.opacity = String(1 - p * 0.85);
        hx.style.filter = subtle || p < 0.02 ? "none" : `blur(${(p * 10).toFixed(2)}px)`;
      });
      each("[data-hero-par]", (hp) => {
        hp.style.transform = `translate(${-y * 0.2}px, ${y * 0.3}px)`;
      });
      each("[data-sweep]", (sw) => {
        const sec = sw.closest("[data-sweep-sec]") || sw.closest("section") || sw.parentElement;
        if (!sec) return;
        const r = sec.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh + r.height), 0, 1);
        sw.style.transform = `translateX(${lerp(-60, 170, ioF(p))}vw)`;
      });
      each("[data-tl]", (tl) => {
        const sec = tl.closest("[data-tl-sec]") || tl.closest("section") || tl;
        const r = sec.getBoundingClientRect();
        const p = clamp((vh * 0.8 - r.top) / (vh * 0.6), 0, 1);
        const f = tl.querySelector<HTMLElement>("[data-tl-fill]");
        if (f) f.style.transform = `scaleX(${p.toFixed(4)})`;
        const dots = Array.from(tl.querySelectorAll<HTMLElement>("[data-tl-dot]"));
        const n = Math.max(1, dots.length - 1);
        dots.forEach((dot, i) => {
          dot.style.transform = `scale(${p > 0.02 && p >= i / n - 0.001 ? 1 : 0})`;
        });
      });
      each("[data-stage]", (st) => {
        const cam = st.querySelector<HTMLElement>("[data-cam]");
        if (!cam) return;
        const CW = Number(st.getAttribute("data-cw") || 1600);
        const CH = Number(st.getAttribute("data-ch") || 980);
        const W = st.clientWidth;
        const H = (W * CH) / CW;
        const fit = W / CW;
        const r = st.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh * 0.8), 0, 1);
        const e = subtle ? 1 : ioF(p);
        cam.style.transform = `translate(${W / 2}px,${H / 2}px) rotateX(${34 * (1 - e)}deg) rotateZ(${-11 * (1 - e)}deg) scale(${fit * lerp(0.72, 1, e)}) translate(${-CW / 2}px,${-CH / 2}px)`;
        cam.style.opacity = String(subtle ? 1 : clamp(p * 2.4, 0, 1));
      });
    };

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        scrollFx();
      });
    };

    scan(document, true);
    mo.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll);
    scrollFx();

    return () => {
      dead = true;
      mo.disconnect();
      io?.disconnect();
      clearTimeout(retryTimer);
      cancelAnimationFrame(raf);
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
      // Hand everything back so a remount (React strict mode, fast refresh) starts clean.
      document.querySelectorAll("[data-fx]:not([data-fx-done])").forEach(unprepFx);
      document.querySelectorAll("[data-drift],[data-loop]").forEach((el) =>
        el.getAnimations().forEach((a) => {
          if (a.id === AMB) a.cancel();
        }),
      );
    };
  }, []);

  return null;
}

export { EO, IO };
