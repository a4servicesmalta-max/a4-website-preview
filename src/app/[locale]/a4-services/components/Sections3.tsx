"use client";

import React from "react";
import { Button, Eyebrow, Icon, Container } from "@/components/a4-landing/Primitives";
import { DARK_GRID, GRAD, MUTED_GLOW, gradText } from "@/components/fx/primitives";

const INK = "#09090B";
const INDIGO = "#4F55F1";
const PERI = "#8B8FF7";
const BODY = "var(--a4x-body)";

export function DocPanel() {
  const docs = [
    { icon: "file-check-2", name: "VAT_Q2_invoices.pdf", meta: "Matched · 38 line items", tag: "Processed", color: PERI },
    { icon: "receipt", name: "Expenses_May.csv", meta: "Extracted by automation", tag: "Review", color: "#E4E4E7" },
    { icon: "file-text", name: "Audit_pack_2025.zip", meta: "Requested by your team", tag: "Action", color: PERI },
  ];
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 460 }}>
      <div style={{ position: "relative", background: "rgba(24,24,27,.92)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 28, padding: 22, boxShadow: "0 40px 100px rgba(0,0,0,.45)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--a4x-display)", fontWeight: 600, fontSize: 18, letterSpacing: "-0.02em", color: "#fff" }}>Documents</div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, height: 34, padding: "0 14px", borderRadius: 999, background: "#fff", color: INK, fontFamily: "var(--a4x-display)", fontSize: 13, fontWeight: 600 }}>
            <Icon name="upload" size={14} color={INK} /> Upload
          </div>
        </div>
        {/* dropzone */}
        <div style={{ border: "1.5px dashed #3F3F46", borderRadius: 16, padding: 18, textAlign: "center", marginBottom: 14 }}>
          <Icon name="cloud-upload" size={22} color="#71717A" />
          <div style={{ fontFamily: BODY, fontSize: 13, color: "#A1A1AA", marginTop: 6 }}>Drag invoices, receipts &amp; audit files here</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {docs.map((d) => (
            <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 12, background: INK, border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "12px 13px" }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.05)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Icon name={d.icon} size={17} color="#A1A1AA" />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: BODY, fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
                <div style={{ fontFamily: BODY, fontSize: 12, color: "#71717A" }}>{d.meta}</div>
              </div>
              <span style={{ fontFamily: "var(--a4x-display)", fontSize: 12, fontWeight: 600, color: d.color, border: "1px solid rgba(255,255,255,.18)", borderRadius: 999, padding: "3px 10px", flexShrink: 0 }}>{d.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Portal() {
  const caps = [
    "Upload invoices, receipts and audit documents",
    "View document requests from our team",
    "Track missing information",
    "Monitor deadlines and pending tasks",
    "Access reports and submitted documents",
    "Communicate with our team",
    "Store financial documentation in one space",
    "Manage VAT, audit, tax and accounting docs",
    "Reduce email back-and-forth",
    "Keep a clear record of submitted information",
  ];
  return (
    <section style={{ position: "relative", overflow: "hidden", background: DARK_GRID, color: "#fff", padding: "clamp(100px,13vw,180px) 0" }}>
      <Container style={{ display: "flex", gap: 64, flexWrap: "wrap", alignItems: "center" }}>
        <div data-fx="rise" style={{ flex: "1 1 460px", minWidth: 0 }}>
          <Eyebrow dark>The A4 client portal</Eyebrow>
          <h2 style={{ fontFamily: "var(--a4x-display)", fontWeight: 600, color: "#fff", fontSize: "clamp(32px,3.6vw,52px)", lineHeight: 1.04, letterSpacing: "-0.04em", margin: "16px 0 0", textWrap: "balance" }}>
            Your accounting, audit, tax, VAT, payroll and documents — <span style={gradText}>in one place.</span>
          </h2>
          <p style={{ fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: "#A1A1AA", margin: "20px 0 0", maxWidth: 520, textWrap: "pretty" }}>
            A dedicated online portal designed to make financial administration easier, faster and more organised — giving clients better visibility, stronger organisation and a smoother experience.
          </p>
          <div className="portal-caps" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", margin: "30px 0 0" }}>
            {caps.map((c) => (
              <div key={c} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span className="a4-bullet" style={{ background: PERI }} />
                <span style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.5, color: "#E4E4E7" }}>{c}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 34 }}>
            <Button variant="primary" size="md">Learn more <Icon name="arrow-right" size={17} color={INK} /></Button>
          </div>
        </div>
        <div data-fx="rise" data-d="120" style={{ flex: "1 1 360px", minWidth: 0, display: "flex", justifyContent: "center" }}>
          <DocPanel />
        </div>
      </Container>
    </section>
  );
}

/* The timeline turns vertical on narrow screens: the horizontal track and its
   scroll fill step aside and each step draws its own connector to the next. */
const HIW_CSS = `
.hiw-steps { grid-template-columns: repeat(5, minmax(0, 1fr)); }
@media (max-width: 1023px) {
  .hiw-track, .hiw-fill { display: none; }
  .hiw-steps { grid-template-columns: 1fr !important; row-gap: 40px !important; }
  .hiw-step { position: relative; display: grid; grid-template-columns: 24px minmax(0, 1fr); column-gap: 22px; }
  .hiw-step > * { grid-column: 2; }
  .hiw-step > .hiw-dot { grid-column: 1; grid-row: 1 / span 3; }
  .hiw-step > .hiw-num { margin-top: 0 !important; }
  .hiw-step:not(:last-child)::after { content: ""; position: absolute; left: 11px; top: 30px; bottom: -34px; width: 2px; border-radius: 1px; background: #D4D4D8; }
}
`;

export function HowItWorks() {
  const steps = [
    { n: "1", t: "Initial consultation", s: "We understand your business, structure and goals." },
    { n: "2", t: "Service assessment", s: "We map the services you need across accounting, audit, tax and payroll." },
    { n: "3", t: "Digital Onboarding", s: "Your secure workspace is configured and ready in seconds." },
    { n: "4", t: "Structured delivery", s: "Work is delivered through defined, repeatable processes." },
    { n: "5", t: "Ongoing support", s: "A dedicated team keeps you compliant and informed year-round." },
  ];
  return (
    <section data-sec="how-it-works" style={{ position: "relative", background: MUTED_GLOW, color: INK, padding: "clamp(100px,13vw,180px) 0" }}>
      <style>{HIW_CSS}</style>
      <Container>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "20px 64px" }}>
          <div style={{ minWidth: 0 }}>
            <div data-fx="rise">
              <Eyebrow>Step by step</Eyebrow>
            </div>
            <h2 data-fx="rise" data-d="100" style={{ margin: "16px 0 0", fontFamily: "var(--a4x-display)", fontSize: "clamp(40px,5.6vw,92px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.02, color: INK }}>
              Simple. Structured. <span style={{ ...gradText, paddingBottom: ".06em" }}>Effective.</span>
            </h2>
          </div>
          <p data-fx="rise" data-d="200" style={{ margin: 0, maxWidth: 340, fontFamily: BODY, fontSize: 17, lineHeight: 1.55, color: "#52525B", textWrap: "pretty" }}>
            Follow these steps to engage A4 Services for your business.
          </p>
        </div>

        {/* The design's onboarding timeline: the line fills and the dots pop with scroll. */}
        <div data-tl="" style={{ position: "relative", marginTop: "clamp(56px,7vw,96px)" }}>
          <div className="hiw-track" aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: 11, height: 2, background: "#D4D4D8" }} />
          <div className="hiw-fill" data-tl-fill="" aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: 11, height: 2, background: GRAD }} />
          <ol className="hiw-steps" style={{ position: "relative", listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "48px 28px" }}>
            {steps.map((s, i) => (
              <li key={s.n} className="hiw-step" data-fx="rise" data-d={i * 100}>
                <div className="hiw-dot" aria-hidden="true" style={{ position: "relative", zIndex: 1, width: 24, height: 24, borderRadius: "50%", background: "#FFFFFF", border: "2px solid #E4E4E7" }}>
                  <span data-tl-dot="" style={{ position: "absolute", inset: 3, borderRadius: "50%", background: INDIGO, transition: "transform .45s cubic-bezier(.16,1,.3,1)" }} />
                </div>
                <div className="hiw-num" style={{ marginTop: 28, fontFamily: "var(--a4x-display)", fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: INDIGO }}>{String(i + 1).padStart(2, "0")}</div>
                <h3 style={{ margin: "8px 0 0", fontFamily: "var(--a4x-display)", fontSize: "clamp(24px,2vw,30px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.12, color: INK, textWrap: "balance" }}>{s.t}</h3>
                <p style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: "#52525B", textWrap: "pretty" }}>{s.s}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
