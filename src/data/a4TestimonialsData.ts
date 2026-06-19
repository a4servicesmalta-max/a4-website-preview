export type Testimonial = {
  id: string;
  quote: string;
  role: string;
  sector: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote:
      "We went from chasing spreadsheets to one portal with clear deadlines. Bookkeeping is finally current and we know exactly what audit will cost.",
    role: "Director",
    sector: "iGaming operator",
  },
  {
    id: "t2",
    quote:
      "A4 picked up our overdue filings without drama — fixed price, no surprises, and a team that actually responds the same day.",
    role: "Founder",
    sector: "Import & distribution",
  },
  {
    id: "t3",
    quote:
      "Our first statutory audit was handled properly: scoped upfront, signed on time, and filed before the MBR deadline.",
    role: "Company secretary",
    sector: "Construction & property",
  },
  {
    id: "t4",
    quote:
      "Payroll, VAT and bookkeeping in one portal changed how we operate — we see deadlines coming and our accountant catches issues before they become penalties.",
    role: "Operations manager",
    sector: "Hospitality group",
  },
];

export const TRUSTED_SECTORS = [
  "iGaming",
  "Retail & FMCG",
  "Professional services",
  "Construction",
  "Technology",
  "Hospitality",
] as const;
