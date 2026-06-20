export type Band = "Healthy" | "Some gaps" | "At risk";

export type Answer = { label: string; status: "good" | "warn" | "bad"; finding: string };
export type Question = { id: string; dimension: string; weight: number; prompt: string; answers: Answer[] };

// answers ordered best -> worst; points = weight * (1 - index/(n-1))
export const QUESTIONS: Question[] = [
  { id: "bookkeeping", dimension: "Bookkeeping", weight: 16,
    prompt: "How up to date is your bookkeeping right now?",
    answers: [
      { label: "Up to date (this month)", status: "good", finding: "Bookkeeping is current — keep the monthly cadence." },
      { label: "1–3 months behind", status: "warn", finding: "Bookkeeping is 1–3 months behind — a monthly close keeps numbers reliable." },
      { label: "3+ months behind", status: "bad", finding: "Bookkeeping is 3+ months behind — high risk of errors and missed deadlines." },
      { label: "Not sure", status: "bad", finding: "Bookkeeping status is unclear — start with a catch-up and a monthly routine." },
    ] },
  { id: "bankrec", dimension: "Bank reconciliation", weight: 14,
    prompt: "When were your bank accounts last reconciled?",
    answers: [
      { label: "This month", status: "good", finding: "Bank reconciliations are current." },
      { label: "This quarter", status: "warn", finding: "Reconcile monthly to catch missing or duplicated transactions sooner." },
      { label: "We don't reconcile", status: "bad", finding: "Bank accounts aren't reconciled — the books may not reflect reality." },
      { label: "Not sure", status: "bad", finding: "Reconciliation status unclear — make it a monthly control." },
    ] },
  { id: "vat", dimension: "VAT compliance", weight: 14,
    prompt: "Are your VAT returns filed on time and reconciled?",
    answers: [
      { label: "Always on time & reconciled", status: "good", finding: "VAT is on time and reconciled." },
      { label: "Filed, sometimes late", status: "warn", finding: "VAT is filed but sometimes late — late filing risks penalties." },
      { label: "Behind / unsure they tie", status: "bad", finding: "VAT may be behind or unreconciled — a common source of penalties and audit queries." },
      { label: "Not VAT registered", status: "good", finding: "Not VAT registered — confirm you're under the threshold." },
    ] },
  { id: "records", dimension: "Records & documentation", weight: 12,
    prompt: "Do you keep digital copies of all invoices and receipts?",
    answers: [
      { label: "Yes, all of them", status: "good", finding: "Documentation is complete — audit-friendly." },
      { label: "Most of them", status: "warn", finding: "Some source documents are missing — gaps surface at year-end/audit." },
      { label: "A few / paper only", status: "bad", finding: "Records are incomplete — reconstructing them later is costly." },
      { label: "No system", status: "bad", finding: "No document system — this is the #1 cause of year-end scramble." },
    ] },
  { id: "yearend", dimension: "Year-end / audit readiness", weight: 16,
    prompt: "How ready are you for year-end / audit?",
    answers: [
      { label: "Books closed monthly, schedules ready", status: "good", finding: "You're audit-ready — schedules and closes are in place." },
      { label: "We pull it together at year-end", status: "warn", finding: "Year-end is a scramble — month-end closes make audit faster and cheaper." },
      { label: "Not sure what's needed", status: "bad", finding: "Audit-readiness is unclear — a prep checklist will de-risk it." },
    ] },
  { id: "controls", dimension: "Financial controls", weight: 10,
    prompt: "Are there approvals / segregation of duties for payments?",
    answers: [
      { label: "Yes, documented", status: "good", finding: "Payment controls are in place." },
      { label: "Informal", status: "warn", finding: "Controls are informal — document approvals to reduce fraud/error risk." },
      { label: "None — one person does it all", status: "bad", finding: "No segregation of duties — a key control weakness." },
    ] },
  { id: "mgmt", dimension: "Management accounts", weight: 10,
    prompt: "How often do you review management accounts (P&L / balance sheet)?",
    answers: [
      { label: "Monthly", status: "good", finding: "Monthly management accounts — strong financial visibility." },
      { label: "Quarterly", status: "warn", finding: "Quarterly visibility — monthly accounts catch issues earlier." },
      { label: "Only at year-end", status: "bad", finding: "You only see numbers at year-end — too late to act on them." },
      { label: "Never", status: "bad", finding: "No management accounts — flying blind on performance." },
    ] },
  { id: "deadlines", dimension: "Statutory deadlines", weight: 8,
    prompt: "Do you track statutory deadlines (annual return, tax, VAT)?",
    answers: [
      { label: "Tracked, never missed", status: "good", finding: "Deadlines are tracked and met." },
      { label: "Mostly", status: "warn", finding: "Deadlines mostly met — one tracker avoids penalty surprises." },
      { label: "Missed some", status: "bad", finding: "Missed deadlines — penalties and good-standing risk." },
      { label: "Not sure", status: "bad", finding: "Deadline tracking unclear — start a compliance calendar." },
    ] },
];

function bandFor(score: number): Band {
  if (score >= 80) return "Healthy";
  if (score >= 50) return "Some gaps";
  return "At risk";
}

export type ResultRow = { dimension: string; points: number; max: number; status: Answer["status"]; finding: string };
export type HealthResult = { score: number; band: Band; results: ResultRow[]; priorities: ResultRow[] };

export function scoreHealthCheck(answers: Record<string, number>): HealthResult {
  const rows: ResultRow[] = QUESTIONS.map((q) => {
    const idx = Math.min(Math.max(answers[q.id] ?? q.answers.length - 1, 0), q.answers.length - 1);
    const a = q.answers[idx];
    const points = q.answers.length === 1 ? q.weight : Math.round(q.weight * (1 - idx / (q.answers.length - 1)));
    return { dimension: q.dimension, points, max: q.weight, status: a.status, finding: a.finding };
  });
  const score = Math.max(0, Math.min(100, rows.reduce((s, r) => s + r.points, 0)));
  const sorted = [...rows].sort((a, b) => a.points - b.points);
  return { score, band: bandFor(score), results: sorted, priorities: sorted.filter((r) => r.status !== "good").slice(0, 3) };
}

scoreHealthCheck.bandFor = bandFor;
