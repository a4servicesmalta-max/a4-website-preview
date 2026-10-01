"use client";

import { Button, Eyebrow, Icon } from "@/components/a4-landing/Primitives";
import { A4Mark, DARK_GRID, DriftGlow, TypeText, Words, gradText } from "@/components/fx/primitives";
import { BOOKKEEPING_COMPANY, BOOKKEEPING_FROM } from "@/data/a4QuotePack";
import { INDEPENDENCE_BOOKKEEPING } from "@/lib/independence";

// Managed bookkeeping — the firm KEEPS the books. This block used to sell A4
// Books at €39/mo SOFTWARE ONLY, which is exactly the SME tier the owner
// removed on 2026-08-13. Prices live in src/data/a4QuotePack.ts.
const PLAN_LINES = [
  "Priced by your monthly volume — no per-document fees",
  "We code and post every document",
  "Bank reconciled monthly, not guessed",
  "Reports and Excel export",
  "A qualified accountant on the file",
];

const INK = "#09090B";
const INDIGO = "#4F55F1";
const PERI = "#8B8FF7";
const BODY = "var(--a4x-body)";
const PAD = "clamp(24px,3.4vw,44px)";

/**
 * "Two prices. We keep the books." — on the dark grid (between the light
 * calculator and the light capabilities section): the design's eyebrow +
 * display heading on the left, and the price as a document panel on the right
 * (the design's quote document: white, 28px radius, hairline rows numbered in
 * indigo).
 */
export function A4BooksPromo() {
  return (
    <section
      style={{ position: "relative", overflow: "hidden", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", background: DARK_GRID, color: "#FFFFFF", fontFamily: "var(--a4x-display)" }}
    >
      <DriftGlow left="-14%" top="-30%" strength={0.24} />
      <div
        className="pr-grid"
        style={{
          position: "relative",
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.1fr 1fr",
          gap: "clamp(48px,6vw,88px)",
          alignItems: "center",
        }}
      >
        <div>
          <div data-fx="rise">
            <Eyebrow dark>Managed bookkeeping</Eyebrow>
          </div>
          <h2 style={{ margin: "18px 0 0", fontSize: "clamp(40px,5.2vw,84px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.05 }}>
            <span className="sr-only">Two prices. We keep the books.</span>
            <div aria-hidden="true">
              <TypeText segments={[{ t: "Two prices.", c: "#FFFFFF" }]} per={45} caret={PERI} style={{ display: "inline-block" }} />
              <Words d={620} style={{ fontWeight: 600 }} parts={[{ t: "We keep the" }, { t: "books.", g: true }]} />
            </div>
          </h2>
          <p data-fx="rise" data-d="200" style={{ margin: "24px 0 0", maxWidth: 540, fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: "#A1A1AA", textWrap: "pretty" }}>
            You send us the paperwork and we keep the books: every document coded, the bank reconciled, and figures you can rely on each month. From €
            {BOOKKEEPING_FROM} a month if you are self-employed, from €{BOOKKEEPING_COMPANY} for a company, including one bank account. The fee follows your
            monthly volume — no per-document fees, no hourly meters.
          </p>
          <p data-fx="rise" data-d="260" style={{ margin: "14px 0 0", maxWidth: 540, fontFamily: BODY, fontSize: 13.5, lineHeight: 1.55, color: "#71717A" }}>
            A qualified accountant is on the file at both prices — there is no software-only plan. All fees exclude VAT. {INDEPENDENCE_BOOKKEEPING}
          </p>
          <div data-fx="rise" data-d="320" style={{ marginTop: 32 }}>
            <Button variant="primary" size="lg" href="/books">
              See how it works <Icon name="arrow-right" size={17} color={INK} />
            </Button>
          </div>
        </div>

        <div
          data-fx="rise"
          data-d="150"
          data-dy="80"
          style={{ background: "#FFFFFF", color: INK, border: "1px solid #E4E4E7", borderRadius: 28, boxShadow: "0 50px 120px rgba(0,0,0,.45)", overflow: "hidden" }}
        >
          <div style={{ padding: `${PAD} ${PAD} 28px` }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <A4Mark size={30} color={INK} />
              <span aria-hidden="true" style={{ width: 1.5, height: 24, margin: "0 11px", background: INK, opacity: 0.35 }} />
              <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.02em" }}>A4 Services</span>
            </div>
            <div style={{ marginTop: 28, display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "4px 10px" }}>
              {/* "from" is load-bearing: €24 is the entry expenses band (one
                  bank account included), not a flat rate. Nine bands, volume
                  and additional accounts all move it (mt-2026-08-27-entry). */}
              <span style={{ fontFamily: BODY, fontSize: 16, fontWeight: 500, color: "#52525B" }}>from</span>
              <span style={{ fontSize: "clamp(56px,6vw,84px)", fontWeight: 600, letterSpacing: "-0.045em", lineHeight: 1, paddingBottom: ".04em", ...gradText }}>
                €{BOOKKEEPING_FROM}
              </span>
              <span style={{ fontFamily: BODY, fontSize: 16, fontWeight: 500, color: "#52525B" }}>/ month</span>
            </div>
            <div style={{ marginTop: 10, fontSize: 16, fontWeight: 600, letterSpacing: "-0.005em", color: INDIGO }}>
              Self-employed · from €{BOOKKEEPING_COMPANY}/mo for a company
            </div>
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {PLAN_LINES.map((line, i) => (
              <li key={line} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 12, padding: `18px ${PAD}`, borderTop: "1px solid #E4E4E7" }}>
                <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: ".02em", color: INDIGO }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: BODY, fontSize: 16, lineHeight: 1.5, color: "#3F3F46" }}>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
