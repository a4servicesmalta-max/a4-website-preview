"use client";

import React, { useState } from "react";
import { Button, Icon } from "@/components/a4-landing/Primitives";
import {
  quoteRef, quoteToText,
  type QuotePayload, type QuoteContact,
} from "@/lib/quote-handoff";

/**
 * ⚠ THE "account" INTENT IS GONE, AND MUST NOT COME BACK (owner, 2026-08-26).
 *
 * A4 is not self-serve. It used to record the quote and then hand the visitor
 * to Vacei Books to set a password — i.e. it opened an accounting relationship
 * for a stranger before anyone had spoken to them. A4 Services Limited is a
 * subject person under Malta AML law, so customer due diligence has to precede
 * acting for a client; a signup link gets that order backwards.
 *
 * The sequence now: we meet the client, WE open the account, we send it to
 * them to activate, and they complete KYC in the portal. So a finished quote
 * has exactly two exits, both of which start a conversation rather than an
 * account. `POST /auth/register` on Books answers 403 anyway, so a
 * "Create my account" button could only ever have dead-ended.
 */
export type Intent = "proposal" | "consultation";

/* The look — the A4 design language: white 28-radius panel, Outfit labels,
   hairline inputs with the indigo focus ring. */
const INK = "#09090B";
const INDIGO = "#4F55F1";
const HAIR = "#E4E4E7";
const DISPLAY = "var(--a4x-display)";
const BODY = "var(--a4x-body)";
const QA_CSS = `.qa-input::placeholder { color: #A1A1AA; } .qa-input:focus { border-color: #4F55F1 !important; box-shadow: 0 0 0 3px rgba(79,85,241,.14); }`;

const INTENT_COPY: Record<Intent, { title: string; cta: string; done: string; subject: string }> = {
  proposal: {
    title: "Request your proposal",
    cta: "Send request",
    done: "Proposal request received",
    subject: "proposal request",
  },
  consultation: {
    title: "Book your consultation",
    cta: "Request consultation",
    done: "Consultation requested",
    subject: "consultation booking",
  },
};

/**
 * The three things a client can do with a finished quote. Every one of them
 * records the full itemised quote server-side (portal + email) BEFORE anything
 * else happens, so a lead is never lost to a failed redirect or a closed tab.
 */
