import type { Metadata } from "next";
import HomePage from "@/components/HomePage/Homepage";
import { getAllBlogsMerged } from "@/utils/blog";
import { fetchSiteOverride, type SectionConfig } from "@/lib/cms";
import { A4ServicesApp } from "./a4-services/components/A4ServicesApp";
import { pageMetadata } from "@/lib/page-metadata";
import { defaultLocale, locales } from "@/lib/i18n-config";
import "@/components/a4-landing/styles.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const base = pageMetadata(
    "Accounting, Audit & Corporate Services in Malta",
    "A4 Services Limited — licensed Malta accounting and audit firm. A4 Books software from €35/mo, with accountants from €95/mo, VAT, payroll, audit and corporate services.",
  );
  // The default-locale homepage is served at the root ("/"), not "/en".
  const homeHref = (l: string) => (l === defaultLocale ? "/" : `/${l}`);
  const languages: Record<string, string> = Object.fromEntries(locales.map((l) => [l, homeHref(l)]));
  languages["x-default"] = "/";
  return { ...base, alternates: { canonical: homeHref(locale), languages } };
}

// Re-render at most every 2 minutes so portal edits (sections, blog posts)
// go live without a redeploy.
export const revalidate = 120;

export default async function Home() {
  const [allBlogs, sectionConfig] = await Promise.all([
    getAllBlogsMerged(),
    fetchSiteOverride<SectionConfig[]>("homepage.sections"),
  ]);
  const recentBlogs = allBlogs.slice(0, 3);

  const accountingService = {
    "@context": "https://schema.org",
    "@type": "AccountingService",
    name: "A4 Services Limited",
    url: "https://a4.com.mt",
    logo: "https://a4.com.mt/og-image.jpg",
    image: "https://a4.com.mt/og-image.jpg",
    description:
      "Licensed Malta accounting and audit firm — accounting, statutory audit, tax, VAT, payroll, fractional CFO and A4 Books software from €35/mo, accountants from €95/mo.",
    priceRange: "€€",
    telephone: "+35627900007",
    email: "info@a4.com.mt",
    areaServed: { "@type": "Country", name: "Malta" },
    memberOf: { "@type": "Organization", name: "BOKS International" },
    sameAs: ["https://www.linkedin.com/company/a4-servicesltd/"],
    // TODO: add address (PostalAddress) + geo (GeoCoordinates) when provided
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is A4 Services an accounting firm in Malta?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. A4 Services Limited is a Malta-based accounting and audit firm providing accounting, statutory audit, tax, VAT, payroll, fractional CFO and automated bookkeeping services for modern businesses.",
        },
      },
      {
        "@type": "Question",
        name: "Do you provide statutory audit services?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. We provide statutory audit and assurance services for companies in Malta, including audit preparation and coordination managed through the client portal.",
        },
      },
      {
        "@type": "Question",
        name: "How does the client portal work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You upload documents to one secure workspace. Our systems process, extract and match the information, and our team reviews, reconciles and finalises your records — with deadlines, requests and reports tracked in one place.",
        },
      },
      {
        "@type": "Question",
        name: "Can you take over bookkeeping that is behind?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. We regularly help businesses bring overdue bookkeeping up to date, then keep it current through automated monthly workflows reviewed by our team.",
        },
      },
      {
        "@type": "Question",
        name: "Do you support international or cross-border clients?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. As an independent member of BOKS International, we can support clients who require cross-border professional assistance.",
        },
      },
      {
        "@type": "Question",
        name: "What size businesses do you work with?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "From startups, freelancers and consultants to scaling companies, local and international trading businesses, regulated entities and high-net-worth individuals.",
        },
      },
    ],
  };

  return (
    <main className="min-h-dvh w-full a4-landing-page pt-24 sm:pt-28">
      {/* <HomePage recentBlogs={recentBlogs} /> */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(accountingService) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
      <A4ServicesApp sections={sectionConfig} />
    </main>
  );
}
