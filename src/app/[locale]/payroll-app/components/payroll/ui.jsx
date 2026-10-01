import React from "react";
import { Icon, Logo } from "@/components/a4-landing/Primitives";

// ui.jsx — A4 payroll app shell primitives, in the A4 palette (Outfit controls,
// pill buttons, the design's 48×28 switch). Requires app/Primitives.jsx (Icon, Logo).

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
    <aside className="pay-side" style={{ width: 232, flexShrink: 0, borderRight: "1px solid var(--hairline-dark)", display: "flex", flexDirection: "column", padding: "20px 14px", gap: 4, background: "#09090B" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "2px 14px 18px" }}>
        <Logo height={20} />
        <div className="pay-side-label">
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "#fff", letterSpacing: "-0.02em" }}>A4 Portal</div>
          <div style={{ fontSize: 11, color: "var(--stone)", fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" }}>Payroll · Malta</div>
        </div>
      </div>
      {PAY_NAV.map((n) => (
        <button key={n.id} className={"pay-navitem" + (page === n.id ? " active" : "")} onClick={() => go(n.id)} aria-current={page === n.id ? "page" : undefined} title={n.label}>
          <Icon name={n.icon} size={17} color={page === n.id ? "var(--primary-bright)" : "currentColor"} />
          <span className="pay-navitem-label">{n.label}</span>
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ borderTop: "1px solid var(--hairline-dark)", display: "flex", alignItems: "center", gap: 10, padding: "14px 14px 0" }}>
        <span style={{ width: 30, height: 30, borderRadius: "var(--r-full)", background: "var(--primary)", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 600, color: "#fff", flexShrink: 0 }}>MB</span>
        <div className="pay-side-label" style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 13.5, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Maria Borg</div>
          <div style={{ fontSize: 11.5, color: "var(--stone)" }}>Payroll admin</div>
        </div>
      </div>
    </aside>
  );
}

function PayTopbar({ title, monthIdx, setMonthIdx, right }) {
  return (
    <header style={{ height: 64, flexShrink: 0, borderBottom: "1px solid var(--hairline-dark)", display: "flex", alignItems: "center", gap: 16, padding: "0 clamp(16px,3vw,28px)", background: "#09090B", position: "sticky", top: 0, zIndex: 20 }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 19, color: "#fff", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{title}</div>
      <div style={{ flex: 1 }} />
      <div className="pay-topbar-company" style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 500, color: "var(--on-dark-mute)" }}>
        <Icon name="building-2" size={15} color="var(--stone)" /> Borg Marine Ltd
      </div>
      <span className="pay-topbar-company" style={{ width: 1, height: 22, background: "var(--hairline-dark)" }} />
      <select className="pay-select" style={{ width: 168, height: 38, borderRadius: 999 }} value={monthIdx} onChange={(e) => setMonthIdx(+e.target.value)} aria-label="Payroll period">
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 22px", borderBottom: "1px solid var(--divider-soft)", flexWrap: "wrap" }}>
          {icon && <Icon name={icon} size={17} color="var(--primary-bright)" />}
          <span style={{ fontFamily: "var(--font-display)", fontSize: 15.5, fontWeight: 600, letterSpacing: "-0.01em", color: "#fff" }}>{title}</span>
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
    primary: { background: disabled ? "#27272A" : "#fff", color: disabled ? "var(--stone)" : "#09090B" },
    cobalt: { background: disabled ? "#27272A" : "var(--primary)", color: disabled ? "var(--stone)" : "#fff" },
    ghost: { background: "rgba(255,255,255,.06)", color: "#fff", border: "1px solid rgba(255,255,255,.22)" },
    soft: { background: "rgba(255,255,255,.08)", color: "#fff" },
    danger: { background: "transparent", color: "var(--accent-danger)", border: "1px solid rgba(255,255,255,.28)" },
  }[variant];
  const s = { md: { height: 44, padding: "0 20px", fontSize: 14.5 }, sm: { height: 36, padding: "0 14px", fontSize: 13.5 }, lg: { height: 48, padding: "0 26px", fontSize: 15.5 } }[size];
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{ border: 0, cursor: disabled ? "default" : "pointer", borderRadius: "var(--r-full)", fontFamily: "var(--font-display)", fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity .15s, background .3s", whiteSpace: "nowrap", ...s, ...v, ...style }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.opacity = ".8")}
      onMouseUp={(e) => (e.currentTarget.style.opacity = "1")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>{children}</button>
  );
}

function PayField({ label, hint, children, style }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 7, ...style }}>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 13.5, fontWeight: 600, color: "var(--on-dark-mute)" }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 12, color: "var(--stone)" }}>{hint}</span>}
    </label>
  );
}

