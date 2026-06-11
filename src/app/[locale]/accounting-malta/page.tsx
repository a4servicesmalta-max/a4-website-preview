import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "../services/services-site.css";
import { getA4SiteServiceBySlug } from "@/data/a4ServicesSiteData";
import { ServicePageContent } from "../services/components/ServicePageContent";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Accounting Services in Malta — A4 Services",
  description:
    "Professional accounting services in Malta. Audit-grade bookkeeping and reporting, reviewed by qualified accountants — full financial visibility through your A4 portal.",
};

export default function AccountingMaltaPage() {
  const service = getA4SiteServiceBySlug("accounting-finance");
  if (!service) notFound();
  return <ServicePageContent service={service} />;

  // --- Previous implementation (commented out) ---
  // import { Fraunces, Outfit } from "next/font/google";
  // import "@/components/accounting-malta/accounting-malta.css";
  // import HeroAccountingMalta, TrustBandAccountingMalta, ... (full custom accounting-malta page)
}