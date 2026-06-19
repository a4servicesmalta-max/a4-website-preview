"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Clock, Shield, Zap } from "lucide-react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { cn } from "@/lib/utils";
import { CLIENT_ONBOARDING_URL } from "@/lib/external-links";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function typewriterTween(
  el: HTMLElement,
  fullText: string,
  duration: number
): gsap.core.Tween {
  const state = { len: 0 };
  return gsap.to(state, {
    len: fullText.length,
    duration,
    ease: "none",
    onStart: () => {
      el.textContent = "";
    },
    onUpdate: () => {
      el.textContent = fullText.slice(0, Math.round(state.len));
    },
    onComplete: () => {
      el.textContent = fullText;
    },
  });
}

const InteractiveBlock = ({ isDark = false }: { isDark?: boolean }) => {
  const { t, i18n } = useTranslation("home");
  const sectionRef = useRef<HTMLElement>(null);
  const companyRef = useRef<HTMLSpanElement>(null);
  const countryRef = useRef<HTMLSpanElement>(null);
  const servicesRef = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const demoCompany = t("interactiveBlock.typeDemo.companyName", {
    defaultValue: "Acme Global Ltd",
  });
  const demoCountry = t("interactiveBlock.typeDemo.country", {
    defaultValue: "United Arab Emirates",
  });
  const demoServices = t("interactiveBlock.typeDemo.services", {
    defaultValue: "Accounting & Bookkeeping",
  });

  useLayoutEffect(() => {
    const ctaEl = ctaRef.current;
    if (!ctaEl) return;
    ctaEl.setAttribute("aria-disabled", "true");
    ctaEl.tabIndex = -1;
    gsap.set(ctaEl, {
      opacity: 0.45,
      scale: 0.98,
      filter: "grayscale(0.85)",
      pointerEvents: "none",
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const companyEl = companyRef.current;
    const countryEl = countryRef.current;
    const servicesEl = servicesRef.current;
    const ctaEl = ctaRef.current;
    if (!section || !companyEl || !countryEl || !servicesEl || !ctaEl) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const resetFields = () => {
        companyEl.textContent = "";
        countryEl.textContent = "";
        servicesEl.textContent = "";
      };

      const setCtaDisabled = () => {
        ctaEl.setAttribute("aria-disabled", "true");
        ctaEl.tabIndex = -1;
        gsap.set(ctaEl, {
          opacity: 0.45,
          scale: 0.98,
          filter: "grayscale(0.85)",
          pointerEvents: "none",
        });
      };

      const setCtaEnabled = () => {
        ctaEl.removeAttribute("aria-disabled");
        ctaEl.tabIndex = 0;
        gsap.to(ctaEl, {
          opacity: 1,
          scale: 1,
          filter: "grayscale(0)",
          duration: 0.55,
          ease: "back.out(1.35)",
          onComplete: () => {
            ctaEl.style.removeProperty("pointer-events");
          },
        });
      };

      const runDemo = () => {
        tlRef.current?.kill();
        resetFields();
        setCtaDisabled();

        if (reduceMotion) {
          companyEl.textContent = demoCompany;
          countryEl.textContent = demoCountry;
          servicesEl.textContent = demoServices;
          setCtaEnabled();
          return;
        }

        const tl = gsap.timeline({ defaults: { ease: "none" } });
        tlRef.current = tl;

        tl.add(typewriterTween(companyEl, demoCompany, Math.min(1.15, 0.045 * demoCompany.length)), 0.15);
        tl.add(typewriterTween(countryEl, demoCountry, Math.min(1.25, 0.04 * demoCountry.length)), ">");
        tl.add(typewriterTween(servicesEl, demoServices, Math.min(1.35, 0.038 * demoServices.length)), ">");
        tl.add(() => setCtaEnabled(), ">");
      };

      ScrollTrigger.create({
        trigger: section,
        start: "top 78%",
        end: "bottom 22%",
        onEnter: runDemo,
        onEnterBack: runDemo,
      });
    }, section);

    return () => {
      tlRef.current?.kill();
      tlRef.current = null;
      ctx.revert();
    };
  }, [demoCompany, demoCountry, demoServices, i18n.language]);

  const fieldShell = (darkMode: boolean) =>
    cn(
      "h-14 rounded-2xl border px-5 flex items-center text-sm font-medium min-w-0",
      darkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
    );

  const typedTextClass = (darkMode: boolean) =>
    cn("truncate tabular-nums", darkMode ? "text-white" : "text-slate-900");

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative py-24 sm:py-32 overflow-hidden mt-12 mx-4 sm:mx-6 lg:mx-8 mb-12  rounded-[48px]",
        isDark ? "bg-[#05050A] text-white shadow-2xl" : "bg-white text-slate-900 border border-slate-100 shadow-xl shadow-zinc-500/5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content & Form Preview */}
          <div className="space-y-8">
            <div>
              <h2
                className={cn(
                  "text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] mb-8",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                {t("interactiveBlock.title")}
              </h2>
              <div className="flex flex-wrap gap-4 mb-8">
                {(t("interactiveBlock.microcopy", { returnObjects: true }) as string[] || []).map((text, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border",
                      isDark ? "bg-white/5 border-white/10 text-white/70" : "bg-zinc-50 border-zinc-100 text-zinc-600"
                    )}
                  >
                    {i === 0 && <Clock className="w-3.5 h-3.5" />}
                    {i === 1 && <Shield className="w-3.5 h-3.5" />}
                    {i === 2 && <Zap className="w-3.5 h-3.5" />}
                    {text}
                  </div>
                ))}
              </div>
            </div>

            <div
              className={cn(
                "p-8 rounded-[2.5rem] border shadow-2xl transition-all duration-500 hover:shadow-primary-blue/5",
                isDark ? "bg-[#09090B] border-white/10" : "bg-white border-slate-100"
              )}
            >
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                    {t("interactiveBlock.companyNameLabel")}
                  </label>
                  <div className={fieldShell(isDark)}>
                    <span ref={companyRef} className={typedTextClass(isDark)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                      {t("interactiveBlock.countryLabel")}
                    </label>
                    <div className={fieldShell(isDark)}>
                      <span ref={countryRef} className={typedTextClass(isDark)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                      {t("interactiveBlock.servicesLabel")}
                    </label>
                    <div className={fieldShell(isDark)}>
                      <span ref={servicesRef} className={typedTextClass(isDark)} />
                    </div>
                  </div>
                </div>

                <a
                  ref={ctaRef}
                  href={CLIENT_ONBOARDING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "relative z-1 w-full h-14 rounded-2xl bg-primary-blue text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-colors hover:bg-zinc-600 shadow-lg shadow-zinc-500/25 will-change-transform"
                  )}
                >
                  {t("interactiveBlock.cta")}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Right: Visual Polish */}
          <div className="relative">
            <div
              className={cn(
                "absolute -inset-4 rounded-[3rem] blur-3xl opacity-20 pointer-events-none",
                isDark ? "bg-primary-blue" : "bg-zinc-400"
              )}
            />

            <div
              className={cn(
                "relative rounded-[2.5rem] border overflow-hidden p-8 sm:p-12",
                isDark ? "bg-[#09090B] border-white/10" : "bg-white border-slate-200 shadow-xl"
              )}
            >
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-500/10 flex items-center justify-center text-primary-blue">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">Fast Setup</h4>
                    <p className="text-sm text-slate-400">Portal ready in seconds after registration.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">Real-time Visibility</h4>
                    <p className="text-sm text-slate-400">Instant tracking of your business status.</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100/10">
                  <p className="text-sm text-slate-400 mb-6">Want to skip the form and talk to us first?</p>
                  <LocalizedLink
                    href="/contact"
                    className={cn(
                      "inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest transition-colors",
                      isDark ? "text-white hover:text-primary-blue" : "text-slate-900 hover:text-zinc-600"
                    )}
                  >
                    {t("interactiveBlock.secondaryCta")}
                    <ArrowRight className="w-4 h-4 text-primary-blue" />
                  </LocalizedLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveBlock;
