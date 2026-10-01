"use client";

/**
 * The sections of the /quote builder (see ./QuoteBuilder.tsx): 01 About your
 * business, 02 Choose what you need, 03 Your quote line by line, 04 Get your
 * formal quotation, 05 How it works, 06 Terms — and the sticky price pill.
 */

import { useState, type CSSProperties, type ReactNode } from "react";
import { DARK_CARD, LetterWord, TypeText, Words } from "@/components/fx/primitives";
import { gcol } from "@/lib/fx/engine";
import {
  BANK_ACCOUNT,
  CAPITAL_BANDS,
  EXPENSE_BANDS,
  MANAGED_ENTITY_OPTIONS,
  PRICING_GOV_NOTE,
  PRICING_VAT_NOTE,
  SECTORS,
  TXN_BANDS,
  managedMonthly,
  sectorTier,
  type ExpenseBand,
} from "@/data/a4QuotePack";
import { formatStartMonth, ongoingStartMonth } from "@/lib/accounting-fee";
import { trackConversion } from "@/lib/analytics";
import { submitWebsiteQuotation, type WebsiteQuoteResult } from "@/lib/websiteQuotation";
import {
  BODY,
  Band,
  Bullets,
  Check,
  CtaCard,
  DOC_PAD,
  DarkCta,
  Doc,
  DocChip,
  DocFoot,
  DocHead,
  Eyebrow,
  G,
  Head,
  INDIGO,
  INK,
  NumberedRows,
  OptionPills,
  PERI,
  PillLink,
  SANS,
  Statement,
  Stepper,
  Switch,
  Timeline,
  gradText,
  kicker,
  pad2,
  wordSize,
} from "@/app/[locale]/services/components/SiteKit";
import {
  CONFLICT_NOTE,
  CONFLICT_SHORT,
  CONFLICT_SUMMARY,
  MAX_BANKS,
  MAX_HEADS,
  REFER_NOTE,
  REGISTERED_OFFICE_FEE,
  VAT_REG_OPTIONS,
  auditIsReview,
  basketSignature,
  effectivePlan,
  euro,
  isOn,
  isStartMonth,
  nativePrice,
  retainerReason,
  sectorLabel,
  separately,
  servicePreview,
  viewTotals,
  visibleServices,
  type BuilderLine,
  type BuilderView,
  type ServiceKey,
  type ToggleKey,
} from "./builderModel";
import { RETAINER_COPY, SERVICE_COPY, TERMS, TIMELINE } from "./builderCopy";
import type { BuilderApi } from "./QuoteBuilder";

/* ────────────────────────────────────────────────────────────────────────── */
/* Small pieces                                                               */
/* ────────────────────────────────────────────────────────────────────────── */

const fieldLabel: CSSProperties = { fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: "-0.015em", color: INK };
const helpText = (ask = false): CSSProperties => ({
  margin: "10px 0 0",
  fontFamily: BODY,
  fontSize: 13.5,
  lineHeight: 1.55,
  fontWeight: ask ? 600 : 500,
  color: ask ? INDIGO : "#71717A",
});
const darkLabel: CSSProperties = { display: "block", marginBottom: 10, fontFamily: SANS, fontSize: 15, fontWeight: 600, color: "#E4E4E7" };
const darkError: CSSProperties = { display: "flex", gap: 10, marginTop: 8, fontFamily: BODY, fontSize: 13.5, fontWeight: 600, lineHeight: 1.45, color: "#FFFFFF" };
const VIEW_LABEL: Record<BuilderView, string> = { monthly: "Monthly", year: "First year", retainer: "Retainer" };
const cadence = (c: BuilderLine["cadence"]) => (c === "monthly" ? "/mo" : c === "yearly" ? "/yr" : "one-off");

/** One question of 01: number, label, the control, a line of help. */
function Block({ n, label, htmlFor, help, ask = false, d, children }: { n: number; label: string; htmlFor?: string; help?: ReactNode; ask?: boolean; d?: number; children: ReactNode }) {
  return (
    <div data-fx="rise" data-dy="30" data-d={d || undefined} style={{ minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
        <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, letterSpacing: ".02em", color: INDIGO }}>{pad2(n)}</span>
        {htmlFor ? (
          <label htmlFor={htmlFor} style={fieldLabel}>
            {label}
          </label>
        ) : (
          <span style={fieldLabel}>{label}</span>
        )}
      </div>
      {children}
      {help ? <p style={helpText(ask)}>{help}</p> : null}
    </div>
  );
}

/** Monthly / First year / Retainer — the design's segmented switch, with the retainer only while it is offered. */
function ViewToggle({ api }: { api: BuilderApi }) {
  const { view, setView, retainer } = api;
  const reason = retainerReason(retainer);
  return (
    <div role="group" aria-label="Show fees as" className="a4q-view">
      {(["monthly", "year", "retainer"] as BuilderView[]).map((v) => {
        const off = v === "retainer" && !retainer.offered;
        return (
          <button key={v} type="button" aria-pressed={view === v} disabled={off} title={off ? reason : undefined} onClick={() => setView(v)}>
            {VIEW_LABEL[v]}
          </button>
        );
      })}
    </div>
  );
}

function viewCaption(api: BuilderApi): string {
  const r = api.retainer;
  if (api.basket.gate) return "Fees before VAT · registry fees at cost";
  if (r.offered) return `Retainer ${euro(r.monthly)} /mo · fees before VAT · registry at cost`;
  return retainerReason(r) || "Fees before VAT · registry fees at cost";
}

