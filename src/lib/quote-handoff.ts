/**
 * One shape for a calculator quote, so the audit page and the accounting page
 * hand the sales team the same thing: a human-readable itemisation in the email
 * body, the same itemisation as structured JSON in the portal record, and a
 * reference that ties the two together.
 */

/**
 * Where "Create my account" sends the client.
 *
 * books.vacei.com/signup — verified live 2026-08-02. Its own plan picker uses
 * exactly the tier ids this file emits (bookkeeper | senior | manager | cfo),
 * so `plan` preselects the right one.
 *
 * Do NOT point this at books.a4.com.mt/register: that host 307s to
 * books.vacei.com and /register is a 404 there.
 */
export const BOOKS_SIGNUP_URL =
  process.env.NEXT_PUBLIC_BOOKS_SIGNUP_URL || "https://books.vacei.com/signup";

export type QuoteLineOut = { k: string; v: string };

export type QuotePayload = {
  page: "audit" | "accounting";
  /** e.g. "Statutory audit" — goes in the portal's Service column. */
  service: string;
  /** e.g. "€1,750 / year". "Let's talk first" for referral sectors. */
  headline: string;
  /** Every euro on the quote, already formatted. */
  lines: QuoteLineOut[];
  /** Plain-English list of what they actually asked for. */
  services: string[];
  /** Every question and the answer they gave, for the scoping call. */
  answers: { k: string; v: string }[];
  /** Software plan to start them on, when the quote implies one. */
  plan?: string;
  note?: string;
  clientNotes?: string;
};

export type QuoteContact = { name: string; company: string; email: string; phone: string };

/** A short human reference printed to the client and included in both records. */
export function quoteRef(): string {
  return "A4-" + Date.now().toString(36).toUpperCase().slice(-6);
}

/**
 * The email body. `/api/quote` renders `message` with `white-space: pre-line`,
 * so this lands in the inbox as a readable quote rather than a JSON dump.
 */
export function quoteToText(q: QuotePayload, c: QuoteContact, ref: string): string {
  const out: string[] = [];
  out.push(`${q.service.toUpperCase()} — ${q.headline}`);
  out.push("");
  out.push("REQUESTED");
  q.services.forEach((s) => out.push(`  • ${s}`));
  out.push("");
  out.push("ITEMISED QUOTE");
  q.lines.forEach((l) => out.push(`  ${l.k.padEnd(34, ".")} ${l.v}`));
  out.push(`  ${"TOTAL".padEnd(34, ".")} ${q.headline}`);
  if (q.plan) {
    out.push("");
    out.push(`SOFTWARE PLAN   ${q.plan}`);
  }
  out.push("");
  out.push("ANSWERS GIVEN");
  q.answers.forEach((a) => out.push(`  ${a.k}: ${a.v}`));
  if (q.clientNotes?.trim()) {
    out.push("");
    out.push("CLIENT NOTES");
    out.push(`  ${q.clientNotes.trim()}`);
  }
  out.push("");
  out.push("CONTACT");
  out.push(`  ${c.name}${c.company ? ` · ${c.company}` : ""}`);
  out.push(`  ${c.email}${c.phone ? ` · ${c.phone}` : ""}`);
  if (q.note) {
    out.push("");
    out.push(q.note);
  }
  out.push("");
  out.push(`Reference: ${ref}`);
  return out.join("\n");
}

/**
 * Where to send a client who wants an account straight away.
 *
 * The quote itself is already recorded server-side (portal + email) before this
 * runs — these parameters only prefill the signup form and carry the reference,
 * so nothing is lost if the Books app ignores them.
 *
 * Contract for the Books side: `ref` matches the portal record; `email`,
 * `name` and `company` prefill the form; `plan` is the software tier the
 * calculator landed on.
 */
export function booksSignupUrl(q: QuotePayload, c: QuoteContact, ref: string): string {
  const p = new URLSearchParams({ ref, source: `a4-${q.page}` });
  if (c.email) p.set("email", c.email);
  if (c.name) p.set("name", c.name);
  if (c.company) p.set("company", c.company);
  if (q.plan) p.set("plan", q.plan.toLowerCase());
  return `${BOOKS_SIGNUP_URL}?${p.toString()}`;
}
