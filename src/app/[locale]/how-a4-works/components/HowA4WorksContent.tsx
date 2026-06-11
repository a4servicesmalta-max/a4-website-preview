"use client";

import React, { useEffect, useState } from "react";
import { Container, Icon } from "@/components/a4-landing/Primitives";
import { HOW_A4_WORKS_STAGES, type HowA4WorksStage } from "@/data/a4HowA4WorksSiteData";

function StageDetail({ s }: { s: HowA4WorksStage }) {
  const accent =
    s.kind === "human" ? "var(--a4-accent-teal)" : s.kind === "deliver" ? "var(--a4-accent-warning)" : "var(--a4-primary-bright)";

  return (
    <div className="hw-fade" key={s.id}>
      <div
        className="inline-flex items-center gap-[9px] rounded-[var(--a4-r-full)] py-[6px] px-[13px]"
        style={{
          background:
            s.kind === "human"
              ? "rgba(0,168,126,.12)"
              : s.kind === "deliver"
                ? "rgba(214,150,40,.12)"
                : "rgba(73,79,223,.14)",
        }}
      >
        <Icon name={s.icon} size={15} color={accent} />
        <span
          className="a4-font-body text-[12px] font-bold tracking-[.06em] uppercase"
          style={{ color: accent }}
        >
          {s.kind === "human" ? "Human layer" : s.kind === "deliver" ? "Deliverables" : "Automation"}
        </span>
      </div>
      <h2
        className="a4-font-display font-medium text-white mt-4 m-0"
        style={{ fontSize: "clamp(26px,3.4vw,40px)", letterSpacing: "-.02em", textWrap: "balance" }}
      >
        {s.label}
      </h2>
      <p
        className="a4-font-body text-[var(--a4-on-dark-mute)] mt-[14px] m-0 max-w-[540px]"
        style={{ fontSize: 17, lineHeight: 1.6, textWrap: "pretty" }}
      >
        {s.blurb}
      </p>

      {s.agents && (
        <div className="grid gap-3 mt-[26px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))" }}>
          {s.agents.map((a) => (
            <div
              key={a.n}
              className="flex items-center gap-3 bg-[var(--a4-surface-elevated)] border border-[var(--a4-hairline-dark)] rounded-[var(--a4-r-md)] py-[14px] px-4"
            >
              <span
                className="w-[38px] h-[38px] rounded-full grid place-items-center shrink-0 relative"
                style={{
                  background: s.kind === "human" ? "rgba(0,168,126,.16)" : "rgba(73,79,223,.16)",
                }}
              >
                <Icon name={s.kind === "human" ? "user" : "bot"} size={18} color={accent} />
                {s.kind !== "human" && (
                  <span
                    className="absolute -top-px -right-px w-[9px] h-[9px] rounded-full bg-[var(--a4-accent-teal)] border-2 border-black"
                    style={{ animation: "hwpulse 1.2s ease-in-out infinite" }}
                  />
                )}
              </span>
              <div className="min-w-0">
                <div className="a4-font-body text-[14px] font-semibold text-white">{a.n}</div>
                <div className="a4-font-body text-[12.5px] text-[var(--a4-stone)]">{a.r}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {s.letters && (
        <div className="grid gap-[10px] mt-[26px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))" }}>
          {s.letters.map((l) => (
            <div
              key={l}
              className="flex items-center gap-[11px] bg-[var(--a4-surface-elevated)] border border-[var(--a4-hairline-dark)] rounded-[var(--a4-r-md)] py-[13px] px-[15px]"
            >
              <Icon name="file-text" size={17} color="var(--a4-accent-warning)" />
              <span className="a4-font-body text-[14px] font-semibold text-white">{l}</span>
              <span className="ml-auto a4-font-body text-[11.5px] font-semibold text-[var(--a4-accent-teal)]">Drafted</span>
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

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setActive((a) => (a + 1) % HOW_A4_WORKS_STAGES.length), 3800);
    return () => clearInterval(id);
  }, [playing]);

  const go = (i: number) => {
    setActive(i);
    setPlaying(false);
  };

  return (
    <div className="a4-site-page min-h-screen bg-black">
      <Container style={{ maxWidth: 1080, padding: "clamp(40px,7vw,80px) 24px" }}>
        <div className="flex items-center gap-3">
          <span className="w-[26px] h-px bg-[var(--a4-hairline-strong)]" />
          <span className="a4-font-body text-[12.5px] font-semibold tracking-[.14em] uppercase text-[var(--a4-on-dark-mute)]">
            How A4 works · interactive
          </span>
        </div>
        <h1
          className="a4-font-display font-medium text-white mt-[18px] m-0 max-w-[760px]"
          style={{ fontSize: "clamp(34px,5vw,64px)", lineHeight: 1.02, letterSpacing: "-.03em", textWrap: "balance" }}
        >
          Automation does the work.
          <br />
          <span className="text-[var(--a4-accent-teal)]">People sign it off.</span>
        </h1>
        <p
          className="a4-font-body text-[var(--a4-on-dark-mute)] mt-4 m-0 max-w-[560px]"
          style={{ fontSize: 18, lineHeight: 1.6, textWrap: "pretty" }}
        >
          Follow an engagement from intake to final delivery — see the agents that do the heavy lifting, the human layer that
          reviews everything, and the complete file we hand you with every letter drafted.
        </p>

        <div className="hw-rail flex items-center gap-0 mt-11 flex-wrap">
          {HOW_A4_WORKS_STAGES.map((s, i) => {
            const on = i === active;
            const done = i < active;
            const human = s.kind === "human";
            const col = human ? "var(--a4-accent-teal)" : s.kind === "deliver" ? "var(--a4-accent-warning)" : "var(--a4-primary-bright)";
            return (
              <React.Fragment key={s.id}>
                {i > 0 && (
                  <span
                    className="hw-conn flex-1 h-0.5 min-w-[18px] self-center mx-1.5 transition-colors duration-400"
                    style={{ background: i <= active ? col : "var(--a4-hairline-dark)" }}
                  />
                )}
                <button
                  type="button"
                  onClick={() => go(i)}
                  className="flex items-center gap-[10px] rounded-[var(--a4-r-full)] py-[9px] px-[15px] cursor-pointer shrink-0 transition-all duration-300"
                  style={{
                    background: on
                      ? human
                        ? "rgba(0,168,126,.14)"
                        : s.kind === "deliver"
                          ? "rgba(214,150,40,.14)"
                          : "rgba(73,79,223,.16)"
                      : "var(--a4-surface-elevated)",
                    border: `1px solid ${on ? col : "var(--a4-hairline-dark)"}`,
                  }}
                >
                  <span
                    className="w-[26px] h-[26px] rounded-full grid place-items-center shrink-0 transition-colors duration-300"
                    style={{ background: on || done ? col : "var(--a4-surface-deep)" }}
                  >
                    <Icon name={done ? "check" : s.icon} size={14} color={on || done ? "#fff" : "var(--a4-stone)"} stroke={2.2} />
                  </span>
                  <span
                    className="a4-font-body text-[13.5px] font-semibold"
                    style={{ color: on ? "#fff" : "var(--a4-on-dark-mute)" }}
                  >
                    {s.label}
                  </span>
                </button>
              </React.Fragment>
            );
          })}
        </div>

        <div className="hw-body grid gap-8 mt-10 items-start" style={{ gridTemplateColumns: "1.2fr .8fr" }}>
          <div
            className="border border-[var(--a4-hairline-dark)] rounded-[var(--a4-r-xl)] min-h-[320px]"
            style={{ background: "#0b0c0e", padding: "clamp(24px,3.4vw,40px)" }}
          >
            <StageDetail s={HOW_A4_WORKS_STAGES[active]} />
          </div>

          <div className="sticky top-6">
            <div
              className="rounded-[var(--a4-r-lg)] py-6 px-[22px]"
              style={{ background: "rgba(0,168,126,.07)", border: "1px solid rgba(0,168,126,.25)" }}
            >
              <span
                className="w-[46px] h-[46px] rounded-[var(--a4-r-md)] grid place-items-center"
                style={{ background: "rgba(0,168,126,.16)" }}
              >
                <Icon name="user-check" size={23} color="var(--a4-accent-teal)" />
              </span>
              <h3 className="a4-font-display font-medium text-[21px] text-white mt-[18px] m-0 tracking-[-.2px]">
                A human layer, always
              </h3>
              <p
                className="a4-font-body text-[var(--a4-on-dark-mute)] mt-[10px] m-0"
                style={{ fontSize: 14.5, lineHeight: 1.55, textWrap: "pretty" }}
              >
                Agents accelerate the work — but every judgement is reviewed and approved by qualified auditors, and the final
                opinion is always signed by a person. You keep the final say.
              </p>
              <div className="flex flex-col gap-[10px] mt-[18px] pt-4 border-t border-[var(--a4-hairline-dark)]">
                {["Reviewed by qualified auditors", "Go / no-go escalated to you", "Full engagement, letters drafted"].map((t) => (
                  <div key={t} className="flex items-center gap-[9px]">
                    <Icon name="check" size={15} color="var(--a4-accent-teal)" stroke={2.4} />
                    <span className="a4-font-body text-[13.5px] text-[var(--a4-on-dark)]">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="w-full mt-[14px] h-11 rounded-[var(--a4-r-full)] border border-[var(--a4-hairline-dark)] bg-transparent text-white a4-font-body text-[14px] font-semibold cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <Icon name={playing ? "pause" : "play"} size={16} color="#fff" />{" "}
              {playing ? "Pause walkthrough" : "Play walkthrough"}
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
