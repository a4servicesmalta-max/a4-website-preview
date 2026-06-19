/** Service page copy + layout from New website (2) — mapped to a4-website URL slugs. */

export type ServiceKey =
  | "bookkeeping"
  | "outsourcing"
  | "legal"
  | "vat-payroll"
  | "audit-assurance"
  | "audit-readiness"
  | "accounting-finance"
  | "tax-compliance"
  | "corporate-csp"
  | "regulated-licensing"
  | "advisory-growth"
  | "company-structure"
  | "liquidation-winddown"
  | "international-structures"
  | "group-consolidation"
  | "banking-payments"
  | "crypto-digital-assets"
  | "corporate-transactions";

/** Maps New website service keys → a4-website route slugs. */
export const SERVICE_KEY_TO_SLUG: Record<ServiceKey, string> = {
  bookkeeping: "bookkeeping",
  outsourcing: "outsourcing",
  legal: "legal",
  "vat-payroll": "vat-payroll",
  "audit-assurance": "audit-assurance",
  "audit-readiness": "audit-readiness",
  "accounting-finance": "accounting-finance",
  "tax-compliance": "tax-compliance",
  "corporate-csp": "corporate-csp-services",
  "regulated-licensing": "regulated-licensing",
  "advisory-growth": "advisory-growth",
  "company-structure": "company-structure-corporate-changes",
  "liquidation-winddown": "liquidation-wind-down",
  "international-structures": "international-business-structuring-expansion",
  "group-consolidation": "group-consolidation",
  "banking-payments": "banking-payments-support",
  "crypto-digital-assets": "crypto-digital-assets",
  "corporate-transactions": "corporate-transactions",
};

export const SLUG_TO_SERVICE_KEY: Record<string, ServiceKey> = Object.fromEntries(
  (Object.entries(SERVICE_KEY_TO_SLUG) as [ServiceKey, string][]).map(([key, slug]) => [slug, key])
) as Record<string, ServiceKey>;

export interface ServiceCard {
  icon: string;
  t: string;
  s: string;
}

export interface A4SiteService {
  key: ServiceKey;
  slug: string;
  name: string;
  icon: string;
  lead: string;
  intro: string;
  cards: ServiceCard[];
  included: string[];
  who: string;
  related: ServiceKey[];
}

export interface ServiceDetailBlock {
  detail: string;
  bullets: [string, string][];
}

