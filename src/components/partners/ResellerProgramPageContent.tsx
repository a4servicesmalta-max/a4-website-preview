"use client";

import { usePagesTranslation } from "@/hooks/usePagesTranslation";
import { PartnerSubpageLayout, usePartnerSections } from "./PartnerSubpageLayout";

export default function ResellerProgramPageContent() {
  const { t } = usePagesTranslation("partners");
  const sections = usePartnerSections(t, "reseller", 9);

  return (
    <PartnerSubpageLayout
      icon="percent"
      modelLabel="Reseller program"
      pageTitle={t("reseller.pageHeader.title")}
      heroTitle={t("reseller.hero.title")}
      heroDescription={t("reseller.hero.description")}
      ctaLabel={t("reseller.hero.cta")}
      ctaHref="/partner-program"
      sections={sections}
      currentHref="/partners/reseller-program"
    />
  );
}
