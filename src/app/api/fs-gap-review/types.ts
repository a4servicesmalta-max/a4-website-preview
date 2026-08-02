export type Finding = {
  ruleId: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  severityLabel: string;
  location: string;
  description: string;
  source: "engine" | "ai";
  where: string;
  current: string;
  corrected: string;
  action: string;
};

export type ReviewResponse = {
  company: string;
  framework: string;
  method: string;
  stats: { checks_run: number; checks_passed: number; checks_failed: number; framework: string };
  findings: Finding[];
  confirmed: string[];
  reportBase64: string;
  reportName: string;
  annotatedDocxBase64: string | null;
  annotatedName: string | null;
  // Client-safe quote only — never expose basis/detail here (could reveal the
  // client's previous auditor's fee). Full quote goes to staff channels only.
  quote?: { fee: number; docKind: "audited_fs" | "management_accounts" } | null;
};
