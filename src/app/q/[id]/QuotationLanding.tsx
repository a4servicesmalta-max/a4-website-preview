"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { replayFx } from "@/components/fx/FxRuntime";
import { EO, INDIGO, INK, PERI, gcol, prefersReducedMotion } from "@/lib/fx/engine";
import {
  A4DrawnLockup,
  A4Mark,
  DARK_CARD,
  DARK_GRID,
  DriftGlow,
  GlitchLockup,
  LIGHT_GLOW,
  LetterWord,
  MUTED_GLOW,
  Slab,
  SweepSlab,
  TypeText,
  Words,
  gradText,
} from "@/components/fx/primitives";
import { trackConversion } from "@/lib/analytics";
import { CONTACT_EMAIL, CONTACT_EMAIL_HREF } from "@/lib/contact";
import {
  QUOTE_API_BASE,
  acceptedLineIndexes,
  buildCards,
  cardPrice,
  clientDisplayName,
  computeTotals,
  fmtDate,
  fmtEur,
  pageState,
  readLines,
  type FeeView,
  type QuotationSummary,
} from "@/lib/quotation-page";

/* ── The portal tour (same four screens and captions as the design) ── */
const SCREENS = [
  { n: "01", title: "Every engagement", sub: "at a glance", caption: "What's done, what's in progress and what's coming up.", src: "/brand/portal/portal-dashboard.jpg", alt: "Client portal dashboard", hideNote: false },
  { n: "02", title: "Corporate services", sub: "with our CSP partners", caption: "The full package, requested and tracked in your portal.", src: "/brand/portal/portal-request.jpg", alt: "Corporate services request form", hideNote: true },
  { n: "03", title: "Upload once", sub: "in one place", caption: "Collected once, not across a year of email attachments.", src: "/brand/portal/portal-audit-engagement.jpg", alt: "Audit engagement requests", hideNote: false },
  { n: "04", title: "Ask about", sub: "your audit", caption: "Ask what's still needed, and see it in one answer.", src: "/brand/portal/portal-ask.jpg", alt: "Ask about your audit", hideNote: false },
];

const SANS = 'var(--a4x-display), Outfit, Inter, system-ui, sans-serif';
const BODY = 'var(--a4x-body), Inter, system-ui, sans-serif';
const GRAD = "linear-gradient(90deg,#4F55F1 0%,#6468F3 55%,#8B8FF7 100%)";

const kicker: CSSProperties = { fontFamily: BODY, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#71717A" };
const metaValue: CSSProperties = { marginTop: 6, fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em" };

const MARK_S = "M302.6,2 L359,2 L355.6,10 L58.1,514 L2,514.1 L60.7,413 L4.7,412 L30.5,368 L36,359.5 L93,358.7 Z";
const MARK_F = "M394.9,2 L444.7,3 L444.7,359 L513.6,360 L482,412.6 L444.9,413 L444,514.5 L393.2,514 L393.2,418 L392,412.6 L152.4,412 Z M393,103.8 L240.2,359 L393.1,359 Z";

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", width: 18, height: 18, display: "block" }} aria-hidden="true">
      <path d="M6 2h8l4 4v16H6z" />
      <path d="M14 2v4h4M9 12h6M9 16h6" />
    </svg>
  );
}

function Check({ size = 14, color = "#FFFFFF", width = 3.2 }: { size?: number; color?: string; width?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size, display: "block" }} aria-hidden="true">
      <path d="M5 12l4 4 10-10" />
    </svg>
  );
}

type Props = { summary: QuotationSummary; token: string; preview: boolean };

