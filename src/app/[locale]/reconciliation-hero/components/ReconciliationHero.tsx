"use client";

import React, { useEffect, useRef } from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";
import { TypeText, gradText } from "@/components/fx/primitives";

/**
 * Animated reconciliation hero (from "New website Reconciliation Hero.html"), in the A4 design
 * language: ink canvas, zinc points that line up and turn periwinkle as the indigo sweep
 * verifies them, Outfit headline typed with its gradient second line.
 */
export function ReconciliationHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const href = useLocalizedHref();

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctxRaw = canvasEl.getContext("2d", { alpha: false });
    if (!ctxRaw) return;

    const cvs: HTMLCanvasElement = canvasEl;
    const gfx: CanvasRenderingContext2D = ctxRaw;

    const INK = "#09090B";
    const INK_HI = "#14141F";
    const PERI = [139, 143, 247] as const;
    const DOT = [161, 161, 170] as const;
    const LOOP_MS = 14000;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let DPR = 1;
    const t0 = performance.now();
    let raf = 0;

    const N = 64;
    let rng = 20260602;
    const rand = () => {
      rng = (rng * 1103515245 + 12345) & 0x7fffffff;
      return rng / 0x7fffffff;
    };

    const COLS = 5;
    const ROWS_PER_COL = Math.ceil(N / COLS);
    const pts: Array<{
      bx: number;
      by: number;
      ax: number;
      ay: number;
      px: number;
      py: number;
      cx: number;
      cy: number;
      tc: number;
      r: number;
      col: number;
      row: number;
      tw: number;
      x: number;
      y: number;
    }> = [];

    for (let i = 0; i < N; i++) {
      pts.push({
        bx: rand(),
        by: rand(),
        ax: 0.016 + rand() * 0.045,
        ay: 0.018 + rand() * 0.05,
        px: rand() * Math.PI * 2,
        py: rand() * Math.PI * 2,
        cx: rand() < 0.72 ? 1 : 2,
        cy: rand() < 0.72 ? 1 : 2,
        tc: rand() < 0.6 ? 1 : 2,
        r: 0.7 + rand() * 1.5,
        col: i % COLS,
        row: Math.floor(i / COLS),
        tw: rand() * Math.PI * 2,
        x: 0,
        y: 0,
      });
    }

    const TAU = Math.PI * 2;
    const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
    const ease = (k: number) => k * k * (3 - 2 * k);

    function bump(phase: number, c: number, w: number) {
      let d = Math.abs(phase - c);
      d = Math.min(d, 1 - d);
      if (d > w) return 0;
      return ease(1 - d / w);
    }

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cvs.width = W * DPR;
      cvs.height = H * DPR;
      gfx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function draw(phase: number) {
      const g = gfx.createRadialGradient(W * 0.5, H * 0.46, 0, W * 0.5, H * 0.46, Math.max(W, H) * 0.78);
      g.addColorStop(0, INK_HI);
      g.addColorStop(1, INK);
      gfx.fillStyle = g;
      gfx.fillRect(0, 0, W, H);

      gfx.lineWidth = 1;
      const rows = 11;
      for (let i = 1; i < rows; i++) {
        const y = (H / rows) * i;
        gfx.strokeStyle = `rgba(161,161,170,${0.016 + 0.01 * Math.sin(i)})`;
        gfx.beginPath();
        gfx.moveTo(0, y);
        gfx.lineTo(W, y);
        gfx.stroke();
      }

      const align = Math.max(bump(phase, 0.3, 0.13), bump(phase, 0.78, 0.13));
      const sweepOn = bump(phase, 0.62, 0.26);
      const sweepLoc = (phase - 0.36) / 0.52;
      const sweepX = lerp(-0.15, 1.15, Math.min(1, Math.max(0, sweepLoc))) * W;

      const colX = (c: number) => lerp(0.34, 0.72, c / (COLS - 1));
      for (const p of pts) {
        const x = p.bx + p.ax * Math.sin(phase * TAU * p.cx + p.px);
        const y = p.by + p.ay * Math.cos(phase * TAU * p.cy + p.py);
        const tx = colX(p.col);
        const ty = 0.2 + (p.row / (ROWS_PER_COL - 1)) * 0.6;
        p.x = lerp(x, tx, align * 0.85) * W;
        p.y = lerp(y, ty, align * 0.85) * H;
      }

      const linkDist = lerp(108, 168, align);
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = pts[i];
          const b = pts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkDist * linkDist) {
            const d = Math.sqrt(d2);
            const al = (1 - d / linkDist) * (0.04 + align * 0.15);
            gfx.strokeStyle = `rgba(161,161,170,${al})`;
            gfx.beginPath();
            gfx.moveTo(a.x, a.y);
            gfx.lineTo(b.x, b.y);
            gfx.stroke();
          }
        }
      }

      if (sweepOn > 0.002) {
        const bandW = W * 0.2;
        const sg = gfx.createLinearGradient(sweepX - bandW, 0, sweepX + bandW, 0);
        sg.addColorStop(0, "rgba(79,85,241,0)");
        sg.addColorStop(0.5, `rgba(79,85,241,${0.09 * sweepOn})`);
        sg.addColorStop(1, "rgba(79,85,241,0)");
        gfx.fillStyle = sg;
        gfx.fillRect(0, 0, W, H);
        gfx.strokeStyle = `rgba(139,143,247,${0.16 * sweepOn})`;
        gfx.lineWidth = 1.5;
        gfx.beginPath();
        gfx.moveTo(sweepX, 0);
        gfx.lineTo(sweepX, H);
        gfx.stroke();
      }

      gfx.globalCompositeOperation = "lighter";
      for (const p of pts) {
        const tw = 0.55 + 0.45 * Math.sin(phase * TAU * p.tc + p.tw);
        const nearSweep = Math.max(0, 1 - Math.abs(p.x - sweepX) / (W * 0.09));
        const verified = ease(nearSweep) * sweepOn;
        const baseR = p.r * (1 + align * 0.4);
        const glowR = baseR * 6;
        const col = DOT.map((c, k) => Math.round(lerp(c, PERI[k], verified)));
        const aCore = (0.3 + 0.3 * tw) * (0.6 + 0.4 * align) + verified * 0.4;
        const rg = gfx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
        rg.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${0.14 + verified * 0.24})`);
        rg.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
        gfx.fillStyle = rg;
        gfx.beginPath();
        gfx.arc(p.x, p.y, glowR, 0, TAU);
        gfx.fill();
        gfx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${Math.min(1, aCore)})`;
        gfx.beginPath();
        gfx.arc(p.x, p.y, baseR, 0, TAU);
        gfx.fill();
      }
      gfx.globalCompositeOperation = "source-over";
    }

    function frame(now: number) {
      const phase = ((now - t0) % LOOP_MS) / LOOP_MS;
      draw(phase);
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);

    if (reduce) {
      draw(0.3);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section data-hero="" className="relative w-full min-h-[100vh] overflow-hidden" style={{ background: "#09090B", color: "#FFFFFF" }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" aria-hidden="true" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(9,9,11,.6) 0%, rgba(9,9,11,.2) 34%, transparent 60%), radial-gradient(120% 90% at 50% 50%, transparent 40%, rgba(9,9,11,.55) 100%), linear-gradient(180deg, rgba(9,9,11,.35) 0%, transparent 22%, transparent 70%, rgba(9,9,11,.6) 100%)",
        }}
      />
      <div
        data-hero-exit=""
        className="relative z-10 flex flex-col items-start justify-center min-h-[100vh] pointer-events-none"
        style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(128px,14vw,168px) clamp(20px,5vw,72px) clamp(72px,8vw,112px)", gap: "clamp(22px,2.8vw,36px)" }}
      >
        <div data-fx="rise" data-d="100" style={{ display: "flex", alignItems: "baseline", gap: 12, fontSize: "clamp(16px,1.5vw,22px)", fontWeight: 600, letterSpacing: ".02em", color: "#8B8FF7" }}>
          <span aria-hidden="true" style={{ display: "inline-block", width: 10, height: 10, borderRadius: 1, background: "#8B8FF7", transform: "skewX(-30deg)", alignSelf: "center" }} />
          A4 Services · Malta
        </div>
        <h1 style={{ margin: 0, maxWidth: 1000, fontSize: "clamp(40px,5.8vw,96px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.03, textWrap: "balance" }}>
          <TypeText segments={[{ t: "Clarity, brought to", c: "#FFFFFF" }]} per={34} d={260} />
          <div data-fx="rise" data-d="1030" data-dy="60" style={{ fontWeight: 600, paddingBottom: ".08em", marginBottom: "-.08em", ...gradText }}>
            every figure.
          </div>
        </h1>
        <p data-fx="rise" data-d="1210" style={{ margin: 0, maxWidth: 640, fontSize: "clamp(18px,1.7vw,24px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.45, color: "#A1A1AA", textWrap: "pretty" }}>
          Audit and accounting that reconciles the detail and reports with precision — so the numbers tell the truth, plainly.
        </p>
        <div data-fx="rise" data-d="1350">
          <LocalizedLink href={href("/contact")} className="a4-btn a4-btn-light pointer-events-auto" style={{ textDecoration: "none" }}>
            Book a consultation <span aria-hidden="true">→</span>
          </LocalizedLink>
        </div>
      </div>
    </section>
  );
}
