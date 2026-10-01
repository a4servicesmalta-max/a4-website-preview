"use client";

import React from "react";
import { Button, Icon } from "@/components/a4-landing/Primitives";
import { ScrollVideo } from "@/components/a4-landing/ScrollVideo";
import { AccountingEstimator } from "./AccountingEstimator";
import { BOOKKEEPING_COMPANY, BOOKKEEPING_FROM, PRICING_VAT_NOTE } from "@/data/a4QuotePack";
import { BOOK_A_CALL_PATH } from "@/lib/external-links";
import { ACCOUNTING_FAQS } from "@/data/serviceFaqs";
import {
  CardGrid, CenterEyebrow, CtaBand, FaqSection, G, Head, InfoCard, KitStyles, NumberedColumns, PaidHero, Section, Statement, Timeline, ctaPill,
} from "./PaidLandingKit";

// Structure and copy ported from the A4 Accounting design
// (A4 New pages.zip → A4 Accounting.dc.html), set in the A4 design language
// (docs/DESIGN-LANGUAGE.md) with A4's own primitives, nav and video.

function AccountingHero() {
  const proof = [
    "Documents read and coded for you",
    "Bank reconciled, not guessed",
    "VAT and reports from the same ledger",
    "A licensed Maltese firm, start to finish",
  ];
  return (
    <PaidHero
      eyebrow="Accounting & bookkeeping · Malta"
      first="Your books,"
      accent="always up to date."
      lead={
        <>
          We keep your books. You send the paperwork; our accountants code it, reconcile the bank, and hand you figures you can rely on each month — <strong style={{ color: "#fff", fontWeight: 600 }}>from &euro;{BOOKKEEPING_FROM} a month self-employed, from &euro;{BOOKKEEPING_COMPANY} for a company, set by your monthly spend</strong>.
        </>
      }
      chips={proof}
      actions={
        <>
          <Button variant="primary" size="lg" href="#estimate">Get my price <Icon name="arrow-right" size={18} color="#09090B" /></Button>
          <Button variant="outline-dark" size="lg" href={BOOK_A_CALL_PATH}>Book a free call</Button>
        </>
      }
    />
  );
}

function WhyDifferent() {
  const points = [
    { icon: "scan-line", t: "The software does the work", s: "Every document is read, coded and matched to a bank line automatically. You are only asked about the handful of items it isn't sure of." },
    { icon: "users", t: "Accountants when you want them", s: "Run it yourself, have us review your workings, or hand the books over entirely. Change route any month — the price follows." },
    { icon: "search-check", t: "Every figure traceable", s: "Click a number and see the document behind it, who approved it, and when. Your VAT return is built only from entries already reconciled." },
  ];
  return (
    <Section surface="light">
      <Head n="01" eyebrow="Why it's different here" title={<>Accounting done <G>properly</G> — not just processed.</>} />
      <CardGrid style={{ marginTop: "clamp(48px,6vw,80px)" }}>
        {points.map((p, i) => (
          <InfoCard key={p.t} i={i} total={points.length} dark={i % 2 === 1} icon={p.icon} title={p.t} body={p.s} />
        ))}
      </CardGrid>
    </Section>
  );
}

function WhatsCovered() {
  const items = [
    { t: "Bookkeeping", s: "Every transaction recorded, coded and posted — ongoing, without you keying anything." },
    { t: "Bank reconciliation", s: "Each entry matched to its bank line. Anything that doesn't match stays on screen instead of disappearing." },
    { t: "VAT returns", s: "Built only from entries already approved and reconciled, with a link back to every document behind them." },
    { t: "Management accounts", s: "Monthly figures that explain performance in plain language, out of a ledger that is already clean." },
  ];
  return (
    <Section surface="dark" sweep glow={{ left: "40%", top: "-10%", strength: 0.24 }}>
      <CenterEyebrow n="03" dark>What&apos;s covered</CenterEyebrow>
      <Statement dark first="Not just software." parts={[{ t: "Not just a" }, { t: "firm.", g: true }]} />
      <p
        data-fx="rise"
        data-d="700"
        style={{ margin: "36px auto 0", maxWidth: 760, textAlign: "center", fontSize: "clamp(19px,1.9vw,28px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.35, color: "#A1A1AA", textWrap: "balance" }}
      >
        The platform does the volume work; qualified accountants do the judgement.
      </p>
      <div style={{ marginTop: "clamp(72px,9vw,128px)" }}>
        <NumberedColumns dark items={items} />
      </div>
    </Section>
  );
}

function MonthCloses() {
  const steps = [
    { title: "Documents arrive", body: "Email them, drop them in the portal, or connect your bank. Everything lands in one place with a timestamp." },
    { title: "Coded and proposed", body: "Supplier, net, VAT and account code are read from the document. Only genuine uncertainties come back to you." },
    { title: "Approved and reconciled", body: "Entries post once approved, then match against the bank. Exceptions stay visible until they are resolved." },
    { title: "Closed and reported", body: "The month closes, your figures update, and VAT and management accounts fall out of records that are already clean." },
  ];
  return (
    <Section surface="light">
      <Head n="04" eyebrow="The process" title={<>How a month <G>closes</G></>} sub="Four stages — most of it happens without you doing anything." />
      <div style={{ marginTop: "clamp(56px,7vw,96px)" }}>
        <Timeline steps={steps} />
      </div>
    </Section>
  );
}

function AccountingFAQ() {
  return (
    <FaqSection
      n="05"
      surface="muted"
      line1="Bookkeeping questions,"
      line2="answered"
      sub={<>Still unsure? Book a free call and we&apos;ll talk it through.</>}
      action={<Button variant="dark" size="lg" href={BOOK_A_CALL_PATH}>Book a free call <Icon name="arrow-right" size={18} color="#fff" /></Button>}
      faqs={ACCOUNTING_FAQS}
    />
  );
}

function AccountingCTA() {
  return (
    <CtaBand
      first="Get your books"
      accent="closed on time"
      lead="Create your account and see your own figures in the portal, or talk it through with an accountant first."
      note={<>A4 Services Limited is a licensed Maltese accounting and audit firm. {PRICING_VAT_NOTE}</>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Button variant="primary" size="lg" href="#estimate" style={ctaPill}>Get my price <Icon name="arrow-right" size={18} color="#09090B" /></Button>
        <Button variant="outline-dark" size="lg" href={BOOK_A_CALL_PATH} style={ctaPill}>Book a free call</Button>
      </div>
    </CtaBand>
  );
}

export function AccountingApp() {
  return (
    <main id="main-content">
      <KitStyles />
      <AccountingHero />
      <ScrollVideo label="See how the books run" />
      <WhyDifferent />
      <AccountingEstimator />
      <WhatsCovered />
      <MonthCloses />
      <AccountingFAQ />
      <AccountingCTA />
    </main>
  );
}
