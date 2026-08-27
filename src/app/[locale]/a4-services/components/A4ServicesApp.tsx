// @ts-nocheck
"use client";

import React from "react";
import { LandingQuoteCalculator } from "@/components/a4-landing/LandingQuoteCalculator";
import { HealthCheckPromo } from "@/components/a4-landing/HealthCheckPromo";
import { A4BooksPromo } from "@/components/a4-landing/A4BooksPromo";
import { Hero, Statement, Manifesto } from "./Sections1";
import { ComplianceJourney } from "./ComplianceJourney";
import { IntroVideo } from "./IntroVideo";
import { LinkedInVideoFeed } from "./LinkedInVideoFeed";
import { Insights } from "./Insights";
import { Capabilities } from "./Sections2";
import { Services } from "./Services";
import { FeatureBento } from "./FeatureBento";
import { HowItWorks } from "./Sections3";
import { International, WhoWeWorkWith } from "./Sections4";
import { DeadlineTracker } from "./DeadlineTracker";
import { Comparison } from "./Comparison";
import { ContactCTA, FAQ } from "./Sections5";
import {
  TrustedSectorsBand,
  TestimonialsSection,
  CaseStudiesTeaser,
} from "./HomeConversionSections";
import { MotionBand } from "./MotionBand";

/**
 * Homepage section registry — the portal's Site Editor (team.a4.com.mt →
 * Website → Site Editor) controls visibility + order via the
 * `homepage.sections` site override. Ids are stable keys; keep them in sync
 * with the portal's section list when adding/removing sections.
 */
export const HOMEPAGE_SECTIONS = [
  { id: "hero", label: "Hero", el: Hero },
  { id: "statement", label: "Statement", el: Statement },
  { id: "manifesto", label: "AI-Native Manifesto", el: Manifesto },
  { id: "journey", label: "Compliance Journey (scroll story)", el: ComplianceJourney },
  { id: "intro-video", label: "Intro Video", el: IntroVideo },
  { id: "case-studies", label: "Case Studies Teaser", el: CaseStudiesTeaser },
  { id: "linkedin-videos", label: "LinkedIn Video Feed", el: LinkedInVideoFeed },
  { id: "trusted-sectors", label: "Trusted Sectors Band", el: TrustedSectorsBand },
  { id: "testimonials", label: "Testimonials", el: TestimonialsSection },
  { id: "insights", label: "Insights", el: Insights },
  { id: "health-check", label: "Health Check Promo", el: HealthCheckPromo },
  { id: "landing-plan", label: "Pricing Calculator", el: LandingQuoteCalculator },
  { id: "a4-books", label: "A4 Books Promo", el: A4BooksPromo },
  { id: "capabilities", label: "Capabilities", el: Capabilities },
  { id: "services", label: "Services", el: Services },
  { id: "feature-bento", label: "Feature Bento", el: FeatureBento },
  { id: "how-it-works", label: "How It Works", el: HowItWorks },
  { id: "deadline-tracker", label: "Deadline Tracker", el: DeadlineTracker },
  { id: "international", label: "International", el: International },
  { id: "comparison", label: "Comparison", el: Comparison },
  { id: "who-we-work-with", label: "Who We Work With", el: WhoWeWorkWith },
  { id: "motion-band", label: "Motion Band", el: MotionBand },
  { id: "contact-cta", label: "Contact CTA", el: ContactCTA },
  { id: "faq", label: "FAQ", el: FAQ },
];

export function A4ServicesApp({
  sections = null,
}: {
  sections?: { id: string; visible: boolean }[] | null;
} = {}) {
  const byId = new Map(HOMEPAGE_SECTIONS.map((s) => [s.id, s]));
  // Config drives order + visibility; unknown ids are skipped, and any section
  // MISSING from the config still renders (in default position) so a stale
  // config can never silently drop a brand-new section.
  const ordered = sections?.length
    ? [
        ...sections.filter((c) => c.visible && byId.has(c.id)).map((c) => byId.get(c.id)),
        ...HOMEPAGE_SECTIONS.filter((s) => !sections.some((c) => c.id === s.id)),
      ]
    : HOMEPAGE_SECTIONS;

  return (
    <div>
      <main id="main-content" tabIndex={-1}>
        {ordered.map((s) => (
          <s.el key={s.id} />
        ))}
      </main>
    </div>
  );
}
