"use client";

import React, { useMemo, useState } from "react";
import { Button, Container, Icon, Reveal, SectionHead } from "@/components/a4-landing/Primitives";
import {
  buildQuote,
  euro,
  QUOTE_INDUSTRIES,
  QUOTE_SERVICE_CATALOG,
  REVENUE_BANDS,
  type QuoteServiceId,
  type RevenueBandId,
} from "@/lib/quotation";
import { nextMonth } from "@/lib/accounting-fee";
import { flagsForServiceSelection, independenceNotice } from "@/lib/independence";
import {
  MANAGED_ENTITY_OPTIONS,
  PRICING_GOV_NOTE,
  type ManagedEntity,
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
  const [industry, setIndustry] = useState<string>(QUOTE_INDUSTRIES[5]);
  const [revenueBand, setRevenueBand] = useState<RevenueBandId>("100k-500k");
  const [entity, setEntity] = useState<ManagedEntity>("company");
  // Earlier months that still need doing. This used to be `overdueYears`
  // because catch-up was capped per year; it is now priced per month at the
  // monthly rate, so months are the honest unit and the picker offers them.
  const [catchUpMonths, setCatchUpMonths] = useState(0);
  // Required. Suggested as next month, never assumed — a wrong start month
  // silently changes which months are catch-up.
  const [startMonth, setStartMonth] = useState<string>(() => nextMonth());
  const [services, setServices] = useState<Set<QuoteServiceId>>(() => new Set(["accounts", "vat"] as QuoteServiceId[]));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ pdfBase64: string; pdfName: string } | null>(null);

  const quote = useMemo(
    () =>
      buildQuote({
        company: company || "Your company",
        regNo,
        industry,
        revenueBand,
        services: [...services],
        entity,
        catchUpMonths,
        startMonth,
      }),
    [company, regNo, industry, revenueBand, services, entity, catchUpMonths, startMonth]
  );

  /**
   * IESBA routing. `accounts` here IS managed bookkeeping, so choosing it
   * rules A4 out as auditor and choosing `audit` rules us out of the books.
   * Mapped onto the same service ids the request form uses, so both surfaces
   * set the flag by the same rule.
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

  const toggle = (id: QuoteServiceId) =>
    setServices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else next.add(id);
      return next;
    });

  const submit = async () => {
    setError("");
    if (!company.trim()) return setError("Enter your company name.");
    if (!name.trim()) return setError("Enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email address.");
    if (!startMonth) return setError("Choose the month we should start from.");
    // Both sides of the independence rule at once. A person settles which one
    // A4 takes before any figure is put in writing.
    if (independence.route === "conflict") return setError(independenceText ?? "");
    setBusy(true);
    try {
      const res = await fetch("/api/quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, company, regNo, industry, revenueBand,
          services: [...services], entity, catchUpMonths, startMonth,
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
                <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Your company Ltd" style={field} />
              </div>
              <div>
                <span style={label}>MBR registration (optional)</span>
                <input value={regNo} onChange={(e) => setRegNo(e.target.value)} placeholder="C 12345" style={field} />
              </div>
              <div>
                <span style={label}>Industry</span>
                <select value={industry} onChange={(e) => setIndustry(e.target.value)} style={{ ...field, cursor: "pointer" }}>
                  {QUOTE_INDUSTRIES.map((i) => (
                    <option key={i}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <span style={label}>Annual revenue</span>
                <select value={revenueBand} onChange={(e) => setRevenueBand(e.target.value as RevenueBandId)} style={{ ...field, cursor: "pointer" }}>
                  {REVENUE_BANDS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span style={label}>Whose books *</span>
                <select value={entity} onChange={(e) => setEntity(e.target.value as ManagedEntity)} style={{ ...field, cursor: "pointer" }}>
                  {MANAGED_ENTITY_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label} — {o.sub}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span style={label}>Start from *</span>
                <input
                  type="month"
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                  style={{ ...field, cursor: "pointer" }}
                  aria-label="From which month should we start?"
                />
                <span style={{ display: "block", marginTop: 6, fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-mute)" }}>
                  The first month we keep the books. Anything before it is catch-up.
                </span>
              </div>
              <div>
                <span style={label}>Earlier months that still need doing</span>
                <select value={catchUpMonths} onChange={(e) => setCatchUpMonths(Number(e.target.value))} style={{ ...field, cursor: "pointer" }}>
                  {[0, 1, 2, 3, 6, 9, 12, 18, 24, 36].map((n) => (
                    <option key={n} value={n}>
                      {n === 0 ? "None — up to date" : `${n} ${n === 1 ? "month" : "months"}`}
                    </option>
                  ))}
                </select>
                <span style={{ display: "block", marginTop: 6, fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-mute)" }}>
                  Charged at the same monthly rate — no catch-up premium, no cap.
                </span>
              </div>
            </div>

            <div style={{ marginTop: 22 }}>
              <span style={label}>Services needed</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="max-[640px]:!grid-cols-1">
                {QUOTE_SERVICE_CATALOG.map((s) => {
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
                <Button variant="dark" size="lg" onClick={() => { if (!busy) submit(); }} style={{ width: "100%", marginTop: 12, justifyContent: "center", opacity: busy ? 0.7 : 1, pointerEvents: busy ? "none" : "auto" }}>
                  {busy ? "Preparing your quotation…" : "Download my quotation (PDF)"}
                  {!busy && <Icon name="arrow-right" size={16} color="#fff" />}
                </Button>
                <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, color: "var(--a4-mute)", marginTop: 10, textAlign: "center" }}>
                  We'll also send it to our team so a person confirms it within 24h.
                </p>
              </div>
            )}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
