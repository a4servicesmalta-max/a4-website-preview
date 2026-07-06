// @ts-nocheck
"use client";

import React, { useEffect, useRef } from "react";
import { Button, Container, Icon, Reveal } from "@/components/a4-landing/Primitives";
import { CLIENT_ONBOARDING_URL } from "@/lib/external-links";
import { useReduceMotion } from "@/contexts/ReduceMotionContext";

/**
 * Full-width ambient motion band: Higgsfield-generated loop drifting behind a
 * registration push, with a gentle scroll parallax. Static under reduced motion.
 */
export function MotionBand() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
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
    <section ref={sectionRef} style={{ position: "relative", overflow: "hidden", background: "#000" }}>
      {!reduceMotion && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 0.55, transform: "scale(1.12)", willChange: "transform" }}
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
      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 90% at 50% 50%, rgba(0,0,0,.25), rgba(0,0,0,.78))" }}
      />
      <Container style={{ position: "relative", padding: "clamp(72px,10vw,128px) 0", textAlign: "center" }}>
        <Reveal>
          <span
            style={{
              fontFamily: "var(--a4-font-body)",
              fontSize: 12.5,
              fontWeight: 600,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: "var(--a4-on-dark-mute)",
            }}
          >
            Your numbers, always in motion
          </span>
          <h2
            style={{
              fontFamily: "var(--a4-font-display)",
              fontWeight: 500,
              color: "#fff",
              fontSize: "clamp(30px,4.4vw,54px)",
              lineHeight: 1.1,
              letterSpacing: "-.02em",
              margin: "18px auto 0",
              maxWidth: 760,
              textWrap: "balance",
            }}
          >
            Join the portal where your accounting runs itself.
          </h2>
          <p
            style={{
              fontFamily: "var(--a4-font-body)",
              fontSize: "clamp(15px,1.6vw,18px)",
              lineHeight: 1.6,
              color: "var(--a4-on-dark-mute)",
              maxWidth: 560,
              margin: "16px auto 0",
              textWrap: "pretty",
            }}
          >
            Registration takes minutes. Connect your data, see your deadlines, and let our licensed team and automation keep you compliant.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap", justifyContent: "center" }}>
            <Button variant="primary" size="lg" href={CLIENT_ONBOARDING_URL} target="_blank" rel="noopener noreferrer">
              Create your account <Icon name="arrow-right" size={18} color="#000" />
            </Button>
            <Button variant="outline-dark" size="lg" href="/quote">
              Get an instant quote
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
