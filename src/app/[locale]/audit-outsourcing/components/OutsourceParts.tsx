"use client";

import React, { useState, useEffect } from "react";
import { Button, Icon } from "@/components/a4-landing/Primitives";
import { DARK_CARD } from "@/components/fx/primitives";
import {
  BODY, Bullet, CardGrid, CtaBand, G, Head, INDIGO, INK, InfoCard, KitStyles, PERI, PaidHero, SANS, Section, SkewMark, Timeline, ctaPill, kicker, pad2,
} from "@/app/[locale]/accounting-services/components/PaidLandingKit";

// OutsourceParts — Audit outsourcing landing (from New website OutsourceParts.jsx),
// set in the A4 design language (docs/DESIGN-LANGUAGE.md).

// Hero white-label portal mock — mock firm logo + branding-theme switcher.
// The swatches stay inside the A4 palette.
const THEMES = ["#8B8FF7", "#4F55F1", "#E4E4E7", "#A1A1AA"];

function OSFileMock() {
  const [t, setT] = useState(THEMES[0]);
  return (
    <div style={{ width: "100%", maxWidth: 470, background: DARK_CARD, border: "1px solid rgba(255,255,255,.1)", borderRadius: 28, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,.5)", fontFamily: SANS }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,.08)", background: "rgba(9,9,11,.6)" }}>
        <span style={{ flex: 1, height: 30, background: INK, border: "1px solid rgba(255,255,255,.1)", borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
          <Icon name="lock" size={12} color="#A1A1AA" />
          <span style={{ fontFamily: BODY, fontSize: 12.5, color: "#D4D4D8" }}>audit.yourfirm.com</span>
        </span>
      </div>
      <div style={{ padding: "22px 24px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px dashed rgba(255,255,255,.28)", borderRadius: 14, padding: "8px 14px" }}>
            <Icon name="image" size={14} color="#A1A1AA" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#D4D4D8" }}>Your logo here</span>
          </span>
          <span style={{ width: 32, height: 32, borderRadius: 999, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, color: "#fff" }}>JT</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18, padding: "11px 14px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14 }}>
          <Icon name="palette" size={15} color="#A1A1AA" />
          <span style={{ fontFamily: BODY, fontSize: 13, color: "#D4D4D8", flex: 1 }}>Brand theme</span>
          <div style={{ display: "flex", gap: 8 }}>
            {THEMES.map((c, i) => (
              <button
                key={c}
                type="button"
                onClick={() => setT(c)}
                aria-label={`Theme ${i + 1}`}
                aria-pressed={t === c}
                style={{ width: 22, height: 22, borderRadius: 999, background: c, cursor: "pointer", border: t === c ? "2px solid #fff" : "2px solid transparent", padding: 0, boxShadow: "0 0 0 1px rgba(255,255,255,.14)" }}
              />
            ))}
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <div style={{ ...kicker, color: "#A1A1AA" }}>Statutory audit · 2025</div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 24, color: "#fff", letterSpacing: "-0.03em" }}>Blue Harbour Ltd</span>
            <span style={{ fontWeight: 600, fontSize: 20, color: t, transition: "color .3s" }}>40%</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,.08)", borderRadius: 999, overflow: "hidden", marginTop: 12 }}>
            <div style={{ height: "100%", width: "40%", background: t, borderRadius: 999, transition: "background .3s" }} />
          </div>
        </div>
        <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "12px 14px" }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: PERI }} />
          <span style={{ fontFamily: BODY, fontSize: 13.5, color: "#fff", flex: 1 }}>2 items awaiting your review</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#E4E4E7" }}>
            Open <span style={{ color: t, transition: "color .3s" }}>→</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function OSHero() {
  const strong: React.CSSProperties = { color: "#fff", fontWeight: 600 };
  return (
    <PaidHero
      eyebrow="Audit outsourcing · worldwide"
      first="Outsource your audits."
      accent="Keep the final say."
      lead={
        <>
          For accounting and audit firms worldwide. We run the full engagement — automation plus a dedicated team of auditors — and deliver a completed, <strong style={strong}>fully white-label</strong> audit file from <strong style={strong}>just 15% of the audit fee</strong>. You review every judgement and sign off — and your <strong style={strong}>first small-client audit is free</strong>.
        </>
      }
      chips={["First small audit free", "100% white-label", "You keep the final say"]}
      actions={
        <>
          <Button variant="primary" size="lg" href="#apply">Partner with us <Icon name="arrow-right" size={18} color="#09090B" /></Button>
          <Button variant="outline-dark" size="lg" href="#how">How it works</Button>
        </>
      }
      aside={<OSFileMock />}
    />
  );
}

const OS_STEPS = [
  { icon: "send", t: "Send us the engagement", s: "Hand over the audit through your dashboard — we onboard it and agree scope and timeline." },
  { icon: "cpu", t: "We plan, assess & test", s: "Automation and our auditors do the heavy lifting: planning, risk assessment and full testing." },
  { icon: "clipboard-check", t: "You review & decide", s: "Approve our work and answer any uncertain go-aheads in your portal — a simple questionnaire. You keep the final say." },
  { icon: "file-check-2", t: "We deliver final drafts", s: "Completion, financial statements and audit report — mapped, referenced and ready for your sign-off." },
];

