"use client";

import React, { useMemo, useState } from "react";
import { Container, Icon, Pill, Reveal } from "@/components/a4-landing/Primitives";
import {
  COMPLIANCE_DL_RULES,
  EVENT_DRIVEN_DEADLINES,
  formatComplianceDate,
  getNextComplianceDeadlines,
  type ComplianceRule,
  type DeadlineCategory,
} from "@/lib/compliance-deadlines";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

const CATEGORIES: { key: DeadlineCategory | "all"; label: string }[] = [
  { key: "all", label: "All deadlines" },
  { key: "vat", label: "VAT" },
  { key: "employer", label: "Payroll & employer" },
  { key: "tax", label: "Income tax" },
  { key: "corporate", label: "Corporate & MBR" },
];

const CATEGORY_COLOR: Record<DeadlineCategory, string> = {
  vat: "var(--a4-primary)",
  employer: "#1a7f4b",
  tax: "#b4690e",
  corporate: "#7c3aed",
};

const CATEGORY_LABEL: Record<DeadlineCategory, string> = {
  vat: "VAT",
  employer: "Payroll & employer",
  tax: "Income tax",
  corporate: "Corporate & MBR",
};

type DayItem = { rule: ComplianceRule; date: Date };

function monthDeadlines(y: number, m: number, filter: DeadlineCategory | "all"): DayItem[] {
  const out: DayItem[] = [];
  for (const rule of COMPLIANCE_DL_RULES) {
    if (filter !== "all" && rule.category !== filter) continue;
    if (rule.monthly) out.push({ rule, date: new Date(y, m + 1, 0, 17, 0, 0) });
    else if (rule.dates) {
      for (const [mm, day] of rule.dates) {
        if (mm === m) out.push({ rule, date: new Date(y, mm, day, 17, 0, 0) });
      }
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const daysUntil = (a: Date, b: Date) => Math.max(0, Math.ceil((a.getTime() - b.getTime()) / 86400000));

export function InteractiveCalendar() {
  const [now] = useState(() => new Date());
  const [view, setView] = useState(() => ({ y: now.getFullYear(), m: now.getMonth() }));
  const [filter, setFilter] = useState<DeadlineCategory | "all">("all");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const items = useMemo(() => monthDeadlines(view.y, view.m, filter), [view, filter]);
  const byDay = useMemo(() => {
    const map = new Map<number, DayItem[]>();
    for (const it of items) {
      const d = it.date.getDate();
      map.set(d, [...(map.get(d) || []), it]);
    }
    return map;
  }, [items]);

  const upcoming = useMemo(
    () => getNextComplianceDeadlines(now, 40).filter((d) => filter === "all" || d.rule?.category === filter).slice(0, 6),
    [now, filter],
  );

  const firstWd = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const daysIn = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWd; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(d);

  const move = (n: number) => {
    let m = view.m + n, y = view.y;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setView({ y, m });
    setSelectedDay(null);
  };

  const selectedItems = selectedDay !== null ? byDay.get(selectedDay) || [] : [];
  const panelItems: DayItem[] = selectedItems.length
    ? selectedItems
    : upcoming.map((u) => ({ rule: u.rule as ComplianceRule, date: u.date })).filter((x) => x.rule);

  const navBtn: React.CSSProperties = {
    width: 34, height: 34, display: "grid", placeItems: "center", background: "none",
    border: "1px solid var(--a4-hairline-light)", borderRadius: 10, cursor: "pointer", color: "var(--a4-ink)",
  };

  return (
    <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(48px,7vw,80px) 0" }}>
      <Container>
        <Reveal>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
            {CATEGORIES.map((c) => (
              <Pill key={c.key} dark={false} active={filter === c.key} onClick={() => { setFilter(c.key); setSelectedDay(null); }}>
                {c.label}
              </Pill>
            ))}
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-start">
          {/* Month grid */}
          <Reveal>
            <div style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-lg)", padding: "clamp(18px,3vw,28px)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <button onClick={() => move(-1)} aria-label="Previous month" style={navBtn}><Icon name="chevron-left" size={18} /></button>
                <span className="a4-font-body" style={{ fontSize: 16, fontWeight: 600, color: "var(--a4-ink)" }}>{MONTHS[view.m]} {view.y}</span>
                <button onClick={() => move(1)} aria-label="Next month" style={navBtn}><Icon name="chevron-right" size={18} /></button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px 0" }}>
                {WEEKDAYS.map((w, i) => (
                  <div key={i} className="a4-font-body" style={{ textAlign: "center", fontSize: 11.5, color: "var(--a4-mute)", paddingBottom: 8 }}>{w}</div>
                ))}
                {cells.map((d, i) => {
                  if (d === null) return <div key={"e" + i} />;
                  const date = new Date(view.y, view.m, d);
                  const dayItems = byDay.get(d) || [];
                  const isToday = sameDay(date, now);
                  const isSelected = selectedDay === d;
                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDay(dayItems.length ? d : null)}
                      aria-label={dayItems.length ? `${d} ${MONTHS[view.m]} — ${dayItems.map((x) => x.rule.name).join(", ")}` : undefined}
                      style={{
                        height: "clamp(40px, 9vw, 52px)", display: "flex", flexDirection: "column", alignItems: "center",
                        justifyContent: "center", gap: 3, background: isSelected ? "rgba(73,79,223,.08)" : "none",
                        border: isSelected ? "1px solid var(--a4-primary)" : "1px solid transparent",
                        borderRadius: 10, cursor: dayItems.length ? "pointer" : "default", padding: 0,
                      }}
                    >
                      <span className="a4-font-body" style={{
                        fontSize: "clamp(12.5px, 3.2vw, 14px)", fontWeight: dayItems.length || isToday ? 600 : 400,
                        color: dayItems.length ? "var(--a4-ink)" : isToday ? "var(--a4-primary)" : "var(--a4-mute)",
                        textDecoration: isToday ? "underline" : "none", textUnderlineOffset: 3,
                      }}>{d}</span>
                      <span style={{ display: "flex", gap: 3 }}>
                        {dayItems.slice(0, 3).map((x, j) => (
                          <span key={j} style={{ width: 5, height: 5, borderRadius: 999, background: CATEGORY_COLOR[x.rule.category] }} />
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--a4-hairline-light)" }}>
                {(Object.keys(CATEGORY_LABEL) as DeadlineCategory[]).map((c) => (
                  <span key={c} className="a4-font-body" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--a4-mute)" }}>
                    <span style={{ width: 7, height: 7, borderRadius: 999, background: CATEGORY_COLOR[c] }} />{CATEGORY_LABEL[c]}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Detail / upcoming panel */}
          <Reveal delay={80}>
            <h3 className="a4-font-display font-medium text-[var(--a4-ink)]" style={{ fontSize: 20, margin: "0 0 4px" }}>
              {selectedItems.length
                ? `Due ${formatComplianceDate(selectedItems[0].date)}`
                : "Next deadlines"}
            </h3>
            {selectedItems.length === 0 && (
              <p className="a4-font-body text-[13.5px] text-[var(--a4-mute)]" style={{ margin: "0 0 12px" }}>
                Click a marked day for details, or browse what&apos;s coming up.
              </p>
            )}
            <div style={{ display: "grid", gap: 12, marginTop: 10 }}>
              {panelItems.map((it, i) => (
                <div key={i} style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <span className="a4-font-body" style={{ fontSize: 15.5, fontWeight: 600, color: "var(--a4-ink)" }}>{it.rule.name}</span>
                    <span className="a4-font-body" style={{ fontSize: 12.5, fontWeight: 600, color: CATEGORY_COLOR[it.rule.category] }}>
                      {formatComplianceDate(it.date)} · {daysUntil(it.date, now)}d
                    </span>
                  </div>
                  <p className="a4-font-body" style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--a4-mute)", margin: "6px 0 0" }}>
                    {it.rule.description} <em style={{ fontStyle: "normal", color: "var(--a4-stone, var(--a4-mute))" }}>Applies to: {it.rule.appliesTo}.</em>
                  </p>
                  {it.rule.note && (
                    <p className="a4-font-body" style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--a4-mute)", margin: "6px 0 0" }}>{it.rule.note}</p>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Event-driven deadlines */}
        <Reveal>
          <h3 className="a4-font-display font-medium text-[var(--a4-ink)]" style={{ fontSize: "clamp(20px,2.6vw,26px)", margin: "clamp(40px,6vw,56px) 0 6px" }}>
            Deadlines that depend on your company
          </h3>
          <p className="a4-font-body text-[14px] text-[var(--a4-mute)]" style={{ margin: "0 0 18px", maxWidth: 640 }}>
            These run from your company&apos;s own dates — registration anniversary, year-end, or the event itself — so they can&apos;t sit on a fixed calendar.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {EVENT_DRIVEN_DEADLINES.map((d) => (
              <div key={d.id} style={{ background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "18px 20px" }}>
                <div className="a4-font-body" style={{ fontSize: 15, fontWeight: 600, color: "var(--a4-ink)" }}>{d.name}</div>
                <div className="a4-font-body" style={{ fontSize: 13, fontWeight: 600, color: "var(--a4-primary)", margin: "4px 0 6px" }}>{d.rule}</div>
                <p className="a4-font-body" style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--a4-mute)", margin: 0 }}>{d.description} <span>({d.authority})</span></p>
              </div>
            ))}
          </div>
        </Reveal>

        <p className="a4-font-body" style={{ fontSize: 12.5, color: "var(--a4-mute)", marginTop: 28, maxWidth: 720 }}>
          General guidance for Malta companies and self-employed persons — statutory dates can shift with your VAT periods, year-end and MTCA notices, and this page is not tax advice. A4 clients get a tailored compliance calendar, tracked for them, in their portal.
        </p>
      </Container>
    </section>
  );
}
