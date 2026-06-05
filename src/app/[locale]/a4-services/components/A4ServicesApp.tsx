// @ts-nocheck
"use client";

import React from "react";
import { MBRCheck } from "@/components/a4-landing/MBRCheck";
import { LandingPlan } from "@/components/a4-landing/LandingPlan";
import { Hero, Statement } from "./Sections1";
import { LinkedInVideos, Insights } from "./Insights";
import { Capabilities, Outcomes } from "./Sections2";
import { Services } from "./Services";
import { FeatureBento } from "./FeatureBento";
import { HowItWorks } from "./Sections3";
import { DeadlineTracker } from "./DeadlineTracker";
import { International, WhoWeWorkWith } from "./Sections4";
import { Comparison } from "./Comparison";
import { ContactCTA, FAQ } from "./Sections5";

export function A4ServicesApp() {
  return (
    <div>
      {/* <Nav /> */}
      <main>
        <Hero />
        <Statement />
        <LinkedInVideos />
        <Insights />
        <MBRCheck />
        <LandingPlan />
        <Capabilities />
        <Services />
        <FeatureBento />
        <Outcomes />
        <HowItWorks />
        <DeadlineTracker />
        <International />
        <Comparison />
        <WhoWeWorkWith />
        <ContactCTA />
        <FAQ />
      </main>
      {/* <Footer /> */}
    </div>
  );
}
