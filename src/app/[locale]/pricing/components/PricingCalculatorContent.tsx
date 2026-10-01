"use client";

import React, { useState } from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Icon } from "@/components/a4-landing/Primitives";
import { DARK_CARD } from "@/components/fx/primitives";
import { CLIENT_ONBOARDING_URL } from "@/lib/external-links";
import { A4_MANAGED_OFFER, MANAGED_CAVEAT, MANAGED_CATCHUP_NOTE } from "@/data/a4ManagedOffer";
import {
  VAT_RULES,
  VAT_FROM,
  AUDIT_FROM,
  BOOKKEEPING_FROM,
  BOOKKEEPING_COMPANY,
  BOOKKEEPING_COMPANY_TOP,
  EXPENSE_BANDS,
  MANAGED_ENTITY_OPTIONS,
  INCORPORATION,
  INCORPORATION_FROM,
  INCORPORATION_ADDONS,
  INCORPORATION_MGA_NOTE,
  LAUNCH_PROMO,
  catchUpLabel,
  BANK_ACCOUNT,
  isPromoActive,
  managedMonthly,
  PRICING_VAT_NOTE,
  PRICING_GOV_NOTE,
  ONBOARDING_UNPRICED_NOTE,
  type ExpenseBand,
  type ManagedEntity,
} from "@/data/a4QuotePack";
import {
  evaluateA4Items,
  submitWebsiteQuotation,
  type A4Item,
  type QuoteCadence,
  type WebsiteQuoteResult,
} from "@/lib/websiteQuotation";
import { independenceFlags, independenceNotice } from "@/lib/independence";
import { catchUpMonthsFrom, ongoingStartMonth } from "@/lib/accounting-fee";
import { trackConversion } from "@/lib/analytics";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import {
  BODY,
  Band,
  CtaCard,
  DarkCta,
  Doc,
  DocChip,
  DocFoot,
  DocHead,
  DocRow,
  G,
  GRID3,
  Head,
  INDIGO,
  INK,
  NumberedRows,
  OptionPills,
  PERI,
  PillLink,
  Pills,
  Segmented,
  Stepper,
  Switch,
  WordCard,
  gradText,
  kicker,
  pad2,
} from "@/app/[locale]/services/components/SiteKit";

const prEuro =(n: number) => "€" + Math.round(n).toLocaleString();

/** The pack's cadence words, as the copy conventions write them ("/mo", "/yr", "one-off"). */
const unitLabel = (u: string) => u.replace(/^\/\s+/, "/");

const PR_SERVICES = [
  { id: "accounting", label: "Bookkeeping", icon: "book-open-check" },
  { id: "vat", label: "VAT", icon: "receipt-text" },
  { id: "audit", label: "Audit", icon: "clipboard-check" },
  { id: "incorporation", label: "Incorporation", icon: "building-2" },
] as const;

/**
 * Transaction-volume bands, exactly as quote pack mt-2026-08-01 bands them.
 * VAT and audit are both priced off volume, not filing frequency or turnover.
 */
const PR_VOLUME_BANDS = ["1-20", "21-60", "61-150", "151-400"] as const;
/** VAT offers the '0' band too — a registered, not-yet-trading company still
 *  has nil returns prepared and filed (€19/mo, pack finding A4 2026-08-17).
 *  Without it the card's "from €19" was unreachable in the calculator. */
const VAT_BANDS = ["0", "1-20", "21-60", "61-150", "151-400"] as const;
const VAT_LABELS = ["None yet", "Up to 20", "20 to 60", "60 to 150", "150 to 400"];
/** The bookkeeping tab asks the FULL band ladder — volume prices the fee now. */
const BOOK_TXN_BANDS = ["0", "1-20", "21-60", "61-150", "151-400", "401-1000", "1000+"] as const;
const BOOK_TXN_LABELS = ["None yet", "Up to 20", "20 to 60", "60 to 150", "150 to 400", "400 to 1,000", "1,000+"];
const PR_VOLUME_LABELS = ["Up to 20", "20 to 60", "60 to 150", "150 to 400"];

/**
 * The bookkeeping choice. `PR_TIER_IDS` used to map a four-rung software
 * ladder onto pack tier keys; there is no ladder now, so the calculator's
 * bookkeeping tab picks an entity and nothing else.
 */
const PR_ENTITY_IDS: ManagedEntity[] = MANAGED_ENTITY_OPTIONS.map((o) => o.id);

/**
 * Monthly-expenses bands — the BOOKKEEPING price driver under pack
 * mt-2026-08-14-volume. Separate from PR_VOLUME_BANDS above, which is the
 * TRANSACTION band and drives VAT and audit. The accounting tab asks for
 * expenses; the VAT and audit tabs ask for transactions. Same calculator, two
 * different questions, never shown as one.
 */
const PR_EXPENSE_IDS: ExpenseBand[] = EXPENSE_BANDS.map((b) => b.id);
const PR_EXPENSE_LABELS = EXPENSE_BANDS.map((b) => b.label);

/* PR_CATCHUP_MONTHS (the earlier-months chip row) is gone: the start month
   already says how many there are — see `catchUpMonthsFrom`. */

type ServiceId = (typeof PR_SERVICES)[number]["id"];

/* ────────────────────────────────────────────────────────────────────────── */
/* Calculator building blocks (the design's numbered steps and rows)          */
/* ────────────────────────────────────────────────────────────────────────── */

