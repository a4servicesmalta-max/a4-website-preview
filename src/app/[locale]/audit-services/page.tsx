import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import { AuditApp } from "./components/AuditParts";

export const metadata: Metadata = {
  title: "Audit Services | A4 Services Malta",
  description: "Licensed audit firm in Malta — rigorous, independent, on-time audits with fixed fees agreed up front.",
};

export default function AuditServicesPage() {
  return (
    <div className="a4-landing-page pt-24 sm:pt-28">
      <AuditApp />
    </div>
  );

  // --- Previous implementation (commented out) ---
  // Prior audit landing components — replaced by AuditApp from New website (2) Audit Services.html
}
