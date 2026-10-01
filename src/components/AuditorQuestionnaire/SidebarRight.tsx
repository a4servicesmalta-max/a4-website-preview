"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { Adjustment } from "./QuestionnaireLayout";
import { BODY, GRAD, INK, SANS, kicker, pill, type AqTone } from "./aqStyle";

export default function SidebarRight({ adjustments = [] }: { adjustments?: Adjustment[] }) {
  const { t } = useTranslation("auditor-questionnaire");

  const assertions = [
    { name: "Existence", status: "open" },
    { name: "Completeness", status: "partial" },
    { name: "Accuracy", status: "done" },
    { name: "Valuation", status: "open" },
    { name: "Rights & Obligations", status: "done" },
    { name: "Presentation", status: "partial" },
  ];

  /** open = flag (ink), partial = hairline, done = indigo. */
  const toneFor = (status: string): AqTone => (status === "open" ? "flag" : status === "partial" ? "open" : "done");

  return (
    <aside className="flex flex-col overflow-y-auto lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)] border-t lg:border-t-0 border-[#E4E4E7]" style={{ background: "#FAFAFA" }}>
      {/* Assertions */}
      <div className="p-5 border-b border-[#E4E4E7]">
        <div style={{ ...kicker, marginBottom: 12 }}>{t("sidebarRight.title1")}</div>

        <div className="flex flex-col">
          {assertions.map((a, i) => (
            <div key={i} className="flex items-center justify-between gap-2" style={{ padding: "9px 0", borderTop: i ? "1px solid #E4E4E7" : "none" }}>
              <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: INK }}>{a.name}</span>
              <span style={pill(toneFor(a.status), { height: 22 })}>{a.status}</span>
            </div>
          ))}
        </div>

        {/* Mini progress */}
        <div className="mt-4 overflow-hidden" style={{ height: 6, borderRadius: 3, background: "#E4E4E7" }}>
          <div className="h-full" style={{ width: "45%", borderRadius: 3, background: GRAD }} />
        </div>
      </div>

      {/* Proposed Adjustments */}
      <div className="p-5">
        <div style={{ ...kicker, marginBottom: 4 }}>{t("sidebarRight.title2")}</div>
        <div style={{ fontFamily: BODY, fontSize: 12, color: "#71717A", marginBottom: 14 }}>{t("sidebarRight.adjSub")}</div>

        {adjustments.length === 0 ? (
          <div className="text-center p-4" style={{ border: "1.5px dashed #D4D4D8", borderRadius: 16, fontFamily: BODY, fontSize: 12.5, color: "#71717A" }}>
            No proposed adjustments for this section.
          </div>
        ) : (
          adjustments.map((adj) => (
            <div key={adj.id} className="mb-2" style={{ padding: 14, background: "#FFFFFF", border: "1px solid #E4E4E7", borderRadius: 16 }}>
              <div style={{ fontFamily: BODY, fontSize: 11.5, color: "#71717A", marginBottom: 4 }}>
                {adj.id} · {adj.type}
              </div>
              <div style={{ fontFamily: BODY, fontSize: 13, lineHeight: 1.45, color: "#3F3F46" }}>{adj.desc}</div>
              <div style={{ marginTop: 8, fontFamily: SANS, fontSize: 15, fontWeight: 600, letterSpacing: "-0.02em", color: INK, fontVariantNumeric: "tabular-nums" }}>{adj.amount}</div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
