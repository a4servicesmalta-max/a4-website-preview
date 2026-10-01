/**
 * The A4 quotation page (/q/<id>?t=<token>) — data layer.
 *
 * The page renders a quotation the portal backend issued (auto-priced from a
 * website calculator, or built by staff for a lead). This module turns the
 * backend's public summary into what the page shows: service cards the
 * prospect can switch on and off, the quote document rows, and the totals.
 *
 * House rules this follows (src/data/a4QuotePack.ts):
 *   - every fee in its own cadence — "/mo", "/yr", "one-off" — never a yearly
 *     fee dressed up as a monthly one;
 *   - VAT (18%) is added on top and said so; registry / government fees are
 *     passed through at cost and carry no VAT.
 * Pure and dependency-light so it is unit-tested (quotation-page.test.ts).
 */
import { MBR_ANNUAL_RETURN } from "@/data/a4QuotePack";

export const QUOTE_API_BASE =
  process.env.NEXT_PUBLIC_QUOTE_API_BASE?.trim().replace(/\/+$/, "") ||
  "https://vacei-portal-backend.onrender.com/api/v1";

export const VAT_RATE = 0.18;

export type Cadence = "monthly" | "yearly" | "one-off";
export type FeeView = "monthly" | "year";
export type LetterFx = "scatter" | "tighten" | "cascade" | "stack" | "zoom" | "type";

/** GET /public/quotations/:id/summary → data (the fields this page reads). */
export interface QuotationSummary {
  id: string;
  reference: string;
  title: string;
  description: string | null;
  totalAmount: string;
  currency: string;
  status: "SENT" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "DRAFT";
  validUntil: string | null;
  issuedAt: string | null;
  acceptedAt: string | null;
  clientEmail: string;
  clientName: string | null;
  contactName: string | null;
  companyName: string | null;
  organizationName: string | null;
  brand: "a4" | "vacei" | "combined";
  lineItems: unknown;
  acceptance: { signerName: string | null; billing: "monthly" | "annual" | null; partial: boolean } | null;
}

export interface QuoteLine {
  /** Position in the quotation's lineItems — what the accept call sends back. */
  index: number;
  label: string;
  amount: number;
  cadence: Cadence | null;
  /** Government / registry money inside the amount (no VAT, passed at cost). */
  registry: number;
  adjustment: boolean;
}

export interface ServiceCard {
  key: string;
  word: string;
  line: string;
  fx: LetterFx;
  scope: string[];
  lines: QuoteLine[];
  monthly: number;
  yearly: number;
  oneOff: number;
  /** Lines with no cadence (staff-typed quotes) — a fixed fee. */
  fixed: number;
}

/* -------------------------------------------------------------------------- */
/* Lines                                                                       */
/* -------------------------------------------------------------------------- */

const round2 = (n: number) => Math.round(n * 100) / 100;

export function isAdjustmentLabel(label: string): boolean {
  const l = label.trim().toLowerCase();
  return l === "adjustment" || l.includes("launch discount");
}

function normCadence(raw: unknown): Cadence | null {
  if (raw === "monthly" || raw === "yearly") return raw;
  if (raw === "one-off" || raw === "oneoff") return "one-off";
  return null;
}

/** The MBR annual return line carries the registry fee inside its amount. */
function registryPart(label: string, amount: number): number {
  if (!/annual return/i.test(label) || !/mbr/i.test(label)) return 0;
  return Math.max(0, round2(amount - MBR_ANNUAL_RETURN.ourFee));
}

export function readLines(lineItems: unknown): QuoteLine[] {
  if (!Array.isArray(lineItems)) return [];
  const out: QuoteLine[] = [];
  lineItems.forEach((raw, index) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
    const r = raw as Record<string, unknown>;
    const label = typeof r.label === "string" ? r.label.trim() : "";
    if (!label) return;
    const amount = Number(r.amount) || 0;
    out.push({
      index,
      label,
      amount,
      cadence: normCadence(r.cadence),
      registry: registryPart(label, amount),
      adjustment: isAdjustmentLabel(label),
    });
  });
  return out;
}

/* -------------------------------------------------------------------------- */
/* Service cards                                                               */
/* -------------------------------------------------------------------------- */

