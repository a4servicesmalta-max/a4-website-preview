/** Shared Malta compliance deadline rules — used by homepage, calendar UI and ICS export. */

export const COMPLIANCE_DL_RULES = [
  { name: "FS5 payroll & SSC", monthly: true as const },
  { name: "VAT return filing", dates: [[1, 15], [4, 15], [7, 15], [10, 15]] as [number, number][] },
  { name: "Provisional tax instalment", dates: [[3, 30], [7, 31], [11, 21]] as [number, number][] },
  { name: "MBR annual return", dates: [[6, 28]] as [number, number][] },
  { name: "Audited accounts & tax return", dates: [[10, 30]] as [number, number][] },
];

export type ComplianceDeadline = { name: string; date: Date };

export function getNextComplianceDeadlines(now = new Date(), limit = 6): ComplianceDeadline[] {
  const out: ComplianceDeadline[] = [];
  const y = now.getFullYear();

  const add = (name: string, d: Date) => {
    if (d.getTime() > now.getTime()) out.push({ name, date: d });
  };

  for (const rule of COMPLIANCE_DL_RULES) {
    if ("monthly" in rule && rule.monthly) {
      for (let i = 0; i < 14; i++) {
        add(rule.name, new Date(y, now.getMonth() + i + 1, 0, 17, 0, 0));
      }
    } else if ("dates" in rule && rule.dates) {
      for (const [m, day] of rule.dates) {
        for (const yy of [y, y + 1]) {
          add(rule.name, new Date(yy, m, day, 17, 0, 0));
        }
      }
    }
  }

  return out.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, limit);
}

export function getNextComplianceDeadline(now = new Date()): ComplianceDeadline {
  return getNextComplianceDeadlines(now, 1)[0] ?? {
    name: "VAT return filing",
    date: new Date(now.getFullYear(), now.getMonth() + 1, 15, 17, 0, 0),
  };
}

export function formatComplianceDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
