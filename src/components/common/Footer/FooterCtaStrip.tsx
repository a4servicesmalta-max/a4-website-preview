"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import LocalizedLink from "@/components/common/LocalizedLink";
import { TypeText, Words } from "@/components/fx/primitives";
import { BOOK_A_CALL_PATH } from "@/lib/external-links";

/**
 * The closing call to action every page ends on — the "Accept your
 * quotation." band of the A4 design, pointed at the two ways to start.
 */
export default function FooterCtaStrip() {
  const { t } = useTranslation("common");
  return (
    <section style={{ position: "relative", padding: "clamp(110px,14vw,190px) clamp(20px,5vw,72px) clamp(64px,8vw,96px)" }}>
      <div
        style={{
          position: "relative",
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
          gap: "40px 72px",
          alignItems: "end",
        }}
      >
        <div style={{ fontSize: "clamp(44px,6.4vw,112px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.06 }}>
          <TypeText segments={[{ t: "Ready when", c: "#FFFFFF" }]} per={45} caret="#8B8FF7" style={{ display: "inline-block" }} />
          <Words d={560} style={{ fontWeight: 600 }} parts={[{ t: "you are.", g: true }]} />
        </div>
        <div data-fx="rise" data-d="300" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <p style={{ margin: 0, maxWidth: 560, fontSize: "clamp(18px,1.8vw,24px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.4, color: "#A1A1AA" }}>
            {t("footer.ctaStripTitle")}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <LocalizedLink href="/quote" className="a4-btn a4-btn-light">
              Get a quote
            </LocalizedLink>
            <LocalizedLink href={BOOK_A_CALL_PATH} className="a4-btn a4-btn-ghost">
              {t("footer.ctaStripButton")}
            </LocalizedLink>
          </div>
        </div>
      </div>
    </section>
  );
}
