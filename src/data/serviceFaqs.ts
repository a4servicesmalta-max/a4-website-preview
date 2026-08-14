/**
 * FAQ copy for the audit and accounting landing pages.
 *
 * Lives outside the "use client" components on purpose: the page files render
 * these into FAQPage JSON-LD on the server, and a value exported from a client
 * module is a client reference in the RSC graph, not the array itself.
 */

export type Faq = { q: string; a: string };

export const AUDIT_FAQS: Faq[] = [
  {
    q: "Does my company really need an audit?",
    a: "In Malta, yes — almost all companies must file audited financial statements annually, regardless of turnover or size. If you are unsure about your specific obligations, we confirm them on a quick call.",
  },
  {
    q: "How is the audit fee set?",
    a: "Your sector, transaction volume and company size set the scope, and the calculator above prices it from exactly those drivers — every euro itemised. The fee is fixed after a short scoping call and there are no hourly surprises.",
  },
  {
    q: "Why upload financial statements instead of answering the questions?",
    a: "Because we actually read them. The file runs through our review engine — disclosure, consistency and casting checks — so you get a findings report as well as a sharper fee. Sending a prior-year file also de-risks our planning, and that saving comes off your quote.",
  },
  {
    q: "Can you take over from our current auditor?",
    a: "Yes. We handle the professional clearance and transition, and can pick up even where prior years are behind.",
  },
  {
    q: "What if our accounts are overdue?",
    a: "Common, and fixable. We regularly bring overdue audits and filings up to date and manage any MBR penalty exposure. The sooner we start, the better.",
  },
];

export const ACCOUNTING_FAQS: Faq[] = [
  {
    q: "Do I have to move off Xero or QuickBooks?",
    a: "No. We work in the ledger you're already on, or move you if it's genuinely holding you back. Either way the data stays yours.",
  },
  {
    q: "What does approving actually involve?",
    a: "A short list of proposed entries, usually a few minutes a week. Anything unclear comes to you as one question, not twenty.",
  },
  {
    q: "Is the review route really cheaper?",
    a: "Yes — you do the bulk of the work, so we charge a fraction of the full bookkeeping fee. The calculator shows the difference as you switch.",
  },
  {
    q: "What if my records are behind?",
    a: "Common. Catch-up is quoted as a one-off in the calculator, and we give you a date by which you will be current.",
  },
  {
    q: "Who actually does the work?",
    a: "A named accountant at A4, with a manager reviewing. You get their name and their email.",
  },
  {
    q: "What if I want to leave?",
    a: "Export your ledger and documents in full, any time, no exit fee. It was never ours.",
  },
];
