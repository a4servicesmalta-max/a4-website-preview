"use client";

import React from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Container, Icon } from "@/components/a4-landing/Primitives";
import { PageHero } from "@/app/[locale]/services/components/PageHero";

type Section = {
  h: string;
  p: (string | string[])[];
};

export function LegalDocPage({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated?: string;
  intro?: string;
  sections: Section[];
}) {
  return (
    <div className="a4-site-page">
      <PageHero eyebrow={eyebrow} title={title} sub={updated ? `Last updated ${updated}` : undefined} />
      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(48px,7vw,88px) 0" }}>
        <Container style={{ maxWidth: 820 }}>
          {intro && (
            <p className="a4-font-body text-[17px] leading-[1.7] text-[var(--a4-charcoal)] m-0 mb-10" style={{ textWrap: "pretty" }}>
              {intro}
            </p>
          )}
          {sections.map((s, i) => (
            <div key={s.h} className="mb-9">
              <h2
                className="a4-font-display font-medium text-[var(--a4-ink)] m-0 mb-[14px]"
                style={{ fontSize: "clamp(20px,2.6vw,27px)", letterSpacing: "-.3px" }}
              >
                {i + 1}. {s.h}
              </h2>
              {s.p.map((para, j) =>
                typeof para === "string" ? (
                  <p
                    key={j}
                    className="a4-font-body text-[var(--a4-mute)] m-0 mb-[14px]"
                    style={{ fontSize: 16, lineHeight: 1.7, textWrap: "pretty" }}
                  >
                    {para}
                  </p>
                ) : (
                  <ul key={j} className="m-0 mb-[14px] p-0 list-none flex flex-col gap-[9px]">
                    {para.map((li) => (
                      <li key={li} className="flex gap-[11px] a4-font-body text-[16px] leading-[1.6] text-[var(--a4-mute)]">
                        <Icon name="check" size={16} color="var(--a4-accent-teal)" stroke={2.4} style={{ marginTop: 3, flexShrink: 0 }} />
                        {li}
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          ))}
          <div
            className="mt-10 pt-7 a4-font-body text-[15px] leading-[1.6] text-[var(--a4-mute)]"
            style={{ borderTop: "1px solid var(--a4-hairline-light)" }}
          >
            Questions about this policy? Email{" "}
            <a href="mailto:info@a4.com.mt" className="text-[var(--a4-link)] font-semibold no-underline">
              info@a4.com.mt
            </a>{" "}
            or visit our{" "}
            <LocalizedLink href="/contact" className="text-[var(--a4-link)] font-semibold no-underline">
              contact page
            </LocalizedLink>
            .
          </div>
        </Container>
      </section>
    </div>
  );
}
