"use client";

import React, { useEffect, useRef } from "react";

// HeroFX.tsx — "Reconciliation" animated canvas, adapted as the hero background.
// True-black base, neutral blue-grey data points, accent sweep driven by the
// site's --a4-primary token (passed as `accent`). One phase var, seamless 14s loop.

export function HeroFX({ accent = "#494fdf" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const hexToRgb = (h: string) => {
    h = h.replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ACCENT = hexToRgb(accent);
    const DOT = [150, 170, 200];
    const LOOP_MS = 14000;
    const TAU = Math.PI * 2;

    let W = 0, H = 0, DPR = 1, raf = 0, t0 = performance.now();

    // deterministic field
    const N = 54;
    let rng = 20260602;
    const rand = () => { rng = (rng * 1103515245 + 12345) & 0x7fffffff; return rng / 0x7fffffff; };
    const COLS = 5;
    const ROWS_PER_COL = Math.ceil(N / COLS);
    const pts: any[] = [];
    for (let i = 0; i < N; i++) {
      pts.push({
        bx: rand(), by: rand(),
        ax: 0.016 + rand() * 0.045, ay: 0.018 + rand() * 0.05,
        px: rand() * TAU, py: rand() * TAU,
        cx: rand() < 0.72 ? 1 : 2, cy: rand() < 0.72 ? 1 : 2,
        tc: rand() < 0.6 ? 1 : 2,
        r: 0.7 + rand() * 1.4,
        col: i % COLS, row: Math.floor(i / COLS),
        tw: rand() * TAU, x: 0, y: 0,
      });
    }

    const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
    const ease = (k: number) => k * k * (3 - 2 * k);
    const bump = (phase: number, c: number, w: number) => { let d = Math.abs(phase - c); d = Math.min(d, 1 - d); return d > w ? 0 : ease(1 - d / w); };

    const parent = canvas.parentElement;
    if (!parent) return;

    function resize() {
      if (!canvas || !parent || !ctx) return;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = parent.clientWidth; H = parent.clientHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    resize();

    function draw(phase: number) {
      if (!ctx) return;
      // base: near-black with a faint cool lift toward upper-centre
      const g = ctx.createRadialGradient(W * 0.42, H * 0.42, 0, W * 0.42, H * 0.42, Math.max(W, H) * 0.85);
      g.addColorStop(0, "#0c0f16");
      g.addColorStop(1, "#000000");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // faint ledger grid
      ctx.lineWidth = 1;
      const rows = 9;
      for (let i = 1; i < rows; i++) {
        const y = (H / rows) * i;
        ctx.strokeStyle = `rgba(150,170,200,${0.014 + 0.009 * Math.sin(i)})`;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      const align = Math.max(bump(phase, 0.30, 0.13), bump(phase, 0.78, 0.13));
      const sweepOn = bump(phase, 0.62, 0.26);
      const sweepLoc = (phase - 0.36) / 0.52;
      const sweepX = lerp(-0.15, 1.15, Math.min(1, Math.max(0, sweepLoc))) * W;

      const colX = (c: number) => lerp(0.40, 0.78, c / (COLS - 1));
      for (const p of pts) {
        const x = p.bx + p.ax * Math.sin(phase * TAU * p.cx + p.px);
        const y = p.by + p.ay * Math.cos(phase * TAU * p.cy + p.py);
        const tx = colX(p.col);
        const ty = 0.18 + (p.row / (ROWS_PER_COL - 1)) * 0.64;
        p.x = lerp(x, tx, align * 0.85) * W;
        p.y = lerp(y, ty, align * 0.85) * H;
      }

      const linkDist = lerp(104, 162, align);
      ctx.lineWidth = 1;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkDist * linkDist) {
            const d = Math.sqrt(d2);
            const al = (1 - d / linkDist) * (0.035 + align * 0.13);
            ctx.strokeStyle = `rgba(150,170,200,${al})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      if (sweepOn > 0.002) {
        const bandW = W * 0.20;
        const sg = ctx.createLinearGradient(sweepX - bandW, 0, sweepX + bandW, 0);
        sg.addColorStop(0, `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},0)`);
        sg.addColorStop(0.5, `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${0.06 * sweepOn})`);
        sg.addColorStop(1, `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},0)`);
        ctx.fillStyle = sg;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${0.12 * sweepOn})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(sweepX, 0); ctx.lineTo(sweepX, H); ctx.stroke();
      }

      ctx.globalCompositeOperation = "lighter";
      for (const p of pts) {
        const tw = 0.55 + 0.45 * Math.sin(phase * TAU * p.tc + p.tw);
        const nearSweep = Math.max(0, 1 - Math.abs(p.x - sweepX) / (W * 0.09));
        const verified = ease(nearSweep) * sweepOn;
        const baseR = p.r * (1 + align * 0.4);
        const glowR = baseR * 6;
        const col = DOT.map((c, k) => Math.round(lerp(c, ACCENT[k], verified)));
        const aCore = (0.26 + 0.28 * tw) * (0.6 + 0.4 * align) + verified * 0.4;
        const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
        rg.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${0.12 + verified * 0.22})`);
        rg.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
        ctx.fillStyle = rg;
        ctx.beginPath(); ctx.arc(p.x, p.y, glowR, 0, TAU); ctx.fill();
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${Math.min(1, aCore)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, baseR, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }

    function frame(now: number) {
      const phase = ((now - t0) % LOOP_MS) / LOOP_MS;
      draw(phase);
      raf = requestAnimationFrame(frame);
    }

    if (reduce) { draw(0.30); }
    else { raf = requestAnimationFrame(frame); }

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [accent]);

  return (
    <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full block pointer-events-none" />
  );
}
