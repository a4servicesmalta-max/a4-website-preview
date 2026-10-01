"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Building2, FileSearch, Paintbrush, ShieldCheck } from "lucide-react";
import { BODY, Band, INDIGO, PERI, SANS, card } from "@/components/services/SectionKit";

interface ValueStripProps {
  namespace: "accounting" | "business";
}

const ICONS = [Building2, FileSearch, ShieldCheck, Paintbrush];

/** The four value cards — the design's card grid, alternating light and dark. */
const ValueStrip = ({ namespace }: ValueStripProps) => {
  const { t } = useTranslation(namespace);

  return (
    <Band surface="light" tight>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16 }}>
        {[1, 2, 3, 4].map((i, idx) => {
          const dark = idx % 2 === 1;
          const Ico = ICONS[idx];
          const c = card(dark, { padding: 28, minHeight: 300, display: "flex", flexDirection: "column", gap: 16 });
          return (
            <div key={i} data-fx="rise" data-d={idx * 80} className={c.className} style={c.style}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: dark ? "#A1A1AA" : "#52525B" }}>
                  <span style={{ color: dark ? PERI : INDIGO }}>{String(i).padStart(2, "0")}</span>
                  <span>/ 04</span>
                </div>
                <span style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: dark ? "rgba(139,143,247,.16)" : "rgba(79,85,241,.1)" }}>
                  <Ico size={20} color={dark ? PERI : INDIGO} strokeWidth={1.8} aria-hidden="true" />
                </span>
              </div>
              <h3 style={{ margin: "28px 0 0", fontFamily: SANS, fontSize: 24, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15 }}>{t(`values.c${i}.title`)}</h3>
              <p style={{ margin: 0, fontFamily: BODY, fontSize: 15.5, lineHeight: 1.55, color: dark ? "#A1A1AA" : "#52525B" }}>{t(`values.c${i}.desc`)}</p>
            </div>
          );
        })}
      </div>
    </Band>
  );
};

export default ValueStrip;
