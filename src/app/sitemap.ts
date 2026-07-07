import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n-config";
import { getSiteUrl } from "@/lib/site-url";
import { getBlogSlugs, getAllBlogsMerged } from "@/utils/blog";

/** Marketing routes to surface in Search Console / Ads landing quality (locale-prefixed). */
const STATIC_PATHS = [
  "",
  "/contact",
  "/insights",
  "/pricing",
  "/pricing-info",
  "/accounting-health-check",
  "/compliance-calendar",
  "/partners",
  "/white-label-platform",
  "/partners-platform",
  "/about",
  "/faq",
  "/how-it-works",
  "/how-a4-works",
  "/quote",
  "/privacy-policy",
  "/terms-and-conditions",
  "/resources",
  "/security-compliance",
  "/case-studies",
  "/cpe",
  "/bookkeeping",
  "/accounting-malta",
  "/ai-review",
  "/accounting",
  "/business",
  "/auditor-questionnaire",
  "/automated-bookkeeping",
  "/audit-services",
  "/partner-program",
  "/audit-outsourcing",
  "/payroll-app",
  "/reconciliation-hero",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  // File posts + portal-published posts (falls back to file-only on fetch failure).
  const merged = await getAllBlogsMerged().catch(() => null);
  const slugs = merged ? merged.map((b) => b.slug) : getBlogSlugs();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const p of STATIC_PATHS) {
      const path = p === "" ? `/${locale}` : `/${locale}${p}`;
      entries.push({
        url: `${base}${path}`,
        lastModified: new Date(),
        changeFrequency: p === "" ? "weekly" : "monthly",
        priority: p === "" ? 1 : p.includes("platform") ? 0.9 : 0.8,
      });
    }
    for (const slug of slugs) {
      entries.push({
        url: `${base}/${locale}/insights/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
