"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { CONTACT_PHONES } from "@/lib/contact";
import { cn } from "@/lib/utils";
import { usePerformance } from "@/contexts/ReduceMotionContext";

const FaqSection = () => {
  const { t } = useTranslation("home");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { reduceMotion } = usePerformance();

  const faqItems = useMemo(() => {
    return (t("faqSection.items", { returnObjects: true }) as any[]) ?? [];
  }, [t]);

  return (
    <section id="faq" className="relative w-full py-24 lg:py-32 bg-background overflow-hidden flex items-center min-h-[90vh] lg:min-h-[100vh] rounded-t-[48px] z-20">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[50%] h-[50%] bg-zinc-50 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[50%] h-[50%] bg-zinc-50 rounded-full blur-[160px]" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay">
          <Image src="/assets/images/Noise.png" alt="Noise" fill className="object-cover" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left: Content & Accordion */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-6">
                {t("faqSection.badge")}
              </span>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                {t("faqSection.title")} <br />
                <span className="text-zinc-600">
                    {t("faqSection.titleHighlight")}
                </span>
              </h2>
              <p className="text-base text-slate-500 font-medium mb-10 max-w-sm leading-relaxed">
                {t("faqSection.subtitle")}
              </p>
            </div>

            <div className="space-y-3">
              {faqItems.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={index}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className={cn(
                      "group cursor-pointer rounded-2xl p-5 lg:p-6 transition-all duration-300 border relative overflow-hidden",
                      isOpen 
                        ? "bg-white border-zinc-200 shadow-2xl" 
                        : "bg-white/50 border-slate-200/50 hover:border-zinc-200 hover:bg-white"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-[17px] font-bold transition-colors duration-300",
                        isOpen ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700"
                      )}>
                        {item.title}
                      </span>
                      <div
                        className={cn(
                            "transition-all duration-300",
                            isOpen ? "text-zinc-600 rotate-180" : "text-slate-400"
                        )}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                      {isOpen && (
                        <p className="text-slate-500 text-sm leading-relaxed font-medium mt-2">
                          {item.desc}
                        </p>
                      )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Man and Integrated Cards */}
          <div className="lg:col-span-7 relative h-[500px] lg:h-[700px] flex items-center justify-center order-1 lg:order-2">
            <div className="relative w-full max-w-[600px] h-full flex items-center justify-center">
              
              {/* Central Man Image */}
              <div className="absolute bottom-0 left-1/4 lg:left-1/2 -translate-x-1/2 z-10 w-[280px] lg:w-[420px] pointer-events-none">
                  <Image
                    src="/assets/images/man 2.png"
                    alt="Professional"
                    width={600}
                    height={750}
                    className="w-full h-auto object-contain"
                  />
                </div>

              {/* Financial Card */}
              <div className="absolute top-10 -right-4 lg:right-0 w-[220px] lg:w-[280px] rounded-3xl bg-white border border-slate-100 p-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] z-20">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black tracking-widest text-zinc-600 uppercase">{t("faqSection.healthLabel")}</span>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">€ 23,691.29</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">▲ +12.4%</span>
                    <span className="text-[10px] text-slate-400 font-bold">{t("faqSection.growthLabel")}</span>
                  </div>
                  <div className="h-12 flex items-end gap-1.5 mt-2">
                    {[35, 65, 50, 85, 60, 95, 75].map((h, i) => (
                      <div 
                        key={i} 
                        style={{ height: `${h}%` }}
                        className="flex-1 bg-zinc-100 rounded-full" 
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Equity Card */}
              <div className="absolute bottom-16 -left-4 lg:left-0 w-[190px] lg:w-[240px] rounded-3xl bg-white border border-slate-200 p-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] z-20">
                    <div className="flex flex-col gap-4">
                  <span className="text-[9px] font-black tracking-widest text-primary-blue uppercase">{t("faqSection.equityLabel")}</span>
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 flex items-center justify-center">
                       <svg className="h-full w-full rotate-[-90deg]">
                          <circle cx="28" cy="28" r="24" fill="transparent" stroke="currentColor" strokeWidth="5" className="text-slate-50" />
                          <circle 
                            cx="28" cy="28" r="24" 
                            fill="transparent" 
                            stroke="#9333ea" 
                            strokeWidth="5" 
                            strokeDasharray={151} 
                            strokeDashoffset={75}
                            strokeLinecap="round"
                            />
                          </svg>
                       <span className="absolute text-xs font-black text-slate-900">50%</span>
                        </div>
                        <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t("faqSection.issuedCap")}</div>
                      <div className="text-lg font-black text-slate-900">€ 150.0k</div>
                        </div>
                      </div>
                    </div>
                  </div>

              {/* Contact Pill */}
              <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 lg:ml-28">
                <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-full py-3.5 px-6 flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                   <div className="h-9 w-9 rounded-full bg-zinc-600 flex items-center justify-center shadow-lg shadow-zinc-500/20">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-zinc-600 tracking-[0.2em] uppercase mb-0.5">{t("faqSection.supportLabel")}</span>
                      {CONTACT_PHONES.map((phone) => (
                        <span key={phone.href} className="text-sm font-black text-slate-900 tracking-wide">
                          {phone.display}
                        </span>
                      ))}
                </div>
                            </div>
                           </div>
                         </div>

              {/* Decorative Circle Accents */}
              <div className="absolute inset-0 border border-slate-50 rounded-full scale-[0.85] pointer-events-none" />
              <div className="absolute inset-0 border border-slate-50 rounded-full scale-[1.1] pointer-events-none" />
            </div>
          </div>
        </div>
    </section>
  );
};

export default FaqSection;
