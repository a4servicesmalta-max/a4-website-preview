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
  standard: { label: "Standard", mult: 1 },
  elevated: { label: "Elevated", mult: 1.2 },
  high: { label: "High", mult: 1.45 },
  refer: { label: "Referral", mult: 1, refer: true },
};

/** Monthly transaction bands — `assure` is the base audit fee, `tax` the annual tax-return add-on. */
export const TXN: { id: string; label: string; assure: number; tax: number }[] = [
  { id: "0", label: "None yet", assure: 600, tax: 175 },
  { id: "1-20", label: "Up to 20", assure: 750, tax: 275 },
  { id: "21-60", label: "20 to 60", assure: 1150, tax: 375 },
  { id: "61-150", label: "60 to 150", assure: 1750, tax: 525 },
  { id: "151-400", label: "150 to 400", assure: 2600, tax: 750 },
  { id: "401-1000", label: "400 to 1,000", assure: 3900, tax: 1100 },
  { id: "1000+", label: "1,000+", assure: 5800, tax: 1650 },
];

export const SIZES = [
  { id: "small", label: "Small", sub: "under €93k turnover" },
  { id: "big", label: "Bigger", sub: "above that" },
  { id: "unsure", label: "Not sure", sub: "we’ll check" },
];

export const PAYROLL: { id: string; label: string; sub: string; add: number }[] = [
  { id: "none", label: "No payroll", sub: "", add: 0 },
  { id: "1-5", label: "1–5 people", sub: "", add: 100 },
  { id: "6-20", label: "6–20 people", sub: "", add: 250 },
  { id: "21+", label: "21 or more", sub: "", add: 450 },
];

export const VAT: { id: string; label: string; sub: string; add: number }[] = [
  { id: "yes", label: "Yes", sub: "registered and filing", add: 150 },
  { id: "no", label: "No", sub: "not registered", add: 0 },
];

export const BANKS: { id: string; label: string; sub: string; add: number }[] = [
  { id: "1", label: "One", sub: "", add: 0 },
  { id: "2-3", label: "Two or three", sub: "", add: 100 },
  { id: "4+", label: "Four or more", sub: "", add: 250 },
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
      /** Fee after any upload discount — what the client is shown. */
      final: number;
      disc: number;
      reasons: string[];
      review: boolean;
      bigVol: boolean;
      payAdd: number;
      vatAdd: number;
      bankAdd: number;
      taxAdd: number;
      yearsN: number;
      total: number;
    };

export const euro = (n: number) => "€" + Math.round(n).toLocaleString("en-GB");

const find = <T extends { id: string }>(list: T[], id: string) => list.find((x) => x.id === id) ?? list[0];

export function calcAuditFee(s: AuditInput): AuditQuote {
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
    Math.max(600, Math.round(((txn.assure * (review ? 0.55 : 1) + payAdd + vatAdd + bankAdd) * tier.mult) / 50) * 50) +
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
      reasons.push("the fee is already near the €600 floor of our scale");
    }
    if (bigVol && fee <= 1500) {
      cap = Math.min(cap, 0.05);
      reasons.push("trading volume is intensive relative to the fee, so the planning saving is smaller");
    }
    disc = Math.min(base, cap);
    final = Math.max(600, Math.round((fee * (1 - disc)) / 50) * 50);
    if (final >= fee) {
      disc = 0;
      final = fee;
      reasons = ["there is no honest room to discount without going below €600"];
    }
    if (disc > 0 && !reasons.length) {
      reasons.push(
        s.doc === "fs"
          ? "audited prior-year statements de-risk planning — the full saving applies"
          : "management accounts help, though less than a full audited set",
      );
    }
  }

  return { refer: false, tier, fee, final, disc, reasons, review, bigVol, payAdd, vatAdd, bankAdd, taxAdd, yearsN, total: final * yearsN };
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
  if (r.yearsN > 1) lines.push({ k: "Years to audit", v: r.yearsN + " × " + euro(r.final) + " = " + euro(r.total) });
  return lines;
}
