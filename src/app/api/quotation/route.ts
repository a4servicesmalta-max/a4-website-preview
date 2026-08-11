/**
 * PDF rendering for the instant-quote calculator (/quote).
 *
 * This route does NOT price anything of its own. It takes the very same
 * `A4Item[]` basket the visitor's calculator displayed, runs it back through
 * `evaluateA4Items` — the one evaluator shared by the calculator, the portal
 * backend and vacei.com — and renders that result. The PDF therefore carries
 * the same figures as the screen and as the quotation the backend emails.
 *
 * It used to take a revenue band and price it with a second engine
 * (src/lib/quotation.ts, now deleted) whose totals could not agree with the
 * server's, which is why the builder it served was never allowed to submit.
 */
import { NextRequest, NextResponse } from "next/server";
import { pushToPortal } from "@/lib/portal";
import {
  A4_LIMITS,
  evaluateA4Items,
  type A4Item,
  type A4Risk,
} from "@/lib/websiteQuotation";
import {
  A4_QUOTE_PACK_VERSION,
  LAUNCH_PROMO,
  PRICING_GOV_NOTE,
  PRICING_VAT_NOTE,
} from "@/data/a4QuotePack";
import { euro, renderQuotationPdf } from "@/lib/quotation-pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Every service the shared evaluator can price. Anything else is dropped. */
const PRICEABLE: ReadonlySet<string> = new Set([
  "software",
  "bookkeeping-full",
  "review",
  "vat",
  "taxret",
  "audit",
  "payroll",
  "mbr",
  "registered-office",
  "onboarding",
  "catchup",
]);

/**
 * Shape-check only. The real gate is `priceItem`, which returns null for
 * anything it cannot price, so an item that survives this filter and is still
 * nonsense simply contributes nothing to the total — it can never invent a fee.
 */
function readItems(raw: unknown): A4Item[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (i): i is A4Item =>
        !!i && typeof i === "object" && PRICEABLE.has((i as { service?: unknown }).service as string)
    )
    .slice(0, A4_LIMITS.maxItems);
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json().catch(() => ({}));
    const name = String(b.name || "").slice(0, 120);
    const email = String(b.email || "").slice(0, 200);
    const company = String(b.company || "").slice(0, 160);
    const regNo = String(b.regNo || "").slice(0, 40);
    const items = readItems(b.items);
    // The calculator now asks for a sector, so the PDF must be priced at the
    // same risk tier the screen used — otherwise the downloaded quotation
    // disagrees with the figure the visitor just read. Anything unrecognised
    // falls back to standard rather than inventing an uplift.
    const risk: A4Risk =
      b.risk === "elevated" || b.risk === "high" ? b.risk : "standard";

    if (!company) return NextResponse.json({ error: "Company name is required." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    if (items.length === 0)
      return NextResponse.json({ error: "Select at least one service." }, { status: 400 });

    const totals = evaluateA4Items(items, risk);
    if (totals.lines.length === 0)
      return NextResponse.json({ error: "We can't price that combination online." }, { status: 400 });

    // Display totals — promo applied, exactly as the calculator showed them.
    const monthlyTotalEur = totals.monthly;
    const annualTotalEur = totals.yearly + totals.oneOff;
    const indicativeAnnualEur = monthlyTotalEur * 12 + annualTotalEur;

    const cadenceLabel = { monthly: "/ month", yearly: "/ year", oneoff: "one-off" } as const;
    const pdfLines = totals.lines.map((l) => ({
      name: l.label,
      hint: `Fee schedule ${A4_QUOTE_PACK_VERSION} · ${risk} risk scope`,
      display: `${euro(l.amount)} ${cadenceLabel[l.cadence]}`,
    }));

    const assumptions = [
      "Single Malta company; scope as selected in the online calculator.",
      PRICING_VAT_NOTE,
      PRICING_GOV_NOTE,
      ...(totals.promoApplied ? [LAUNCH_PROMO.note] : []),
      "Figures are indicative and confirmed in writing within 24 hours.",
      `Priced on fee schedule ${A4_QUOTE_PACK_VERSION}.`,
    ];

    // Lead is captured regardless of what the visitor does with the PDF.
    await pushToPortal({
      name,
      email,
      company,
      message:
        `Instant quotation generated on the website.\n` +
        pdfLines.map((l) => `- ${l.name}: ${l.display}`).join("\n") +
        `\nIndicative first-year total: ${euro(indicativeAnnualEur)}`,
      service: "Instant quotation (website calculator)",
      source: "quotation-builder",
      priority: "High",
      meta: { items, pack: A4_QUOTE_PACK_VERSION, indicativeAnnualEur },
    });

    const pdf = await renderQuotationPdf(
      { company, regNo, name, email },
      { lines: pdfLines, monthlyTotalEur, annualTotalEur, indicativeAnnualEur, assumptions },
      { onboardingUrl: process.env.NEXT_PUBLIC_CLIENT_ONBOARDING_URL }
    );

    return NextResponse.json({
      ok: true,
      pack: A4_QUOTE_PACK_VERSION,
      totals: { monthlyTotalEur, annualTotalEur, indicativeAnnualEur },
      pdfBase64: Buffer.from(pdf).toString("base64"),
      pdfName: `A4-Indicative-Quotation-${company.replace(/[^\w-]+/g, "-").slice(0, 60)}.pdf`,
    });
  } catch (e) {
    console.error("quotation error:", e);
    return NextResponse.json({ error: "Could not generate the quotation. Please try again or contact us." }, { status: 500 });
  }
}