/** "Which one is ours?" — the independence resolver (homepage wording). */
function Resolver({ api, dark = false }: { api: BuilderApi; dark?: boolean }) {
  const btn: CSSProperties = { height: "auto", minHeight: 44, padding: "10px 20px", fontSize: 15, whiteSpace: "normal", textAlign: "center" };
  return (
    <div>
      <div style={{ fontFamily: SANS, fontSize: 19, fontWeight: 600, letterSpacing: "-0.015em", color: dark ? "#FFFFFF" : INK }}>Which one is ours?</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <button type="button" onClick={() => api.resolve("book")} className={`a4-btn ${dark ? "a4-btn-light" : "a4-btn-ink"}`} style={btn}>
          Keep the bookkeeping with us
        </button>
        <button type="button" onClick={() => api.resolve("assure")} className={`a4-btn ${dark ? "a4-btn-light" : "a4-btn-ink"}`} style={btn}>
          Take the audit or review with us
        </button>
      </div>
      <p style={{ margin: "12px 0 0", fontFamily: BODY, fontSize: 13.5, lineHeight: 1.55, color: dark ? "#D4D4D8" : "#3F3F46" }}>{CONFLICT_NOTE}</p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 01 About your business                                                     */
/* ────────────────────────────────────────────────────────────────────────── */

export function AboutSection({ api }: { api: BuilderApi }) {
  const { s, set, setHeads, months } = api;
  const company = s.entity === "company";
  const tier = sectorTier(s.sector);
  const base = s.expenses ? managedMonthly(s.entity, s.expenses) : null;
  const startOk = isStartMonth(s.startMonth);
  const ongoing = startOk ? formatStartMonth(ongoingStartMonth(s.startMonth, api.now)) : "";
  const vatHint = VAT_REG_OPTIONS.find((o) => o.id === s.vatreg)?.hint ?? "";
  const capBand = CAPITAL_BANDS.find((c) => c.id === s.capital);

  return (
    <Band surface="muted" id="about" sec="about" style={{ scrollMarginTop: 88 }}>
      <Head
        n="01"
        eyebrow="About your business"
        maxWidth={640}
        title={
          <>
            Tell us about the <G>business.</G>
          </>
        }
        sub="A few quick answers set the price. Nothing is assumed: the monthly spend and the start month stay empty until you answer them."
      />
      <div
        style={{
          marginTop: 44,
          background: "#FFFFFF",
          border: "1px solid #E4E4E7",
          borderRadius: 28,
          boxShadow: "0 50px 120px rgba(9,9,11,.08)",
          padding: "clamp(24px,3.4vw,44px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 330px), 1fr))",
          gap: "clamp(32px,3.4vw,44px) clamp(24px,3vw,40px)",
        }}
      >
        <Block n={1} label="Who are we working for?" help={MANAGED_ENTITY_OPTIONS.find((o) => o.id === s.entity)?.sub}>
          <OptionPills
            label="Who are we working for?"
            items={MANAGED_ENTITY_OPTIONS.map((o) => o.label)}
            value={MANAGED_ENTITY_OPTIONS.findIndex((o) => o.id === s.entity)}
            onPick={(i) => set({ entity: MANAGED_ENTITY_OPTIONS[i].id })}
            min={140}
          />
        </Block>

        <Block
          n={2}
          d={60}
          label="What does it spend a month?"
          htmlFor="aq-spend"
          ask={!s.expenses}
          help={s.expenses ? `Bookkeeping starts at ${euro(base ?? 0)} /mo at this band. It also sets the tax return.` : "Needed for the bookkeeping and the tax return — we never assume a band."}
        >
          <select id="aq-spend" className="a4k-input" value={s.expenses} onChange={(e) => set({ expenses: e.target.value as ExpenseBand | "" })} aria-required="true">
            <option value="">Select your monthly spend…</option>
            {EXPENSE_BANDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label} — from {euro(managedMonthly(s.entity, b.id) ?? 0)} /mo
              </option>
            ))}
          </select>
        </Block>

        <Block
          n={3}
          d={120}
          label="What does the business do?"
          htmlFor="aq-sector"
          ask={tier === "refer"}
          help={
            tier === "refer"
              ? "A director prices this one with you — usually the same day. Send it through below and we call you."
              : tier === "standard"
                ? "Sets the checks we run when we take you on."
                : "Sectors like this need a few extra checks, priced into VAT and the audit — not an extra charge."
          }
        >
          <select id="aq-sector" className="a4k-input" value={s.sector} onChange={(e) => set({ sector: e.target.value })}>
            {SECTORS.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </select>
        </Block>

        <Block n={4} label="About how many transactions a month?" help="The count, not the amount. Prices VAT and the audit, and adds to the bookkeeping at busy volumes.">
          <OptionPills
            label="Transactions a month"
            items={TXN_BANDS.map((b) => b.label)}
            value={TXN_BANDS.findIndex((b) => b.id === s.txn)}
            onPick={(i) => set({ txn: TXN_BANDS[i].id })}
            min={104}
          />
        </Block>

        <Block
          n={5}
          d={60}
          label="Bank accounts"
          help={`The first is included in the bookkeeping. Each extra is €${BANK_ACCOUNT.baseMonthly} a month plus ${Math.round(BANK_ACCOUNT.pctOfBookkeeping * 100)}% of the bookkeeping fee, reconciled separately.`}
        >
          <Stepper value={s.banks} onChange={(v) => set({ banks: v })} min={1} max={MAX_BANKS} label="Bank accounts" />
        </Block>

        <Block
          n={6}
          d={120}
          label="From which month do you need us?"
          htmlFor="aq-start"
          ask={!startOk}
          help={
            !startOk
              ? "Required — the earliest month that still needs doing. A month in the past adds a catch-up."
              : months > 0
                ? `${months} ${months === 1 ? "month" : "months"} of catch-up at your own monthly rate — no premium, no cap — then ongoing from ${ongoing}.`
                : `Ongoing from ${ongoing}. Anything earlier would be catch-up at the same monthly rate.`
          }
        >
          <input id="aq-start" type="month" className="a4k-input" value={s.startMonth} onChange={(e) => set({ startMonth: e.target.value })} aria-required="true" />
        </Block>

        <Block n={7} label="Are you registered for VAT?" help={vatHint ? `${VAT_REG_OPTIONS.find((o) => o.id === s.vatreg)?.label} — ${vatHint}.` : undefined}>
          <OptionPills label="VAT registration" items={VAT_REG_OPTIONS.map((o) => o.label)} value={VAT_REG_OPTIONS.findIndex((o) => o.id === s.vatreg)} onPick={(i) => set({ vatreg: VAT_REG_OPTIONS[i].id })} min={124} />
        </Block>

        <Block n={8} d={60} label="People on the payroll" help="€12 a person a month. Leave it at zero if there is no payroll.">
          <Stepper value={s.heads} onChange={setHeads} min={0} max={MAX_HEADS} label="People on the payroll" />
        </Block>

        {company ? (
          <Block n={9} d={120} label="Issued share capital" help={`Sets the MBR registry fee on the annual return${capBand ? ` (${capBand.note})` : ""}, passed on at cost.`}>
            <OptionPills label="Issued share capital" items={CAPITAL_BANDS.map((c) => c.label)} value={CAPITAL_BANDS.findIndex((c) => c.id === s.capital)} onPick={(i) => set({ capital: CAPITAL_BANDS[i].id })} min={130} />
          </Block>
        ) : null}
      </div>
    </Band>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 02 Choose what you need                                                    */
/* ────────────────────────────────────────────────────────────────────────── */

export function ServicesSection({ api }: { api: BuilderApi }) {
  const { s, basket, now } = api;
  const keys = visibleServices(s, now);
  return (
    <Band surface="light" id="services" sec="config" style={{ scrollMarginTop: 88 }}>
      <div style={{ textAlign: "center", fontFamily: SANS, fontSize: "clamp(44px,7.4vw,132px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.1 }}>
        <TypeText segments={[{ t: "Every service.", c: INK }]} per={40} style={{ display: "inline-block" }} />
        <Words d={620} style={{ fontWeight: 600 }} parts={[{ t: "One" }, { t: "portal.", g: true }]} />
      </div>

      <div style={{ marginTop: "clamp(72px,9vw,128px)", display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 28 }}>
        <div style={{ maxWidth: 600 }}>
          <Eyebrow n="02">Choose what you need</Eyebrow>
          <h2 data-fx="rise" data-d="100" style={{ margin: "14px 0 0", fontFamily: SANS, fontSize: "clamp(32px,3.6vw,52px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.04 }}>
            Switch on what you need.
          </h2>
          <p data-fx="rise" data-d="200" style={{ margin: "14px 0 0", fontFamily: BODY, fontSize: 17, lineHeight: 1.55, color: "#52525B" }}>
            Every price is in its own cadence. With two services or more, one of them monthly, you can also take everything as one monthly retainer.
          </p>
        </div>
        <div data-fx="rise" data-d="120" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, maxWidth: "100%" }}>
          <ViewToggle api={api} />
          <span style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: "#71717A", textAlign: "right" }}>{viewCaption(api)}</span>
        </div>
      </div>

      <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: 16 }}>
        {keys.map((key, i) => (
          <ServiceCard key={key} api={api} k={key} i={i} total={keys.length} />
        ))}
      </div>

      {basket.conflict ? (
        <div role="note" data-fx="rise" style={{ marginTop: 16, padding: "clamp(22px,3vw,32px)", borderRadius: 24, background: INK, color: "#FFFFFF" }}>
          <span style={{ ...kicker, color: PERI }}>Independence</span>
          <p style={{ margin: "8px 0 18px", fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: "#E4E4E7", maxWidth: 820 }}>{CONFLICT_SHORT}</p>
          <Resolver api={api} dark />
        </div>
      ) : null}
    </Band>
  );
}

