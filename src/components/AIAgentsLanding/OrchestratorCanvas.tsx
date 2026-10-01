"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { SectionHead } from "@/components/a4-landing/Primitives";
import { A4_F, A4_S } from "@/components/fx/primitives";
import { gcol, prefersReducedMotion } from "@/lib/fx/engine";
import { BODY, Band, PERI, SANS, gradText } from "@/components/services/SectionKit";

interface OrchestratorProps {
  namespace: "accounting" | "business";
}

const AGENTS = [
  { name: "Penny", role: "Planning", angle: -90 },
  { name: "Rika", role: "Risk Assess.", angle: -45 },
  { name: "Felix", role: "Fieldwork", angle: 0 },
  { name: "Glex", role: "GL Anomaly", angle: 45 },
  { name: "Cleo", role: "Completion", angle: 90 },
  { name: "Remy", role: "Reporting", angle: 135 },
  { name: "Comi", role: "Comms", angle: 180 },
  { name: "Coda", role: "Compliance", angle: 225 },
];

/** Each agent takes its place on the brand gradient (indigo → periwinkle). */
const AGENT_COLOR = AGENTS.map((_, i) => gcol(i / (AGENTS.length - 1)));

interface StepType {
  title: string;
  desc: string;
  active: number[];
  highlight: "orchestrator" | "all";
  pulseOrch?: boolean;
  beam?: number[];
}

const STEPS: StepType[] = [
  {
    title: "Engagement received",
    desc: "Your firm opens an engagement in the portal. The Orchestrator Agent instantly receives the brief — client name, materiality, prior year file, and deadline.",
    active: [],
    highlight: "orchestrator",
    pulseOrch: true,
  },
  {
    title: "Orchestrator dispatches Planning",
    desc: "The Orchestrator analyses the brief and activates Penny — the Audit Planning Agent — first. Penny produces the audit strategy, materiality calculations, and PBC list.",
    active: [0],
    highlight: "orchestrator",
    beam: [0],
  },
  {
    title: "Risk assessment activated",
    desc: "With the plan approved, the Orchestrator dispatches Rika to perform the risk assessment — mapping every ISA 315 risk to audit assertions before fieldwork begins.",
    active: [0, 1],
    highlight: "orchestrator",
    beam: [1],
  },
  {
    title: "Parallel specialist deployment",
    desc: "The Orchestrator simultaneously activates Felix (Fieldwork), Glex (GL Anomaly), Comi (Communications), and Cleo (Completion) — each working their area concurrently.",
    active: [0, 1, 2, 3, 4, 6],
    highlight: "orchestrator",
    beam: [2, 3, 4, 6],
  },
  {
    title: "Reporting & compliance finalised",
    desc: "Remy drafts the audit report and management letter. The Orchestrator then activates Coda — the Compliance Agent — to review the completed file against ISAs and ISQM.",
    active: [0, 1, 2, 3, 4, 5, 6, 7],
    highlight: "orchestrator",
    beam: [5, 7],
  },
  {
    title: "Complete file delivered",
    desc: "The Orchestrator consolidates all agent outputs into a single indexed audit file and delivers it to your partner portal. Your team reviews, applies judgement, and signs off.",
    active: [0, 1, 2, 3, 4, 5, 6, 7],
    highlight: "all",
    beam: [],
  },
];

const STEP_DURATION = 3200;

const RM_QUERY = "(prefers-reduced-motion: reduce)";
function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(RM_QUERY);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(RM_QUERY).matches,
    () => false
  );
}

type Particle = { agentIdx: number; t: number; speed: number; size: number; color: string; done: boolean };

const roundBtn: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 22,
  display: "grid",
  placeItems: "center",
  border: "1px solid rgba(255,255,255,.18)",
  background: "rgba(255,255,255,.06)",
  color: "#FFFFFF",
  cursor: "pointer",
};

/**
 * "How it works": the orchestrator and its eight specialists on canvas, drawn
 * in the A4 palette on the dark grid, stepping through an engagement. Autoplay
 * pauses when the visitor steps manually (and is off under reduced motion).
 */
