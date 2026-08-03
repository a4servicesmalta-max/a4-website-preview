"use client";

import React, { useState } from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Button, Container, Eyebrow, Icon, Reveal } from "@/components/a4-landing/Primitives";
import { useLocalizedHref } from "./useLocalizedHref";
import { CLIENT_ONBOARDING_URL } from "@/lib/external-links";
import { A4_LADDER, LADDER_FIRST_HUMAN, LADDER_BASE, LADDER_CAVEAT } from "@/data/a4Ladder";
import {
  VAT_MONTHLY,
  VAT_RULES,
  VAT_FROM,
  AUDIT_YEARLY,
  AUDIT_FROM,
  BOOKKEEPING_FROM,
  INCORPORATION,
  INCORPORATION_FROM,
  INCORPORATION_ADDONS,
  INCORPORATION_MGA_NOTE,
  LAUNCH_PROMO,
  isPromoActive,
  PRICING_VAT_NOTE,
  PRICING_GOV_NOTE,
  TXN_BANDS,
  TAX_RETURN_YEARLY,
  MBR_ANNUAL_RETURN,
  CAPITAL_BANDS,
  REGISTERED_OFFICE_YEARLY,
  CATCH_UP,
  payrollRate,
} from "@/data/a4QuotePack";
import {
  submitWebsiteQuotation,
  type QuoteCadence,
  type WebsiteQuoteResult,
} from "@/lib/websiteQuotation";

const prEuro = (n: number) => "€" + Math.round(n).toLocaleString();

const PR_SERVICES = [
  { id: "accounting", label: "Accounting", icon: "book-open-check" },
  { id: "vat", label: "VAT", icon: "receipt-text" },
  { id: "payroll", label: "Payroll", icon: "users" },
  { id: "taxret", label: "Tax return", icon: "file-text" },
  { id: "audit", label: "Audit", icon: "clipboard-check" },
  { id: "annret", label: "Annual return", icon: "landmark" },
  { id: "regoff", label: "Registered office", icon: "map-pin" },
  { id: "catchup", label: "Catch-up", icon: "history" },
  { id: "incorporation", label: "Incorporation", icon: "building-2" },
] as const;

/**
 * Transaction-volume bands, derived from the pack rather than restated, so this
 * page can never again offer a narrower ladder than the engine actually prices.
 * It previously listed only four of the seven, which meant a pre-trading company
 * could not reach the €600 audit entry price and a 400+ ledger could not be
 * quoted here at all.
 */
const PR_VOLUME_BANDS = TXN_BANDS.map((b) => b.id);
const PR_VOLUME_LABELS = TXN_BANDS.map((b) => b.label);
/** Default to "20 to 60" — the commonest small-company band. */
const PR_DEFAULT_BAND = PR_VOLUME_BANDS.indexOf("21-60");
/** Volumes at which a small-company review engagement is off the table. */
const PR_BIG_VOLUME: readonly string[] = ["151-400", "401-1000", "1000+"];
/** Months-behind options for the catch-up quote. */
const PR_CATCHUP_MONTHS = [3, 6, 12, 24];

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

