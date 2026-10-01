"use client";

import React, { useState } from "react";
import FormStatusModal from "@/components/common/FormStatusModal";
import { QUOTE_SERVICE_OPTS, QUOTE_STEPS } from "@/data/a4QuoteSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import {
  BODY,
  Band,
  Check,
  CtaCard,
  Eyebrow,
  G,
  Head,
  INDIGO,
  PillLink,
  Pills,
  Statement,
  Timeline,
} from "@/app/[locale]/services/components/SiteKit";
import { QuotationBuilder } from "./QuotationBuilder";
import { trackConversion } from "@/lib/analytics";

/** Field label on the dark form card — the design's "Full name". */
const fieldLabel: React.CSSProperties = { display: "block", marginBottom: 10, fontFamily: "var(--a4x-display)", fontSize: 15, fontWeight: 600, color: "#E4E4E7" };
/** Validation message on dark: white and bold, as the design's failure note. */
const fieldError: React.CSSProperties = { display: "flex", gap: 10, marginTop: 8, fontFamily: BODY, fontSize: 13.5, fontWeight: 600, lineHeight: 1.45, color: "#FFFFFF" };

function ErrorNote({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <span id={id} role="alert" style={fieldError}>
      <span className="a4-bullet" style={{ marginTop: 6, background: "#8B8FF7" }} />
      <span>{children}</span>
    </span>
  );
}

function QuoteForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  // Spam honeypot — mirrors vacei.com's `company_website` field: an
  // off-screen, unlabeled input a human never sees or fills in. Left in
  // state (not a ref) purely so it round-trips through the same controlled-
  // input pattern as every other field here.
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [statusMessage, setStatusMessage] = useState("");

  const toggle = (s: string) => setSel(sel.includes(s) ? sel.filter((x) => x !== s) : [...sel, s]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Business name is required";
    if (!email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Please enter a valid email";
    if (sel.length === 0) next.services = "Select at least one service";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Honeypot tripped — a real visitor never sees or fills this field.
    // Pretend success without ever hitting the network; the API route also
    // rejects it server-side in case a bot posts to /api/quote directly.
    if (companyWebsite.trim()) {
      setSent(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject: "Website quote request",
          message: message || "Quote request from website",
          meta: { services: sel.join(", "), service: sel.join(", "), phone: phone.trim() || undefined },
          company_website: companyWebsite,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Something went wrong. Please try again.");
      }

      // Past the !res.ok gate: the lead is written. The honeypot branch above
      // fakes success without a network call and deliberately does not reach here.
      trackConversion("quote_form_submit");

      setSent(true);
      setStatusType("success");
      setStatusMessage("Thank you — your tailored quote is on its way. We'll respond within 24 hours.");
      setStatusOpen(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setStatusType("error");
      setStatusMessage(msg);
      setStatusOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <CtaCard d={0} style={{ textAlign: "center" }}>
        <span style={{ width: 64, height: 64, display: "inline-grid", placeItems: "center", borderRadius: 999, background: INDIGO, boxShadow: "0 24px 60px rgba(79,85,241,.45)" }}>
          <Check size={30} width={3} />
        </span>
        <h3 style={{ margin: "24px 0 0", fontSize: "clamp(26px,2.8vw,34px)", fontWeight: 600, letterSpacing: "-0.03em", color: "#FFFFFF" }}>Request received.</h3>
        <p role="status" style={{ margin: "12px auto 0", maxWidth: 420, fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: "#D4D4D8", textWrap: "pretty" }}>
          Thank you — your tailored quote is on its way. We&apos;ll respond within 24 hours, with no obligation on your side.
        </p>
        <PillLink href="/services" variant="light" style={{ marginTop: 28 }}>
          Browse services
        </PillLink>
      </CtaCard>
    );
  }

  return (
    <>
      <FormStatusModal
        open={statusOpen && statusType === "error"}
        type={statusType}
        title="Something went wrong"
        message={statusMessage}
        onClose={() => setStatusOpen(false)}
      />
      <CtaCard d={200}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 290px), 1fr))", gap: 18 }}>
            <div>
              <label htmlFor="qf-name" style={fieldLabel}>
                Business name
              </label>
              <input
                id="qf-name"
                className="a4-input-dark"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                placeholder="Your company or your name"
                autoComplete="organization"
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? "qf-name-err" : undefined}
              />
              {errors.name && <ErrorNote id="qf-name-err">{errors.name}</ErrorNote>}
            </div>
            <div>
              <label htmlFor="qf-email" style={fieldLabel}>
                Email address
              </label>
              <input
                id="qf-email"
                className="a4-input-dark"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                placeholder="you@company.com"
                autoComplete="email"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "qf-email-err" : undefined}
              />
              {errors.email && <ErrorNote id="qf-email-err">{errors.email}</ErrorNote>}
            </div>
          </div>
          <div>
            <label htmlFor="qf-phone" style={fieldLabel}>
              Phone <span style={{ fontWeight: 500, color: "#A1A1AA" }}>optional</span>
            </label>
            <input id="qf-phone" className="a4-input-dark" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+356 …" />
          </div>
          {/* Honeypot — real visitors never see this field. Bots that
              auto-fill every input on the form trip it; a filled value is
              rejected both here (no network call) and server-side in
              /api/quote. Matches vacei.com's `company_website` field exactly. */}
          <input
            type="text"
            name="company_website"
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
          />
          <div>
            <span id="qf-services" style={fieldLabel}>
              Services needed
            </span>
            <div role="group" aria-labelledby="qf-services" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {QUOTE_SERVICE_OPTS.map((s) => {
                const on = sel.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    className="a4k-opt"
                    aria-pressed={on}
                    onClick={() => {
                      toggle(s);
                      if (errors.services) setErrors({ ...errors, services: "" });
                    }}
                    style={{ minHeight: 44 }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {errors.services && <ErrorNote id="qf-services-err">{errors.services}</ErrorNote>}
          </div>
          <div>
            <label htmlFor="qf-message" style={fieldLabel}>
              Message
            </label>
            <textarea
              id="qf-message"
              className="a4-input-dark"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us briefly about your business — entity type, activity, and what you need."
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="a4-btn a4-btn-light"
              style={{ width: "100%", height: 64, fontSize: 19, opacity: isSubmitting ? 0.55 : 1 }}
            >
              {isSubmitting ? "Sending…" : "Request my quote"}
            </button>
            <p style={{ margin: "16px 0 0", textAlign: "center", fontFamily: BODY, fontSize: 14, lineHeight: 1.5, color: "#A1A1AA" }}>
              Response within 24 hours — no obligation.
            </p>
          </div>
        </form>
      </CtaCard>
    </>
  );
}

/**
 * /quote — hero, 01 the instant quotation builder (the design's configurator
 * and quote document), 02 the request form as the design's dark accept card,
 * 03 how quotes work as the timeline, then the portal tour.
 */
export function QuoteContent() {
  return (
    <div className="a4-site-page" style={{ background: "#09090B" }}>
      <PageHero
        eyebrow="Get instant quote"
        title="A tailored quote, with no obligation"
        sub="Build an instant indicative quote below — or tell us what you need and we'll come back within 24 hours with a clear, written quote."
      >
        <Pills>
          <PillLink href="#instant-quote" variant="light">
            Build your quote
          </PillLink>
          <PillLink href="#request" variant="ghost">
            Request my quote
          </PillLink>
        </Pills>
      </PageHero>

      <QuotationBuilder />

      {/* 02 — THE REQUEST FORM, as the design's dark accept card */}
      <Band surface="dark" id="request" sec="request" glow={{ left: "-10%", top: "-20%", strength: 0.26 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))", gap: "56px 72px", alignItems: "center" }}>
          <div>
            <Eyebrow n="02" dark style={{ marginBottom: 22 }}>
              Request a tailored quote
            </Eyebrow>
            <Statement dark size="cta" per={45} typed="Tell us what" words={[{ t: "you need.", g: true }]} label="Tell us what you need." />
            <p data-fx="rise" data-d="700" style={{ margin: "28px 0 0", maxWidth: 520, fontSize: "clamp(18px,1.8vw,24px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.4, color: "#A1A1AA", textWrap: "pretty" }}>
              We&apos;ll come back within 24 hours with a clear, written quote.
            </p>
          </div>
          <QuoteForm />
        </div>
      </Band>

      {/* 03 — HOW QUOTES WORK */}
      <Band surface="light" sec="how">
        <Head
          n="03"
          eyebrow="How quotes work"
          size="lg"
          title={
            <>
              From first chat to confirmed <G>quote</G>
            </>
          }
        />
        <Timeline steps={QUOTE_STEPS.map((s) => ({ key: s.n, t: s.t, s: s.s }))} />
      </Band>

      <ServicePortalBand serviceName="your quote" />
    </div>
  );
}
