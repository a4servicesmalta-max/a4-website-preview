"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Button, SectionHead } from "@/components/a4-landing/Primitives";
import { BODY, Band, INDIGO, PERI, SANS, card, gradText, kicker } from "@/components/services/SectionKit";

interface PricingSectionProps {
  namespace: "accounting" | "business";
}

function Check({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 3 }}>
      <path d="M5 12l4 4 10-10" />
    </svg>
  );
}

/** Two plans as the design's alternating cards: the light card with the gradient figure, the dark card beside it. */
const PricingSection = ({ namespace }: PricingSectionProps) => {
  const { t } = useTranslation(namespace);
  const { t: tc } = useTranslation("common");

  const plans = [
    { key: "basic", dark: false, suffix: namespace === "accounting" ? "" : "/ audit", cta: "Get Started" },
    { key: "pro", dark: true, suffix: "", cta: "Contact Sales" },
  ];

  return (
    <Band id="pricing" surface="muted">
      <SectionHead
        n="04"
        align="center"
        eyebrow={tc("nav.pricing")}
        title={
          <>
            {t("pricing.titleLine1")} <span style={{ ...gradText, paddingBottom: ".06em" }}>{t("pricing.titleHighlight")}</span>
          </>
        }
        sub={t("pricing.sub")}
      />

      <div style={{ margin: "clamp(48px,6vw,72px) auto 0", maxWidth: 1000, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", gap: 16 }}>
        {plans.map((p, i) => {
          const c = card(p.dark, { padding: "clamp(28px,3.4vw,44px)", display: "flex", flexDirection: "column" });
          return (
            <div key={p.key} data-fx="rise" data-d={i * 80} className={c.className} style={c.style}>
              <div style={{ ...kicker, color: p.dark ? "#A1A1AA" : "#71717A" }}>{t(`pricing.${p.key}.name`)}</div>
              <div style={{ marginTop: 18, display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 10 }}>
                <span style={{ fontFamily: SANS, fontSize: "clamp(56px,6vw,84px)", fontWeight: 600, letterSpacing: "-0.05em", lineHeight: 1, ...(p.dark ? { color: "#FFFFFF" } : { ...gradText, paddingBottom: ".04em" }) }}>
                  {t(`pricing.${p.key}.price`)}
                </span>
                {p.suffix ? <span style={{ fontFamily: SANS, fontSize: 20, fontWeight: 500, color: p.dark ? "#A1A1AA" : "#71717A" }}>{p.suffix}</span> : null}
              </div>
              <div style={{ marginTop: 8, fontFamily: SANS, fontSize: 17, fontWeight: 500, color: p.dark ? "#E4E4E7" : "#3F3F46" }}>{t(`pricing.${p.key}.sub`)}</div>
              <p style={{ margin: "16px 0 0", fontFamily: BODY, fontSize: 15.5, lineHeight: 1.55, color: p.dark ? "#A1A1AA" : "#52525B" }}>{t(`pricing.${p.key}.desc`)}</p>
              <div style={{ marginTop: 24, paddingTop: 22, borderTop: `1px solid ${p.dark ? "rgba(255,255,255,.1)" : "#E4E4E7"}`, display: "flex", flexDirection: "column", gap: 12 }}>
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} style={{ display: "flex", gap: 12, fontFamily: BODY, fontSize: 15.5, lineHeight: 1.5, color: p.dark ? "#E4E4E7" : "#3F3F46" }}>
                    <Check color={p.dark ? PERI : INDIGO} />
                    <span>{t(`pricing.${p.key}.c${n}`)}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "auto", paddingTop: 32 }}>
                <Button variant={p.dark ? "primary" : "dark"} size="lg" href="/quote" style={{ width: "100%" }}>
                  {p.cta}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Band>
  );
};

export default PricingSection;
