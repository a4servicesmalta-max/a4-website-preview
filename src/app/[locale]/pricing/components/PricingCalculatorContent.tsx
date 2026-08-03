"use client";

import LocalizedLink from "@/components/common/LocalizedLink";
import { Button, Container, Eyebrow, Icon, Reveal } from "@/components/a4-landing/Primitives";
import { useLocalizedHref } from "./useLocalizedHref";
import { CLIENT_ONBOARDING_URL } from "@/lib/external-links";
import { A4_LADDER, LADDER_FIRST_HUMAN } from "@/data/a4Ladder";
import {
  VAT_RULES,
  VAT_FROM,
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
} from "@/data/a4QuotePack";
// THE calculator — the one component /pricing and /quote both render, so the
// two pages can never quote a company differently. It used to live inline here
// as `PricingCalc` with its own arithmetic and its own `selections` shape.
import { ServiceQuoteCalculator } from "@/components/pricing/ServiceQuoteCalculator";

const prEuro = (n: number) => "€" + Math.round(n).toLocaleString();

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
 * mt-2026-08-02b, mirroring the wording on vacei.com.
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
      <ServiceQuoteCalculator />
      <PricingIncorporation />
      <PricingComplex />
    </div>
  );
}
