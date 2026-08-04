/**
 * Shared Malta compliance deadline rules — used by the homepage tracker,
 * the interactive /compliance-calendar page and the ICS export.
 *
 * Dates verified against MTCA/MBR guidance and the firm's Malta tax
 * references (Aug 2026). Company-specific deadlines (anniversary- or
 * year-end-driven) live in EVENT_DRIVEN_DEADLINES — never as fake fixed
 * dates. Fixed entries for year-end-driven filings assume a 31 December
 * year-end and say so.
 */

export type DeadlineCategory = "vat" | "employer" | "tax" | "corporate";

export type ComplianceRule = {
  id: string;
  name: string;
  description: string;
  authority: "MTCA" | "MBR";
  category: DeadlineCategory;
  appliesTo: string;
  note?: string;
  monthly?: true;
  /** [monthIndex 0-11, day] occurrences within a year */
  dates?: [number, number][];
};

export const COMPLIANCE_DL_RULES: ComplianceRule[] = [
  {
    id: "fs5",
    name: "FS5 payroll & SSC",
    category: "employer",
    authority: "MTCA",
    appliesTo: "Employers",
    description:
      "Monthly FS5 remitting FSS tax withheld, social security contributions and the maternity-fund contribution for the previous month.",
    monthly: true,
  },
  {
    id: "vat-return",
    name: "VAT return filing",
    category: "vat",
    authority: "MTCA",
    appliesTo: "VAT-registered (article 10)",
    description:
      "Quarterly VAT return and payment — due by the 15th of the second month following the quarter.",
    note: "Calendar-quarter periods shown; your VAT quarters may be staggered. A short administrative concession usually applies to electronic filing — don't plan around it.",
    dates: [
      [1, 15],
      [4, 15],
      [7, 15],
      [10, 15],
    ],
  },
  {
    id: "recap",
    name: "Recapitulative statement",
    category: "vat",
    authority: "MTCA",
    appliesTo: "Businesses with intra-EU B2B supplies",
    description:
      "Declares intra-EU supplies to VAT-registered EU customers — due the 15th of the month following each quarter.",
    note: "Becomes monthly once intra-EU supplies of goods exceed €50,000 in a quarter.",
    dates: [
      [0, 15],
      [3, 15],
      [6, 15],
      [9, 15],
    ],
  },
  {
    id: "vat-a11",
    name: "VAT annual declaration (art. 11)",
    category: "vat",
    authority: "MTCA",
    appliesTo: "Small undertakings registered under article 11",
    description: "Annual declaration for article 11 (exempt small-undertaking) registrations.",
    dates: [[1, 15]],
  },
  {
    id: "fs7",
    name: "FS7 & FS3 employer reconciliation",
    category: "employer",
    authority: "MTCA",
    appliesTo: "Employers",
    description:
      "Annual FS7 reconciliation of the year's FS5s, with an FS3 statement of earnings for every employee.",
    dates: [[1, 15]],
  },
  {
    id: "pt",
    name: "Provisional tax instalment",
    category: "tax",
    authority: "MTCA",
    appliesTo: "Companies & self-employed",
    description:
      "Advance payments of the current year's tax — 20% by 30 April, 30% by 31 August, 50% by 21 December.",
    dates: [
      [3, 30],
      [7, 31],
      [11, 21],
    ],
  },
  {
    id: "ssc2",
    name: "Class 2 SSC instalment",
    category: "tax",
    authority: "MTCA",
    appliesTo: "Self-employed / self-occupied persons",
    description:
      "Social security contributions for the self-occupied, paid in three instalments alongside the provisional-tax dates.",
    note: "Amounts are set on your instalment notice — confirm the figures with us.",
    dates: [
      [3, 30],
      [7, 31],
      [11, 21],
    ],
  },
  {
    id: "ta",
    name: "TA22 / TA24 (part-time & rental income)",
    category: "tax",
    authority: "MTCA",
    appliesTo: "Individuals with part-time or rental income",
    description:
      "Flat-rate tax on part-time work (TA22/TA23) and the 15% final tax on rental income (TA24) for the previous year.",
    dates: [[3, 30]],
  },
  {
    id: "ind-return",
    name: "Personal income tax return",
    category: "tax",
    authority: "MTCA",
    appliesTo: "Individuals & self-employed",
    description: "Annual personal income tax return and self-assessment for the previous year.",
    dates: [[5, 30]],
  },
  {
    id: "cit",
    name: "Company tax return (31 Dec year-ends)",
    category: "corporate",
    authority: "MTCA",
    appliesTo: "Companies with a 31 December year-end",
    description:
      "Company income tax return and self-assessed payment — nine months after the financial year-end.",
    note: "Other year-ends: nine months after your year-end (never earlier than 31 March). MTCA announces electronic-filing extensions annually — payment stays on the statutory date.",
    dates: [[8, 30]],
  },
  {
    id: "accounts",
    name: "Approve audited accounts (31 Dec year-ends)",
    category: "corporate",
    authority: "MBR",
    appliesTo: "Private limited companies with a 31 December year-end",
    description:
      "Private companies must approve audited financial statements within ten months of year-end, then file them with the MBR within 42 days.",
    dates: [[9, 31]],
  },
];

