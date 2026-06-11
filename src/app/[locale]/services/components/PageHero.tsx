"use client";

import React from "react";
import { Button, Container } from "@/components/a4-landing/Primitives";

export function PageHero({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-black pt-24 sm:pt-28 lg:pt-32"
      style={{ paddingBottom: "clamp(44px,6vw,72px)" }}
    >
      <div aria-hidden="true" className="hero-bg" />
      <Container style={{ position: "relative", textAlign: "center" }}>
        <div className="flex items-center justify-center gap-[14px]">
          <span className="w-[28px] h-[1px] bg-[var(--a4-hairline-strong)]" />
          <span className="a4-font-body text-[12.5px] font-semibold tracking-[.14em] uppercase text-[var(--a4-on-dark-mute)]">
            {eyebrow}
          </span>
          <span className="w-[28px] h-[1px] bg-[var(--a4-hairline-strong)]" />
        </div>
        <h1
          className="a4-font-display font-medium text-white mx-auto mt-[22px]"
          style={{
            fontSize: "clamp(36px,5.4vw,72px)",
            lineHeight: 1.03,
            letterSpacing: "-.03em",
            maxWidth: 860,
            textWrap: "balance",
          }}
        >
          {title}
        </h1>
        {sub && (
          <p
            className="a4-font-body text-[var(--a4-on-dark-mute)] mx-auto mt-[22px]"
            style={{
              fontSize: "clamp(17px,1.8vw,20px)",
              lineHeight: 1.6,
              maxWidth: 600,
              textWrap: "pretty",
            }}
          >
            {sub}
          </p>
        )}
        {children}
      </Container>
    </section>
  );
}
