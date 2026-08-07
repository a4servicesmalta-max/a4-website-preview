import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import { AuditApp } from "./components/AuditParts";

import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "Audit & Assurance in Malta",
  "Statutory audit and assurance from A4 Services Limited — a licensed Malta audit firm. Fixed fees, GAPSME and IFRS, signed by a licensed audit firm.",
);

export default function AuditServicesPage() {
  return (
    <div className="a4-landing-page pt-24 sm:pt-28">
      <AuditApp />
    </div>
  );

  // --- Previous implementation (commented out) ---
  // Prior audit landing components — replaced by AuditApp from New website (2) Audit Services.html
}
