"use client";

import React from "react";
import { Icon, SectionHead } from "@/components/a4-landing/Primitives";
import LocalizedLink from "@/components/common/LocalizedLink";
import { BODY, Band, INDIGO, PERI, SANS, card, gradTail, sentence } from "@/components/services/SectionKit";

interface TechnologyCard {
  title: string;
  description: string;
  /** Kept for compatibility — cards carry a line icon now. */
  image?: string;
  /** Lucide icon name for the card. */
  icon?: string;
  /** The component's own page; renders "Read more" as a link. */
  href?: string;
}

interface TechnologyComponentProps {
  badge: string;
  title: string;
  description: string;
  readMoreText: string;
  items: TechnologyCard[];
  /** Section number for the eyebrow ("03"). */
  n?: string;
}

/** The technology components as the design's card grid, alternating light and dark, each linking to its page. */
const TechnologyComponent = ({ badge, title, description, readMoreText, items, n }: TechnologyComponentProps) => {
  const total = String(items.length).padStart(2, "0");
  return (
    <Band surface="white">
      <SectionHead n={n} eyebrow={sentence(badge)} title={gradTail(title)} sub={description} />
      <div style={{ marginTop: "clamp(48px,6vw,72px)", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 270px), 1fr))", gap: 16 }}>
        {items.map((it, i) => {
          const dark = i % 2 === 1;
          const c = card(dark, { padding: 28, minHeight: 360, display: "flex", flexDirection: "column", gap: 16 });
          return (
            <div key={i} data-fx="rise" data-d={i * 80} className={c.className} style={c.style}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: dark ? "#A1A1AA" : "#52525B" }}>
                  <span style={{ color: dark ? PERI : INDIGO }}>{String(i + 1).padStart(2, "0")}</span>
                  <span>/ {total}</span>
                </div>
                <span style={{ width: 48, height: 48, borderRadius: 14, display: "grid", placeItems: "center", background: dark ? "rgba(139,143,247,.16)" : "rgba(79,85,241,.1)" }}>
                  <Icon name={it.icon || "layout-dashboard"} size={22} color={dark ? PERI : INDIGO} />
                </span>
              </div>
              <h3 style={{ margin: "24px 0 0", fontFamily: SANS, fontSize: "clamp(24px,2vw,28px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.12 }}>{it.title}</h3>
              <p style={{ margin: 0, fontFamily: BODY, fontSize: 15.5, lineHeight: 1.55, color: dark ? "#A1A1AA" : "#52525B", flex: 1 }}>{it.description}</p>
              {it.href ? (
                <LocalizedLink
                  href={it.href}
                  className="a4-btn"
                  style={{
                    alignSelf: "flex-start",
                    height: 40,
                    padding: "0 16px",
                    fontSize: 14.5,
                    textDecoration: "none",
                    border: `1px solid ${dark ? "rgba(255,255,255,.22)" : "#E4E4E7"}`,
                    background: dark ? "rgba(255,255,255,.06)" : "#FFFFFF",
                    color: dark ? "#FFFFFF" : "#09090B",
                  }}
                >
                  {readMoreText}
                  <Icon name="arrow-up-right" size={15} color={dark ? "#FFFFFF" : "#09090B"} />
                </LocalizedLink>
              ) : null}
            </div>
          );
        })}
      </div>
    </Band>
  );
};

export default TechnologyComponent;
