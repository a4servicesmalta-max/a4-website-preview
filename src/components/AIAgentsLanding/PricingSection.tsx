"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import LocalizedLink from "@/components/common/LocalizedLink";

interface PricingSectionProps {
  namespace: "accounting" | "business";
}

const PricingSection = ({ namespace }: PricingSectionProps) => {
  const { t } = useTranslation(namespace);

  return (
    <section id="pricing" className="relative z-10 py-32 px-6 lg:px-16 text-center border-t border-zinc-200 bg-zinc-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-sora text-[clamp(36px,5vw,56px)] font-extrabold tracking-tight leading-[1.1] text-zinc-900 mb-4">
          {t("pricing.titleLine1")} <span className="text-zinc-500">{t("pricing.titleHighlight")}</span>
        </h2>
        <p className="text-base font-normal text-zinc-600 leading-relaxed mb-16 max-w-xl mx-auto">
          {t("pricing.sub")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left mb-16">
          
          {/* Standard Plan */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 lg:p-10 transition-all duration-300 hover:-translate-y-2 hover:border-zinc-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
            <div className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-6">
              {t("pricing.basic.name")}
            </div>
            <div className="font-sora text-5xl font-extrabold tracking-tight text-zinc-900 mb-1.5 flex items-baseline gap-2">
              {t("pricing.basic.price")} <span className="text-xl font-normal text-zinc-400">{namespace === 'accounting' ? '' : '/ audit'}</span>
            </div>
            <div className="text-[13px] text-zinc-500 mb-6 font-medium">
              {t("pricing.basic.sub")}
            </div>
            <p className="text-[13px] font-normal text-zinc-600 leading-relaxed mb-8 min-h-[40px]">
              {t("pricing.basic.desc")}
            </p>
            <div className="space-y-3.5 pt-6 border-t border-zinc-200">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-zinc-700">{t(`pricing.basic.c${i}`)}</span>
                </div>
              ))}
            </div>
            <LocalizedLink href="/quote" className="block w-full text-center mt-10 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 text-sm font-semibold py-3.5 rounded-xl transition-colors border border-zinc-200 hover:border-zinc-300 shadow-sm">
              Get Started
            </LocalizedLink>
          </div>

          {/* Premium Plan */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 lg:p-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative overflow-hidden">
            <div className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 mb-6">
              {t("pricing.pro.name")}
            </div>
            <div className="font-sora text-5xl font-extrabold tracking-tight text-white mb-1.5">
              {t("pricing.pro.price")}
            </div>
            <div className="text-[13px] text-zinc-400 mb-6 font-medium">
              {t("pricing.pro.sub")}
            </div>
            <p className="text-[13px] font-normal text-zinc-300 leading-relaxed mb-8 min-h-[40px]">
              {t("pricing.pro.desc")}
            </p>
            <div className="space-y-3.5 pt-6 border-t border-zinc-800">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-zinc-100">{t(`pricing.pro.c${i}`)}</span>
                </div>
              ))}
            </div>
            <LocalizedLink href="/quote" className="block w-full text-center mt-10 bg-white text-zinc-900 hover:bg-zinc-100 text-sm font-semibold py-3.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-sm">
              Contact Sales
            </LocalizedLink>
          </div>

        </div>

      </div>
    </section>
  );
};

export default PricingSection;
