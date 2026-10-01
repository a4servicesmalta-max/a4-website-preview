"use client";

import React from "react";
import { Button } from "@/components/a4-landing/Primitives";
import { BODY, Band, INDIGO, INK, SANS, TwoLineHeading } from "@/components/services/SectionKit";

interface ValueItem {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface ValuesSectionProps {
  title?: string;
  titleAccent?: string;
  description?: string;
  ctaText?: string;
  items?: ValueItem[];
}

/**
 * "Driven by values" as the design's numbered list: the two-line heading with
 * its gradient line, the description and the pill on the left; the values as
 * numbered rows with hairlines on the right.
 */
const ValuesSection = ({ title, titleAccent, description, ctaText, items = [] }: ValuesSectionProps) => {
  return (
    <Band surface="muted">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "56px 72px", alignItems: "start" }}>
        <div>
          <TwoLineHeading first={title} second={titleAccent} d={0} />
          {description ? (
            <p data-fx="rise" data-d="200" style={{ margin: "24px 0 0", maxWidth: 540, fontFamily: BODY, fontSize: 18, lineHeight: 1.55, color: "#52525B" }}>
              {description}
            </p>
          ) : null}
          {ctaText ? (
            <div data-fx="rise" data-d="280" style={{ marginTop: 32 }}>
              <Button variant="dark" size="lg" href="/careers">
                {ctaText}
              </Button>
            </div>
          ) : null}
        </div>
        <div data-fx="rise" data-d="150" style={{ display: "flex", flexDirection: "column" }}>
          {items.map((value, index) => (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns: "48px minmax(0,1fr)",
                gap: 12,
                padding: "28px 0",
                borderTop: "1px solid #E4E4E7",
                ...(index === items.length - 1 ? { borderBottom: "1px solid #E4E4E7" } : null),
              }}
            >
              <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: INDIGO, paddingTop: 6 }}>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 style={{ margin: 0, fontFamily: SANS, fontSize: "clamp(24px,2.2vw,30px)", fontWeight: 600, letterSpacing: "-0.03em", color: INK }}>{value.title}</h3>
                <p style={{ margin: "8px 0 0", fontFamily: BODY, fontSize: 16.5, lineHeight: 1.55, color: "#52525B" }}>{value.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Band>
  );
};

export default ValuesSection;