interface CardDef {
  key: string;
  word: string;
  line: string;
  fx: LetterFx;
  scope: string[];
  match: RegExp;
}

/**
 * ORDER IS LOAD-BEARING — first match wins ("Annual tax return" must be Tax
 * before "annual return" could read it as Corporate). Scope bullets restate
 * what A4 already publishes for each service (src/data/a4ServicesSiteData.ts).
 */
const CARD_DEFS: CardDef[] = [
  {
    key: "catch",
    word: "Catch-up",
    line: "Earlier months, brought up to date.",
    fx: "stack",
    scope: ["Backdated months at your own monthly rate", "Reconciled and reviewed like a live month"],
    match: /catch.?up/i,
  },
  {
    key: "acc",
    word: "Accounting",
    line: "Books that balance, every month.",
    fx: "scatter",
    scope: ["Document capture and posting", "Monthly bank reconciliations", "Accountant review every period"],
    match: /bookkeeping|additional bank accounts/i,
  },
  {
    key: "tax",
    word: "Tax",
    line: "Your tax return, prepared and filed.",
    fx: "type",
    scope: ["Corporate income tax computation and return", "Filed with the CFR, on time"],
    match: /tax return|corporate tax|income tax/i,
  },
  {
    key: "vat",
    word: "VAT",
    line: "Computed correctly. Filed on time.",
    fx: "cascade",
    scope: ["VAT returns, prepared, reviewed and filed", "Deadline tracking in your portal"],
    match: /\bvat\b(?!.*registration)/i,
  },
  {
    key: "pay",
    word: "Payroll",
    line: "Payslips, FS5s and SSC, every period.",
    fx: "stack",
    scope: ["Payslips and FS5 submissions every month", "SSC compliance, with FS3s and the FS7 at year end"],
    match: /payroll/i,
  },
  {
    key: "rev",
    word: "Review",
    line: "A review engagement, where the law allows one.",
    fx: "tighten",
    scope: ["Limited-assurance review of your financial statements", "Requests and uploads in your portal"],
    match: /review engagement/i,
  },
  {
    key: "aud",
    word: "Audit",
    line: "Statutory audits under GAPSME and IFRS.",
    fx: "tighten",
    scope: [
      "Statutory audit, from planning to signed opinion",
      "Audit requests and uploads in your portal",
      "Management letter with practical findings",
    ],
    match: /audit/i,
  },
  {
    key: "inc",
    word: "Formation",
    line: "Your company, incorporated with licensed CSP partners.",
    fx: "zoom",
    scope: ["Incorporation filed with the MBR", "Registers and statutory documents set up"],
    match: /incorporation|shareholder|additional directors|regulated-sector|vat and tax registrations|bank account assistance/i,
  },
  {
    key: "csp",
    word: "Corporate",
    line: "Annual return and registered office, with licensed CSP partners.",
    fx: "zoom",
    scope: ["Registry fees are passed on at cost"],
    match: /annual return|\bmbr\b|registered office|company secretar/i,
  },
  {
    key: "adv",
    word: "Advisory",
    line: "Fractional CFO, budgets and forecasts.",
    fx: "type",
    scope: ["Budgets and rolling forecasts", "Board and management reporting"],
    match: /advisory|\bcfo\b|forecast/i,
  },
];

const FX_CYCLE: LetterFx[] = ["scatter", "tighten", "cascade", "stack", "zoom", "type"];

