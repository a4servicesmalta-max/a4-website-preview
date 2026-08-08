"use client";

import React, { useState } from "react";
import FormStatusModal from "@/components/common/FormStatusModal";
import { Button, Container, Icon, Reveal } from "@/components/a4-landing/Primitives";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { CONTACT_EMAIL, CONTACT_EMAIL_HREF, CONTACT_PHONES } from "@/lib/contact";
import { CALENDLY_BOOKING_URL } from "@/lib/external-links";
import { trackConversion } from "@/lib/analytics";

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

  const fieldBorder = (key: keyof typeof f) =>
    errors[key] ? "#ef4444" : "var(--a4-hairline-light)";

  const inpBase: React.CSSProperties = {
    width: "100%",
    background: "var(--a4-surface-soft)",
    borderRadius: "var(--a4-r-md)",
    padding: "13px 15px",
    color: "var(--a4-ink)",
    fontFamily: "var(--a4-font-body)",
    fontSize: 15,
    outline: "none",
    marginBottom: 6,
  };
  const lbl: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--a4-font-body)",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: ".04em",
    textTransform: "uppercase",
    color: "var(--a4-mute)",
    marginBottom: 7,
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
      <form onSubmit={handleSubmit}>
        <label style={lbl}>Full name</label>
        <input
          name="name"
          value={f.name}
          onChange={(e) => {
            setF({ ...f, name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: "" });
          }}
          style={{ ...inpBase, border: `1px solid ${fieldBorder("name")}` }}
          placeholder="Jane Borg"
        />
        {errors.name && <p className="a4-font-body text-[13px] text-red-500 mb-2">{errors.name}</p>}

        <label style={lbl}>Email address</label>
        <input
          type="email"
          name="email"
          value={f.email}
          onChange={(e) => {
            setF({ ...f, email: e.target.value });
            if (errors.email) setErrors({ ...errors, email: "" });
          }}
          style={{ ...inpBase, border: `1px solid ${fieldBorder("email")}` }}
          placeholder="jane@company.com"
        />
        {errors.email && <p className="a4-font-body text-[13px] text-red-500 mb-2">{errors.email}</p>}

        <label style={lbl}>
          Phone <span style={{ textTransform: "none", fontWeight: 400, letterSpacing: 0 }}>(optional)</span>
        </label>
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          value={f.phone}
          onChange={(e) => setF({ ...f, phone: e.target.value })}
          style={{ ...inpBase, border: `1px solid ${fieldBorder("phone")}` }}
          placeholder="+356 …"
        />

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

        <label style={{ ...lbl, marginTop: 8 }}>Message</label>
        <textarea
          name="message"
          value={f.message}
          onChange={(e) => {
            setF({ ...f, message: e.target.value });
            if (errors.message) setErrors({ ...errors, message: "" });
          }}
          style={{ ...inpBase, border: `1px solid ${fieldBorder("message")}`, minHeight: 130, resize: "vertical", marginBottom: 6 }}
          placeholder="Tell us a little about your business and what you need."
        />
        {errors.message && <p className="a4-font-body text-[13px] text-red-500 mb-2">{errors.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 h-12 rounded-[var(--a4-r-full)] bg-black text-white a4-font-body text-[16px] font-semibold inline-flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50"
        >
          {isSubmitting ? "Sending…" : "Send message"} <Icon name="arrow-right" size={16} color="#fff" />
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
      <PageHero eyebrow="Get in touch" title="Let's talk about your business" sub="Send us a message, call the team, or book a free 15-minute call. We usually reply within one business day." />

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(56px,8vw,96px) 0" }}>
        <Container>
          <div className="ct-grid grid gap-10 items-start" style={{ gridTemplateColumns: "1.1fr .9fr" }}>
            <Reveal style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", padding: "clamp(26px,3.4vw,40px)" }}>
              <h2 className="a4-font-display font-medium text-[var(--a4-ink)] mb-[22px]" style={{ fontSize: "clamp(22px,2.6vw,28px)", letterSpacing: "-.3px" }}>Send us a message</h2>
              <ContactForm />
            </Reveal>
            <Reveal delay={100}>
              <div className="flex flex-col gap-[14px]">
                {CONTACT_ITEMS.map(([ic, k, v, linkHref]) => (
                  <a key={k} href={linkHref || undefined} onClick={linkHref ? undefined : (e) => e.preventDefault()} className="flex items-center gap-[15px] bg-[var(--a4-surface-card)] border border-[var(--a4-hairline-light)] rounded-[var(--a4-r-lg)] py-5 px-[22px] no-underline">
                    <span className="w-[46px] h-[46px] rounded-[var(--a4-r-md)] bg-[var(--a4-surface-soft)] grid place-items-center shrink-0">
                      <Icon name={ic} size={21} color="var(--a4-primary)" stroke={1.75} />
                    </span>
                    <div>
                      <div className="a4-font-body text-[12px] font-semibold tracking-[.06em] uppercase text-[var(--a4-mute)]">{k}</div>
                      <div className="a4-font-body text-[16px] font-semibold text-[var(--a4-ink)] mt-[2px]">{v}</div>
                    </div>
                  </a>
                ))}
                <div className="bg-black rounded-[var(--a4-r-lg)] py-[26px] px-6 mt-1">
                  <div className="flex items-center gap-[11px]">
                    <Icon name="calendar" size={20} color="var(--a4-primary-bright)" />
                    <h3 className="a4-font-display font-medium text-[20px] text-white m-0">Book a free 15-minute call</h3>
                  </div>
                  <p className="a4-font-body text-[14.5px] leading-[1.55] text-[var(--a4-on-dark-mute)] mt-[10px] mb-[18px]">Prefer to talk it through? Grab a slot and we&apos;ll learn about your business — no obligation.</p>
                  <Button variant="primary" size="md" href={CALENDLY_BOOKING_URL} target="_blank" rel="noreferrer">
                    Book a call <Icon name="arrow-right" size={16} color="#000" />
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <ServicePortalBand serviceName="your enquiry" />
    </div>
  );
}
