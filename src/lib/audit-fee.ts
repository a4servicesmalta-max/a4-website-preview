/**
 * Audit fee engine — ported from the Vacei "Audit" design
 * (Vacei Marketing Site Design.zip → Audit.dc.html) so a4.com.mt and
 * vacei.com quote the same audit fee for the same company.
 *
 * NOTE: this is deliberately a different model from `src/lib/quotation.ts`,
 * which prices /quote and /pricing off `base €705 × revenue band`. The two
 * WILL disagree for the same company. Owner decision 2026-08-02: apply the
 * design's figures on the audit landing page only, and align later.
 */

import {
  AUDIT_YEARLY, TAX_RETURN_YEARLY, TXN_BANDS, RISK_TIERS, REVIEW_ENGAGEMENT_FACTOR, AUDIT_PRE_TRADING,
  AUDIT_SCOPE_SURCHARGES, LAUNCH_PROMO, isPromoActive, roundEur,
  type TxnBand,
} from "@/data/a4QuotePack";

export type TierId = "standard" | "elevated" | "high" | "refer";

export const SECTORS: { id: string; label: string; tier: TierId }[] = [
  { id: "shop", label: "Shop, trade or services", tier: "standard" },
  { id: "consulting", label: "Consulting or freelancing", tier: "standard" },
  { id: "property", label: "Property or rentals", tier: "standard" },
  { id: "hospitality", label: "Restaurant, bar or hotel", tier: "elevated" },
  { id: "online", label: "Online sales or cross-border", tier: "elevated" },
  { id: "holding", label: "Holding or investment company", tier: "elevated" },
  { id: "regulated", label: "Gaming, crypto or financial services", tier: "high" },
  { id: "other", label: "Something else", tier: "refer" },
];

export const TIERS: Record<TierId, { label: string; mult: number; refer?: boolean }> = {
  standard: { label: RISK_TIERS.standard.label, mult: RISK_TIERS.standard.multiplier ?? 1 },
  elevated: { label: RISK_TIERS.elevated.label, mult: RISK_TIERS.elevated.multiplier ?? 1 },
  high: { label: RISK_TIERS.high.label, mult: RISK_TIERS.high.multiplier ?? 1 },
  refer: { label: RISK_TIERS.refer.label, mult: 1, refer: true },
};

/**
 * Monthly transaction bands — `assure` is the base audit fee, `tax` the annual
 * tax-return add-on. Both come straight from the price pack; never hardcode a
 * fee here or the page will drift from what the firm actually charges.
 */
export const TXN: { id: TxnBand; label: string; assure: number; tax: number }[] = TXN_BANDS.map((b) => ({
  id: b.id,
  label: b.label,
  assure: AUDIT_YEARLY[b.id],
  tax: TAX_RETURN_YEARLY[b.id],
}));

export const SIZES = [
  { id: "small", label: "Small", sub: "under €93k turnover" },
  { id: "big", label: "Bigger", sub: "above that" },
  { id: "unsure", label: "Not sure", sub: "we’ll check" },
];

// Scope surcharges come from the pack now, not from figures restated here.
export const PAYROLL: { id: string; label: string; sub: string; add: number }[] = [
  { id: "none", label: "No payroll", sub: "", add: AUDIT_SCOPE_SURCHARGES.payrollByHeadcount.none },
  { id: "1-5", label: "1–5 people", sub: "", add: AUDIT_SCOPE_SURCHARGES.payrollByHeadcount["1-5"] },
  { id: "6-20", label: "6–20 people", sub: "", add: AUDIT_SCOPE_SURCHARGES.payrollByHeadcount["6-20"] },
  { id: "21+", label: "21 or more", sub: "", add: AUDIT_SCOPE_SURCHARGES.payrollByHeadcount["21+"] },
];

export const VAT: { id: string; label: string; sub: string; add: number }[] = [
  { id: "yes", label: "Yes", sub: "registered and filing", add: AUDIT_SCOPE_SURCHARGES.vatRegistered },
  { id: "no", label: "No", sub: "not registered", add: 0 },
];

