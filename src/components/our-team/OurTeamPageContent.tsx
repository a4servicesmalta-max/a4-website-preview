"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import TeamGrid from "@/components/our-team/TeamGrid";
import ValuesSection from "@/components/our-team/ValuesSection";
import { usePagesTranslation } from "@/hooks/usePagesTranslation";

type Grid = React.ComponentProps<typeof TeamGrid>;
type Values = { title?: string; titleAccent?: string; description?: string; cta?: string; items?: React.ComponentProps<typeof ValuesSection>["items"] };

/** Our Team — hero, the team as alternating cards, then the values as a numbered list. */
const OurTeamPageContent = () => {
  const { t } = usePagesTranslation("our-team");
  const { t: tc } = useTranslation("common");

  const grid = useMemo(() => t("grid", { returnObjects: true }) as unknown as Grid, [t]);
  const values = useMemo(() => t("values", { returnObjects: true }) as unknown as Values, [t]);

  return (
    <main id="main-content">
      <PageHero eyebrow={tc("footer.company")} title={t("pageHeader.title")} sub={grid?.subtitle} />
      <TeamGrid title={grid?.title} members={grid?.members} />
      <ValuesSection title={values?.title} titleAccent={values?.titleAccent} description={values?.description} ctaText={values?.cta} items={values?.items} />
    </main>
  );
};

export default OurTeamPageContent;
