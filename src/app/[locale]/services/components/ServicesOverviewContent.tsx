"use client";

import React from "react";
import {
  A4_SERVICES_DATA,
  A4_SERVICES_LEFT,
  A4_SERVICES_RIGHT,
  SERVICE_KEY_TO_SLUG,
  type ServiceKey,
} from "@/data/a4ServicesSiteData";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Icon } from "@/components/a4-landing/Primitives";
import { LIGHT_GLOW } from "@/components/fx/primitives";
import { PageHero } from "./PageHero";
import { ServiceClosing } from "./ServiceClosing";
import { ServicePortalBand } from "./ServicePortalBand";
import { BODY, Band, G, GRID3, Head, INDIGO, PillLink, Pills, WordCard, kicker, type CardFx } from "./SiteKit";
import { ServicesFilm } from "@/components/film/chapters";

/**
 * The big card word for each service and the letter effect it plays — short
 * on purpose, like the design's "Accounting" / "Tax" / "Audit" cards. The
 * full name sits in the card's foot.
 */
const CARD_WORD: Record<ServiceKey, [string, CardFx]> = {
  "accounting-finance": ["Accounting", "scatter"],
  "tax-compliance": ["Tax", "type"],
  "audit-assurance": ["Audit", "tighten"],
  "corporate-csp": ["Corporate", "zoom"],
  "regulated-licensing": ["Licensing", "cascade"],
  "advisory-growth": ["Advisory", "type"],
  "company-structure": ["Structure", "stack"],
  "liquidation-winddown": ["Wind-down", "cascade"],
  "international-structures": ["International", "scatter"],
  "crypto-digital-assets": ["Crypto", "zoom"],
  "audit-readiness": ["Readiness", "tighten"],
  "group-consolidation": ["Consolidation", "stack"],
  "banking-payments": ["Banking", "cascade"],
  "corporate-transactions": ["Transactions", "scatter"],
  bookkeeping: ["Bookkeeping", "scatter"],
  "vat-payroll": ["VAT & Payroll", "stack"],
  legal: ["Legal", "type"],
  outsourcing: ["Outsourcing", "zoom"],
};

/** The two published columns, read across — the order the old two-column list showed. */
function overviewOrder(): ServiceKey[] {
  const out: ServiceKey[] = [];
  const n = Math.max(A4_SERVICES_LEFT.length, A4_SERVICES_RIGHT.length);
  for (let i = 0; i < n; i++) {
    if (A4_SERVICES_LEFT[i]) out.push(A4_SERVICES_LEFT[i]);
    if (A4_SERVICES_RIGHT[i]) out.push(A4_SERVICES_RIGHT[i]);
  }
  return out;
}

export function ServicesOverviewContent() {
  const keys = overviewOrder();

  return (
    <div className="a4-services-page">
      <PageHero
        eyebrow="Our services"
        title="One licensed firm. Every obligation covered."
        sub="Assurance-led accounting, tax, corporate and audit services for businesses in and through Malta — scoped clearly, priced transparently, delivered through one portal."
      >
        <Pills>
          <PillLink href="/contact" variant="light">
            Book a consultation
          </PillLink>
          <PillLink href="/pricing" variant="ghost">
            How pricing works
          </PillLink>
        </Pills>
      </PageHero>
      <ServicesFilm />

      <Band surface="light" sec="services" id="services">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 28 }}>
          <Head
            n="01"
            eyebrow="All services"
            title={
              <>
                Accounting, audit &amp; corporate <G>services.</G>
              </>
            }
          />
          <span data-fx="rise" data-d="160" className="a4-chip a4-chip-light">
            {keys.length} services
          </span>
        </div>

        <div style={{ ...GRID3, marginTop: 40 }}>
          {keys.map((key, i) => {
            const s = A4_SERVICES_DATA[key];
            const slug = SERVICE_KEY_TO_SLUG[key];
            const [word, fx] = CARD_WORD[key] ?? [s.name, "scatter"];
            const teaser = s.lead.split(" — ")[0].split(". ")[0].replace(/\.$/, "") + ".";
            const dark = i % 2 === 1;
            return (
              <WordCard
                key={key}
                href={`/services/${slug}`}
                ariaLabel={s.name}
                i={i}
                total={keys.length}
                word={word}
                fx={fx}
                icon={s.icon}
                line={teaser}
                dark={dark}
                d={(i % 3) * 80}
                foot={
                  <span style={{ display: "block", fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", color: dark ? "#FFFFFF" : "#09090B", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {s.name}
                  </span>
                }
                go={<Icon name="arrow-right" size={15} color="currentColor" />}
              />
            );
          })}
          {/* Closes the last row (16 cards in threes leave two cells; in twos
              it runs full width): the pricing guide, in /pricing's words. */}
          <LocalizedLink
            href="/pricing-info"
            className="a4k-card a4k-span2"
            data-fx="rise"
            data-d="160"
            style={{ minHeight: 330, justifyContent: "space-between", background: LIGHT_GLOW }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span style={{ ...kicker, color: INDIGO }}>Pricing</span>
              <span aria-hidden="true" style={{ width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 999, background: "rgba(79,85,241,.08)" }}>
                <Icon name="info" size={20} color={INDIGO} stroke={1.8} />
              </span>
            </div>
            <div>
              <div style={{ fontSize: "clamp(34px,3.4vw,52px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.05 }}>
                How our pricing <G>works</G>
              </div>
              <p style={{ margin: "14px 0 0", maxWidth: 520, fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: "#52525B" }}>
                Fixed monthly plans for bookkeeping and VAT — plus how we quote audit and complex work.
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 16, borderTop: "1px solid #E4E4E7" }}>
              <span className="a4k-go">
                Read pricing guide <Icon name="arrow-right" size={14} color="currentColor" />
              </span>
            </div>
          </LocalizedLink>
        </div>
      </Band>

      <ServicePortalBand serviceName="any of our services" />
      <ServiceClosing serviceName="your business" />
    </div>
  );
}
