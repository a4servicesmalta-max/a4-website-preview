import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { AiReviewContent } from "./components/AiReviewContent";

export const metadata: Metadata = {
  title: "AI Review — A4 Services",
  description:
    "Auditor-designed financial statement review. Structured, focused and reliable — without replacing professional judgement.",
};

export default function AIReviewPage() {
  return <AiReviewContent />;

  // --- Previous implementation (commented out) ---
  // "use client";
  // import PageHeader from "@/components/common/PageHeader";
  // import AIReviewFeature from "@/components/ai-review/AIReviewFeature";
  // import PortalFeature from "@/components/services/PortalFeature";
  // import ServiceFeatures from "@/components/services/ServiceFeatures";
  // import ReviewOutputSection from "@/components/ai-review/ReviewOutputSection";
  // import BenefitsVideoSection from "@/components/ai-review/BenefitsVideoSection";
  // import { FadeInUp } from "@/components/common/Animations";
  // import { usePagesTranslation } from "@/hooks/usePagesTranslation";
}