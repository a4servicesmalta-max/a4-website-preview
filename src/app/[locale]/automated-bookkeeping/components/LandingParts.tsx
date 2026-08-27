"use client";

import React from "react";
import { Button, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
import { PortalMockup } from "@/components/a4-landing/PortalMockup";
import { LandingPlan } from "@/components/a4-landing/LandingPlan";
import { HealthCheckPromo } from "@/components/a4-landing/HealthCheckPromo";
// for the automated-bookkeeping conversion landing page. Reuses Primitives
// and PortalMockup from the main app.

import { CLIENT_ONBOARDING_URL } from "@/lib/external-links";
import { BOOKKEEPING_COMPANY, BOOKKEEPING_FROM } from "@/data/a4QuotePack";

// export function LandingNav() {
//   const [open, setOpen] = useState(false);
//   const links = [{ label: "Audit", href: "/audit-services" }, { label: "Pricing", href: "#pricing" }];
//   return (
//     <header style={{ position: "sticky", top: 0, zIndex: 60, background: "#000", borderBottom: "1px solid var(--a4-hairline-dark)" }}>
//       <div style={{ maxWidth: 1200, margin: "0 auto", height: 64, display: "flex", alignItems: "center", gap: 16, padding: "0 24px" }}>
//         <a href="/a4-services" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
//           <Logo height={24} />
//           <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
//             <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 18, color: "#fff", letterSpacing: "-.2px" }}>A4 Services</span>
//             <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 10.5, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--a4-on-dark-mute)" }}>Accounting &amp; Audit · Malta</span>
//           </span>
//         </a>
//         <div style={{ flex: 1 }} />
//         {links.map((l) => (
//           <a key={l.label} href={l.href} className="a4-navlinks" style={{ fontFamily: "var(--a4-font-body)", fontSize: 15, fontWeight: 500, color: "var(--a4-on-dark-mute)", textDecoration: "none" }}>{l.label}</a>
//         ))}
//         <Button variant="primary" size="sm" href={CLIENT_ONBOARDING_URL} target="_blank" style={{ height: 44, padding: "0 20px" }}>Get started <Icon name="arrow-right" size={16} color="#000" /></Button>
//         <button className="a4-burger" onClick={() => setOpen(!open)} aria-label="Menu" style={{ display: "none", background: "none", border: 0, cursor: "pointer", color: "#fff", padding: 6 }}>
//           <Icon name={open ? "x" : "menu"} size={24} color="#fff" />
//         </button>
//       </div>
//       {open && (
//         <div className="a4-mobilemenu" style={{ borderTop: "1px solid var(--a4-hairline-dark)", padding: "12px 24px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
//           {links.map((l) => (
//             <a key={l.label} href={l.href} onClick={() => setOpen(false)} style={{ fontFamily: "var(--a4-font-body)", fontSize: 16, fontWeight: 500, color: "var(--a4-on-dark-mute)", textDecoration: "none", padding: "10px 0" }}>{l.label}</a>
//           ))}
//           <a href={CLIENT_ONBOARDING_URL} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} style={{ fontFamily: "var(--a4-font-body)", fontSize: 16, fontWeight: 600, color: "#fff", textDecoration: "none", padding: "10px 0" }}>Create account →</a>
//         </div>
//       )}
//     </header>
//   );
// }

export function LandingHero({ accent = "#494fdf" }) {
  return (
    <section style={{ background: "#000", padding: "clamp(48px,7vw,92px) 0 clamp(56px,8vw,104px)", position: "relative", overflow: "hidden" }}>
      <div aria-hidden="true" className="hero-bg" />
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(90deg, rgba(0,0,0,.74) 0%, rgba(0,0,0,.34) 38%, transparent 62%), linear-gradient(180deg, transparent 58%, rgba(0,0,0,.6) 100%)" }} />
      <Container style={{ position: "relative", display: "flex", gap: 60, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 440px", minWidth: 300 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 26, height: 1, background: "var(--a4-hairline-strong)" }} />
            <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--a4-on-dark-mute)" }}>Malta accounting &amp; audit firm</span>
          </div>
          <h1 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "#fff", fontSize: "clamp(44px,6vw,80px)", lineHeight: 1.0, letterSpacing: "-.03em", margin: "20px 0 0", textWrap: "balance" }}>
            Bookkeeping<br />from <span style={{ color: "var(--a4-primary-bright)" }}>€{BOOKKEEPING_FROM}</span>/month.
          </h1>
          <p style={{ fontFamily: "var(--a4-font-body)", color: "var(--a4-on-dark-mute)", fontSize: 19, lineHeight: 1.6, maxWidth: 480, margin: "24px 0 0", textWrap: "pretty" }}>
            <strong style={{ color: "#fff", fontWeight: 600 }}>A4 Services is a licensed accounting &amp; audit firm in Malta.</strong> Upload your invoices and receipts to your A4 portal — it syncs with Sage, QuickBooks and Xero, automation does the heavy lifting, and our licensed audit firm reviews everything. Clean books — without the price tag.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
            <Button variant="primary" size="lg" href="#pricing">See your price <Icon name="arrow-right" size={18} color="#000" /></Button>
            <Button variant="outline-dark" size="lg" href="/contact">Request information</Button>
          </div>
          <div style={{ display: "flex", gap: 22, marginTop: 32, flexWrap: "wrap" }}>
            {["No setup fee", "No long contracts", "Cancel anytime"].map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="check" size={16} color="var(--a4-accent-teal)" stroke={2.4} />
                <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, color: "var(--a4-on-dark)" }}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 26, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--a4-stone)" }}>Syncs with</span>
            {[["/assets/logo-xero.png", "Xero"], ["/assets/logo-quickbooks.png", "QuickBooks"], ["/assets/logo-sage.png", "Sage"]].map(([src, alt]) => (
              <img key={alt} src={src} alt={alt} style={{ height: 26, width: "auto", display: "block" }} />
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px 14px", marginTop: 24, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--a4-stone)" }}>Full-service firm:</span>
            {["Accounting", "Audit", "Tax", "VAT", "Payroll", "Bookkeeping"].map((s) => (
              <span key={s} style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 500, color: "var(--a4-on-dark)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-full)", padding: "5px 13px" }}>{s}</span>
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

export function Integrations() {
  const tools = ["Sage", "QuickBooks", "Xero", "Revolut", "Stripe"];
  return (
    <section style={{ background: "#000", padding: "0 0 clamp(48px,7vw,72px)" }}>
      <Container>
        <div style={{ borderTop: "1px solid var(--a4-hairline-dark)", paddingTop: "clamp(32px,4vw,48px)", display: "flex", alignItems: "center", justifyContent: "center", gap: "16px 40px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--a4-stone)" }}>Connects with</span>
          {tools.map((t) => (
            <span key={t} style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "var(--a4-on-dark-mute)", letterSpacing: "-.3px" }}>{t}</span>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { icon: "upload-cloud", t: "Upload or connect", s: "Drop invoices and receipts into your secure portal — or connect your bank and accounting software directly." },
    { icon: "cpu", t: "Automation does the work", s: "Documents are read, categorised and synced to Sage, QuickBooks or Xero — no manual data entry." },
    { icon: "badge-check", t: "Reviewed & finalised", s: "Our qualified accountants reconcile and finalise your books, and you get clean monthly reports." },
  ];
  return (
    <section style={{ background: "var(--a4-canvas-light)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead align="center" eyebrow="How it works" title="Three steps to clean books" sub="Designed to take minutes of your time each month — the automation and our team handle the rest." maxWidth={560} /></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 52 }}>
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 90} style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", padding: "clamp(26px,3vw,34px)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ width: 46, height: 46, borderRadius: "var(--a4-r-md)", background: "var(--a4-surface-soft)", display: "grid", placeItems: "center" }}><Icon name={s.icon} size={22} color="var(--a4-primary)" stroke={1.75} /></span>
                <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 15, color: "var(--a4-faint)" }}>0{i + 1}</span>
              </div>
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 21, color: "var(--a4-ink)", margin: "22px 0 0", letterSpacing: "-.2px" }}>{s.t}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 15, lineHeight: 1.55, color: "var(--a4-mute)", margin: "9px 0 0", textWrap: "pretty" }}>{s.s}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function Why() {
  const items = [
    { icon: "piggy-bank", t: "Low, transparent pricing", s: `From €${BOOKKEEPING_FROM}/month if you are self-employed, from €${BOOKKEEPING_COMPANY}/month for a company, including one bank account, set by your monthly expenses — we keep the books, with a qualified accountant on the file. There is no software-only plan; busy transaction volumes add on top, and every bank account is priced (€40 a month plus 15% of the bookkeeping fee, each), itemised in your quote. All fees exclude VAT.` },
    { icon: "layout-dashboard", t: "Everything in one portal", s: "Documents, reports and communication in a single secure workspace." },
    { icon: "refresh-cw", t: "Synced with your tools", s: "Works with Sage, QuickBooks and Xero — no double entry." },
    { icon: "shield-check", t: "Reviewed by professionals", s: "A licensed audit firm checks and finalises every set of books." },
  ];
  return (
    <section style={{ background: "#000", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead dark align="center" eyebrow="Why A4" title="Affordable, because it's automated" sub="The price of a subscription, the rigour of a professional firm." maxWidth={560} /></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 52 }}>
          {items.map((it, i) => (
            <Reveal key={it.t} delay={i * 80} style={{ background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", padding: "28px 26px" }}>
              <Icon name={it.icon} size={24} color="var(--a4-primary-bright)" stroke={1.75} />
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 19, color: "#fff", margin: "20px 0 0", letterSpacing: "-.2px" }}>{it.t}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, lineHeight: 1.5, color: "var(--a4-on-dark-mute)", margin: "9px 0 0", textWrap: "pretty" }}>{it.s}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function ReviewedByTeam() {
  const pillars = [
    { icon: "cpu", t: "Automation does the heavy lifting", s: "Your invoices and receipts are read, the data extracted, transactions categorised and synced to Sage, QuickBooks or Xero — instantly, with no manual entry." },
    { icon: "users", t: "Our accountants review every posting", s: "A qualified A4 accountant checks the categorisation, fixes anomalies, reconciles your accounts and signs off — so your numbers are right, not just fast." },
  ];
  return (
    <section style={{ background: "#000", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead
          dark align="center"
          eyebrow="Automation + experts"
          title={<>Automation, checked by<br className="a4-br" /> real accountants</>}
          sub="You're never trusting software on its own. Every transaction our automation processes is reviewed and reconciled by a qualified accountant before your books are finalised."
          maxWidth={640}
        /></Reveal>
        <div className="rbt-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 18, alignItems: "stretch", marginTop: 52, maxWidth: 960, marginLeft: "auto", marginRight: "auto" }}>
          {[{ ...pillars[0], label: "The software", accent: "var(--a4-primary-bright)", bg: "rgba(73,79,223,.16)" }, { ...pillars[1], label: "The team", accent: "var(--a4-accent-teal)", bg: "rgba(0,168,126,.16)" }].map((p, i) => (
            <React.Fragment key={p.t}>
              {i === 1 && (
                <div className="rbt-plus" style={{ display: "grid", placeItems: "center" }}>
                  <span style={{ width: 50, height: 50, borderRadius: 999, background: "var(--a4-surface-deep)", border: "1px solid var(--a4-hairline-dark)", display: "grid", placeItems: "center", color: "#fff", fontFamily: "var(--a4-font-display)", fontSize: 26, fontWeight: 500, lineHeight: 1 }}>+</span>
                </div>
              )}
              <Reveal delay={i * 90} style={{ position: "relative", background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", padding: "clamp(26px,3vw,36px)", overflow: "hidden" }}>
                <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: p.accent }} />
                <span style={{ width: 54, height: 54, borderRadius: "var(--a4-r-md)", background: p.bg, display: "grid", placeItems: "center" }}><Icon name={p.icon} size={26} color={p.accent} stroke={1.75} /></span>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--a4-stone)", marginTop: 18 }}>{p.label}</div>
                <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "#fff", margin: "8px 0 0", letterSpacing: "-.3px", textWrap: "balance" }}>{p.t}</h3>
                <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 15, lineHeight: 1.55, color: "var(--a4-on-dark-mute)", margin: "12px 0 0", textWrap: "pretty" }}>{p.s}</p>
              </Reveal>
            </React.Fragment>
          ))}
        </div>
        <Reveal delay={140}>
          <div className="rbt-equals" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 13, flexWrap: "wrap", margin: "18px auto 0", maxWidth: 960, background: "rgba(0,168,126,.08)", border: "1px solid rgba(0,168,126,.22)", borderRadius: "var(--a4-r-lg)", padding: "18px 24px" }}>
            <span style={{ width: 32, height: 32, borderRadius: 999, background: "var(--a4-accent-teal)", display: "grid", placeItems: "center", color: "#fff", fontFamily: "var(--a4-font-display)", fontSize: 18, fontWeight: 500, flexShrink: 0 }}>=</span>
            <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 15.5, fontWeight: 500, lineHeight: 1.5, color: "#fff", textWrap: "pretty" }}>
              Books that are right, not just fast — speed from automation, accuracy from a licensed team, at a subscription price.
            </span>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section style={{ background: "var(--a4-surface-soft)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <div style={{ background: "#000", borderRadius: "var(--a4-r-xl)", padding: "clamp(40px,6vw,72px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div aria-hidden="true" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "90%", height: 360, background: "radial-gradient(50% 50% at 50% 50%, rgba(73,79,223,.22), transparent 72%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "#fff", fontSize: "clamp(32px,4.6vw,58px)", lineHeight: 1.04, letterSpacing: "-.025em", margin: 0, textWrap: "balance", maxWidth: 700, marginInline: "auto" }}>
              Ready for clean books from €{BOOKKEEPING_FROM}/month?
            </h2>
            <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 18, lineHeight: 1.6, color: "var(--a4-on-dark-mute)", margin: "20px auto 0", maxWidth: 540, textWrap: "pretty" }}>
              Create your account and request services in minutes — or book a quick call and we&apos;ll set everything up with you.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 34, flexWrap: "wrap", justifyContent: "center" }}>
              <Button variant="primary" size="lg" href="/contact">Request information <Icon name="arrow-right" size={18} color="#000" /></Button>
              <Button variant="outline-dark" size="lg" href="#pricing">See your price</Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// export function LandingFooter() {
//   return (
//     <footer style={{ background: "#000", borderTop: "1px solid var(--a4-hairline-dark)", padding: "40px 0" }}>
//       <Container style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
//         <a href="/a4-services" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
//           <Logo height={20} />
//           <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 16, color: "#fff" }}>A4 Services</span>
//         </a>
//         <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "var(--a4-stone)" }}>© {new Date().getFullYear()} A4 Services Limited · Accounting &amp; audit firm in Malta · info@a4.com.mt</span>
//         <a href="/a4-services" style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--a4-on-dark-mute)", textDecoration: "none" }}>Back to main site →</a>
//       </Container>
//     </footer>
//   );
// }

export function LandingApp() {
  return (
    <div>
      {/* <LandingNav /> */}
      <main id="main-content">
        <LandingHero />
        <HealthCheckPromo />
        <Integrations />
        <HowItWorks />
        <ReviewedByTeam />
        <LandingPlan />
        <Why />
        <FinalCTA />
      </main>
      {/* <LandingFooter /> */}
    </div>
  );
}
