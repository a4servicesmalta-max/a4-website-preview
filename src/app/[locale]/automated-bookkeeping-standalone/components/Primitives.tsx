"use client";

import React, { useState, useEffect, useRef } from "react";
import * as LucideIcons from "lucide-react";

// ---- Logo --------------------------------------------------------------
export function Logo({ height = 26, invert = false }: { height?: number, invert?: boolean }) {
  // Use a relative path or asset from public if available. We fallback to generic if not.
  const src = "/assets/a4-mark-white.png";
  return (
    <img
      src={src}
      alt="A4 Services"
      style={{ height, display: "block", filter: invert ? "invert(1)" : "none" }}
    />
  );
}

// ---- Buttons -----------------------------------------------------------
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

export function Button({ variant = "primary", size = "md", children, onClick, style, href, target, rel }: ButtonProps) {
  const baseClasses = "border-0 cursor-pointer rounded-[var(--a4-r-full)] a4-font-body font-semibold tracking-[.24px] inline-flex items-center justify-center gap-2 transition-all duration-150 whitespace-nowrap decoration-none";

  const sizes = {
    lg: "h-[56px] px-[32px] text-[18px]",
    md: "h-[48px] px-[26px] text-[16px]",
    sm: "h-[40px] px-[18px] text-[14.5px]",
  };

  const variants = {
    primary: "bg-[#fff] text-[#000]",
    dark: "bg-[#000] text-[#fff]",
    soft: "bg-[var(--a4-surface-soft)] text-[var(--a4-ink)]",
    "outline-light": "bg-transparent text-[var(--a4-ink)] border border-[var(--a4-hairline-strong)]",
    "outline-dark": "bg-transparent text-[#fff] border border-[rgba(255,255,255,.4)]",
    cobalt: "bg-[var(--a4-primary)] text-[#fff]",
  };

  const Tag = href ? "a" : "button";

  return (
    <Tag
      href={href}
      onClick={onClick}
      target={target}
      rel={rel || (target === "_blank" ? "noopener noreferrer" : undefined)}
      className={`${baseClasses} ${sizes[size]} ${variants[variant]} active:opacity-80`}
      style={style}
    >
      {children}
    </Tag>
  );
}

// ---- Pill (sub-nav chip) ----------------------------------------------
export function Pill({ active, children, onClick, dark = true }: { active: boolean, children: React.ReactNode, onClick: () => void, dark?: boolean }) {
  const bg = active ? (dark ? "#fff" : "#000") : (dark ? "var(--a4-surface-elevated)" : "var(--a4-surface-soft)");
  const color = active ? (dark ? "#000" : "#fff") : (dark ? "#fff" : "var(--a4-ink)");

  return (
    <button
      onClick={onClick}
      className="h-[38px] px-[18px] rounded-[var(--a4-r-full)] border-0 cursor-pointer a4-font-body font-semibold text-[14px] transition-colors duration-150"
      style={{ background: bg, color }}
    >
      {children}
    </button>
  );
}

// ---- Badge / Eyebrow ---------------------------------------------------
export function Badge({ feature, children, dark = false }: { feature?: boolean, children: React.ReactNode, dark?: boolean }) {
  const bg = feature ? "var(--a4-primary)" : (dark ? "rgba(255,255,255,.08)" : "var(--a4-surface-soft)");
  const color = feature ? "#fff" : (dark ? "var(--a4-on-dark-mute)" : "var(--a4-ink)");

  return (
    <span
      className="rounded-[var(--a4-r-full)] text-[12px] leading-[1.4] py-[5px] px-[13px] a4-font-body font-semibold tracking-[.24px] inline-flex items-center gap-[7px]"
      style={{ background: bg, color }}
    >
      {children}
    </span>
  );
}

// Small uppercase eyebrow label
export function Eyebrow({ children, dark = false, color }: { children: React.ReactNode, dark?: boolean, color?: string }) {
  const textColor = color || (dark ? "var(--a4-on-dark-mute)" : "var(--a4-mute)");
  return (
    <div
      className="a4-font-body font-semibold text-[13px] tracking-[.18em] uppercase flex items-center gap-[10px]"
      style={{ color: textColor }}
    >
      <span className="w-[18px] h-[1px] bg-current opacity-50" />
      {children}
    </div>
  );
}

// ---- Icon (Lucide-React) --------------------------------------------
// Helper to convert kebab-case to PascalCase
function kebabToPascal(str: string) {
  return str.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
}

export function Icon({ name, size = 24, color = "currentColor", stroke = 1.75, style }: { name: string, size?: number, color?: string, stroke?: number, style?: React.CSSProperties }) {
  const IconComponent = (LucideIcons as any)[kebabToPascal(name)];
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color} strokeWidth={stroke} style={{ display: "inline-flex", ...style }} />;
}

// ---- Layout ------------------------------------------------------------
export function Container({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) {
  return <div className="max-w-[1200px] mx-auto px-[24px]" style={style}>{children}</div>;
}

// Section heading block — display headline + optional sub
export function SectionHead({ eyebrow, title, sub, dark = false, align = "left", maxWidth = 760 }: { eyebrow?: string, title: React.ReactNode, sub?: React.ReactNode, dark?: boolean, align?: "left" | "center", maxWidth?: number }) {
  return (
    <div style={{ textAlign: align, maxWidth: align === "center" ? maxWidth : "none", margin: align === "center" ? "0 auto" : 0 }}>
      {eyebrow && <div style={{ marginBottom: 18, display: "flex", justifyContent: align === "center" ? "center" : "flex-start" }}><Eyebrow dark={dark}>{eyebrow}</Eyebrow></div>}
      <h2
        className="a4-font-display font-medium text-[clamp(34px,4.4vw,56px)] leading-[1.05] tracking-[-0.02em] m-0"
        style={{ color: dark ? "var(--a4-on-dark)" : "var(--a4-ink)", textWrap: "balance" }}
      >
        {title}
      </h2>
      {sub && <p
        className="a4-font-body text-[19px] leading-[1.55] tracking-[-.1px] mt-[22px]"
        style={{
          maxWidth, color: dark ? "var(--a4-on-dark-mute)" : "var(--a4-mute)",
          marginLeft: align === "center" ? "auto" : 0, marginRight: align === "center" ? "auto" : 0,
          textWrap: "pretty",
        }}
      >
        {sub}
      </p>}
    </div>
  );
}

// Scroll reveal wrapper (restrained: short fade + rise)
export function Reveal({ children, delay = 0, style, as = "div" }: { children: React.ReactNode, delay?: number, style?: React.CSSProperties, as?: any }) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setShown(true); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } });
    }, { threshold: 0.14 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag ref={ref} data-areveal="" style={{
      ...style,
      opacity: shown ? 1 : 0,
      transform: shown ? "none" : "translateY(18px)",
      transition: `opacity .6s ease ${delay}ms, transform .6s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
    }}>
      {children}
    </Tag>
  );
}
