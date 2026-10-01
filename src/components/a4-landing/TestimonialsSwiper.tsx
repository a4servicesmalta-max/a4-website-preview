"use client";

import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Badge, Eyebrow } from "@/components/a4-landing/Primitives";
import { DARK_CARD, DARK_GRID, DriftGlow, GRAD, MUTED_GLOW, gradText } from "@/components/fx/primitives";
import { TESTIMONIALS, type Testimonial } from "@/data/a4TestimonialsData";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const INK = "#09090B";
const INDIGO = "#4F55F1";
const PERI = "#8B8FF7";
const BODY = "var(--a4x-body)";

function initials(sector: string) {
  return sector
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** One quote, set like the design's document card: 28px radius, hairline, big Outfit quote. */
function TestimonialSlide({ t, dark }: { t: Testimonial; dark?: boolean }) {
  const accent = dark ? PERI : INDIGO;
  return (
    <figure
      style={{
        position: "relative",
        overflow: "hidden",
        height: "100%",
        maxWidth: 980,
        minHeight: 340,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        padding: "clamp(28px,4.4vw,56px)",
        borderRadius: 28,
        background: dark ? DARK_CARD : "#FFFFFF",
        border: `1px solid ${dark ? "rgba(255,255,255,.1)" : "#E4E4E7"}`,
        boxShadow: dark ? "0 40px 100px rgba(0,0,0,.45)" : "0 50px 120px rgba(9,9,11,.12)",
        color: dark ? "#FFFFFF" : INK,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }} aria-label="5 out of 5" role="img">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={16} fill={accent} color={accent} strokeWidth={0} aria-hidden="true" />
          ))}
        </div>
        <Badge feature dark={dark}>
          {t.sector}
        </Badge>
      </div>

      <blockquote
        style={{
          flex: 1,
          margin: "clamp(24px,3vw,36px) 0 0",
          fontFamily: "var(--a4x-display)",
          fontSize: "clamp(22px,2.6vw,36px)",
          fontWeight: 500,
          letterSpacing: "-0.025em",
          lineHeight: 1.3,
          textWrap: "pretty",
        }}
      >
        &ldquo;{t.quote}&rdquo;
      </blockquote>

      <figcaption
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginTop: "clamp(28px,3vw,40px)",
          paddingTop: 24,
          borderTop: `1px solid ${dark ? "rgba(255,255,255,.1)" : "#E4E4E7"}`,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 52,
            height: 52,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            borderRadius: 999,
            background: GRAD,
            color: "#FFFFFF",
            fontFamily: "var(--a4x-display)",
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          {initials(t.sector)}
        </span>
        <div>
          <div style={{ fontFamily: "var(--a4x-display)", fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>{t.role}</div>
          <div style={{ fontFamily: BODY, fontSize: 14, marginTop: 2, color: dark ? "#A1A1AA" : "#71717A" }}>{t.sector}</div>
        </div>
      </figcaption>
    </figure>
  );
}

type TestimonialsSwiperProps = {
  /** Dark full-bleed section vs the light (muted glow) surface */
  variant?: "dark" | "light";
  showHeader?: boolean;
  className?: string;
};

const SWIPER_CSS = `
  .a4-tsw-nav { transition: background .3s, border-color .3s; }
  .a4-tsw--dark .a4-tsw-nav:hover { background: rgba(255,255,255,.12) !important; border-color: rgba(255,255,255,.32) !important; }
  .a4-tsw--light .a4-tsw-nav:hover { border-color: #A1A1AA !important; }
  .a4-tsw-nav:focus-visible { outline: 3px solid rgba(79,85,241,.55); outline-offset: 2px; }
  .a4-tsw--dark .a4-testimonial-bullet { background: rgba(255,255,255,.22); }
  .a4-tsw--dark .a4-testimonial-bullet.a4-testimonial-bullet-active { background: ${PERI}; }
  .a4-tsw--light .a4-testimonial-bullet { background: #D4D4D8; }
  .a4-tsw--light .a4-testimonial-bullet.a4-testimonial-bullet-active { background: ${INDIGO}; }
`;

export function TestimonialsSwiper({ variant = "dark", showHeader = true, className = "" }: TestimonialsSwiperProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const dark = variant === "dark";

  const navStyle: React.CSSProperties = dark
    ? { background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.22)", color: "#FFFFFF" }
    : { background: "#FFFFFF", border: "1px solid #E4E4E7", color: INK, boxShadow: "0 10px 30px rgba(9,9,11,.08)" };

  return (
    <section
      className={`a4-tsw ${dark ? "a4-tsw--dark" : "a4-tsw--light"} relative overflow-hidden ${className}`}
      style={{
        background: dark ? DARK_GRID : MUTED_GLOW,
        padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)",
        color: dark ? "#FFFFFF" : INK,
        fontFamily: "var(--a4x-display)",
      }}
    >
      <style>{SWIPER_CSS}</style>
      {dark ? <DriftGlow left="34%" top="-44%" strength={0.24} /> : null}

      <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto" }}>
        {showHeader && (
          <div style={{ textAlign: "center", maxWidth: 940, margin: "0 auto clamp(48px,6vw,80px)" }}>
            <div data-fx="rise" style={{ display: "flex", justifyContent: "center" }}>
              <Eyebrow dark={dark}>Client voices</Eyebrow>
            </div>
            <h2
              data-fx="rise"
              data-d="100"
              style={{ margin: "16px 0 0", fontSize: "clamp(36px,4.6vw,72px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.03, textWrap: "balance" }}
            >
              What Malta businesses say about working with <span style={{ ...gradText, paddingBottom: ".06em" }}>A4</span>
            </h2>
            <p
              data-fx="rise"
              data-d="200"
              style={{ margin: "20px auto 0", maxWidth: 620, fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}
            >
              Real feedback from directors and founders — anonymised, but representative of how we work.
            </p>
          </div>
        )}

        <div data-fx="rise" data-d="120">
          <div className="relative px-0 sm:px-16">
            {/* Custom nav */}
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={() => swiperRef.current?.slidePrev()}
              className="a4-tsw-nav absolute left-0 top-1/2 z-10 hidden sm:flex -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full"
              style={navStyle}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={() => swiperRef.current?.slideNext()}
              className="a4-tsw-nav absolute right-0 top-1/2 z-10 hidden sm:flex -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full"
              style={navStyle}
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <Swiper
              modules={[Autoplay, EffectFade, Pagination, Navigation]}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              speed={700}
              autoplay={{
                delay: 5200,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop
              onSwiper={(s) => {
                swiperRef.current = s;
              }}
              onSlideChange={(s) => setActiveIndex(s.realIndex)}
              pagination={{
                clickable: true,
                el: ".a4-testimonial-pagination",
                bulletClass: "a4-testimonial-bullet",
                bulletActiveClass: "a4-testimonial-bullet-active",
              }}
              className="a4-testimonials-swiper !overflow-visible"
            >
              {TESTIMONIALS.map((t) => (
                <SwiperSlide key={t.id}>
                  <TestimonialSlide t={t} dark={dark} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Counter + dots */}
          <div className="flex flex-col items-center gap-4 mt-10">
            <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: dark ? "#A1A1AA" : "#52525B", fontVariantNumeric: "tabular-nums" }}>
              <span style={{ color: dark ? PERI : INDIGO }}>{String(activeIndex + 1).padStart(2, "0")}</span>
              {" / "}
              {String(TESTIMONIALS.length).padStart(2, "0")}
            </div>
            <div className="a4-testimonial-pagination flex items-center justify-center gap-2" />
          </div>
        </div>
      </div>
    </section>
  );
}