export const A4_SERVICES_DATA: Record<ServiceKey, A4SiteService> = {
  bookkeeping: {
    key: "bookkeeping",
    slug: SERVICE_KEY_TO_SLUG.bookkeeping,
    name: "Bookkeeping",
    icon: "receipt-text",
    lead: "Automated, audit-grade monthly bookkeeping reviewed by qualified accountants — your records reconciled, referenced and ready for any auditor, lender or regulator, all year round.",
    intro: "We keep books the way an auditor expects to find them. Automation captures and posts the documents; qualified accountants review every month against the standard of evidence an ISA audit demands.",
    cards: [
      { icon: "scan-line", t: "Document capture & OCR", s: "Invoices and receipts uploaded to your portal are read, extracted and posted automatically — coded consistently and VAT-ready, with the source document attached to every entry." },
      { icon: "refresh-cw", t: "Bank reconciliations", s: "Every bank, EMI and card account reconciled to the ledger each month — differences investigated, not carried forward." },
      { icon: "badge-check", t: "Reviewed, at a fixed price", s: "A qualified accountant reviews the postings and passes the necessary journals every period — on a fixed monthly fee through Xero, QuickBooks or Sage." },
    ],
    included: ["Document capture & OCR posting", "Monthly bank reconciliations", "VAT-ready transaction coding", "Xero, QuickBooks & Sage expertise", "Accountant review & journals", "Fixed monthly pricing"],
    who: "Businesses that want their books done properly without doing them — and never want a VAT inspection, audit or due-diligence review to find a backlog.",
    related: ["accounting-finance", "audit-readiness", "tax-compliance"],
  },
  outsourcing: {
    key: "outsourcing",
    slug: SERVICE_KEY_TO_SLUG.outsourcing,
    name: "Outsourcing",
    icon: "workflow",
    lead: "A complete outsourced finance function for Malta businesses — bookkeeping, management accounts, VAT, payroll, fractional CFO and year-end statutory work, run with an auditor's discipline.",
    intro: "One dedicated A4 team replaces the patchwork: every ledger reconciled, every CFR and MBR deadline tracked, every report reviewed before it reaches you — all through one secure portal.",
    cards: [
      { icon: "users", t: "Your dedicated team", s: "Accountants, payroll and tax specialists assigned to your business — with a fractional CFO layer when decisions need senior judgement." },
      { icon: "layout-dashboard", t: "One portal, full visibility", s: "Bookkeeping, VAT, payroll and reporting delivered through one workspace — deadlines, progress and documents always in view." },
      { icon: "shield-check", t: "An auditor's discipline", s: "Month-end closes run like audit files: reconciled, evidenced and reviewed — so year-end statutory accounts and audit are a formality, not a project." },
    ],
    included: ["Monthly bookkeeping & reconciliations", "Management accounts & commentary", "VAT returns & CFR filings", "Payroll, FS5s & SSC compliance", "Fractional CFO support", "Year-end GAPSME / IFRS statements"],
    who: "Growing Malta businesses that have outgrown a part-time bookkeeper but aren't ready to build an in-house finance team — and groups consolidating their back office.",
    related: ["bookkeeping", "advisory-growth", "accounting-finance"],
  },
  legal: {
    key: "legal",
    slug: SERVICE_KEY_TO_SLUG.legal,
    name: "Legal Services",
    icon: "scale",
    lead: "Corporate legal support coordinated with our audit, tax and corporate teams — agreements, governance and regulatory documentation delivered through verified professional firms.",
    intro: "Legal work lands best when it's aligned with the numbers. Through verified professional firms in our network, we coordinate legal advice with the audit, tax and corporate picture — so documents, filings and structures all tell the same story.",
    cards: [
      { icon: "book-marked", t: "Company law advisory", s: "Advice on Companies Act obligations, directors' duties and shareholder rights — grounded in how the MBR and regulators actually apply them." },
      { icon: "file-signature", t: "Shareholder & commercial agreements", s: "Shareholder agreements, service contracts and commercial terms drafted to reflect the structure and tax position we already manage for you." },
      { icon: "shield-check", t: "Governance & regulatory documentation", s: "Board charters, policies and the compliance documentation regulated and audited entities are expected to evidence." },
    ],
    included: ["Company law advisory", "Shareholder agreements", "Commercial contracts & terms", "Corporate governance documentation", "Regulatory & compliance documents", "Coordination with audit & tax teams"],
    who: "Companies that want legal documents consistent with their accounts, structure and filings — delivered through one coordinated engagement instead of three unconnected advisors.",
    related: ["corporate-csp", "company-structure", "regulated-licensing"],
  },
  "vat-payroll": {
    key: "vat-payroll",
    slug: SERVICE_KEY_TO_SLUG["vat-payroll"],
    name: "VAT & Payroll",
    icon: "receipt-euro",
    lead: "VAT returns filed with the CFR and payroll run with FS5s, payslips and SSC compliance — every figure reviewed with an auditor's discipline before it's submitted.",
    intro: "VAT and payroll are where small errors compound into penalties. We run both on a fixed calendar: postings reconciled, returns reviewed, submissions evidenced — every period.",
    cards: [
      { icon: "receipt-text", t: "VAT registration & returns", s: "VAT registration, periodic returns and recapitulative statements prepared from reconciled ledgers and filed with the CFR on time." },
      { icon: "search-check", t: "VAT compliance reviews", s: "Periodic reviews of coding, input claims and partial attribution — finding exposure before an inspection does." },
      { icon: "users", t: "Payroll, end to end", s: "Payslips, FS5 submissions, SSC contributions and FS3/FS7 year-end forms — plus employee onboarding handled properly from day one." },
    ],
    included: ["VAT registration & periodic returns", "EC sales & recapitulative statements", "VAT compliance reviews", "Monthly payslips & FS5 submissions", "SSC compliance & year-end FS3 / FS7", "Employee onboarding & terminations"],
    who: "Employers and VAT-registered businesses that want both obligations off their desk and defensible on inspection — from first hire to multi-entity payrolls.",
    related: ["bookkeeping", "tax-compliance", "outsourcing"],
  },
  "audit-assurance": {
    key: "audit-assurance",
    slug: SERVICE_KEY_TO_SLUG["audit-assurance"],
    name: "Audit & Assurance",
    icon: "file-check-2",
    lead: "Statutory audits of GAPSME and IFRS financial statements, signed by a licensed Malta audit firm — with the independence and rigour regulators, banks and shareholders expect.",
    intro: "Assurance is our core discipline, not a sideline. Every engagement is planned around risk, executed to ISA standards and reviewed before a licensed auditor signs.",
    cards: [
      { icon: "scale", t: "Statutory audit", s: "Independent audits of financial statements prepared under GAPSME or IFRS, delivered on time for MBR and CFR deadlines and signed by a licensed audit firm." },
      { icon: "search-check", t: "Reviews & agreed-upon procedures", s: "Independent reviews and agreed-upon procedures where a full audit isn't required — scoped precisely, reported clearly." },
      { icon: "landmark", t: "Assurance for stakeholders", s: "Assurance reports for regulators, banks, grant bodies and investors — evidence-backed comfort on the numbers that matter." },
    ],
    included: ["Risk-based audit planning & materiality", "ISA-compliant fieldwork & documentation", "GAPSME / IFRS disclosure review", "Signed audit opinion by a licensed firm", "Management letter with practical findings", "MBR & CFR filing support"],
    who: "Every Maltese company required to file audited financial statements — and any business whose bank, regulator or investors need independent comfort on its numbers.",
    related: ["audit-readiness", "group-consolidation", "regulated-licensing"],
  },
  "audit-readiness": {
    key: "audit-readiness",
    slug: SERVICE_KEY_TO_SLUG["audit-readiness"],
    name: "Audit Readiness",
    icon: "clipboard-check",
    lead: "Walk into your audit prepared. We get your records, reconciliations and schedules to the standard an auditor expects — before fieldwork starts.",
    intro: "As auditors ourselves, we know exactly what gets requested, what gets challenged and what slows an audit down. Readiness work removes the friction before it costs you time and fees.",
    cards: [
      { icon: "stethoscope", t: "Pre-audit health check", s: "A structured review of your ledgers, balances and documentation against what your audit will demand — with a clear remediation list." },
      { icon: "table-2", t: "Reconciliations & schedules", s: "Bank, debtor, creditor and intercompany reconciliations plus the supporting schedules auditors ask for, prepared and referenced." },
      { icon: "git-compare", t: "GAPSME / IFRS gap analysis", s: "We map your accounting policies and disclosures against the framework you report under, and close the gaps before they become findings." },
    ],
    included: ["Pre-audit health check & gap report", "Full balance-sheet reconciliations", "Audit-ready supporting schedules", "Accounting-policy & disclosure review", "Fixed remediation plan with owners", "Liaison between your team and the auditors"],
    who: "Companies facing a first audit, switching auditors, or tired of audits that drag — and finance teams that want fieldwork to take days, not months.",
    related: ["audit-assurance", "accounting-finance"],
  },
  "accounting-finance": {
    key: "accounting-finance",
    slug: SERVICE_KEY_TO_SLUG["accounting-finance"],
    name: "Accounting & Finance",
    icon: "book-open-check",
    lead: "Audit-grade bookkeeping and reporting, reviewed by accountants — so your records stand up to scrutiny all year, not just at year-end.",
    intro: "We keep your books the way an auditor wants to find them: reconciled, referenced and ready. Automation does the processing; qualified accountants review every period.",
    cards: [
      { icon: "refresh-cw", t: "Bookkeeping, reviewed", s: "Transactions processed through Xero, QuickBooks or Sage and reviewed monthly by accountants who apply an auditor's standard of evidence." },
      { icon: "bar-chart-3", t: "Management accounts", s: "Clear monthly or quarterly reporting — P&L, balance sheet, cash flow and the commentary you need to act on them." },
      { icon: "file-check-2", t: "Year-end financial statements", s: "GAPSME or IFRS financial statements prepared correctly the first time — audit-ready by construction." },
    ],
    included: ["Monthly bookkeeping & ledger maintenance", "Bank & balance-sheet reconciliations", "Management accounts & commentary", "Year-end GAPSME / IFRS statements", "Xero, QuickBooks & Sage expertise", "Accountant review every period"],
    who: "Owner-managed businesses and groups that want clean numbers year-round — and never want an audit, lender or due-diligence team to find a mess.",
    related: ["audit-readiness", "tax-compliance", "advisory-growth"],
  },
  "tax-compliance": {
    key: "tax-compliance",
    slug: SERVICE_KEY_TO_SLUG["tax-compliance"],
    name: "Tax & Compliance",
    icon: "landmark",
    lead: "Corporate and personal tax handled with an auditor's rigour — computed correctly, filed on time, and defensible if the CFR ever asks.",
    intro: "Tax compliance done properly is evidence-based: positions documented, computations reconciled to the accounts, deadlines tracked. That's how we run it.",
    cards: [
      { icon: "calculator", t: "Corporate tax returns", s: "CFR corporate income tax returns prepared from reconciled accounts, with computations and supporting positions documented." },
      { icon: "receipt-text", t: "VAT returns & filings", s: "VAT registration, periodic returns and recapitulative statements — filed accurately each period, with input claims you can defend." },
      { icon: "calendar-clock", t: "Provisional tax & reviews", s: "Provisional tax management, compliance reviews and direct liaison with the CFR when questions arise." },
    ],
    included: ["CFR corporate income tax returns", "Personal tax for directors & shareholders", "VAT returns & EC sales listings", "Provisional tax instalment management", "Tax compliance reviews", "CFR correspondence & liaison"],
    who: "Companies and their principals who want every filing right the first time — including refund-system and cross-border situations that demand documentation.",
    related: ["accounting-finance", "international-structures"],
  },
  "corporate-csp": {
    key: "corporate-csp",
    slug: SERVICE_KEY_TO_SLUG["corporate-csp"],
    name: "Corporate & CSP Services",
    icon: "building-2",
    lead: "Malta company formation and ongoing corporate administration — incorporation, registered office, company secretarial and every MBR obligation, handled.",
    intro: "Corporate housekeeping is where penalties hide. We keep your statutory position as clean as your accounts: registers maintained, returns filed, resolutions documented.",
    cards: [
      { icon: "rocket", t: "Incorporation", s: "Malta company formation end-to-end — constitutive documents, MBR registration, share capital and bank introductions." },
      { icon: "map-pin", t: "Registered office & secretarial", s: "Registered office in Malta, company secretarial support, minutes and resolutions drafted and maintained properly." },
      { icon: "archive", t: "Registers & returns", s: "Statutory registers kept current and MBR annual returns filed within the 42-day window — every year, without chasing." },
    ],
    included: ["Company incorporation at the MBR", "Registered office address", "Company secretarial & minutes", "MBR annual returns", "Statutory registers & BO filings", "Good-standing & corporate certificates"],
    who: "Founders incorporating in Malta, and existing companies that want their statutory file as defensible as their financial one.",
    related: ["company-structure", "banking-payments", "tax-compliance"],
  },
  "regulated-licensing": {
    key: "regulated-licensing",
    slug: SERVICE_KEY_TO_SLUG["regulated-licensing"],
    name: "Regulated & Licensing",
    icon: "shield-check",
    lead: "Support for MFSA-regulated and licence-seeking businesses — applications, regulatory reporting and audits that meet a supervisor's standard.",
    intro: "Regulated entities are judged on evidence: governance, reporting, controls. We build and audit to that standard because it's the one we're held to ourselves.",
    cards: [
      { icon: "file-badge", t: "Licence application support", s: "Financial projections, capital adequacy workings and the accounting infrastructure your MFSA application needs." },
      { icon: "gauge", t: "Regulatory reporting", s: "Periodic returns and financial reporting prepared to the regulator's format and calendar — reviewed before submission." },
      { icon: "scan-search", t: "Audit of regulated entities", s: "Statutory audits of regulated financial statements with the heightened scrutiny, independence and documentation supervision demands." },
    ],
    included: ["MFSA licence application support", "Capital adequacy & own-funds workings", "Periodic regulatory returns", "Compliance framework design", "Audit of regulated financial statements", "Regulator liaison & responses"],
    who: "Investment firms, VFA operators, payment institutions and other MFSA-supervised businesses — at application stage or in ongoing supervision.",
    related: ["audit-assurance", "crypto-digital-assets", "banking-payments"],
  },
  "advisory-growth": {
    key: "advisory-growth",
    slug: SERVICE_KEY_TO_SLUG["advisory-growth"],
    name: "Advisory & Growth",
    icon: "trending-up",
    lead: "CFO-level thinking grounded in audited numbers — budgeting, forecasting and performance reporting you can take to a board or a bank.",
    intro: "Advice is only as good as the numbers underneath it. Ours starts from reconciled, assurance-grade records — so plans, forecasts and KPIs hold up under challenge.",
    cards: [
      { icon: "user-cog", t: "Fractional CFO", s: "Senior finance leadership on demand — cash discipline, board reporting and the financial narrative for your next stage." },
      { icon: "line-chart", t: "Budgeting & forecasting", s: "Driver-based budgets and rolling forecasts reconciled to actuals, so variances mean something and decisions come faster." },
      { icon: "target", t: "KPI & performance reporting", s: "The handful of measures that actually run your business, reported clearly every month with action-oriented commentary." },
    ],
    included: ["Fractional CFO engagement", "Annual budgets & rolling forecasts", "KPI design & monthly packs", "Cash-flow management & runway", "Financing & lender support", "Board & investor reporting"],
    who: "Growing businesses that need finance leadership without a full-time hire — especially ahead of fundraising, expansion or exit.",
    related: ["corporate-transactions", "accounting-finance"],
  },
  "company-structure": {
    key: "company-structure",
    slug: SERVICE_KEY_TO_SLUG["company-structure"],
    name: "Company Structure & Corporate Changes",
    icon: "git-branch",
    lead: "Share transfers, board changes and restructuring — executed precisely, documented properly and filed with the MBR on time.",
    intro: "Corporate changes fail on detail: a missing resolution, a late notification, an unstamped transfer. We run them with audit-grade documentation from start to finish.",
    cards: [
      { icon: "repeat", t: "Share transfers & allotments", s: "Transfers, allotments and capital changes — instruments drafted, duty considered, registers updated, MBR notified." },
      { icon: "users", t: "Director & shareholder changes", s: "Appointments, resignations and shareholder changes handled with the right resolutions and statutory forms." },
      { icon: "network", t: "Restructuring", s: "Reorganisations, mergers and divisions planned with tax and accounting consequences mapped before anything is signed." },
    ],
    included: ["Share transfer & allotment documentation", "Director / secretary appointments & resignations", "Amendments to the M&A", "Capital increases & reductions", "Statutory forms & MBR filings", "Updated registers & minute books"],
    who: "Companies changing ownership, boards or structure — and advisors who need Malta execution they don't have to double-check.",
    related: ["corporate-csp", "corporate-transactions", "international-structures"],
  },
  "liquidation-winddown": {
    key: "liquidation-winddown",
    slug: SERVICE_KEY_TO_SLUG["liquidation-winddown"],
    name: "Liquidation & Wind-Down",
    icon: "power",
    lead: "An orderly exit: members' voluntary liquidation support, final accounts, tax clearance and MBR strike-off — closed out properly, with nothing left hanging.",
    intro: "A company isn't finished until the registrar, the CFR and the VAT department all agree it is. We sequence the whole wind-down so it actually ends.",
    cards: [
      { icon: "list-checks", t: "Voluntary liquidation support", s: "Members' voluntary liquidation managed end-to-end — declarations, appointments, notices and the statutory sequence done right." },
      { icon: "file-check-2", t: "Final accounts & schemes", s: "Cessation accounts and the liquidator's scheme of distribution prepared to the standard reviewers expect." },
      { icon: "badge-x", t: "Deregistration & strike-off", s: "Final tax returns, VAT deregistration and MBR strike-off — with clearances obtained, not assumed." },
    ],
    included: ["Wind-down planning & sequencing", "Cessation financial statements", "Scheme of distribution support", "Final CFR tax returns & clearance", "VAT deregistration", "MBR strike-off filings"],
    who: "Shareholders closing a solvent company, and groups tidying dormant entities before they generate another year of compliance cost.",
    related: ["corporate-csp", "tax-compliance"],
  },
  "international-structures": {
    key: "international-structures",
    slug: SERVICE_KEY_TO_SLUG["international-structures"],
    name: "International Business Structures",
    icon: "globe",
    lead: "Multi-jurisdiction and holding structures built with substance and compliance in mind — supported across borders through BOKS International.",
    intro: "Structures survive scrutiny when the substance, documentation and reporting behind them are real. We design and maintain them on that basis — nothing that can't be defended.",
    cards: [
      { icon: "layers", t: "Holding & group structuring", s: "Malta holding companies and group design with economic substance, governance and exit routes considered from day one." },
      { icon: "file-search", t: "Transfer-pricing-aware reporting", s: "Intercompany arrangements documented and reported with transfer-pricing requirements in view." },
      { icon: "handshake", t: "Cross-border via BOKS", s: "Coordinated accounting, tax and audit across jurisdictions through our BOKS International membership." },
    ],
    included: ["Structure design & substance review", "Malta holding-company formation", "Intercompany agreements & documentation", "Transfer-pricing-aware reporting", "Cross-border compliance coordination", "BOKS International network access"],
    who: "International founders and groups using Malta within a wider structure — who want it compliant in every jurisdiction it touches.",
    related: ["group-consolidation", "tax-compliance", "corporate-csp"],
  },
  "group-consolidation": {
    key: "group-consolidation",
    slug: SERVICE_KEY_TO_SLUG["group-consolidation"],
    name: "Group & Consolidation",
    icon: "boxes",
    lead: "Consolidated financial statements under GAPSME or IFRS — intercompany balances reconciled, eliminations documented, group audits coordinated.",
    intro: "Consolidation is where group reporting goes wrong: mismatched balances, missed eliminations, late subsidiaries. We run it like an audit file — reconciled and referenced.",
    cards: [
      { icon: "combine", t: "Consolidated statements", s: "Group financial statements prepared under GAPSME or IFRS, with eliminations, NCI and disclosures handled correctly." },
      { icon: "git-merge", t: "Intercompany reconciliation", s: "Intercompany balances and transactions agreed across the group — before they derail the consolidation or the audit." },
      { icon: "users-round", t: "Group audit coordination", s: "Component auditors briefed, instructions issued and timetables managed so the group opinion lands on time." },
    ],
    included: ["GAPSME / IFRS consolidated statements", "Consolidation schedules & eliminations", "Intercompany reconciliation process", "Component reporting packs", "Group audit instructions & coordination", "Group disclosure review"],
    who: "Malta parents and multi-entity groups — local or international — that need a clean consolidation and a coordinated group audit.",
    related: ["international-structures", "audit-assurance"],
  },
  "banking-payments": {
    key: "banking-payments",
    slug: SERVICE_KEY_TO_SLUG["banking-payments"],
    name: "Banking & Payments Support",
    icon: "wallet",
    lead: "Bank account opening and payment-provider onboarding, backed by the KYC documentation banks actually accept — plus reconciliations that keep every account clean.",
    intro: "Banks say yes to well-documented businesses. We prepare your file the way a compliance officer reads it: complete, consistent and evidenced.",
    cards: [
      { icon: "folder-check", t: "Account opening & KYC packs", s: "Business profiles, source-of-funds narratives and document packs prepared for Malta and EU banks." },
      { icon: "credit-card", t: "Payment-provider onboarding", s: "EMI and PSP applications supported with the financial information and compliance answers providers require." },
      { icon: "refresh-cw", t: "Banking reconciliations", s: "Every bank, EMI and processor account reconciled to the ledger — month in, month out." },
    ],
    included: ["Bank account opening support", "KYC / CDD documentation packs", "Source-of-funds & business profiles", "EMI / PSP application support", "Multi-account banking reconciliations", "Ongoing bank correspondence support"],
    who: "New Malta companies that need accounts opened, and businesses whose banking spans multiple institutions and providers.",
    related: ["corporate-csp", "regulated-licensing", "accounting-finance"],
  },
  "crypto-digital-assets": {
    key: "crypto-digital-assets",
    slug: SERVICE_KEY_TO_SLUG["crypto-digital-assets"],
    name: "Crypto & Digital Assets",
    icon: "bitcoin",
    lead: "Accounting, reporting and audit support for digital assets — wallet-level bookkeeping, defensible valuations and VFA-related compliance documentation.",
    intro: "Digital assets fail audits on evidence: ownership, existence, valuation. We account for them so those questions already have answers.",
    cards: [
      { icon: "book-open-check", t: "Digital-asset bookkeeping", s: "Wallet and exchange activity reconciled to the ledger, with cost bases, gains and balances tracked per asset." },
      { icon: "badge-euro", t: "Valuation & reporting", s: "Period-end valuations on documented methodologies, and VFA-related reporting support where Malta's framework applies." },
      { icon: "scan-search", t: "Audit of digital-asset balances", s: "Existence and ownership verification, custody evidence and valuation testing for audit-ready digital-asset balances." },
    ],
    included: ["Wallet & exchange reconciliations", "Per-asset cost basis & gains tracking", "Period-end valuation workings", "VFA-related reporting support", "Audit evidence for digital balances", "Compliance documentation"],
    who: "Businesses holding or transacting in crypto — from treasuries with digital assets to VFA operators under Malta's regime.",
    related: ["regulated-licensing", "audit-assurance"],
  },
  "corporate-transactions": {
    key: "corporate-transactions",
    slug: SERVICE_KEY_TO_SLUG["corporate-transactions"],
    name: "Corporate Transactions",
    icon: "briefcase",
    lead: "Financial due diligence, completion accounts and transaction assurance — independent, evidence-based work for buyers, sellers and their advisors.",
    intro: "Deals turn on numbers someone has to stand behind. We bring audit discipline to transactions: findings evidenced, adjustments quantified, surprises surfaced early.",
    cards: [
      { icon: "search-check", t: "Financial due diligence", s: "Buy-side and vendor due diligence focused on quality of earnings, working capital and the risks that move price." },
      { icon: "file-check-2", t: "Completion accounts", s: "Completion accounts prepared or reviewed against the SPA mechanism — so post-deal adjustments are settled, not litigated." },
      { icon: "shield-check", t: "Transaction assurance", s: "Independent reports and agreed-upon procedures that give lenders, boards and counterparties confidence to close." },
    ],
    included: ["Buy-side & vendor due diligence", "Quality-of-earnings analysis", "Working-capital & net-debt review", "Completion accounts preparation / review", "SPA accounting input", "Transaction-related assurance reports"],
    who: "Buyers, sellers and investors in Malta transactions — and the lawyers and corporate financiers who advise them.",
    related: ["advisory-growth", "audit-assurance", "group-consolidation"],
  },
};