export const BANKS: { id: string; label: string; sub: string; add: number }[] = [
  { id: "1", label: "One", sub: "", add: AUDIT_SCOPE_SURCHARGES.banksByCount["1"] },
  { id: "2-3", label: "Two or three", sub: "", add: AUDIT_SCOPE_SURCHARGES.banksByCount["2-3"] },
  { id: "4+", label: "Four or more", sub: "", add: AUDIT_SCOPE_SURCHARGES.banksByCount["4+"] },
];

export const TAX_RETURN = [
  { id: "yes", label: "Yes", sub: "prepared with the audit" },
  { id: "no", label: "No", sub: "handled elsewhere" },
];

export const YEARS = [
  { id: "2025", label: "FY 2025", sub: "" },
  { id: "2024", label: "FY 2024", sub: "" },
  { id: "old", label: "2023 or earlier", sub: "" },
  { id: "multi", label: "Multiple years", sub: "" },
];

export const NYRS = [
  { id: "2", label: "Two years", sub: "" },
  { id: "3", label: "Three years", sub: "" },
  { id: "4", label: "Four or more", sub: "" },
];

export const CHANGES = [
  { id: "no", label: "No major changes", sub: "" },
  { id: "yes", label: "Yes, major changes", sub: "" },
];

/** Rail labels — seven questions then the fee. */
export const STEPS = [
  "What you do",
  "Volume",
  "Company size",
  "Payroll",
  "VAT",
  "Bank accounts",
  "Tax return",
  "Your fee",
];

export type AuditInput = {
  sector: string;
  txn: string;
  size: string;
  pay: string;
  vat: string;
  banks: string;
  taxret: string;
  year: string;
  nyrs: string;
  chg: string;
  uploaded: boolean;
  doc: "fs" | "mgmt";
};

export type AuditQuote =
  | { refer: true; tier: { label: string; mult: number; refer?: boolean } }
  | {
      refer: false;
      tier: { label: string; mult: number; refer?: boolean };
      /** Undiscounted fee. */
      fee: number;
      /** Fee after any upload discount, BEFORE the launch promo. */
      final: number;
      disc: number;
      /**
       * The launch promo, applied on top of any upload discount — the same
       * 25% every other surface on the site already deducted. This page used
       * to be the one place the advertised discount silently did not exist,
       * which quoted the firm's headline product ~33% above /pricing and
       * /a4-services for the same company.
       */
      promoPct: number;
      /** Fee after BOTH discounts — what the client is actually quoted. */
      finalNet: number;
      reasons: string[];
      review: boolean;
      bigVol: boolean;
      payAdd: number;
      vatAdd: number;
      bankAdd: number;
      taxAdd: number;
      yearsN: number;
      /** Undiscounted multi-year total. */
      total: number;
      /** Multi-year total at the price actually quoted. */
      totalNet: number;
    };

export const euro = (n: number) => "€" + Math.round(n).toLocaleString("en-GB");

const find = <T extends { id: string }>(list: T[], id: string) => list.find((x) => x.id === id) ?? list[0];

/**
 * `now` is injectable for the same reason it is on `evaluateA4Items` and
 * `calcAccountingFee`: the launch promo lapses by date, so a suite that read
 * the real clock would go red on 1 September rather than proving the price
 * steps back up.
 */
