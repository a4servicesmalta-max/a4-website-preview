"use client";

import React from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Button, Container, Icon } from "@/components/a4-landing/Primitives";
import { useLocalizedHref } from "./useLocalizedHref";

export function ServiceClosing({ serviceName }: { serviceName: string }) {
  const href = useLocalizedHref();

  return (
    <section
      className="relative overflow-hidden bg-black"
      style={{ padding: "clamp(64px,9vw,104px) 0" }}
    >
      <div aria-hidden="true" className="hero-bg" />
      <Container style={{ position: "relative", textAlign: "center", maxWidth: 720 }}>
        <h2
          className="a4-font-display font-medium text-white m-0"
          style={{
            fontSize: "clamp(30px,4.4vw,54px)",
            lineHeight: 1.04,
            letterSpacing: "-.025em",
            textWrap: "balance",
          }}
        >
          Let&apos;s talk about {serviceName.toLowerCase()}.
        </h2>
        <p
          className="a4-font-body text-[var(--a4-on-dark-mute)] mx-auto mt-4 max-w-[520px]"
          style={{ fontSize: 18, lineHeight: 1.6, textWrap: "pretty" }}
        >
          A short call is all it takes to scope the work and give you a clear, fixed quote.
        </p>
        <div className="flex gap-3 mt-8 justify-center flex-wrap">
          <Button variant="primary" size="lg" href={href("/contact")}>
            Book a consultation <Icon name="arrow-right" size={18} color="#000" />
          </Button>
          <LocalizedLink href="/services" className="inline-flex">
            <Button variant="outline-dark" size="lg">
              All services
            </Button>
          </LocalizedLink>
        </div>
      </Container>
    </section>
  );
}
