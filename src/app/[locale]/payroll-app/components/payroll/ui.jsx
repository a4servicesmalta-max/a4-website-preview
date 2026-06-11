// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Icon, Logo } from "@/components/a4-landing/Primitives";
import { PayCalc } from "./calc";

// ui.jsx — A4 payroll app shell primitives. Requires app/Primitives.jsx (Icon, Logo).
const payUI = {}; // namespace marker (avoid global `styles` collisions)

const PAY_NAV = [
  { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { id: "people", label: "People", icon: "users" },
  { id: "run", label: "Run Payroll", icon: "play-circle" },
  { id: "history", label: "Payroll History", icon: "history" },
  { id: "forms", label: "Tax Forms", icon: "file-text" },
  { id: "reports", label: "Reports", icon: "bar-chart-3" },
  { id: "settings", label: "Settings", icon: "settings" },
];

function PaySidebar({ page, go }) {
  return (
    <aside style={{ width: 232, flexShrink: 0, borderRight: "1px solid var(--hairline-dark)", display: "flex", flexDirection: "column", padding: "20px 14px", gap: 4, background: "#000" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "2px 14px 18px" }}>
        <Logo height={20} />
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 15.5, color: "#fff", letterSpacing: "-.2px" }}>A4 Portal</div>
          <div style={{ fontSize: 11, color: "var(--stone)", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>Payroll · Malta</div>
        </div>
      </div>
      {PAY_NAV.map((n) => (
        <button key={n.id} className={"pay-navitem" + (page === n.id ? " active" : "")} onClick={() => go(n.id)}>
          <Icon name={n.icon} size={17} color={page === n.id ? "var(--primary-bright)" : "currentColor"} />
          {n.label}
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ borderTop: "1px solid var(--hairline-dark)", paddingTop: 14, display: "flex", alignItems: "center", gap: 10, padding: "14px 14px 0" }}>
        <span style={{ width: 30, height: 30, borderRadius: "var(--r-full)", background: "var(--primary)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>MB</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Maria Borg</div>
          <div style={{ fontSize: 11.5, color: "var(--stone)" }}>Payroll admin</div>
        </div>
      </div>
    </aside>
  );
}

function PayTopbar({ title, monthIdx, setMonthIdx, right }) {
  return (
    <header style={{ height: 64, flexShrink: 0, borderBottom: "1px solid var(--hairline-dark)", display: "flex", alignItems: "center", gap: 16, padding: "0 28px", background: "#000", position: "sticky", top: 0, zIndex: 20 }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 19, color: "#fff", letterSpacing: "-.3px" }}>{title}</div>
      <div style={{ flex: 1 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--on-dark-mute)" }}>
        <Icon name="building-2" size={15} color="var(--stone)" /> Borg Marine Ltd
      </div>
      <span style={{ width: 1, height: 22, background: "var(--hairline-dark)" }} />
      <select className="pay-select" style={{ width: 168, height: 38 }} value={monthIdx} onChange={(e) => setMonthIdx(+e.target.value)} aria-label="Payroll period">
        {PAY_MONTHS.map((m, i) => <option key={m} value={i}>{m} 2026</option>)}
      </select>
      {right}
    </header>
  );
}

const PAY_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function PayCard({ title, icon, right, children, style, pad = 22 }) {
  return (
    <section style={{ background: "var(--surface-elevated)", border: "1px solid var(--hairline-dark)", borderRadius: "var(--r-lg)", overflow: "hidden", ...style }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 22px", borderBottom: "1px solid var(--divider-soft)" }}>
          {icon && <Icon name={icon} size={17} color="var(--primary-bright)" />}
          <span style={{ fontSize: 14.5, fontWeight: 600, color: "#fff" }}>{title}</span>
          <div style={{ flex: 1 }} />
          {right}
        </div>
      )}
      <div style={{ padding: pad }}>{children}</div>
    </section>
  );
}

function PayBtn({ children, onClick, variant = "primary", size = "md", disabled, style }) {
  const v = {
    primary: { background: disabled ? "#2a2d31" : "#fff", color: disabled ? "var(--stone)" : "#000" },
    cobalt: { background: disabled ? "#2a2d31" : "var(--primary)", color: disabled ? "var(--stone)" : "#fff" },
    ghost: { background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,.28)" },
    soft: { background: "rgba(255,255,255,.08)", color: "#fff" },
    danger: { background: "transparent", color: "var(--accent-danger)", border: "1px solid rgba(214,69,69,.4)" },
  }[variant];
  const s = { md: { height: 42, padding: "0 20px", fontSize: 14 }, sm: { height: 34, padding: "0 14px", fontSize: 13 }, lg: { height: 48, padding: "0 26px", fontSize: 15 } }[size];
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{ border: 0, cursor: disabled ? "default" : "pointer", borderRadius: "var(--r-full)", fontFamily: "var(--font-body)", fontWeight: 600, letterSpacing: ".2px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity .15s", whiteSpace: "nowrap", ...s, ...v, ...style }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.opacity = ".8")}
      onMouseUp={(e) => (e.currentTarget.style.opacity = "1")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>{children}</button>
  );
}

function PayField({ label, hint, children, style }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 7, ...style }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".04em", color: "var(--on-dark-mute)" }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 12, color: "var(--stone)" }}>{hint}</span>}
    </label>
  );
}

