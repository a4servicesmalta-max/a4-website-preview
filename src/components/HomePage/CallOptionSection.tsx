"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import LocalizedLink from "@/components/common/LocalizedLink";
import { SUPPORT_RESPONSE_LABEL } from "@/lib/site-config";
import { ArrowRight, PhoneCall } from "lucide-react";

const CallOptionSection = ({ isDark = true }: { isDark?: boolean }) => {
  const { t } = useTranslation("home");

  return (
    <section className={cn(
      "relative py-24 sm:py-32 overflow-hidden mb-12 sm:mb-20",
      isDark && "mx-4 sm:mx-6 lg:mx-8",
      isDark ? "bg-[#09090B] text-white rounded-[48px] border border-white/5" : "bg-white text-slate-900 rounded-[48px] border border-slate-100 shadow-xl"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 sm:gap-20">

          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-700",
                isDark ? "bg-primary-blue/20 text-primary-blue shadow-[0_0_20px_rgba(37,99,235,0.2)]" : "bg-zinc-100 text-zinc-600"
              )}>
                <PhoneCall className="w-6 h-6" />
              </div>
              <span className={cn("text-xs font-black uppercase tracking-[0.4em]", isDark ? "text-slate-500" : "text-slate-400")}>Expert Access</span>
            </div>

            <h3 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              {t("callOption.title")}
            </h3>
            <p className={cn(
              "text-lg sm:text-xl font-medium leading-relaxed max-w-2xl",
              isDark ? "text-slate-400" : "text-slate-600"
            )}>
              {t("callOption.body")}
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <LocalizedLink
              href="/contact"
              className={cn(
                "group relative flex items-center justify-center gap-4 rounded-full px-12 py-5 text-[15px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 overflow-hidden",
                isDark ? "bg-white text-slate-900 shadow-2xl" : "bg-slate-900 text-white shadow-2xl shadow-slate-900/20"
              )}
            >
              <span>{t("callOption.cta")}</span>
              <div className="w-8 h-8 rounded-full bg-zinc-500/10 flex items-center justify-center transition-transform group-hover:rotate-12">
                <ArrowRight className="w-4 h-4" />
              </div>
            </LocalizedLink>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">{SUPPORT_RESPONSE_LABEL}</p>
          </div>

        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-64 h-full bg-gradient-to-r from-primary-blue/5 to-transparent pointer-events-none" />
    </section>
  );
};

export default CallOptionSection;
