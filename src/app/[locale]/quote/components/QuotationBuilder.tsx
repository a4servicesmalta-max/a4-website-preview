"use client";

import React, { useMemo, useState } from "react";
import {
  buildQuote,
  euro,
  QUOTE_MAX_BANKS,
  QUOTE_SERVICE_CATALOG,
  type QuoteServiceId,
} from "@/lib/quotation";
import { catchUpMonthsFrom, ongoingStartMonth } from "@/lib/accounting-fee";
import { flagsForServiceSelection, independenceNotice } from "@/lib/independence";
import { submitWebsiteQuotation, type A4Item, type A4Risk, type WebsiteQuoteResult } from "@/lib/websiteQuotation";
import {
  EXPENSE_BANDS,
  BANK_ACCOUNT,
  MANAGED_ENTITY_OPTIONS,
  PRICING_GOV_NOTE,
  SECTORS,
  TXN_BANDS,
  type ExpenseBand,
  type ManagedEntity,
  type TxnBand,
} from "@/data/a4QuotePack";
import {
  BODY,
  Band,
  Check,
  Doc,
  DocHead,
  G,
  Head,
  INDIGO,
  INK,
  PillLink,
  gradText,
  kicker,
  pad2,
} from "@/app/[locale]/services/components/SiteKit";

/** Field label — Outfit 15 / 600, as the design's "Full name". */
const label: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  fontFamily: "var(--a4x-display)",
  fontSize: 15,
  fontWeight: 600,
  letterSpacing: "-0.01em",
  color: "#3F3F46",
};
/** Helper under a field; `ask` marks a question still to answer (indigo, never amber). */
const help = (ask = false): React.CSSProperties => ({
  display: "block",
  marginTop: 8,
  fontFamily: BODY,
  fontSize: 13,
  lineHeight: 1.5,
  fontWeight: ask ? 600 : 500,
  color: ask ? INDIGO : "#71717A",
});
/** The two "which one is ours?" pills — the same affordance the homepage uses. */
const choicePill: React.CSSProperties = {
  height: 40,
  padding: "0 18px",
  borderRadius: 999,
  cursor: "pointer",
  border: 0,
  background: INDIGO,
  color: "#FFFFFF",
  fontFamily: "var(--a4x-display)",
  fontSize: 14.5,
  fontWeight: 600,
};