function PayToggle({ on, onChange, label, sub }) {
  return (
    <button onClick={() => onChange(!on)} style={{ display: "flex", alignItems: "center", gap: 13, background: "var(--surface-deep)", border: `1px solid ${on ? "rgba(73,79,223,.55)" : "var(--hairline-dark)"}`, borderRadius: "var(--r-md)", padding: "12px 14px", cursor: "pointer", textAlign: "left", width: "100%", transition: "border-color .15s" }}>
      <span style={{ width: 38, height: 22, borderRadius: 99, background: on ? "var(--primary)" : "#2a2d31", position: "relative", flexShrink: 0, transition: "background .18s" }}>
        <span style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: 99, background: "#fff", transition: "left .18s" }}></span>
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "#fff" }}>{label}</span>
        {sub && <span style={{ display: "block", fontSize: 12, color: "var(--stone)", marginTop: 2 }}>{sub}</span>}
      </span>
    </button>
  );
}

function PaySeg({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, background: "var(--surface-deep)", border: "1px solid var(--hairline-dark)", borderRadius: "var(--r-full)", padding: 4 }}>
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{ flex: 1, height: 34, border: 0, borderRadius: "var(--r-full)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, background: value === o.value ? "var(--primary)" : "transparent", color: value === o.value ? "#fff" : "var(--on-dark-mute)", transition: "background .15s, color .15s", whiteSpace: "nowrap", padding: "0 12px" }}>{o.label}</button>
      ))}
    </div>
  );
}

function PayStat({ label, value, sub, icon, accent }) {
  return (
    <div style={{ background: "var(--surface-elevated)", border: "1px solid var(--hairline-dark)", borderRadius: "var(--r-lg)", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--stone)" }}>
        <Icon name={icon} size={15} color={accent || "var(--primary-bright)"} /> {label}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 30, letterSpacing: "-.5px", color: "#fff" }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: "var(--stone)" }}>{sub}</div>}
    </div>
  );
}

function PayChip({ tone = "neutral", children }) {
  const tones = {
    neutral: { bg: "rgba(255,255,255,.08)", c: "var(--on-dark-mute)" },
    green: { bg: "rgba(0,160,130,.14)", c: "var(--accent-teal)" },
    cobalt: { bg: "rgba(73,79,223,.18)", c: "var(--primary-bright)" },
    warn: { bg: "rgba(214,134,30,.16)", c: "var(--accent-warning)" },
  }[tone];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, padding: "4px 11px", borderRadius: 99, background: tones.bg, color: tones.c, whiteSpace: "nowrap" }}>{children}</span>;
}

function PayEmpty({ icon, title, sub, action }) {
  return (
    <div style={{ textAlign: "center", padding: "52px 20px" }}>
      <span style={{ width: 52, height: 52, borderRadius: "var(--r-full)", border: "1px solid var(--hairline-dark)", display: "inline-grid", placeItems: "center" }}><Icon name={icon} size={22} color="var(--stone)" /></span>
      <div style={{ fontSize: 15.5, fontWeight: 600, color: "#fff", marginTop: 16 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: "var(--stone)", marginTop: 6, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>{sub}</div>
      {action && <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>{action}</div>}
    </div>
  );
}

export {  PAY_NAV, PAY_MONTHS, PaySidebar, PayTopbar, PayCard, PayBtn, PayField, PayToggle, PaySeg, PayStat, PayChip, PayEmpty  };
