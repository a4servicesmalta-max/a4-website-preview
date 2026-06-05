"use client";

import React from "react";
import { Logo, Button, Badge, Icon, Container, SectionHead, Reveal } from "./Primitives";
import { HeroFX } from "./HeroFX";
import { PortalMockup } from "./PortalMockup";
import { LandingPlan } from "./LandingPlan";

const LB_PORTAL = "https://client.a4.com/onboarding";

export function LandingNav() {
  return (
    <header className="sticky top-0 z-[60] bg-[#000] border-b border-[var(--a4-hairline-dark)]">
      <div className="max-w-[1200px] mx-auto h-[64px] flex items-center gap-[16px] px-[24px]">
        {/* <a href="/" className="flex items-center gap-[11px] no-underline">
          <Logo height={22} />
          <span className="a4-font-display font-medium text-[18px] text-[#fff] tracking-[-.2px]">A4 Services</span>
        </a> */}
        <div className="flex-1" />
        {/* <a href="#pricing" className="a4-navlinks a4-font-body text-[15px] font-medium text-[var(--a4-on-dark-mute)] no-underline hidden sm:block">Pricing</a>
        <Button variant="primary" size="sm" href={LB_PORTAL} target="_blank" style={{ height: 44, padding: "0 20px" }}>
          Get started <Icon name="arrow-right" size={16} color="#000" />
        </Button> */}
      </div>
    </header>
  );
}

