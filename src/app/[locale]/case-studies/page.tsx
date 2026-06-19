import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { CaseStudiesContent } from "./components/CaseStudiesContent";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "Case Studies — Client Results in Malta",
  "How A4 Services helped Malta businesses catch up overdue bookkeeping, deliver statutory audits on time and stay compliant — real outcomes, anonymised.",
);

export default function CaseStudiesPage() {
  return <CaseStudiesContent />;
}
