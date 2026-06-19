"use client";

import { usePagesTranslation } from "@/hooks/usePagesTranslation";
import { PartnerSubpageLayout, usePartnerSections } from "./PartnerSubpageLayout";

export default function TechnologySupportPageContent() {
  const { t } = usePagesTranslation("partners");
  const sections = usePartnerSections(t, "technologySupport", 9);

  return (
    <PartnerSubpageLayout
      icon="plug"
      modelLabel="Technology integration"
      pageTitle={t("technologySupport.pageHeader.title")}
      heroTitle={t("technologySupport.hero.title")}
      heroDescription={t("technologySupport.hero.description")}
      ctaLabel={t("technologySupport.hero.cta")}
      ctaHref="/contact"
      sections={sections}
      currentHref="/partners/technology-support"
    />
  );
}
