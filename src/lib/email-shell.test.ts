import { describe, it, expect } from "vitest";
import { renderA4Email, a4EmailAttachments, A4_LOGO_WHITE_URL, A4_LOGO_INK_URL } from "./email-shell";

const VACEI_TEAL = ["#33646E", "#0F2226", "#2A535C", "#EBF0F0", "#D2DDDF", "#17333A", "#2A545E", "#4E7B84", "#E9F16D"];

const full = () =>
  renderA4Email({
    eyebrow: "Website · contact",
    headline: "We've received your message",
    firstName: "Jane <script>",
    intro: ["Thanks for writing to us & welcome.", "Second paragraph\nwith a line break."],
    figure: { label: "Your accounting health score", value: "72/100", unit: "Good", meta: "3 of 5 areas strong" },
    checklist: { title: "What happens next", items: ["We read it", "We reply <soon>"] },
    lineItems: { rows: [{ label: "Bookkeeping", amount: "€49", cadence: "/month" }], total: "€49", note: "ex VAT" },
    rows: [
      { label: "Name", value: 'Jane "Q" <b>Borg</b>' },
      { label: "Email", value: "jane@example.com" },
      { label: "Link", value: "https://partner.vacei.com/dashboard/leads" },
      { label: "Empty", value: "  " },
    ],
    code: "123456",
    cta: { label: "Book a call", url: "https://a4.com.mt/book-a-call" },
    cta2: { label: "Health check", url: "https://a4.com.mt/accounting-health-check" },
    reason: "You submitted the contact form on a4.com.mt.",
  });

describe("renderA4Email — brand", () => {
  it("carries the A4 tokens and both logos", () => {
    const { html } = full();
    for (const hex of ["#09090B", "#3F3F46", "#27272A", "#F4F4F5", "#E4E4E7", "#18181B", "#52525B", "#F3F4F1", "#151515", "#3B3B3B", "#7A7D78"]) {
      expect(html).toContain(hex);
    }
    expect(html).toContain(A4_LOGO_WHITE_URL);
    expect(html).toContain(A4_LOGO_INK_URL);
    expect(html).toContain("A4 Services · Accountants and auditors, Malta.");
    expect(html).toContain("info@a4.com.mt");
    expect(html).toContain("fonts.googleapis.com/css2?family=Inter");
    expect(html).toMatch(/'Outfit'/);
    expect(html).toMatch(/'JetBrains Mono'/);
  });

  it("contains no Vacei teal anywhere, in any case", () => {
    const { html, text } = full();
    const lower = (html + text).toLowerCase();
    for (const hex of VACEI_TEAL) expect(lower).not.toContain(hex.toLowerCase());
    expect(lower).not.toContain("vacei-logo");
  });
});

describe("renderA4Email — content + escaping", () => {
  it("escapes every user-provided string in the HTML", () => {
    const { html } = full();
    expect(html).not.toContain("<script>");
    expect(html).toContain("Dear Jane &lt;script&gt;,");
    expect(html).toContain("Thanks for writing to us &amp; welcome.");
    expect(html).toContain("Second paragraph<br>with a line break.");
    expect(html).toContain("We reply &lt;soon&gt;");
    expect(html).toContain("Jane &quot;Q&quot; &lt;b&gt;Borg&lt;/b&gt;");
    expect(html).not.toContain("<b>Borg</b>");
  });

  it("renders every block once and drops blank rows", () => {
    const { html } = full();
    expect(html).toContain("Website · contact");
    expect(html).toContain(">72/100<span");
    expect(html).toContain(">123456</div>");
    expect(html).toContain("What happens next");
    expect(html).toContain(">Total</td>");
    expect(html).toContain(">Details</div>");
    expect(html).toContain('href="https://partner.vacei.com/dashboard/leads"');
    expect(html).toContain('href="https://a4.com.mt/book-a-call"');
    expect(html).toContain('href="https://a4.com.mt/accounting-health-check"');
    expect(html).not.toContain(">Empty<");
    expect(html).toContain("You submitted the contact form on a4.com.mt.");
    expect(html).toContain("Kind regards,<br>");
    expect(html).toContain("A4 Services Team</span>");
  });

  it("omits the greeting, eyebrow and CTA when not supplied", () => {
    const { html, text } = renderA4Email({ headline: "Staff copy", intro: "Body" });
    expect(html).not.toContain("Dear ");
    expect(html).not.toContain("PRIMARY CTA");
    expect(html).not.toContain("border-radius:999px");
    expect(text).not.toContain("Dear ");
  });

  it("never emits a non-http href", () => {
    const { html } = renderA4Email({
      headline: "x",
      intro: "y",
      cta: { label: "Go", url: "javascript:alert(1)" },
      rows: [{ label: "Link", value: "javascript:alert(2)" }],
    });
    expect(html).not.toContain('href="javascript:');
    expect(html).not.toContain("javascript:alert(2)</a>");
  });

  it("produces a plain-text twin with the headline, greeting, blocks and links", () => {
    const { text } = full();
    expect(text).toContain("We've received your message");
    expect(text).toContain("Dear Jane <script>,");
    expect(text).toContain("Thanks for writing to us & welcome.");
    expect(text).toContain("Your accounting health score: 72/100 Good");
    expect(text).toContain("- We read it");
    expect(text).toContain("- Bookkeeping: €49 /month");
    expect(text).toContain("Name: Jane \"Q\" <b>Borg</b>");
    expect(text).toContain("Book a call: https://a4.com.mt/book-a-call");
    expect(text).toContain("Health check: https://a4.com.mt/accounting-health-check");
    expect(text).toContain("Kind regards,\nA4 Services Team");
    expect(text).toContain("info@a4.com.mt · a4.com.mt");
    expect(text).not.toContain("<td");
  });

  it("accepts a single intro string split on blank lines", () => {
    const { html } = renderA4Email({ headline: "h", intro: "One\n\nTwo" });
    expect(html.match(/<p class="v-body"/g)?.length).toBe(2);
  });
});

describe("a4EmailAttachments", () => {
  it("returns the two CID logos from src/assets/email", () => {
    const list = a4EmailAttachments();
    expect(list.map((a) => a.cid).sort()).toEqual(["a4-logo", "a4-logo-dark"]);
    for (const a of list) expect(a.content.length).toBeGreaterThan(1000);
  });
});
