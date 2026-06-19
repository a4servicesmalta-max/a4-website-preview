"use client"

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useIsSafari } from "@/hooks/use-safari"
import { usePerformance } from "@/contexts/ReduceMotionContext"
import GetInstantQuoteButton from '../common/GetInstantQuoteButton'
import { CLIENT_ONBOARDING_URL } from '@/lib/external-links'
import { SectionTitleHero } from "@/components/HomePage/SectionTitleHero";

const CompanySetupSection = () => {
    const { t } = useTranslation('home')
    const isSafari = useIsSafari();
    const { isIPhone, isLowPerformance } = usePerformance();

    const col1 = useMemo(() => (t('companySetup.col1Items', { returnObjects: true }) as string[]) ?? [], [t])
    const col2 = useMemo(() => (t('companySetup.col2Items', { returnObjects: true }) as string[]) ?? [], [t])
    const col3 = useMemo(() => (t('companySetup.col3Items', { returnObjects: true }) as string[]) ?? [], [t])

    return (
        <section className="w-full py-16 sm:py-20 relative overflow-hidden bg-black rounded-[48px]">

            {/* Subtle Background Decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] bg-zinc-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px]" />
                {/* Soft geometric accent */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/Background pattern.svg')] opacity-[0.03] rotate-12 scale-150" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Header */}
                <div className="text-center max-w-4xl mx-auto mb-12 lg:mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-500/10 text-zinc-400 text-[10px] font-black uppercase tracking-widest border border-zinc-500/20 mb-6">
                        {t('companySetup.badge')}
                    </div>

                    <SectionTitleHero
                        variant="dark"
                        className="mb-6 items-center text-center"
                        line1={t("companySetup.titleLine1")}
                        highlight={t("companySetup.titleHighlight")}
                    />
                    <p className="text-base md:text-lg text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
                        {t('companySetup.subtitle')}
                    </p>
                </div>

                {/* 3-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

                    {/* Card 1: What We Handle */}
                    <div className="group relative">
                        <div className="h-full bg-[#18181B] border border-white/10 p-8 rounded-[2.5rem] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.4)] transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] group-hover:-translate-y-1.5">
                            <div className="w-14 h-14 bg-zinc-500/15 rounded-2xl flex items-center justify-center text-zinc-400 mb-6 group-hover:rotate-6 transition-transform duration-500">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <h3 className="text-xl font-black text-white mb-4 group-hover:text-zinc-400 transition-colors">{t('companySetup.col1Title')}</h3>
                            <ul className="space-y-3">
                                {col1.map((item, i) => (
                                    <li key={i} className="flex gap-3 text-slate-300 text-sm font-bold">
                                        <span className="w-5 h-5 rounded-lg bg-zinc-500/20 text-zinc-400 flex items-center justify-center shrink-0 text-[10px] shadow-sm">✓</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Card 2: What You Do */}
                    <div className="group relative">
                        <div className="h-full bg-[#18181B] border border-white/10 p-8 rounded-[2.5rem] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.4)] transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] group-hover:-translate-y-1.5">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-slate-200 mb-6 group-hover:-rotate-6 transition-transform duration-500">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-5.618 1.04" /></svg>
                            </div>
                            <h3 className="text-xl font-black text-white mb-4 group-hover:text-slate-200 transition-colors">{t('companySetup.col2Title')}</h3>
                            <ul className="space-y-3">
                                {col2.map((item, i) => (
                                    <li key={i} className="flex gap-3 text-slate-300 text-sm font-bold">
                                        <span className="w-5 h-5 rounded-lg bg-white/10 text-slate-300 flex items-center justify-center shrink-0 text-[10px] shadow-sm">➜</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Card 3: What You Get */}
                    <div className="group relative">
                        <div className="h-full bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(15,23,42,0.3)] transition-all duration-500 group-hover:-translate-y-1.5 relative overflow-hidden">
                            {/* Interior Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-500/20 blur-[60px] rounded-full" />

                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/10 relative z-10">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            </div>
                            <h3 className="text-xl font-black text-white mb-4 relative z-10">{t('companySetup.col3Title')}</h3>
                            <ul className="space-y-3 relative z-10">
                                {col3.map((item, i) => (
                                    <li key={i} className="flex gap-3 text-slate-300 text-sm font-bold">
                                        <span className="w-5 h-5 rounded-lg bg-zinc-600 text-white flex items-center justify-center shrink-0 text-[10px] shadow-[0_0_15px_rgba(37,99,235,0.4)]">★</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                    <GetInstantQuoteButton
                        text={t('companySetup.startIncorporationCta')}
                        href={CLIENT_ONBOARDING_URL}
                        className="px-8 py-4 sm:px-10 sm:py-5 !text-xs !font-black uppercase tracking-widest"
                    />
                    <Link
                        href={CLIENT_ONBOARDING_URL}
                        className="px-8 py-4 sm:px-10 sm:py-5 rounded-full bg-white/10 border border-white/15 text-white font-black text-xs uppercase tracking-widest transition-all hover:bg-white/15 hover:border-white/25 hover:scale-105 active:scale-95 shadow-sm"
                    >
                        {t('companySetup.bookConsultationCta')}
                    </Link>
                </div>

            </div>
        </section>
    )
}

export default CompanySetupSection
