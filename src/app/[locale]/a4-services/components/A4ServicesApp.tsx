// @ts-nocheck
"use client";

import React from "react";
import { LandingPlan } from "@/components/a4-landing/LandingPlan";
import { HealthCheckPromo } from "@/components/a4-landing/HealthCheckPromo";
import { Hero, Statement } from "./Sections1";
import { LinkedInVideoFeed } from "./LinkedInVideoFeed";
import { Insights } from "./Insights";
import { Capabilities, Outcomes } from "./Sections2";
import { Services } from "./Services";
import { FeatureBento } from "./FeatureBento";
import { HowItWorks } from "./Sections3";
import { DeadlineTracker } from "./DeadlineTracker";
import { International, WhoWeWorkWith } from "./Sections4";
import { Comparison } from "./Comparison";
import { ContactCTA, FAQ } from "./Sections5";
import { TrustedSectorsBand, DedicatedTeam, CaseStudiesTeaser, TestimonialsSection } from "./HomeConversionSections";

export function A4ServicesApp() {
  return (
    <div>
      {/* <Nav /> */}
      <main>
        <Hero />
        <Statement />
        <LinkedInVideoFeed />
        <TrustedSectorsBand />
        <Insights />
        <HealthCheckPromo />
        <LandingPlan />
        <CaseStudiesTeaser />
        <Capabilities />
        <Services />
        <FeatureBento />
        <DedicatedTeam />
        <Outcomes />
        <HowItWorks />
        <DeadlineTracker />
        <International />
        <Comparison />
        <WhoWeWorkWith />
        <TestimonialsSection />
        <ContactCTA />
        <FAQ />
      </main>
      {/* <Footer /> */}
    </div>
  );
}