export const A4_SERVICE_DETAILS: Partial<Record<ServiceKey, ServiceDetailBlock>> = {
  "audit-assurance": {
    detail: "Every audit follows the same disciplined arc: we plan around the risks that matter to your business, set materiality deliberately, test the balances and disclosures that carry judgement, and review the file at senior level before any opinion is signed. You see progress throughout, and findings are raised while they can still be addressed — not in the closing meeting.",
    bullets: [
      ["Scope", "Statutory audits under GAPSME or IFRS, independent reviews, agreed-upon procedures and special-purpose assurance reports."],
      ["Process", "Risk-based planning and materiality, evidence-led fieldwork to ISA standards, and senior review before sign-off."],
      ["Deliverables", "The signed auditor's report, a management letter with practical recommendations, and support with MBR and CFR filings."],
      ["Standards", "Performed under International Standards on Auditing, with the independence and quality-management discipline required of a licensed audit firm."],
    ],
  },
  "audit-readiness": {
    detail: "Readiness work follows a simple sequence: we review your records against what the audit will actually request, report the gaps in plain terms, fix or help you fix them, and assemble the supporting file so fieldwork starts from evidence rather than questions. The result is a faster audit, fewer surprises and a lower risk of qualified findings.",
    bullets: [
      ["Scope", "Pre-audit health check, balance-sheet reconciliations, supporting schedules and accounting-policy review."],
      ["Process", "Gap analysis against GAPSME or IFRS, a prioritised remediation plan with clear owners, then preparation of the audit support file."],
      ["Deliverables", "A written readiness report, reconciled schedules referenced to the ledger, and a complete pack for the auditors."],
      ["Timing", "Most effective when started before year-end, so issues are corrected in the right period."],
    ],
  },
  "accounting-finance": {
    detail: "We run a structured monthly close: transactions are processed and coded in your accounting platform, balance-sheet accounts are reconciled, and a qualified accountant reviews the file and posts the adjusting journals before anything is reported. Year-end financial statements then fall out of records that are already clean — not out of a year-end project.",
    bullets: [
      ["Scope", "Bookkeeping, management accounts, year-end financial statements and day-to-day finance support."],
      ["Process", "A monthly close calendar with reconciliations and accountant review, run in Xero, QuickBooks or Sage."],
      ["Deliverables", "A monthly reporting pack with commentary, reconciled ledgers, and GAPSME or IFRS statutory accounts."],
      ["Standards", "Records maintained year-round to the standard of evidence an audit requires."],
    ],
  },
  "tax-compliance": {
    detail: "Tax work starts from reconciled accounts, not estimates. Computations are prepared and documented, positions are supported by reference to the law and published guidance, and every return is reviewed before it is filed. Where the CFR raises questions, we respond with the working papers already in hand.",
    bullets: [
      ["Scope", "Corporate income tax returns, personal tax for directors and shareholders, VAT compliance and provisional tax."],
      ["Process", "Computations prepared from reconciled ledgers, positions documented, and returns reviewed before submission."],
      ["Deliverables", "Filed returns with supporting computations, a deadline calendar, and handling of CFR correspondence."],
      ["Timing", "Provisional tax instalments and filing deadlines managed across the year — not in a year-end rush."],
    ],
  },
  "corporate-csp": {
    detail: "From incorporation onwards we keep the statutory file complete: constitutive documents, registers, resolutions and filings maintained as carefully as the accounts. Routine obligations — annual returns, register updates, beneficial-ownership notifications — run on a calendar, so good standing is the default state rather than an annual scramble.",
    bullets: [
      ["Scope", "Malta company formation, registered office, company secretarial support and statutory registers."],
      ["Process", "Incorporation handled end-to-end, then a compliance calendar covering every recurring MBR obligation."],
      ["Deliverables", "Constitutive documents, maintained registers and minute books, and annual returns filed within the statutory window."],
      ["Compliance", "Beneficial-ownership and statutory notifications kept current as changes occur."],
    ],
  },
  "regulated-licensing": {
    detail: "Regulated work is documentation work. We prepare the financial elements of licence applications, build the reporting cycles supervision expects, and audit regulated financial statements with the heightened scrutiny a supervisor applies. Everything is prepared on the assumption it will be read by the regulator — because it will be.",
    bullets: [
      ["Scope", "MFSA licence application support, periodic regulatory returns and audits of regulated entities."],
      ["Process", "Projections and capital workings prepared to rulebook requirements, with returns reviewed before submission."],
      ["Deliverables", "Application financials, filed regulatory returns and audited financial statements."],
      ["Standards", "Engagements run with the independence and documentation discipline regulated entities are held to."],
    ],
  },
  "advisory-growth": {
    detail: "Advisory runs on a steady cadence rather than ad-hoc opinions: actuals are closed and reconciled, forecasts are updated against them, and the variances drive the conversation. You get senior finance judgement on pricing, cash, funding and growth — grounded in numbers that have already been checked.",
    bullets: [
      ["Scope", "Fractional CFO support, budgeting and forecasting, KPI reporting and financing support."],
      ["Process", "A monthly or quarterly rhythm — close, compare to plan, decide — with board-ready output each cycle."],
      ["Deliverables", "Budgets and rolling forecasts, KPI packs with commentary, and lender or investor reporting."],
      ["Grounding", "Every recommendation traces back to reconciled, assurance-grade records."],
    ],
  },
  "company-structure": {
    detail: "Corporate changes are executed as documented sequences: the commercial intent is confirmed, the tax and duty consequences are mapped, the instruments and resolutions are drafted, and the filings follow in the right order. Registers and minute books are updated as part of the change — never left for later.",
    bullets: [
      ["Scope", "Share transfers and allotments, director and shareholder changes, capital changes and reorganisations."],
      ["Process", "Consequences assessed first, documents drafted and executed, statutory forms filed with the MBR on time."],
      ["Deliverables", "Executed instruments, updated registers and minute books, and confirmation of each registration."],
      ["Care", "Duty, tax and regulatory implications considered before anything is signed."],
    ],
  },
  "liquidation-winddown": {
    detail: "A wind-down is a sequence of clearances, and we run it in order: final trading wound up, cessation accounts prepared, tax and VAT positions closed with the authorities, and the strike-off filed only when every clearance is in hand. Nothing is left open to resurface later.",
    bullets: [
      ["Scope", "Members' voluntary liquidation support, cessation accounts, deregistrations and strike-off."],
      ["Process", "A sequenced closure plan covering the MBR, CFR and VAT department, with clearances obtained at each step."],
      ["Deliverables", "Final financial statements, the scheme of distribution, and confirmation of strike-off."],
      ["Note", "Designed for solvent companies and dormant entities being tidied out of groups."],
    ],
  },
  "international-structures": {
    detail: "Cross-border structures are designed to be defensible: real substance, documented intercompany arrangements and reporting that satisfies each jurisdiction the structure touches. Through our BOKS International membership we coordinate with advisers abroad, so the Malta entity never holds an undocumented position.",
    bullets: [
      ["Scope", "Holding and group structuring, substance reviews, intercompany documentation and cross-border coordination."],
      ["Process", "Design against commercial purpose first, then documentation, then an ongoing compliance calendar per jurisdiction."],
      ["Deliverables", "Structure papers, intercompany agreements and transfer-pricing-aware reporting."],
      ["Network", "Coordinated execution with BOKS International member firms abroad."],
    ],
  },
  "group-consolidation": {
    detail: "Consolidation runs like an audit file: component reporting packs arrive on a timetable, intercompany balances are agreed before eliminations are posted, and the consolidated statements are reviewed against the framework's disclosure requirements. Group audits are coordinated so component work lands when the group opinion needs it.",
    bullets: [
      ["Scope", "Consolidated financial statements, intercompany reconciliation and group audit coordination."],
      ["Process", "Component packs on a fixed timetable, eliminations documented, disclosures reviewed against GAPSME or IFRS."],
      ["Deliverables", "Consolidated statutory accounts with supporting consolidation schedules."],
      ["Coordination", "Component auditors instructed and timetabled around the group opinion."],
    ],
  },
  "banking-payments": {
    detail: "Banks approve files, not stories. We assemble the business profile, source-of-funds narrative and supporting documents a compliance review will ask for, manage the application correspondence, and keep every account reconciled once it is open — so the banking relationship stays as clean as the ledger.",
    bullets: [
      ["Scope", "Bank account opening support, KYC documentation packs, payment-provider onboarding and reconciliations."],
      ["Process", "Documentation assembled to compliance-review standard, with applications managed through to decision."],
      ["Deliverables", "A complete onboarding pack, opened accounts, and monthly multi-account reconciliations."],
      ["Coverage", "Banks, EMIs and payment processors in Malta and across the EU."],
    ],
  },
  "crypto-digital-assets": {
    detail: "Digital-asset accounting is evidence work: wallets and exchange accounts reconciled to the ledger, cost bases tracked per asset, and period-end valuations prepared on a documented methodology. The file is built so existence, ownership and valuation can be demonstrated — to an auditor, a bank or a regulator.",
    bullets: [
      ["Scope", "Wallet and exchange bookkeeping, valuations, audit support and VFA-related reporting."],
      ["Process", "Per-asset reconciliation each period, with valuation workings documented and retained."],
      ["Deliverables", "Reconciled digital-asset ledgers, valuation papers and audit-ready evidence packs."],
      ["Compliance", "Documentation aligned to Malta's VFA framework where it applies."],
    ],
  },
  "corporate-transactions": {
    detail: "Transaction work runs to a deal timetable: scope agreed against the questions that move price, findings evidenced and quantified as fieldwork progresses, and reporting delivered when the deal needs it — not after. The same discipline applies whether we act buy-side, sell-side or for a lender.",
    bullets: [
      ["Scope", "Financial due diligence, completion accounts, SPA accounting input and transaction assurance."],
      ["Process", "Focused fieldwork on quality of earnings, working capital and net debt, with findings flagged early."],
      ["Deliverables", "A due-diligence report, completion accounts preparation or review, and agreed-upon-procedures reports."],
      ["Independence", "Evidence-based findings a counterparty, board or lender can rely on."],
    ],
  },
  bookkeeping: {
    detail: "The monthly cycle is fixed: documents are captured and posted as they arrive, bank and balance-sheet accounts are reconciled, and a qualified accountant reviews the file and posts the correcting journals before the month is closed. Your records stay current, VAT-ready and audit-ready — every month, at a fixed fee.",
    bullets: [
      ["Scope", "Document capture and posting, transaction coding, bank reconciliations and ledger maintenance."],
      ["Process", "Automation handles the processing; a qualified accountant reviews every period before close."],
      ["Deliverables", "Reconciled, VAT-ready ledgers in Xero, QuickBooks or Sage, with source documents attached to entries."],
      ["Pricing", "A fixed monthly fee agreed up front, scaled to document volume."],
    ],
  },
  outsourcing: {
    detail: "An outsourced finance function only works if it runs on a calendar — so ours does. Bookkeeping closes monthly, VAT and payroll file on their statutory dates, management accounts land on the agreed day, and year-end statements are prepared from records that were reviewed all year. One team, one portal, one accountable rhythm.",
    bullets: [
      ["Scope", "Bookkeeping, management accounts, VAT, payroll, fractional CFO support and year-end statutory accounts."],
      ["Process", "A fixed monthly close and filing calendar, run by a dedicated team through your portal."],
      ["Deliverables", "A monthly reporting pack, filed returns, payroll output and GAPSME or IFRS year-end statements."],
      ["Accountability", "One engagement covering the whole finance function, reviewed at every step."],
    ],
  },
  legal: {
    detail: "Legal documents work best when they match the financial reality they govern. Working through verified professional firms, we coordinate drafting with the corporate, tax and accounting picture we already manage — so agreements, resolutions and policies are consistent with the structure, the filings and the numbers.",
    bullets: [
      ["Scope", "Company law advisory, shareholder and commercial agreements, governance and regulatory documentation."],
      ["Process", "Instructions scoped jointly with our corporate and tax teams, with drafts reviewed against the structure."],
      ["Deliverables", "Executed agreements, board and shareholder resolutions, and compliance documentation."],
      ["Delivery", "Provided through verified professional firms, coordinated within one engagement."],
    ],
  },
  "vat-payroll": {
    detail: "Both obligations run on statutory calendars, so we manage them that way: VAT returns prepared from reconciled ledgers and reviewed before filing; payroll run each period with payslips issued, FS5s submitted and SSC accounted for; and the year-end FS3 and FS7 reconciled back to the twelve months that preceded them.",
    bullets: [
      ["Scope", "VAT registration and returns, compliance reviews, payroll processing and employer filings."],
      ["Process", "Fixed monthly and quarterly cycles, with every figure reviewed before submission to the CFR."],
      ["Deliverables", "Filed VAT returns, payslips and FS5s, and reconciled year-end FS3 and FS7 forms."],
      ["Assurance", "Payroll and VAT records maintained to audit standard throughout the year."],
    ],
  },
};

