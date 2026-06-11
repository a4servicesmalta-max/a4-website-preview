import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "./pricing-site.css";
import { PricingCalculatorContent } from "./components/PricingCalculatorContent";

export const metadata: Metadata = {
  title: "Pricing — A4 Services Malta",
  description:
    "Build a fixed price for accounting, VAT and audit work in seconds. Transparent Malta pricing with no hidden fees.",
};

export default function PricingPage() {
  return <PricingCalculatorContent />;

  // --- Previous implementation (commented out) ---
  // "use client";
  // import PageHeader from "@/components/common/PageHeader";
  // import PricingHero from "@/components/pricing/PricingHero";
  // import PricingFactors from "@/components/pricing/PricingFactors";
  // import PricingOverviewSection from "@/components/pricing/PricingOverviewSection";
  // import QuoteProcess from "@/components/pricing/QuoteProcess";
  // import WhatToExpect from "@/components/pricing/WhatToExpect";
  // import PricingCTA from "@/components/pricing/PricingCTA";
  // import { usePagesTranslation } from "@/hooks/usePagesTranslation";
  //
  // const PricingPage = () => {
  //   const { t } = usePagesTranslation("pricing");
  //   return (
  //     <main className="min-h-screen bg-background">
  //       <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
  //         <PageHeader title={t("pageHeader.title")} breadcrumbs={[{ label: t("pageHeader.breadcrumbs.0.label") }]} />
  //       </div>
  //       <PricingHero />
  //       <PricingFactors />
  //       <PricingOverviewSection />
  //       <QuoteProcess />
  //       <WhatToExpect />
  //       <PricingCTA />
  //     </main>
  //   );
  // };
}
