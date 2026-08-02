"use client";

import React, { useState } from "react";
import { Button, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
import { AUDIT_YEARLY, TAX_RETURN_YEARLY, VAT_MONTHLY, BOOKKEEPING_MONTHLY, PAYROLL_PER_HEAD, SOFTWARE_TIERS, SOFTWARE_TIER_LABELS } from "@/data/a4QuotePack";

// Homepage pricing calculator — ported from the Vacei site's cost calculator.
// The figures below are the Vacei figures, verbatim. If Vacei pricing changes,
// change it there first and mirror it here.

const QSECT: [string, string, keyof typeof QTIERS][] = [
  ["shop", "Shop, trade or services", "standard"],
  ["consulting", "Consulting or freelancing", "standard"],
  ["property", "Property or rentals", "standard"],
  ["hospitality", "Restaurant, bar or hotel", "elevated"],
  ["online", "Online sales or cross-border", "elevated"],
  ["holding", "Holding or investment company", "elevated"],
  ["regulated", "Gaming, crypto or financial services", "high"],
  ["other", "Something else", "refer"],
];
const QTIERS = {
  standard: { l: "Standard", mult: 1, onb: 95, refer: false, note: null as [string, string] | null },
  elevated: { l: "Elevated", mult: 1.2, onb: 250, refer: false, note: ["info", "Sectors like this need a few extra checks when we take you on. It is built into the price rather than added later."] as [string, string] },
  high: { l: "High", mult: 1.45, onb: 550, refer: false, note: ["warn", "Licensed and regulated sectors need full source-of-funds checks and closer monitoring. A director signs off before we take the work on."] as [string, string] },
  refer: { l: "Referral", mult: 1, onb: 0, refer: true, note: ["warn", "We price most companies on the spot, but yours needs a short call with a director before we put a number on it. Usually the same day."] as [string, string] },
};
const QTXN: [string, string, string][] = [
  ["0", "None yet", "not trading"],
  ["1-20", "Up to 20", "a few a week"],
  ["21-60", "20 to 60", "most days"],
  ["61-150", "60 to 150", "busy"],
  ["151-400", "150 to 400", "high volume"],
  ["401-1000", "400 to 1,000", "very high"],
  ["1000+", "1,000+", "enterprise"],
];
const QBEHIND: [string, string, string][] = [
  ["0", "Up to date", ""],
  ["3", "3 months", "behind"],
  ["6", "6 months", "behind"],
  ["12", "1 year", "behind"],
  ["24", "2 years +", "behind"],
];
const QVATREG: [string, string, string][] = [
  ["none", "Not registered", "tax return only"],
  ["art10", "Yes", "charging and reclaiming"],
  ["art11", "Small exempt", "under the threshold"],
  ["art12", "EU purchases", "acquisitions only"],
  ["unsure", "Not sure", "we'll check"],
];
const QSIZE: [string, string, string][] = [
  ["small", "Small", "under €93k turnover"],
  ["big", "Bigger", "above that"],
  ["unsure", "Not sure", "we'll check"],
];
// Every table reads the pack, so this calculator can never quote a different
// figure from /accounting-services, /audit-services, /quote or the Vacei side.
// Owner decision 2026-08-02: the local `book` table (69/119/199/329/549/899)
// was retired in favour of the pack's BOOKKEEPING_MONTHLY.
const QT: Record<string, Record<string, number>> = {
  book: BOOKKEEPING_MONTHLY,
  vat: VAT_MONTHLY,
  taxret: TAX_RETURN_YEARLY,
  assure: AUDIT_YEARLY,
};
const QPAY = PAYROLL_PER_HEAD.map((t) => ({ upTo: t.upTo ?? 1e9, rate: t.rate }));
const QSTEPS = ["What you do", "Volume", "Payroll", "Up to date?", "VAT", "Company size", "Your services", "Your quote"];
const QTIERP: Record<string, [number, string]> = Object.fromEntries(
  (Object.keys(SOFTWARE_TIERS) as (keyof typeof SOFTWARE_TIERS)[]).map((k) => [k, [SOFTWARE_TIERS[k], SOFTWARE_TIER_LABELS[k]]]),
) as Record<string, [number, string]>;

type QState = {
  step: number;
  sector: string;
  txn: string;
  head: number;
  behind: string;
  vatreg: string;
  size: string;
  book: string;
  tier: string;
  review: string;
  pay: string;
  vat: string;
  taxret: string;
  assure: string;
  regoff: string;
};

const Q_INIT: QState = {
  step: 0, sector: "shop", txn: "21-60", head: 2, behind: "0", vatreg: "art10", size: "small",
  book: "none", tier: "book", review: "none", pay: "none", vat: "none", taxret: "none", assure: "none", regoff: "none",
};

type Line = { n: string; e: string; v: number };
type Note = [string, string];

function qCalc(q: QState) {
  const tier = QTIERS[(QSECT.find((s) => s[0] === q.sector) || QSECT[0])[2]];
  const notes: Note[] = [];
  if (tier.note) notes.push(tier.note);
  if (tier.refer) return { refer: true as const, notes, mo: [] as Line[], yr: [] as Line[], one: [] as Line[], moTot: 0, yrTot: 0, oneTot: 0 };
  const rm = tier.mult;
  const mo: Line[] = [], yr: Line[] = [], one: Line[] = [];
  if (q.book === "self") { const t = QTIERP[q.tier || "book"]; mo.push({ n: "Bookkeeping", e: t[1] + " plan — automation only, run by you", v: t[0] }); }
  if (q.book === "full") mo.push({ n: "Bookkeeping", e: "you upload, we do it", v: QT.book[q.txn] * rm });
  const revBase = QT.book[q.txn];
  if (q.book === "self" && q.review === "quarter" && revBase > 0) mo.push({ n: "Accounting review", e: "before each VAT return — you do the bulk of the work, so it costs a fraction", v: Math.max(15, revBase * 0.15) * rm });
  if (q.book === "self" && q.review === "month" && revBase > 0) mo.push({ n: "Accounting review", e: "every month — you do the bulk of the work, so it costs a fraction", v: Math.max(20, revBase * 0.3) * rm });
  if (q.pay === "we" && q.head > 0) {
    const t = QPAY.find((t) => q.head <= t.upTo)!;
    mo.push({ n: "Payroll", e: q.head + " × €" + t.rate + " per person", v: q.head * t.rate * rm });
  }
  const selfFile = q.book !== "full" && (q.book !== "self" || q.review === "none");
  if (q.vat === "we" && q.vatreg !== "none") {
    if (selfFile) {
      notes.push(["warn", 'You would be filing your own VAT returns. We only put our name to a return when we have worked the ledger or reviewed it — choose "You upload, we do it" or add an accounting review and we take the returns over.']);
    } else if (q.vatreg === "art11") {
      yr.push({ n: "VAT declaration", e: "small exempt — one declaration a year", v: 145 * rm });
    } else {
      const mult = q.vatreg === "art12" ? 0.6 : 1;
      mo.push({ n: "VAT returns", e: "filed quarterly, billed monthly", v: QT.vat[q.txn] * mult * rm });
      if (q.vatreg === "unsure") notes.push(["info", "We have priced you as fully VAT registered, the most common case. If the register says otherwise the price drops — we tell you before you commit."]);
    }
  }
  if (q.taxret === "we") yr.push({ n: "Annual tax return", e: "from the closed ledger, with schedules", v: QT.taxret[q.txn] * rm });
  if (q.assure === "we") {
    const bigVol = ["151-400", "401-1000", "1000+"].indexOf(q.txn) !== -1;
    const review = (q.size === "small" || q.size === "unsure") && !bigVol;
    yr.push({ n: "Financial audit", e: review ? "review engagement — the lighter option" : "full financial audit", v: QT.assure[q.txn] * (review ? 0.55 : 1) * rm });
    if (review) notes.push(["ok", "You likely qualify for a review instead of a full audit — about half the cost. We confirm it against your figures before anything is agreed."]);
    if (bigVol && q.size !== "big") notes.push(["warn", "At that volume a company is unlikely to stay under the small-company thresholds, so we priced a full audit. If your figures come in under, the price drops."]);
  }
  if (q.regoff === "we") yr.push({ n: "Registered office", e: "statutory address, post passed to you", v: 1200 });
  const softLine = q.book === "self" ? QTIERP[q.tier || "book"][0] : 0;
  const labourVal = mo.reduce((s, l) => s + l.v, 0) - softLine + yr.reduce((s, l) => s + l.v, 0);
  const labour = labourVal > 0;
  if (labour) {
    yr.push({ n: "MBR annual return fee", e: "government fee — passed through at cost", v: 100 });
    if (tier.onb) one.push({ n: "Onboarding and due diligence", e: tier.l + " risk — charged once, at acceptance", v: tier.onb });
  }
  if (!labour && tier.note && notes.indexOf(tier.note) !== -1) notes.splice(notes.indexOf(tier.note), 1);
  const months = +q.behind;
  if (months > 0 && q.book === "self") {
    one.push({ n: "Catch-up processing", e: months + " months of extra uploads through the automation — " + months + " × €10", v: months * 10 });
  } else if (months > 0 && q.book === "full") {
    const byMonth = months * 25, byYear = Math.ceil(months / 12) * 240;
    const v = Math.min(byMonth, byYear);
    one.push({ n: "Bringing the books up to date", e: "charged once, on its own — whichever basis is cheaper", v });
  }
  [mo, yr, one].forEach((a) => a.forEach((l) => { l.v = Math.round(l.v); }));
  const sum = (a: Line[]) => a.reduce((s, l) => s + l.v, 0);
  return { refer: false as const, mo, yr, one, notes, moTot: sum(mo), yrTot: sum(yr), oneTot: sum(one) };
}

function qSummarise(q: QState) {
  const bits: string[] = [];
  if (q.book === "self") bits.push("you'll run the " + QTIERP[q.tier || "book"][1] + " plan yourself");
  if (q.book === "full") bits.push("you upload and we do the bookkeeping");
  if (q.book === "self" && q.review !== "none") bits.push("we review your accounting " + (q.review === "month" ? "every month" : "before each VAT return"));
  if (q.pay === "we" && q.head > 0) bits.push("we run your payroll");
  const sf = q.book !== "full" && (q.book !== "self" || q.review === "none");
  if (q.vat === "we" && q.vatreg !== "none" && !sf) bits.push("we file your VAT");
  if (q.taxret === "we") bits.push("we prepare your annual tax return");
  if (q.assure === "we") bits.push("we handle your audit or review");
  if (q.regoff === "we") bits.push("we provide your registered office");
  if (!bits.length) return "Nothing picked yet — choose what you need in the services step.";
  const j = bits.length === 1 ? bits[0] : bits.slice(0, -1).join(", ") + ", and " + bits[bits.length - 1];
  let out = "So: " + j + ".";
  if (+q.behind > 0 && q.book !== "none") out += " We bring the older months up to date first, charged once.";
  return out;
}

const euro = (n: number) => "€" + Math.round(n).toLocaleString("en-GB");

const NOTE_STYLE: Record<string, { bg: string; fg: string; bc: string }> = {
  ok: { bg: "rgba(0,168,126,.10)", fg: "#0b7a5d", bc: "rgba(0,168,126,.30)" },
  warn: { bg: "#FFF7E9", fg: "#8A6100", bc: "#E8D2A4" },
  info: { bg: "rgba(73,79,223,.08)", fg: "var(--a4-primary-deep)", bc: "rgba(73,79,223,.25)" },
};

type Opt = { key: string; label: string; sub: string; on: boolean; pick: () => void };

function OptPills({ opts }: { opts: Opt[] }) {
  return (
    <div role="group" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {opts.map((o) => (
        <button key={o.key} type="button" onClick={o.pick} aria-pressed={o.on} style={{
          display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1, padding: "9px 16px",
          borderRadius: "var(--a4-r-md)", cursor: "pointer", textAlign: "left",
          border: "1px solid " + (o.on ? "var(--a4-primary)" : "var(--a4-hairline-light)"),
          background: o.on ? "var(--a4-primary)" : "transparent",
          color: o.on ? "#fff" : "var(--a4-body)",
          fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600,
          transition: "background .15s ease, color .15s ease, border-color .15s ease",
        }}>
          {o.label}
          {o.sub ? <span style={{ fontSize: 10.5, fontWeight: 400, opacity: 0.75 }}>{o.sub}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function LandingQuoteCalculator() {
  const [q, setQState] = useState<QState>(Q_INIT);
  const setQ = (patch: Partial<QState>) => setQState((prev) => ({ ...prev, ...patch }));

  const step = q.step;
  const r = qCalc(q);

  const pill = (on: boolean) => ({ on });
  const opts = (list: [string, string, string][], key: keyof QState): Opt[] =>
    list.map(([k, label, sub]) => ({ key: k, label, sub: sub || "", pick: () => setQ({ [key]: k } as Partial<QState>), ...pill(q[key] === k) }));

  const STEP_META: [string, string, (() => Opt[]) | null][] = [
    ["What does the company do?", "Some sectors carry heavier checks on our side. That is what moves the price — not the bookkeeping.", () => opts(QSECT.map((s) => [s[0], s[1], ""] as [string, string, string]), "sector")],
    ["About how many transactions a month?", "Count each invoice, receipt and bank line. A rough number is fine — we confirm it before anything is agreed.", () => opts(QTXN, "txn")],
    ["How many people on the payroll?", "Count directors who take a salary. Payroll is priced per person.", null],
    ["Are the books up to date?", "If you are behind, we bring you current first and quote that separately.", () => opts(QBEHIND, "behind")],
    ["Are you registered for VAT?", "Different registrations carry very different filing loads. Not sure? Pick the last option and we check the register for you.", () => QVATREG.map(([k, label, sub]) => ({ key: k, label, sub: sub || "", pick: () => setQ({ vatreg: k, vat: k === "none" ? "none" : "we" }), on: q.vatreg === k }))],
    ["How big is the company?", "Only matters if you need an audit. Small companies usually qualify for a lighter review instead.", () => opts(QSIZE, "size")],
    ["What do you need from us?", "Switch anything off that you handle yourself. The total updates as you click.", null],
    ["Your quote", "Everything below is itemised — nothing appears later that is not on this list.", null],
  ];

  const stepTag = step === 7 ? "Your quote" : "Question " + Math.min(step + 1, 7) + " of 7";
  const isOpts = !!STEP_META[step][2];
  const stepOpts = isOpts ? STEP_META[step][2]!() : [];
  const isNum = step === 2;
  const isSvc = step === 6;
  const isQuote = step === 7;

  // Service rows for step 6 — amount labels read from the live calc.
  const lineAmt = (name: string) => {
    const m = r.mo.find((l) => l.n === name);
    if (m && m.v > 0) return euro(m.v) + " /mo";
    const y = r.yr.find((l) => l.n === name || l.n.indexOf(name) === 0);
    if (y && y.v > 0) return euro(y.v) + " /yr";
    return "—";
  };
  type SvcRow = { name: string; desc: string; amt: string; options: { key: string; label: string; on: boolean; pick: () => void }[] };
  const svc = (key: keyof QState, name: string, desc: string, list: [string, string][], amtName?: string): SvcRow => ({
    name, desc, amt: lineAmt(amtName || name),
    options: list.map(([k, label]) => ({ key: k, label, on: q[key] === k, pick: () => setQ({ [key]: k } as Partial<QState>) })),
  });
  let svcRows: SvcRow[] = [];
  if (isSvc) {
    svcRows = [
      svc("book", "Bookkeeping", "Use the software yourself, or send us the paperwork and we do the lot.", [["none", "Not needed"], ["self", "Just the software"], ["full", "You upload, we do it"]]),
    ];
    if (q.book === "self") svcRows.push(
      {
        name: "Software tier", desc: "All automation, no accountants. Prices are from-prices by volume.",
        amt: "€" + QTIERP[q.tier || "book"][0] + " /mo",
        options: ([["book", "Bookkeeper"], ["senior", "Senior"], ["manager", "Manager"], ["cfo", "CFO"]] as [string, string][]).map(([k, label]) => ({ key: k, label, on: (q.tier || "book") === k, pick: () => setQ({ tier: k }) })),
      },
      svc("review", "Accounting review", "We check your coding, VAT treatment and reconciliation, and send you the fix list.", [["none", "No — I'll self-file"], ["quarter", "Before each VAT return"], ["month", "Every month"]]),
    );
    const sf = q.book !== "full" && (q.book !== "self" || q.review === "none");
    svcRows.push(
      svc("pay", "Payroll", "Payslips, monthly employer filing, annual returns. Priced per person.", [["none", "No"], ["we", "Yes"]]),
      sf
        ? { name: "VAT returns — blocked", desc: "We only put our name to a return when we have worked the ledger or reviewed it. Choose “You upload, we do it” above, or add an accounting review, and this unlocks.", amt: "—", options: [] }
        : svc("vat", "VAT returns", "Filed quarterly, billed monthly so you pay the same each time.", [["none", "No"], ["we", "Yes"]], q.vatreg === "art11" ? "VAT declaration" : "VAT returns"),
      svc("taxret", "Annual tax return", "Prepared once a year from the closed ledger.", [["none", "No"], ["we", "Yes"]]),
      svc("assure", "Financial audit", "Most small companies qualify for a lighter review — we work out which applies.", [["none", "No"], ["we", "Yes"]]),
      svc("regoff", "Registered office", "Your company's official address, statutory post passed to you.", [["none", "No"], ["we", "Yes"]]),
    );
  }

  const quoteLines = r.refer ? [] : [
    ...r.mo.filter((l) => l.v > 0).map((l) => ({ n: l.n, e: l.e, v: euro(l.v) + " /mo" })),
    ...r.yr.filter((l) => l.v > 0).map((l) => ({ n: l.n, e: l.e, v: euro(l.v) + " /yr" })),
    ...r.one.filter((l) => l.v > 0).map((l) => ({ n: l.n, e: l.e, v: euro(l.v) + " once" })),
  ];

  const soft = q.book === "self";
  const modeSoftOn = soft;
  const modeFullOn = !soft && q.book !== "none";

  const next = () => {
    const patch: Partial<QState> = { step: Math.min(7, step + 1) };
    if (step === 1 && q.book === "none") { patch.book = "full"; patch.taxret = "we"; }
    if (step === 2) patch.pay = q.head > 0 ? "we" : "none";
    if (step === 5 && q.assure === "none") patch.assure = "we";
    setQ(patch);
  };

  const modeBtn = (on: boolean): React.CSSProperties => ({
    height: 40, padding: "0 22px", borderRadius: "var(--a4-r-full)", cursor: "pointer",
    border: "1px solid " + (on ? "#fff" : "rgba(255,255,255,.32)"),
    background: on ? "#fff" : "rgba(255,255,255,.12)",
    color: on ? "var(--a4-primary)" : "#fff",
    fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600,
    transition: "background .15s ease, color .15s ease",
  });

  const railBtn = (i: number): { bg: string; fg: string; dotBg: string; dotFg: string } => {
    const done = i < step, active = i === step;
    return {
      bg: active ? "rgba(255,255,255,.13)" : "transparent",
      fg: active ? "#fff" : done ? "rgba(255,255,255,.78)" : "rgba(255,255,255,.5)",
      dotBg: done ? "rgba(255,255,255,.92)" : active ? "rgba(255,255,255,.26)" : "rgba(255,255,255,.1)",
      dotFg: done ? "var(--a4-primary)" : active ? "#fff" : "rgba(255,255,255,.6)",
    };
  };

  const svcPill = (on: boolean): React.CSSProperties => ({
    height: 30, padding: "0 13px", borderRadius: "var(--a4-r-full)", cursor: "pointer",
    border: "1px solid " + (on ? "var(--a4-primary)" : "var(--a4-hairline-light)"),
    background: on ? "var(--a4-primary)" : "transparent",
    color: on ? "#fff" : "var(--a4-body)",
    fontFamily: "var(--a4-font-body)", fontSize: 11.5, fontWeight: 600,
    transition: "background .15s ease, color .15s ease, border-color .15s ease",
  });

  return (
    <section id="pricing" style={{ background: "linear-gradient(180deg, #16181f 0%, #101116 100%)", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <Reveal><SectionHead
          dark
          align="center"
          eyebrow="What it costs"
          title={<>Pick what you need.<br />See the price.</>}
          sub={<>Answer a few questions. The price appears as you go — no form, no callback, no hidden &ldquo;from&rdquo; prices.</>}
          maxWidth={620}
        /></Reveal>

        <Reveal delay={60}>
          <div style={{ margin: "36px auto 0", display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <button type="button" onClick={() => setQ({ book: "self", vat: "none", pay: "none", taxret: "none", assure: "none", step: 6 })} aria-pressed={modeSoftOn} style={modeBtn(modeSoftOn)}>Only software</button>
            <button type="button" onClick={() => setQ({ book: "full", step: 0 })} aria-pressed={modeFullOn} style={modeBtn(modeFullOn)}>Software + accountants</button>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="lqc-grid" style={{ margin: "32px auto 0", display: "grid", gridTemplateColumns: "250px 1fr", gap: 32, alignItems: "start", maxWidth: 980, width: "100%" }}>
            {/* step rail */}
            <div className="lqc-rail" style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left", position: "sticky", top: 84 }}>
              {QSTEPS.map((label, i) => {
                const c = railBtn(i);
                return (
                  <button key={label} type="button" onClick={() => setQ({ step: i })} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: "var(--a4-r-md)",
                    border: "none", background: c.bg, cursor: "pointer", fontFamily: "var(--a4-font-body)", textAlign: "left",
                    transition: "background .2s ease",
                  }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: "var(--a4-r-full)", display: "inline-flex", alignItems: "center",
                      justifyContent: "center", flex: "none", background: c.dotBg, color: c.dotFg,
                      fontVariantNumeric: "tabular-nums", fontSize: 10.5, fontWeight: 600, transition: "background .2s ease, color .2s ease",
                    }}>{"0" + (i + 1)}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: c.fg, transition: "color .2s ease" }}>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* question card */}
            <div style={{ background: "#fff", borderRadius: "var(--a4-r-lg)", padding: 34, textAlign: "left", display: "flex", flexDirection: "column", gap: 18, minHeight: 380 }}>
              <div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--a4-primary)", fontWeight: 600 }}>{stepTag}</div>
                <h3 style={{ margin: "8px 0 0", fontFamily: "var(--a4-font-display)", fontSize: 21, fontWeight: 600, letterSpacing: "-.015em", color: "var(--a4-ink)" }}>{STEP_META[step][0]}</h3>
                <p style={{ margin: "8px 0 0", fontFamily: "var(--a4-font-body)", fontSize: 13, lineHeight: 1.6, color: "var(--a4-mute)" }}>{STEP_META[step][1]}</p>
              </div>

              {isOpts && <OptPills opts={stepOpts} />}

              {isNum && (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <input type="range" min={0} max={50} step={1} value={q.head} onChange={(e) => setQ({ head: +e.target.value })} aria-label="People on payroll" style={{ flex: 1, accentColor: "var(--a4-primary)", cursor: "pointer" }} />
                  <span style={{ minWidth: 90, textAlign: "right", fontFamily: "var(--a4-font-body)", fontVariantNumeric: "tabular-nums", fontSize: 14, fontWeight: 600, color: "var(--a4-ink)" }}>{q.head + (q.head === 1 ? " person" : " people")}</span>
                </div>
              )}

              {isSvc && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {svcRows.map((row) => (
                    <div key={row.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px 16px", flexWrap: "wrap", border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "12px 16px" }}>
                      <div style={{ minWidth: 170, flex: 1 }}>
                        <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, fontWeight: 600, color: "var(--a4-ink)" }}>{row.name}</div>
                        <div style={{ marginTop: 1, fontFamily: "var(--a4-font-body)", fontSize: 11.5, lineHeight: 1.5, color: "var(--a4-mute)" }}>{row.desc}</div>
                      </div>
                      <div role="group" aria-label={row.name} style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {row.options.map((opt) => (
                          <button key={opt.key} type="button" onClick={opt.pick} aria-pressed={opt.on} style={svcPill(opt.on)}>{opt.label}</button>
                        ))}
                      </div>
                      <span style={{ minWidth: 78, textAlign: "right", fontFamily: "var(--a4-font-body)", fontVariantNumeric: "tabular-nums", fontSize: 12.5, fontWeight: 600, color: "var(--a4-ink)" }}>{row.amt}</span>
                    </div>
                  ))}
                </div>
              )}

              {isQuote && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {quoteLines.map((l) => (
                    <div key={l.n + l.v} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--a4-hairline-light)", fontSize: 12.5, alignItems: "baseline", fontFamily: "var(--a4-font-body)" }}>
                      <span style={{ color: "var(--a4-body)" }}>{l.n}<span style={{ display: "block", fontSize: 11, color: "var(--a4-mute)", marginTop: 1 }}>{l.e}</span></span>
                      <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 12.5, fontWeight: 500, color: "var(--a4-ink)", whiteSpace: "nowrap" }}>{l.v}</span>
                    </div>
                  ))}
                  <p style={{ margin: "14px 0 0", fontFamily: "var(--a4-font-body)", fontSize: 12.5, lineHeight: 1.6, color: "var(--a4-body)" }}>
                    {r.refer
                      ? "We price most sectors instantly. This one needs a short conversation with a director before we put a number to it — usually the same day."
                      : qSummarise(q)}
                  </p>
                  {(r.notes || []).map(([tone, text], i) => {
                    const s = NOTE_STYLE[tone] || NOTE_STYLE.info;
                    return <p key={i} style={{ margin: "10px 0 0", padding: "11px 14px", borderRadius: 10, fontFamily: "var(--a4-font-body)", fontSize: 12, lineHeight: 1.55, background: s.bg, color: s.fg, border: "1px solid " + s.bc }}>{text}</p>;
                  })}
                  <div style={{ marginTop: 16, alignSelf: "flex-start" }}>
                    <Button variant="dark" size="sm" href="/contact">{r.refer ? "Request a call" : "Send me this quote"} <Icon name="arrow-right" size={14} color="#fff" /></Button>
                  </div>
                  <p style={{ margin: "10px 0 0", fontFamily: "var(--a4-font-body)", fontSize: 11, color: "var(--a4-mute)" }}>KYC required before work starts. All fees exclude VAT.</p>
                </div>
              )}

              {/* footer: nav + running total */}
              <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--a4-hairline-light)", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                {!isQuote && (
                  <>
                    <button type="button" onClick={() => setQ({ step: Math.max(0, step - 1) })} disabled={step === 0} style={{
                      height: 36, padding: "0 16px", borderRadius: "var(--a4-r-full)", border: "1px solid var(--a4-hairline-light)",
                      background: "transparent", color: "var(--a4-mute)", fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600,
                      cursor: step === 0 ? "default" : "pointer", opacity: step === 0 ? 0.5 : 1,
                    }}>Back</button>
                    <button type="button" onClick={next} style={{
                      height: 36, padding: "0 18px", borderRadius: "var(--a4-r-full)", border: "1px solid var(--a4-ink)",
                      background: "var(--a4-ink)", color: "#fff", fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                    }}>{step === 6 ? "See my quote" : "Next"}</button>
                  </>
                )}
                <span style={{ marginLeft: "auto", display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--a4-mute)" }}>{r.refer ? "" : "Every month"}</span>
                  <span style={{ fontFamily: "var(--a4-font-body)", fontVariantNumeric: "tabular-nums", fontSize: 18, fontWeight: 600, color: "var(--a4-ink)" }}>{r.refer ? "Let's talk first" : euro(r.moTot)}</span>
                  {!r.refer && r.yrTot > 0 && <span style={{ fontFamily: "var(--a4-font-body)", fontVariantNumeric: "tabular-nums", fontSize: 12.5, color: "var(--a4-mute)" }}>{euro(r.yrTot) + " /yr"}</span>}
                  {!r.refer && r.oneTot > 0 && <span style={{ fontFamily: "var(--a4-font-body)", fontVariantNumeric: "tabular-nums", fontSize: 12.5, color: "var(--a4-mute)" }}>{euro(r.oneTot) + " once"}</span>}
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <p style={{ margin: "28px auto 0", textAlign: "center", fontFamily: "var(--a4-font-body)", fontSize: 12.5, color: "var(--a4-on-dark-mute)" }}>The price appears instantly — nothing is gated behind an email. All fees exclude VAT.</p>
        </Reveal>
      </Container>
    </section>
  );
}
