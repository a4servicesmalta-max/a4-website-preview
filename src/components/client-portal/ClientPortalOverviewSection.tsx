"use client";

import React from "react";
import { Bell } from "lucide-react";
import { usePagesTranslation } from "@/hooks/usePagesTranslation";
import { Eyebrow } from "@/components/fx/primitives";
import {
  BODY,
  Band,
  Bullets,
  DARK_CARD,
  DocHead,
  DocPanel,
  INDIGO,
  INK,
  PERI,
  SANS,
  Statement,
  StatusPill,
  card,
  gradText,
  gradTail,
  kicker,
  splitPhrase,
  type Surface,
} from "@/components/services/SectionKit";

type OverviewVariant = "client" | "accounting" | "audit";

interface BulletedSection {
  title: string;
  intro?: string;
  bullets: string[];
  footer?: string;
}

interface ClientPortalOverviewSectionProps {
  variant?: OverviewVariant;
  /** Base route key for `pages`, e.g. `portal/client-portal` */
  i18nRouteKey: string;
  /** Accounting-only: use the “integrated delivery” preview mockup instead of the standard accounting card */
  integratedDeliveryVisual?: boolean;
  heading?: string;
  paragraphs?: string[];
  bulletedSections?: BulletedSection[];
  /** Kept for compatibility — bullets are the design's skewed indigo mark. */
  bulletIconSrc?: string;
  /** Section surface (light glow by default). */
  surface?: Surface;
  /** Section number for the eyebrow ("01"). */
  n?: string;
}

const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

/* ── demo panels (sample data from the i18n `demo` keys) ─────────────────── */

