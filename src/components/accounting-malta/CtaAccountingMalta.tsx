"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const ONBOARDING = "https://client.a4.com.mt/onboarding";

export default function CtaAccountingMalta() {
  const { t } = useTranslation("services");
  const p = "accountingMalta.cta.";

  return (
    <section className="sct-dark cta-energy-wrap entrance-fade-up">
      <div className="energy-orb orb-1" aria-hidden />
      <div className="energy-orb orb-2" aria-hidden />
      <div className="energy-orb orb-3" aria-hidden />

      <div className="sct-inner cta-energy-inner">
        <span className="cta-energy-tag">{t(`${p}tag`)}</span>
        <h2 className="cta-energy-title">
          {t(`${p}titleLine1`)}
          <br />
          {t(`${p}titleLine2`)}
        </h2>
        <p className="cta-energy-p">{t(`${p}p`)}</p>

        <div className="cta-energy-btns">
          <Link href={ONBOARDING} className="btn-energy-primary">
            {t(`${p}btnPrimary`)}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="#how" className="btn-energy-secondary">
            {t(`${p}btnSecondary`)}
          </Link>
        </div>
        <div className="cta-energy-note">{t(`${p}note`)}</div>
      </div>
    </section>
  );
}
