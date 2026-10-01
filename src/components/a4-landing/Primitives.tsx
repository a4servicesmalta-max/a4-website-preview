"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";
import { isExternalHref } from "@/lib/external-links";
import { A4Mark } from "@/components/fx/primitives";

/**
 * Shared building blocks for every A4 page, in the A4 design language (the
 * "A4 Quotation" landing): Outfit pill buttons, numbered eyebrows, rise-in
 * reveals driven by FxRuntime (data-fx), the drawn A4 mark.
 *
 * The props are the ones pages already use — restyling here restyles the site.
 */

export function Logo({ height = 26, invert = false }: { height?: number; invert?: boolean }) {
  return <A4Mark size={height} color={invert ? "#09090B" : "#FFFFFF"} />;
}

type ButtonProps = {
  variant?: "primary" | "dark" | "soft" | "outline-light" | "outline-dark" | "cobalt";
  size?: "lg" | "md" | "sm";
  children: React.ReactNode;
  onClick?: React.MouseEventHandler;
  style?: React.CSSProperties;
  href?: string;
  target?: string;
  rel?: string;
};

const BUTTON_SIZES: Record<NonNullable<ButtonProps["size"]>, React.CSSProperties> = {
  lg: { height: 58, padding: "0 30px", fontSize: 18 },
  md: { height: 48, padding: "0 24px", fontSize: 16 },
  sm: { height: 40, padding: "0 18px", fontSize: 14.5 },
};

const BUTTON_VARIANTS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  // White pill — the design's primary on dark.
  primary: "a4-btn-light",
  // Ink pill — the primary on light.
  dark: "a4-btn-ink",
  soft: "a4-btn-soft",
  // White with a hairline — secondary on light.
  "outline-light": "a4-btn-outline",
  // Glass — secondary on dark.
  "outline-dark": "a4-btn-ghost",
  // Indigo with glow.
  cobalt: "a4-btn-indigo",
};

export function Button({ variant = "primary", size = "md", children, onClick, style, href, target, rel }: ButtonProps) {
  const localizedHref = useLocalizedHref();
  const resolvedHref = href ? (isExternalHref(href) ? href : localizedHref(href)) : undefined;
  const Tag = resolvedHref ? "a" : "button";
  return (
    <Tag
      href={resolvedHref}
      onClick={onClick}
      target={target}
      rel={rel || (target === "_blank" ? "noopener noreferrer" : undefined)}
      className={`a4-btn ${BUTTON_VARIANTS[variant]}`}
      style={{ ...BUTTON_SIZES[size], textDecoration: "none", ...style }}
    >
      {children}
    </Tag>
  );
}

/** Segmented-control pill (the design's Monthly / Annual switch). */
export function Pill({ active, children, onClick, dark = true }: { active: boolean; children: React.ReactNode; onClick: () => void; dark?: boolean }) {
  const bg = active ? (dark ? "#FFFFFF" : "#09090B") : dark ? "rgba(255,255,255,.06)" : "#F4F4F5";
  const color = active ? (dark ? "#09090B" : "#FFFFFF") : dark ? "#E4E4E7" : "#52525B";
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        height: 44,
        padding: "0 20px",
        borderRadius: 999,
        border: `1px solid ${active ? "transparent" : dark ? "rgba(255,255,255,.14)" : "#E4E4E7"}`,
        cursor: "pointer",
        fontFamily: "var(--a4x-display)",
        fontWeight: 600,
        fontSize: 15,
        background: bg,
        color,
        transition: "background .3s, color .3s, border-color .3s",
      }}
    >
      {children}
    </button>
  );
}

/** Small status chip ("Included" in the design). */
export function Badge({ feature, children, dark = false }: { feature?: boolean; children: React.ReactNode; dark?: boolean }) {
  const bg = feature ? (dark ? "rgba(139,143,247,.18)" : "rgba(79,85,241,.1)") : dark ? "rgba(255,255,255,.06)" : "#F4F4F5";
  const color = feature ? (dark ? "#FFFFFF" : "#4F55F1") : dark ? "#A1A1AA" : "#3F3F46";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        height: 30,
        padding: "0 13px",
        borderRadius: 999,
        fontFamily: "var(--a4x-display)",
        fontSize: 13,
        fontWeight: 600,
        background: bg,
        color,
        border: feature ? "1px solid transparent" : `1px solid ${dark ? "rgba(255,255,255,.14)" : "#E4E4E7"}`,
      }}
    >
      {children}
    </span>
  );
}

