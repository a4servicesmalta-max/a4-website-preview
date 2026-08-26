// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Logo, Button, Pill, Badge, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
import { TrustBar } from "./HomeConversionSections";
import { useReduceMotion } from "@/contexts/ReduceMotionContext";
// Bookkeeping figures come from the quote pack. Under mt-2026-08-14-volume they
// are the ENTRY band of nine, priced by monthly expenses — always shown as "from".
import { BOOKKEEPING_COMPANY, BOOKKEEPING_FROM } from "@/data/a4QuotePack";

/** Typewriter cycle for the hero — types/deletes each word with a caret. Static under reduced motion. */
function TypeCycle({ words, fallback }: { words: string[]; fallback: string }) {
  const reduceMotion = useReduceMotion();
  const [text, setText] = useState(words[0]);
  const stateRef = useRef({ word: 0, len: words[0].length, deleting: false });

  useEffect(() => {
    if (reduceMotion) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const s = stateRef.current;
      const current = words[s.word];
      if (!s.deleting) {
        s.len += 1;
        setText(current.slice(0, s.len));
        if (s.len >= current.length) {
          s.deleting = true;
          timer = setTimeout(tick, 2400); // hold the full word
          return;
        }
        timer = setTimeout(tick, 70);
      } else {
        s.len -= 1;
        setText(current.slice(0, s.len));
        if (s.len <= 0) {
          s.deleting = false;
          s.word = (s.word + 1) % words.length;
          timer = setTimeout(tick, 350);
          return;
        }
        timer = setTimeout(tick, 38);
      }
    };
    timer = setTimeout(tick, 1400);
    return () => clearTimeout(timer);
  }, [reduceMotion, words]);

  if (reduceMotion) return <span>{fallback}</span>;
  return (
    <span aria-label={fallback} style={{ whiteSpace: "nowrap" }}>
      <span aria-hidden="true">{text}</span>
      <span
        aria-hidden="true"
        className="hero-caret"
        style={{ display: "inline-block", width: "0.06em", minWidth: 2, height: "0.92em", background: "var(--a4-primary-bright)", marginLeft: "0.08em", verticalAlign: "-0.08em" }}
      />
    </span>
  );
}

// export function Nav({ accent }: { accent: string }) { ... } — using site-wide Navbar from layout

