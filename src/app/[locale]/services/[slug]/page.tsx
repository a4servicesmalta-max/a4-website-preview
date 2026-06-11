import React from "react";
import { notFound } from "next/navigation";
import "@/components/a4-landing/styles.css";
import "../services-site.css";
import { ALL_A4_SERVICE_SLUGS, getA4SiteServiceBySlug } from "@/data/a4ServicesSiteData";
import { locales } from "@/lib/i18n-config";
import { ServicePageContent } from "../components/ServicePageContent";

// --- Previous implementation (commented out) ---
// import PageHeader from "@/components/common/PageHeader";
// import { getServiceBySlug, servicesData } from "@/data/servicesData";
// import { getServiceImage } from "@/data/serviceImages";
// import { mergeServiceWithLocale } from "@/lib/merge-service-locale";
// import ServiceOverview from "@/components/services/ServiceOverview";
// import ServiceFeatures from "@/components/services/ServiceFeatures";
// import PortalFeature from "@/components/services/PortalFeature";
// import AnimatedPageSections from "@/components/common/AnimatedPageSections";
// import ServiceVideoSection from "@/components/services/ServiceVideoSection";
// import ServiceCTA from "@/components/services/ServiceCTA";

interface ServicePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const out: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const slug of ALL_A4_SERVICE_SLUGS) {
      out.push({ locale, slug });
    }
  }
  return out;
}

const ServicePage = async ({ params }: ServicePageProps) => {
  const { slug } = await params;
  const service = getA4SiteServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return <ServicePageContent service={service} />;

  // --- Previous implementation (commented out) ---
  // const base = getServiceBySlug(slug);
  // if (!base) {
  //   notFound();
  // }
  // const service = mergeServiceWithLocale(base, locale);
  // const overviewImage = getServiceImage(service.id, service.image);
  // return (
  //   <main className="min-h-screen bg-background">
  //     <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
  //       <PageHeader title={service.title} breadcrumbs={service.breadcrumbs} />
  //     </div>
  //     <ServiceVideoSection title={service.title} videoUrl={service.videoUrl} />
  //     <AnimatedPageSections>
  //       <ServiceOverview
  //         title={service.title}
  //         description={service.description}
  //         image={overviewImage}
  //       />
  //       {service.featuresSection && (
  //         <div className="mt-16 lg:mt-24">
  //           <ServiceFeatures
  //             title={service.featuresSection.title}
  //             subtitle={service.featuresSection.subtitle}
  //             features={service.featuresSection.features}
  //             primaryCtaText={service.primaryCtaText}
  //             primaryCtaHref={service.primaryCtaHref}
  //             secondaryCtaText={service.secondaryCtaText}
  //             secondaryCtaHref={service.secondaryCtaHref}
  //           />
  //         </div>
  //       )}
  //     </AnimatedPageSections>
  //   </main>
  // );
};

export default ServicePage;
