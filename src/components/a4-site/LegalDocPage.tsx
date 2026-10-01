"use client";

import React from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { PageHero } from "@/app/[locale]/services/components/PageHero";

type Section = {
  h: string;
  p: (string | string[])[];
};

const SANS = "var(--a4x-display)";
const BODY = "var(--a4x-body)";
const INDIGO = "#4F55F1";
const INK = "#09090B";
const two = (n: number) => String(n).padStart(2, "0");

/**
 * Legal documents (privacy, terms, cookies) as the design's numbered terms
 * list: `01` in indigo, Outfit headings, Inter body, hairlines between
 * sections, and on wide screens a sticky index of the section headings.
 * These pages hide the site nav and footer by design.
 */
export function LegalDocPage({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated?: string;
  intro?: string;
  sections: Section[];
}) {
  return (
    <div className="a4-site-page">
      <PageHero eyebrow={eyebrow} title={title} sub={updated ? `Last updated ${updated}` : undefined} />
      <section style={{ position: "relative", padding: "clamp(88px,11vw,160px) clamp(20px,5vw,72px)", background: "#FFFFFF", color: INK }}>
        <div className="cp-legal" style={{ maxWidth: 1280, margin: "0 auto" }}>
          <nav className="cp-legal-toc" aria-label={title}>
            <ol style={{ margin: 0, padding: 0, listStyle: "none", borderTop: "1px solid #E4E4E7" }}>
              {sections.map((s, i) => (
                <li key={s.h} style={{ borderBottom: "1px solid #E4E4E7" }}>
                  <a href={`#legal-${i + 1}`} className="cp-legal-toc-link cp-focus">
                    <span style={{ color: INDIGO, fontWeight: 600 }}>{two(i + 1)}</span>
                    <span>{s.h}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div style={{ minWidth: 0 }}>
            {intro && (
              <p
                data-fx="rise"
                style={{ margin: "0 0 clamp(40px,5vw,64px)", maxWidth: 760, fontFamily: SANS, fontSize: "clamp(20px,1.9vw,26px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.4, color: "#3F3F46", textWrap: "pretty" }}
              >
                {intro}
              </p>
            )}
            {sections.map((s, i) => (
              <div
                key={s.h}
                id={`legal-${i + 1}`}
                data-fx="rise"
                className="cp-legal-row"
                style={{
                  display: "grid",
                  gap: 12,
                  padding: "clamp(28px,3vw,40px) 0",
                  borderTop: "1px solid #E4E4E7",
                  scrollMarginTop: 32,
                  ...(i === sections.length - 1 ? { borderBottom: "1px solid #E4E4E7" } : null),
                }}
              >
                <span style={{ paddingTop: 6, fontFamily: SANS, fontSize: 16, fontWeight: 600, letterSpacing: ".02em", color: INDIGO }}>{two(i + 1)}</span>
                <div style={{ minWidth: 0 }}>
                  <h2 style={{ margin: "0 0 16px", fontFamily: SANS, fontSize: "clamp(24px,2.3vw,32px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.12 }}>{s.h}</h2>
                  {s.p.map((para, j) =>
                    typeof para === "string" ? (
                      <p key={j} style={{ margin: "0 0 14px", maxWidth: 760, fontFamily: BODY, fontSize: 16.5, lineHeight: 1.7, color: "#3F3F46", textWrap: "pretty" }}>
                        {para}
                      </p>
                    ) : (
                      <ul key={j} style={{ margin: "4px 0 16px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10, maxWidth: 760 }}>
                        {para.map((li) => (
                          <li key={li} style={{ display: "flex", gap: 12, fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: "#3F3F46" }}>
                            <span className="a4-bullet" />
                            <span>{li}</span>
                          </li>
                        ))}
                      </ul>
                    ),
                  )}
                </div>
              </div>
            ))}
            <p
              data-fx="rise"
              style={{ margin: "clamp(36px,4vw,56px) 0 0", padding: "22px 26px", borderRadius: 20, background: "#F4F4F5", fontFamily: BODY, fontSize: 15.5, lineHeight: 1.6, color: "#52525B" }}
            >
              Questions about this policy? Email{" "}
              <a href="mailto:info@a4.com.mt" style={{ color: INDIGO, fontWeight: 600, textDecoration: "none" }}>
                info@a4.com.mt
              </a>{" "}
              or visit our{" "}
              <LocalizedLink href="/contact" style={{ color: INDIGO, fontWeight: 600, textDecoration: "none" }}>
                contact page
              </LocalizedLink>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
