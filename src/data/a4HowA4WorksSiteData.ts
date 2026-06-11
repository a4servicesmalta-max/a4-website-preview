export type HowA4WorksStage = {
  id: string;
  label: string;
  icon: string;
  kind: "agent" | "human" | "deliver";
  blurb: string;
  agents?: { n: string; r: string }[];
  letters?: string[];
};

export const HOW_A4_WORKS_STAGES: HowA4WorksStage[] = [
  {
    id: "intake",
    label: "Intake & planning",
    icon: "compass",
    kind: "agent",
    blurb:
      "We onboard the engagement and a Master Orchestrator spins up the planning agents — mapping scope, materiality and the audit strategy in minutes, and assigning the right agents to every area of the file.",
    agents: [
      { n: "Master Orchestrator", r: "Coordinates every agent & the whole file" },
      { n: "Planning agent", r: "Scope, materiality & strategy" },
      { n: "Data-intake agent", r: "Reads trial balance, ledgers & documents" },
    ],
  },
  {
    id: "risk",
    label: "Risk assessment",
    icon: "shield-alert",
    kind: "agent",
    blurb:
      "Risk agents build the understanding of the entity, identify risks of material misstatement and design the response.",
    agents: [
      { n: "Risk agent", r: "Identifies & rates risks" },
      { n: "Controls agent", r: "Maps and walks through controls" },
    ],
  },
  {
    id: "testing",
    label: "Fieldwork & testing",
    icon: "list-checks",
    kind: "agent",
    blurb:
      "The Orchestrator runs a full fieldwork test library — a dedicated agent for each balance and class of transactions, performing substantive testing, controls testing, recalculation, vouching and analytics, with every working paper referenced back to the evidence.",
    agents: [
      { n: "Cash & bank agent", r: "Bank recs, confirmations, cut-off" },
      { n: "Revenue agent", r: "Cut-off, sampling, recalculation" },
      { n: "Payables agent", r: "Search for unrecorded liabilities" },
      { n: "Fixed-assets agent", r: "Additions, depreciation & existence" },
      { n: "Payroll agent", r: "Recalculation & SSC checks" },
      { n: "Analytics agent", r: "Ratio & trend analysis" },
    ],
  },
  {
    id: "human",
    label: "Human review layer",
    icon: "user-check",
    kind: "human",
    blurb:
      "This is where you and our qualified auditors take over. Every agent output is reviewed by a real auditor — judgements are applied, anomalies investigated, and any uncertain go-ahead is escalated to you as a simple yes/no. Nothing is concluded by software alone.",
    agents: [
      { n: "A4 audit manager", r: "Reviews & challenges every file" },
      { n: "You — the partner", r: "Final say on every judgement" },
    ],
  },
  {
    id: "deliver",
    label: "Final engagement",
    icon: "file-check-2",
    kind: "deliver",
    blurb:
      "We complete the file and hand you the full engagement — mapped, referenced and review-ready, with every relevant letter drafted for your sign-off.",
    letters: [
      "Engagement letter",
      "Audit report (opinion)",
      "Letter of representation",
      "Management letter",
      "Financial statements",
      "Completion memorandum",
    ],
  },
];
