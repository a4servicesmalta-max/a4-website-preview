"use client";

import { Eyebrow } from "@/components/a4-landing/Primitives";
import { DARK_CARD, DriftGlow, LIGHT_GLOW, gradText } from "@/components/fx/primitives";

interface ReviewOutputSectionProps {
  output: {
    badge: string;
    heading: string;
    subheading: string;
    report_features: {
      title: string;
      items: string[];
    };
    marking_features: {
      title: string;
      items: string[];
    };
    footer_text: string;
    demo_result: {
      title: string;
      status: string;
      items: string[];
      label: string;
    };
  };
}

const SANS = "var(--a4x-display)";
const BODY = "var(--a4x-body)";
const INDIGO = "#4F55F1";
const INK = "#09090B";

/** "Review output" → gradient on the last word. */
function gradLast(title: string) {
  const cut = title.lastIndexOf(" ");
  if (cut < 0) return <span style={{ ...gradText, paddingBottom: ".06em" }}>{title}</span>;
  return (
    <>
      {title.slice(0, cut + 1)}
      <span style={{ ...gradText, paddingBottom: ".06em" }}>{title.slice(cut + 1)}</span>
    </>
  );
}

const ReviewOutputSection = ({ output }: ReviewOutputSectionProps) => {
  const reportFeatures = output.report_features.items || [];
  const markingFeatures = output.marking_features.items || [];
  const demoItems = output.demo_result.items || [];
  // The badge repeats the heading in the copy; show it only when it adds something.
  const showBadge = !!output.badge && output.badge.trim().toLowerCase() !== output.heading.trim().toLowerCase();

  const lists = [
    { title: output.report_features.title, items: reportFeatures },
    { title: output.marking_features.title, items: markingFeatures },
  ];

  return (
    <section style={{ position: "relative", overflow: "hidden", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", background: LIGHT_GLOW, color: INK }}>
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
        {/* Left: heading and the two lists */}
        <div>
          {showBadge && (
            <div data-fx="rise" style={{ marginBottom: 16 }}>
              <Eyebrow>{output.badge}</Eyebrow>
            </div>
          )}
          <h2 data-fx="rise" data-d="100" style={{ margin: 0, fontFamily: SANS, fontSize: "clamp(40px,5vw,80px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.03 }}>
            {gradLast(output.heading)}
          </h2>
          <p data-fx="rise" data-d="200" style={{ margin: "20px 0 0", maxWidth: 520, fontFamily: SANS, fontSize: "clamp(19px,1.7vw,24px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.4, color: "#3F3F46" }}>
            {output.subheading}
          </p>

          <div style={{ marginTop: 36, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 12 }}>
            {lists.map((l, li) => (
              <div key={li} data-fx="rise" data-d={260 + li * 80} className={`cp-card${li === 1 ? " cp-dark" : ""}`} style={{ padding: 24 }}>
                <h3 style={{ margin: 0, fontFamily: SANS, fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>{l.title}</h3>
                <ul style={{ margin: "14px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {l.items.map((item, i) => (
                    <li key={i} style={{ display: "flex", gap: 12, fontFamily: SANS, fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em", color: li === 1 ? "#E4E4E7" : "#3F3F46" }}>
                      <span className="a4-bullet" style={li === 1 ? { background: "#8B8FF7" } : undefined} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p data-fx="rise" data-d="400" style={{ margin: "24px 0 0", maxWidth: 520, fontFamily: BODY, fontSize: 15.5, lineHeight: 1.6, color: "#52525B" }}>
            {output.footer_text}
          </p>
        </div>

        {/* Right: the result document on the design's dark card */}
        <div
          data-fx="rise"
          data-d="150"
          data-dy="80"
          style={{ position: "relative", overflow: "hidden", borderRadius: 28, background: DARK_CARD, border: "1px solid rgba(255,255,255,.08)", padding: "clamp(28px,5vw,64px) clamp(18px,4vw,48px)", boxShadow: "0 50px 120px rgba(9,9,11,.18)" }}
        >
          <DriftGlow left="-40%" top="-60%" strength={0.3} />
          <div style={{ position: "relative", maxWidth: 460, margin: "0 auto", padding: 24, borderRadius: 24, background: "#FFFFFF", border: "1px solid #E4E4E7", boxShadow: "0 40px 100px rgba(0,0,0,.35)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ margin: 0, fontFamily: SANS, fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", color: INK }}>{output.demo_result.title}</p>
              <span className="cp-pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: INDIGO }} />
            </div>
            <p style={{ margin: "0 0 16px", width: "fit-content", height: 28, padding: "0 12px", display: "flex", alignItems: "center", borderRadius: 999, background: INK, fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: "#FFFFFF" }}>
              {output.demo_result.status}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {demoItems.map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 12px", borderRadius: 14, border: "1px solid #E4E4E7", background: "#FAFAFA" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <span style={{ width: 20, height: 20, flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", background: INK, fontFamily: SANS, fontSize: 11, fontWeight: 700, color: "#FFFFFF" }}>!</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: SANS, fontSize: 12.5, fontWeight: 600, color: "#3F3F46" }}>{item}</span>
                  </div>
                  <span style={{ flexShrink: 0, height: 22, padding: "0 9px", display: "inline-flex", alignItems: "center", borderRadius: 999, border: "1px solid #E4E4E7", background: "#FFFFFF", fontFamily: SANS, fontSize: 10.5, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "#52525B" }}>
                    {output.demo_result.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewOutputSection;
