"use client";

import React, { useMemo } from "react";
import HowItWorksTimeline, { HowItWorksStep } from "@/components/how-it-works/HowItWorksTimeline";
import { usePagesTranslation } from "@/hooks/usePagesTranslation";

interface ClientPortalFeaturesTimelineSectionProps {
  /** `pages` route key, e.g. `portal/client-portal` */
  routeKey?: string;
  /** Section number for the eyebrow ("03"). */
  n?: string;
}

/** The portal's "How it works" steps on the dark grid, as the design's filling timeline. */
const ClientPortalFeaturesTimelineSection = ({ routeKey = "portal/client-portal", n }: ClientPortalFeaturesTimelineSectionProps) => {
  const { t } = usePagesTranslation(routeKey);

  const steps = useMemo((): HowItWorksStep[] => {
    const raw = t("timeline.steps", { returnObjects: true });
    if (!Array.isArray(raw)) return [];
    return raw as HowItWorksStep[];
  }, [t]);

  const sectionHeader = useMemo(
    () => ({
      badge: t("timeline.header.badge"),
      title: t("timeline.header.title"),
      subtitle: t("timeline.header.subtitle"),
    }),
    [t]
  );

  return <HowItWorksTimeline steps={steps} mode="dark" sectionHeader={sectionHeader} n={n} />;
};

export default ClientPortalFeaturesTimelineSection;
