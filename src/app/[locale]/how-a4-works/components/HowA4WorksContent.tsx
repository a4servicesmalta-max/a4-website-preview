"use client";

import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/a4-landing/Primitives";
import { A4Mark, LIGHT_GLOW } from "@/components/fx/primitives";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { HOW_A4_WORKS_STAGES, type HowA4WorksStage } from "@/data/a4HowA4WorksSiteData";
import { AiNativeFilm } from "@/components/film/chapters";

const SANS = "var(--a4x-display)";
const BODY = "var(--a4x-body)";
const INDIGO = "#4F55F1";
const PERI = "#8B8FF7";
const INK = "#09090B";
const two = (n: number) => String(n).padStart(2, "0");

const KIND_LABEL: Record<HowA4WorksStage["kind"], string> = {
  agent: "Automation",
  human: "Human layer",
  deliver: "Deliverables",
};

function KindChip({ s }: { s: HowA4WorksStage }) {
  const look: React.CSSProperties =
    s.kind === "human"
      ? { background: INK, color: "#FFFFFF", border: `1px solid ${INK}` }
      : s.kind === "deliver"
        ? { background: "#FFFFFF", color: INK, border: "1px solid #E4E4E7" }
        : { background: "rgba(79,85,241,.1)", color: INDIGO, border: "1px solid transparent" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 32, padding: "0 14px", borderRadius: 999, fontFamily: SANS, fontSize: 13.5, fontWeight: 600, ...look }}>
      <Icon name={s.icon} size={15} color={s.kind === "human" ? PERI : INDIGO} />
      {KIND_LABEL[s.kind]}
    </span>
  );
}

