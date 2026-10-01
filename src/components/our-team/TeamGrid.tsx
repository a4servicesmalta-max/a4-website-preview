"use client";

import React from "react";
import Image from "next/image";
import { BODY, Band, INDIGO, INK, PERI, SANS, card, gradTail, kicker } from "@/components/services/SectionKit";
import { GRAD } from "@/components/fx/primitives";

interface TeamMember {
  id?: number;
  name: string;
  role: string;
  image?: string;
  bio: string;
  socials?: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

interface TeamGridProps {
  title?: string;
  subtitle?: string;
  members?: TeamMember[];
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

/** The team as the design's card grid: alternating light and dark cards, monogram (or photo), name, role, bio. */
const TeamGrid = ({ title, subtitle, members = [] }: TeamGridProps) => {
  const total = String(members.length).padStart(2, "0");
  return (
    <Band surface="light">
      {title ? (
        <h2 data-fx="rise" style={{ margin: 0, fontSize: "clamp(40px,5.6vw,92px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.02, color: INK }}>
          {gradTail(title)}
        </h2>
      ) : null}
      {subtitle ? (
        <p data-fx="rise" data-d="100" style={{ margin: "20px 0 0", maxWidth: 680, fontFamily: BODY, fontSize: 18, lineHeight: 1.55, color: "#52525B" }}>
          {subtitle}
        </p>
      ) : null}

      <div style={{ marginTop: "clamp(48px,6vw,72px)", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: 16 }}>
        {members.map((member, index) => {
          const dark = index % 2 === 1;
          const c = card(dark, { padding: 28, minHeight: 330, display: "flex", flexDirection: "column", gap: 14 });
          return (
            <div key={member.id ?? index} data-fx="rise" data-d={(index % 3) * 80} className={c.className} style={c.style}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: dark ? "#A1A1AA" : "#52525B" }}>
                  <span style={{ color: dark ? PERI : INDIGO }}>{String(index + 1).padStart(2, "0")}</span>
                  <span>/ {total}</span>
                </div>
                {member.image ? (
                  <span style={{ position: "relative", width: 64, height: 64, borderRadius: 32, overflow: "hidden", flexShrink: 0 }}>
                    <Image src={member.image} alt={member.name} fill sizes="64px" style={{ objectFit: "cover" }} />
                  </span>
                ) : (
                  <span
                    aria-hidden="true"
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      display: "grid",
                      placeItems: "center",
                      background: dark ? GRAD : INK,
                      color: "#FFFFFF",
                      fontFamily: SANS,
                      fontSize: 22,
                      fontWeight: 600,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {initials(member.name)}
                  </span>
                )}
              </div>
              <h3 style={{ margin: "auto 0 0", paddingTop: 28, fontFamily: SANS, fontSize: "clamp(28px,2.6vw,36px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.08 }}>{member.name}</h3>
              <div style={{ ...kicker, color: dark ? PERI : INDIGO }}>{member.role}</div>
              <p style={{ margin: 0, paddingTop: 14, borderTop: `1px solid ${dark ? "rgba(255,255,255,.1)" : "#E4E4E7"}`, fontFamily: BODY, fontSize: 15.5, lineHeight: 1.55, color: dark ? "#A1A1AA" : "#52525B" }}>
                {member.bio}
              </p>
            </div>
          );
        })}
      </div>
    </Band>
  );
};

export default TeamGrid;
