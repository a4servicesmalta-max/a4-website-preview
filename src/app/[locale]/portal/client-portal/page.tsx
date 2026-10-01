"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePagesTranslation } from "@/hooks/usePagesTranslation";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { Button } from "@/components/a4-landing/Primitives";
import ClientPortalOverviewSection from "@/components/client-portal/ClientPortalOverviewSection";
import ClientPortalFeaturesTimelineSection from "@/components/client-portal/ClientPortalFeaturesTimelineSection";
import PortalFeature from "@/components/services/PortalFeature";
import { BOOK_A_CALL_PATH, CLIENT_LOGIN_URL } from "@/lib/external-links";

const ROUTE = "portal/client-portal";

/**
 * Client Portal — hero, the "One dashboard for everything" statement with the
 * sample dashboard, uploads & requests, the how-it-works timeline on the dark
 * grid, then the portal tour.
 */
const ClientPortalPage = () => {
  const { t } = usePagesTranslation(ROUTE);
  const { t: tc } = useTranslation("common");

  const paragraphs = useMemo(() => {
    const raw = t("overview.paragraphs", { returnObjects: true });
    return Array.isArray(raw) ? (raw as string[]) : [];
  }, [t]);

  const bulletItems = useMemo(() => {
    const raw = t("feature.bulletItems", { returnObjects: true });
    return Array.isArray(raw) ? (raw as string[]) : [];
  }, [t]);

  return (
    <main id="main-content">
      <PageHero eyebrow={tc("nav.platform")} title={t("pageHeader.title")} sub={paragraphs[0]}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Button variant="primary" size="lg" href={BOOK_A_CALL_PATH}>
            {tc("glossary.bookDemo")}
          </Button>
          <Button variant="outline-dark" size="lg" href={CLIENT_LOGIN_URL} target="_blank">
            {tc("nav.login")}
          </Button>
        </div>
      </PageHero>

      <ClientPortalOverviewSection variant="client" i18nRouteKey={ROUTE} heading={t("overview.heading")} paragraphs={paragraphs.slice(1)} />

      <PortalFeature
        variant="upload-dashboard"
        n="01"
        surface="muted"
        portalImage="/assets/images/image copy.png"
        sectionLabel={t("feature.sectionLabel")}
        heading={t("feature.heading")}
        description={t("feature.description")}
        bulletIntro={t("feature.bulletIntro")}
        bulletItems={bulletItems}
        closingText={t("feature.closingText")}
        bottomTitle={t("feature.bottomTitle")}
        bottomDescription={t("feature.bottomDescription")}
      />

      <ClientPortalFeaturesTimelineSection routeKey={ROUTE} n="02" />

      <ServicePortalBand serviceName="the client portal" />
    </main>
  );
};

export default ClientPortalPage;
