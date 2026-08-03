"use client";

/**
 * THE instant-quote calculator. One component, two routes (/pricing and
 * /quote), one arithmetic.
 *
 * Every figure comes from `evaluateA4Items` in @/lib/websiteQuotation, which is
 * a client-side replica of the portal backend's evaluator reading
 * @/data/a4QuotePack. Nothing here restates a fee: if a price is not in the
 * pack, this calculator cannot quote it and the visitor goes down the lead path
 * instead. That is what keeps the on-screen figure, the submitted record and
 * the server's reprice in agreement — a divergence means a permanent 202
 * RECEIVED and no quote email.
 */

import React, { useState } from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Button, Icon } from "@/components/a4-landing/Primitives";
import { A4_LADDER } from "@/data/a4Ladder";
import {
  BOOKKEEPING_MONTHLY,
  CAPITAL_BANDS,
  CATCH_UP,
  INCORPORATION,
  INCORPORATION_FROM,
  INCORPORATION_MGA_NOTE,
  LAUNCH_PROMO,
  MBR_ANNUAL_RETURN,
  PRICING_GOV_NOTE,
  PRICING_VAT_NOTE,
  REGISTERED_OFFICE_YEARLY,
  REVIEW_ENGAGEMENT_FACTOR,
  TXN_BANDS,
  VAT_RULES,
  payrollRate,
  type SoftwareTierId,
  type TxnBand,
} from "@/data/a4QuotePack";
import {
  evaluateA4Items,
  submitWebsiteQuotation,
  type A4Item,
  type QuoteCadence,
  type WebsiteQuoteResult,
} from "@/lib/websiteQuotation";

const prEuro = (n: number) => "€" + Math.round(n).toLocaleString();

