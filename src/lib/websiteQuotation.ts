/**
 * Client-side submission of an instant website quote to the portal backend.
 *
 * Same endpoint and same payload contract as vacei.com — one quotation pipeline
 * behind both public sites. The backend turns a priced record into a Quotation,
 * emails it to the prospect, and links it to their portal account on signup.
 *
 * This is DELIBERATELY separate from `pushToPortal` / the `/api/*` routes: those
 * feed the Leads inbox (generic enquiries) and must stay untouched.
 *
 * Response contract (portal-backend):
 *   201 { data: { reference, status: 'QUOTED'   } }  → quote priced + emailed
 *   202 { data: { reference: null, status: 'RECEIVED' } } → captured, quote follows
 */

import { A4_QUOTE_PACK_VERSION, PRICING_CURRENCY } from "@/data/a4QuotePack";
import { resolveClientUrl } from "@/lib/external-links";

export const QUOTE_API_BASE =
  process.env.NEXT_PUBLIC_QUOTE_API_BASE?.trim().replace(/\/+$/, "") ||
  "https://vacei-portal-backend.onrender.com/api/v1";

export type QuoteCadence = "monthly" | "yearly" | "oneoff";

export type QuoteLineItem = {
  label: string;
  amount: number;
  cadence: QuoteCadence;
};

export type WebsiteQuoteRecord = {
  pack: string;
  currency: string;
  selections: Record<string, unknown>;
  /** Totals AS DISPLAYED — i.e. with the launch promo already applied. */
  monthly: number;
  yearly: number;
  oneOff: number;
  catchup: number;
  quotedAt: string;
  /** Undiscounted line detail, so the backend can show the workings. */
  lines: QuoteLineItem[];
};

export type WebsiteQuoteInput = {
  name: string;
  email: string;
  phone?: string;
  selections: Record<string, unknown>;
  lines: QuoteLineItem[];
  monthly: number;
  yearly: number;
  oneOff: number;
  catchup?: number;
};

export type WebsiteQuoteResult =
  | { status: "quoted"; reference: string; message: string; portalHref: string }
  | { status: "received"; message: string }
  | { status: "error"; message: string };

const QUOTED_MESSAGE =
  "Your quote is on its way — create your account to see it in your portal.";
const RECEIVED_MESSAGE = "We've got your details — your quote follows by email.";
const ERROR_MESSAGE =
  "We couldn't send that just now. Please try again, or email info@a4.com.mt and we'll pick it up.";

/**
 * Signup deep-link that carries the quote through account creation — the
 * client portal forwards `quote` and `email` into the onboarding wizard.
 */
export function quotePortalHref(reference: string, email: string): string {
  const signup = resolveClientUrl("/signup");
  return `${signup}?quote=${encodeURIComponent(reference)}&email=${encodeURIComponent(email)}`;
}

export function buildQuoteRecord(input: WebsiteQuoteInput): WebsiteQuoteRecord {
  return {
    pack: A4_QUOTE_PACK_VERSION,
    currency: PRICING_CURRENCY,
    selections: input.selections,
    monthly: Math.round(input.monthly),
    yearly: Math.round(input.yearly),
    oneOff: Math.round(input.oneOff),
    catchup: Math.round(input.catchup ?? 0),
    quotedAt: new Date().toISOString(),
    lines: input.lines,
  };
}

/**
 * POST the quote. Never throws — the caller renders whatever comes back.
 * Requires a name and a plausible email; without them there is nobody to send
 * the quote to, so the caller should not offer submission at all.
 */
export async function submitWebsiteQuotation(
  input: WebsiteQuoteInput
): Promise<WebsiteQuoteResult> {
  const name = input.name.trim();
  const email = input.email.trim();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", message: "Add your name and email so we can send it." };
  }

  try {
    const res = await fetch(`${QUOTE_API_BASE}/public/website-quotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone: input.phone?.trim() || "",
        record: buildQuoteRecord(input),
      }),
    });
    if (!res.ok) return { status: "error", message: ERROR_MESSAGE };
    const body = await res.json().catch(() => ({}));
    const data = (body && body.data) || null;
    if (data && data.reference && data.status === "QUOTED") {
      return {
        status: "quoted",
        reference: String(data.reference),
        message: QUOTED_MESSAGE,
        portalHref: quotePortalHref(String(data.reference), email),
      };
    }
    return { status: "received", message: RECEIVED_MESSAGE };
  } catch {
    return { status: "error", message: ERROR_MESSAGE };
  }
}
