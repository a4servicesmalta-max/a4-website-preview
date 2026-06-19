"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { CLIENT_ONBOARDING_URL } from "@/lib/external-links";

export default function PricingAccountingMalta() {
  const { t } = useTranslation("services");
  const p = "accountingMalta.pricing.";

  return (
    <section className="sct pricing-wrap sct-light entrance-fade-up">
      <div className="sct-inner">
        <span className="tag">{t(`${p}tag`)}</span>
        <h2>{t(`${p}title`)}</h2>
        <p className="lead">{t(`${p}lead`)}</p>
        <div className="price-grid">
          <div className="p-card">
            <div className="p-name">{t(`${p}p1Name`)}</div>
            <div className="p-desc">{t(`${p}p1Desc`)}</div>
            <div className="p-price">{t(`${p}p1Price`)}</div>
            <div className="p-from">{t(`${p}p1From`)}</div>
            <div className="p-div" />
            <ul className="p-feats">
              <li className="pf">
                <span className="pf-dot">✓</span>
                {t(`${p}p1f1`)}
              </li>
              <li className="pf">
                <span className="pf-dot">✓</span>
                {t(`${p}p1f2`)}
              </li>
              <li className="pf">
                <span className="pf-dot">✓</span>
                {t(`${p}p1f3`)}
              </li>
            </ul>
          </div>
          <div className="p-card hot">
            <div className="p-hot-badge">{t(`${p}hotBadge`)}</div>
            <div className="p-name">{t(`${p}p2Name`)}</div>
            <div className="p-desc">{t(`${p}p2Desc`)}</div>
            <div className="p-price">{t(`${p}p2Price`)}</div>
            <div className="p-from">{t(`${p}p2From`)}</div>
            <div className="p-div" />
            <ul className="p-feats">
              <li className="pf">
                <span className="pf-dot">✓</span>
                {t(`${p}p2f1`)}
              </li>
              <li className="pf">
                <span className="pf-dot">✓</span>
                {t(`${p}p2f2`)}
              </li>
              <li className="pf">
                <span className="pf-dot">✓</span>
                {t(`${p}p2f3`)}
              </li>
              <li className="pf">
                <span className="pf-dot">✓</span>
                {t(`${p}p2f4`)}
              </li>
              <li className="pf">
                <span className="pf-dot">✓</span>
                {t(`${p}p2f5`)}
              </li>
            </ul>
          </div>
          <div className="p-card">
            <div className="p-name">{t(`${p}p3Name`)}</div>
            <div className="p-desc">{t(`${p}p3Desc`)}</div>
            <div className="p-price">{t(`${p}p3Price`)}</div>
            <div className="p-from">{t(`${p}p3From`)}</div>
            <div className="p-div" />
            <ul className="p-feats">
              <li className="pf">
                <span className="pf-dot">✓</span>
                {t(`${p}p3f1`)}
              </li>
              <li className="pf">
                <span className="pf-dot">✓</span>
                {t(`${p}p3f2`)}
              </li>
              <li className="pf">
                <span className="pf-dot">✓</span>
                {t(`${p}p3f3`)}
              </li>
              <li className="pf">
                <span className="pf-dot">✓</span>
                {t(`${p}p3f4`)}
              </li>
            </ul>
          </div>
        </div>
        <p className="accounting-malta-pricing-foot">
          {t(`${p}foot`)}{" "}
          <a href={CLIENT_ONBOARDING_URL}>{t(`${p}footLink`)}</a>
        </p>
      </div>
    </section>
  );
}