function shortWord(label: string): string {
  const first = label.split(/[—–\-·:(,]/)[0].trim();
  const words = first.split(/\s+/).slice(0, 2).join(" ");
  const w = words.length > 12 ? words.split(/\s+/)[0] : words;
  return w.charAt(0).toUpperCase() + w.slice(1);
}

/** Group the quotation's lines into the cards of "Build your quote". */
export function buildCards(lines: QuoteLine[]): ServiceCard[] {
  const cards = new Map<string, ServiceCard>();
  const order: string[] = [];
  const add = (key: string, def: Omit<ServiceCard, "lines" | "monthly" | "yearly" | "oneOff" | "fixed">, l: QuoteLine) => {
    let card = cards.get(key);
    if (!card) {
      card = { ...def, lines: [], monthly: 0, yearly: 0, oneOff: 0, fixed: 0 };
      cards.set(key, card);
      order.push(key);
    }
    card.lines.push(l);
    if (l.cadence === "monthly") card.monthly = round2(card.monthly + l.amount);
    else if (l.cadence === "yearly") card.yearly = round2(card.yearly + l.amount);
    else if (l.cadence === "one-off") card.oneOff = round2(card.oneOff + l.amount);
    else card.fixed = round2(card.fixed + l.amount);
  };

  let other = 0;
  for (const l of lines) {
    if (l.adjustment) continue;
    const def = CARD_DEFS.find((d) => d.match.test(l.label));
    if (def) {
      add(def.key, { key: def.key, word: def.word, line: def.line, fx: def.fx, scope: def.scope }, l);
    } else {
      const key = `other-${other}`;
      add(
        key,
        { key, word: shortWord(l.label), line: l.label, fx: FX_CYCLE[other % FX_CYCLE.length], scope: [] },
        l
      );
      other += 1;
    }
  }
  const rank = (k: string) => {
    const i = CARD_DEFS.findIndex((d) => d.key === k);
    return i < 0 ? CARD_DEFS.length + order.indexOf(k) : i;
  };
  // Accounting first, then the order a client thinks in.
  const PREFERRED = ["acc", "catch", "vat", "tax", "pay", "aud", "rev", "inc", "csp", "adv"];
  return order
    .map((k) => cards.get(k)!)
    .sort((a, b) => {
      const pa = PREFERRED.indexOf(a.key);
      const pb = PREFERRED.indexOf(b.key);
      return (pa < 0 ? 100 + rank(a.key) : pa) - (pb < 0 ? 100 + rank(b.key) : pb);
    });
}

/* -------------------------------------------------------------------------- */
/* Money                                                                       */
/* -------------------------------------------------------------------------- */

export function fmtEur(n: number, decimals: 0 | 2 = 0): string {
  const sign = n < 0 ? "−" : "";
  return (
    sign +
    "€" +
    Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  );
}

/** A card's price in the chosen view. Monthly view keeps every fee in its own cadence. */
export function cardPrice(card: ServiceCard, view: FeeView): { amount: number; per: string; freq: string } {
  if (view === "year") {
    const amount = round2(card.monthly * 12 + card.yearly + card.oneOff + card.fixed);
    const freq = card.oneOff && !card.monthly && !card.yearly ? "One-off, in year one" : "First year";
    return { amount, per: "first year", freq };
  }
  if (card.monthly) {
    const extras = [card.yearly ? `+ ${fmtEur(card.yearly)} /yr` : "", card.oneOff ? `+ ${fmtEur(card.oneOff)} one-off` : ""]
      .filter(Boolean)
      .join(" ");
    return { amount: card.monthly, per: "/ mo", freq: extras ? `Monthly ${extras}` : "Monthly" };
  }
  if (card.yearly) {
    return { amount: card.yearly, per: "/ yr", freq: card.oneOff ? `Yearly + ${fmtEur(card.oneOff)} one-off` : "Yearly" };
  }
  if (card.oneOff) return { amount: card.oneOff, per: "one-off", freq: "One-off" };
  return { amount: card.fixed, per: "fixed fee", freq: "Fixed fee" };
}

export interface QuoteTotals {
  count: number;
  monthly: number;
  yearly: number;
  oneOff: number;
  fixed: number;
  registry: number;
  /** The figure the headline shows, before VAT (view-dependent). */
  net: number;
  vat: number;
  total: number;
  per: string;
  /** Fees on the quotation that the monthly headline does not include. */
  alsoYearly: number;
  alsoOneOff: number;
}

/** Adjustment lines follow their cadence: kept while any chosen line of that cadence is. */
function keptAdjustments(lines: QuoteLine[], chosen: QuoteLine[]): QuoteLine[] {
  const cadences = new Set(chosen.map((l) => l.cadence));
  return lines.filter((l) => l.adjustment && cadences.has(l.cadence));
}

export function computeTotals(lines: QuoteLine[], cards: ServiceCard[], on: ReadonlySet<string>, view: FeeView): QuoteTotals {
  const chosen = cards.filter((c) => on.has(c.key)).flatMap((c) => c.lines);
  const all = [...chosen, ...keptAdjustments(lines, chosen)];
  const sum = (c: Cadence | null) => round2(all.filter((l) => l.cadence === c).reduce((s, l) => s + l.amount, 0));
  const monthly = sum("monthly");
  const yearly = sum("yearly");
  const oneOff = sum("one-off");
  const fixed = sum(null);
  const registry = round2(all.reduce((s, l) => s + l.registry, 0));
  const count = cards.filter((c) => on.has(c.key)).length;

  if (view === "monthly" && monthly > 0) {
    const vat = round2(monthly * VAT_RATE);
    return {
      count, monthly, yearly, oneOff, fixed, registry,
      net: monthly, vat, total: round2(monthly + vat), per: "/ mo",
      alsoYearly: yearly, alsoOneOff: round2(oneOff + fixed),
    };
  }
  const net = round2(monthly * 12 + yearly + oneOff + fixed);
  const vat = round2(Math.max(0, net - registry) * VAT_RATE);
  const onlyOneOff = !monthly && !yearly;
  return {
    count, monthly, yearly, oneOff, fixed, registry,
    net, vat, total: round2(net + vat),
    per: onlyOneOff ? "one-off" : monthly ? "first year" : "/ yr",
    alsoYearly: 0, alsoOneOff: 0,
  };
}

/** Line indexes to send with an acceptance (adjustments are the server's business). */
export function acceptedLineIndexes(cards: ServiceCard[], on: ReadonlySet<string>): number[] {
  return cards
    .filter((c) => on.has(c.key))
    .flatMap((c) => c.lines.map((l) => l.index))
    .sort((a, b) => a - b);
}

/* -------------------------------------------------------------------------- */
/* Dates, names, state                                                         */
/* -------------------------------------------------------------------------- */

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Malta" });
}

