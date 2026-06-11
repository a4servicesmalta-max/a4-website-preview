import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import { LandingApp } from "../automated-bookkeeping/components/LandingParts";

export const metadata: Metadata = {
  title: "Automated Bookkeeping (Standalone) | A4 Services",
  description: "Bookkeeping from €25/month. Automation handles the heavy lifting, MIA-licensed accountants handle the review.",
};

export default function AutomatedBookkeepingStandalonePage() {
  return (
    <div className="a4-landing-page pt-24 sm:pt-28">
      <LandingApp />
    </div>
  );

  // --- Previous implementation (commented out) ---
  // import "./styles.css";
  // import { LandingHero, Integrations, HowItWorks, Why, FinalCTA, SupportStrip } from "./components/LandingParts";
  // import { LandingPlan } from "./components/LandingPlan";
  //
  // export default function AutomatedBookkeepingStandalonePage() {
  //   return (
  //     <div className="bg-[var(--a4-canvas-light)] text-[var(--a4-ink)] font-sans antialiased ...">
  //       <main>
  //         <LandingHero />
  //         <Integrations />
  //         <HowItWorks />
  //         <LandingPlan />
  //         <Why />
  //         <FinalCTA />
  //       </main>
  //       <SupportStrip />
  //     </div>
  //   );
  // }
}
