import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "./services-site.css";
import { ServicesOverviewContent } from "./components/ServicesOverviewContent";

export const metadata: Metadata = {
  title: "Our Services — A4 Services",
  description:
    "Assurance-led accounting, tax, corporate and audit services for businesses in and through Malta — scoped clearly, priced transparently, delivered through one portal.",
};

export default function ServicesOverviewPage() {
  return <ServicesOverviewContent />;
}
