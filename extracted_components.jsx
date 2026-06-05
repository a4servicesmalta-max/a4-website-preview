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


// HeroFX.jsx — "Reconciliation" animated canvas, adapted as the hero background.
// True-black base, neutral blue-grey data points, accent sweep driven by the
// site's --primary token (passed as `accent`). One phase var, seamless 14s loop.

function HeroFX({ accent = "#494fdf" }) {
  const canvasRef = useRef(null);

  const hexToRgb = (h) => {
    h = h.replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
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
    const pts = [];
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

    const lerp = (a, b, k) => a + (b - a) * k;
    const ease = (k) => k * k * (3 - 2 * k);
    const bump = (phase, c, w) => { let d = Math.abs(phase - c); d = Math.min(d, 1 - d); return d > w ? 0 : ease(1 - d / w); };

    const parent = canvas.parentElement;
    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = parent.clientWidth; H = parent.clientHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    resize();

    function draw(phase) {
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

      const colX = (c) => lerp(0.40, 0.78, c / (COLS - 1));
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

    function frame(now) {
      const phase = ((now - t0) % LOOP_MS) / LOOP_MS;
      draw(phase);
      raf = requestAnimationFrame(frame);
    }

    if (reduce) { draw(0.30); }
    else { raf = requestAnimationFrame(frame); }

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [accent]);

  return (
    <canvas ref={canvasRef} aria-hidden="true" style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      display: "block", pointerEvents: "none",
    }} />
  );
}

Object.assign(window, { HeroFX });


// PortalMockup.jsx — looping motion graphic of the A4 onboarding flow:
// 1) Create account  →  2) Request services  →  3) Receive quote.
// Restrained, product-real motion: staggered entrances + a count-up. No gimmicks.

const PM_STEPS = ["Create account", "Request services", "Get your quote"];
const PM_DURATION = 3800;

function pmRise(i, reduce) {
  return reduce ? {} : { animation: "a4rise .55s cubic-bezier(.2,.7,.2,1) both", animationDelay: `${0.06 + i * 0.08}s` };
}

// ---- Step 1: create account ----
function PMScreenAccount({ reduce }) {
  const fields = [
    { label: "Full name", value: "James Caruana" },
    { label: "Work email", value: "james@nexustrading.mt" },
  ];
  return (
    <div style={{ padding: "26px 26px 24px" }}>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--on-dark-mute)", ...pmRise(0, reduce) }}>Welcome to A4</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 23, color: "#fff", letterSpacing: "-.3px", marginTop: 4, ...pmRise(1, reduce) }}>Create your account</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 22 }}>
        {fields.map((f, i) => (
          <div key={f.label} style={pmRise(2 + i, reduce)}>
            <div style={{ fontFamily: "var(--font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--stone)", marginBottom: 6 }}>{f.label}</div>
            <div style={{ display: "flex", alignItems: "center", height: 44, padding: "0 14px", borderRadius: "var(--r-md)", background: "var(--surface-deep)", border: "1px solid var(--hairline-dark)", fontFamily: "var(--font-body)", fontSize: 14, color: "#fff" }}>
              {f.value}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, ...pmRise(4, reduce) }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 46, borderRadius: "var(--r-full)", background: "#fff", color: "#000", fontFamily: "var(--font-body)", fontSize: 14.5, fontWeight: 600 }}>
          Create account <Icon name="arrow-right" size={16} color="#000" />
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 14, fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--stone)", ...pmRise(5, reduce) }}>No card required · ready in 2 minutes</div>
    </div>
  );
}

