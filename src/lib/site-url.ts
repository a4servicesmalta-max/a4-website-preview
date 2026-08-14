/**
 * Base URL for canonical links, OG URLs, robots.txt and the sitemap.
 *
 * These must always be the PUBLIC domain. Getting it wrong is not cosmetic:
 * a canonical pointing at a deployment host tells Google the real page is
 * somewhere else, and every ad landing page disclaims itself.
 *
 * `VERCEL_URL` is deliberately NOT used. On Vercel it is the *per-deployment*
 * hostname (a4-website-preview-<hash>-a4services.vercel.app) — it changes on
 * every single deploy and is never the production domain, so it is exactly the
 * wrong value for a canonical. It was the previous fallback, which is how all
 * 354 sitemap URLs and 19 of 20 canonicals ended up on a preview host.
 *
 * Order of preference:
 *   1. NEXT_PUBLIC_SITE_URL — explicit override, wins everywhere.
 *   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel's *stable* production domain,
 *      which does not change per deployment.
 *   3. The public domain, hardcoded. Correct by default, so a missing env var
 *      degrades to right rather than to a preview host.
 */

const PUBLIC_SITE_URL = "https://a4.com.mt";

function normalize(value: string): string {
  const trimmed = value.trim().replace(/\/$/, "");
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit && /^https?:\/\//i.test(explicit)) return normalize(explicit);

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionHost) return normalize(productionHost);

  return PUBLIC_SITE_URL;
}
