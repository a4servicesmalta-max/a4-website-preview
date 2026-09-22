import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (relative: string) => readFileSync(new URL(relative, import.meta.url), "utf8");

const landingPlan = read("./LandingPlan.tsx");
const floatingDock = read("../common/FloatingActionDock.tsx");
const bookingPage = read("../../app/[locale]/book-a-call/components/BookACallContent.tsx");
const auditParts = read("../../app/[locale]/audit-services/components/AuditParts.tsx");
const auditEstimator = read("../../app/[locale]/audit-services/components/AuditEstimator.tsx");
const bookkeepingLanding = read("../../app/[locale]/automated-bookkeeping/components/LandingParts.tsx");
const bookkeepingPage = read("../../app/[locale]/automated-bookkeeping/page.tsx");
const quotePack = read("../../data/a4QuotePack.ts");

describe("paid landing page message contracts", () => {
  it("promises the same 30-minute call that the scheduler books", () => {
    expect(bookingPage).toContain('const BOOKING_TYPE = "demo-30"');
    expect(bookingPage).toContain("meta.durationMinutes ?? 30");
    expect(landingPlan).not.toMatch(/15-min/);
    expect(landingPlan).toMatch(/30-minute call/);
    expect(floatingDock).toContain("Book a free 30-min call");
  });

  it("sends audit consultation CTAs to the scheduler", () => {
    expect(auditParts.match(/href="\/book-a-call"/g)).toHaveLength(2);
  });

  it("keeps the audit landing page on the merged palette — lime accents on the black estimator, blue fee panel", () => {
    // The 27-Aug design pass (a4-website-preview #41, deployed) made the
    // estimator section black with a BLUE fee panel; this branch's lime/charcoal
    // accents survive on the controls. The blue hexes are therefore allowed
    // again, but only on the fee panel.
    expect(auditParts).toContain('className="a4-audit-page"');
    expect(auditEstimator).toContain("#DDF72A");
    expect(auditEstimator).toContain("#171A16");
    expect(auditEstimator).toContain('background: "#000"');
    expect(auditEstimator).toContain('className="af-panel" style={{ background: "linear-gradient(180deg, #4f55f1 0%, #494fdf 50%, #3a40c4 100%)"');
  });

  it("matches paid bookkeeping and audit price messages to the quote pack", () => {
    expect(bookkeepingLanding).toContain("BOOKKEEPING_FROM");
    expect(bookkeepingLanding).toContain("BOOKKEEPING_COMPANY");
    expect(bookkeepingLanding).toContain("including one bank account");
    // mt-2026-08-27-entry: the entry floors are €24/€49 with the first bank
    // account included; extras price at (banks − 1) × perAccount.
    expect(bookkeepingPage).toContain("from €24/month self-employed, €49/month for a company, including one bank account");
    expect(quotePack).toContain("(Math.max(1, Math.floor(Number(banks) || 1)) - 1) * per");
    expect(auditEstimator).toContain("From €${TAX_RETURN_FROM} a year");
  });

  it("gives the bookkeeping call-request fields stable form names and labels", () => {
    expect(landingPlan).toContain('htmlFor={`books-${k}`}');
    expect(landingPlan).toContain('id={`books-${k}`}');
    expect(landingPlan).toContain("name={k}");
    expect(landingPlan).toContain('autoComplete={k === "name" ? "name" : k === "email" ? "email" : "tel"}');
    expect(landingPlan).toContain('role="dialog"');
    expect(landingPlan).toContain('aria-labelledby="books-call-title"');
    expect(landingPlan).toContain("Enter your name and a valid email address.");
  });
});
