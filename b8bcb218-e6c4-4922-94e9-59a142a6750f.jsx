// LandingPlan.jsx — conversion pricing picker for the bookkeeping landing page.
// Pick a bookkeeping tier + add-ons → live monthly price → two exits:
// (1) Create account & request services, (2) Book a 15-min call.

const LP_PORTAL = "https://client.a4.com.mt/onboarding";

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