function ServiceCard({ api, k, i, total }: { api: BuilderApi; k: ServiceKey; i: number; total: number }) {
  const { s, basket, toggle, now, set, months } = api;
  const copy = SERVICE_COPY[k];
  const on = isOn(s, k, now);
  const locked = k === "catch";
  const dark = i % 2 === 1;
  const preview = servicePreview(s, k, basket.risk, now);
  const blank = basket.conflict && (k === "book" || k === "assure" || k === "catch" || k === "vat");
  const word = copy.word;
  const n = Array.from(word).length;
  const colors = Array.from(word).map((_, j) => (on ? (dark ? "#FFFFFF" : gcol(n > 1 ? j / (n - 1) : 0)) : dark ? "#3F3F46" : "#D4D4D8"));
  const line =
    k === "assure"
      ? auditIsReview(s)
        ? "A review engagement — the lighter option — with our partner audit firms."
        : "A full statutory audit, with our partner audit firms."
      : k === "catch"
        ? `${months} earlier ${months === 1 ? "month" : "months"}, brought up to date at your own monthly rate.`
        : copy.line;
  const flip = () => {
    if (!locked) toggle(k as ToggleKey);
  };
  const sub = dark ? "#A1A1AA" : "#52525B";

  return (
    <div
      data-fx="rise"
      data-d={(i % 3) * 80 || undefined}
      className="a4q-card"
      data-locked={locked ? "true" : undefined}
      onClick={flip}
      style={{
        position: "relative", overflow: "hidden", minHeight: 330, padding: 28, borderRadius: 24, display: "flex", flexDirection: "column", gap: 14, minWidth: 0,
        background: dark ? DARK_CARD : "#FFFFFF",
        border: `1px solid ${dark ? (on ? "rgba(139,143,247,.45)" : "rgba(255,255,255,.06)") : on ? "rgba(79,85,241,.45)" : "#E4E4E7"}`,
        boxShadow: on ? (dark ? "0 24px 60px rgba(9,9,11,.28)" : "0 24px 60px rgba(79,85,241,.12)") : "none",
        transition: "border-color .35s, box-shadow .35s",
        color: dark ? "#FFFFFF" : INK,
        fontFamily: SANS,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: sub }}>
          <span style={{ color: on ? (dark ? PERI : INDIGO) : sub, transition: "color .3s" }}>{pad2(i + 1)}</span>
          <span>/ {pad2(total)}</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={locked ? `${word} — follows your start month` : word}
          disabled={locked}
          className="a4q-toggle"
          onClick={(e) => {
            e.stopPropagation();
            flip();
          }}
          style={{ background: on ? INDIGO : dark ? "#3F3F46" : "#E4E4E7", opacity: locked ? 0.7 : 1 }}
        >
          <span />
        </button>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", minHeight: 110 }}>
        <LetterWord
          text={word}
          fx={copy.fx}
          wordKey={k}
          d={220 + (i % 3) * 90}
          per={55}
          colors={colors}
          letterStyle={{ transition: "color .45s" }}
          style={{ fontSize: wordSize(word), fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.1, whiteSpace: "nowrap" }}
        />
      </div>
      <p style={{ margin: 0, fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.35, color: dark ? (on ? "#E4E4E7" : "#A1A1AA") : on ? "#3F3F46" : "#71717A", textWrap: "pretty", transition: "color .3s" }}>{line}</p>
      {k === "csp" ? (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderRadius: 16, background: dark ? "rgba(255,255,255,.05)" : "#FAFAFA", border: `1px solid ${dark ? "rgba(255,255,255,.1)" : "#E4E4E7"}`, cursor: "default" }}
        >
          <span style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.45, color: dark ? "#E4E4E7" : "#3F3F46" }}>
            Our registered office too <span style={{ color: sub }}>· {euro(REGISTERED_OFFICE_FEE)} /yr</span>
          </span>
          <Switch on={s.regoff} onChange={(v) => set({ regoff: v })} label="Registered office" />
        </div>
      ) : null}
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 16, borderTop: `1px solid ${dark ? "rgba(255,255,255,.1)" : "#E4E4E7"}` }}>
        <div style={{ minWidth: 0 }}>
          {blank ? (
            <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 600, color: dark ? PERI : INDIGO }}>Blank until you pick which one is ours</span>
          ) : preview.price ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.03em", color: on ? (dark ? "#FFFFFF" : INK) : dark ? "#71717A" : "#A1A1AA", transition: "color .3s" }}>{euro(preview.price.amount)}</span>
                <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: sub }}>{preview.price.per}</span>
              </div>
              {preview.price.extra ? <div style={{ marginTop: 2, fontFamily: BODY, fontSize: 13, color: sub }}>{preview.price.extra}</div> : null}
            </>
          ) : (
            <span style={{ fontFamily: BODY, fontSize: 13.5, lineHeight: 1.45, fontWeight: 500, color: dark ? "#D4D4D8" : "#52525B" }}>{preview.needs}</span>
          )}
        </div>
        <span
          style={{
            flexShrink: 0, height: 30, padding: "0 13px", display: "flex", alignItems: "center", borderRadius: 999, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
            background: on ? (dark ? "rgba(139,143,247,.18)" : "rgba(79,85,241,.1)") : "transparent",
            color: on ? (dark ? "#FFFFFF" : INDIGO) : sub,
            border: `1px solid ${on ? "transparent" : dark ? "rgba(255,255,255,.18)" : "#E4E4E7"}`,
            transition: "all .3s",
          }}
        >
          {locked ? (on ? "Included" : "Needs the books") : on ? "Included" : "Add"}
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 03 Your quote, line by line                                                */
/* ────────────────────────────────────────────────────────────────────────── */

