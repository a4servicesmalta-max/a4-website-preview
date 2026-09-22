import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "@/components/a4-landing/styles.css";
import { AuditApp } from "./components/AuditParts";

import { pageMetadata } from "@/lib/page-metadata";

// The fee calculator sets money, step numbers and step tags in JetBrains Mono,
// as vacei.com/services/audit does. Loaded here rather than in the root layout
// so no other page downloads it.
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = pageMetadata(
  "Audit & Assurance in Malta",
  "Statutory audit and assurance from A4 Services Limited — a licensed Malta audit firm. Fixed fees, GAPSME and IFRS, signed by a licensed audit firm.",
);

export default function AuditServicesPage() {
  return (
    <div className={`a4-landing-page pt-24 sm:pt-28 ${mono.variable}`}>
      <AuditApp />
    </div>
  );

  // --- Previous implementation (commented out) ---
  // Prior audit landing components — replaced by AuditApp from New website (2) Audit Services.html
}
