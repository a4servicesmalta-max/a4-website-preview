"use client";

import React from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Icon, Reveal } from "@/components/a4-landing/Primitives";
import type { ResourceCard } from "@/data/a4ResourcesSiteData";

export function ResourceLinkCard({ card, delay = 0 }: { card: ResourceCard; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <LocalizedLink
        href={card.href}
        className="resource-link-card block no-underline h-full bg-[var(--a4-surface-card)] border border-[var(--a4-hairline-light)] rounded-[var(--a4-r-lg)] transition-[border-color] duration-[180ms] hover:border-[var(--a4-hairline-strong)]"
        style={{ padding: "clamp(24px,3vw,32px)" }}
      >
        <div className="flex items-center justify-between">
          <span className="w-12 h-12 rounded-[var(--a4-r-md)] bg-[var(--a4-surface-soft)] grid place-items-center">
            <Icon name={card.icon} size={23} color="var(--a4-primary)" stroke={1.75} />
          </span>
          <Icon name="arrow-up-right" size={20} color="var(--a4-faint)" />
        </div>
        <h3
          className="a4-font-display font-medium text-[var(--a4-ink)] mt-5 m-0"
          style={{ fontSize: 21, letterSpacing: "-.2px" }}
        >
          {card.t}
        </h3>
        <p
          className="a4-font-body text-[var(--a4-mute)] mt-[9px] m-0"
          style={{ fontSize: 14.5, lineHeight: 1.55, textWrap: "pretty" }}
        >
          {card.s}
        </p>
      </LocalizedLink>
    </Reveal>
  );
}
