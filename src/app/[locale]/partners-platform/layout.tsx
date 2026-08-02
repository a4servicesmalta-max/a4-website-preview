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
  const path = "/partners-platform";
  const languages = Object.fromEntries(
    locales.map((l) => [l, urlFor(base, l, path)]),
  ) as Record<string, string>;

  const title = "A4 Partner Platform | Run Your Firm & Grow Through the Network";
  const description =
    "Run your firm on A4: receive client requests in your portal, stay in control of relationships, and access the A4 Network when you need more expertise. Book a demo or apply to join.";

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

export default function PartnersPlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
