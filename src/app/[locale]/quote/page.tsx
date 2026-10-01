import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { QuoteContent } from "./components/QuoteContent";

export const metadata: Metadata = {
  title: "Get Instant Quote — A4 Services",
  description:
    "Pick what you need and see the price — bookkeeping, VAT, payroll, tax, corporate services and audit, line by line or as one monthly retainer. Your formal quotation follows by email.",
};

export default function QuotePage() {
  return <QuoteContent />;

  // --- Previous implementation (commented out) ---
  // "use client";
  // import PageHeader from "@/components/common/PageHeader";
  // import ProcessStepsSection from "@/components/HomePage/ProcessStepsSection";
  // import QuoteProcess from "@/components/quote/QuoteProcess";
  // import { FadeInUp } from "@/components/common/Animations";
  // import { usePagesTranslation } from "@/hooks/usePagesTranslation";
  //
  // const QuotePage = () => {
  //   const { t } = usePagesTranslation("quote");
  //   useEffect(() => { /* hash scroll */ }, []);
  //   return (
  //     <main className="min-h-screen bg-background">
  //       <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
  //         <PageHeader title={t("pageHeader.title")} breadcrumbs={[{ label: t("pageHeader.breadcrumbs.0.label") }]} />
  //       </div>
  //       <div id="process-steps"><ProcessStepsSection /></div>
  //       <FadeInUp delay={0.2}><QuoteProcess /></FadeInUp>
  //     </main>
  //   );
  // };
}
