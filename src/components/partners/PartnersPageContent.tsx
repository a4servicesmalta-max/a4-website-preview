"use client";

import React, { useMemo } from "react";
import PartnerCard from "@/components/partners/PartnerCard";
import { usePagesTranslation } from "@/hooks/usePagesTranslation";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { Band, GRID2, Head, NumberedRows } from "@/app/[locale]/services/components/SiteKit";

/**
 * The translated partners overview (kept for the localised route). Same
 * patterns as /partners: hero, a card grid of models, numbered rows for the
 * assessment criteria.
 */
const PartnersPageContent = () => {
  const { t } = usePagesTranslation("partners");

  const partnerModels = useMemo(
    () =>
      [0, 1, 2, 3].map((i) => ({
        title: t(`models.${i}.title`),
        description: t(`models.${i}.description`),
        link: t(`models.${i}.link`),
        iconIndex: Number(t(`models.${i}.iconIndex`)),
      })),
    [t]
  );

  const assessmentItems = useMemo(
    () =>
      [0, 1, 2, 3, 4, 5].map((i) => ({
        title: t(`assessmentItems.${i}.title`),
        body: t(`assessmentItems.${i}.body`),
      })),
    [t]
  );

  return (
    <main style={{ background: "#09090B" }}>
      <PageHero eyebrow={t("pageHeader.breadcrumbs.0.label")} title={t("pageHeader.title")} />

      <Band surface="light" sec="models">
        <Head n="01" eyebrow={t("pageHeader.breadcrumbs.0.label")} title={t("collaborationTitle")} sub={t("collaborationSubtitle")} />
        <div style={{ ...GRID2, marginTop: 40 }}>
          {partnerModels.map((model, index) => (
            <PartnerCard
              key={model.link}
              title={model.title}
              description={model.description}
              link={model.link}
              learnMoreText={t("learnMore")}
              iconIndex={model.iconIndex}
              delay={(index % 2) * 0.08}
            />
          ))}
        </div>
      </Band>

      <Band surface="white" sec="assessment">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "56px 72px", alignItems: "start" }}>
          <Head title={t("assessmentTitle")} sub={t("assessmentIntro")} />
          <NumberedRows d={150} items={assessmentItems.map((item) => ({ key: item.title, t: item.title, body: item.body }))} />
        </div>
      </Band>
    </main>
  );
};

export default PartnersPageContent;
