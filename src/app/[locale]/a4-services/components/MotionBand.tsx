"use client";

import React, { useEffect, useRef } from "react";
import { Button, Container, Eyebrow, Icon } from "@/components/a4-landing/Primitives";
import { DriftGlow, SweepSlab, TypeText, Words } from "@/components/fx/primitives";
import { useReduceMotion } from "@/contexts/ReduceMotionContext";

const PERI = "#8B8FF7";

/**
 * Full-width ambient motion band: Higgsfield-generated loop drifting behind a
 * registration push, with a gentle scroll parallax. Static under reduced motion.
 * In the A4 design language it is the big statement on dark — the 64px grid
 * over the film, the drifting glow, the sweeping slab and a typewriter line.
 */
export function MotionBand() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = section.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        // -1 (below viewport) .. 1 (above viewport)
        const progress = Math.max(-1, Math.min(1, 1 - (r.top + r.height / 2) / (vh / 2 + r.height / 2)));
        video.style.transform = `translateY(${progress * 36}px) scale(1.12)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  return (
    <section ref={sectionRef} data-sec="motion-band" style={{ position: "relative", overflow: "hidden", background: "#09090B", color: "#FFFFFF" }}>
      {!reduceMotion && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 0.5, transform: "scale(1.12)", willChange: "transform" }}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src="/assets/videos/ambient-motion-loop.mp4" type="video/mp4" />
        </video>
      )}
      {/* the design's dark grid laid over the film, then a vignette back to ink */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px) 0 0 / 64px 64px, linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px) 0 0 / 64px 64px, radial-gradient(70% 90% at 50% 50%, rgba(9,9,11,.2), rgba(9,9,11,.82))",
        }}
      />
      <DriftGlow left="30%" top="-40%" strength={0.24} />
      <SweepSlab />
      <Container style={{ position: "relative", padding: "clamp(120px,15vw,210px) 0", textAlign: "center" }}>
        <div data-fx="rise" style={{ display: "flex", justifyContent: "center" }}>
          <Eyebrow dark>Your numbers, always in motion</Eyebrow>
        </div>
        <h2 style={{ margin: "22px auto 0", maxWidth: 1180, fontFamily: "var(--a4x-display)", fontSize: "clamp(38px,5.6vw,96px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.06, color: "#FFFFFF" }}>
          <span className="sr-only">Join the portal where your accounting runs itself.</span>
          <span aria-hidden="true" style={{ display: "block" }}>
            <TypeText as="span" segments={[{ t: "Join the portal where", c: "#FFFFFF" }]} per={36} caret={PERI} style={{ display: "inline-block" }} />
            <Words as="span" d={860} stagger={100} style={{ display: "block", fontWeight: 600 }} parts={[{ t: "your accounting" }, { t: "runs itself.", g: true }]} />
          </span>
        </h2>
        <p data-fx="rise" data-d="700" style={{ margin: "28px auto 0", maxWidth: 640, fontFamily: "var(--a4x-display)", fontSize: "clamp(18px,1.6vw,22px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.45, color: "#A1A1AA", textWrap: "pretty" }}>
          Registration takes minutes. Connect your data, see your deadlines, and let our licensed team and automation keep you compliant.
        </p>
        <div data-fx="rise" data-d="820" style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap", justifyContent: "center" }}>
          <Button variant="primary" size="lg" href="/contact">
            Request information <Icon name="arrow-right" size={18} color="#09090B" />
          </Button>
          <Button variant="outline-dark" size="lg" href="/quote">
            Get an instant quote
          </Button>
        </div>
      </Container>
    </section>
  );
}