export function calcAuditFee(s: AuditInput, now: Date = new Date()): AuditQuote {
  const tier = TIERS[find(SECTORS, s.sector).tier];
  if (tier.refer) return { refer: true, tier };

  const txnIdx = TXN.findIndex((t) => t.id === s.txn);
  const txn = txnIdx < 0 ? TXN[0] : TXN[txnIdx];
  const bigVol = txnIdx >= 4;
  // Small companies with modest volume qualify for a review engagement — a
  // little over half the cost of a full audit.
  const review = s.size !== "big" && !bigVol;

  const payAdd = find(PAYROLL, s.pay).add;
  const vatAdd = find(VAT, s.vat).add;
  const bankAdd = find(BANKS, s.banks).add;
  const taxAdd = s.taxret === "yes" ? Math.round(txn.tax * tier.mult) : 0;

  const fee =
    Math.max(AUDIT_PRE_TRADING, Math.round(((txn.assure * (review ? REVIEW_ENGAGEMENT_FACTOR : 1) + payAdd + vatAdd + bankAdd) * tier.mult) / 50) * 50) +
    taxAdd;

  const yearsN = s.year === "multi" ? Math.max(2, parseInt(s.nyrs, 10) || 2) : 1;

  // Uploading last year's numbers de-risks planning, so some of that saving is
  // passed on — capped where the saving isn't really there.
  let disc = 0;
  let final = fee;
  let reasons: string[] = [];
  if (s.uploaded) {
    const base = s.doc === "fs" ? 0.2 : 0.1;
    let cap = base;
    if (s.chg === "yes") {
      cap = Math.min(cap, 0.05);
      reasons.push("major changes since that year make the file a weaker guide");
    }
    if (fee <= 900) {
      cap = 0.05;
      reasons.push(`the fee is already near the €${AUDIT_PRE_TRADING} floor of our scale`);
    }
    if (bigVol && fee <= 1500) {
      cap = Math.min(cap, 0.05);
      reasons.push("trading volume is intensive relative to the fee, so the planning saving is smaller");
    }
    disc = Math.min(base, cap);
    final = Math.max(AUDIT_PRE_TRADING, Math.round((fee * (1 - disc)) / 50) * 50);
    if (final >= fee) {
      disc = 0;
      final = fee;
      reasons = [`there is no honest room to discount without going below €${AUDIT_PRE_TRADING}`];
    }
    if (disc > 0 && !reasons.length) {
      reasons.push(
        s.doc === "fs"
          ? "audited prior-year statements de-risk planning — the full saving applies"
          : "management accounts help, though less than a full audited set",
      );
    }
  }

  // The launch promo, exactly as the pack specifies it and as every other
  // surface applies it: a straight percentage off the fee, date-driven, no
  // code change needed when it lapses. It sits ON TOP of the upload discount
  // because that one is a scope reduction (a better-prepared file is less
  // work), while this one is a launch offer on the whole quote.
  const promoPct = isPromoActive(now) ? LAUNCH_PROMO.pct : 0;
  const finalNet = promoPct > 0 ? roundEur(final * (1 - promoPct)) : final;

  return {
    refer: false, tier, fee, final, disc, promoPct, finalNet, reasons, review, bigVol,
    payAdd, vatAdd, bankAdd, taxAdd, yearsN,
    total: final * yearsN,
    totalNet: finalNet * yearsN,
  };
}

/** Itemised lines for the fee panel — every euro on the quote is on this list. */
export function feeLines(s: AuditInput, r: AuditQuote): { k: string; v: string }[] {
  if (r.refer) return [{ k: "Sector", v: "Needs a director’s call" }];
  const lines = [
    { k: "Sector risk", v: r.tier.label },
    { k: "Transactions", v: find(TXN, s.txn).label + " /mo" },
    { k: "Engagement", v: r.review ? "Review — the lighter option" : "Full financial audit" },
  ];
  if (r.payAdd > 0) lines.push({ k: "Payroll · " + find(PAYROLL, s.pay).label.toLowerCase(), v: "+ " + euro(r.payAdd) });
  if (r.vatAdd > 0) lines.push({ k: "VAT registered", v: "+ " + euro(r.vatAdd) });
  if (r.bankAdd > 0) lines.push({ k: "Bank accounts · " + find(BANKS, s.banks).label.toLowerCase(), v: "+ " + euro(r.bankAdd) });
  if (r.taxAdd > 0) lines.push({ k: "Annual tax return", v: "+ " + euro(r.taxAdd) });
  if (r.disc > 0) lines.push({ k: "Prior-year file · −" + Math.round(r.disc * 100) + "%", v: "− " + euro(r.fee - r.final) });
  if (r.promoPct > 0) {
    lines.push({
      k: `Launch discount · −${Math.round(r.promoPct * 100)}%`,
      v: "− " + euro(r.final - r.finalNet),
    });
  }
  if (r.yearsN > 1) lines.push({ k: "Years to audit", v: r.yearsN + " × " + euro(r.finalNet) + " = " + euro(r.totalNet) });
  return lines;
}
