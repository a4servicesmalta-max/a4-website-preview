import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { AboutContent } from "./components/AboutContent";

import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "About A4 — Malta Accounting & Audit Firm",
  "A4 Services Limited is a licensed Malta accounting, audit and corporate services firm — not software, not a marketplace. We do the work for you.",
);

export default function AboutPage() {
  return <AboutContent />;

  // --- Previous implementation (commented out) ---
  // "use client";
  // import PageHeader from "@/components/common/PageHeader";
  // import FeatureSection from "@/components/common/FeatureSection";
  // import MissionVisionSection from "@/components/common/MissionVisionSection";
  // import ServiceFeatures from "@/components/services/ServiceFeatures";
  // import { FadeInUp } from "@/components/common/Animations";
  // import { usePagesTranslation } from "@/hooks/usePagesTranslation";
  //
  // const AboutPage = () => {
  //   const { t } = usePagesTranslation("about");
  //   const aboutFeatures = useMemo(() => [...], [t]);
  //   const aboutServiceFeatures = useMemo(() => ({...}), [t]);
  //   const missionVision = useMemo(() => ({...}), [t]);
  //   return (
  //     <main className="min-h-screen bg-background">
  //       <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
  //         <PageHeader title={t("pageHeader.title")} breadcrumbs={[{ label: t("pageHeader.breadcrumbs.0.label") }]} />
  //       </div>
  //       <FadeInUp><FeatureSection features={aboutFeatures} /></FadeInUp>
  //       <FadeInUp delay={0.2}><MissionVisionSection mission={missionVision.mission} vision={missionVision.vision} /></FadeInUp>
  //       <FadeInUp delay={0.4}><ServiceFeatures title={aboutServiceFeatures.title} subtitle={aboutServiceFeatures.subtitle} features={aboutServiceFeatures.features} /></FadeInUp>
  //     </main>
  //   );
  // };
}
