"use client";
import { useState } from "react";
import { QUESTIONS, scoreHealthCheck, type HealthResult } from "@/data/accounting-health-check";
import { Button } from "@/components/a4-landing/Primitives";

export function HealthCheckQuiz({ onStartDeep }: { onStartDeep: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<HealthResult | null>(null);
  const [form, setForm] = useState({ email: "", name: "", company: "" });
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
      const res = await fetch("/api/health-check", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, score: result.score, band: result.band, breakdown: result.results }),
      });
      if (!res.ok) throw new Error();
      setUnlocked(true); setStatus("idle");
    } catch { setStatus("error"); }
  }

  if (!result) {
    const q = QUESTIONS[step];
    return (
      <div>
        <div style={{ fontSize: 13, opacity: 0.7 }}>Question {step + 1} / {QUESTIONS.length}</div>
        <h3 style={{ margin: "8px 0 16px" }}>{q.prompt}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.answers.map((a, i) => (
            <button key={i} onClick={() => choose(q.id, i)} style={{ textAlign: "left", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--a4-hairline-light)", background: "#fff", cursor: "pointer" }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, fontWeight: 800, color: "var(--a4-primary)" }}>{result.score}<span style={{ fontSize: 20 }}>/100</span></div>
        <div style={{ fontWeight: 700 }}>{result.band}</div>
      </div>
      <h4 style={{ marginTop: 16 }}>Your top priorities</h4>
      <ul>{result.priorities.map((p, i) => <li key={i}>{p.finding}</li>)}</ul>

      {!unlocked ? (
        <form onSubmit={unlock} style={{ marginTop: 16, display: "grid", gap: 10 }}>
          <p style={{ fontSize: 14 }}>Enter your details to see the full breakdown across all 8 areas.</p>
          <input required type="email" placeholder="Work email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <button type="submit" disabled={status === "loading"} style={{ height: 48, padding: "0 26px", borderRadius: "var(--a4-r-full)", border: 0, background: "#fff", color: "#000", fontWeight: 600, letterSpacing: ".24px", cursor: status === "loading" ? "default" : "pointer", opacity: status === "loading" ? 0.6 : 1 }}>{status === "loading" ? "Sending…" : "Show full breakdown"}</button>
          {status === "error" && <p style={{ color: "#c2303d" }}>Could not send — please try again.</p>}
        </form>
      ) : (
        <div style={{ marginTop: 16 }}>
          <h4>Full breakdown</h4>
          {result.results.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--a4-hairline-light)" }}>
              <span>{r.status === "good" ? "✅" : r.status === "warn" ? "⚠️" : "🔴"} {r.dimension}</span>
              <span style={{ opacity: 0.7 }}>{r.points}/{r.max}</span>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <Button variant="primary" onClick={onStartDeep}>Run a real review of your numbers →</Button>
          </div>
        </div>
      )}
    </div>
  );
}
