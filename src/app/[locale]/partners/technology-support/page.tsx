import { Metadata } from "next";
import TechnologySupportPageContent from "@/components/partners/TechnologySupportPageContent";

export const metadata: Metadata = {
  title: "Technology Integration Support | A4",
  description: "Supporting your existing systems with structured expertise. Improve structure, consistency, and delivery control.",
};

export default function TechnologySupportPage() {
  return <TechnologySupportPageContent />;
}
