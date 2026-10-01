"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Icon } from "@/components/a4-landing/Primitives";
import { DARK_CARD, DARK_GRID, LIGHT_GLOW, MUTED_GLOW } from "@/components/fx/primitives";
import { getInsightVisual, INSIGHTS_ITEMS_PER_PAGE } from "@/data/a4InsightsSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import type { BlogPost } from "@/utils/blog";

const SANS = "var(--a4x-display)";
const BODY = "var(--a4x-body)";
const INDIGO = "#4F55F1";
const PERI = "#8B8FF7";
const INK = "#09090B";
const SECTION_PAD = "clamp(100px,13vw,180px) clamp(20px,5vw,72px)";

function InsightMeta({ category, date, read, dark }: { category: string; date: string; read: string; dark?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px 12px" }}>
      <span
        style={{
          height: 28,
          padding: "0 12px",
          display: "inline-flex",
          alignItems: "center",
          borderRadius: 999,
          fontFamily: SANS,
          fontSize: 13,
          fontWeight: 600,
          background: dark ? "rgba(139,143,247,.18)" : "rgba(79,85,241,.1)",
          color: dark ? "#FFFFFF" : INDIGO,
        }}
      >
        {category}
      </span>
      <span style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: dark ? "#A1A1AA" : "#71717A" }}>
        {date} · {read}
      </span>
    </div>
  );
}

/** The image, or — when a post has none — its icon on the section's surface. */
function Visual({ src, icon, dark, height }: { src?: string; icon: string; dark: boolean; height: number | string }) {
  return (
    <div style={{ position: "relative", height, overflow: "hidden", background: dark ? DARK_GRID : MUTED_GLOW }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <Icon name={icon} size={56} color={dark ? PERI : INDIGO} stroke={1.3} />
        </div>
      )}
    </div>
  );
}