function GateBody({ api }: { api: BuilderApi }) {
  const { basket, go } = api;
  const box: CSSProperties = { padding: `40px ${DOC_PAD}`, borderTop: "1px solid #E4E4E7" };
  const msg: CSSProperties = { margin: 0, maxWidth: 760, fontFamily: SANS, fontSize: 20, fontWeight: 500, lineHeight: 1.45, letterSpacing: "-0.01em", color: "#3F3F46" };
  if (basket.gate === "refer")
    return (
      <div style={box}>
        <p style={msg}>{REFER_NOTE}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 22 }}>
          <PillLink href="/contact" variant="ink" size="md">
            Request a call
          </PillLink>
          <button type="button" className="a4-btn a4-btn-outline" style={{ height: 48, padding: "0 24px", fontSize: 16 }} onClick={() => go("#request")}>
            Tell us what you need
          </button>
        </div>
      </div>
    );
  if (basket.gate === "conflict")
    return (
      <div style={box}>
        <p style={{ ...msg, fontSize: 17, fontFamily: BODY }}>{CONFLICT_SUMMARY}</p>
        <div style={{ marginTop: 22, padding: "20px 20px 18px", borderRadius: 20, background: "rgba(79,85,241,.06)", border: "1px solid rgba(79,85,241,.22)" }}>
          <Resolver api={api} />
        </div>
      </div>
    );
  if (basket.gate === "no-expenses")
    return (
      <div style={box}>
        <p style={msg}>Tell us roughly what the business spends a month and the itemised quote appears here — it sets the bookkeeping and the tax return, and we never assume a band.</p>
        <button type="button" className="a4-btn a4-btn-ink" style={{ marginTop: 22, height: 48, padding: "0 24px", fontSize: 16 }} onClick={() => go("#about")}>
          Answer it in 01
        </button>
      </div>
    );
  return (
    <div style={{ ...box, textAlign: "center" }}>
      <p style={{ ...msg, margin: "0 auto" }}>Switch on at least one service above to see your quote.</p>
    </div>
  );
}

function QuoteRow({ api, k, n }: { api: BuilderApi; k: ServiceKey; n: number }) {
  const { basket, retainer, view, s } = api;
  const copy = SERVICE_COPY[k];
  const lines = basket.lines.filter((l) => l.key === k);
  const covered = new Set(retainer.covered);
  const asRetainer = view === "retainer" && retainer.offered;
  const native = nativePrice(lines);
  const yearAmount = lines.reduce((t, l) => t + (l.cadence === "monthly" ? l.amount * 12 : l.amount), 0);
  const registry = lines.reduce((t, l) => t + l.registry, 0);
  const allCovered = lines.every((l) => covered.has(l.index));
  const anyCovered = lines.some((l) => covered.has(l.index));

  // The priced lines themselves: every line when a service is made of several,
  // a lone line only when it carries its own arithmetic (the catch-up) — and,
  // as one retainer, where each line sits.
  const several = lines.length > 1;
  const detail: ReactNode[] = lines.map((l) => {
    const inside = asRetainer && covered.has(l.index);
    const reg = asRetainer && l.registry ? `; the ${euro(l.registry)} /yr registry fee stays outside, at cost` : "";
    if (!several && !/\d/.test(l.label) && !reg) return null;
    const amount = several ? ` — ${euro(l.amount)} ${cadence(l.cadence)}` : "";
    if (inside)
      return (
        <>
          {l.label} — <span style={{ color: INDIGO, fontWeight: 600 }}>in the retainer</span>
          {reg}
        </>
      );
    return `${l.label}${amount}${asRetainer ? ", billed separately" : ""}`;
  });
  const items = [...detail.filter((d) => d != null), ...copy.scope];
  const word = k === "assure" ? (auditIsReview(s) ? "Review" : "Audit") : copy.word;

  let price: ReactNode;
  if (asRetainer && anyCovered) {
    price = (
      <>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.03em", ...gradText }}>Included</div>
        <div style={{ marginTop: 4, fontFamily: BODY, fontSize: 13, lineHeight: 1.4, color: "#71717A" }}>
          <s>
            {euro(native.amount)} {native.per}
          </s>
          {registry ? ` · + ${euro(registry)} /yr registry at cost` : ""}
          {!allCovered && !registry ? " · part billed separately" : ""}
        </div>
      </>
    );
  } else {
    const amount = view === "year" ? yearAmount : native.amount;
    const per = view === "year" ? (lines.every((l) => l.cadence === "one-off") ? "one-off, in year one" : "first year") : native.per;
    price = (
      <>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.03em" }}>{euro(amount)}</div>
        <div style={{ marginTop: 4, fontFamily: BODY, fontSize: 13, lineHeight: 1.4, color: "#71717A" }}>
          {per}
          {view !== "year" && native.extra ? ` · ${native.extra}` : ""}
          {asRetainer ? " · billed separately" : ""}
        </div>
      </>
    );
  }

  return (
    <div data-row={k} style={{ display: "flex", flexWrap: "wrap", gap: "18px 36px", padding: `28px ${DOC_PAD}`, borderTop: "1px solid #E4E4E7" }}>
      <div style={{ flex: "1 1 240px", display: "flex", gap: 16, minWidth: 0 }}>
        <span style={{ paddingTop: 7, fontSize: 15, fontWeight: 600, letterSpacing: ".02em", color: INDIGO }}>{pad2(n)}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15 }}>{word}</div>
          <div style={{ marginTop: 6, fontFamily: BODY, fontSize: 15, lineHeight: 1.5, color: "#52525B" }}>{copy.line}</div>
        </div>
      </div>
      <div style={{ flex: "1.4 1 280px", minWidth: 0, paddingTop: 4 }}>
        <Bullets items={items} />
      </div>
      <div style={{ flex: "0 0 170px", marginLeft: "auto", textAlign: "right" }}>{price}</div>
    </div>
  );
}

