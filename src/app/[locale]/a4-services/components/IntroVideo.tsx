"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Eyebrow } from "@/components/a4-landing/Primitives";
import { DARK_CARD, DARK_GRID, DriftGlow, TypeText, Words } from "@/components/fx/primitives";
import { INK, PERI } from "@/lib/fx/engine";
import { usePrefersReducedMotion } from "@/contexts/ReduceMotionContext";

const VIDEO_SRC = "/assets/videos/a4-advantages.mp4";
const POSTER_SRC = "/assets/videos/a4-advantages-poster.jpg";

/**
 * Scroll-expanding "Play intro" video, in the A4 design language: a dark
 * section (grid + drifting indigo glow), the statement heading, and the video
 * on a dark grid card that scales 0.9→1.0 while the inner video widens
 * 58%→100% as the card passes through the viewport. The muted, looped preview
 * autoplays (gated by an IntersectionObserver); a white "Play intro" pill
 * follows the cursor; clicking opens a lightbox with the same video unmuted,
 * time-synced and with native controls.
 */
export function IntroVideo() {
  // Real prefers-reduced-motion only — the scroll-zoom is a cheap rAF
  // transform and should run on phones and Safari too.
  const reduceMotion = usePrefersReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const lightboxVideoRef = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);

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

    const easeInOutQuad = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
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

    const onMove = (e: MouseEvent) => {
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
      cursor.style.opacity = hovering ? "1" : "0.94";
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

  // ---- Open lightbox: a second video, unmuted and synced to the preview ----
  const openLightbox = useCallback(() => setOpen(true), []);

  const closeLightbox = useCallback(() => {
    const lv = lightboxVideoRef.current;
    if (lv) lv.pause();
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    // The lightbox video only exists once it has rendered, so sync and start
    // it here (still inside the click's user activation).
    const lv = lightboxVideoRef.current;
    if (lv) {
      lv.muted = false;
      lv.currentTime = videoRef.current?.currentTime || 0;
      lv.play().catch(() => {});
      lv.focus();
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeLightbox]);

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "clamp(100px,13vw,180px) clamp(16px,4vw,44px) clamp(100px,12vw,170px)",
        color: "#FFFFFF",
        background: DARK_GRID,
        fontFamily: "var(--a4x-display)",
      }}
    >
      <DriftGlow left="-12%" top="-24%" strength={0.24} />

      <div style={{ position: "relative", maxWidth: 1360, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "clamp(40px,5vw,72px)", padding: "0 clamp(4px,1vw,28px)" }}>
          <div data-fx="rise" style={{ display: "flex", justifyContent: "center" }}>
            <Eyebrow dark>See A4 in action</Eyebrow>
          </div>
          <h2 style={{ margin: "18px 0 0", fontSize: "clamp(40px,6.4vw,112px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.08 }}>
            <span className="sr-only">The A4 advantage, in two minutes.</span>
            <div aria-hidden="true">
              <TypeText segments={[{ t: "The A4 advantage,", c: "#FFFFFF" }]} per={42} caret={PERI} style={{ display: "inline-block" }} />
              <Words d={820} style={{ fontWeight: 600 }} parts={[{ t: "in two" }, { t: "minutes.", g: true }]} />
            </div>
          </h2>
        </div>

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
          className="a4-intro-card"
          style={{
            maxWidth: 1360,
            margin: "0 auto",
            background: DARK_CARD,
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 28,
            boxShadow: "0 50px 120px rgba(0,0,0,.45)",
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
              padding: "clamp(24px,5vw,72px) clamp(14px,4vw,56px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div ref={innerRef} style={{ width: "58%", minWidth: 280, maxWidth: "100%", willChange: "width" }}>
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
                  borderRadius: 18,
                  background: INK,
                  display: "block",
                  border: "1px solid rgba(255,255,255,.08)",
                  boxShadow: "0 40px 100px rgba(0,0,0,.5)",
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
              height: "clamp(48px,4vw,58px)",
              padding: "0 clamp(20px,2.2vw,30px) 0 clamp(16px,1.8vw,24px)",
              borderRadius: 999,
              background: "#FFFFFF",
              color: INK,
              fontSize: "clamp(15px,1.25vw,18px)",
              fontWeight: 600,
              boxShadow: "0 24px 60px rgba(9,9,11,.45)",
              whiteSpace: "nowrap",
              willChange: "left,top",
              transition: "opacity .25s ease",
            }}
          >
            <span style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 15, background: INK }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true" style={{ marginLeft: 2 }}>
                <path d="M7 4.5v15l12.5-7.5z" />
              </svg>
            </span>
            Play intro
          </div>
        </div>
      </div>

      {/* Lightbox modal — full video with sound + controls */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="A4 intro video"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(9,9,11,.94)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
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
              width: 48,
              height: 48,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,.22)",
              background: "rgba(255,255,255,.06)",
              color: "#FFFFFF",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
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
              borderRadius: 18,
              background: INK,
              border: "1px solid rgba(255,255,255,.1)",
              boxShadow: "0 50px 120px rgba(0,0,0,.6)",
            }}
          />
        </div>
      )}
      <style>{`.a4-intro-card:focus-visible { box-shadow: 0 0 0 3px rgba(79,85,241,.55), 0 50px 120px rgba(0,0,0,.45) !important; }`}</style>
    </section>
  );
}
