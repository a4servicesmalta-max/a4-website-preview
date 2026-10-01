/**
 * The /quote full-page builder — the pure part: the visitor's answers → the
 * A4Item basket → priced lines → the three views (Monthly / First year /
 * Retainer).
 *
 * ONE engine. Every figure on the page comes from `evaluateA4Items` — the same
 * function `submitWebsiteQuotation` prices the submitted record with — so the
 * screen and the wire cannot disagree (never qCalc, never buildQuote). The
 * monthly retainer is `retainerFor` from src/lib/retainer.ts over those same
 * lines: an OFFER shown beside the itemised quote, never a change to a line or
 * a total that is sent.
 *
 * The questions and their gating follow the homepage calculator
 * (src/components/a4-landing/LandingQuoteCalculator.tsx: qCalc / qItems):
 *   - the monthly spend band is required for the bookkeeping and the tax
 *     return — never a default band;
 *   - a "refer" sector is never priced (a director calls);
 *   - A4 never audits or reviews books it keeps (IESBA): with both switched on,
 *     A4 keeps the books and a partner audit firm does the audit or review, at
 *     the same fee, labelled "— by a partner audit firm" by the engine;
 *   - VAT returns only on books A4 keeps;
 *   - the catch-up is derived from a start month in the past, never asked.
 */
import {
  CAPITAL_BANDS,
  EXPENSE_BANDS,
  MBR_ANNUAL_RETURN,
  REGISTERED_OFFICE_YEARLY,
  SECTORS,
  managedMonthly,
  sectorTier,
  type CapitalBand,
  type ExpenseBand,
  type ManagedEntity,
  type TxnBand,
} from "@/data/a4QuotePack";
import { catchUpMonthsFrom } from "@/lib/accounting-fee";
import { retainerFor, type RetainerResult } from "@/lib/retainer";
import { evaluateA4Items, type A4Item, type A4Risk, type A4Totals, type QuotePlan } from "@/lib/websiteQuotation";

/* -------------------------------------------------------------------------- */
/* State                                                                       */
/* -------------------------------------------------------------------------- */

export type VatReg = "none" | "art10" | "art11" | "art12" | "unsure";

/** The services a visitor switches on. The catch-up is not one: it follows the start month. */
export type ToggleKey = "book" | "vat" | "pay" | "tax" | "csp" | "assure";
export type ServiceKey = ToggleKey | "catch";

export type BuilderState = {
  entity: ManagedEntity;
  /** "" = not answered. Never defaulted — the band IS the bookkeeping price. */
  expenses: ExpenseBand | "";
  sector: string;
  txn: TxnBand;
  /** 1..8 — the first account is included in the bookkeeping fee. */
  banks: number;
  /** `YYYY-MM`, the EARLIEST month that still needs doing. "" = not answered. */
  startMonth: string;
  vatreg: VatReg;
  /** People on the payroll, 0..50. */
  heads: number;
  /** Share capital — sets the MBR registry fee (company only). */
  capital: CapitalBand;
  /** Inside Corporate: our registered office as well as the annual return. */
  regoff: boolean;
  on: Record<ToggleKey, boolean>;
};

/**
 * Opening state. Spend band and start month EMPTY (as on the homepage); the
 * volume defaults to "Up to 20" (owner ruling 2026-08-26) and the sector to the
 * first standard one, as the homepage wizard does.
 */
export const BUILDER_INIT: BuilderState = {
  entity: "company",
  expenses: "",
  sector: "shop",
  txn: "1-20",
  banks: 1,
  startMonth: "",
  vatreg: "art10",
  heads: 0,
  capital: "1500",
  regoff: false,
  on: { book: true, vat: true, pay: false, tax: true, csp: false, assure: false },
};

export const MAX_BANKS = 8;
export const MAX_HEADS = 50;

export const VAT_REG_OPTIONS: { id: VatReg; label: string; hint: string }[] = [
  { id: "none", label: "Not registered", hint: "tax return only" },
  { id: "art10", label: "Yes", hint: "charging and reclaiming" },
  { id: "art11", label: "Small exempt", hint: "under the threshold" },
  { id: "art12", label: "EU purchases", hint: "acquisitions only" },
  { id: "unsure", label: "Not sure", hint: "we'll check" },
];

