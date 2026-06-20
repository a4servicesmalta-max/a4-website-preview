"use client";

import React from "react";
import { format, parseISO } from "date-fns";
import LocalizedLink from "@/components/common/LocalizedLink";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";
import { Button, Container, Icon } from "@/components/a4-landing/Primitives";
import { getInsightVisual } from "@/data/a4InsightsSiteData";
import type { BlogPost } from "@/utils/blog";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";

function formatArticleDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "d MMMM yyyy");
  } catch {
    return dateStr;
  }
}

export function ArticlePageContent({ blog }: { blog: BlogPost }) {
  const href = useLocalizedHref();
  const visual = getInsightVisual(blog.slug);
  const category = blog.category || blog.tags?.[0] || "Insights";

  return (
    <div className="a4-site-page">
      <section
        id="top"
        className="relative overflow-hidden bg-black"
        style={{ padding: "clamp(56px,8vw,100px) 0 clamp(44px,6vw,72px)" }}
      >
        <div aria-hidden="true" className="hero-bg" />
        <Container style={{ position: "relative", textAlign: "center", maxWidth: 880 }}>
          <span
            className="inline-block a4-font-body text-[11.5px] font-bold tracking-[.08em] uppercase text-white rounded-[var(--a4-r-full)] py-[6px] px-[14px]"
            style={{ background: visual.color }}
          >
            {category}
          </span>
          <h1
            className="a4-font-display font-medium text-white mx-auto mt-[22px] max-w-[820px]"
            style={{
              fontSize: "clamp(30px,4.6vw,58px)",
              lineHeight: 1.05,
              letterSpacing: "-.025em",
              textWrap: "balance",
            }}
          >
            {blog.title}
          </h1>
          <div className="flex items-center justify-center gap-[10px] mt-[22px] flex-wrap">
            <span className="inline-flex items-center gap-2 a4-font-body text-[14.5px] text-[var(--a4-on-dark-mute)]">
              <Icon name="pen-line" size={15} color="var(--a4-on-dark-mute)" /> {blog.author || "A4 Team"}
            </span>
            <span className="text-[var(--a4-stone)]">·</span>
            <span className="a4-font-body text-[14.5px] text-[var(--a4-on-dark-mute)]">{formatArticleDate(blog.date)}</span>
            <span className="text-[var(--a4-stone)]">·</span>
            <span className="a4-font-body text-[14.5px] text-[var(--a4-on-dark-mute)]">{blog.readingTime}</span>
          </div>
          <div className="a4-beam mx-auto mt-[26px]" aria-hidden="true" style={{ width: 130, height: 2 }} />
        </Container>
      </section>

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(52px,7vw,84px) 0 clamp(64px,9vw,100px)" }}>
        <Container>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            {blog.featuredImage && (
              <img
                src={blog.featuredImage}
                alt={blog.title}
                loading="eager"
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  objectFit: "cover",
                  borderRadius: "var(--a4-r-lg)",
                  border: "1px solid var(--a4-hairline-light)",
                  marginBottom: 28,
                }}
              />
            )}
            {!!blog.keyTakeaways?.length && (
              <div
                style={{
                  background: "var(--a4-surface-soft)",
                  borderLeft: "3px solid var(--a4-primary)",
                  borderRadius: "var(--a4-r-lg)",
                  padding: "18px 20px",
                  marginBottom: 28,
                }}
              >
                <div
                  className="a4-font-body"
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".06em",
                    color: "var(--a4-primary)",
                    marginBottom: 10,
                  }}
                >
                  Key takeaways
                </div>
                <ul
                  className="a4-font-body"
                  style={{
                    margin: 0,
                    paddingLeft: 20,
                    color: "var(--a4-ink)",
                    fontSize: 15.5,
                    lineHeight: 1.6,
                  }}
                >
                  {blog.keyTakeaways.map((item, i) => (
                    <li key={i} style={{ marginBottom: 6 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <MarkdownRenderer content={blog.content} />
            {!!blog.faq?.length && (
              <div style={{ marginTop: 40 }}>
                <h2
                  className="a4-font-display"
                  style={{
                    fontSize: "clamp(24px,3vw,34px)",
                    fontWeight: 500,
                    letterSpacing: "-.02em",
                    color: "var(--a4-ink)",
                    margin: "0 0 18px",
                  }}
                >
                  Frequently asked questions
                </h2>
                {blog.faq.map((f, i) => (
                  <details
                    key={i}
                    className="a4-font-body"
                    style={{
                      borderTop: "1px solid var(--a4-hairline-light)",
                      borderBottom:
                        i === blog.faq!.length - 1
                          ? "1px solid var(--a4-hairline-light)"
                          : "none",
                      padding: "14px 0",
                    }}
                  >
                    <summary
                      style={{
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 16,
                        color: "var(--a4-ink)",
                        listStyle: "none",
                      }}
                    >
                      {f.q}
                    </summary>
                    <p
                      style={{
                        margin: "10px 0 0",
                        fontSize: 15.5,
                        lineHeight: 1.6,
                        color: "var(--a4-mute)",
                      }}
                    >
                      {f.a}
                    </p>
                  </details>
                ))}
              </div>
            )}
          </div>
          <div
            className="mx-auto mt-12 pt-7"
            style={{ maxWidth: 720, borderTop: "1px solid var(--a4-hairline-light)" }}
          >
            <LocalizedLink
              href="/insights"
              className="inline-flex items-center gap-2 a4-font-body text-[15px] font-semibold no-underline"
              style={{ color: "var(--a4-link)" }}
            >
              <Icon name="arrow-left" size={16} color="var(--a4-link)" /> Back to Insights
            </LocalizedLink>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-black" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <div aria-hidden="true" className="hero-bg" />
        <Container style={{ position: "relative", textAlign: "center", maxWidth: 720 }}>
          <h2
            className="a4-font-display font-medium text-white m-0"
            style={{ fontSize: "clamp(30px,4.4vw,52px)", lineHeight: 1.04, letterSpacing: "-.025em", textWrap: "balance" }}
          >
            Numbers handled properly. Always.
          </h2>
          <p
            className="a4-font-body text-[var(--a4-on-dark-mute)] mx-auto mt-4 max-w-[520px] text-[18px] leading-[1.6] mb-0"
            style={{ textWrap: "pretty" }}
          >
            Accounting, tax, audit and corporate services from a licensed Malta audit firm — delivered through one secure portal.
          </p>
          <div className="flex gap-3 mt-8 justify-center flex-wrap">
            <Button variant="primary" size="lg" href={href("/quote")}>
              Get a tailored quote <Icon name="arrow-right" size={18} color="#000" />
            </Button>
            <Button variant="outline-dark" size="lg" href={href("/contact")}>
              Book a consultation
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
