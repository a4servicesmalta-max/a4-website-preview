"use client";

import React from "react";
import { motion } from "framer-motion";
import { FadeInUp } from "@/components/common/Animations";
import LocalizedLink from "@/components/common/LocalizedLink";
import { usePerformance } from "@/contexts/ReduceMotionContext";
import { cn } from "@/lib/utils";
import { usePagesTranslation } from "@/hooks/usePagesTranslation";

const PricingCTA = () => {
  const { t } = usePagesTranslation("pricing");
  const { isIPhone, isLowPerformance } = usePerformance();

  const floatSteps = [0, 1, 2].map((i) => ({
    step: t(`cta.floatSteps.${i}.step`),
    label: t(`cta.floatSteps.${i}.label`),
  }));

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-[#ecf0f0]">
      {!isIPhone && !isLowPerformance && (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-zinc-100/40 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-zinc-100/30 rounded-full blur-[80px]" />
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 lg:px-8 z-10">
        <FadeInUp>
          <div className="relative bg-primary-blue rounded-3xl overflow-hidden shadow-2xl shadow-zinc-900/20">
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>

            <div className="relative z-10 px-8 md:px-12 lg:px-16 py-16 lg:py-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="text-white">
                  <div
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-6",
                      isIPhone || isLowPerformance ? "" : "backdrop-blur-md"
                    )}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm font-semibold">{t("cta.badge")}</span>
                  </div>

                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">{t("cta.title")}</h2>

                  <p className="text-white/90 text-lg mb-8 leading-relaxed">{t("cta.body")}</p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <LocalizedLink href="https://client.a4.com.mt/onboarding">
                      <motion.button
                        type="button"
                        whileHover={isIPhone || isLowPerformance ? {} : { scale: 1.05 }}
                        whileTap={isIPhone || isLowPerformance ? {} : { scale: 0.95 }}
                        className="group px-8 py-4 bg-white text-primary-blue rounded-xl font-bold text-base shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto"
                      >
                        <span>{t("cta.requestQuote")}</span>
                        <svg
                          className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </motion.button>
                    </LocalizedLink>

                    <LocalizedLink href="https://client.a4.com.mt/onboarding">
                      <motion.button
                        type="button"
                        whileHover={isIPhone || isLowPerformance ? {} : { scale: 1.05 }}
                        whileTap={isIPhone || isLowPerformance ? {} : { scale: 0.95 }}
                        className={cn(
                          "group px-8 py-4 border-2 border-white/30 text-white rounded-xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto",
                          isIPhone || isLowPerformance ? "bg-white/10" : "bg-white/10 backdrop-blur-md hover:bg-white/20"
                        )}
                      >
                        <span>{t("cta.discussNeeds")}</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </motion.button>
                    </LocalizedLink>
                  </div>

                  <div className="mt-10 pt-8 border-t border-white/20">
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center",
                            isIPhone || isLowPerformance ? "" : "backdrop-blur-sm"
                          )}
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white/60 text-xs">{t("cta.responseLabel")}</p>
                          <p className="text-white font-semibold">{t("cta.responseValue")}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center",
                            isIPhone || isLowPerformance ? "" : "backdrop-blur-sm"
                          )}
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white/60 text-xs">{t("cta.commitmentLabel")}</p>
                          <p className="text-white font-semibold">{t("cta.commitmentValue")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {!isIPhone && !isLowPerformance && (
                  <div className="hidden lg:flex relative items-center justify-end">
                    <div className="relative h-[260px] w-[260px]">
                      <motion.div
                        animate={{ y: [0, -30, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-0 right-0 w-64 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white/60 text-xs">{floatSteps[0].step}</p>
                            <p className="text-white font-semibold text-sm">{floatSteps[0].label}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-white/20 rounded-full w-full" />
                          <div className="h-2 bg-white/20 rounded-full w-3/4" />
                        </div>
                      </motion.div>

                      <motion.div
                        animate={{ y: [0, -35, 0] }}
                        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute top-20 right-16 w-64 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white/60 text-xs">{floatSteps[1].step}</p>
                            <p className="text-white font-semibold text-sm">{floatSteps[1].label}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-white/20 rounded-full w-full" />
                          <div className="h-2 bg-white/20 rounded-full w-2/3" />
                        </div>
                      </motion.div>

                      <motion.div
                        animate={{ y: [0, -40, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute top-40 right-0 w-64 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-green-500/30 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white/60 text-xs">{floatSteps[2].step}</p>
                            <p className="text-white font-semibold text-sm">{floatSteps[2].label}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-white/20 rounded-full w-full" />
                          <div className="h-2 bg-white/20 rounded-full w-4/5" />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </FadeInUp>
      </div>
    </section>
  );
};

export default PricingCTA;
