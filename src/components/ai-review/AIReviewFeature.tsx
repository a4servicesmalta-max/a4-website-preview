"use client";

import { FileText, Upload, Check, AlertTriangle } from "lucide-react";
import { MUTED_GLOW, gradText } from "@/components/fx/primitives";

interface AIReviewFeatureProps {
  hero: {
    title: string;
    p1: string;
    p2: string;
    p3: string;
  };
  demo: {
    file_ready: string;
    file_name: string;
    categories_title: string;
    categories: string[];
    btn_generate: string;
    upload_title: string;
    upload_drop: string;
    upload_click: string;
    upload_limit: string;
    results_title: string;
    correct_items: string;
    critical_errors: string;
    labels: {
      general: string;
      balance_sheet: string;
    };
  };
}

const SANS = "var(--a4x-display)";
const BODY = "var(--a4x-body)";
const INDIGO = "#4F55F1";
const INK = "#09090B";

const card: React.CSSProperties = { borderRadius: 20, border: "1px solid #E4E4E7", background: "#FAFAFA", padding: 20 };
const cardTitle: React.CSSProperties = { margin: 0, fontFamily: SANS, fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.3, color: INK };
const chip: React.CSSProperties = { flexShrink: 0, height: 24, padding: "0 10px", display: "inline-flex", alignItems: "center", borderRadius: 999, fontFamily: SANS, fontSize: 10.5, fontWeight: 600, letterSpacing: ".06em" };

/** "Auditor-designed financial statement review" → gradient on the last word. */
function gradLast(title: string) {
  const cut = title.lastIndexOf(" ");
  if (cut < 0) return title;
  return (
    <>
      {title.slice(0, cut + 1)}
      <span style={{ ...gradText, paddingBottom: ".06em" }}>{title.slice(cut + 1)}</span>
    </>
  );
}

const AIReviewFeature = ({ hero, demo }: AIReviewFeatureProps) => {
  const categories = demo.categories || [];

  return (
    <section style={{ position: "relative", overflow: "hidden", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", background: MUTED_GLOW, color: INK }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
          gap: "56px 72px",
          alignItems: "center",
        }}
      >
        {/* Left — the review, as the product shows it */}
        <div
          data-fx="rise"
          data-dy="80"
          style={{ background: "#FFFFFF", border: "1px solid #E4E4E7", borderRadius: 28, boxShadow: "0 50px 120px rgba(9,9,11,.12)", padding: "clamp(14px,2vw,20px)" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 12 }}>
            {/* Card 1: Analysis setup */}
            <div data-fx="rise" data-d="150" style={{ ...card, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <h3 style={cardTitle}>{demo.file_ready}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 14, border: "1px solid #E4E4E7", background: "#FFFFFF" }}>
                  <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(79,85,241,.1)" }}>
                    <FileText size={15} color={INDIGO} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: INK }}>{demo.file_name}</p>
                    <p style={{ margin: 0, fontFamily: BODY, fontSize: 11, color: "#71717A" }}>0.25 MB</p>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <h3 style={cardTitle}>{demo.categories_title}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 10px" }}>
                  {categories.map((label, idx) => {
                    const on = label === categories[categories.length - 1];
                    return (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span
                          style={{ width: 16, height: 16, flexShrink: 0, borderRadius: 5, display: "grid", placeItems: "center", border: `1.5px solid ${on ? INDIGO : "#D4D4D8"}`, background: on ? INDIGO : "#FFFFFF" }}
                        >
                          {on && <Check size={10} color="#FFFFFF" strokeWidth={3.5} />}
                        </span>
                        <span style={{ fontFamily: BODY, fontSize: 11.5, fontWeight: 500, color: "#52525B", whiteSpace: "nowrap" }}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <span
                style={{ marginTop: "auto", height: 40, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: INK, color: "#FFFFFF", fontFamily: SANS, fontSize: 13, fontWeight: 600 }}
              >
                {demo.btn_generate}
              </span>
            </div>

            {/* Card 2: Upload */}
            <div data-fx="rise" data-d="260" style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 14 }}>
              <h3 style={{ ...cardTitle, maxWidth: "85%" }}>{demo.upload_title}</h3>
              <div
                style={{ flex: 1, width: "100%", minHeight: 150, borderRadius: 16, border: "1.5px dashed #D4D4D8", background: "#FFFFFF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 14 }}
              >
                <span style={{ width: 38, height: 38, borderRadius: "50%", display: "grid", placeItems: "center", border: "1px solid #E4E4E7", background: "#FAFAFA" }}>
                  <Upload size={16} color={INDIGO} />
                </span>
                <div>
                  <p style={{ margin: 0, fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: INK }}>{demo.upload_drop}</p>
                  <p style={{ margin: 0, fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: INDIGO }}>{demo.upload_click}</p>
                </div>
                <p style={{ margin: 0, fontFamily: BODY, fontSize: 10.5, color: "#71717A" }}>{demo.upload_limit}</p>
              </div>
            </div>
          </div>

          {/* Card 3: Results */}
          <div data-fx="rise" data-d="380" style={{ ...card, marginTop: 12, background: "#FFFFFF" }}>
            <h3 style={{ ...cardTitle, marginBottom: 14 }}>{demo.results_title}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ margin: 0, fontFamily: SANS, fontSize: 12, fontWeight: 600, color: INDIGO }}>{demo.correct_items}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(79,85,241,.25)", background: "rgba(79,85,241,.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span style={{ width: 20, height: 20, flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", background: INDIGO }}>
                      <Check size={11} color="#FFFFFF" strokeWidth={3.5} />
                    </span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: SANS, fontSize: 12, fontWeight: 600, color: "#3F3F46" }}>GI01 - ENTITY_LEGAL_NAME...</span>
                  </div>
                  <span style={{ ...chip, background: "#F4F4F5", color: "#52525B" }}>{demo.labels.general}</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ margin: 0, fontFamily: SANS, fontSize: 12, fontWeight: 600, color: INK }}>{demo.critical_errors}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 12px", borderRadius: 12, border: "1px solid #D4D4D8", background: "#FAFAFA" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <AlertTriangle size={18} color={INK} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: SANS, fontSize: 12, fontWeight: 600, color: "#3F3F46" }}>CS01 - Profit for the year does...</span>
                  </div>
                  <span style={{ ...chip, background: INK, color: "#FFFFFF" }}>{demo.labels.balance_sheet}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — the copy */}
        <div>
          <h2 data-fx="rise" data-d="100" style={{ margin: 0, fontFamily: SANS, fontSize: "clamp(34px,3.8vw,56px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.05 }}>
            {gradLast(hero.title)}
          </h2>
          <p data-fx="rise" data-d="200" style={{ margin: "26px 0 0", fontFamily: SANS, fontSize: "clamp(19px,1.7vw,24px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.4, color: "#3F3F46", textWrap: "pretty" }}>
            {hero.p1}
          </p>
          <p data-fx="rise" data-d="280" style={{ margin: "18px 0 0", fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: "#52525B", textWrap: "pretty" }}>
            {hero.p2}
          </p>
          <p data-fx="rise" data-d="360" style={{ margin: "14px 0 0", fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: "#52525B", textWrap: "pretty" }}>
            {hero.p3}
          </p>
        </div>
      </div>
    </section>
  );
};

export default AIReviewFeature;
