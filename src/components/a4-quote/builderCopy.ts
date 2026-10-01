/**
 * Words on the /quote builder. English only. House rules: every fee in its own
 * cadence; "All fees exclude VAT"; registry fees at cost; corporate services
 * "with licensed CSP partners"; never one firm doing everything; AI described
 * by what it does for the client, not how.
 */
import type { CardFx } from "@/app/[locale]/services/components/SiteKit";
import type { ServiceKey } from "./builderModel";

export type ServiceCopy = { word: string; line: string; fx: CardFx; scope: string[] };

/** Card words follow the quotation page (src/lib/quotation-page.ts CARD_DEFS), so a visitor meets the same cards in the email. */
export const SERVICE_COPY: Record<ServiceKey, ServiceCopy> = {
  book: {
    word: "Bookkeeping",
    line: "You upload, we keep the books. An accountant approves every entry.",
    fx: "scatter",
    scope: ["Document capture and posting", "Monthly bank reconciliations", "Accountant review every period"],
  },
  catch: {
    word: "Catch-up",
    line: "Earlier months, brought up to date at your own monthly rate.",
    fx: "stack",
    scope: ["Backdated months at your own monthly rate — no premium, no cap", "Reconciled and reviewed like a live month"],
  },
  vat: {
    word: "VAT",
    line: "Computed correctly. Filed on time.",
    fx: "cascade",
    scope: ["VAT returns, prepared, reviewed and filed", "Its own line — never folded into the bookkeeping"],
  },
  pay: {
    word: "Payroll",
    line: "Payslips, FS5s and SSC, every period.",
    fx: "stack",
    scope: ["Payslips and FS5 submissions every month", "SSC compliance, with FS3s and the FS7 at year end"],
  },
  tax: {
    word: "Tax",
    line: "Your annual tax return, prepared and filed.",
    fx: "type",
    scope: ["Prepared from the closed ledger, with schedules", "Filed on time"],
  },
  csp: {
    word: "Corporate",
    line: "The annual return, and a registered office if you need one — with licensed CSP partners.",
    fx: "zoom",
    scope: ["Annual return filed with the MBR", "Registry fees are passed on at cost"],
  },
  assure: {
    word: "Audit",
    line: "An audit or a review engagement, with our partner audit firms.",
    fx: "tighten",
    scope: ["A review engagement where the law allows one — a full audit otherwise", "Carried out by our partner audit firms; the fee stays as quoted"],
  },
};

export const RETAINER_COPY = {
  headline: (x: string) => `One monthly retainer: ${x} /mo for everything ticked`,
  billed: "Billed monthly, 12-month minimum",
  outside: "Registry fees at cost and one-off items billed separately",
  vat: "All fees exclude VAT",
};

export const TIMELINE = [
  { t: "Send", s: "Send this quote to yourself — it takes a name and an email." },
  { t: "Formal quotation by email", s: "Your quotation arrives as its own page, usually within minutes. Anything unusual, a person checks first." },
  { t: "Accept online", s: "Switch services on or off, pick separate fees or the monthly retainer, and accept." },
  { t: "Onboarding", s: "We complete our client due diligence and send the engagement letter." },
  { t: "Work begins", s: "Your own portal: what's done, what's in progress and what's coming up." },
];

export const TERMS = [
  "All fees exclude VAT, which is added at 18%.",
  "Registry and government fees are passed through at cost, with no VAT and no discount.",
  "The monthly retainer is one fee for the recurring services ticked, billed monthly with a 12-month minimum. Registry fees at cost and one-off items are billed separately. It is not an annual or prepaid discount.",
  "Separate services are billed in their own cadence: monthly services monthly in advance, annual services once per financial year.",
  "One-off items, such as a catch-up, are billed on completion.",
  "Corporate services — the annual return and the registered office — are delivered with licensed CSP partners.",
  "Independence: we cannot keep your books and also audit or review them. Whichever you leave with us, we arrange the other side with an independent firm.",
  "Before we act for you we complete our client due diligence and send the engagement letter. Onboarding and opening balances are quoted once we have seen your records.",
];
