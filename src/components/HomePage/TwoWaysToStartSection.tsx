"use client";

import React, { useMemo } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import GetInstantQuoteButton from "@/components/common/GetInstantQuoteButton";
import { useTranslation } from "react-i18next";
import { SectionTitleHero } from "@/components/HomePage/SectionTitleHero";
import { lazyImgProps } from "@/lib/lazy-media-props";
import { useLazyMedia } from "@/hooks/use-lazy-media";
import { cn } from "@/lib/utils";
import { CLIENT_ONBOARDING_URL } from "@/lib/external-links";

const VIDEO_SRC = "/assets/videos/Invite%20Advisor%20V1.2.gif";

const TwoWaysToStartSection = ({ isDark = true }: { isDark?: boolean }) => {
  const { t } = useTranslation("home");
  const { ref: lazyRef, shouldLoad } = useLazyMedia();
  const bullets = useMemo(
    () => (t("twoWaysToStart.spotlightBullets", { returnObjects: true }) as string[]) ?? [],
    [t]
  );

  return (
    <section
      className={cn(
        "relative py-24 sm:py-32 overflow-hidden mb-12 sm:mb-20",
        isDark && "mx-4 sm:mx-6 lg:mx-8",
        isDark
          ? "rounded-[48px] bg-[#05050A] text-white shadow-2xl"
          : "rounded-[48px] border border-slate-100 bg-[#FAFBFF] text-slate-900 shadow-xl shadow-zinc-500/5"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -left-20 top-1/4 h-[420px] w-[420px] rounded-full blur-[100px]",
          isDark ? "bg-zinc-600/15" : "bg-zinc-400/20"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-10 bottom-0 h-[360px] w-[360px] rounded-full blur-[90px]",
          isDark ? "bg-zinc-600/10" : "bg-zinc-400/15"
        )}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Left: section framing only */}
          <div className="space-y-6 lg:col-span-5">
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-1.5",
                isDark ? "border-white/10 bg-white/5" : "border-zinc-100 bg-zinc-50"
              )}
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-500" />
              <span
                className={cn(
                  "text-[11px] font-black uppercase tracking-widest text-zinc-500"
                )}
              >
                {t("twoWaysToStart.badge")}
              </span>
            </div>
            <SectionTitleHero
              variant={isDark ? "dark" : "light"}
              className="items-start text-left"
              line1={t("twoWaysToStart.titleLine1")}
              highlight={t("twoWaysToStart.titleHighlight")}
            />
            <p
              className={cn(
                "max-w-md text-lg font-medium leading-relaxed",
                isDark ? "text-slate-400" : "text-slate-600"
              )}
            >
              {t("twoWaysToStart.subtitle")}
            </p>
          </div>

          {/* Right: card + video + content — unique spotlight UI */}
          <div className="relative lg:col-span-7">
            <div
              className={cn(
                "absolute -inset-3 rounded-[2.25rem] opacity-70 blur-2xl",
                "bg-gradient-to-br from-zinc-500/30 via-zinc-600/20 to-zinc-500/25"
              )}
            />
            <div
              className={cn(
                "relative overflow-hidden rounded-[2rem] border shadow-2xl",
                isDark
                  ? "border-white/10 bg-[#070814] shadow-black/40"
                  : "border-slate-200/80 bg-white shadow-zinc-500/10"
              )}
            >
              {/* Top meta row */}
              <div
                className={cn(
                  "flex items-center justify-between gap-4 border-b px-6 py-4 sm:px-8",
                  isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-100 bg-slate-50/80"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl border",
                      isDark
                        ? "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
                        : "border-zinc-200 bg-zinc-500/10 text-zinc-600"
                    )}
                  >
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p
                    className={cn(
                      "text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500"
                    )}
                  >
                    {t("twoWaysToStart.spotlightBadge")}
                  </p>
                </div>
              </div>

              <div className="relative p-5 sm:p-8">
                {/* Decorative grid */}
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 opacity-[0.35]",
                    "[background-image:radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.25)_1px,transparent_0)] [background-size:22px_22px]",
                    isDark && "opacity-25"
                  )}
                />

                <div ref={lazyRef} className="relative z-10">
                  <div
                    className={cn(
                      "overflow-hidden rounded-2xl border shadow-inner",
                      isDark ? "border-white/10 bg-[#0c1020]" : "border-slate-200 bg-white"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-9 items-center gap-2 border-b px-4",
                        isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-100 bg-slate-50"
                      )}
                    >
                      <div className="flex gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#ff5f56]" />
                        <span className="h-2 w-2 rounded-full bg-[#ffbd2e]" />
                        <span className="h-2 w-2 rounded-full bg-[#27c93f]" />
                      </div>
                      <span
                        className={cn(
                          "ml-2 text-[10px] font-medium",
                          isDark ? "text-slate-500" : "text-slate-400"
                        )}
                      >
                        client.A4.com
                      </span>
                    </div>
                    <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                      {shouldLoad ? (
                        <img
                          src={VIDEO_SRC}
                          alt={t("twoWaysToStart.videoAlt")}
                          className="h-full w-full object-cover object-top"
                          {...lazyImgProps}
                        />
                      ) : (
                        <div className="flex h-full w-full animate-pulse items-center justify-center bg-slate-900/50">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                            …
                          </span>
                        </div>
                      )}
                      <div
                        className={cn(
                          "pointer-events-none absolute inset-0 bg-gradient-to-t",
                          isDark ? "from-[#070814] via-transparent to-transparent" : "from-[#FAFBFF]/90 via-transparent to-transparent"
                        )}
                      />
                    </div>
                  </div>

                  <div className="relative z-10 mt-8 space-y-5">
                    <h3
                      className={cn(
                        "text-2xl font-black tracking-tight sm:text-3xl",
                        isDark ? "text-white" : "text-slate-900"
                      )}
                    >
                      {t("twoWaysToStart.spotlightTitle")}
                    </h3>
                    <p
                      className={cn(
                        "text-base font-medium leading-relaxed sm:text-lg",
                        isDark ? "text-slate-400" : "text-slate-600"
                      )}
                    >
                      {t("twoWaysToStart.spotlightBody")}
                    </p>

                    <ul className="grid gap-3 sm:grid-cols-1">
                      {bullets.map((line, i) => (
                        <li
                          key={i}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold",
                            isDark
                              ? "border-white/10 bg-white/[0.04] text-slate-200"
                              : "border-slate-200 bg-slate-50 text-slate-800"
                          )}
                        >
                          <CheckCircle2
                            className={cn(
                              "h-4 w-4 shrink-0",
                              isDark ? "text-emerald-400" : "text-emerald-600"
                            )}
                          />
                          {line}
                        </li>
                      ))}
                    </ul>

                    <GetInstantQuoteButton
                      text={t("twoWaysToStart.cta")}
                      href={CLIENT_ONBOARDING_URL}
                      className={cn(
                        "h-14 w-full rounded-2xl text-base font-bold sm:w-auto sm:px-10",
                        !isDark && "shadow-lg shadow-zinc-500/15"
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TwoWaysToStartSection;
