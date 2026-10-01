"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Paperclip, CheckCircle } from "lucide-react";
import { BODY, INDIGO, INK, PERI, SANS, kicker } from "./aqStyle";

interface Question {
  id: string;
  number: number;
  priority: string;
  status: string;
  tags: string[];
  text: string;
  context: string;
  evidence: string[];
}

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const { t } = useTranslation("auditor-questionnaire");
  const answered = question.status === "answered";

  // Priority on the palette: high = indigo, medium = periwinkle, low = hairline grey.
  const priorityColor = question.priority === "high" ? INDIGO : question.priority === "medium" ? PERI : "#E4E4E7";
  // Answered reads indigo, an exception is flagged in ink.
  const borderColor = answered ? "rgba(79,85,241,.45)" : question.status === "exception" ? INK : undefined;

  const chip: React.CSSProperties = { display: "inline-flex", alignItems: "center", height: 26, padding: "0 11px", borderRadius: 999, fontFamily: SANS, fontSize: 12, fontWeight: 600 };

  return (
    <div
      className="group bg-white mb-6 overflow-hidden rounded-[24px] border border-[#E4E4E7] transition-[border-color,box-shadow] duration-300 hover:border-[rgba(79,85,241,.45)] hover:shadow-[0_24px_60px_rgba(79,85,241,.12)]"
      style={borderColor ? { borderColor } : undefined}
    >
      <div className="flex">
        {/* Left Column (Number & Priority Line) */}
        <div className="w-14 sm:w-16 shrink-0 flex flex-col items-center pt-6 pb-4 border-r border-[#F4F4F5]" style={{ background: "#FAFAFA" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              display: "grid",
              placeItems: "center",
              marginBottom: 14,
              fontFamily: SANS,
              fontSize: 14,
              fontWeight: 600,
              background: answered ? INDIGO : "#FFFFFF",
              color: answered ? "#FFFFFF" : "#52525B",
              border: `1.5px solid ${answered ? INDIGO : "#D4D4D8"}`,
            }}
          >
            {question.number}
          </div>
          <div className="flex-1" style={{ width: 3, minHeight: 20, borderRadius: 2, background: priorityColor }} />
        </div>

        {/* Right Column (Content) */}
        <div className="flex-1 min-w-0">
          <div className="p-5 border-b border-[#F4F4F5]">
            {/* Tags & ID */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span style={{ ...chip, background: INK, color: "#FFFFFF" }}>{question.id}</span>
              {question.tags.map((tag) => (
                <span key={tag} style={{ ...chip, background: "#FFFFFF", color: "#52525B", border: "1px solid #E4E4E7" }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* Question Text */}
            <div style={{ fontFamily: BODY, fontSize: 16, fontWeight: 500, lineHeight: 1.55, color: INK, marginBottom: 12 }}>{question.text}</div>

            {/* Context */}
            <div style={{ fontFamily: BODY, fontSize: 13.5, lineHeight: 1.55, color: "#52525B", padding: "12px 16px", borderLeft: `3px solid ${PERI}`, background: "#FAFAFA", borderRadius: "0 12px 12px 0" }}>{question.context}</div>
          </div>

          <div className="p-5">
            {/* Evidence */}
            <div className="mb-5">
              <div style={{ ...kicker, marginBottom: 8 }}>{t("question.evidenceLabel")}</div>
              <div className="flex flex-wrap gap-2">
                {question.evidence.map((ev) => (
                  <button
                    key={ev}
                    type="button"
                    className="inline-flex items-center gap-1.5 transition-colors hover:border-[rgba(79,85,241,.45)] hover:text-[#09090B]"
                    style={{ height: 32, padding: "0 12px", borderRadius: 999, border: "1px solid #E4E4E7", background: "#FFFFFF", fontFamily: BODY, fontSize: 12.5, color: "#52525B", cursor: "pointer" }}
                  >
                    <Paperclip className="w-3.5 h-3.5" aria-hidden="true" />
                    {ev}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="mb-5">
              <div style={{ ...kicker, marginBottom: 8 }}>{t("question.optionsLabel")}</div>
              <div className="flex flex-col gap-2">
                <label
                  className="flex items-start gap-3 cursor-pointer transition-colors hover:border-[rgba(79,85,241,.45)]"
                  style={{ padding: 14, borderRadius: 16, border: `1px solid ${answered ? "rgba(79,85,241,.45)" : "#E4E4E7"}`, background: answered ? "rgba(79,85,241,.06)" : "#FFFFFF" }}
                >
                  <span style={{ width: 20, height: 20, marginTop: 1, borderRadius: 10, flexShrink: 0, display: "grid", placeItems: "center", border: `1.5px solid ${answered ? INDIGO : "#D4D4D8"}`, background: answered ? INDIGO : "#FFFFFF" }}>
                    {answered && <span style={{ width: 7, height: 7, borderRadius: 4, background: "#FFFFFF" }} />}
                  </span>
                  <span>
                    <span style={{ display: "block", fontFamily: SANS, fontSize: 15, fontWeight: 600, color: INK }}>Satisfactory explanation provided</span>
                    <span style={{ display: "block", marginTop: 2, fontFamily: BODY, fontSize: 12.5, color: "#71717A" }}>Clear without adjustment</span>
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer transition-colors hover:border-[rgba(79,85,241,.45)]" style={{ padding: 14, borderRadius: 16, border: "1px solid #E4E4E7", background: "#FFFFFF" }}>
                  <span style={{ width: 20, height: 20, marginTop: 1, borderRadius: 10, flexShrink: 0, border: "1.5px solid #D4D4D8", background: "#FFFFFF" }} />
                  <span>
                    <span style={{ display: "block", fontFamily: SANS, fontSize: 15, fontWeight: 600, color: INK }}>Proposed adjustment required</span>
                    <span style={{ display: "block", marginTop: 2, fontFamily: BODY, fontSize: 12.5, color: "#71717A" }}>Post to schedule of uncorrected misstatements</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <div style={{ ...kicker, marginBottom: 8 }}>{t("question.notesLabel")}</div>
              <textarea
                aria-label={t("question.notesLabel")}
                className="w-full resize-y outline-none transition-colors focus:border-[#4F55F1] placeholder:text-[#A1A1AA]"
                style={{ height: 92, padding: "12px 14px", borderRadius: 14, border: "1px solid #E4E4E7", background: "#FFFFFF", fontFamily: BODY, fontSize: 14, color: INK }}
                placeholder={t("question.notesPlaceholder")}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 px-5 py-4 border-t border-[#F4F4F5]" style={{ background: "#FAFAFA" }}>
            {answered ? (
              <div className="flex items-center gap-2 mr-auto" style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: INDIGO }}>
                <CheckCircle className="w-4 h-4" aria-hidden="true" />
                Resolution saved
              </div>
            ) : (
              <button type="button" className="a4-btn a4-btn-ink" style={{ height: 40, padding: "0 20px", fontSize: 14 }}>
                {t("question.save")}
              </button>
            )}

            {!answered && (
              <button
                type="button"
                className="transition-colors hover:text-[#09090B]"
                style={{ height: 40, padding: "0 12px", border: 0, background: "transparent", fontFamily: SANS, fontSize: 13.5, fontWeight: 600, color: "#71717A", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                {t("question.skip")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
