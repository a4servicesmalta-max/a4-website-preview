import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { WhiteLabelPlatformContent } from "./components/WhiteLabelPlatformContent";

export const metadata: Metadata = {
  title: "White-label platform — A4 Services",
  description:
    "Launch your own branded client platform — your brand on the outside, A4's secure structured platform on the inside.",
};

export default function WhiteLabelPlatformPage() {
  return <WhiteLabelPlatformContent />;

  // --- Previous implementation (commented out) ---
  // "use client";
  // import WLHero from "@/components/white-label/WLHero";
  // import WLBentoGrid, WLProcess, WLInteractiveCards, WLPricing, WLCTASection, ...
}
