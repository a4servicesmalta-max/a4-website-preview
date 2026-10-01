"use client";

import React from "react";
import { Button, Eyebrow, Icon } from "@/components/a4-landing/Primitives";
import { DARK_CARD, DARK_GRID, DriftGlow, gradText } from "@/components/fx/primitives";
import { INDIGO, INK, PERI } from "@/lib/fx/engine";
import LocalizedLink from "@/components/common/LocalizedLink";

export function LinkedInGlyph({ size = 18, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" style={{ display: "block" }}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

const BODY = "var(--a4x-body)";

const POSTS = [
  {
    cat: "Artificial Intelligence",
    slug: "the-ai-spending-boom-what-businesses-should-learn-before-investing-in-ai",
    img: "/assets/insights/ai-spending-boom.jpg",
    title: "The AI spending boom: what businesses should learn before investing in AI",
    excerpt:
      "As global firms pour billions into AI infrastructure, SMEs face a different question — not whether to adopt AI, but where it creates real value versus overspend.",
  },
  {
    cat: "Client Communication",
    slug: "why-email-is-failing-professional-services",
    img: "/assets/insights/email-failing.jpg",
    title: "Why email is failing professional services",
    excerpt:
      "Email is useful for communication, but it is not built to manage professional service workflows. Inbox-based processes create delays, version confusion and weak accountability.",
  },
  {
    cat: "Client Portals",
    slug: "why-client-portals-are-becoming-essential",
    img: "/assets/insights/client-portals.jpg",
    title: "Why client portals are becoming essential",
    excerpt:
      "Portals are becoming essential for firms that need better document collection, clearer communication, stronger compliance records and smoother client service.",
  },
];

const INSIGHTS_CSS = `
  .a4-ins-card { transition: border-color .35s, box-shadow .35s; }
  .a4-ins-card:hover { border-color: rgba(79,85,241,.45) !important; box-shadow: 0 24px 60px rgba(79,85,241,.18); }
  .a4-ins-card[data-dark]:hover { border-color: rgba(139,143,247,.45) !important; box-shadow: 0 24px 60px rgba(0,0,0,.35); }
  .a4-ins-card:focus-visible { outline: 3px solid rgba(79,85,241,.55); outline-offset: 3px; }
`;

/** "Latest thinking from A4" — eyebrow + H2 on dark, then the alternating card grid. */
export function Insights() {
  return (
    <section
      style={{ position: "relative", overflow: "hidden", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", color: "#FFFFFF", background: DARK_GRID, fontFamily: "var(--a4x-display)" }}
    >
      <style>{INSIGHTS_CSS}</style>
      <DriftGlow left="-18%" top="-30%" strength={0.22} />
      <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 28 }}>
          <div style={{ flex: "1 1 560px", maxWidth: 840 }}>
            <div data-fx="rise">
              <Eyebrow dark>Insights &amp; resources</Eyebrow>
            </div>
            <h2 data-fx="rise" data-d="100" style={{ margin: "16px 0 0", fontSize: "clamp(40px,5.6vw,92px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.02, textWrap: "balance" }}>
              Latest thinking from <span style={{ ...gradText, paddingBottom: ".06em" }}>A4</span>
            </h2>
            <p data-fx="rise" data-d="200" style={{ margin: "20px 0 0", maxWidth: 480, fontFamily: BODY, fontSize: 17, lineHeight: 1.55, color: "#A1A1AA", textWrap: "pretty" }}>
              Practical guidance on compliance, technology and running a business in Malta — published regularly.
            </p>
          </div>
          <div data-fx="rise" data-d="200">
            <Button variant="outline-dark" size="lg" href="/insights">
              View all insights <Icon name="arrow-right" size={17} color="#FFFFFF" />
            </Button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: 16, marginTop: "clamp(40px,5vw,64px)" }}>
          {POSTS.map((p, i) => {
            const dark = i % 2 === 1;
            return (
              <div key={p.slug} data-fx="rise" data-d={i * 80} style={{ display: "flex" }}>
                <LocalizedLink
                  href={`/insights/${p.slug}`}
                  className="a4-ins-card"
                  data-dark={dark ? "" : undefined}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    textDecoration: "none",
                    borderRadius: 24,
                    overflow: "hidden",
                    background: dark ? DARK_CARD : "#FFFFFF",
                    border: `1px solid ${dark ? "rgba(255,255,255,.1)" : "#E4E4E7"}`,
                    color: dark ? "#FFFFFF" : INK,
                  }}
                >
                  <div style={{ height: 184, overflow: "hidden", background: dark ? "#18181B" : "#F4F4F5", borderBottom: `1px solid ${dark ? "rgba(255,255,255,.08)" : "#E4E4E7"}` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.img} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                  <div style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, fontSize: 15, fontWeight: 600, letterSpacing: ".02em", color: dark ? "#A1A1AA" : "#52525B" }}>
                      <span style={{ color: dark ? PERI : INDIGO }}>{String(i + 1).padStart(2, "0")}</span>
                      <span>{p.cat}</span>
                    </div>
                    <h3 style={{ margin: "14px 0 0", fontSize: 23, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.18, textWrap: "balance" }}>{p.title}</h3>
                    <p style={{ margin: "12px 0 0", fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}>{p.excerpt}</p>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: "auto", paddingTop: 22, fontSize: 15, fontWeight: 600 }}>
                      Read more <Icon name="arrow-right" size={16} color={dark ? PERI : INDIGO} />
                    </div>
                  </div>
                </LocalizedLink>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
