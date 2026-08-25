// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Logo, Button, Pill, Badge, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";

export function DocPanel() {
  const docs = [
    { icon: "file-check-2", name: "VAT_Q2_invoices.pdf", meta: "Matched · 38 line items", tag: "Processed", color: "var(--a4-accent-teal)" },
    { icon: "receipt", name: "Expenses_May.csv", meta: "Extracted by automation", tag: "Review", color: "var(--accent-warning)" },
    { icon: "file-text", name: "Audit_pack_2025.zip", meta: "Requested by your team", tag: "Action", color: "var(--a4-primary-bright)" },
  ];
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 460 }}>
      <div style={{ position: "absolute", inset: "-10% -6% -14%", background: "radial-gradient(55% 50% at 60% 35%, rgba(73,79,223,.28), transparent 70%)", filter: "blur(16px)", pointerEvents: "none" }} />
      <div style={{ position: "relative", background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-xl)", padding: 20, boxShadow: "0 30px 80px -34px rgba(0,0,0,.9)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 16, color: "#fff" }}>Documents</div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 600, color: "#000", background: "#fff", borderRadius: "var(--a4-r-full)", padding: "6px 13px" }}>
            <Icon name="upload" size={14} color="#000" /> Upload
          </div>
        </div>
        {/* dropzone */}
        <div style={{ border: "1.5px dashed #3a3d40", borderRadius: "var(--a4-r-md)", padding: "18px", textAlign: "center", marginBottom: 14 }}>
          <Icon name="cloud-upload" size={22} color="var(--a4-stone)" />
          <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-on-dark-mute)", marginTop: 6 }}>Drag invoices, receipts &amp; audit files here</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {docs.map((d) => (
            <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--a4-surface-deep)", border: "1px solid var(--a4-divider-soft)", borderRadius: "var(--a4-r-md)", padding: "12px 13px" }}>
              <span style={{ width: 34, height: 34, borderRadius: "var(--a4-r-sm)", background: "rgba(255,255,255,.05)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Icon name={d.icon} size={17} color="var(--a4-on-dark-mute)" />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-stone)" }}>{d.meta}</div>
              </div>
              <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 10.5, fontWeight: 700, color: d.color, border: `1px solid ${d.color}`, borderRadius: "var(--a4-r-full)", padding: "3px 9px", flexShrink: 0 }}>{d.tag}</span>
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
    <section style={{ background: "#000", padding: "clamp(64px,9vw,120px) 0" }}>
      <Container style={{ display: "flex", gap: 64, flexWrap: "wrap", alignItems: "center" }}>
        <Reveal style={{ flex: "1 1 460px", minWidth: 300 }}>
          <Eyebrow dark>The A4 client portal</Eyebrow>
          <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "#fff", fontSize: "clamp(32px,4.2vw,52px)", lineHeight: 1.06, letterSpacing: "-.02em", margin: "18px 0 0", textWrap: "balance" }}>
            Your accounting, audit, tax, VAT, payroll and documents — in one place.
          </h2>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 18, lineHeight: 1.6, color: "var(--a4-on-dark-mute)", margin: "20px 0 0", maxWidth: 480, textWrap: "pretty" }}>
            A dedicated online portal designed to make financial administration easier, faster and more organised — giving clients better visibility, stronger organisation and a smoother experience.
          </p>
          <div className="portal-caps" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", margin: "30px 0 0" }}>
            {caps.map((c) => (
              <div key={c} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Icon name="check" size={17} color="var(--a4-accent-teal)" stroke={2.4} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, lineHeight: 1.4, color: "var(--a4-on-dark)" }}>{c}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 34 }}>
            <Button variant="primary" size="md">Learn more <Icon name="arrow-right" size={17} color="#000" /></Button>
          </div>
        </Reveal>
        <Reveal delay={120} style={{ flex: "1 1 360px", minWidth: 300, display: "flex", justifyContent: "center" }}>
          <DocPanel />
        </Reveal>
      </Container>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { n: "1", t: "Initial consultation", s: "We understand your business, structure and goals." },
    { n: "2", t: "Service assessment", s: "We map the services you need across accounting, audit, tax and payroll." },
    { n: "3", t: "Digital Onboarding", s: "Your secure workspace is configured and ready in seconds." },
    { n: "4", t: "Structured delivery", s: "Work is delivered through defined, repeatable processes." },
    { n: "5", t: "Ongoing support", s: "A dedicated team keeps you compliant and informed year-round." },
  ];
  return (
    <section style={{ background: "var(--a4-canvas-light)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
          <div>
            <Eyebrow>Step by step</Eyebrow>
            <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "var(--a4-ink)", fontSize: "clamp(34px,4.4vw,56px)", lineHeight: 1.02, letterSpacing: "-.02em", margin: "18px 0 0" }}>
              Simple. Structured. Effective.
            </h2>
          </div>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 17, lineHeight: 1.55, color: "var(--a4-mute)", margin: 0, maxWidth: 340, textWrap: "pretty" }}>
            Follow these steps to engage A4 Services for your business.
          </p>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 0, marginTop: 56, borderTop: "1px solid var(--a4-hairline-light)" }}>
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 70} style={{ padding: "28px 22px 28px 0", borderRight: i < steps.length - 1 ? "1px solid var(--a4-hairline-light)" : "none", paddingLeft: i ? 22 : 0 }}>
              <div style={{ width: 40, height: 40, borderRadius: "var(--a4-r-full)", border: "1px solid var(--a4-hairline-strong)", display: "grid", placeItems: "center", fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 17, color: "var(--a4-ink)" }}>{s.n}</div>
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 19, color: "var(--a4-ink)", margin: "20px 0 0", letterSpacing: "-.2px" }}>{s.t}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, lineHeight: 1.5, color: "var(--a4-mute)", margin: "9px 0 0", textWrap: "pretty" }}>{s.s}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
