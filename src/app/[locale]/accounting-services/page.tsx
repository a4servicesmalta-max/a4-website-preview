import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import { AccountingApp } from "./components/AccountingParts";
import { ACCOUNTING_FAQS } from "@/data/serviceFaqs";
import { pageMetadata } from "@/lib/page-metadata";
import { BOOKKEEPING_MANAGED_MONTHLY } from "@/data/a4QuotePack";

export const metadata: Metadata = pageMetadata(
  "Accounting & Bookkeeping in Malta",
  `Managed bookkeeping by qualified Maltese accountants — €${BOOKKEEPING_MANAGED_MONTHLY.sole}/month self-employed, €${BOOKKEEPING_MANAGED_MONTHLY.company}/month for a company. We keep the books: documents coded, bank reconciled, VAT from the same ledger. Get your monthly price in sixty seconds.`,
);

const faqPage = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ACCOUNTING_FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function AccountingServicesPage() {
  return (
    <div className="a4-landing-page pt-24 sm:pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
      <AccountingApp />
    </div>
  );
}
