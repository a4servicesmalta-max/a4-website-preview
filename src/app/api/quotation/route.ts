import { NextRequest, NextResponse } from "next/server";
import { pushToPortal } from "@/lib/portal";
import { buildQuote, type QuoteInput, type QuoteServiceId } from "@/lib/quotation";
import { SECTORS, TXN_BANDS, type TxnBand } from "@/data/a4QuotePack";
import { renderQuotationPdf } from "@/lib/quotation-pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_SERVICES: QuoteServiceId[] = ["accounts", "audit", "vat", "mbr", "payroll"];

export async function POST(req: NextRequest) {
  try {
    const b = await req.json().catch(() => ({}));
    const name = String(b.name || "").slice(0, 120);
    const email = String(b.email || "").slice(0, 200);
    const company = String(b.company || "").slice(0, 160);
    const regNo = String(b.regNo || "").slice(0, 40);
    const sector = SECTORS.some((x) => x.id === b.sector) ? String(b.sector) : "shop";
    const txnBand = TXN_BANDS.some((t) => t.id === b.txnBand) ? (b.txnBand as TxnBand) : "21-60";
    const services = (Array.isArray(b.services) ? b.services : []).filter((s: string) =>
      VALID_SERVICES.includes(s as QuoteServiceId)
    ) as QuoteServiceId[];
    const overdueYears = Number(b.overdueYears) || 0;

    if (!company) return NextResponse.json({ error: "Company name is required." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    if (services.length === 0) return NextResponse.json({ error: "Select at least one service." }, { status: 400 });

    const input: QuoteInput = { company, regNo, sector, txnBand, services, overdueYears };
    const quote = buildQuote(input);

    // Lead is captured regardless of what the visitor does with the PDF.
    await pushToPortal({
      name,
      email,
      company,
      message:
        `Instant quotation generated on the website.\n` +
        quote.lines.map((l) => `- ${l.name}: ${l.display}`).join("\n") +
        `\nIndicative first-year total: €${quote.indicativeAnnualEur.toLocaleString("en-MT")}` +
        (quote.hasOnRequestLines ? " + items on request" : ""),
      service: "Instant quotation (website builder)",
      source: "quotation-builder",
      priority: "High",
      meta: { input, indicativeAnnualEur: quote.indicativeAnnualEur },
    });

    const pdf = await renderQuotationPdf(
      { ...input, name, email },
      quote,
      { onboardingUrl: process.env.NEXT_PUBLIC_CLIENT_ONBOARDING_URL }
    );

    return NextResponse.json({
      ok: true,
      quote,
      pdfBase64: Buffer.from(pdf).toString("base64"),
      pdfName: `A4-Indicative-Quotation-${company.replace(/[^\w-]+/g, "-").slice(0, 60)}.pdf`,
    });
  } catch (e) {
    console.error("quotation error:", e);
    return NextResponse.json({ error: "Could not generate the quotation. Please try again or contact us." }, { status: 500 });
  }
}
