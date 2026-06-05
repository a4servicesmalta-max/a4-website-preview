import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import { A4ServicesApp } from "./components/A4ServicesApp";

export const metadata: Metadata = {
  title: "A4 Services — Accounting & Audit Firm in Malta",
  description: "A licensed Malta accounting & audit firm — automation does the heavy lifting while our team keeps you compliant.",
};

export default function A4ServicesPage() {
  return (
    <div className="a4-landing-page pt-24 sm:pt-28">
      <A4ServicesApp />
    </div>
  );
}
