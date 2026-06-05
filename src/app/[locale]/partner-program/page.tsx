import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import { PartnerApp } from "./components/PartnerParts";

export const metadata: Metadata = {
  title: "Partner Program | A4 Services",
  description: "Earn recurring commission by referring clients to A4 Services — bookkeeping, audit, VAT and more.",
};

export default function PartnerProgramPage() {
  return (
    <div className="a4-landing-page pt-8">
      <PartnerApp />
    </div>
  );
}
