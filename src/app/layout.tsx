import type { Metadata } from "next";
import { Libre_Bodoni, Montserrat, Nunito } from "next/font/google";
import ConsentedAnalytics from "@/components/common/ConsentedAnalytics";
import "@fontsource/mona-sans";
import "./globals.css";
import "@/components/bookkeeping/bookkeeping.css";
import { headers } from "next/headers";
import { LOCALE_HEADER } from "@/lib/i18n-config";
import { getSiteUrl } from "@/lib/site-url";
import { DEFAULT_DESCRIPTION, pageMetadata } from "@/lib/page-metadata";

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

const siteUrl = getSiteUrl();
const rootMeta = pageMetadata(
  "Accounting, Audit & Corporate Services in Malta",
  "A4 Services Limited — a licensed Malta accounting and audit firm. Fixed monthly bookkeeping, VAT, payroll, audit and corporate services. Internationally capable via BOKS International.",
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
    <html lang={lang} suppressHydrationWarning>
      <body suppressHydrationWarning className={`antialiased ${bodoni.variable} ${montserrat.variable} ${nunito.variable}`}>
        {/* Analytics and the ad tag load from here, and only after the visitor
            has accepted cookies. Do not move a tag back into this layout. */}
        <ConsentedAnalytics />
        {children}
      </body>
    </html>
  );
}
