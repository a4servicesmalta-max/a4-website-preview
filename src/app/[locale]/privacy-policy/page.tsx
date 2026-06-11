import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { LegalDocPage } from "@/components/a4-site/LegalDocPage";
import { PRIVACY_POLICY_SECTIONS } from "@/data/a4LegalSiteData";

export const metadata: Metadata = {
  title: "Privacy Policy — A4 Services",
  description:
    "Your privacy matters to us. This policy explains what personal data we collect, how we use it, and the rights you have over it.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalDocPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated="June 2026"
      intro="Your privacy matters to us. This policy explains what personal data we collect, how we use it, and the rights you have over it."
      sections={PRIVACY_POLICY_SECTIONS}
    />
  );

  // --- Previous implementation (commented out) ---
  // "use client";
  // import PageHeader from "@/components/common/PageHeader";
  // ... huge embedded Termly HTML ...
}
