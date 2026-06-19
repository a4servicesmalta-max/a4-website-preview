// @ts-nocheck
"use client";

import React from "react";
import { Button, Eyebrow, Icon, Container, Reveal } from "@/components/a4-landing/Primitives";

export function LinkedInGlyph({ size = 18, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" style={{ display: "block" }}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
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