const OrchestratorCanvas = ({ namespace }: OrchestratorProps) => {
  const { t } = useTranslation(namespace);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stepRef = useRef(0);
  const onStepRef = useRef<((idx: number) => void) | null>(null);

  const [currentStep, setCurrentStep] = useState(0);
  // null = the visitor hasn't chosen: autoplay unless they prefer reduced motion.
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const reduced = useReducedMotion();
  const isPlaying = userPlaying ?? !reduced;

  // The canvas loop reads the step from a ref, so manual steps show even while paused.
  useEffect(() => {
    stepRef.current = currentStep;
    onStepRef.current?.(currentStep);
  }, [currentStep]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => setCurrentStep((s) => (s + 1) % STEPS.length), STEP_DURATION + 600);
    return () => window.clearInterval(id);
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const still = prefersReducedMotion();
    const family = (getComputedStyle(document.body).getPropertyValue("--font-outfit") || "").trim() || "Outfit";
    const markS = new Path2D(A4_S);
    const markF = new Path2D(A4_F);

    let W = 0,
      H = 0,
      CX = 0,
      CY = 0,
      OR = 0,
      ORCH_R = 0,
      AGENT_R = 0;
    let animFrame = 0;
    let pulseT = 0;
    let stepT = 0;
    let lastTime: number | null = null;
    let beamParticles: Particle[] = [];
    let visible = true;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const dpr = window.devicePixelRatio || 1;
      W = Math.min(rect.width, 1020);
      H = W * (W < 560 ? 0.96 : 0.58);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      CX = W / 2;
      CY = H / 2;
      OR = Math.min(W, H) * 0.36;
      ORCH_R = Math.min(W, H) * 0.12;
      AGENT_R = Math.min(W, H) * 0.075;
    };
    window.addEventListener("resize", resize);
    resize();

    const agentPos = (i: number) => {
      const rad = ((AGENTS[i].angle - 90) * Math.PI) / 180;
      return { x: CX + OR * Math.cos(rad), y: CY + OR * Math.sin(rad) };
    };

    const ring = (x: number, y: number, r: number, color: string, alpha: number, lw: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.stroke();
      ctx.restore();
    };

    const text = (s: string, x: number, y: number, size: number, color: string, weight: number | string = 500) => {
      ctx.save();
      ctx.fillStyle = color;
      ctx.font = `${weight} ${size}px ${family}, Outfit, Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(s, x, y);
      ctx.restore();
    };

    const spawnBeam = (agentIdx: number) => {
      for (let i = 0; i < 12; i++) {
        beamParticles.push({ agentIdx, t: (i / 12) * 0.6, speed: 0.018 + Math.random() * 0.012, size: 2.5 + Math.random() * 2.5, color: AGENT_COLOR[agentIdx], done: false });
      }
    };

    onStepRef.current = (idx: number) => {
      stepT = 0;
      beamParticles = [];
      (STEPS[idx].beam || []).forEach(spawnBeam);
    };

    const draw = (ts: number) => {
      animFrame = requestAnimationFrame(draw);
      if (!visible) {
        lastTime = ts;
        return;
      }
      if (!lastTime) lastTime = ts;
      const dt = still ? 0 : ts - lastTime;
      lastTime = ts;
      pulseT += dt * 0.001;
      stepT = still ? 1 : Math.min(stepT + dt / STEP_DURATION, 1);

      ctx.clearRect(0, 0, W, H);
      const step = STEPS[stepRef.current];

      // Orbits
      ring(CX, CY, OR, "#FFFFFF", 0.1, 1);
      ring(CX, CY, OR * 1.12, "#FFFFFF", 0.05, 0.5);
      ring(CX, CY, OR * 0.6, "#FFFFFF", 0.06, 0.5);

      const orbitAngle = pulseT * 0.8;
      ctx.save();
      ctx.shadowColor = PERI;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(CX + OR * Math.cos(orbitAngle), CY + OR * Math.sin(orbitAngle), 3, 0, Math.PI * 2);
      ctx.fillStyle = PERI;
      ctx.fill();
      ctx.restore();

      // Connectors
      AGENTS.forEach((_, i) => {
        const p = agentPos(i);
        const on = step.active.includes(i);
        ctx.save();
        ctx.globalAlpha = on ? 0.55 : 0.18;
        ctx.strokeStyle = on ? AGENT_COLOR[i] : "#FFFFFF";
        ctx.lineWidth = on ? 1.5 : 0.6;
        if (!on) ctx.setLineDash([5, 8]);
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.restore();
      });

      // Beams
      beamParticles = beamParticles.filter((b) => !b.done);
      beamParticles.forEach((b) => {
        b.t += still ? 0 : b.speed;
        if (b.t >= 1) {
          b.done = true;
          return;
        }
        const p = agentPos(b.agentIdx);
        ctx.save();
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 12;
        ctx.globalAlpha = Math.sin(b.t * Math.PI) * 0.95;
        ctx.beginPath();
        ctx.arc(CX + (p.x - CX) * b.t, CY + (p.y - CY) * b.t, b.size, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.restore();
      });

      // Agents
      AGENTS.forEach((a, i) => {
        const p = agentPos(i);
        const on = step.active.includes(i);
        const beaming = !!step.beam?.includes(i);
        const col = AGENT_COLOR[i];
        if (on) {
          const pulse = 0.5 + 0.5 * Math.sin(pulseT * 2 + i);
          ring(p.x, p.y, AGENT_R + 7 + pulse * 6, col, 0.22 + pulse * 0.14, 1);
        }
        ctx.save();
        ctx.shadowColor = on ? col : "transparent";
        ctx.shadowBlur = on ? 22 : 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, AGENT_R, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(p.x - AGENT_R * 0.3, p.y - AGENT_R * 0.3, 0, p.x, p.y, AGENT_R);
        if (on) {
          g.addColorStop(0, col);
          g.addColorStop(1, `${col}44`);
        } else {
          g.addColorStop(0, "#27272A");
          g.addColorStop(1, "#18181B");
        }
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = on ? col : "#3F3F46";
        ctx.lineWidth = on ? 2 : 1;
        ctx.stroke();
        ctx.restore();

        text(a.name.charAt(0), p.x, p.y + 1, AGENT_R * 0.9, on ? "#FFFFFF" : "#71717A", 600);
        const ly = p.y + AGENT_R + 15;
        text(a.name, p.x, ly, Math.max(11, AGENT_R * 0.55), on ? "#FFFFFF" : "#71717A", 600);
        text(a.role, p.x, ly + Math.max(13, AGENT_R * 0.6), Math.max(10, AGENT_R * 0.42), on ? "#C7C9FB" : "#52525B", 500);

        if (beaming) {
          ctx.save();
          ctx.globalAlpha = 0.5 + 0.4 * Math.sin(pulseT * 6 + i);
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, AGENT_R + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * ((stepT * 1.5) % 1) * 2);
          ctx.stroke();
          ctx.restore();
        }
      });

      // Orchestrator
      const orchPulse = 0.5 + 0.5 * Math.sin(pulseT * 1.5);
      const all = step.highlight === "all";
      ring(CX, CY, ORCH_R * 1.5 + orchPulse * 8, "#FFFFFF", 0.1 + orchPulse * 0.06, 1);
      ring(CX, CY, ORCH_R * 1.8 + orchPulse * 6, "#FFFFFF", 0.06 + orchPulse * 0.04, 1);

      ctx.save();
      ctx.shadowColor = all ? "rgba(79,85,241,.85)" : "rgba(79,85,241,.35)";
      ctx.shadowBlur = 30 + orchPulse * 20;
      const og = ctx.createRadialGradient(CX - ORCH_R * 0.2, CY - ORCH_R * 0.2, 0, CX, CY, ORCH_R);
      if (all) {
        og.addColorStop(0, "#8B8FF7");
        og.addColorStop(0.55, "#6468F3");
        og.addColorStop(1, "#4F55F1");
      } else {
        og.addColorStop(0, "#27272A");
        og.addColorStop(1, "#09090B");
      }
      ctx.beginPath();
      ctx.arc(CX, CY, ORCH_R, 0, Math.PI * 2);
      ctx.fillStyle = og;
      ctx.fill();
      ctx.strokeStyle = all ? "#C7C9FB" : "rgba(255,255,255,.18)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 6]);
      ctx.translate(CX, CY);
      ctx.rotate(pulseT * 0.6);
      ctx.beginPath();
      ctx.arc(0, 0, ORCH_R + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // The A4 mark at the centre
      const ms = ORCH_R * 0.62;
      ctx.save();
      ctx.translate(CX - ms / 2, CY - ORCH_R * 0.2 - ms / 2);
      ctx.scale(ms / 515.6, ms / 515.6);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill(markS);
      ctx.fill(markF, "evenodd");
      ctx.restore();
      const fs = Math.max(9, ORCH_R * 0.2);
      text("ORCHESTRATOR", CX, CY + ORCH_R * 0.36, fs, "#FFFFFF", 700);
      text("AGENT", CX, CY + ORCH_R * 0.36 + fs * 1.25, fs * 0.85, all ? "#FFFFFF" : "#A1A1AA", 600);

      if (all) {
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2 + pulseT * 0.3;
          const r = ORCH_R * (1.4 + stepT * 0.6);
          ctx.save();
          ctx.globalAlpha = (1 - stepT) * 0.7;
          ctx.shadowColor = PERI;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(CX + r * Math.cos(ang), CY + r * Math.sin(ang), 3, 0, Math.PI * 2);
          ctx.fillStyle = PERI;
          ctx.fill();
          ctx.restore();
        }
      }
    };

    animFrame = requestAnimationFrame(draw);
    onStepRef.current(stepRef.current);

    // Don't paint while the canvas is off screen.
    const io = new IntersectionObserver((es) => {
      visible = es.some((e) => e.isIntersecting);
    });
    io.observe(canvas);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrame);
      io.disconnect();
      onStepRef.current = null;
    };
  }, []);

  const go = (dir: 1 | -1) => {
    setUserPlaying(false);
    setCurrentStep((s) => (s + dir + STEPS.length) % STEPS.length);
  };

  return (
    <Band id="how" surface="dark">
      <SectionHead
        dark
        n="02"
        eyebrow={t("how.eyebrow")}
        title={
          <>
            {t("how.titleLine1")} <span style={{ ...gradText, paddingBottom: ".06em" }}>{t("how.titleHighlight")}</span>
          </>
        }
        sub={t("how.sub")}
      />

      <div data-fx="rise" data-d="150" style={{ position: "relative", marginTop: "clamp(40px,5vw,64px)", maxWidth: 1020, marginInline: "auto" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <canvas ref={canvasRef} role="img" aria-label={`${STEPS[currentStep].title}. ${STEPS[currentStep].desc}`} style={{ display: "block", maxWidth: "100%" }} />
        </div>

        <div style={{ marginTop: 28, textAlign: "center", minHeight: 150 }} aria-live="polite">
          <span className="a4-chip a4-chip-dark" style={{ height: 30, fontSize: 13, fontWeight: 600 }}>
            Step <span style={{ color: "#FFFFFF" }}>{currentStep + 1}</span> of {STEPS.length}
          </span>
          <div style={{ marginTop: 16, fontFamily: SANS, fontSize: "clamp(24px,2.4vw,32px)", fontWeight: 600, letterSpacing: "-0.03em", color: "#FFFFFF" }}>{STEPS[currentStep].title}</div>
          <p style={{ margin: "10px auto 0", maxWidth: 680, fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: "#A1A1AA" }}>{STEPS[currentStep].desc}</p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }} aria-hidden="true">
          {STEPS.map((_, i) => (
            <span key={i} style={{ height: 6, width: i === currentStep ? 28 : 6, borderRadius: 3, background: i === currentStep ? PERI : "#3F3F46", transition: "width .35s cubic-bezier(.16,1,.3,1), background .3s" }} />
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 24 }}>
          <button type="button" aria-label="Previous step" onClick={() => go(-1)} style={roundBtn}>
            <ArrowLeft size={17} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setUserPlaying(!isPlaying)} className="a4-btn a4-btn-light" style={{ height: 44, padding: "0 22px", fontSize: 15 }} aria-pressed={isPlaying}>
            {isPlaying ? <Pause size={15} fill="currentColor" aria-hidden="true" /> : <Play size={15} fill="currentColor" aria-hidden="true" />}
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button type="button" aria-label="Next step" onClick={() => go(1)} style={roundBtn}>
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    </Band>
  );
};

export default OrchestratorCanvas;
