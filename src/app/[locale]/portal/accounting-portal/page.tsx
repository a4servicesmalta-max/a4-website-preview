"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePagesTranslation } from "@/hooks/usePagesTranslation";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { Button } from "@/components/a4-landing/Primitives";
import { gradText } from "@/components/fx/primitives";
import ClientPortalOverviewSection from "@/components/client-portal/ClientPortalOverviewSection";
import PortalFeature from "@/components/services/PortalFeature";
import ServiceFeatures from "@/components/services/ServiceFeatures";
import RiskAuditSection from "@/components/accounting/RiskAuditSection";
import { BOOK_A_CALL_PATH, CLIENT_LOGIN_URL } from "@/lib/external-links";

const ROUTE = "portal/accounting-portal";

type BulletedSection = {
  title: string;
  intro?: string;
  bullets: string[];
  footer?: string;
};

/**
 * Accounting Portal — hero, how A4 delivers (with the sample requests panel),
 * the monthly cycle, risk-based accounting, the numbered quality list on the
 * dark grid, then integrated delivery.
 */
const AccountingPortalPage = () => {
  const { t } = usePagesTranslation(ROUTE);
  const { t: tc } = useTranslation("common");

  const overview1Paragraphs = useMemo(() => {
    const raw = t("overview1.paragraphs", { returnObjects: true });
    return Array.isArray(raw) ? (raw as string[]) : [];
  }, [t]);

  const featureBullets = useMemo(() => {
    const raw = t("feature.bulletItems", { returnObjects: true });
    return Array.isArray(raw) ? (raw as string[]) : [];
  }, [t]);

  const serviceFeatureBlocks = useMemo(() => {
    const raw = t("serviceFeatures.features", { returnObjects: true });
    return Array.isArray(raw) ? (raw as { title: string; items: string[] }[]) : [];
  }, [t]);

  const overview2Sections = useMemo(() => {
    const raw = t("overview2.sections", { returnObjects: true });
    return Array.isArray(raw) ? (raw as BulletedSection[]) : [];
  }, [t]);

  return (
    <main id="main-content">
      <PageHero eyebrow={tc("nav.platform")} title={t("pageHeader.title")} sub={overview1Paragraphs[0]}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Button variant="primary" size="lg" href={BOOK_A_CALL_PATH}>
            {tc("glossary.bookDemo")}
          </Button>
          <Button variant="outline-dark" size="lg" href={CLIENT_LOGIN_URL} target="_blank">
            {tc("nav.login")}
          </Button>
        </div>
      </PageHero>

      <ClientPortalOverviewSection
        variant="accounting"
        i18nRouteKey={ROUTE}
        n="01"
        heading={t("overview1.heading")}
        paragraphs={overview1Paragraphs.slice(1)}
      />

      <PortalFeature
        n="02"
        surface="muted"
        portalImage="/brand/portal/portal-dashboard.jpg"
        sectionLabel={t("feature.sectionLabel")}
        heading={t("feature.heading")}
        description={t("feature.description")}
        bulletIntro={t("feature.bulletIntro")}
        bulletItems={featureBullets}
        closingText={t("feature.closingText")}
        bottomTitle={t("feature.bottomTitle")}
        bottomDescription={t("feature.bottomDescription")}
        quoteText={t("feature.quoteText")}
        workflowDetail={{
          heading: t("feature.workflowHeading"),
          description: t("feature.workflowDescription"),
        }}
      />

      <RiskAuditSection variant="accounting" n="03" />

      <ServiceFeatures
        title={
          <>
            {t("serviceFeatures.titleLine1")}
            <br />
            <span style={{ ...gradText, display: "inline-block", paddingBottom: ".06em" }}>{t("serviceFeatures.titleLine2")}</span>
          </>
        }
        description={t("serviceFeatures.description")}
        features={serviceFeatureBlocks}
      />

      <ClientPortalOverviewSection variant="accounting" i18nRouteKey={ROUTE} integratedDeliveryVisual bulletedSections={overview2Sections} />
    </main>
  );
};

export default AccountingPortalPage;
