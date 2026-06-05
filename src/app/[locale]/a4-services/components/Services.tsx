// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Logo, Button, Pill, Badge, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
// portal (audit dashboard) shown full-width as the product hero, above the
// firm's full service list. Names are illustrative (Meridian Holdings Ltd /
// Daniel Camilleri). Static — no animation.

const SVC_LIST = [
  { icon: "file-check-2", name: "Statutory audit", hint: "GAPSME / IFRS financial statements, signed by a licensed audit firm." },
  { icon: "book-open-check", name: "Accounting, bookkeeping & VAT", hint: "Automated processing and VAT returns, reviewed every month." },
  { icon: "users", name: "Payroll", hint: "FS5 submissions, payslips and SSC compliance." },
  { icon: "landmark", name: "Tax & MBR filings", hint: "Corporate & personal tax and your MBR annual return." },
];

const PDASH_NAV = [
  { l: "Dashboard", i: "layout-grid", active: true },
  { l: "Documents", i: "folder", b: 4 },
  { l: "Compliance", i: "shield-check" },
  { l: "Filings", i: "file-text" },
];

const PDASH_NEED = [
  { icon: "table-2", t: "Trial balance at period end", due: "Due Jun 11" },
  { icon: "landmark", t: "Bank statements & confirmations", due: "Due Jun 18" },
  { icon: "users-round", t: "Aged debtor & creditor listings", due: "Due Jun 25" },
];

export function PDChip({ children, style }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-full)", padding: "7px 13px", ...style }}>{children}</span>;
}
export function PDBadge({ n }) {
  return <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 10.5, fontWeight: 700, color: "var(--a4-on-dark-mute)", background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: 999, padding: "1px 7px", lineHeight: 1.5 }}>{n}</span>;
}

