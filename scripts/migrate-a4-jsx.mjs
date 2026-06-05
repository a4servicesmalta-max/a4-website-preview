/**
 * Converts New website/app/*.jsx → a4-website TSX with A4 token prefixes.
 * Run: node scripts/migrate-a4-jsx.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = "C:/Users/suhail ahamed/Downloads/New website/app";
const OUT_ROOT = path.resolve(__dirname, "../src");

const CSS_VAR_MAP = [
  ["--font-display", "--a4-font-display"],
  ["--font-body", "--a4-font-body"],
  ["--primary-bright", "--a4-primary-bright"],
  ["--primary-deep", "--a4-primary-deep"],
  ["--on-primary", "--a4-on-primary"],
  ["--canvas-light", "--a4-canvas-light"],
  ["--canvas-dark", "--a4-canvas-dark"],
  ["--surface-elevated", "--a4-surface-elevated"],
  ["--surface-deep", "--a4-surface-deep"],
  ["--surface-soft", "--a4-surface-soft"],
  ["--surface-card", "--a4-surface-card"],
  ["--hairline-strong", "--a4-hairline-strong"],
  ["--hairline-light", "--a4-hairline-light"],
  ["--hairline-dark", "--a4-hairline-dark"],
  ["--divider-soft", "--a4-divider-soft"],
  ["--on-dark-mute", "--a4-on-dark-mute"],
  ["--accent-teal", "--a4-accent-teal"],
  ["--primary", "--a4-primary"],
  ["--on-dark", "--a4-on-dark"],
  ["--charcoal", "--a4-charcoal"],
  ["--stone", "--a4-stone"],
  ["--faint", "--a4-faint"],
  ["--ink", "--a4-ink"],
  ["--body", "--a4-body"],
  ["--mute", "--a4-mute"],
  ["--ash", "--a4-ash"],
  ["--link", "--a4-link"],
  ["--r-full", "--a4-r-full"],
  ["--r-xl", "--a4-r-xl"],
  ["--r-lg", "--a4-r-lg"],
  ["--r-md", "--a4-r-md"],
  ["--r-sm", "--a4-r-sm"],
];

const ROUTE_MAP = [
  ['href="A4 Services.html"', 'href="/a4-services"'],
  ["href='A4 Services.html'", "href='/a4-services'"],
  ['href="Automated Bookkeeping.html"', 'href="/automated-bookkeeping"'],
  ["href='Automated Bookkeeping.html'", "href='/automated-bookkeeping'"],
  ['href="Audit Services.html"', 'href="/audit-services"'],
  ["href='Audit Services.html'", "href='/audit-services'"],
  ['href="Partner Program.html"', 'href="/partner-program"'],
  ["href='Partner Program.html'", "href='/partner-program'"],
  ['src="assets/', 'src="/assets/'],
];

const FILE_ROUTES = {
  "App.jsx": "app/[locale]/a4-services/components/A4ServicesApp.tsx",
  "Sections1.jsx": "app/[locale]/a4-services/components/Sections1.tsx",
  "Sections2.jsx": "app/[locale]/a4-services/components/Sections2.tsx",
  "Sections3.jsx": "app/[locale]/a4-services/components/Sections3.tsx",
  "Sections4.jsx": "app/[locale]/a4-services/components/Sections4.tsx",
  "Sections5.jsx": "app/[locale]/a4-services/components/Sections5.tsx",
  "Services.jsx": "app/[locale]/a4-services/components/Services.tsx",
  "FeatureBento.jsx": "app/[locale]/a4-services/components/FeatureBento.tsx",
  "DeadlineTracker.jsx": "app/[locale]/a4-services/components/DeadlineTracker.tsx",
  "Insights.jsx": "app/[locale]/a4-services/components/Insights.tsx",
  "Pricing.jsx": "app/[locale]/a4-services/components/Pricing.tsx",
  "Comparison.jsx": "app/[locale]/a4-services/components/Comparison.tsx",
  "QuoteTool.jsx": "app/[locale]/a4-services/components/QuoteTool.tsx",
  "landing/MBRCheck.jsx": "components/a4-landing/MBRCheck.tsx",
  "landing/LandingPlan.jsx": "components/a4-landing/LandingPlan.tsx",
  "landing/LandingParts.jsx": "app/[locale]/automated-bookkeeping/components/LandingParts.tsx",
  "audit/AuditParts.jsx": "app/[locale]/audit-services/components/AuditParts.tsx",
  "audit/AuditOverdue.jsx": "app/[locale]/audit-services/components/AuditOverdue.tsx",
  "audit/AuditEstimator.jsx": "app/[locale]/audit-services/components/AuditEstimator.tsx",
  "audit/FSReview.jsx": "app/[locale]/audit-services/components/FSReview.tsx",
  "partners/PartnerParts.jsx": "app/[locale]/partner-program/components/PartnerParts.tsx",
  "partners/PartnerEarnings.jsx": "app/[locale]/partner-program/components/PartnerEarnings.tsx",
};

const SKIP = new Set(["Primitives.jsx", "HeroFX.jsx", "PortalMockup.jsx", "tweaks-panel.jsx"]);

function needsClient(code) {
  return /\b(useState|useEffect|useRef|useCallback|useMemo|useReducer)\b/.test(code);
}

function transform(code, relPath) {
  let out = code;

  // strip window exports
  out = out.replace(/\nObject\.assign\(window,\s*\{[^}]*\}\);?\s*$/m, "");

  for (const [from, to] of CSS_VAR_MAP) {
    out = out.split(from).join(to);
  }
  for (const [from, to] of ROUTE_MAP) {
    out = out.split(from).join(to);
  }

  // class → className in style objects is already className in JSX
  // Add imports for primitives-dependent files
  const usesPrimitives =
    /\b(Logo|Button|Pill|Badge|Eyebrow|Icon|Container|SectionHead|Reveal)\b/.test(out) &&
    !relPath.includes("Primitives");
  const usesHeroFX = /\bHeroFX\b/.test(out);
  const usesPortal = /\bPortalMockup\b/.test(out);
  const usesLandingPlan = /\bLandingPlan\b/.test(out) && !relPath.includes("LandingPlan");
  const usesMBR = /\bMBRCheck\b/.test(out) && !relPath.includes("MBRCheck");
  const usesAudit = /\b(AuditEstimator|AuditOverdue|FSReview)\b/.test(out);
  const usesPartnerEarnings = /\bPartnerEarnings\b/.test(out);
  const usesTweaks = /\b(useTweaks|TweaksPanel|Tweak)/.test(out);

  const imports = [];
  if (needsClient(out)) imports.push('"use client";', "");
  imports.push('import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";');

  const primImports = [];
  if (usesPrimitives) primImports.push("Logo", "Button", "Pill", "Badge", "Eyebrow", "Icon", "Container", "SectionHead", "Reveal");
  if (primImports.length) {
    const depth = relPath.split("/").length - 1;
    const alias = "@/components/a4-landing/Primitives";
    imports.push(`import { ${primImports.join(", ")} } from "${alias}";`);
  }
  if (usesHeroFX) imports.push('import { HeroFX } from "@/components/a4-landing/HeroFX";');
  if (usesPortal) imports.push('import { PortalMockup } from "@/components/a4-landing/PortalMockup";');
  if (usesLandingPlan) imports.push('import { LandingPlan } from "@/components/a4-landing/LandingPlan";');
  if (usesMBR) imports.push('import { MBRCheck } from "@/components/a4-landing/MBRCheck";');
  if (usesAudit) {
    const auditMods = [];
    if (/\bAuditEstimator\b/.test(out)) auditMods.push("AuditEstimator");
    if (/\bAuditOverdue\b/.test(out)) auditMods.push("AuditOverdue");
    if (/\bFSReview\b/.test(out)) auditMods.push("FSReview");
    for (const m of auditMods) {
      imports.push(`import { ${m} } from "@/app/[locale]/audit-services/components/${m}";`);
    }
  }
  if (usesPartnerEarnings) imports.push('import { PartnerEarnings } from "./PartnerEarnings";');
  if (usesTweaks) imports.push('import { useTweaks, TweaksPanel, TweakSection, TweakColor, TweakRadio, TweakText, TweakToggle } from "@/components/a4-landing/TweaksPanel";');

  // Section cross-imports for App
  const sectionImports = {
    "App.jsx": [
      'import { Nav, Hero, Statement } from "./Sections1";',
      'import { LinkedInVideos, Insights } from "./Insights";',
      'import { MBRCheck } from "@/components/a4-landing/MBRCheck";',
      'import { LandingPlan } from "@/components/a4-landing/LandingPlan";',
      'import { Capabilities, Outcomes } from "./Sections2";',
      'import { Services } from "./Services";',
      'import { FeatureBento } from "./FeatureBento";',
      'import { Portal, HowItWorks } from "./Sections3";',
      'import { DeadlineTracker } from "./DeadlineTracker";',
      'import { International, WhoWeWorkWith } from "./Sections4";',
      'import { Comparison } from "./Comparison";',
      'import { ContactCTA, FAQ, Footer } from "./Sections5";',
    ],
    "AuditParts.jsx": [
      'import { AuditEstimator } from "./AuditEstimator";',
      'import { AuditOverdue } from "./AuditOverdue";',
      'import { FSReview } from "./FSReview";',
    ],
  };
  const base = path.basename(relPath);
  if (sectionImports[base]) imports.push(...sectionImports[base]);

  imports.push("");

  // Remove duplicate react hook usage from original if we added full import - strip leading comments only once
  out = out.replace(/^\/\/[^\n]*\n/gm, (m, offset) => (offset === 0 ? "" : m));

  // Export main app components
  const exportMap = {
    "App.jsx": "A4ServicesApp",
    "AuditParts.jsx": "AuditApp",
    "PartnerParts.jsx": "PartnerApp",
    "LandingParts.jsx": null, // multiple named exports
  };
  if (exportMap[base] === "A4ServicesApp") {
    out = out.replace(/^function App\(/m, "export function A4ServicesApp(");
  } else if (exportMap[base] === "AuditApp") {
    out = out.replace(/^function AuditApp\(/m, "export function AuditApp(");
    out = out.replace(/^function AuditNav\(/m, "export function AuditNav(");
  } else if (exportMap[base] === "PartnerApp") {
    out = out.replace(/^function PartnerApp\(/m, "export function PartnerApp(");
  } else if (base === "LandingParts.jsx") {
    out = out.replace(/^function LandingApp\(/m, "export function LandingApp(");
    out = out.replace(/^function LandingNav\(/m, "export function LandingNav(");
    out = out.replace(/^function LandingHero\(/m, "export function LandingHero(");
    out = out.replace(/^function Integrations\(/m, "export function Integrations(");
    out = out.replace(/^function HowItWorks\(/m, "export function HowItWorks(");
    out = out.replace(/^function ReviewedByTeam\(/m, "export function ReviewedByTeam(");
    out = out.replace(/^function Why\(/m, "export function Why(");
    out = out.replace(/^function FinalCTA\(/m, "export function FinalCTA(");
    out = out.replace(/^function LandingFooter\(/m, "export function LandingFooter(");
    out = out.replace(/^function SupportStrip\(/m, "export function SupportStrip(");
  } else {
    // export all top-level function components
    out = out.replace(/^function ([A-Z][A-Za-z0-9_]*)\s*\(/gm, "export function $1(");
  }

  // LandingPlan exports LandingPlan component
  if (base === "LandingPlan.jsx") {
    out = out.replace(/^function LandingPlan\(/m, "export function LandingPlan(");
  }

  return imports.join("\n") + out;
}

function walk(dir, base = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, rel);
    else if (e.name.endsWith(".jsx") && !SKIP.has(e.name) && !SKIP.has(rel)) {
      const destRel = FILE_ROUTES[rel];
      if (!destRel) {
        console.warn("SKIP (no route):", rel);
        continue;
      }
      const src = fs.readFileSync(full, "utf8");
      const converted = transform(src, rel);
      const dest = path.join(OUT_ROOT, destRel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, converted);
      console.log("Wrote", destRel);
    }
  }
}

walk(SRC_ROOT);