/** The base bookkeeping fee at a band — the hint under each spend option. */
export function bandBase(entity: ManagedEntity, band: ExpenseBand): number | null {
  return managedMonthly(entity, band);
}

export const isStartMonth = (v: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(v);

/** Earlier months to bring up to date — derived from the start month. */
export const catchUpMonths = (s: Pick<BuilderState, "startMonth">, now: Date = new Date()) => catchUpMonthsFrom(s.startMonth, now);

/** Company-only services disappear for a sole trader rather than being refused. */
export function visibleServices(s: BuilderState, now: Date = new Date()): ServiceKey[] {
  const out: ServiceKey[] = ["book"];
  if (catchUpMonths(s, now) > 0) out.push("catch");
  out.push("vat", "pay", "tax");
  if (s.entity === "company") out.push("csp", "assure");
  return out;
}

/* -------------------------------------------------------------------------- */
/* Copy that must read the same as the homepage (English only — do not        */
/* machine-translate; LandingQuoteCalculator.tsx PARTNER_AUDIT_NOTE /         */
/* ONBOARDING_NOTE)                                                            */
/* -------------------------------------------------------------------------- */

/** Books + audit (owner decision 2026-10-01) — the homepage's PARTNER_AUDIT_NOTE. */
export const PARTNER_AUDIT_NOTE =
  "You have asked us to keep the books and for the audit or review. We keep the books. Independence rules mean we cannot audit them ourselves, so we find a partner audit firm for you — the audit is quoted here at our published price and included in your portal.";
export const ONBOARDING_NOTE =
  "Digital Onboarding and opening balances are not priced here. We quote those once we have seen your records, because what they take depends on the state they are in.";

const TIER_NOTE: Partial<Record<string, string>> = {
  elevated: "Sectors like this need a few extra checks when we take you on. They are part of taking you on, not an extra charge.",
  high: "Licensed and regulated sectors need full source-of-funds checks and closer monitoring. A director signs off before we take the work on.",
};
export const REFER_NOTE =
  "We price most companies on the spot, but yours needs a short call with a director before we put a number on it. Usually the same day.";
const VAT_UNSURE_NOTE =
  "We have priced you as fully VAT registered, the most common case. If the register says otherwise the price drops — we tell you before you commit.";
const REVIEW_NOTE =
  "You likely qualify for a review instead of a full audit — about half the cost. We confirm it against your figures before anything is agreed.";
const CSP_NOTE = "Corporate services are delivered with licensed CSP partners.";

/* -------------------------------------------------------------------------- */
/* Services → items                                                            */
/* -------------------------------------------------------------------------- */

/** Volumes / spend at which a company is unlikely to stay a small company — a full audit, not a review. */
const BIG_VOLUME: TxnBand[] = ["151-400", "401-1000", "1000+"];
const BIG_SPEND: ExpenseBand[] = ["100-200k", "200-300k", "300-400k", "400-500k", "500k+"];

/** A review engagement rather than a full audit (the homepage's qAuditIsReview, size always "small"). */
export function auditIsReview(s: Pick<BuilderState, "expenses" | "txn">): boolean {
  return !(s.expenses !== "" && BIG_SPEND.includes(s.expenses)) && !BIG_VOLUME.includes(s.txn);
}

export type ServiceItems = {
  /** What this service adds to the basket. Empty when it cannot be priced yet. */
  items: A4Item[];
  /** Why it cannot be priced yet, in the visitor's terms; null when it can. */
  needs: string | null;
};

const NEEDS_SPEND = "Pick your monthly spend in 01 — it sets this price, and we never assume a band.";

/** The items ONE service contributes, whether or not it is switched on. */
export function serviceItems(s: BuilderState, key: ServiceKey, now: Date = new Date()): ServiceItems {
  const entity = s.entity;
  const exp = s.expenses;
  const banks = Math.min(MAX_BANKS, Math.max(1, Math.round(s.banks) || 1));
  switch (key) {
    case "book":
      if (exp === "") return { items: [], needs: NEEDS_SPEND };
      return { items: [{ service: "bookkeeping-managed", entity, expenses: exp, txn: s.txn, banks }], needs: null };
    case "catch": {
      const months = catchUpMonths(s, now);
      if (months <= 0) return { items: [], needs: "Only when your start month is in the past." };
      if (!s.on.book) return { items: [], needs: "The catch-up comes with the bookkeeping — switch it on to bring the earlier months up to date." };
      if (exp === "") return { items: [], needs: NEEDS_SPEND };
      return { items: [{ service: "catchup", months, entity, expenses: exp, txn: s.txn, banks }], needs: null };
    }
    case "vat":
      if (s.vatreg === "none") return { items: [], needs: "You told us you are not VAT registered — change it in 01 if you are." };
      if (!s.on.book) return { items: [], needs: "We only put our name to a VAT return when we have kept the ledger behind it. Switch the bookkeeping on and the returns unlock." };
      return { items: [{ service: "vat", txn: s.txn, vatreg: s.vatreg === "unsure" ? "art10" : s.vatreg }], needs: null };
    case "pay": {
      const heads = Math.min(MAX_HEADS, Math.max(0, Math.round(s.heads) || 0));
      if (heads <= 0) return { items: [], needs: "Add how many people are on the payroll in 01." };
      return { items: [{ service: "payroll", heads }], needs: null };
    }
    case "tax":
      if (exp === "") return { items: [], needs: NEEDS_SPEND };
      return { items: [{ service: "taxret", entity, expenses: exp }], needs: null };
    case "csp":
      if (entity !== "company") return { items: [], needs: "For companies only." };
      return {
        items: [{ service: "mbr", capital: s.capital }, ...(s.regoff ? [{ service: "registered-office" } as A4Item] : [])],
        needs: null,
      };
    case "assure":
      if (entity !== "company") return { items: [], needs: "For companies only — a sole trader has no statutory audit." };
      // With the books on, a partner audit firm does it — the engine labels the line so.
      return {
        items: [{ service: "audit", txn: s.txn, ...(auditIsReview(s) ? { review: true as const } : {}), ...(s.on.book ? { partner: true as const } : {}) }],
        needs: null,
      };
  }
}

/** Whether a service is in the basket the visitor is building. The catch-up follows the start month. */
export function isOn(s: BuilderState, key: ServiceKey, now: Date = new Date()): boolean {
  if (key === "catch") return s.on.book && catchUpMonths(s, now) > 0;
  if ((key === "csp" || key === "assure") && s.entity !== "company") return false;
  return s.on[key];
}

/* -------------------------------------------------------------------------- */
/* The basket                                                                  */
/* -------------------------------------------------------------------------- */

/** Why nothing is priced: a director call, the spend band, or nothing picked. */
export type Gate = "refer" | "no-expenses" | "nothing" | null;

/** One priced line, with the service it belongs to and its index on the wire. */
export type BuilderLine = {
  index: number;
  key: ServiceKey;
  label: string;
  amount: number;
  cadence: "monthly" | "yearly" | "one-off";
  /** Government money inside the amount (MBR registry) — at cost, no VAT. */
  registry: number;
};

export type Basket = {
  gate: Gate;
  risk: A4Risk;
  /** What `submitWebsiteQuotation` sends. Empty whenever `gate` is set. */
  items: A4Item[];
  /** Services that priced, in display order. */
  priced: ServiceKey[];
  lines: BuilderLine[];
  /** evaluateA4Items(items, risk) — the totals that are sent. */
  totals: A4Totals;
  /** The books and the audit/review both priced: a partner audit firm does the audit or review. */
  partnerAudit: boolean;
  notes: string[];
};

/** Display order of the services (and of the lines on the wire). */
export const SERVICE_ORDER: ServiceKey[] = ["book", "catch", "vat", "pay", "tax", "csp", "assure"];

const toCadence = (c: string): BuilderLine["cadence"] => (c === "monthly" ? "monthly" : c === "yearly" ? "yearly" : "one-off");

function registryOf(label: string, amount: number): number {
  if (!/annual return/i.test(label) || !/\bmbr\b/i.test(label)) return 0;
  return Math.max(0, amount - MBR_ANNUAL_RETURN.ourFee);
}

export function buildBasket(s: BuilderState, now: Date = new Date()): Basket {
  const tier = sectorTier(s.sector);
  const risk: A4Risk = tier === "elevated" || tier === "high" ? tier : "standard";
  const empty = (gate: Gate, notes: string[] = []): Basket => ({
    gate,
    risk,
    items: [],
    priced: [],
    lines: [],
    totals: evaluateA4Items([], risk, now),
    partnerAudit: false,
    notes,
  });
  if (tier === "refer") return empty("refer", [REFER_NOTE]);
  if ((isOn(s, "book", now) || isOn(s, "tax", now)) && s.expenses === "") return empty("no-expenses");

  const items: A4Item[] = [];
  const priced: ServiceKey[] = [];
  const lines: BuilderLine[] = [];
  for (const key of SERVICE_ORDER) {
    if (!isOn(s, key, now)) continue;
    const si = serviceItems(s, key, now);
    if (si.needs || !si.items.length) continue;
    // Priced service by service, in basket order: the concatenation IS
    // evaluateA4Items(items).lines (each item prices on its own), so every
    // line keeps the service it belongs to. Pinned in builderModel.test.ts.
    const own = evaluateA4Items(si.items, risk, now).lines;
    if (!own.length) continue;
    items.push(...si.items);
    priced.push(key);
    for (const l of own) {
      lines.push({ index: lines.length, key, label: l.label, amount: l.amount, cadence: toCadence(l.cadence), registry: registryOf(l.label, l.amount) });
    }
  }
  if (!items.length) return empty("nothing");
  // Onboarding carries no figure but rides in the basket, so the quotation says so.
  items.push({ service: "onboarding" });

  const partnerAudit = priced.includes("assure") && priced.includes("book");
  const notes: string[] = [];
  const tierNote = TIER_NOTE[tier];
  if (tierNote) notes.push(tierNote);
  if (partnerAudit) notes.push(PARTNER_AUDIT_NOTE);
  if (priced.includes("vat") && s.vatreg === "unsure") notes.push(VAT_UNSURE_NOTE);
  if (priced.includes("assure") && auditIsReview(s)) notes.push(REVIEW_NOTE);
  if (priced.includes("csp")) notes.push(CSP_NOTE);
  notes.push(ONBOARDING_NOTE);

  return { gate: null, risk, items, priced, lines, totals: evaluateA4Items(items, risk, now), partnerAudit, notes };
}

/* -------------------------------------------------------------------------- */
/* Prices, views and the retainer                                              */
/* -------------------------------------------------------------------------- */

export type BuilderView = "monthly" | "year" | "retainer";

export const VAT_RATE = 0.18;
const round2 = (n: number) => Math.round(n * 100) / 100;

/** A service's price in its own cadence — "/ mo" (with "+ €x /yr" alongside), "/ yr" or "one-off". */
export function nativePrice(lines: Pick<BuilderLine, "amount" | "cadence">[]): { amount: number; per: string; extra: string } {
  const sum = (c: BuilderLine["cadence"]) => lines.filter((l) => l.cadence === c).reduce((t, l) => t + l.amount, 0);
  const mo = sum("monthly");
  const yr = sum("yearly");
  const one = sum("one-off");
  const extra = (parts: string[]) => parts.filter(Boolean).join(" · ");
  if (mo) return { amount: mo, per: "/ mo", extra: extra([yr ? `+ ${euro(yr)} /yr` : "", one ? `+ ${euro(one)} one-off` : ""]) };
  if (yr) return { amount: yr, per: "/ yr", extra: extra([one ? `+ ${euro(one)} one-off` : ""]) };
  return { amount: one, per: "one-off", extra: "" };
}

/** What a service would add if switched on — the price on its card, on or off. */
export function servicePreview(s: BuilderState, key: ServiceKey, risk: A4Risk, now: Date = new Date()) {
  const si = serviceItems(s, key, now);
  if (si.needs || !si.items.length) return { needs: si.needs, price: null as ReturnType<typeof nativePrice> | null };
  const lines = evaluateA4Items(si.items, risk, now).lines.map((l) => ({ amount: l.amount, cadence: toCadence(l.cadence) }));
  return { needs: null, price: nativePrice(lines) };
}

export function euro(n: number, decimals: 0 | 2 = 0): string {
  const sign = n < 0 ? "−" : "";
  return sign + "€" + Math.abs(n).toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** The retainer over the priced lines (src/lib/retainer.ts — the canonical rule). */
export function basketRetainer(b: Pick<Basket, "lines">): RetainerResult {
  return retainerFor(b.lines.map((l) => ({ label: l.label, amount: l.amount, cadence: l.cadence })));
}

/** "€M /mo + €Y /yr separately" — the covered services bought one by one. */
export function separately(b: Pick<Basket, "lines">, r: RetainerResult): { monthly: number; yearly: number } {
  const covered = new Set(r.covered);
  const monthly = b.lines.filter((l) => covered.has(l.index) && l.cadence === "monthly").reduce((t, l) => t + l.amount, 0);
  return { monthly, yearly: r.ownAnnual - 12 * monthly };
}

/** The retainer can be shown, or why not — in the visitor's terms. */
export function retainerReason(r: RetainerResult): string {
  if (r.offered) return "";
  if (r.reason === "nothing-recurring") return "The monthly retainer covers recurring services — pick one or more.";
  return "The monthly retainer needs at least two services, one of them monthly.";
}

export type BuilderTotals = {
  view: BuilderView;
  /** Headline, before VAT. */
  net: number;
  vat: number;
  total: number;
  per: string;
  /** Fees the headline leaves out, before VAT (registry is inside `alsoYearly` and carries no VAT). */
  alsoYearly: number;
  alsoOneOff: number;
  registry: number;
  /** Year one, before VAT — every fee once (12 × monthly + yearly + one-off). */
  firstYear: number;
};

/**
 * Totals for a view. Monthly and First year follow the quotation page
 * (src/lib/quotation-page.ts computeTotals): VAT 18% on fees, never on the
 * registry fee. Retainer: the retainer /mo with VAT on it; what stays outside
 * (registry at cost, one-offs, audit/review) is listed alongside.
 */
export function viewTotals(b: Pick<Basket, "lines" | "totals">, view: BuilderView, r: RetainerResult): BuilderTotals {
  const t = b.totals;
  const registry = t.registryPassThrough;
  const itemisedYear = t.monthly * 12 + t.yearly + t.oneOff;
  if (view === "retainer" && r.offered) {
    const outsideYearly = r.outside.filter((o) => o.cadence === "yearly").reduce((s, o) => s + o.amount, 0);
    const net = r.monthly;
    const vat = round2(net * VAT_RATE);
    return {
      view,
      net,
      vat,
      total: round2(net + vat),
      per: "/ mo",
      alsoYearly: outsideYearly,
      alsoOneOff: r.oneOff,
      registry: r.registryYearly,
      firstYear: r.retainerAnnual + outsideYearly + r.oneOff,
    };
  }
  if (view !== "year" && t.monthly > 0) {
    const vat = round2(t.monthly * VAT_RATE);
    return { view: "monthly", net: t.monthly, vat, total: round2(t.monthly + vat), per: "/ mo", alsoYearly: t.yearly, alsoOneOff: t.oneOff, registry, firstYear: itemisedYear };
  }
  const vat = round2(Math.max(0, itemisedYear - registry) * VAT_RATE);
  const per = !t.monthly && !t.yearly ? "one-off" : t.monthly ? "first year" : "/ yr";
  return { view: view === "retainer" ? "monthly" : view, net: itemisedYear, vat, total: round2(itemisedYear + vat), per, alsoYearly: 0, alsoOneOff: 0, registry, firstYear: itemisedYear };
}

/** The plan the visitor asks for: their pick, else the view they are looking at; never a retainer that is not offered. */
export function effectivePlan(view: BuilderView, picked: QuotePlan | null, offered: boolean): QuotePlan {
  const plan = picked ?? (view === "retainer" ? "retainer" : "separate");
  return plan === "retainer" && !offered ? "separate" : plan;
}

/* -------------------------------------------------------------------------- */
/* Small readers                                                               */
/* -------------------------------------------------------------------------- */

export const sectorLabel = (id: string) => SECTORS.find((x) => x.id === id)?.label ?? "";
export const capitalNote = (id: CapitalBand) => CAPITAL_BANDS.find((c) => c.id === id)?.note ?? "";
export const spendLabel = (id: ExpenseBand | "") => EXPENSE_BANDS.find((b) => b.id === id)?.label ?? "";
export const REGISTERED_OFFICE_FEE = REGISTERED_OFFICE_YEARLY;

/** Stable signature of what would be sent — a sent quotation goes stale when it changes. */
export function basketSignature(b: Pick<Basket, "items" | "risk">, startMonth: string, plan: QuotePlan): string {
  return JSON.stringify([b.risk, startMonth, plan, b.items]);
}
