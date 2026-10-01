import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import LandingHero from "@/components/AIAgentsLanding/LandingHero";
import ValueStrip from "@/components/AIAgentsLanding/ValueStrip";
import AgentsShowcase from "@/components/AIAgentsLanding/AgentsShowcase";
import OrchestratorCanvas from "@/components/AIAgentsLanding/OrchestratorCanvas";
import PortalMockup from "@/components/AIAgentsLanding/PortalMockup";
import PricingSection from "@/components/AIAgentsLanding/PricingSection";
import CTASection from "@/components/AIAgentsLanding/CTASection";

export const metadata: Metadata = {
  title: "Accounting Agents — A4 Services",
  description: "Explore accounting agent workflows and how A4 applies automation with professional oversight.",
};

/**
 * Accounting agents landing — hero, value cards, the agents, how the
 * orchestrator runs an engagement (dark), the portal, pricing, dark CTA.
 */
export default function AccountingLandingPage() {
  const namespace = "accounting";

  return (
    <main id="main-content" style={{ overflowX: "clip" }}>
      <LandingHero namespace={namespace} />
      <ValueStrip namespace={namespace} />
      <AgentsShowcase namespace={namespace} />
      <OrchestratorCanvas namespace={namespace} />
      <PortalMockup namespace={namespace} />
      <PricingSection namespace={namespace} />
      <CTASection namespace={namespace} />
    </main>
  );
}
