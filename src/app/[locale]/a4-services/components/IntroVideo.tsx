// @ts-nocheck
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Container, Eyebrow, Reveal } from "@/components/a4-landing/Primitives";
import { usePrefersReducedMotion } from "@/contexts/ReduceMotionContext";

const VIDEO_SRC = "/assets/videos/a4-advantages.mp4";
const POSTER_SRC = "/assets/videos/a4-advantages-poster.jpg";

/**
 * Scroll-expanding "Play intro" hero video — the antigravity.google /
 * fs.vacei.com pattern. A near-black card scales 0.9→1.0 while the inner
 * video wrapper widens 58%→100% as the card passes through the viewport.
 * The muted, looped preview autoplays (gated by an IntersectionObserver);
 * a "Play intro" pill follows the cursor; clicking opens a lightbox with the
 * same video unmuted, time-synced and with native controls.
 */
export function IntroVideo() {
  // Real prefers-reduced-motion only (see TypeCycle) — the scroll-zoom is a
  // cheap rAF transform and should run on phones and Safari too.
  const reduceMotion = usePrefersReducedMotion();
  const cardRef = useRef(null);
  const innerRef = useRef(null);
  const videoRef = useRef(null);
  const cursorRef = useRef(null);
  const lightboxVideoRef = useRef(null);
  const [open, setOpen] = useState(false);

  const easeInOutQuad = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

  // ---- Scroll-driven scale (0.9→1.0) + inner width (58%→100%) ----
  useEffect(() => {
    const card = cardRef.current;
    const inner = innerRef.current;
    if (!card || !inner) return;

    if (reduceMotion) {
      card.style.transform = "scale(1)";
      inner.style.width = "100%";
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = card.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height * 0.6)));
      const ease = easeInOutQuad(p);
      card.style.transform = `scale(${0.9 + 0.1 * Math.min(1, ease * 1.4)})`;
      inner.style.width = `${58 + 42 * ease}%`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  // ---- Autoplay muted preview, gated by visibility ----
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true; // ensure muted so autoplay is allowed
    const io = new IntersectionObserver(
      (ents) => {
        ents.forEach((e) => {
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        });
      },
      { threshold: 0.35 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  // ---- "Play intro" pill follows the cursor (lerp) ----
  useEffect(() => {
    if (reduceMotion) return;
    const card = cardRef.current;
    const cursor = cursorRef.current;
    if (!card || !cursor) return;

    let raf = 0;
    let px = card.clientWidth / 2;
    let py = card.clientHeight / 2;
    let tx = px;
    let ty = py;
    let hovering = false;

    const onMove = (e) => {
      const r = card.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      hovering = true;
    };
    const onLeave = () => {
      const r = card.getBoundingClientRect();
      tx = r.width / 2;
      ty = r.height / 2;
      hovering = false;
    };
    const loop = () => {
      px += (tx - px) * 0.16;
      py += (ty - py) * 0.16;
      cursor.style.left = `${px}px`;
      cursor.style.top = `${py}px`;
      cursor.style.opacity = hovering ? "1" : "0.92";
      raf = requestAnimationFrame(loop);
    };
    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  // ---- Open lightbox: unmute a second video, sync time, play with sound ----
  const openLightbox = useCallback(() => {
    setOpen(true);
    const lv = lightboxVideoRef.current;
    const preview = videoRef.current;
    if (lv) {
      lv.muted = false;
      lv.currentTime = preview?.currentTime || 0;
      lv.play().catch(() => {});
    }
  }, []);

  const closeLightbox = useCallback(() => {
    const lv = lightboxVideoRef.current;
    if (lv) lv.pause();
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    // focus the lightbox video for immediate controls access
    lightboxVideoRef.current?.focus?.();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeLightbox]);

  return (
    <section style={{ background: "#000", padding: "clamp(20px,4vw,56px) clamp(16px,4vw,44px) clamp(56px,8vw,110px)" }}>
      <Container style={{ maxWidth: 1360, padding: 0 }}>
        <Reveal style={{ textAlign: "center", marginBottom: "clamp(24px,4vw,44px)" }}>
          <Eyebrow dark>See A4 in action</Eyebrow>
          <h2
            style={{
              fontFamily: "var(--a4-font-display)",
              fontWeight: 500,
              color: "#fff",
              fontSize: "clamp(28px,4vw,48px)",
              lineHeight: 1.1,
              letterSpacing: "-.02em",
              margin: "14px auto 0",
              maxWidth: 640,
              textWrap: "balance",
            }}
          >
            The A4 advantage, in two minutes.
          </h2>
        </Reveal>

        {/* The scaling card */}
        <div
          ref={cardRef}
          onClick={openLightbox}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openLightbox();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Play the A4 intro video with sound"
          style={{
            maxWidth: 1360,
            margin: "0 auto",
            background: "#050505",
            borderRadius: "clamp(20px,3vw,44px)",
            overflow: "hidden",
            cursor: reduceMotion ? "pointer" : "none",
            transform: "scale(0.9)",
            transformOrigin: "center",
            willChange: "transform",
            position: "relative",
            outline: "none",
          }}
        >
          <div
            style={{
              padding: "clamp(28px,5vw,72px) clamp(16px,4vw,56px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div ref={innerRef} style={{ width: "58%", minWidth: 300, maxWidth: "100%", willChange: "width" }}>
              <video
                ref={videoRef}
                src={VIDEO_SRC}
                poster={POSTER_SRC}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
                style={{
                  width: "100%",
                  aspectRatio: "16 / 9",
                  objectFit: "cover",
                  borderRadius: 16,
                  background: "#0B0B0D",
                  display: "block",
                  boxShadow: "0 40px 120px -40px rgba(0,0,0,0.9)",
                }}
              />
            </div>
          </div>

          {/* Play-intro cursor pill */}
          <div
            ref={cursorRef}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              pointerEvents: "none",
              zIndex: 5,
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              background: "#fff",
              color: "#1F1F1F",
              borderRadius: 999,
              padding: "clamp(12px,1.4vw,17px) clamp(20px,2.4vw,32px)",
              fontFamily: "var(--a4-font-body)",
              fontSize: "clamp(14px,1.2vw,18px)",
              fontWeight: 500,
              boxShadow: "0 18px 50px -12px rgba(0,0,0,0.6)",
              whiteSpace: "nowrap",
              willChange: "left,top",
              transition: "opacity .25s ease",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#1F1F1F" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
            Play intro
          </div>
        </div>
      </Container>

      {/* Lightbox modal — full video with sound + controls */}
      {open && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(5,5,5,0.94)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(16px,4vw,48px)",
          }}
        >
          <button
            onClick={closeLightbox}
            aria-label="Close video"
            style={{
              position: "absolute",
              top: "clamp(14px,3vw,28px)",
              right: "clamp(14px,3vw,28px)",
              width: 44,
              height: 44,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,.2)",
              background: "rgba(255,255,255,.08)",
              color: "#fff",
              fontSize: 20,
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            ✕
          </button>
          <video
            ref={lightboxVideoRef}
            src={VIDEO_SRC}
            controls
            playsInline
            style={{
              width: "100%",
              maxWidth: 1200,
              maxHeight: "86vh",
              aspectRatio: "16 / 9",
              borderRadius: 14,
              background: "#000",
              boxShadow: "0 60px 160px -40px rgba(0,0,0,0.9)",
            }}
          />
        </div>
      )}
    </section>
  );
}