function ClientDemo({ t }: { t: (k: string, o?: Record<string, unknown>) => string }) {
  const stats = [
    { label: t("demo.client.statOverdue"), value: "4", strong: true },
    { label: t("demo.client.statDueSoon"), value: "0" },
    { label: t("demo.client.statWaiting"), value: "2" },
    { label: t("demo.client.statDueSoon"), value: "0" },
  ];
  return (
    <DocPanel>
      <div style={{ margin: 10, borderRadius: 20, padding: "22px 22px 20px", background: DARK_CARD, color: "#FFFFFF" }}>
        <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.25 }}>{t("demo.client.heroTitle")}</div>
        <div style={{ marginTop: 6, fontFamily: BODY, fontSize: 13.5, color: "#A1A1AA" }}>{t("demo.client.heroSubtitle")}</div>
        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
          <StatusPill tone="line" dark>
            {t("demo.client.tagCompany")}
          </StatusPill>
          <StatusPill tone="line" dark>
            {t("demo.client.tagAcme")}
          </StatusPill>
          <StatusPill tone="indigo" dark>
            {t("demo.client.tagNeedsAttention")}
          </StatusPill>
          <StatusPill tone="ink" dark>
            {t("demo.client.tagRiskHigh")}
          </StatusPill>
        </div>
      </div>
      <div style={{ padding: "8px 24px 4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0" }}>
          <Bell size={15} color="#71717A" aria-hidden="true" />
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em" }}>{t("demo.client.noticeTitle")}</span>
        </div>
        <div style={{ borderTop: "1px solid #E4E4E7", padding: "16px 0 18px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            <StatusPill tone="ink" style={{ height: 24, fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".06em" }}>
              {t("demo.client.urgentLabel")}
            </StatusPill>
            <span style={{ fontFamily: BODY, fontSize: 12.5, color: "#71717A" }}>{t("demo.client.urgentMeta")}</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>{t("demo.client.urgentTitle")}</div>
          <div style={{ marginTop: 4, fontFamily: BODY, fontSize: 13.5, color: "#52525B" }}>{t("demo.client.urgentBody")}</div>
          <div style={{ marginTop: 8, fontFamily: BODY, fontSize: 12.5, color: "#71717A" }}>
            {t("demo.client.releaseDateLabel")} <span style={{ color: INK, fontWeight: 600 }}>{t("demo.client.releaseDate")}</span>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", borderTop: "1px solid #E4E4E7", background: "#FAFAFA" }} className="max-sm:!grid-cols-2">
        {stats.map((s, i) => (
          <div key={i} style={{ padding: "16px 18px 18px", borderLeft: i % 4 ? "1px solid #E4E4E7" : "none" }}>
            <div style={{ ...kicker, fontSize: 10.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</div>
            <div style={{ marginTop: 6, fontSize: 30, fontWeight: 600, letterSpacing: "-0.04em", ...(s.strong ? gradText : null) }}>{s.value}</div>
          </div>
        ))}
      </div>
    </DocPanel>
  );
}

function AccountingDemo({ t, title }: { t: (k: string, o?: Record<string, unknown>) => string; title: string }) {
  const requestRows = arr<{ label: string; date: string }>(t("demo.accounting.requestRows", { returnObjects: true }));
  const vatPeriods = arr<string>(t("demo.accounting.vatPeriods", { returnObjects: true }));
  const missingItems = arr<string>(t("demo.accounting.missingItems", { returnObjects: true }));
  const block = (label: string, rows: React.ReactNode[]) => (
    <div style={{ padding: "0 24px" }}>
      <div style={{ ...kicker, padding: "18px 0 8px" }}>{label}</div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "11px 0", borderTop: "1px solid #E4E4E7", minWidth: 0 }}>
          {r}
        </div>
      ))}
    </div>
  );
  return (
    <DocPanel>
      <DocHead title={title} />
      {block(
        t("demo.accounting.requestsTitle"),
        requestRows.map((row, i) => (
          <React.Fragment key={i}>
            <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: INDIGO, flexShrink: 0 }} />
              <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span style={{ fontSize: 14.5, fontWeight: 600 }}>{row.label}</span>
                <span style={{ fontFamily: BODY, fontSize: 12, color: "#71717A" }}>{row.date}</span>
              </span>
            </span>
            <StatusPill tone="ink">{t("demo.accounting.open")}</StatusPill>
          </React.Fragment>
        ))
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {block(
          t("demo.accounting.vatTitle"),
          vatPeriods.map((period, i) => (
            <React.Fragment key={i}>
              <span style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 14.5, fontWeight: 600 }}>{period}</span>
                <span style={{ fontFamily: BODY, fontSize: 12, color: "#71717A" }}>{t("demo.accounting.status")}</span>
              </span>
              <StatusPill tone="line">{t("demo.accounting.view")}</StatusPill>
            </React.Fragment>
          ))
        )}
        {block(
          t("demo.accounting.missingTitle"),
          missingItems.map((item, i) => (
            <React.Fragment key={i}>
              <span style={{ fontSize: 14, fontWeight: 500, minWidth: 0 }}>{item}</span>
              <StatusPill tone="indigo">{t("demo.accounting.upload")}</StatusPill>
            </React.Fragment>
          ))
        )}
      </div>
      <div style={{ height: 20 }} />
    </DocPanel>
  );
}

