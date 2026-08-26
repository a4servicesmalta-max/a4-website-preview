export type ResourceCard = {
  icon: string;
  t: string;
  s: string;
  href: string;
};

/** Primary hub cards from resources.html */
export const RESOURCE_HUB_CARDS: ResourceCard[] = [
  { icon: "newspaper", t: "Insights", s: "Articles and analysis on finance, compliance and running a sharper business.", href: "/insights" },
  { icon: "route", t: "How it works", s: "The five-step journey from first hello to work delivered through your portal.", href: "/how-it-works" },
  { icon: "building-2", t: "About A4", s: "Who we are, why we built A4 and what makes the firm different.", href: "/about" },
  { icon: "help-circle", t: "FAQs", s: "Clear answers on services, delivery, technology and security.", href: "/faq" },
  { icon: "shield-check", t: "Security & compliance", s: "How we protect your data and uphold professional standards.", href: "/security-compliance" },
  { icon: "calculator", t: "Get an instant quote", s: "Request a tailored, no-obligation quote — response within 24 hours.", href: "/quote" },
  { icon: "graduation-cap", t: "CPE & Podcast", s: "Continuing education sessions and conversations with industry guests.", href: "/cpe" },
];

/** Former navbar Resources dropdown links */
export const RESOURCE_NAV_CARDS: ResourceCard[] = [
  { icon: "mail", t: "Contact", s: "Send a message, call the team, or book a free 30-minute call.", href: "/contact" },
  { icon: "bot", t: "Automated Bookkeeping", s: "AI-assisted bookkeeping with human review and a structured client portal.", href: "/automated-bookkeeping" },
  { icon: "file-search", t: "Audit Services", s: "Statutory audit delivered with transparency, structure and qualified review.", href: "/audit-services" },
  { icon: "handshake", t: "Partner Program", s: "Refer clients and earn recurring commission on every engagement.", href: "/partner-program" },
  { icon: "notebook", t: "Bookkeeping", s: "Reliable bookkeeping support for owner-managed and growing businesses.", href: "/bookkeeping" },
  { icon: "map-pin", t: "Accounting Malta", s: "Malta-focused accounting guidance, compliance and practical support.", href: "/accounting-malta" },
  { icon: "sparkles", t: "AI Review", s: "AI-assisted review workflows with professional oversight built in.", href: "/ai-review" },
  { icon: "users", t: "Accounting Agents", s: "Explore accounting agent workflows and how A4 applies them in practice.", href: "/accounting" },
  { icon: "briefcase", t: "Business Agents", s: "Business agent tools and workflows for sharper operational finance.", href: "/business" },
  { icon: "clipboard-check", t: "Auditor Dashboard", s: "Auditor questionnaire and dashboard experience for structured review.", href: "/auditor-questionnaire" },
  { icon: "workflow", t: "How A4 Works", s: "Interactive guide to automation, human review and final deliverables.", href: "/how-a4-works" },
  { icon: "file-search", t: "Audit Outsourcing", s: "Vacei × A4 white-label audit delivery — outsource audits and keep the final say.", href: "/audit-outsourcing" },
  { icon: "wallet", t: "Payroll App", s: "Malta payroll prototype with live 2026 rates — run payroll, manage people and tax forms.", href: "/payroll-app" },
  { icon: "stethoscope", t: "Free check", s: "Free 2-minute accounting health check plus a real AI review of your accounts or financial statements.", href: "/accounting-health-check" },
  // { icon: "git-compare", t: "Reconciliation Hero", s: "Animated landing experience for audit-grade reconciliation and reporting clarity.", href: "/reconciliation-hero" },
];

export const RESOURCE_CARDS: ResourceCard[] = [...RESOURCE_HUB_CARDS, ...RESOURCE_NAV_CARDS];
