import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { ContactContent } from "./components/ContactContent";

export const metadata: Metadata = {
  title: "Contact A4 — Get in Touch",
  description:
    "Send us a message, call the team, or book a free 15-minute call. We usually reply within one business day.",
};

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
