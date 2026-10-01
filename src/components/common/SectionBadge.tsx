import React from "react";
import { cn } from "@/lib/utils";
import { sentence } from "@/components/services/SectionKit";

interface SectionBadgeProps {
  text: string;
  className?: string;
}

/**
 * Section label in the A4 style: the design's eyebrow — skewed indigo mark,
 * Outfit 600 — in place of the old dashed, uppercase badge. Callers on dark
 * surfaces can still lighten the text with a colour class.
 */
const SectionBadge = ({ text, className = "" }: SectionBadgeProps) => {
  return (
    <div
      className={cn("inline-flex items-center gap-3 text-[#52525B]", className)}
      style={{
        fontFamily: "var(--a4x-display)",
        fontSize: 17,
        fontWeight: 600,
        letterSpacing: ".02em",
        lineHeight: 1.3,
        textTransform: "none",
        border: 0,
        background: "transparent",
        padding: 0,
      }}
    >
      <span
        aria-hidden="true"
        style={{ display: "inline-block", width: 9, height: 9, borderRadius: 1, background: "#6468F3", transform: "skewX(-30deg)", flexShrink: 0 }}
      />
      <span>{sentence(text)}</span>
    </div>
  );
};

export default SectionBadge;
