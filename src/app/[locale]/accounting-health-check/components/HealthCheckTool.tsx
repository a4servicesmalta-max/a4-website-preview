"use client";
import { useState } from "react";
import { HealthCheckQuiz } from "./HealthCheckQuiz";
import { DeepReview } from "./DeepReview";

export function HealthCheckTool() {
  const [stage, setStage] = useState<"quick" | "deep">("quick");
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: 16, padding: 24 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <button onClick={() => setStage("quick")} aria-pressed={stage === "quick"} style={{ fontWeight: stage === "quick" ? 700 : 400, background: "none", border: "none", cursor: "pointer" }}>1 · Quick check</button>
        <span style={{ opacity: 0.4 }}>→</span>
        <button onClick={() => setStage("deep")} aria-pressed={stage === "deep"} style={{ fontWeight: stage === "deep" ? 700 : 400, background: "none", border: "none", cursor: "pointer" }}>2 · Deep review</button>
      </div>
      {stage === "quick" ? <HealthCheckQuiz onStartDeep={() => setStage("deep")} /> : <DeepReview />}
    </div>
  );
}