function AuditDemo({ t, title }: { t: (k: string, o?: Record<string, unknown>) => string; title: string }) {
  const pbcRows = arr<string>(t("demo.audit.pbcRows", { returnObjects: true }));
  const tbRows = arr<{ label: string; v1: string; v2: string; v3: string }>(t("demo.audit.tbRows", { returnObjects: true }));
  const cols = "minmax(0,1.5fr) repeat(3, minmax(0,1fr))";
  return (
    <DocPanel>
      <DocHead title={title} />
      <div style={{ padding: "0 24px" }}>
        <div style={{ ...kicker, padding: "18px 0 8px" }}>{t("demo.audit.pbcTitle")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,.9fr) auto", gap: 12, padding: "0 0 8px", ...kicker, fontSize: 10.5 }}>
          <span>{t("demo.audit.colItem")}</span>
          <span>{t("demo.audit.colStatus")}</span>
          <span style={{ textAlign: "right" }}>{t("demo.audit.colAction")}</span>
        </div>
        {pbcRows.map((label, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,.9fr) auto", gap: 12, alignItems: "center", padding: "10px 0", borderTop: "1px solid #E4E4E7" }}>
            <span style={{ fontSize: 14.5, fontWeight: 600 }}>{label}</span>
            <span style={{ fontFamily: BODY, fontSize: 12.5, fontWeight: 600, color: INK }}>{t("demo.audit.statusMissing")}</span>
            <StatusPill tone="indigo" style={{ height: 26 }}>
              {t("demo.audit.upload")}
            </StatusPill>
          </div>
        ))}
      </div>
      <div style={{ margin: "20px 0 0", padding: "4px 24px 22px", borderTop: "1px solid #E4E4E7", background: "#FAFAFA" }}>
        <div style={{ ...kicker, padding: "16px 0 8px" }}>{t("demo.audit.extendTbTitle")}</div>
        {/* Kicker caps on wide screens; plain case on phones so "Adjustments" fits its column. */}
        <div
          className="uppercase tracking-[.1em] max-sm:normal-case max-sm:tracking-normal max-sm:text-[11px]"
          style={{ display: "grid", gridTemplateColumns: cols, gap: 10, padding: "0 0 8px", fontFamily: BODY, fontSize: 10.5, fontWeight: 600, lineHeight: 1.3, color: "#71717A" }}
        >
          <span>{t("demo.audit.tbColAccount")}</span>
          <span style={{ textAlign: "right" }}>{t("demo.audit.tbColTrial")}</span>
          <span style={{ textAlign: "right" }}>{t("demo.audit.tbColAdj")}</span>
          <span style={{ textAlign: "right" }}>{t("demo.audit.tbColExtended")}</span>
        </div>
        {tbRows.map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: cols, gap: 10, padding: "9px 0", borderTop: "1px solid #E4E4E7", fontSize: 13.5, fontVariantNumeric: "tabular-nums" }}>
            <span style={{ fontWeight: 600 }}>{row.label}</span>
            <span style={{ textAlign: "right" }}>{row.v1}</span>
            <span style={{ textAlign: "right", color: "#71717A" }}>{row.v2}</span>
            <span style={{ textAlign: "right", fontWeight: 600 }}>{row.v3}</span>
          </div>
        ))}
      </div>
    </DocPanel>
  );
}

