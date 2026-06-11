import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "../pricing/pricing-site.css";
import "../services/services-site.css";
import { PricingInfoContent } from "./components/PricingInfoContent";

export const metadata: Metadata = {
  title: "Transparent pricing — A4 Services",
  description:
    "Fair, transparent pricing tailored to your business. See how A4 quotes accounting, tax, audit and corporate work in Malta.",
};

export default function PricingInfoPage() {
  return <PricingInfoContent />;
}
