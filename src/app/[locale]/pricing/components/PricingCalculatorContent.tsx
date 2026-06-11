"use client";

import React, { useState } from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Button, Container, Eyebrow, Icon } from "@/components/a4-landing/Primitives";
import { useLocalizedHref } from "./useLocalizedHref";

const PR_PORTAL = "https://client.a4.com.mt/onboarding";
const prEuro = (n: number) => "€" + Math.round(n).toLocaleString();

const PR_SERVICES = [
  { id: "accounting", label: "Accounting", icon: "book-open-check" },
  { id: "vat", label: "VAT", icon: "receipt-text" },
  { id: "audit", label: "Audit", icon: "clipboard-check" },
] as const;

type ServiceId = (typeof PR_SERVICES)[number]["id"];

function PrChip({
  items,
  value,
  set,
  cols,
}: {
  items: string[];
  value: number;
  set: (v: number) => void;
  cols?: number;
}) {
  return (
    <div
      className="grid gap-2 mt-3"
      style={{ gridTemplateColumns: `repeat(${cols || items.length}, 1fr)` }}
    >
      {items.map((it, i) => {
        const on = value === i;
        return (
          <button
            key={it}
            type="button"
            onClick={() => set(i)}
            className="py-[11px] px-2 rounded-[var(--a4-r-md)] cursor-pointer a4-font-body text-[13.5px] font-semibold transition-colors duration-150"
            style={{
              background: on ? "#fff" : "var(--a4-surface-deep)",
              color: on ? "#000" : "var(--a4-on-dark-mute)",
              border: `1px solid ${on ? "#fff" : "var(--a4-hairline-dark)"}`,
            }}
          >
            {it}
          </button>
        );
      })}
    </div>
  );
}

function PrToggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => set(!on)}
      className="relative shrink-0 cursor-pointer transition-colors duration-200"
      style={{
        width: 46,
        height: 27,
        borderRadius: 999,
        border: `1px solid ${on ? "var(--a4-ink)" : "var(--a4-hairline-strong)"}`,
        background: on ? "var(--a4-ink)" : "var(--a4-hairline-light)",
      }}
    >
      <span
        className="absolute top-[2px] rounded-full bg-white transition-all duration-200 ease-out"
        style={{
          width: 21,
          height: 21,
          left: on ? 21 : 2,
          boxShadow: "0 1px 3px rgba(0,0,0,.2)",
        }}
      />
    </button>
  );
}

function PrRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-[14px] py-[15px]"
      style={{ borderTop: "1px solid var(--a4-hairline-dark)" }}
    >
      <div className="flex-1">
        <div className="a4-font-body text-[14.5px] font-semibold text-white">{label}</div>
        {sub && <div className="a4-font-body text-[12.5px] text-[var(--a4-stone)] mt-[2px]">{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function PricingHero() {
  return (
    <section
      className="relative overflow-hidden bg-black pt-24 sm:pt-28 lg:pt-32"
      style={{ paddingBottom: "clamp(40px,5vw,64px)" }}
    >
      <div aria-hidden="true" className="hero-bg" />
      <Container style={{ position: "relative", textAlign: "center" }}>
        <div className="flex items-center justify-center gap-[14px]">
          <span className="w-[28px] h-[1px] bg-[var(--a4-hairline-strong)]" />
          <span className="a4-font-body text-[12.5px] font-semibold tracking-[.14em] uppercase text-[var(--a4-on-dark-mute)]">
            Transparent pricing · Malta
          </span>
          <span className="w-[28px] h-[1px] bg-[var(--a4-hairline-strong)]" />
        </div>
        <h1
          className="a4-font-display font-medium text-white mx-auto mt-[22px]"
          style={{
            fontSize: "clamp(40px,6vw,80px)",
            lineHeight: 1.02,
            letterSpacing: "-.03em",
            maxWidth: 860,
            textWrap: "balance",
          }}
        >
          A fixed price, <span style={{ color: "var(--a4-primary-bright)" }}>in seconds.</span>
        </h1>
        <p
          className="a4-font-body text-[var(--a4-on-dark-mute)] mx-auto mt-[22px]"
          style={{ fontSize: "clamp(17px,1.8vw,20px)", lineHeight: 1.6, maxWidth: 560, textWrap: "pretty" }}
        >
          Build a price for your everyday accounting, VAT and audit work below. Something more complex? We&apos;ll scope
          it on a quick call.
        </p>
      </Container>
    </section>
  );
}

function PricingInfoBanner() {
  const href = useLocalizedHref();
  return (
    <Container>
      <LocalizedLink
        href="/pricing-info"
        className="flex items-center justify-between gap-4 no-underline mx-auto max-w-[980px] -mt-2 mb-8 px-5 py-4 rounded-[var(--a4-r-lg)] transition-colors duration-150 hover:border-[var(--a4-primary-bright)]"
        style={{
          background: "rgba(73,79,223,.10)",
          border: "1px solid rgba(73,79,223,.35)",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="w-10 h-10 rounded-[var(--a4-r-md)] grid place-items-center shrink-0"
            style={{ background: "rgba(73,79,223,.16)" }}
          >
            <Icon name="info" size={18} color="var(--a4-primary-bright)" />
          </span>
          <div className="min-w-0">
            <div className="a4-font-body text-[14px] font-semibold text-white">How our pricing works</div>
            <div className="a4-font-body text-[13px] text-[var(--a4-on-dark-mute)] mt-0.5">
              No fixed packages — see the six factors, quote process and our commitment to transparent fees.
            </div>
          </div>
        </div>
        <span className="a4-font-body text-[13px] font-semibold text-white whitespace-nowrap shrink-0 hidden sm:inline-flex items-center gap-1.5">
          Read pricing guide <Icon name="arrow-right" size={14} color="#fff" />
        </span>
      </LocalizedLink>
    </Container>
  );
}

function PricingCalc() {
  const [svc, setSvc] = useState<ServiceId>("accounting");
  const [docs, setDocs] = useState(1);
  const [recon, setRecon] = useState(true);
  const [review, setReview] = useState(false);
  const [vatFreq, setVatFreq] = useState(1);
  const [turn, setTurn] = useState(1);

  const VAT_FEE = [15, 35, 60];
  const TURN_MULT = [1, 1.4, 1.9, 2.8];

  let unit = "/ mo";
  let price = 0;
  let complex = false;
  let lines: [string, number][] = [];

  if (svc === "accounting") {
    const base = docs === 0 ? 25 : 50;
    const r = recon ? 15 : 0;
    const rv = review ? 40 : 0;
    price = base + r + rv;
    lines = [
      ["Bookkeeping — " + (docs === 0 ? "Starter" : "Unlimited"), base],
      ...(recon ? ([["Bank reconciliation", r]] as [string, number][]) : []),
      ...(review ? ([["Accountant review", rv]] as [string, number][]) : []),
    ];
  } else if (svc === "vat") {
    price = VAT_FEE[vatFreq];
    lines = [["VAT returns · " + ["annual", "quarterly", "monthly"][vatFreq], price]];
  } else {
    price = Math.round((600 * TURN_MULT[turn]) / 50) * 50;
    unit = "/ yr";
    lines = [["Statutory audit", price]];
    if (turn >= 3) complex = true;
  }

  return (
    <section id="calc" style={{ background: "#000", padding: "clamp(40px,5vw,64px) 0 clamp(64px,9vw,104px)" }}>
      <PricingInfoBanner />
      <Container>
        <div className="flex justify-center mb-9">
          <div
            className="inline-flex gap-1 flex-wrap justify-center rounded-[var(--a4-r-full)] p-[5px]"
            style={{ background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)" }}
          >
            {PR_SERVICES.map((s) => {
              const on = svc === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSvc(s.id)}
                  className="inline-flex items-center gap-[9px] py-[11px] px-5 rounded-[var(--a4-r-full)] border-0 cursor-pointer a4-font-body text-[15px] font-semibold transition-colors duration-150"
                  style={{
                    background: on ? "#fff" : "transparent",
                    color: on ? "#000" : "var(--a4-on-dark-mute)",
                  }}
                >
                  <Icon name={s.icon} size={17} color={on ? "#000" : "var(--a4-on-dark-mute)"} /> {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="pr-grid grid items-start gap-5 max-w-[980px] mx-auto"
          style={{ gridTemplateColumns: "1.25fr 1fr" }}
        >
          <div
            className="rounded-[var(--a4-r-lg)]"
            style={{
              background: "var(--a4-surface-elevated)",
              border: "1px solid var(--a4-hairline-dark)",
              padding: "clamp(24px,3vw,34px)",
            }}
          >
            {svc === "accounting" && (
              <div>
                <div className="a4-font-body text-[14px] font-semibold text-white">Monthly document volume</div>
                <PrChip items={["Up to 100 / mo", "Unlimited"]} value={docs} set={setDocs} />
                <div className="mt-2">
                  <PrRow label="Bank reconciliation" sub="We match & reconcile every account">
                    <PrToggle on={recon} set={setRecon} />
                  </PrRow>
                  <PrRow label="Accountant review" sub="A qualified accountant reviews postings & passes journals">
                    <PrToggle on={review} set={setReview} />
                  </PrRow>
                </div>
              </div>
            )}
            {svc === "vat" && (
              <div>
                <div className="a4-font-body text-[14px] font-semibold text-white">VAT filing frequency</div>
                <PrChip items={["Annual", "Quarterly", "Monthly"]} value={vatFreq} set={setVatFreq} />
                <p className="a4-font-body text-[13.5px] leading-[1.55] text-[var(--a4-on-dark-mute)] mt-[18px]">
                  Preparation and filing of your VAT return with the CFR each period, reviewed before submission.
                </p>
              </div>
            )}
            {svc === "audit" && (
              <div>
                <div className="a4-font-body text-[14px] font-semibold text-white">Annual turnover</div>
                <PrChip items={["< €100k", "€100k–500k", "€500k–1M", "€1M+"]} value={turn} set={setTurn} cols={2} />
                <p className="a4-font-body text-[13.5px] leading-[1.55] text-[var(--a4-on-dark-mute)] mt-[18px]">
                  A standard statutory audit of your financial statements, signed by a licensed audit firm. Groups and
                  regulated entities are scoped on a call.
                </p>
              </div>
            )}
          </div>

          <div
            className="a4-sum rounded-[var(--a4-r-lg)]"
            style={{
              background: complex ? "var(--a4-surface-elevated)" : "#fff",
              padding: "clamp(24px,3vw,30px)",
              position: "sticky",
              top: 88,
              border: complex ? "1px solid var(--a4-hairline-dark)" : "none",
            }}
          >
            {complex ? (
              <div className="text-center py-2">
                <span
                  className="w-[50px] h-[50px] rounded-full grid place-items-center mx-auto"
                  style={{ background: "rgba(73,79,223,.16)" }}
                >
                  <Icon name="calendar" size={24} color="var(--a4-primary-bright)" />
                </span>
                <div className="a4-font-display font-medium text-[22px] text-white mt-4">Let&apos;s scope it together</div>
                <p className="a4-font-body text-[14px] leading-[1.55] text-[var(--a4-on-dark-mute)] mt-[10px]">
                  At this size your audit fee depends on complexity. Book a short call for a fixed quote.
                </p>
                <Button variant="primary" size="md" href="#complex" style={{ width: "100%", marginTop: 20 }}>
                  Book a call <Icon name="arrow-right" size={16} color="#000" />
                </Button>
              </div>
            ) : (
              <div>
                <div className="a4-font-body text-[11px] uppercase tracking-[.12em] text-[var(--a4-mute)]">
                  Your fixed price
                </div>
                <div className="flex items-baseline gap-2 mt-[10px]">
                  {unit === "/ yr" && (
                    <span className="a4-font-body text-[17px] text-[var(--a4-mute)]">from</span>
                  )}
                  <span
                    className="a4-font-display font-medium text-[52px] text-[var(--a4-ink)] leading-none"
                    style={{ letterSpacing: "-2px" }}
                  >
                    {prEuro(price)}
                  </span>
                  <span className="a4-font-body text-[14px] text-[var(--a4-mute)]">{unit}</span>
                </div>
                <div className="h-px bg-[var(--a4-hairline-light)] my-5" />
                <div className="flex flex-col gap-[9px]">
                  {lines.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3">
                      <span className="a4-font-body text-[13.5px] text-[var(--a4-mute)]">{k}</span>
                      <span className="a4-font-body text-[13.5px] font-semibold text-[var(--a4-ink)]">
                        {prEuro(v)}
                        {unit === "/ yr" ? "/yr" : "/mo"}
                      </span>
                    </div>
                  ))}
                </div>
                <Button variant="dark" size="md" href={PR_PORTAL} target="_blank" style={{ width: "100%", marginTop: 22 }}>
                  Create account &amp; request <Icon name="arrow-right" size={16} color="#fff" />
                </Button>
                <div className="flex items-center justify-center gap-[7px] mt-3">
                  <Icon name="shield-check" size={13} color="var(--a4-stone)" />
                  <span className="a4-font-body text-[11.5px] text-[var(--a4-mute)]">
                    Fixed fee · service begins upon KYC approval
                  </span>
                </div>
                <LocalizedLink
                  href="/pricing-info"
                  className="block text-center mt-4 a4-font-body text-[13px] font-semibold no-underline"
                  style={{ color: "var(--a4-link)" }}
                >
                  How is this price calculated? →
                </LocalizedLink>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

function PricingComplex() {
  const href = useLocalizedHref();
  const items = [
    { icon: "layers", t: "Groups & consolidations", s: "Multiple entities, intercompany and consolidated accounts." },
    { icon: "shield-check", t: "Regulated entities", s: "iGaming, financial services and other regulated audits." },
    { icon: "globe", t: "Cross-border & advisory", s: "International structures, restructuring and special projects." },
  ];

  return (
    <section id="complex" className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <div className="pr-complex grid items-center gap-11" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <Eyebrow>Complex work</Eyebrow>
            <h2
              className="a4-font-display font-medium text-[var(--a4-ink)] mt-4"
              style={{
                fontSize: "clamp(30px,4vw,52px)",
                lineHeight: 1.04,
                letterSpacing: "-.025em",
                textWrap: "balance",
              }}
            >
              Bigger or unusual? Let&apos;s talk.
            </h2>
            <p
              className="a4-font-body text-[var(--a4-mute)] mt-4 max-w-[440px]"
              style={{ fontSize: 17, lineHeight: 1.6, textWrap: "pretty" }}
            >
              Some engagements need a human to scope properly. Book a free 15-minute call and we&apos;ll give you a clear,
              fixed quote — no surprises.
            </p>
            <Button variant="dark" size="lg" href={href("/contact")} style={{ marginTop: 28 }}>
              Book a consultation <Icon name="arrow-right" size={18} color="#fff" />
            </Button>
            <div className="mt-5">
              <LocalizedLink
                href="/pricing-info"
                className="a4-font-body text-[14px] font-semibold no-underline inline-flex items-center gap-1.5"
                style={{ color: "var(--a4-link)" }}
              >
                Read our full pricing guide <Icon name="arrow-right" size={14} color="var(--a4-link)" />
              </LocalizedLink>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {items.map((it) => (
              <div
                key={it.t}
                className="flex items-center gap-4 bg-[var(--a4-surface-card)] border border-[var(--a4-hairline-light)] rounded-[var(--a4-r-lg)] py-5 px-[22px]"
              >
                <span className="w-[46px] h-[46px] rounded-[var(--a4-r-md)] bg-[var(--a4-surface-soft)] grid place-items-center shrink-0">
                  <Icon name={it.icon} size={22} color="var(--a4-primary)" stroke={1.75} />
                </span>
                <div>
                  <h3 className="a4-font-display font-medium text-[19px] text-[var(--a4-ink)] m-0" style={{ letterSpacing: "-.2px" }}>
                    {it.t}
                  </h3>
                  <p className="a4-font-body text-[14px] leading-[1.5] text-[var(--a4-mute)] mt-1" style={{ textWrap: "pretty" }}>
                    {it.s}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export function PricingCalculatorContent() {
  return (
    <div className="a4-pricing-page">
      <PricingHero />
      <PricingCalc />
      <PricingComplex />
    </div>
  );
}
