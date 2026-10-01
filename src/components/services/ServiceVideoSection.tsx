"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useLazyMedia } from "@/hooks/use-lazy-media";

interface ServiceVideoSectionProps {
  title: string;
  videoUrl?: string;
}

const FALLBACK_URL = "/assets/videos/Main Render.gif";

/** Service video panel in the A4 style: ink frame (radius 28), kicker + Outfit title over an ink fade. */
const ServiceVideoSection: React.FC<ServiceVideoSectionProps> = ({ title, videoUrl }) => {
  const { t } = useTranslation("services");
  // The URL that failed; a new `videoUrl` gets a fresh try without resetting state in an effect.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const sourceFailed = !!videoUrl && failedUrl === videoUrl;
  const setSourceFailed = (failed: boolean) => setFailedUrl(failed ? videoUrl ?? null : null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const effectiveVideoUrl = videoUrl && !sourceFailed ? videoUrl : FALLBACK_URL;
  const isGif = effectiveVideoUrl.toLowerCase().endsWith(".gif");
  const { ref: lazyRef, shouldLoad } = useLazyMedia();

  useEffect(() => {
    if (!shouldLoad || isGif) return;
    videoRef.current?.load();
  }, [shouldLoad, isGif]);

  return (
    <section style={{ padding: "24px clamp(20px,5vw,72px) 8px" }}>
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        <div
          ref={lazyRef}
          data-fx="rise"
          style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", borderRadius: 28, overflow: "hidden", background: "#09090B", border: "1px solid rgba(255,255,255,.06)", boxShadow: "0 50px 120px rgba(9,9,11,.18)" }}
        >
          {effectiveVideoUrl ? (
            <>
              {isGif ? (
                <Image
                  src={effectiveVideoUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  loading="lazy"
                  decoding="async"
                  unoptimized
                  onError={() => setSourceFailed(true)}
                />
              ) : (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  src={shouldLoad ? effectiveVideoUrl : undefined}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="none"
                  onError={() => setSourceFailed(true)}
                />
              )}

              <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(to top, rgba(9,9,11,.72), rgba(9,9,11,.12) 45%, rgba(9,9,11,0))" }} />

              <div style={{ position: "absolute", left: 24, bottom: 22, zIndex: 1, maxWidth: "70%" }}>
                <p style={{ margin: "0 0 6px", fontFamily: "var(--a4x-body)", fontSize: 12, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#A1A1AA" }}>{t("shared.videoLabel")}</p>
                <h2 style={{ margin: 0, fontFamily: "var(--a4x-display)", fontSize: "clamp(20px,2vw,26px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.2, color: "#FFFFFF" }}>{title}</h2>
              </div>
            </>
          ) : (
            <div style={{ position: "relative", width: "100%", height: "100%", border: "1px dashed rgba(255,255,255,.2)", background: "#18181B", display: "grid", placeItems: "center" }}>
              <p style={{ fontFamily: "var(--a4x-body)", fontSize: 14, color: "#A1A1AA", textAlign: "center", padding: "0 24px" }}>{t("shared.videoPlaceholder")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServiceVideoSection;