/** One numbered question — "01  Are these a company's books, or your own?" */
function PrStep({
  n,
  title,
  hint,
  htmlFor,
  first = false,
  children,
}: {
  n: number;
  title: React.ReactNode;
  hint?: React.ReactNode;
  htmlFor?: string;
  first?: boolean;
  children?: React.ReactNode;
}) {
  const titleStyle: React.CSSProperties = { fontSize: "clamp(19px,1.6vw,21px)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.3, color: INK };
  return (
    <div data-fx="rise" data-dy="30" style={{ marginTop: first ? 0 : 28, paddingTop: first ? 0 : 28, borderTop: first ? 0 : "1px solid #E4E4E7" }}>
      <div style={{ display: "grid", gridTemplateColumns: "34px minmax(0,1fr)", alignItems: "baseline" }}>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: ".02em", color: INDIGO }}>{pad2(n)}</span>
        {htmlFor ? (
          <label htmlFor={htmlFor} style={titleStyle}>
            {title}
          </label>
        ) : (
          <div style={titleStyle}>{title}</div>
        )}
      </div>
      {hint ? <div style={{ margin: "6px 0 0 34px", fontFamily: BODY, fontSize: 14, lineHeight: 1.55, color: "#71717A" }}>{hint}</div> : null}
      {children ? <div style={{ marginTop: 16 }}>{children}</div> : null}
    </div>
  );
}

