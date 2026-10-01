"use client";

import { Icon } from "@/components/a4-landing/Primitives";
import { usePagesTranslation } from "@/hooks/usePagesTranslation";
import { BODY, Band, GRID2, WordCard } from "@/app/[locale]/services/components/SiteKit";
import { PartnerSubpageLayout, usePartnerSections } from "./PartnerSubpageLayout";

export default function WhiteLabelPageContent() {
  const { t } = usePagesTranslation("partners");
  const sections = usePartnerSections(t, "whiteLabel", 6);

  return (
    <PartnerSubpageLayout
      icon="palette"
      modelLabel="White-label"
      pageTitle={t("whiteLabel.pageHeader.title")}
      heroTitle={t("whiteLabel.hero.title")}
      heroDescription={t("whiteLabel.hero.description")}
      ctaLabel={t("whiteLabel.hero.cta")}
      ctaHref="/contact"
      sections={sections}
      currentHref="/partners/white-label"
    >
      {/* The two portals a white-label partner runs — the design's card pair. */}
      <Band surface="muted" sec="portals">
        <div style={GRID2}>
          {(["client", "audit"] as const).map((key, i) => {
            const dark = i % 2 === 1;
            return (
              <WordCard
                key={key}
                href={key === "client" ? "/partners/white-label/client-portal" : "/partners/white-label/audit-portal"}
                ariaLabel={t(`whiteLabel.experience.${key}.cta`)}
                i={i}
                total={2}
                word={key === "client" ? "Client portal" : "Audit portal"}
                fx={key === "client" ? "scatter" : "tighten"}
                icon={key === "client" ? "layout-dashboard" : "clipboard-check"}
                line={t(`whiteLabel.experience.${key}.title`)}
                dark={dark}
                d={i * 80}
                minHeight={420}
                go={
                  <>
                    {t(`whiteLabel.experience.${key}.cta`)} <Icon name="arrow-right" size={14} color="currentColor" />
                  </>
                }
              >
                <p style={{ margin: 0, fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}>
                  {t(`whiteLabel.experience.${key}.description`)}
                </p>
              </WordCard>
            );
          })}
        </div>
      </Band>
    </PartnerSubpageLayout>
  );
}
