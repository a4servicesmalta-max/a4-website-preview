import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { HowItWorksContent } from "./components/HowItWorksContent";

export const metadata: Metadata = {
  title: "How It Works — A4 Services",
  description:
    "From first hello to work delivered, A4 keeps every step clear, professional and on time — with one dedicated team and one secure portal.",
};

export default function HowItWorksPage() {
  return <HowItWorksContent />;

  // --- Previous implementation (commented out) ---
  // "use client";
  // import PageHeader from "@/components/common/PageHeader";
  // import HowItWorksTimeline, { HowItWorksStep } from "@/components/how-it-works/HowItWorksTimeline";
  // import OngoingSupportSection from "@/components/common/OngoingSupportSection";
  // import { FadeInUp } from "@/components/common/Animations";
  // import { usePagesTranslation } from "@/hooks/usePagesTranslation";
  //
  // const HowItWorksPage = () => {
  //   const { t } = usePagesTranslation("how-it-works");
  //   const steps: HowItWorksStep[] = useMemo(() => [...], [t]);
  //   const sectionHeader = useMemo(() => ({...}), [t]);
  //   return (
  //     <main className="min-h-screen bg-background">
  //       <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
  //         <PageHeader title={t("pageHeader.title")} breadcrumbs={[{ label: t("pageHeader.breadcrumbs.0.label") }]} />
  //       </div>
  //       <FadeInUp><HowItWorksTimeline steps={steps} sectionHeader={sectionHeader} /></FadeInUp>
  //       <FadeInUp delay={0.2}><OngoingSupportSection /></FadeInUp>
  //     </main>
  //   );
  // };
}
