"use client";

import React from "react";
import { Camera, CreditCard, FileText, Folder, Landmark, PiggyBank, ShieldCheck } from "lucide-react";
import { usePagesTranslation } from "@/hooks/usePagesTranslation";
import { Eyebrow } from "@/components/fx/primitives";
import { BODY, Band, Bullets, DarkStage, DocPanel, INDIGO, INK, PERI, SANS, card, gradText, gradTail, kicker, sentence, type Surface } from "@/components/services/SectionKit";

interface BulletList {
  items: string[];
}

interface DetailCard {
  title: string;
  subtitle: string;
  bullets: string[];
}

interface AccountRow {
  label: string;
  value: string;
  note?: string;
}

interface RightOverlayCardProps {
  header: string;
  totalLabel: string;
  totalValue: string;
  /** Kept for compatibility — the total reads on the brand gradient. */
  totalAccentColor?: string;
  sections: {
    title: string;
    rows: AccountRow[];
  }[];
}

type RiskAuditVariant = "accounting" | "audit";

interface RiskAuditSectionProps {
  variant?: RiskAuditVariant;
  badgeText?: string;
  heading?: string;
  intro?: string;
  introBullets?: BulletList;
  leftCards?: DetailCard[];
  /** Kept for compatibility — bullets are the design's skewed indigo mark. */
  bulletIconSrc?: string;
  /** Optional photo under the dark stage; by default the stage is the design's dark card. */
  backgroundImageSrc?: string;
  rightOverlayCard?: RightOverlayCardProps;
  /** Section number for the eyebrow ("03"). */
  n?: string;
  surface?: Surface;
}

const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