export const A4_SERVICES_LEFT: ServiceKey[] = [
  "accounting-finance",
  "audit-assurance",
  "regulated-licensing",
  "company-structure",
  "international-structures",
  "audit-readiness",
  "banking-payments",
  "bookkeeping",
  // "legal",
];

export const A4_SERVICES_RIGHT: ServiceKey[] = [
  "tax-compliance",
  "corporate-csp",
  "advisory-growth",
  "liquidation-winddown",
  "crypto-digital-assets",
  "group-consolidation",
  "corporate-transactions",
  // "outsourcing",
  "vat-payroll",
];

/** Hidden from nav, footer and /services overview — pages remain reachable by URL. */
export const A4_SERVICES_HIDDEN: ServiceKey[] = ["legal", "outsourcing"];

export const A4_SERVICES_VISIBLE = Object.values(A4_SERVICES_DATA).filter(
  (s) => !A4_SERVICES_HIDDEN.includes(s.key),
);

export const ALL_A4_SERVICE_SLUGS = Object.values(A4_SERVICES_DATA).map((s) => s.slug);

export function getA4SiteServiceBySlug(slug: string): A4SiteService | undefined {
  const key = SLUG_TO_SERVICE_KEY[slug];
  return key ? A4_SERVICES_DATA[key] : undefined;
}

export function serviceHref(slug: string): string {
  return `/services/${slug}`;
}
