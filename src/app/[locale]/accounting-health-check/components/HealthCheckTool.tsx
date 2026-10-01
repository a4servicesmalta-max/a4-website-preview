"use client";
import { useState } from "react";
import { A4Mark } from "@/components/fx/primitives";
import { HealthCheckQuiz } from "./HealthCheckQuiz";
import { DeepReview } from "./DeepReview";
import type { Contact } from "./Field";

/** The two-step check as the design's document panel: lockup and step switch on top. */
export function HealthCheckTool() {
  const [stage, setStage] = useState<"quick" | "deep">("quick");
  const [contact, setContact] = useState<Contact>({ email: "", name: "", company: "" });
  const [contactCaptured, setContactCaptured] = useState(false);

  return (
    <div
      data-fx="rise"
      data-dy="80"
      style={{
        maxWidth: 860,
        margin: "0 auto",
        background: "#FFFFFF",
        border: "1px solid #E4E4E7",
        borderRadius: 28,
        boxShadow: "0 50px 120px rgba(9,9,11,.12)",
        overflow: "hidden",
        color: "#09090B",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "clamp(20px,3vw,32px) clamp(20px,3.4vw,40px)",
          borderBottom: "1px solid #E4E4E7",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <A4Mark size={30} color="#09090B" />
          <span style={{ width: 1.5, height: 24, margin: "0 12px", background: "#09090B", opacity: 0.35 }} />
          <span style={{ fontFamily: "var(--a4x-display)", fontSize: 18, fontWeight: 500, letterSpacing: "-0.02em" }}>A4 Services</span>
        </div>
        <div className="cp-seg cp-seg-fill" role="group" aria-label="Health check steps">
          <StepTab n={1} label="Quick check" active={stage === "quick"} onClick={() => setStage("quick")} />
          <StepTab n={2} label="Deep review" active={stage === "deep"} onClick={() => setStage("deep")} />
        </div>
      </div>

      <div style={{ padding: "clamp(24px,3.6vw,44px) clamp(20px,3.4vw,40px) clamp(28px,4vw,48px)" }}>
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
    </div>
  );
}

function StepTab({ n, label, active, onClick }: { n: number; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: active ? "#8B8FF7" : "#4F55F1" }}>{String(n).padStart(2, "0")}</span>
      {label}
    </button>
  );
}
