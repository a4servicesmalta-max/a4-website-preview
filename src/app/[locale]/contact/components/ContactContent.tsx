"use client";

import React, { useState } from "react";
import FormStatusModal from "@/components/common/FormStatusModal";
import { Button, Icon } from "@/components/a4-landing/Primitives";
import { A4Mark, LIGHT_GLOW } from "@/components/fx/primitives";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { CONTACT_EMAIL, CONTACT_EMAIL_HREF, CONTACT_PHONES } from "@/lib/contact";
import { BOOK_A_CALL_PATH } from "@/lib/external-links";
import { trackConversion } from "@/lib/analytics";

const SANS = "var(--a4x-display)";
const BODY = "var(--a4x-body)";
const INDIGO = "#4F55F1";
const PERI = "#8B8FF7";
const INK = "#09090B";

const kicker: React.CSSProperties = { fontFamily: BODY, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#71717A" };

function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [statusMessage, setStatusMessage] = useState("");
  // Spam honeypot — mirrors vacei.com's `company_website` field: an
  // off-screen, unlabeled input a human never sees or fills in. Left in
  // state (not a ref) purely so it round-trips through the same controlled-
  // input pattern as every other field here.
  const [companyWebsite, setCompanyWebsite] = useState("");

  const validate = () => {
    const next: Record<string, string> = {};
    if (!f.name.trim()) next.name = "Name is required";
    if (!f.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) next.email = "Please enter a valid email";
    if (!f.message.trim()) next.message = "Message is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Honeypot tripped — a real visitor never sees or fills this field.
    // Pretend success without ever hitting the network; the API route also
    // rejects it server-side in case a bot posts to /api/contact directly.
    if (companyWebsite.trim()) {
      setF({ name: "", email: "", phone: "", message: "" });
      setStatusType("success");
      setStatusMessage("Thanks — we'll reply within one business day.");
      setStatusOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.name,
          email: f.email,
          phone: f.phone.trim() || undefined,
          message: f.message,
          subject: "Website contact form",
          context: "Contact page form",
          company_website: companyWebsite,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Something went wrong. Please try again.");
      }

      // Past the !res.ok gate: the lead is written. Only now is it a conversion
      // — the route answers 502 when the write fails, and that path throws above.
      trackConversion("contact_form_submit");

      setF({ name: "", email: "", phone: "", message: "" });
      setStatusType("success");
      setStatusMessage("Thanks — we'll reply within one business day.");
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

  return (
    <>
      <FormStatusModal
        open={statusOpen}
        type={statusType}
        title={statusType === "success" ? "Message sent" : "Something went wrong"}
        message={statusMessage}
        onClose={() => setStatusOpen(false)}
      />
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }}>
        <div>
          <label htmlFor="ct-name" className="cp-label">
            Full name
          </label>
          <input
            id="ct-name"
            name="name"
            autoComplete="name"
            className="cp-input"
            value={f.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "ct-name-err" : undefined}
            onChange={(e) => {
              setF({ ...f, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: "" });
            }}
            placeholder="Jane Borg"
          />
          {errors.name && (
            <p id="ct-name-err" className="cp-error">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="ct-email" className="cp-label">
            Email address
          </label>
          <input
            id="ct-email"
            type="email"
            name="email"
            autoComplete="email"
            className="cp-input"
            value={f.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "ct-email-err" : undefined}
            onChange={(e) => {
              setF({ ...f, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: "" });
            }}
            placeholder="jane@company.com"
          />
          {errors.email && (
            <p id="ct-email-err" className="cp-error">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="ct-phone" className="cp-label">
            Phone <span style={{ fontWeight: 500, color: "#71717A" }}>(optional)</span>
          </label>
          <input
            id="ct-phone"
            type="tel"
            name="phone"
            autoComplete="tel"
            className="cp-input"
            value={f.phone}
            onChange={(e) => setF({ ...f, phone: e.target.value })}
            placeholder="+356 …"
          />
        </div>

        {/* Honeypot — real visitors never see this field. Bots that
            auto-fill every input on the form trip it; a filled value is
            rejected both here (no network call) and server-side in
            /api/contact. Matches vacei.com's `company_website` field exactly. */}
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
          <label htmlFor="ct-message" className="cp-label">
            Message
          </label>
          <textarea
            id="ct-message"
            name="message"
            className="cp-input"
            value={f.message}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "ct-message-err" : undefined}
            onChange={(e) => {
              setF({ ...f, message: e.target.value });
              if (errors.message) setErrors({ ...errors, message: "" });
            }}
            placeholder="Tell us a little about your business and what you need."
          />
          {errors.message && (
            <p id="ct-message-err" className="cp-error">
              {errors.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="a4-btn a4-btn-ink"
          style={{ width: "100%", height: 64, marginTop: 4, fontSize: 19, opacity: isSubmitting ? 0.55 : 1 }}
        >
          {isSubmitting ? "Sending…" : "Send message"} <Icon name="arrow-right" size={18} color="#FFFFFF" />
        </button>
      </form>
    </>
  );
}

const CONTACT_ITEMS = [
  ["mail", "Email", CONTACT_EMAIL, CONTACT_EMAIL_HREF],
  ...CONTACT_PHONES.map((phone) => ["phone", phone.label, phone.display, phone.href] as const),
  ["map-pin", "Office", "A4, Triq San Giljan, San Gwann, Malta", null],
] as const;

export function ContactContent() {
  return (
    <div className="a4-site-page">
      <PageHero eyebrow="Get in touch" title="Let's talk about your business" sub="Send us a message, call the team, or book a free 30-minute call. We usually reply within one business day." />

      <section style={{ position: "relative", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", background: LIGHT_GLOW, color: INK }}>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
            gap: "48px 56px",
            alignItems: "start",
          }}
        >
          {/* The form as the design's document panel */}
          <div
            data-fx="rise"
            data-dy="80"
            style={{ position: "relative", background: "#FFFFFF", border: "1px solid #E4E4E7", borderRadius: 28, boxShadow: "0 50px 120px rgba(9,9,11,.12)", overflow: "hidden" }}
          >
            <div style={{ display: "flex", alignItems: "center", padding: "clamp(24px,3.4vw,40px) clamp(24px,3.4vw,40px) 0" }}>
              <A4Mark size={32} color={INK} />
              <span style={{ width: 1.5, height: 26, margin: "0 12px", background: INK, opacity: 0.35 }} />
              <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 500, letterSpacing: "-0.02em" }}>A4 Services</span>
            </div>
            <div style={{ padding: "28px clamp(24px,3.4vw,40px) clamp(24px,3.4vw,40px)" }}>
              <h2 style={{ margin: "0 0 26px", fontFamily: SANS, fontSize: "clamp(30px,3vw,40px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.05 }}>Send us a message</h2>
              <ContactForm />
            </div>
          </div>

          {/* Direct lines as numbered rows, then the call card */}
          <div>
            <div data-fx="rise" data-d="100" style={{ display: "flex", flexDirection: "column", borderBottom: "1px solid #E4E4E7" }}>
              {CONTACT_ITEMS.map(([ic, k, v, linkHref]) => {
                const inner = (
                  <>
                    <span style={{ width: 48, height: 48, flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", border: "1px solid #E4E4E7", background: "#FFFFFF" }} aria-hidden="true">
                      <Icon name={ic} size={19} color={INDIGO} />
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ ...kicker, display: "block" }}>{k}</span>
                      <span style={{ display: "block", marginTop: 4, fontFamily: SANS, fontSize: "clamp(19px,1.7vw,23px)", fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.25, color: INK, overflowWrap: "anywhere" }}>{v}</span>
                    </span>
                    {linkHref ? (
                      <span aria-hidden="true" className="cp-arrow" style={{ marginLeft: "auto", flexShrink: 0 }}>
                        <Icon name="arrow-up-right" size={18} color="#A1A1AA" />
                      </span>
                    ) : null}
                  </>
                );
                const rowStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 16, padding: "20px 0", borderTop: "1px solid #E4E4E7", textDecoration: "none", color: INK };
                return linkHref ? (
                  <a key={k} href={linkHref} className="cp-focus" style={rowStyle}>
                    {inner}
                  </a>
                ) : (
                  <div key={k} style={rowStyle}>
                    {inner}
                  </div>
                );
              })}
            </div>

            <div data-fx="rise" data-d="200" className="cp-card cp-dark cp-static" style={{ marginTop: 32, padding: "clamp(26px,3vw,36px)" }}>
              <span aria-hidden="true" style={{ width: 48, height: 48, borderRadius: "50%", display: "grid", placeItems: "center", border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.04)" }}>
                <Icon name="calendar" size={20} color={PERI} />
              </span>
              <h3 style={{ margin: "22px 0 0", fontFamily: SANS, fontSize: "clamp(28px,2.6vw,36px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.08 }}>Book a free 30-minute call</h3>
              <p style={{ margin: "12px 0 24px", fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: "#A1A1AA" }}>
                Prefer to talk it through? Grab a slot and we&apos;ll learn about your business — no obligation.
              </p>
              <Button variant="primary" size="lg" href={BOOK_A_CALL_PATH}>
                Book a call <Icon name="arrow-right" size={18} color={INK} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ServicePortalBand serviceName="your enquiry" />
    </div>
  );
}