export function useQuoteActions(quote: () => QuotePayload) {
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<Intent>("proposal");
  const [contact, setContact] = useState<QuoteContact>({ name: "", company: "", email: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // No `next` any more: there is nowhere to send them but back to us.
  const [done, setDone] = useState<{ ref: string } | null>(null);

  const start = (i: Intent, prefill?: Partial<QuoteContact>) => {
    setIntent(i);
    setError("");
    setDone(null);
    if (prefill) setContact((c) => ({ ...c, ...Object.fromEntries(Object.entries(prefill).filter(([, v]) => v)) }));
    setOpen(true);
  };

  const submit = async () => {
    if (!contact.name.trim() || !contact.email.trim()) {
      setError("Please give us a name and an email address.");
      return;
    }
    setBusy(true);
    setError("");
    const q = quote();
    const ref = quoteRef();
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: contact.name,
          email: contact.email,
          subject: `A4 ${q.service} — ${INTENT_COPY[intent].subject} — ${contact.company || contact.name}`,
          message: quoteToText(q, contact, ref),
          meta: {
            phone: contact.phone,
            companyName: contact.company,
            service: q.service,
            // The canonical ids, so /api/quote can derive the IESBA route from
            // what was actually asked for rather than from this page's title.
            // `q.service` alone ("Accounting & bookkeeping") matches no form id
            // and routed every estimator lead `neutral`.
            ...(q.serviceIds?.length ? { services: q.serviceIds } : {}),
            intent,
            reference: ref,
            page: q.page,
            // The whole quote, structured, so the portal record is complete.
            serviceDetails: {
              headline: q.headline,
              services: q.services,
              lines: q.lines,
              answers: q.answers,
              clientNotes: q.clientNotes ?? "",
            },
          },
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setDone({ ref });
    } catch {
      setError("Something went wrong sending your request. Please try again, or email info@a4.com.mt.");
    } finally {
      setBusy(false);
    }
  };

  const modal = open ? (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(9,9,11,.55)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <style>{QA_CSS}</style>
      <div role="dialog" aria-modal="true" aria-label={INTENT_COPY[intent].title}
        style={{ background: "#FFFFFF", border: "1px solid " + HAIR, borderRadius: 28, width: "100%", maxWidth: 480, padding: "clamp(24px,3.4vw,36px)", boxShadow: "0 50px 120px rgba(9,9,11,.28)", maxHeight: "88vh", overflowY: "auto", color: INK }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "6px 0" }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, background: "rgba(79,85,241,.1)", display: "grid", placeItems: "center", margin: "0 auto 18px" }}>
              <Icon name="check" size={26} color={INDIGO} stroke={2.5} />
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 26, letterSpacing: "-0.03em", lineHeight: 1.15 }}>{INTENT_COPY[intent].done}</div>
            <p style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: "#52525B", margin: "10px 0 0" }}>
              Thanks, {contact.name.split(" ")[0]}. Your quote is with us — we&apos;ll be in touch within 1 business day at <strong style={{ color: INK }}>{contact.email}</strong>.
            </p>
            <p style={{ fontFamily: BODY, fontSize: 13, color: "#71717A", marginTop: 12 }}>Reference: {done.ref}</p>
            <p style={{ fontFamily: BODY, fontSize: 12.5, lineHeight: 1.6, color: "#71717A", marginTop: 10 }}>
              After our call we open your account and send it over to activate &mdash; your quote stays attached to reference {done.ref}, so there is nothing to re-enter.
            </p>
            <Button variant="outline-light" size="md" onClick={() => setOpen(false)} style={{ width: "100%", marginTop: 20 }}>Close</Button>
          </div>
        ) : (
          <div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 26, letterSpacing: "-0.03em", lineHeight: 1.15 }}>{INTENT_COPY[intent].title}</div>
            <p style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: "#52525B", margin: "8px 0 22px" }}>
              {`We'll confirm scope and a fixed price (${quote().headline}) on a short call. No obligation.`}
            </p>
            {([["name", "Your name", "text", "name"], ["company", "Company name", "text", "organization"], ["email", "Email address", "email", "email"], ["phone", "Phone (optional)", "tel", "tel"]] as const).map(([k, label, type, ac]) => (
              <div key={k} style={{ marginBottom: 14 }}>
                <label htmlFor={`qa-${k}`} style={{ display: "block", fontFamily: DISPLAY, fontSize: 15, fontWeight: 600, color: INK, marginBottom: 8 }}>{label}</label>
                <input
                  id={`qa-${k}`}
                  type={type}
                  autoComplete={ac}
                  required={k === "name" || k === "email"}
                  value={contact[k]}
                  onChange={(e) => setContact((f) => ({ ...f, [k]: e.target.value }))}
                  className="qa-input"
                  style={{ width: "100%", boxSizing: "border-box", height: 52, padding: "0 16px", background: "#FFFFFF", border: "1px solid " + HAIR, borderRadius: 14, color: INK, fontFamily: DISPLAY, fontSize: 16, fontWeight: 500, outline: "none" }}
                />
              </div>
            ))}
            {error && (
              <p role="alert" style={{ display: "flex", gap: 10, fontFamily: BODY, fontSize: 14, fontWeight: 600, lineHeight: 1.5, color: INK, margin: "0 0 10px" }}>
                <span className="a4-bullet" style={{ marginTop: 7, background: INK }} />
                {error}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <Button variant="dark" size="md" onClick={submit} style={{ flex: 1, opacity: busy ? 0.6 : 1, pointerEvents: busy ? "none" : "auto" }}>
                {busy ? "Sending…" : INTENT_COPY[intent].cta} <Icon name="arrow-right" size={16} color="#fff" />
              </Button>
              <Button variant="outline-light" size="md" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return { start, modal };
}
