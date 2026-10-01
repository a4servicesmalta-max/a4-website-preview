import { NextRequest } from "next/server";
import { QUOTE_API_BASE, isQuotationId } from "@/lib/quotation-page";

export const dynamic = "force-dynamic";

/**
 * POST /api/quotations/<id>/accept — FALLBACK only.
 *
 * The page posts acceptances straight to the portal backend from the browser,
 * so the acceptance record carries the visitor's own IP. Where the browser
 * cannot reach it (a preview host outside the backend's CORS list) the page
 * retries through here; the backend then records this server's address, which
 * is why the direct path stays first.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isQuotationId(id)) return Response.json({ message: "Invalid quotation link" }, { status: 400 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ message: "Invalid request" }, { status: 400 });
  const { token, signerName, lineIndexes, billing } = body as Record<string, unknown>;
  try {
    const upstream = await fetch(`${QUOTE_API_BASE}/public/quotations/${encodeURIComponent(id)}/accept`, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
      headers: {
        "Content-Type": "application/json",
        Origin: "https://a4.com.mt",
        "User-Agent": req.headers.get("user-agent") ?? "a4.com.mt",
      },
      body: JSON.stringify({ token, signerName, lineIndexes, billing }),
    });
    const data = await upstream.json().catch(() => ({}));
    return Response.json(data, { status: upstream.status });
  } catch {
    return Response.json({ message: "We couldn't reach our servers. Please try again." }, { status: 502 });
  }
}
