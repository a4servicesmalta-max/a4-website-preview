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

import {
  A4_QUOTE_PACK_VERSION,
  PRICING_CURRENCY,
  ACCOUNTING_REVIEW,
  AUDIT_YEARLY,
  BOOKKEEPING_MONTHLY,
  CATCH_UP,
  LAUNCH_PROMO,
  MBR_ANNUAL_RETURN,
  REGISTERED_OFFICE_YEARLY,
  REVIEW_ENGAGEMENT_FACTOR,
  RISK_TIERS,
  SOFTWARE_TIERS,
  TAX_RETURN_YEARLY,
  VAT_MONTHLY,
  VAT_RULES,
  isPromoActive,
  payrollRate,
  roundEur,
  type CapitalBand,
  type SoftwareTierId,
  type TxnBand,
} from "@/data/a4QuotePack";
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

/* -------------------------------------------------------------------------- */
/* The normalized A4 selections contract                                       */
/* -------------------------------------------------------------------------- */

/**
 * The backend reprices `record.selections` from scratch and only issues a real
 * quote (201 QUOTED) when its own total agrees with ours to within €1 / 1%.
 * So the shape below is a CONTRACT, not a free-form bag of UI state: every item
 * must be something the server-side evaluator can price on its own.
 *
 * Anything a call site cannot express as these items must NOT be submitted as
 * an instant quote — it goes down the lead path instead. An unpriceable extra
 * silently sunk into the totals means a permanent 202 and no quote email.
 */
export type A4Risk = "standard" | "elevated" | "high";

export type A4Item =
  | { service: "software"; tier: SoftwareTierId }
  | { service: "bookkeeping-full"; txn: TxnBand }
  | { service: "review"; txn: TxnBand; cadence: "quarterly" | "monthly" }
  | { service: "vat"; txn: TxnBand; vatreg: "art10" | "art11" | "art12" }
  | { service: "taxret"; txn: TxnBand }
  | { service: "audit"; txn: TxnBand; review?: true }
  | { service: "payroll"; heads: number }
  | { service: "mbr"; capital: CapitalBand }
  | { service: "registered-office" }
  | { service: "onboarding" }
  | { service: "catchup"; months: number; mode: "self" | "full" };

export type A4Selections = {
  kind: "a4-services";
  version: 1;
  risk: A4Risk;
  items: A4Item[];
};

/** Wrap priced items in the versioned envelope the backend evaluator expects. */
export function buildA4Selections(items: A4Item[], risk: A4Risk = "standard"): A4Selections {
  return { kind: "a4-services", version: 1, risk, items };
}

export type A4Totals = {
  /** Per-item detail, UNDISCOUNTED — the workings behind the totals. */
  lines: QuoteLineItem[];
  /** Totals with the launch promo applied — what we display AND what we send. */
  monthly: number;
  yearly: number;
  oneOff: number;
  /** The catch-up slice of oneOff, reported separately like the Vacei site. */
  catchup: number;
  /** Pre-promo totals, for the struck-through originals. */
  grossMonthly: number;
  grossYearly: number;
  grossOneOff: number;
  /** MBR registry fee — government money, exempt from the promo. */
  registryPassThrough: number;
  promoApplied: boolean;
};

/**
 * Services that carry the sector risk multiplier.
 *
 * `software` is deliberately absent: a Books plan is a fixed product price, not
 * labour, so risk never moves it. The server agrees — adding it here would put
 * every elevated/high-risk software quote out of tolerance.
 */
const RISK_UPLIFTED: ReadonlySet<A4Item["service"]> = new Set([
  "bookkeeping-full",
  "review",
  "vat",
  "taxret",
  "audit",
  "payroll",
]);

/** Server-side input bounds. Anything outside these is rejected, not clamped. */
export const A4_LIMITS = {
  maxItems: 50,
  heads: { min: 1, max: 500 },
  months: { min: 1, max: 240 },
} as const;

const isIntWithin = (n: unknown, min: number, max: number): boolean =>
  typeof n === "number" && Number.isInteger(n) && n >= min && n <= max;

type PricedItem = QuoteLineItem & { registry?: number };