export function LandingHero({ accent = "#494fdf" }) {
  return (
    <section className="bg-[#000] py-[clamp(48px,7vw,92px)] pb-[clamp(56px,8vw,104px)] relative overflow-hidden ">
      <HeroFX accent={accent} />
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg, rgba(0,0,0,.74) 0%, rgba(0,0,0,.34) 38%, transparent 62%), linear-gradient(180deg, transparent 58%, rgba(0,0,0,.6) 100%)" }} />
      <Container style={{ position: "relative", display: "flex", gap: 60, alignItems: "center", flexWrap: "wrap" }}>
        <div className="flex-[1_1_440px] min-w-[300px]">
          <Badge dark>Automated bookkeeping · Malta</Badge>
          <h1 className="a4-font-display font-medium text-[#fff] text-[clamp(44px,6vw,80px)] leading-[1.0] tracking-[-.03em] mt-[20px] mb-0" style={{ textWrap: "balance" }}>
            Bookkeeping<br />from <span className="text-[var(--a4-primary-bright)]">€25</span>/month.
          </h1>
          <p className="a4-font-body text-[var(--a4-on-dark-mute)] text-[19px] leading-[1.6] max-w-[480px] mt-[24px] mb-0" style={{ textWrap: "pretty" }}>
            Upload your invoices and receipts to your A4 portal. It syncs with Sage, QuickBooks and Xero, automation does the heavy lifting, and our MIA-licensed accountants review everything. Clean books — without the price tag.
          </p>
          <div className="flex gap-[12px] mt-[32px] flex-wrap">
            <Button variant="primary" size="lg" href="#pricing">See your price <Icon name="arrow-right" size={18} color="#000" /></Button>
            <Button variant="outline-dark" size="lg" href={LB_PORTAL} target="_blank">Create your account</Button>
          </div>
          <div className="flex gap-[22px] mt-[32px] flex-wrap">
            {["No setup fee", "No long contracts", "Cancel anytime"].map((t) => (
              <div key={t} className="flex items-center gap-[8px]">
                <Icon name="check" size={16} color="var(--a4-accent-teal)" stroke={2.4} />
                <span className="a4-font-body text-[14px] text-[var(--a4-on-dark)]">{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-[1_1_380px] flex justify-center min-w-[300px]">
          <PortalMockup />
        </div>
      </Container>
    </section>
  );
}

export function Integrations() {
  const tools = ["Sage", "QuickBooks", "Xero", "Revolut", "Stripe"];
  // Duplicate arrays to create a seamless scrolling effect (we need exactly an even number of duplicates for a -50% translation to loop perfectly)
  const scrollItems = [...tools, ...tools, ...tools, ...tools];

  return (
    <section className="bg-[#000] pb-[clamp(48px,7vw,72px)] overflow-hidden">
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      <Container>
        <div className="border-t border-[var(--a4-hairline-dark)] pt-[clamp(32px,4vw,48px)] flex flex-col items-center gap-[32px]">
          <span className="a4-font-body text-[13px] font-semibold tracking-[.06em] uppercase text-[var(--a4-stone)]">
            Connects with
          </span>
          <div className="relative w-full max-w-[900px] mx-auto flex items-center">
            {/* Fade masks for smooth edges */}
            <div className="absolute left-0 top-0 bottom-0 w-[60px] sm:w-[120px] z-10 bg-gradient-to-r from-[#000] to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-[60px] sm:w-[120px] z-10 bg-gradient-to-l from-[#000] to-transparent pointer-events-none" />

            <div className="overflow-hidden flex w-full">
              <div className="animate-marquee gap-[40px] sm:gap-[80px] px-[20px] sm:px-[40px]">
                {scrollItems.map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    className="a4-font-display font-medium text-[24px] sm:text-[32px] text-[var(--a4-on-dark-mute)] tracking-[-.4px] whitespace-nowrap transition-colors duration-300 hover:text-white cursor-default"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { icon: "upload-cloud", t: "Upload or connect", s: "Drop invoices and receipts into your secure portal — or connect your bank and accounting software directly." },
    { icon: "cpu", t: "Automation does the work", s: "Documents are read, categorised and synced to Sage, QuickBooks or Xero — no manual data entry." },
    { icon: "badge-check", t: "Reviewed & finalised", s: "Our MIA-licensed accountants reconcile and finalise your books, and you get clean monthly reports." },
  ];
  return (
    <section className="bg-[var(--a4-canvas-light)] py-[clamp(64px,9vw,104px)]">
      <Container>
        <Reveal><SectionHead align="center" eyebrow="How it works" title="Three steps to clean books" sub="Designed to take minutes of your time each month — the automation and our team handle the rest." maxWidth={560} /></Reveal>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[20px] mt-[52px]">
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 90} style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", padding: "clamp(26px,3vw,34px)" }}>
              <div className="flex items-center justify-between">
                <span className="w-[46px] h-[46px] rounded-[var(--a4-r-md)] bg-[var(--a4-surface-soft)] grid place-items-center"><Icon name={s.icon} size={22} color="var(--a4-primary)" stroke={1.75} /></span>
                <span className="a4-font-display font-medium text-[15px] text-[var(--a4-faint)]">0{i + 1}</span>
              </div>
              <h3 className="a4-font-display font-medium text-[21px] text-[var(--a4-ink)] mt-[22px] mb-0 tracking-[-.2px]">{s.t}</h3>
              <p className="a4-font-body text-[15px] leading-[1.55] text-[var(--a4-mute)] mt-[9px] mb-0" style={{ textWrap: "pretty" }}>{s.s}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function Why() {
  const items = [
    { icon: "piggy-bank", t: "Low, fixed pricing", s: "From €25/month. Automation keeps our costs down, so we keep yours down." },
    { icon: "layout-dashboard", t: "Everything in one portal", s: "Documents, reports and communication in a single secure workspace." },
    { icon: "refresh-cw", t: "Synced with your tools", s: "Works with Sage, QuickBooks and Xero — no double entry." },
    { icon: "shield-check", t: "Reviewed by professionals", s: "MIA-licensed accountants check and finalise every set of books." },
  ];
  return (
    <section className="bg-[#000] py-[clamp(64px,9vw,104px)]">
      <Container>
        <Reveal><SectionHead dark align="center" eyebrow="Why A4" title="Affordable, because it's automated" sub="The price of a subscription, the rigour of a professional firm." maxWidth={560} /></Reveal>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[20px] mt-[52px]">
          {items.map((it, i) => (
            <Reveal key={it.t} delay={i * 80} style={{ background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", padding: "28px 26px" }}>
              <Icon name={it.icon} size={24} color="var(--a4-primary-bright)" stroke={1.75} />
              <h3 className="a4-font-display font-medium text-[19px] text-[#fff] mt-[20px] mb-0 tracking-[-.2px]">{it.t}</h3>
              <p className="a4-font-body text-[14.5px] leading-[1.5] text-[var(--a4-on-dark-mute)] mt-[9px] mb-0" style={{ textWrap: "pretty" }}>{it.s}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="bg-[var(--a4-surface-soft)] py-[clamp(64px,9vw,104px)]">
      <Container>
        <div className="bg-[#000] rounded-[var(--a4-r-xl)] p-[clamp(40px,6vw,72px)] text-center relative overflow-hidden">
          <div aria-hidden="true" className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] h-[360px] pointer-events-none" style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(73,79,223,.22), transparent 72%)" }} />
          <div className="relative">
            <h2 className="a4-font-display font-medium text-[#fff] text-[clamp(32px,4.6vw,58px)] leading-[1.04] tracking-[-.025em] m-0 mx-auto max-w-[700px]" style={{ textWrap: "balance" }}>
              Ready for clean books from €25/month?
            </h2>
            <p className="a4-font-body text-[18px] leading-[1.6] text-[var(--a4-on-dark-mute)] mt-[20px] mx-auto mb-0 max-w-[540px]" style={{ textWrap: "pretty" }}>
              Create your account and request services in minutes — or book a quick call and we'll set everything up with you.
            </p>
            <div className="flex gap-[12px] mt-[34px] flex-wrap justify-center">
              <Button variant="primary" size="lg" href={LB_PORTAL} target="_blank">Create your account <Icon name="arrow-right" size={18} color="#000" /></Button>
              <Button variant="outline-dark" size="lg" href="#pricing">See your price</Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function SupportStrip() {
  return (
    <div className="bg-[#000] border-t border-[var(--a4-hairline-dark)] py-[40px]">
      <Container style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
        <div className="flex items-center gap-[12px]">
          <Icon name="message-circle" size={24} color="var(--a4-primary-bright)" />
          <span className="a4-font-display font-medium text-[16px] text-[#fff]">Still have questions?</span>
        </div>
        <span className="a4-font-body text-[14px] text-[var(--a4-stone)]">
          Our Malta-based accounting experts are here to help.
        </span>
        <a href="mailto:info@a4.com.mt" className="a4-font-body text-[14px] font-semibold text-[var(--a4-on-dark-mute)] no-underline hover:text-white transition-colors">
          Contact support <Icon name="arrow-right" size={14} color="currentColor" style={{ display: "inline", marginBottom: -2 }} />
        </a>
      </Container>
    </div>
  );
}
