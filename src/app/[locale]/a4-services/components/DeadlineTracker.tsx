// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button, Icon, Container, Eyebrow, Reveal } from "@/components/a4-landing/Primitives";
import {
  getNextComplianceDeadline,
  getNextComplianceDeadlines,
  formatComplianceDate,
  COMPLIANCE_DL_RULES,
} from "@/lib/compliance-deadlines";

const DL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DL_WD = ["M", "T", "W", "T", "F", "S", "S"];

function dlMonthDeadlines(y, m) {
  const out = [];
  for (const r of COMPLIANCE_DL_RULES) {
    if ("monthly" in r && r.monthly) out.push({ name: r.name, date: new Date(y, m + 1, 0, 17, 0, 0) });
    else if ("dates" in r && r.dates) {
      for (const [mm, day] of r.dates) {
        if (mm === m) out.push({ name: r.name, date: new Date(y, mm, day, 17, 0, 0) });
      }
    }
  }
  return out.sort((a, b) => a.date - b.date);
}

const dlDM = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const dlSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const dlDays = (a, b) => Math.max(0, Math.ceil((a - b) / 86400000));

export function DLDrawer({ now, open, onClose }) {
  const upcoming = getNextComplianceDeadlines(now, 6);
  const [view, setView] = useState(() => ({ y: now.getFullYear(), m: now.getMonth() }));
  const [mounted, setMounted] = useState(false);
  const monthDeads = dlMonthDeadlines(view.y, view.m);
  const marked = new Set(monthDeads.map((d) => d.date.getDate()));
  const firstWd = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const daysIn = new Date(view.y, view.m + 1, 0).getDate();
  const cells = []; for (let i = 0; i < firstWd; i++) cells.push(null); for (let d = 1; d <= daysIn; d++) cells.push(d);
  const move = (n) => { let m = view.m + n, y = view.y; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } setView({ y, m }); };
  const navBtn = { width: 30, height: 30, display: "grid", placeItems: "center", background: "none", border: "none", cursor: "pointer", color: "var(--a4-on-dark-mute)" };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        onClick={onClose}
        aria-hidden={!open}
        className="fixed inset-0 bg-black/50 transition-opacity duration-300"
        style={{ zIndex: 550, opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Compliance calendar"
        className="fixed top-0 right-0 flex h-full w-[min(420px,100vw)] flex-col overflow-y-auto border-l border-[var(--a4-hairline-dark)] transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] pb-[env(safe-area-inset-bottom,0px)]"
        style={{
          zIndex: 551,
          background: "#0b0c0e",
          transform: open ? "translateX(0)" : "translateX(100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "clamp(16px,4vw,22px) clamp(16px,4vw,24px)", borderBottom: "1px solid var(--a4-hairline-dark)" }}>
          <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: "clamp(17px,4vw,19px)", color: "#fff", letterSpacing: "-.2px" }}>Compliance calendar</span>
          <button onClick={onClose} aria-label="Close" style={{ ...navBtn, width: 34, height: 34 }}><Icon name="x" size={20} color="var(--a4-on-dark-mute)" /></button>
        </div>

        {/* plain month grid */}
        <div style={{ padding: "clamp(16px,4vw,22px) clamp(14px,3.5vw,24px)", borderBottom: "1px solid var(--a4-hairline-dark)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <button onClick={() => move(-1)} aria-label="Previous" style={navBtn}><Icon name="chevron-left" size={18} color="var(--a4-on-dark-mute)" /></button>
            <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 14.5, fontWeight: 600, color: "#fff" }}>{DL_MONTHS[view.m]} {view.y}</span>
            <button onClick={() => move(1)} aria-label="Next" style={navBtn}><Icon name="chevron-right" size={18} color="var(--a4-on-dark-mute)" /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px 0" }}>
            {DL_WD.map((w, i) => (<div key={i} style={{ textAlign: "center", fontFamily: "var(--a4-font-body)", fontSize: 11, color: "var(--a4-stone)", paddingBottom: 8 }}>{w}</div>))}
            {cells.map((d, i) => {
              if (d === null) return <div key={"e" + i} />;
              const date = new Date(view.y, view.m, d);
              const isToday = dlSameDay(date, now);
              const has = marked.has(d);
              return (
                <div key={d} style={{ height: "clamp(32px, 8vw, 38px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                  <span style={{ fontFamily: "var(--a4-font-body)", fontSize: "clamp(12px, 3.2vw, 13.5px)", fontWeight: has || isToday ? 600 : 400, color: has ? "#fff" : isToday ? "var(--a4-primary-bright)" : "var(--a4-on-dark-mute)", textDecoration: isToday ? "underline" : "none", textUnderlineOffset: 3 }}>{d}</span>
                  <span style={{ width: 4, height: 4, borderRadius: 999, background: has ? "var(--a4-primary-bright)" : "transparent" }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* plain upcoming list */}
        <div style={{ padding: "clamp(16px,4vw,20px) clamp(16px,4vw,24px)" }}>
          <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--a4-stone)", marginBottom: 6 }}>Upcoming filings</div>
          {upcoming.map((it, i) => (
            <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "14px 0", borderBottom: i < upcoming.length - 1 ? "1px solid var(--a4-hairline-dark)" : "none" }}>
              <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, color: "var(--a4-on-dark-mute)", width: 56, flexShrink: 0 }}>{dlDM(it.date)}</span>
              <span style={{ flex: 1, fontFamily: "var(--a4-font-body)", fontSize: 14.5, color: "#fff" }}>{it.name}</span>
              <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-stone)", flexShrink: 0 }}>{dlDays(it.date, now)}d</span>
            </div>
          ))}
        </div>
      </aside>
    </>,
    document.body,
  );
}

export function DeadlineTracker() {
  const [now, setNow] = useState(() => new Date());
  const [open, setOpen] = useState(false);
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(id); }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey); return () => document.removeEventListener("keydown", onKey);
  }, []);

  const next = getNextComplianceDeadline(now);

  return (
    <section style={{ background: "#000", padding: "clamp(56px,8vw,96px) 0", borderTop: "1px solid var(--a4-hairline-dark)" }}>
      <Container>
        <Reveal className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-7">
          <div className="min-w-0" style={{ maxWidth: 560 }}>
            <Eyebrow dark>Malta compliance</Eyebrow>
            <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 400, color: "#fff", fontSize: "clamp(20px,3vw,30px)", lineHeight: 1.15, letterSpacing: "-.015em", margin: "14px 0 0", textWrap: "balance" }}>We never miss a filing deadline.</h2>
            <p style={{ fontFamily: "var(--a4-font-body)", fontSize: "clamp(15px,2.5vw,17px)", lineHeight: 1.55, color: "var(--a4-on-dark-mute)", margin: "14px 0 0", textWrap: "pretty" }}>
              As your accountants and auditors, we track every statutory date and file on time. Next up: <strong style={{ color: "#fff", fontWeight: 600 }}>{next.name}</strong>, due {formatComplianceDate(next.date)}.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:shrink-0">
            <Button variant="outline-dark" size="lg" onClick={() => setOpen(true)} style={{ width: "100%", minWidth: 0 }}>View compliance calendar <Icon name="arrow-right" size={18} color="#fff" /></Button>
            <Button variant="primary" size="lg" href="/compliance-calendar" style={{ width: "100%", minWidth: 0 }}>Download 2026 calendar <Icon name="download" size={18} color="#000" /></Button>
          </div>
        </Reveal>
      </Container>
      <DLDrawer now={now} open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
