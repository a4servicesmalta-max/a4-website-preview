"use client";

import React, { useMemo } from "react";
import AIReviewFeature from "@/components/ai-review/AIReviewFeature";
import PortalFeature from "@/components/services/PortalFeature";
import ServiceFeatures from "@/components/services/ServiceFeatures";
import ReviewOutputSection from "@/components/ai-review/ReviewOutputSection";
import BenefitsVideoSection from "@/components/ai-review/BenefitsVideoSection";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { usePagesTranslation } from "@/hooks/usePagesTranslation";

export function AiReviewContent() {
  const { t } = usePagesTranslation("ai-review");

  const hero = useMemo(
    () => t("hero", { returnObjects: true }) as unknown as { title: string; p1: string; p2: string; p3: string },
    [t]
  );
  const demo = useMemo(
    () => t("demo", { returnObjects: true }) as unknown as React.ComponentProps<typeof AIReviewFeature>["demo"],
    [t]
  );
  const portalFeature = useMemo(
    () => t("portalFeature", { returnObjects: true }) as unknown as Omit<React.ComponentProps<typeof PortalFeature>, "portalImage" | "variant">,
    [t]
  );
  const output = useMemo(
    () => t("output", { returnObjects: true }) as unknown as React.ComponentProps<typeof ReviewOutputSection>["output"],
    [t]
  );
  const videoBenefits = useMemo(
    () => t("video_benefits", { returnObjects: true }) as unknown as React.ComponentProps<typeof BenefitsVideoSection>["cards"],
    [t]
  );

  const serviceFeatures = useMemo(
    () => ({
      title: t("serviceFeatures.title"),
      subtitle: t("serviceFeatures.subtitle"),
      features: [0, 1, 2, 3, 4].map((g) => ({
        title: t(`serviceFeatures.groups.${g}.title`),
        items: [0, 1, 2, 3].map((i) => t(`serviceFeatures.groups.${g}.items.${i}`)),
      })),
    }),
    [t]
  );

  return (
    <div className="a4-site-page">
      <PageHero eyebrow="AI Review" title={hero.title} sub={`${hero.p1} ${hero.p2}`} />

      <section className="bg-[var(--a4-canvas-light)]">
        <AIReviewFeature hero={hero} demo={demo} />
      </section>

      <section className="bg-white">
        <PortalFeature variant="technology" {...portalFeature} portalImage="/assets/images/Frame 1618872451.png" />
      </section>

      <section className="bg-[var(--a4-canvas-light)]">
        <ServiceFeatures
          title={serviceFeatures.title}
          subtitle={serviceFeatures.subtitle}
          features={serviceFeatures.features}
        />
      </section>

      <section className="bg-white">
        <ReviewOutputSection output={output} />
      </section>

      <section className="bg-[var(--a4-canvas-light)]">
        <BenefitsVideoSection cards={videoBenefits} />
      </section>

      <ServicePortalBand serviceName="AI Review" />
    </div>
  );
}
