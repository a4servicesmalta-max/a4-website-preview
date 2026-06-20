"use client";
import { useState } from "react";

export type Contact = { email: string; name: string; company: string };

/** Branded text input with cobalt focus ring (A4 colors). */
export function Field(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [focus, setFocus] = useState(false);
  const { style, onFocus, onBlur, ...rest } = props;
  return (
    <input
      {...rest}
      onFocus={(e) => { setFocus(true); onFocus?.(e); }}
      onBlur={(e) => { setFocus(false); onBlur?.(e); }}
      style={{
        height: 50,
        padding: "0 15px",
        width: "100%",
        boxSizing: "border-box",
        borderRadius: 10,
        border: `1px solid ${focus ? "var(--a4-primary)" : "var(--a4-hairline-light)"}`,
        boxShadow: focus ? "0 0 0 3px rgba(73,79,223,.15)" : "none",
        background: "#fff",
        color: "var(--a4-ink)",
        fontSize: 15,
        fontFamily: "var(--a4-font-body)",
        outline: "none",
        transition: "border-color .15s, box-shadow .15s",
        ...style,
      }}
    />
  );
}

export const primaryBtn = (disabled?: boolean): React.CSSProperties => ({
  height: 50,
  padding: "0 30px",
  borderRadius: "var(--a4-r-full)",
  border: 0,
  background: "var(--a4-primary)",
  color: "#fff",
  fontWeight: 600,
  fontSize: 15.5,
  letterSpacing: ".2px",
  cursor: disabled ? "default" : "pointer",
  opacity: disabled ? 0.5 : 1,
  fontFamily: "var(--a4-font-body)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  transition: "opacity .15s, filter .15s",
});

export const outlineBtn: React.CSSProperties = {
  height: 50,
  padding: "0 24px",
  borderRadius: "var(--a4-r-full)",
  border: "1px solid var(--a4-primary)",
  background: "#fff",
  color: "var(--a4-primary)",
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
  fontFamily: "var(--a4-font-body)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};
