"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button, Icon } from "@/components/a4-landing/Primitives";
import {
  A4DrawnLockup,
  DARK_GRID,
  DriftGlow,
  LIGHT_GLOW,
  Slab,
  SweepSlab,
  TypeText,
  Words,
  gradText,
} from "@/components/fx/primitives";
import { INDIGO, INK, PERI, gcol } from "@/lib/fx/engine";
import { usePrefersReducedMotion } from "@/contexts/ReduceMotionContext";
// Bookkeeping figures come from the quote pack. Under mt-2026-08-14-volume they
// are the ENTRY band of nine, priced by monthly expenses — always shown as "from".
import { BOOKKEEPING_COMPANY, BOOKKEEPING_FROM } from "@/data/a4QuotePack";

/**
 * Homepage opening — the hero, the statement and the AI-native manifesto, in
 * the A4 design language (the "A4 Quotation" landing: 01 HERO, the
 * "Every service. / One portal." statement and 04 WHY A4).
 * Entrances are `data-fx` attributes bound by FxRuntime; nothing here
 * hand-rolls a reveal.
 */

const SANS = "var(--a4x-display)";
const BODY = "var(--a4x-body)";

const HERO_WORDS = ["accounting", "statutory audit", "VAT returns", "payroll", "tax compliance"];
const HERO_FALLBACK = "accounting & audit";

/**
 * The rotating word in "Simplify your {word} with A4." — types and deletes each
 * word behind the design's indigo caret, every letter sampled from the brand
 * gradient like the design's typewriter. Static under reduced motion.
 */
function TypeCycle({ words, fallback }: { words: string[]; fallback: string }) {
  // Real prefers-reduced-motion only — the broad useReduceMotion() heuristic
  // (any window under 768px, all of Safari) froze the typewriter on setups
  // where every other scroll animation still ran.
  const reduceMotion = usePrefersReducedMotion();
  const [shown, setShown] = useState({ word: 0, len: Array.from(words[0]).length });
  const deleting = useRef(false);

  useEffect(() => {
    if (reduceMotion) return;
    let timer: ReturnType<typeof setTimeout>;
    let word = 0;
    let len = Array.from(words[0]).length;
    deleting.current = false;
    const tick = () => {
      const full = Array.from(words[word]);
      if (!deleting.current) {
        len += 1;
        if (len >= full.length) {
          len = full.length;
          setShown({ word, len });
          deleting.current = true;
          timer = setTimeout(tick, 2400); // hold the full word
          return;
        }
        setShown({ word, len });
        timer = setTimeout(tick, 70);
      } else {
        len -= 1;
        if (len <= 0) {
          len = 0;
          setShown({ word, len });
          deleting.current = false;
          word = (word + 1) % words.length;
          timer = setTimeout(tick, 350);
          return;
        }
        setShown({ word, len });
        timer = setTimeout(tick, 38);
      }
    };
    // The first word is already on screen when the hero lands; hold it while
    // the headline finishes its entrance before the cycle starts.
    timer = setTimeout(tick, 2600);
    return () => clearTimeout(timer);
  }, [reduceMotion, words]);

  if (reduceMotion) return <span style={gradText}>{fallback}</span>;

  const full = Array.from(words[shown.word]);
  const n = full.length;
  return (
    <span>
      {full.slice(0, shown.len).map((ch, j) => (
        <span key={`${shown.word}-${j}`} style={{ color: gcol(n > 1 ? j / (n - 1) : 0) }}>
          {ch}
        </span>
      ))}
      <span
        className="hero-caret"
        style={{ display: "inline-block", width: ".06em", minWidth: 2, height: ".9em", marginLeft: ".05em", verticalAlign: "-.1em", background: INDIGO }}
      />
    </span>
  );
}

