"use client";

import React from "react";
import { Button, Icon } from "@/components/a4-landing/Primitives";
import { PortalMockup } from "@/components/a4-landing/PortalMockup";
import { LandingPlan } from "@/components/a4-landing/LandingPlan";
import { HealthCheckPromo } from "@/components/a4-landing/HealthCheckPromo";
import { DARK_CARD, GRAD } from "@/components/fx/primitives";
import {
  BODY, CardGrid, CtaBand, G, Head, INDIGO, INK, InfoCard, KitStyles, PERI, PaidHero, Section, SkewMark, Timeline, ctaPill, kicker, pad2,
} from "@/app/[locale]/accounting-services/components/PaidLandingKit";
// for the automated-bookkeeping conversion landing page. Reuses Primitives
// and PortalMockup from the main app, set in the A4 design language
// (docs/DESIGN-LANGUAGE.md).

import { BOOKKEEPING_COMPANY, BOOKKEEPING_FROM } from "@/data/a4QuotePack";
import { OldWayFilm } from "@/components/film/chapters";

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

export function LandingHero() {
  return (
    <PaidHero
      eyebrow="Malta accounting & audit firm"
      first="Bookkeeping"
      accent={<>from €{BOOKKEEPING_FROM}/month.</>}
      lead={
        <>
          <strong style={{ color: "#fff", fontWeight: 600 }}>A4 Services is a licensed accounting &amp; audit firm in Malta.</strong> Upload your invoices and receipts to your A4 portal — it syncs with Sage, QuickBooks and Xero, automation does the heavy lifting, and our licensed audit firm reviews everything. Clean books — without the price tag.
        </>
      }
      chips={["No setup fee", "No long contracts", "Cancel anytime"]}
      actions={
        <>
          <Button variant="primary" size="lg" href="#pricing">See your price <Icon name="arrow-right" size={18} color="#09090B" /></Button>
          <Button variant="outline-dark" size="lg" href="/contact">Request information</Button>
        </>
      }
      after={
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ ...kicker, color: "#A1A1AA" }}>Syncs with</span>
            {/* Third-party marks, set in monochrome so the hero stays on the A4 palette. */}
            {[["/assets/logo-xero.png", "Xero"], ["/assets/logo-quickbooks.png", "QuickBooks"], ["/assets/logo-sage.png", "Sage"]].map(([src, alt]) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={alt} src={src} alt={alt} style={{ height: 26, width: "auto", display: "block", filter: "grayscale(1) brightness(1.15)", opacity: 0.85 }} />
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px 10px", flexWrap: "wrap" }}>
            <span style={{ ...kicker, color: "#A1A1AA", marginRight: 4 }}>Full-service firm:</span>
            {["Accounting", "Audit", "Tax", "VAT", "Payroll", "Bookkeeping"].map((s) => (
              <span key={s} className="a4-chip a4-chip-dark" style={{ height: 32, padding: "0 13px", fontSize: 14 }}>{s}</span>
            ))}
          </div>
        </>
      }
      aside={<PortalMockup />}
    />
  );
}

export function Integrations() {
  const tools = ["Sage", "QuickBooks", "Xero", "Revolut", "Stripe"];
  return (
    <Section surface="dark" tight glow={{ left: "20%", top: "-60%", strength: 0.18 }}>
      <div data-fx="rise" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px 32px", flexWrap: "wrap" }}>
        <span style={{ ...kicker, color: "#A1A1AA" }}>Connects with</span>
        {tools.map((t, i) => (
          <React.Fragment key={t}>
            {i > 0 ? (
              <span className="pk-sep" aria-hidden="true" style={{ display: "inline-flex" }}>
                <SkewMark color={PERI} size={8} />
              </span>
            ) : null}
            <span style={{ fontWeight: 500, fontSize: "clamp(22px,2.2vw,30px)", letterSpacing: "-0.03em", color: "#E4E4E7" }}>{t}</span>
          </React.Fragment>
        ))}
      </div>
    </Section>
  );
}

export function HowItWorks() {
  const steps = [
    { title: "Upload or connect", body: "Drop invoices and receipts into your secure portal — or connect your bank and accounting software directly." },
    { title: "Automation does the work", body: "Documents are read, categorised and synced to Sage, QuickBooks or Xero — no manual data entry." },
    { title: "Reviewed & finalised", body: "Our qualified accountants reconcile and finalise your books, and you get clean monthly reports." },
  ];
  return (
    <Section surface="light">
      <Head
        n="01"
        eyebrow="How it works"
        title={<>Three steps to <G>clean books</G></>}
        sub="Designed to take minutes of your time each month — the automation and our team handle the rest."
      />
      <div style={{ marginTop: "clamp(56px,7vw,96px)" }}>
        <Timeline steps={steps} min={260} />
      </div>
    </Section>
  );
}

