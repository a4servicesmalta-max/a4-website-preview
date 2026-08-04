import { describe, expect, it } from "vitest";
import {
  COMPLIANCE_DL_RULES,
  EVENT_DRIVEN_DEADLINES,
  getNextComplianceDeadline,
  getNextComplianceDeadlines,
} from "./compliance-deadlines";
import { buildComplianceCalendarIcs } from "./compliance-calendar";

describe("compliance deadline rules", () => {
  it("keeps the statutory fixed dates", () => {
    const byId = Object.fromEntries(COMPLIANCE_DL_RULES.map((r) => [r.id, r]));
    expect(byId["vat-return"].dates).toEqual([[1, 15], [4, 15], [7, 15], [10, 15]]);
    expect(byId["pt"].dates).toEqual([[3, 30], [7, 31], [11, 21]]);
    expect(byId["fs7"].dates).toEqual([[1, 15]]);
    expect(byId["fs5"].monthly).toBe(true);
  });

  it("never publishes company-specific deadlines as fixed dates", () => {
    // MBR annual return + accounts filing run from anniversary/approval — they
    // must live in EVENT_DRIVEN_DEADLINES, not on the fixed calendar.
    const fixedNames = COMPLIANCE_DL_RULES.map((r) => r.name.toLowerCase());
    expect(fixedNames.some((n) => n.includes("annual return"))).toBe(false);
    expect(EVENT_DRIVEN_DEADLINES.some((d) => d.id === "mbr-ar")).toBe(true);
  });

  it("returns upcoming deadlines sorted and in the future", () => {
    const now = new Date(2026, 7, 4, 12, 0, 0);
    const next = getNextComplianceDeadlines(now, 8);
    expect(next.length).toBe(8);
    for (let i = 0; i < next.length; i++) {
      expect(next[i].date.getTime()).toBeGreaterThan(now.getTime());
      if (i > 0) expect(next[i].date.getTime()).toBeGreaterThanOrEqual(next[i - 1].date.getTime());
    }
    expect(getNextComplianceDeadline(now).date.getTime()).toBe(next[0].date.getTime());
  });
});

describe("ICS export", () => {
  it("derives events from the shared rules for the next 12 months", () => {
    const now = new Date(2026, 7, 4, 12, 0, 0);
    const ics = buildComplianceCalendarIcs(now);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("SUMMARY:VAT return filing");
    expect(ics).toContain("SUMMARY:FS5 payroll & SSC");
    expect(ics).toContain("SUMMARY:Provisional tax instalment");
    // 21 Dec 2026 provisional tax instalment must be present
    expect(ics).toContain("DTSTART;VALUE=DATE:20261221");
    // nothing in the past
    expect(ics).not.toContain("DTSTART;VALUE=DATE:20260430");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
});