/** Who the quotation is for, as the prospect gave it. */
export function clientDisplayName(s: Pick<QuotationSummary, "companyName" | "contactName" | "clientName" | "clientEmail">): string {
  return s.companyName?.trim() || s.contactName?.trim() || s.clientName?.trim() || s.clientEmail.split("@")[0];
}

export type PageState = "open" | "accepted" | "expired" | "declined";

export function pageState(s: Pick<QuotationSummary, "status" | "validUntil">, now: Date = new Date()): PageState {
  if (s.status === "ACCEPTED") return "accepted";
  if (s.status === "DECLINED") return "declined";
  if (s.status === "EXPIRED") return "expired";
  if (s.validUntil && new Date(s.validUntil).getTime() < now.getTime()) return "expired";
  return "open";
}

/* -------------------------------------------------------------------------- */
/* Fetching                                                                    */
/* -------------------------------------------------------------------------- */

export type SummaryResult =
  | { ok: true; summary: QuotationSummary }
  | { ok: false; reason: "invalid" | "not-found" | "unavailable" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isQuotationId(id: string): boolean {
  return UUID_RE.test(id);
}

/** Server-side read of the public summary. Never throws. */
export async function fetchQuotationSummary(
  id: string,
  token: string,
  opts: { preview?: boolean; timeoutMs?: number } = {}
): Promise<SummaryResult> {
  if (!isQuotationId(id) || !token) return { ok: false, reason: "invalid" };
  const url =
    `${QUOTE_API_BASE}/public/quotations/${encodeURIComponent(id)}/summary?token=${encodeURIComponent(token)}` +
    (opts.preview ? "&preview=1" : "");
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json", Origin: "https://a4.com.mt" },
      signal: AbortSignal.timeout(opts.timeoutMs ?? 12000),
    });
    if (res.status === 401 || res.status === 400) return { ok: false, reason: "invalid" };
    if (res.status === 404) return { ok: false, reason: "not-found" };
    if (!res.ok) return { ok: false, reason: "unavailable" };
    const body = (await res.json().catch(() => null)) as { data?: QuotationSummary } | null;
    if (!body?.data?.reference) return { ok: false, reason: "unavailable" };
    return { ok: true, summary: body.data };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
