"use client";

import React from "react";
import { Eyebrow, Icon } from "@/components/a4-landing/Primitives";
import { A4Mark, DARK_CARD, DARK_GRID, DriftGlow, GRAD, LetterWord, gradText } from "@/components/fx/primitives";
import { INDIGO, INK, PERI, gcol } from "@/lib/fx/engine";
import LocalizedLink from "@/components/common/LocalizedLink";
import { ServicesFilm } from "@/components/film/chapters";
import { SERVICE_KEY_TO_SLUG, serviceHref } from "@/data/a4ServicesSiteData";

// The portal (audit dashboard) shown full-width as the product hero, above the
// firm's service cards. Names are illustrative (Meridian Holdings Ltd /
// Daniel Camilleri). Static — no animation.

const BODY = "var(--a4x-body)";

type LetterFx = "scatter" | "tighten" | "cascade" | "stack" | "zoom" | "type";

/** Each service as a design card: a big letter-effect word, the line, a link pill to its page. */
const SVC_LIST: { word: string; fx: LetterFx; name: string; hint: string; href: string }[] = [
  {
    word: "Audit",
    fx: "tighten",
    name: "Statutory audit",
    hint: "GAPSME / IFRS financial statements, signed by a licensed audit firm.",
    href: serviceHref(SERVICE_KEY_TO_SLUG["audit-assurance"]),
  },
  {
    word: "Accounting",
    fx: "scatter",
    name: "Accounting, bookkeeping & VAT",
    hint: "Automated processing and VAT returns, reviewed every month.",
    href: serviceHref(SERVICE_KEY_TO_SLUG["accounting-finance"]),
  },
  {
    word: "Payroll",
    fx: "stack",
    name: "Payroll",
    hint: "FS5 submissions, payslips and SSC compliance.",
    href: serviceHref(SERVICE_KEY_TO_SLUG["vat-payroll"]),
  },
  {
    word: "Tax",
    fx: "type",
    name: "Tax & MBR filings",
    hint: "Corporate & personal tax and your MBR annual return.",
    href: serviceHref(SERVICE_KEY_TO_SLUG["tax-compliance"]),
  },
  {
    word: "Corporate",
    fx: "zoom",
    name: "Corporate & CSP services",
    // Copy rule: corporate/CSP work is delivered with licensed CSP partners.
    hint: "Company formation, MBR filings, shareholder services and ongoing corporate administration, with licensed CSP partners.",
    href: serviceHref(SERVICE_KEY_TO_SLUG["corporate-csp"]),
  },
];

const PDASH_NAV = [
  { l: "Dashboard", i: "layout-grid", active: true },
  { l: "Documents", i: "folder", b: 4 },
  { l: "Compliance", i: "shield-check" },
  { l: "Filings", i: "file-text" },
];

// Illustrative mock — dates are relative to today so this never goes stale
// (was hardcoded to "Jun 11/18/25", which reads as overdue once that date
// passes while the mock still says "On track · updated just now").
const PDASH_NEED_ITEMS = [
  { icon: "table-2", t: "Trial balance at period end", daysFromNow: 7 },
  { icon: "landmark", t: "Bank statements & confirmations", daysFromNow: 14 },
  { icon: "users-round", t: "Aged debtor & creditor listings", daysFromNow: 21 },
];

