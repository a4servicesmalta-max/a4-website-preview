"use client";
import { useState } from "react";

export type Contact = { email: string; name: string; company: string };

/**
 * Text input in the A4 design language: white, 1px #E4E4E7, radius 14,
 * 54px, Outfit; the focus border and ring follow the page's accent token.
 */
export function Field(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focus, setFocus] = useState(false);
  const { style, onFocus, onBlur, ...rest } = props;
  return (
    <input
      {...rest}
      onFocus={(e) => { setFocus(true); onFocus?.(e); }}
      onBlur={(e) => { setFocus(false); onBlur?.(e); }}
      style={{
        height: 54,
        padding: "0 18px",
        width: "100%",
        boxSizing: "border-box",
        borderRadius: 14,
        border: `1px solid ${focus ? "var(--a4-primary, #4F55F1)" : "var(--a4-hairline-light, #E4E4E7)"}`,
        boxShadow: focus ? "0 0 0 3px color-mix(in srgb, var(--a4-primary, #4F55F1) 16%, transparent)" : "none",
        background: "#fff",
        color: "var(--a4-ink, #09090B)",
        fontSize: 16.5,
        fontWeight: 500,
        letterSpacing: "-0.01em",
        fontFamily: "var(--a4x-display)",
        outline: "none",
        transition: "border-color .25s, box-shadow .25s",
        ...style,
      }}
    />
  );
}

/** The design's ink pill (primary action on light). */
export const primaryBtn = (disabled?: boolean): React.CSSProperties => ({
  height: 54,
  padding: "0 28px",
  borderRadius: 999,
  border: 0,
  background: "#09090B",
  color: "#fff",
  fontWeight: 600,
  fontSize: 16.5,
  letterSpacing: 0,
  cursor: disabled ? "default" : "pointer",
  opacity: disabled ? 0.45 : 1,
  fontFamily: "var(--a4x-display)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  whiteSpace: "nowrap",
  transition: "opacity .3s, background .3s",
});

/** White pill with a hairline (secondary action on light). */
export const outlineBtn: React.CSSProperties = {
  height: 54,
  padding: "0 24px",
  borderRadius: 999,
  border: "1px solid #E4E4E7",
  background: "#fff",
  color: "#09090B",
  fontWeight: 600,
  fontSize: 16,
  cursor: "pointer",
  fontFamily: "var(--a4x-display)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  whiteSpace: "nowrap",
  transition: "border-color .3s, opacity .3s",
};
