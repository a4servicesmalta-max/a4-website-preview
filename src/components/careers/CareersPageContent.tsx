"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { Button } from "@/components/a4-landing/Primitives";
import ContactHRForm from "@/components/careers/ContactHRForm";
import BenefitsSection from "@/components/careers/BenefitsSection";
import JobOpenings from "@/components/careers/JobOpenings";
import { usePagesTranslation } from "@/hooks/usePagesTranslation";

type Careers = {
  benefits?: { title?: string; subtitle?: string; features?: { title: string; items: string[] }[] };
  talentNetwork?: React.ComponentProps<typeof ContactHRForm> & { emailLabel?: string };
  openPositions?: { title?: string; subtitle?: string; applyNow?: string; jobs?: React.ComponentProps<typeof JobOpenings>["jobs"] };
};

/** Careers — hero with jump links, why A4 (numbered list), open positions, then the talent network form on dark. */
const CareersPageContent = () => {
  const { t } = usePagesTranslation("careers");
  const { t: tc } = useTranslation("common");

  const benefits = useMemo(() => t("benefits", { returnObjects: true }) as unknown as Careers["benefits"], [t]);
  const talentNetwork = useMemo(() => t("talentNetwork", { returnObjects: true }) as unknown as Careers["talentNetwork"], [t]);
  const openPositions = useMemo(() => t("openPositions", { returnObjects: true }) as unknown as Careers["openPositions"], [t]);

  return (
    <main id="main-content">
      <PageHero eyebrow={tc("footer.company")} title={t("pageHeader.title")}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {openPositions?.title ? (
            <Button variant="primary" size="lg" href="#positions">
              {openPositions.title}
            </Button>
          ) : null}
          {talentNetwork?.title ? (
            <Button variant="outline-dark" size="lg" href="#talent-network">
              {talentNetwork.title}
            </Button>
          ) : null}
        </div>
      </PageHero>
      <BenefitsSection title={benefits?.title} subtitle={benefits?.subtitle} features={benefits?.features} />
      <JobOpenings title={openPositions?.title} subtitle={openPositions?.subtitle} applyNowText={openPositions?.applyNow} jobs={openPositions?.jobs} />
      <ContactHRForm title={talentNetwork?.title} subtitle={talentNetwork?.subtitle} emailLabel={talentNetwork?.emailLabel} form={talentNetwork?.form} />
    </main>
  );
};

export default CareersPageContent;
