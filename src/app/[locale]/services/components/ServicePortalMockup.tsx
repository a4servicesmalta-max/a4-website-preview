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
    <div style={{ padding: "26px 26px 24px" }}>
      <div className="a4-font-body text-[12.5px] text-[var(--a4-on-dark-mute)]" style={pmRise(0, reduce)}>
        Welcome to A4
      </div>
      <div
        className="a4-font-display font-medium text-[23px] text-white tracking-[-.3px] mt-1"
        style={pmRise(1, reduce)}
      >
        Create your account
      </div>
      <div className="flex flex-col gap-[13px] mt-[22px]">
        {fields.map((f, i) => (
          <div key={f.label} style={pmRise(2 + i, reduce)}>
            <div className="a4-font-body text-[11px] uppercase tracking-[.1em] text-[var(--a4-stone)] mb-[6px]">
              {f.label}
            </div>
            <div
              className="flex items-center h-[44px] px-[14px] rounded-[var(--a4-r-md)] a4-font-body text-[14px] text-white"
              style={{ background: "var(--a4-surface-deep)", border: "1px solid var(--a4-hairline-dark)" }}
            >
              {f.value}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5" style={pmRise(4, reduce)}>
        <div className="flex items-center justify-center gap-2 h-[46px] rounded-[var(--a4-r-full)] bg-white text-black a4-font-body text-[14.5px] font-semibold">
          Create account <Icon name="arrow-right" size={16} color="#000" />
        </div>
      </div>
      <div
        className="text-center mt-[14px] a4-font-body text-[11.5px] text-[var(--a4-stone)]"
        style={pmRise(5, reduce)}
      >
        No card required · ready in 2 minutes
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
    <div style={{ padding: "26px 26px 24px" }}>
      <div className="a4-font-body text-[12.5px] text-[var(--a4-on-dark-mute)]" style={pmRise(0, reduce)}>
        Tell us what you need
      </div>
      <div
        className="a4-font-display font-medium text-[23px] text-white tracking-[-.3px] mt-1"
        style={pmRise(1, reduce)}
      >
        Request your services
      </div>
      <div className="flex flex-col gap-[10px] mt-[22px]">
        {services.map((s, i) => (
          <div
            key={s.name}
            className="flex items-center gap-[13px] h-[52px] px-[15px] rounded-[var(--a4-r-md)]"
            style={{
              background: s.on ? "rgba(73,79,223,.10)" : "var(--a4-surface-deep)",
              border: `1px solid ${s.on ? "rgba(73,79,223,.4)" : "var(--a4-hairline-dark)"}`,
              ...pmRise(2 + i, reduce),
            }}
          >
            <Icon name={s.icon} size={18} color={s.on ? "var(--a4-primary-bright)" : "var(--a4-stone)"} />
            <span
              className="flex-1 a4-font-body text-[14px] font-medium"
              style={{ color: s.on ? "#fff" : "var(--a4-on-dark-mute)" }}
            >
              {s.name}
            </span>
            <span
              className="w-[22px] h-[22px] rounded-full grid place-items-center"
              style={{
                background: s.on ? "var(--a4-primary)" : "transparent",
                border: s.on ? "none" : "1.5px solid #3a3d40",
              }}
            >
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

  const lines = [
    ["Monthly bookkeeping", "€75"],
    ["Bank reconciliations", "€60"],
    ["VAT returns", "€30"],
    ["Management reports", "€20"],
  ];

  return (
    <div style={{ padding: "26px 26px 24px" }}>
      <div className="a4-font-body text-[12.5px] text-[var(--a4-on-dark-mute)]" style={pmRise(0, reduce)}>
        Based on your request
      </div>
      <div
        className="a4-font-display font-medium text-[23px] text-white tracking-[-.3px] mt-1"
        style={pmRise(1, reduce)}
      >
        Your quote is ready
      </div>
      <div className="flex items-baseline gap-2 mt-[18px]" style={pmRise(2, reduce)}>
        <span className="a4-font-display font-medium text-[46px] text-white tracking-[-1.5px] tabular-nums">
          €{val}
        </span>
        <span className="a4-font-body text-[14px] text-[var(--a4-on-dark-mute)]">/ month · fixed</span>
      </div>
      <div
        className="mt-4 rounded-[var(--a4-r-md)] overflow-hidden"
        style={{ border: "1px solid var(--a4-hairline-dark)", ...pmRise(3, reduce) }}
      >
        {lines.map(([k, v], i) => (
          <div
            key={k}
            className="flex justify-between py-[9px] px-[14px]"
            style={{ borderTop: i ? "1px solid var(--a4-divider-soft)" : "none" }}
          >
            <span className="a4-font-body text-[12.5px] text-[var(--a4-on-dark-mute)]">{k}</span>
            <span className="a4-font-body text-[12.5px] font-medium text-white tabular-nums">{v}</span>
          </div>
        ))}
      </div>
      <div className="mt-[18px]" style={pmRise(4, reduce)}>
        <div className="flex items-center justify-center gap-2 h-[46px] rounded-[var(--a4-r-full)] a4-font-body text-[14.5px] font-semibold text-white" style={{ background: "var(--a4-primary)" }}>
          Accept &amp; get started <Icon name="arrow-right" size={16} color="#fff" />
        </div>
      </div>
    </div>
  );
}

/** Full laptop-framed portal mockup — exact UI from New website (2)/app/PortalMockup.jsx */
export function ServicePortalMockup() {
  const [reduce, setReduce] = useState(false);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    let done = false;
    const begin = () => {
      if (!done) {
        done = true;
        setStarted(true);
      }
    };
    const el = document.getElementById("a4-service-portal-mock");
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
  }, []);

  useEffect(() => {
    if (!started || reduce) return;
    const id = setInterval(() => setStep((s) => (s + 1) % 3), PM_DURATION);
    return () => clearInterval(id);
  }, [started, reduce]);

  const shown = reduce ? 2 : step;
  const Screen = [PMScreenAccount, PMScreenRequest, PMScreenQuote][shown];

  return (
    <div id="a4-service-portal-mock" className="relative w-full max-w-[520px]">
      <div
        className="absolute pointer-events-none"
        style={{
          inset: "-10% -6% -24%",
          background: "radial-gradient(58% 52% at 52% 34%, rgba(73,79,223,.18), transparent 72%)",
          filter: "blur(24px)",
        }}
      />

      {/* laptop lid */}
      <div
        className="relative"
        style={{
          background: "linear-gradient(#26292e, #15171a)",
          borderRadius: "16px 16px 0 0",
          padding: "11px 11px 0",
          boxShadow: "0 36px 90px -34px rgba(0,0,0,.95)",
        }}
      >
        {/* camera */}
        <div className="flex justify-center pb-[9px]">
          <span
            className="rounded-full"
            style={{
              width: 5,
              height: 5,
              background: "#34373c",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)",
            }}
          />
        </div>

        {/* screen */}
        <div
          className="relative overflow-hidden"
          style={{
            background: "var(--a4-surface-elevated)",
            borderRadius: "5px 5px 0 0",
            border: "1px solid #000",
            borderBottom: "none",
          }}
        >
          {/* window chrome */}
          <div
            className="flex items-center gap-2 px-4 py-[13px]"
            style={{ borderBottom: "1px solid var(--a4-divider-soft)" }}
          >
            <span className="w-[10px] h-[10px] rounded-full" style={{ background: "#3a3d40" }} />
            <span className="w-[10px] h-[10px] rounded-full" style={{ background: "#3a3d40" }} />
            <span className="w-[10px] h-[10px] rounded-full" style={{ background: "#3a3d40" }} />
            <div className="flex-1 text-center a4-font-body text-[11.5px] text-[var(--a4-stone)] tracking-[.4px]">
              client.a4.com.mt
            </div>
          </div>

          {/* step indicator */}
          <div className="flex gap-2 pt-4 px-[22px] pb-1">
            {PM_STEPS.map((label, i) => (
              <div key={label} className="flex-1">
                <div className="flex items-center gap-[7px] mb-2">
                  <span
                    className="w-[18px] h-[18px] rounded-full grid place-items-center shrink-0 a4-font-body text-[10.5px] font-bold transition-colors duration-300"
                    style={{
                      background: i <= shown ? "var(--a4-primary)" : "var(--a4-surface-deep)",
                      color: i <= shown ? "#fff" : "var(--a4-stone)",
                      border: i <= shown ? "none" : "1px solid var(--a4-hairline-dark)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="pm-steplabel a4-font-body text-[11.5px] whitespace-nowrap transition-colors duration-300"
                    style={{
                      fontWeight: i === shown ? 600 : 500,
                      color: i === shown ? "#fff" : "var(--a4-stone)",
                    }}
                  >
                    {label}
                  </span>
                </div>
                <div
                  className="h-[3px] rounded-full overflow-hidden"
                  style={{ background: "var(--a4-surface-deep)" }}
                >
                  <div
                    key={`${i}-${shown}-${started}`}
                    className="h-full rounded-full"
                    style={{
                      background: "var(--a4-primary)",
                      width: i < shown ? "100%" : i === shown ? (reduce ? "100%" : "0%") : "0%",
                      animation:
                        i === shown && started && !reduce
                          ? `a4grow ${PM_DURATION}ms linear forwards`
                          : "none",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* app screen */}
          <div style={{ minHeight: 356 }}>
            <div key={shown}>
              <Screen reduce={reduce} />
            </div>
          </div>
        </div>
      </div>

      {/* laptop base / hinge */}
      <div
        className="relative"
        style={{
          height: 15,
          width: "calc(100% + 54px)",
          marginLeft: -27,
          background: "linear-gradient(#3c4046, #1a1c1f)",
          borderRadius: "0 0 13px 13px",
          boxShadow: "0 26px 44px -20px rgba(0,0,0,.85)",
        }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: 108,
            height: 7,
            background: "#0e1012",
            borderRadius: "0 0 7px 7px",
          }}
        />
      </div>
    </div>
  );
}
