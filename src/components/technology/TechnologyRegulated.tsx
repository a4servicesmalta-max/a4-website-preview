"use client";

import React from "react";
import { Eyebrow } from "@/components/fx/primitives";
import { BODY, Band, DocHead, DocPanel, INDIGO, NumberedRows, SANS, StatusPill, gradTail } from "@/components/services/SectionKit";

interface WorkspaceCard {
  title: string;
  description: string;
  status?: string;
  links: string[];
}

interface TechnologyRegulatedProps {
  title: string;
  intro: string;
  features: string[];
  footer: string;
  availabilityTitle: string;
  availabilityDescription: string;
  handleTitle: string;
  workspaceCards: WorkspaceCard[];
  /** Section number for the eyebrow ("04"). */
  n?: string;
  /** Eyebrow label. */
  eyebrow?: string;
}

/**
 * "Designed for regulated environments" on the dark grid: H2 with its gradient
 * word, the intro and the four guarantees as numbered rows, availability for
 * firms — and the workspace document beside it.
 */
const TechnologyRegulated = ({
  title,
  intro,
  features,
  footer,
  availabilityTitle,
  availabilityDescription,
  handleTitle,
  workspaceCards,
  n,
  eyebrow,
}: TechnologyRegulatedProps) => {
  return (
    <Band surface="dark" sweep>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-14 lg:gap-[72px] items-start">
        <div>
          {eyebrow ? (
            <Eyebrow n={n} dark>
              {eyebrow}
            </Eyebrow>
          ) : null}
          <h2 data-fx="rise" data-d="100" style={{ margin: eyebrow ? "16px 0 0" : 0, fontSize: "clamp(40px,5vw,80px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.02, color: "#FFFFFF", textWrap: "balance" }}>
            {gradTail(title)}
          </h2>
          <p data-fx="rise" data-d="200" style={{ margin: "22px 0 26px", maxWidth: 560, fontFamily: BODY, fontSize: 18, lineHeight: 1.55, color: "#A1A1AA" }}>
            {intro}
          </p>
          <NumberedRows dark items={features} d={260} />
          <p data-fx="rise" data-d="320" style={{ margin: "26px 0 0", maxWidth: 560, fontFamily: SANS, fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.4, color: "#E4E4E7" }}>
            {footer}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <div data-fx="rise" data-d="150" data-dy="70">
            <DocPanel style={{ boxShadow: "0 40px 100px rgba(0,0,0,.45)" }}>
              <DocHead title={handleTitle} />
              <div style={{ padding: "16px 24px 8px" }}>
                {workspaceCards.map((c, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "32px minmax(0,1fr)", gap: 12, padding: "16px 0", borderTop: "1px solid #E4E4E7" }}>
                    <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: INDIGO, paddingTop: 2 }}>{String(i + 1).padStart(2, "0")}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        <span style={{ fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em" }}>{c.title}</span>
                        {c.status ? (
                          <StatusPill tone="ink" style={{ height: 24, fontSize: 12 }}>
                            {c.status}
                          </StatusPill>
                        ) : null}
                      </div>
                      <div style={{ marginTop: 4, fontFamily: BODY, fontSize: 14, lineHeight: 1.5, color: "#52525B" }}>{c.description}</div>
                      <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {c.links.map((l, k) => (
                          <StatusPill key={k} tone={k === 0 ? "indigo" : "line"} style={{ height: 26, fontSize: 12 }}>
                            {l}
                          </StatusPill>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ height: 16, background: "#FAFAFA", borderTop: "1px solid #E4E4E7" }} />
            </DocPanel>
          </div>
          <div
            data-fx="rise"
            data-d="240"
            style={{ padding: "26px 28px", borderRadius: 24, border: "1px solid rgba(255,255,255,.1)", background: "rgba(24,24,27,.72)" }}
          >
            <h3 style={{ margin: 0, fontFamily: SANS, fontSize: 24, fontWeight: 600, letterSpacing: "-0.03em", color: "#FFFFFF" }}>{availabilityTitle}</h3>
            <p style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: "#A1A1AA" }}>{availabilityDescription}</p>
          </div>
        </div>
      </div>
    </Band>
  );
};

export default TechnologyRegulated;
