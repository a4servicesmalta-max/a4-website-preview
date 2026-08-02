import type { Metadata } from "next";
import { defaultLocale, locales, isLocale } from "@/lib/i18n-config";
import { getSiteUrl } from "@/lib/site-url";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

// The default locale is never shown in the URL.
const urlFor = (base: string, locale: string, path: string) =>
  locale === defaultLocale ? `${base}${path}` : `${base}/${locale}${path}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: loc } = await params;
  const locale = isLocale(loc) ? loc : "en";
  const base = getSiteUrl();
  const path = "/white-label-platform";
  const languages = Object.fromEntries(
    locales.map((l) => [l, urlFor(base, l, path)]),
  ) as Record<string, string>;

  const title = "A4 White-Label Platform | Branded Client Portals for Firms";
  const description =
    "Launch your own branded client platform: custom domain, client portals, workflows, and compliance tools for accounting, audit, legal, and compliance firms. Request a demo.";

  return {
    title,
    description,
    alternates: {
      canonical: urlFor(base, locale, path),
      languages,
    },
    openGraph: {
      title,
      description,
      url: urlFor(base, locale, path),
      type: "website",
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function WhiteLabelPlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