function PayToggle({ on, onChange, label, sub }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} style={{ display: "flex", alignItems: "center", gap: 13, background: "var(--surface-deep)", border: `1px solid ${on ? "rgba(79,85,241,.55)" : "var(--hairline-dark)"}`, borderRadius: "var(--r-md)", padding: "12px 14px", cursor: "pointer", textAlign: "left", width: "100%", transition: "border-color .3s" }}>
      <span style={{ width: 48, height: 28, borderRadius: 14, background: on ? "var(--primary)" : "#3F3F46", position: "relative", flexShrink: 0, transition: "background .3s" }}>
        <span style={{ position: "absolute", top: 3, left: 3, width: 22, height: 22, borderRadius: 11, background: "#fff", boxShadow: "0 1px 3px rgba(9,9,11,.3)", transform: `translateX(${on ? 20 : 0}px)`, transition: "transform .35s cubic-bezier(.16,1,.3,1)" }}></span>
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontFamily: "var(--font-display)", fontSize: 14.5, fontWeight: 600, color: "#fff" }}>{label}</span>
        {sub && <span style={{ display: "block", fontSize: 12, color: "var(--stone)", marginTop: 2 }}>{sub}</span>}
      </span>
    </button>
  );
}

function PaySeg({ options, value, onChange }) {
  return (
    <div role="group" style={{ display: "flex", gap: 4, background: "var(--surface-deep)", border: "1px solid var(--hairline-dark)", borderRadius: "var(--r-full)", padding: 4 }}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)} style={{ flex: 1, height: 36, border: 0, borderRadius: "var(--r-full)", cursor: "pointer", fontFamily: "var(--font-display)", fontSize: 13.5, fontWeight: 600, background: value === o.value ? "#fff" : "transparent", color: value === o.value ? "#09090B" : "var(--on-dark-mute)", transition: "background .3s, color .3s", whiteSpace: "nowrap", padding: "0 12px" }}>{o.label}</button>
      ))}
    </div>
  );
}

function PayStat({ label, value, sub, icon, accent }) {
  return (
    <div style={{ background: "var(--surface-elevated)", border: "1px solid var(--hairline-dark)", borderRadius: "var(--r-lg)", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--stone)" }}>
        <Icon name={icon} size={15} color={accent || "var(--primary-bright)"} /> {label}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 30, letterSpacing: "-0.03em", color: "#fff" }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: "var(--stone)" }}>{sub}</div>}
    </div>
  );
}

function PayChip({ tone = "neutral", children }) {
  const tones = {
    neutral: { bg: "rgba(255,255,255,.08)", c: "var(--on-dark-mute)", b: "transparent" },
    green: { bg: "rgba(139,143,247,.16)", c: "var(--primary-bright)", b: "transparent" },
    cobalt: { bg: "rgba(79,85,241,.22)", c: "#fff", b: "transparent" },
    warn: { bg: "transparent", c: "var(--accent-warning)", b: "rgba(255,255,255,.28)" },
  }[tone];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 26, fontFamily: "var(--font-display)", fontSize: 12.5, fontWeight: 600, padding: "0 11px", borderRadius: 99, background: tones.bg, color: tones.c, border: `1px solid ${tones.b}`, whiteSpace: "nowrap" }}>{children}</span>;
}

function PayEmpty({ icon, title, sub, action }) {
  return (
    <div style={{ textAlign: "center", padding: "52px 20px" }}>
      <span style={{ width: 52, height: 52, borderRadius: "var(--r-full)", border: "1px solid var(--hairline-dark)", display: "inline-grid", placeItems: "center" }}><Icon name={icon} size={22} color="var(--stone)" /></span>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "#fff", marginTop: 16 }}>{title}</div>
      <div style={{ fontSize: 14, color: "var(--stone)", marginTop: 6, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>{sub}</div>
      {action && <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>{action}</div>}
    </div>
  );
}

export {  PAY_NAV, PAY_MONTHS, PaySidebar, PayTopbar, PayCard, PayBtn, PayField, PayToggle, PaySeg, PayStat, PayChip, PayEmpty  };
