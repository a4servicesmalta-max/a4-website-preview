import { NextRequest, NextResponse } from "next/server";
import { pushToPortal } from "@/lib/portal";
import { buildQuote, QUOTE_MAX_BANKS, REVENUE_BANDS, type QuoteInput, type QuoteServiceId } from "@/lib/quotation";
import { renderQuotationPdf } from "@/lib/quotation-pdf";
import { INDEPENDENCE_CONFLICT, independenceRoute } from "@/lib/independence";
import { EXPENSE_BANDS, SECTORS, TXN_BANDS, type ExpenseBand, type TxnBand } from "@/data/a4QuotePack";

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
    const industry = String(b.industry || "").slice(0, 80);
    // Retired driver: accepted from an in-flight POST, never defaulted, never priced on.
    const revenueBand = REVENUE_BANDS.some((r) => r.id === b.revenueBand) ? b.revenueBand : undefined;
    // The wizard's drivers. Unknown → undefined → the line prices "On request"
    // in `buildQuote`; the builder itself refuses to submit without them.
    const sector = SECTORS.some((x) => x.id === b.sector) ? String(b.sector) : undefined;
    const txn = TXN_BANDS.some((t) => t.id === b.txn) ? (b.txn as TxnBand) : undefined;
    const banks = Math.min(QUOTE_MAX_BANKS, Math.max(1, Math.floor(Number(b.banks) || 1)));
    const entity = b.entity === "sole" ? "sole" : "company";
    const services = (Array.isArray(b.services) ? b.services : []).filter((s: string) =>
      VALID_SERVICES.includes(s as QuoteServiceId)
    )
      // M4: a sole trader is NEVER quoted the MBR annual return — it is a
      // company filing they cannot make. Stripped HERE as well as in
      // `buildQuote`, and stripped BEFORE the "select at least one service"
      // check below, so a direct POST of `{ entity: "sole", services: ["mbr"] }`
      // is a 400 rather than a PDF quoting €0 for a filing that does not exist.
      // The PDF is the artefact that outlives the page; this is the route that
      // makes it.
      .filter((s: string) => !(s === "mbr" && entity !== "company")) as QuoteServiceId[];
    // Months, not years — see QuoteInput.catchUpMonths. `overdueYears` is
    // still read so an in-flight POST from a cached page prices something
    // rather than silently pricing zero catch-up.
    const catchUpMonths = Number(b.catchUpMonths) || (Number(b.overdueYears) || 0) * 12;
    const startMonth = /^\d{4}-(0[1-9]|1[0-2])$/.test(String(b.startMonth || "")) ? String(b.startMonth) : "";

    if (!company) return NextResponse.json({ error: "Company name is required." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    if (services.length === 0) return NextResponse.json({ error: "Select at least one service." }, { status: 400 });
    // A quote whose start month is unknown cannot say which months are catch-up.
    if (!startMonth) return NextResponse.json({ error: "Tell us which month we should start from." }, { status: 400 });
    // IESBA independence, enforced HERE and not only in the builder UI: this
    // route can be called directly, and what it returns is a PDF. A downloaded
    // quotation carrying a price for a combination A4 is barred from providing
    // outlives anything on screen, so the basket is refused before it is
    // priced, before the portal hears about it, and before a document exists.
    // `accounts` IS managed bookkeeping and `audit` is the assurance side — the
    // same two ids the builder maps onto the shared independence rule.
    if (independenceRoute({
      wantsBookkeeping: services.includes("accounts"),
      wantsAudit: services.includes("audit"),
    }) === "conflict") {
      return NextResponse.json({ error: INDEPENDENCE_CONFLICT }, { status: 422 });
    }

    // Only pass a band the pack actually knows. Anything else is left
    // undefined so buildQuote quotes bookkeeping "On request" rather than
    // pricing it at a band nobody chose.
    const expenses = EXPENSE_BANDS.some((x) => x.id === b.expenses)
      ? (b.expenses as ExpenseBand)
      : undefined;
    const input: QuoteInput = { company, regNo, industry, sector, txn, banks, revenueBand, services, entity, expenses, catchUpMonths, startMonth };
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
