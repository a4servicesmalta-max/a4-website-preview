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

export function ServiceOfferingVisual({
  serviceKey,
  title,
}: {
  serviceKey: ServiceKey;
  title: string;
}) {
  const [sourceFailed, setSourceFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref: lazyRef, shouldLoad } = useLazyMedia();

  const primaryUrl = getServiceVisual(serviceKey);
  const assetUrl =
    sourceFailed || !primaryUrl ? SERVICE_VISUAL_FALLBACK : primaryUrl;
  const isVideo = isVideoAsset(assetUrl);

  useEffect(() => {
    setSourceFailed(false);
  }, [serviceKey]);

  useEffect(() => {
    if (!shouldLoad || !isVideo) return;
    videoRef.current?.load();
  }, [shouldLoad, isVideo, assetUrl]);

  return (
    <div
      ref={lazyRef}
      className="relative w-full max-w-[320px] h-[220px] rounded-[var(--a4-r-lg)] overflow-hidden border border-[var(--a4-hairline-light)] bg-[var(--a4-surface-soft)]"
    >
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
          onError={() => setSourceFailed(true)}
        />
      ) : (
        <Image
          src={assetUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="320px"
          loading="lazy"
          decoding="async"
          unoptimized
          onError={() => setSourceFailed(true)}
        />
      )}
    </div>
  );
}
