"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import FormStatusModal from "@/components/common/FormStatusModal";
import { Button, Container, Icon, Reveal } from "@/components/a4-landing/Primitives";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";
import { QUOTE_API_BASE } from "@/lib/websiteQuotation";
import { trackConversion } from "@/lib/analytics";
import { getCaptchaToken } from "@/lib/turnstileClient";

/**
 * In-house booking page — replaces the external Calendly links.
 *
 * All requests go straight from the BROWSER to the portal backend, never
 * through a Next route handler: server-side posts would share Vercel's egress
 * IP against the portal's per-IP public rate cap.
 */

const BOOKING_TYPE = "demo-30";

const SUCCESS_COPY =
  "You're booked — a member of the team will call you at the time you picked. Your account is ready within 24 hours of the call.";

type SlotMeta = { name?: string; durationMinutes?: number };

type SlotsResponse = {
  success?: boolean;
  message?: string;
  data?: {
    type?: { slug?: string; name?: string; durationMinutes?: number };
    timezone?: string;
    slots?: Array<{ start?: string }>;
  };
};

/** Formatters pinned to Malta wall-clock time regardless of the visitor's zone. */
const maltaDayKeyFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Malta",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const maltaDayLabelFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Malta",
  weekday: "short",
  day: "numeric",
  month: "short",
});
const maltaTimeFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Malta",
  hour: "2-digit",
  minute: "2-digit",
});