/** "Or one monthly retainer" — the offer beside the itemised quote. */
function RetainerCallout({ api }: { api: BuilderApi }) {
  const { retainer: r, basket, view, setView } = api;
  if (!r.offered) {
    const why = retainerReason(r);
    if (r.reason === "nothing-recurring" || !why) return null;
    return (
      <div style={{ padding: `20px ${DOC_PAD}`, borderTop: "1px solid #E4E4E7", fontFamily: BODY, fontSize: 14.5, lineHeight: 1.55, color: "#52525B" }}>
        <span style={{ fontWeight: 600, color: INK }}>One monthly retainer?</span> {why}
      </div>
    );
  }
  const sep = separately(basket, r);
  const cell = (k: string, v: ReactNode, sub?: ReactNode, strong = false) => (
    <div style={{ minWidth: 0 }}>
      <div style={{ ...kicker, color: "#A1A1AA" }}>{k}</div>
      <div style={{ marginTop: 6, fontSize: strong ? 30 : 22, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15, ...(strong ? gradText : { color: "#FFFFFF" }) }}>{v}</div>
      {sub ? <div style={{ marginTop: 4, fontFamily: BODY, fontSize: 13, color: "#A1A1AA" }}>{sub}</div> : null}
    </div>
  );
  return (
    <div style={{ padding: `0 ${DOC_PAD} 32px`, borderTop: "1px solid #E4E4E7" }}>
      <div style={{ marginTop: 32, padding: "clamp(22px,3vw,34px)", borderRadius: 24, background: DARK_CARD, color: "#FFFFFF" }}>
        <div style={{ ...kicker, color: PERI }}>Or one monthly retainer</div>
        <div style={{ marginTop: 10, fontSize: "clamp(22px,2.4vw,30px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.2 }}>{RETAINER_COPY.headline(euro(r.monthly))}</div>
        <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))", gap: 20 }}>
          {cell("Separately", `${euro(sep.monthly)} /mo`, sep.yearly ? `+ ${euro(sep.yearly)} /yr` : undefined)}
          {cell("One retainer", `${euro(r.monthly)} /mo`, `${euro(r.retainerAnnual)} a year`, true)}
          {cell("Less a year", euro(r.savingYearly), `than separately · ${(r.savingPct * 100).toFixed(1)}%`)}
        </div>
        <p style={{ margin: "20px 0 0", fontFamily: BODY, fontSize: 13.5, lineHeight: 1.55, color: "#D4D4D8" }}>
          {RETAINER_COPY.billed} · {RETAINER_COPY.outside}
          {r.registryYearly ? ` (registry ${euro(r.registryYearly)} /yr)` : ""} · {RETAINER_COPY.vat}.
        </p>
        {view !== "retainer" ? (
          <button type="button" className="a4-btn a4-btn-light" style={{ marginTop: 20, height: 48, padding: "0 22px", fontSize: 15.5 }} onClick={() => setView("retainer")}>
            Show it as one retainer
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Totals({ api }: { api: BuilderApi }) {
  const { totals: t, basket, retainer: r, shownTotal } = api;
  const inRetainer = new Set(r.covered);
  // As one retainer, count the services it covers (a catch-up or an audit stays outside).
  const count = t.view === "retainer" ? basket.priced.filter((k) => basket.lines.some((l) => l.key === k && inRetainer.has(l.index))).length : basket.priced.length;
  const countLabel = count === 1 ? "1 service" : `${count} services`;
  const row: CSSProperties = { display: "flex", justifyContent: "space-between", gap: 16 };
  const asRetainer = t.view === "retainer";
  const outsideAudit = r.outside.filter((o) => o.reason === "audit").reduce((s, o) => s + o.amount, 0);
  const also = asRetainer
    ? [
        r.registryYearly ? `registry ${euro(r.registryYearly)} /yr at cost` : "",
        outsideAudit ? `${euro(outsideAudit)} /yr audit or review + VAT` : "",
        r.oneOff ? `${euro(r.oneOff)} one-off + VAT` : "",
      ]
    : [t.alsoYearly ? `${euro(t.alsoYearly)} /yr` : "", t.alsoOneOff ? `${euro(t.alsoOneOff)} one-off` : ""];
  const alsoText = also.filter(Boolean).join(" · ");
  return (
    <DocFoot>
      <DocChip>VAT added at 18% · registry fees at cost</DocChip>
      <div style={{ width: "min(100%, 460px)", display: "flex", flexDirection: "column", gap: 12, fontFamily: BODY, fontSize: 16, fontWeight: 500, color: "#3F3F46" }}>
        <div style={row}>
          <span>{asRetainer ? `Monthly retainer · ${countLabel}` : `Subtotal · ${countLabel}`}</span>
          <span style={{ color: INK }}>{euro(t.net, 2)}</span>
        </div>
        {asRetainer ? (
          <div style={{ ...row, color: INDIGO }}>
            <span>Less than separately</span>
            <span>{euro(r.savingYearly)} a year</span>
          </div>
        ) : null}
        <div style={row}>
          <span>VAT 18%</span>
          <span style={{ color: INK }}>{euro(t.vat, 2)}</span>
        </div>
        <div style={{ height: 1, margin: "6px 0", background: "#E4E4E7" }} />
        <div style={{ ...row, alignItems: "baseline" }}>
          <span style={{ fontFamily: SANS, fontSize: 20, fontWeight: 600, color: INK }}>Total {t.per}</span>
          <span style={{ fontFamily: SANS, fontSize: "clamp(34px,3.6vw,46px)", fontWeight: 600, letterSpacing: "-0.04em", ...gradText }}>{euro(shownTotal, 2)}</span>
        </div>
        {alsoText ? (
          <div style={{ ...row, color: INDIGO, fontSize: 14 }}>
            <span>{asRetainer ? "Outside the retainer" : "Also on this quote"}</span>
            <span style={{ textAlign: "right" }}>
              {alsoText}
              {asRetainer ? "" : ", before VAT"}
            </span>
          </div>
        ) : null}
        <div style={{ ...row, fontSize: 14, color: "#71717A" }}>
          <span>{asRetainer ? "Billed monthly, 12-month minimum" : "First year, before VAT"}</span>
          <span>{asRetainer ? `${euro(t.firstYear)} in year one` : euro(t.firstYear)}</span>
        </div>
      </div>
    </DocFoot>
  );
}

export function QuoteSection({ api }: { api: BuilderApi }) {
  const { basket, s, view, months, now } = api;
  const startOk = isStartMonth(s.startMonth);
  const meta: [string, string][] = [
    ["For", `${s.entity === "company" ? "A company" : "Self-employed"} · ${sectorLabel(s.sector).toLowerCase()}`],
    ["Starts", startOk ? formatStartMonth(ongoingStartMonth(s.startMonth, now)) : "Pick a month in 01"],
    ["Catch-up", startOk ? (months > 0 && s.on.book ? `${months} ${months === 1 ? "month" : "months"}` : "None") : "—"],
    ["Fees shown", VIEW_LABEL[view]],
  ];
  return (
    <Band surface="muted" id="quote" sec="quote" max={1180} style={{ scrollMarginTop: 88 }}>
      <Eyebrow n="03" style={{ marginBottom: 22 }}>
        Your quote, line by line
      </Eyebrow>
      <Statement typed="The quote," words={[{ t: "line by" }, { t: "line.", g: true }]} label="The quote, line by line." per={45} />

      <Doc style={{ marginTop: "clamp(48px,6vw,80px)" }}>
        <DocHead k="Instant quote" title="Your quote" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "20px 32px", padding: `32px ${DOC_PAD}` }}>
          {meta.map(([k, v]) => (
            <div key={k} style={{ minWidth: 0 }}>
              <div style={kicker}>{k}</div>
              <div style={{ marginTop: 6, fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em", overflowWrap: "anywhere" }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, padding: `0 ${DOC_PAD} 24px` }}>
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.03em" }}>Scope and fees</div>
          <ViewToggle api={api} />
        </div>
        {basket.gate ? (
          <GateBody api={api} />
        ) : (
          <>
            {basket.priced.map((k, i) => (
              <QuoteRow key={k} api={api} k={k} n={i + 1} />
            ))}
            <RetainerCallout api={api} />
            <Totals api={api} />
          </>
        )}
      </Doc>

      <div data-fx="rise" style={{ marginTop: 28 }}>
        <Bullets
          items={[...basket.notes, `${PRICING_VAT_NOTE} ${PRICING_GOV_NOTE}`, "Indicative until your formal quotation arrives — it carries the same figures, and you accept it online."]}
          size={14}
        />
      </div>
    </Band>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 04 Get your formal quotation                                               */
/* ────────────────────────────────────────────────────────────────────────── */

type Sent = { result: WebsiteQuoteResult; sig: string; email: string };

function SendCard({ api }: { api: BuilderApi }) {
  const { basket, retainer: r, s, view, plan, setPlan, go } = api;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [hp, setHp] = useState("");
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<Sent | null>(null);

  const planNow = effectivePlan(view, plan, r.offered);
  const startOk = isStartMonth(s.startMonth);
  const sig = basketSignature(basket, s.startMonth, planNow);
  // A quotation sent for a different basket is stale: the form comes back.
  const done = sent && sent.sig === sig ? sent : null;
  const nameOk = name.trim().length >= 2;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSend = !basket.gate && basket.items.length > 0 && startOk && nameOk && emailOk;

  if (basket.gate === "refer" || basket.gate === "conflict") {
    return (
      <CtaCard>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.03em" }}>{basket.gate === "refer" ? "Let's talk first." : "One or the other."}</div>
        <p style={{ margin: "12px 0 0", fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: "#D4D4D8" }}>{basket.gate === "refer" ? REFER_NOTE : CONFLICT_SHORT}</p>
        {basket.gate === "conflict" ? (
          <div style={{ marginTop: 22 }}>
            <Resolver api={api} dark />
          </div>
        ) : null}
        <PillLink href="/contact" variant={basket.gate === "refer" ? "light" : "ghost"} style={{ marginTop: 24, width: "100%", height: 60, fontSize: 18 }}>
          Request a call
        </PillLink>
      </CtaCard>
    );
  }

  if (done) {
    const quoted = done.result.status === "quoted";
    return (
      <CtaCard d={0} style={{ textAlign: "center" }}>
        <span style={{ width: 64, height: 64, display: "inline-grid", placeItems: "center", borderRadius: 999, background: INDIGO, boxShadow: "0 24px 60px rgba(79,85,241,.45)" }}>
          <Check size={30} width={3} />
        </span>
        <p role="status" style={{ margin: "24px auto 0", maxWidth: 440, fontSize: "clamp(22px,2.4vw,28px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.25 }}>
          {quoted && done.result.status === "quoted" ? `Quotation ${done.result.reference} is on its way to ${done.email} — open it to review and accept online.` : done.result.message}
        </p>
        <p style={{ margin: "14px auto 0", maxWidth: 420, fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: "#A1A1AA" }}>
          {quoted ? "On the quotation page you can switch services on or off and choose separate fees or the monthly retainer." : "If your answers need a closer look, our team replies within one working day."} Change an answer above to send an updated quote.
        </p>
      </CtaCard>
    );
  }

  const send = async () => {
    if (sending) return;
    setTried(true);
    if (!canSend) return;
    // Honeypot: a real visitor never sees the field. Pretend it went, send nothing.
    if (hp.trim()) {
      setSent({ result: { status: "received", message: "We've got your details — your quote follows by email." }, sig, email: email.trim() });
      return;
    }
    setSending(true);
    setError("");
    const result = await submitWebsiteQuotation({
      name,
      email,
      phone,
      company,
      items: basket.items,
      risk: basket.risk,
      // The same "today" the catch-up months were counted from, so the backlog and the ongoing month meet.
      serviceStartDate: ongoingStartMonth(s.startMonth, api.now),
      plan: planNow,
      provenance: { formName: "a4-quote-builder", formLabel: "Quote builder", pageUrl: window.location.origin + window.location.pathname },
    });
    setSending(false);
    if (result.status === "error") {
      // The form stays as it is, so the visitor can simply try again.
      setError(result.message);
      return;
    }
    trackConversion("quote_request_builder");
    // Pin the plan that was sent, so switching the view afterwards does not bring the form back.
    setPlan(planNow);
    setSent({ result, sig, email: email.trim() });
  };

  const t = basket.totals;
  const separateLine = [t.monthly ? `${euro(t.monthly)} /mo` : "", t.yearly ? `${euro(t.yearly)} /yr` : "", t.oneOff ? `${euro(t.oneOff)} one-off` : ""].filter(Boolean).join(" + ");
  const retainerLine = r.offered
    ? [`${euro(r.monthly)} /mo`, r.registryYearly ? `registry ${euro(r.registryYearly)} /yr at cost` : "", r.outside.some((o) => o.reason === "audit") ? "audit or review separately" : "", r.oneOff ? `${euro(r.oneOff)} one-off` : ""].filter(Boolean).join(" + ")
    : retainerReason(r);
  const err = (id: string, text: string) => (
    <span id={id} role="alert" style={darkError}>
      <span className="a4-bullet" style={{ marginTop: 6, background: PERI }} />
      <span>{text}</span>
    </span>
  );
  const nothing = basket.gate === "no-expenses" || basket.gate === "nothing";

  return (
    <CtaCard>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        noValidate
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 16 }}>
          <div>
            <label htmlFor="aq-name" style={darkLabel}>
              Your name
            </label>
            <input id="aq-name" className="a4-input-dark" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={120} placeholder="e.g. Maria Borg" aria-invalid={tried && !nameOk ? true : undefined} aria-describedby={tried && !nameOk ? "aq-name-err" : undefined} />
            {tried && !nameOk ? err("aq-name-err", "Add your name.") : null}
          </div>
          <div>
            <label htmlFor="aq-email" style={darkLabel}>
              Email
            </label>
            <input id="aq-email" type="email" className="a4-input-dark" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={320} placeholder="maria@borgtrading.mt" aria-invalid={tried && !emailOk ? true : undefined} aria-describedby={tried && !emailOk ? "aq-email-err" : undefined} />
            {tried && !emailOk ? err("aq-email-err", "Add an email we can send it to.") : null}
          </div>
          <div>
            <label htmlFor="aq-phone" style={darkLabel}>
              Phone <span style={{ fontWeight: 500, color: "#A1A1AA" }}>optional</span>
            </label>
            <input id="aq-phone" type="tel" className="a4-input-dark" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" maxLength={50} placeholder="+356 …" />
          </div>
          <div>
            <label htmlFor="aq-company" style={darkLabel}>
              Company <span style={{ fontWeight: 500, color: "#A1A1AA" }}>optional</span>
            </label>
            <input id="aq-company" className="a4-input-dark" value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" maxLength={160} placeholder="Borg Trading Ltd" />
          </div>
        </div>
        {/* Honeypot — off-screen, never filled by a person (vacei.com's `company_website`). */}
        <input
          type="text"
          name="company_website"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
        />

        {!nothing ? (
          <fieldset style={{ margin: 0, padding: 0, border: 0, minWidth: 0 }}>
            <legend style={{ ...darkLabel, padding: 0 }}>How would you like to be billed?</legend>
            <div style={{ display: "grid", gap: 10 }}>
              {(
                [
                  ["separate", "Separate services", separateLine, false],
                  ["retainer", "One monthly retainer", retainerLine, !r.offered],
                ] as const
              ).map(([id, title, sub, disabled]) => (
                <label key={id} className="a4q-plan" data-on={planNow === id ? "true" : undefined} data-disabled={disabled ? "true" : undefined}>
                  <input type="radio" name="aq-plan" value={id} checked={planNow === id} disabled={disabled} onChange={() => setPlan(id)} />
                  <span className="a4q-dot" aria-hidden="true" />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: SANS, fontSize: 16, fontWeight: 600, letterSpacing: "-0.015em" }}>{title}</span>
                    <span style={{ display: "block", marginTop: 4, fontFamily: BODY, fontSize: 13.5, lineHeight: 1.45, color: "#A1A1AA" }}>{sub}</span>
                  </span>
                </label>
              ))}
            </div>
            <p style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 12.5, lineHeight: 1.5, color: "#A1A1AA" }}>
              Your quotation lists every service either way — you can still change your mind when you accept.
            </p>
          </fieldset>
        ) : null}

        {nothing ? (
          <p style={{ margin: 0, fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: "#E4E4E7" }}>
            {basket.gate === "no-expenses" ? "Tell us the monthly spend in 01 and the quote is ready to send. " : "Switch on at least one service in 02 and the quote is ready to send. "}
            <button type="button" className="a4q-link" onClick={() => go(basket.gate === "no-expenses" ? "#about" : "#services")}>
              {basket.gate === "no-expenses" ? "Go to 01" : "Go to 02"}
            </button>
          </p>
        ) : !startOk ? (
          <p style={{ margin: 0, fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: tried ? "#FFFFFF" : "#E4E4E7", fontWeight: tried ? 600 : 500 }} role={tried ? "alert" : undefined}>
            Pick the month we start from — the price depends on it.{" "}
            <button type="button" className="a4q-link" onClick={() => go("#about")}>
              Go to 01
            </button>
          </p>
        ) : null}

        <div>
          <button type="submit" disabled={sending} className="a4-btn a4-btn-light" style={{ width: "100%", height: 64, fontSize: 19, opacity: sending || (tried && !canSend) ? 0.55 : 1 }}>
            {sending ? "Sending…" : "Send me the quotation"}
          </button>
          <p role="status" aria-live="polite" style={{ margin: "16px 0 0", textAlign: "center", fontFamily: BODY, fontSize: 14, lineHeight: 1.5, color: error ? "#FFFFFF" : "#A1A1AA", fontWeight: error ? 600 : 500 }}>
            {error || "Free and without obligation. All fees exclude VAT."}
          </p>
        </div>
      </form>
    </CtaCard>
  );
}

export function SendSection({ api }: { api: BuilderApi }) {
  const { basket, totals: viewT, shownNet, retainer: r, view, plan } = api;
  // The figure beside the form follows the plan being asked for, not only the view.
  const planNow = effectivePlan(view, plan, r.offered);
  const asRetainer = planNow === "retainer";
  const t = asRetainer === (viewT.view === "retainer") ? viewT : viewTotals(basket, asRetainer ? "retainer" : "monthly", r);
  const figure = t === viewT ? shownNet : t.net;
  return (
    <DarkCta
      id="send"
      sec="send"
      n="04"
      eyebrow="Get your formal quotation"
      typed="Get it in"
      words={[{ t: "writing.", g: true }]}
      label="Get it in writing."
      lead="We email it to you as its own page. Switch services on or off there, choose separate fees or the monthly retainer, and accept online."
      below={
        !basket.gate ? (
          <div data-fx="rise" data-d="820" style={{ marginTop: 22 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: "clamp(40px,4.4vw,64px)", fontWeight: 600, letterSpacing: "-0.04em", ...gradText }}>{euro(figure)}</span>
              <span style={{ fontFamily: BODY, fontSize: 16, fontWeight: 500, color: "#A1A1AA" }}>
                {asRetainer ? "/ mo retainer" : t.per} · before VAT
              </span>
            </div>
            {asRetainer ? (
              <p style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 15, fontWeight: 500, color: "#A1A1AA" }}>Billed monthly, 12-month minimum{r.registryYearly ? ` · registry ${euro(r.registryYearly)} /yr at cost` : ""}{r.oneOff ? ` · ${euro(r.oneOff)} one-off` : ""}.</p>
            ) : t.alsoYearly || t.alsoOneOff ? (
              <p style={{ margin: "10px 0 0", fontFamily: BODY, fontSize: 15, fontWeight: 500, color: "#A1A1AA" }}>
                Plus {[t.alsoYearly ? `${euro(t.alsoYearly)} /yr` : "", t.alsoOneOff ? `${euro(t.alsoOneOff)} one-off` : ""].filter(Boolean).join(" and ")}, before VAT.
              </p>
            ) : null}
          </div>
        ) : null
      }
    >
      <SendCard api={api} />
    </DarkCta>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* 05 How it works · 06 Terms                                                 */
/* ────────────────────────────────────────────────────────────────────────── */

export function AfterSections() {
  return (
    <>
      <Band surface="light" sec="how">
        <Head
          n="05"
          eyebrow="How it works"
          size="lg"
          title={
            <>
              From here to work <G>begins.</G>
            </>
          }
        />
        <Timeline steps={TIMELINE.map((x) => ({ key: x.t, t: x.t, s: x.s }))} min={190} />
      </Band>
      <Band surface="white" sec="terms">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "56px 72px" }}>
          <div>
            <Eyebrow n="06">Terms</Eyebrow>
            <div data-fx="rise" data-d="100" style={{ marginTop: 18, fontFamily: SANS, fontSize: "clamp(40px,5.2vw,84px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.05 }}>
              All fees
            </div>
            <div data-fx="rise" data-d="200" style={{ fontFamily: SANS, fontSize: "clamp(40px,5.2vw,84px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.1, paddingBottom: ".08em", ...gradText }}>
              exclude VAT.
            </div>
          </div>
          <NumberedRows items={TERMS.map((t, i) => ({ key: String(i), body: t }))} />
        </div>
      </Band>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* The sticky price pill                                                      */
/* ────────────────────────────────────────────────────────────────────────── */

export function StickyPill({ api, on, atQuote }: { api: BuilderApi; on: boolean; atQuote: boolean }) {
  const { basket, totals: t, shownNet, go } = api;
  const count = basket.priced.length;
  const priced = !basket.gate;
  return (
    <div
      aria-hidden={!on}
      style={{ position: "fixed", left: 0, right: 0, bottom: 20, zIndex: 40, display: "flex", justifyContent: "center", padding: "0 12px", pointerEvents: "none", transform: `translateY(${on ? 0 : 120}px)`, opacity: on ? 1 : 0, transition: "transform .5s cubic-bezier(.16,1,.3,1), opacity .4s" }}
    >
      <div style={{ pointerEvents: on ? "auto" : "none", maxWidth: "100%", display: "flex", alignItems: "center", gap: 14, height: 60, padding: "0 8px 0 22px", borderRadius: 30, background: "rgba(9,9,11,.92)", border: "1px solid rgba(255,255,255,.12)", boxShadow: "0 24px 60px rgba(9,9,11,.35)", color: "#FFFFFF", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", fontFamily: SANS }}>
        <span className="a4q-hide-xs" style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: "#A1A1AA", whiteSpace: "nowrap" }}>
          {priced ? (count === 1 ? "1 service" : `${count} services`) : "Your quote"}
        </span>
        <span className="a4q-hide-xs" style={{ width: 1, height: 22, background: "rgba(255,255,255,.14)" }} />
        {priced ? (
          <>
            <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.03em", whiteSpace: "nowrap", backgroundImage: "linear-gradient(90deg,#6468F3 0%,#8B8FF7 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", WebkitTextFillColor: "transparent" }}>{euro(shownNet)}</span>
            <span style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: "#A1A1AA", whiteSpace: "nowrap" }}>
              {t.view === "retainer" ? "/ mo retainer" : t.per} + VAT
            </span>
          </>
        ) : (
          <span style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, color: "#E4E4E7", whiteSpace: "nowrap" }}>A few answers to go</span>
        )}
        <button
          type="button"
          tabIndex={on ? 0 : -1}
          onClick={() => go(atQuote ? "#send" : "#quote")}
          style={{ height: 44, padding: "0 18px", borderRadius: 22, border: 0, background: "#FFFFFF", color: INK, fontSize: 15, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          {atQuote ? "Send it" : "View quote"}
        </button>
      </div>
    </div>
  );
}
