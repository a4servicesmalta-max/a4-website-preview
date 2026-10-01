"use client";
import { useState } from "react";
import { QUESTIONS, scoreHealthCheck, type HealthResult } from "@/data/accounting-health-check";
import { Icon } from "@/components/a4-landing/Primitives";
import { GRAD, LetterWord } from "@/components/fx/primitives";
import { gcol } from "@/lib/fx/engine";
import { Field, primaryBtn, type Contact } from "./Field";

const SANS = "var(--a4x-display)";
const BODY = "var(--a4x-body)";
const INDIGO = "#4F55F1";
const INK = "#09090B";

const h4: React.CSSProperties = { margin: 0, fontFamily: SANS, fontSize: 22, fontWeight: 600, letterSpacing: "-0.03em", color: INK };

/** good / warn / bad as a small status mark in the palette (the text says which). */
function StatusMark({ status }: { status: "good" | "warn" | "bad" }) {
  const look: React.CSSProperties =
    status === "good"
      ? { background: INDIGO, border: `1.5px solid ${INDIGO}` }
      : status === "warn"
        ? { background: "#FFFFFF", border: `1.5px solid ${INDIGO}` }
        : { background: INK, border: `1.5px solid ${INK}` };
  return (
    <span
      role="img"
      aria-label={status}
      style={{ width: 24, height: 24, flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", ...look }}
    >
      {status === "good" ? (
        <Icon name="check" size={13} color="#FFFFFF" stroke={3} />
      ) : (
        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, lineHeight: 1, color: status === "warn" ? INDIGO : "#FFFFFF" }}>!</span>
      )}
    </span>
  );
}

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
      const res = await fetch("/api/health-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contact, score: result.score, band: result.band, breakdown: result.results }),
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
    // Distinct keys on the two views: the result must mount fresh nodes, or React
    // reuses the quiz's <div>s and FxRuntime never binds the reveals added to them.
    return (
      <div key="quiz">
        <div style={{ height: 4, borderRadius: 2, background: "#F4F4F5", overflow: "hidden" }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: GRAD, transition: "width .5s cubic-bezier(.16,1,.3,1)" }} />
        </div>
        <div key={q.id} data-fx="rise" data-dy="24">
          <div style={{ marginTop: 26, fontFamily: SANS, fontSize: 16, fontWeight: 600, letterSpacing: ".02em", color: "#52525B" }}>
            Question <span style={{ color: INDIGO }}>{step + 1}</span> of {QUESTIONS.length}
          </div>
          <h3 style={{ margin: "12px 0 26px", fontFamily: SANS, fontSize: "clamp(26px,2.8vw,36px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.12, color: INK, textWrap: "balance" }}>{q.prompt}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.answers.map((a, i) => (
              <button key={i} type="button" className="cp-option" onClick={() => choose(q.id, i)}>
                <span style={{ width: 28, flexShrink: 0, fontSize: 15, fontWeight: 600, color: INDIGO }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ flex: 1 }}>{a.label}</span>
                <Icon name="arrow-right" size={17} color="#A1A1AA" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const bandLook: React.CSSProperties =
    result.band === "Healthy"
      ? { background: "rgba(79,85,241,.1)", color: INDIGO, border: "1px solid transparent" }
      : result.band === "Some gaps"
        ? { background: "#FFFFFF", color: INK, border: "1px solid #E4E4E7" }
        : { background: INK, color: "#FFFFFF", border: `1px solid ${INK}` };

  return (
    <div key="result">
      <div data-fx="rise" style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 20, paddingBottom: 28, borderBottom: "1px solid #E4E4E7" }}>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <LetterWord
              text={String(result.score)}
              fx="stack"
              d={150}
              colors={Array.from(String(result.score)).map((_, j, a) => gcol(a.length > 1 ? j / (a.length - 1) : 0))}
              style={{ fontFamily: SANS, fontSize: "clamp(72px,9vw,120px)", fontWeight: 600, letterSpacing: "-0.05em", lineHeight: 0.95 }}
            />
            <span style={{ fontFamily: SANS, fontSize: 24, fontWeight: 600, color: "#71717A" }}>/100</span>
          </div>
        </div>
        <span style={{ height: 36, padding: "0 16px", display: "inline-flex", alignItems: "center", borderRadius: 999, fontFamily: SANS, fontSize: 15, fontWeight: 600, ...bandLook }}>{result.band}</span>
      </div>

      <h4 style={{ ...h4, marginTop: 28 }}>Your top priorities</h4>
      <ul style={{ margin: "14px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
        {result.priorities.map((p, i) => (
          <li key={i} style={{ display: "flex", gap: 12, fontFamily: BODY, fontSize: 15.5, lineHeight: 1.55, color: "#3F3F46" }}>
            <span className="a4-bullet" />
            <span>{p.finding}</span>
          </li>
        ))}
      </ul>

      {!unlocked ? (
        <form onSubmit={unlock} style={{ marginTop: 32, display: "grid", gap: 12 }}>
          <p style={{ margin: "0 0 4px", fontFamily: SANS, fontSize: 18, fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.4, color: "#3F3F46" }}>Enter your details to see the full breakdown across all 8 areas.</p>
          <Field required type="email" placeholder="Work email" aria-label="Work email" autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
          <Field required placeholder="Name" aria-label="Name" autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
          <Field required placeholder="Company" aria-label="Company" autoComplete="organization" value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} />
          <button type="submit" disabled={status === "loading"} style={{ ...primaryBtn(status === "loading"), width: "100%", height: 60, fontSize: 18, marginTop: 6 }}>
            {status === "loading" ? "Sending…" : "Show full breakdown"}
          </button>
          {status === "error" && <p className="cp-error" role="alert" style={{ margin: 0 }}>Could not send — please try again.</p>}
        </form>
      ) : (
        <div style={{ marginTop: 32 }}>
          <h4 style={h4}>Full breakdown</h4>
          <div style={{ marginTop: 10 }}>
            {result.results.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: "1px solid #E4E4E7" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: SANS, fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em", color: INK }}>
                  <StatusMark status={r.status} /> {r.dimension}
                </span>
                <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: "#52525B", fontVariantNumeric: "tabular-nums" }}>{r.points}/{r.max}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, padding: "22px 24px", borderRadius: 20, background: "#F4F4F5" }}>
            <p style={{ margin: "0 0 16px", fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: "#3F3F46" }}>
              Want a real review of your actual numbers? Upload your trial balance or financial statements — your details are saved, no need to re-enter.
            </p>
            <button type="button" onClick={onStartDeep} style={primaryBtn()}>Run a real review of your numbers →</button>
          </div>
        </div>
      )}
    </div>
  );
}
