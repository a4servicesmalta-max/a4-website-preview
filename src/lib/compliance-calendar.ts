/** Malta compliance deadlines for 2026 — used in calendar UI and ICS download. */
export const COMPLIANCE_DEADLINES_2026 = [
  { date: "2026-01-15", name: "VAT return filing (Q4 2025)" },
  { date: "2026-03-30", name: "Provisional tax instalment" },
  { date: "2026-04-15", name: "VAT return filing (Q1 2026)" },
  { date: "2026-06-28", name: "MBR annual return (typical window — confirm your anniversary)" },
  { date: "2026-07-15", name: "VAT return filing (Q2 2026)" },
  { date: "2026-07-31", name: "Provisional tax instalment" },
  { date: "2026-10-15", name: "VAT return filing (Q3 2026)" },
  { date: "2026-10-30", name: "Audited accounts & tax return (typical — per company year-end)" },
  { date: "2026-11-21", name: "Provisional tax instalment" },
] as const;

export function escapeIcsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function buildComplianceCalendarIcs(): string {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//A4 Services Limited//Malta Compliance Calendar 2026//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Malta Compliance Deadlines 2026 — A4 Services",
  ];

  for (const item of COMPLIANCE_DEADLINES_2026) {
    const compact = item.date.replace(/-/g, "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${compact}-${item.name.replace(/\W+/g, "-").toLowerCase()}@a4.com.mt`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact}`,
      `SUMMARY:${escapeIcsText(item.name)}`,
      "DESCRIPTION:Key Malta compliance date. Confirm exact deadlines for your entity with A4 Services.",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}
