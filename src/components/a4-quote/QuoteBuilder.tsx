"use client";

/**
 * /quote — the full-page quote builder in the "A4 Quotation" design language
 * (the same look and motion as src/app/q/[id]/QuotationLanding.tsx): numbered
 * sections, service cards with toggles and letter-effect words, the quote
 * document with a Monthly / First year / Retainer switch, the formal-quotation
 * form, the timeline, the terms, and a sticky price pill.
 *
 * Arithmetic lives in ./builderModel.ts (pure, tested): one engine
 * (evaluateA4Items) and the canonical retainer rule (src/lib/retainer.ts).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { replayFx } from "@/components/fx/FxRuntime";
import { EO, prefersReducedMotion } from "@/lib/fx/engine";
import type { QuotePlan } from "@/lib/websiteQuotation";
import {
  BUILDER_INIT,
  MAX_HEADS,
  basketRetainer,
  buildBasket,
  catchUpMonths,
  viewTotals,
  type BuilderState,
  type BuilderView,
  type ToggleKey,
} from "./builderModel";
import { AboutSection, AfterSections, QuoteSection, SendSection, ServicesSection, StickyPill } from "./BuilderSections";
import "./a4-quote.css";

/** Expo-out tween of a figure (600ms); lands at once with reduced motion. */
function useTween(to: number): number {
  const [shown, setShown] = useState(to);
  const cur = useRef(to);
  useEffect(() => {
    const from = cur.current;
    if (from === to) return;
    const D = prefersReducedMotion() ? 0 : 600;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = D ? Math.min(1, (now - t0) / D) : 1;
      const e = p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);
      const v = from + (to - from) * e;
      cur.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return shown;
}

export type BuilderApi = ReturnType<typeof useBuilder>;

function useBuilder(rootRef: React.RefObject<HTMLDivElement | null>, replayKey: React.RefObject<string | null>) {
  // "Today", read once: it decides which months are catch-up.
  const [now] = useState(() => new Date());
  const [s, setS] = useState<BuilderState>(BUILDER_INIT);
  const [view, setViewRaw] = useState<BuilderView>("monthly");
  const [plan, setPlan] = useState<QuotePlan | null>(null);

  const set = useCallback((patch: Partial<BuilderState>) => setS((prev) => ({ ...prev, ...patch })), []);
  const toggle = useCallback((key: ToggleKey) => {
    setS((prev) => {
      const turningOn = !prev.on[key];
      if (turningOn) replayKey.current = key;
      const next: BuilderState = { ...prev, on: { ...prev.on, [key]: turningOn } };
      // Payroll switched on with nobody on it yet: start at one person.
      if (key === "pay" && turningOn && prev.heads <= 0) next.heads = 1;
      return next;
    });
  }, [replayKey]);
  /** The headcount drives the payroll switch: people → on, nobody → off. */
  const setHeads = useCallback((heads: number) => {
    const h = Math.max(0, Math.min(MAX_HEADS, Math.round(heads)));
    setS((prev) => {
      const pay = h === 0 ? false : prev.heads === 0 ? true : prev.on.pay;
      if (pay && !prev.on.pay) replayKey.current = "pay";
      return { ...prev, heads: h, on: { ...prev.on, pay } };
    });
  }, [replayKey]);
  /** The way out of the independence conflict: drop one side, price the rest. */
  const resolve = useCallback((keep: "book" | "assure") => {
    setS((prev) => ({ ...prev, on: keep === "book" ? { ...prev.on, assure: false } : { ...prev.on, book: false, vat: false } }));
  }, []);

  const basket = useMemo(() => buildBasket(s, now), [s, now]);
  const retainer = useMemo(() => basketRetainer(basket), [basket]);
  // The Retainer view only while the selection qualifies; the choice comes back when it does.
  const effView: BuilderView = view === "retainer" && !retainer.offered ? "monthly" : view;
  const totals = useMemo(() => viewTotals(basket, effView, retainer), [basket, effView, retainer]);
  const shownTotal = useTween(basket.gate ? 0 : totals.total);
  const shownNet = useTween(basket.gate ? 0 : totals.net);
  const months = catchUpMonths(s, now);

  const setView = useCallback((v: BuilderView) => setViewRaw(v), []);

  const go = useCallback(
    (sel: string) => {
      const el = rootRef.current?.querySelector<HTMLElement>(sel) ?? document.querySelector<HTMLElement>(sel);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    },
    [rootRef]
  );

  return { s, set, toggle, setHeads, resolve, now, basket, retainer, view: effView, wantedView: view, setView, plan, setPlan, totals, shownTotal, shownNet, months, go };
}

export function QuoteBuilder() {
  const rootRef = useRef<HTMLDivElement>(null);
  const replayKey = useRef<string | null>(null);
  const api = useBuilder(rootRef, replayKey);
  const [pill, setPill] = useState<{ on: boolean; atQuote: boolean }>({ on: false, atQuote: false });
  const seenRows = useRef<Set<string> | null>(null);
  const { basket, s } = api;

  /* ── rows that join the quote slide in; a service switched on re-types its word ── */
  const rowKey = basket.priced.join("|") + "#" + basket.lines.length;
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-row]"));
    if (seenRows.current && !prefersReducedMotion()) {
      rows.forEach((r) => {
        if (!seenRows.current!.has(r.dataset.row ?? "")) {
          r.animate(
            [
              { opacity: 0, transform: "translateY(24px)", filter: "blur(8px)", background: "rgba(79,85,241,.08)" },
              { opacity: 1, transform: "none", filter: "none", background: "rgba(79,85,241,0)" },
            ],
            { duration: 650, easing: EO }
          );
        }
      });
    }
    seenRows.current = new Set(rows.map((r) => r.dataset.row ?? ""));
    if (replayKey.current) {
      replayFx(root.querySelector(`[data-word="${replayKey.current}"]`));
      replayKey.current = null;
    }
  }, [rowKey, s.on]);

  /* ── the sticky price pill: on while the visitor builds, off once they reach the form ── */
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const root = rootRef.current;
      if (!root) return;
      const vh = window.innerHeight || 800;
      const about = root.querySelector('[data-sec="about"]');
      const quote = root.querySelector('[data-sec="quote"]');
      const send = root.querySelector('[data-sec="send"]');
      if (!about || !quote || !send) return;
      const on = about.getBoundingClientRect().top < vh * 0.5 && send.getBoundingClientRect().top > vh * 0.55;
      const atQuote = quote.getBoundingClientRect().top < vh * 0.5;
      setPill((p) => (p.on === on && p.atQuote === atQuote ? p : { on, atQuote }));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <AboutSection api={api} />
      <ServicesSection api={api} />
      <QuoteSection api={api} />
      <SendSection api={api} />
      <AfterSections />
      <StickyPill api={api} on={pill.on} atQuote={pill.atQuote} />
    </div>
  );
}
