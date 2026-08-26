/**
 * One shape for a calculator quote, so the audit page and the accounting page
 * hand the sales team the same thing: a human-readable itemisation in the email
 * body, the same itemisation as structured JSON in the portal record, and a
 * reference that ties the two together.
 */


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
  /**
   * The CANONICAL service ids this quote covers, from
   * `src/data/serviceRequestForms.ts` — "Bookkeeping",
   * "Audit & Annual Accounts", and so on.
   *
   * Distinct from `services` above, which is prose for a human to read, and
   * from `service`, which is this page's own title. /api/quote derives the
   * IESBA independence route from these, and an unmapped page label routes
   * `neutral`: the accounting estimator sent only "Accounting & bookkeeping"
   * and so produced a lead whose greppable independence line said
   * `audit_eligible=true` while its own answers said false. State the ids and
   * the derivation cannot be wrong about a surface it has never heard of.
   */
  serviceIds?: string[];
  /** Every question and the answer they gave, for the scoping call. */
  answers: { k: string; v: string }[];
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