/** A labelled row with a control on the right (incorporation extras). */
function PrRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[14px]" style={{ padding: "16px 0", borderTop: "1px solid #E4E4E7" }}>
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", color: INK }}>{label}</div>
        {sub && <div style={{ marginTop: 3, fontFamily: BODY, fontSize: 13.5, lineHeight: 1.45, color: "#71717A" }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 01 Starting prices                                                         */
/* ────────────────────────────────────────────────────────────────────────── */

// The managed offer, straight from src/data/a4ManagedOffer.ts so this page can
// never drift. Two prices, both published, an accountant on the file in both.
const PR_MANAGED_ICONS: Record<string, string> = {
  sole: "user-check",
  company: "building-2",
};

const PR_STARTING_TIERS = [
  ...A4_MANAGED_OFFER.map((l) => ({
    id: l.id as string,
    name: l.name,
    icon: PR_MANAGED_ICONS[l.id] ?? "book-open-check",
    tag: "We keep the books",
    price: l.price,
    unit: "/ mo",
    blurb: `${l.tagline} ${l.detail}`,
    popular: l.id === "company",
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
    blurb: "Independent audit for companies that require one. Where a review engagement is enough, it is 55% of the audit fee. Audits are carried out by our partner audit firms — we connect you with them, and the fee stays as quoted here.",
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

/**
 * The launch discount applies to the monthly ladder plans — the ones the
 * calculator on this page discounts and the ones the banner is talking about.
 * Government-fee and quoted lines are left alone: the registry fee is not ours
 * to discount, and "Quoted" has no number to strike through.
 */
function tierIsDiscounted(tier: StartingTier): boolean {
  return "ladder" in tier && !!tier.ladder && !!tier.price && isPromoActive();
}

function tierPromoPrice(tier: StartingTier): number {
  return tierIsDiscounted(tier)
    ? Math.round(tier.price! * (1 - LAUNCH_PROMO.pct))
    : tier.price!;
}

/**
 * A starting price as the design's card: counter, the plan as the big word,
 * the blurb, and the price over the hairline. Every bookkeeping figure is the
 * entry band of nine, so it always reads "from" (a4ManagedOffer copy rules).
 */
function PricingTierCard({ tier, i, total }: { tier: StartingTier; i: number; total: number }) {
  const isPopular = "popular" in tier && tier.popular;
  const isQuoted = "quoted" in tier && tier.quoted;
  const showFrom = ("from" in tier && tier.from) || ("ladder" in tier && tier.ladder);
  const dark = i % 2 === 1;
  const dim = dark ? "#A1A1AA" : "#52525B";

  return (
    <WordCard
      i={i}
      total={total}
      word={tier.name}
      dark={dark}
      d={(i % 3) * 80}
      minHeight={380}
      topRight={
        isPopular ? (
          <span style={{ height: 30, padding: "0 13px", display: "inline-flex", alignItems: "center", borderRadius: 999, background: INDIGO, color: "#FFFFFF", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
            Most popular
          </span>
        ) : (
          <span
            style={{
              height: 30,
              padding: "0 13px",
              display: "inline-flex",
              alignItems: "center",
              borderRadius: 999,
              border: `1px solid ${dark ? "rgba(255,255,255,.18)" : "#E4E4E7"}`,
              color: dim,
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {tier.tag}
          </span>
        )
      }
      foot={
        isQuoted ? (
          <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.03em", color: dark ? "#FFFFFF" : INK }}>Quoted</span>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 6 }}>
            {showFrom && <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: dim }}>from</span>}
            {/* The banner on this page says the launch discount is "already
                deducted". It was not: these cards showed the list price while
                the calculator beside them showed 25% less, so the page argued
                with itself about what a customer pays. Show the discounted
                figure with the list price struck through, exactly as the
                calculator does. The pack is untouched — this is presentation. */}
            <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.03em", color: dark ? "#FFFFFF" : INK, fontVariantNumeric: "tabular-nums" }}>
              {prEuro(tierPromoPrice(tier))}
            </span>
            {tierIsDiscounted(tier) && (
              <span style={{ fontFamily: BODY, fontSize: 15, color: dim, textDecoration: "line-through", fontVariantNumeric: "tabular-nums" }}>{prEuro(tier.price!)}</span>
            )}
            <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: dim }}>{unitLabel(tier.unit)}</span>
          </div>
        )
      }
    >
      <p style={{ margin: 0, fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: dark ? "#A1A1AA" : "#52525B", textWrap: "pretty" }}>{tier.blurb}</p>
    </WordCard>
  );
}

function PricingStartingTiers() {
  return (
    <Band surface="light" sec="starting" id="starting">
      <Head
        n="01"
        eyebrow="Starting prices"
        maxWidth={860}
        title={
          <>
            We keep your books, priced on what you spend <G>each month.</G>
          </>
        }
        sub={
          <>
            From {prEuro(BOOKKEEPING_FROM)}/mo if you are self-employed, from {prEuro(BOOKKEEPING_COMPANY)}/mo for a company, up to {prEuro(BOOKKEEPING_COMPANY_TOP)}/mo at the top band — each including one bank account. Nine bands, every one priced instantly — and there is no software-only plan, a qualified accountant is on the file either way. VAT, audit, tax and company formation are priced separately below, on your transaction volume. {MANAGED_CATCHUP_NOTE}
          </>
        }
      />
      {isPromoActive() && (
        <p data-fx="rise" data-d="260" style={{ margin: "14px 0 0", fontFamily: BODY, fontSize: 14, fontWeight: 600, color: INDIGO }}>
          {LAUNCH_PROMO.note}
        </p>
      )}
      <p data-fx="rise" data-d="280" style={{ margin: "14px 0 0", fontFamily: BODY, fontSize: 13, fontWeight: 500, color: "#71717A" }}>
        {PRICING_VAT_NOTE} {PRICING_GOV_NOTE}
      </p>

      <div style={{ ...GRID3, marginTop: 40 }}>
        {PR_STARTING_TIERS.map((tier, i) => (
          <PricingTierCard key={tier.id} tier={tier} i={i} total={PR_STARTING_TIERS.length} />
        ))}
      </div>

      <Pills style={{ marginTop: 40 }}>
        <PillLink href={CLIENT_ONBOARDING_URL} target="_blank" variant="ink" size="md">
          Access portal
        </PillLink>
        <PillLink href="/contact" variant="outline" size="md">
          Get a tailored quote
        </PillLink>
      </Pills>

      <PricingInfoBanner />
    </Band>
  );
}

function PricingInfoBanner() {
  return (
    <LocalizedLink
      href="/pricing-info"
      className="a4k-card"
      data-fx="rise"
      style={{ marginTop: 24, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "14px 24px", padding: "22px 26px" }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
        <span aria-hidden="true" style={{ width: 44, height: 44, flexShrink: 0, display: "grid", placeItems: "center", borderRadius: 999, background: "rgba(79,85,241,.08)" }}>
          <Icon name="info" size={20} color={INDIGO} />
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", color: INK }}>How our pricing works</span>
          <span style={{ display: "block", marginTop: 3, fontFamily: BODY, fontSize: 15, lineHeight: 1.5, color: "#52525B" }}>
            Fixed monthly plans for bookkeeping and VAT — plus how we quote audit and complex work.
          </span>
        </span>
      </span>
      <span className="a4k-go">
        Read pricing guide <Icon name="arrow-right" size={14} color="currentColor" />
      </span>
    </LocalizedLink>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 02 Build your quote                                                        */
/* ────────────────────────────────────────────────────────────────────────── */

function PricingCalc() {
  const [svc, setSvc] = useState<ServiceId>("accounting");
  const [entityIdx, setEntityIdx] = useState(1); // company by default
  /**
   * B1 — the spend band is NOT pre-answered. `-1` is "nothing picked".
   *
   * This shipped `useState(1)` (the €10–25k band) under a comment reading
   * "€10–25k/mo by default", so a visitor who never touched the chips was
   * quoted €69/mo and could send it. The band id was valid, so the backend
   * re-priced it, agreed, and issued the quotation — the failure is invisible
   * from every side except the client's bank statement.
   */
  const [expensesIdx, setExpensesIdx] = useState(-1);
  // REQUIRED before the quote is priceable — and now actually empty. It was
  // pre-filled with next month while the comment claimed it was required, so
  // `startOk` passed on an answer nobody gave and the visitor could send
  // without ever seeing the field.
  const [startMonth, setStartMonth] = useState<string>("");
  /**
   * mt-2026-08-26c-volume: the transaction band and account count now price
   * the bookkeeping fee (volume uplift + EUR 25/mo per extra account) and are
   * REQUIRED on the wire. Defaults mirror the vacei wizard: the 20-60 band
   * and a single account — a mid default, not the cheapest.
   */
  const [bookTxnIdx, setBookTxnIdx] = useState(1); // BOOK_TXN_BANDS index — '1-20' (owner ruling 2026-08-26: every calculator defaults to "Up to 20")
  const [bookBanks, setBookBanks] = useState(1);
  // Defaults follow the owner ruling 2026-08-26: every calculator opens on
  // "Up to 20" — VAT_BANDS[1] and PR_VOLUME_BANDS[0] respectively (the old
  // useState(1) on the 4-band array opened audit/VAT on "20 to 60").
  const [vatVol, setVatVol] = useState(1);
  const [turn, setTurn] = useState(0);
  const [incShareholders, setIncShareholders] = useState(1);
  const [incDirectors, setIncDirectors] = useState(1);
  // Off by default: the card says "from €2,000" and the calculator must open
  // on the same figure — the €150 registrations add-on is the visitor's choice
  // (owner 2026-08-27: "VAT option auto select in pricing page incorporation").
  const [incRegistrations, setIncRegistrations] = useState(false);
  const [incBank, setIncBank] = useState(false);
  const [incRegOffice, setIncRegOffice] = useState(false);
  const [incSecretary, setIncSecretary] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<WebsiteQuoteResult | null>(null);

  let unit: "/ mo" | "/ yr" | "one-off" = "/ mo";
  let complex = false;

  /**
   * The priced basket, in the ONLY shape the backend can reprice. Everything
   * shown to the visitor is derived from `evaluateA4Items(items)` below, so the
   * figures on screen and the figures we submit are the same arithmetic — if
   * they diverged the backend's reprice would disagree and the quote would fall
   * back to 202 RECEIVED with no email ever sent.
   */
  let items: A4Item[] = [];

  const entity = PR_ENTITY_IDS[entityIdx] ?? "company";
  // `undefined` while unanswered. NOT `?? "0-10k"` — falling back to the entry
  // band is the one direction that loses money invisibly, and it is precisely
  // what the pack docblock forbids callers from doing.
  const expenses: ExpenseBand | undefined = PR_EXPENSE_IDS[expensesIdx];
  /**
   * DERIVED from the start month, not a second question. This calculator used
   * to ask for the month and then, in different words, how many earlier
   * months were outstanding — and a visitor whose two answers disagreed got a
   * quote that matched neither.
   */
  const catchUpMonths = catchUpMonthsFrom(startMonth);
  /** null when the band is missing or unknown — the quote is then withheld. */
  const bookRate = expenses == null ? null : managedMonthly(entity, expenses);
  /** B1: the accounting tab cannot price anything without the band. */
  const noExpenses = svc === "accounting" && bookRate == null;

  if (svc === "accounting") {
    // No band → no basket. An empty basket is what keeps `canSend` false, so
    // nothing can be submitted at a band the visitor never chose.
    const bookTxn = BOOK_TXN_BANDS[bookTxnIdx];
    items = expenses == null ? [] : [
      { service: "bookkeeping-managed", entity, expenses, txn: bookTxn, banks: bookBanks },
      ...(catchUpMonths > 0
        ? [{ service: "catchup" as const, months: catchUpMonths, entity, expenses, txn: bookTxn, banks: bookBanks }]
        : []),
    ];
  } else if (svc === "vat") {
    items = [{ service: "vat", txn: VAT_BANDS[vatVol], vatreg: "art10" }];
  } else if (svc === "audit") {
    unit = "/ yr";
    items = [{ service: "audit", txn: PR_VOLUME_BANDS[turn] }];
    if (turn >= 3) complex = true;
  } else {
    // Incorporation is NOT in the backend's priceable item set, so it can never
    // be submitted as an instant quote — it goes down the lead path instead.
    unit = "one-off";
  }
  // Onboarding and opening balances are part of taking anyone on, and they
  // carry NO figure in pack mt-2026-08-14-managed. The item emits no priced
  // line; it is what makes the backend name onboarding in `unpricedItems` and
  // add "onboarding is not included in the figures below" to the quotation.
  // Without it a4.com.mt sent quotations that never said so, while vacei.com —
  // which does emit it — always did.
  if (items.length) items = [...items, { service: "onboarding" }];

  const totals = evaluateA4Items(items);
  const promo = totals.promoApplied;

  /** Incorporation is priced client-side for display only (lead path). */
  const incLines: { label: string; amount: number; cadence: QuoteCadence }[] = [];
  if (svc === "incorporation") {
    incLines.push({ label: "Incorporation — one shareholder, one director, filed with the MBR", amount: INCORPORATION.base, cadence: "oneoff" });
    if (incShareholders > 1)
      incLines.push({ label: `Additional shareholders · ${incShareholders - 1}`, amount: (incShareholders - 1) * INCORPORATION.extraShareholder, cadence: "oneoff" });
    if (incDirectors > 1)
      incLines.push({ label: `Additional directors · ${incDirectors - 1}`, amount: (incDirectors - 1) * INCORPORATION.extraDirector, cadence: "oneoff" });
    if (incRegistrations)
      incLines.push({ label: "VAT and tax registrations", amount: INCORPORATION.vatTaxRegistrations, cadence: "oneoff" });
    if (incBank) incLines.push({ label: "Bank account assistance", amount: INCORPORATION.bankAssistance, cadence: "oneoff" });
    if (incRegOffice)
      incLines.push({ label: "Registered office", amount: INCORPORATION.registeredOfficeYearly, cadence: "yearly" });
    if (incSecretary)
      incLines.push({ label: "Company secretary", amount: INCORPORATION.companySecretaryYearly, cadence: "yearly" });
  }

  const isLeadPath = svc === "incorporation";
  const lines = isLeadPath ? incLines : totals.lines;

  const incOneOff = incLines.filter((l) => l.cadence === "oneoff").reduce((s, l) => s + l.amount, 0);

  /** The headline figure for the cadence this service is billed in. */
  const gross = isLeadPath
    ? incOneOff
    : unit === "/ mo"
      ? totals.grossMonthly
      : totals.grossYearly;
  const price = isLeadPath ? incOneOff : unit === "/ mo" ? totals.monthly : totals.yearly;
  const discounted = promo && price < gross;

  // IESBA routing. This calculator's tabs are one service at a time, so the
  // conflict case cannot arise here — but the consequence of the tab they are
  // on is still shown before they send.
  const independence = independenceFlags({
    wantsBookkeeping: svc === "accounting",
    wantsAudit: svc === "audit",
  });
  const independenceText = independenceNotice(independence.route);

  /**
   * M13 — the start month only applies to the BOOKKEEPING basket.
   *
   * The month input renders on the accounting tab only, but `serviceStartDate:
   * startMonth` was sent from every tab, so a VAT or audit submission carried a
   * confidently-stated start date the visitor never saw a field for, let alone
   * filled in. It is omitted from non-bookkeeping baskets rather than the field
   * being added to tabs it does not apply to: a VAT return has no "first month
   * we keep the books", so asking would be inventing a question to justify an
   * answer we should not have been sending.
   */
  const needsStartMonth = svc === "accounting";
  const startOk = /^\d{4}-(0[1-9]|1[0-2])$/.test(startMonth);
  const canSend =
    !isLeadPath &&
    items.length > 0 &&
    !noExpenses &&
    (!needsStartMonth || startOk) &&
    name.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const send = async () => {
    if (!canSend || sending) return;
    setSending(true);
    const result = await submitWebsiteQuotation({
      name, email, items,
      // The first ONGOING month, which is this month whenever the picked one
      // is in the past — the backlog travels as the `catchup` item instead.
      ...(needsStartMonth && startOk ? { serviceStartDate: ongoingStartMonth(startMonth) } : {}),
    });
    setSent(result);
    // Conversion on a CONFIRMED backend result only — `error` means the record
    // never landed, and reporting it would bid on leads we do not have.
    if (result.status === "quoted" || result.status === "received") {
      trackConversion("quote_request_pricing");
    }
    setSending(false);
  };

  const svcLabel = PR_SERVICES.find((s) => s.id === svc)?.label ?? "";
  const muted = "#52525B";

  return (
    <Band surface="muted" sec="calc" id="calc">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 28 }}>
        <Head
          n="02"
          eyebrow="Build your quote"
          title="Choose what you need."
          sub="The price you see is the price we invoice — itemised, and never gated behind an email."
          maxWidth={600}
        />
        <div data-fx="rise" data-d="120" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, maxWidth: "100%" }}>
          <Segmented label="Service" options={PR_SERVICES.map((s) => ({ id: s.id, label: s.label, icon: s.icon }))} value={svc} onChange={setSvc} />
          <span style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: "#71717A" }}>{PRICING_VAT_NOTE}</span>
        </div>
      </div>

      <div className="a4k-calc" style={{ marginTop: 40 }}>
        {/* Left: the questions, as numbered steps (each step rises on its own) */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E7", borderRadius: 28, padding: "clamp(24px,3.2vw,40px)", minWidth: 0 }}>
          {svc === "accounting" && (
            <div>
              <PrStep n={1} first title="Are these a company's books, or your own?">
                <OptionPills label="Whose books" items={A4_MANAGED_OFFER.map((l) => l.name)} value={entityIdx} onPick={setEntityIdx} min={160} />
                <p style={{ margin: "14px 0 0", fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: muted }}>
                  {A4_MANAGED_OFFER[entityIdx]?.tagline} {A4_MANAGED_OFFER[entityIdx]?.detail}
                </p>
              </PrStep>

              <PrStep
                n={2}
                title="About how much do you spend a month?"
                hint={
                  <>
                    {/* One line under the question; the definition sits behind a
                        native disclosure — the paragraph-per-question density was
                        this calculator's biggest legibility gap against the
                        simplest competitor estimators (review of 26 Aug). */}
                    The money that leaves the business in a typical month. It sets your bookkeeping price — a rough figure is fine.
                    <details style={{ marginTop: 6 }}>
                      <summary style={{ cursor: "pointer", fontWeight: 600, color: INDIGO }}>What counts as spend?</summary>
                      <p style={{ margin: "6px 0 0", fontSize: 13.5, lineHeight: 1.55, color: "#71717A" }}>
                        Supplier bills, wages, rent, software — everything you spend. Excludes VAT, loan repayments,
                        and transfers between your own accounts. New or seasonal? Use your last three months&apos;
                        average. It is not the transaction count the VAT and audit tabs ask for.
                      </p>
                    </details>
                  </>
                }
              >
                {/* Nothing pre-selected: `expensesIdx` starts at -1, which
                    matches no chip, so every chip renders unpicked. */}
                <OptionPills label="Monthly spend" items={PR_EXPENSE_LABELS} value={expensesIdx} onPick={setExpensesIdx} min={230} />
                <p style={{ margin: "14px 0 0", fontFamily: BODY, fontSize: 14, fontWeight: bookRate == null ? 600 : 500, fontVariantNumeric: "tabular-nums", color: bookRate == null ? INDIGO : muted }}>
                  {bookRate == null
                    ? "Pick a band and we price this instantly — we do not assume one for you."
                    : `${prEuro(bookRate)} / month — ${A4_MANAGED_OFFER[entityIdx]?.name ?? ""} at ${PR_EXPENSE_LABELS[expensesIdx]} a month.`}
                </p>
              </PrStep>

              <PrStep n={3} title="About how many transactions a month?" hint="The count, not the amount. Busy bands add to the bookkeeping fee — the two lowest add nothing.">
                <OptionPills label="Transactions a month" items={BOOK_TXN_LABELS} value={bookTxnIdx} onPick={setBookTxnIdx} min={120} />
              </PrStep>

              <PrStep
                n={4}
                title="Bank accounts"
                hint={`Every account is reconciled separately. The first is included in the bookkeeping fee; each extra account is €${BANK_ACCOUNT.baseMonthly} a month plus ${Math.round(BANK_ACCOUNT.pctOfBookkeeping * 100)}% of the bookkeeping fee.`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <Stepper label="Bank accounts" value={bookBanks} onChange={setBookBanks} min={1} max={8} />
                  <span style={{ fontFamily: BODY, fontSize: 15, fontWeight: 500, color: muted }}>{bookBanks === 1 ? "account" : "accounts"}</span>
                </div>
              </PrStep>

              <PrStep n={5} htmlFor="pr-start" title="From which month do you need us?" hint="Pick the earliest month that still needs doing — months before it are catch-up, charged once at the same rate.">
                <input id="pr-start" type="month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} className="a4k-input" style={{ maxWidth: 280 }} />
                {!startOk ? (
                  /* Honest gate: the panel already prices from the band —
                     the month only decides the catch-up line and unlocks
                     the send. Do not claim the price is withheld. */
                  <p style={{ margin: "12px 0 0", fontFamily: BODY, fontSize: 14, fontWeight: 600, color: INDIGO }}>
                    Everything above is already priced — pick the month and we can add any catch-up and send the quote.
                  </p>
                ) : catchUpMonths > 0 ? (
                  /* The catch-up split, read back from the month just
                     picked — the second question this tab used to ask. */
                  <p style={{ margin: "12px 0 0", fontFamily: BODY, fontSize: 14, lineHeight: 1.55, color: muted, fontVariantNumeric: "tabular-nums" }}>
                    {catchUpMonths} {catchUpMonths === 1 ? "month" : "months"} of catch-up, charged once at the same monthly rate. Then ongoing from this month.
                    {expenses == null ? "" : ` ${catchUpLabel(catchUpMonths, entity, expenses, BOOK_TXN_BANDS[bookTxnIdx], bookBanks, isPromoActive())}`}
                  </p>
                ) : (
                  <p style={{ margin: "12px 0 0", fontFamily: BODY, fontSize: 14, color: muted }}>
                    Nothing to catch up — we pick the books up there and keep them from then on.
                  </p>
                )}
              </PrStep>

              <p style={{ margin: "28px 0 0", paddingTop: 20, borderTop: "1px solid #E4E4E7", fontFamily: BODY, fontSize: 13.5, lineHeight: 1.55, color: "#71717A" }}>{MANAGED_CAVEAT}</p>
            </div>
          )}
          {svc === "vat" && (
            <PrStep n={1} first title="Transactions a month">
              <OptionPills label="Transactions a month" items={VAT_LABELS} value={vatVol} onPick={setVatVol} min={140} />
              <p style={{ margin: "18px 0 0", fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: muted }}>
                Every VAT return prepared and filed with the CFR, reviewed before submission. The fee is a monthly one
                set by your transaction volume, whatever your filing frequency. Art. 11 small-exempt businesses instead
                pay one flat €{VAT_RULES.art11FlatYearly}/yr declaration.
              </p>
            </PrStep>
          )}
          {svc === "audit" && (
            <PrStep n={1} first title="Transactions a month">
              <OptionPills label="Transactions a month" items={PR_VOLUME_LABELS} value={turn} onPick={setTurn} min={140} />
              <p style={{ margin: "18px 0 0", fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: muted }}>
                A standard statutory audit of your financial statements, signed by a licensed audit firm. Where a review
                engagement is enough instead, it is 55% of this fee. Groups and regulated entities are scoped on a call.
              </p>
            </PrStep>
          )}
          {svc === "incorporation" && (
            <div>
              <PrStep n={1} first title={`Company formation — from ${prEuro(INCORPORATION_FROM)} one-off`} hint={`One individual shareholder and one director, filed with the MBR. ${PRICING_VAT_NOTE}`} />
              <div style={{ marginTop: 18 }}>
                <PrRow label="Shareholders" sub={`Each beyond the first is €${INCORPORATION.extraShareholder}`}>
                  <Stepper label="Shareholders" value={incShareholders} onChange={setIncShareholders} />
                </PrRow>
                <PrRow label="Directors" sub={`Each beyond the first is €${INCORPORATION.extraDirector}`}>
                  <Stepper label="Directors" value={incDirectors} onChange={setIncDirectors} />
                </PrRow>
                <PrRow label="VAT and tax registrations" sub={`Filed with the incorporation · €${INCORPORATION.vatTaxRegistrations}`}>
                  <Switch label="VAT and tax registrations" on={incRegistrations} onChange={setIncRegistrations} />
                </PrRow>
                <PrRow label="Bank account assistance" sub={`Introductions and application support · €${INCORPORATION.bankAssistance}`}>
                  <Switch label="Bank account assistance" on={incBank} onChange={setIncBank} />
                </PrRow>
                <PrRow label="Registered office" sub={`Statutory address, post passed to you · €${INCORPORATION.registeredOfficeYearly}/yr`}>
                  <Switch label="Registered office" on={incRegOffice} onChange={setIncRegOffice} />
                </PrRow>
                <PrRow label="Company secretary" sub={`Registers, minutes and MBR filings · €${INCORPORATION.companySecretaryYearly}/yr`}>
                  <Switch label="Company secretary" on={incSecretary} onChange={setIncSecretary} />
                </PrRow>
              </div>
              <p style={{ margin: 0, paddingTop: 16, borderTop: "1px solid #E4E4E7", fontFamily: BODY, fontSize: 13.5, lineHeight: 1.55, color: "#71717A" }}>
                Corporate shareholders add €{INCORPORATION.corporateShareholderChecks} for checks on each company in the
                structure; regulated sectors add €{INCORPORATION.regulatedOnboarding} onboarding. {INCORPORATION_MGA_NOTE}
              </p>
            </div>
          )}
        </div>

        {/* Right: the quote document */}
        <div className="a4-sum a4k-sticky" style={{ minWidth: 0 }}>
          {complex ? (
            <div data-fx="rise" style={{ borderRadius: 28, padding: "clamp(28px,3.4vw,40px)", background: DARK_CARD, border: "1px solid rgba(255,255,255,.08)", color: "#FFFFFF", boxShadow: "0 50px 120px rgba(9,9,11,.22)" }}>
              <span aria-hidden="true" style={{ width: 52, height: 52, display: "grid", placeItems: "center", borderRadius: 999, background: "rgba(139,143,247,.16)" }}>
                <Icon name="calendar" size={24} color={PERI} />
              </span>
              <div style={{ marginTop: 22, fontSize: "clamp(26px,2.4vw,32px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Let&apos;s scope it together</div>
              <p style={{ margin: "12px 0 0", fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: "#A1A1AA" }}>
                At this size your audit fee depends on complexity. Book a short call for a fixed quote.
              </p>
              <PillLink href="#complex" variant="light" style={{ marginTop: 26, width: "100%", height: 58 }}>
                Book a call
              </PillLink>
            </div>
          ) : (
            <Doc d={120}>
              <DocHead compact k="Your fixed price" title={svcLabel} />
              <div style={{ padding: "22px 28px 24px" }}>
                {/* B1: no band, no figure — not the headline, not the
                    struck-through "before discount" price, not the line items.
                    A number on screen is what a visitor anchors on, and this
                    one would have been someone else's price. */}
                {noExpenses ? (
                  <>
                    <div style={{ fontSize: "clamp(30px,3vw,38px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.05, color: INK }}>Tell us your spend</div>
                    <p style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 14, lineHeight: 1.55, color: muted }}>
                      Pick a monthly-spend band above and your full itemised price appears here straight away. We do not assume a band — it is what sets the bookkeeping fee.
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 8 }}>
                      {unit !== "/ mo" && <span style={{ fontFamily: BODY, fontSize: 17, fontWeight: 500, color: muted }}>from</span>}
                      <span style={{ fontSize: "clamp(46px,4.6vw,60px)", fontWeight: 600, letterSpacing: "-0.045em", lineHeight: 1.05, paddingBottom: ".04em", fontVariantNumeric: "tabular-nums", ...gradText }}>
                        {prEuro(price)}
                      </span>
                      {discounted && <span style={{ fontFamily: BODY, fontSize: 17, color: muted, textDecoration: "line-through" }}>{prEuro(gross)}</span>}
                      <span style={{ fontFamily: BODY, fontSize: 15, fontWeight: 500, color: muted }}>{unitLabel(unit)}</span>
                    </div>
                    {discounted && <div style={{ marginTop: 8, fontFamily: BODY, fontSize: 13, fontWeight: 600, color: INDIGO }}>{LAUNCH_PROMO.label}</div>}
                  </>
                )}
              </div>

              {lines.map((l, i) => (
                <div key={l.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, padding: "14px 28px", borderTop: "1px solid #E4E4E7" }}>
                  <span style={{ display: "flex", gap: 12, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: INDIGO }}>{pad2(i + 1)}</span>
                    <span style={{ fontFamily: BODY, fontSize: 14.5, lineHeight: 1.45, color: "#3F3F46" }}>{l.label}</span>
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em", color: INK, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {prEuro(l.amount)}
                    <span style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: "#71717A" }}>
                      {l.cadence === "monthly" ? "/mo" : l.cadence === "yearly" ? "/yr" : " one-off"}
                    </span>
                  </span>
                </div>
              ))}

              {/* Onboarding rides in the basket with no figure on it, so it
                  is named here too — an unpriced item nobody mentioned reads
                  as "included, free". Same sentence the quotation carries. */}
              {totals.hasUnpricedOnboarding && (
                <p style={{ margin: 0, padding: "12px 28px 0", fontFamily: BODY, fontSize: 12.5, lineHeight: 1.5, color: "#71717A" }}>{ONBOARDING_UNPRICED_NOTE}</p>
              )}

              {/* The independence consequence of the tab they are on, said
                  before they send it — not discovered later. */}
              {independenceText && (
                <div role="note" style={{ margin: "16px 28px 0", padding: "14px 16px", borderRadius: 16, background: "rgba(79,85,241,.06)", border: "1px solid rgba(79,85,241,.22)" }}>
                  <span style={{ ...kicker, display: "block", color: INDIGO }}>Independence</span>
                  <span style={{ display: "block", marginTop: 5, fontFamily: BODY, fontSize: 13.5, lineHeight: 1.55, color: "#3F3F46" }}>{independenceText}</span>
                </div>
              )}

              <div style={{ marginTop: 24, padding: "24px 28px 28px", borderTop: "1px solid #E4E4E7", background: "#FAFAFA" }}>
                {isLeadPath ? (
                  // Company formation is not on the instant-quote fee schedule —
                  // shareholder structure decides the real price, so a person
                  // scopes it. Same figures, different route.
                  <>
                    <PillLink href="/contact" variant="ink" style={{ width: "100%" }}>
                      Request this incorporation
                    </PillLink>
                    <p style={{ margin: "12px 0 0", textAlign: "center", fontFamily: BODY, fontSize: 13, lineHeight: 1.5, color: "#71717A" }}>
                      Company formation is confirmed by a director before anything is filed.
                    </p>
                  </>
                ) : sent ? (
                  <div role="status" style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", color: INK }}>{sent.message}</p>
                    {sent.status === "quoted" && (
                      <p style={{ margin: "8px 0 0", fontFamily: BODY, fontSize: 13.5, lineHeight: 1.5, color: muted }}>
                        Quotation {sent.reference} — the email links to your quotation page, where you can switch services on or off and accept online.
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 10 }}>
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" autoComplete="name" className="a4k-input" />
                      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Work email" aria-label="Work email" autoComplete="email" className="a4k-input" />
                    </div>
                    <button
                      type="button"
                      onClick={send}
                      disabled={!canSend || sending}
                      className="a4-btn a4-btn-ink"
                      style={{ marginTop: 12, width: "100%", opacity: canSend && !sending ? 1 : 0.55, cursor: canSend && !sending ? "pointer" : "default" }}
                    >
                      {sending ? "Sending your quote…" : "Email me this quote"}
                    </button>
                    <LocalizedLink href="/contact" style={{ display: "block", marginTop: 14, textAlign: "center", fontSize: 14.5, fontWeight: 600, color: INDIGO, textDecoration: "none" }}>
                      Prefer to talk? Request information →
                    </LocalizedLink>
                  </>
                )}

                <div style={{ marginTop: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Icon name="shield-check" size={14} color="#71717A" />
                  <span style={{ fontFamily: BODY, fontSize: 12.5, color: "#71717A" }}>Fixed fee · service begins upon KYC approval</span>
                </div>
                <p style={{ margin: "8px 0 0", textAlign: "center", fontFamily: BODY, fontSize: 12.5, lineHeight: 1.5, color: "#71717A" }}>
                  {PRICING_VAT_NOTE} {PRICING_GOV_NOTE}
                  {promo ? ` ${LAUNCH_PROMO.note}` : ""}
                </p>
                <LocalizedLink href="/pricing-info" style={{ display: "block", marginTop: 12, textAlign: "center", fontSize: 14.5, fontWeight: 600, color: INDIGO, textDecoration: "none" }}>
                  How is this price calculated? →
                </LocalizedLink>
              </div>
            </Doc>
          )}
        </div>
      </div>
    </Band>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 03 Incorporation — the fee schedule as a quote document                    */
/* ────────────────────────────────────────────────────────────────────────── */

/**
 * Incorporation fee table — the full itemised list from quote pack
 * mt-2026-08-01, mirroring the wording on vacei.com.
 */
function PricingIncorporation() {
  return (
    <Band surface="white" sec="incorporation" id="incorporation">
      <Head
        n="03"
        eyebrow="Incorporation"
        maxWidth={760}
        title={
          <>
            A Malta company, from {prEuro(INCORPORATION_FROM)} <G>one-off.</G>
          </>
        }
        sub={
          <>
            One individual shareholder and one director, filed with the MBR. Everything beyond that is itemised — no
            bundles you did not ask for. A partnership adds €{INCORPORATION.typeSurcharge.partner}; a branch of a foreign
            company adds €{INCORPORATION.typeSurcharge.branch}.
          </>
        }
      />

      <Doc rise={false} style={{ marginTop: "clamp(48px,6vw,72px)" }}>
        <DocHead rise k="Incorporation" title={`From ${prEuro(INCORPORATION_FROM)}`} />
        <div style={{ height: 28 }} />
        <DocRow
          rise
          n="01"
          word="Incorporation — one shareholder, one director"
          aside={
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.03em", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
              {prEuro(INCORPORATION.base)} <span style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: "#71717A" }}>one-off</span>
            </div>
          }
          compact
        />
        {INCORPORATION_ADDONS.map((a, i) => (
          <DocRow
            key={a.label}
            rise
            n={pad2(i + 2)}
            word={a.label}
            line={a.detail}
            compact
            aside={
              <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", color: "#3F3F46", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                +{prEuro(a.amount)} <span style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: "#71717A" }}>{a.cadence === "yearly" ? "/yr" : "one-off"}</span>
              </div>
            }
          />
        ))}
        <DocFoot style={{ alignItems: "center" }}>
          <DocChip>
            {PRICING_VAT_NOTE} {PRICING_GOV_NOTE}
          </DocChip>
          <p style={{ margin: 0, maxWidth: 560, fontFamily: BODY, fontSize: 13.5, lineHeight: 1.6, color: "#52525B" }}>
            {INCORPORATION_MGA_NOTE} The launch discount does not apply to incorporation — it is a one-off fee.
          </p>
        </DocFoot>
      </Doc>
    </Band>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 04 Complex work — the dark closing band                                    */
/* ────────────────────────────────────────────────────────────────────────── */

function PricingComplex() {
  const items = [
    { icon: "layers", t: "Groups & consolidations", s: "Multiple entities, intercompany and consolidated accounts." },
    { icon: "shield-check", t: "Regulated entities", s: "iGaming, financial services and other regulated audits." },
    { icon: "globe", t: "Cross-border & advisory", s: "International structures, restructuring and special projects." },
  ];

  return (
    <DarkCta
      id="complex"
      sec="complex"
      n="04"
      eyebrow="Complex work"
      typed="Bigger or unusual?"
      words={[{ t: "Let's talk.", g: true }]}
      label="Bigger or unusual? Let's talk."
      lead={
        <>
          Some engagements need a human to scope properly. Book a free 30-minute call and we&apos;ll give you a clear,
          fixed quote — no surprises.
        </>
      }
      below={
        <div data-fx="rise" data-d="820" style={{ marginTop: 22 }}>
          <LocalizedLink href="/pricing-info" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 600, color: PERI, textDecoration: "none" }}>
            Read our full pricing guide <Icon name="arrow-right" size={15} color={PERI} />
          </LocalizedLink>
        </div>
      }
    >
      <CtaCard>
        <NumberedRows dark items={items.map((it) => ({ key: it.t, t: it.t, body: it.s }))} />
        <PillLink href="/contact" variant="light" style={{ marginTop: 28, width: "100%", height: 64, fontSize: 19 }}>
          Book a consultation
        </PillLink>
      </CtaCard>
    </DarkCta>
  );
}

export function PricingCalculatorContent() {
  return (
    <div className="a4-pricing-page">
      <PageHero
        eyebrow="Transparent pricing · Malta"
        title="A fixed price,"
        accent="in seconds."
        sub="Build a price for your everyday accounting, VAT and audit work below. Something more complex? We'll scope it on a quick call."
      >
        <Pills>
          <PillLink href="#calc" variant="light">
            Build your quote
          </PillLink>
          <PillLink href="/pricing-info" variant="ghost">
            How pricing works
          </PillLink>
        </Pills>
      </PageHero>
      <PricingStartingTiers />
      <PricingCalc />
      <PricingIncorporation />
      <PricingComplex />
    </div>
  );
}
