import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { SecurityComplianceContent } from "./components/SecurityComplianceContent";

export const metadata: Metadata = {
  title: "Security & Compliance — A4 Services",
  description:
    "Security and professional integrity aren't features — they're the foundation. Here's how A4 keeps your information safe and your engagements sound.",
};

export default function SecurityCompliancePage() {
  return <SecurityComplianceContent />;

  // --- Previous implementation (commented out) ---
  // "use client";
  // import PageHeader from "@/components/common/PageHeader";
  // import SecurityComplianceCards from "@/components/security-compliance/SecurityComplianceCards";
  // import { FadeInUp } from "@/components/common/Animations";
  // import { usePagesTranslation } from "@/hooks/usePagesTranslation";
  //
  // const SecurityCompliancePage = () => {
  //   const { t } = usePagesTranslation("security-compliance");
  //   return (
  //     <main className="min-h-screen bg-background">
  //       <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
  //         <PageHeader title={t("pageHeader.title")} breadcrumbs={[{ label: t("pageHeader.breadcrumbs.0.label") }]} />
  //       </div>
  //       <FadeInUp><SecurityComplianceCards /></FadeInUp>
  //     </main>
  //   );
  // };
}