function OSHow() {
  const steps = OS_STEPS;
  const [active, setActive] = useState(0);
  useEffect(() => { const id = setInterval(() => setActive((a) => (a + 1) % steps.length), 1500); return () => clearInterval(id); }, [steps.length]);
  return (
    <Section id="how" surface="light">
      <Head n="01" eyebrow="How it works" title={<>A complete audit, <G>run for you</G></>} sub="You stay in control of every judgement — we do the work behind it." />
      <CardGrid min={250} style={{ marginTop: "clamp(48px,6vw,80px)" }}>
        {steps.map((s, i) => {
          const on = i === active;
          return (
            <div
              key={s.t}
              data-fx="rise"
              data-d={i * 80}
              className="a4-card pk-info"
              style={{
                minHeight: 300, padding: 28, borderRadius: 24, display: "flex", flexDirection: "column", gap: 14, color: INK,
                // The step in focus wears the design's selected card state.
                ...(on ? { borderColor: "rgba(79,85,241,.45)", boxShadow: "0 24px 60px rgba(79,85,241,.12)" } : null),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: on ? INDIGO : "#52525B", transition: "color .4s" }}>{pad2(i + 1)}</span>
                <span aria-hidden="true" style={{ width: 48, height: 48, borderRadius: 14, background: on ? INDIGO : "rgba(79,85,241,.08)", display: "grid", placeItems: "center", transition: "background .4s" }}>
                  <Icon name={s.icon} size={22} color={on ? "#fff" : INDIGO} stroke={1.85} />
                </span>
              </div>
              <div style={{ flex: 1, minHeight: 20 }} />
              <h3 style={{ margin: 0, fontWeight: 600, fontSize: "clamp(22px,1.9vw,26px)", letterSpacing: "-0.03em", lineHeight: 1.15 }}>{s.t}</h3>
              <p style={{ margin: 0, fontFamily: BODY, fontSize: 15.5, lineHeight: 1.55, color: "#52525B", textWrap: "pretty" }}>{s.s}</p>
            </div>
          );
        })}
      </CardGrid>
    </Section>
  );
}

function OSPortals() {
  const cards = [
    { icon: "users-round", tag: "Your client", t: "A progress portal for your client", s: "Give your client a clean, branded window into their audit — milestones, what's been provided, what's outstanding and where things stand. Confidence, without the email chasing.", points: ["Live engagement progress", "Document requests & uploads", "Milestones and target dates"] },
    { icon: "list-checks", tag: "Your team", t: "A review portal for your auditors", s: "Your team reviews all of our testing, sees the working papers, and answers any uncertain go-aheads as a simple questionnaire — so the application of judgement is always yours.", points: ["Every test & working paper", "Go / no-go questionnaire", "You hold the final sign-off"] },
  ];
  return (
    <Section id="portals" surface="dark" sweep glow={{ left: "30%", top: "-20%", strength: 0.22 }}>
      <Head dark n="02" eyebrow="Full transparency" title={<>Two portals. <G>Total visibility.</G></>} sub="One for your client to follow progress, one for your team to review and approve every judgement." />
      <CardGrid min={320} style={{ marginTop: "clamp(48px,6vw,80px)" }}>
        {cards.map((c, i) => (
          <div
            key={c.t}
            data-fx="rise"
            data-d={i * 100}
            className="pk-glass"
            style={{ borderRadius: 28, padding: "clamp(28px,3.4vw,40px)", color: "#fff", transition: "border-color .35s, box-shadow .35s" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, fontSize: 17, fontWeight: 600, letterSpacing: ".02em" }}>
                <span style={{ color: PERI }}>{pad2(i + 1)}</span>
                <span style={{ ...kicker, color: "#A1A1AA" }}>{c.tag}</span>
              </div>
              <span aria-hidden="true" style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(139,143,247,.14)", display: "grid", placeItems: "center" }}>
                <Icon name={c.icon} size={24} color={PERI} stroke={1.75} />
              </span>
            </div>
            <h3 style={{ fontWeight: 600, fontSize: "clamp(26px,2.4vw,32px)", letterSpacing: "-0.035em", lineHeight: 1.12, margin: "28px 0 0", textWrap: "balance" }}>{c.t}</h3>
            <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: "#A1A1AA", margin: "12px 0 0", textWrap: "pretty" }}>{c.s}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,.1)" }}>
              {c.points.map((p) => (
                <Bullet key={p} dark>{p}</Bullet>
              ))}
            </div>
          </div>
        ))}
      </CardGrid>
    </Section>
  );
}

