"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Button, Icon, Container, Eyebrow } from "@/components/a4-landing/Primitives";
import { DARK_GRID, DriftGlow, gradText } from "@/components/fx/primitives";
import {
  getNextComplianceDeadline,
  getNextComplianceDeadlines,
  formatComplianceDate,
  COMPLIANCE_DL_RULES,
} from "@/lib/compliance-deadlines";

const DL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DL_WD = ["M", "T", "W", "T", "F", "S", "S"];
const INK = "#09090B";
const PERI = "#8B8FF7";
const BODY = "var(--a4x-body)";
const DISPLAY = "var(--a4x-display)";

type Deadline = { name: string; date: Date };

function dlMonthDeadlines(y: number, m: number) {
  const out: Deadline[] = [];
  for (const r of COMPLIANCE_DL_RULES) {
    if ("monthly" in r && r.monthly) out.push({ name: r.name, date: new Date(y, m + 1, 0, 17, 0, 0) });
    else if ("dates" in r && r.dates) {
      for (const [mm, day] of r.dates) {
        if (mm === m) out.push({ name: r.name, date: new Date(y, mm, day, 17, 0, 0) });
      }
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

const dlDM = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const dlSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const noopSubscribe = () => () => {};
const dlDays = (a: Date, b: Date) => Math.max(0, Math.ceil((a.getTime() - b.getTime()) / 86400000));

/* Round glass controls from the design (on dark), with the indigo focus ring. */
const DL_CSS = `
.dl-round { display: grid; place-items: center; padding: 0; border-radius: 999px; border: 1px solid rgba(255,255,255,.16); background: rgba(255,255,255,.06); color: #FFFFFF; cursor: pointer; transition: background .3s, border-color .3s; }
.dl-round:hover { background: rgba(255,255,255,.12); }
.dl-round:focus-visible { outline: 3px solid rgba(79,85,241,.55); outline-offset: 2px; }
`;

export function DLDrawer({ now, open, onClose }: { now: Date; open: boolean; onClose: () => void }) {
  const upcoming = getNextComplianceDeadlines(now, 6);
  const [view, setView] = useState(() => ({ y: now.getFullYear(), m: now.getMonth() }));
  // false on the server and while hydrating, true once on the client — the portal needs document.body.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const monthDeads = dlMonthDeadlines(view.y, view.m);
  const marked = new Set(monthDeads.map((d) => d.date.getDate()));
  const firstWd = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const daysIn = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = []; for (let i = 0; i < firstWd; i++) cells.push(null); for (let d = 1; d <= daysIn; d++) cells.push(d);
  const move = (n: number) => { let m = view.m + n, y = view.y; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } setView({ y, m }); };

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
      <style>{DL_CSS}</style>
      <div
        onClick={onClose}
        aria-hidden={!open}
        className="fixed inset-0 transition-opacity duration-300"
        style={{ zIndex: 550, background: "rgba(9,9,11,.55)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Compliance calendar"
        aria-hidden={!open}
        className="fixed top-0 right-0 flex h-full w-[min(440px,100vw)] flex-col overflow-y-auto pb-[env(safe-area-inset-bottom,0px)]"
        style={{
          zIndex: 551,
          color: "#FFFFFF",
          background: DARK_GRID,
          borderLeft: "1px solid rgba(255,255,255,.1)",
          boxShadow: "-40px 0 100px rgba(0,0,0,.45)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          // Hidden (not just off-screen) once it has slid out, so it leaves the tab order.
          visibility: open ? "visible" : "hidden",
          transition: open ? "transform .5s cubic-bezier(.16,1,.3,1), visibility 0s" : "transform .5s cubic-bezier(.16,1,.3,1), visibility 0s .5s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "clamp(18px,4vw,24px) clamp(18px,4vw,28px)", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
          <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: "clamp(20px,4vw,24px)", letterSpacing: "-0.03em" }}>Compliance calendar</span>
          <button type="button" onClick={onClose} aria-label="Close" className="dl-round" style={{ width: 40, height: 40 }}><Icon name="x" size={18} color="#FFFFFF" /></button>
        </div>

        {/* month grid */}
        <div style={{ padding: "clamp(18px,4vw,24px) clamp(16px,3.5vw,28px)", borderBottom: "1px solid rgba(255,255,255,.1)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <button type="button" onClick={() => move(-1)} aria-label="Previous" className="dl-round" style={{ width: 36, height: 36 }}><Icon name="chevron-left" size={17} color="#FFFFFF" /></button>
            <span style={{ fontFamily: DISPLAY, fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>{DL_MONTHS[view.m]} {view.y}</span>
            <button type="button" onClick={() => move(1)} aria-label="Next" className="dl-round" style={{ width: 36, height: 36 }}><Icon name="chevron-right" size={17} color="#FFFFFF" /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px 0" }}>
            {DL_WD.map((w, i) => (<div key={i} style={{ textAlign: "center", fontFamily: BODY, fontSize: 11, fontWeight: 600, letterSpacing: ".1em", color: "#71717A", paddingBottom: 8 }}>{w}</div>))}
            {cells.map((d, i) => {
              if (d === null) return <div key={"e" + i} />;
              const date = new Date(view.y, view.m, d);
              const isToday = dlSameDay(date, now);
              const has = marked.has(d);
              return (
                <div key={d} style={{ height: "clamp(36px, 9vw, 42px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
                  <span style={{ display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 999, background: isToday ? "rgba(139,143,247,.18)" : "transparent", fontFamily: DISPLAY, fontVariantNumeric: "tabular-nums", fontSize: "clamp(13px, 3.4vw, 14.5px)", fontWeight: has || isToday ? 600 : 500, color: has || isToday ? "#FFFFFF" : "#A1A1AA" }}>{d}</span>
                  <span style={{ width: 5, height: 5, borderRadius: 1, transform: "skewX(-30deg)", background: has ? PERI : "transparent" }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* upcoming filings — the design's numbered rows, on dark */}
        <div style={{ padding: "clamp(18px,4vw,24px) clamp(18px,4vw,28px) 28px" }}>
          <div style={{ fontFamily: BODY, fontSize: 12, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "#A1A1AA", marginBottom: 8 }}>Upcoming filings</div>
          {upcoming.map((it, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "64px minmax(0, 1fr) auto", alignItems: "baseline", gap: 12, padding: "15px 0", borderTop: "1px solid rgba(255,255,255,.08)" }}>
              <span style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 600, color: PERI }}>{dlDM(it.date)}</span>
              <span style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.45, color: "#FFFFFF" }}>{it.name}</span>
              <span style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: "#A1A1AA", fontVariantNumeric: "tabular-nums" }}>{dlDays(it.date, now)}d</span>
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
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey); return () => document.removeEventListener("keydown", onKey);
  }, []);

  const next = getNextComplianceDeadline(now);

  return (
    <section data-sec="deadlines" style={{ position: "relative", overflow: "hidden", color: "#FFFFFF", background: DARK_GRID, padding: "clamp(96px,11vw,150px) 0" }}>
      <DriftGlow left="52%" top="-70%" strength={0.24} />
      <Container style={{ position: "relative", display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "40px 64px" }}>
        <div style={{ flex: "1 1 520px", minWidth: 0, maxWidth: 780 }}>
          <div data-fx="rise">
            <Eyebrow dark>Malta compliance</Eyebrow>
          </div>
          <h2 data-fx="rise" data-d="100" style={{ margin: "16px 0 0", fontFamily: DISPLAY, fontSize: "clamp(36px,4.6vw,72px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.04, color: "#FFFFFF", textWrap: "balance" }}>
            Stay ahead of every filing <span style={{ ...gradText, paddingBottom: ".06em" }}>deadline.</span>
          </h2>
          <p data-fx="rise" data-d="200" style={{ margin: "22px 0 0", maxWidth: 640, fontFamily: BODY, fontSize: "clamp(16px,1.4vw,18px)", lineHeight: 1.6, color: "#A1A1AA", textWrap: "pretty" }}>
            As your accountants and auditors, we track every statutory date and keep you ahead of it. Next up: <strong style={{ color: "#fff", fontWeight: 600 }}>{next.name}</strong>, due {formatComplianceDate(next.date)}.
          </p>
        </div>
        <div data-fx="rise" data-d="300" style={{ flex: "0 1 auto", minWidth: 0, display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Button variant="outline-dark" size="lg" onClick={() => setOpen(true)} style={{ flex: "1 1 auto", minWidth: 0 }}>View compliance calendar <Icon name="arrow-right" size={18} color="#fff" /></Button>
          <Button variant="primary" size="lg" href="/compliance-calendar" style={{ flex: "1 1 auto", minWidth: 0 }}>Download 2026 calendar <Icon name="download" size={18} color={INK} /></Button>
        </div>
      </Container>
      <DLDrawer now={now} open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
