"use client";

import { Container, Eyebrow, Icon, Reveal } from "@/components/a4-landing/Primitives";
import LocalizedLink from "@/components/common/LocalizedLink";

// A4 Books — the firm's bookkeeping software product. Copy and pricing mirror
// the Books landing (books.a4.com.mt): €39/mo, unlimited documents, SOFTWARE ONLY.
// Prices live in src/data/a4Ladder.ts — change them there, not here.
const PLAN_LINES = [
  "Unlimited document uploads",
  "Auto-post plus review queue",
  "Reports and Excel export",
  "Business and firm accounts",
  "Early access free, no card",
];

export function A4BooksPromo() {
  return (
    <section style={{ background: "#000", padding: "clamp(64px,9vw,104px) 0" }}>
      <Container>
        <div
          className="pr-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.25fr 1fr",
            gap: "clamp(28px,4vw,56px)",
            alignItems: "center",
            maxWidth: 1000,
            margin: "0 auto",
          }}
        >
          <Reveal>
            <Eyebrow dark>A4 Books — bookkeeping software</Eyebrow>
            <h2
              className="a4-font-display"
              style={{
                fontWeight: 500,
                color: "#fff",
                fontSize: "clamp(30px,4.2vw,54px)",
                lineHeight: 1.04,
                letterSpacing: "-.025em",
                margin: "16px 0 0",
                textWrap: "balance",
              }}
            >
              One price. Unlimited documents.
            </h2>
            <p
              className="a4-font-body"
              style={{
                fontSize: 17,
                lineHeight: 1.6,
                color: "var(--a4-on-dark-mute)",
                margin: "18px 0 0",
                maxWidth: 480,
                textWrap: "pretty",
              }}
            >
              A4 Books is our bookkeeping software: upload documents, AI posts the
              entries, anything uncertain waits for your review. €39 a month,
              unlimited documents — no per-document fees, no hourly meters.
            </p>
            <p
              className="a4-font-body"
              style={{ fontSize: 13.5, color: "var(--a4-stone)", margin: "14px 0 0" }}
            >
              Software only — no accountant at this price. Add a qualified accountant from €99/month. All fees exclude VAT.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              <LocalizedLink
                href="/books"
                className="a4-font-body"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  height: 52,
                  padding: "0 28px",
                  borderRadius: "var(--a4-r-full)",
                  background: "#fff",
                  color: "#000",
                  fontWeight: 600,
                  fontSize: 16,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Explore A4 Books <Icon name="arrow-right" size={17} color="#000" />
              </LocalizedLink>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div
              style={{
                background: "var(--a4-surface-elevated)",
                border: "1px solid var(--a4-hairline-dark)",
                borderRadius: "var(--a4-r-lg)",
                padding: "clamp(26px,3vw,34px)",
                boxShadow: "0 40px 90px -45px rgba(73,79,223,.45)",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span
                  className="a4-font-display"
                  style={{ fontWeight: 500, fontSize: 54, color: "#fff", letterSpacing: "-2px", lineHeight: 1 }}
                >
                  €39
                </span>
                <span className="a4-font-body" style={{ fontSize: 15, color: "var(--a4-on-dark-mute)" }}>
                  / month
                </span>
              </div>
              <div
                className="a4-font-body"
                style={{ fontSize: 14.5, fontWeight: 600, color: "var(--a4-primary-bright)", marginTop: 6 }}
              >
                Unlimited documents
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "22px 0 0", display: "flex", flexDirection: "column", gap: 11 }}>
                {PLAN_LINES.map((line) => (
                  <li key={line} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <Icon name="check" size={15} color="var(--a4-primary-bright)" stroke={2.5} />
                    <span className="a4-font-body" style={{ fontSize: 14.5, color: "var(--a4-on-dark-mute)" }}>
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
