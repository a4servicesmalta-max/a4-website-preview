"use client";

import React from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Icon } from "@/components/a4-landing/Primitives";
import type { ResourceCard } from "@/data/a4ResourcesSiteData";

const SANS = "var(--a4x-display)";

/**
 * A resource as a 24px card in the A4 design language: "01 / 21" and an arrow
 * ring on top, the icon, title and line below. Light or dark (grids alternate).
 */
export function ResourceLinkCard({
  card,
  delay = 0,
  index,
  total,
  dark = false,
}: {
  card: ResourceCard;
  delay?: number;
  /** Position in the grid, for the "01 / 21" counter. */
  index?: number;
  total?: number;
  dark?: boolean;
}) {
  const two = (n: number) => String(n).padStart(2, "0");
  return (
    <LocalizedLink
      href={card.href}
      data-fx="rise"
      data-d={delay || undefined}
      className={`resource-link-card cp-card cp-focus${dark ? " cp-dark" : ""}`}
      style={{ minHeight: 280, padding: 28, display: "flex", flexDirection: "column", gap: 14 }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        {index != null ? (
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: dark ? "#A1A1AA" : "#52525B" }}>
            <span style={{ color: dark ? "#8B8FF7" : "#4F55F1" }}>{two(index + 1)}</span>
            {total != null ? <span>/ {two(total)}</span> : null}
          </div>
        ) : (
          <span />
        )}
        <span
          aria-hidden="true"
          className="cp-arrow"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            border: `1px solid ${dark ? "rgba(255,255,255,.18)" : "#E4E4E7"}`,
            background: dark ? "rgba(255,255,255,.06)" : "#FFFFFF",
          }}
        >
          <Icon name="arrow-up-right" size={18} color={dark ? "#FFFFFF" : "#09090B"} />
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 28 }} />
      <Icon name={card.icon} size={28} color={dark ? "#8B8FF7" : "#4F55F1"} stroke={1.6} />
      <h3 style={{ margin: 0, fontFamily: SANS, fontSize: "clamp(26px,2.2vw,30px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.1, color: dark ? "#FFFFFF" : "#09090B" }}>
        {card.t}
      </h3>
      <p style={{ margin: 0, fontFamily: SANS, fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.4, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}>
        {card.s}
      </p>
    </LocalizedLink>
  );
}
