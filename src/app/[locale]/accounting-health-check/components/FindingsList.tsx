"use client";
import type { Finding } from "@/app/api/fs-gap-review/types";
import { Icon } from "@/components/a4-landing/Primitives";

/** Severity reads in the palette: ink for critical/high, indigo for medium, zinc for low/info. */
const COLOR: Record<string, string> = {
  critical: "#09090B", high: "#09090B", medium: "#4F55F1", low: "#71717A", info: "#71717A",
};

export function FindingsList({ findings }: { findings: Finding[] }) {
  if (!findings.length)
    return (
      <p style={{ display: "flex", alignItems: "center", gap: 10, margin: 0, fontFamily: "var(--a4x-display)", fontSize: 17, fontWeight: 500, color: "#09090B" }}>
        <span aria-hidden="true" style={{ width: 26, height: 26, flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", background: "#4F55F1" }}>
          <Icon name="check" size={14} color="#FFFFFF" stroke={3} />
        </span>
        No exceptions — every automated check passed.
      </p>
    );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {findings.map((f, i) => (
        // These cards sit on a LIGHT surface inside pages wrapped in
        // `.a4-landing-page`, which sets `color: #fff` — so any text here
        // without its own colour inherits white and is invisible (owner
        // 2026-08-28). Every line states its colour explicitly.
        <div
          key={i}
          style={{
            padding: "12px 16px",
            background: "#FAFAFA",
            borderTop: "1px solid #E4E4E7",
            borderRight: "1px solid #E4E4E7",
            borderBottom: "1px solid #E4E4E7",
            borderLeft: `3px solid ${COLOR[f.severity] || "#71717A"}`,
            borderRadius: 14,
            color: "#09090B",
          }}
        >
          <div style={{ fontFamily: "var(--a4x-body)", fontSize: 12, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: COLOR[f.severity] || "#71717A" }}>
            {f.severityLabel}{f.location ? ` · ${f.location}` : ""}{f.source === "ai" ? " · AI" : ""}
          </div>
          <div style={{ fontFamily: "var(--a4x-body)", fontSize: 14.5, marginTop: 4, lineHeight: 1.55, color: "#3F3F46" }}>{f.description}</div>
        </div>
      ))}
    </div>
  );
}
