/** Visual accents for insights cards (from New website insights.html) */
export const INSIGHT_VISUALS: Record<string, { icon: string; color: string }> = {
  "cybersecurity-is-no-longer-an-it-problem-it-is-a-financial-risk": { icon: "shield-alert", color: "#e879a9" },
  "why-more-businesses-are-choosing-stability-over-rapid-growth": { icon: "anchor", color: "var(--a4-accent-teal)" },
  "the-eu-ai-act-why-businesses-should-start-treating-ai-like-a-compliance-issue": { icon: "gavel", color: "#d69628" },
  "the-ai-spending-boom-what-businesses-should-learn-before-investing-in-ai": { icon: "cpu", color: "var(--a4-primary-bright)" },
  "esg-is-changing-but-it-is-not-disappearing": { icon: "leaf", color: "#7bc67e" },
  "why-email-is-failing-professional-services": { icon: "mail-x", color: "var(--a4-accent-teal)" },
  "how-much-does-bookkeeping-cost-in-malta": { icon: "book-open-check", color: "var(--a4-primary-bright)" },
  "why-client-portals-are-becoming-essential": { icon: "layout-dashboard", color: "#5b8def" },
  "why-higher-interest-rates-changed-the-way-businesses-should-think-about-debt": { icon: "percent", color: "#d69628" },
  "preparing-for-seamless-audit": { icon: "file-search", color: "var(--a4-primary-bright)" },
  "vat-compliance-checklist-for-businesses": { icon: "clipboard-list", color: "var(--a4-accent-teal)" },
  "what-documents-are-required-for-an-audit": { icon: "folder-open", color: "var(--a4-primary-bright)" },
  "ai-will-reshape-accounting-firms": { icon: "bot", color: "var(--a4-primary-bright)" },
  "compliance-is-becoming-a-systems-problem-not-a-paperwork-problem": { icon: "workflow", color: "var(--a4-accent-teal)" },
};

export const DEFAULT_INSIGHT_VISUAL = { icon: "newspaper", color: "var(--a4-primary-bright)" };

export function getInsightVisual(slug: string) {
  return INSIGHT_VISUALS[slug] ?? DEFAULT_INSIGHT_VISUAL;
}

export const INSIGHTS_ITEMS_PER_PAGE = 9;
