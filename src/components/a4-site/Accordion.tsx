"use client";

import React, { useState } from "react";
import { Icon } from "@/components/a4-landing/Primitives";

export function Accordion({
  items,
  defaultOpen = 0,
}: {
  items: { q: string; a: string }[];
  defaultOpen?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div style={{ borderTop: "1px solid var(--a4-hairline-light)" }}>
      {items.map((f, i) => (
        <div key={f.q} style={{ borderBottom: "1px solid var(--a4-hairline-light)" }}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? -1 : i)}
            className="w-full flex items-center justify-between gap-5 bg-transparent border-0 cursor-pointer py-[22px] text-left"
          >
            <span
              className="a4-font-display font-medium text-[var(--a4-ink)]"
              style={{ fontSize: "clamp(17px,2.1vw,21px)", letterSpacing: "-.2px" }}
            >
              {f.q}
            </span>
            <span
              className="shrink-0 w-8 h-8 rounded-[var(--a4-r-full)] grid place-items-center transition-all duration-250"
              style={{
                border: "1px solid var(--a4-hairline-strong)",
                transform: open === i ? "rotate(45deg)" : "none",
                background: open === i ? "var(--a4-ink)" : "transparent",
              }}
            >
              <Icon name="plus" size={16} color={open === i ? "#fff" : "var(--a4-ink)"} />
            </span>
          </button>
          <div style={{ maxHeight: open === i ? 400 : 0, overflow: "hidden", transition: "max-height 0.3s ease" }}>
            <p
              className="a4-font-body text-[var(--a4-mute)] m-0 mb-6 max-w-[720px]"
              style={{ fontSize: 16, lineHeight: 1.6, textWrap: "pretty" }}
            >
              {f.a}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
