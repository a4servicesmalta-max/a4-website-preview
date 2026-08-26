import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { ContactContent } from "./components/ContactContent";

import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "Contact A4 Services Malta",
  "Call, email or book a free 30-minute consultation with A4 Services Limited — licensed Malta accounting and audit firm.",
);

export default function ContactPage() {
  return <ContactContent />;

  // --- Previous implementation (commented out) ---
  // "use client";
  // import PageHeader from "@/components/common/PageHeader";
  // import ContactForm from "@/components/quote/ContactForm";
  // import { FadeInUp } from "@/components/common/Animations";
  // import { usePagesTranslation } from "@/hooks/usePagesTranslation";
  //
  // const ContactPage = () => {
  //   const { t } = usePagesTranslation("contact");
  //   return (
  //     <main className="min-h-screen bg-background">
  //       <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
  //         <PageHeader title={t("pageHeader.title")} breadcrumbs={[{ label: t("pageHeader.breadcrumbs.0.label") }]} />
  //       </div>
  //       <FadeInUp><ContactForm /></FadeInUp>
  //     </main>
  //   );
  // };
}