export function InsightsContent({ blogs }: { blogs: BlogPost[] }) {
  const [currentPage, setCurrentPage] = useState(1);

  const featured = blogs[0];
  const gridBlogs = blogs.slice(1);

  const totalPages = Math.max(1, Math.ceil(gridBlogs.length / INSIGHTS_ITEMS_PER_PAGE));
  const pageBlogs = useMemo(
    () => gridBlogs.slice((currentPage - 1) * INSIGHTS_ITEMS_PER_PAGE, currentPage * INSIGHTS_ITEMS_PER_PAGE),
    [gridBlogs, currentPage]
  );

  if (!featured) {
    return (
      <div className="a4-site-page">
        <PageHero eyebrow="Insights" title="Ideas worth your time" sub="Practical thinking on finance, technology, compliance and running a sharper professional services business." />
        <section style={{ padding: SECTION_PAD, background: LIGHT_GLOW, textAlign: "center" }}>
          <p style={{ margin: 0, fontFamily: SANS, fontSize: 20, fontWeight: 500, color: "#52525B" }}>No articles published yet.</p>
        </section>
      </div>
    );
  }

  const featuredVisual = getInsightVisual(featured.slug);
  const featuredCategory = featured.tags?.[0] ?? "Insights";
  const featuredRead = featured.readingTime.replace(" read", "");

  const pagerBtn = (active: boolean): React.CSSProperties => ({
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: `1px solid ${active ? INK : "#E4E4E7"}`,
    background: active ? INK : "#FFFFFF",
    color: active ? "#FFFFFF" : "#52525B",
    fontFamily: SANS,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background .3s, color .3s, border-color .3s",
  });

  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="Insights"
        title="Ideas worth your time"
        sub="Practical thinking on finance, technology, compliance and running a sharper professional services business."
      />

      <section style={{ position: "relative", padding: SECTION_PAD, background: LIGHT_GLOW, color: INK }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* Featured article — the dark document panel */}
          <LocalizedLink
            href={`/insights/${featured.slug}`}
            data-fx="rise"
            data-dy="80"
            className="cp-card cp-dark cp-focus"
            style={{ borderRadius: 28, overflow: "hidden", background: DARK_CARD, boxShadow: "0 50px 120px rgba(9,9,11,.16)" }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))" }}>
              <Visual src={featured.featuredImage} icon={featuredVisual.icon} dark height="clamp(260px,30vw,440px)" />
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(28px,4vw,56px)" }}>
                <InsightMeta category={featuredCategory} date={format(new Date(featured.date), "MMM dd, yyyy")} read={featuredRead} dark />
                <h2 style={{ margin: "20px 0 0", fontFamily: SANS, fontSize: "clamp(30px,3.2vw,46px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.06, color: "#FFFFFF", textWrap: "balance" }}>
                  {featured.title}
                </h2>
                <p style={{ margin: "16px 0 0", fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: "#A1A1AA", textWrap: "pretty" }}>{featured.excerpt}</p>
                <span className="a4-btn a4-btn-light" style={{ alignSelf: "flex-start", marginTop: 28, height: 48, padding: "0 22px", fontSize: 16 }}>
                  Read article <Icon name="arrow-right" size={16} color={INK} />
                </span>
              </div>
            </div>
          </LocalizedLink>

          {/* Card grid — light and dark alternating */}
          <div className="cp-grid" style={{ marginTop: 16 }}>
            {pageBlogs.map((p, i) => {
              const visual = getInsightVisual(p.slug);
              const category = p.tags?.[0] ?? "Insights";
              const read = p.readingTime.replace(" read", "");
              const dark = i % 2 === 1;
              return (
                <LocalizedLink
                  key={p.slug}
                  href={`/insights/${p.slug}`}
                  data-fx="rise"
                  data-d={(i % 3) * 80}
                  className={`cp-card cp-focus${dark ? " cp-dark" : ""}`}
                  style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
                >
                  <Visual src={p.featuredImage} icon={visual.icon} dark={dark} height={200} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 26px 26px" }}>
                    <InsightMeta category={category} date={format(new Date(p.date), "MMM dd, yyyy")} read={read} dark={dark} />
                    <h3 style={{ margin: "16px 0 0", fontFamily: SANS, fontSize: 24, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15, color: dark ? "#FFFFFF" : INK, textWrap: "balance" }}>{p.title}</h3>
                    <p style={{ margin: "10px 0 0", flex: 1, fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}>{p.excerpt}</p>
                    <span className={`cp-link${dark ? " cp-link-dark" : ""}`} style={{ marginTop: 20, fontSize: 15 }}>
                      Read more <Icon name="arrow-right" size={16} color={dark ? PERI : INDIGO} />
                    </span>
                  </div>
                </LocalizedLink>
              );
            })}
          </div>

          {gridBlogs.length > INSIGHTS_ITEMS_PER_PAGE && (
            <nav aria-label="Insights pages" style={{ marginTop: 56, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setCurrentPage((pg) => Math.max(1, pg - 1))}
                disabled={currentPage === 1}
                className="a4-btn a4-btn-outline"
                style={{ height: 44, padding: "0 20px", fontSize: 15, opacity: currentPage === 1 ? 0.45 : 1 }}
              >
                Previous
              </button>
              <div className="hidden sm:flex" style={{ alignItems: "center", gap: 6 }}>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentPage(i + 1)}
                    aria-current={currentPage === i + 1 ? "page" : undefined}
                    className="cp-focus"
                    style={pagerBtn(currentPage === i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage((pg) => Math.min(totalPages, pg + 1))}
                disabled={currentPage === totalPages}
                className="a4-btn a4-btn-outline"
                style={{ height: 44, padding: "0 20px", fontSize: 15, opacity: currentPage === totalPages ? 0.45 : 1 }}
              >
                Next
              </button>
            </nav>
          )}

          {blogs.length > 0 && (
            <p style={{ margin: "28px 0 0", textAlign: "center", fontFamily: BODY, fontSize: 14, color: "#71717A" }}>
              Showing {pageBlogs.length} of {gridBlogs.length} articles ({blogs.length} total)
            </p>
          )}
        </div>
      </section>

      <ServicePortalBand serviceName="your firm" />
    </div>
  );
}