export function PortalDashboardMock() {
  return (
    <div style={{ background: "#000", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-xl)", overflow: "hidden", boxShadow: "0 40px 100px -40px rgba(0,0,0,.95)" }}>
      {/* top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "14px 18px", borderBottom: "1px solid var(--a4-hairline-dark)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
          <img src="/assets/a4-mark-white.png" alt="" style={{ width: 20, height: 20, opacity: .92, flexShrink: 0 }} />
          <span style={{ width: 28, height: 28, borderRadius: 8, background: "var(--a4-surface-deep)", display: "grid", placeItems: "center", fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>M</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>Meridian Holdings Ltd</div>
            <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 9.5, fontWeight: 600, letterSpacing: ".1em", color: "var(--a4-stone)" }}>CLIENT PORTAL</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ textAlign: "right" }} className="pd-hide-sm">
            <span style={{ display: "block", fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, color: "#fff" }}>Daniel Camilleri</span>
            <span style={{ display: "block", fontFamily: "var(--a4-font-body)", fontSize: 9, fontWeight: 700, letterSpacing: ".05em", color: "var(--accent-warning)" }}>OWNER</span>
          </span>
          <span style={{ width: 30, height: 30, borderRadius: 999, background: "var(--a4-primary)", display: "grid", placeItems: "center", fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>DC</span>
        </div>
      </div>

      {/* nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderBottom: "1px solid var(--a4-hairline-dark)", overflowX: "auto" }} className="pd-nav">
        {PDASH_NAV.map((n) => (
          <span key={n.l} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: "var(--a4-r-full)", flexShrink: 0, background: n.active ? "#fff" : "transparent" }}>
            <Icon name={n.i} size={15} color={n.active ? "#000" : "var(--a4-on-dark-mute)"} stroke={1.9} />
            <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, color: n.active ? "#000" : "var(--a4-on-dark-mute)" }}>{n.l}</span>
            {n.b ? <PDBadge n={n.b} /> : null}
          </span>
        ))}
      </div>

      {/* body */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr .9fr", gap: 28, padding: "clamp(22px,3vw,40px)", alignItems: "start" }} className="svc-grid">
        <div>
          <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--a4-primary-bright)" }}>Your audit · A4 Services Ltd</div>
          <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "#fff", fontSize: "clamp(30px,4vw,52px)", lineHeight: 1.04, letterSpacing: "-.02em", margin: "14px 0 0", textWrap: "balance" }}>Meridian Holdings Ltd</h3>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 15, lineHeight: 1.55, color: "var(--a4-on-dark-mute)", margin: "16px 0 0", maxWidth: 440 }}>Audit 2025 · Independent examination of your financial statements, managed end-to-end by A4.</p>

          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 30, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: "clamp(44px,6vw,68px)", color: "#fff", letterSpacing: "-2px", lineHeight: 1 }}>33%</span>
            <div>
              <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--a4-stone)" }}>Overall progress</div>
              <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, color: "var(--a4-accent-teal)", marginTop: 5 }}>On track · updated just now</div>
            </div>
          </div>
          <div style={{ height: 7, borderRadius: 999, background: "var(--a4-surface-elevated)", overflow: "hidden", marginTop: 16, maxWidth: 560 }}>
            <div style={{ height: "100%", width: "33%", borderRadius: 999, background: "var(--a4-primary-bright)" }} />
          </div>

          <div className="pd-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3,auto)", gap: "0 48px", marginTop: 26 }}>
            {[["Documents provided", "2 of 6"], ["Period", "31 Dec 2024"], ["Target", "Sep 2026"]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--a4-stone)" }}>{k}</div>
                <div style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 22, color: "#fff", marginTop: 6, letterSpacing: "-.3px" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* what we need from you */}
        <div style={{ background: "var(--a4-surface-elevated)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", padding: "20px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
            <Icon name="inbox" size={17} color="#fff" />
            <span style={{ flex: 1, fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 17, color: "#fff", letterSpacing: "-.2px" }}>What we need from you</span>
            <PDBadge n={4} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PDASH_NEED.map((it) => (
              <div key={it.t} style={{ display: "flex", alignItems: "center", gap: 12, background: "#000", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-md)", padding: "12px 13px" }}>
                <span style={{ width: 32, height: 32, borderRadius: "var(--a4-r-md)", background: "var(--a4-surface-deep)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name={it.icon} size={16} color="var(--a4-on-dark-mute)" stroke={1.8} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.t}</div>
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, fontWeight: 600, color: "var(--accent-warning)", marginTop: 2 }}>{it.due}</div>
                </div>
              </div>
            ))}
          </div>
          <button style={{ width: "100%", marginTop: 16, height: 44, borderRadius: "var(--a4-r-full)", border: 0, background: "#fff", color: "#000", fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>Upload documents <Icon name="arrow-right" size={16} color="#000" /></button>
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--a4-hairline-dark)", padding: "13px 20px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, color: "var(--a4-on-dark-mute)" }}><Icon name="refresh-cw" size={14} color="var(--a4-accent-teal)" /> Every entry reflected on</span>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {[["/assets/logo-xero.png", "Xero"], ["/assets/logo-quickbooks.png", "QuickBooks"], ["/assets/logo-sage.png", "Sage"]].map(([src, alt]) => (
            <img key={alt} src={src} alt={alt} style={{ height: 28, width: "auto", display: "block" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Services() {
  return (
    <section id="services" style={{ background: "#000", padding: "clamp(64px,9vw,112px) 0" }}>
      <Container>
        <Reveal><SectionHead
          dark align="center"
          eyebrow="What we do"
          title="Every service, in one portal"
          sub="One licensed firm for the full financial stack — track every engagement, document and deadline in your A4 client portal, handled end-to-end by our team."
          maxWidth={640}
        /></Reveal>

        <Reveal style={{ marginTop: 52 }}><PortalDashboardMock /></Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--a4-hairline-dark)", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", overflow: "hidden", marginTop: 20 }} className="svc-list4">
          {SVC_LIST.map((s) => (
            <Reveal key={s.name} style={{ background: "#000", padding: "24px 22px" }}>
              <Icon name={s.icon} size={22} color="var(--a4-primary-bright)" stroke={1.75} />
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 17.5, color: "#fff", margin: "16px 0 0", letterSpacing: "-.2px" }}>{s.name}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, lineHeight: 1.5, color: "var(--a4-on-dark-mute)", margin: "7px 0 0", textWrap: "pretty" }}>{s.hint}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
