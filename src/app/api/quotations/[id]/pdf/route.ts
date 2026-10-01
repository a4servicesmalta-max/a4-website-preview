import { NextRequest } from "next/server";
import { QUOTE_API_BASE, isQuotationId } from "@/lib/quotation-page";

export const dynamic = "force-dynamic";

/**
 * GET /api/quotations/<id>/pdf?t=<token> — the quotation PDF for the page's
 * "Download PDF" button. Proxied from the portal backend's token-gated
 * /public/quotations/:id/pdf so the button can fetch it same-origin.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const token = req.nextUrl.searchParams.get("t") ?? "";
  if (!isQuotationId(id) || !token) {
    return Response.json({ message: "Invalid quotation link" }, { status: 400 });
  }
  try {
    const upstream = await fetch(
      `${QUOTE_API_BASE}/public/quotations/${encodeURIComponent(id)}/pdf?token=${encodeURIComponent(token)}`,
      { cache: "no-store", signal: AbortSignal.timeout(20000), headers: { Origin: "https://a4.com.mt" } }
    );
    if (!upstream.ok || !upstream.body) {
      return Response.json({ message: "Could not prepare the PDF" }, { status: upstream.status || 502 });
    }
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": upstream.headers.get("content-disposition") ?? `attachment; filename="quotation.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json({ message: "Could not prepare the PDF" }, { status: 502 });
  }
}
