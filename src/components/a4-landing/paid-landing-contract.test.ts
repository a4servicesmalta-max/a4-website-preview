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
const paidKit = read("../../app/[locale]/accounting-services/components/PaidLandingKit.tsx");
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

  it("keeps the audit landing page on the A4 indigo palette — no page-scoped lime theme", () => {
    // Owner, Oct 2026: one design language site-wide. The page-scoped
    // lime/charcoal theme (`.a4-audit-page`, which re-pointed --a4-primary at
    // lime) is gone, and so is the Vacei teal of the old calculator. The
    // estimator is the design's quote builder: ink choice pills, the indigo
    // step rail, and the fee in a white quote document with the gradient total.
    expect(auditParts).not.toContain("a4-audit-page");
    for (const lime of ["#DDF72A", "#E7FA62", "#B7CC12", "#171A16"]) {
      expect(auditParts.toUpperCase()).not.toContain(lime);
      expect(auditEstimator.toUpperCase()).not.toContain(lime);
    }
    expect(auditEstimator).not.toContain("#33646E");
    expect(auditEstimator).toContain("background: MUTED_GLOW");
    expect(auditEstimator).toContain("<StepRail");
    expect(auditEstimator).toMatch(/<FeeDoc[\s\S]*?gradient=\{!q\.refer\}/);
    // The fee document: the af-panel column, the indigo gradient total.
    expect(paidKit).toContain('import { INDIGO, INK, PERI } from "@/lib/fx/engine"');
    expect(paidKit).toContain('className = "af-panel"');
    expect(paidKit).toContain("...(gradient ? gradText : { color: INK })");
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
