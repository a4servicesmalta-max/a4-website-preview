import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "../services/services-site.css";
import { getA4SiteServiceBySlug } from "@/data/a4ServicesSiteData";
import { ServicePageContent } from "../services/components/ServicePageContent";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Bookkeeping — A4 Services Malta",
  description:
    "Automated, audit-grade monthly bookkeeping reviewed by qualified accountants — your records reconciled, referenced and ready all year round.",
};

export default function BookkeepingPage() {
  const service = getA4SiteServiceBySlug("bookkeeping");
  if (!service) notFound();
  return <ServicePageContent service={service} />;

  // --- Previous implementation (commented out) ---
  // import HeroSection from "@/components/bookkeeping/HeroSection";
  // import TrustStrip from "@/components/bookkeeping/TrustStrip";
  // ... VACEI marketing page components
}