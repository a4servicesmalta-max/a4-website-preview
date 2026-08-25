import { NextRequest, NextResponse } from "next/server";
import { LOCK_COOKIE, readQuoteLock, type QuoteKind } from "@/lib/quote-lock";

export const runtime = "nodejs";
/** Per-visitor, cookie-derived: a cached response would serve one visitor's
 *  fee to the next. */
export const dynamic = "force-dynamic";

const KINDS: QuoteKind[] = ["audit"];

/**
 * "Have we already quoted this visitor?"
 *
 * Read-only and side-effect free. Returns only the fee and its dates — never
 * the basis or the detected prior-year fee, which would tell a visitor what we
 * read out of their own statements (and, on a shared machine, someone else's).
 */
export async function GET(req: NextRequest) {
  const kindParam = (req.nextUrl.searchParams.get("kind") || "audit") as QuoteKind;
  const kind = KINDS.includes(kindParam) ? kindParam : "audit";
  // An email is optional: without one the cookie alone identifies the visitor.
  // With one, a lock issued to a different address is refused.
  const email = req.nextUrl.searchParams.get("email") || undefined;

  const lock = readQuoteLock(req.cookies.get(LOCK_COOKIE)?.value, kind, email);
  if (!lock) return NextResponse.json({ locked: false });

  return NextResponse.json({
    locked: true,
    fee: lock.fee,
    kind: lock.kind,
    issuedAt: lock.issuedAt,
    expiresAt: lock.expiresAt,
  });
}
