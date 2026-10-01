"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LinkedInFeedPost } from "@/lib/linkedin-feed";
import { LINKEDIN_COMPANY_URL } from "@/lib/contact";
import { Button, Eyebrow, Icon } from "@/components/a4-landing/Primitives";
import { DARK_CARD, DARK_GRID, DriftGlow, gradText } from "@/components/fx/primitives";
import { INK, PERI } from "@/lib/fx/engine";
import { LinkedInGlyph } from "./Insights";

import "swiper/css";
import "swiper/css/pagination";

type FeedResponse = {
  posts: LinkedInFeedPost[];
  source: "portal" | "feed" | "manual";
};

const EMBED_W = 504;
const EMBED_H = 399;
const BODY = "var(--a4x-body)";

const FEED_CSS = `
  .a4-li-card { transition: border-color .35s, box-shadow .35s; }
  .a4-li-card:hover { border-color: rgba(139,143,247,.45) !important; box-shadow: 0 24px 60px rgba(9,9,11,.28); }
  .a4-li-nav { transition: background .3s, border-color .3s; }
  .a4-li-nav:hover { background: rgba(255,255,255,.12) !important; border-color: rgba(255,255,255,.32) !important; }
  .a4-li-nav:focus-visible, .a4-li-card:focus-visible { outline: 3px solid rgba(79,85,241,.55); outline-offset: 2px; }
`;

function LinkedInEmbed({ src, title }: { src: string; title: string }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      setScale(w >= EMBED_W ? 1 : w / EMBED_W);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const shellH = Math.ceil(EMBED_H * scale);

  return (
    <div
      ref={shellRef}
      className="relative w-full overflow-hidden isolate"
      style={{
        height: shellH,
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,.1)",
        background: INK,
        clipPath: "inset(0 round 24px)",
      }}
    >
      <iframe
        src={src}
        title={title}
        loading="lazy"
        allowFullScreen
        scrolling="no"
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          width: EMBED_W,
          height: EMBED_H,
          border: 0,
          display: "block",
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: "top center",
          pointerEvents: "auto",
        }}
      />
    </div>
  );
}

function LinkedInVideoCard({ post }: { post: LinkedInFeedPost }) {
  if (post.embed) {
    return <LinkedInEmbed src={post.embed} title={post.title} />;
  }

  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="a4-li-card"
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        borderRadius: 24,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,.08)",
        background: DARK_CARD,
        height: "100%",
        color: "#FFFFFF",
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: post.thumbnail ? "1 / 1" : "16 / 10",
          background: INK,
          overflow: "hidden",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        {post.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.thumbnail} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(60% 70% at 30% 30%, rgba(79,85,241,.30), rgba(79,85,241,0) 70%), linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px) 0 0 / 32px 32px, linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px) 0 0 / 32px 32px",
            }}
          />
        )}
        <div style={{ position: "absolute", top: 16, left: 16, display: "inline-flex", alignItems: "center", gap: 8, height: 32, padding: "0 12px", borderRadius: 999, background: "rgba(9,9,11,.72)", border: "1px solid rgba(255,255,255,.12)" }}>
          <LinkedInGlyph size={14} color="#FFFFFF" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF" }}>A4 Services</span>
        </div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 64,
            height: 64,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,.22)",
            background: "rgba(255,255,255,.08)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Icon name="play" size={24} color="#FFFFFF" stroke={1.6} />
        </div>
      </div>
      <div style={{ padding: "22px 24px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 21, fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.2, color: "#FFFFFF", textWrap: "balance" }}>{post.title}</h3>
        <p style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: "#A1A1AA", textWrap: "pretty" }}>{post.blurb}</p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            marginTop: "auto",
            paddingTop: 20,
            fontSize: 15,
            fontWeight: 600,
            color: "#FFFFFF",
          }}
        >
          Watch on LinkedIn <Icon name="arrow-up-right" size={16} color={PERI} />
        </div>
      </div>
    </a>
  );
}

const NAV_BTN: CSSProperties = {
  background: "rgba(255,255,255,.06)",
  border: "1px solid rgba(255,255,255,.22)",
  color: "#FFFFFF",
};

