"use client";

import React, { useMemo, useState } from "react";
import { Button, Container, Icon, Reveal, SectionHead } from "@/components/a4-landing/Primitives";
import {
  buildQuote,
  euro,
  QUOTE_MAX_BANKS,
  QUOTE_SERVICE_CATALOG,
  type QuoteServiceId,
} from "@/lib/quotation";
import { catchUpMonthsFrom, ongoingStartMonth } from "@/lib/accounting-fee";
import { flagsForServiceSelection, independenceNotice } from "@/lib/independence";
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

const panel: React.CSSProperties = {
  background: "var(--a4-surface-card)",
  border: "1px solid var(--a4-hairline-light)",
  borderRadius: "var(--a4-r-lg)",
};
const label: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--a4-font-body)",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: ".1em",
  color: "var(--a4-mute)",
  marginBottom: 8,
};
/** The two "which one is ours?" pills — the same affordance the homepage uses. */
const choicePill: React.CSSProperties = {
  height: 30,
  padding: "0 13px",
  borderRadius: "var(--a4-r-full)",
  cursor: "pointer",
  border: "1px solid var(--a4-primary)",
  background: "var(--a4-primary)",
  color: "#fff",
  fontFamily: "var(--a4-font-body)",
  fontSize: 11.5,
  fontWeight: 600,
};
const field: React.CSSProperties = {
  width: "100%",
  background: "var(--a4-surface-card)",
  border: "1px solid var(--a4-hairline-light)",
  borderRadius: "var(--a4-r-md)",
  padding: "12px 14px",
  color: "var(--a4-ink)",
  fontFamily: "var(--a4-font-body)",
  fontSize: 14,
  outline: "none",
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

      // NOTE: this builder deliberately does NOT raise an instant portal
      // quotation. It prices off a REVENUE band and its own baselines, which
      // is not the `A4ServiceItem` basket the backend reprices — submitting it
      // would fail the €1 / 1% tolerance check every time, producing a
      // permanent 202 and a lead with a quote attached that nobody sent. The
      // PDF plus the ops-portal record IS the deliverable here; the instant
      // quotation lives on /pricing and the homepage calculator, which build
      // real baskets.
      //
      // To make this builder instant, it has to collect a TRANSACTION band and
      // drop the on-request lines, so its displayed total is the sum of
      // priceable A4Items — see /pricing, which does exactly that.
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not generate the quotation.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="instant-quote" style={{ background: "var(--a4-surface-soft)", padding: "clamp(64px,8vw,96px) 0" }}>
      <Container>
        <Reveal>
          <SectionHead
            align="center"
            eyebrow="Instant quotation"
            title={<>Build your indicative quote in&nbsp;60&nbsp;seconds</>}
            sub="Pick your services and get an instant, transparent estimate — downloaded as a written quotation, confirmed by our team within 24 hours."
            maxWidth={640}
          />
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr .9fr", gap: 20, marginTop: 44 }} className="max-[900px]:!grid-cols-1">
          {/* Left: inputs */}
          <Reveal delay={60} style={{ ...panel, padding: "26px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="max-[640px]:!grid-cols-1">
              <div>
                <span style={label}>Company name *</span>
                <input value={company} onChange={(e) => priced(setCompany)(e.target.value)} placeholder="Your company Ltd" style={field} />
              </div>
              <div>
                <span style={label}>MBR registration (optional)</span>
                <input value={regNo} onChange={(e) => priced(setRegNo)(e.target.value)} placeholder="C 12345" style={field} />
              </div>
              <div>
                <span style={label}>What the company does *</span>
                <select value={sector} onChange={(e) => priced(setSector)(e.target.value)} style={{ ...field, cursor: "pointer" }}>
                  {/* Unselected by default — see `expenses` below. */}
                  <option value="">Select the closest match…</option>
                  {SECTORS.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.label}
                    </option>
                  ))}
                </select>
                {!sector && (
                  <span style={{ display: "block", marginTop: 6, fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "#8A6100" }}>
                    Sets the risk tier on VAT and the audit — the same list every A4 calculator uses.
                  </span>
                )}
              </div>
              <div>
                <span style={label}>Transactions a month *</span>
                <select value={txn} onChange={(e) => priced(setTxn)(e.target.value as TxnBand | "")} style={{ ...field, cursor: "pointer" }}>
                  <option value="">Select a volume…</option>
                  {TXN_BANDS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label} — {b.hint}
                    </option>
                  ))}
                </select>
                {!txn && (
                  <span style={{ display: "block", marginTop: 6, fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "#8A6100" }}>
                    The count, not the amount. Prices VAT and the audit, and adds to the bookkeeping fee at busy volumes.
                  </span>
                )}
              </div>
              <div>
                <span style={label}>Bank accounts</span>
                <input
                  type="number"
                  min={1}
                  max={QUOTE_MAX_BANKS}
                  step={1}
                  value={banks}
                  onChange={(e) => priced(setBanks)(Math.min(QUOTE_MAX_BANKS, Math.max(1, Math.floor(Number(e.target.value) || 1))))}
                  style={field}
                  aria-label="How many bank accounts do you have?"
                />
                <span style={{ display: "block", marginTop: 6, fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-mute)" }}>
                  Every account is reconciled separately. The first is included in the bookkeeping fee; each extra account is €{BANK_ACCOUNT.baseMonthly} a month plus {Math.round(BANK_ACCOUNT.pctOfBookkeeping * 100)}% of the bookkeeping fee.
                </span>
              </div>
              <div>
                <span style={label}>Whose books *</span>
                <select value={entity} onChange={(e) => setEntityAndSync(e.target.value as ManagedEntity)} style={{ ...field, cursor: "pointer" }}>
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
                <span style={label}>Monthly expenses *</span>
                <select
                  value={expenses}
                  onChange={(e) => priced(setExpenses)(e.target.value as ExpenseBand | "")}
                  style={{ ...field, cursor: "pointer" }}
                >
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
                {!expenses && (
                  <span style={{ display: "block", marginTop: 6, fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "#8A6100" }}>
                    Needed before we can price the bookkeeping — we do not assume a band.
                  </span>
                )}
              </div>
              {/* ONE field, not two. The "earlier months" select that used to
                  sit beside this asked for the same fact a second time: a start
                  month in the past IS the count of months still to do, so the
                  count is derived from it and read back below. */}
              <div>
                <span style={label}>Start from *</span>
                <input
                  type="month"
                  value={startMonth}
                  onChange={(e) => {
                    const v = e.target.value;
                    priced(setStartMonth)(v);
                    priced(setCatchUpMonths)(catchUpMonthsFrom(v));
                  }}
                  style={{ ...field, cursor: "pointer" }}
                  aria-label="From which month do you need us?"
                />
                <span style={{ display: "block", marginTop: 6, fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-mute)" }}>
                  The earliest month that still needs doing.{" "}
                  {catchUpMonths > 0
                    ? `${catchUpMonths} ${catchUpMonths === 1 ? "month" : "months"} of catch-up at the same monthly rate — no premium, no cap — then ongoing from this month.`
                    : "Anything before this month would be catch-up at the same monthly rate."}
                </span>
              </div>
            </div>

            <div style={{ marginTop: 22 }}>
              <span style={label}>Services needed</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="max-[640px]:!grid-cols-1">
                {catalog.map((s) => {
                  const on = services.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggle(s.id)}
                      style={{
                        textAlign: "left",
                        padding: "13px 14px",
                        borderRadius: "var(--a4-r-md)",
                        border: `1px solid ${on ? "var(--a4-primary)" : "var(--a4-hairline-light)"}`,
                        background: on ? "rgba(73,79,223,.06)" : "var(--a4-surface-card)",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, color: "var(--a4-ink)" }}>
                        <span
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            border: `1.5px solid ${on ? "var(--a4-primary)" : "var(--a4-stone)"}`,
                            background: on ? "var(--a4-primary)" : "transparent",
                            display: "inline-grid",
                            placeItems: "center",
                          }}
                        >
                          {on && <Icon name="check" size={11} color="#fff" stroke={3} />}
                        </span>
                        {s.name}
                      </span>
                      <span style={{ display: "block", marginTop: 5, fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-mute)" }}>{s.hint}</span>
                    </button>
                  );
                })}
              </div>
              {independenceText ? (
                <div
                  role="note"
                  style={{
                    marginTop: 12,
                    padding: "12px 14px",
                    borderRadius: "var(--a4-r-md)",
                    background: independence.route === "conflict" ? "#FFF7E9" : "rgba(73,79,223,.06)",
                    border: `1px solid ${independence.route === "conflict" ? "#E8D2A4" : "rgba(73,79,223,.25)"}`,
                  }}
                >
                  <span style={{ display: "block", fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: independence.route === "conflict" ? "#8A6100" : "var(--a4-primary-deep)" }}>
                    Independence
                  </span>
                  <span style={{ display: "block", marginTop: 4, fontFamily: "var(--a4-font-body)", fontSize: 12.5, lineHeight: 1.55, color: "var(--a4-body)" }}>
                    {independenceText}
                  </span>
                </div>
              ) : null}
            </div>
          </Reveal>

          {/* Right: live estimate + capture */}
          <Reveal delay={120} style={{ ...panel, padding: "26px 24px", display: "flex", flexDirection: "column" }}>
            <span style={label}>Your indicative estimate</span>
            <div style={{ flex: 1 }}>
              {quote ? (
                <>
                  {quote.lines.map((l) => (
                    <div key={l.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--a4-hairline-light)" }}>
                      <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, color: "var(--a4-ink)" }}>{l.name}</span>
                      <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 700, color: "var(--a4-ink)", whiteSpace: "nowrap" }}>{l.display}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 16 }}>
                    <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--a4-mute)" }}>
                      First-year total
                    </span>
                    <span style={{ fontFamily: "var(--a4-font-display)", fontSize: 30, fontWeight: 600, color: "var(--a4-primary)", letterSpacing: "-.5px" }}>
                      {euro(quote.indicativeAnnualEur)}
                      {quote.hasOnRequestLines ? <span style={{ fontSize: 13, color: "var(--a4-mute)" }}> + on request</span> : null}
                    </span>
                  </div>
                  <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-mute)", marginTop: 8, lineHeight: 1.5 }}>
                    Indicative. All fees exclude VAT. {PRICING_GOV_NOTE} Confirmed in writing within 24 hours — no obligation.
                  </p>
                </>
              ) : (
                /* Nothing priced, and nothing to download. The way out sits
                   where the figures would have been, so the visitor is never
                   simply refused — they pick, and the quotation appears. */
                <>
                  <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, lineHeight: 1.6, color: "var(--a4-body)", margin: 0 }}>
                    Nothing is priced yet. Tell us which of the two is ours and the itemised quotation appears here, in full, straight away.
                  </p>
                  <div style={{ marginTop: 14, padding: "13px 14px", borderRadius: "var(--a4-r-md)", background: "rgba(73,79,223,.06)", border: "1px solid rgba(73,79,223,.25)" }}>
                    <span style={{ display: "block", fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 700, color: "var(--a4-primary-deep)" }}>Which one is ours?</span>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                      <button type="button" onClick={() => dropService("audit")} style={choicePill}>Keep the bookkeeping with us</button>
                      <button type="button" onClick={() => dropService("accounts")} style={choicePill}>Take the audit or review with us</button>
                    </div>
                    <p style={{ margin: "10px 0 0", fontFamily: "var(--a4-font-body)", fontSize: 11.5, lineHeight: 1.55, color: "var(--a4-primary-deep)" }}>
                      Pick one and the quotation prices itself. Not sure which? Request information instead and we work it out with you.
                    </p>
                  </div>
                </>
              )}
            </div>

            {done ? (
              <div style={{ marginTop: 18, borderTop: "1px solid var(--a4-hairline-light)", paddingTop: 18, textAlign: "center" }}>
                <span style={{ display: "inline-grid", placeItems: "center", width: 44, height: 44, borderRadius: 999, background: "var(--a4-surface-soft)" }}>
                  <Icon name="check" size={22} color="var(--a4-accent-teal)" stroke={2.4} />
                </span>
                <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, color: "var(--a4-ink)", margin: "12px 0 0", fontWeight: 600 }}>
                  Your quotation has downloaded — and our team has it too.
                </p>
                <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "var(--a4-mute)", margin: "6px 0 0" }}>
                  Prefer to talk it through? Request information and our team will follow up with next steps.
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 14 }}>
                  <Button variant="dark" size="md" href="/contact">
                    Request information <Icon name="arrow-right" size={15} color="#fff" />
                  </Button>
                  <Button variant="outline-light" size="md" onClick={() => download(done.pdfBase64, done.pdfName)}>
                    Download PDF again
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 18, borderTop: "1px solid var(--a4-hairline-light)", paddingTop: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="max-[640px]:!grid-cols-1">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name *" style={field} />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email *" type="email" style={field} />
                </div>
                {error ? (
                  <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--accent-danger, #d33)", margin: "10px 0 0" }}>{error}</p>
                ) : null}
                {/* Inert on a conflict: there is no priced quotation behind
                    it, and a PDF is the one artefact that outlives the page. */}
                <Button variant="dark" size="lg" onClick={() => { if (!busy && !conflict) submit(); }} style={{ width: "100%", marginTop: 12, justifyContent: "center", opacity: busy || conflict ? 0.55 : 1, pointerEvents: busy || conflict ? "none" : "auto" }}>
                  {busy ? "Preparing your quotation…" : "Download my quotation (PDF)"}
                  {!busy && <Icon name="arrow-right" size={16} color="#fff" />}
                </Button>
                <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, color: "var(--a4-mute)", marginTop: 10, textAlign: "center" }}>
                  {conflict
                    ? "Pick which of the two is ours above and this unlocks."
                    : "We'll also send it to our team so a person confirms it within 24h."}
                </p>
              </div>
            )}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