function download(b64: string, name: string) {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function QuotationBuilder() {
  const [company, setCompany] = useState("");
  const [regNo, setRegNo] = useState("");
  /**
   * The wizard's three drivers, asked here with the same options so /quote
   * can never put the same company in a different tier or band than the
   * homepage or vacei.com. Sector and volume ship EMPTY for the same reason
   * `expenses` does: a pre-selected answer is a price for a question nobody
   * answered, and the PDF outlives the page.
   */
  const [sector, setSector] = useState<string>("");
  // Owner ruling 2026-08-26: the volume question defaults to the "Up to 20" band on every calculator.
  const [txn, setTxn] = useState<TxnBand | "">("1-20");
  const [banks, setBanks] = useState(1);
  const industry = SECTORS.find((x) => x.id === sector)?.label ?? "";
  const [entity, setEntity] = useState<ManagedEntity>("company");
  /**
   * Monthly expenses — the bookkeeping price driver.
   *
   * B1: ships EMPTY. It used to default to "10-25k", so a visitor who never
   * touched the field downloaded a PDF quoting the €69 band — a written,
   * binding quotation for an answer they never gave, and the one artefact here
   * that outlives the page. `buildQuote` already quotes "On request" on a
   * missing band rather than guessing the entry band; the default was what
   * stopped that safeguard ever firing.
   */
  const [expenses, setExpenses] = useState<ExpenseBand | "">("");
  // Earlier months that still need doing. This used to be `overdueYears`
  // because catch-up was capped per year; it is now priced per month at the
  // monthly rate, so months are the honest unit and the picker offers them.
  const [catchUpMonths, setCatchUpMonths] = useState(0);
  // Required, and now actually empty. It was pre-filled with next month while
  // the label claimed it was required, so the field could sail through
  // untouched and the PDF asserted a start month nobody chose — which decides
  // which months are catch-up, and so what the client is billed for.
  const [startMonth, setStartMonth] = useState<string>("");
  const [services, setServices] = useState<Set<QuoteServiceId>>(() => new Set(["accounts", "vat"] as QuoteServiceId[]));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ pdfBase64: string; pdfName: string } | null>(null);
  /** The portal's answer for the formal quotation (sent at once, or held for a person). */
  const [portalResult, setPortalResult] = useState<WebsiteQuoteResult | null>(null);

  /**
   * IESBA routing. `accounts` here IS managed bookkeeping, so choosing it
   * rules A4 out as auditor and choosing `audit` rules us out of the books.
   * Mapped onto the same service ids the request form uses, so both surfaces
   * set the flag by the same rule.
   *
   * Decided BEFORE the quote is built, because the answer decides whether
   * there is anything to price at all.
   */
  const independence = useMemo(
    () =>
      flagsForServiceSelection([
        ...(services.has("accounts") ? ["Bookkeeping"] : []),
        ...(services.has("audit") ? ["Audit & Annual Accounts"] : []),
      ]),
    [services]
  );
  const independenceText = independenceNotice(independence.route);
  const conflict = independence.route === "conflict";

  /**
   * `null` on a conflict — no figures are produced at all, the same shape the
   * homepage calculator and vacei.com use. This builder used to price the
   * basket in full, show "first-year total", and refuse only at submit; by
   * then the visitor has anchored on a number for an engagement A4 is not
   * permitted to provide. Nothing is priced until they say which side is ours.
   */
  const quote = useMemo(
    () =>
      conflict
        ? null
        : buildQuote({
            company: company || "Your company",
            regNo,
            industry,
            sector: sector || undefined,
            txn: txn || undefined,
            banks,
            services: [...services],
            entity,
            // "" is "not answered" — pass undefined so `buildQuote` takes its
            // On-request path rather than seeing a band-shaped empty string.
            expenses: expenses || undefined,
            catchUpMonths,
            startMonth,
          }),
    [conflict, company, regNo, industry, sector, txn, banks, services, entity, expenses, catchUpMonths, startMonth]
  );

  /**
   * Any change to what is being priced retires the quotation already produced.
   *
   * Without this a visitor could download a valid PDF, then tick the audit and
   * sit on a conflict screen with "Download PDF again" still live beside it —
   * a document for a basket that is no longer the one on screen. The homepage
   * calculator clears its sent state on the same principle; a PDF outlives a
   * page, so it matters more here. Called from each input rather than from an
   * effect, so there is no cascading render.
   */
  const retireQuotation = () => {
    setDone(null);
    setPortalResult(null);
    setError("");
  };
  /** Wraps a pricing input's setter so no call site can forget the line above. */
  const priced = <T,>(set: (v: T) => void) => (v: T) => { set(v); retireQuotation(); };

  /**
   * M4 — the MBR annual return is a COMPANY filing, so a sole trader is never
   * offered it. Hidden rather than shown-and-refused: an option you cannot buy
   * is a question with no answer, and this form previously let a self-employed
   * visitor tick it and download a PDF quoting it. `buildQuote` and
   * /api/quotation both drop it too — this is the friendliest of the three
   * gates, not the only one.
   */
  const catalog = useMemo(
    () => QUOTE_SERVICE_CATALOG.filter((s) => !(s.id === "mbr" && entity !== "company")),
    [entity]
  );

  /** Switching to sole trader must also drop an MBR already ticked. */
  const setEntityAndSync = (e: ManagedEntity) => {
    setEntity(e);
    if (e !== "company") setServices((prev) => {
      if (!prev.has("mbr")) return prev;
      const next = new Set(prev);
      next.delete("mbr");
      return next;
    });
    retireQuotation();
  };

  const toggle = (id: QuoteServiceId) => {
    setServices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else next.add(id);
      return next;
    });
    retireQuotation();
  };

  /** The way out of the conflict: drop one side of the rule, price the rest. */
  const dropService = (id: QuoteServiceId) => {
    setServices((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    retireQuotation();
  };

  const submit = async () => {
    setError("");
    // Both sides of the independence rule at once. Checked FIRST and before any
    // other complaint, and there is nothing priced behind it to download. The
    // button is inert in this state, and /api/quotation refuses it as well —
    // this is the innermost of the three, not the only one.
    if (conflict || !quote) return setError(independenceText ?? "");
    if (!company.trim()) return setError("Enter your company name.");
    if (!name.trim()) return setError("Enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email address.");
    if (!startMonth) return setError("Choose the month we should start from.");
    // B1: bookkeeping cannot go on a written quotation without the band that
    // prices it. The quote would render it "On request", which is honest but
    // is not what someone clicking "Download my quotation" is asking for — so
    // ask the one question instead of issuing a half-priced PDF.
    if (services.has("accounts") && !expenses)
      return setError("Tell us roughly what you spend a month — it is what sets the bookkeeping price, and we do not assume a band.");
    // Same rule for the other two drivers: sector sets the risk tier on VAT
    // and the audit, the transaction band prices them and the bookkeeping
    // uplift. Guessing either would be a quote for a company we have not met.
    if ((services.has("accounts") || services.has("audit") || services.has("vat")) && (!sector || !txn))
      return setError("Tell us what the company does and roughly how many transactions it has a month — they set the VAT, audit and bookkeeping prices, and we do not assume them.");
    setBusy(true);
    try {
      const res = await fetch("/api/quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, company, regNo, industry, sector, txn, banks,
          services: [...services], entity, expenses, catchUpMonths,
          // The PDF prints "Bookkeeping starts X; N earlier months quoted
          // separately", so X must be the first ONGOING month. The field the
          // visitor filled is the earliest month still to do.
          startMonth: ongoingStartMonth(startMonth),
          auditEligible: independence.auditEligible,
          bookkeepingEligible: independence.bookkeepingEligible,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Something went wrong.");
      setDone({ pdfBase64: data.pdfBase64, pdfName: data.pdfName });
      download(data.pdfBase64, data.pdfName);

      // The formal quotation. The builder now asks every driver the pack
      // prices on (entity, monthly expenses, transaction band, accounts,
      // start month), so the basket below is the same A4Item basket the
      // homepage and /pricing submit: the portal re-prices it, creates the
      // lead in the partner portal and — for a4.com.mt — emails the visitor a
      // link to their quotation page, where they choose services and accept.
      // Payroll has no headcount here, so a basket with payroll is not
      // instant-priceable: the portal keeps the lead for a person to quote.
      const sendable = (txn || "") as TxnBand;
      const items: A4Item[] = [];
      if (services.has("accounts") && expenses && txn) {
        items.push({ service: "bookkeeping-managed", entity, expenses, txn: sendable, banks });
        if (catchUpMonths > 0) items.push({ service: "catchup", months: catchUpMonths, entity, expenses, txn: sendable, banks });
      }
      if (services.has("vat") && txn) items.push({ service: "vat", txn: sendable, vatreg: "art10" });
      if (services.has("audit") && txn) items.push({ service: "audit", txn: sendable });
      // Same capital default the homepage calculator uses for the annual return.
      if (services.has("mbr") && entity === "company") items.push({ service: "mbr", capital: "1500" });
      if (services.has("payroll")) items.push({ service: "payroll", heads: 0 });
      // A `refer` sector is never auto-priced — a director quotes it.
      const tier = SECTORS.find((x) => x.id === sector)?.tier;
      const risk: A4Risk | undefined = tier === "standard" || tier === "elevated" || tier === "high" ? tier : undefined;
      if (items.length && risk) {
        const result = await submitWebsiteQuotation({
          name,
          email,
          company,
          items,
          risk,
          serviceStartDate: ongoingStartMonth(startMonth),
          sourceDetail: "a4-quote-builder",
        });
        setPortalResult(result);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not generate the quotation.");
    } finally {
      setBusy(false);
    }
  };
  const conflictNote = independence.route === "conflict";

  return (
    <Band surface="muted" id="instant-quote" sec="builder">
      <Head
        n="01"
        eyebrow="Instant quotation"
        maxWidth={640}
        title={
          <>
            Build your indicative quote in&nbsp;60&nbsp;<G>seconds</G>
          </>
        }
        sub="Pick your services and get an instant, transparent estimate — downloaded now, with your formal quotation following by email, ready to accept online."
      />

      <div className="a4k-calc" style={{ marginTop: 44 }}>
        {/* Left: inputs (the panel stays put; its two blocks rise in) */}
        <div style={{ minWidth: 0, background: "#FFFFFF", border: "1px solid #E4E4E7", borderRadius: 28, padding: "clamp(24px,3.2vw,40px)" }}>
          <div data-fx="rise" data-dy="30" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))", gap: "24px 16px" }}>
            <div>
              <label htmlFor="qb-company" style={label}>Company name *</label>
              <input id="qb-company" value={company} onChange={(e) => priced(setCompany)(e.target.value)} placeholder="Your company Ltd" className="a4k-input" />
            </div>
            <div>
              <label htmlFor="qb-reg" style={label}>MBR registration (optional)</label>
              <input id="qb-reg" value={regNo} onChange={(e) => priced(setRegNo)(e.target.value)} placeholder="C 12345" className="a4k-input" />
            </div>
            <div>
              <label htmlFor="qb-sector" style={label}>What the company does *</label>
              <select id="qb-sector" value={sector} onChange={(e) => priced(setSector)(e.target.value)} className="a4k-input">
                {/* Unselected by default — see `expenses` below. */}
                <option value="">Select the closest match…</option>
                {SECTORS.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.label}
                  </option>
                ))}
              </select>
              {!sector && <span style={help(true)}>Sets the risk tier on VAT and the audit — the same list every A4 calculator uses.</span>}
            </div>
            <div>
              <label htmlFor="qb-txn" style={label}>Transactions a month *</label>
              <select id="qb-txn" value={txn} onChange={(e) => priced(setTxn)(e.target.value as TxnBand | "")} className="a4k-input">
                <option value="">Select a volume…</option>
                {TXN_BANDS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label} — {b.hint}
                  </option>
                ))}
              </select>
              {!txn && <span style={help(true)}>The count, not the amount. Prices VAT and the audit, and adds to the bookkeeping fee at busy volumes.</span>}
            </div>
            <div>
              <label htmlFor="qb-banks" style={label}>Bank accounts</label>
              <input
                id="qb-banks"
                type="number"
                min={1}
                max={QUOTE_MAX_BANKS}
                step={1}
                value={banks}
                onChange={(e) => priced(setBanks)(Math.min(QUOTE_MAX_BANKS, Math.max(1, Math.floor(Number(e.target.value) || 1))))}
                className="a4k-input"
                aria-label="How many bank accounts do you have?"
              />
              <span style={help()}>
                Every account is reconciled separately. The first is included in the bookkeeping fee; each extra account is €{BANK_ACCOUNT.baseMonthly} a month plus {Math.round(BANK_ACCOUNT.pctOfBookkeeping * 100)}% of the bookkeeping fee.
              </span>
            </div>
            <div>
              <label htmlFor="qb-entity" style={label}>Whose books *</label>
              <select id="qb-entity" value={entity} onChange={(e) => setEntityAndSync(e.target.value as ManagedEntity)} className="a4k-input">
                {MANAGED_ENTITY_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label} — {o.sub}
                  </option>
                ))}
              </select>
            </div>
            <div>
              {/* Distinct from the revenue band above: revenue scales audit,
                  tax and payroll; monthly SPEND is what prices the books. */}
              <label htmlFor="qb-expenses" style={label}>Monthly expenses *</label>
              <select id="qb-expenses" value={expenses} onChange={(e) => priced(setExpenses)(e.target.value as ExpenseBand | "")} className="a4k-input">
                {/* Unselected by default, and it stays a real option so the
                    visitor can put it back. Without this the first band would
                    be pre-selected by the browser and we would be back to
                    pricing an answer nobody gave. */}
                <option value="">Select your monthly spend…</option>
                {EXPENSE_BANDS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label} — {b.hint}
                  </option>
                ))}
              </select>
              {!expenses && <span style={help(true)}>Needed before we can price the bookkeeping — we do not assume a band.</span>}
            </div>
            {/* ONE field, not two. The "earlier months" select that used to
                sit beside this asked for the same fact a second time: a start
                month in the past IS the count of months still to do, so the
                count is derived from it and read back below. */}
            <div>
              <label htmlFor="qb-start" style={label}>Start from *</label>
              <input
                id="qb-start"
                type="month"
                value={startMonth}
                onChange={(e) => {
                  const v = e.target.value;
                  priced(setStartMonth)(v);
                  priced(setCatchUpMonths)(catchUpMonthsFrom(v));
                }}
                className="a4k-input"
                aria-label="From which month do you need us?"
              />
              <span style={help()}>
                The earliest month that still needs doing.{" "}
                {catchUpMonths > 0
                  ? `${catchUpMonths} ${catchUpMonths === 1 ? "month" : "months"} of catch-up at the same monthly rate — no premium, no cap — then ongoing from this month.`
                  : "Anything before this month would be catch-up at the same monthly rate."}
              </span>
            </div>
          </div>

          <div data-fx="rise" data-dy="30" style={{ marginTop: 32, paddingTop: 28, borderTop: "1px solid #E4E4E7" }}>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: INK }}>Services needed</div>
            <div role="group" aria-label="Services needed" style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))", gap: 10 }}>
              {catalog.map((s) => {
                const on = services.has(s.id);
                return (
                  <button key={s.id} type="button" onClick={() => toggle(s.id)} className="a4k-svc" aria-pressed={on}>
                    <span className="a4k-check" aria-hidden="true">
                      {on ? <Check size={13} /> : null}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontFamily: "var(--a4x-display)", fontSize: 16, fontWeight: 600, letterSpacing: "-0.015em", color: INK }}>{s.name}</span>
                      <span style={{ display: "block", marginTop: 4, fontFamily: BODY, fontSize: 13, lineHeight: 1.45, color: "#71717A" }}>{s.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {independenceText ? (
              <div
                role="note"
                style={{
                  marginTop: 14,
                  padding: "14px 16px",
                  borderRadius: 16,
                  background: conflictNote ? INK : "rgba(79,85,241,.06)",
                  border: `1px solid ${conflictNote ? INK : "rgba(79,85,241,.22)"}`,
                }}
              >
                <span style={{ ...kicker, display: "block", color: conflictNote ? "#8B8FF7" : INDIGO }}>Independence</span>
                <span style={{ display: "block", marginTop: 5, fontFamily: BODY, fontSize: 13.5, lineHeight: 1.55, color: conflictNote ? "#E4E4E7" : "#3F3F46" }}>
                  {independenceText}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: live estimate + capture — the quote document */}
        <div className="a4k-sticky" style={{ minWidth: 0 }}>
          <Doc d={120}>
            <DocHead compact k="Your indicative estimate" title={company.trim() || "Your company"} />
            {quote ? (
              <>
                <div style={{ height: 18 }} />
                {quote.lines.map((l, i) => (
                  <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, padding: "14px 28px", borderTop: "1px solid #E4E4E7" }}>
                    <span style={{ display: "flex", gap: 12, minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: INDIGO }}>{pad2(i + 1)}</span>
                      <span style={{ fontFamily: BODY, fontSize: 14.5, lineHeight: 1.45, color: "#3F3F46" }}>{l.name}</span>
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em", color: INK, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{l.display}</span>
                  </div>
                ))}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "6px 16px", padding: "22px 28px 0", borderTop: "1px solid #E4E4E7" }}>
                  <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.015em", color: INK }}>First-year total</span>
                  <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: "clamp(34px,3.4vw,44px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.1, paddingBottom: ".04em", fontVariantNumeric: "tabular-nums", ...gradText }}>
                      {euro(quote.indicativeAnnualEur)}
                    </span>
                    {quote.hasOnRequestLines ? <span style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: "#71717A" }}>+ on request</span> : null}
                  </span>
                </div>
                <p style={{ margin: 0, padding: "10px 28px 0", fontFamily: BODY, fontSize: 12.5, lineHeight: 1.5, color: "#71717A" }}>
                  Indicative. All fees exclude VAT. {PRICING_GOV_NOTE} Your formal quotation follows by email — no obligation.
                </p>
              </>
            ) : (
              /* Nothing priced, and nothing to download. The way out sits
                 where the figures would have been, so the visitor is never
                 simply refused — they pick, and the quotation appears. */
              <div style={{ padding: "22px 28px 0" }}>
                <p style={{ margin: 0, fontFamily: BODY, fontSize: 14.5, lineHeight: 1.6, color: "#3F3F46" }}>
                  Nothing is priced yet. Tell us which of the two is ours and the itemised quotation appears here, in full, straight away.
                </p>
                <div style={{ marginTop: 16, padding: "18px 18px 16px", borderRadius: 20, background: "rgba(79,85,241,.06)", border: "1px solid rgba(79,85,241,.22)" }}>
                  <span style={{ display: "block", fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", color: INK }}>Which one is ours?</span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    <button type="button" onClick={() => dropService("audit")} style={choicePill}>
                      Keep the bookkeeping with us
                    </button>
                    <button type="button" onClick={() => dropService("accounts")} style={choicePill}>
                      Take the audit or review with us
                    </button>
                  </div>
                  <p style={{ margin: "12px 0 0", fontFamily: BODY, fontSize: 13, lineHeight: 1.55, color: "#3F3F46" }}>
                    Pick one and the quotation prices itself. Not sure which? Request information instead and we work it out with you.
                  </p>
                </div>
              </div>
            )}

            <div style={{ marginTop: 24, padding: "24px 28px 28px", borderTop: "1px solid #E4E4E7", background: "#FAFAFA" }}>
              {done ? (
                <div role="status" style={{ textAlign: "center" }}>
                  <span style={{ width: 48, height: 48, display: "inline-grid", placeItems: "center", borderRadius: 999, background: INDIGO, boxShadow: "0 16px 40px rgba(79,85,241,.35)" }}>
                    <Check size={22} width={3} />
                  </span>
                  <p style={{ margin: "14px 0 0", fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.35, color: INK }}>
                    {portalResult?.status === "quoted"
                      ? `Your quotation has downloaded — and quotation ${portalResult.reference} is on its way to ${email}.`
                      : "Your quotation has downloaded — and our team has it too."}
                  </p>
                  <p style={{ margin: "8px 0 0", fontFamily: BODY, fontSize: 14, lineHeight: 1.55, color: "#52525B" }}>
                    {portalResult?.status === "quoted"
                      ? "Open the email to see your quotation page — switch services on or off and accept online."
                      : "Prefer to talk it through? Request information and our team will follow up with next steps."}
                  </p>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 18 }}>
                    <PillLink href="/contact" variant="ink" size="md">
                      Request information
                    </PillLink>
                    <button type="button" className="a4-btn a4-btn-outline" style={{ height: 48, padding: "0 24px", fontSize: 16 }} onClick={() => download(done.pdfBase64, done.pdfName)}>
                      Download PDF again
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: 10 }}>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *" aria-label="Your name" autoComplete="name" className="a4k-input" />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email *" aria-label="Work email" autoComplete="email" type="email" className="a4k-input" />
                  </div>
                  {error ? (
                    <p role="alert" style={{ display: "flex", gap: 10, margin: "12px 0 0", fontFamily: BODY, fontSize: 13.5, lineHeight: 1.5, fontWeight: 600, color: INK }}>
                      <span className="a4-bullet" style={{ marginTop: 6 }} />
                      <span>{error}</span>
                    </p>
                  ) : null}
                  {/* Inert on a conflict: there is no priced quotation behind
                      it, and a PDF is the one artefact that outlives the page. */}
                  <button
                    type="button"
                    onClick={() => { if (!busy && !conflict) submit(); }}
                    aria-disabled={busy || conflict}
                    className="a4-btn a4-btn-ink"
                    style={{ marginTop: 12, width: "100%", opacity: busy || conflict ? 0.55 : 1, cursor: busy || conflict ? "default" : "pointer" }}
                  >
                    {busy ? "Preparing your quotation…" : "Download my quotation (PDF)"}
                  </button>
                  <p style={{ margin: "12px 0 0", textAlign: "center", fontFamily: BODY, fontSize: 12.5, lineHeight: 1.5, color: "#71717A" }}>
                    {conflict
                      ? "Pick which of the two is ours above and this unlocks."
                      : "Your formal quotation follows by email, ready to accept online."}
                  </p>
                </>
              )}
            </div>
          </Doc>
        </div>
      </div>
    </Band>
  );
}