function AccountCard({ data }: { data: RightOverlayCardProps }) {
  const iconFor = (title: string) => (/bank/i.test(title) ? PiggyBank : /credit/i.test(title) ? CreditCard : null);
  return (
    <DocPanel style={{ width: "min(100%, 420px)", boxShadow: "0 40px 100px rgba(0,0,0,.45)" }}>
      <div style={{ padding: "22px 24px 18px" }}>
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>{data.header}</div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <span style={kicker}>{data.totalLabel}</span>
          <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.04em", ...gradText }}>{data.totalValue}</span>
        </div>
      </div>
      {data.sections.map((section) => {
        const Ico = iconFor(section.title);
        return (
          <div key={section.title} style={{ padding: "0 24px 8px", borderTop: "1px solid #E4E4E7" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 0 6px" }}>
              {Ico ? <Ico size={14} color="#71717A" aria-hidden="true" /> : null}
              <span style={kicker}>{section.title}</span>
            </div>
            {section.rows.map((row, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "9px 0" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 11, background: "#F4F4F5", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    {Ico ? <Ico size={16} color={INDIGO} aria-hidden="true" /> : null}
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{row.label}</span>
                    {row.note ? <span style={{ fontFamily: BODY, fontSize: 12, color: "#71717A" }}>{row.note}</span> : null}
                  </span>
                </span>
                <span style={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{row.value}</span>
              </div>
            ))}
          </div>
        );
      })}
      <div style={{ height: 10 }} />
    </DocPanel>
  );
}

function RequirementCard() {
  const items = ["Insurance", "Bank charges", "Finance interest paid", "Audit & accountancy fees", "Fees membership subscription"];
  return (
    <DocPanel style={{ width: "min(100%, 380px)", padding: "22px 24px 24px", boxShadow: "0 40px 100px rgba(0,0,0,.45)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 44, height: 44, borderRadius: 22, background: INK, color: "#FFFFFF", display: "grid", placeItems: "center", fontSize: 14, fontWeight: 600, flexShrink: 0 }}>JJ</span>
        <span style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            John Jos <span style={{ marginLeft: 8, fontFamily: BODY, fontSize: 12, fontWeight: 500, color: "#71717A" }}>11:41</span>
          </span>
          <span style={{ fontFamily: BODY, fontSize: 12.5, color: "#71717A" }}>@johnjos458</span>
        </span>
        <span style={{ width: 38, height: 38, borderRadius: 19, background: "rgba(79,85,241,.1)", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Camera size={16} color={INDIGO} aria-hidden="true" />
        </span>
      </div>
      <div style={{ marginTop: 18, fontSize: 21, fontWeight: 600, letterSpacing: "-0.03em" }}>Requirement listing</div>
      <div style={{ marginTop: 10 }}>
        {items.map((it) => (
          <div key={it} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderTop: "1px solid #F4F4F5", fontSize: 14.5, fontWeight: 500 }}>
            <span style={{ width: 20, height: 20, borderRadius: 7, background: INDIGO, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#FFFFFF" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12l4 4 10-10" />
              </svg>
            </span>
            {it}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, height: 44, borderRadius: 22, background: INK, color: "#FFFFFF", display: "grid", placeItems: "center", fontSize: 15, fontWeight: 600 }}>KYC Verified</div>
    </DocPanel>
  );
}

function IntegrationsCard() {
  const tiles = [
    { I: Landmark, bg: INK, c: "#FFFFFF" },
    { I: FileText, bg: INDIGO, c: "#FFFFFF" },
    { I: ShieldCheck, bg: "rgba(139,143,247,.22)", c: INDIGO },
  ];
  return (
    <DocPanel style={{ width: "min(100%, 300px)", padding: "22px 22px 24px", boxShadow: "0 40px 100px rgba(0,0,0,.45)" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {tiles.map(({ I, bg, c }, i) => (
          <span key={i} style={{ width: 56, height: 56, borderRadius: 16, background: bg, display: "grid", placeItems: "center" }}>
            <I size={22} color={c} aria-hidden="true" />
          </span>
        ))}
      </div>
      <svg viewBox="0 0 256 56" width="100%" height="56" aria-hidden="true" style={{ display: "block" }}>
        <path d="M28 2 C 28 34, 128 22, 128 54 M128 2 L128 54 M228 2 C 228 34, 128 22, 128 54" fill="none" stroke={PERI} strokeWidth="2" strokeDasharray="3 6" strokeLinecap="round" />
      </svg>
      <div style={{ margin: "0 auto", width: 150, borderRadius: 14, border: "1px solid #E4E4E7", background: "#FAFAFA", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 5, padding: "8px 10px", borderBottom: "1px solid #E4E4E7" }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 7, height: 7, borderRadius: 4, background: "#D4D4D8" }} />
          ))}
        </div>
        <div style={{ display: "grid", placeItems: "center", padding: "16px 0 18px" }}>
          <Folder size={34} color={INDIGO} fill="rgba(79,85,241,.18)" aria-hidden="true" />
        </div>
      </div>
    </DocPanel>
  );
}

/**
 * Risk-based delivery block: numbered eyebrow, H2 with its gradient word, the
 * intro bullets and two detail cards (alternating light/dark) on the left; the
 * sample portal panels floating on the dark stage on the right.
 */
const RiskAuditSection = ({
  variant = "accounting",
  badgeText,
  heading,
  intro,
  introBullets,
  leftCards,
  backgroundImageSrc,
  rightOverlayCard,
  n,
  surface = "white",
}: RiskAuditSectionProps) => {
  const { t } = usePagesTranslation("accounting");
  const isAudit = variant === "audit";

  const effectiveBadge = badgeText || t(isAudit ? "badge_audit" : "badge_accounting");
  const effectiveHeading = heading || t(isAudit ? "heading_audit" : "heading_accounting");
  const effectiveIntro = intro || t(isAudit ? "intro_audit" : "intro_accounting");
  const effectiveIntroBullets = introBullets?.items ?? arr<string>(t(isAudit ? "intro_bullets_audit" : "intro_bullets_accounting", { returnObjects: true }));
  const effectiveLeftCards = leftCards ?? arr<DetailCard>(t(isAudit ? "left_cards_audit" : "left_cards_accounting", { returnObjects: true }));
  const effectiveRightOverlay: RightOverlayCardProps = rightOverlayCard ?? {
    header: t("right_overlay.header"),
    totalLabel: t("right_overlay.total_label"),
    totalValue: t("right_overlay.total_value"),
    sections: arr<RightOverlayCardProps["sections"][number]>(t("right_overlay.sections", { returnObjects: true })),
  };

  return (
    <Band surface={surface}>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-14 lg:gap-[72px] items-start">
        <div>
          <Eyebrow n={n}>{sentence(effectiveBadge)}</Eyebrow>
          <h2 data-fx="rise" data-d="100" style={{ margin: "16px 0 0", fontSize: "clamp(36px,4.4vw,68px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.03, textWrap: "balance" }}>
            {gradTail(effectiveHeading)}
          </h2>
          <p data-fx="rise" data-d="200" style={{ margin: "20px 0 0", maxWidth: 580, fontFamily: BODY, fontSize: 18, lineHeight: 1.55, color: "#52525B" }}>
            {effectiveIntro}
          </p>
          {effectiveIntroBullets.length ? (
            <div data-fx="rise" data-d="260" style={{ marginTop: 22 }}>
              <Bullets items={effectiveIntroBullets} size={16.5} />
            </div>
          ) : null}
          <p data-fx="rise" data-d="320" style={{ margin: "22px 0 0", maxWidth: 580, fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.35, color: "#3F3F46" }}>
            {t("footer_note")}
          </p>
        </div>

        <div data-fx="rise" data-d="150" data-dy="70" style={{ minWidth: 0 }}>
          <DarkStage
            minHeight={isAudit ? 600 : 520}
            style={
              backgroundImageSrc
                ? { background: `linear-gradient(rgba(9,9,11,.62), rgba(9,9,11,.62)), url("${backgroundImageSrc}") center / cover` }
                : undefined
            }
          >
            {isAudit ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                <RequirementCard />
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -14 }} className="max-sm:!mt-4">
                  <IntegrationsCard />
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 440 }}>
                <AccountCard data={effectiveRightOverlay} />
              </div>
            )}
          </DarkStage>
        </div>
      </div>

      {effectiveLeftCards.length ? (
        <div style={{ marginTop: "clamp(56px,7vw,88px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 16 }}>
          {effectiveLeftCards.map((c, index) => {
            const dark = index % 2 === 1;
            const k = card(dark, { padding: "clamp(26px,3vw,36px)", display: "flex", flexDirection: "column", gap: 14 });
            return (
              <div key={index} data-fx="rise" data-d={index * 80} className={k.className} style={k.style}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: dark ? "#A1A1AA" : "#52525B" }}>
                  <span style={{ color: dark ? PERI : INDIGO }}>{String(index + 1).padStart(2, "0")}</span>
                  <span>/ {String(effectiveLeftCards.length).padStart(2, "0")}</span>
                </div>
                <h3 style={{ margin: 0, fontFamily: SANS, fontSize: "clamp(26px,2.4vw,34px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.1 }}>{c.title}</h3>
                <p style={{ margin: 0, fontFamily: SANS, fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.35, color: dark ? "#E4E4E7" : "#3F3F46" }}>{c.subtitle}</p>
                <div style={{ paddingTop: 16, borderTop: `1px solid ${dark ? "rgba(255,255,255,.1)" : "#E4E4E7"}` }}>
                  <Bullets items={c.bullets} dark={dark} size={15.5} />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </Band>
  );
};

export default RiskAuditSection;
