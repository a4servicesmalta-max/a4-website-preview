import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { ComplianceCalendarContent } from "../lead-magnets/components/LeadMagnetPages";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "Malta Compliance Deadline Calendar 2026",
  "Download the 2026 Malta compliance calendar — VAT, payroll, MBR, provisional tax and audit deadlines for Malta companies.",
);

export default function ComplianceCalendarPage() {
  return <ComplianceCalendarContent />;
}
