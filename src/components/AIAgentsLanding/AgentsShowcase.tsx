"use client";

import React from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { SectionHead } from "@/components/a4-landing/Primitives";
import { LetterWord } from "@/components/fx/primitives";
import { gcol } from "@/lib/fx/engine";
import { Band, Bullets, INDIGO, PERI, SANS, card, gradText, kicker, sentence } from "@/components/services/SectionKit";

interface AgentsShowcaseProps {
  namespace: "accounting" | "business";
}

const ACCOUNTING_AGENTS = [
  { name: "Lena", role: "BOOKKEEPING AGENT", image: "/assets/images/agents/bookkeeper.png", caps: ["Transaction coding & categorisation", "Bank & credit card reconciliation", "Accounts payable & receivable", "Monthly close procedures"] },
  { name: "Dorian", role: "GENERAL LEDGER AGENT", image: "/assets/images/agents/ledger.png", caps: ["Journal entry review & posting", "Inter-company reconciliation", "Chart of accounts management", "Ledger anomaly detection"] },
  { name: "Mia", role: "FINANCIAL REPORTING AGENT", image: "/assets/images/agents/reporter.png", caps: ["Profit & loss statement", "Balance sheet preparation", "Cash flow statement", "IFRS / local GAAP compliance"] },
  { name: "Caius", role: "MANAGEMENT ACCOUNTS AGENT", image: "/assets/images/agents/mandy.png", caps: ["Monthly management pack", "Variance analysis vs budget", "KPI dashboards & commentary", "Cost centre reporting"] },
];

const BUSINESS_AGENTS = [
  { name: "Penny", role: "PLANNING AGENT", image: "/assets/images/agents/penny.png", caps: ["Audit strategy formulation", "Materiality calculations", "PBC List generation", "Resource scheduling"] },
  { name: "Rika", role: "RISK ASSESSMENT AGENT", image: "/assets/images/agents/rika.png", caps: ["ISA 315 risk mapping", "Fraud risk evaluation", "Control environment assessment", "Analytical procedures"] },
  { name: "Felix", role: "FIELDWORK AGENT", image: "/assets/images/agents/felix.png", caps: ["Automated vouching", "Statistical sampling", "Re-performance of controls", "Substantive testing"] },
  { name: "Glex", role: "GL ANOMALY AGENT", image: "/assets/images/agents/glex.png", caps: ["100% population testing", "Journal entry review", "Outlier identification", "Trend analysis"] },
  { name: "Cleo", role: "COMPLETION AGENT", image: "/assets/images/agents/cleo.png", caps: ["Going concern assessment", "Subsequent events review", "Final analytical review", "Disclosure checklist"] },
  { name: "Remy", role: "REPORTING AGENT", image: "/assets/images/agents/remy.png", caps: ["Audit report drafting", "Management letter generation", "Key audit matters writing", "Sign-off documentation"] },
  { name: "Comi", role: "COMMUNICATIONS AGENT", image: "/assets/images/agents/comi.png", caps: ["Client queries handling", "Status updates generation", "Information chasing", "Meeting summaries"] },
  { name: "Coda", role: "COMPLIANCE AGENT", image: "/assets/images/agents/coda.png", caps: ["ISQM 1 compliance", "Ethics & independence checks", "Audit file assembly", "Archiving procedures"] },
];

const FX = ["scatter", "cascade", "stack", "zoom", "tighten", "type"] as const;

/** "Meet the team": numbered eyebrow + H2, then the agent cards alternating light and dark. */
const AgentsShowcase = ({ namespace }: AgentsShowcaseProps) => {
  const { t } = useTranslation(namespace);
  const AGENTS = namespace === "accounting" ? ACCOUNTING_AGENTS : BUSINESS_AGENTS;
  const total = String(AGENTS.length).padStart(2, "0");

  return (
    <Band id="agents" surface="muted">
      <SectionHead
        n="01"
        eyebrow={sentence(t("agents.eyebrow", { defaultValue: "MEET THE AGENTS" }))}
        title={
          <>
            {t("agents.titleLine1", { defaultValue: "Your AI" })} <span style={{ ...gradText, paddingBottom: ".06em" }}>{t("agents.titleHighlight", { defaultValue: "Dream Team" })}</span>
          </>
        }
        sub={t("agents.sub", { defaultValue: "Highly specialized, domain-expert AI agents designed to handle specific parts of your workflow." })}
      />

      <div style={{ marginTop: "clamp(48px,6vw,72px)", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
        {AGENTS.map((agent, i) => {
          const dark = i % 2 === 1;
          const n = Array.from(agent.name).length;
          const colors = Array.from(agent.name).map((_, j) => (dark ? "#FFFFFF" : gcol(n > 1 ? j / (n - 1) : 0)));
          const c = card(dark, { position: "relative", overflow: "hidden", padding: 28, display: "flex", flexDirection: "column", gap: 14 });
          return (
            <div key={agent.name} data-fx="rise" data-d={(i % 4) * 80} className={c.className} style={c.style}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: dark ? "#A1A1AA" : "#52525B" }}>
                <span style={{ color: dark ? PERI : INDIGO }}>{String(i + 1).padStart(2, "0")}</span>
                <span>/ {total}</span>
              </div>
              <div style={{ position: "relative", height: 220, margin: "0 -28px", borderBottom: `1px solid ${dark ? "rgba(255,255,255,.1)" : "#E4E4E7"}` }}>
                <LetterWord
                  text={agent.name}
                  fx={FX[i % FX.length]}
                  d={200 + (i % 4) * 90}
                  colors={colors}
                  style={{ position: "absolute", left: 28, top: 6, zIndex: 2, fontFamily: SANS, fontSize: "clamp(44px,3.6vw,56px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.1, whiteSpace: "nowrap" }}
                />
                <Image
                  src={agent.image}
                  alt={agent.name}
                  width={260}
                  height={340}
                  sizes="180px"
                  style={{ position: "absolute", right: 12, bottom: 0, height: 210, width: "auto", objectFit: "contain", objectPosition: "bottom", clipPath: "inset(7% 0 0 0)" }}
                />
              </div>
              <div style={{ ...kicker, color: dark ? "#A1A1AA" : "#71717A" }}>{agent.role}</div>
              <Bullets items={agent.caps} dark={dark} size={15} gap={8} />
            </div>
          );
        })}
      </div>
    </Band>
  );
};

export default AgentsShowcase;