// ---- Step 2: request services ----
function PMScreenRequest({ reduce }) {
  const services = [
    { icon: "book-open", name: "Monthly bookkeeping", on: true },
    { icon: "scale", name: "Bank reconciliations", on: true },
    { icon: "receipt", name: "VAT returns", on: true },
    { icon: "users", name: "Payroll", on: false },
  ];
  return (
    <div style={{ padding: "26px 26px 24px" }}>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--on-dark-mute)", ...pmRise(0, reduce) }}>Tell us what you need</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 23, color: "#fff", letterSpacing: "-.3px", marginTop: 4, ...pmRise(1, reduce) }}>Request your services</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 22 }}>
        {services.map((s, i) => (
          <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 13, height: 52, padding: "0 15px", borderRadius: "var(--r-md)", background: s.on ? "rgba(73,79,223,.10)" : "var(--surface-deep)", border: `1px solid ${s.on ? "rgba(73,79,223,.4)" : "var(--hairline-dark)"}`, ...pmRise(2 + i, reduce) }}>
            <Icon name={s.icon} size={18} color={s.on ? "var(--primary-bright)" : "var(--stone)"} />
            <span style={{ flex: 1, fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500, color: s.on ? "#fff" : "var(--on-dark-mute)" }}>{s.name}</span>
            <span style={{ width: 22, height: 22, borderRadius: 999, display: "grid", placeItems: "center", background: s.on ? "var(--primary)" : "transparent", border: s.on ? "none" : "1.5px solid #3a3d40" }}>
              {s.on && <Icon name="check" size={13} color="#fff" stroke={3} />}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Step 3: receive quote ----
function PMScreenQuote({ reduce }) {
  const target = 185;
  const [val, setVal] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce) return;
    let raf, start;
    const dur = 1100;
    const tick = (t) => {
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
    <div style={{ padding: "26px 26px 24px" }}>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--on-dark-mute)", ...pmRise(0, reduce) }}>Based on your request</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 23, color: "#fff", letterSpacing: "-.3px", marginTop: 4, ...pmRise(1, reduce) }}>Your quote is ready</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 18, ...pmRise(2, reduce) }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 46, color: "#fff", letterSpacing: "-1.5px", fontVariantNumeric: "tabular-nums" }}>€{val}</span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--on-dark-mute)" }}>/ month · fixed</span>
      </div>
      <div style={{ marginTop: 16, borderRadius: "var(--r-md)", border: "1px solid var(--hairline-dark)", overflow: "hidden", ...pmRise(3, reduce) }}>
        {lines.map(([k, v], i) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 14px", borderTop: i ? "1px solid var(--divider-soft)" : "none" }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--on-dark-mute)" }}>{k}</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, fontWeight: 500, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, ...pmRise(4, reduce) }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 46, borderRadius: "var(--r-full)", background: "var(--primary)", color: "#fff", fontFamily: "var(--font-body)", fontSize: 14.5, fontWeight: 600 }}>
          Accept &amp; get started <Icon name="arrow-right" size={16} color="#fff" />
        </div>
      </div>
    </div>
  );
}

