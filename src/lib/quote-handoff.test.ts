import { describe, it, expect } from "vitest";
import { quoteToText, booksSignupUrl, quoteRef, type QuotePayload, type QuoteContact } from "./quote-handoff";

const contact: QuoteContact = { name: "Jane Borg", company: "Borg Trading Ltd", email: "jane@borg.mt", phone: "+356 9900 1122" };

const quote: QuotePayload = {
  page: "accounting",
  service: "Accounting & bookkeeping",
  headline: "€184 / month + €180 one-off",
  lines: [
    { k: "Managed bookkeeping · Company", v: "€49 /mo" },
    { k: "Bookkeeping by us", v: "€99 /mo" },
    { k: "Payroll · 2 × €32", v: "€64 /mo" },
    { k: "Catch-up · 6 months", v: "€150 one-off" },
  ],
  services: ["Managed bookkeeping — Company", "Payroll for 2 people", "VAT returns (Yes — Article 10)"],
  answers: [
    { k: "Sector", v: "Shop, trade or services" },
    { k: "Transactions / month", v: "20 to 60" },
    { k: "Risk tier", v: "Standard" },
  ],
  note: "25% launch discount already applied. All fees exclude VAT.",
  clientNotes: "We also have a Dutch subsidiary.",
};

describe("quote handoff", () => {
  const ref = "A4-TEST01";
  const text = quoteToText(quote, contact, ref);

  it("puts every requested service in the email body", () => {
    quote.services.forEach((s) => expect(text).toContain(s));
  });

  it("itemises every line and the total", () => {
    quote.lines.forEach((l) => {
      expect(text).toContain(l.k);
      expect(text).toContain(l.v);
    });
    expect(text).toContain(quote.headline);
  });

  it("carries every answer, the contact details and the client's own notes", () => {
    quote.answers.forEach((a) => expect(text).toContain(`${a.k}: ${a.v}`));
    expect(text).toContain(contact.name);
    expect(text).toContain(contact.company);
    expect(text).toContain(contact.email);
    expect(text).toContain(contact.phone);
    expect(text).toContain("We also have a Dutch subsidiary.");
    expect(text).toContain(ref);
  });

  it("omits the notes block entirely when the client wrote nothing", () => {
    expect(quoteToText({ ...quote, clientNotes: "   " }, contact, ref)).not.toContain("CLIENT NOTES");
  });

  it("hands the signup the reference and the contact, and no plan", () => {
    const url = new URL(booksSignupUrl(quote, contact, ref));
    expect(url.origin + url.pathname).toBe("https://books.vacei.com/signup");
    expect(url.searchParams.get("ref")).toBe(ref);
    expect(url.searchParams.get("email")).toBe(contact.email);
    expect(url.searchParams.get("company")).toBe(contact.company);
    expect(url.searchParams.get("source")).toBe("a4-accounting");
  });

  it("never emits an empty prefill parameter", () => {
    const bare = { name: "", company: "", email: "", phone: "" };
    // `plan` is retired with the software ladder — it must never come back.
    const url = new URL(booksSignupUrl(quote, bare, ref));
    ["email", "name", "company", "plan"].forEach((k) => expect(url.searchParams.has(k)).toBe(false));
  });

  it("generates a distinct reference per request", () => {
    expect(quoteRef()).toMatch(/^A4-[0-9A-Z]{6}$/);
  });
});