function pdDueLabel(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return `Due ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

const KICKER: React.CSSProperties = {
  fontFamily: BODY,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "#71717A",
};

export function PDChip({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(255,255,255,.04)",
        border: "1px solid rgba(255,255,255,.14)",
        borderRadius: 999,
        padding: "7px 13px",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function PDBadge({ n }: { n: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: BODY,
        fontSize: 10.5,
        fontWeight: 600,
        color: "#A1A1AA",
        background: "rgba(255,255,255,.06)",
        border: "1px solid rgba(255,255,255,.12)",
        borderRadius: 999,
        padding: "1px 7px",
        lineHeight: 1.5,
      }}
    >
      {n}
    </span>
  );
}

const HAIR = "1px solid rgba(255,255,255,.08)";

export function PortalDashboardMock() {
  const PDASH_NEED = PDASH_NEED_ITEMS.map((it) => ({ ...it, due: pdDueLabel(it.daysFromNow) }));
  return (
    <div
      style={{
        position: "relative",
        textAlign: "left",
        color: "#FFFFFF",
        background: "rgba(24,24,27,.92)",
        border: "1px solid rgba(255,255,255,.1)",
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: "0 50px 120px rgba(0,0,0,.45)",
      }}
    >
      <div style={{ padding: "12px 20px", borderBottom: HAIR }}>
        <span style={{ ...KICKER, display: "inline-flex", alignItems: "center", minHeight: 26, padding: "5px 12px", lineHeight: 1.35, borderRadius: 999, border: "1px solid rgba(255,255,255,.14)", color: "#A1A1AA" }}>
          Illustrative example — not a real client
        </span>
      </div>

      {/* top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "16px 20px", borderBottom: HAIR }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <A4Mark size={20} />
          <span aria-hidden="true" style={{ width: 1.5, height: 18, background: "#FFFFFF", opacity: 0.3, flexShrink: 0 }} />
          <span style={{ width: 30, height: 30, borderRadius: 9, background: "#27272A", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>M</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>Meridian Holdings Ltd</div>
            <div style={{ ...KICKER, fontSize: 10 }}>Client portal</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ textAlign: "right" }} className="pd-hide-sm">
            <span style={{ display: "block", fontSize: 13.5, fontWeight: 600 }}>Daniel Camilleri</span>
            <span style={{ ...KICKER, display: "block", fontSize: 10, color: PERI }}>Owner</span>
          </span>
          <span style={{ width: 32, height: 32, borderRadius: 999, background: GRAD, display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 600, flexShrink: 0 }}>DC</span>
        </div>
      </div>

      {/* nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderBottom: HAIR, overflowX: "auto" }} className="pd-nav">
        {PDASH_NAV.map((n) => (
          <span
            key={n.l}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 36,
              padding: "0 14px",
              borderRadius: 999,
              flexShrink: 0,
              background: n.active ? "#FFFFFF" : "transparent",
              color: n.active ? INK : "#A1A1AA",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <Icon name={n.i} size={15} color={n.active ? INK : "#A1A1AA"} stroke={1.9} />
            {n.l}
            {n.b ? <PDBadge n={n.b} /> : null}
          </span>
        ))}
      </div>

      {/* body */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr .9fr", gap: 28, padding: "clamp(24px,3.4vw,44px)", alignItems: "start" }} className="svc-grid">
        {/* minWidth 0: the one-line, ellipsised request titles must not set the column's minimum width */}
        <div style={{ minWidth: 0 }}>
          <div style={{ ...KICKER, fontSize: 12, color: PERI }}>Your audit · A4 Services Ltd</div>
          <h3 style={{ margin: "14px 0 0", fontSize: "clamp(30px,4vw,52px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.04, textWrap: "balance" }}>
            Meridian Holdings Ltd
          </h3>
          <p style={{ margin: "16px 0 0", maxWidth: 440, fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: "#A1A1AA" }}>
            Audit 2025 · Independent examination of your financial statements, managed end-to-end by A4.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 30, flexWrap: "wrap" }}>
            <span style={{ fontSize: "clamp(48px,6vw,72px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1, paddingBottom: ".04em", ...gradText }}>33%</span>
            <div>
              <div style={KICKER}>Overall progress</div>
              <div style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: PERI, marginTop: 5 }}>On track · updated just now</div>
            </div>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,.08)", overflow: "hidden", marginTop: 18, maxWidth: 560 }}>
            <div style={{ height: "100%", width: "33%", borderRadius: 999, background: GRAD }} />
          </div>

          <div className="pd-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3,auto)", gap: "0 48px", marginTop: 28 }}>
            {[
              ["Documents provided", "2 of 6"],
              ["Period", "31 Dec 2024"],
              ["Target", "Sep 2026"],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={KICKER}>{k}</div>
                <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 6 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* what we need from you */}
        <div style={{ minWidth: 0, background: "rgba(255,255,255,.03)", border: HAIR, borderRadius: 20, padding: "20px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
            <Icon name="inbox" size={17} color="#FFFFFF" />
            <span style={{ flex: 1, fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em" }}>What we need from you</span>
            <PDBadge n={4} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PDASH_NEED.map((it) => (
              <div key={it.t} style={{ display: "flex", alignItems: "center", gap: 12, background: INK, border: HAIR, borderRadius: 14, padding: "12px 13px" }}>
                <span style={{ width: 34, height: 34, borderRadius: 10, background: "#18181B", border: HAIR, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon name={it.icon} size={16} color="#A1A1AA" stroke={1.8} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: BODY, fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.t}</div>
                  <div style={{ fontFamily: BODY, fontSize: 12, fontWeight: 600, color: PERI, marginTop: 2 }}>{it.due}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Part of the illustration, not a control. */}
          <span
            aria-hidden="true"
            style={{ marginTop: 16, height: 44, borderRadius: 999, background: "#FFFFFF", color: INK, fontSize: 14.5, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            Upload documents <Icon name="arrow-right" size={16} color={INK} />
          </span>
        </div>
      </div>

      <div style={{ borderTop: HAIR, padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px 22px", flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: BODY, fontSize: 13, fontWeight: 600, color: "#A1A1AA" }}>
          <Icon name="refresh-cw" size={14} color={PERI} /> Every entry reflected on
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {["Xero", "QuickBooks", "Sage"].map((name) => (
            <span key={name} style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", color: "#D4D4D8" }}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const SERVICES_CSS = `
  .a4-svc-grid { display: grid; gap: 16px; grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .a4-svc-grid > * { grid-column: span 2; }
  .a4-svc-grid > :nth-child(4), .a4-svc-grid > :nth-child(5) { grid-column: span 3; }
  @media (max-width: 1100px) {
    .a4-svc-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .a4-svc-grid > *, .a4-svc-grid > :nth-child(4) { grid-column: span 1; }
    .a4-svc-grid > :nth-child(5) { grid-column: span 2; }
  }
  @media (max-width: 680px) {
    .a4-svc-grid { grid-template-columns: minmax(0, 1fr); }
    .a4-svc-grid > *, .a4-svc-grid > :nth-child(4), .a4-svc-grid > :nth-child(5) { grid-column: auto; }
  }
  .a4-svc-card { transition: border-color .35s, box-shadow .35s; }
  .a4-svc-card:hover { border-color: rgba(79,85,241,.45) !important; box-shadow: 0 24px 60px rgba(79,85,241,.18); }
  .a4-svc-card[data-dark]:hover { border-color: rgba(139,143,247,.45) !important; box-shadow: 0 24px 60px rgba(0,0,0,.35); }
`;

/** #services — the design's statement on dark, the portal mock, then the alternating service cards. */
export function Services() {
  const total = String(SVC_LIST.length).padStart(2, "0");
  return (
    <>
    <ServicesFilm />
    <section
      id="services"
      style={{ position: "relative", overflow: "hidden", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", color: "#FFFFFF", background: DARK_GRID, fontFamily: "var(--a4x-display)" }}
    >
      <style>{SERVICES_CSS}</style>
      <DriftGlow left="30%" top="-24%" strength={0.24} />
      <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "16px 48px" }}>
          <div>
            <Eyebrow dark>What we do</Eyebrow>
            <h2 data-fx="rise" data-d="80" style={{ margin: "14px 0 0", fontSize: "clamp(32px,4vw,60px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.04 }}>
              Explore each <span style={{ ...gradText, paddingBottom: ".06em" }}>service</span>
            </h2>
          </div>
          <p data-fx="rise" data-d="160" style={{ margin: 0, maxWidth: 460, fontFamily: "var(--a4x-body)", fontSize: 17, lineHeight: 1.55, color: "#A1A1AA", textWrap: "pretty" }}>
            Every engagement, document and deadline is tracked in your A4 client portal.
          </p>
        </div>

        <div className="a4-svc-grid" style={{ marginTop: 16 }}>
          {SVC_LIST.map((s, i) => {
            const dark = i % 2 === 1;
            const letters = Array.from(s.word);
            const n = letters.length;
            const colors = letters.map((_, j) => (dark ? "#FFFFFF" : gcol(n > 1 ? j / (n - 1) : 0)));
            return (
              <article
                key={s.name}
                data-fx="rise"
                data-d={i * 80}
                data-dark={dark ? "" : undefined}
                className="a4-svc-card"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  minHeight: 330,
                  padding: 28,
                  borderRadius: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  background: dark ? DARK_CARD : "#FFFFFF",
                  border: `1px solid ${dark ? "rgba(255,255,255,.08)" : "#E4E4E7"}`,
                  color: dark ? "#FFFFFF" : INK,
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: dark ? "#A1A1AA" : "#52525B" }}>
                  <span style={{ color: dark ? PERI : INDIGO }}>{String(i + 1).padStart(2, "0")}</span>
                  <span>/ {total}</span>
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", minHeight: 110 }}>
                  <LetterWord
                    text={s.word}
                    fx={s.fx}
                    d={220 + i * 90}
                    per={55}
                    colors={colors}
                    style={{ fontSize: "clamp(42px,4vw,60px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.1, whiteSpace: "nowrap" }}
                  />
                </div>
                <p style={{ margin: 0, fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.35, color: dark ? "#E4E4E7" : "#3F3F46", textWrap: "pretty" }}>
                  {s.hint}
                </p>
                <h3 style={{ margin: 0, paddingTop: 16, borderTop: `1px solid ${dark ? "rgba(255,255,255,.1)" : "#E4E4E7"}`, fontSize: 15 }}>
                  <LocalizedLink
                    href={s.href}
                    className={`a4-btn ${dark ? "a4-btn-ghost" : "a4-btn-outline"}`}
                    style={{ height: "auto", minHeight: 44, padding: "10px 18px", fontSize: 15, fontWeight: 600, lineHeight: 1.3, textDecoration: "none", whiteSpace: "normal", textAlign: "left" }}
                  >
                    {s.name} <Icon name="arrow-right" size={16} color={dark ? "#FFFFFF" : INK} />
                  </LocalizedLink>
                </h3>
              </article>
            );
          })}
        </div>
      </div>
    </section>
    </>
  );
}