function PortalMockup() {
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Start the flow once mounted. Try to defer until on-screen, but never
    // depend on IO firing — fall back to starting shortly after mount.
    let done = false;
    const begin = () => { if (!done) { done = true; setStarted(true); } };
    const el = document.getElementById("a4-portal-mock");
    let io;
    if (el && "IntersectionObserver" in window) {
      io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) begin(); }), { threshold: 0.15 });
      io.observe(el);
    }
    const fallback = setTimeout(begin, 1200);
    return () => { if (io) io.disconnect(); clearTimeout(fallback); };
  }, []);

  useEffect(() => {
    if (!started || reduce) return;
    const id = setInterval(() => setStep((s) => (s + 1) % 3), PM_DURATION);
    return () => clearInterval(id);
  }, [started, reduce]);

  const shown = reduce ? 2 : step;
  const Screen = [PMScreenAccount, PMScreenRequest, PMScreenQuote][shown];

  return (
    <div id="a4-portal-mock" style={{ position: "relative", width: "100%", maxWidth: 480 }}>
      <div style={{ position: "absolute", inset: "-10% -6% -16%", background: "radial-gradient(58% 52% at 52% 34%, rgba(73,79,223,.18), transparent 72%)", filter: "blur(22px)", pointerEvents: "none" }} />
      <div style={{ position: "relative", background: "var(--surface-elevated)", border: "1px solid var(--hairline-dark)", borderRadius: "var(--r-xl)", overflow: "hidden", boxShadow: "0 30px 80px -30px rgba(0,0,0,.9)" }}>
        {/* window chrome */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 16px", borderBottom: "1px solid var(--divider-soft)" }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: "#3a3d40" }} />
          <span style={{ width: 10, height: 10, borderRadius: 999, background: "#3a3d40" }} />
          <span style={{ width: 10, height: 10, borderRadius: 999, background: "#3a3d40" }} />
          <div style={{ flex: 1, textAlign: "center", fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--stone)", letterSpacing: ".4px" }}>client.a4.com.mt</div>
        </div>

        {/* step indicator */}
        <div style={{ display: "flex", gap: 8, padding: "16px 22px 4px" }}>
          {PM_STEPS.map((label, i) => (
            <div key={label} style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <span style={{ width: 18, height: 18, borderRadius: 999, display: "grid", placeItems: "center", flexShrink: 0, fontFamily: "var(--font-body)", fontSize: 10.5, fontWeight: 700, background: i <= shown ? "var(--primary)" : "var(--surface-deep)", color: i <= shown ? "#fff" : "var(--stone)", border: i <= shown ? "none" : "1px solid var(--hairline-dark)", transition: "background .3s ease" }}>{i + 1}</span>
                <span className="pm-steplabel" style={{ fontFamily: "var(--font-body)", fontSize: 11.5, fontWeight: i === shown ? 600 : 500, color: i === shown ? "#fff" : "var(--stone)", whiteSpace: "nowrap", transition: "color .3s ease" }}>{label}</span>
              </div>
              <div style={{ height: 3, borderRadius: 999, background: "var(--surface-deep)", overflow: "hidden" }}>
                <div key={`${i}-${shown}-${started}`} style={{
                  height: "100%", borderRadius: 999, background: "var(--primary)",
                  width: i < shown ? "100%" : i === shown ? (reduce ? "100%" : "0%") : "0%",
                  animation: i === shown && started && !reduce ? `a4grow ${PM_DURATION}ms linear forwards` : "none",
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* screen */}
        <div style={{ minHeight: 372 }}>
          <div key={shown}>
            <Screen reduce={reduce} />
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PortalMockup });


// LandingPlan.jsx — conversion pricing picker for the bookkeeping landing page.
// Pick a bookkeeping tier + add-ons → live monthly price → two exits:
// (1) Create account & request services, (2) Book a 15-min call.

const LP_PORTAL = "https://client.a4.com.mt";

const LP_TIERS = [
  { id: "starter", name: "Starter", price: 25, docs: "Up to 100 documents / month", blurb: "Perfect for sole traders and small companies." },
  { id: "unlimited", name: "Unlimited", price: 50, docs: "Unlimited documents", blurb: "Best value for active, growing businesses.", popular: true },
];

function LPStepper({ value, set, min = 1, max = 10 }) {
  const btn = { width: 34, height: 34, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", cursor: "pointer", background: "var(--surface-soft)", border: "1px solid var(--hairline-light)", color: "var(--ink)" };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button aria-label="decrease" onClick={() => set(Math.max(min, value - 1))} style={btn}><Icon name="minus" size={15} color="var(--ink)" /></button>
      <span style={{ minWidth: 20, textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 18, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      <button aria-label="increase" onClick={() => set(Math.min(max, value + 1))} style={btn}><Icon name="plus" size={15} color="var(--ink)" /></button>
    </div>
  );
}

function LPToggle({ on, set }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => set(!on)} style={{
      width: 46, height: 27, borderRadius: 999, border: "1px solid " + (on ? "var(--primary)" : "var(--hairline-strong)"),
      background: on ? "var(--primary)" : "var(--surface-card)", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background .2s, border-color .2s",
    }}>
      <span style={{ position: "absolute", top: 2, left: on ? 21 : 2, width: 21, height: 21, borderRadius: 999, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "left .2s ease" }} />
    </button>
  );
}

const lpEuro = (n) => "€" + n.toLocaleString();

function LandingPlan() {
  const [tier, setTier] = useState("unlimited");
  const [recon, setRecon] = useState(true);
  const [banks, setBanks] = useState(1);
  const [vat, setVat] = useState(true);
  const [payroll, setPayroll] = useState(false);
  const [emps, setEmps] = useState(2);
  const [annual, setAnnual] = useState(false);

  const [modal, setModal] = useState(false);
  const [booked, setBooked] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const base = LP_TIERS.find((t) => t.id === tier).price;
  const reconFee = recon ? banks * 15 : 0;
  const vatFee = vat ? 35 : 0;
  const payFee = payroll ? 15 + emps * 5 : 0;
  const annualFee = annual ? 40 : 0;
  const total = base + reconFee + vatFee + payFee + annualFee;

  const lines = [
    { k: `Bookkeeping — ${LP_TIERS.find((t) => t.id === tier).name}`, v: base },
    recon && { k: `Bank reconciliation · ${banks} acct${banks > 1 ? "s" : ""}`, v: reconFee },
    vat && { k: "VAT returns", v: vatFee },
    payroll && { k: `Payroll · ${emps} employee${emps > 1 ? "s" : ""}`, v: payFee },
    annual && { k: "Annual accounts & tax", v: annualFee },
  ].filter(Boolean);

  const submit = () => { if (!form.name || !form.email) return; setBooked("A4-" + Date.now().toString(36).toUpperCase().slice(-6)); };

  const addons = [
    { label: "Bank reconciliation", sub: "We match & reconcile every account", on: recon, set: setRecon, fee: "€15 / account", stepper: true },
    { label: "VAT returns", sub: "All four quarters filed with the CFR", on: vat, set: setVat, fee: "€35 / mo" },
    { label: "Payroll", sub: "FS5 submissions & payslips", on: payroll, set: setPayroll, fee: "from €25 / mo", emps: true },
    { label: "Annual accounts & tax", sub: "Year-end statements & return", on: annual, set: setAnnual, fee: "€40 / mo" },
  ];

  const fieldLabel = { fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, color: "var(--ink)" };
  const fieldSub = { fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--mute)", marginTop: 2 };

  return (
    <section id="pricing" style={{ background: "var(--surface-soft)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead
          align="center"
          eyebrow="Build your price"
          title="Bookkeeping from €25/month"
          sub="Choose your plan, add what you need, and see your fixed monthly price instantly. No long contracts — cancel anytime."
          maxWidth={620}
        /></Reveal>

        <Reveal delay={80} style={{ marginTop: 52 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20, alignItems: "start", maxWidth: 1000, margin: "0 auto" }} className="lp-grid">
            {/* picker */}
            <div style={{ background: "var(--surface-card)", border: "1px solid var(--hairline-light)", borderRadius: "var(--r-lg)", padding: "clamp(24px,3vw,34px)", display: "flex", flexDirection: "column", gap: 26 }}>
              {/* tier */}
              <div>
                <div style={fieldLabel}>1 · Choose your bookkeeping plan</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }} className="lp-tiers">
                  {LP_TIERS.map((t) => {
                    const on = tier === t.id;
                    return (
                      <button key={t.id} onClick={() => setTier(t.id)} style={{
                        textAlign: "left", cursor: "pointer", position: "relative",
                        background: on ? "var(--surface-soft)" : "transparent",
                        border: "1.5px solid " + (on ? "var(--primary)" : "var(--hairline-light)"),
                        borderRadius: "var(--r-md)", padding: "18px 18px 20px", transition: "border-color .15s, background .15s",
                      }}>
                        {t.popular && <span style={{ position: "absolute", top: 14, right: 14, fontFamily: "var(--font-body)", fontSize: 10, fontWeight: 700, letterSpacing: ".04em", color: "#fff", background: "var(--primary)", borderRadius: "var(--r-full)", padding: "3px 9px" }}>POPULAR</span>}
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 19, color: "var(--ink)" }}>{t.name}</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 6 }}>
                          <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 30, color: "var(--ink)", letterSpacing: "-1px" }}>{lpEuro(t.price)}</span>
                          <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--mute)" }}>/mo</span>
                        </div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: on ? "var(--primary)" : "var(--charcoal)", marginTop: 8 }}>{t.docs}</div>
                        <div style={{ fontFamily: "var(--font-body)", fontSize: 12.5, lineHeight: 1.45, color: "var(--mute)", marginTop: 4 }}>{t.blurb}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* add-ons */}
              <div>
                <div style={fieldLabel}>2 · Add what you need</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
                  {addons.map((a) => (
                    <div key={a.label} style={{ borderRadius: "var(--r-md)", border: "1px solid var(--hairline-light)", padding: "15px 16px", background: a.on ? "var(--surface-soft)" : "transparent", transition: "background .15s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ ...fieldLabel, fontWeight: 600, fontSize: 14.5 }}>{a.label} <span style={{ color: "var(--mute)", fontWeight: 500 }}>· {a.fee}</span></div>
                          <div style={fieldSub}>{a.sub}</div>
                        </div>
                        <LPToggle on={a.on} set={a.set} />
                      </div>
                      {a.stepper && recon && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 13, paddingTop: 13, borderTop: "1px solid var(--hairline-light)" }}>
                          <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--charcoal)" }}>Bank accounts</span>
                          <LPStepper value={banks} set={setBanks} min={1} max={10} />
                        </div>
                      )}
                      {a.emps && payroll && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 13, paddingTop: 13, borderTop: "1px solid var(--hairline-light)" }}>
                          <span style={{ fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--charcoal)" }}>Employees</span>
                          <LPStepper value={emps} set={setEmps} min={1} max={50} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* summary */}
            <div style={{ background: "#000", borderRadius: "var(--r-lg)", padding: "clamp(24px,3vw,32px)", position: "sticky", top: 88, color: "#fff" }}>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "var(--on-dark-mute)" }}>Your monthly price</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12 }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 54, letterSpacing: "-2px", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{lpEuro(total)}</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--on-dark-mute)" }}>/ mo</span>
              </div>
              <div style={{ height: 1, background: "var(--hairline-dark)", margin: "22px 0 16px" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {lines.map((l) => (
                  <div key={l.k} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--on-dark-mute)" }}>{l.k}</span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{lpEuro(l.v)}/mo</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
                <Button variant="primary" size="md" href={LP_PORTAL} target="_blank" style={{ width: "100%" }}>Create account &amp; request <Icon name="arrow-right" size={16} color="#000" /></Button>
                <Button variant="outline-dark" size="md" onClick={() => { setBooked(null); setModal(true); }} style={{ width: "100%" }}><Icon name="calendar" size={16} color="#fff" /> Book a 15-min call</Button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 14 }}>
                <Icon name="shield-check" size={13} color="var(--stone)" />
                <span style={{ fontFamily: "var(--font-body)", fontSize: 11.5, color: "var(--stone)" }}>Fixed price · reviewed by MIA-licensed accountants</span>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>

      {/* booking modal */}
      {modal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setModal(false); }} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "var(--surface-card)", border: "1px solid var(--hairline-light)", borderRadius: "var(--r-lg)", width: "100%", maxWidth: 440, padding: 30, boxShadow: "0 32px 80px rgba(0,0,0,.25)" }}>
            {booked ? (
              <div style={{ textAlign: "center", padding: "10px 0" }}>
                <div style={{ width: 54, height: 54, borderRadius: 999, background: "rgba(0,168,126,.12)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Icon name="check" size={26} color="var(--accent-teal)" stroke={2.5} /></div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 22, color: "var(--ink)" }}>You're booked in</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--mute)", margin: "10px 0 0" }}>Thanks, {form.name.split(" ")[0]}. We'll confirm your 15-minute call by email at <strong style={{ color: "var(--ink)" }}>{form.email}</strong> within 2 business hours.</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--stone)", marginTop: 14 }}>Reference: {booked} · estimated {lpEuro(total)}/mo</div>
                <Button variant="outline-light" size="md" onClick={() => setModal(false)} style={{ width: "100%", marginTop: 22 }}>Close</Button>
              </div>
            ) : (
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 22, color: "var(--ink)" }}>Book your free 15-min call</div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13.5, color: "var(--mute)", margin: "6px 0 22px" }}>We'll confirm your {lpEuro(total)}/mo plan and get you set up. No obligation.</div>
                {[["name", "Your name", "text"], ["email", "Email address", "email"], ["phone", "Phone (optional)", "tel"]].map(([k, label, type]) => (
                  <div key={k} style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontFamily: "var(--font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--mute)", marginBottom: 6 }}>{label}</label>
                    <input type={type} value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} style={{ width: "100%", background: "var(--surface-soft)", border: "1px solid var(--hairline-light)", borderRadius: "var(--r-md)", padding: "11px 14px", color: "var(--ink)", fontFamily: "var(--font-body)", fontSize: 14, outline: "none" }} />
                  </div>
                ))}
                <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                  <Button variant="dark" size="md" onClick={submit} style={{ flex: 1 }}>Confirm call <Icon name="arrow-right" size={16} color="#fff" /></Button>
                  <Button variant="outline-light" size="md" onClick={() => setModal(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

Object.assign(window, { LandingPlan });


// LandingParts.jsx — slim nav, hero, how-it-works, integrations, why, CTA, footer
// for the automated-bookkeeping conversion landing page. Reuses Primitives,
// HeroFX and PortalMockup from the main app.

const LB_PORTAL = "https://client.a4.com.mt";

function LandingNav() {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 60, background: "#000", borderBottom: "1px solid var(--hairline-dark)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", height: 64, display: "flex", alignItems: "center", gap: 16, padding: "0 24px" }}>
        <a href="A4 Services.html" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
          <Logo height={22} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 18, color: "#fff", letterSpacing: "-.2px" }}>A4 Services</span>
        </a>
        <div style={{ flex: 1 }} />
        <a href="#pricing" className="a4-navlinks" style={{ fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 500, color: "var(--on-dark-mute)", textDecoration: "none" }}>Pricing</a>
        <Button variant="primary" size="sm" href={LB_PORTAL} target="_blank" style={{ height: 44, padding: "0 20px" }}>Get started <Icon name="arrow-right" size={16} color="#000" /></Button>
      </div>
    </header>
  );
}