/** Deadlines whose date depends on the company — shown as rules, never as fake fixed dates. */
export type EventDrivenDeadline = {
  id: string;
  name: string;
  rule: string;
  authority: "MBR" | "Jobsplus";
  description: string;
};

export const EVENT_DRIVEN_DEADLINES: EventDrivenDeadline[] = [
  {
    id: "mbr-ar",
    name: "MBR annual return",
    rule: "Within 42 days of your company's registration anniversary",
    authority: "MBR",
    description:
      "Confirms registered office, share capital, directors and shareholders. The annual beneficial-ownership confirmation runs on the same clock.",
  },
  {
    id: "acc-file",
    name: "Annual accounts filing",
    rule: "Within 42 days of approval — and approval within 10 months of year-end (private companies)",
    authority: "MBR",
    description: "Approved audited financial statements are filed online with the Malta Business Registry.",
  },
  {
    id: "bo-change",
    name: "Beneficial-ownership changes",
    rule: "Within 14 days of the change",
    authority: "MBR",
    description: "Any change in beneficial owners must be notified to the MBR.",
  },
  {
    id: "jobsplus",
    name: "Jobsplus engagement & termination forms",
    rule: "Engagement on or before the first working day; either form within 4 working days at the latest",
    authority: "Jobsplus",
    description: "Every new hire and every termination must be notified to Jobsplus.",
  },
];

export type ComplianceDeadline = { name: string; date: Date; rule?: ComplianceRule };

export function getNextComplianceDeadlines(now = new Date(), limit = 6): ComplianceDeadline[] {
  const out: ComplianceDeadline[] = [];
  const y = now.getFullYear();

  const add = (rule: ComplianceRule, d: Date) => {
    if (d.getTime() > now.getTime()) out.push({ name: rule.name, date: d, rule });
  };

  for (const rule of COMPLIANCE_DL_RULES) {
    if (rule.monthly) {
      for (let i = 0; i < 14; i++) {
        add(rule, new Date(y, now.getMonth() + i + 1, 0, 17, 0, 0));
      }
    } else if (rule.dates) {
      for (const [m, day] of rule.dates) {
        for (const yy of [y, y + 1]) {
          add(rule, new Date(yy, m, day, 17, 0, 0));
        }
      }
    }
  }

  return out.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, limit);
}

export function getNextComplianceDeadline(now = new Date()): ComplianceDeadline {
  return getNextComplianceDeadlines(now, 1)[0] ?? {
    name: "VAT return filing",
    date: new Date(now.getFullYear(), now.getMonth() + 1, 15, 17, 0, 0),
  };
}

export function formatComplianceDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
