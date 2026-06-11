import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { ResourcesContent } from "./components/ResourcesContent";

export const metadata: Metadata = {
  title: "Resources — A4 Services",
  description:
    "Guides, insights, tools and answers — a hub to help you get the most from A4 and stay ahead of what's next.",
};

export default function ResourcesPage() {
  return <ResourcesContent />;

  // --- Previous implementation (commented out) ---
  // "use client";
  // import LocalizedLink from "@/components/common/LocalizedLink";
  // import PageHeader from "@/components/common/PageHeader";
  // import { FadeInUp, StaggerContainer } from "@/components/common/Animations";
  // import { usePagesTranslation } from "@/hooks/usePagesTranslation";
  //
  // export default function ResourcesPage() {
  //   const { t } = usePagesTranslation("resources");
  //   const resourceLinks = [0, 1, 2, 3, 4, 5, 6].map((i) => ({
  //     label: t(`links.${i}.label`),
  //     href: t(`links.${i}.href`),
  //     description: t(`links.${i}.description`),
  //   }));
  //   return (
  //     <main>
  //       <PageHeader title={t("pageHeader.title")} breadcrumbs={[{ label: t("pageHeader.breadcrumbs.0.label") }]} />
  //       <section className="w-full py-16 lg:py-20 bg-background">
  //         {/* card grid */}
  //       </section>
  //     </main>
  //   );
  // }
}
