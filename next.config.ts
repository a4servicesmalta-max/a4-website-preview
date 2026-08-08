import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `src/lib/quotation-pdf.ts` reads two PNGs out of public/ at runtime via a
  // computed path, so Next traces the WHOLE public/ folder into every server
  // function — 595 MB of video and GIFs no function ever opens. That pushed
  // api/quotation to 419 MB and Vercel refused the deployment (250 MB limit).
  // Vercel serves this media from the CDN; it has no business in a bundle.
  // The two PNGs the PDF does read (assets/quote/…, assets/a4-mark-white.png)
  // are not matched here and stay traced.
  outputFileTracingExcludes: {
    "**": [
      "public/assets/videos/**",
      "public/**/*.mp4",
      "public/**/*.webm",
      "public/**/*.mov",
      "public/**/*.gif",
    ],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.livechat-static.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async redirects() {
    // A4 Books landing. books.a4.com.mt is live, so /books now points at the
    // real domain instead of the Vercel preview URL.
    // Still a 307 (temporary) on purpose: a permanent redirect is cached hard
    // by browsers and is painful to undo. Flip `permanent: true` once you are
    // certain this destination is final.
    const booksDestination = "https://books.a4.com.mt/";
    // Every on-site CTA sends "create an account" traffic through
    // CLIENT_ONBOARDING_URL (src/lib/external-links.ts) — an absolute link to
    // client.a4.com.mt/onboarding. Nothing in this app renders a same-origin
    // "/onboarding" href (checked 2026-08-08: no match anywhere under src/).
    // But the bare path 404s live on a4.com.mt itself, so any traffic that
    // lands here directly — an old ad final URL, a bookmark, a typed guess —
    // hits a dead end instead of the real destination. Same default as
    // external-links.ts so the two can't drift; mirrored rather than
    // imported because next.config.ts doesn't get the app's path aliases.
    const onboardingDestination =
      process.env.NEXT_PUBLIC_CLIENT_ONBOARDING_URL?.trim() || "https://client.a4.com.mt/onboarding";
    return [
      { source: "/books", destination: booksDestination, permanent: false },
      { source: "/:locale(en|de|es|fr|it|nl)/books", destination: booksDestination, permanent: false },
      { source: "/onboarding", destination: onboardingDestination, permanent: false },
      { source: "/:locale(en|de|es|fr|it|nl)/onboarding", destination: onboardingDestination, permanent: false },
      // The old standalone ad landing pages carried frozen copies of the
      // pricing and their own calculators, so they contradicted the live
      // figures. Retired 2026-08-02 in favour of the real pages, which read
      // the quote pack. Kept as redirects (not 404s) because live Google Ads
      // may still point at these URLs. `redirects()` is evaluated before the
      // filesystem, so these win even while the files exist in public/.
      { source: "/lp/audit-services.html", destination: "/audit-services", permanent: true },
      { source: "/lp/automated-bookkeeping.html", destination: "/accounting-services", permanent: true },
    ];
  },
};

export default nextConfig;
