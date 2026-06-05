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
