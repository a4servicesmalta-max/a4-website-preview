// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Logo, Button, Pill, Badge, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
//
// ─── HOW TO CONNECT YOUR LINKEDIN VIDEOS ──────────────────────────────────
// LinkedIn pages are login-gated, so videos can't be pulled automatically.
// To embed a real post: open it on LinkedIn → click the "⋯" (top-right of the
// post) → "Embed this post" → copy the URL inside the iframe's src, which looks
// like:  https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7123456789
// Paste that string as `embed` below. Add as many as you like; the grid grows.
// Leave the array as-is (placeholder entries) to show branded "Watch on
// LinkedIn" cards that link to the company page instead.
// ──────────────────────────────────────────────────────────────────────────

const A4_LINKEDIN_URL = "https://www.linkedin.com/company/a4-servicesltd/";

const LINKEDIN_POSTS = [
  { embed: "", title: "Inside the A4 client portal", blurb: "A short walkthrough of how documents, deadlines and reports live in one place." },
  { embed: "", title: "Automated bookkeeping, explained", blurb: "How we combine automation with professional review for clean monthly records." },
  { embed: "", title: "Audit season, without the scramble", blurb: "What modern audit preparation looks like when everything is already organised." },
];

export function LinkedInGlyph({ size = 18, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" style={{ display: "block" }}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

// A single LinkedIn item: real embed when provided, branded link card otherwise.
export function LinkedInItem({ post, featured }) {
  if (post.embed) {
    return (
      <div style={{ borderRadius: "var(--a4-r-lg)", overflow: "hidden", border: "1px solid var(--a4-hairline-dark)", background: "var(--a4-surface-card)" }}>
        <iframe
          src={post.embed}
          title={post.title || "A4 Services on LinkedIn"}
          loading="lazy"
          allowFullScreen
          style={{ display: "block", width: "100%", height: featured ? 600 : 540, border: 0 }}
        />
      </div>
    );
  }
  // Branded fallback — links out to the company page.
  return (
    <a href={A4_LINKEDIN_URL} target="_blank" rel="noopener noreferrer" style={{
      display: "flex", flexDirection: "column", textDecoration: "none",
      borderRadius: "var(--a4-r-lg)", overflow: "hidden", border: "1px solid var(--a4-hairline-dark)",
      background: "var(--a4-surface-elevated)", height: "100%", transition: "border-color .2s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--a4-hairline-strong)"; const a = e.currentTarget.querySelector(".li-arrow"); if (a) a.style.transform = "translateX(4px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--a4-hairline-dark)"; const a = e.currentTarget.querySelector(".li-arrow"); if (a) a.style.transform = "none"; }}>
      {/* poster */}
      <div style={{ position: "relative", aspectRatio: "16 / 10", background: "#000", overflow: "hidden", borderBottom: "1px solid var(--a4-hairline-dark)" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 70% at 30% 30%, rgba(73,79,223,.26), transparent 70%)" }} />
        <div style={{ position: "absolute", top: 16, left: 16, display: "inline-flex", alignItems: "center", gap: 8 }}>
          <LinkedInGlyph size={18} color="#fff" />
          <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 600, color: "#fff", letterSpacing: ".02em" }}>A4 Services</span>
        </div>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 60, height: 60, borderRadius: 999, border: "1px solid rgba(255,255,255,.35)", background: "rgba(255,255,255,.1)", display: "grid", placeItems: "center" }}>
          <Icon name="play" size={24} color="#fff" stroke={1.6} />
        </div>
      </div>
      {/* meta */}
      <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: featured ? 22 : 19, lineHeight: 1.2, color: "#fff", margin: 0, letterSpacing: "-.2px", textWrap: "balance" }}>{post.title}</h3>
        <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, lineHeight: 1.5, color: "var(--a4-on-dark-mute)", margin: "10px 0 0", textWrap: "pretty" }}>{post.blurb}</p>
        <div className="li-cta" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: "auto", paddingTop: 18, fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, color: "#fff" }}>
          Watch on LinkedIn <Icon name="arrow-up-right" size={16} color="#fff" style={{ transition: "transform .2s ease" }} />
        </div>
      </div>
    </a>
  );
}

