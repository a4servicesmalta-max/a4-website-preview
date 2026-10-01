"use client";

import React from "react";
import { BODY, Band, Eyebrow, G, NumberedRows, ProseWithList } from "@/app/[locale]/services/components/SiteKit";

interface SectionItem {
  title?: string;
  content: string[];
  list?: string[];
}

interface ContentSectionProps {
  title: string;
  description?: string;
  sections: SectionItem[];
  children?: React.ReactNode;
}

/** "A Branded Interface for Client Interaction" → last word on the gradient. */
function withGradEnd(text: string) {
  const cut = text.trim().lastIndexOf(" ");
  if (cut <= 0) return <G>{text}</G>;
  return (
    <>
      {text.slice(0, cut + 1)}
      <G>{text.slice(cut + 1)}</G>
    </>
  );
}

/**
 * Long-form partner content in the design's terms layout: the heading and
 * introduction held on the left, every section as a numbered row on the right.
 */
const ContentSection = ({ title, description, sections, children }: ContentSectionProps) => {
  return (
    <Band surface="light" sec="content">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: "48px 72px", alignItems: "start" }}>
        <div className="a4k-sticky">
          <Eyebrow n="01">Overview</Eyebrow>
          <h2
            data-fx="rise"
            data-d="100"
            style={{ margin: "18px 0 0", fontSize: "clamp(36px,4.2vw,64px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.04, textWrap: "balance" }}
          >
            {withGradEnd(title)}
          </h2>
          {description ? (
            <p data-fx="rise" data-d="200" style={{ margin: "24px 0 0", maxWidth: 520, fontFamily: BODY, fontSize: 17, lineHeight: 1.65, color: "#52525B", textWrap: "pretty" }}>
              {description}
            </p>
          ) : null}
        </div>
        <NumberedRows
          d={150}
          items={sections.map((section, index) => ({
            key: section.title ?? String(index),
            t: section.title,
            body: <ProseWithList content={section.content} list={section.list} />,
          }))}
        />
      </div>
      {children ? <div data-fx="rise" style={{ marginTop: 56 }}>{children}</div> : null}
    </Band>
  );
};

export default ContentSection;