function PrStepper({ value, set, min = 1, max = 10 }: { value: number; set: (v: number) => void; min?: number; max?: number }) {
  const btn =
    "w-[32px] h-[32px] rounded-[var(--a4-r-md)] grid place-items-center cursor-pointer bg-[var(--a4-surface-deep)] border border-[var(--a4-hairline-dark)] text-white";
  return (
    <div className="flex items-center gap-3 shrink-0">
      <button type="button" aria-label="decrease" onClick={() => set(Math.max(min, value - 1))} className={btn}>
        <Icon name="minus" size={14} color="#fff" />
      </button>
      <span className="a4-font-display font-medium text-[17px] text-white text-center min-w-[20px] tabular-nums">{value}</span>
      <button type="button" aria-label="increase" onClick={() => set(Math.min(max, value + 1))} className={btn}>
        <Icon name="plus" size={14} color="#fff" />
      </button>
    </div>
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

// The ladder, straight from src/data/a4Ladder.ts so this page can never drift
// from the A4 Books landing page. Level 1 is software only; every level above
// it includes A4 accountants.
const PR_LADDER_ICONS: Record<string, string> = {
  books: "layers",
  senior: "user-check",
  manager: "users",
  cfo: "briefcase",
};

const PR_STARTING_TIERS = [
  ...A4_LADDER.map((l) => ({
    id: l.id,
    name: l.name,
    icon: PR_LADDER_ICONS[l.id] ?? "layers",
    tag: l.human ? "With accountants" : "Software only",
    price: l.total,
    unit: "/ mo",
    blurb:
      l.id === "books"
        ? `${l.detail} Add accountants from €${LADDER_FIRST_HUMAN.total}/mo.`
        : `${l.tagline} ${l.detail}`,
    popular: l.id === LADDER_FIRST_HUMAN.id,
    stack: l.id === "books" ? null : `+€${l.add}/mo on the level below`,
    ladder: true,
  })),
  {
    id: "vat",
    name: "VAT returns",
    icon: "receipt-text",
    tag: "Compliance",
    price: VAT_FROM,
    unit: "/ mo",
    from: true,
    blurb: `Every return prepared and filed with the CFR — a monthly fee set by your transaction volume, whatever your filing frequency. Art. 11 small-exempt businesses pay one flat €${VAT_RULES.art11FlatYearly}/yr declaration instead.`,
  },
  {
    id: "audit",
    name: "Statutory audit",
    icon: "clipboard-check",
    tag: "Assurance",
    price: AUDIT_FROM,
    unit: "/ yr",
    from: true,
    blurb: "Independent audit for companies that require one. Where a review engagement is enough, it is 55% of the audit fee.",
  },
  {
    id: "incorporation",
    name: "Incorporation",
    icon: "building-2",
    tag: "Company formation",
    price: INCORPORATION_FROM,
    unit: "one-off",
    from: true,
    blurb: "One individual shareholder and one director, filed with the MBR. Extra shareholders, directors and registrations are itemised below.",
  },
  {
    id: "tax",
    name: "Corporate tax",
    icon: "landmark",
    tag: "Advisory",
    price: null,
    unit: "",
    quoted: true,
    blurb: "Quoted after a quick review of your structure and filings.",
  },
] as const;

type StartingTier = (typeof PR_STARTING_TIERS)[number];

function PricingTierCard({ tier }: { tier: StartingTier }) {
  const isPopular = "popular" in tier && tier.popular;
  const isQuoted = "quoted" in tier && tier.quoted;

  return (
    <div
      className="group relative flex flex-col h-full overflow-hidden rounded-[var(--a4-r-lg)] transition-all duration-300 hover:-translate-y-1"
      style={{
        padding: isPopular ? "28px 24px 26px" : "24px 22px",
        background: isPopular
          ? "linear-gradient(160deg, rgba(73,79,223,.22) 0%, rgba(18,18,28,.95) 45%, var(--a4-surface-elevated) 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,.04) 0%, var(--a4-surface-elevated) 100%)",
        border: `1px solid ${isPopular ? "rgba(73,79,223,.55)" : "var(--a4-hairline-dark)"}`,
        boxShadow: isPopular
          ? "0 24px 48px -12px rgba(73,79,223,.35), inset 0 1px 0 rgba(255,255,255,.08)"
          : "inset 0 1px 0 rgba(255,255,255,.04)",
      }}
    >
      {isPopular && (
        <>
          <div
            aria-hidden="true"
            className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none opacity-60"
            style={{ background: "radial-gradient(circle, rgba(73,79,223,.45) 0%, transparent 70%)" }}
          />
          <span
            className="relative self-start mb-3 a4-font-body text-[10px] font-bold uppercase tracking-[.1em] px-2.5 py-1 rounded-full"
            style={{ background: "var(--a4-primary)", color: "#fff", boxShadow: "0 4px 14px rgba(73,79,223,.4)" }}
          >
            Most popular
          </span>
        </>
      )}

      <div className="relative flex items-start justify-between gap-3">
        <span
          className="grid place-items-center shrink-0 transition-transform duration-300 group-hover:scale-105"
          style={{
            width: 46,
            height: 46,
            borderRadius: "var(--a4-r-md)",
            background: isPopular ? "rgba(73,79,223,.25)" : "rgba(255,255,255,.06)",
            border: `1px solid ${isPopular ? "rgba(73,79,223,.4)" : "var(--a4-hairline-dark)"}`,
          }}
        >
          <Icon
            name={tier.icon}
            size={22}
            color={isPopular ? "var(--a4-primary-bright)" : "var(--a4-on-dark-mute)"}
            stroke={1.75}
          />
        </span>
        <span
          className="a4-font-body text-[10.5px] font-bold uppercase tracking-[.1em] rounded-full px-2.5 py-1"
          style={{
            color: "var(--a4-stone)",
            background: "rgba(255,255,255,.05)",
            border: "1px solid var(--a4-hairline-dark)",
          }}
        >
          {tier.tag}
        </span>
      </div>

      <div className="relative mt-5">
        <div
          className="a4-font-body text-[12px] font-semibold uppercase tracking-[.12em]"
          style={{ color: isPopular ? "var(--a4-primary-bright)" : "var(--a4-stone)" }}
        >
          {tier.name}
        </div>

        {isQuoted ? (
          <div className="a4-font-display font-medium text-white mt-3 leading-tight text-[clamp(28px,7vw,34px)] tracking-[-.02em]">
            Quoted
          </div>
        ) : (
          <div className="flex flex-wrap items-baseline gap-1.5 mt-3">
            {"from" in tier && tier.from && (
              <span className="a4-font-body text-[13px] text-[var(--a4-stone)]">from</span>
            )}
            <span className="a4-font-display font-medium text-white leading-none text-[clamp(32px,8vw,44px)] tracking-[-2px] tabular-nums">
              {prEuro(tier.price!)}
            </span>
            <span className="a4-font-body text-[13px] text-[var(--a4-stone)]">{tier.unit}</span>
          </div>
        )}
      </div>

      <div
        className="relative mt-5 pt-5 flex-1"
        style={{ borderTop: `1px solid ${isPopular ? "rgba(73,79,223,.25)" : "var(--a4-hairline-dark)"}` }}
      >
        <p
          className="a4-font-body text-[14px] leading-[1.55] text-[var(--a4-on-dark-mute)] m-0"
          style={{ textWrap: "pretty" }}
        >
          {tier.blurb}
        </p>
      </div>

      <div
        className="absolute inset-0 rounded-[var(--a4-r-lg)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)",
        }}
      />
    </div>
  );
}