function IntegratedDemo({ t, title }: { t: (k: string, o?: Record<string, unknown>) => string; title: string }) {
  const preparedRows = arr<{ label: string; date: string; active?: boolean }>(t("demo.integrated.preparedRows", { returnObjects: true }));
  const bars = [20, 26, 32, 38, 20, 26, 32, 38, 26, 32];
  return (
    <DocPanel>
      <DocHead title={title} />
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]" style={{ gap: 0, marginTop: 14, borderTop: "1px solid #E4E4E7" }}>
        <div style={{ padding: "6px 24px 20px" }}>
          <div style={{ ...kicker, padding: "14px 0 8px" }}>{t("demo.integrated.preparedListTitle")}</div>
          {preparedRows.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid #E4E4E7" }}>
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 7,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  background: item.active ? INDIGO : "transparent",
                  border: `1.5px solid ${item.active ? INDIGO : "#D4D4D8"}`,
                }}
              >
                {item.active ? (
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#FFFFFF" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12l4 4 10-10" />
                  </svg>
                ) : null}
              </span>
              <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span style={{ fontSize: 14.5, fontWeight: 600 }}>{item.label}</span>
                <span style={{ fontFamily: BODY, fontSize: 12, color: "#71717A" }}>{item.date}</span>
              </span>
            </div>
          ))}
        </div>
        <div style={{ padding: "6px 24px 20px", borderLeft: "1px solid #E4E4E7", display: "flex", flexDirection: "column", gap: 14 }} className="max-sm:!border-l-0 max-sm:border-t max-sm:border-[#E4E4E7]">
          <div>
            <div style={{ ...kicker, padding: "14px 0 6px" }}>{t("demo.integrated.spendWeek")}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.04em" }}>$540</span>
              <span style={{ fontFamily: BODY, fontSize: 12.5, fontWeight: 600, color: "#52525B" }}>↓ 2.5%</span>
            </div>
            <div aria-hidden="true" style={{ marginTop: 10, height: 44, display: "flex", alignItems: "flex-end", gap: 4 }}>
              {bars.map((h, i) => (
                <span key={i} style={{ flex: 1, height: h, borderRadius: 3, background: i === 7 ? INDIGO : "rgba(79,85,241,.22)" }} />
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid #E4E4E7", paddingTop: 12 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>{t("demo.integrated.partnershipTitle")}</div>
            <div style={{ fontFamily: BODY, fontSize: 12, color: "#71717A" }}>{t("demo.integrated.partnershipSubtitle")}</div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 16 }}>
              <svg viewBox="0 0 42 42" width="72" height="72" aria-hidden="true" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="#F4F4F5" strokeWidth="6" />
                <circle cx="21" cy="21" r="15.9" fill="none" stroke={INDIGO} strokeWidth="6" strokeDasharray="72 28" />
                <circle cx="21" cy="21" r="15.9" fill="none" stroke={PERI} strokeWidth="6" strokeDasharray="18 82" strokeDashoffset="-72" />
                <circle cx="21" cy="21" r="15.9" fill="none" stroke={INK} strokeWidth="6" strokeDasharray="10 90" strokeDashoffset="-90" />
              </svg>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: BODY, fontSize: 12.5, color: "#52525B" }}>
                {[
                  { c: INDIGO, v: "89.7" },
                  { c: PERI, v: "23" },
                  { c: INK, v: "12" },
                ].map((l) => (
                  <span key={l.v} style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 4, background: l.c }} /> {l.v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DocPanel>
  );
}

/* ── section ─────────────────────────────────────────────────────────────── */

/**
 * Portal overview in the A4 design language. With `heading` + `paragraphs`:
 * a statement (short headings) or an H2 with its gradient word, the lead and
 * body copy, and the sample portal panel for the variant. With
 * `bulletedSections`: the sections as numbered blocks beside the integrated
 * delivery panel, or as alternating light/dark cards.
 */
