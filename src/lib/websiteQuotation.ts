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
  AUDIT_YEARLY,
  LAUNCH_PROMO,
  MANAGED_ENTITY_LABELS,
  MBR_ANNUAL_RETURN,
  REGISTERED_OFFICE_YEARLY,
  REVIEW_ENGAGEMENT_FACTOR,
  RISK_TIERS,
  TAX_RETURN_YEARLY,
  VAT_MONTHLY,
  VAT_RULES,
  catchUpAmount,
  catchUpLabel,
  isPromoActive,
  managedMonthly,
  payrollRate,
  roundEur,
  type CapitalBand,
  type ManagedEntity,
  type TxnBand,
} from "@/data/a4QuotePack";
import { resolveClientUrl } from "@/lib/external-links";
import {
  INDEPENDENCE_CONFLICT,
  independenceFlags,
  type IndependenceFlags,
} from "@/lib/independence";

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
  /**
   * The ONLY bookkeeping item. Replaces both the retired `software` tier and
   * the retired volume-banded `bookkeeping-full`. Flat, and NOT risk-uplifted.
   */
  | { service: "bookkeeping-managed"; entity: ManagedEntity }
  | { service: "vat"; txn: TxnBand; vatreg: "art10" | "art11" | "art12" }
  | { service: "taxret"; txn: TxnBand }
  | { service: "audit"; txn: TxnBand; review?: true }
  | { service: "payroll"; heads: number }
  | { service: "mbr"; capital: CapitalBand }
  | { service: "registered-office" }
  | { service: "onboarding" }
  | { service: "catchup"; months: number; entity: ManagedEntity };

/**
 * `YYYY-MM` — the first month in scope. REQUIRED on every submitted quote.
 *
 * Without it we would be guessing which month the engagement starts, which is
 * the one thing a catch-up quote cannot be wrong about. A basket with no start
 * month must degrade to the lead path rather than price instantly.
 */
export type ServiceStartMonth = string;

export const SERVICE_START_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isServiceStartMonth(v: unknown): v is ServiceStartMonth {
  return typeof v === "string" && SERVICE_START_RE.test(v);
}

export type A4Selections = {
  kind: "a4-services";
  version: 1;
  risk: A4Risk;
  /** `YYYY-MM`. Required — see ServiceStartMonth. */
  serviceStartDate: ServiceStartMonth;
  items: A4Item[];
  /**
   * The IESBA conclusion for this basket. Not priced and not repriced — it
   * rides here because the backend stores `selections` verbatim in
   * `payloadJson`, so the consequence reaches whoever works the quotation even
   * before `WebsiteLead` grows a column for it.
   */
  independence: IndependenceFlags;
};

/** Wrap priced items in the versioned envelope the backend evaluator expects. */
export function buildA4Selections(
  items: A4Item[],
  risk: A4Risk = "standard",
  serviceStartDate: ServiceStartMonth = ""
): A4Selections {
  const t = evaluateA4Items(items, risk);
  return {
    kind: "a4-services",
    version: 1,
    risk,
    serviceStartDate,
    items,
    independence: independenceFlags(t),
  };
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
  /** Onboarding was asked for but carries no number — say so, never imply free. */
  hasUnpricedOnboarding: boolean;
  /** IESBA routing: this basket asks A4 to keep the books. */
  wantsBookkeeping: boolean;
  /** IESBA routing: this basket asks A4 to audit (a review engagement is not an audit). */
  wantsAudit: boolean;
  /** Both at once — the conflict case. Must never price silently. */
  independenceConflict: boolean;
};

/**
 * Services that carry the sector risk multiplier (mirrors the pack).
 *
 * `bookkeeping-managed` is deliberately absent: €24 / €49 are flat prices, and
 * so is the catch-up derived from them.
 */
const RISK_UPLIFTED: ReadonlySet<A4Item["service"]> = new Set([
  "vat",
  "taxret",
  "audit",
  "payroll",
]);

