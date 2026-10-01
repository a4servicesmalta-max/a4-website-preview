"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePagesTranslation } from "@/hooks/usePagesTranslation";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { Button } from "@/components/a4-landing/Primitives";
import ClientPortalOverviewSection from "@/components/client-portal/ClientPortalOverviewSection";
import PortalFeature from "@/components/services/PortalFeature";
import RiskAuditSection from "@/components/accounting/RiskAuditSection";
import HowItWorksTimeline, { HowItWorksStep } from "@/components/how-it-works/HowItWorksTimeline";
import ServiceFeatures from "@/components/services/ServiceFeatures";
import { BOOK_A_CALL_PATH, CLIENT_LOGIN_URL } from "@/lib/external-links";

const ROUTE = "portal/audit-portal";

type BulletedSection = {
  title: string;
  intro?: string;
  bullets: string[];
  footer?: string;
};

/**
 * Audit Portal — hero, how A4 delivers (with the sample PBC / ETB panel),
 * engagement setup, risk-based procedures, the audit workflow as the dark
 * timeline, the quality & compliance list, then the closing cards.
 */
const AuditPortalPage = () => {
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

  const workflowSteps = useMemo((): HowItWorksStep[] => {
    const raw = t("workflowSteps", { returnObjects: true });
    return Array.isArray(raw) ? (raw as HowItWorksStep[]) : [];
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

      <ClientPortalOverviewSection variant="audit" i18nRouteKey={ROUTE} n="01" heading={t("overview1.heading")} paragraphs={overview1Paragraphs.slice(1)} />

      <PortalFeature
        n="02"
        surface="muted"
        portalImage="/brand/portal/portal-audit-engagement.jpg"
        sectionLabel={t("feature.sectionLabel")}
        heading={t("feature.heading")}
        description={t("feature.description")}
        bulletIntro={t("feature.bulletIntro")}
        bulletItems={featureBullets}
        closingText={t("feature.closingText")}
        bottomTitle={t("feature.bottomTitle")}
        bottomDescription={t("feature.bottomDescription")}
        quoteText={t("feature.quoteText")}
      />

      <RiskAuditSection variant="audit" n="03" />

      {/* The workflow detail copy heads the workflow it describes. */}
      <HowItWorksTimeline
        steps={workflowSteps}
        mode="dark"
        n="04"
        sectionHeader={{
          badge: t("pageHeader.title"),
          title: t("feature.workflowHeading"),
          subtitle: t("feature.workflowDescription"),
        }}
      />

      <ServiceFeatures
        theme="light"
        title={`${t("serviceFeatures.titleLine1")} ${t("serviceFeatures.titleLine2")}`}
        description={t("serviceFeatures.description")}
        features={serviceFeatureBlocks}
      />

      <ClientPortalOverviewSection variant="audit" i18nRouteKey={ROUTE} surface="muted" bulletedSections={overview2Sections} />
    </main>
  );
};

export default AuditPortalPage;
