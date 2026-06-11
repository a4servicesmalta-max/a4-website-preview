import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { LegalDocPage } from "@/components/a4-site/LegalDocPage";
import { COOKIE_POLICY_SECTIONS } from "@/data/a4QuoteSiteData";

export const metadata: Metadata = {
  title: "Cookie Policy — A4 Services",
  description:
    "This policy explains how A4 uses cookies and similar technologies on our website, and how you can control them.",
};

export default function CookiePolicyPage() {
  return (
    <LegalDocPage
      eyebrow="Legal"
      title="Cookie Policy"
      updated="June 2026"
      intro="This policy explains how A4 uses cookies and similar technologies on our website, and how you can control them."
      sections={COOKIE_POLICY_SECTIONS}
    />
  );

  // --- Previous implementation (commented out) ---
  // "use client";
  // import PageHeader from "@/components/common/PageHeader";
  // import { usePagesTranslation } from "@/hooks/usePagesTranslation";
  //
  // const CookiePolicyPage = () => {
  //   const { t } = usePagesTranslation("cookie-policy");
  //   return (
  //     <main className="min-h-screen bg-background">
  //       <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
  //         <PageHeader title={t("pageHeader.title")} breadcrumbs={[{ label: t("pageHeader.breadcrumbs.0.label") }]} />
  //       </div>
  //       <section className=" mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20 space-y-10 text-sm md:text-base text-text-secondary">
  //         {/* i18n sections */}
  //       </section>
  //     </main>
  //   );
  // };
}
