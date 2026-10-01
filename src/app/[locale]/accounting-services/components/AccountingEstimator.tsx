"use client";

import React, { useState } from "react";
import { Button, Icon } from "@/components/a4-landing/Primitives";
import { MUTED_GLOW } from "@/components/fx/primitives";
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
import {
  BODY, FeeDoc, G, Head, INDIGO, INK, MiniTotal, OptionPills, Prompt, QuestionCard, SANS, StepRail, SubQuestion,
  ghostPill, inkPill, lightInput, softNote, type Opt,
} from "./PaidLandingKit";

const labelOf = (list: Opt[], id: string) => (list.find((o) => o.id === id) ?? list[0]).label;

// The quote-builder language of the A4 design: ink choice pills, an indigo
// range, the readout set in Outfit.
const Pills = OptionPills;
const readoutStyle: React.CSSProperties = { minWidth: 120, textAlign: "right", fontFamily: SANS, fontVariantNumeric: "tabular-nums", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: INK };
const srOnly: React.CSSProperties = { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" };

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
      style={{ position: "relative", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", background: MUTED_GLOW, color: INK, fontFamily: SANS }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Head
          n="02"
          eyebrow="Bookkeeping calculator"
          title={<>Your monthly price, in <G>sixty seconds</G></>}
          sub={<>Six quick questions — the figure builds as you answer{discountPct > 0 ? ", with the 25% launch discount already applied" : ""}. No form, no call.</>}
        />

        <div className="af-grid" style={{ marginTop: "clamp(48px,6vw,80px)" }}>
          {/* step rail — numbered steps, the current one is the ink pill */}
          <StepRail steps={STEPS} step={step} setStep={setStep} label="Calculator steps" />

          {/* question card */}
          <QuestionCard
            tag={step === LAST ? <span style={{ color: INDIGO }}>Your price</span> : <><span style={{ color: INDIGO }}>Question {step + 1}</span><span>of {LAST}</span></>}
            title={QUESTIONS[step].title}
            help={QUESTIONS[step].help}
            footer={
              <>
                {step !== LAST && (
                  <>
                    <button type="button" className="pk-ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={ghostPill(step === 0)}>Back</button>
                    <button type="button" className="pk-ink" onClick={() => setStep(Math.min(LAST, step + 1))} style={inkPill()}>{step === LAST - 1 ? "See my price" : "Next"}</button>
                  </>
                )}
                <MiniTotal>{feeMini}</MiniTotal>
              </>
            }
          >
            {step === 0 && (
              <Pills
                items={SECTORS.map((x) => ({ id: x.id, label: x.label, sub: x.tier === "standard" ? "" : x.tier === "refer" ? "needs a call" : `${x.tier} risk` }))}
                value={s.sector}
                set={(id) => set({ sector: id })}
              />
            )}

            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <Pills items={ENTITIES} value={s.entity} set={(id) => set({ entity: id as ManagedEntity })} />
                <SubQuestion
                  label="About how many transactions a month?"
                  hint={<>The count, not the amount. It sets your VAT fee, and busy volumes add to the
                    bookkeeping fee — the base price is set by your monthly spend, the next question.</>}
                >
                  <Pills items={TXN} value={s.txn} set={(id) => set({ txn: id as TxnBand })} />
                </SubQuestion>
                <SubQuestion
                  label="How many bank accounts?"
                  hint="Every account is reconciled separately. The first is included in the bookkeeping fee; each extra account is €40 a month plus 15% of the bookkeeping fee."
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <label htmlFor="ae-banks" className="sr-only" style={srOnly}>Bank accounts</label>
                    <input id="ae-banks" className="pk-range" type="range" min={1} max={8} step={1} value={s.banks ?? 1} onChange={(e) => set({ banks: +e.target.value })} style={{ flex: 1 }} />
                    <span style={readoutStyle}>{(s.banks ?? 1) === 1 ? "One account" : `${s.banks} accounts`}</span>
                  </div>
                </SubQuestion>
              </div>
            )}

            {step === 2 && (
              <SubQuestion
                label="About how much do you spend a month?"
                hint={<>The money that leaves the business in a typical month — supplier bills, wages, rent, software,
                  everything you spend, excluding VAT, loan repayments, and transfers between your own accounts.
                  New or seasonal? Use your last three months&apos; average.</>}
              >
                <Pills items={EXPENSES} value={s.expenses} set={(id) => set({ expenses: id as ExpenseBand })} />
                {/* Nothing is pre-selected, so say what the blank means rather
                    than leaving the visitor to read it as a broken control. */}
                {!s.expenses && <Prompt>Pick a band — we do not assume one. It is what sets your bookkeeping price.</Prompt>}
              </SubQuestion>
            )}

            {/* Order must match QUESTIONS above: 3 = payroll, 4 = VAT. */}
            {step === 3 && (
              <div style={{ display: "flex", alignItems: "center", gap: 18, paddingTop: 20, borderTop: "1px solid #E4E4E7" }}>
                <label htmlFor="ae-head" className="sr-only" style={srOnly}>People on payroll</label>
                <input id="ae-head" className="pk-range" type="range" min={0} max={50} step={1} value={s.head} onChange={(e) => set({ head: +e.target.value })} style={{ flex: 1 }} />
                <span style={readoutStyle}>{s.head === 0 ? "Nobody" : `${s.head} ${s.head === 1 ? "person" : "people"}`}</span>
              </div>
            )}

            {step === 4 && <Pills items={VAT_REG} value={s.vatreg} set={(id) => set({ vatreg: id as VatRegId })} />}

            {step === 5 && (
              <SubQuestion
                htmlFor="ae-start"
                label="Earliest month that still needs doing"
                hint="Required — we do not guess a start month. Already up to date? Pick this month."
              >
                <input
                  id="ae-start"
                  type="month"
                  className="pk-input"
                  value={s.startMonth}
                  onChange={(e) => set({ startMonth: e.target.value, behind: String(catchUpMonthsFrom(e.target.value)) })}
                  style={{ ...lightInput, maxWidth: 280 }}
                />
                {/* "Required" is now true: the field ships empty and the price
                    is withheld until it is filled. It used to be pre-filled
                    with next month, so `startOk` passed on an answer nobody
                    gave and the visitor could send without seeing this step. */}
                {startOk ? (
                  /* The catch-up split, READ BACK from the month just picked —
                     the second question this step used to ask. */
                  <div style={{ ...softNote, marginTop: 14 }}>
                    {behindMonths > 0
                      ? `${behindMonths} ${behindMonths === 1 ? "month" : "months"} of catch-up, from ${formatStartMonth(s.startMonth)} up to last month, charged once at the same monthly rate. Then ongoing from this month.`
                      : `Nothing to catch up — we pick the books up at ${formatStartMonth(s.startMonth)} and keep them from there.`}
                  </div>
                ) : (
                  <Prompt>Pick a month before we can price this.</Prompt>
                )}
              </SubQuestion>
            )}

            {step === LAST && (
              <div>
                <p style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: "#3F3F46", margin: 0, textWrap: "pretty" }}>{summary}</p>
                {/* The independence consequence, before they ask for a proposal. */}
                <p role="note" style={{ ...softNote, marginTop: 16 }}>
                  {INDEPENDENCE_BOOKKEEPING}
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
                  <Button variant="dark" size="md" onClick={() => start("proposal")}>Request a proposal <Icon name="arrow-right" size={16} color="#fff" /></Button>
                  {/* Only when there IS a price. Offering a call against a
                      figure we never computed is the same defect as quoting it.
                      This used to say "Create my account" — A4 is not
                      self-serve; we meet first and open the account ourselves. */}
                  {priced && <Button variant="outline-light" size="md" onClick={() => start("consultation")}>Book a call</Button>}
                </div>
                <p style={{ fontFamily: BODY, fontSize: 13, color: "#71717A", margin: "14px 0 0" }}>Confirmed after a short call. {PRICING_VAT_NOTE}</p>
              </div>
            )}
          </QuestionCard>

          {/* price panel — set like the quote document's totals */}
          {/* M2: the one-off used to be discounted HERE and nowhere else —
              on screen €441, in the proposal email €588, same catch-up.
              Both now read `quoteBreakdown`, which applies the promo to the
              monthly only, exactly as the engine and the backend do. */}
          <FeeDoc
            label="Your monthly price"
            rows={noBand
              ? [{ k: "Monthly spend", v: "Not given" }]
              : q.refer
                ? [{ k: "Sector", v: "Needs a call" }]
                : quoteBreakdown(q)}
            strike={priced && q.discountPct > 0 ? euro(q.monthlyFull) : undefined}
            badge={priced && q.discountPct > 0 ? `${Math.round(q.discountPct * 100)}% off` : undefined}
            amount={feeBig}
            per={priced ? "/ month" : undefined}
            gradient={priced}
            note={feeNote}
          >
            <Button variant="dark" size="md" onClick={() => start("proposal")} style={{ width: "100%" }}>
              Request a proposal <Icon name="arrow-right" size={16} color="#fff" />
            </Button>
            {priced && (
              <Button variant="outline-light" size="md" onClick={() => start("consultation")} style={{ width: "100%" }}>
                Book a call
              </Button>
            )}
          </FeeDoc>
        </div>
      </div>
      {modal}
    </section>
  );
}