export default function QuotationLanding({ summary, token, preview }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lines = useMemo(() => readLines(summary.lineItems), [summary.lineItems]);
  const cards = useMemo(() => buildCards(lines), [lines]);
  const initial = useMemo(() => pageState(summary), [summary]);
  const hasMonthly = cards.some((c) => c.monthly > 0);
  const client = clientDisplayName(summary);
  const ref = summary.reference;
  const issued = fmtDate(summary.issuedAt);
  const validUntil = fmtDate(summary.validUntil);
  const closed = initial === "expired" || initial === "declined";

  const [on, setOn] = useState<Set<string>>(() => new Set(cards.map((c) => c.key)));
  const [view, setView] = useState<FeeView>(hasMonthly ? (summary.acceptance?.billing === "annual" ? "year" : "monthly") : "year");
  const [screen, setScreen] = useState(0);
  const [name, setName] = useState("");
  const [agree, setAgree] = useState(false);
  const [accepted, setAccepted] = useState(initial === "accepted");
  const [acceptedBy, setAcceptedBy] = useState(summary.acceptance?.signerName ?? "");
  const [acceptedOn, setAcceptedOn] = useState(fmtDate(summary.acceptedAt));
  const [justAccepted, setJustAccepted] = useState(false);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [pdf, setPdf] = useState<0 | 1 | 2 | 3>(0);
  const [navSolid, setNavSolid] = useState(false);
  const [pillOn, setPillOn] = useState(false);

  const totals = useMemo(() => computeTotals(lines, cards, on, view), [lines, cards, on, view]);
  const [shown, setShown] = useState(totals.total);
  const shownRef = useRef(totals.total);
  const twRaf = useRef(0);
  const replayKey = useRef<string | null>(null);
  const seenRows = useRef<Set<string> | null>(null);
  const userPicked = useRef(false);
  const stageOn = useRef(false);
  const firstScreen = useRef(true);
  const timers = useRef<number[]>([]);

  const q = useCallback((s: string) => rootRef.current?.querySelector<HTMLElement>(s) ?? null, []);
  const qa = useCallback((s: string) => Array.from(rootRef.current?.querySelectorAll<HTMLElement>(s) ?? []), []);

  /* ── total tween (expo-out, 600ms) ── */
  useEffect(() => {
    const to = totals.total;
    const from = shownRef.current;
    cancelAnimationFrame(twRaf.current);
    if (from === to) return;
    if (prefersReducedMotion()) {
      shownRef.current = to;
      setShown(to);
      return;
    }
    const t0 = performance.now();
    const D = 600;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / D);
      const e = p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);
      const v = from + (to - from) * e;
      shownRef.current = v;
      setShown(v);
      if (p < 1) twRaf.current = requestAnimationFrame(step);
    };
    twRaf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(twRaf.current);
  }, [totals.total]);

  /* ── rows that join the quote slide in; a re-enabled service re-types its word ── */
  useEffect(() => {
    const rows = qa("[data-row]");
    if (seenRows.current && !prefersReducedMotion()) {
      rows.forEach((r) => {
        if (!seenRows.current!.has(r.dataset.row ?? "")) {
          r.animate(
            [
              { opacity: 0, transform: "translateY(24px)", filter: "blur(8px)", background: "rgba(79,85,241,.08)" },
              { opacity: 1, transform: "none", filter: "none", background: "rgba(79,85,241,0)" },
            ],
            { duration: 650, easing: EO }
          );
        }
      });
    }
    seenRows.current = new Set(rows.map((r) => r.dataset.row ?? ""));
    if (replayKey.current) {
      replayFx(q(`[data-word="${replayKey.current}"]`));
      replayKey.current = null;
    }
  }, [on, q, qa]);

  /* ── nav, sticky pill and the portal stage, all read off scroll ── */
  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const vh = window.innerHeight || 800;
      setNavSolid((window.scrollY || 0) > 30);
      const cfg = q('[data-sec="config"]');
      const quote = q('[data-sec="quote"]');
      if (cfg && quote) setPillOn(cfg.getBoundingClientRect().top < vh * 0.5 && quote.getBoundingClientRect().top > vh * 0.55);
      const st = q("[data-stage]");
      if (st) {
        const r = st.getBoundingClientRect();
        stageOn.current = r.top < vh && r.bottom > 0;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll);
    check();
    const iv = window.setInterval(() => {
      if (!userPicked.current && stageOn.current) setScreen((s) => (s + 1) % SCREENS.length);
    }, 5200);
    const pending = timers.current;
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      clearInterval(iv);
      pending.forEach((t) => clearTimeout(t));
    };
  }, [q]);

  useEffect(() => {
    if (firstScreen.current) {
      firstScreen.current = false;
      return;
    }
    replayFx(q("[data-portal-pill]"));
  }, [screen, q]);

  /* ── the acceptance moment: stamp slams in, card jolts, rings ripple ── */
  useEffect(() => {
    if (!justAccepted) return;
    const S = prefersReducedMotion();
    const card = q("[data-accept-card]");
    const stamp = q("[data-stamp]");
    if (stamp && !S)
      stamp.animate(
        [
          { opacity: 0, transform: "rotate(-8deg) scale(2.6)", filter: "blur(16px)" },
          { opacity: 1, offset: 0.45 },
          { opacity: 1, transform: "rotate(-8deg) scale(1)", filter: "none" },
        ],
        { duration: 420, easing: EO, fill: "backwards" }
      );
    if (card && !S)
      card.animate(
        [
          { transform: "translate(0,0)" },
          { transform: "translate(-7px,4px)" },
          { transform: "translate(6px,-3px)" },
          { transform: "translate(-3px,2px)" },
          { transform: "translate(0,0)" },
        ],
        { duration: 320, delay: 360, easing: "ease-out" }
      );
    if (!S)
      qa("[data-ring]").forEach((r, i) =>
        r.animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: `scale(${1.06 + i * 0.05}, ${1.5 + i * 0.4})` }], {
          duration: 700,
          delay: 60 + i * 180,
          easing: EO,
          fill: "both",
        })
      );
  }, [justAccepted, q, qa]);

  /* ── actions ── */
  const toggle = (key: string) => {
    if (accepted) return;
    const turningOn = !on.has(key);
    const next = new Set(on);
    if (turningOn) next.add(key);
    else next.delete(key);
    if (turningOn) replayKey.current = key;
    setOn(next);
  };

  const go = (sel: string) => {
    const el = q(sel);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: "smooth" });
  };

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const downloadPdf = async () => {
    if (pdf === 1 || pdf === 2) return;
    setPdf(1);
    const t0 = performance.now();
    try {
      const res = await fetch(`/api/quotations/${summary.id}/pdf?t=${encodeURIComponent(token)}`);
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const wait = Math.max(0, 1150 - (performance.now() - t0));
      await new Promise((r) => setTimeout(r, wait));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${ref}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      later(() => URL.revokeObjectURL(url), 5000);
      setPdf(2);
      later(() => setPdf(0), 2450);
    } catch {
      setPdf(3);
      later(() => setPdf(0), 3200);
    }
  };

  const canAccept = !!(name.trim().length >= 2 && agree && on.size > 0);
  const shake = () =>
    q("[data-accept-card]")?.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-10px)" },
        { transform: "translateX(8px)" },
        { transform: "translateX(-5px)" },
        { transform: "translateX(3px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 380, easing: "ease-out" }
    );

  const accept = async () => {
    if (accepted || busy || closed) return;
    if (!canAccept) {
      shake();
      setTried(true);
      return;
    }
    if (preview) {
      setFailure("Staff preview — accepting is switched off here.");
      shake();
      return;
    }
    setBusy(true);
    setFailure("");
    const body = JSON.stringify({
      token,
      signerName: name.trim(),
      lineIndexes: acceptedLineIndexes(cards, on),
      billing: view === "year" ? "annual" : "monthly",
    });
    const post = (url: string) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    let res: Response | null = null;
    try {
      // Straight to the portal backend: the acceptance record keeps the
      // visitor's own address. The same-origin route is only a fallback.
      res = await post(`${QUOTE_API_BASE}/public/quotations/${summary.id}/accept`);
    } catch {
      res = await post(`/api/quotations/${summary.id}/accept`).catch(() => null);
    }
    setBusy(false);
    if (!res || !res.ok) {
      const data = res ? await res.json().catch(() => ({})) : {};
      const message = typeof (data as { message?: unknown }).message === "string" ? (data as { message: string }).message : "";
      setFailure(message || `We couldn't record that just now. Please try again, or email ${CONTACT_EMAIL}.`);
      shake();
      return;
    }
    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    setAccepted(true);
    setAcceptedBy(name.trim());
    setAcceptedOn(today);
    setJustAccepted(true);
    trackConversion("quotation_accept");
  };

  /* ── derived copy ── */
  const countLabel = totals.count === 1 ? "1 service" : `${totals.count} services`;
  const perLabel = totals.per;
  const pdfLabel = pdf === 1 ? "Preparing…" : pdf === 2 ? `${ref}.pdf` : pdf === 3 ? "Try again" : "Download PDF";
  const pdfW = pdf === 1 || pdf === 2 ? "100%" : "0%";
  const pdfT = pdf === 1 ? "width 1.1s cubic-bezier(.65,0,.35,1)" : "width .3s ease";
  const hasAudit = cards.some((c) => (c.key === "aud" || c.key === "rev") && on.has(c.key));
  const hasCsp = cards.some((c) => c.key === "csp" || c.key === "inc");
  const acceptNote = accepted
    ? `Accepted by ${acceptedBy || "you"}${acceptedOn ? ` on ${acceptedOn}` : ""}. We'll come back to you within one working day.`
    : failure
      ? failure
      : tried && !canAccept
        ? on.size === 0
          ? "Switch on at least one service to accept."
          : "Add your name and tick the box to accept."
        : "We'll come back to you within one working day.";
  const noteC = (failure || (tried && !canAccept)) && !accepted ? "#FFFFFF" : "#A1A1AA";
  const validChip =
    initial === "accepted" || accepted
      ? { k: "Accepted", v: acceptedOn || fmtDate(summary.acceptedAt) }
      : closed
        ? { k: initial === "declined" ? "Declined" : "Expired", v: validUntil }
        : { k: "Valid until", v: validUntil };

  const terms = [
    `This quotation is valid until ${validUntil || "the date shown"}. After that, fees may be reviewed.`,
    "Fees are shown before VAT, which is added at 18%. Registry and government fees are passed on at cost.",
    "Monthly services are billed monthly in advance, annual services once per financial year, and one-off items on completion.",
    "Accepting starts onboarding: before we act for you, we complete our client due diligence and send the engagement letter.",
    ...(hasCsp ? ["Corporate services are delivered with licensed CSP partners."] : []),
    "Either side can end an engagement under the notice terms in the engagement letter. Work already done is billed.",
  ];

  /* ── render ── */
  return (
    <div ref={rootRef} style={{ fontFamily: SANS, color: INK, background: INK, overflowX: "clip" }}>
      {/* NAV */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: 72, display: "flex", alignItems: "center", gap: 14,
          padding: "0 clamp(16px,4vw,48px)", background: navSolid ? "rgba(9,9,11,.82)" : "rgba(9,9,11,0)",
          borderBottom: `1px solid ${navSolid ? "rgba(255,255,255,.08)" : "rgba(255,255,255,0)"}`,
          backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", transition: "background .4s, border-color .4s", color: "#FFFFFF",
        }}
      >
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "#FFFFFF", flexShrink: 0 }}
          aria-label="A4 Services — back to top"
        >
          <A4Mark size={26} />
          <span style={{ width: 1.5, height: 21, margin: "0 10px", background: "#FFFFFF", opacity: 0.35 }} />
          <span className="q-hide-xs" style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>A4 Services</span>
        </a>
        <span
          className="q-hide-sm"
          style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: "28px", padding: "0 12px", borderRadius: 999, border: "1px solid rgba(255,255,255,.14)", color: "#A1A1AA", fontSize: 13, fontWeight: 500 }}
        >
          Quotation <span style={{ color: "#FFFFFF" }}>{ref}</span>
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={downloadPdf}
          style={{ position: "relative", overflow: "hidden", flexShrink: 0, height: 40, padding: "0 16px", display: "flex", alignItems: "center", gap: 8, borderRadius: 999, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.06)", color: "#FFFFFF", fontSize: 14, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: pdfW, background: INDIGO, transition: pdfT }} />
          <DocIcon />
          <span className="q-hide-xs" style={{ position: "relative" }}>{pdfLabel}</span>
        </button>
        <button
          onClick={() => go("#accept")}
          style={{ flexShrink: 0, height: 40, padding: "0 18px", borderRadius: 999, border: 0, background: "#FFFFFF", color: INK, fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          {accepted ? "Accepted" : closed ? "Ask for an update" : "Accept quote"}
        </button>
      </nav>

      {preview ? (
        <div style={{ position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", zIndex: 49, padding: "8px 16px", borderRadius: 999, background: "rgba(79,85,241,.92)", color: "#FFFFFF", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
          Staff preview · {client} sees this page · accepting is off
        </div>
      ) : null}

      {/* 01 HERO */}
      <section
        id="top"
        data-hero=""
        style={{ position: "relative", minHeight: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", color: "#FFFFFF", background: DARK_GRID }}
      >
        <DriftGlow left="28%" top="-30%" strength={0.28} />
        <div data-hero-par="" aria-hidden="true" style={{ position: "absolute", right: "-16vw", top: "16vh", width: "50vw", height: "96vh", pointerEvents: "none" }}>
          <div data-fx="slab" data-d="100" style={{ position: "absolute", inset: 0 }}>
            <Slab opacity={0.55} />
          </div>
        </div>
        <div
          data-hero-exit=""
          style={{ position: "relative", zIndex: 2, flex: 1, width: "100%", maxWidth: 1280, margin: "0 auto", padding: "128px clamp(20px,5vw,72px) 120px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "clamp(28px,3.6vw,44px)" }}
        >
          <A4DrawnLockup id="qh" />
          <div data-fx="rise" data-d="950" style={{ display: "flex", alignItems: "baseline", gap: 14, fontSize: "clamp(16px,1.5vw,22px)", fontWeight: 600, letterSpacing: ".02em", color: "#A1A1AA" }}>
            <span style={{ color: PERI }}>Quotation</span>
            <span>{ref}</span>
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(46px,8.2vw,136px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.02 }}>
            <TypeText segments={[{ t: "Your quotation,", c: "#FFFFFF" }]} per={42} d={1150} />
            <div data-fx="rise" data-d="1850" data-dy="60" style={{ fontWeight: 600, paddingBottom: ".1em", marginBottom: "-.1em", overflowWrap: "anywhere", ...gradText }}>
              {client}
            </div>
          </h1>
          <p data-fx="rise" data-d="2150" style={{ margin: 0, maxWidth: 720, fontSize: "clamp(19px,1.9vw,28px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.35, color: "#A1A1AA" }}>
            An AI-native accounting &amp; audit firm.
          </p>
          <div data-fx="rise" data-d="2300" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            {issued ? (
              <span className="a4-chip a4-chip-dark">
                Issued <span style={{ color: "#FFFFFF" }}>{issued}</span>
              </span>
            ) : null}
            {validChip.v ? (
              <span className="a4-chip a4-chip-dark">
                {validChip.k} <span style={{ color: "#FFFFFF" }}>{validChip.v}</span>
              </span>
            ) : null}
          </div>
          <div data-fx="rise" data-d="2420" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <button onClick={() => go("#build")} className="a4-btn a4-btn-light">
              {accepted ? "Your services" : "Build your quote"}
            </button>
            <button onClick={() => go("#quote")} className="a4-btn a4-btn-ghost">
              See the quote
            </button>
          </div>
        </div>
        <div data-fx="rise" data-d="2800" aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: 28, zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, pointerEvents: "none" }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: "#A1A1AA" }}>Scroll</span>
          <span style={{ position: "relative", width: 1, height: 44, overflow: "hidden", background: "rgba(255,255,255,.14)" }}>
            <span data-loop="" style={{ position: "absolute", left: 0, top: 0, width: 1, height: 44, background: PERI }} />
          </span>
        </div>
      </section>

      {/* 02 BUILD YOUR QUOTE */}
      <section id="build" data-sec="config" style={{ position: "relative", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", background: LIGHT_GLOW }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", fontSize: "clamp(44px,7.4vw,132px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.1 }}>
            <TypeText segments={[{ t: "Every service.", c: INK }]} per={40} style={{ display: "inline-block" }} />
            <Words d={620} style={{ fontWeight: 600 }} parts={[{ t: "One" }, { t: "portal.", g: true }]} />
          </div>

          <div style={{ marginTop: "clamp(72px,9vw,128px)", display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 28 }}>
            <div data-fx="rise" style={{ maxWidth: 600 }}>
              <div className="a4-eyebrow" style={{ color: "#52525B" }}>
                <span style={{ color: INDIGO }}>01</span>
                <span>{accepted ? "Your services" : "Build your quote"}</span>
              </div>
              <h2 style={{ margin: "14px 0 0", fontSize: "clamp(32px,3.6vw,52px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.04 }}>
                {accepted ? "What you accepted." : "Choose what you need."}
              </h2>
              <p style={{ margin: "14px 0 0", fontFamily: BODY, fontSize: 17, lineHeight: 1.55, color: "#52525B" }}>
                {accepted
                  ? "These are the services on your accepted quotation."
                  : "Switch services on or off. The quote below updates as you go."}
              </p>
            </div>
            <div data-fx="rise" data-d="120" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
              {hasMonthly ? (
                <div role="tablist" aria-label="Show fees" style={{ display: "flex", padding: 5, borderRadius: 999, background: "#F4F4F5", border: "1px solid #E4E4E7" }}>
                  {(["monthly", "year"] as FeeView[]).map((v) => {
                    const a = view === v;
                    return (
                      <button
                        key={v}
                        role="tab"
                        aria-selected={a}
                        onClick={() => setView(v)}
                        style={{ height: 44, padding: "0 22px", borderRadius: 999, border: 0, background: a ? INK : "transparent", color: a ? "#FFFFFF" : "#52525B", fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "background .3s, color .3s" }}
                      >
                        {v === "monthly" ? "Monthly" : "First year"}
                      </button>
                    );
                  })}
                </div>
              ) : null}
              <span style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: "#71717A" }}>Fees before VAT · registry fees at cost</span>
            </div>
          </div>

          <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: 16 }}>
            {cards.map((s, i) => {
              const isOn = on.has(s.key);
              const dark = i % 2 === 1;
              const n = Array.from(s.word).length;
              const colors = Array.from(s.word).map((_, j) => (isOn ? (dark ? "#FFFFFF" : gcol(n > 1 ? j / (n - 1) : 0)) : dark ? "#3F3F46" : "#D4D4D8"));
              const price = cardPrice(s, view);
              const total = String(cards.length).padStart(2, "0");
              return (
                <div
                  key={s.key}
                  data-fx="rise"
                  data-d={i * 80}
                  onClick={() => toggle(s.key)}
                  onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(s.key);
                    }
                  }}
                  role="switch"
                  aria-checked={isOn}
                  aria-label={`${s.word} — ${isOn ? "included" : "not included"}`}
                  aria-disabled={accepted}
                  tabIndex={0}
                  style={{
                    position: "relative", overflow: "hidden", minHeight: 330, padding: 28, borderRadius: 24, display: "flex", flexDirection: "column", gap: 14,
                    cursor: accepted ? "default" : "pointer", userSelect: "none", outline: "none",
                    background: dark ? DARK_CARD : "#FFFFFF",
                    border: `1px solid ${dark ? (isOn ? "rgba(139,143,247,.45)" : "rgba(255,255,255,.06)") : isOn ? "rgba(79,85,241,.45)" : "#E4E4E7"}`,
                    boxShadow: isOn ? (dark ? "0 24px 60px rgba(9,9,11,.28)" : "0 24px 60px rgba(79,85,241,.12)") : "none",
                    transition: "border-color .35s, box-shadow .35s",
                    color: dark ? "#FFFFFF" : INK,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: dark ? "#A1A1AA" : "#52525B" }}>
                      <span style={{ color: isOn ? (dark ? PERI : INDIGO) : dark ? "#A1A1AA" : "#52525B", transition: "color .3s" }}>{String(i + 1).padStart(2, "0")}</span>
                      <span>/ {total}</span>
                    </div>
                    <span aria-hidden="true" style={{ position: "relative", width: 48, height: 28, borderRadius: 14, background: isOn ? INDIGO : dark ? "#3F3F46" : "#E4E4E7", transition: "background .3s", opacity: accepted ? 0.6 : 1 }}>
                      <span style={{ position: "absolute", left: 3, top: 3, width: 22, height: 22, borderRadius: 11, background: "#FFFFFF", boxShadow: "0 1px 3px rgba(9,9,11,.3)", transform: `translateX(${isOn ? 20 : 0}px)`, transition: "transform .35s cubic-bezier(.16,1,.3,1)" }} />
                    </span>
                  </div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", minHeight: 110 }}>
                    <LetterWord
                      text={s.word}
                      fx={s.fx}
                      wordKey={s.key}
                      d={220 + i * 90}
                      per={55}
                      colors={colors}
                      letterStyle={{ transition: "color .45s" }}
                      style={{ fontSize: "clamp(42px,4vw,60px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.1, whiteSpace: "nowrap" }}
                    />
                  </div>
                  <p style={{ margin: 0, fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.35, color: dark ? (isOn ? "#E4E4E7" : "#A1A1AA") : isOn ? "#3F3F46" : "#71717A", textWrap: "pretty", transition: "color .3s" }}>
                    {s.line}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 16, borderTop: `1px solid ${dark ? "rgba(255,255,255,.1)" : "#E4E4E7"}` }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
                      <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.03em", color: isOn ? (dark ? "#FFFFFF" : INK) : dark ? "#71717A" : "#A1A1AA", transition: "color .3s" }}>{fmtEur(price.amount)}</span>
                      <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: dark ? "#A1A1AA" : "#52525B" }}>{price.per}</span>
                    </div>
                    <span
                      style={{
                        height: 30, padding: "0 13px", display: "flex", alignItems: "center", borderRadius: 999, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
                        background: isOn ? (dark ? "rgba(139,143,247,.18)" : "rgba(79,85,241,.1)") : "transparent",
                        color: isOn ? (dark ? "#FFFFFF" : INDIGO) : dark ? "#A1A1AA" : "#52525B",
                        border: `1px solid ${isOn ? "transparent" : dark ? "rgba(255,255,255,.18)" : "#E4E4E7"}`,
                        transition: "all .3s",
                      }}
                    >
                      {isOn ? "Included" : "Add"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 03 THE QUOTE */}
      <section id="quote" data-sec="quote" style={{ position: "relative", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", background: MUTED_GLOW }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ fontSize: "clamp(42px,6.4vw,112px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.08 }}>
            <TypeText segments={[{ t: "The quote,", c: INK }]} per={45} style={{ display: "inline-block" }} />
            <Words d={520} style={{ fontWeight: 600 }} parts={[{ t: "line by" }, { t: "line.", g: true }]} />
          </div>

          <div data-fx="rise" data-dy="80" style={{ marginTop: "clamp(48px,6vw,80px)", background: "#FFFFFF", border: "1px solid #E4E4E7", borderRadius: 28, boxShadow: "0 50px 120px rgba(9,9,11,.12)", overflow: "hidden" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24, padding: "clamp(24px,4vw,48px) clamp(24px,4vw,48px) 0" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <A4Mark size={40} color={INK} />
                <span style={{ width: 1.5, height: 32, margin: "0 12px", background: INK, opacity: 0.35 }} />
                <span style={{ fontSize: 20, fontWeight: 500, letterSpacing: "-0.02em" }}>{summary.organizationName?.includes("A4") ? "A4 Services" : summary.organizationName || "A4 Services"}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={kicker}>Quotation</div>
                <div style={{ marginTop: 4, fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em" }}>{ref}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px 32px", padding: "32px clamp(24px,4vw,48px)" }}>
              <div><div style={kicker}>Prepared for</div><div style={{ ...metaValue, overflowWrap: "anywhere" }}>{client}</div></div>
              <div><div style={kicker}>Issued</div><div style={metaValue}>{issued || "—"}</div></div>
              <div><div style={kicker}>{closed ? (initial === "declined" ? "Declined" : "Expired") : "Valid until"}</div><div style={metaValue}>{validUntil || "—"}</div></div>
              <div><div style={kicker}>Fees shown</div><div style={metaValue}>{view === "year" ? (hasMonthly ? "First year" : "Per year") : "Monthly"}</div></div>
            </div>
            {summary.description ? (
              <p style={{ margin: 0, padding: "0 clamp(24px,4vw,48px) 28px", fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: "#52525B", maxWidth: 900 }}>{summary.description}</p>
            ) : null}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "0 clamp(24px,4vw,48px) 24px" }}>
              <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.03em" }}>Scope and fees</div>
              <button
                onClick={downloadPdf}
                style={{ position: "relative", overflow: "hidden", height: 42, padding: "0 18px", display: "flex", alignItems: "center", gap: 8, borderRadius: 999, border: "1px solid #E4E4E7", background: "#FFFFFF", color: pdf === 1 || pdf === 2 ? "#FFFFFF" : INK, fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "color .3s" }}
              >
                <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: pdfW, background: INDIGO, transition: pdfT }} />
                <DocIcon />
                <span style={{ position: "relative" }}>{pdfLabel}</span>
              </button>
            </div>
            {cards
              .map((s, i) => ({ s, i }))
              .filter(({ s }) => on.has(s.key))
              .map(({ s, i }) => {
                const price = cardPrice(s, view);
                // The priced lines themselves: every line when a service is made of
                // several, and a lone line only when it carries its own arithmetic
                // ("Catch-up: 3 months x EUR 238 = EUR 714").
                const detail =
                  s.lines.length > 1
                    ? s.lines.map((l) => `${l.label} — ${fmtEur(l.amount)}`)
                    : s.lines.filter((l) => /\d/.test(l.label)).map((l) => l.label);
                const perFreq = price.per.replace(/^\/\s*/, "").toLowerCase() === price.freq.toLowerCase() ? price.per : `${price.per} · ${price.freq}`;
                return (
                  <div key={s.key} data-row={s.key} style={{ display: "flex", flexWrap: "wrap", gap: "18px 36px", padding: "28px clamp(24px,4vw,48px)", borderTop: "1px solid #E4E4E7" }}>
                    <div style={{ flex: "1 1 260px", display: "flex", gap: 16 }}>
                      <span style={{ paddingTop: 7, fontSize: 15, fontWeight: 600, letterSpacing: ".02em", color: INDIGO }}>{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15 }}>{s.word}</div>
                        <div style={{ marginTop: 6, fontFamily: BODY, fontSize: 15, lineHeight: 1.5, color: "#52525B" }}>{s.line}</div>
                      </div>
                    </div>
                    <div style={{ flex: "1.4 1 280px", display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
                      {[...detail, ...s.scope].map((it, k) => (
                        <div key={k} style={{ display: "flex", gap: 12, fontFamily: BODY, fontSize: 15, lineHeight: 1.5, color: "#3F3F46" }}>
                          <span className="a4-bullet" />
                          <span>{it}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ flex: "0 0 170px", textAlign: "right" }}>
                      <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.03em" }}>{fmtEur(price.amount)}</div>
                      <div style={{ marginTop: 4, fontFamily: BODY, fontSize: 13, lineHeight: 1.4, color: "#71717A" }}>{perFreq}</div>
                    </div>
                  </div>
                );
              })}
            {on.size === 0 ? (
              <div style={{ padding: "48px clamp(24px,4vw,48px)", borderTop: "1px solid #E4E4E7", fontSize: 20, fontWeight: 500, color: "#52525B", textAlign: "center" }}>
                Switch on at least one service above to see your quote.
              </div>
            ) : null}
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 32, padding: "32px clamp(24px,4vw,48px) 40px", borderTop: "1px solid #E4E4E7", background: "#FAFAFA" }}>
              <span style={{ padding: "6px 13px", borderRadius: 999, background: "rgba(9,9,11,.78)", color: "#FFFFFF", fontSize: 13, fontWeight: 500 }}>VAT added at 18% · registry fees at cost</span>
              <div style={{ width: "min(100%, 440px)", display: "flex", flexDirection: "column", gap: 12, fontFamily: BODY, fontSize: 16, fontWeight: 500, color: "#3F3F46" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span>Subtotal · {countLabel}</span>
                  <span style={{ color: INK }}>{fmtEur(totals.net, 2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                  <span>VAT 18%</span>
                  <span style={{ color: INK }}>{fmtEur(totals.vat, 2)}</span>
                </div>
                <div style={{ height: 1, margin: "6px 0", background: "#E4E4E7" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
                  <span style={{ fontFamily: SANS, fontSize: 20, fontWeight: 600, color: INK }}>Total {perLabel}</span>
                  <span style={{ fontFamily: SANS, fontSize: "clamp(34px,3.6vw,46px)", fontWeight: 600, letterSpacing: "-0.04em", ...gradText }}>{fmtEur(shown, 2)}</span>
                </div>
                {totals.alsoYearly || totals.alsoOneOff ? (
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, color: INDIGO, fontSize: 14 }}>
                    <span>Also on this quotation</span>
                    <span style={{ textAlign: "right" }}>
                      {[totals.alsoYearly ? `${fmtEur(totals.alsoYearly, 2)} /yr` : "", totals.alsoOneOff ? `${fmtEur(totals.alsoOneOff, 2)} one-off` : ""].filter(Boolean).join(" · ")} + VAT
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 04 WHY A4 */}
      <section data-sec="why" style={{ position: "relative", overflow: "hidden", padding: "clamp(120px,16vw,220px) clamp(20px,5vw,72px)", color: "#FFFFFF", background: DARK_GRID }}>
        <DriftGlow left="40%" top="-10%" strength={0.24} />
        <SweepSlab />
        <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
          <div data-fx="big" style={{ fontSize: "clamp(56px,13.5vw,250px)", fontWeight: 600, letterSpacing: "-0.05em", lineHeight: 0.98, paddingBottom: ".06em", ...gradText }}>
            AI-native
          </div>
          <div data-fx="big" data-d="150" style={{ fontSize: "clamp(56px,13.5vw,250px)", fontWeight: 600, letterSpacing: "-0.05em", lineHeight: 0.98, color: "#FFFFFF" }}>
            {hasAudit ? "audit." : "accounting."}
          </div>
          <p data-fx="rise" data-d="650" style={{ margin: "44px 0 0", fontSize: "clamp(20px,2.4vw,40px)", fontWeight: 500, letterSpacing: "-0.015em", color: "#A1A1AA" }}>
            We rebuilt the firm around it.
          </p>
        </div>
        <div style={{ position: "relative", maxWidth: 1280, margin: "clamp(110px,13vw,190px) auto 0", display: "flex", flexDirection: "column", gap: 20, fontSize: "clamp(34px,5.4vw,96px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.06 }}>
          <Words stagger={100} parts={[{ t: "The machines do the" }, { t: "volume.", g: true, style: { fontWeight: 600 } }]} />
          <Words d={420} stagger={100} parts={[{ t: "Our people do the" }, { t: "judgement.", g: true, style: { fontWeight: 600 } }]} />
        </div>
      </section>

      {/* 05 ONBOARDING */}
      <section data-sec="onboard" style={{ position: "relative", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", background: LIGHT_GLOW }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div data-fx="rise" className="a4-eyebrow" style={{ color: "#52525B" }}>
            <span style={{ color: INDIGO }}>02</span>
            <span>After you accept</span>
          </div>
          <h2 data-fx="rise" data-d="100" style={{ margin: "16px 0 0", fontSize: "clamp(40px,5.6vw,92px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.02 }}>
            How onboarding <span style={gradText}>works.</span>
          </h2>
          <div data-tl="" style={{ position: "relative", marginTop: "clamp(56px,7vw,96px)" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 11, height: 2, background: "#E4E4E7" }} />
            <div data-tl-fill="" style={{ position: "absolute", left: 0, right: 0, top: 11, height: 2, background: GRAD }} />
            <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "48px 32px" }}>
              {[
                ["Accept", "Accept this quotation online. We'll come back to you within one working day."],
                ["Onboarding", "We complete our client due diligence and send the engagement letter."],
                ["Your portal", "Your own portal. Upload once — not across a year of email attachments."],
                ["Work begins", "What's done, what's in progress and what's coming up."],
              ].map(([title, body], i) => (
                <div key={title} data-fx="rise" data-d={i * 100}>
                  <div style={{ position: "relative", width: 24, height: 24, borderRadius: "50%", background: "#FFFFFF", border: "2px solid #E4E4E7" }}>
                    <span data-tl-dot="" style={{ position: "absolute", inset: 3, borderRadius: "50%", background: INDIGO, transition: "transform .45s cubic-bezier(.16,1,.3,1)" }} />
                  </div>
                  <div style={{ marginTop: 28, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: INDIGO }}>{String(i + 1).padStart(2, "0")}</div>
                  <div style={{ marginTop: 8, fontSize: 30, fontWeight: 600, letterSpacing: "-0.03em" }}>{title}</div>
                  <p style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: "#52525B", textWrap: "pretty" }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 06 PORTAL */}
      <section data-sec="portal" style={{ position: "relative", overflow: "hidden", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px) clamp(130px,15vw,210px)", background: MUTED_GLOW }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ textAlign: "center", fontSize: "clamp(42px,6.4vw,120px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.1 }}>
            <TypeText segments={[{ t: "Your own ", c: INK }, { t: "portal.", g: true }]} per={42} style={{ display: "inline-block" }} />
            <Words d={760} style={{ fontWeight: 600 }} parts={[{ t: "For every engagement." }]} />
          </div>
          <div data-fx="rise" data-d="950" style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/a4/powered-by-vacei-ink.png" alt="Powered by Vacei" style={{ height: 32, width: "auto", display: "block" }} />
          </div>
          <div data-fx="rise" style={{ marginTop: 56, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            {SCREENS.map((p, i) => {
              const a = i === screen;
              return (
                <button
                  key={p.n}
                  onClick={() => {
                    userPicked.current = true;
                    setScreen(i);
                  }}
                  style={{ height: 48, padding: "0 20px", display: "flex", alignItems: "center", gap: 10, borderRadius: 999, border: `1px solid ${a ? "#E4E4E7" : "transparent"}`, background: a ? "#FFFFFF" : "transparent", color: a ? INK : "#52525B", boxShadow: a ? "0 10px 30px rgba(9,9,11,.08)" : "none", fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "background .3s, color .3s, box-shadow .3s, border-color .3s" }}
                >
                  <span style={{ color: a ? INDIGO : "#A1A1AA" }}>{p.n}</span>
                  {p.title}
                </button>
              );
            })}
          </div>
          <div data-stage="" data-cw="1600" data-ch="980" style={{ position: "relative", marginTop: 40, width: "100%", aspectRatio: "1600 / 980", perspective: 2200 }}>
            <div data-cam="" style={{ position: "absolute", left: 0, top: 0, width: 1600, height: 980, transformOrigin: "0 0", transform: "scale(.5)" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 18, overflow: "hidden", background: "#E5E8EA", border: "1px solid #E4E4E7", boxShadow: "0 50px 120px rgba(9,9,11,.28)" }}>
                {SCREENS.map((p, i) => {
                  const a = i === screen;
                  return (
                    <div key={p.n} style={{ position: "absolute", left: 0, top: 40, width: 1600, height: 940, overflow: "hidden", opacity: a ? 1 : 0, transform: `translateY(${a ? 0 : 28}px)`, transition: "opacity .6s cubic-bezier(.65,0,.35,1), transform .7s cubic-bezier(.16,1,.3,1)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.src} alt={p.alt} draggable={false} loading={i === 0 ? "eager" : "lazy"} style={{ position: "absolute", left: 0, top: 0, width: 1600, height: "auto", display: "block" }} />
                      {p.hideNote ? <div style={{ position: "absolute", left: 480, top: 796, width: 640, height: 34, background: "#E5E8EA" }} /> : null}
                    </div>
                  );
                })}
                <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 40, zIndex: 2, display: "flex", alignItems: "center", gap: 8, padding: "0 18px", background: "#FAFAFA", borderBottom: "1px solid #E4E4E7" }}>
                  <span style={{ width: 11, height: 11, borderRadius: 6, background: "#E4E4E7" }} />
                  <span style={{ width: 11, height: 11, borderRadius: 6, background: "#E4E4E7" }} />
                  <span style={{ width: 11, height: 11, borderRadius: 6, background: "#E4E4E7" }} />
                  <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 10, height: 26, padding: "0 14px", borderRadius: 13, background: "#F4F4F5", fontSize: 14, fontWeight: 600, color: "#27272A", whiteSpace: "nowrap" }}>
                    <svg viewBox="0 0 515.6 516.5" style={{ height: 14, width: 14, display: "block" }} aria-hidden="true">
                      <path d={MARK_S} fill={INK} />
                      <path d={MARK_F} fill={INK} fillRule="evenodd" />
                    </svg>
                    Your client portal<span style={{ fontWeight: 500, color: "#A1A1AA" }}>Powered by Vacei</span>
                  </span>
                </div>
                <div style={{ position: "absolute", right: 24, top: 60, zIndex: 3, padding: "8px 16px", borderRadius: 999, background: "rgba(9,9,11,.78)", color: "#FFFFFF", fontSize: 18, fontWeight: 500 }}>
                  Sample data · fictional companies
                </div>
              </div>
            </div>
            <div
              data-portal-pill=""
              data-fx="rise"
              data-d="200"
              style={{ position: "absolute", left: "clamp(10px,3vw,40px)", bottom: "clamp(-44px,-3.4vw,-20px)", zIndex: 4, maxWidth: "calc(100% - 20px)", padding: "18px 26px 20px", borderRadius: 22, background: "rgba(255,255,255,.96)", border: "1px solid #E4E4E7", boxShadow: "0 30px 80px rgba(9,9,11,.22)" }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "2px 12px" }}>
                <span style={{ fontSize: "clamp(24px,2.4vw,34px)", fontWeight: 600, letterSpacing: "-0.04em", ...gradText }}>{SCREENS[screen].n}</span>
                <span style={{ fontSize: "clamp(20px,2.1vw,30px)", fontWeight: 600, letterSpacing: "-0.03em" }}>{SCREENS[screen].title}</span>
                <span style={{ fontSize: "clamp(20px,2.1vw,30px)", fontWeight: 500, letterSpacing: "-0.03em", color: "#52525B" }}>{SCREENS[screen].sub}</span>
              </div>
              <div style={{ marginTop: 6, fontSize: "clamp(15px,1.3vw,18px)", fontWeight: 500, color: "#52525B" }}>{SCREENS[screen].caption}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 07 TERMS */}
      <section data-sec="terms" style={{ position: "relative", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "56px 72px" }}>
          <div>
            <div data-fx="rise" className="a4-eyebrow" style={{ color: "#52525B" }}>
              <span style={{ color: INDIGO }}>03</span>
              <span>Terms &amp; validity</span>
            </div>
            <div data-fx="rise" data-d="100" style={{ marginTop: 18, fontSize: "clamp(40px,5.2vw,84px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.05 }}>
              {closed ? (initial === "declined" ? "Declined on" : "Expired on") : "Valid until"}
            </div>
            <div data-fx="rise" data-d="200" style={{ fontSize: "clamp(40px,5.2vw,84px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.1, paddingBottom: ".08em", ...gradText }}>
              {validUntil || "—"}
            </div>
          </div>
          <div data-fx="rise" data-d="150" style={{ display: "flex", flexDirection: "column" }}>
            {terms.map((t, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: 12, padding: "22px 0", borderTop: "1px solid #E4E4E7", ...(i === terms.length - 1 ? { borderBottom: "1px solid #E4E4E7" } : null) }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: INDIGO }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: "#3F3F46" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 08 ACCEPT */}
      <section id="accept" data-sec="accept" style={{ position: "relative", overflow: "hidden", padding: "clamp(110px,14vw,190px) clamp(20px,5vw,72px) 56px", color: "#FFFFFF", background: DARK_GRID }}>
        <DriftGlow left="-10%" top="-20%" strength={0.26} />
        <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))", gap: "56px 72px", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "clamp(44px,6.4vw,112px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.06 }}>
              <TypeText segments={[{ t: initial === "accepted" ? "You accepted your" : "Accept your", c: "#FFFFFF" }]} per={45} caret={PERI} style={{ display: "inline-block" }} />
              <Words d={560} style={{ fontWeight: 600 }} parts={[{ t: "quotation.", g: true }]} />
            </div>
            <p data-fx="rise" data-d="700" style={{ margin: "28px 0 0", fontSize: "clamp(18px,1.8vw,24px)", fontWeight: 500, letterSpacing: "-0.015em", color: "#A1A1AA" }}>
              {countLabel} for {client}.
            </p>
            <div data-fx="rise" data-d="820" style={{ marginTop: 20, display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: "clamp(40px,4.4vw,64px)", fontWeight: 600, letterSpacing: "-0.04em", ...gradText }}>{fmtEur(shown)}</span>
              <span style={{ fontFamily: BODY, fontSize: 16, fontWeight: 500, color: "#A1A1AA" }}>{perLabel} incl. VAT</span>
            </div>
            {totals.alsoYearly || totals.alsoOneOff ? (
              <p data-fx="rise" data-d="900" style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 15, fontWeight: 500, color: "#A1A1AA" }}>
                Plus {[totals.alsoYearly ? `${fmtEur(totals.alsoYearly)} /yr` : "", totals.alsoOneOff ? `${fmtEur(totals.alsoOneOff)} one-off` : ""].filter(Boolean).join(" and ")}, before VAT.
              </p>
            ) : null}
          </div>

          <div data-accept-card="" data-fx="rise" data-d="200" style={{ position: "relative", padding: "clamp(24px,3.4vw,40px)", borderRadius: 28, background: "rgba(24,24,27,.92)", border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 40px 100px rgba(0,0,0,.45)" }}>
            {accepted ? (
              <div data-stamp="" style={{ position: "absolute", right: "clamp(-8px,-1vw,0px)", top: -34, zIndex: 3, display: "flex", alignItems: "center", gap: 10, padding: "10px 22px", border: `5px solid ${INDIGO}`, borderRadius: 18, background: "rgba(9,9,11,.92)", color: PERI, fontSize: "clamp(28px,3vw,40px)", fontWeight: 700, letterSpacing: ".06em", transform: "rotate(-8deg)", pointerEvents: "none" }}>
                <Check size={36} color={PERI} width={3} />
                ACCEPTED
              </div>
            ) : null}
            {closed ? (
              <div>
                <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.03em" }}>
                  {initial === "declined" ? "This quotation was declined." : `This quotation expired${validUntil ? ` on ${validUntil}` : ""}.`}
                </div>
                <p style={{ margin: "12px 0 0", fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: "#D4D4D8" }}>
                  Ask us for an updated one — we&apos;ll refresh the figures and send you a new link, usually within one working day.
                </p>
                <a href={`${CONTACT_EMAIL_HREF}?subject=${encodeURIComponent(`Updated quotation — ${ref}`)}`} className="a4-btn a4-btn-light" style={{ marginTop: 28, width: "100%", height: 64, fontSize: 19 }}>
                  Ask for an updated quotation
                </a>
              </div>
            ) : (
              <>
                <label htmlFor="q-name" style={{ display: "block", fontSize: 15, fontWeight: 600, color: "#E4E4E7" }}>
                  Full name
                </label>
                <input
                  id="q-name"
                  value={accepted ? acceptedBy || name : name}
                  onChange={(e) => setName(e.target.value)}
                  readOnly={accepted}
                  autoComplete="name"
                  maxLength={120}
                  placeholder="e.g. Maria Borg"
                  className="a4-input-dark"
                  style={{ marginTop: 10 }}
                />
                <div
                  onClick={() => {
                    if (!accepted) setAgree((a) => !a);
                  }}
                  onKeyDown={(e) => {
                    if (!accepted && (e.key === " " || e.key === "Enter")) {
                      e.preventDefault();
                      setAgree((a) => !a);
                    }
                  }}
                  role="checkbox"
                  aria-checked={accepted || agree}
                  tabIndex={0}
                  style={{ marginTop: 20, display: "flex", gap: 14, alignItems: "flex-start", cursor: accepted ? "default" : "pointer", userSelect: "none", outline: "none" }}
                >
                  <span style={{ flexShrink: 0, width: 24, height: 24, marginTop: 1, borderRadius: 7, border: `1.5px solid ${agree || accepted ? INDIGO : "#71717A"}`, background: agree || accepted ? INDIGO : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .25s, border-color .25s" }}>
                    {agree || accepted ? <Check /> : null}
                  </span>
                  <span style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: "#D4D4D8" }}>
                    I accept this quotation and its terms on behalf of {client}.
                  </span>
                </div>
                <div style={{ position: "relative", marginTop: 28 }}>
                  {accepted ? (
                    <>
                      <div data-ring="" style={{ position: "absolute", inset: 0, borderRadius: 32, border: `3px solid ${PERI}`, opacity: 0, pointerEvents: "none" }} />
                      <div data-ring="" style={{ position: "absolute", inset: 0, borderRadius: 32, border: `3px solid ${PERI}`, opacity: 0, pointerEvents: "none" }} />
                    </>
                  ) : null}
                  <button
                    onClick={accept}
                    disabled={busy}
                    style={{
                      position: "relative", width: "100%", height: 64, borderRadius: 32, border: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                      background: accepted ? INDIGO : "#FFFFFF", color: accepted ? "#FFFFFF" : INK,
                      opacity: accepted || canAccept ? 1 : 0.55, boxShadow: accepted ? "0 24px 60px rgba(79,85,241,.45)" : "none",
                      fontSize: 19, fontWeight: 600, cursor: accepted ? "default" : "pointer", transition: "background .35s, color .35s, opacity .3s, box-shadow .35s",
                    }}
                  >
                    {accepted ? <Check size={20} width={3} /> : null}
                    {accepted ? "Quotation accepted" : busy ? "Accepting…" : "Accept quotation"}
                  </button>
                </div>
                <p role="status" aria-live="polite" style={{ margin: "16px 0 0", textAlign: "center", fontFamily: BODY, fontSize: 14, lineHeight: 1.5, color: noteC }}>
                  {acceptNote}
                </p>
              </>
            )}
          </div>
        </div>

        <div style={{ position: "relative", maxWidth: 1280, margin: "clamp(120px,14vw,200px) auto 0", paddingTop: "clamp(72px,8vw,112px)", borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <GlitchLockup tagline="Accounting that works differently.">
            <div data-glitch-after="" style={{ marginTop: 28, display: "inline-flex", alignItems: "center", height: 56, padding: "0 24px", borderRadius: 28, border: "1px solid rgba(255,255,255,.22)", background: "rgba(255,255,255,.06)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/a4/powered-by-vacei-white.png" alt="Powered by Vacei" style={{ height: 26, width: "auto", display: "block" }} />
            </div>
            <a data-glitch-after="" href="https://a4.com.mt" style={{ marginTop: 28, fontSize: 22, fontWeight: 500, color: "#FFFFFF", textDecoration: "none" }}>
              a4.com.mt
            </a>
          </GlitchLockup>
        </div>
        <div style={{ position: "relative", maxWidth: 1280, margin: "96px auto 0", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, fontFamily: BODY, fontSize: 13, color: "#71717A" }}>
          <span>
            Quotation {ref} · {client}
          </span>
          <span>
            Questions? <a href={CONTACT_EMAIL_HREF} style={{ color: "#A1A1AA" }}>{CONTACT_EMAIL}</a> · A4 Services Limited, Malta
          </span>
        </div>
      </section>

      {/* STICKY TOTAL */}
      <div
        style={{ position: "fixed", left: 0, right: 0, bottom: 20, zIndex: 40, display: "flex", justifyContent: "center", padding: "0 12px", pointerEvents: "none", transform: `translateY(${pillOn ? 0 : 120}px)`, opacity: pillOn ? 1 : 0, transition: "transform .5s cubic-bezier(.16,1,.3,1), opacity .4s" }}
      >
        <div style={{ pointerEvents: pillOn ? "auto" : "none", maxWidth: "100%", display: "flex", alignItems: "center", gap: 14, height: 60, padding: "0 8px 0 22px", borderRadius: 30, background: "rgba(9,9,11,.92)", border: "1px solid rgba(255,255,255,.12)", boxShadow: "0 24px 60px rgba(9,9,11,.35)", color: "#FFFFFF", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
          <span className="q-hide-xs" style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: "#A1A1AA", whiteSpace: "nowrap" }}>{countLabel}</span>
          <span className="q-hide-xs" style={{ width: 1, height: 22, background: "rgba(255,255,255,.14)" }} />
          <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.03em", whiteSpace: "nowrap", backgroundImage: "linear-gradient(90deg,#6468F3 0%,#8B8FF7 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>
            {fmtEur(shown)}
          </span>
          <span style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: "#A1A1AA", whiteSpace: "nowrap" }}>{perLabel}</span>
          <button onClick={() => go("#quote")} style={{ height: 44, padding: "0 18px", borderRadius: 22, border: 0, background: "#FFFFFF", color: INK, fontSize: 15, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            View quote
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) { .q-hide-sm { display: none !important; } }
        @media (max-width: 420px) { .q-hide-xs { display: none !important; } }
        [role="switch"]:focus-visible { box-shadow: 0 0 0 3px rgba(79,85,241,.55) !important; }
        [role="checkbox"]:focus-visible > span:first-child { box-shadow: 0 0 0 3px rgba(79,85,241,.55); }
      `}</style>
    </div>
  );
}