function LinkedInPostsSwiper({ posts }: { posts: LinkedInFeedPost[] }) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(1);
  const canLoop = posts.length > 2;

  useEffect(() => {
    const mqLg = window.matchMedia("(min-width: 1024px)");
    const mqMd = window.matchMedia("(min-width: 768px)");

    const update = () => {
      if (mqLg.matches) setSlidesPerView(Math.min(2, posts.length));
      else if (mqMd.matches) setSlidesPerView(Math.min(2, posts.length));
      else setSlidesPerView(1);
    };

    update();
    mqLg.addEventListener("change", update);
    mqMd.addEventListener("change", update);
    return () => {
      mqLg.removeEventListener("change", update);
      mqMd.removeEventListener("change", update);
    };
  }, [posts.length]);

  const pageCount = Math.max(1, Math.ceil(posts.length / slidesPerView));
  const currentPage = Math.min(pageCount, Math.floor(activeIndex / slidesPerView) + 1);

  return (
    <div className="relative mt-10 sm:mt-14 px-0 sm:px-16 mx-auto" style={{ maxWidth: 1180 }}>
      {posts.length > slidesPerView && (
        <>
          <button
            type="button"
            aria-label="Previous LinkedIn post"
            onClick={() => swiperRef.current?.slidePrev()}
            className="a4-li-nav absolute left-0 top-[42%] z-10 hidden sm:flex -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full"
            style={NAV_BTN}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Next LinkedIn post"
            onClick={() => swiperRef.current?.slideNext()}
            className="a4-li-nav absolute right-0 top-[42%] z-10 hidden sm:flex -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full"
            style={NAV_BTN}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={16}
        slidesPerView={1}
        breakpoints={{
          768: { slidesPerView: Math.min(2, posts.length), spaceBetween: 16 },
          1024: { slidesPerView: Math.min(3, posts.length), spaceBetween: 16 },
        }}
        loop={canLoop}
        watchOverflow
        onSwiper={(s) => {
          swiperRef.current = s;
        }}
        onSlideChange={(s) => setActiveIndex(s.realIndex)}
        onBreakpoint={(s) => setSlidesPerView(s.params.slidesPerView as number)}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          dynamicMainBullets: 3,
          el: ".a4-linkedin-pagination",
          bulletClass: "a4-linkedin-bullet",
          bulletActiveClass: "a4-linkedin-bullet-active",
        }}
        className="a4-linkedin-swiper !overflow-hidden"
      >
        {posts.map((p) => (
          <SwiperSlide key={p.id} className="!h-auto">
            <LinkedInVideoCard post={p} />
          </SwiperSlide>
        ))}
      </Swiper>

      {posts.length > 1 && (
        <div className="flex flex-col items-center gap-4 mt-10">
          <div style={{ fontFamily: "var(--a4x-display)", fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: "#A1A1AA", fontVariantNumeric: "tabular-nums" }}>
            <span style={{ color: PERI }}>{String(currentPage).padStart(2, "0")}</span>
            {" / "}
            {String(pageCount).padStart(2, "0")}
          </div>
          <div className="a4-linkedin-pagination flex items-center justify-center gap-2 min-h-[10px]" />
        </div>
      )}
    </div>
  );
}

function LinkedInFeedSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 sm:mt-14">
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            aspectRatio: `${EMBED_W} / ${EMBED_H}`,
            borderRadius: 24,
            background: DARK_CARD,
            border: "1px solid rgba(255,255,255,.08)",
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
}

export function LinkedInVideoFeed() {
  const [posts, setPosts] = useState<LinkedInFeedPost[]>([]);
  const [source, setSource] = useState<"portal" | "feed" | "manual" | "loading">("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/linkedin-feed")
      .then((r) => r.json())
      .then((data: FeedResponse) => {
        if (!cancelled) {
          setPosts(data.posts ?? []);
          setSource(data.source ?? "manual");
        }
      })
      .catch(() => {
        if (!cancelled) setSource("manual");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Feed loaded (or failed) with nothing to show — don't render the "Watch
  // our latest videos" header and CTA over zero cards. `source` starts as
  // "loading" so the skeleton below still gets its chance first.
  if (source !== "loading" && posts.length === 0) {
    return null;
  }

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px) clamp(88px,11vw,150px)",
        color: "#FFFFFF",
        background: DARK_GRID,
        fontFamily: "var(--a4x-display)",
      }}
    >
      <style>{FEED_CSS}</style>
      <DriftGlow left="52%" top="-40%" strength={0.22} />
      <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 28 }}>
          <div style={{ flex: "1 1 560px", minWidth: 0, maxWidth: 840 }}>
            <div data-fx="rise">
              <Eyebrow dark>From our LinkedIn</Eyebrow>
            </div>
            <h2
              data-fx="rise"
              data-d="100"
              style={{ margin: "16px 0 0", fontSize: "clamp(40px,5.6vw,92px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.02, textWrap: "balance" }}
            >
              Watch our latest <span style={{ ...gradText, paddingBottom: ".06em" }}>videos</span>
            </h2>
            <p data-fx="rise" data-d="200" style={{ margin: "20px 0 0", maxWidth: 480, fontFamily: BODY, fontSize: 17, lineHeight: 1.55, color: "#A1A1AA", textWrap: "pretty" }}>
              Short explainers and updates from the A4 team — auto-updated from our LinkedIn page.
            </p>
          </div>
          <div data-fx="rise" data-d="200" style={{ flexShrink: 0 }}>
            <Button variant="primary" size="lg" href={LINKEDIN_COMPANY_URL} target="_blank">
              <LinkedInGlyph size={17} color={INK} /> Follow on LinkedIn
            </Button>
          </div>
        </div>

        <div data-fx="rise" data-d="120">
          {source === "loading" ? <LinkedInFeedSkeleton /> : posts.length > 0 ? <LinkedInPostsSwiper posts={posts} /> : null}
        </div>
      </div>
    </section>
  );
}
