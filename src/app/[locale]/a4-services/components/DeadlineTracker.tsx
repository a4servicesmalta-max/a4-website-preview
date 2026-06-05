// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Logo, Button, Pill, Badge, Eyebrow, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
// compliance calendar. Minimal UI: a plain month grid with marked filing days
// and a simple upcoming list. Dates compute as the next future occurrence from
// the view date, so they never go stale.

const DL_RULES = [
  { name: "FS5 payroll & SSC", monthly: true },
  { name: "VAT return filing", dates: [[1, 15], [4, 15], [7, 15], [10, 15]] },
  { name: "Provisional tax instalment", dates: [[3, 30], [7, 31], [11, 21]] },
  { name: "MBR annual return", dates: [[6, 28]] },
  { name: "Audited accounts & tax return", dates: [[10, 30]] },
];
const DL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DL_WD = ["M", "T", "W", "T", "F", "S", "S"];

function dlMonthDeadlines(y, m) {
  const out = [];
  DL_RULES.forEach((r) => {
    if (r.monthly) out.push({ name: r.name, date: new Date(y, m + 1, 0, 17, 0, 0) });
    else r.dates.forEach(([mm, day]) => { if (mm === m) out.push({ name: r.name, date: new Date(y, mm, day, 17, 0, 0) }); });
  });
  return out.sort((a, b) => a.date - b.date);
}
function dlNextOccurrences(now) {
  const out = []; const y = now.getFullYear();
  const add = (name, d) => { if (d.getTime() > now.getTime()) out.push({ name, date: d }); };
  DL_RULES.forEach((r) => {
    if (r.monthly) { for (let i = 0; i < 14; i++) add(r.name, new Date(y, now.getMonth() + i + 1, 0, 17, 0, 0)); }
    else r.dates.forEach(([m, day]) => [y, y + 1].forEach((yy) => add(r.name, new Date(yy, m, day, 17, 0, 0))));
  });
  return out.sort((a, b) => a.date - b.date);
}
const dlDM = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const dlFull = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const dlSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const dlDays = (a, b) => Math.max(0, Math.ceil((a - b) / 86400000));

export function DLDrawer({ now, open, onClose }) {
  const upcoming = dlNextOccurrences(now).slice(0, 6);
  const [view, setView] = useState(() => ({ y: now.getFullYear(), m: now.getMonth() }));
  const monthDeads = dlMonthDeadlines(view.y, view.m);
  const marked = new Set(monthDeads.map((d) => d.date.getDate()));
  const firstWd = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const daysIn = new Date(view.y, view.m + 1, 0).getDate();
  const cells = []; for (let i = 0; i < firstWd; i++) cells.push(null); for (let d = 1; d <= daysIn; d++) cells.push(d);
  const move = (n) => { let m = view.m + n, y = view.y; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } setView({ y, m }); };
  const navBtn = { width: 30, height: 30, display: "grid", placeItems: "center", background: "none", border: "none", cursor: "pointer", color: "var(--a4-on-dark-mute)" };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,.5)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity .3s ease" }} />
      <aside style={{ position: "fixed", top: 0, right: 0, height: "100%", width: "min(420px, 92vw)", zIndex: 401, background: "#0b0c0e", borderLeft: "1px solid var(--a4-hairline-dark)", transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform .32s cubic-bezier(.4,0,.2,1)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px", borderBottom: "1px solid var(--a4-hairline-dark)" }}>
          <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 19, color: "#fff", letterSpacing: "-.2px" }}>Compliance calendar</span>
          <button onClick={onClose} aria-label="Close" style={{ ...navBtn, width: 34, height: 34 }}><Icon name="x" size={20} color="var(--a4-on-dark-mute)" /></button>
        </div>

        {/* plain month grid */}
        <div style={{ padding: "22px 24px", borderBottom: "1px solid var(--a4-hairline-dark)" }}>
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
                <div key={d} style={{ height: 38, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
                  <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: has || isToday ? 600 : 400, color: has ? "#fff" : isToday ? "var(--a4-primary-bright)" : "var(--a4-on-dark-mute)", textDecoration: isToday ? "underline" : "none", textUnderlineOffset: 3 }}>{d}</span>
                  <span style={{ width: 4, height: 4, borderRadius: 999, background: has ? "var(--a4-primary-bright)" : "transparent" }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* plain upcoming list */}
        <div style={{ padding: "20px 24px" }}>
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
    </>
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

  const next = dlNextOccurrences(now)[0];

  return (
    <section style={{ background: "#000", padding: "clamp(56px,8vw,96px) 0", borderTop: "1px solid var(--a4-hairline-dark)" }}>
      <Container>
        <Reveal style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 28, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 560 }}>
            <Eyebrow dark>Malta compliance</Eyebrow>
            <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, color: "#fff", fontSize: "clamp(30px,4vw,48px)", lineHeight: 1.05, letterSpacing: "-.025em", margin: "16px 0 0", textWrap: "balance" }}>We never miss a filing deadline.</h2>
            <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 17, lineHeight: 1.55, color: "var(--a4-on-dark-mute)", margin: "14px 0 0", textWrap: "pretty" }}>
              As your accountants and auditors, we track every statutory date and file on time. Next up: <strong style={{ color: "#fff", fontWeight: 600 }}>{next.name}</strong>, due {dlFull(next.date)}.
            </p>
          </div>
          <Button variant="outline-dark" size="lg" onClick={() => setOpen(true)}>View compliance calendar <Icon name="arrow-right" size={18} color="#fff" /></Button>
        </Reveal>
      </Container>
      <DLDrawer now={now} open={open} onClose={() => setOpen(false)} />
      <button className="dl-fab" onClick={() => setOpen(true)} aria-label="Open compliance calendar" style={{ position: "fixed", left: 20, bottom: 20, zIndex: 390, height: 50, padding: "0 20px", borderRadius: 999, border: "1px solid var(--a4-hairline-strong)", background: "#fff", color: "#000", display: "inline-flex", alignItems: "center", gap: 9, fontFamily: "var(--a4-font-body)", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 14px 36px rgba(0,0,0,.45)" }}>
        <Icon name="calendar-days" size={18} color="#000" /> Deadlines
      </button>
    </section>
  );
}
