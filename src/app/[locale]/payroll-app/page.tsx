import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import { PayrollApp } from "./components/PayrollParts";

export const metadata: Metadata = {
  title: "Payroll — A4 Client Portal",
  description: "Malta payroll prototype — run payroll, manage people, and generate tax forms with live 2026 government rates.",
};

export default function PayrollAppPage() {
  return (
    <div id="main-content" style={{ minHeight: "100vh", paddingTop: 72, background: "#09090B", color: "#FFFFFF" }}>
      <PayrollApp />
    </div>
  );
}
