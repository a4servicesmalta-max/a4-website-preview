import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    return [
      { source: "/books", destination: booksDestination, permanent: false },
      { source: "/:locale(en|de|es|fr|it|nl)/books", destination: booksDestination, permanent: false },
    ];
  },
};

export default nextConfig;
