import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import { AuditApp } from "./components/AuditParts";

import { pageMetadata } from "@/lib/page-metadata";

// The fee calculator used to set money and step numbers in JetBrains Mono (the
// vacei.com/services/audit look). It is in the A4 design language now — Outfit
// for figures — so the extra font is no longer loaded here.

export const metadata: Metadata = pageMetadata(
  "Audit & Assurance in Malta",
  "Statutory audit and assurance from A4 Services Limited — a licensed Malta audit firm. Fixed fees, GAPSME and IFRS, signed by a licensed audit firm.",
);

export default function AuditServicesPage() {
  return (
    <div className="a4-landing-page">
      <AuditApp />
    </div>
  );

  // --- Previous implementation (commented out) ---
  // Prior audit landing components — replaced by AuditApp from New website (2) Audit Services.html
}
