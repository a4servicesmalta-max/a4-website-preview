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
  AUDIT_YEARLY, taxReturnYearly, TXN_BANDS, RISK_TIERS, REVIEW_ENGAGEMENT_FACTOR, AUDIT_PRE_TRADING,
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
export const TXN: { id: TxnBand; label: string; assure: number }[] = TXN_BANDS.map((b) => ({
  id: b.id,
  label: b.label,
  assure: AUDIT_YEARLY[b.id],
}));

/**
 * The tax-return add-on ESTIMATE this estimator shows — the company entry-band
 * formula figure (mt-2026-08-26c-volume prices the return from the SPEND band,
 * which this estimator does not ask). A floor, labelled "from"; the final
 * quote prices the client's own band.
 */
export const TAXRET_ESTIMATE_FROM = taxReturnYearly("company", "0-10k") ?? 0;

export const SIZES = [
  { id: "small", label: "Small", sub: "under €93k turnover" },
  { id: "big", label: "Bigger", sub: "above that" },
  { id: "unsure", label: "Not sure", sub: "we’ll check" },
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

/** Rail labels — four questions then the fee. */
export const STEPS = ["What you do", "Volume", "Company size", "Tax return", "Your fee"];

export type AuditInput = {
  sector: string;
  txn: string;
  size: string;
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
      /** Fee after any upload discount — what the client is shown. */
      final: number;
      disc: number;
      reasons: string[];
      review: boolean;
      bigVol: boolean;
      taxAdd: number;
      yearsN: number;
      total: number;
    };

export const euro = (n: number) => "€" + Math.round(n).toLocaleString("en-GB");

const find = <T extends { id: string }>(list: T[], id: string) => list.find((x) => x.id === id) ?? list[0];

/** Pack pre-trading figure for the engagement type: €600 full audit, €330 review engagement. */
export const auditFloor = (review: boolean) => Math.round(AUDIT_PRE_TRADING * (review ? REVIEW_ENGAGEMENT_FACTOR : 1));

export function calcAuditFee(s: AuditInput): AuditQuote {
  const tier = TIERS[find(SECTORS, s.sector).tier];
  if (tier.refer) return { refer: true, tier };

  const txnIdx = TXN.findIndex((t) => t.id === s.txn);
  const txn = txnIdx < 0 ? TXN[0] : TXN[txnIdx];
  const bigVol = txnIdx >= 4;
  // Small companies with modest volume qualify for a review engagement — a
  // little over half the cost of a full audit.
  const review = s.size !== "big" && !bigVol;

  // NOT × tier.mult since pack mt-2026-08-26-taxret. The audit itself still
  // carries the sector loading; the tax return no longer does, so the audit
  // calculator and the bookkeeping calculator quote the same return.
  const taxAdd = s.taxret === "yes" ? TAXRET_ESTIMATE_FROM : 0;

  // Owner ruling 2026-08-26: NO payroll / VAT / bank-account add-ons. The pack
  // has none, so the homepage wizard, /pricing and the quote builder never
  // charged them; this page did, inside the multiplied bracket, and quoted a
  // different audit for the same company. Audit = pack band × review factor ×
  // sector multiplier, floored at the pre-trading fee — nothing else.
  //
  // ⚠ NO €50 ROUNDING (owner, 2026-08-26: "ensure that the audit calculator
  // actually matches the bookkeeping calculator").
  //
  // This used to round the audit to the nearest €50, so /audit-services quoted
  // €1,000 for a 21-60 full audit while the homepage wizard, /pricing and the
  // quote builder — all of which price the same band straight off the pack —
  // quoted €995. One firm, one band, two numbers, and no visitor can tell which
  // is theirs. The pack is the single figure the backend re-prices against, so
  // the pack wins and the rounding goes; whole euros, exactly like every other
  // line on every other surface.
  const fee =
    // The floor is the pack's own pre-trading figure for THIS engagement type —
    // €600 for a full audit, €330 for a review — so the page can never quote
    // above the homepage wizard, which reads the same table with no floor.
    Math.max(auditFloor(review), Math.round(txn.assure * (review ? REVIEW_ENGAGEMENT_FACTOR : 1) * tier.mult)) +
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
      reasons.push(`the fee is already near the €${auditFloor(review)} floor of our scale`);
    }
    if (bigVol && fee <= 1500) {
      cap = Math.min(cap, 0.05);
      reasons.push("trading volume is intensive relative to the fee, so the planning saving is smaller");
    }
    disc = Math.min(base, cap);
    // Same rule after the upload discount: whole euros, no €50 step.
    final = Math.max(auditFloor(review), Math.round(fee * (1 - disc)));
    if (final >= fee) {
      disc = 0;
      final = fee;
      reasons = [`there is no honest room to discount without going below €${auditFloor(review)}`];
    }
    if (disc > 0 && !reasons.length) {
      reasons.push(
        s.doc === "fs"
          ? "audited prior-year statements de-risk planning — the full saving applies"
          : "management accounts help, though less than a full audited set",
      );
    }
  }

  return { refer: false, tier, fee, final, disc, reasons, review, bigVol, taxAdd, yearsN, total: final * yearsN };
}

/** Itemised lines for the fee panel — every euro on the quote is on this list. */
export function feeLines(s: AuditInput, r: AuditQuote): { k: string; v: string }[] {
  if (r.refer) return [{ k: "Sector", v: "Needs a director’s call" }];
  const lines = [
    { k: "Sector risk", v: r.tier.label },
    { k: "Transactions", v: find(TXN, s.txn).label + " /mo" },
    { k: "Engagement", v: r.review ? "Review — the lighter option" : "Full financial audit" },
  ];
  if (r.taxAdd > 0) lines.push({ k: "Annual tax return", v: "+ " + euro(r.taxAdd) });
  if (r.disc > 0) lines.push({ k: "Prior-year file · −" + Math.round(r.disc * 100) + "%", v: "− " + euro(r.fee - r.final) });
  if (r.yearsN > 1) lines.push({ k: "Years to audit", v: r.yearsN + " × " + euro(r.final) + " = " + euro(r.total) });
  return lines;
}
