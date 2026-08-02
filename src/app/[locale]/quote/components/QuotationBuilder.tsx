"use client";

import React, { useMemo, useState } from "react";
import { Button, Container, Icon, Reveal, SectionHead } from "@/components/a4-landing/Primitives";
import {
  buildQuote,
  euro,
  SECTORS,
  QUOTE_SERVICE_CATALOG,
  QUOTE_TXN_BANDS,
  type QuoteServiceId,
  type RevenueBandId,
} from "@/lib/quotation";
import type { TxnBand } from "@/data/a4QuotePack";
import { PRICING_GOV_NOTE } from "@/data/a4QuotePack";

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
  const [sector, setSector] = useState<string>("shop");
  const [txnBand, setTxnBand] = useState<TxnBand>("21-60");
  const [overdueYears, setOverdueYears] = useState(0);
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
        sector,
        txnBand,
        services: [...services],
        overdueYears,
      }),
    [company, regNo, sector, txnBand, services, overdueYears]
  );

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
    setBusy(true);
    try {
      const res = await fetch("/api/quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, regNo, sector, txnBand, services: [...services], overdueYears }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Something went wrong.");
      setDone({ pdfBase64: data.pdfBase64, pdfName: data.pdfName });
      download(data.pdfBase64, data.pdfName);

      // NOTE — deliberately NOT submitted as an instant portal quotation.
      //
      // This builder prices off a REVENUE band (and offers payroll "on
      // request"), while the backend reprices off TRANSACTION bands from the
      // fee schedule. The two disagree for the same company, so a submission
      // here would always fail the server's ±€1/1% totals check and land as
      // 202 RECEIVED — a quote that is never emailed, which is worse than not
      // promising one. /api/quotation above already captures the lead and
      // sends the team the PDF; a person follows up within 24 hours.
      //
      // To make this instant, the builder has to collect a transaction band and
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
                <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Your company Ltd" style={field} />
              </div>
              <div>
                <span style={label}>MBR registration (optional)</span>
                <input value={regNo} onChange={(e) => setRegNo(e.target.value)} placeholder="C 12345" style={field} />
              </div>
              <div>
                <span style={label}>What the company does</span>
                <select value={sector} onChange={(e) => setSector(e.target.value)} style={{ ...field, cursor: "pointer" }}>
                  {SECTORS.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span style={label}>Transactions a month</span>
                <select value={txnBand} onChange={(e) => setTxnBand(e.target.value as TxnBand)} style={{ ...field, cursor: "pointer" }}>
                  {QUOTE_TXN_BANDS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span style={label}>Years of overdue accounts</span>
                <select value={overdueYears} onChange={(e) => setOverdueYears(Number(e.target.value))} style={{ ...field, cursor: "pointer" }}>
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n === 0 ? "Up to date" : `${n} ${n === 1 ? "year" : "years"}`}
                    </option>
                  ))}
                </select>
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
