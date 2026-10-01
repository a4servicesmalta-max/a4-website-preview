"use client";

import React from "react";
import { format, parseISO } from "date-fns";
import LocalizedLink from "@/components/common/LocalizedLink";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";
import { Button, Icon } from "@/components/a4-landing/Primitives";
import { MUTED_GLOW, TypeText, Words } from "@/components/fx/primitives";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import type { BlogPost } from "@/utils/blog";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";

const SANS = "var(--a4x-display)";
const BODY = "var(--a4x-body)";
const INDIGO = "#4F55F1";
const PERI = "#8B8FF7";
const INK = "#09090B";

function formatArticleDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "d MMMM yyyy");
  } catch {
    return dateStr;
  }
}

export function ArticlePageContent({ blog }: { blog: BlogPost }) {
  const href = useLocalizedHref();
  const category = blog.category || blog.tags?.[0] || "Insights";

  return (
    <div className="a4-site-page">
      <PageHero eyebrow={category} title={blog.title}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <span className="a4-chip a4-chip-dark">
            <Icon name="pen-line" size={15} color={PERI} /> <span style={{ color: "#FFFFFF" }}>{blog.author || "A4 Team"}</span>
          </span>
          <span className="a4-chip a4-chip-dark">{formatArticleDate(blog.date)}</span>
          <span className="a4-chip a4-chip-dark">{blog.readingTime}</span>
        </div>
      </PageHero>

      {/* The article: a readable column on white */}
      <section style={{ position: "relative", padding: "clamp(72px,9vw,128px) clamp(20px,5vw,72px) clamp(88px,11vw,150px)", background: "#FFFFFF", color: INK }}>
        <div className="cp-article" style={{ maxWidth: 720, margin: "0 auto" }}>
          {blog.featuredImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={blog.featuredImage}
              alt={blog.title}
              loading="eager"
              data-fx="rise"
              style={{ display: "block", width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: 24, border: "1px solid #E4E4E7", marginBottom: 40 }}
            />
          )}
          {!!blog.keyTakeaways?.length && (
            <div data-fx="rise" style={{ marginBottom: 44, padding: "26px 28px", borderRadius: 24, border: "1px solid #E4E4E7", background: "#FAFAFA" }}>
              <div style={{ fontFamily: BODY, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: INDIGO }}>Key takeaways</div>
              <ul style={{ margin: "16px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {blog.keyTakeaways.map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, fontFamily: SANS, fontSize: 18, fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.45, color: INK }}>
                    <span className="a4-bullet" style={{ marginTop: 9 }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <MarkdownRenderer content={blog.content} />

          {!!blog.faq?.length && (
            <div style={{ marginTop: 64 }}>
              <h2 data-fx="rise" style={{ margin: "0 0 24px", fontFamily: SANS, fontSize: "clamp(30px,3vw,42px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.05, color: INK }}>
                Frequently asked questions
              </h2>
              <div style={{ borderBottom: "1px solid #E4E4E7" }}>
                {blog.faq.map((f, i) => (
                  <details key={i} className="cp-faq-item" data-fx="rise" data-d={i * 60} style={{ borderTop: "1px solid #E4E4E7" }}>
                    <summary className="cp-acc-btn">
                      <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, letterSpacing: ".02em", color: INDIGO }}>{String(i + 1).padStart(2, "0")}</span>
                      <span style={{ fontFamily: SANS, fontSize: "clamp(18px,1.6vw,21px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.3, color: INK }}>{f.q}</span>
                      <span className="cp-acc-plus" aria-hidden="true">
                        <Icon name="plus" size={18} color={INK} stroke={2} />
                      </span>
                    </summary>
                    <p className="cp-acc-answer" style={{ paddingRight: 0 }}>
                      {f.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 56, paddingTop: 28, borderTop: "1px solid #E4E4E7" }}>
            <LocalizedLink href="/insights" className="cp-link cp-link-back cp-focus">
              <Icon name="arrow-left" size={16} color={INDIGO} /> Back to Insights
            </LocalizedLink>
          </div>
        </div>
      </section>

      {/* Closing CTA — on the muted surface, so the light/dark rhythm holds into the dark footer */}
      <section style={{ position: "relative", overflow: "hidden", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", color: INK, background: MUTED_GLOW }}>
        <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto" }}>
          <h2 style={{ margin: 0, maxWidth: 1100, fontFamily: SANS, fontSize: "clamp(44px,6.4vw,112px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.06 }}>
            <TypeText as="span" segments={[{ t: "Numbers handled properly.", c: INK }]} per={38} style={{ display: "block" }} />
            <Words as="span" d={1000} style={{ display: "block", fontWeight: 600 }} parts={[{ t: "Always.", g: true }]} />
          </h2>
          <div style={{ marginTop: "clamp(36px,4vw,56px)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "24px 40px" }}>
            <p data-fx="rise" data-d="1100" style={{ margin: 0, maxWidth: 560, fontFamily: SANS, fontSize: "clamp(18px,1.6vw,22px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.45, color: "#52525B", textWrap: "pretty" }}>
              Accounting, tax, audit and corporate services from a licensed Malta audit firm — delivered through one secure portal.
            </p>
            <div data-fx="rise" data-d="1220" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Button variant="dark" size="lg" href={href("/quote")}>
                Get a tailored quote <Icon name="arrow-right" size={18} color="#FFFFFF" />
              </Button>
              <Button variant="outline-light" size="lg" href={href("/contact")}>
                Book a consultation
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