export const PR_SERVICES = [
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
 */
const PR_VOLUME_BANDS: TxnBand[] = TXN_BANDS.map((b) => b.id);
const PR_VOLUME_LABELS = TXN_BANDS.map((b) => b.label);
/** Default to "20 to 60" — the commonest small-company band. */
const PR_DEFAULT_BAND = PR_VOLUME_BANDS.indexOf("21-60");
/** Months-behind options for the catch-up quote. */
const PR_CATCHUP_MONTHS = [3, 6, 12, 24];

/**
 * Ladder position → pack software tier. NOT a cast: the ladder calls its base
 * level "books" while the pack tier key is "book", so the mapping is explicit
 * and a missing entry is a type error rather than an unpriceable submission.
 */
const PR_TIER_BY_LADDER_ID: Record<string, SoftwareTierId> = {
  books: "book",
  senior: "senior",
  manager: "manager",
  cfo: "cfo",
};
const PR_TIER_IDS: SoftwareTierId[] = A4_LADDER.map((l) => PR_TIER_BY_LADDER_ID[l.id]);

const PR_VATREG: { id: "art10" | "art11" | "art12"; label: string }[] = [
  { id: "art10", label: "Art. 10" },
  { id: "art11", label: "Art. 11" },
  { id: "art12", label: "Art. 12" },
];

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

const inputCls =
  "w-full rounded-[var(--a4-r-md)] border border-[var(--a4-hairline-light)] px-3 py-2.5 a4-font-body text-[13.5px] text-[var(--a4-ink)] outline-none";

function download(b64: string, name: string) {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export type ServiceQuoteCalculatorProps = {
  /**
   * Offer the branded PDF alongside the emailed quotation (the /quote route).
   * The PDF is priced by the SAME pack items as the on-screen figure — it is a
   * different rendering of one quote, not a second engine.
   */
  pdf?: boolean;
};

export function ServiceQuoteCalculator({ pdf = false }: ServiceQuoteCalculatorProps) {
  const [svc, setSvc] = useState<ServiceId>("accounting");
  const [accFull, setAccFull] = useState(false);
  const [tierIdx, setTierIdx] = useState(0);
  const [bookVol, setBookVol] = useState(PR_DEFAULT_BAND);
  const [vatVol, setVatVol] = useState(PR_DEFAULT_BAND);
  const [vatReg, setVatReg] = useState(0);
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
  const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<WebsiteQuoteResult | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [pdfDone, setPdfDone] = useState(false);

  let unit: "/ mo" | "/ yr" | "one-off" = "/ mo";

  /**
   * The priced basket, in the ONLY shape the backend can reprice. Everything
   * shown to the visitor is derived from `evaluateA4Items(items)` below.
   */
  let items: A4Item[] = [];

  if (svc === "accounting") {
    items = accFull
      ? [{ service: "bookkeeping-full", txn: PR_VOLUME_BANDS[bookVol] }]
      : [{ service: "software", tier: PR_TIER_IDS[tierIdx] }];
  } else if (svc === "vat") {
    const reg = PR_VATREG[vatReg].id;
    if (reg === "art11") unit = "/ yr";
    items = [{ service: "vat", txn: PR_VOLUME_BANDS[vatVol], vatreg: reg }];
  } else if (svc === "payroll") {
    items = [{ service: "payroll", heads }];
  } else if (svc === "taxret") {
    unit = "/ yr";
    items = [{ service: "taxret", txn: PR_VOLUME_BANDS[taxVol] }];
  } else if (svc === "audit") {
    // Every band is quoted instantly, top band included — same as vacei.com.
    // Genuinely out-of-scope work has its own "Let's talk" section below.
    unit = "/ yr";
    items = [{ service: "audit", txn: PR_VOLUME_BANDS[turn] }];
  } else if (svc === "annret") {
    unit = "/ yr";
    items = [{ service: "mbr", capital: CAPITAL_BANDS[capital].id }];
  } else if (svc === "regoff") {
    unit = "/ yr";
    items = [{ service: "registered-office" }];
  } else if (svc === "catchup") {
    unit = "one-off";
    items = [{ service: "catchup", months: PR_CATCHUP_MONTHS[catchupMonths], mode: catchupFull ? "full" : "self" }];
  } else {
    // Incorporation is NOT in the backend's priceable item set, so it can never
    // be submitted as an instant quote — it goes down the lead path instead.
    unit = "one-off";
  }

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
  const gross = isLeadPath ? incOneOff : unit === "/ mo" ? totals.grossMonthly : unit === "/ yr" ? totals.grossYearly : totals.grossOneOff;
  const price = isLeadPath ? incOneOff : unit === "/ mo" ? totals.monthly : unit === "/ yr" ? totals.yearly : totals.oneOff;
  const discounted = promo && price < gross;

  const contactOk = name.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSend = !isLeadPath && contactOk;
  const canPdf = canSend && company.trim().length > 0;

  const send = async () => {
    if (!canSend || sending) return;
    setSending(true);
    setSent(await submitWebsiteQuotation({ name, email, items }));
    setSending(false);
  };

  const downloadPdf = async () => {
    if (!canPdf || pdfBusy) return;
    setPdfBusy(true);
    setPdfError("");
    try {
      const res = await fetch("/api/quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, items }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Something went wrong.");
      download(data.pdfBase64, data.pdfName);
      setPdfDone(true);
    } catch (e: unknown) {
      setPdfError(e instanceof Error ? e.message : "Could not generate the quotation.");
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <section id="calc" style={{ background: "#000", padding: "clamp(40px,5vw,64px) 0 clamp(64px,9vw,104px)" }}>
      <div className="a4-container">
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
                <div className="a4-font-body text-[14px] font-semibold text-white">Who keeps the books?</div>
                <PrChip items={["Just the software", "You upload, we do it"]} value={accFull ? 1 : 0} set={(v) => setAccFull(v === 1)} cols={2} />
                {accFull ? (
                  <div className="mt-5">
                    <div className="a4-font-body text-[14px] font-semibold text-white">Transactions a month</div>
                    <PrChip items={PR_VOLUME_LABELS} value={bookVol} set={setBookVol} cols={2} />
                    <p className="a4-font-body text-[13.5px] leading-[1.55] text-[var(--a4-on-dark-mute)] mt-[18px]">
                      You send us the paperwork and we post, reconcile and close every month. The fee is set by your
                      transaction volume — from €{BOOKKEEPING_MONTHLY["1-20"]}/mo.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5">
                    <div className="a4-font-body text-[14px] font-semibold text-white">How much of the finance function do you want?</div>
                    <PrChip items={A4_LADDER.map((l) => l.name)} value={tierIdx} set={setTierIdx} cols={2} />
                    <p className="a4-font-body text-[13.5px] leading-[1.55] text-[var(--a4-on-dark-mute)] mt-[18px]">
                      {A4_LADDER[tierIdx].tagline} {A4_LADDER[tierIdx].detail}
                    </p>
                  </div>
                )}
              </div>
            )}
            {svc === "vat" && (
              <div>
                <div className="a4-font-body text-[14px] font-semibold text-white">Your VAT registration</div>
                <PrChip items={PR_VATREG.map((v) => v.label)} value={vatReg} set={setVatReg} cols={3} />
                {PR_VATREG[vatReg].id !== "art11" && (
                  <div className="mt-5">
                    <div className="a4-font-body text-[14px] font-semibold text-white">Transactions a month</div>
                    <PrChip items={PR_VOLUME_LABELS} value={vatVol} set={setVatVol} cols={2} />
                  </div>
                )}
                <p className="a4-font-body text-[13.5px] leading-[1.55] text-[var(--a4-on-dark-mute)] mt-[18px]">
                  Every VAT return prepared and filed with the CFR, reviewed before submission. Art. 10 is a monthly fee
                  set by your transaction volume, whatever your filing frequency. Art. 12 (EU acquisitions only) is{" "}
                  {Math.round(VAT_RULES.art12Factor * 100)}% of that. Art. 11 small-exempt businesses instead pay one
                  flat €{VAT_RULES.art11FlatYearly}/yr declaration.
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
                  at €{CATCH_UP.fullPerYearCap} per year behind, so a long backlog costs less than the €
                  {CATCH_UP.fullPerMonth}/month rate suggests.
                </p>
              </div>
            )}
            {svc === "audit" && (
              <div>
                <div className="a4-font-body text-[14px] font-semibold text-white">Transactions a month</div>
                <PrChip items={PR_VOLUME_LABELS} value={turn} set={setTurn} cols={2} />
                <p className="a4-font-body text-[13.5px] leading-[1.55] text-[var(--a4-on-dark-mute)] mt-[18px]">
                  A standard statutory audit of your financial statements, signed by a licensed audit firm. Every volume
                  band is priced here — nothing is held back for a call. Where a review engagement is enough instead, it
                  is {Math.round(REVIEW_ENGAGEMENT_FACTOR * 100)}% of this fee. Groups and regulated entities are scoped
                  separately.
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
              background: "#fff",
              padding: "clamp(24px,3vw,30px)",
              position: "sticky",
              top: 88,
              border: "none",
            }}
          >
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

              {isLeadPath ? (
                // Company formation is not on the instant-quote fee schedule —
                // shareholder structure decides the real price, so a person
                // scopes it. Same figures, different route.
                <div className="mt-5 pt-5 border-t border-[var(--a4-hairline-light)]">
                  <Button variant="dark" size="md" href="/contact" style={{ width: "100%" }}>
                    Request this incorporation <Icon name="arrow-right" size={16} color="#fff" />
                  </Button>
                  <p className="a4-font-body text-[11.5px] leading-[1.5] text-[var(--a4-mute)] text-center mt-2.5">
                    Company formation is confirmed by a director before anything is filed.
                  </p>
                </div>
              ) : sent ? (
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
                      className={inputCls}
                    />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="Work email"
                      className={inputCls}
                    />
                  </div>
                  {pdf && (
                    <input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Company name (for the PDF)"
                      className={inputCls + " mt-2"}
                    />
                  )}
                  <Button
                    variant="dark"
                    size="md"
                    onClick={send}
                    style={{ width: "100%", marginTop: 12, opacity: canSend && !sending ? 1 : 0.6, pointerEvents: canSend && !sending ? "auto" : "none" }}
                  >
                    {sending ? "Sending your quote…" : "Email me this quote"}
                    {!sending && <Icon name="arrow-right" size={16} color="#fff" />}
                  </Button>
                  {pdf && (
                    <>
                      <Button
                        variant="outline"
                        size="md"
                        onClick={downloadPdf}
                        style={{ width: "100%", marginTop: 8, opacity: canPdf && !pdfBusy ? 1 : 0.6, pointerEvents: canPdf && !pdfBusy ? "auto" : "none" }}
                      >
                        {pdfBusy ? "Building your PDF…" : "Download my quotation (PDF)"}
                      </Button>
                      {pdfDone && (
                        <p className="a4-font-body text-[12px] text-[var(--a4-mute)] text-center mt-2">
                          Downloaded — our team has the same figures.
                        </p>
                      )}
                      {pdfError && (
                        <p className="a4-font-body text-[12px] text-[#b4342b] text-center mt-2">{pdfError}</p>
                      )}
                    </>
                  )}
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
          </div>
        </div>
      </div>
    </section>
  );
}
