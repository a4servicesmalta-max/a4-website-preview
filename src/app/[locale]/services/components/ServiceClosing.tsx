"use client";

import React from "react";
import { CtaCard, DarkCta, PillLink } from "./SiteKit";

/**
 * The closing dark CTA band of every service page — "Accept your / quotation."
 * in the design: a typed heading with the service on the gradient, and the
 * accept card on the right carrying the two ways forward.
 */
export function ServiceClosing({ serviceName }: { serviceName: string }) {
  const name = serviceName.toLowerCase();

  return (
    <DarkCta
      sec="closing"
      typed="Let's talk about"
      words={[{ t: `${name}.`, g: true }]}
      label={`Let's talk about ${name}.`}
    >
      <CtaCard>
        <p style={{ margin: 0, fontSize: "clamp(19px,1.7vw,22px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.45, color: "#E4E4E7", textWrap: "pretty" }}>
          A short call is all it takes to scope the work and give you a clear, fixed quote.
        </p>
        <PillLink href="/contact" variant="light" style={{ marginTop: 28, width: "100%", height: 64, fontSize: 19 }}>
          Book a consultation
        </PillLink>
        <PillLink href="/services" variant="ghost" style={{ marginTop: 12, width: "100%" }}>
          All services
        </PillLink>
      </CtaCard>
    </DarkCta>
  );
}
