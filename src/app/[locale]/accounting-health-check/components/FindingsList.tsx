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
        <div key={i} style={{ borderLeft: `4px solid ${COLOR[f.severity] || "#00659c"}`, padding: "8px 12px", background: "var(--a4-surface-soft)", borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: COLOR[f.severity] }}>
            {f.severityLabel}{f.location ? ` · ${f.location}` : ""}{f.source === "ai" ? " · AI" : ""}
          </div>
          <div style={{ fontSize: 14, marginTop: 2 }}>{f.description}</div>
        </div>
      ))}
    </div>
  );
}
