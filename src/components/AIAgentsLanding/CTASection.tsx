"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/a4-landing/Primitives";
import { TypeText, Words } from "@/components/fx/primitives";
import { BODY, Band, PERI } from "@/components/services/SectionKit";

interface CTASectionProps {
  namespace: "accounting" | "business";
}

/** The design's dark CTA: typed heading with its gradient line on the left, the two pills in a card on the right. */
const CTASection = ({ namespace }: CTASectionProps) => {
  const { t } = useTranslation(namespace);
  const line1 = t("cta.titleLine1").trim();
  const highlight = t("cta.titleHighlight").trim();
  const words = highlight.split(/\s+/);
  const parts = words.length > 1 ? [{ t: words.slice(0, -1).join(" ") }, { t: words[words.length - 1], g: true }] : [{ t: highlight, g: true }];

  return (
    <Band surface="dark" glow>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))", gap: "56px 72px", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "clamp(44px,6.4vw,104px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.06, color: "#FFFFFF" }}>
            <TypeText segments={[{ t: line1, c: "#FFFFFF" }]} per={45} caret={PERI} style={{ display: "inline-block" }} />
            <Words d={Math.min(1400, 200 + Array.from(line1).length * 45)} style={{ fontWeight: 600 }} parts={parts} />
          </h2>
          <p data-fx="rise" data-d="700" style={{ margin: "28px 0 0", maxWidth: 560, fontFamily: BODY, fontSize: "clamp(17px,1.5vw,20px)", lineHeight: 1.55, color: "#A1A1AA" }}>
            {t("cta.sub")}
          </p>
        </div>
        <div
          data-fx="rise"
          data-d="200"
          style={{
            padding: "clamp(24px,3.4vw,40px)",
            borderRadius: 28,
            background: "rgba(24,24,27,.92)",
            border: "1px solid rgba(255,255,255,.1)",
            boxShadow: "0 40px 100px rgba(0,0,0,.45)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <Button variant="primary" size="lg" href="/contact" style={{ width: "100%", height: 64, fontSize: 19 }}>
            {t("cta.btn1")}
          </Button>
          <Button variant="outline-dark" size="lg" href="/auditor-questionnaire" style={{ width: "100%", height: 64, fontSize: 19 }}>
            {t("cta.btn2", { defaultValue: "Try the Dashboard" })}
          </Button>
        </div>
      </div>
    </Band>
  );
};

export default CTASection;
