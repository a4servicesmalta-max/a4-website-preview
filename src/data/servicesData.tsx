import { ReactNode } from "react";
import { serviceVideosById } from "./video";

export interface ServiceData {
  id: string; // The specific ID/Key for the service
  slug: string; // URL slug
  title: string;
  breadcrumbs: { label: string; href?: string }[];
  description?: ReactNode; // Rich content for the description
  image: string; // Path to the image
  portalImage?: string; // Image for the Portal Feature section (optional)
  portalVariant?: "default" | "technology";
  videoUrl?: string; // Optional service video URL
  featuresSection?: {
    title: string;
    subtitle: string;
    features: {
      title: string;
      items: string[];
    }[];
  };
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

// Unique feature items for each service
const accountingFeatures = [
  {
    title: "Accounting & reporting",
    items: [
      "Online bookkeeping",
      "Accounting and financial management",
      "Management accounts",
      "Financial reporting and analysis",
    ],
  },
  {
    title: "Financial planning & oversight",
    items: [
      "Cash flow monitoring and forecasting",
      "Budgeting and performance tracking",
    ],
  },
  {
    title: "CFO & fractional CFO",
    items: [
      "Financial oversight and guidance",
      "Support for management decision-making",
      "Financial readiness for audit, banking, or investment",
      "Ongoing coordination with accounting and compliance functions",
    ],
  },
];

const taxComplianceFeatures = [
  {
    title: "VAT Services",
    items: [
      "VAT registration and deregistration",
      "Monthly/quarterly VAT return preparation",
      "VAT compliance reviews and optimization",
      "EC Sales List and Intrastat reporting",
    ],
  },
  {
    title: "Payroll & Employment",
    items: [
      "Payroll processing and payslip generation",
      "PAYE and social security contributions",
      "Employment contract compliance",
      "Annual FS3 and FS7 submissions",
    ],
  },
  {
    title: "Regulatory Filings",
    items: [
      "Annual return submissions to Registry of Companies",
      "Tax return preparation and submission",
      "Deadline tracking and compliance monitoring",
      "Authority correspondence management",
    ],
  },
  {
    title: "Who It's For",
    items: [
      "Companies with ongoing tax obligations",
      "Businesses requiring payroll management",
      "Organizations needing compliance support",
      "Companies seeking deadline management",
    ],
  },
];

const auditAssuranceFeatures = [
  {
    title: "Audit Services",
    items: [
      "Statutory audit of financial statements",
      "Independent review engagements",
      "Agreed-upon procedures",
      "Special purpose audits",
    ],
  },
  {
    title: "Assurance Work",
    items: [
      "Financial statement reviews",
      "Due diligence support",
      "Internal control assessments",
      "Compliance audits",
    ],
  },
  {
    title: "Process & Workflow",
    items: [
      "Structured audit workflows through platform",
      "Document management and evidence gathering",
      "Real-time progress tracking",
      "Automated testing and validation",
    ],
  },
  {
    title: "Who It's For",
    items: [
      "Companies requiring statutory audits",
      "Businesses preparing for investment",
      "Organizations needing assurance",
      "Entities with regulatory audit requirements",
    ],
  },
];

const corporateCSPFeatures = [
  {
    title: "CSP core services",
    items: [
      "Registered Office (mandatory) and annual renewal",
      "Company Secretary services (appointment and renewal)",
      "Director services (natural person / corporate director where applicable)",
      "Nominee director / nominee shareholder services (where applicable)",
    ],
  },
  {
    title: "Governance & statutory maintenance",
    items: [
      "Statutory registers maintenance (directors, shareholders, charges)",
      "Beneficial Ownership (UBO) monitoring and updates",
      "MBR filings support (Annual Return A1 and statutory forms)",
      "Company documentation maintenance (resolutions, share certificates, core statutory documents)",
    ],
  },
  {
    title: "Substance & compliance",
    items: [
      "Substance coordination and documentation support",
      "Compliance oversight and readiness support",
      "CSP compliance reviews (as required)",
    ],
  },
  {
    title: "Optional add-ons",
    items: [
      "Registered Office mail handling (scan / forward)",
      "Certified true copies and apostille coordination",
      "Bank liaison support (KYC coordination and confirmations)",
      "Director / officer confirmations and declarations",
    ],
  },
];

const regulatedLicensingFeatures = [
  {
    title: "Licensing Services",
    items: [
      "License application preparation and submission",
      "Renewal management and tracking",
      "Compliance monitoring and reporting",
      "Authority correspondence coordination",
    ],
  },
  {
    title: "Regulatory Support",
    items: [
      "Regulatory framework analysis",
      "Compliance gap assessments",
      "Ongoing compliance monitoring",
      "Regulatory change management",
    ],
  },
  {
    title: "Industries Served",
    items: [
      "Financial services and investment firms",
      "Gaming and gambling operators",
      "Real estate and property developers",
      "Professional services requiring licenses",
    ],
  },
  {
    title: "Who It's For",
    items: [
      "Businesses operating in regulated sectors",
      "Companies requiring formal authorizations",
      "Organizations needing license management",
      "Entities with ongoing regulatory obligations",
    ],
  },
];

const advisoryGrowthFeatures = [
  {
    title: "Business planning & strategy",
    items: [
      "Business plans for bank financing",
      "Business plans for grant applications",
      "Business plans for investor presentations",
      "Internal planning and forecasting",
    ],
  },
  {
    title: "Grants & funding",
    items: [
      "AI grants",
      "Business development grants",
      "Employment and incentive schemes",
      "Grant eligibility assessment and application support",
    ],
  },
  {
    title: "Projects & transactions support",
    items: [
      "Transaction support and coordination",
      "Project-based advisory engagements",
      "Structuring support aligned with regulatory and financial requirements (with external legal advisors where required)",
    ],
  },
];

const companyStructureFeatures = [
  {
    title: "Ownership & capital changes",
    items: [
      "Share transfers",
      "Share capital increases, reductions, and reclassifications",
      "Shareholder changes and updates",
    ],
  },
  {
    title: "Management & company details",
    items: [
      "Director appointments and resignations",
      "Company name changes",
      "Amendments to company objects or memorandum",
    ],
  },
  {
    title: "Restructuring & complex projects",
    items: [
      "Group restructuring",
      "Pre-merger structuring",
      "Re-domiciliation (where applicable)",
      "Cross-border mergers (project-based, multi-stage)",
    ],
  },
];

const liquidationFeatures = [
  {
    title: "Voluntary Liquidation",
    items: [
      "Members' voluntary liquidation (MVL)",
      "Creditors' voluntary liquidation (CVL)",
      "Liquidation planning and execution",
      "Asset realization and distribution",
    ],
  },
  {
    title: "Strike-Off & Dissolution",
    items: [
      "Dormant company strike-off",
      "Voluntary dissolution procedures",
      "Final accounts preparation",
      "Registrar of Companies filings",
    ],
  },
  {
    title: "Wind-Down Services",
    items: [
      "Business closure planning",
      "Employee termination support",
      "Contract termination management",
      "Final compliance and filings",
    ],
  },
  {
    title: "Who It's For",
    items: [
      "Companies ceasing operations",
      "Dormant or inactive companies",
      "Businesses requiring formal liquidation",
      "Groups restructuring or exiting entities",
    ],
  },
];

const internationalStructuringFeatures = [
  {
    title: "Group & holding structures",
    items: [
      "Group and holding company structuring",
      "Shareholding and ownership optimisation",
      "Profit flow and dividend planning within legal frameworks",
      "Substance and governance alignment",
      "Clear documentation and defensible rationale for all structures",
    ],
  },
  {
    title: "International incorporation & expansion",
    items: [
      "Company incorporation in Malta — from €2,000 one-off (one individual shareholder and one director, filed with the MBR)",
      "EU operating companies and subsidiaries",
      "Expansion planning for international operations",
      "Coordination with local advisors where required",
      "Central management of new entities within the wider group structure",
      "Add-ons priced separately: extra shareholders €250 each, extra directors €150 each, VAT and tax registrations €150, bank account assistance €500, registered office €1,200/yr, company secretary €400/yr. All fees exclude VAT.",
    ],
  },
  {
    title: "Banking & payments support",
    items: [
      "Introductions to EU and international banks",
      "EMI and fintech onboarding",
      "Multi-currency account setup",
      "Support for complex or previously rejected banking applications",
      "Banking support integrated with group structure and compliance",
    ],
  },
  {
    title: "Cross-border tax & compliance",
    items: [
      "International tax coordination across group entities",
      "VAT registrations and ongoing VAT compliance",
      "Payroll and employment structuring",
      "Audit coordination across group entities",
      "Holistic planning so tax, operations and reporting stay aligned",
    ],
  },
  {
    title: "Ongoing group management",
    items: [
      "Group accounting oversight",
      "Intercompany tracking and reconciliation",
      "Consolidated visibility across entities",
      "Continuous compliance monitoring",
      "Structures kept manageable, transparent, and compliant as you grow",
    ],
  },
];

const cryptoDigitalAssetsFeatures = [
  {
    title: "Crypto structuring & wealth",
    items: [
      "Review how crypto assets are currently held",
      "Assess personal, company, and group-level structuring",
      "Separate trading, investment, and operational activities",
      "Design structures for lawful tax efficiency and risk management",
      "Align crypto holdings with residence, substance, and governance requirements",
    ],
  },
  {
    title: "Crypto–fiat banking & cash-out",
    items: [
      "Assess crypto activity, transaction history, and risk profile",
      "Prepare clients for bank or EMI onboarding",
      "Support documentation, explanations, and compliance readiness",
      "Introduce suitable EU and international banks or EMIs",
      "Assist with structuring crypto to fiat conversion flows and ongoing banking support",
    ],
  },
  {
    title: "Accounting, tax & compliance",
    items: [
      "Accounting treatment of crypto assets and transactions",
      "Tax reporting aligned with applicable rules and classifications",
      "VAT considerations where applicable",
      "Audit coordination where crypto exposure exists",
      "Documentation and record keeping suitable for future review",
    ],
  },
];

const auditReadinessFeatures = [
  {
    title: "Financial records",
    items: [
      "Review of bookkeeping and accounting records",
      "Assessment of period-end adjustments and balances",
      "Identification of gaps, inconsistencies, or unsupported figures",
      "Alignment between trial balance, management accounts, and statutory formats",
      "Financial data made complete, consistent, and ready for audit review",
    ],
  },
  {
    title: "Documentation & evidence",
    items: [
      "Review of supporting documentation for key balances",
      "Structuring of audit-ready document files",
      "Mapping of evidence to financial statement line items",
      "Identification of missing or weak support",
      "Reduced time spent responding to audit queries and follow‑ups",
    ],
  },
  {
    title: "Corporate & compliance alignment",
    items: [
      "Review of statutory and corporate records",
      "Alignment of share capital, ownership, and governance documentation",
      "Confirmation of consistency between corporate records and financial statements",
      "Compliance readiness checks where applicable",
      "Early resolution of common corporate vs financial misalignments",
    ],
  },
  {
    title: "Internal controls & process",
    items: [
      "High-level review of accounting and approval processes",
      "Identification of control gaps affecting audit risk",
      "Practical recommendations to strengthen documentation and approval trails",
      "Focus on changes that reduce audit issues, not theoretical controls",
    ],
  },
  {
    title: "Pre-audit issue resolution",
    items: [
      "Identification of potential audit findings in advance",
      "Support in resolving issues before audit fieldwork",
      "Coordination with management on corrective actions",
      "Documentation of resolutions for audit reference",
    ],
  },
];

const groupConsolidationFeatures = [
  {
    title: "Group structure & reporting",
    items: [
      "Review of group structure and entity relationships",
      "Definition of group reporting requirements",
      "Alignment of accounting policies across entities",
      "Establishment of consolidation methodology",
      "Consistent, repeatable approach to group reporting",
    ],
  },
  {
    title: "Intercompany accounting",
    items: [
      "Identification of intercompany transactions and balances",
      "Coordination of intercompany agreements and flows",
      "Reconciliation of intercompany balances across entities",
      "Resolution of mismatches and inconsistencies",
      "Clear intercompany tracking to support audits and lenders",
    ],
  },
  {
    title: "Group consolidation",
    items: [
      "Preparation of consolidated financial information",
      "Elimination of intercompany balances and transactions",
      "Consolidation across multiple currencies where applicable",
      "Support for group management reporting",
      "Consolidation outputs aligned with underlying entity data",
    ],
  },
  {
    title: "Ongoing group oversight",
    items: [
      "Periodic group-level review of entity reporting",
      "Monitoring of changes affecting consolidation",
      "Coordination with local accounting teams or advisors",
      "Continuous improvement of group reporting processes",
    ],
  },
];

const bankingPaymentsFeatures = [
  {
    title: "Banking readiness",
    items: [
      "Review of business activity, structure, and risk profile",
      "Assessment of banking challenges or prior rejections",
      "Identification of suitable banking or payment routes",
      "Alignment of business model with banking expectations",
      "Realistic positioning before any applications are made",
    ],
  },
  {
    title: "Bank & EMI introductions",
    items: [
      "Introductions to EU and international banks",
      "Introductions to electronic money institutions and fintech providers",
      "Coordination of onboarding processes",
      "Support throughout the application lifecycle",
      "Introductions based on suitability and jurisdiction (approvals remain at bank discretion)",
    ],
  },
  {
    title: "Documentation & compliance",
    items: [
      "Preparation of KYC and onboarding documentation",
      "Coordination of business explanations and supporting narratives",
      "Alignment of corporate, accounting, and tax documentation",
      "Support for responding to follow-up queries from institutions",
      "Well‑prepared documentation to improve onboarding efficiency",
    ],
  },
  {
    title: "Payment flows & operations",
    items: [
      "Structuring of incoming and outgoing payment flows",
      "Support for multi-currency account setups",
      "Coordination of payment processing solutions",
      "Ongoing support for operational banking requirements",
    ],
  },
  {
    title: "Banking compliance support",
    items: [
      "Support with periodic bank reviews and updates",
      "Coordination of information requests",
      "Assistance with changes to activity or structure",
      "Ongoing documentation maintenance to reduce account risk",
    ],
  },
];

const corporateTransactionsFeatures = [
  {
    title: "Ownership & shareholding",
    items: [
      "Share transfers between individuals or entities",
      "Changes to ownership percentages",
      "Entry or exit of shareholders",
      "Capital increases, reductions, and reclassifications",
      "All ownership changes documented, filed, and aligned with records",
    ],
  },
  {
    title: "Corporate changes & amendments",
    items: [
      "Director appointments and resignations",
      "Changes to company name or registered details",
      "Amendments to company objects or memorandum",
      "Updates to governance and control structures",
      "Consistency maintained across statutory, accounting, and compliance records",
    ],
  },
  {
    title: "Restructuring & strategic transactions",
    items: [
      "Group restructurings",
      "Pre-transaction structuring support",
      "Preparation for mergers, acquisitions, or disposals",
      "Cross-border transaction coordination",
      "Coordination alongside external legal and tax advisors where required",
    ],
  },
  {
    title: "Transaction coordination",
    items: [
      "Preparation and review of corporate documentation",
      "Coordination of filings with authorities",
      "Liaison with advisors, shareholders, and counterparties",
      "Tracking of transaction milestones and completion steps",
      "Efficient, well‑documented transaction execution",
    ],
  },
];

export const servicesData: ServiceData[] = [
  {
    id: "accounting-finance",
    slug: "accounting-finance",
    title: "Accounting & Finance",
    breadcrumbs: [
      { label: "Services" },
      { label: "Accounting & Finance" },
    ],
    image: "/assets/images/Frame 1618872606.png",
    videoUrl: serviceVideosById["accounting-finance"],
    portalImage: "/assets/images/Frame 1618872799.png",
    portalVariant: "technology",
    description: (
      <>
        <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-3">
          What It Is
        </h3>
        <p className="mb-4 text-gray leading-[26px]">
          Ongoing Accounting &amp; Finance support for your business – from bookkeeping to senior financial oversight.
        </p>
        <p className="mb-4 text-gray leading-[26px]">
          A4 manages accounting, reporting, and CFO support so your numbers stay accurate, timely, and clear.
        </p>
        <p className="mb-6 text-gray leading-[26px]">
          Work is fully managed by A4 and delivered through your client portal.
        </p>
      </>
    ),
    featuresSection: {
      title: "What we cover in Accounting & Finance",
      subtitle: "Request a tailored quote based on your accounting, reporting, and CFO needs.",
      features: accountingFeatures,
    },
  },
  {
    id: "tax-compliance",
    slug: "tax-compliance",
    title: "Tax & Compliance",
    breadcrumbs: [
      { label: "Services" },
      { label: "Tax & Compliance" },
    ],
    image: "/assets/images/placeholder.png", // Placeholder
    videoUrl: serviceVideosById["tax-compliance"],
    portalImage: "/assets/images/Frame 1618872799.png",
    portalVariant: "technology",
    description: (
      <>
        <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-3">
          What It Is
        </h3>
        <p className="mb-4 text-gray leading-[26px]">
          Ongoing support for your business tax, payroll, and statutory filings.
        </p>
        <p className="mb-4 text-gray leading-[26px]">
          A4 manages VAT, payroll, registrations, and key deadlines so obligations are handled correctly and on time.
        </p>
        <p className="text-gray leading-[26px]">
          Everything is coordinated through your client portal for clear tracking and peace of mind.
        </p>
      </>
    ),
    featuresSection: {
      title: "Complete tax and compliance management",
      subtitle: "Get a quote based on your VAT, payroll, and filing requirements",
      features: taxComplianceFeatures,
    },
  },
  {
    id: "audit-assurance",
    slug: "audit-assurance",
    title: "Audit & Assurance",
    breadcrumbs: [
      { label: "Services" },
      { label: "Audit & Assurance" },
    ],
    image: "/assets/images/Frame 1618872609.png",
    videoUrl: serviceVideosById["audit-assurance"],
    portalImage: "/assets/images/Frame 1618872799.png",
    portalVariant: "default",
    description: (
      <>
        <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-3">
          What It Is
        </h3>
        <p className="mb-4 text-gray leading-[26px]">
          Audit and Assurance services cover statutory audits and structured
          financial reviews.
        </p>
        <p className="mb-4 text-gray leading-[26px]">
          A4 delivers audits through a clear, organised process that provides
          visibility, predictable timelines and documented outcomes.
        </p>
        <p className="text-gray leading-[26px]">
          Audit work is coordinated by A4 and supported by structured
          workflows through the platform, minimizing disruption to your operations.
        </p>
      </>
    ),
    featuresSection: {
      title: "Structured audit and assurance services",
      subtitle: "Request a quote based on your audit requirements and engagement scope",
      features: auditAssuranceFeatures,
    },
  },
  {
    id: "corporate-csp-services",
    slug: "corporate-csp-services",
    title: "Corporate & CSP Services",
    breadcrumbs: [
      { label: "Services" },
      { label: "Corporate & CSP Services" },
    ],
    image: "/assets/images/placeholder.png", // Placeholder
    videoUrl: serviceVideosById["corporate-csp-services"],
    portalImage: "/assets/images/Frame 1618872799.png",
    portalVariant: "default",
    description: (
      <>
        <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-3">
          What It Is
        </h3>
        <p className="mb-4 text-gray leading-[26px]">
          Ongoing corporate services for Malta companies, including registered office and statutory support.
        </p>
        <p className="mb-4 text-gray leading-[26px]">
          A4 keeps your company maintained, compliant, and documented throughout the year.
        </p>
        <p className="mb-6 text-gray leading-[26px]">
          All work is delivered through a structured process and client portal.
        </p>
      </>
    ),
    featuresSection: {
      title: "What we cover in Corporate & CSP Services",
      subtitle: "Request a tailored quote based on the level of corporate administration required.",
      features: corporateCSPFeatures,
    },
  },
  {
    id: "regulated-licensing",
    slug: "regulated-licensing",
    title: "Regulated & Licensing",
    breadcrumbs: [
      { label: "Services" },
      { label: "Regulated & Licensing" },
    ],
    image: "/assets/images/placeholder.png", // Placeholder
    videoUrl: serviceVideosById["regulated-licensing"],
    portalImage: "/assets/images/Frame 1618872799.png",
    portalVariant: "default",
    description: (
      <>
        <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-3">
          What It Is
        </h3>
        <p className="mb-4 text-gray leading-[26px]">
          Support for businesses that operate in regulated environments or require formal licences.
        </p>
        <p className="mb-4 text-gray leading-[26px]">
          A4 manages licence applications, renewals, and key regulatory submissions with authorities.
        </p>
        <p className="mb-6 text-gray leading-[26px]">
          Work is delivered through clear, structured workflows.
        </p>
      </>
    ),
    featuresSection: {
      title: "Regulated & licensing support",
      subtitle: "Request a quote based on your licensing and regulatory requirements.",
      features: regulatedLicensingFeatures,
    },
  },
  {
    id: "advisory-growth",
    slug: "advisory-growth",
    title: "Advisory & Growth",
    breadcrumbs: [
      { label: "Services" },
      { label: "Advisory & Growth" },
    ],
    image: "/assets/images/placeholder.png", // Placeholder
    videoUrl: serviceVideosById["advisory-growth"],
    portalImage: "/assets/images/Frame 1618872799.png",
    portalVariant: "default",
    description: (
      <>
        <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-3">
          What It Is
        </h3>
        <p className="mb-4 text-gray leading-[26px]">
          Advisory &amp; Growth support for businesses beyond day-to-day compliance.
        </p>
        <p className="mb-4 text-gray leading-[26px]">
          A4 helps you plan, grow, and navigate key decisions with financial and regulatory aspects aligned.
        </p>
        <p className="mb-6 text-gray leading-[26px]">
          Work is delivered alongside your core accounting, tax, corporate, and audit setup for consistency.
        </p>
      </>
    ),
    featuresSection: {
      title: "Advisory & growth services",
      subtitle: "Request a quote or discuss advisory and growth support for your business.",
      features: advisoryGrowthFeatures,
    },
  },
  {
    id: "company-structure-corporate-changes",
    slug: "company-structure-corporate-changes",
    title: "Company Structure & Corporate Changes",
    breadcrumbs: [
      { label: "Services" },
      { label: "Company Structure & Corporate Changes" },
    ],
    image: "/assets/images/placeholder.png", // Placeholder
    videoUrl: serviceVideosById["company-structure-corporate-changes"],
    portalImage: "/assets/images/Frame 1618872799.png",
    portalVariant: "default",
    description: (
      <>
        <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-3">
          What It Is
        </h3>
        <p className="mb-4 text-gray leading-[26px]">
          Project-based support for changes to your company’s legal, ownership, or management structure.
        </p>
        <p className="mb-4 text-gray leading-[26px]">
          A4 prepares documentation, coordinates filings, and ensures each change is compliant and properly recorded.
        </p>
        <p className="mb-6 text-gray leading-[26px]">
          This is separate from ongoing Corporate (CSP) Services and handled as a defined project.
        </p>
      </>
    ),
    featuresSection: {
      title: "What we cover in Company Structure & Corporate Changes",
      subtitle: "Request a quote based on the specific corporate change or project.",
      features: companyStructureFeatures,
    },
  },
  {
    id: "liquidation-wind-down",
    slug: "liquidation-wind-down",
    title: "Liquidation & Wind-Down",
    breadcrumbs: [
      { label: "Services" },
      { label: "Liquidation & Wind-Down" },
    ],
    image: "/assets/images/placeholder.png", // Placeholder
    videoUrl: serviceVideosById["liquidation-wind-down"],
    portalImage: "/assets/images/Liquidation Dashboard.png",
    portalVariant: "default",
    description: (
      <>
        <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-3">
          What It Is
        </h3>
        <p className="mb-4 text-gray leading-[26px]">
          Support for companies that are closing, restructuring, or no longer operating.
        </p>
        <p className="mb-6 text-gray leading-[26px]">
          A4 manages the liquidation or wind-down process so statutory requirements and filings are completed correctly.
        </p>
      </>
    ),
    featuresSection: {
      title: "Complete liquidation and wind-down services",
      subtitle: "Request a quote based on the type of liquidation or wind-down required",
      features: liquidationFeatures,
    },
  },
  {
    id: "international-business-structuring-expansion",
    slug: "international-business-structuring-expansion",
    title: "International Business Structures",
    breadcrumbs: [
      { label: "Services" },
      { label: "International Business Structures " },
    ],
    image: "/assets/images/placeholder.png",
    videoUrl: serviceVideosById["international-business-structuring-expansion"],
    portalImage: "/assets/images/Frame 1618872799.png",
    portalVariant: "default",
    description: (
      <>
        <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-3">
          What It Is
        </h3>
        <p className="mb-4 text-gray leading-[26px]">
          Support for designing and managing international business structures.
        </p>
        <p className="mb-4 text-gray leading-[26px]">
          A4 helps you set up and coordinate group structures, entities, and banking in a compliant, tax-aware way.
        </p>
        <p className="mb-4 text-gray leading-[26px]">
          Work is coordinated through the A4 portal so you can see and manage cross-border structures in one place.
        </p>
      </>
    ),
    featuresSection: {
      title: "Our international structuring services",
      subtitle: "Discuss your international structure or request a quote through one controlled portal.",
      features: internationalStructuringFeatures,
    },
    primaryCtaText: "Discuss My International Structure",
    primaryCtaHref: "/quote",
    secondaryCtaText: "Request a Quote",
    secondaryCtaHref: "/quote",
  },
  {
    id: "crypto-digital-assets",
    slug: "crypto-digital-assets",
    title: "Crypto & Digital Assets",
    breadcrumbs: [
      { label: "Services" },
      { label: "Crypto & Digital Assets" },
    ],
    image: "/assets/images/placeholder.png",
    videoUrl: serviceVideosById["crypto-digital-assets"],
    portalImage: "/assets/images/Frame 1618872799.png",
    portalVariant: "default",
    description: (
      <>
        <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-3">
          What It Is
        </h3>
        <p className="mb-4 text-gray leading-[26px]">
          Support for structuring, banking, and compliance around crypto and digital asset activity.
        </p>
        <p className="mb-4 text-gray leading-[26px]">
          A4 helps you align crypto holdings with lawful tax structuring, banking access, and compliance requirements.
        </p>
      </>
    ),
    featuresSection: {
      title: "Crypto & digital asset structuring services",
      subtitle: "Discuss your crypto structure or request a quote using the same secure process.",
      features: cryptoDigitalAssetsFeatures,
    },
    primaryCtaText: "Discuss My Crypto Structure",
    primaryCtaHref: "/quote",
    secondaryCtaText: "Request a Quote",
    secondaryCtaHref: "/quote",
  },
  {
    id: "audit-readiness",
    slug: "audit-readiness",
    title: "Audit Readiness",
    breadcrumbs: [
      { label: "Services" },
      { label: "Audit Readiness" },
    ],
    image: "/assets/images/placeholder.png",
    videoUrl: serviceVideosById["audit-readiness"],
    portalImage: "/assets/images/Frame 1618872609.png",
    portalVariant: "default",
    description: (
      <>
        <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-3">
          What It Is
        </h3>
        <p className="mb-4 text-gray leading-[26px]">
          Preparation support so your records and documentation are ready before the audit starts.
        </p>
        <p className="mb-4 text-gray leading-[26px]">
          A4 reviews records, documentation, and processes so audits are smoother, faster, and less disruptive.
        </p>
      </>
    ),
    featuresSection: {
      title: "What we cover in audit readiness",
      subtitle: "Prepare for audit using one structured process coordinated through the A4 portal.",
      features: auditReadinessFeatures,
    },
    primaryCtaText: "Prepare for Audit",
    primaryCtaHref: "/quote",
    secondaryCtaText: "Request a Quote",
    secondaryCtaHref: "/quote",
  },
  {
    id: "group-consolidation",
    slug: "group-consolidation",
    title: "Group & Consolidation",
    breadcrumbs: [
      { label: "Services" },
      { label: "Group & Consolidation" },
    ],
    image: "/assets/images/placeholder.png",
    videoUrl: serviceVideosById["group-consolidation"],
    portalImage: "/assets/images/Frame 1618872799.png",
    portalVariant: "default",
    description: (
      <>
        <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-3">
          What It Is
        </h3>
        <p className="mb-4 text-gray leading-[26px]">
          Group &amp; Consolidation support for businesses with multiple entities.
        </p>
        <p className="mb-4 text-gray leading-[26px]">
          A4 coordinates group reporting, intercompany alignment, and consolidation so information is consistent and usable.
        </p>
      </>
    ),
    featuresSection: {
      title: "What we cover in group & consolidation",
      subtitle: "Discuss group reporting or request a quote for group-level support.",
      features: groupConsolidationFeatures,
    },
    primaryCtaText: "Discuss Group Reporting",
    primaryCtaHref: "/quote",
    secondaryCtaText: "Request a Quote",
    secondaryCtaHref: "/quote",
  },
  {
    id: "banking-payments-support",
    slug: "banking-payments-support",
    title: "Banking & Payments Support",
    breadcrumbs: [
      { label: "Services" },
      { label: "Banking & Payments Support" },
    ],
    image: "/assets/images/placeholder.png",
    videoUrl: serviceVideosById["banking-payments-support"],
    portalImage: "/assets/images/Frame 1618872799.png",
    portalVariant: "default",
    description: (
      <>
        <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-3">
          What It Is
        </h3>
        <p className="mb-4 text-gray leading-[26px]">
          Support for accessing and maintaining reliable banking and payment solutions.
        </p>
        <p className="mb-4 text-gray leading-[26px]">
          A4 prepares documentation, coordinates onboarding, and supports ongoing banking and payments requirements.
        </p>
      </>
    ),
    featuresSection: {
      title: "What we cover in banking & payments support",
      subtitle: "Discuss banking support or request a quote using one structured process.",
      features: bankingPaymentsFeatures,
    },
    primaryCtaText: "Discuss Banking Support",
    primaryCtaHref: "/quote",
    secondaryCtaText: "Request a Quote",
    secondaryCtaHref: "/quote",
  },
  {
    id: "corporate-transactions",
    slug: "corporate-transactions",
    title: "Corporate Transactions",
    breadcrumbs: [
      { label: "Services" },
      { label: "Corporate Transactions" },
    ],
    image: "/assets/images/placeholder.png",
    videoUrl: serviceVideosById["corporate-transactions"],
    portalImage: "/assets/images/Frame 1618872799.png",
    portalVariant: "default",
    description: (
      <>
        <h3 className="text-sm font-semibold text-heading uppercase tracking-wide mb-3">
          What It Is
        </h3>
        <p className="mb-4 text-gray leading-[26px]">
          Support for defined corporate transactions such as ownership changes, restructurings, and other one-off events.
        </p>
        <p className="mb-4 text-gray leading-[26px]">
          A4 coordinates documentation, filings, and stakeholders so each transaction is executed accurately and clearly.
        </p>
      </>
    ),
    featuresSection: {
      title: "What we cover in corporate transactions",
      subtitle: "Discuss a corporate transaction or request a quote for a defined project.",
      features: corporateTransactionsFeatures,
    },
    primaryCtaText: "Discuss a Corporate Transaction",
    primaryCtaHref: "/quote",
    secondaryCtaText: "Request a Quote",
    secondaryCtaHref: "/quote",
  },
];

export const getServiceBySlug = (slug: string) => {
  return servicesData.find((service) => service.slug === slug);
};
