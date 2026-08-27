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

  it("keeps the audit landing page on the approved charcoal and lime palette", () => {
    expect(auditParts).toContain('className="a4-audit-page"');
    expect(auditEstimator).toContain("#DDF72A");
    expect(auditEstimator).toContain("#171A16");
    expect(auditEstimator).not.toMatch(/#4f55f1|#494fdf|#3a40c4/i);
  });

  it("matches paid bookkeeping and audit price messages to the quote pack", () => {
    expect(bookkeepingLanding).toContain("€24");
    expect(bookkeepingLanding).toContain("€49");
    expect(bookkeepingPage).toContain("from €24/month self-employed, €49/month for a company");
    expect(quotePack).toContain("Math.max(0, (banks || 1) - 1) * EXTRA_BANK_PER_MONTH");
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
