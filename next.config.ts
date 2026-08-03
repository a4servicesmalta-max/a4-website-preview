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
      // cdn.livechat-static.com was here for a hot-linked hand-wave GIF in the
      // support-chat greeting card. That artwork is now an inline SVG, so the
      // host is no longer allow-listed — nothing may load from it again by
      // accident.
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
    return [
      { source: "/books", destination: booksDestination, permanent: false },
      { source: "/:locale(en|de|es|fr|it|nl)/books", destination: booksDestination, permanent: false },
    ];
  },
};

export default nextConfig;
