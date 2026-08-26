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
      style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div role="dialog" aria-modal="true" aria-label={INTENT_COPY[intent].title}
        style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", width: "100%", maxWidth: 460, padding: 30, boxShadow: "0 32px 80px rgba(0,0,0,.3)", maxHeight: "88vh", overflowY: "auto" }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "6px 0" }}>
            <div style={{ width: 54, height: 54, borderRadius: 999, background: "rgba(0,168,126,.12)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
              <Icon name="check" size={26} color="var(--a4-accent-teal)" stroke={2.5} />
            </div>
            <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "var(--a4-ink)" }}>{INTENT_COPY[intent].done}</div>
            <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 14, lineHeight: 1.6, color: "var(--a4-mute)", margin: "10px 0 0" }}>
              Thanks, {contact.name.split(" ")[0]}. Your quote is with us — we&apos;ll be in touch within 1 business day at <strong style={{ color: "var(--a4-ink)" }}>{contact.email}</strong>.
            </p>
            <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, color: "var(--a4-stone)", marginTop: 12 }}>Reference: {done.ref}</p>
            <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, lineHeight: 1.6, color: "var(--a4-stone)", marginTop: 10 }}>
              After our call we open your account and send it over to activate &mdash; your quote stays attached to reference {done.ref}, so there is nothing to re-enter.
            </p>
            <Button variant="outline-light" size="md" onClick={() => setOpen(false)} style={{ width: "100%", marginTop: 20 }}>Close</Button>
          </div>
        ) : (
          <div>
            <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "var(--a4-ink)" }}>{INTENT_COPY[intent].title}</div>
            <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, lineHeight: 1.6, color: "var(--a4-mute)", margin: "6px 0 20px" }}>
              {`We'll confirm scope and a fixed price (${quote().headline}) on a short call. No obligation.`}
            </p>
            {([["name", "Your name", "text", "name"], ["company", "Company name", "text", "organization"], ["email", "Email address", "email", "email"], ["phone", "Phone (optional)", "tel", "tel"]] as const).map(([k, label, type, ac]) => (
              <div key={k} style={{ marginBottom: 13 }}>
                <label htmlFor={`qa-${k}`} style={{ display: "block", fontFamily: "var(--a4-font-body)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--a4-mute)", marginBottom: 6 }}>{label}</label>
                <input
                  id={`qa-${k}`}
                  type={type}
                  autoComplete={ac}
                  required={k === "name" || k === "email"}
                  value={contact[k]}
                  onChange={(e) => setContact((f) => ({ ...f, [k]: e.target.value }))}
                  style={{ width: "100%", boxSizing: "border-box", background: "var(--a4-surface-soft)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "11px 14px", color: "var(--a4-ink)", fontFamily: "var(--a4-font-body)", fontSize: 14, outline: "none" }}
                />
              </div>
            ))}
            {error && <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "#c2303d", margin: "0 0 10px" }}>{error}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
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
