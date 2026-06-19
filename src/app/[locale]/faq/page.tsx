import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { FaqContent } from "./components/FaqContent";

import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "FAQs — Working with A4",
  "Answers about A4 Services — Malta accounting, audit, VAT, payroll, corporate services, security and how our client portal works.",
);

export default function FaqPage() {
  return <FaqContent />;

  // --- Previous implementation (commented out) ---
  // "use client";
  // import PageHeader from "@/components/common/PageHeader";
  // import FaqAccordion from "@/components/common/FaqAccordion";
  // import FaqCategorized from "@/components/common/FaqCategorized";
  // import { FadeInUp } from "@/components/common/Animations";
  // import { usePagesTranslation } from "@/hooks/usePagesTranslation";
  //
  // const FaqPage = () => {
  //   const { t } = usePagesTranslation("faq");
  //   const faqItems = useMemo(() => [...], [t]);
  //   const faqCategories = useMemo(() => [...], [t]);
  //   return (
  //     <main className="min-h-screen bg-background">
  //       <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
  //         <PageHeader title={t("pageHeader.title")} breadcrumbs={[{ label: t("pageHeader.breadcrumbs.0.label") }]} />
  //       </div>
  //       <FadeInUp><FaqAccordion faqItems={faqItems} backgroundColor="bg-[#020410]" showRadials={false} /></FadeInUp>
  //       <FadeInUp delay={0.2}><FaqCategorized categories={faqCategories} /></FadeInUp>
  //     </main>
  //   );
  // };
}