function PricingStartingTiers() {
  const href = useLocalizedHref();
  const bookkeeping = PR_STARTING_TIERS.filter((t) => (t as { ladder?: boolean }).ladder);
  const other = PR_STARTING_TIERS.filter((t) => !(t as { ladder?: boolean }).ladder);

  return (
    <section
      className="relative bg-black border-b border-[var(--a4-hairline-dark)] overflow-hidden"
      style={{ padding: "clamp(40px,5vw,64px) 0" }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(73,79,223,.12) 0%, transparent 65%)",
        }}
      />
      <Container style={{ position: "relative" }}>
        <Reveal style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
          <Eyebrow dark>Starting prices</Eyebrow>
          <p
            className="a4-font-body text-[var(--a4-on-dark-mute)] mt-4"
            style={{ fontSize: 16.5, lineHeight: 1.6, textWrap: "pretty" }}
          >
            The same ladder as the A4 Books landing page: start with the software on its own, then add a Senior accountant, a Manager, or the full CFO finance function. VAT, audit, tax and company formation are priced separately below. Prefer us to keep the books for you? Full-service bookkeeping starts at {prEuro(BOOKKEEPING_FROM)}/mo, set by your transaction volume.
          </p>
          {isPromoActive() && (
            <p className="a4-font-body text-[13px] font-semibold text-[var(--a4-primary-bright)] mt-3">
              {LAUNCH_PROMO.note}
            </p>
          )}
          <p className="a4-font-body text-[12.5px] text-[var(--a4-stone)] mt-2">
            {PRICING_VAT_NOTE} {PRICING_GOV_NOTE}
          </p>
        </Reveal>

        {/* Bookkeeping — featured row */}
        <Reveal delay={60}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 mx-auto max-w-[1100px]">
            {bookkeeping.map((tier, i) => (
              <Reveal key={tier.id} delay={i * 70}>
                <PricingTierCard tier={tier} />
              </Reveal>
            ))}
          </div>
        </Reveal>

        {/* Other services */}
        <Reveal delay={100}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 mx-auto max-w-[1100px]">
            {other.map((tier, i) => (
              <Reveal key={tier.id} delay={120 + i * 60}>
                <PricingTierCard tier={tier} />
              </Reveal>
            ))}
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 mt-10 px-1">
            <Button variant="primary" size="md" href={CLIENT_ONBOARDING_URL} target="_blank" style={{ width: "100%", maxWidth: 320 }}>
              Access portal <Icon name="arrow-right" size={16} color="#000" />
            </Button>
            <Button variant="outline-dark" size="md" href={href("/contact")} style={{ width: "100%", maxWidth: 320 }}>
              Get a tailored quote
            </Button>
          </div>
        </Reveal>

        <Reveal delay={180}>
          <PricingInfoBanner />
        </Reveal>
      </Container>
    </section>
  );
}

function PricingInfoBanner() {
  return (
    <LocalizedLink
        href="/pricing-info"
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 no-underline mx-auto max-w-[980px] mt-8 px-4 py-4 sm:px-5 rounded-[var(--a4-r-lg)] transition-colors duration-150 hover:border-[var(--a4-primary-bright)]"
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
              Fixed monthly plans for bookkeeping and VAT — plus how we quote audit and complex work.
            </div>
          </div>
        </div>
        <span className="a4-font-body text-[13px] font-semibold text-white sm:whitespace-nowrap shrink-0 inline-flex items-center gap-1.5">
          Read pricing guide <Icon name="arrow-right" size={14} color="#fff" />
        </span>
      </LocalizedLink>
  );
}

