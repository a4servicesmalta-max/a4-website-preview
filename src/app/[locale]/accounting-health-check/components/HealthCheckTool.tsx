"use client";
import { useState } from "react";
import { HealthCheckQuiz } from "./HealthCheckQuiz";
import { DeepReview } from "./DeepReview";
import type { Contact } from "./Field";

export function HealthCheckTool() {
  const [stage, setStage] = useState<"quick" | "deep">("quick");
  const [contact, setContact] = useState<Contact>({ email: "", name: "", company: "" });
  const [contactCaptured, setContactCaptured] = useState(false);

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        background: "var(--a4-surface-card)",
        border: "1px solid var(--a4-hairline-light)",
        borderRadius: 16,
        padding: "clamp(20px,3vw,32px)",
      }}
    >
      <div style={{ display: "flex", gap: 14, marginBottom: 24, alignItems: "center" }}>
        <StepTab n={1} label="Quick check" active={stage === "quick"} onClick={() => setStage("quick")} />
        <span style={{ flex: "0 0 28px", height: 1, background: "var(--a4-hairline-light)" }} />
        <StepTab n={2} label="Deep review" active={stage === "deep"} onClick={() => setStage("deep")} />
      </div>

      {stage === "quick" ? (
        <HealthCheckQuiz
          contact={contact}
          setContact={setContact}
          onContactCaptured={() => setContactCaptured(true)}
          onStartDeep={() => setStage("deep")}
        />
      ) : (
        <DeepReview contact={contact} setContact={setContact} contactCaptured={contactCaptured} />
      )}
    </div>
  );
}

function StepTab({ n, label, active, onClick }: { n: number; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "none", border: 0, cursor: "pointer", padding: 0 }}
    >
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          fontSize: 13,
          fontWeight: 700,
          color: active ? "#fff" : "var(--a4-mute)",
          background: active ? "var(--a4-primary)" : "var(--a4-surface-soft)",
          border: active ? "0" : "1px solid var(--a4-hairline-light)",
        }}
      >
        {n}
      </span>
      <span
        style={{
          fontWeight: active ? 700 : 500,
          color: active ? "var(--a4-ink)" : "var(--a4-mute)",
          fontFamily: "var(--a4-font-body)",
          fontSize: 15,
        }}
      >
        {label}
      </span>
    </button>
  );
}
