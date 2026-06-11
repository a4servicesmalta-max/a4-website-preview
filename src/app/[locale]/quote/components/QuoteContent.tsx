"use client";

import React, { useState } from "react";
import FormStatusModal from "@/components/common/FormStatusModal";
import { Button, Container, Icon, Reveal, SectionHead } from "@/components/a4-landing/Primitives";
import { QUOTE_SERVICE_OPTS, QUOTE_STEPS } from "@/data/a4QuoteSiteData";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";

function QuoteForm() {
  const href = useLocalizedHref();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sel, setSel] = useState<string[]>([]);
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
          meta: { services: sel.join(", "), service: sel.join(", ") },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Something went wrong. Please try again.");
      }

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
      <div
        className="text-center bg-[var(--a4-surface-card)] border border-[var(--a4-hairline-light)] rounded-[var(--a4-r-lg)]"
        style={{ padding: "clamp(36px,5vw,56px)" }}
      >
        <span className="w-16 h-16 rounded-full bg-[var(--a4-surface-soft)] inline-grid place-items-center">
          <Icon name="check" size={30} color="var(--a4-accent-teal)" stroke={2.2} />
        </span>
        <h3 className="a4-font-display font-medium text-[var(--a4-ink)] mt-[22px] m-0" style={{ fontSize: "clamp(22px,2.8vw,30px)", letterSpacing: "-.3px" }}>
          Request received.
        </h3>
        <p className="a4-font-body text-[var(--a4-mute)] mt-3 mx-auto max-w-[420px]" style={{ fontSize: 16, lineHeight: 1.6, textWrap: "pretty" }}>
          Thank you — your tailored quote is on its way. We&apos;ll respond within 24 hours, with no obligation on your side.
        </p>
        <div className="mt-[26px]">
          <Button variant="dark" size="md" href={href("/services")}>
            Browse services <Icon name="arrow-right" size={16} color="#fff" />
          </Button>
        </div>
      </div>
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
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-[18px] bg-[var(--a4-surface-card)] border border-[var(--a4-hairline-light)] rounded-[var(--a4-r-lg)]"
        style={{ padding: "clamp(26px,3.4vw,40px)" }}
      >
        <div className="q-grid grid gap-[18px]" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <label className="flex flex-col gap-2">
            <span className="a4-font-body text-[13.5px] font-semibold text-[var(--a4-charcoal)]">Business name</span>
            <input
              className="q-input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              placeholder="Your company or your name"
            />
            {errors.name && <span className="a4-font-body text-[13px] text-red-500">{errors.name}</span>}
          </label>
          <label className="flex flex-col gap-2">
            <span className="a4-font-body text-[13.5px] font-semibold text-[var(--a4-charcoal)]">Email address</span>
            <input
              className="q-input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              placeholder="you@company.com"
            />
            {errors.email && <span className="a4-font-body text-[13px] text-red-500">{errors.email}</span>}
          </label>
        </div>
        <div>
          <span className="block a4-font-body text-[13.5px] font-semibold text-[var(--a4-charcoal)] mb-[10px]">Services needed</span>
          <div className="flex gap-2 flex-wrap">
            {QUOTE_SERVICE_OPTS.map((s) => {
              const on = sel.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    toggle(s);
                    if (errors.services) setErrors({ ...errors, services: "" });
                  }}
                  className="a4-font-body text-[13.5px] font-semibold cursor-pointer rounded-[var(--a4-r-full)] py-[9px] px-4 transition-all duration-150"
                  style={{
                    border: `1px solid ${on ? "var(--a4-ink)" : "var(--a4-hairline-strong)"}`,
                    background: on ? "var(--a4-ink)" : "transparent",
                    color: on ? "#fff" : "var(--a4-charcoal)",
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {errors.services && <p className="a4-font-body text-[13px] text-red-500 mt-2">{errors.services}</p>}
        </div>
        <label className="flex flex-col gap-2">
          <span className="a4-font-body text-[13.5px] font-semibold text-[var(--a4-charcoal)]">Message</span>
          <textarea
            className="q-input resize-y"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us briefly about your business — entity type, activity, and what you need."
          />
        </label>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="inline-flex items-center gap-2 a4-font-body text-[13.5px] text-[var(--a4-mute)]">
            <Icon name="clock" size={15} color="var(--a4-accent-teal)" /> Response within 24 hours — no obligation.
          </span>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 px-[26px] rounded-[var(--a4-r-full)] bg-black text-white a4-font-body text-[16px] font-semibold inline-flex items-center gap-2 cursor-pointer border-0 disabled:opacity-50"
          >
            {isSubmitting ? "Sending…" : "Request my quote"} <Icon name="arrow-right" size={16} color="#fff" />
          </button>
        </div>
      </form>
    </>
  );
}

export function QuoteContent() {
  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="Get instant quote"
        title="A tailored quote, with no obligation"
        sub="Tell us what you need and we'll come back within 24 hours with a clear, written quote — scoped to your business, with no hidden fees."
      />

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(56px,8vw,88px) 0" }}>
        <Container style={{ maxWidth: 860 }}>
          <Reveal>
            <QuoteForm />
          </Reveal>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-black" style={{ padding: "clamp(64px,9vw,104px) 0" }}>
        <div aria-hidden="true" className="hero-bg" />
        <Container style={{ position: "relative" }}>
          <Reveal>
            <SectionHead dark align="center" eyebrow="How quotes work" title="From first chat to confirmed quote" maxWidth={560} />
          </Reveal>
          <div className="grid gap-5 mt-[52px]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))" }}>
            {QUOTE_STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 70} style={{ background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", padding: "26px 24px" }}>
                <div className="w-10 h-10 rounded-full border border-[var(--a4-hairline-dark)] grid place-items-center a4-font-display font-medium text-[16px] text-white">{s.n}</div>
                <h3 className="a4-font-display font-medium text-[19px] text-white mt-[18px] m-0 tracking-[-.2px]">{s.t}</h3>
                <p className="a4-font-body text-[var(--a4-on-dark-mute)] mt-2 m-0 text-[14.5px] leading-[1.5]" style={{ textWrap: "pretty" }}>{s.s}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <ServicePortalBand serviceName="your quote" />
    </div>
  );
}
