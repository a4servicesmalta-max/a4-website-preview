"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "@/components/a4-landing/Primitives";

const PM_STEPS = ["Create account", "Request services", "Get your quote"];
const PM_DURATION = 3800;

function pmRise(i: number, reduce: boolean) {
  return reduce ? {} : { animation: "a4rise .55s cubic-bezier(.2,.7,.2,1) both", animationDelay: `${0.06 + i * 0.08}s` };
}

function PMScreenAccount({ reduce }: { reduce: boolean }) {
  const fields = [
    { label: "Full name", value: "James Caruana" },
    { label: "Work email", value: "james@nexustrading.mt" },
  ];
  return (
    <div className="pt-[26px] px-[26px] pb-[24px]">
      <div className="a4-font-body text-[12.5px] text-[var(--a4-on-dark-mute)]" style={pmRise(0, reduce)}>Welcome to A4</div>
      <div className="a4-font-display font-medium text-[23px] text-[#fff] tracking-[-.3px] mt-[4px]" style={pmRise(1, reduce)}>Create your account</div>
      <div className="flex flex-col gap-[13px] mt-[22px]">
        {fields.map((f, i) => (
          <div key={f.label} style={pmRise(2 + i, reduce)}>
            <div className="a4-font-body text-[11px] uppercase tracking-[.1em] text-[var(--a4-stone)] mb-[6px]">{f.label}</div>
            <div className="flex items-center h-[44px] px-[14px] rounded-[var(--a4-r-md)] bg-[var(--a4-surface-deep)] border border-[var(--a4-hairline-dark)] a4-font-body text-[14px] text-[#fff]">{f.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-[20px]" style={pmRise(4, reduce)}>
        <div className="flex items-center justify-center gap-[8px] h-[46px] rounded-[var(--a4-r-full)] bg-[#fff] text-[#000] a4-font-body text-[14.5px] font-semibold">
          Create account <Icon name="arrow-right" size={16} color="#000" />
        </div>
      </div>
    </div>
  );
}

function PMScreenRequest({ reduce }: { reduce: boolean }) {
  const services = [
    { icon: "book-open", name: "Monthly bookkeeping", on: true },
    { icon: "scale", name: "Bank reconciliations", on: true },
    { icon: "receipt", name: "VAT returns", on: true },
    { icon: "users", name: "Payroll", on: false },
  ];
  return (
    <div className="pt-[26px] px-[26px] pb-[24px]">
      <div className="a4-font-body text-[12.5px] text-[var(--a4-on-dark-mute)]" style={pmRise(0, reduce)}>Tell us what you need</div>
      <div className="a4-font-display font-medium text-[23px] text-[#fff] tracking-[-.3px] mt-[4px]" style={pmRise(1, reduce)}>Request your services</div>
      <div className="flex flex-col gap-[10px] mt-[22px]">
        {services.map((s, i) => (
          <div key={s.name} className="flex items-center gap-[13px] h-[52px] px-[15px] rounded-[var(--a4-r-md)]" style={{ background: s.on ? "rgba(73,79,223,.10)" : "var(--a4-surface-deep)", border: `1px solid ${s.on ? "rgba(73,79,223,.4)" : "var(--a4-hairline-dark)"}`, ...pmRise(2 + i, reduce) }}>
            <Icon name={s.icon} size={18} color={s.on ? "var(--a4-primary-bright)" : "var(--a4-stone)"} />
            <span className="flex-1 a4-font-body text-[14px] font-medium" style={{ color: s.on ? "#fff" : "var(--a4-on-dark-mute)" }}>{s.name}</span>
            <span className="w-[22px] h-[22px] rounded-full grid place-items-center" style={{ background: s.on ? "var(--a4-primary)" : "transparent", border: s.on ? "none" : "1.5px solid #3a3d40" }}>
              {s.on && <Icon name="check" size={13} color="#fff" stroke={3} />}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PMScreenQuote({ reduce }: { reduce: boolean }) {
  const target = 185;
  const [val, setVal] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce) return;
    let raf: number;
    let start: number;
    const dur = 1100;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);
  const lines = [["Monthly bookkeeping", "€75"], ["Bank reconciliations", "€60"], ["VAT returns", "€30"], ["Management reports", "€20"]];
  return (
    <div className="pt-[26px] px-[26px] pb-[24px]">
      <div className="a4-font-body text-[12.5px] text-[var(--a4-on-dark-mute)]" style={pmRise(0, reduce)}>Based on your request</div>
      <div className="a4-font-display font-medium text-[23px] text-[#fff] tracking-[-.3px] mt-[4px]" style={pmRise(1, reduce)}>Your quote is ready</div>
      <div className="flex items-baseline gap-[8px] mt-[18px]" style={pmRise(2, reduce)}>
        <span className="a4-font-display font-medium text-[46px] text-[#fff] tracking-[-1.5px] tabular-nums">€{val}</span>
        <span className="a4-font-body text-[14px] text-[var(--a4-on-dark-mute)]">/ month · fixed</span>
      </div>
      <div className="mt-[16px] rounded-[var(--a4-r-md)] border border-[var(--a4-hairline-dark)] overflow-hidden" style={pmRise(3, reduce)}>
        {lines.map(([k, v], i) => (
          <div key={k} className="flex justify-between py-[9px] px-[14px]" style={{ borderTop: i ? "1px solid var(--a4-divider-soft)" : "none" }}>
            <span className="a4-font-body text-[12.5px] text-[var(--a4-on-dark-mute)]">{k}</span>
            <span className="a4-font-body text-[12.5px] font-medium text-[#fff] tabular-nums">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PortalMockup({ animate = false }: { animate?: boolean }) {
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!animate) return;
    let done = false;
    const begin = () => {
      if (!done) {
        done = true;
        setStarted(true);
      }
    };
    const el = document.getElementById("a4-portal-mock");
    let io: IntersectionObserver | undefined;
    if (el && "IntersectionObserver" in window) {
      io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && begin()), { threshold: 0.15 });
      io.observe(el);
    }
    const fallback = setTimeout(begin, 1200);
    return () => {
      io?.disconnect();
      clearTimeout(fallback);
    };
  }, [animate]);

  useEffect(() => {
    if (!animate || !started || reduce) return;
    const id = setInterval(() => setStep((s) => (s + 1) % 3), PM_DURATION);
    return () => clearInterval(id);
  }, [animate, started, reduce]);

  const shown = !animate ? 0 : reduce ? 2 : step;
  const Screen = [PMScreenAccount, PMScreenRequest, PMScreenQuote][shown];

  return (
    <div id="a4-portal-mock" className="relative w-full max-w-[480px]">
      <div className="relative bg-[var(--a4-surface-elevated)] border border-[var(--a4-hairline-dark)] rounded-[var(--a4-r-xl)] overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,.9)]">
        <div className="flex gap-[8px] pt-[16px] px-[22px] pb-[4px]">
          {PM_STEPS.map((label, i) => (
            <div key={label} className="flex-1">
              <div className="flex items-center gap-[7px] mb-[8px]">
                <span className="w-[18px] h-[18px] rounded-full grid place-items-center shrink-0 a4-font-body text-[10.5px] font-bold" style={{ background: i <= shown ? "var(--a4-primary)" : "var(--a4-surface-deep)", color: i <= shown ? "#fff" : "var(--a4-stone)" }}>
                  {i + 1}
                </span>
                <span className="pm-steplabel a4-font-body text-[11.5px] whitespace-nowrap" style={{ fontWeight: i === shown ? 600 : 500, color: i === shown ? "#fff" : "var(--a4-stone)" }}>{label}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="min-h-[372px]">
          <Screen reduce={reduce} />
        </div>
      </div>
    </div>
  );
}
