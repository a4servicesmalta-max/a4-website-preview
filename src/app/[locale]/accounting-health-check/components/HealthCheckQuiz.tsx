"use client";
import { useState } from "react";
import { QUESTIONS, scoreHealthCheck, type HealthResult } from "@/data/accounting-health-check";
import { Field, primaryBtn, type Contact } from "./Field";
import { getCaptchaToken } from "@/lib/turnstileClient";

export function HealthCheckQuiz({
  contact,
  setContact,
  onContactCaptured,
  onStartDeep,
}: {
  contact: Contact;
  setContact: (c: Contact) => void;
  onContactCaptured: () => void;
  onStartDeep: () => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<HealthResult | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  function choose(qid: string, idx: number) {
    const next = { ...answers, [qid]: idx };
    setAnswers(next);
    if (step + 1 < QUESTIONS.length) setStep(step + 1);
    else setResult(scoreHealthCheck(next));
  }

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    if (!result) return;
    setStatus("loading");
    try {
      const captchaToken = await getCaptchaToken("health-check");
      const res = await fetch("/api/health-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captchaToken, ...contact, score: result.score, band: result.band, breakdown: result.results }),
      });
      if (!res.ok) throw new Error();
      setUnlocked(true);
      setStatus("idle");
      onContactCaptured();
    } catch {
      setStatus("error");
    }
  }

  if (!result) {
    const q = QUESTIONS[step];
    const pct = Math.round((step / QUESTIONS.length) * 100);
    return (
      <div>
        <div style={{ height: 4, borderRadius: 4, background: "var(--a4-surface-soft)", overflow: "hidden", marginBottom: 18 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "var(--a4-primary)", transition: "width .2s" }} />
        </div>
        <div style={{ fontSize: 13, color: "var(--a4-mute)" }}>Question {step + 1} of {QUESTIONS.length}</div>
        <h3 style={{ margin: "8px 0 18px", fontFamily: "var(--a4-font-display)", fontWeight: 600, fontSize: 22, color: "var(--a4-ink)" }}>{q.prompt}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.answers.map((a, i) => (
            <button
              key={i}
              onClick={() => choose(q.id, i)}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--a4-primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--a4-hairline-light)"; }}
              style={{
                textAlign: "left",
                padding: "14px 16px",
                borderRadius: 10,
                border: "1px solid var(--a4-hairline-light)",
                background: "#fff",
                color: "var(--a4-ink)",
                fontSize: 15,
                fontFamily: "var(--a4-font-body)",
                cursor: "pointer",
                transition: "border-color .15s",
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const bandColor =
    result.band === "Healthy" ? "var(--a4-accent-teal)" : result.band === "Some gaps" ? "#9a5a00" : "#c2303d";

  return (
    <div>
      <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
        <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1, color: "var(--a4-primary)", fontFamily: "var(--a4-font-display)" }}>
          {result.score}
          <span style={{ fontSize: 20, color: "var(--a4-mute)" }}>/100</span>
        </div>
        <div style={{ fontWeight: 700, marginTop: 6, color: bandColor }}>{result.band}</div>
      </div>

      <h4 style={{ marginTop: 22, marginBottom: 8, fontFamily: "var(--a4-font-display)", fontWeight: 600 }}>Your top priorities</h4>
      <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6, color: "var(--a4-body)", fontSize: 14.5 }}>
        {result.priorities.map((p, i) => <li key={i}>{p.finding}</li>)}
      </ul>

      {!unlocked ? (
        <form onSubmit={unlock} style={{ marginTop: 22, display: "grid", gap: 12 }}>
          <p style={{ fontSize: 14.5, color: "var(--a4-body)", margin: 0 }}>Enter your details to see the full breakdown across all 8 areas.</p>
          <Field required type="email" placeholder="Work email" autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
          <Field required placeholder="Name" autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
          <Field required placeholder="Company" autoComplete="organization" value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} />
          <button type="submit" disabled={status === "loading"} style={primaryBtn(status === "loading")}>
            {status === "loading" ? "Sending…" : "Show full breakdown"}
          </button>
          {status === "error" && <p style={{ color: "#c2303d", fontSize: 14, margin: 0 }}>Could not send — please try again.</p>}
        </form>
      ) : (
        <div style={{ marginTop: 22 }}>
          <h4 style={{ marginBottom: 8, fontFamily: "var(--a4-font-display)", fontWeight: 600 }}>Full breakdown</h4>
          <div>
            {result.results.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--a4-hairline-light)" }}>
                <span style={{ fontSize: 14.5, color: "var(--a4-ink)" }}>
                  {r.status === "good" ? "✅" : r.status === "warn" ? "⚠️" : "🔴"} {r.dimension}
                </span>
                <span style={{ color: "var(--a4-mute)", fontSize: 14, fontVariantNumeric: "tabular-nums" }}>{r.points}/{r.max}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: "16px 18px", borderRadius: 12, background: "var(--a4-surface-soft)" }}>
            <p style={{ margin: "0 0 12px", fontSize: 14.5, color: "var(--a4-body)" }}>
              Want a real review of your actual numbers? Upload your trial balance or financial statements — your details are saved, no need to re-enter.
            </p>
            <button type="button" onClick={onStartDeep} style={primaryBtn()}>Run a real review of your numbers →</button>
          </div>
        </div>
      )}
    </div>
  );
}
