"use client";

import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LinkedInFeedPost } from "@/lib/linkedin-feed";
import { LINKEDIN_COMPANY_URL } from "@/lib/contact";
import { Button, Container, Eyebrow, Icon, Reveal } from "@/components/a4-landing/Primitives";
import { LinkedInGlyph } from "./Insights";

import "swiper/css";
import "swiper/css/pagination";

type FeedResponse = {
  posts: LinkedInFeedPost[];
  source: "feed" | "manual";
};

const EMBED_W = 504;
const EMBED_H = 399;

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
        borderRadius: "var(--a4-r-lg)",
        border: "1px solid var(--a4-hairline-dark)",
        background: "#000",
        clipPath: "inset(0 round var(--a4-r-lg))",
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
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        borderRadius: "var(--a4-r-lg)",
        overflow: "hidden",
        border: "1px solid var(--a4-hairline-dark)",
        background: "var(--a4-surface-elevated)",
        height: "100%",
        transition: "border-color .2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--a4-hairline-strong)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--a4-hairline-dark)";
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 10",
          background: "#000",
          overflow: "hidden",
          borderBottom: "1px solid var(--a4-hairline-dark)",
        }}
      >
        {post.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.thumbnail}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background: "radial-gradient(60% 70% at 30% 30%, rgba(73,79,223,.26), transparent 70%)",
              }}
            />
          </>
        )}
        <div style={{ position: "absolute", top: 16, left: 16, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <LinkedInGlyph size={18} color="#fff" />
          <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 600, color: "#fff" }}>
            A4 Services
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 60,
            height: 60,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,.35)",
            background: "rgba(255,255,255,.1)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Icon name="play" size={24} color="#fff" stroke={1.6} />
        </div>
      </div>
      <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3
          style={{
            fontFamily: "var(--a4-font-display)",
            fontWeight: 500,
            fontSize: 19,
            lineHeight: 1.2,
            color: "#fff",
            margin: 0,
            textWrap: "balance",
          }}
        >
          {post.title}
        </h3>
        <p
          style={{
            fontFamily: "var(--a4-font-body)",
            fontSize: 14.5,
            lineHeight: 1.5,
            color: "var(--a4-on-dark-mute)",
            margin: "10px 0 0",
            textWrap: "pretty",
          }}
        >
          {post.blurb}
        </p>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            marginTop: "auto",
            paddingTop: 18,
            fontFamily: "var(--a4-font-body)",
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
          }}
        >
          Watch on LinkedIn <Icon name="arrow-up-right" size={16} color="#fff" />
        </div>
      </div>
    </a>
  );
}

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
    <div className="relative mt-10 sm:mt-12 px-0 sm:px-12">
      {posts.length > slidesPerView && (
        <>
          <button
            type="button"
            aria-label="Previous LinkedIn post"
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-0 top-[42%] z-10 hidden sm:flex -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full transition-all duration-200 hover:scale-105"
            style={{
              background: "rgba(255,255,255,.08)",
              border: "1px solid var(--a4-hairline-dark)",
              color: "#fff",
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Next LinkedIn post"
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-0 top-[42%] z-10 hidden sm:flex -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full transition-all duration-200 hover:scale-105"
            style={{
              background: "rgba(255,255,255,.08)",
              border: "1px solid var(--a4-hairline-dark)",
              color: "#fff",
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={22}
        slidesPerView={1}
        breakpoints={{
          768: { slidesPerView: Math.min(2, posts.length), spaceBetween: 22 },
          1024: { slidesPerView: Math.min(2, posts.length), spaceBetween: 24 },
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
        <div className="flex flex-col items-center gap-4 mt-8">
          <div
            className="a4-font-body text-[13px] font-semibold tabular-nums tracking-wide"
            style={{ color: "var(--a4-stone)" }}
          >
            <span style={{ color: "#fff" }}>{String(currentPage).padStart(2, "0")}</span>
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[22px] mt-10 sm:mt-12">
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            aspectRatio: `${EMBED_W} / ${EMBED_H}`,
            borderRadius: "var(--a4-r-lg)",
            background: "var(--a4-surface-elevated)",
            border: "1px solid var(--a4-hairline-dark)",
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
}

export function LinkedInVideoFeed() {
  const [posts, setPosts] = useState<LinkedInFeedPost[]>([]);
  const [source, setSource] = useState<"feed" | "manual" | "loading">("loading");

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

  return (
    <section
      style={{
        background: "#000",
        padding: "clamp(64px,9vw,104px) 0",
        borderTop: "1px solid var(--a4-hairline-dark)",
      }}
    >
      <Container>
        <Reveal
          className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-5 sm:gap-6"
        >
          <div className="min-w-0">
            <Eyebrow dark>From our LinkedIn</Eyebrow>
            <h2
              style={{
                fontFamily: "var(--a4-font-display)",
                fontWeight: 500,
                color: "#fff",
                fontSize: "clamp(32px,4.2vw,52px)",
                lineHeight: 1.04,
                letterSpacing: "-.02em",
                margin: "18px 0 0",
                textWrap: "balance",
              }}
            >
              Watch our latest videos
            </h2>
            <p
              style={{
                fontFamily: "var(--a4-font-body)",
                fontSize: 17,
                lineHeight: 1.55,
                color: "var(--a4-on-dark-mute)",
                margin: "14px 0 0",
                maxWidth: 460,
                textWrap: "pretty",
              }}
            >
              Short explainers and updates from the A4 team — auto-updated from our LinkedIn page.
            </p>
          </div>
          <div className="w-full sm:w-auto shrink-0" style={{ maxWidth: 280 }}>
            <Button variant="primary" size="md" href={LINKEDIN_COMPANY_URL} target="_blank" style={{ width: "100%" }}>
              <LinkedInGlyph size={16} color="#000" /> Follow on LinkedIn
            </Button>
          </div>
        </Reveal>

        <Reveal delay={60}>
          {source === "loading" ? (
            <LinkedInFeedSkeleton />
          ) : posts.length > 0 ? (
            <LinkedInPostsSwiper posts={posts} />
          ) : null}
        </Reveal>
      </Container>
    </section>
  );
}
