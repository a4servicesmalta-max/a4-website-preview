"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import LocalizedLink from "@/components/common/LocalizedLink";
import { BOOK_A_CALL_PATH, CLIENT_ONBOARDING_URL, isExternalHref } from "@/lib/external-links";
import { cn } from "@/lib/utils";

interface GetInstantQuoteButtonProps {
  /** Kept for compatibility — pills carry no glow in the A4 style. */
  hasShadow?: boolean;
  className?: string;
  variant?: "default" | "book-demo" | "custom";
  text?: string;
  href?: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
}

/**
 * The shared quote / demo CTA, as an A4 pill (Outfit 600, fully rounded, no
 * hover lift): `default` is the white pill (primary on dark), `book-demo` the
 * glass pill, `custom` takes its colours from the caller. Callers' classes
 * still win (tailwind-merge).
 */

const BASE =
  "inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full text-[15px] font-semibold whitespace-nowrap no-underline transition-colors duration-300 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[rgba(79,85,241,.55)] [font-family:var(--a4x-display)]";
const LIGHT = "bg-white text-[#09090B] hover:bg-[#E4E4E7]";
const GLASS = "bg-white/[.06] text-white border border-white/[.22] hover:bg-white/[.12] font-medium";
const INK = "bg-[#09090B] text-white hover:bg-[#27272A]";

/** The old monochrome button tokens were "indigo" by name — they become the real indigo. */
const LEGACY_INDIGO = /var\(--(button-indigo|tab-active|primary-blue|card-hover-overlay|purple-bg|primary)\)/;

function Arrow() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function CtaLink({ href, className, style, children }: { href: string; className: string; style?: React.CSSProperties; children: React.ReactNode }) {
  if (isExternalHref(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {children}
      </a>
    );
  }
  return (
    <LocalizedLink href={href} className={className} style={style}>
      {children}
    </LocalizedLink>
  );
}

const GetInstantQuoteButton = ({
  className = "",
  variant = "default",
  text,
  href,
  bgColor,
  textColor,
  borderColor,
}: GetInstantQuoteButtonProps) => {
  const { t } = useTranslation("common");
  const defaultQuote = t("glossary.getInstantQuote");
  const defaultBookDemo = t("glossary.bookDemo");

  if (variant === "custom") {
    const indigo = !!bgColor && LEGACY_INDIGO.test(bgColor);
    const style: React.CSSProperties = {
      backgroundColor: indigo ? "#4F55F1" : bgColor || undefined,
      color: indigo ? "#FFFFFF" : textColor || undefined,
      borderColor: borderColor || undefined,
      borderWidth: borderColor ? 1 : undefined,
      borderStyle: borderColor ? "solid" : undefined,
    };
    return (
      <CtaLink href={href || CLIENT_ONBOARDING_URL} className={cn(BASE, bgColor ? "" : INK, className)} style={style}>
        {text ?? defaultQuote}
        <Arrow />
      </CtaLink>
    );
  }

  if (variant === "book-demo") {
    return (
      <CtaLink href={href || BOOK_A_CALL_PATH} className={cn(BASE, GLASS, className)}>
        {text ?? defaultBookDemo}
        <Arrow />
      </CtaLink>
    );
  }

  return (
    <CtaLink href={href || CLIENT_ONBOARDING_URL} className={cn(BASE, LIGHT, className)}>
      {text ?? defaultQuote}
      <Arrow />
    </CtaLink>
  );
};

export default GetInstantQuoteButton;
