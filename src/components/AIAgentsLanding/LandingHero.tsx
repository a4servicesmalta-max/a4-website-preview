"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { Button } from "@/components/a4-landing/Primitives";
import { PERI, kicker } from "@/components/services/SectionKit";

interface LandingHeroProps {
  namespace: "accounting" | "business";
}

/**
 * Agents landing hero on the shared PageHero: badge as the eyebrow, the title
 * typed with its highlight line on the gradient, the body, the two pills, the
 * free-engagement chip and the four figures as a meta row.
 */
const LandingHero = ({ namespace }: LandingHeroProps) => {
  const { t, i18n } = useTranslation(namespace);

  // Only lead with the bold line when the locale has one — its English fallback
  // used to run straight into the body copy.
  const strong = i18n.exists("hero.bodyStrong", { ns: namespace }) ? t("hero.bodyStrong") : "";
  const body = t("hero.body", { defaultValue: " — running your entire back-office concurrently at a fraction of the cost." });
  const sub = strong ? `${strong}${/^[\s—–-]/.test(body) ? "" : " "}${body}`.trim() : body.replace(/^[\s—–-]+/, "").trim();
  const free = t("hero.freePill", { defaultValue: "First engagement completely free — no contract, no commitment" }).replace(/^✦\s*/, "");

  const stats = [
    { v: t("hero.stats.val1", { defaultValue: "10%" }), l: t("hero.stats.label1", { defaultValue: "of accounting fee" }) },
    { v: t("hero.stats.val2", { defaultValue: "8" }), l: t("hero.stats.label2", { defaultValue: "specialist agents" }) },
    { v: t("hero.stats.val3", { defaultValue: "48h" }), l: t("hero.stats.label3", { defaultValue: "monthly close turnaround" }) },
    { v: t("hero.stats.val4", { defaultValue: "Free" }), l: t("hero.stats.label4", { defaultValue: "first engagement" }) },
  ];

  return (
    <PageHero
      eyebrow={t("hero.badge")}
      title={t("hero.titleLine1", { defaultValue: "Your accounting." })}
      accent={t("hero.titleHighlight", { defaultValue: "Handled by AI agents." })}
      sub={sub}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Button variant="primary" size="lg" href="/contact">
            {t("hero.cta1", { defaultValue: "Get your first month free →" })}
          </Button>
          <Button variant="outline-dark" size="lg" href="#agents">
            {t("hero.cta2", { defaultValue: "Meet the team" })}
          </Button>
        </div>
        <span className="a4-chip a4-chip-dark" style={{ alignSelf: "flex-start", height: "auto", minHeight: 36, padding: "8px 16px", gap: 12, whiteSpace: "normal", lineHeight: 1.35 }}>
          <span className="a4-bullet" style={{ marginTop: 0, background: PERI }} />
          {free}
        </span>
        <div
          style={{
            marginTop: 8,
            paddingTop: 28,
            borderTop: "1px solid rgba(255,255,255,.1)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))",
            gap: "24px 32px",
            maxWidth: 880,
          }}
        >
          {stats.map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: "clamp(34px,3.4vw,48px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1, color: "#FFFFFF" }}>{s.v}</div>
              <div style={{ ...kicker, marginTop: 10, color: "#A1A1AA" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </PageHero>
  );
};

export default LandingHero;
