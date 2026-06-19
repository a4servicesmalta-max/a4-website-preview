"use client";

import { usePagesTranslation } from "@/hooks/usePagesTranslation";
import { PartnerSubpageLayout, usePartnerSections } from "./PartnerSubpageLayout";

export default function ServiceDeliveryPageContent() {
  const { t } = usePagesTranslation("partners");
  const sections = usePartnerSections(t, "serviceDelivery", 9);

  return (
    <PartnerSubpageLayout
      icon="handshake"
      modelLabel="Service delivery"
      pageTitle={t("serviceDelivery.pageHeader.title")}
      heroTitle={t("serviceDelivery.hero.title")}
      heroDescription={t("serviceDelivery.hero.description")}
      ctaLabel={t("serviceDelivery.hero.cta")}
      ctaHref="/contact"
      sections={sections}
      currentHref="/partners/service-delivery"
    />
  );
}