const ClientPortalOverviewSection = ({
  variant = "client",
  i18nRouteKey,
  integratedDeliveryVisual = false,
  heading,
  paragraphs,
  bulletedSections,
  surface = "light",
  n,
}: ClientPortalOverviewSectionProps) => {
  const { t } = usePagesTranslation(i18nRouteKey);
  const title = t("pageHeader.title");

  const demo =
    variant === "audit" ? (
      <AuditDemo t={t} title={title} />
    ) : variant === "accounting" && integratedDeliveryVisual ? (
      <IntegratedDemo t={t} title={title} />
    ) : variant === "accounting" ? (
      <AccountingDemo t={t} title={title} />
    ) : (
      <ClientDemo t={t} />
    );

  if (bulletedSections) {
    const withVisual = variant === "accounting" && integratedDeliveryVisual;
    if (!withVisual) {
      return (
        <Band surface={surface}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: 16 }}>
            {bulletedSections.map((section, i) => {
              const dark = i % 2 === 1;
              const c = card(dark, { padding: "clamp(28px,3vw,40px)", display: "flex", flexDirection: "column", gap: 18 });
              return (
                <div key={i} data-fx="rise" data-d={i * 80} className={c.className} style={c.style}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: dark ? "#A1A1AA" : "#52525B" }}>
                    <span style={{ color: dark ? PERI : INDIGO }}>{String(i + 1).padStart(2, "0")}</span>
                    <span>/ {String(bulletedSections.length).padStart(2, "0")}</span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: "clamp(28px,2.6vw,40px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.08 }}>{section.title}</h3>
                  {section.intro ? <p style={{ margin: 0, fontFamily: BODY, fontSize: 16.5, lineHeight: 1.55, color: dark ? "#A1A1AA" : "#52525B" }}>{section.intro}</p> : null}
                  {section.bullets.length ? <Bullets items={section.bullets} dark={dark} /> : null}
                  {section.footer ? (
                    <p style={{ margin: "auto 0 0", paddingTop: 18, borderTop: `1px solid ${dark ? "rgba(255,255,255,.1)" : "#E4E4E7"}`, fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.35, color: dark ? "#E4E4E7" : "#3F3F46" }}>
                      {section.footer}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Band>
      );
    }
    return (
      <Band surface={surface}>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-14 lg:gap-[72px] items-center">
          <div style={{ display: "flex", flexDirection: "column" }}>
            {bulletedSections.map((section, i) => (
              <div key={i} data-fx="rise" data-d={i * 100} style={{ padding: "32px 0", borderTop: i ? "1px solid #E4E4E7" : "none" }}>
                <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: ".02em", color: INDIGO }}>{String(i + 1).padStart(2, "0")}</div>
                <h3 style={{ margin: "8px 0 0", fontSize: "clamp(28px,2.8vw,42px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.06 }}>{i === 0 ? gradTail(section.title) : section.title}</h3>
                {section.intro ? <p style={{ margin: "14px 0 0", fontFamily: BODY, fontSize: 17, lineHeight: 1.55, color: "#52525B" }}>{section.intro}</p> : null}
                {section.bullets.length ? (
                  <div style={{ marginTop: 16 }}>
                    <Bullets items={section.bullets} />
                  </div>
                ) : null}
                {section.footer ? <p style={{ margin: "16px 0 0", fontSize: 19, fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.35, color: "#3F3F46" }}>{section.footer}</p> : null}
              </div>
            ))}
          </div>
          <div data-fx="rise" data-d="150" data-dy="70" style={{ minWidth: 0 }}>
            {demo}
          </div>
        </div>
      </Band>
    );
  }

  const short = !!heading && heading.length <= 34;
  const [first, second] = heading ? splitPhrase(heading) : ["", ""];
  const paras = paragraphs ?? [];

  return (
    <Band surface={surface}>
      {heading && short ? <Statement first={first} second={second} as="h2" /> : null}
      <div
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-14 lg:gap-[72px] items-center"
        style={{ marginTop: heading && short ? "clamp(64px,8vw,112px)" : 0 }}
      >
        <div>
          {heading && !short ? (
            <>
              {n ? <Eyebrow n={n}>{title}</Eyebrow> : null}
              <h2 data-fx="rise" data-d="100" style={{ margin: n ? "16px 0 0" : 0, fontSize: "clamp(36px,4.2vw,64px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.04, textWrap: "balance" }}>
                {gradTail(heading)}
              </h2>
            </>
          ) : null}
          {paras.length ? (
            <div data-fx="rise" data-d="200" style={{ marginTop: heading && !short ? 28 : 0, display: "flex", flexDirection: "column", gap: 16 }}>
              {paras.map((text, idx) =>
                idx === 0 ? (
                  <p key={idx} style={{ margin: 0, fontFamily: SANS, fontSize: "clamp(21px,2vw,28px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.35, color: INK, whiteSpace: "pre-line", textWrap: "pretty" }}>
                    {text}
                  </p>
                ) : (
                  <p key={idx} style={{ margin: 0, fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: "#52525B", whiteSpace: "pre-line", textWrap: "pretty" }}>
                    {text}
                  </p>
                )
              )}
            </div>
          ) : null}
        </div>
        <div data-fx="rise" data-d="150" data-dy="70" style={{ minWidth: 0 }}>
          {demo}
        </div>
      </div>
    </Band>
  );
};

export default ClientPortalOverviewSection;
