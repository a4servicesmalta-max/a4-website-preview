"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import LocalizedLink from "@/components/common/LocalizedLink";
import { BOOK_A_CALL_PATH, CLIENT_ONBOARDING_URL } from "@/lib/external-links";

export default function HeroSection() {
  const { t } = useTranslation("services");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setShouldLoadVideo(true);
          obs.disconnect();
        }
      },
      { root: null, rootMargin: "250px 0px", threshold: 0.01 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="hero-wrap">
      <div className="hero">
        <div className="pt-10">
          <div className="hero-eyebrow">
            <span className="eyebrow-line"></span>
            {t("bookkeeping.hero.eyebrow")}
          </div>
          <h1>
            {t("bookkeeping.hero.title")}
            <br />
            <em>{t("bookkeeping.hero.titleEm")}</em>
          </h1>
          <p className="hero-sub">
            {t("bookkeeping.hero.subtitle")}
          </p>
          <div className="cta-stack">
            <div className="cta-row">
              <a href={CLIENT_ONBOARDING_URL} className="btn-primary">
                {t("bookkeeping.hero.btnPrimary")}
                <ArrowRight size={16} />
              </a>
              <LocalizedLink href={BOOK_A_CALL_PATH} className="btn-outline-light">
                <Play size={16} fill="currentColor" />
                {t("bookkeeping.hero.btnOutline")}
              </LocalizedLink>
            </div>
            <p className="cta-hint">
              {t("bookkeeping.hero.ctaHint")}
            </p>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-laptop-outer">
            <svg
              viewBox="0 0 900 590"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                width: "100%",
                maxWidth: "520px",
                height: "auto",
                display: "block",
                overflow: "visible",
                margin: "0 auto",
              }}
            >
              <defs>
                <clipPath id="vscr">
                  <rect x="96" y="30" width="684" height="414" rx="3" />
                </clipPath>
                <filter id="vlap">
                  <feDropShadow dx="0" dy="18" stdDeviation="22" floodColor="rgba(0,0,0,0.55)" />
                  <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="rgba(0,0,0,0.3)" />
                </filter>
                <linearGradient id="vlid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#222222" />
                  <stop offset="100%" stopColor="#0E0E0E" />
                </linearGradient>
                <linearGradient id="vbase" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1A1A1A" />
                  <stop offset="100%" stopColor="#0F1218" />
                </linearGradient>
                <filter id="vglow">
                  <feGaussianBlur stdDeviation="16" />
                </filter>
              </defs>
              <ellipse
                cx="450"
                cy="555"
                rx="320"
                ry="11"
                fill="rgba(0,0,0,0.35)"
                filter="url(#vglow)"
                opacity="0.5"
              />
              <g filter="url(#vlap)">
                <rect x="60" y="14" width="740" height="460" rx="14" fill="url(#vlid)" />
                <rect x="60" y="14" width="740" height="2" rx="1" fill="rgba(70,70,70,0.7)" />
                <rect x="62" y="16" width="736" height="456" rx="12" fill="#060606" />
                <rect x="96" y="30" width="684" height="414" rx="3" fill="#000" />
                <foreignObject x="96" y="30" width="684" height="414" clipPath="url(#vscr)">
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      overflow: "hidden",
                    }}
                  >
                    <video
                      ref={videoRef}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="none"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    >
                      {shouldLoadVideo && (
                        <source src="/assets/videos/hero-video.mp4" type="video/mp4" />
                      )}
                    </video>
                  </div>
                </foreignObject>
                <rect x="96" y="30" width="684" height="414" rx="3" fill="rgba(255,255,255,0.02)" />
                <rect
                  x="96"
                  y="30"
                  width="684"
                  height="414"
                  rx="3"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
                <rect x="62" y="444" width="736" height="30" rx="4" fill="#060606" />
                <circle cx="430" cy="22" r="2.5" fill="#111" />
                <circle cx="430" cy="22" r="1" fill="#050505" />
                <rect x="180" y="472" width="500" height="9" rx="4.5" fill="#181818" />
                <rect x="180" y="472" width="500" height="2" rx="1.5" fill="rgba(55,55,55,0.5)" />
                <rect x="140" y="470" width="58" height="12" rx="4" fill="#121212" />
                <rect x="662" y="470" width="58" height="12" rx="4" fill="#121212" />
                <path d="M18 480 L842 480 L822 530 L38 530 Z" fill="url(#vbase)" />
                <path d="M44 480 L816 480 L798 522 L62 522 Z" fill="rgba(255,255,255,0.025)" />
                <rect x="160" y="486" width="540" height="3" rx="1.5" fill="rgba(255,255,255,0.03)" />
                <rect x="168" y="493" width="524" height="3" rx="1.5" fill="rgba(255,255,255,0.025)" />
                <rect x="176" y="500" width="508" height="3" rx="1.5" fill="rgba(255,255,255,0.018)" />
                <rect x="188" y="507" width="484" height="3" rx="1.5" fill="rgba(255,255,255,0.012)" />
                <rect
                  x="348"
                  y="500"
                  width="164"
                  height="18"
                  rx="5"
                  fill="rgba(255,255,255,0.03)"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="0.5"
                />
                <path d="M18 480 L44 480 L62 522 L38 530 Z" fill="#0A0A0A" />
                <path d="M816 480 L842 480 L822 530 L798 522 Z" fill="#0A0A0A" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
