import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import { OutsourceApp } from "./components/OutsourceParts";

export const metadata: Metadata = {
  title: "Audit Outsourcing — Vacei × A4 Services",
  description:
    "Outsource your audits and keep the final say. Full white-label audit delivery from 15% of the fee — first small-client audit free.",
};

export default function AuditOutsourcingPage() {
  return (
    <div className="a4-landing-page pt-24 sm:pt-28">
      <OutsourceApp />
    </div>
  );
}
