import type { CSSProperties } from "react";

/**
 * A4 palette for the questionnaire prototype. Status reads without red /
 * amber / green: done is indigo, open is a hairline, a flag is ink.
 */
export const SANS = "var(--a4x-display), Outfit, Inter, system-ui, sans-serif";
export const BODY = "var(--a4x-body), Inter, system-ui, sans-serif";
export const INK = "#09090B";
export const INDIGO = "#4F55F1";
export const PERI = "#8B8FF7";
export const GRAD = "linear-gradient(90deg,#4F55F1 0%,#6468F3 55%,#8B8FF7 100%)";
export const LINE = "#E4E4E7";

export const kicker: CSSProperties = {
  fontFamily: BODY,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "#71717A",
};

export type AqTone = "done" | "open" | "flag" | "muted";

export const TONE: Record<AqTone, CSSProperties> = {
  done: { background: "rgba(79,85,241,.1)", color: INDIGO, border: "1px solid transparent" },
  open: { background: "#FFFFFF", color: "#52525B", border: `1px solid ${LINE}` },
  flag: { background: INK, color: "#FFFFFF", border: `1px solid ${INK}` },
  muted: { background: "#F4F4F5", color: "#52525B", border: "1px solid transparent" },
};

export const pill = (tone: AqTone, extra?: CSSProperties): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  height: 24,
  padding: "0 10px",
  borderRadius: 999,
  fontFamily: SANS,
  fontSize: 11.5,
  fontWeight: 600,
  whiteSpace: "nowrap",
  ...TONE[tone],
  ...extra,
});
