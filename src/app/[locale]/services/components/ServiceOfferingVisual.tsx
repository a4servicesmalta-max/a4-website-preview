"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLazyMedia } from "@/hooks/use-lazy-media";
import {
  getServiceVisual,
  isVideoAsset,
  SERVICE_VISUAL_FALLBACK,
} from "@/data/a4ServiceVisuals";
import type { ServiceKey } from "@/data/a4ServicesSiteData";
import { A4Mark } from "@/components/fx/primitives";

/**
 * The service's motion visual, framed as a portal window — the same chrome as
 * the design's portal tour (three dots, a centred title pill, hairline border,
 * the long soft shadow).
 */
export function ServiceOfferingVisual({
  serviceKey,
  title,
}: {
  serviceKey: ServiceKey;
  title: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref: lazyRef, shouldLoad } = useLazyMedia();

  const primaryUrl = getServiceVisual(serviceKey);
  // The failure belongs to the URL that failed, so a new service starts clean
  // without an effect resetting it.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const sourceFailed = failedUrl != null && failedUrl === primaryUrl;
  const assetUrl =
    sourceFailed || !primaryUrl ? SERVICE_VISUAL_FALLBACK : primaryUrl;
  const isVideo = isVideoAsset(assetUrl);
  const setSourceFailed = () => setFailedUrl(primaryUrl);

  useEffect(() => {
    if (!shouldLoad || !isVideo) return;
    videoRef.current?.load();
  }, [shouldLoad, isVideo, assetUrl]);

  return (
    <div
      ref={lazyRef}
      style={{
        position: "relative",
        width: "100%",
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid #E4E4E7",
        background: "#FAFAFA",
        boxShadow: "0 50px 120px rgba(9,9,11,.16)",
      }}
    >
      <div
        style={{
          position: "relative",
          height: 38,
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "0 16px",
          background: "#FAFAFA",
          borderBottom: "1px solid #E4E4E7",
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: 5, background: "#E4E4E7" }} />
        <span style={{ width: 10, height: 10, borderRadius: 5, background: "#E4E4E7" }} />
        <span style={{ width: 10, height: 10, borderRadius: 5, background: "#E4E4E7" }} />
        <span
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            maxWidth: "calc(100% - 120px)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 24,
            padding: "0 12px",
            borderRadius: 12,
            background: "#F4F4F5",
            fontFamily: "var(--a4x-display)",
            fontSize: 12.5,
            fontWeight: 600,
            color: "#27272A",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <A4Mark size={12} color="#09090B" />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
        </span>
      </div>
      <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", background: "#F4F4F5" }}>
        {isVideo ? (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={shouldLoad ? assetUrl : undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-label={title}
            onError={setSourceFailed}
          />
        ) : (
          <Image
            src={assetUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 900px) 100vw, 600px"
            loading="lazy"
            decoding="async"
            unoptimized
            onError={setSourceFailed}
          />
        )}
      </div>
    </div>
  );
}