export function Why() {
  const items = [
    { icon: "piggy-bank", t: "Low, transparent pricing", s: `From €${BOOKKEEPING_FROM}/month if you are self-employed, from €${BOOKKEEPING_COMPANY}/month for a company, including one bank account, set by your monthly expenses — we keep the books, with a qualified accountant on the file. There is no software-only plan; busy transaction volumes add on top, and every bank account is priced (€40 a month plus 15% of the bookkeeping fee, each), itemised in your quote. All fees exclude VAT.` },
    { icon: "layout-dashboard", t: "Everything in one portal", s: "Documents, reports and communication in a single secure workspace." },
    { icon: "refresh-cw", t: "Synced with your tools", s: "Works with Sage, QuickBooks and Xero — no double entry." },
    { icon: "shield-check", t: "Reviewed by professionals", s: "A licensed audit firm checks and finalises every set of books." },
  ];
  const [lead, ...rest] = items;
  return (
    <Section surface="light">
      <Head n="03" eyebrow="Why A4" title={<>Affordable, because it&apos;s <G>automated</G></>} sub="The price of a subscription, the rigour of a professional firm." />
      {/* The pricing card carries the most text, so it runs the full width. */}
      <div
        data-fx="rise"
        className="a4-dark-card a4-card-dark"
        style={{ marginTop: "clamp(48px,6vw,80px)", borderRadius: 24, padding: "clamp(28px,3.6vw,44px)", background: DARK_CARD, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "24px 56px", alignItems: "end", transition: "border-color .35s, box-shadow .35s" }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: PERI }}>{pad2(1)}</span>
            <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: "rgba(139,143,247,.14)" }}>
              <Icon name={lead.icon} size={20} color={PERI} stroke={1.75} />
            </span>
          </div>
          <h3 style={{ margin: "clamp(28px,4vw,56px) 0 0", fontSize: "clamp(30px,3vw,44px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.08, color: "#FFFFFF" }}>{lead.t}</h3>
        </div>
        <p style={{ margin: 0, fontFamily: BODY, fontSize: 16.5, lineHeight: 1.65, color: "#D4D4D8", textWrap: "pretty" }}>{lead.s}</p>
      </div>
      <CardGrid min={300} style={{ marginTop: 16 }}>
        {rest.map((it, i) => (
          <InfoCard key={it.t} i={i + 1} dark={i % 2 === 1} icon={it.icon} title={it.t} body={it.s} minHeight={260} />
        ))}
      </CardGrid>
    </Section>
  );
}

export function ReviewedByTeam() {
  const pillars = [
    { icon: "cpu", t: "Automation does the heavy lifting", s: "Your invoices and receipts are read, the data extracted, transactions categorised and synced to Sage, QuickBooks or Xero — instantly, with no manual entry." },
    { icon: "users", t: "Our accountants review every posting", s: "A qualified A4 accountant checks the categorisation, fixes anomalies, reconciles your accounts and signs off — so your numbers are right, not just fast." },
  ];
  return (
    <Section surface="dark" sweep glow={{ left: "-10%", top: "-20%", strength: 0.24 }}>
      <Head
        dark
        n="02"
        eyebrow="Automation + experts"
        title={<>Automation, checked by<br className="a4-br" /> <G>real accountants</G></>}
        sub="You're never trusting software on its own. Every transaction our automation processes is reviewed and reconciled by a qualified accountant before your books are finalised."
      />
      <div className="rbt-grid" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 18, alignItems: "stretch", marginTop: "clamp(48px,6vw,80px)" }}>
        {[{ ...pillars[0], label: "The software" }, { ...pillars[1], label: "The team" }].map((p, i) => (
          <React.Fragment key={p.t}>
            {i === 1 && (
              <div className="rbt-plus" style={{ display: "grid", placeItems: "center" }}>
                <span aria-hidden="true" style={{ width: 56, height: 56, borderRadius: 999, background: INK, border: "1px solid rgba(255,255,255,.18)", display: "grid", placeItems: "center", color: "#fff", fontSize: 28, fontWeight: 500, lineHeight: 1 }}>+</span>
              </div>
            )}
            <div
              data-fx="rise"
              data-d={i * 120}
              style={{ position: "relative", overflow: "hidden", background: "rgba(24,24,27,.92)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 28, padding: "clamp(28px,3.4vw,40px)", boxShadow: "0 40px 100px rgba(0,0,0,.45)" }}
            >
              <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: GRAD }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span style={{ ...kicker, color: "#A1A1AA" }}>{p.label}</span>
                <span aria-hidden="true" style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(139,143,247,.14)", display: "grid", placeItems: "center" }}>
                  <Icon name={p.icon} size={24} color={PERI} stroke={1.75} />
                </span>
              </div>
              <h3 style={{ margin: "28px 0 0", fontSize: "clamp(24px,2.2vw,30px)", fontWeight: 600, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.15, textWrap: "balance" }}>{p.t}</h3>
              <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: "#A1A1AA", margin: "12px 0 0", textWrap: "pretty" }}>{p.s}</p>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div
        data-fx="rise"
        data-d="200"
        className="rbt-equals"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap", marginTop: 18, background: "rgba(79,85,241,.12)", border: "1px solid rgba(139,143,247,.3)", borderRadius: 24, padding: "20px 26px" }}
      >
        <span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: 999, background: INDIGO, display: "grid", placeItems: "center", color: "#fff", fontSize: 19, fontWeight: 600, flexShrink: 0 }}>=</span>
        <span style={{ fontFamily: BODY, fontSize: 16.5, fontWeight: 500, lineHeight: 1.5, color: "#fff", textWrap: "pretty" }}>
          Books that are right, not just fast — speed from automation, accuracy from a licensed team, at a subscription price.
        </span>
      </div>
    </Section>
  );
}

export function FinalCTA() {
  return (
    <CtaBand
      first="Ready for clean books"
      accent={<>from €{BOOKKEEPING_FROM}/month?</>}
      lead={<>Create your account and request services in minutes — or book a quick call and we&apos;ll set everything up with you.</>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Button variant="primary" size="lg" href="/contact" style={ctaPill}>Request information <Icon name="arrow-right" size={18} color="#09090B" /></Button>
        <Button variant="outline-dark" size="lg" href="#pricing" style={ctaPill}>See your price</Button>
      </div>
    </CtaBand>
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
        <KitStyles />
        <LandingHero />
        <OldWayFilm />
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
