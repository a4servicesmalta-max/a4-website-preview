"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import FormStatusModal from "@/components/common/FormStatusModal";
import { Button, Container, Icon, Logo, Reveal } from "@/components/a4-landing/Primitives";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";
import { QUOTE_API_BASE } from "@/lib/websiteQuotation";
import { trackConversion } from "@/lib/analytics";
import { getCaptchaToken } from "@/lib/turnstileClient";
import {
  BOOKING_QUALIFIERS,
  buildBookingAnswers,
  buildBookingMessage,
  type QualifierKey,
  type QualifierSelection,
} from "@/lib/booking-answers";

/**
 * In-house booking page — replaces the external Calendly links.
 *
 * THE PANEL IS THE PAGE. A dark port of the owner-designed booking panel that
 * ships on vacei.com/book-a-demo: a month calendar (Malta days, Monday-first,
 * availability dots) → the free times on the chosen day → details with
 * qualifier chips → booked, all inside one card. A4's palette rather than
 * vacei's teal gradient: deep charcoal on the site's `--a4-*` tokens, with the
 * cobalt accent showing only in the panel wash and the busy-day dots.
 *
 * THE FALLBACK IS THE FLOOR. Whenever the scheduling API is dark, returns no
 * slots or fails outright, the visitor gets the contact route instead — never a
 * dead end.
 *
 * All requests go straight from the BROWSER to the portal backend, never
 * through a Next route handler: server-side posts would share Vercel's egress
 * IP against the portal's per-IP public rate cap.
 *
 * ALL TIMES ARE MALTA TIME. The API returns UTC instants; every label renders
 * through Intl.DateTimeFormat with timeZone Europe/Malta, and the calendar's
 * month/day arithmetic runs on Malta calendar dates — never on the visitor's
 * local timezone.
 */

const BOOKING_TYPE = "demo-30";

/** Matches the `days=` the slots endpoint is asked for. */
const HORIZON_DAYS = 14;

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

type Step = "cal" | "time" | "form" | "done";

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
const maltaWeekdayLongFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Malta", weekday: "long" });
const maltaDayNumFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Malta", day: "numeric" });
const maltaMonthLongFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Malta", month: "long" });
const maltaYearFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Malta", year: "numeric" });

/** Calendar-day key in Malta time (never the visitor's or UTC day). */
function maltaDayKey(when: string | Date): string {
  const parts = maltaDayKeyFmt.formatToParts(when instanceof Date ? when : new Date(when));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** "Wednesday, 3 September 2026" — composed so the comma matches the design. */
function longMaltaDate(d: Date): string {
  return `${maltaWeekdayLongFmt.format(d)}, ${maltaDayNumFmt.format(d)} ${maltaMonthLongFmt.format(d)} ${maltaYearFmt.format(d)}`;
}

const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));

const WEEKDAY_HEADS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function ContactFallback({ note }: { note: string }) {
  return (
    <Reveal
      style={{
        background: "var(--a4-surface-elevated)",
        border: "1px solid var(--a4-hairline-dark)",
        borderRadius: "var(--a4-r-xl)",
        padding: "clamp(26px,3.4vw,40px)",
        textAlign: "center",
        boxShadow: "0 30px 80px -34px rgba(0,0,0,.9)",
      }}
    >
      <h2
        className="a4-font-display font-medium text-white"
        style={{ fontSize: "clamp(22px,2.6vw,28px)", letterSpacing: "-.3px" }}
      >
        {note}
      </h2>
      <p
        className="a4-font-body text-[15.5px] leading-[1.6] text-[var(--a4-on-dark-mute)] mt-3 mb-6 mx-auto"
        style={{ maxWidth: 460 }}
      >
        Prefer email? Contact us and we&apos;ll offer you times.
      </p>
      <Button variant="primary" size="md" href="/contact">
        Go to contact <Icon name="arrow-right" size={16} color="#000" />
      </Button>
    </Reveal>
  );
}

