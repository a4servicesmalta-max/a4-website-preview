"use client";

import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Container, Eyebrow, Icon, Reveal } from "@/components/a4-landing/Primitives";
import { TESTIMONIALS, type Testimonial } from "@/data/a4TestimonialsData";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

function initials(sector: string) {
  return sector
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function TestimonialSlide({ t, dark }: { t: Testimonial; dark?: boolean }) {
  const ink = dark ? "#fff" : "var(--a4-ink)";
  const stone = dark ? "var(--a4-stone)" : "var(--a4-mute)";
  const border = dark ? "var(--a4-hairline-dark)" : "var(--a4-hairline-light)";
  const cardBg = dark ? "rgba(255,255,255,.04)" : "var(--a4-surface-card)";

  return (
    <div
      className="flex flex-col h-full mx-auto max-w-[920px]"
      style={{
        background: cardBg,
        border: `1px solid ${border}`,
        borderRadius: "var(--a4-r-lg)",
        padding: "clamp(32px,4vw,48px)",
        minHeight: 320,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute -top-20 -right-16 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: "rgba(73,79,223,.18)", filter: "blur(48px)" }}
      />

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="w-4 h-4 fill-[var(--a4-primary-bright)] text-[var(--a4-primary-bright)]"
              strokeWidth={0}
            />
          ))}
        </div>
        <span
          className="a4-font-body text-[11px] font-bold tracking-[.12em] uppercase rounded-full px-3 py-1.5"
          style={{
            color: "var(--a4-primary-bright)",
            background: "rgba(73,79,223,.12)",
            border: "1px solid rgba(73,79,223,.25)",
          }}
        >
          {t.sector}
        </span>
      </div>

      <div style={{ marginTop: 24, opacity: 0.85 }}>
        <Icon name="quote" size={32} color="var(--a4-primary-bright)" stroke={1.25} />
      </div>

      <blockquote
        className="a4-font-display font-medium mt-6 flex-1"
        style={{
          fontSize: "clamp(22px,2.8vw,30px)",
          lineHeight: 1.35,
          letterSpacing: "-.02em",
          color: ink,
          textWrap: "pretty",
          margin: "24px 0 0",
        }}
      >
        &ldquo;{t.quote}&rdquo;
      </blockquote>

      <div
        className="flex items-center gap-4 mt-8 pt-6"
        style={{ borderTop: `1px solid ${border}` }}
      >
        <span
          className="flex shrink-0 items-center justify-center rounded-full a4-font-display font-medium text-white"
          style={{
            width: 52,
            height: 52,
            fontSize: 16,
            background: "linear-gradient(135deg, var(--a4-primary) 0%, #2d33a8 100%)",
            boxShadow: "0 4px 20px rgba(73,79,223,.35)",
          }}
        >
          {initials(t.sector)}
        </span>
        <div>
          <div className="a4-font-body text-[15px] font-semibold" style={{ color: ink }}>
            {t.role}
          </div>
          <div className="a4-font-body text-[13.5px] mt-0.5" style={{ color: stone }}>
            {t.sector}
          </div>
        </div>
      </div>
    </div>
  );
}

type TestimonialsSwiperProps = {
  /** Dark full-bleed section (homepage) vs light inline (case studies) */
  variant?: "dark" | "light";
  showHeader?: boolean;
  className?: string;
};

export function TestimonialsSwiper({
  variant = "dark",
  showHeader = true,
  className = "",
}: TestimonialsSwiperProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const dark = variant === "dark";

  const sectionBg = dark
    ? "#000"
    : "linear-gradient(180deg, var(--a4-surface-soft) 0%, var(--a4-canvas-light) 100%)";

  return (
    <section
      className={`relative overflow-hidden ${className}`}
      style={{
        background: sectionBg,
        padding: "clamp(64px,9vw,108px) 0",
        borderTop: dark ? "1px solid var(--a4-hairline-dark)" : "1px solid var(--a4-hairline-light)",
      }}
    >
      {dark && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(73,79,223,.14) 0%, transparent 65%)",
          }}
        />
      )}

      <Container style={{ position: "relative" }}>
        {showHeader && (
          <Reveal style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 48px" }}>
            {dark ? <Eyebrow dark>Client voices</Eyebrow> : <Eyebrow>Client voices</Eyebrow>}
            <h2
              className="a4-font-display font-medium mt-4"
              style={{
                fontSize: "clamp(30px,4vw,48px)",
                lineHeight: 1.05,
                letterSpacing: "-.02em",
                color: dark ? "#fff" : "var(--a4-ink)",
                textWrap: "balance",
              }}
            >
              What Malta businesses say about working with A4
            </h2>
            <p
              className="a4-font-body mt-4"
              style={{
                fontSize: 17,
                lineHeight: 1.6,
                color: dark ? "var(--a4-on-dark-mute)" : "var(--a4-mute)",
                textWrap: "pretty",
              }}
            >
              Real feedback from directors and founders — anonymised, but representative of how we work.
            </p>
          </Reveal>
        )}

        <Reveal delay={60}>
          <div className="relative px-0 sm:px-12">
            {/* Custom nav */}
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={() => swiperRef.current?.slidePrev()}
              className="absolute left-0 top-1/2 z-10 hidden sm:flex -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full transition-all duration-200 hover:scale-105"
              style={{
                background: dark ? "rgba(255,255,255,.08)" : "var(--a4-surface-card)",
                border: `1px solid ${dark ? "var(--a4-hairline-dark)" : "var(--a4-hairline-light)"}`,
                color: dark ? "#fff" : "var(--a4-ink)",
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={() => swiperRef.current?.slideNext()}
              className="absolute right-0 top-1/2 z-10 hidden sm:flex -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full transition-all duration-200 hover:scale-105"
              style={{
                background: dark ? "rgba(255,255,255,.08)" : "var(--a4-surface-card)",
                border: `1px solid ${dark ? "var(--a4-hairline-dark)" : "var(--a4-hairline-light)"}`,
                color: dark ? "#fff" : "var(--a4-ink)",
              }}
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
            <div
              className="a4-font-body text-[13px] font-semibold tabular-nums tracking-wide"
              style={{ color: dark ? "var(--a4-stone)" : "var(--a4-mute)" }}
            >
              <span style={{ color: dark ? "#fff" : "var(--a4-ink)" }}>
                {String(activeIndex + 1).padStart(2, "0")}
              </span>
              {" / "}
              {String(TESTIMONIALS.length).padStart(2, "0")}
            </div>
            <div className="a4-testimonial-pagination flex items-center justify-center gap-2" />
          </div>
        </Reveal>
      </Container>

    </section>
  );
}