function LandingHero({ accent = "#494fdf" }) {
  return (
    <section style={{ background: "#000", padding: "clamp(48px,7vw,92px) 0 clamp(56px,8vw,104px)", position: "relative", overflow: "hidden" }}>
      <HeroFX accent={accent} />
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(90deg, rgba(0,0,0,.74) 0%, rgba(0,0,0,.34) 38%, transparent 62%), linear-gradient(180deg, transparent 58%, rgba(0,0,0,.6) 100%)" }} />
      <Container style={{ position: "relative", display: "flex", gap: 60, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 440px", minWidth: 300 }}>
          <Badge dark>Automated bookkeeping · Malta</Badge>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, color: "#fff", fontSize: "clamp(44px,6vw,80px)", lineHeight: 1.0, letterSpacing: "-.03em", margin: "20px 0 0", textWrap: "balance" }}>
            Bookkeeping<br />from <span style={{ color: "var(--primary-bright)" }}>€25</span>/month.
          </h1>
          <p style={{ fontFamily: "var(--font-body)", color: "var(--on-dark-mute)", fontSize: 19, lineHeight: 1.6, maxWidth: 480, margin: "24px 0 0", textWrap: "pretty" }}>
            Upload your invoices and receipts to your A4 portal. It syncs with Sage, QuickBooks and Xero, automation does the heavy lifting, and our MIA-licensed accountants review everything. Clean books — without the price tag.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
            <Button variant="primary" size="lg" href="#pricing">See your price <Icon name="arrow-right" size={18} color="#000" /></Button>
            <Button variant="outline-dark" size="lg" href={LB_PORTAL} target="_blank">Create your account</Button>
          </div>
          <div style={{ display: "flex", gap: 22, marginTop: 32, flexWrap: "wrap" }}>
            {["No setup fee", "No long contracts", "Cancel anytime"].map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="check" size={16} color="var(--accent-teal)" stroke={2.4} />
                <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--on-dark)" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: "1 1 380px", display: "flex", justifyContent: "center", minWidth: 300 }}>
          <PortalMockup />
        </div>
      </Container>
    </section>
  );
}

