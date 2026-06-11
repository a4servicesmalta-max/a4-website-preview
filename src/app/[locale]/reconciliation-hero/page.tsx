import type { Metadata } from "next";
import { ReconciliationHero } from "./components/ReconciliationHero";

export const metadata: Metadata = {
  title: "Reconciliation — A4 Services",
  description:
    "Audit and accounting that reconciles the detail and reports with precision — clarity brought to every figure.",
};

export default function ReconciliationHeroPage() {
  return <ReconciliationHero />;
}
