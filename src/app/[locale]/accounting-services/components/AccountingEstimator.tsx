"use client";

import React, { useState } from "react";
import { Button, Icon, Container } from "@/components/a4-landing/Primitives";
import { useQuoteActions } from "@/components/a4-landing/QuoteActions";
import type { QuotePayload } from "@/lib/quote-handoff";
import {
  SECTORS, TXN, ENTITIES, EXPENSES, VAT_REG, STEPS,
  calcAccountingFee, accountingSummary, quoteBreakdown, euro, formatStartMonth, catchUpMonthsFrom, ongoingStartMonth,
  ACCOUNTING_NO_EXPENSES_NOTE,
  type AccountingInput, type VatRegId,
} from "@/lib/accounting-fee";
import { LAUNCH_PROMO, MANAGED_ENTITY_LABELS, PRICING_VAT_NOTE, type ExpenseBand, type ManagedEntity, type TxnBand } from "@/data/a4QuotePack";
import { INDEPENDENCE_BOOKKEEPING, flagsForServiceSelection } from "@/lib/independence";

type Opt = { id: string; label: string; sub?: string };
const labelOf = (list: Opt[], id: string) => (list.find((o) => o.id === id) ?? list[0]).label;

function Pills({ items, value, set }: { items: Opt[]; value: string; set: (id: string) => void }) {
  return (
    <div role="group" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => set(o.id)}
            aria-pressed={on}
            style={{
              display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1,
              padding: "9px 16px", borderRadius: "var(--a4-r-md)",
              border: "1px solid " + (on ? "var(--a4-primary)" : "var(--a4-hairline-light)"),
              background: on ? "var(--a4-primary)" : "transparent",
              color: on ? "#fff" : "var(--a4-body)",
              fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600,
              cursor: "pointer", textAlign: "left",
              transition: "background .15s, color .15s, border-color .15s",
            }}
          >
            {o.label}
            {o.sub ? <span style={{ fontSize: 10.5, fontWeight: 400, opacity: 0.75 }}>{o.sub}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

const sliderStyle: React.CSSProperties = { flex: 1, accentColor: "var(--a4-primary)", cursor: "pointer" };
const readoutStyle: React.CSSProperties = { minWidth: 96, textAlign: "right", fontFamily: "var(--a4-font-display)", fontVariantNumeric: "tabular-nums", fontSize: 15, fontWeight: 600, color: "var(--a4-ink)" };
const tagLabel: React.CSSProperties = { fontFamily: "var(--a4-font-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--a4-primary)" };

const QUESTIONS: { title: string; help: string }[] = [
  { title: "What does the company do?", help: "Some sectors need extra checks when we take you on. It is built into the price rather than added later." },
  { title: "Are these a company's books, or your own?", help: "With your monthly spend, it is what sets the bookkeeping price. We keep the books either way — there is no software-only option." },
  { title: "About how much do you spend a month?", help: "Your monthly expenses are the money that leaves the business in a typical month — supplier bills, wages, rent, software, everything you spend. Exclude VAT, loan repayments, and transfers between your own accounts. New or seasonal business? Use your average over the last three months. It is what sets the bookkeeping price — a different question from the transaction count, which prices VAT, the tax return and the audit." },
  { title: "Anyone on payroll?", help: "Payslips, monthly employer filing and annual returns, priced per person and cheaper as the team grows." },
  { title: "Are you VAT registered?", help: "VAT returns are built only from entries we have already worked and reconciled." },
  // ONE question, not two. It used to ask for the start month and then, in
  // different words, how many months were behind — the same fact twice, since
  // a start month in the past IS the count of months behind.
  { title: "From which month do you need us?", help: "Pick the earliest month that still needs doing. Everything before this month is catch-up at the same monthly rate — no premium, no cap — and the monthly fee runs from now on." },
  { title: "Your price", help: "Everything on the right is itemised — nothing appears later that is not on that list." },
];
const LAST = QUESTIONS.length - 1; // the price step

export function AccountingEstimator() {
  const [step, setStep] = useState(0);
  /**
   * B1 — NOTHING about the price is pre-answered.
   *
   * `expenses` and `startMonth` both ship EMPTY. They used to ship "10-25k"
   * and `nextMonth()`, which meant a visitor who never reached those questions
   * still got a complete, binding price: a company spending €300k/month was
   * quoted the €69 band, and because that band id is perfectly valid the
   * backend re-priced it, agreed, and issued the quotation. Defaulting down
   * loses money invisibly; defaulting up loses the customer. The pack's own
   * docblock forbids both, vacei.com holds Next until they are answered, and
   * this surface now does the same.
   */
  const [s, setS] = useState<AccountingInput>({
    sector: "shop", txn: "1-20", banks: 1, entity: "company", expenses: "", head: 2, vatreg: "art10", behind: "0",
    startMonth: "",
  });
  const set = (patch: Partial<AccountingInput>) => setS((a) => ({ ...a, ...patch }));

  const q = calcAccountingFee(s);
  const summary = accountingSummary(s, q);
  // A start month is REQUIRED, not suggested: it decides which months are
  // catch-up, so a guessed one silently re-prices the whole engagement.
  const startOk = /^\d{4}-(0[1-9]|1[0-2])$/.test(s.startMonth);
  /** Derived from the start month by the picker — never a question of its own. */
  const behindMonths = parseInt(s.behind, 10) || 0;
  const noBand = q.refer && q.reason === "no-expenses";
  /** Nothing is quotable until both unanswered questions have real answers. */
  const priced = !q.refer && startOk;
  // Referral quotes carry no figures at all — read the discount through a
  // narrowed local so the referral branch stays type-safe.
  const discountPct = q.refer ? 0 : q.discountPct;
  const feeBig = priced ? euro(q.monthlyNet) : noBand ? "Not yet" : !q.refer ? "Not yet" : "Let’s talk";
  const feeMini = priced ? euro(q.monthlyNet) + " / mo" : noBand || !q.refer ? "—" : "Referral";
  const feeNote = noBand
    ? ACCOUNTING_NO_EXPENSES_NOTE
    : q.refer
      ? "We price most companies on the spot, but yours needs a short call with a director first. Usually the same day."
      : !startOk
        ? "Tell us which month we should start from and this price is final. Anything before it is catch-up, so the month decides what you are charged for."
        : (q.discountPct > 0 ? `${LAUNCH_PROMO.label.replace("25% off", "25% launch discount")} already applied. ` : "") +
          (q.tier.label === "Standard" ? "" : `${q.tier.label}-risk sector loading included. `) +
          PRICING_VAT_NOTE;

  // Every quote from this page is a bookkeeping quote, so A4 can never audit
  // this client. Stated on the page and carried on the record.
  const independence = flagsForServiceSelection(["Bookkeeping"]);

  // The quote handed to sales — built fresh at submit time so it always
  // matches what is on screen.
  const payload = (): QuotePayload => ({
    page: "accounting",
    service: "Accounting & bookkeeping",
    // Degrades HONESTLY, and says which of the three reasons applies. A
    // headline figure here would be a price for an answer we do not have.
    headline: noBand
      ? "Not priced — monthly spend not given"
      : q.refer
        ? "Referral — needs a director call"
        : !startOk
          ? "Not priced — start month not given"
          : `${euro(q.monthlyNet)} / month${q.oneOffFull > 0 ? ` + ${euro(q.oneOffNet)} one-off` : ""}`,
    lines: noBand
      ? [{ k: "Monthly spend", v: "Not given — bookkeeping not priced" }]
      : q.refer
        ? [{ k: "Sector", v: "Needs a director call" }]
        : [
            // THE shared breakdown — the same function the price panel renders,
            // so the emailed figures and the on-screen figures are one list.
            ...quoteBreakdown(q).map((l) => (l.v.includes("one-off") ? l : { k: l.k, v: l.v + " /mo" })),
            ...(q.discountPct > 0 ? [{ k: `Launch discount (${Math.round(q.discountPct * 100)}%)`, v: "− " + euro(q.monthlyFull - q.monthlyNet) + " /mo" }] : []),
            ...(startOk ? [] : [{ k: "Start month", v: "Not given — please confirm before we bill" }]),
          ],
    // The canonical form id, stated outright. Every quote from this page is a
    // bookkeeping quote, which is exactly what `independence` above is built
    // from — so the lead's derived route now agrees with its own answers.
    serviceIds: ["Bookkeeping"],
    services: noBand ? ["Accounting — monthly spend not given"] : q.refer ? ["Accounting — referral"] : [
      `Managed bookkeeping — ${MANAGED_ENTITY_LABELS[s.entity]}`,
      ...(s.head > 0 ? [`Payroll for ${s.head} ${s.head === 1 ? "person" : "people"}`] : []),
      ...(s.vatreg !== "none" ? [`VAT returns (${labelOf(VAT_REG, s.vatreg)})`] : []),
      ...(parseInt(s.behind, 10) > 0 ? [`Catch-up: ${s.behind} earlier months`] : []),
    ],
    answers: [
      { k: "Sector", v: labelOf(SECTORS, s.sector) },
      { k: "Transactions / month", v: labelOf(TXN, s.txn) },
      { k: "Bank accounts", v: String(s.banks ?? 1) },
      // `labelOf` falls back to the FIRST option when the id is empty, which
      // would report "Up to €10,000" for a question nobody answered. Say so.
      { k: "Monthly expenses", v: s.expenses ? labelOf(EXPENSES, s.expenses) : "not given" },
      { k: "Whose books", v: MANAGED_ENTITY_LABELS[s.entity] },
      { k: "Payroll headcount", v: String(s.head) },
      { k: "VAT registration", v: labelOf(VAT_REG, s.vatreg) },
      // The month WORK BEGINS BILLING, which is this month whenever there is
      // a backlog — the same split the wire makes. The earliest month still
      // to do is the row below, as a count.
      { k: "Start month", v: formatStartMonth(ongoingStartMonth(s.startMonth)) || "not given" },
      // Derived from the start month, never answered separately.
      { k: "Earlier months", v: behindMonths > 0 ? `${behindMonths} ${behindMonths === 1 ? "month" : "months"}` : "none — up to date" },
      { k: "Risk tier", v: q.refer ? "Referral" : q.tier.label },
      // IESBA — carried through to whoever picks this quote up.
      { k: "Audit eligible", v: String(independence.auditEligible) },
    ],
    note: q.refer ? undefined : `${feeNote} ${INDEPENDENCE_BOOKKEEPING}`,
  });
  const { start, modal } = useQuoteActions(payload);

  return (
    <section
      id="estimate"
      style={{ background: "radial-gradient(800px 420px at 15% 0%, rgba(73,79,223,.30) 0%, rgba(73,79,223,0) 65%), #0A0A0A", padding: "clamp(56px,8vw,88px) 0 clamp(60px,8vw,96px)" }}
    >
      <Container>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,.75)" }}>• Bookkeeping calculator</div>
          <h2 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: "clamp(28px,3.6vw,44px)", lineHeight: 1.08, letterSpacing: "-.03em", color: "#fff", margin: "16px 0 0", textWrap: "balance" }}>
            Your monthly price, in sixty seconds
          </h2>
          <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 15.5, lineHeight: 1.7, color: "rgba(255,255,255,.7)", margin: "14px auto 0", maxWidth: "56ch", textWrap: "pretty" }}>
            Six quick questions — the figure builds as you answer{discountPct > 0 ? ", with the 25% launch discount already applied" : ""}. No form, no call.
          </p>
        </div>

        <div className="af-grid" style={{ maxWidth: 1040, margin: "32px auto 0" }}>
          {/* step rail */}
          <div className="af-rail" style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left", position: "sticky", top: 90 }}>
            {STEPS.map((label, i) => {
              const active = i === step;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setStep(i)}
                  aria-current={active ? "step" : undefined}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "var(--a4-r-md)",
                    border: 0, background: active ? "rgba(255,255,255,.14)" : "transparent",
                    cursor: "pointer", fontFamily: "var(--a4-font-body)", textAlign: "left", transition: "background .2s ease",
                  }}
                >
                  <span style={{
                    width: 24, height: 24, borderRadius: "var(--a4-r-full)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none",
                    background: active ? "#fff" : "rgba(255,255,255,.16)",
                    color: active ? "var(--a4-ink)" : "rgba(255,255,255,.7)",
                    fontSize: 10.5, fontWeight: 700, fontVariantNumeric: "tabular-nums", transition: "background .2s ease, color .2s ease",
                  }}>{i === LAST ? "✓" : i + 1}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: active ? "#fff" : "rgba(255,255,255,.62)", transition: "color .2s ease" }}>{label}</span>
                </button>
              );
            })}
          </div>

          {/* question card */}
          <div style={{ background: "var(--a4-surface-card)", borderRadius: "var(--a4-r-lg)", padding: "clamp(22px,3vw,30px)", display: "flex", flexDirection: "column", gap: 18, textAlign: "left", minHeight: 380 }}>
            <div>
              <div style={tagLabel}>{step === LAST ? "Your price" : `Question ${step + 1} of ${LAST}`}</div>
              <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontSize: 21, letterSpacing: "-.015em", color: "var(--a4-ink)", margin: "8px 0 0" }}>{QUESTIONS[step].title}</h3>
              <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, lineHeight: 1.6, color: "var(--a4-mute)", margin: "8px 0 0", textWrap: "pretty" }}>{QUESTIONS[step].help}</p>
            </div>

            {step === 0 && (
              <Pills
                items={SECTORS.map((x) => ({ id: x.id, label: x.label, sub: x.tier === "standard" ? "" : x.tier === "refer" ? "needs a call" : `${x.tier} risk` }))}
                value={s.sector}
                set={(id) => set({ sector: id })}
              />
            )}

            {step === 1 && (
              <>
                <Pills items={ENTITIES} value={s.entity} set={(id) => set({ entity: id as ManagedEntity })} />
                <div style={{ border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "14px 16px" }}>
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, color: "var(--a4-ink)" }}>About how many transactions a month?</div>
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-stone)", marginTop: 2 }}>
                    The count, not the amount. It sets your VAT fee, and busy volumes add to the
                    bookkeeping fee — the base price is set by your monthly spend, the next question.
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <Pills items={TXN} value={s.txn} set={(id) => set({ txn: id as TxnBand })} />
                  </div>
                </div>
                <div style={{ border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "14px 16px" }}>
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, color: "var(--a4-ink)" }}>How many bank accounts?</div>
                  <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-stone)", marginTop: 2 }}>
                    Every account is reconciled separately. The first is included in the bookkeeping fee; each extra account is €40 a month plus 15% of the bookkeeping fee.
                  </div>
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 16 }}>
                    <label htmlFor="ae-banks" className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Bank accounts</label>
                    <input id="ae-banks" type="range" min={1} max={8} step={1} value={s.banks ?? 1} onChange={(e) => set({ banks: +e.target.value })} style={sliderStyle} />
                    <span style={readoutStyle}>{(s.banks ?? 1) === 1 ? "One account" : `${s.banks} accounts`}</span>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <div style={{ border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "14px 16px" }}>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, color: "var(--a4-ink)" }}>About how much do you spend a month?</div>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-stone)", marginTop: 2 }}>
                  The money that leaves the business in a typical month — supplier bills, wages, rent, software,
                  everything you spend, excluding VAT, loan repayments, and transfers between your own accounts.
                  New or seasonal? Use your last three months&apos; average.
                </div>
                <div style={{ marginTop: 10 }}>
                  <Pills items={EXPENSES} value={s.expenses} set={(id) => set({ expenses: id as ExpenseBand })} />
                </div>
                {/* Nothing is pre-selected, so say what the blank means rather
                    than leaving the visitor to read it as a broken control. */}
                {!s.expenses && (
                  <div style={{ marginTop: 10, fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "#8A6100" }}>
                    Pick a band — we do not assume one. It is what sets your bookkeeping price.
                  </div>
                )}
              </div>
            )}

            {/* Order must match QUESTIONS above: 3 = payroll, 4 = VAT. */}
            {step === 3 && (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <label htmlFor="ae-head" className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>People on payroll</label>
                <input id="ae-head" type="range" min={0} max={50} step={1} value={s.head} onChange={(e) => set({ head: +e.target.value })} style={sliderStyle} />
                <span style={readoutStyle}>{s.head === 0 ? "Nobody" : `${s.head} ${s.head === 1 ? "person" : "people"}`}</span>
              </div>
            )}

            {step === 4 && <Pills items={VAT_REG} value={s.vatreg} set={(id) => set({ vatreg: id as VatRegId })} />}

            {step === 5 && (
              <div style={{ border: "1px solid var(--a4-hairline-light)", borderRadius: "var(--a4-r-md)", padding: "14px 16px" }}>
                <label htmlFor="ae-start" style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, fontWeight: 600, color: "var(--a4-ink)" }}>
                  Earliest month that still needs doing
                </label>
                <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "var(--a4-stone)", marginTop: 2 }}>
                  Required — we do not guess a start month. Already up to date? Pick this month.
                </div>
                <input
                  id="ae-start"
                  type="month"
                  value={s.startMonth}
                  onChange={(e) => set({ startMonth: e.target.value, behind: String(catchUpMonthsFrom(e.target.value)) })}
                  style={{ marginTop: 10, height: 38, padding: "0 12px", borderRadius: "var(--a4-r-md)", border: "1px solid var(--a4-hairline-light)", background: "#fff", color: "var(--a4-ink)", fontFamily: "var(--a4-font-body)", fontSize: 13 }}
                />
                {/* "Required" is now true: the field ships empty and the price
                    is withheld until it is filled. It used to be pre-filled
                    with next month, so `startOk` passed on an answer nobody
                    gave and the visitor could send without seeing this step. */}
                {startOk ? (
                  /* The catch-up split, READ BACK from the month just picked —
                     the second question this step used to ask. */
                  <div style={{ marginTop: 12, padding: "11px 14px", borderRadius: 10, background: "rgba(73,79,223,.06)", border: "1px solid rgba(73,79,223,.25)", fontFamily: "var(--a4-font-body)", fontSize: 12, lineHeight: 1.6, color: "var(--a4-body)" }}>
                    {behindMonths > 0
                      ? `${behindMonths} ${behindMonths === 1 ? "month" : "months"} of catch-up, from ${formatStartMonth(s.startMonth)} up to last month, charged once at the same monthly rate. Then ongoing from this month.`
                      : `Nothing to catch up — we pick the books up at ${formatStartMonth(s.startMonth)} and keep them from there.`}
                  </div>
                ) : (
                  <div style={{ marginTop: 8, fontFamily: "var(--a4-font-body)", fontSize: 11.5, color: "#8A6100" }}>
                    Pick a month before we can price this.
                  </div>
                )}
              </div>
            )}

            {step === LAST && (
              <div>
                <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 13.5, lineHeight: 1.65, color: "var(--a4-body)", margin: 0, textWrap: "pretty" }}>{summary}</p>
                {/* The independence consequence, before they ask for a proposal. */}
                <p role="note" style={{ margin: "12px 0 0", padding: "11px 14px", borderRadius: 10, background: "rgba(73,79,223,.06)", border: "1px solid rgba(73,79,223,.25)", fontFamily: "var(--a4-font-body)", fontSize: 12.5, lineHeight: 1.55, color: "var(--a4-body)" }}>
                  {INDEPENDENCE_BOOKKEEPING}
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                  <Button variant="dark" size="md" onClick={() => start("proposal")}>Request a proposal <Icon name="arrow-right" size={16} color="#fff" /></Button>
                  {/* Only when there IS a price. Offering a call against a
                      figure we never computed is the same defect as quoting it.
                      This used to say "Create my account" — A4 is not
                      self-serve; we meet first and open the account ourselves. */}
                  {priced && <Button variant="cobalt" size="md" onClick={() => start("consultation")}>Book a call</Button>}
                </div>
                <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 11, color: "var(--a4-stone)", margin: "10px 0 0" }}>Confirmed after a short call. {PRICING_VAT_NOTE}</p>
              </div>
            )}

            <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--a4-hairline-light)", display: "flex", alignItems: "center", gap: 12 }}>
              {step !== LAST && (
                <>
                  <button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
                    style={{ height: 36, padding: "0 16px", borderRadius: "var(--a4-r-full)", border: "1px solid var(--a4-hairline-light)", background: "transparent", color: "var(--a4-mute)", fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, cursor: step === 0 ? "default" : "pointer", opacity: step === 0 ? 0.45 : 1 }}>Back</button>
                  <button type="button" onClick={() => setStep(Math.min(LAST, step + 1))}
                    style={{ height: 36, padding: "0 18px", borderRadius: "var(--a4-r-full)", border: "1px solid var(--a4-ink)", background: "var(--a4-ink)", color: "#fff", fontFamily: "var(--a4-font-body)", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>{step === LAST - 1 ? "See my price" : "Next"}</button>
                </>
              )}
              <span style={{ marginLeft: "auto", fontFamily: "var(--a4-font-display)", fontVariantNumeric: "tabular-nums", fontSize: 15, fontWeight: 600, color: "var(--a4-ink)" }}>{feeMini}</span>
            </div>
          </div>

          {/* price panel */}
          <div className="af-panel" style={{ background: "#101114", border: "1px solid var(--a4-hairline-dark)", borderRadius: "var(--a4-r-lg)", padding: "clamp(22px,3vw,30px)", color: "#fff", position: "sticky", top: 90, textAlign: "left" }}>
            <div style={{ fontFamily: "var(--a4-font-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--a4-stone)" }}>Your monthly price</div>

            {priced && q.discountPct > 0 && (
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--a4-font-display)", fontVariantNumeric: "tabular-nums", fontSize: 16, color: "rgba(255,255,255,.45)", textDecoration: "line-through" }}>{euro(q.monthlyFull)}</span>
                <span style={{ padding: "3px 10px", borderRadius: "var(--a4-r-full)", background: "rgba(224,105,94,.18)", border: "1px solid rgba(224,105,94,.45)", color: "#F2A49C", fontFamily: "var(--a4-font-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
                  {Math.round(q.discountPct * 100)}% off
                </span>
              </div>
            )}

            <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "var(--a4-font-display)", fontWeight: 500, fontVariantNumeric: "tabular-nums", fontSize: 38, letterSpacing: "-1.5px", lineHeight: 1, color: priced ? "#F2A49C" : "#fff" }}>{feeBig}</span>
              {priced && <span style={{ fontFamily: "var(--a4-font-body)", fontSize: 13, color: "var(--a4-on-dark-mute)" }}>/ month</span>}
            </div>

            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--a4-hairline-dark)", display: "flex", flexDirection: "column", gap: 9 }}>
              {/* M2: the one-off used to be discounted HERE and nowhere else —
                  on screen €441, in the proposal email €588, same catch-up.
                  Both now read `quoteBreakdown`, which applies the promo to the
                  monthly only, exactly as the engine and the backend do. */}
              {(noBand
                ? [{ k: "Monthly spend", v: "Not given" }]
                : q.refer
                  ? [{ k: "Sector", v: "Needs a call" }]
                  : quoteBreakdown(q)
              ).map((l) => (
                <span key={l.k} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontFamily: "var(--a4-font-body)", fontSize: 12.5 }}>
                  <span style={{ color: "var(--a4-on-dark-mute)" }}>{l.k}</span>
                  <span style={{ color: "#fff", fontWeight: 500, whiteSpace: "nowrap" }}>{l.v}</span>
                </span>
              ))}
            </div>

            <p style={{ fontFamily: "var(--a4-font-body)", fontSize: 12, lineHeight: 1.6, color: "var(--a4-stone)", margin: "18px 0 0", paddingTop: 16, borderTop: "1px solid var(--a4-hairline-dark)" }}>{feeNote}</p>

            <Button variant="primary" size="md" onClick={() => start("proposal")} style={{ width: "100%", marginTop: 18 }}>
              Request a proposal <Icon name="arrow-right" size={16} color="#000" />
            </Button>
            {priced && (
              <Button variant="outline-dark" size="md" onClick={() => start("consultation")} style={{ width: "100%", marginTop: 10 }}>
                Book a call
              </Button>
            )}
          </div>
        </div>
      </Container>
      {modal}
    </section>
  );
}
