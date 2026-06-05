import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import { AuditApp } from "./components/AuditParts";

export const metadata: Metadata = {
  title: "Audit Services | A4 Services Malta",
  description: "Licensed audit firm in Malta — rigorous, independent, on-time audits with fixed fees agreed up front.",
};

export default function AuditServicesPage() {
  return (
    <div className="a4-landing-page pt-8">
      <AuditApp />
    </div>
  );
}
