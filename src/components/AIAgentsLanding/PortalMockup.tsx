"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Activity, Database, MessageSquare, Shield } from "lucide-react";
import { BODY, Band, DocPanel, FrameBar, INDIGO, SANS, StatusPill, gradTail, kicker, type Tone } from "@/components/services/SectionKit";

interface PortalMockupProps {
  namespace: "accounting" | "business";
}

const ROWS: { acc: string; bal: string; stat: string; tone: Tone }[] = [
  { acc: "Revenue", bal: "€1.2M", stat: "Tested", tone: "indigo" },
  { acc: "Cost of Sales", bal: "€450k", stat: "Adj. Required", tone: "ink" },
  { acc: "Operating Exp.", bal: "€320k", stat: "Tested", tone: "indigo" },
  { acc: "Trade Receivables", bal: "€180k", stat: "Pending", tone: "line" },
];

/** The portal block: H2 with its gradient word, the four features as hairline rows, and the engagement document. */
const PortalMockup = ({ namespace }: PortalMockupProps) => {
  const { t } = useTranslation(namespace);
  const { t: tc } = useTranslation("common");

  const features = [
    { Icon: Activity, text: t("portal.f1") },
    { Icon: Shield, text: t("portal.f2") },
    { Icon: MessageSquare, text: t("portal.f3") },
    { Icon: Database, text: t("portal.f4") },
  ];

  return (
    <Band id="portal" surface="light">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-14 lg:gap-[72px] items-center">
        <div>
          <div data-fx="rise" className="a4-eyebrow" style={{ color: "#52525B" }}>
            <span style={{ color: INDIGO }}>03</span>
            <span>{tc("nav.platform")}</span>
          </div>
          <h2 data-fx="rise" data-d="100" style={{ margin: "14px 0 0", fontSize: "clamp(40px,5.2vw,80px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.02, textWrap: "balance" }}>
            {gradTail(t("portal.title"))}
          </h2>
          <p data-fx="rise" data-d="200" style={{ margin: "20px 0 0", maxWidth: 520, fontFamily: BODY, fontSize: 18, lineHeight: 1.55, color: "#52525B" }}>
            {t("portal.sub")}
          </p>
          <div data-fx="rise" data-d="280" style={{ marginTop: 28 }}>
            {features.map(({ Icon, text }, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: "1px solid #E4E4E7", ...(i === features.length - 1 ? { borderBottom: "1px solid #E4E4E7" } : null) }}>
                <span style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(79,85,241,.1)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon size={17} color={INDIGO} aria-hidden="true" />
                </span>
                <span style={{ fontFamily: SANS, fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div data-fx="rise" data-d="150" data-dy="70" style={{ minWidth: 0 }}>
          <DocPanel>
            <FrameBar label="app.a4services.com/engagements/seytravel-fy24" />
            <div style={{ padding: "18px 22px 0", display: "flex", flexWrap: "wrap", gap: 8 }}>
              <StatusPill tone="ink">Overview</StatusPill>
              <StatusPill tone="line">Trial Balance</StatusPill>
              <StatusPill tone="line">Working Papers</StatusPill>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "18px 22px" }}>
              <div style={{ border: "1px solid #E4E4E7", borderRadius: 18, padding: "14px 16px" }}>
                <div style={kicker}>Materiality</div>
                <div style={{ marginTop: 6, fontSize: 26, fontWeight: 600, letterSpacing: "-0.03em" }}>€45,000</div>
              </div>
              <div style={{ border: "1px solid #E4E4E7", borderRadius: 18, padding: "14px 16px" }}>
                <div style={kicker}>Progress</div>
                <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.03em" }}>84%</span>
                  <span style={{ fontFamily: BODY, fontSize: 12.5, fontWeight: 600, color: INDIGO }}>+12% today</span>
                </div>
              </div>
            </div>
            <div style={{ padding: "0 22px 8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr) auto", gap: 12, padding: "0 0 8px", ...kicker, fontSize: 10.5 }}>
                <span>Account</span>
                <span style={{ textAlign: "right" }}>Balance</span>
                <span style={{ textAlign: "right", minWidth: 110 }}>Status</span>
              </div>
              {ROWS.map((row) => (
                <div key={row.acc} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr) auto", gap: 12, alignItems: "center", padding: "11px 0", borderTop: "1px solid #E4E4E7" }}>
                  <span style={{ fontSize: 14.5, fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.acc}</span>
                  <span style={{ textAlign: "right", fontSize: 14.5, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{row.bal}</span>
                  <span style={{ display: "flex", justifyContent: "flex-end", minWidth: 110 }}>
                    <StatusPill tone={row.tone} style={{ height: 26, fontSize: 12 }}>
                      {row.stat}
                    </StatusPill>
                  </span>
                </div>
              ))}
            </div>
            <div style={{ height: 14, background: "#FAFAFA", borderTop: "1px solid #E4E4E7" }} />
          </DocPanel>
        </div>
      </div>
    </Band>
  );
};

export default PortalMockup;
