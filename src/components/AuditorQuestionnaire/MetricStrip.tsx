"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { BODY, GRAD, INK, SANS, kicker } from "./aqStyle";

interface MetricStripProps {
  metrics: {
    total: number;
    pending: number;
    resolved: number;
    exceptions: number;
    sectionsWithQueries: number;
  };
}

const gradText: React.CSSProperties = { backgroundImage: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" };

export default function MetricStrip({ metrics: data }: MetricStripProps) {
  const { t } = useTranslation("auditor-questionnaire");

  // The figure that needs the reader (pending) carries the gradient.
  const displayMetrics = [
    { key: "m1", value: data.total, style: { color: INK } },
    { key: "m2", value: data.pending, style: gradText },
    { key: "m3", value: data.resolved, style: { color: INK } },
    { key: "m4", value: data.exceptions, style: { color: INK } },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-[#E4E4E7] bg-white">
      {displayMetrics.map((m, i) => (
        <div key={m.key} className={`p-5 sm:p-6 ${i % 2 === 0 ? "border-r" : "lg:border-r"} ${i < 2 ? "border-b lg:border-b-0" : ""} ${i === 3 ? "!border-r-0" : ""} border-[#E4E4E7]`}>
          <div style={{ ...kicker, marginBottom: 8 }}>{t(`metrics.${m.key}.label`)}</div>
          <div style={{ fontFamily: SANS, fontSize: "clamp(32px,2.8vw,42px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.05, ...m.style }}>{m.value}</div>
          <div style={{ marginTop: 4, fontFamily: BODY, fontSize: 12.5, color: "#71717A" }}>{t(`metrics.${m.key}.sub`)}</div>
        </div>
      ))}
    </div>
  );
}
