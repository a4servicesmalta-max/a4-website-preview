"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Container, Icon, Reveal } from "@/components/a4-landing/Primitives";
import { getInsightVisual, INSIGHTS_ITEMS_PER_PAGE } from "@/data/a4InsightsSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import type { BlogPost } from "@/utils/blog";

function InsightMeta({ category, date, read, color, light }: { category: string; date: string; read: string; color: string; light?: boolean }) {
  return (
    <div className="flex items-center gap-[10px] flex-wrap">
      <span
        className="a4-font-body text-[11px] font-bold tracking-[.06em] uppercase text-white rounded-[var(--a4-r-full)] py-1 px-[11px]"
        style={{ background: color }}
      >
        {category}
      </span>
      <span className="a4-font-body text-[13px]" style={{ color: light ? "var(--a4-mute)" : "var(--a4-on-dark-mute)" }}>
        {date} · {read}
      </span>
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
        <section className="bg-[var(--a4-canvas-light)] py-20 text-center">
          <Container>
            <p className="a4-font-body text-[var(--a4-mute)]">No articles published yet.</p>
          </Container>
        </section>
      </div>
    );
  }

  const featuredVisual = getInsightVisual(featured.slug);
  const featuredCategory = featured.tags?.[0] ?? "Insights";
  const featuredRead = featured.readingTime.replace(" read", "");

  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="Insights"
        title="Ideas worth your time"
        sub="Practical thinking on finance, technology, compliance and running a sharper professional services business."
      />

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(56px,8vw,96px) 0" }}>
        <Container>
          <Reveal>
            <LocalizedLink
              href={`/insights/${featured.slug}`}
              className="block no-underline bg-black rounded-[var(--a4-r-xl)] overflow-hidden"
            >
              <div className="ins-feat grid" style={{ gridTemplateColumns: "1.1fr 1fr", gap: 0 }}>
                <div className="relative overflow-hidden bg-[var(--a4-surface-elevated)] min-h-[280px]">
                  {featured.featuredImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={featured.featuredImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <div aria-hidden="true" className="hero-bg" style={{ WebkitMaskImage: "none", maskImage: "none" }} />
                      <div className="absolute inset-0 grid place-items-center">
                        <Icon name={featuredVisual.icon} size={64} color={featuredVisual.color} stroke={1.4} />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex flex-col justify-center" style={{ padding: "clamp(28px,3.6vw,44px)" }}>
                  <InsightMeta
                    category={featuredCategory}
                    date={format(new Date(featured.date), "MMM dd, yyyy")}
                    read={featuredRead}
                    color={featuredVisual.color}
                  />
                  <h2
                    className="a4-font-display font-medium text-white mt-4 m-0"
                    style={{ fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-.3px", lineHeight: 1.1, textWrap: "balance" }}
                  >
                    {featured.title}
                  </h2>
                  <p
                    className="a4-font-body text-[var(--a4-on-dark-mute)] mt-[14px] m-0"
                    style={{ fontSize: 15.5, lineHeight: 1.6, textWrap: "pretty" }}
                  >
                    {featured.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-[7px] mt-[22px] a4-font-body text-[15px] font-semibold text-white">
                    Read article <Icon name="arrow-right" size={16} color="#fff" />
                  </span>
                </div>
              </div>
            </LocalizedLink>
          </Reveal>

          <div className="grid gap-5 mt-5" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {pageBlogs.map((p, i) => {
              const visual = getInsightVisual(p.slug);
              const category = p.tags?.[0] ?? "Insights";
              const read = p.readingTime.replace(" read", "");
              return (
                <Reveal key={p.slug} delay={i * 70}>
                  <LocalizedLink
                    href={`/insights/${p.slug}`}
                    className="flex flex-col h-full no-underline bg-[var(--a4-surface-card)] border border-[var(--a4-hairline-light)] rounded-[var(--a4-r-lg)] overflow-hidden transition-[border-color] duration-[180ms] hover:border-[var(--a4-hairline-strong)]"
                  >
                    <div className="h-[150px] bg-[var(--a4-surface-soft)] overflow-hidden">
                      {p.featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.featuredImage} alt="" loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <div className="h-full grid place-items-center">
                          <Icon name={visual.icon} size={40} color={visual.color} stroke={1.4} />
                        </div>
                      )}
                    </div>
                    <div className="p-[22px] pb-6 flex flex-col flex-1">
                      <InsightMeta
                        category={category}
                        date={format(new Date(p.date), "MMM dd, yyyy")}
                        read={read}
                        color={visual.color}
                        light
                      />
                      <h3
                        className="a4-font-display font-medium text-[var(--a4-ink)] mt-[14px] m-0"
                        style={{ fontSize: 20, letterSpacing: "-.2px", lineHeight: 1.15, textWrap: "balance" }}
                      >
                        {p.title}
                      </h3>
                      <p
                        className="a4-font-body text-[var(--a4-mute)] mt-[9px] m-0 flex-1"
                        style={{ fontSize: 14.5, lineHeight: 1.55, textWrap: "pretty" }}
                      >
                        {p.excerpt}
                      </p>
                      <span className="inline-flex items-center gap-1.5 mt-4 a4-font-body text-[14px] font-semibold text-[var(--a4-link)]">
                        Read more <Icon name="arrow-right" size={15} color="var(--a4-link)" />
                      </span>
                    </div>
                  </LocalizedLink>
                </Reveal>
              );
            })}
          </div>

          {gridBlogs.length > INSIGHTS_ITEMS_PER_PAGE && (
            <div className="flex justify-center items-center gap-2 mt-16">
              <button
                type="button"
                onClick={() => setCurrentPage((pg) => Math.max(1, pg - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-[var(--a4-hairline-light)] bg-white a4-font-body text-[var(--a4-mute)] disabled:opacity-50 hover:bg-[var(--a4-surface-soft)] transition-colors"
              >
                Previous
              </button>
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentPage(i + 1)}
                    className="w-10 h-10 rounded-lg text-sm font-medium transition-colors a4-font-body"
                    style={{
                      background: currentPage === i + 1 ? "var(--a4-primary)" : "#fff",
                      color: currentPage === i + 1 ? "#fff" : "var(--a4-mute)",
                      border: currentPage === i + 1 ? "none" : "1px solid var(--a4-hairline-light)",
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage((pg) => Math.min(totalPages, pg + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-[var(--a4-hairline-light)] bg-white a4-font-body text-[var(--a4-mute)] disabled:opacity-50 hover:bg-[var(--a4-surface-soft)] transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {blogs.length > 0 && (
            <p className="text-center mt-8 a4-font-body text-[14px] text-[var(--a4-mute)]">
              Showing {pageBlogs.length} of {gridBlogs.length} articles ({blogs.length} total)
            </p>
          )}
        </Container>
      </section>

      <ServicePortalBand serviceName="your firm" />
    </div>
  );
}
