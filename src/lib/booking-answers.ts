/**
 * Qualifier questions asked inside the /book-a-call booking panel, and the
 * pure builder that turns the visitor's selections into the `answers` object
 * the scheduling API accepts.
 *
 * The questions live here rather than in the component so the wording is
 * testable and so the wire shape (plain-text labels, unanswered keys omitted)
 * can never drift from what the panel actually renders.
 */

export type QualifierKey = "businessType" | "employees" | "adminTime" | "fees";

export type Qualifier = {
  key: QualifierKey;
  label: string;
  options: readonly string[];
};

/** Asked in this order — the panel renders one chip row per entry. */
export const BOOKING_QUALIFIERS: readonly Qualifier[] = [
  {
    key: "businessType",
    label: "What does the business do?",
    options: [
      "Trading company",
      "Self-employed",
      "Startup, not yet registered",
      "Holding or property",
      "Regulated (gaming, crypto, finance)",
      "Something else",
    ],
  },
  {
    key: "employees",
    label: "How many people?",
    options: ["Just me", "2–10", "11–50", "50+"],
  },
  {
    key: "adminTime",
    label: "Time on admin each month?",
    options: ["A few hours", "1–2 days", "A week", "It never ends"],
  },
  {
    key: "fees",
    label: "Current accounting fees a year?",
    options: ["Under €2k", "€2k–€5k", "€5k–€15k", "€15k+"],
  },
] as const;

export type QualifierSelection = Partial<Record<QualifierKey, string | null>>;

/**
 * Build the `answers` payload: plain-text labels, and only the questions the
 * visitor actually answered. Every question is optional, so an untouched panel
 * yields `{}` — which the caller drops from the POST body entirely rather than
 * sending an empty object.
 */
export function buildBookingAnswers(selection: QualifierSelection): Partial<Record<QualifierKey, string>> {
  const answers: Partial<Record<QualifierKey, string>> = {};
  for (const q of BOOKING_QUALIFIERS) {
    const raw = selection[q.key];
    const value = typeof raw === "string" ? raw.trim() : "";
    if (value) answers[q.key] = value;
  }
  return answers;
}

/** The backend caps `message` at 2000 characters. */
export const BOOKING_MESSAGE_MAX = 2000;

/**
 * The optional website field rides in `message` — the Leads list reads it at a
 * glance. Returns "" when there is nothing worth sending.
 */
export function buildBookingMessage(website: string): string {
  const site = (website || "").trim();
  if (!site) return "";
  return `Website: ${site}`.slice(0, BOOKING_MESSAGE_MAX);
}
