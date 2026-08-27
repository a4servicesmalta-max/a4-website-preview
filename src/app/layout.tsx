import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Libre_Bodoni, Montserrat, Nunito, Outfit } from "next/font/google";
import "@fontsource/mona-sans";
import "./globals.css";
import "@/components/bookkeeping/bookkeeping.css";
import { headers } from "next/headers";
import GoogleTags from "@/components/common/GoogleTags";
import { LOCALE_HEADER } from "@/lib/i18n-config";
import { getSiteUrl } from "@/lib/site-url";
import { DEFAULT_DESCRIPTION, pageMetadata } from "@/lib/page-metadata";

const CLARITY_TAG_ID = "w8hmbtjpb8";

const bodoni = Libre_Bodoni({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

// The Vacei faces — Outfit for display, Inter for body — mirrored from
// vacei.com so both sites read as one system.
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = getSiteUrl();
const rootMeta = pageMetadata(
  "Accounting, Audit & Corporate Services in Malta",
  "A4 Services Limited — a licensed Malta accounting and audit firm. Managed monthly bookkeeping from €24 including one bank account, plus VAT, payroll, audit and corporate services. Internationally capable via BOKS International.",
);

export const metadata: Metadata = {
  ...rootMeta,
  metadataBase: new URL(siteUrl),
  title: {
    default: "Accounting, Audit & Corporate Services in Malta | A4 Services",
    template: "%s",
  },
  openGraph: {
    ...rootMeta.openGraph,
    type: "website",
    siteName: "A4 Services",
  },
  twitter: {
    card: "summary_large_image",
    title: "Accounting, Audit & Corporate Services in Malta | A4 Services",
    description: DEFAULT_DESCRIPTION,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const lang = h.get(LOCALE_HEADER) ?? "en";

  return (
    // Font variables live on <html> so :root-level tokens (--a4-font-*,
    // --font-sans) can resolve them — on <body> they are invisible to :root.
    <html lang={lang} suppressHydrationWarning className={`${bodoni.variable} ${montserrat.variable} ${nunito.variable} ${outfit.variable} ${inter.variable}`}>
      <body suppressHydrationWarning className="antialiased">
        <Script
          id="clarity-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${CLARITY_TAG_ID}");`,
          }}
        />
        {/* GA4 + Google Ads, Consent Mode v2 denied by default. Renders nothing
            until NEXT_PUBLIC_GA4_ID / NEXT_PUBLIC_GADS_ID are set. */}
        <GoogleTags />
        {children}
      </body>
    </html>
  );
}
