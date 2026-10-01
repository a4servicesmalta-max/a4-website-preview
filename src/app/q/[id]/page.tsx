import type { Metadata } from "next";
import { fetchQuotationSummary } from "@/lib/quotation-page";
import QuotationLanding from "./QuotationLanding";
import QuotationUnavailable from "./QuotationUnavailable";

/**
 * The A4 quotation page — /q/<quotation id>?t=<signed token>.
 *
 * Every quotation A4 sends a lead (auto-priced from the website, or built by
 * staff in the partner portal) links here. The prospect reads the scope and
 * fees, switches quoted services on or off, downloads the PDF and accepts
 * online; the acceptance lands in the partner portal and in A4's inbox.
 *
 * Personal and token-gated: never indexed, never cached.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your quotation · A4 Services",
  description: "Your quotation from A4 Services — scope, fees and online acceptance.",
  robots: { index: false, follow: false, nocache: true },
};

export default async function QuotationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const token = typeof sp.t === "string" ? sp.t : "";
  // Staff open the client page from the portal with ?preview=1: the page
  // renders exactly as the client sees it, without counting a view and with
  // accepting switched off.
  const preview = sp.preview === "1";
  const result = await fetchQuotationSummary(id, token, { preview });
  if (!result.ok) return <QuotationUnavailable reason={result.reason} />;
  return <QuotationLanding summary={result.summary} token={token} preview={preview} />;
}
