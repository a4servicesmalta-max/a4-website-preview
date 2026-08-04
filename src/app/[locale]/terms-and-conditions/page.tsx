import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { LegalDocPage } from "@/components/a4-site/LegalDocPage";
import { TERMS_SECTIONS } from "@/data/a4LegalSiteData";

export const metadata: Metadata = {
  title: "Terms & Conditions — A4 Services",
  description:
    "Please read these terms carefully. They set out the basis on which we provide our website and professional services to you.",
};

export default function TermsAndConditionsPage() {
  return (
    <LegalDocPage
      eyebrow="Legal"
      title="Terms & Conditions"
      updated="August 2026"
      intro="Please read these terms carefully. They set out the basis on which we provide our website and professional services to you."
      sections={TERMS_SECTIONS}
    />
  );

  // --- Previous implementation (commented out) ---
  // "use client";
  // import PageHeader from "@/components/common/PageHeader";
  // ... huge embedded Termly HTML ...
}
