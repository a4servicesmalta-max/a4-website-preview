/** Pricing info page copy from New website (2)/pricing-info.html */

/*
 * Bookkeeping figures come from the quote pack. Under pack mt-2026-08-14-volume
 * they are the ENTRY band of nine, priced by monthly expenses — so every chip
 * reading them says "from", never a bare figure and never "flat".
 */
import { BOOKKEEPING_COMPANY, BOOKKEEPING_FROM } from "./a4QuotePack";

export const PRICING_FACTORS = [
  { icon: "scan-line", t: "Scope of work", s: "Which services you need and how deep they go — from monthly bookkeeping to a full statutory audit." },
  { icon: "building-2", t: "Business size & structure", s: "Single company or a multi-entity group, holding structures and the entities involved." },
  { icon: "activity", t: "Volume & activity levels", s: "Transaction counts, bank accounts, invoices and payroll headcount that drive the work." },
  { icon: "scale", t: "Regulatory & compliance", s: "VAT, tax and sector obligations — including regulated industries with extra reporting." },
  { icon: "shield-check", t: "Risk & responsibility", s: "The level of assurance, judgement and professional responsibility an engagement carries." },
  { icon: "calendar-clock", t: "Duration & timing", s: "One-off, seasonal or ongoing — and how tight the deadlines are when you come to us." },
];

export const PRICING_MODELS = [
  {
    tag: "Accounting & finance",
    t: "A monthly fee, based on volume",
    s: "Bookkeeping, management accounts, VAT and payroll are priced as a predictable monthly fee that reflects your activity — so it scales sensibly with your business and never surprises you.",
    icon: "book-open-check",
  },
  {
    tag: "Tax & compliance",
    t: "A fixed annual or monthly fee",
    s: "Statutory accounts, tax returns and corporate compliance are quoted as a fixed fee — annual or spread monthly — agreed up front against a clear scope.",
    icon: "landmark",
  },
];

export const PRICING_QUOTE_STEPS = [
  { n: "01", t: "Initial discussion", s: "We learn about your business, your needs and your deadlines." },
  { n: "02", t: "Scope assessment", s: "We assess the work involved and the level of responsibility it carries." },
  { n: "03", t: "Clear quote provided", s: "You receive a written quote, tailored to you — by email, no obligation." },
  { n: "04", t: "Review & confirm", s: "We walk you through it, answer questions and confirm before any work begins." },
];

export const PRICING_OUTLINES = [
  "Services included",
  "Scope of work",
  "Pricing structure",
  "Assumptions made",
  "Expected timeline",
  "Terms of engagement",
];

export const PRICING_COMMIT = [
  "Clear pricing upfront",
  "No hidden fees",
  "No unexpected charges",
  "Transparent communication",
];

export const PRICING_HERO_CHIPS = [
  `Managed bookkeeping from €${BOOKKEEPING_FROM}/mo self-employed · from €${BOOKKEEPING_COMPANY}/mo company, incl. one bank account`,
  "No hidden fees",
  "Clear communication",
  "Tailored quotes for audit & complex work",
];