/** Calendar-day key in Malta time (never the visitor's or UTC day). */
function maltaDayKey(iso: string): string {
  const parts = maltaDayKeyFmt.formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function ContactFallback({ note }: { note: string }) {
  return (
    <Reveal
      style={{
        background: "var(--a4-surface-card)",
        border: "1px solid var(--a4-hairline-light)",
        borderRadius: "var(--a4-r-lg)",
        padding: "clamp(26px,3.4vw,40px)",
        textAlign: "center",
      }}
    >
      <h2
        className="a4-font-display font-medium text-[var(--a4-ink)]"
        style={{ fontSize: "clamp(22px,2.6vw,28px)", letterSpacing: "-.3px" }}
      >
        {note}
      </h2>
      <p className="a4-font-body text-[15.5px] leading-[1.6] text-[var(--a4-mute)] mt-3 mb-6 mx-auto" style={{ maxWidth: 460 }}>
        Prefer email? Contact us and we&apos;ll offer you times.
      </p>
      <Button variant="dark" size="md" href="/contact">
        Go to contact <Icon name="arrow-right" size={16} color="#fff" />
      </Button>
    </Reveal>
  );
}

export function BookACallContent() {
  const localizedHref = useLocalizedHref();
  const [slotsState, setSlotsState] = useState<"loading" | "ready" | "unavailable">("loading");
  const [slots, setSlots] = useState<string[]>([]);
  const [meta, setMeta] = useState<SlotMeta>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [slotNotice, setSlotNotice] = useState<string | null>(null);

  const [f, setF] = useState({ name: "", email: "", company: "", phone: "" });
  // `/book-a-call?quote=<ref>&email=<address>` — the quote flow hands over here:
  // the email prefills the form and the reference rides along on the booking
  // (same contract as vacei.com/book-a-demo).
  const [quoteRef, setQuoteRef] = useState("");
  useEffect(() => {
    const here = new URLSearchParams(window.location.search || "");
    const ref = (here.get("quote") || "").trim().slice(0, 80);
    const email = (here.get("email") || "").trim().slice(0, 254);
    if (ref) setQuoteRef(ref);
    if (email) setF((prev) => (prev.email ? prev : { ...prev, email }));
  }, []);
  // Honeypot — real visitors never see or fill this field.
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [statusMessage, setStatusMessage] = useState("");

  const fetchSlots = useCallback(async (): Promise<string[]> => {
    try {
      const res = await fetch(
        `${QUOTE_API_BASE}/public/scheduling/slots?type=${BOOKING_TYPE}&days=14`,
      );
      if (!res.ok) throw new Error(`slots ${res.status}`);
      const data = (await res.json()) as SlotsResponse;
      const list = (data.data?.slots ?? [])
        .map((s) => s.start)
        .filter((s): s is string => typeof s === "string" && !Number.isNaN(Date.parse(s)))
        .sort((a, b) => Date.parse(a) - Date.parse(b));
      setMeta({
        name: data.data?.type?.name,
        durationMinutes: data.data?.type?.durationMinutes,
      });
      setSlots(list);
      setSlotsState(list.length > 0 ? "ready" : "unavailable");
      return list;
    } catch {
      setSlots([]);
      setSlotsState("unavailable");
      return [];
    }
  }, []);

  useEffect(() => {
    // Fetch-on-mount: every setState inside fetchSlots happens after the
    // network await resolves, never synchronously in the effect body — the
    // rule's static analysis just can't see across the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchSlots();
  }, [fetchSlots]);

  /** Slots grouped by Malta calendar day, insertion-ordered (slots are sorted). */
  const days = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const start of slots) {
      const key = maltaDayKey(start);
      const bucket = map.get(key);
      if (bucket) bucket.push(start);
      else map.set(key, [start]);
    }
    return map;
  }, [slots]);

  const activeDay = selectedDay && days.has(selectedDay) ? selectedDay : (days.keys().next().value ?? null);
  const activeDaySlots = activeDay ? (days.get(activeDay) ?? []) : [];

  const validate = () => {
    const next: Record<string, string> = {};
    if (!f.name.trim()) next.name = "Name is required";
    if (!f.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) next.email = "Please enter a valid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlotNotice(null);
    if (!selectedStart) {
      setSlotNotice("Pick a day and time above first.");
      return;
    }
    if (!validate()) return;

    // Honeypot tripped: pretend success, send nothing.
    if (companyWebsite.trim() !== "") {
      setStatusType("success");
      setStatusMessage(SUCCESS_COPY);
      setStatusOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const captchaToken = await getCaptchaToken("book-a-call").catch(() => null);
      const res = await fetch(`${QUOTE_API_BASE}/public/scheduling/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: BOOKING_TYPE,
          start: selectedStart,
          name: f.name.trim(),
          email: f.email.trim(),
          company: f.company.trim(),
          phone: f.phone.trim(),
          source: "a4.com.mt",
          company_website: "",
          ...(quoteRef ? { quoteRef } : {}),
          ...(captchaToken ? { captchaToken } : {}),
        }),
      });

      if (res.status === 409) {
        // Someone took the slot between render and submit.
        setSelectedStart(null);
        setSlotNotice("That time was just taken — pick another.");
        await fetchSlots();
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { message?: string }).message || "Something went wrong. Please try again.",
        );
      }

      trackConversion("book_a_call_submit");
      setF({ name: "", email: "", company: "", phone: "" });
      setSelectedStart(null);
      setStatusType("success");
      setStatusMessage(SUCCESS_COPY);
      setStatusOpen(true);
    } catch {
      setStatusType("error");
      setStatusMessage(
        "We couldn't book that call. Please try again in a moment — or send us a message from the contact page and we'll offer you times.",
      );
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
  const chip = (active: boolean): React.CSSProperties => ({
    fontFamily: "var(--a4-font-body)",
    fontSize: 14.5,
    fontWeight: 600,
    padding: "10px 16px",
    borderRadius: "var(--a4-r-full)",
    border: `1px solid ${active ? "var(--a4-ink)" : "var(--a4-hairline-light)"}`,
    background: active ? "var(--a4-ink)" : "var(--a4-surface-soft)",
    color: active ? "#fff" : "var(--a4-ink)",
    cursor: "pointer",
  });

  const duration = meta.durationMinutes ?? 30;

  return (
    <div className="a4-site-page">
      <FormStatusModal
        open={statusOpen}
        type={statusType}
        title={statusType === "success" ? "Call booked" : "Something went wrong"}
        message={statusMessage}
        onClose={() => setStatusOpen(false)}
      />

      <PageHero
        eyebrow="Book a call"
        title="Pick a time that suits you"
        sub={`A free ${duration}-minute call with the team — no obligation. We'll learn about your business and set you up from there.`}
      />

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(56px,8vw,96px) 0" }}>
        <Container>
          {slotsState === "loading" && (
            <Reveal
              style={{
                background: "var(--a4-surface-card)",
                border: "1px solid var(--a4-hairline-light)",
                borderRadius: "var(--a4-r-lg)",
                padding: "clamp(26px,3.4vw,40px)",
                textAlign: "center",
              }}
            >
              <p className="a4-font-body text-[15.5px] text-[var(--a4-mute)] m-0">
                Loading available times…
              </p>
            </Reveal>
          )}

          {slotsState === "unavailable" && (
            <ContactFallback note="Online booking is taking a breather" />
          )}

          {slotsState === "ready" && (
            <Reveal
              style={{
                background: "var(--a4-surface-card)",
                border: "1px solid var(--a4-hairline-light)",
                borderRadius: "var(--a4-r-lg)",
                padding: "clamp(26px,3.4vw,40px)",
              }}
            >
              <h2
                className="a4-font-display font-medium text-[var(--a4-ink)] mb-2"
                style={{ fontSize: "clamp(22px,2.6vw,28px)", letterSpacing: "-.3px" }}
              >
                {meta.name || "Choose a day and time"}
              </h2>
              <p className="a4-font-body text-[13.5px] text-[var(--a4-mute)] mt-0 mb-5">
                All times are shown in <strong>Malta time</strong>.
              </p>

              <label style={lbl}>Day</label>
              <div className="flex flex-wrap gap-2 mb-5">
                {[...days.keys()].map((day) => {
                  const first = days.get(day)?.[0];
                  return (
                    <button
                      key={day}
                      type="button"
                      style={chip(day === activeDay)}
                      onClick={() => {
                        setSelectedDay(day);
                        setSelectedStart(null);
                        setSlotNotice(null);
                      }}
                    >
                      {first ? maltaDayLabelFmt.format(new Date(first)) : day}
                    </button>
                  );
                })}
              </div>

              <label style={lbl}>Time — Malta time</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {activeDaySlots.map((start) => (
                  <button
                    key={start}
                    type="button"
                    style={chip(start === selectedStart)}
                    onClick={() => {
                      setSelectedStart(start);
                      setSlotNotice(null);
                    }}
                  >
                    {maltaTimeFmt.format(new Date(start))}
                  </button>
                ))}
              </div>
              {slotNotice && (
                <p className="a4-font-body text-[13.5px] text-red-500 mt-2 mb-0">{slotNotice}</p>
              )}

              <form onSubmit={handleSubmit} className="mt-7">
                <div className="ct-grid grid gap-x-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <div>
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
                    {errors.name && (
                      <p className="a4-font-body text-[13px] text-red-500 mb-2">{errors.name}</p>
                    )}
                  </div>
                  <div>
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
                    {errors.email && (
                      <p className="a4-font-body text-[13px] text-red-500 mb-2">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label style={{ ...lbl, marginTop: 8 }}>Company (optional)</label>
                    <input
                      name="company"
                      value={f.company}
                      onChange={(e) => setF({ ...f, company: e.target.value })}
                      style={{ ...inpBase, border: "1px solid var(--a4-hairline-light)" }}
                      placeholder="Company Ltd"
                    />
                  </div>
                  <div>
                    <label style={{ ...lbl, marginTop: 8 }}>Phone (optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      value={f.phone}
                      onChange={(e) => setF({ ...f, phone: e.target.value })}
                      style={{ ...inpBase, border: "1px solid var(--a4-hairline-light)" }}
                      placeholder="+356 9900 0000"
                    />
                  </div>
                </div>

                {/* Honeypot — hidden from real visitors, tempting to bots. */}
                <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
                  <label htmlFor="company_website">Company website</label>
                  <input
                    id="company_website"
                    name="company_website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-4 h-12 rounded-[var(--a4-r-full)] bg-black text-white a4-font-body text-[16px] font-semibold inline-flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50"
                >
                  {isSubmitting ? "Booking…" : "Book this time"}{" "}
                  <Icon name="arrow-right" size={16} color="#fff" />
                </button>
              </form>

              <p className="a4-font-body text-[13.5px] text-[var(--a4-mute)] mt-4 mb-0">
                Prefer email?{" "}
                <a href={localizedHref("/contact")} className="underline text-[var(--a4-ink)]">
                  Contact us
                </a>{" "}
                and we&apos;ll offer you times.
              </p>
            </Reveal>
          )}
        </Container>
      </section>
    </div>
  );
}
