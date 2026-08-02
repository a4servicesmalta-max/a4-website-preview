"use client";

import React, { useEffect, useRef, useState } from "react";

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
      if (cardRef.current) cardRef.current.style.borderRadius = `${(24 - 14 * eased).toFixed(1)}px`;
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
    <div ref={stageRef} className="av-stage" style={{ background: "#000" }}>
      <div className="av-sticky">
        <div ref={mediaRef} className="av-media">
          <div
            ref={cardRef}
            onClick={toggle}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } }}
            role="button"
            tabIndex={0}
            aria-label={playing ? "Pause the A4 intro video" : `${label} — play the A4 intro video with sound`}
            style={{ position: "relative", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(255,255,255,.16)", boxShadow: "0 40px 110px rgba(0,0,0,.55)", cursor: "pointer", background: "#0A0A0A" }}
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
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 52, padding: "0 26px", borderRadius: "var(--a4-r-full)", background: "rgba(16,19,15,.74)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", color: "#fff", fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, boxShadow: "0 12px 34px rgba(0,0,0,.35)" }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="#fff" aria-hidden="true"><path d="M4.5 2.8v10.4L13 8z" /></svg>
                  {label}
                </span>
              </div>
            ) : (
              <div style={{ position: "absolute", right: 16, bottom: 16, display: "inline-flex", alignItems: "center", gap: 8, height: 36, padding: "0 16px", borderRadius: "var(--a4-r-full)", background: "rgba(16,19,15,.74)", color: "#fff", fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 600, pointerEvents: "none" }}>
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M5.5 3.5v9M10.5 3.5v9" /></svg>
                Click to pause
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