/**
 * "01  Build your quote" — the design's section eyebrow. Without a number it
 * leads with the skewed indigo mark used for the design's scope bullets.
 */
export function Eyebrow({ children, dark = false, color, n }: { children: React.ReactNode; dark?: boolean; color?: string; n?: string }) {
  const textColor = color || (dark ? "#A1A1AA" : "#52525B");
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 12,
        fontFamily: "var(--a4x-display)",
        fontSize: 18,
        fontWeight: 600,
        letterSpacing: ".02em",
        color: textColor,
      }}
    >
      {n ? (
        <span style={{ color: dark ? "#8B8FF7" : "#4F55F1" }}>{n}</span>
      ) : (
        <span
          aria-hidden="true"
          style={{ display: "inline-block", width: 9, height: 9, borderRadius: 1, background: dark ? "#8B8FF7" : "#4F55F1", transform: "skewX(-30deg)", flexShrink: 0, alignSelf: "center" }}
        />
      )}
      <span>{children}</span>
    </div>
  );
}

function kebabToPascal(str: string) {
  return str.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
}

export function Icon({ name, size = 24, color = "currentColor", stroke = 1.75, style }: { name: string; size?: number; color?: string; stroke?: number; style?: React.CSSProperties }) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; style?: React.CSSProperties }>>)[kebabToPascal(name)];
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color} strokeWidth={stroke} style={{ display: "inline-flex", ...style }} />;
}

/** The design's content width: 1280px with clamp(20px,5vw,72px) gutters. */
export function Container({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ maxWidth: 1424, margin: "0 auto", paddingInline: "clamp(20px,5vw,72px)", ...style }}>
      {children}
    </div>
  );
}

export function SectionHead({
  eyebrow,
  title,
  sub,
  dark = false,
  align = "left",
  maxWidth = 760,
  n,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  dark?: boolean;
  align?: "left" | "center";
  maxWidth?: number;
  /** Section number for the eyebrow ("01"). */
  n?: string;
}) {
  return (
    <div style={{ textAlign: align, maxWidth: align === "center" ? maxWidth : "none", margin: align === "center" ? "0 auto" : 0 }}>
      {eyebrow && (
        <div data-fx="rise" style={{ marginBottom: 16, display: "flex", justifyContent: align === "center" ? "center" : "flex-start" }}>
          <Eyebrow dark={dark} n={n}>
            {eyebrow}
          </Eyebrow>
        </div>
      )}
      <h2
        data-fx="rise"
        data-d="100"
        style={{
          margin: 0,
          fontFamily: "var(--a4x-display)",
          fontSize: "clamp(36px,4.6vw,72px)",
          fontWeight: 600,
          letterSpacing: "-0.04em",
          lineHeight: 1.03,
          color: dark ? "#FFFFFF" : "#09090B",
          textWrap: "balance",
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          data-fx="rise"
          data-d="200"
          style={{
            marginTop: 20,
            marginBottom: 0,
            maxWidth,
            marginLeft: align === "center" ? "auto" : 0,
            marginRight: align === "center" ? "auto" : 0,
            fontFamily: "var(--a4x-body)",
            fontSize: 18,
            lineHeight: 1.55,
            color: dark ? "#A1A1AA" : "#52525B",
            textWrap: "pretty",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/**
 * Rise-in reveal — the design's `rise` (lift + blur + fade, expo-out) bound
 * by FxRuntime when the block scrolls into view. `delay` is milliseconds.
 */
export function Reveal({ children, delay = 0, style, className, as = "div" }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties; className?: string; as?: React.ElementType }) {
  const Tag = as;
  return (
    <Tag data-fx="rise" data-d={delay || undefined} className={className} style={style}>
      {children}
    </Tag>
  );
}
