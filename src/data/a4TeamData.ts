/** Core team roles shown on homepage — qualified professionals behind the portal. */
export type TeamRole = {
  id: string;
  name: string;
  title: string;
  credentials: string;
  focus: string;
};

export const DEDICATED_TEAM: TeamRole[] = [
  {
    id: "accounting-lead",
    name: "Dedicated accounting manager",
    title: "MIA-qualified accountant",
    credentials: "Malta Accountancy Board",
    focus: "Monthly bookkeeping, VAT, management accounts and your day-to-day questions.",
  },
  {
    id: "audit-lead",
    name: "Lead audit partner",
    title: "Licensed audit firm signatory",
    credentials: "GAPSME & IFRS",
    focus: "Statutory audits, audit readiness and filing coordination with the MBR.",
  },
  {
    id: "compliance-lead",
    name: "Tax & compliance specialist",
    title: "Corporate tax & payroll",
    credentials: "CFR & SSC filings",
    focus: "Corporate tax, FS5 payroll, provisional tax and regulatory liaison.",
  },
];
