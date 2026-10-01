import React from "react";
import { Eyebrow } from "@/components/fx/primitives";
import { BODY, Band, DarkStage, DocPanel, GRAD, INDIGO, INK, SANS, StatusPill } from "@/components/services/SectionKit";

interface TechnologyOverviewProps {
  title: string;
  /** Empty when the page shows it in the hero. */
  p1: string;
  p2: string;
  p3: string;
  backgroundAlt?: string;
  progressAlt?: string;
  dataAlt?: string;
  /** Section number for the eyebrow ("01"). */
  n?: string;
}

const TASKS = [
  { t: "Review the audit findings", s: "Filled", done: true },
  { t: "Reconcile bank statements", s: "Start", done: false },
  { t: "Complete the risk assessment", s: "Start", done: false },
];

function ProgressCard({ label }: { label: string }) {
  return (
    <DocPanel label={label} style={{ width: "min(100%, 400px)", boxShadow: "0 40px 100px rgba(0,0,0,.45)" }}>
      <div style={{ padding: "20px 22px 6px" }}>
        <div style={{ position: "relative", height: 44, borderRadius: 14, background: "#F4F4F5", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: "0 58% 0 0", borderRadius: 14, background: GRAD, display: "flex", alignItems: "center", paddingLeft: 16 }}>
            <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 600, color: "#FFFFFF" }}>Progress</span>
          </div>
        </div>
      </div>
      <div style={{ padding: "6px 22px 14px" }}>
        {TASKS.map((task, i) => (
          <div key={task.t} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 0", borderTop: i ? "1px solid #E4E4E7" : "none" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <span style={{ width: 32, height: 32, borderRadius: 10, background: "#F4F4F5", display: "grid", placeItems: "center", flexShrink: 0, fontFamily: SANS, fontSize: 12, fontWeight: 600, color: INDIGO }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 500 }}>{task.t}</span>
            </span>
            <StatusPill tone={task.done ? "indigo" : "line"}>{task.s}</StatusPill>
          </div>
        ))}
      </div>
    </DocPanel>
  );
}

function GrowthCard({ label }: { label: string }) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <DocPanel label={label} style={{ width: "min(100%, 340px)", padding: "20px 22px 22px", boxShadow: "0 40px 100px rgba(0,0,0,.45)" }}>
      <div style={{ display: "flex", gap: 6, padding: 4, borderRadius: 999, background: "#F4F4F5", border: "1px solid #E4E4E7" }}>
        {["Weekly", "Monthly", "Yearly"].map((p, i) => (
          <span key={p} style={{ flex: 1, height: 32, borderRadius: 999, display: "grid", placeItems: "center", fontFamily: SANS, fontSize: 13, fontWeight: 600, background: i === 0 ? INK : "transparent", color: i === 0 ? "#FFFFFF" : "#52525B" }}>
            {p}
          </span>
        ))}
      </div>
      <svg viewBox="0 0 300 110" width="100%" height="110" aria-hidden="true" style={{ display: "block", marginTop: 14 }}>
        <defs>
          <linearGradient id="techGrowthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4F55F1" stopOpacity=".22" />
            <stop offset="1" stopColor="#4F55F1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="techGrowthLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4F55F1" />
            <stop offset=".55" stopColor="#6468F3" />
            <stop offset="1" stopColor="#8B8FF7" />
          </linearGradient>
        </defs>
        <path d="M6 82 C 22 30, 46 30, 56 58 S 80 64, 96 92 C 120 40, 132 8, 150 10 S 170 70, 196 76 S 226 40, 240 46 S 256 82, 294 84 L 294 110 L 6 110 Z" fill="url(#techGrowthFill)" />
        <path d="M6 82 C 22 30, 46 30, 56 58 S 80 64, 96 92 C 120 40, 132 8, 150 10 S 170 70, 196 76 S 226 40, 240 46 S 256 82, 294 84" fill="none" stroke="url(#techGrowthLine)" strokeWidth="3" strokeLinecap="round" />
        {[
          [6, 82],
          [56, 58],
          [96, 92],
          [150, 10],
          [196, 76],
          [240, 46],
          [294, 84],
        ].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="4.5" fill="#FFFFFF" stroke="#4F55F1" strokeWidth="2.5" />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 12, fontWeight: 600, color: "#71717A", marginTop: 6 }}>
        {days.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
        {[
          { v: "$21,000", up: true },
          { v: "$11,000", up: false },
        ].map((f) => (
          <div key={f.v} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 14, background: "#FAFAFA", border: "1px solid #E4E4E7" }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, display: "grid", placeItems: "center", background: f.up ? INDIGO : INK, color: "#FFFFFF", fontSize: 14, fontWeight: 700 }}>
              {f.up ? "↑" : "↓"}
            </span>
            <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em" }}>{f.v}</span>
          </div>
        ))}
      </div>
    </DocPanel>
  );
}

/**
 * "Our Technology" overview: numbered eyebrow, the lead and body copy, and two
 * sample panels (progress, growth) floating on the dark stage.
 */
const TechnologyOverview = ({ title, p1, p2, p3, progressAlt = "Progress Tracker Card", dataAlt = "Data Visualization Card", n }: TechnologyOverviewProps) => {
  const paras = [p1, p2, p3].filter(Boolean);
  // A long opening paragraph leads with its first sentence; the rest reads as body copy.
  if (paras[0] && paras[0].length > 220) {
    const m = paras[0].match(/^([\s\S]+?[.!?])\s+([\s\S]+)$/);
    if (m) paras.splice(0, 1, m[1], m[2]);
  }
  return (
    <Band surface="light">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-14 lg:gap-[72px] items-center">
        <div>
          <Eyebrow n={n}>{title}</Eyebrow>
          <div data-fx="rise" data-d="100" style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 18 }}>
            {paras.map((p, i) =>
              i === 0 ? (
                <p key={i} style={{ margin: 0, fontFamily: SANS, fontSize: "clamp(21px,1.9vw,27px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.38, color: INK, textWrap: "pretty" }}>
                  {p}
                </p>
              ) : (
                <p key={i} style={{ margin: 0, fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: "#52525B", textWrap: "pretty" }}>
                  {p}
                </p>
              )
            )}
          </div>
        </div>
        <div data-fx="rise" data-d="150" data-dy="70" style={{ minWidth: 0 }}>
          <DarkStage minHeight={520}>
            <ProgressCard label={progressAlt} />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -36 }} className="max-sm:!mt-4">
              <GrowthCard label={dataAlt} />
            </div>
          </DarkStage>
        </div>
      </div>
    </Band>
  );
};

export default TechnologyOverview;