/**
 * Server-side input bounds. Anything outside these is REJECTED, not clamped —
 * clamping would quietly price something the prospect did not ask for, and the
 * backend would then disagree on the reprice.
 *
 * `months` tops out at 240 (20 years), which is also the ceiling the wire
 * contract puts on a `catchup` item.
 */
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
    case "bookkeeping-managed": {
      const price = managedMonthly(item.entity);
      if (!price) return null;
      return mo(`Managed bookkeeping — ${MANAGED_ENTITY_LABELS[item.entity]}`, price);
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
    case "onboarding":
      // UNPRICED by design (pack mt-2026-08-14-managed). It emits no line at
      // all rather than a €0 line, so it can never be read as "included, free".
      // `evaluateA4Items` reports it separately via `hasUnpricedOnboarding`.
      return null;
    case "catchup": {
      // Whole months only, and within the range the server will accept.
      if (!isIntWithin(item.months, A4_LIMITS.months.min, A4_LIMITS.months.max)) return null;
      const m = item.months;
      // Same monthly rate, per month, uncapped, never discounted. The label is
      // fixed by the wire contract and compared literally downstream.
      return one(catchUpLabel(m, item.entity), catchUpAmount(m, item.entity));
    }
    default:
      // A stale cached page sending a retired item (`software`,
      // `bookkeeping-full`, `review`) lands here. Returning null drops it, and
      // the missing money makes the backend's reprice disagree — which is the
      // correct fail-loud outcome, not something to paper over.
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
  // Keep each priced line paired with the item that produced it. The catch-up
  // slice used to be recovered by matching the label with a regex, which made
  // a copy edit able to silently change a submitted total.
  const pairs = items
    .map((item) => ({ item, line: priceItem(item, risk) }))
    .filter((p): p is { item: A4Item; line: PricedItem } => p.line != null);
  const priced = pairs.map((p) => p.line);

  const sum = (c: QuoteCadence) => priced.filter((l) => l.cadence === c).reduce((s, l) => s + l.amount, 0);
  const grossMonthly = sum("monthly");
  const grossYearly = sum("yearly");
  const grossOneOff = sum("oneoff");
  const registryPassThrough = priced.reduce((s, l) => s + (l.registry ?? 0), 0);
  const catchup = pairs
    .filter((p) => p.item.service === "catchup")
    .reduce((s, p) => s + p.line.amount, 0);

  const promoApplied = isPromoActive(now) && grossMonthly + grossYearly > 0;
  const keep = 1 - LAUNCH_PROMO.pct;

  const has = (s: A4Item["service"]) => items.some((i) => i.service === s);
  const wantsBookkeeping = has("bookkeeping-managed") || has("catchup");
  // A review engagement is an ASSURANCE engagement and carries the same
  // independence requirement as a full audit — a firm cannot keep the books and
  // then give assurance on them. So `review: true` is audit-side here, exactly
  // as the portal's malta-pack treats it (`if (service === 'audit') wantsAudit
  // = true`, no review check). This line used to exclude reviews, which meant
  // the DEFAULT homepage basket — small company, review engagement, managed
  // books — was passed as clean by the site and refused by the server.
  const wantsAudit = has("audit");

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
    hasUnpricedOnboarding: has("onboarding"),
    wantsBookkeeping,
    wantsAudit,
    independenceConflict: wantsBookkeeping && wantsAudit,
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
  /** `YYYY-MM`, REQUIRED. Without it we do not price — see ServiceStartMonth. */
  serviceStartDate?: string;
  /**
   * Which surface captured this quote, e.g. `a4-homepage`. Attribution only —
   * it never touches pricing. The backend's schema is strict about the shape:
   * lowercase alphanumeric, then `. _ -`.
   */
  sourceDetail?: string;
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
export const START_MONTH_REQUIRED_MESSAGE =
  "Tell us which month we should start from — the price depends on it.";

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
    selections: buildA4Selections(input.items, risk, input.serviceStartDate ?? ""),
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
  // A quote with no start month is a quote about an unknown period. Refuse it
  // here rather than guessing "this month" — the caller must collect it, and
  // if it cannot, it belongs on the lead path.
  if (!isServiceStartMonth(input.serviceStartDate)) {
    return { status: "error", message: START_MONTH_REQUIRED_MESSAGE };
  }
  // Both sides of the independence rule in one basket. Pricing it would imply
  // A4 can do both, which it cannot — a person settles it first.
  const totals = evaluateA4Items(input.items, input.risk ?? "standard");
  if (totals.independenceConflict) {
    return { status: "error", message: INDEPENDENCE_CONFLICT };
  }

  const sourceDetail = input.sourceDetail?.trim();

  try {
    const res = await fetch(`${QUOTE_API_BASE}/public/website-quotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone: input.phone?.trim() || "",
        record: buildQuoteRecord(input),
        // IESBA routing at the top level, for when the backend adds the field.
        // It ALSO rides inside `record.selections.independence` (see
        // buildQuoteRecord), which the backend already stores verbatim in
        // payloadJson — so the conclusion persists today even though the
        // top-level fields are currently stripped by the intake schema.
        ...independenceFlags(totals),
        ...(sourceDetail && /^[a-z0-9][a-z0-9._-]*$/.test(sourceDetail) ? { sourceDetail } : {}),
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