export function Hero({ eyebrow = "Malta · Automation-First Accounting & Audit Firm", accent = "#494fdf" }) {
  const InlineTile = ({ icon, rot, color = "var(--a4-primary-bright)", bg = "var(--a4-surface-elevated)", delay = 0 }: { icon: string, rot: number, color?: string, bg?: string, delay?: number }) => (
    <span className="hero-tile" style={{ display: "inline-block", verticalAlign: "middle", margin: "0 .12em", animationDelay: delay + "s" }}>
      <span style={{ display: "grid", placeItems: "center", width: "clamp(44px,5.4vw,74px)", height: "clamp(44px,5.4vw,74px)", borderRadius: "clamp(12px,1.5vw,20px)", background: bg, border: "1px solid var(--a4-hairline-dark)", transform: `rotate(${rot}deg)`, boxShadow: "0 16px 38px -12px rgba(0,0,0,.75)" }}>
        <Icon name={icon} size={28} color={color} stroke={1.9} />
      </span>
    </span>
  );
  const SideTile = ({ icon, color, style, rot, delay = 0 }) => (
    <span aria-hidden="true" className="hero-tile" style={{ position: "absolute", animationDelay: delay + "s", pointerEvents: "none", ...style }}>
      <span style={{ display: "grid", placeItems: "center", width: "clamp(92px,12vw,168px)", height: "clamp(92px,12vw,168px)", borderRadius: "clamp(22px,3vw,38px)", background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", transform: `rotate(${rot}deg)`, boxShadow: "0 30px 70px -20px rgba(0,0,0,.85)" }}>
        <Icon name={icon} size={54} color={color} stroke={1.5} />
      </span>
    </span>
  );

  return (
    <section id="top" style={{ background: "#000", padding: "clamp(60px,9vw,124px) 0 clamp(64px,9vw,118px)", position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" className="hero-bg" />
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(60% 50% at 50% 36%, rgba(73,79,223,.10), transparent 62%)" }} />

      <Container style={{ position: "relative", textAlign: "center", maxWidth: 1000 }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <span style={{ width: 28, height: 1, background: "var(--a4-hairline-strong)" }} />
            <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--a4-on-dark-mute)" }}>{eyebrow}</span>
            <span style={{ width: 28, height: 1, background: "var(--a4-hairline-strong)" }} />
          </div>
          <h1 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "#fff", fontSize: "clamp(38px,6.2vw,82px)", lineHeight: 1.18, letterSpacing: "-.03em", margin: "24px auto 0", maxWidth: 920, textWrap: "balance" }}>
            Simplify your{" "}
            <TypeCycle
              words={["accounting", "statutory audit", "VAT returns", "payroll", "tax compliance"]}
              fallback="accounting & audit"
            />
            <br />with <span style={{ color: "var(--a4-primary-bright)" }}>A4</span>.
          </h1>
          <p style={{ fontFamily: "var(--a4-font-body)", color: "var(--a4-on-dark-mute)", fontSize: "clamp(16px,1.7vw,20px)", lineHeight: 1.6, maxWidth: 560, margin: "26px auto 0", textWrap: "pretty" }}>
            A licensed Malta accounting &amp; audit firm. <a href="https://vacei.com" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", textDecoration: "underline", textUnderlineOffset: 3 }}>Vacei</a> is the software we build and run — it does the heavy lifting while our team keeps you compliant, organised and in control.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 34, flexWrap: "wrap", justifyContent: "center" }}>
            <Button variant="primary" size="lg" href="/contact">Request information <Icon name="arrow-right" size={18} color="#000" /></Button>
            <Button variant="outline-dark" size="lg" href="/contact">Book a consultation</Button>
          </div>
          <div style={{ display: "flex", gap: "6px 22px", marginTop: 22, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
            {["Quotes within 24 hours", `Managed bookkeeping from €${BOOKKEEPING_FROM}/mo self-employed, from €${BOOKKEEPING_COMPANY}/mo company`, "Free accounting health check"].map((fact, i) => (
              <span key={fact} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 500, color: "var(--a4-on-dark-mute)" }}>
                <Icon name="check" size={14} color="var(--a4-primary-bright)" stroke={2.5} />
                {fact}
              </span>
            ))}
          </div>
          <TrustBar />
        </Reveal>
      </Container>

      <Container style={{ position: "relative", marginTop: "clamp(52px,7vw,88px)" }}>
        <div style={{ borderTop: "1px solid var(--a4-hairline-dark)", paddingTop: "clamp(28px,4vw,40px)", display: "flex", alignItems: "center", justifyContent: "center", gap: "14px 40px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--a4-stone)" }}>We connect with</span>
          {["Sage", "QuickBooks", "Xero", "Revolut", "Stripe"].map((tool) => (
            <span key={tool} style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "var(--a4-on-dark-mute)", letterSpacing: "-.3px" }}>{tool}</span>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function Statement() {
  return (
    <section style={{ background: "#000", padding: "0 0 clamp(64px,9vw,120px)" }}>
      <Container>
        <div style={{ borderTop: "1px solid var(--a4-hairline-dark)", paddingTop: "clamp(48px,7vw,88px)", display: "flex", gap: 56, flexWrap: "wrap", alignItems: "flex-start" }}>
          <Reveal style={{ flex: "1 1 520px", minWidth: 300 }}>
            <h2 style={{
              fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "#fff",
              fontSize: "clamp(30px, 3.8vw, 50px)", lineHeight: 1.12,
              letterSpacing: "-0.02em", margin: 0, textWrap: "balance",
            }}>Running a business in Malta requires more than filing accounts and meeting deadlines.</h2>
          </Reveal>
          <Reveal delay={120} style={{ flex: "1 1 320px", minWidth: 280, paddingTop: 8 }}>
            <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 20, lineHeight: 1.6, color: "var(--a4-on-dark-mute)", margin: 0, textWrap: "pretty" }}>
              One coordinated system that eliminates the complexity of multiple providers — and one dedicated team that understands your business end to end.
            </p>
            <div style={{ marginTop: 26, display: "flex", flexWrap: "wrap", gap: 10 }}>
              {["Accounting", "Statutory audit", "Tax", "VAT", "Payroll", "Fractional CFO"].map((s) => (
                <span key={s} style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 500, color: "var(--a4-on-dark)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-full)", padding: "7px 15px" }}>{s}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
