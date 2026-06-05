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
