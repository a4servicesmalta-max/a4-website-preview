"use client";

import { useEffect } from "react";
import { EO, IO, clamp, fireFx, ioF, lerp, prefersReducedMotion, prepFx } from "@/lib/fx/engine";

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
 */

type Win = Window & { __fxReady?: boolean };

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
    let driftIndex = 0;

    const inView = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
    };

    const bindFx = (el: Element, initial: boolean) => {
      if (el.hasAttribute("data-fx-bound")) return;
      el.setAttribute("data-fx-bound", "");
      if (reduced) {
        el.setAttribute("data-fx-done", "");
        return;
      }
      if (initial && late && inView(el)) {
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
      if (reduced || el.hasAttribute("data-fx-amb")) return;
      el.setAttribute("data-fx-amb", "");
      if (el.hasAttribute("data-drift")) {
        const i = driftIndex++;
        el.animate(
          [{ transform: "translate(0,0)" }, { transform: `translate(${i % 2 ? -10 : 12}vw, ${i % 2 ? 6 : -5}vh)` }],
          { duration: 9000 + i * 1700, direction: "alternate", iterations: Infinity, easing: "ease-in-out" },
        );
      }
      if (el.hasAttribute("data-loop")) {
        el.animate([{ transform: "translateY(-100%)" }, { transform: "translateY(100%)" }], {
          duration: 1600,
          iterations: Infinity,
          easing: IO,
        });
      }
    };

    const scan = (root: ParentNode, initial: boolean) => {
      if (root instanceof Element) {
        if (root.hasAttribute("data-fx")) bindFx(root, initial);
        if (root.hasAttribute("data-drift") || root.hasAttribute("data-loop")) bindAmbient(root);
      }
      root.querySelectorAll("[data-fx]").forEach((el) => bindFx(el, initial));
      root.querySelectorAll("[data-drift],[data-loop]").forEach(bindAmbient);
    };

    scan(document, true);

    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (n.nodeType === 1) scan(n as Element, false);
        });
      }
      onScroll();
    });
    mo.observe(document.body, { childList: true, subtree: true });

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

    // ── scroll-linked effects ──
    const scrollFx = () => {
      const vh = window.innerHeight || 800;
      const y = window.scrollY || document.documentElement.scrollTop || 0;

      document.querySelectorAll<HTMLElement>("[data-hero-exit]").forEach((hx) => {
        const p = clamp(y / (vh * 0.9), 0, 1);
        hx.style.transform = `translateY(${-p * 140}px)`;
        hx.style.opacity = String(1 - p * 0.85);
        hx.style.filter = subtle || p < 0.02 ? "none" : `blur(${(p * 10).toFixed(2)}px)`;
      });
      document.querySelectorAll<HTMLElement>("[data-hero-par]").forEach((hp) => {
        hp.style.transform = `translate(${-y * 0.2}px, ${y * 0.3}px)`;
      });
      document.querySelectorAll<HTMLElement>("[data-sweep]").forEach((sw) => {
        const sec = sw.closest("[data-sweep-sec]") || sw.closest("section") || sw.parentElement;
        if (!sec) return;
        const r = sec.getBoundingClientRect();
        const p = clamp((vh - r.top) / (vh + r.height), 0, 1);
        sw.style.transform = `translateX(${lerp(-60, 170, ioF(p))}vw)`;
      });
      document.querySelectorAll<HTMLElement>("[data-tl]").forEach((tl) => {
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
      document.querySelectorAll<HTMLElement>("[data-stage]").forEach((st) => {
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
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll);
    scrollFx();

    return () => {
      dead = true;
      mo.disconnect();
      io?.disconnect();
      cancelAnimationFrame(raf);
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}

export { EO, IO };
