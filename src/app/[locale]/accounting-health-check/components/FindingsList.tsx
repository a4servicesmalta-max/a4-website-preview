"use client";
import type { Finding } from "@/app/api/fs-gap-review/types";

const COLOR: Record<string, string> = {
  critical: "#c2303d", high: "#c2303d", medium: "#9a5a00", low: "#00659c", info: "#00659c",
};

export function FindingsList({ findings }: { findings: Finding[] }) {
  if (!findings.length) return <p style={{ color: "var(--a4-accent-teal)" }}>No exceptions — every automated check passed. ✅</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {findings.map((f, i) => (
        // These cards sit on a LIGHT surface inside pages wrapped in
        // `.a4-landing-page`, which sets `color: #fff` — so any text here
        // without its own colour inherits white and is invisible (owner
        // 2026-08-28). Every line states its colour explicitly.
        <div key={i} style={{ borderLeft: `4px solid ${COLOR[f.severity] || "#00659c"}`, padding: "8px 12px", background: "var(--a4-surface-soft)", borderRadius: 8, color: "var(--a4-ink)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: COLOR[f.severity] || "#00659c" }}>
            {f.severityLabel}{f.location ? ` · ${f.location}` : ""}{f.source === "ai" ? " · AI" : ""}
          </div>
          <div style={{ fontSize: 14, marginTop: 2, lineHeight: 1.55, color: "var(--a4-ink)" }}>{f.description}</div>
        </div>
      ))}
    </div>
  );
}
