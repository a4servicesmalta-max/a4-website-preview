import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "./services-site.css";
import { ServicesOverviewContent } from "./components/ServicesOverviewContent";

import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "Accounting, Audit & Corporate Services",
  "Assurance-led accounting, tax, corporate and audit services for Malta businesses — scoped clearly, priced transparently, delivered through one portal.",
);

export default function ServicesOverviewPage() {
  return <ServicesOverviewContent />;
}