/** Price one item. Returns null when the item cannot be priced (never throws). */
function priceItem(item: A4Item, risk: A4Risk): PricedItem | null {
  const tier = RISK_TIERS[risk];
  const rm = RISK_UPLIFTED.has(item.service) ? (tier.multiplier ?? 1) : 1;
  const mo = (label: string, amount: number): PricedItem => ({ label, amount: roundEur(amount), cadence: "monthly" });
  const yr = (label: string, amount: number, registry?: number): PricedItem => ({
    label,
    amount: roundEur(amount),
    cadence: "yearly",
    ...(registry != null ? { registry } : {}),
  });
  const one = (label: string, amount: number): PricedItem => ({ label, amount: roundEur(amount), cadence: "oneoff" });

  switch (item.service) {
    case "software": {
      const price = SOFTWARE_TIERS[item.tier];
      return price == null ? null : mo(`A4 Books — ${item.tier} plan`, price);
    }
    case "bookkeeping-full": {
      const price = BOOKKEEPING_MONTHLY[item.txn];
      return price == null ? null : mo("Bookkeeping", price * rm);
    }
    case "review": {
      const book = BOOKKEEPING_MONTHLY[item.txn];
      if (book == null || book <= 0) return null; // no ledger to review
      const cfg = item.cadence === "monthly" ? ACCOUNTING_REVIEW.month : ACCOUNTING_REVIEW.quarter;
      return mo("Accounting review", Math.max(cfg.minEur, book * cfg.shareOfBook) * rm);
    }
    case "vat": {
      if (item.vatreg === "art11") {
        // Small-exempt: one flat yearly declaration, not a monthly return.
        return yr("VAT declaration (art. 11)", VAT_RULES.art11FlatYearly * rm);
      }
      const band = VAT_MONTHLY[item.txn];
      if (band == null) return null;
      const factor = item.vatreg === "art12" ? VAT_RULES.art12Factor : 1;
      return mo("VAT returns", band * factor * rm);
    }
    case "taxret": {
      const price = TAX_RETURN_YEARLY[item.txn];
      return price == null ? null : yr("Annual tax return", price * rm);
    }
    case "audit": {
      const price = AUDIT_YEARLY[item.txn];
      if (price == null) return null;
      return yr(
        item.review ? "Review engagement (if applicable)" : "Financial audit (if applicable)",
        price * (item.review ? REVIEW_ENGAGEMENT_FACTOR : 1) * rm
      );
    }
    case "payroll": {
      // Whole people only, and within the range the server will accept.
      if (!isIntWithin(item.heads, A4_LIMITS.heads.min, A4_LIMITS.heads.max)) return null;
      return mo("Payroll", item.heads * payrollRate(item.heads) * rm);
    }
    case "mbr": {
      const registry = MBR_ANNUAL_RETURN.registryFeeByCapital[item.capital];
      if (registry == null) return null;
      // Our fee plus the registry fee. The registry slice is government money
      // at cost, so it is tracked separately and never discounted.
      return yr("Annual return — filed with the MBR", MBR_ANNUAL_RETURN.ourFee + registry, registry);
    }
    case "registered-office":
      return yr("Registered office", REGISTERED_OFFICE_YEARLY);
    case "onboarding": {
      const fee = tier.onboarding;
      return fee == null ? null : one("Onboarding and due diligence", fee);
    }
    case "catchup": {
      if (!isIntWithin(item.months, A4_LIMITS.months.min, A4_LIMITS.months.max)) return null;
      const m = item.months;
      if (item.mode === "self") return one("Catch-up processing", m * CATCH_UP.selfPerMonth);
      return one(
        "Bringing the books up to date",
        Math.min(m * CATCH_UP.fullPerMonth, Math.ceil(m / 12) * CATCH_UP.fullPerYearCap)
      );
    }
    default:
      return null;
  }
}

/**
 * Price a whole basket. THE single arithmetic used for both the on-screen
 * figures and the submitted record — that is what keeps display and server in
 * agreement, rather than two implementations that happen to match today.
 */
export function evaluateA4Items(
  items: A4Item[],
  risk: A4Risk = "standard",
  now: Date = new Date()
): A4Totals {
  const priced = items.map((i) => priceItem(i, risk)).filter((l): l is PricedItem => l != null);

  const sum = (c: QuoteCadence) => priced.filter((l) => l.cadence === c).reduce((s, l) => s + l.amount, 0);
  const grossMonthly = sum("monthly");
  const grossYearly = sum("yearly");
  const grossOneOff = sum("oneoff");
  const registryPassThrough = priced.reduce((s, l) => s + (l.registry ?? 0), 0);
  const catchup = priced
    .filter((l) => l.cadence === "oneoff" && /catch-up|up to date/i.test(l.label))
    .reduce((s, l) => s + l.amount, 0);

  const promoApplied = isPromoActive(now) && grossMonthly + grossYearly > 0;
  const keep = 1 - LAUNCH_PROMO.pct;

  return {
    lines: priced.map(({ label, amount, cadence }) => ({ label, amount, cadence })),
    monthly: promoApplied ? roundEur(grossMonthly * keep) : grossMonthly,
    // The registry fee is added back at full price after discounting the rest.
    yearly: promoApplied ? roundEur((grossYearly - registryPassThrough) * keep) + registryPassThrough : grossYearly,
    oneOff: grossOneOff,
    catchup,
    grossMonthly,
    grossYearly,
    grossOneOff,
    registryPassThrough,
    promoApplied,
  };
}

export type WebsiteQuoteRecord = {
  pack: string;
  currency: string;
  selections: A4Selections;
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
  /** Priceable items only — anything else belongs on the lead path. */
  items: A4Item[];
  risk?: A4Risk;
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

/**
 * Build the record. Totals are re-derived from the items here rather than
 * taken from the caller, so the submitted figures cannot drift from what the
 * server will compute — the caller displays `evaluateA4Items(...)` output and
 * we price the very same items again.
 */
export function buildQuoteRecord(
  input: WebsiteQuoteInput,
  now: Date = new Date()
): WebsiteQuoteRecord {
  const risk = input.risk ?? "standard";
  const totals = evaluateA4Items(input.items, risk, now);
  return {
    pack: A4_QUOTE_PACK_VERSION,
    currency: PRICING_CURRENCY,
    selections: buildA4Selections(input.items, risk),
    monthly: totals.monthly,
    yearly: totals.yearly,
    oneOff: totals.oneOff,
    catchup: totals.catchup,
    quotedAt: now.toISOString(),
    lines: totals.lines,
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
  if (!input.items.length) {
    return { status: "error", message: "Pick at least one service so we have something to quote." };
  }
  if (input.items.length > A4_LIMITS.maxItems) {
    // Over the server's cap the whole submission is refused, so say so here
    // rather than firing a request that can only come back as a 202.
    return { status: "error", message: "That's more services than we can quote online — let's scope it on a call." };
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
