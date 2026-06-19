import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Building2, Rocket, Sparkles } from "lucide-react";
import { usePerformance } from "@/contexts/ReduceMotionContext";
import { cn } from "@/lib/utils";
import { CLIENT_ONBOARDING_URL } from "@/lib/external-links";

import GetInstantQuoteButton from "../common/GetInstantQuoteButton";
import { SectionTitleHero } from "@/components/HomePage/SectionTitleHero";

/** Pre-redesign workspace section (always dark glass UI). `isDark` kept for call-site compatibility. */
const WorkspaceEntrySection = ({ isDark: _isDark = true }: { isDark?: boolean }) => {
  const { t } = useTranslation("home");
  const { reduceMotion } = usePerformance();
  const sectionRef = useRef<HTMLElement | null>(null);

  const card1Bullets = useMemo(
    () => (t("workspaceEntry.card1Bullets", { returnObjects: true }) as string[]) ?? [],
    [t]
  );

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden rounded-[48px] bg-black py-16 lg:py-24"
    >
      {/* Premium Background Elements */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden text-zinc-500/20">
        <div className="absolute left-[10%] top-[-10%] h-[40%] w-[40%] animate-pulse rounded-full bg-zinc-600/10 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[0%] h-[35%] w-[35%] rounded-full bg-zinc-600/10 blur-[100px]" />

        <svg className="absolute right-10 top-20 h-64 w-64 opacity-10" viewBox="0 0 200 200" fill="none" aria-hidden>
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M100 20V180M20 100H180" stroke="currentColor" strokeWidth="0.5" />
        </svg>

        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(t("workspaceEntry.sectionTitleLine1").trim() || t("workspaceEntry.sectionTitleHighlight").trim()) && (
          <div className="mb-14 max-w-4xl lg:mb-16">
            <SectionTitleHero
              variant="dark"
              line1={t("workspaceEntry.sectionTitleLine1")}
              highlight={t("workspaceEntry.sectionTitleHighlight")}
            />
            {t("workspaceEntry.sectionBody").trim() ? (
              <p className="mt-6 whitespace-pre-line text-[15px] font-medium leading-relaxed text-slate-400 sm:text-base">
                {t("workspaceEntry.sectionBody")}
              </p>
            ) : null}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Card 1: Existing Company (Dark Glassmorphic) */}
          <div className="group relative h-full">
            <div
              className={cn(
                "relative h-full overflow-hidden rounded-[40px] border border-white/10 bg-zinc-900/80 p-8 backdrop-blur-2xl transition-all duration-700 sm:p-10 lg:p-12",
                !reduceMotion &&
                "hover:-translate-y-2 hover:border-zinc-500/30 hover:bg-zinc-800 hover:shadow-lg"
              )}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-zinc-600/[0.03] to-transparent" />
              <div className="absolute left-0 top-0 h-full w-1.5 bg-zinc-600/20 transition-colors duration-700 group-hover:bg-zinc-600/60" />

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-6 flex items-center gap-4">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-600 text-white shadow-lg shadow-zinc-500/20 transition-all duration-700 group-hover:rotate-3 group-hover:scale-110 group-hover:shadow-zinc-500/40">
                    <Building2 className="relative z-10 h-7 w-7" />
                    <div className="absolute inset-0 rounded-2xl bg-zinc-400 opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-40" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400/80 transition-colors duration-500 group-hover:text-zinc-400">
                      {t("workspaceEntry.activeEntities")}
                    </span>
                  </div>
                </div>

                <h3 className="mb-6 text-2xl font-extrabold leading-[1.2] text-white sm:text-4xl">
                  {t("workspaceEntry.card1TitleBefore")}
                  <span className="relative inline-block text-zinc-400">
                    {t("workspaceEntry.card1TitleAccent")}
                    <svg className="absolute -bottom-1.5 left-0 w-full" viewBox="0 0 200 8" fill="none" aria-hidden>
                      <path d="M1 7C50 2 150 2 199 7" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                </h3>

                <p className="mb-4 max-w-md whitespace-pre-line text-[15px] font-medium leading-relaxed text-zinc-300">
                  {t("workspaceEntry.card1Body")}
                </p>
                {t("workspaceEntry.card1CoordinationNote").trim() ? (
                  <p className="mb-6 max-w-md border-l-2 border-zinc-500/30 pl-4 text-[14px] font-medium leading-relaxed text-zinc-400">
                    {t("workspaceEntry.card1CoordinationNote")}
                  </p>
                ) : null}

                {card1Bullets.length > 0 ? (
                  <div className="mb-auto space-y-3">
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      {t("workspaceEntry.whatYouCanDo")}
                    </h4>
                    {card1Bullets.map((text, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 text-sm font-bold text-zinc-300 transition-colors duration-500 group-hover:text-white"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-zinc-500/40 shadow-[0_0_8px_rgba(255,255,255,0)] transition-all duration-500 group-hover:bg-zinc-400 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.3)]" />
                        {text}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-auto" />
                )}

                <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
                  <GetInstantQuoteButton
                    text={t("workspaceEntry.createWorkspaceCta")}
                    href={CLIENT_ONBOARDING_URL}
                    className="h-[52px] px-8 text-sm"
                  />

                  <div className="flex items-center gap-2.5 rounded-full border border-zinc-500/30 bg-zinc-900/40 px-4 py-1.5">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse text-zinc-400" />
                    <span className="text-[11px] font-bold text-zinc-300">{t("workspaceEntry.oneClickSync")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: New Company (Deep Dark) */}
          <div className="group relative">
            <div
              className={cn(
                "relative h-full overflow-hidden rounded-[40px] border border-white/10 bg-zinc-950 p-8 transition-all duration-700 sm:p-10 lg:p-12",
                !reduceMotion &&
                "hover:-translate-y-2 hover:border-zinc-500/40 hover:bg-zinc-900 hover:shadow-lg"
              )}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/carbon-fibre.png')` }}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-zinc-600/[0.03] to-transparent" />
              <div className="animate-pulse-subtle absolute -right-32 -top-32 h-96 w-96 rounded-full bg-zinc-600/10 blur-[120px] mix-blend-screen" />

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-6 flex items-center gap-4">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-400 shadow-inner backdrop-blur-md transition-all duration-700 group-hover:-rotate-3 group-hover:scale-110 group-hover:border-zinc-400/30 group-hover:shadow-zinc-400/20">
                    <Rocket className="relative z-10 h-7 w-7" />
                    <div className="absolute inset-0 rounded-2xl bg-zinc-600/20 opacity-0 blur-xl transition-opacity duration-700 group-hover:opacity-100" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-100/50 transition-colors duration-500 group-hover:text-zinc-400">
                      {t("workspaceEntry.newFounders")}
                    </span>
                  </div>
                </div>

                <h3 className="mb-6 text-2xl font-extrabold leading-[1.2] text-white sm:text-4xl">
                  {t("workspaceEntry.card2Title")}
                  <span className="relative inline-block text-zinc-400">
                    {t("workspaceEntry.card2TitleAccent")}
                    <svg className="absolute -bottom-1.5 left-0 w-full" viewBox="0 0 200 8" fill="none" aria-hidden>
                      <path d="M1 7C50 2 150 2 199 7" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                </h3>

                <p className="mb-auto max-w-md text-base font-medium leading-relaxed text-zinc-300">
                  {t("workspaceEntry.card2Body")}
                </p>

                {t("workspaceEntry.builderBadge").trim() || t("workspaceEntry.builderDescription").trim() ? (
                  <div className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="h-4 w-4 text-zinc-400" />
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-300/80">
                        {t("workspaceEntry.builderBadge")}
                      </span>
                    </div>
                    {t("workspaceEntry.builderDescription").trim() ? (
                      <p className="mt-3 text-[14px] font-medium leading-relaxed text-zinc-300">
                        {t("workspaceEntry.builderDescription")}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <GetInstantQuoteButton
                    text={t("workspaceEntry.startIncorporationCta")}
                    href={CLIENT_ONBOARDING_URL}
                    className="h-[52px] border-none bg-white px-8 text-sm text-slate-900 shadow-white/5 hover:bg-slate-50"
                    hasShadow={false}
                  />
                  <LocalizedLink
                    href="/contact"
                    className="flex h-[52px] items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10"
                  >
                    {t("workspaceEntry.bookConsultationCta")}
                  </LocalizedLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 z-20 h-24 w-full bg-gradient-to-t from-black to-transparent opacity-80" />
    </section>
  );
};

export default WorkspaceEntrySection;
