"use client";

import React, { useEffect, useRef, useState } from "react";
import { DARK_GRID, DriftGlow } from "@/components/fx/primitives";

// A4's homepage intro video (see a4-services/components/IntroVideo.tsx),
// presented with the scroll-grown stage from the A4 Audit / Accounting designs.
const VIDEO_SRC = "/assets/videos/a4-advantages.mp4";
const POSTER_SRC = "/assets/videos/a4-advantages-poster.jpg";

/**
 * Sticky stage: the card scales 0.7 → 1.0 and its corners square off as the
 * page scrolls through it, then clicking plays it with sound. Below 900px and
 * under prefers-reduced-motion the stage collapses to a plain card (see `.av-*`
 * in styles.css) and the transform below is a no-op.
 */
export function ScrollVideo({ label = "See how it runs" }: { label?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const stage = stageRef.current;
      const media = mediaRef.current;
      if (!stage || !media) return;
      const total = stage.offsetHeight - window.innerHeight;
      if (total <= 0) return; // stage collapsed — CSS holds the card at scale 1
      const p = Math.min(1, Math.max(0, -stage.getBoundingClientRect().top / total));
      const eased = 1 - Math.pow(1 - p, 3);
      media.style.transform = `scale(${(0.7 + 0.3 * eased).toFixed(4)})`;
      if (cardRef.current) cardRef.current.style.borderRadius = `${(28 - 18 * eased).toFixed(1)}px`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.muted = false;
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <div ref={stageRef} className="av-stage" style={{ position: "relative", background: DARK_GRID }}>
      <div className="av-sticky">
        <DriftGlow left="20%" top="-25%" strength={0.22} />
        <div ref={mediaRef} className="av-media">
          <div
            ref={cardRef}
            onClick={toggle}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } }}
            role="button"
            tabIndex={0}
            aria-label={playing ? "Pause the A4 intro video" : `${label} — play the A4 intro video with sound`}
            className="sv-card"
            style={{ position: "relative", borderRadius: 28, overflow: "hidden", border: "1px solid rgba(255,255,255,.14)", boxShadow: "0 50px 120px rgba(0,0,0,.55)", cursor: "pointer", background: "#09090B" }}
          >
            <video
              ref={videoRef}
              src={VIDEO_SRC}
              poster={POSTER_SRC}
              preload="none"
              playsInline
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              style={{ display: "block", width: "100%", aspectRatio: "16 / 9", objectFit: "cover" }}
            />
            {!playing ? (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 12, height: 58, padding: "0 28px 0 9px", borderRadius: 999, background: "rgba(9,9,11,.72)", border: "1px solid rgba(255,255,255,.22)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", color: "#fff", fontFamily: "var(--a4x-display)", fontSize: 17, fontWeight: 600, boxShadow: "0 24px 60px rgba(9,9,11,.35)" }}>
                  <span aria-hidden="true" style={{ width: 40, height: 40, borderRadius: 999, background: "#FFFFFF", display: "grid", placeItems: "center" }}>
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="#09090B" aria-hidden="true" style={{ marginLeft: 2 }}><path d="M4.5 2.8v10.4L13 8z" /></svg>
                  </span>
                  {label}
                </span>
              </div>
            ) : (
              <div style={{ position: "absolute", right: 16, bottom: 16, display: "inline-flex", alignItems: "center", gap: 8, height: 36, padding: "0 16px", borderRadius: 999, background: "rgba(9,9,11,.72)", border: "1px solid rgba(255,255,255,.18)", color: "#fff", fontFamily: "var(--a4x-display)", fontSize: 13, fontWeight: 600, pointerEvents: "none" }}>
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M5.5 3.5v9M10.5 3.5v9" /></svg>
                Click to pause
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`.sv-card:focus-visible { outline: 3px solid rgba(79,85,241,.55); outline-offset: 4px; }`}</style>
    </div>
  );
}