function PricingCalc() {
  const [svc, setSvc] = useState<ServiceId>("accounting");
  const [recon, setRecon] = useState(true);
  const [vatVol, setVatVol] = useState(PR_DEFAULT_BAND);
  const [turn, setTurn] = useState(PR_DEFAULT_BAND);
  const [taxVol, setTaxVol] = useState(PR_DEFAULT_BAND);
  const [heads, setHeads] = useState(3);
  const [capital, setCapital] = useState(0);
  const [catchupMonths, setCatchupMonths] = useState(1);
  const [catchupFull, setCatchupFull] = useState(true);
  const [incShareholders, setIncShareholders] = useState(1);
  const [incDirectors, setIncDirectors] = useState(1);
  const [incRegistrations, setIncRegistrations] = useState(true);
  const [incBank, setIncBank] = useState(false);
  const [incRegOffice, setIncRegOffice] = useState(false);
  const [incSecretary, setIncSecretary] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<WebsiteQuoteResult | null>(null);

  const promo = isPromoActive();

  let unit: "/ mo" | "/ yr" | "one-off" = "/ mo";
  let complex = false;
  /** Undiscounted lines — what the work actually costs before the promo. */
  let lines: { label: string; amount: number; cadence: QuoteCadence }[] = [];
  /** Pass-through government fees, never discounted. */
  let passThrough = 0;
  let selections: Record<string, unknown> = {};

  if (svc === "accounting") {
    const base = LADDER_BASE.total;
    const r = recon ? 15 : 0;
    lines = [
      { label: `${LADDER_BASE.name} — software only`, amount: base, cadence: "monthly" },
      ...(recon ? [{ label: "Bank reconciliation", amount: r, cadence: "monthly" as QuoteCadence }] : []),
    ];
    selections = { kind: "accounting", tier: LADDER_BASE.id, recon };
  } else if (svc === "vat") {
    const band = PR_VOLUME_BANDS[vatVol];
    const notTrading = band === "0";
    lines = [
      {
        label: notTrading
          ? "VAT returns · not trading yet, nothing to file"
          : `VAT returns · ${PR_VOLUME_LABELS[vatVol].toLowerCase()} transactions a month`,
        amount: VAT_MONTHLY[band],
        cadence: "monthly",
      },
    ];
    selections = { kind: "vat", txn: band, vatreg: "art10" };
  } else if (svc === "payroll") {
    const rate = payrollRate(heads);
    lines = [{ label: `Payroll · ${heads} ${heads === 1 ? "employee" : "employees"} at €${rate} each`, amount: heads * rate, cadence: "monthly" }];
    selections = { kind: "payroll", heads };
  } else if (svc === "taxret") {
    const band = PR_VOLUME_BANDS[taxVol];
    unit = "/ yr";
    lines = [{ label: "Annual tax return — from the closed ledger, with schedules", amount: TAX_RETURN_YEARLY[band], cadence: "yearly" }];
    selections = { kind: "taxret", txn: band, taxret: "we" };
  } else if (svc === "audit") {
    const band = PR_VOLUME_BANDS[turn];
    unit = "/ yr";
    lines = [{ label: "Statutory audit", amount: AUDIT_YEARLY[band], cadence: "yearly" }];
    selections = { kind: "audit", txn: band, assure: "we" };
    if (PR_BIG_VOLUME.includes(band)) complex = true;
  } else if (svc === "annret") {
    const cap = CAPITAL_BANDS[capital];
    const registry = MBR_ANNUAL_RETURN.registryFeeByCapital[cap.id];
    unit = "/ yr";
    // The registry fee is a government pass-through: never discounted.
    passThrough = registry;
    lines = [
      { label: "Annual return — prepared and filed with the MBR", amount: MBR_ANNUAL_RETURN.ourFee, cadence: "yearly" },
      { label: `MBR registry fee · ${cap.label} share capital`, amount: registry, cadence: "yearly" },
    ];
    selections = { kind: "annret", cap: cap.id, annret: "we" };
  } else if (svc === "regoff") {
    unit = "/ yr";
    lines = [{ label: "Registered office — statutory address, post passed to you", amount: REGISTERED_OFFICE_YEARLY, cadence: "yearly" }];
    selections = { kind: "regoff", regoff: "we" };
  } else if (svc === "catchup") {
    const months = PR_CATCHUP_MONTHS[catchupMonths];
    unit = "one-off";
    // Full service is capped per year behind; self-service is a flat per-month rate.
    const amount = catchupFull
      ? Math.min(months * CATCH_UP.fullPerMonth, Math.ceil(months / 12) * CATCH_UP.fullPerYearCap)
      : months * CATCH_UP.selfPerMonth;
    lines = [
      {
        label: `Catch-up · ${months} ${months === 1 ? "month" : "months"} behind, ${catchupFull ? "we do the work" : "you post, we review"}`,
        amount,
        cadence: "oneoff",
      },
    ];
    selections = { kind: "catchup", behind: String(months), book: catchupFull ? "full" : "self" };
  } else {
    unit = "one-off";
    const one: { label: string; amount: number; cadence: QuoteCadence }[] = [
      { label: "Incorporation — one shareholder, one director, filed with the MBR", amount: INCORPORATION.base, cadence: "oneoff" },
    ];
    if (incShareholders > 1)
      one.push({ label: `Additional shareholders · ${incShareholders - 1}`, amount: (incShareholders - 1) * INCORPORATION.extraShareholder, cadence: "oneoff" });
    if (incDirectors > 1)
      one.push({ label: `Additional directors · ${incDirectors - 1}`, amount: (incDirectors - 1) * INCORPORATION.extraDirector, cadence: "oneoff" });
    if (incRegistrations)
      one.push({ label: "VAT and tax registrations", amount: INCORPORATION.vatTaxRegistrations, cadence: "oneoff" });
    if (incBank) one.push({ label: "Bank account assistance", amount: INCORPORATION.bankAssistance, cadence: "oneoff" });
    if (incRegOffice)
      one.push({ label: "Registered office", amount: INCORPORATION.registeredOfficeYearly, cadence: "yearly" });
    if (incSecretary)
      one.push({ label: "Company secretary", amount: INCORPORATION.companySecretaryYearly, cadence: "yearly" });
    lines = one;
    selections = {
      kind: "incorporation",
      type: "ltd",
      sh: incShareholders,
      dirs: incDirectors,
      reg: incRegistrations ? "we" : "none",
      bank: incBank ? "we" : "none",
      ro: incRegOffice ? "we" : "none",
      sec: incSecretary ? "we" : "none",
    };
  }

  const sum = (c: QuoteCadence) => lines.filter((l) => l.cadence === c).reduce((s, l) => s + l.amount, 0);
  const grossMonthly = sum("monthly");
  const grossYearly = sum("yearly");
  const grossOneOff = sum("oneoff");

  // Promo exactly as the Vacei site applies it: monthly × 0.75, yearly × 0.75
  // on everything except the government pass-through, one-offs untouched.
  const discount = promo ? 1 - LAUNCH_PROMO.pct : 1;
  const netMonthly = Math.round(grossMonthly * discount);
  const netYearly = grossYearly > 0 ? Math.round((grossYearly - passThrough) * discount) + passThrough : 0;
  const netOneOff = grossOneOff;

  /** The headline figure for the cadence this service is billed in. */
  const gross = unit === "/ mo" ? grossMonthly : unit === "/ yr" ? grossYearly : grossOneOff;
  const price = unit === "/ mo" ? netMonthly : unit === "/ yr" ? netYearly : netOneOff;
  const discounted = promo && price < gross;

  const canSend = name.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const send = async () => {
    if (!canSend || sending) return;
    setSending(true);
    const result = await submitWebsiteQuotation({
      name,
      email,
      selections,
      lines,
      monthly: netMonthly,
      yearly: netYearly,
      oneOff: netOneOff,
    });
    setSent(result);
    setSending(false);
  };

  return (
    <section id="calc" style={{ background: "#000", padding: "clamp(40px,5vw,64px) 0 clamp(64px,9vw,104px)" }}>
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
                <div className="a4-font-body text-[14px] font-semibold text-white">{LADDER_BASE.name} — {prEuro(LADDER_BASE.total)}/mo</div>
                <p className="a4-font-body text-[13px] text-[var(--a4-stone)] mt-[6px]">
                  {LADDER_CAVEAT}
                </p>
                <div className="mt-2">
                  <PrRow label="Bank reconciliation" sub="We match & reconcile every account">
                    <PrToggle on={recon} set={setRecon} />
                  </PrRow>
                </div>
              </div>
            )}
            {svc === "vat" && (
              <div>
                <div className="a4-font-body text-[14px] font-semibold text-white">Transactions a month</div>
                <PrChip items={PR_VOLUME_LABELS} value={vatVol} set={setVatVol} cols={2} />
                <p className="a4-font-body text-[13.5px] leading-[1.55] text-[var(--a4-on-dark-mute)] mt-[18px]">
                  Every VAT return prepared and filed with the CFR, reviewed before submission. The fee is a monthly one
                  set by your transaction volume, whatever your filing frequency. Art. 11 small-exempt businesses instead
                  pay one flat €{VAT_RULES.art11FlatYearly}/yr declaration.
                </p>
              </div>
            )}
            {svc === "payroll" && (
              <div>
                <div className="a4-font-body text-[14px] font-semibold text-white">How many on the payroll</div>
                <div className="mt-2">
                  <PrRow label="Employees" sub={`€${payrollRate(heads)} per head at this size — the rate steps down as the book grows`}>
                    <PrStepper value={heads} set={setHeads} min={1} max={50} />
                  </PrRow>
                </div>
                <p className="a4-font-body text-[13.5px] leading-[1.55] text-[var(--a4-on-dark-mute)] mt-[18px]">
                  Payslips, FS5s and the year-end FS3/FS7 chain, filed on time. The whole book is billed at the rate for
                  its size, so the per-head price falls for everyone as you grow.
                </p>
              </div>
            )}
            {svc === "taxret" && (
              <div>
                <div className="a4-font-body text-[14px] font-semibold text-white">Transactions a month</div>
                <PrChip items={PR_VOLUME_LABELS} value={taxVol} set={setTaxVol} cols={2} />
                <p className="a4-font-body text-[13.5px] leading-[1.55] text-[var(--a4-on-dark-mute)] mt-[18px]">
                  Prepared once a year from the closed ledger, with the schedules the return needs. A company that is not
                  trading yet still has a return to file — it is just a much smaller one.
                </p>
              </div>
            )}
            {svc === "annret" && (
              <div>
                <div className="a4-font-body text-[14px] font-semibold text-white">Share capital</div>
                <PrChip items={CAPITAL_BANDS.map((c) => c.label)} value={capital} set={setCapital} cols={2} />
                <p className="a4-font-body text-[13.5px] leading-[1.55] text-[var(--a4-on-dark-mute)] mt-[18px]">
                  Our €{MBR_ANNUAL_RETURN.ourFee} fee to prepare and file, plus the MBR registry fee set by your share
                  capital. The registry fee is passed through at cost and is never discounted.
                </p>
              </div>
            )}
            {svc === "regoff" && (
              <div>
                <div className="a4-font-body text-[14px] font-semibold text-white">Registered office</div>
                <p className="a4-font-body text-[13.5px] leading-[1.55] text-[var(--a4-on-dark-mute)] mt-[18px]">
                  A statutory address for the MBR and the CFR, with post scanned and passed to you the day it arrives.
                  Flat €{REGISTERED_OFFICE_YEARLY}/yr — it does not move with your transaction volume.
                </p>
              </div>
            )}
            {svc === "catchup" && (
              <div>
                <div className="a4-font-body text-[14px] font-semibold text-white">How far behind</div>
                <PrChip
                  items={PR_CATCHUP_MONTHS.map((m) => (m >= 12 ? `${m / 12} ${m === 12 ? "year" : "years"}` : `${m} months`))}
                  value={catchupMonths}
                  set={setCatchupMonths}
                  cols={2}
                />
                <div className="mt-2">
                  <PrRow label="We do the work" sub="Off: you post it and we review — cheaper, but slower on your side">
                    <PrToggle on={catchupFull} set={setCatchupFull} />
                  </PrRow>
                </div>
                <p className="a4-font-body text-[13.5px] leading-[1.55] text-[var(--a4-on-dark-mute)] mt-[18px]">
                  A one-off to bring the ledger up to date before the regular monthly work starts. Full service is capped
                  per year behind, so a long backlog costs less than the monthly rate suggests.
                </p>
              </div>
            )}
            {svc === "audit" && (
              <div>
                <div className="a4-font-body text-[14px] font-semibold text-white">Transactions a month</div>
                <PrChip items={PR_VOLUME_LABELS} value={turn} set={setTurn} cols={2} />
                <p className="a4-font-body text-[13.5px] leading-[1.55] text-[var(--a4-on-dark-mute)] mt-[18px]">
                  A standard statutory audit of your financial statements, signed by a licensed audit firm. Where a review
                  engagement is enough instead, it is 55% of this fee. Groups and regulated entities are scoped on a call.
                </p>
              </div>
            )}
            {svc === "incorporation" && (
              <div>
                <div className="a4-font-body text-[14px] font-semibold text-white">
                  Company formation — from {prEuro(INCORPORATION_FROM)} one-off
                </div>
                <p className="a4-font-body text-[13px] text-[var(--a4-stone)] mt-[6px]">
                  One individual shareholder and one director, filed with the MBR. {PRICING_VAT_NOTE}
                </p>
                <div className="mt-2">
                  <PrRow label="Shareholders" sub={`Each beyond the first is €${INCORPORATION.extraShareholder}`}>
                    <PrStepper value={incShareholders} set={setIncShareholders} />
                  </PrRow>
                  <PrRow label="Directors" sub={`Each beyond the first is €${INCORPORATION.extraDirector}`}>
                    <PrStepper value={incDirectors} set={setIncDirectors} />
                  </PrRow>
                  <PrRow label="VAT and tax registrations" sub={`Filed with the incorporation · €${INCORPORATION.vatTaxRegistrations}`}>
                    <PrToggle on={incRegistrations} set={setIncRegistrations} />
                  </PrRow>
                  <PrRow label="Bank account assistance" sub={`Introductions and application support · €${INCORPORATION.bankAssistance}`}>
                    <PrToggle on={incBank} set={setIncBank} />
                  </PrRow>
                  <PrRow label="Registered office" sub={`Statutory address, post passed to you · €${INCORPORATION.registeredOfficeYearly}/yr`}>
                    <PrToggle on={incRegOffice} set={setIncRegOffice} />
                  </PrRow>
                  <PrRow label="Company secretary" sub={`Registers, minutes and MBR filings · €${INCORPORATION.companySecretaryYearly}/yr`}>
                    <PrToggle on={incSecretary} set={setIncSecretary} />
                  </PrRow>
                </div>
                <p className="a4-font-body text-[12.5px] leading-[1.55] text-[var(--a4-stone)] mt-[14px]">
                  Corporate shareholders add €{INCORPORATION.corporateShareholderChecks} for checks on each company in the
                  structure; regulated sectors add €{INCORPORATION.regulatedOnboarding} onboarding. {INCORPORATION_MGA_NOTE}
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
                <div className="flex flex-wrap items-baseline gap-2 mt-[10px]">
                  {unit !== "/ mo" && <span className="a4-font-body text-[17px] text-[var(--a4-mute)]">from</span>}
                  <span
                    className="a4-font-display font-medium text-[52px] text-[var(--a4-ink)] leading-none"
                    style={{ letterSpacing: "-2px" }}
                  >
                    {prEuro(price)}
                  </span>
                  {discounted && (
                    <span className="a4-font-body text-[17px] text-[var(--a4-mute)] line-through">{prEuro(gross)}</span>
                  )}
                  <span className="a4-font-body text-[14px] text-[var(--a4-mute)]">{unit}</span>
                </div>
                {discounted && (
                  <div className="a4-font-body text-[12px] font-semibold text-[var(--a4-primary)] mt-2">
                    {LAUNCH_PROMO.label}
                  </div>
                )}
                <div className="h-px bg-[var(--a4-hairline-light)] my-5" />
                <div className="flex flex-col gap-[9px]">
                  {lines.map((l) => (
                    <div key={l.label} className="flex justify-between gap-3">
                      <span className="a4-font-body text-[13.5px] text-[var(--a4-mute)]">{l.label}</span>
                      <span className="a4-font-body text-[13.5px] font-semibold text-[var(--a4-ink)] whitespace-nowrap">
                        {prEuro(l.amount)}
                        {l.cadence === "monthly" ? "/mo" : l.cadence === "yearly" ? "/yr" : " one-off"}
                      </span>
                    </div>
                  ))}
                </div>

                {sent ? (
                  <div className="mt-5 pt-5 border-t border-[var(--a4-hairline-light)] text-center">
                    <p className="a4-font-body text-[14px] font-semibold text-[var(--a4-ink)] m-0">{sent.message}</p>
                    {sent.status === "quoted" && (
                      <Button variant="dark" size="md" href={sent.portalHref} target="_blank" style={{ width: "100%", marginTop: 14 }}>
                        Create your account <Icon name="arrow-right" size={16} color="#fff" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="mt-5 pt-5 border-t border-[var(--a4-hairline-light)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-[var(--a4-r-md)] border border-[var(--a4-hairline-light)] px-3 py-2.5 a4-font-body text-[13.5px] text-[var(--a4-ink)] outline-none"
                      />
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="Work email"
                        className="w-full rounded-[var(--a4-r-md)] border border-[var(--a4-hairline-light)] px-3 py-2.5 a4-font-body text-[13.5px] text-[var(--a4-ink)] outline-none"
                      />
                    </div>
                    <Button
                      variant="dark"
                      size="md"
                      onClick={send}
                      style={{ width: "100%", marginTop: 12, opacity: canSend && !sending ? 1 : 0.6, pointerEvents: canSend && !sending ? "auto" : "none" }}
                    >
                      {sending ? "Sending your quote…" : "Email me this quote"}
                      {!sending && <Icon name="arrow-right" size={16} color="#fff" />}
                    </Button>
                    <LocalizedLink
                      href="/contact"
                      className="block text-center mt-3 a4-font-body text-[13px] font-semibold no-underline"
                      style={{ color: "var(--a4-link)" }}
                    >
                      Prefer to talk? Request information →
                    </LocalizedLink>
                  </div>
                )}

                <div className="flex items-center justify-center gap-[7px] mt-3">
                  <Icon name="shield-check" size={13} color="var(--a4-stone)" />
                  <span className="a4-font-body text-[11.5px] text-[var(--a4-mute)]">
                    Fixed fee · service begins upon KYC approval
                  </span>
                </div>
                <p className="a4-font-body text-[11.5px] leading-[1.5] text-[var(--a4-mute)] text-center mt-2">
                  {PRICING_VAT_NOTE} {PRICING_GOV_NOTE}
                  {promo ? ` ${LAUNCH_PROMO.note}` : ""}
                </p>
                <LocalizedLink
                  href="/pricing-info"
                  className="block text-center mt-3 a4-font-body text-[13px] font-semibold no-underline"
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

/**
 * Incorporation fee table — the full itemised list from quote pack
 * mt-2026-08-01, mirroring the wording on vacei.com.
 */
function PricingIncorporation() {
  return (
    <section id="incorporation" className="bg-black border-t border-[var(--a4-hairline-dark)]" style={{ padding: "clamp(48px,6vw,80px) 0" }}>
      <Container>
        <Reveal style={{ textAlign: "center", maxWidth: 660, margin: "0 auto" }}>
          <Eyebrow dark>Incorporation</Eyebrow>
          <h2
            className="a4-font-display font-medium text-white mt-4"
            style={{ fontSize: "clamp(28px,3.6vw,44px)", lineHeight: 1.06, letterSpacing: "-.025em", textWrap: "balance" }}
          >
            A Malta company, from {prEuro(INCORPORATION_FROM)} one-off.
          </h2>
          <p className="a4-font-body text-[var(--a4-on-dark-mute)] mt-4" style={{ fontSize: 16.5, lineHeight: 1.6, textWrap: "pretty" }}>
            One individual shareholder and one director, filed with the MBR. Everything beyond that is itemised — no
            bundles you did not ask for. A partnership adds €{INCORPORATION.typeSurcharge.partner}; a branch of a foreign
            company adds €{INCORPORATION.typeSurcharge.branch}.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="mx-auto max-w-[760px] mt-10 rounded-[var(--a4-r-lg)] overflow-hidden" style={{ border: "1px solid var(--a4-hairline-dark)", background: "var(--a4-surface-elevated)" }}>
            <div className="flex items-baseline justify-between gap-4 px-5 py-4" style={{ borderBottom: "1px solid var(--a4-hairline-dark)" }}>
              <span className="a4-font-body text-[14.5px] font-semibold text-white">
                Incorporation — one shareholder, one director
              </span>
              <span className="a4-font-body text-[14.5px] font-semibold text-white whitespace-nowrap tabular-nums">
                {prEuro(INCORPORATION.base)} one-off
              </span>
            </div>
            {INCORPORATION_ADDONS.map((a) => (
              <div key={a.label} className="flex items-start justify-between gap-4 px-5 py-3.5" style={{ borderBottom: "1px solid var(--a4-hairline-dark)" }}>
                <span className="min-w-0">
                  <span className="block a4-font-body text-[14px] text-white">{a.label}</span>
                  <span className="block a4-font-body text-[12.5px] text-[var(--a4-stone)] mt-[2px]">{a.detail}</span>
                </span>
                <span className="a4-font-body text-[14px] font-semibold text-[var(--a4-on-dark-mute)] whitespace-nowrap tabular-nums shrink-0">
                  +{prEuro(a.amount)} {a.cadence === "yearly" ? "/yr" : "one-off"}
                </span>
              </div>
            ))}
            <p className="a4-font-body text-[12.5px] leading-[1.6] text-[var(--a4-stone)] px-5 py-4 m-0">
              {INCORPORATION_MGA_NOTE} {PRICING_VAT_NOTE} {PRICING_GOV_NOTE} The launch discount does not apply to
              incorporation — it is a one-off fee.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export function PricingCalculatorContent() {
  return (
    <div className="a4-pricing-page">
      <PricingHero />
      <PricingStartingTiers />
      <PricingCalc />
      <PricingIncorporation />
      <PricingComplex />
    </div>
  );
}
