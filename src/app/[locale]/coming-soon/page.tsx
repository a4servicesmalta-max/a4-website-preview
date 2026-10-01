"use client";

import React from "react";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { Button } from "@/components/a4-landing/Primitives";
import GetInstantQuoteButton from "@/components/common/GetInstantQuoteButton";
import { usePagesTranslation } from "@/hooks/usePagesTranslation";

/** Coming soon — the A4 hero on its own: badge as the eyebrow, typed title, description, two pills. */
const ComingSoonPage = () => {
  const { t } = usePagesTranslation("coming-soon");

  return (
    <main id="main-content">
      <PageHero eyebrow={t("badge")} title={t("title")} sub={t("description")}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <GetInstantQuoteButton className="h-[58px] px-[30px] text-[18px]" />
          <Button variant="outline-dark" size="lg" href="/ai-review">
            {t("viewAiReview")}
          </Button>
        </div>
      </PageHero>
    </main>
  );
};

export default ComingSoonPage;
