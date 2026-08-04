/**
 * ICS export of the Malta compliance calendar — derived from the shared
 * rules in compliance-deadlines.ts so the download always matches what the
 * website shows. Events are materialised for the next 12 months.
 */
import { COMPLIANCE_DL_RULES, type ComplianceRule } from "@/lib/compliance-deadlines";

export function escapeIcsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function occurrences(rule: ComplianceRule, from: Date): Date[] {
  const out: Date[] = [];
  const y = from.getFullYear();
  if (rule.monthly) {
    for (let i = 0; i < 12; i++) out.push(new Date(y, from.getMonth() + i + 1, 0));
  } else if (rule.dates) {
    for (const [m, day] of rule.dates) {
      for (const yy of [y, y + 1]) {
        const d = new Date(yy, m, day);
        if (d.getTime() > from.getTime()) out.push(d);
      }
    }
  }
  const horizon = new Date(y + 1, from.getMonth(), from.getDate()).getTime();
  return out.filter((d) => d.getTime() > from.getTime() && d.getTime() <= horizon);
}

export function buildComplianceCalendarIcs(now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//A4 Services Limited//Malta Compliance Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Malta Compliance Deadlines — A4 Services",
  ];

  for (const rule of COMPLIANCE_DL_RULES) {
    for (const date of occurrences(rule, now)) {
      const compact = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
      const description = [rule.description, rule.note, "Confirm exact deadlines for your entity with A4 Services — info@a4.com.mt."]
        .filter(Boolean)
        .join(" ");
      lines.push(
        "BEGIN:VEVENT",
        `UID:${compact}-${rule.id}@a4.com.mt`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${compact}`,
        `SUMMARY:${escapeIcsText(rule.name)}`,
        `DESCRIPTION:${escapeIcsText(description)}`,
        "END:VEVENT",
      );
    }
  }

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}
