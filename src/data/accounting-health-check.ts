export type Band = "Healthy" | "Some gaps" | "At risk";

export type Answer = { label: string; status: "good" | "warn" | "bad"; finding: string };
export type Question = { id: string; dimension: string; weight: number; prompt: string; answers: Answer[] };

// answers ordered best -> worst; points = weight * (1 - index/(n-1))
export const QUESTIONS: Question[] = [
  { id: "bookkeeping", dimension: "Bookkeeping", weight: 16,
    prompt: "How up to date is your bookkeeping right now?",
    answers: [
      { label: "Up to date (this month)", status: "good", finding: "Your books are current — the foundation of clean, audit-ready accounts." },
      { label: "1–3 months behind", status: "warn", finding: "Books are 1–3 months behind — a monthly close keeps the numbers reliable and decision-ready." },
      { label: "3+ months behind", status: "bad", finding: "Books are 3+ months behind — errors compound and deadlines slip. A catch-up comes first." },
      { label: "Not sure", status: "bad", finding: "If you can't say where your books stand, that's the gap to close — start with a catch-up and a monthly rhythm." },
    ] },
  { id: "bankrec", dimension: "Bank reconciliation", weight: 14,
    prompt: "When were your bank accounts last reconciled?",
    answers: [
      { label: "This month", status: "good", finding: "Bank reconciliations are current — your cash position is trustworthy." },
      { label: "This quarter", status: "warn", finding: "Reconcile monthly, not quarterly — it catches missing or duplicated transactions while they're easy to fix." },
      { label: "We don't reconcile", status: "bad", finding: "Unreconciled accounts mean the books may not match reality — a core monthly control to put in place." },
      { label: "Not sure", status: "bad", finding: "Reconciliation status is unclear — make a monthly bank rec a fixed control." },
    ] },
  { id: "vat", dimension: "VAT compliance", weight: 14,
    prompt: "Are your VAT returns filed on time and reconciled?",
    answers: [
      { label: "Always on time & reconciled", status: "good", finding: "VAT is filed on time and reconciled — exactly where it should be." },
      { label: "Filed, sometimes late", status: "warn", finding: "VAT is filed but sometimes late — late submissions invite avoidable penalties." },
      { label: "Behind / unsure they tie", status: "bad", finding: "VAT may be behind or unreconciled — a frequent source of penalties and audit queries. Worth tightening now." },
      { label: "Not VAT registered", status: "good", finding: "Not VAT registered — just confirm you're below the Malta threshold." },
    ] },
  { id: "records", dimension: "Records & documentation", weight: 12,
    prompt: "Do you keep digital copies of all invoices and receipts?",
    answers: [
      { label: "Yes, all of them", status: "good", finding: "Source documents are complete — clean evidence for year-end and audit." },
      { label: "Most of them", status: "warn", finding: "Some invoices and receipts are missing — the gaps tend to surface at year-end or audit. Tidy them as you go." },
      { label: "A few / paper only", status: "bad", finding: "Records are incomplete — rebuilding them later is slow and costly. A simple capture habit fixes this." },
      { label: "No system", status: "bad", finding: "No document system — a common cause of the year-end scramble. Start capturing receipts and invoices digitally." },
    ] },
  { id: "yearend", dimension: "Year-end / audit readiness", weight: 16,
    prompt: "How ready are you for year-end / audit?",
    answers: [
      { label: "Books closed monthly, schedules ready", status: "good", finding: "You're audit-ready — monthly closes and schedules mean a faster, cheaper audit." },
      { label: "We pull it together at year-end", status: "warn", finding: "Pulling it together at year-end makes audit slower and more expensive — month-end closes change that." },
      { label: "Not sure what's needed", status: "bad", finding: "If you're not sure what audit needs, a short prep checklist removes the risk and the surprises." },
    ] },
  { id: "controls", dimension: "Financial controls", weight: 10,
    prompt: "Are there approvals / segregation of duties for payments?",
    answers: [
      { label: "Yes, documented", status: "good", finding: "Payment approvals and segregation are in place — the controls auditors look for." },
      { label: "Informal", status: "warn", finding: "Controls are informal — writing down who approves what cuts fraud and error risk." },
      { label: "None — one person does it all", status: "bad", finding: "One person handling everything is a key control weakness — separate who approves from who pays." },
    ] },
  { id: "mgmt", dimension: "Management accounts", weight: 10,
    prompt: "How often do you review management accounts (P&L / balance sheet)?",
    answers: [
      { label: "Monthly", status: "good", finding: "Monthly management accounts — real visibility to steer the business." },
      { label: "Quarterly", status: "warn", finding: "Quarterly is a start, but monthly accounts surface issues while you can still act on them." },
      { label: "Only at year-end", status: "bad", finding: "Seeing the numbers only at year-end is too late to act on them — monthly visibility changes decisions." },
      { label: "Never", status: "bad", finding: "No management accounts means flying blind — even a simple monthly P&L pays for itself." },
    ] },
  { id: "deadlines", dimension: "Statutory deadlines", weight: 8,
    prompt: "Do you track statutory deadlines (annual return, tax, VAT)?",
    answers: [
      { label: "Tracked, never missed", status: "good", finding: "Statutory deadlines tracked and met — no good-standing risk." },
      { label: "Mostly", status: "warn", finding: "Mostly met — one shared tracker removes the last-minute surprises." },
      { label: "Missed some", status: "bad", finding: "Missed deadlines bring penalties and good-standing risk — a compliance calendar prevents them." },
      { label: "Not sure", status: "bad", finding: "If deadlines aren't tracked, start a compliance calendar — annual return, tax and VAT in one view." },
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
