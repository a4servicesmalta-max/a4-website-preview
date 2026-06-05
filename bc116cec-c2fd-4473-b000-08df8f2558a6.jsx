// Primitives.jsx — shared building blocks for the A4 Services site
const { useState, useEffect, useRef } = React;

// ---- Logo --------------------------------------------------------------
function Logo({ height = 26, invert = false }) {
  const src = (typeof window !== "undefined" && window.__resources && window.__resources.a4logo) || "assets/a4-logo-webp";
  return (
    <img
      src={src}
      alt="A4 Services"
      style={{ height, display: "block", filter: invert ? "invert(1)" : "none" }}
    />
  );
}

// ---- Buttons -----------------------------------------------------------
// variant: primary (white on dark) | dark (black on light) | soft |
//          outline-light | outline-dark | cobalt
function Button({ variant = "primary", size = "md", children, onClick, style, href, target, rel }) {
  const base = {
    border: "0", cursor: "pointer", borderRadius: "var(--r-full)",
    fontFamily: "var(--font-body)", fontWeight: 600, letterSpacing: ".24px",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: "8px", transition: "background .18s ease, color .18s ease, border-color .18s ease, transform .18s ease",
    whiteSpace: "nowrap", textDecoration: "none",
  };
  const sizes = {
    lg: { height: 56, padding: "0 32px", fontSize: 18 },
    md: { height: 48, padding: "0 26px", fontSize: 16 },
    sm: { height: 40, padding: "0 18px", fontSize: 14.5 },
  };
  const variants = {
    primary: { background: "#fff", color: "#000" },
    dark: { background: "#000", color: "#fff" },
    soft: { background: "var(--surface-soft)", color: "var(--ink)" },
    "outline-light": { background: "transparent", color: "var(--ink)", border: "1px solid var(--hairline-strong)" },
    "outline-dark": { background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,.4)" },
    cobalt: { background: "var(--primary)", color: "#fff" },
  };
  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href} onClick={onClick} target={target} rel={rel || (target === "_blank" ? "noopener noreferrer" : undefined)}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseDown={(e) => (e.currentTarget.style.opacity = ".82")}
      onMouseUp={(e) => (e.currentTarget.style.opacity = "1")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {children}
    </Tag>
  );
}

// ---- Pill (sub-nav chip) ----------------------------------------------
function Pill({ active, children, onClick, dark = true }) {
  return (
    <button onClick={onClick} style={{
      height: 38, padding: "0 18px", borderRadius: "var(--r-full)",
      border: 0, cursor: "pointer", fontFamily: "var(--font-body)",
      fontWeight: 600, fontSize: 14,
      background: active ? (dark ? "#fff" : "#000") : (dark ? "var(--surface-elevated)" : "var(--surface-soft)"),
      color: active ? (dark ? "#000" : "#fff") : (dark ? "#fff" : "var(--ink)"),
      transition: "background .18s ease, color .18s ease",
    }}>{children}</button>
  );
}

// ---- Badge / Eyebrow ---------------------------------------------------
function Badge({ feature, children, dark = false }) {
  return (
    <span style={{
      borderRadius: "var(--r-full)", fontSize: 12, lineHeight: 1.4,
      padding: "5px 13px", fontFamily: "var(--font-body)", fontWeight: 600,
      letterSpacing: ".24px",
      background: feature ? "var(--primary)" : (dark ? "rgba(255,255,255,.08)" : "var(--surface-soft)"),
      color: feature ? "#fff" : (dark ? "var(--on-dark-mute)" : "var(--ink)"),
      display: "inline-flex", alignItems: "center", gap: 7,
    }}>{children}</span>
  );
}

// Small uppercase eyebrow label
function Eyebrow({ children, dark = false, color }) {
  return (
    <div style={{
      fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13,
      letterSpacing: ".18em", textTransform: "uppercase",
      color: color || (dark ? "var(--on-dark-mute)" : "var(--mute)"),
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span style={{ width: 18, height: 1, background: "currentColor", opacity: .5 }} />
      {children}
    </div>
  );
}

// ---- Icon (Lucide via CDN) --------------------------------------------
function Icon({ name, size = 24, color = "currentColor", stroke = 1.75, style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.lucide && ref.current) {
      ref.current.innerHTML = "";
      const el = document.createElement("i");
      el.setAttribute("data-lucide", name);
      ref.current.appendChild(el);
      window.lucide.createIcons({
        attrs: { width: size, height: size, stroke: color, "stroke-width": stroke },
        nameAttr: "data-lucide",
      });
    }
  }, [name, size, color, stroke]);
  return <span ref={ref} style={{ display: "inline-flex", color, ...style }} />;
}

// ---- Layout ------------------------------------------------------------
function Container({ children, style }) {
  return <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", ...style }}>{children}</div>;
}

// Section heading block — display headline + optional sub
function SectionHead({ eyebrow, title, sub, dark = false, align = "left", maxWidth = 760 }) {
  return (
    <div style={{ textAlign: align, maxWidth: align === "center" ? maxWidth : "none", margin: align === "center" ? "0 auto" : 0 }}>
      {eyebrow && <div style={{ marginBottom: 18, display: "flex", justifyContent: align === "center" ? "center" : "flex-start" }}><Eyebrow dark={dark}>{eyebrow}</Eyebrow></div>}
      <h2 style={{
        fontFamily: "var(--font-display)", fontWeight: 500,
        fontSize: "clamp(34px, 4.4vw, 56px)", lineHeight: 1.05,
        letterSpacing: "-0.02em", margin: 0,
        color: dark ? "var(--on-dark)" : "var(--ink)",
        textWrap: "balance",
      }}>{title}</h2>
      {sub && <p style={{
        fontFamily: "var(--font-body)", fontSize: 19, lineHeight: 1.55,
        letterSpacing: "-.1px", margin: "22px 0 0",
        maxWidth, color: dark ? "var(--on-dark-mute)" : "var(--mute)",
        marginLeft: align === "center" ? "auto" : 0, marginRight: align === "center" ? "auto" : 0,
        textWrap: "pretty",
      }}>{sub}</p>}
    </div>
  );
}

// Scroll reveal wrapper (restrained: short fade + rise)
function Reveal({ children, delay = 0, style, as = "div" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setShown(true); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } });
    }, { threshold: 0.14 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Tag = as;
  return (
    <Tag ref={ref} data-areveal="" style={{
      ...style,
      opacity: shown ? 1 : 0,
      transform: shown ? "none" : "translateY(18px)",
      transition: `opacity .6s ease ${delay}ms, transform .6s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
    }}>{children}</Tag>
  );
}

Object.assign(window, { Logo, Button, Pill, Badge, Eyebrow, Icon, Container, SectionHead, Reveal });
