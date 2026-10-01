"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { Button } from "@/components/a4-landing/Primitives";
import TechnologyOverview from "@/components/technology/TechnologyOverview";
import TechnologyComponent from "@/components/technology/TechnologyComponent";
import TechnologyRegulated from "@/components/technology/TechnologyRegulated";
import PortalFeature from "@/components/services/PortalFeature";
import { usePagesTranslation } from "@/hooks/usePagesTranslation";
import { BOOK_A_CALL_PATH } from "@/lib/external-links";

/**
 * Our Technology — hero, the overview with the sample panels, how the
 * technology supports delivery, the four components (each linking to its
 * page), then "designed for regulated environments" on the dark grid.
 */
const TechnologyPage = () => {
  const { t } = usePagesTranslation("technology");
  const { t: tc } = useTranslation("common");

  return (
    <main id="main-content">
      <PageHero eyebrow={tc("nav.platform")} title={t("pageHeader.title")} sub={t("overview.p1")}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Button variant="primary" size="lg" href={BOOK_A_CALL_PATH}>
            {tc("glossary.bookDemo")}
          </Button>
          <Button variant="outline-dark" size="lg" href="/portal/client-portal">
            {tc("nav.portal.client")}
          </Button>
        </div>
      </PageHero>

      <TechnologyOverview
        n="01"
        title={t("overview.title")}
        p1=""
        p2={t("overview.p2")}
        p3={t("overview.p3")}
        backgroundAlt={t("overview.backgroundAlt")}
        progressAlt={t("overview.progressAlt")}
        dataAlt={t("overview.dataAlt")}
      />

      <PortalFeature
        variant="technology"
        n="02"
        surface="muted"
        portalImage="/assets/images/Frame 1618872736.png"
        sectionLabel={t("portalFeature.sectionLabel")}
        heading={t("portalFeature.heading")}
        description={t("portalFeature.description")}
        bulletIntro={t("portalFeature.bulletIntro")}
        bulletItems={[t("portalFeature.bulletItems.0"), t("portalFeature.bulletItems.1"), t("portalFeature.bulletItems.2"), t("portalFeature.bulletItems.3")]}
        closingText={t("portalFeature.closingText")}
        bottomTitle={t("portalFeature.bottomTitle")}
        bottomDescription={t("portalFeature.bottomDescription")}
        quoteText={t("portalFeature.quoteText")}
      />

      <TechnologyComponent
        n="03"
        badge={t("component.badge")}
        title={t("component.title")}
        description={t("component.description")}
        readMoreText={t("component.readMore")}
        items={[
          { title: t("component.items.0.title"), description: t("component.items.0.description"), icon: "layout-dashboard", href: "/portal/client-portal" },
          { title: t("component.items.1.title"), description: t("component.items.1.description"), icon: "calculator", href: "/portal/accounting-portal" },
          { title: t("component.items.2.title"), description: t("component.items.2.description"), icon: "shield-check", href: "/portal/audit-portal" },
          { title: t("component.items.3.title"), description: t("component.items.3.description"), icon: "file-search", href: "/ai-review" },
        ]}
      />

      <TechnologyRegulated
        title={t("regulated.title")}
        intro={t("regulated.intro")}
        features={[t("regulated.features.0"), t("regulated.features.1"), t("regulated.features.2"), t("regulated.features.3")]}
        footer={t("regulated.footer")}
        availabilityTitle={t("regulated.availability.title")}
        availabilityDescription={t("regulated.availability.description")}
        handleTitle={t("regulated.handleTitle")}
        workspaceCards={[0, 1, 2, 3].map((i) => ({
          title: t(`regulated.workspaceCards.${i}.title`),
          description: t(`regulated.workspaceCards.${i}.description`),
          ...(i === 0 ? { status: t("regulated.workspaceCards.0.status") } : null),
          links: [t(`regulated.workspaceCards.${i}.links.0`), t(`regulated.workspaceCards.${i}.links.1`)],
        }))}
      />
    </main>
  );
};

export default TechnologyPage;
