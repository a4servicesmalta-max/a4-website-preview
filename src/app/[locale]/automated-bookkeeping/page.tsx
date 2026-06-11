import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import { LandingApp } from "./components/LandingParts";

export const metadata: Metadata = {
  title: "Automated Bookkeeping | A4 Services",
  description: "Bookkeeping from €25/month. Automation handles the heavy lifting, MIA-licensed accountants handle the review.",
};

export default function AutomatedBookkeepingPage() {
  return (
    <div className="a4-landing-page pt-24 sm:pt-28">
      <LandingApp />
    </div>
  );

  // --- Previous implementation (commented out) ---
  // Standalone landing with its own nav/footer — replaced by LandingApp from New website (2) Automated Bookkeeping.html
}
