"use client";

import React, { useId, useState } from "react";
import { Icon } from "@/components/a4-landing/Primitives";

/**
 * Numbered FAQ rows in the A4 design language: `01` in indigo, the question in
 * Outfit, a round toggle that turns into a close mark, hairlines between rows.
 * The answer opens with a grid-rows transition, so long answers never clip.
 */
export function Accordion({
  items,
  defaultOpen = 0,
}: {
  items: { q: string; a: string }[];
  defaultOpen?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const base = useId();

  return (
    <div style={{ borderBottom: "1px solid #E4E4E7" }}>
      {items.map((f, i) => {
        const isOpen = open === i;
        const btnId = `${base}-q${i}`;
        const panelId = `${base}-a${i}`;
        return (
          <div key={f.q} data-fx="rise" data-d={i * 80} style={{ borderTop: "1px solid #E4E4E7" }}>
            <button
              id={btnId}
              type="button"
              className="cp-acc-btn"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? -1 : i)}
            >
              <span style={{ fontFamily: "var(--a4x-display)", fontSize: 16, fontWeight: 600, letterSpacing: ".02em", color: "#4F55F1" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  fontFamily: "var(--a4x-display)",
                  fontSize: "clamp(18px,1.7vw,22px)",
                  fontWeight: 500,
                  letterSpacing: "-0.015em",
                  lineHeight: 1.3,
                  color: "#09090B",
                  textWrap: "pretty",
                }}
              >
                {f.q}
              </span>
              <span className="cp-acc-plus" aria-hidden="true">
                <Icon name="plus" size={18} color="#09090B" stroke={2} />
              </span>
            </button>
            <div id={panelId} role="region" aria-labelledby={btnId} className="cp-acc-panel" data-open={isOpen}>
              <div inert={!isOpen}>
                <p className="cp-acc-answer">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