export function LinkedInVideos() {
  const hasEmbeds = LINKEDIN_POSTS.some((p) => p.embed);
  return (
    <section style={{ background: "#000", padding: "clamp(64px,9vw,104px) 0", borderTop: "1px solid var(--a4-hairline-dark)" }}>
      <Container>
        <Reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
          <div>
            <Eyebrow dark>From our LinkedIn</Eyebrow>
            <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "#fff", fontSize: "clamp(32px,4.2vw,52px)", lineHeight: 1.04, letterSpacing: "-.02em", margin: "18px 0 0", textWrap: "balance" }}>
              Watch our latest videos
            </h2>
            <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 17, lineHeight: 1.55, color: "var(--a4-on-dark-mute)", margin: "14px 0 0", maxWidth: 460, textWrap: "pretty" }}>
              Short explainers and updates from the A4 team — posted regularly on LinkedIn.
            </p>
          </div>
          <Button variant="primary" size="md" href={A4_LINKEDIN_URL} target="_blank"><LinkedInGlyph size={16} color="#000" /> Follow on LinkedIn</Button>
        </Reveal>

        <div style={{
          display: "grid", gap: 22, marginTop: 48,
          gridTemplateColumns: hasEmbeds ? "repeat(auto-fit, minmax(320px, 1fr))" : "repeat(auto-fit, minmax(300px, 1fr))",
        }}>
          {LINKEDIN_POSTS.map((p, i) => (
            <Reveal key={i} delay={(i % 3) * 80} style={{ display: "flex" }}>
              <div style={{ width: "100%" }}><LinkedInItem post={p} /></div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function Insights() {
  const posts = [
    { cat: "Artificial Intelligence", icon: "cpu", tint: "rgba(73,79,223,.10)", color: "var(--a4-primary)", title: "The AI spending boom: what businesses should learn before investing in AI", excerpt: "As global firms pour billions into AI infrastructure, SMEs face a different question — not whether to adopt AI, but where it creates real value versus overspend." },
    { cat: "Client Communication", icon: "mail-x", tint: "rgba(0,168,126,.10)", color: "var(--a4-accent-teal)", title: "Why email is failing professional services", excerpt: "Email is useful for communication, but it is not built to manage professional service workflows. Inbox-based processes create delays, version confusion and weak accountability." },
    { cat: "Client Portals", icon: "layout-dashboard", tint: "rgba(0,123,194,.10)", color: "var(--accent-light-blue)", title: "Why client portals are becoming essential", excerpt: "Portals are becoming essential for firms that need better document collection, clearer communication, stronger compliance records and smoother client service." },
  ];
  return (
    <section style={{ background: "var(--a4-canvas-light)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
          <div>
            <Eyebrow>Insights &amp; resources</Eyebrow>
            <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "var(--a4-ink)", fontSize: "clamp(32px,4.2vw,52px)", lineHeight: 1.04, letterSpacing: "-.02em", margin: "18px 0 0", textWrap: "balance" }}>
              Latest thinking from A4
            </h2>
            <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 17, lineHeight: 1.55, color: "var(--a4-mute)", margin: "14px 0 0", maxWidth: 460, textWrap: "pretty" }}>
              Practical guidance on compliance, technology and running a business in Malta — published regularly.
            </p>
          </div>
          <Button variant="outline-light" size="md">View all insights <Icon name="arrow-right" size={17} color="var(--a4-ink)" /></Button>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 22, marginTop: 48 }}>
          {posts.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ display: "block", textDecoration: "none", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", overflow: "hidden", background: "var(--a4-canvas-light)", height: "100%", transition: "border-color .2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--a4-hairline-strong)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--a4-hairline-light)")}>
                <div style={{ height: 132, background: p.tint, display: "grid", placeItems: "center", borderBottom: "1px solid var(--a4-hairline-light)" }}>
                  <Icon name={p.icon} size={34} color={p.color} stroke={1.5} />
                </div>
                <div style={{ padding: "22px 22px 24px" }}>
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: p.color }}>{p.cat}</div>
                  <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 19, lineHeight: 1.2, color: "var(--a4-ink)", margin: "12px 0 0", letterSpacing: "-.2px", textWrap: "balance" }}>{p.title}</h3>
                  <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, lineHeight: 1.5, color: "var(--a4-mute)", margin: "10px 0 0", textWrap: "pretty" }}>{p.excerpt}</p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16, fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, color: "var(--a4-ink)" }}>Read more <Icon name="arrow-right" size={15} color="var(--a4-ink)" /></div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