function StageDetail({ s }: { s: HowA4WorksStage }) {
  return (
    <div className="cp-stage-in" key={s.id}>
      <KindChip s={s} />
      <h2 style={{ margin: "20px 0 0", fontFamily: SANS, fontSize: "clamp(32px,3.4vw,50px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.04, color: INK, textWrap: "balance" }}>{s.label}</h2>
      <p style={{ margin: "16px 0 0", maxWidth: 620, fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: "#52525B", textWrap: "pretty" }}>{s.blurb}</p>

      {s.agents && (
        <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 230px), 1fr))", gap: 10 }}>
          {s.agents.map((a) => (
            <div key={a.n} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, border: "1px solid #E4E4E7", background: "#FFFFFF" }}>
              <span
                aria-hidden="true"
                style={{ position: "relative", width: 40, height: 40, flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", background: s.kind === "human" ? INK : "rgba(79,85,241,.1)" }}
              >
                <Icon name={s.kind === "human" ? "user" : "bot"} size={18} color={s.kind === "human" ? PERI : INDIGO} />
                {s.kind !== "human" && (
                  <span className="cp-pulse" style={{ position: "absolute", top: -1, right: -1, width: 10, height: 10, borderRadius: "50%", background: INDIGO, border: "2px solid #FFFFFF" }} />
                )}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: SANS, fontSize: 15.5, fontWeight: 600, letterSpacing: "-0.01em", color: INK }}>{a.n}</div>
                <div style={{ marginTop: 2, fontFamily: BODY, fontSize: 13, lineHeight: 1.4, color: "#71717A" }}>{a.r}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {s.letters && (
        <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 230px), 1fr))", gap: 10 }}>
          {s.letters.map((l) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 16, border: "1px solid #E4E4E7", background: "#FFFFFF" }}>
              <Icon name="file-text" size={18} color={INDIGO} />
              <span style={{ fontFamily: SANS, fontSize: 15.5, fontWeight: 600, letterSpacing: "-0.01em", color: INK }}>{l}</span>
              <span style={{ marginLeft: "auto", height: 26, padding: "0 10px", display: "inline-flex", alignItems: "center", borderRadius: 999, background: "rgba(79,85,241,.1)", fontFamily: SANS, fontSize: 12, fontWeight: 600, color: INDIGO }}>
                Drafted
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function HowA4WorksContent() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const railRef = useRef<HTMLDivElement>(null);
  const n = HOW_A4_WORKS_STAGES.length;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setActive((a) => (a + 1) % HOW_A4_WORKS_STAGES.length), 3800);
    return () => clearInterval(id);
  }, [playing]);

  // On narrow screens the stage rail scrolls sideways: keep the active stage in view.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || rail.scrollWidth <= rail.clientWidth) return;
    const item = rail.querySelectorAll<HTMLElement>("[data-stage-btn]")[active];
    if (item) rail.scrollTo({ left: Math.max(0, item.offsetLeft - 20), behavior: "smooth" });
  }, [active]);

  const go = (i: number) => {
    setActive(i);
    setPlaying(false);
  };

  const s = HOW_A4_WORKS_STAGES[active];

  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="How A4 works · interactive"
        title="Automation does the work. People sign it off."
        sub="Follow an engagement from intake to final delivery — see the agents that do the heavy lifting, the human layer that reviews everything, and the complete file we hand you with every letter drafted."
      />
      <AiNativeFilm />

      <section style={{ position: "relative", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", background: LIGHT_GLOW, color: INK }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* Stage rail — the design's timeline, filled up to the active stage */}
          <div ref={railRef} data-fx="rise" className="cp-hw-rail">
            <ol className="cp-hw-steps" style={{ ["--n" as string]: n }}>
              {HOW_A4_WORKS_STAGES.map((st, i) => {
                const on = i === active;
                const reached = i <= active;
                return (
                  <li key={st.id} className="cp-hw-step">
                    {i < n - 1 && (
                      <span aria-hidden="true" className="cp-hw-conn">
                        <span style={{ ["--fill" as string]: i < active ? 1 : 0 }} />
                      </span>
                    )}
                    <button
                      type="button"
                      data-stage-btn=""
                      onClick={() => go(i)}
                      aria-current={on ? "step" : undefined}
                      className="cp-hw-btn cp-focus"
                    >
                      <span
                        aria-hidden="true"
                        className="cp-hw-dot"
                        style={{ borderColor: reached ? INDIGO : "#E4E4E7", boxShadow: on ? "0 0 0 6px rgba(79,85,241,.14)" : "none" }}
                      >
                        <span style={{ transform: `scale(${reached ? 1 : 0})` }} />
                      </span>
                      <span className="cp-hw-text">
                        <span className="cp-hw-num" style={{ color: reached ? INDIGO : "#71717A" }}>{two(i + 1)}</span>
                        <span className="cp-hw-label" style={{ color: on ? INK : "#52525B" }}>{st.label}</span>
                        <span className="cp-hw-kind">{KIND_LABEL[st.kind]}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="cp-hw-body" style={{ marginTop: "clamp(40px,5vw,64px)" }}>
            {/* The stage, as the design's document panel */}
            <div
              data-fx="rise"
              data-d="100"
              data-dy="80"
              style={{ minWidth: 0, background: "#FFFFFF", border: "1px solid #E4E4E7", borderRadius: 28, boxShadow: "0 50px 120px rgba(9,9,11,.12)", overflow: "hidden" }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "clamp(22px,3vw,36px) clamp(22px,3vw,40px) 0" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <A4Mark size={30} color={INK} />
                  <span style={{ width: 1.5, height: 24, margin: "0 12px", background: INK, opacity: 0.35 }} />
                  <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 500, letterSpacing: "-0.02em" }}>A4 Services</span>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: "#52525B" }}>
                  <span style={{ color: INDIGO }}>{two(active + 1)}</span> / {two(n)}
                </div>
              </div>
              <div style={{ padding: "clamp(24px,3vw,36px) clamp(22px,3vw,40px) clamp(28px,3.4vw,44px)", minHeight: 340 }}>
                <StageDetail s={s} />
              </div>
            </div>

            <div className="cp-hw-side">
              <div data-fx="rise" data-d="200" className="cp-card cp-dark cp-static" style={{ padding: "clamp(24px,2.6vw,32px)" }}>
                <span aria-hidden="true" style={{ width: 48, height: 48, borderRadius: "50%", display: "grid", placeItems: "center", border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.04)" }}>
                  <Icon name="user-check" size={21} color={PERI} />
                </span>
                <h3 style={{ margin: "22px 0 0", fontFamily: SANS, fontSize: "clamp(26px,2.2vw,30px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.1 }}>A human layer, always</h3>
                <p style={{ margin: "12px 0 0", fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: "#A1A1AA", textWrap: "pretty" }}>
                  Agents accelerate the work — but every judgement is reviewed and approved by qualified auditors, and the final opinion is always signed by a person. You keep the final say.
                </p>
                <ul style={{ margin: "20px 0 0", padding: "18px 0 0", listStyle: "none", display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid rgba(255,255,255,.1)" }}>
                  {["Reviewed by qualified auditors", "Go / no-go escalated to you", "Full engagement, letters drafted"].map((t) => (
                    <li key={t} style={{ display: "flex", gap: 12, fontFamily: SANS, fontSize: 16, fontWeight: 500, letterSpacing: "-0.01em", color: "#E4E4E7" }}>
                      <span className="a4-bullet" style={{ background: PERI }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="a4-btn a4-btn-outline"
                style={{ width: "100%", height: 52, marginTop: 12, fontSize: 16 }}
              >
                <Icon name={playing ? "pause" : "play"} size={16} color={INK} /> {playing ? "Pause walkthrough" : "Play walkthrough"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
