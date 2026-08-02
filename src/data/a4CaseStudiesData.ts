export type CaseStudy = {
  id: string;
  sector: string;
  service: string;
  headline: string;
  challenge: string;
  result: string;
  metric: string;
  metricLabel: string;
  timeline: string;
  /** Visual variant for alternating layouts */
  variant?: "spotlight" | "dark" | "tinted" | "minimal";
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "b2b-gaming-licence",
    sector: "iGaming",
    service: "Licensing & compliance",
    headline: "B2B gaming licence secured with a complete financial compliance pack",
    challenge:
      "A platform provider applying for an MGA B2B licence needed audited financial statements, capital-requirement evidence and fit-and-proper financial documentation — under authority deadlines.",
    result:
      "A4 prepared the financial submissions end to end: audited accounts, share-capital and own-funds evidence, projections and an ongoing compliance calendar. The licence was granted with no financial follow-up requests.",
    metric: "MGA B2B",
    metricLabel: "Licence granted",
    timeline: "Licensing engagement · 2026",
    variant: "spotlight",
  },
  {
    id: "cross-border-merger",
    sector: "Corporate group",
    service: "Corporate restructuring",
    headline: "Cross-border merger completed into a single Malta entity",
    challenge:
      "An EU company merging into its Malta counterpart faced statutory timelines across two jurisdictions — merger accounts, creditor protections and coordinated registry filings on both sides.",
    result:
      "A4 prepared the merger accounts and financial documentation, coordinated with counsel in both jurisdictions and sequenced the MBR filings — the merger registered without objections or delays.",
    metric: "2 → 1",
    metricLabel: "Jurisdictions merged into one entity",
    timeline: "Completed 2026",
    variant: "dark",
  },
  {
    id: "share-buy-back",
    sector: "Private company",
    service: "Corporate & tax",
    headline: "Shareholder exit delivered through a compliant share buy-back",
    challenge:
      "A shareholder exit was best served by a company buy-back rather than an external sale — requiring distributable-reserves testing, valuation support, tax treatment and Companies Act procedure.",
    result:
      "A4 tested reserves, supported the valuation, structured the buy-back tranches and handled the tax analysis and MBR filings — a clean exit with the remaining shareholders in full control.",
    metric: "100%",
    metricLabel: "Companies Act compliant exit",
    timeline: "Completed 2026",
    variant: "tinted",
  },
  {
    id: "bookkeeping-catch-up",
    sector: "Retail & FMCG",
    service: "Bookkeeping",
    headline: "Overdue bookkeeping brought current in six weeks",
    challenge:
      "A Malta trading company had 14 months of unmanaged records, unreconciled bank accounts and no visibility ahead of a VAT inspection.",
    result:
      "A4 rebuilt the ledger from source documents, reconciled every account and restored monthly reporting — with a fixed fee agreed before work started.",
    metric: "6 weeks",
    metricLabel: "To clean, reconciled books",
    timeline: "Engagement completed Q1 2026",
    variant: "spotlight",
  },
  {
    id: "audit-ahead-of-mbr",
    sector: "Construction & property",
    service: "Statutory audit",
    headline: "First statutory audit delivered ahead of the MBR deadline",
    challenge:
      "A growing contractor needed its first audited financial statements filed on time after a year-end change — with incomplete trial balance support.",
    result:
      "Our audit team scoped the engagement upfront, closed the fieldwork in four weeks and filed ahead of the MBR deadline with a signed opinion from a licensed audit firm.",
    metric: "3 weeks",
    metricLabel: "Ahead of filing deadline",
    timeline: "FY2025 audit · Malta",
    variant: "dark",
  },
  {
    id: "vat-catch-up",
    sector: "Professional services",
    service: "VAT compliance",
    headline: "Three years of VAT returns filed and penalties resolved",
    challenge:
      "A consultancy had missed quarterly VAT filings after a software change. Penalties were accruing and the business couldn't produce reconciled output tax schedules.",
    result:
      "We reconstructed VAT from bank and invoice data, filed all outstanding returns, negotiated penalty reductions and put a fixed quarterly plan in place.",
    metric: "11 returns",
    metricLabel: "Filed in one engagement",
    timeline: "Completed Q4 2025",
    variant: "tinted",
  },
  {
    id: "payroll-fs5",
    sector: "Hospitality",
    service: "Payroll & FS5",
    headline: "Payroll and FS5 submissions automated for a 40-person team",
    challenge:
      "A hotel group processed payroll manually across two entities. FS5 submissions were often late and payslips weren't consistent with statutory deductions.",
    result:
      "A4 integrated payroll processing, automated FS5 filing and gave HR a single portal view — with our accountants reviewing every run before submission.",
    metric: "100%",
    metricLabel: "On-time FS5 since go-live",
    timeline: "Live since Jan 2026",
    variant: "minimal",
  },
  {
    id: "igaming-audit-readiness",
    sector: "iGaming",
    service: "Audit readiness",
    headline: "Audit-ready in eight weeks before licence renewal",
    challenge:
      "An iGaming operator needed audited accounts for a B2B licence renewal but had incomplete revenue recognition documentation and intercompany balances.",
    result:
      "We mapped revenue streams, cleared intercompany reconciliations and delivered audit-ready financials — the statutory audit completed without scope changes.",
    metric: "8 weeks",
    metricLabel: "To audit-ready position",
    timeline: "Licence renewal 2026",
    variant: "dark",
  },
  {
    id: "holding-restructure",
    sector: "Technology",
    service: "Corporate & tax",
    headline: "Malta holding structure documented and compliant in one quarter",
    challenge:
      "A tech group had grown through acquisitions but lacked documented intercompany agreements, transfer-pricing support and consolidated reporting.",
    result:
      "A4 designed the reporting structure, prepared intercompany documentation and established a monthly consolidation rhythm through the client portal.",
    metric: "4 entities",
    metricLabel: "Under one reporting view",
    timeline: "Group restructure 2025",
    variant: "tinted",
  },
];

export const CASE_STUDY_STATS = [
  { value: "6+", label: "Sectors served" },
  { value: "100%", label: "Fixed-fee scoping" },
  { value: "3 wks", label: "Avg. audit lead time" },
] as const;
