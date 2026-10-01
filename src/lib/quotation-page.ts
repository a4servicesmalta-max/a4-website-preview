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
 *     passed through at cost and carry no VAT;
 *   - the monthly retainer is src/lib/retainer.ts, recomputed here for the
 *     services the prospect has switched on.
 * Pure and dependency-light so it is unit-tested (quotation-page.test.ts).
 */
import { MBR_ANNUAL_RETURN } from "@/data/a4QuotePack";
import { retainerFor, type RetainerOutside, type RetainerResult } from "@/lib/retainer";

export const QUOTE_API_BASE =
  process.env.NEXT_PUBLIC_QUOTE_API_BASE?.trim().replace(/\/+$/, "") ||
  "https://vacei-portal-backend.onrender.com/api/v1";

export const VAT_RATE = 0.18;

export type Cadence = "monthly" | "yearly" | "one-off";
export type FeeView = "monthly" | "year";
/** The page's fee toggle: the two cadence views, plus the monthly retainer when offered. */
export type QuoteView = FeeView | "retainer";
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
  /**
   * The monthly-retainer offer pinned on an A4 quotation, computed by the
   * backend over the current lines (the src/lib/retainer.ts rule). Absent or
   * null when the quotation carries no offer (older backends, non-A4 quotes).
   */
  retainer?: RetainerOffer | null;
  acceptance: {
    signerName: string | null;
    billing: "monthly" | "annual" | null;
    partial: boolean;
    /** How the client took it: fees as quoted, or one monthly retainer. */
    plan?: "separate" | "retainer";
    retainerMonthly?: number | null;
  } | null;
}

/** summary.retainer — the backend's public shape of the offer. */
export interface RetainerOffer {
  offered: boolean;
  reason: RetainerResult["reason"];
  monthly: number;
  separateMonthly: number;
  ownAnnual: number;
  retainerAnnual: number;
  savingYearly: number;
  savingPct: number;
  registryYearly: number;
  oneOff: number;
  coveredLineIndexes: number[];
  outside: { index: number; label: string; amount: number; cadence: Cadence | null; reason: RetainerOutside["reason"] }[];
  minTermMonths: number;
  preferred: boolean;
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
  /** Audit / review carried out by a partner audit firm (A4 keeps the books). */
  partner?: boolean;
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

/**
 * Books + audit (owner decision 2026-10-01): A4 keeps the books and a partner
 * audit firm carries out the audit or review. The site and the backend label
 * those lines "… — by a partner audit firm (if applicable)".
 */
export const PARTNER_AUDIT_LABEL = /partner audit firm/i;
const PARTNER_AUDIT_LINE = "We find a partner audit firm for you and include the audit in your portal.";
const PARTNER_AUDIT_SCOPE = "Carried out and signed by a partner audit firm we find for you";
/** The /q terms line whenever a partner-delivered audit or review is on the quotation. English only. */
export const PARTNER_AUDIT_TERM =
  "The audit or review is carried out and signed by an independent partner audit firm we find for you. We keep your books, so independence rules do not allow us to audit them ourselves. The fee is as quoted and the audit runs in your portal.";

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
    if (def && (def.key === "aud" || def.key === "rev") && PARTNER_AUDIT_LABEL.test(l.label)) {
      // The partner variant of the audit / review card.
      add(def.key, { key: def.key, word: def.word, line: PARTNER_AUDIT_LINE, fx: def.fx, scope: [PARTNER_AUDIT_SCOPE, ...def.scope], partner: true }, l);
    } else if (def) {
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
/* The monthly retainer                                                        */
/* -------------------------------------------------------------------------- */

/**
 * `retainerFor` (src/lib/retainer.ts, the canonical rule) over the page's
 * lines. `selected` and every index in the result are lineItems positions
 * (QuoteLine.index), which differ from array positions when the backend sent
 * a malformed row the page skipped.
 */
export function quoteRetainer(lines: QuoteLine[], selected?: Iterable<number>): RetainerResult {
  const pos = new Map(lines.map((l, i) => [l.index, i]));
  const pick = selected
    ? Array.from(selected)
        .map((i) => pos.get(i))
        .filter((p): p is number => p !== undefined)
    : undefined;
  const r = retainerFor(
    lines.map((l) => ({ label: l.label, amount: l.amount, cadence: l.cadence })),
    pick
  );
  const back = (p: number) => lines[p].index;
  return { ...r, covered: r.covered.map(back), outside: r.outside.map((o) => ({ ...o, index: back(o.index) })) };
}

export interface RetainerTotals extends QuoteTotals {
  retainer: RetainerResult;
  /** lineItems indexes inside the retainer. */
  covered: ReadonlySet<number>;
  /** Registry fees passed through at cost, per year. */
  registryYearly: number;
  /** Audit / review fees per year — delivered separately, outside the retainer. */
  auditYearly: number;
  /** One-off items and fixed fees, outside the retainer. */
  outsideOneOff: number;
  /** A year of the retainer plus everything outside it, before VAT. */
  firstYear: number;
  /** VAT on that first year (registry fees carry none). */
  firstYearVat: number;
}

/**
 * The quote as one monthly retainer for the services switched on. Shaped like
 * QuoteTotals so the headline, the pill and the accept panel read it the same
 * way: net = the retainer per month with VAT on top; alsoYearly / alsoOneOff
 * are what stays outside it (registry at cost and audit per year; one-offs).
 */
export function computeRetainerTotals(lines: QuoteLine[], cards: ServiceCard[], on: ReadonlySet<string>): RetainerTotals {
  const base = computeTotals(lines, cards, on, "monthly");
  const r = quoteRetainer(lines, acceptedLineIndexes(cards, on));
  const outsideSum = (reason: RetainerOutside["reason"], perYear: boolean) =>
    round2(
      r.outside
        .filter((o) => o.reason === reason)
        .reduce((s, o) => s + (perYear && o.cadence === "monthly" ? o.amount * 12 : o.amount), 0)
    );
  const registryYearly = round2(r.registryYearly);
  const auditYearly = outsideSum("audit", true);
  const outsideOneOff = round2(r.oneOff + outsideSum("no-cadence", false));
  const net = r.monthly;
  const vat = round2(net * VAT_RATE);
  const alsoYearly = round2(registryYearly + auditYearly);
  const firstYear = round2(r.retainerAnnual + alsoYearly + outsideOneOff);
  return {
    ...base,
    net,
    vat,
    total: round2(net + vat),
    per: "/ mo",
    alsoYearly,
    alsoOneOff: outsideOneOff,
    retainer: r,
    covered: new Set(r.covered),
    registryYearly,
    auditYearly,
    outsideOneOff,
    firstYear,
    firstYearVat: round2(Math.max(0, firstYear - registryYearly) * VAT_RATE),
  };
}

/** Why the retainer option is switched off for the current selection — short, for under the toggle. */
export function retainerUnavailableText(reason: RetainerResult["reason"]): string {
  if (reason === "too-few-services") return "The retainer needs at least two services.";
  if (reason === "no-monthly-service") return "The retainer needs a monthly service.";
  if (reason === "nothing-recurring") return "The retainer needs recurring services.";
  return "No retainer for this selection.";
}

/** What an acceptance records for the view the client accepted in. */
export function acceptPlan(view: QuoteView): { plan: "separate" | "retainer"; billing: "monthly" | "annual" } {
  if (view === "retainer") return { plan: "retainer", billing: "monthly" };
  return { plan: "separate", billing: view === "year" ? "annual" : "monthly" };
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
