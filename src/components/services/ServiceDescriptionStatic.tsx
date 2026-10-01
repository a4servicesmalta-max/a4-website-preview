import React from "react";

/** Server-safe overview text (replaces JSX from servicesData for localized pages). A4 kicker + Inter body. */
export default function ServiceDescriptionStatic({ heading, paragraphs }: { heading: string; paragraphs: string[] }) {
  return (
    <>
      <h3
        style={{
          margin: "0 0 12px",
          fontFamily: "var(--a4x-body)",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: "#71717A",
        }}
      >
        {heading}
      </h3>
      {paragraphs.map((p, i) => (
        <p key={i} style={{ margin: i < paragraphs.length - 1 ? "0 0 16px" : 0, fontFamily: "var(--a4x-body)", fontSize: 17, lineHeight: 1.6, color: "#52525B" }}>
          {p}
        </p>
      ))}
    </>
  );
}
