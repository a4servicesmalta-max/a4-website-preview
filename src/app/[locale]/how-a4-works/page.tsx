import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { HowA4WorksContent } from "./components/HowA4WorksContent";

export const metadata: Metadata = {
  title: "How A4 Works — Interactive Guide",
  description:
    "Follow an engagement from intake to final delivery — see the agents that do the heavy lifting, the human layer that reviews everything, and the complete file we hand you.",
};

export default function HowA4WorksPage() {
  return <HowA4WorksContent />;
}
