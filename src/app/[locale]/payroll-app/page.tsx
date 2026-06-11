import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import { PayrollApp } from "./components/PayrollParts";

export const metadata: Metadata = {
  title: "Payroll — A4 Client Portal",
  description: "Malta payroll prototype — run payroll, manage people, and generate tax forms with live 2026 government rates.",
};

export default function PayrollAppPage() {
  return (
    <div className="a4-landing-page min-h-screen pt-24 sm:pt-28">
      <PayrollApp />
    </div>
  );
}
