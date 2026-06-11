import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { PartnersPlatformContent } from "./components/PartnersPlatformContent";

export const metadata: Metadata = {
  title: "Partner platform — A4 Services",
  description:
    "Run your firm on A4 and access new client opportunities across the A4 Network — from €4 per client per month.",
};

export default function PartnersPlatformPage() {
  return <PartnersPlatformContent />;

  // --- Previous implementation (commented out) ---
  // "use client";
  // import WLHero, WLLiveRequests, WLInteractiveCards, WLProcess, WLBentoGrid, WLPricing, WLCTASection, ...
}
