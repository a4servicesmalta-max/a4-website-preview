/**
 * Canonical/OG/robots/sitemap all derive from getSiteUrl, so a wrong value here
 * is a site-wide SEO fault. On 2026-08-07 it emitted a Vercel *deployment*
 * hostname on 19 of 20 pages, in robots.txt, and in all 354 sitemap URLs —
 * including both Google Ads landing pages, which told Google they were copies
 * of a preview host. These pin that it cannot happen again.
 */

import { describe, it, expect, afterEach } from "vitest";
import { getSiteUrl } from "./site-url";

const KEYS = ["NEXT_PUBLIC_SITE_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"] as const;
const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

const clear = () => KEYS.forEach((k) => delete process.env[k]);

describe("getSiteUrl", () => {
  it("defaults to the public domain when nothing is configured", () => {
    clear();
    expect(getSiteUrl()).toBe("https://a4.com.mt");
  });

  it("NEVER uses VERCEL_URL — it is the per-deployment host, not the site", () => {
    clear();
    process.env.VERCEL_URL = "a4-website-preview-g92czljkd-a4services.vercel.app";
    expect(getSiteUrl()).toBe("https://a4.com.mt");
    expect(getSiteUrl()).not.toContain("vercel.app");
  });

  it("prefers an explicit NEXT_PUBLIC_SITE_URL", () => {
    clear();
    process.env.NEXT_PUBLIC_SITE_URL = "https://a4.com.mt/";
    expect(getSiteUrl()).toBe("https://a4.com.mt");
  });

  it("falls back to Vercel's stable production domain, not the deployment one", () => {
    clear();
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "a4.com.mt";
    process.env.VERCEL_URL = "a4-website-preview-g92czljkd-a4services.vercel.app";
    expect(getSiteUrl()).toBe("https://a4.com.mt");
  });

  it("never emits a trailing slash — callers concatenate paths onto it", () => {
    clear();
    process.env.NEXT_PUBLIC_SITE_URL = "https://a4.com.mt/";
    expect(getSiteUrl().endsWith("/")).toBe(false);
  });
});