export function BookACallContent() {
  const localizedHref = useLocalizedHref();
  const [slotsState, setSlotsState] = useState<"loading" | "ready" | "unavailable">("loading");
  const [slots, setSlots] = useState<string[]>([]);
  const [meta, setMeta] = useState<SlotMeta>({});
  const [step, setStep] = useState<Step>("cal");
  // "Now" is pinned once per mount: reading the clock during render is impure,
  // and a calendar that silently reinterprets "today" mid-session is worse than
  // one that is a few minutes stale.
  const [nowKeys] = useState(() => ({
    todayKey: maltaDayKey(new Date()),
    horizonKey: maltaDayKey(new Date(new Date().getTime() + HORIZON_DAYS * 86400000)),
  }));
  const [view, setView] = useState<{ y: number; m: number; dir: number }>(() => {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth(), dir: 0 };
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [slotNotice, setSlotNotice] = useState<string | null>(null);
  const [bookedStart, setBookedStart] = useState<string | null>(null);
  const [bookedEmail, setBookedEmail] = useState("");

  const [f, setF] = useState({ name: "", email: "", company: "", phone: "", website: "" });
  const [qual, setQual] = useState<QualifierSelection>({});
  // `/book-a-call?quote=<ref>&email=<address>` — the quote flow hands over here:
  // the email prefills the form and the reference rides along on the booking
  // (same contract as vacei.com/book-a-demo).
  const [quoteRef, setQuoteRef] = useState("");
  useEffect(() => {
    const here = new URLSearchParams(window.location.search || "");
    const ref = (here.get("quote") || "").trim().slice(0, 80);
    const email = (here.get("email") || "").trim().slice(0, 254);
    // Reading the URL is only possible on the client, so this is a one-shot
    // mount sync, not a cascading render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        `${QUOTE_API_BASE}/public/scheduling/slots?type=${BOOKING_TYPE}&days=${HORIZON_DAYS}`,
      );
      if (!res.ok) throw new Error(`slots ${res.status}`);
      const data = (await res.json()) as SlotsResponse;
      const now = Date.now();
      const list = (data.data?.slots ?? [])
        .map((s) => s.start)
        .filter((s): s is string => typeof s === "string" && !Number.isNaN(Date.parse(s)))
        // Never offer the past: a stale slot only produces a 409 on submit.
        .filter((s) => Date.parse(s) >= now)
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

  /**
   * Open the calendar on the month of the FIRST available day, not necessarily
   * the current month — end-of-month bookings roll over into the next one.
   */
  const firstDayKey = days.keys().next().value ?? null;
  useEffect(() => {
    if (!firstDayKey) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setView({ y: Number(firstDayKey.slice(0, 4)), m: Number(firstDayKey.slice(5, 7)) - 1, dir: 0 });
  }, [firstDayKey]);

  const activeDaySlots = selectedDay ? (days.get(selectedDay) ?? []) : [];
  const selectedDayDate = activeDaySlots[0] ? new Date(activeDaySlots[0]) : null;

  const validate = () => {
    const next: Record<string, string> = {};
    if (!f.name.trim()) next.name = "Name is required";
    if (!f.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) next.email = "Please enter a valid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const showBooked = (startIso: string, email: string) => {
    setBookedStart(startIso);
    setBookedEmail(email);
    setStep("done");
  };

  /** Re-open the panel on the calendar step with fresh availability. */
  const restart = useCallback(
    async (notice: string | null) => {
      setSelectedStart(null);
      const list = await fetchSlots();
      if (!list.length) return; // slotsState is already "unavailable" — fallback shows
      setSelectedDay((prev) => (prev && list.some((s) => maltaDayKey(s) === prev) ? prev : null));
      setStep("cal");
      setSlotNotice(notice);
    },
    [fetchSlots],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlotNotice(null);
    if (!selectedStart) {
      setStep("cal");
      setSlotNotice("Pick a day and time first.");
      return;
    }
    if (!validate()) return;

    // Honeypot tripped: pretend success, send nothing. The bot sees exactly
    // what a human sees — a different-looking success would be a free oracle.
    if (companyWebsite.trim() !== "") {
      showBooked(selectedStart, f.email.trim());
      return;
    }

    setIsSubmitting(true);
    try {
      const captchaToken = await getCaptchaToken("book-a-call").catch(() => null);
      const answers = buildBookingAnswers(qual);
      const message = buildBookingMessage(f.website);
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
          ...(Object.keys(answers).length ? { answers } : {}),
          ...(message ? { message } : {}),
          ...(captchaToken ? { captchaToken } : {}),
        }),
      });

      if (res.status === 409) {
        // Someone took the slot between render and submit. Stay in the panel:
        // refresh availability and go back to the day step with a notice.
        await restart("That time was just taken — pick another.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { message?: string }).message || "Something went wrong. Please try again.",
        );
      }

      const body = (await res.json().catch(() => ({}))) as { data?: { scheduledAt?: string } };
      trackConversion("book_a_call_submit");
      const email = f.email.trim();
      showBooked(body.data?.scheduledAt || selectedStart, email);
      setF({ name: "", email: "", company: "", phone: "", website: "" });
      setQual({});
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

  const duration = meta.durationMinutes ?? 30;

  /* ── Calendar geometry ──────────────────────────────────────────────────
     Calendar-date arithmetic via Date.UTC: a calendar date's weekday and a
     month's length are timezone-independent, so this stays correct for the
     Malta calendar regardless of the visitor's local timezone. Noon UTC keeps
     the Malta-tz label formatters on the same calendar date. */
  const { todayKey, horizonKey } = nowKeys;
  const monthTitleDate = new Date(Date.UTC(view.y, view.m, 1, 12));
  const monthTitle = `${maltaMonthLongFmt.format(monthTitleDate)} ${maltaYearFmt.format(monthTitleDate)}`;
  const atCurrentMonth =
    view.y === Number(todayKey.slice(0, 4)) && view.m === Number(todayKey.slice(5, 7)) - 1;
  const leadIn = (new Date(Date.UTC(view.y, view.m, 1)).getUTCDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();

  const stepIndex: Record<Step, number> = { cal: 0, time: 1, form: 2, done: 3 };
  const pillStyle = (i: number): React.CSSProperties => {
    const idx = stepIndex[step];
    if (idx === i) return { background: "#fff", color: "#000", borderColor: "#fff" };
    if (idx > i)
      return { background: "rgba(255,255,255,.2)", color: "#fff", borderColor: "var(--a4-hairline-dark)" };
    return {
      background: "rgba(255,255,255,.05)",
      color: "var(--a4-on-dark-mute)",
      borderColor: "var(--a4-hairline-dark)",
    };
  };

  const lbl: React.CSSProperties = {
    marginTop: 6,
    fontFamily: "var(--a4-font-body)",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--a4-on-dark-mute)",
  };
  const hint: React.CSSProperties = {
    margin: "16px 0 0",
    textAlign: "center",
    fontFamily: "var(--a4-font-body)",
    fontSize: 11.5,
    color: "rgba(255,255,255,.45)",
  };
  const errText: React.CSSProperties = {
    margin: "4px 0 0",
    fontFamily: "var(--a4-font-body)",
    fontSize: 12,
    color: "#ffc9c0",
    minHeight: "1em",
  };

  const setField = (key: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setF((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const chipRow = (key: QualifierKey, label: string, options: readonly string[]) => (
    <div key={key}>
      <div style={lbl}>{label}</div>
      <div className="flex flex-wrap gap-[6px] mt-[6px]" role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className="bkp-chip"
            aria-pressed={qual[key] === opt}
            onClick={() => setQual((prev) => ({ ...prev, [key]: prev[key] === opt ? null : opt }))}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

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
        sub={`A free ${duration}-minute call with an A4 accountant — no obligation. We'll learn about your business and set you up from there.`}
      />

      <section className="bg-black" style={{ padding: "clamp(40px,6vw,72px) 0 clamp(56px,8vw,96px)" }}>
        <Container>
          <div style={{ maxWidth: 540, margin: "0 auto" }}>
            {slotsState === "loading" && (
              <Reveal
                style={{
                  background: "var(--a4-surface-elevated)",
                  border: "1px solid var(--a4-hairline-dark)",
                  borderRadius: "var(--a4-r-xl)",
                  padding: "clamp(26px,3.4vw,40px)",
                  textAlign: "center",
                }}
              >
                <p className="a4-font-body text-[15.5px] text-[var(--a4-on-dark-mute)] m-0">
                  Loading available times…
                </p>
              </Reveal>
            )}

            {slotsState === "unavailable" && (
              <ContactFallback note="Online booking is taking a breather" />
            )}

            {slotsState === "ready" && (
              <div
                className="bkp"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 26,
                  padding: "34px 34px 30px",
                  color: "#fff",
                  border: "1px solid var(--a4-hairline-dark)",
                  background:
                    "radial-gradient(560px 320px at 88% 0%, rgba(79,85,241,.30) 0%, rgba(79,85,241,0) 62%), linear-gradient(152deg, #1b1e22 0%, #131518 40%, #0b0c0e 100%)",
                  boxShadow: "0 34px 90px -34px rgba(0,0,0,.95)",
                }}
              >
                {/* Header. The backend deliberately never reveals which staff
                    member takes a slot, so no host is ever named here. */}
                <div className="flex flex-col items-center gap-[14px] text-center">
                  <span
                    style={{
                      width: 64,
                      height: 64,
                      flex: "none",
                      borderRadius: "var(--a4-r-full)",
                      border: "1px solid var(--a4-hairline-dark)",
                      background: "rgba(255,255,255,.08)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <Logo height={30} />
                  </span>
                  <div>
                    <div
                      className="a4-font-display font-semibold"
                      style={{ fontSize: 19, letterSpacing: "-.015em" }}
                    >
                      Meet with an A4 accountant
                    </div>
                    <div
                      className="a4-font-body"
                      style={{ marginTop: 5, fontSize: 12, color: "var(--a4-on-dark-mute)" }}
                    >
                      A4 Services Limited &middot; {duration} min &middot; Europe/Malta
                    </div>
                  </div>
                  <div className="flex items-center gap-[6px]">
                    {["1 · Day", "2 · Time", "3 · Details"].map((text, i) => (
                      <React.Fragment key={text}>
                        {i > 0 && (
                          <span style={{ width: 10, height: 1, background: "rgba(255,255,255,.3)" }} />
                        )}
                        <span
                          className="a4-font-body inline-flex items-center"
                          style={{
                            height: 26,
                            padding: "0 12px",
                            borderRadius: "var(--a4-r-full)",
                            border: "1px solid",
                            fontSize: 11,
                            fontWeight: 600,
                            transition: "background .2s ease, color .2s ease",
                            ...pillStyle(i),
                          }}
                        >
                          {text}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* ── Step 1: the month calendar ── */}
                {step === "cal" && (
                  <div className="bkp-step">
                    <div className="flex items-center justify-between" style={{ marginTop: 22 }}>
                      <button
                        type="button"
                        className="bkp-glass"
                        aria-label="Previous month"
                        disabled={atCurrentMonth}
                        onClick={() =>
                          setView((v) =>
                            v.m === 0 ? { y: v.y - 1, m: 11, dir: -1 } : { y: v.y, m: v.m - 1, dir: -1 },
                          )
                        }
                      >
                        <Icon name="chevron-left" size={14} color="#fff" />
                      </button>
                      <div
                        key={`${view.y}-${view.m}`}
                        className={`a4-font-display ${view.dir > 0 ? "bkp-step-l" : view.dir < 0 ? "bkp-step-r" : ""}`}
                        style={{ fontSize: 16, fontWeight: 600 }}
                      >
                        {monthTitle}
                      </div>
                      <button
                        type="button"
                        className="bkp-glass"
                        aria-label="Next month"
                        onClick={() =>
                          setView((v) =>
                            v.m === 11 ? { y: v.y + 1, m: 0, dir: 1 } : { y: v.y, m: v.m + 1, dir: 1 },
                          )
                        }
                      >
                        <Icon name="chevron-right" size={14} color="#fff" />
                      </button>
                    </div>

                    <div
                      className="a4-font-body grid text-center"
                      style={{
                        marginTop: 16,
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: 4,
                        fontSize: 10.5,
                        fontWeight: 700,
                        letterSpacing: ".07em",
                        color: "rgba(255,255,255,.45)",
                      }}
                    >
                      {WEEKDAY_HEADS.map((d) => (
                        <span key={d}>{d}</span>
                      ))}
                    </div>

                    <div
                      key={`grid-${view.y}-${view.m}`}
                      className={`grid ${view.dir > 0 ? "bkp-step-l" : view.dir < 0 ? "bkp-step-r" : ""}`}
                      style={{ marginTop: 8, gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}
                    >
                      {Array.from({ length: leadIn }, (_, i) => (
                        <span key={`pad-${i}`} className="bkp-day pad" aria-hidden="true" />
                      ))}
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const dayNum = i + 1;
                        const key = `${view.y}-${pad2(view.m + 1)}-${pad2(dayNum)}`;
                        const free = days.get(key)?.length ?? 0;
                        const off = free === 0;
                        const sel = key === selectedDay;
                        return (
                          <button
                            key={key}
                            type="button"
                            className={`bkp-day${sel ? " sel" : ""}`}
                            disabled={off}
                            title={
                              off
                                ? key < todayKey
                                  ? "Past"
                                  : key > horizonKey
                                    ? "Beyond the booking window"
                                    : "No times free"
                                : `${free} ${free === 1 ? "time" : "times"} free`
                            }
                            onClick={() => {
                              setSelectedDay(key);
                              setSelectedStart(null);
                              setSlotNotice(null);
                              setStep("time");
                            }}
                          >
                            {dayNum}
                            <span
                              aria-hidden="true"
                              style={{
                                position: "absolute",
                                left: "50%",
                                bottom: 5,
                                transform: "translateX(-50%)",
                                width: 4,
                                height: 4,
                                borderRadius: "var(--a4-r-full)",
                                background: sel
                                  ? "#000"
                                  : free >= 4
                                    ? "var(--a4-primary-bright)"
                                    : free >= 1
                                      ? "rgba(255,255,255,.4)"
                                      : "transparent",
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <p className="a4-font-body" style={hint}>
                      {selectedDay && selectedDayDate
                        ? `Selected ${maltaDayLabelFmt.format(selectedDayDate)} — pick another day any time`
                        : "A cobalt dot means the day is mostly free"}
                    </p>
                    {slotNotice && (
                      <p className="a4-font-body" style={{ ...errText, textAlign: "center" }} role="status" aria-live="polite">
                        {slotNotice}
                      </p>
                    )}
                  </div>
                )}

                {/* ── Step 2: the free times on that day ── */}
                {step === "time" && (
                  <div className="bkp-step-l">
                    <div className="flex items-center gap-[10px]" style={{ marginTop: 22 }}>
                      <button
                        type="button"
                        className="bkp-glass"
                        style={{ width: 30, height: 30 }}
                        aria-label="Back to the calendar"
                        onClick={() => {
                          setView((v) => ({ ...v, dir: 0 }));
                          setStep("cal");
                        }}
                      >
                        <Icon name="chevron-left" size={13} color="#fff" />
                      </button>
                      <div className="a4-font-body" style={{ fontSize: 13.5, fontWeight: 600 }}>
                        {selectedDayDate ? longMaltaDate(selectedDayDate) : ""}
                      </div>
                    </div>
                    <div
                      className="grid"
                      style={{ marginTop: 16, gridTemplateColumns: "1fr 1fr", gap: 8 }}
                    >
                      {activeDaySlots.map((start) => (
                        <button
                          key={start}
                          type="button"
                          className="bkp-time"
                          onClick={() => {
                            setSelectedStart(start);
                            setStep("form");
                          }}
                        >
                          {maltaTimeFmt.format(new Date(start))}
                        </button>
                      ))}
                    </div>
                    <p className="a4-font-body" style={hint}>
                      All times Europe/Malta
                    </p>
                  </div>
                )}

                {/* ── Step 3: details ── */}
                {step === "form" && (
                  <div className="bkp-step-l">
                    <div
                      className="flex items-center justify-between gap-[10px]"
                      style={{
                        marginTop: 22,
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: "rgba(255,255,255,.06)",
                        border: "1px solid var(--a4-hairline-dark)",
                      }}
                    >
                      <div
                        className="a4-font-body"
                        style={{ fontVariantNumeric: "tabular-nums", fontSize: 12.5, fontWeight: 600 }}
                      >
                        {selectedStart
                          ? `${maltaDayLabelFmt.format(new Date(selectedStart))} · ${maltaTimeFmt.format(new Date(selectedStart))}`
                          : ""}
                      </div>
                      <button type="button" className="bkp-edit" onClick={() => setStep("time")}>
                        Edit
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-[10px]" style={{ marginTop: 14 }} noValidate>
                      <div className="grid gap-[10px]" style={{ gridTemplateColumns: "1fr 1fr" }}>
                        <input
                          className="bkp-input"
                          name="name"
                          value={f.name}
                          onChange={setField("name")}
                          placeholder="Full name"
                          autoComplete="name"
                          aria-label="Full name"
                          data-invalid={Boolean(errors.name)}
                        />
                        <input
                          className="bkp-input"
                          name="company"
                          value={f.company}
                          onChange={setField("company")}
                          placeholder="Company (optional)"
                          autoComplete="organization"
                          aria-label="Company"
                        />
                      </div>
                      <input
                        className="bkp-input"
                        type="email"
                        name="email"
                        value={f.email}
                        onChange={setField("email")}
                        placeholder="Your email address"
                        autoComplete="email"
                        inputMode="email"
                        aria-label="Email address"
                        data-invalid={Boolean(errors.email)}
                      />
                      <div className="grid gap-[10px]" style={{ gridTemplateColumns: "1fr 1fr" }}>
                        <input
                          className="bkp-input"
                          type="tel"
                          name="phone"
                          value={f.phone}
                          onChange={setField("phone")}
                          placeholder="Phone number"
                          autoComplete="tel"
                          inputMode="tel"
                          aria-label="Phone number"
                        />
                        <input
                          className="bkp-input"
                          name="website"
                          value={f.website}
                          onChange={setField("website")}
                          placeholder="Website URL"
                          autoComplete="url"
                          inputMode="url"
                          aria-label="Website"
                        />
                      </div>

                      {BOOKING_QUALIFIERS.map((q) => chipRow(q.key, q.label, q.options))}

                      {/* Honeypot — hidden from real visitors, tempting to bots. */}
                      <div
                        aria-hidden="true"
                        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}
                      >
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

                      <p style={errText} role="status" aria-live="polite">
                        {errors.name || errors.email || slotNotice || ""}
                      </p>
                      <button type="submit" className="bkp-confirm" disabled={isSubmitting}>
                        {isSubmitting ? "Booking…" : "Confirm booking"}
                        {!isSubmitting && <Icon name="arrow-right" size={16} color="#000" />}
                      </button>
                    </form>
                  </div>
                )}

                {/* ── Step 4: booked ── */}
                {step === "done" && (
                  <div className="bkp-step text-center" style={{ marginTop: 26 }}>
                    <span
                      className="bkp-pop"
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: "var(--a4-r-full)",
                        background: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon name="check" size={20} color="var(--a4-accent-teal)" stroke={2.2} />
                    </span>
                    <div
                      className="a4-font-display font-semibold"
                      style={{ marginTop: 16, fontSize: 19, letterSpacing: "-.015em" }}
                    >
                      Booked.
                    </div>
                    <div
                      className="a4-font-body"
                      style={{
                        marginTop: 10,
                        fontVariantNumeric: "tabular-nums",
                        fontSize: 13,
                        color: "rgba(255,255,255,.92)",
                      }}
                    >
                      {bookedStart
                        ? `${longMaltaDate(new Date(bookedStart))} · ${maltaTimeFmt.format(new Date(bookedStart))} · Europe/Malta`
                        : ""}
                    </div>
                    <p
                      className="a4-font-body mx-auto"
                      style={{
                        margin: "14px auto 0",
                        maxWidth: "38ch",
                        fontSize: 12.5,
                        lineHeight: 1.65,
                        color: "var(--a4-on-dark-mute)",
                        textWrap: "pretty",
                      }}
                    >
                      {SUCCESS_COPY} A confirmation email is on its way to{" "}
                      <span style={{ color: "#fff", fontWeight: 600 }}>{bookedEmail}</span>.
                    </p>
                    <button
                      type="button"
                      className="bkp-ghost"
                      style={{ marginTop: 18 }}
                      onClick={() => void restart(null)}
                    >
                      Book another time
                    </button>
                  </div>
                )}
              </div>
            )}

            <p className="a4-font-body text-[13.5px] text-[var(--a4-on-dark-mute)] mt-5 mb-0 text-center">
              Prefer email?{" "}
              <a href={localizedHref("/contact")} className="underline text-white">
                Contact us
              </a>{" "}
              and we&apos;ll offer you times.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