/** "Quotes within 24 hours"-style chip: grey label, white value — the design's hero chips. */
function W({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#FFFFFF" }}>{children}</span>;
}

const HERO_CSS = `
  .a4-home-hero__stage { min-height: 100vh; min-height: 100svh; }
  /* The homepage <main> carries pt-24 / sm:pt-28 for the fixed nav. The design's
     hero starts under the transparent bar, so when it is the first section it
     pulls itself back up over that padding (keyed on the classes, so the rule
     goes inert if the padding is ever removed). */
  .a4-landing-page.pt-24 #main-content > .a4-home-hero:first-child { margin-top: -6rem; }
  @media (min-width: 40rem) {
    .a4-landing-page.sm\\:pt-28 #main-content > .a4-home-hero:first-child { margin-top: -7rem; }
  }
  .a4-home-hero .a4-chip { height: auto; min-height: 36px; padding: 7px 16px; line-height: 1.35; }
  .a4-home-hero__vacei { color: #FFFFFF; text-decoration: underline; text-decoration-color: rgba(139,143,247,.6); text-underline-offset: 4px; transition: text-decoration-color .3s; }
  .a4-home-hero__vacei:hover { text-decoration-color: #8B8FF7; }
`;

export function Hero({
  eyebrow = "Malta · Automation-First Accounting & Audit Firm",
}: {
  eyebrow?: string;
  /** Kept for compatibility with older callers; the design has one accent. */
  accent?: string;
} = {}) {
  // "Malta · …" reads like the design's "Quotation  Q-2026-0147": the first
  // part in periwinkle, the rest in zinc.
  const cut = eyebrow.indexOf(" · ");
  const eyebrowLead = cut > 0 ? eyebrow.slice(0, cut) : eyebrow;
  const eyebrowRest = cut > 0 ? eyebrow.slice(cut + 3) : "";

  return (
    <section
      id="top"
      data-hero=""
      className="a4-home-hero"
      style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", color: "#FFFFFF", background: DARK_GRID, fontFamily: SANS }}
    >
      <style>{HERO_CSS}</style>
      <DriftGlow left="28%" top="-30%" strength={0.28} />
      <div data-hero-par="" aria-hidden="true" style={{ position: "absolute", right: "-16vw", top: "16vh", width: "50vw", height: "96vh", pointerEvents: "none" }}>
        <div data-fx="slab" data-d="100" style={{ position: "absolute", inset: 0 }}>
          <Slab opacity={0.55} />
        </div>
      </div>

      {/* The stage is one viewport tall; the content centres in it above the
          scroll cue. When the content is taller than the viewport (short
          laptop screens), the cue simply follows it — no dead band. */}
      <div className="a4-home-hero__stage" style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column" }}>
        <div
          data-hero-exit=""
          style={{
            width: "100%",
            maxWidth: 1280,
            margin: "auto",
            padding: "clamp(104px,8vw,116px) clamp(20px,5vw,72px) 0",
            display: "flex",
            flexDirection: "column",
            gap: "clamp(20px,2.2vw,30px)",
          }}
        >
          <A4DrawnLockup id="home-hero" />

          <div
            data-fx="rise"
            data-d="950"
            style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "4px 14px", fontSize: "clamp(16px,1.5vw,22px)", fontWeight: 600, letterSpacing: ".02em", color: "#A1A1AA" }}
          >
            <span style={{ color: PERI }}>{eyebrowLead}</span>
            {eyebrowRest ? <span>{eyebrowRest}</span> : null}
          </div>

          <h1 style={{ margin: 0, fontSize: "clamp(46px,8.2vw,136px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.02 }}>
            <span className="sr-only">{`Simplify your ${HERO_FALLBACK} with A4.`}</span>
            <div aria-hidden="true">
              <TypeText segments={[{ t: "Simplify your", c: "#FFFFFF" }]} per={42} d={1150} />
              <div data-fx="rise" data-d="1800" data-dy="60" style={{ fontWeight: 600, paddingBottom: ".1em", marginBottom: "-.1em" }}>
                <TypeCycle words={HERO_WORDS} fallback={HERO_FALLBACK} />
              </div>
              <div data-fx="rise" data-d="1930" data-dy="60">
                with A4.
              </div>
            </div>
          </h1>

          <p
            data-fx="rise"
            data-d="2150"
            style={{ margin: 0, maxWidth: 900, fontSize: "clamp(18px,1.6vw,24px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.45, color: "#A1A1AA", textWrap: "pretty" }}
          >
            A licensed Malta accounting &amp; audit firm.{" "}
            <a href="https://vacei.com" target="_blank" rel="noopener noreferrer" className="a4-home-hero__vacei">
              Vacei
            </a>{" "}
            is the software we build and run —{" "}
            <strong style={{ color: "#FFFFFF", fontWeight: 500 }}>the machines do the volume, our accountants and auditors do the judgement</strong>, the
            risk and the call.
          </p>

          <div data-fx="rise" data-d="2300" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {/* The calculator (#pricing) lives further down this same page — the
                hero's job is to send people straight to it. */}
            <Button variant="primary" size="lg" href="#pricing">
              Get an instant quote <Icon name="arrow-right" size={18} color={INK} />
            </Button>
            <Button variant="outline-dark" size="lg" href="/contact">
              Request information
            </Button>
            <Button variant="outline-dark" size="lg" href="/contact">
              Book a consultation
            </Button>
          </div>

          <div data-fx="rise" data-d="2420" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            <span className="a4-chip a4-chip-dark">
              <span>
                Quotes within <W>24 hours</W>
              </span>
            </span>
            <span className="a4-chip a4-chip-dark">
              <span>
                Managed bookkeeping from <W>€{BOOKKEEPING_FROM}/mo</W> self-employed, from <W>€{BOOKKEEPING_COMPANY}/mo</W> company
              </span>
            </span>
            <span className="a4-chip a4-chip-dark">
              <span>
                <W>Free</W> accounting health check
              </span>
            </span>
          </div>
        </div>

        <div
          data-fx="rise"
          data-d="2800"
          aria-hidden="true"
          style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "clamp(20px,2.2vw,28px) 0 22px", pointerEvents: "none" }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: "#A1A1AA" }}>Scroll</span>
          <span style={{ position: "relative", width: 1, height: 40, overflow: "hidden", background: "rgba(255,255,255,.14)" }}>
            <span data-loop="" style={{ position: "absolute", left: 0, top: 0, width: 1, height: 40, background: PERI }} />
          </span>
        </div>
      </div>

      {/* Integrations — quiet, under the hero. */}
      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px,5vw,72px) clamp(36px,4vw,56px)" }}>
        <div
          data-fx="rise"
          data-d="2900"
          style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 30px", paddingTop: 26, borderTop: "1px solid rgba(255,255,255,.08)" }}
        >
          <span style={{ fontFamily: BODY, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#71717A" }}>We connect with</span>
          {["Sage", "QuickBooks", "Xero", "Revolut", "Stripe"].map((tool) => (
            <span key={tool} style={{ fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em", color: "#71717A" }}>
              {tool}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

const STATEMENT_TAIL = "requires more than filing accounts and meeting".split(" ");

/** The design's statement: a centred typewriter line, then a rising line with one gradient word. */
export function Statement() {
  return (
    <section
      style={{ position: "relative", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", background: LIGHT_GLOW, color: INK, fontFamily: SANS }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ margin: 0, fontSize: "clamp(36px,5vw,84px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.08 }}>
          <span className="sr-only">Running a business in Malta requires more than filing accounts and meeting deadlines.</span>
          <div aria-hidden="true">
            <TypeText segments={[{ t: "Running a business in Malta", c: INK }]} per={32} style={{ display: "inline-block", textWrap: "balance" }} />
            <Words
              d={960}
              stagger={60}
              style={{ fontWeight: 600, textWrap: "balance" }}
              parts={[...STATEMENT_TAIL.map((t) => ({ t })), { t: "deadlines.", g: true }]}
            />
          </div>
        </h2>
        <p
          data-fx="rise"
          data-d="250"
          style={{ margin: "clamp(36px,4vw,56px) auto 0", maxWidth: 780, fontSize: "clamp(18px,1.7vw,24px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.45, color: "#52525B", textWrap: "pretty" }}
        >
          One coordinated system that eliminates the complexity of multiple providers — and one dedicated team that understands your business end to end.
        </p>
        <div data-fx="rise" data-d="380" style={{ marginTop: 28, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
          {["Accounting", "Statutory audit", "Tax", "VAT", "Payroll", "Fractional CFO"].map((s) => (
            <span key={s} className="a4-chip a4-chip-light">
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

const BIG: React.CSSProperties = { fontSize: "clamp(56px,13.5vw,250px)", fontWeight: 600, letterSpacing: "-0.05em", lineHeight: 0.98 };

/** AI-native positioning — the design's big statement on dark (04 WHY A4). */
export function Manifesto() {
  return (
    <section
      style={{ position: "relative", overflow: "hidden", padding: "clamp(120px,16vw,220px) clamp(20px,5vw,72px)", color: "#FFFFFF", background: DARK_GRID, fontFamily: SANS }}
    >
      <DriftGlow left="40%" top="-10%" strength={0.24} />
      <SweepSlab />

      <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
        <div data-fx="big" style={{ ...BIG, paddingBottom: ".06em", ...gradText }}>
          Built
        </div>
        <div data-fx="big" data-d="150" style={{ ...BIG, color: "#FFFFFF" }}>
          AI-native
        </div>
        <h2
          data-fx="rise"
          data-d="650"
          style={{ margin: "44px auto 0", maxWidth: 1040, fontSize: "clamp(20px,2.4vw,40px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.3, color: "#A1A1AA", textWrap: "balance" }}
        >
          We&rsquo;re not adding AI to accounting. <span style={{ color: "#FFFFFF" }}>We rebuilt the firm around it.</span>
        </h2>
      </div>

      <div
        style={{
          position: "relative",
          maxWidth: 1280,
          margin: "clamp(110px,13vw,190px) auto 0",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          fontSize: "clamp(34px,5.4vw,96px)",
          fontWeight: 500,
          letterSpacing: "-0.035em",
          lineHeight: 1.06,
        }}
      >
        <Words stagger={100} parts={[{ t: "The machines do the" }, { t: "volume.", g: true, style: { fontWeight: 600 } }]} />
        <Words d={420} stagger={100} parts={[{ t: "Our people do the" }, { t: "judgement.", g: true, style: { fontWeight: 600 } }]} />
        <Words d={840} stagger={100} parts={[{ t: "Licensed humans" }, { t: "sign off.", g: true, style: { fontWeight: 600 } }]} />
      </div>

      <div
        style={{
          position: "relative",
          maxWidth: 1280,
          margin: "clamp(72px,8vw,112px) auto 0",
          paddingTop: "clamp(36px,4vw,52px)",
          borderTop: "1px solid rgba(255,255,255,.08)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
          gap: "24px 72px",
        }}
      >
        <p data-fx="rise" style={{ margin: 0, fontFamily: BODY, fontSize: 17, lineHeight: 1.65, color: "#A1A1AA", textWrap: "pretty" }}>
          Most of the industry bolts AI tools onto firms that still sell hours. A4 works the other way around — a licensed Maltese accounting and audit firm
          running on Vacei, the platform we built ourselves. The machines do the volume: collecting documents, coding transactions, reconciling, preparing the
          file. Our accountants and auditors do the judgement, the risk and the hard conversations.
        </p>
        <p data-fx="rise" data-d="120" style={{ margin: 0, fontFamily: BODY, fontSize: 17, lineHeight: 1.65, color: "#D4D4D8", textWrap: "pretty" }}>
          AI agents check every transaction in real time, and a licensed professional approves every figure before you see it.{" "}
          <strong style={{ color: "#FFFFFF", fontWeight: 600 }}>Faster closes, deeper assurance, no year-end surprises</strong> — at a fixed fee.
        </p>
      </div>
    </section>
  );
}
