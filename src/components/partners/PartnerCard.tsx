"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Handshake, Layers, Puzzle, TrendingUp, ArrowRight, type LucideIcon } from "lucide-react";
import LocalizedLink from "@/components/common/LocalizedLink";
import "@/app/[locale]/services/components/site-kit.css";

interface PartnerCardProps {
  title: string;
  description: string;
  link: string;
  learnMoreText?: string;
  iconIndex?: number;
  delay?: number;
}

const icons: LucideIcon[] = [Handshake, Layers, Puzzle, TrendingUp];

/**
 * A partnership model as the design's link card: 24px radius, hairline,
 * indigo border and glow on hover — no lift. Rises in via FxRuntime;
 * `delay` (seconds) staggers it.
 */
const PartnerCard = ({ title, description, link, learnMoreText, iconIndex = 0, delay = 0 }: PartnerCardProps) => {
  const { t } = useTranslation("common");
  const ctaLabel = learnMoreText ?? t("glossary.learnMore");
  const Icon = icons[iconIndex % icons.length];

  return (
    <LocalizedLink href={link} className="a4k-card" style={{ height: "100%", minHeight: 300, gap: 0 }} data-fx="rise" data-d={Math.round(delay * 1000) || undefined}>
      <span aria-hidden="true" style={{ width: 48, height: 48, display: "grid", placeItems: "center", borderRadius: 999, background: "rgba(79,85,241,.08)", color: "#4F55F1" }}>
        <Icon size={22} strokeWidth={1.8} />
      </span>
      <h3 style={{ margin: "auto 0 0", paddingTop: 32, fontFamily: "var(--a4x-display)", fontSize: "clamp(24px,2.1vw,30px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15, color: "#09090B" }}>
        {title}
      </h3>
      <p style={{ margin: "12px 0 0", fontFamily: "var(--a4x-body)", fontSize: 16, lineHeight: 1.55, color: "#52525B" }}>{description}</p>
      <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid #E4E4E7", display: "flex", justifyContent: "flex-end" }}>
        <span className="a4k-go">
          {ctaLabel} <ArrowRight size={14} />
        </span>
      </div>
    </LocalizedLink>
  );
};

export default PartnerCard;
