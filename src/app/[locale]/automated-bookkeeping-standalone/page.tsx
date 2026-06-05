import type { Metadata } from "next";
import "./styles.css";
import { LandingHero, Integrations, HowItWorks, Why, FinalCTA, SupportStrip } from "./components/LandingParts";
import { LandingPlan } from "./components/LandingPlan";

export const metadata: Metadata = {
  title: "Automated Bookkeeping (Standalone) | A4 Services",
  description: "Bookkeeping from €25/month. Automation handles the heavy lifting, MIA-licensed accountants handle the review.",
};

export default function AutomatedBookkeepingStandalonePage() {
  return (
    <div className="bg-[var(--a4-canvas-light)] text-[var(--a4-ink)] font-sans antialiased selection:bg-[var(--a4-primary)] selection:text-white">
      {/* <LandingNav /> */}
      <main>
        <LandingHero />
        <Integrations />
        <HowItWorks />
        <LandingPlan />
        <Why />
        <FinalCTA />
      </main>
      <SupportStrip />
    </div>
  );
}