function Integrations() {
  const tools = ["Sage", "QuickBooks", "Xero", "Revolut", "Stripe"];
  return (
    <section style={{ background: "#000", padding: "0 0 clamp(48px,7vw,72px)" }}>
      <Container>
        <div style={{ borderTop: "1px solid var(--hairline-dark)", paddingTop: "clamp(32px,4vw,48px)", display: "flex", alignItems: "center", justifyContent: "center", gap: "16px 40px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--stone)" }}>Connects with</span>
          {tools.map((t) => (
            <span key={t} style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 22, color: "var(--on-dark-mute)", letterSpacing: "-.3px" }}>{t}</span>
          ))}
        </div>
      </Container>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: "upload-cloud", t: "Upload or connect", s: "Drop invoices and receipts into your secure portal — or connect your bank and accounting software directly." },
    { icon: "cpu", t: "Automation does the work", s: "Documents are read, categorised and synced to Sage, QuickBooks or Xero — no manual data entry." },
    { icon: "badge-check", t: "Reviewed & finalised", s: "Our MIA-licensed accountants reconcile and finalise your books, and you get clean monthly reports." },
  ];
  return (
    <section style={{ background: "var(--canvas-light)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead align="center" eyebrow="How it works" title="Three steps to clean books" sub="Designed to take minutes of your time each month — the automation and our team handle the rest." maxWidth={560} /></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 52 }}>
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 90} style={{ background: "var(--surface-card)", border: "1px solid var(--hairline-light)", borderRadius: "var(--r-lg)", padding: "clamp(26px,3vw,34px)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ width: 46, height: 46, borderRadius: "var(--r-md)", background: "var(--surface-soft)", display: "grid", placeItems: "center" }}><Icon name={s.icon} size={22} color="var(--primary)" stroke={1.75} /></span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 15, color: "var(--faint)" }}>0{i + 1}</span>
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 21, color: "var(--ink)", margin: "22px 0 0", letterSpacing: "-.2px" }}>{s.t}</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 15, lineHeight: 1.55, color: "var(--mute)", margin: "9px 0 0", textWrap: "pretty" }}>{s.s}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Why() {
  const items = [
    { icon: "piggy-bank", t: "Low, fixed pricing", s: "From €25/month. Automation keeps our costs down, so we keep yours down." },
    { icon: "layout-dashboard", t: "Everything in one portal", s: "Documents, reports and communication in a single secure workspace." },
    { icon: "refresh-cw", t: "Synced with your tools", s: "Works with Sage, QuickBooks and Xero — no double entry." },
    { icon: "shield-check", t: "Reviewed by professionals", s: "MIA-licensed accountants check and finalise every set of books." },
  ];
  return (
    <section style={{ background: "#000", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead dark align="center" eyebrow="Why A4" title="Affordable, because it's automated" sub="The price of a subscription, the rigour of a professional firm." maxWidth={560} /></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 52 }}>
          {items.map((it, i) => (
            <Reveal key={it.t} delay={i * 80} style={{ background: "var(--surface-elevated)", border: "1px solid var(--hairline-dark)", borderRadius: "var(--r-lg)", padding: "28px 26px" }}>
              <Icon name={it.icon} size={24} color="var(--primary-bright)" stroke={1.75} />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 19, color: "#fff", margin: "20px 0 0", letterSpacing: "-.2px" }}>{it.t}</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 14.5, lineHeight: 1.5, color: "var(--on-dark-mute)", margin: "9px 0 0", textWrap: "pretty" }}>{it.s}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FinalCTA() {
  return (
    <section style={{ background: "var(--surface-soft)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <div style={{ background: "#000", borderRadius: "var(--r-xl)", padding: "clamp(40px,6vw,72px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div aria-hidden="true" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "90%", height: 360, background: "radial-gradient(50% 50% at 50% 50%, rgba(73,79,223,.22), transparent 72%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, color: "#fff", fontSize: "clamp(32px,4.6vw,58px)", lineHeight: 1.04, letterSpacing: "-.025em", margin: 0, textWrap: "balance", maxWidth: 700, marginInline: "auto" }}>
              Ready for clean books from €25/month?
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 18, lineHeight: 1.6, color: "var(--on-dark-mute)", margin: "20px auto 0", maxWidth: 540, textWrap: "pretty" }}>
              Create your account and request services in minutes — or book a quick call and we'll set everything up with you.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 34, flexWrap: "wrap", justifyContent: "center" }}>
              <Button variant="primary" size="lg" href={LB_PORTAL} target="_blank">Create your account <Icon name="arrow-right" size={18} color="#000" /></Button>
              <Button variant="outline-dark" size="lg" href="#pricing">See your price</Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function LandingFooter() {
  return (
    <footer style={{ background: "#000", borderTop: "1px solid var(--hairline-dark)", padding: "40px 0" }}>
      <Container style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
        <a href="A4 Services.html" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Logo height={20} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 16, color: "#fff" }}>A4 Services</span>
        </a>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--stone)" }}>© {new Date().getFullYear()} A4 Services Limited · Malta · info@a4.com.mt</span>
        <a href="A4 Services.html" style={{ fontFamily: "var(--font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--on-dark-mute)", textDecoration: "none" }}>Back to main site →</a>
      </Container>
    </footer>
  );
}

function LandingApp() {
  return (
    <div>
      <LandingNav />
      <main>
        <LandingHero />
        <Integrations />
        <HowItWorks />
        <LandingPlan />
        <Why />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}

Object.assign(window, { LandingApp });