function OSDeliverables() {
  const items = [
    { t: "Planning", s: "Scope, materiality and audit strategy." },
    { t: "Risk assessment", s: "Understanding the entity and risk response." },
    { t: "Testing", s: "Substantive and controls testing, fully documented." },
    { t: "Completion", s: "Review, conclusions and the completion memo." },
    { t: "Final drafts", s: "Financial statements and the audit report." },
  ];
  return (
    <Section surface="white">
      <Head n="03" eyebrow="What you get" title={<>The complete audit file — <G>mapped</G></>} sub="Every phase delivered, cross-referenced and review-ready in your portal." />
      <div style={{ marginTop: "clamp(56px,7vw,96px)" }}>
        <Timeline steps={items.map((it) => ({ title: it.t, body: it.s }))} min={180} />
      </div>
    </Section>
  );
}

function OSWhy() {
  const items = [
    { icon: "percent", t: "From 15% of the fee", s: "Keep the client and the margin — we deliver the engagement for a fraction of your cost." },
    { icon: "cpu", t: "Automation + auditors", s: "Software speed with a dedicated, qualified audit team behind every file." },
    { icon: "scale", t: "You keep control", s: "Every judgement is yours to approve — we never apply your sign-off." },
    { icon: "globe", t: "Built for firms abroad", s: "Scale your audit capacity without hiring — across borders and busy seasons." },
  ];
  return (
    <Section surface="muted">
      <Head n="04" eyebrow="Why A4" title={<>Your capacity, <G>multiplied</G></>} sub="The work off your plate, the relationship and the final say still yours." />
      <CardGrid min={250} style={{ marginTop: "clamp(48px,6vw,80px)" }}>
        {items.map((it, i) => (
          <InfoCard key={it.t} i={i} total={items.length} dark={i % 2 === 1} icon={it.icon} title={it.t} body={it.s} minHeight={290} />
        ))}
      </CardGrid>
    </Section>
  );
}

function OSApply() {
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", firm: "", country: "", email: "" });
  const submit = async () => {
    if (!form.name || !form.email || !form.firm) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: `Audit outsourcing pilot request — ${form.firm}`,
          message: `Firm: ${form.firm}\nCountry: ${form.country}\nRequesting a white-label audit outsourcing pilot.`,
          context: "audit-outsourcing",
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setDone(true);
    } catch {
      setError("Something went wrong sending your request. Please try again or email info@a4.com.mt.");
    } finally {
      setSubmitting(false);
    }
  };
  const inp: React.CSSProperties = { marginBottom: 12 };
  return (
    <CtaBand
      id="apply"
      first="Outsource your"
      accent="next audit"
      lead={<>Tell us about your firm and we&apos;ll set up a pilot with your two <strong style={{ color: "#fff", fontWeight: 600 }}>white-label portals</strong>, branded with your logo. Your first audit for a small client is on us.</>}
    >
      {done ? (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <span aria-hidden="true" style={{ width: 56, height: 56, margin: "0 auto", borderRadius: 999, display: "grid", placeItems: "center", background: "rgba(139,143,247,.16)" }}>
            <Icon name="check" size={26} color={PERI} stroke={2.5} />
          </span>
          <div style={{ fontWeight: 600, fontSize: 26, letterSpacing: "-0.03em", color: "#fff", marginTop: 16 }}>Thanks, {form.name.split(" ")[0]}</div>
          <div style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: "#A1A1AA", marginTop: 8 }}>Our outsourcing team will reach out to <strong style={{ color: "#fff" }}>{form.email}</strong> to set up your pilot.</div>
        </div>
      ) : (
        <div>
          <input className="a4-input-dark" name="name" autoComplete="name" aria-label="Your name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name" style={inp} />
          <input className="a4-input-dark" name="organization" autoComplete="organization" aria-label="Firm name" value={form.firm} onChange={(e) => setForm((f) => ({ ...f, firm: e.target.value }))} placeholder="Firm name" style={inp} />
          <input className="a4-input-dark" name="country" autoComplete="country-name" aria-label="Country" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} placeholder="Country" style={inp} />
          <input className="a4-input-dark" name="email" autoComplete="email" aria-label="Work email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} type="email" placeholder="Work email" style={{ ...inp, marginBottom: 20 }} />
          {error && <div role="alert" style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.5, color: "#fff", marginBottom: 14 }}>{error}</div>}
          <Button variant="primary" size="lg" onClick={submit} style={{ ...ctaPill, opacity: submitting ? 0.6 : 1, pointerEvents: submitting ? "none" : "auto" }}>{submitting ? "Sending…" : "Request a pilot"} <Icon name="arrow-right" size={18} color="#09090B" /></Button>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: BODY, fontSize: 13, color: "#A1A1AA", marginTop: 16, textAlign: "center" }}>
            <SkewMark color={PERI} />
            White-label · confidential · no obligation
          </div>
        </div>
      )}
    </CtaBand>
  );
}

function OutsourceApp() {
  return (
    <div>
      <main id="main-content">
        <KitStyles />
        <OSHero />
        <OSHow />
        <OSPortals />
        <OSDeliverables />
        <OSWhy />
        <OSApply />
      </main>
    </div>
  );
}

export { OutsourceApp };
