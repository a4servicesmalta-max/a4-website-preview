"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CLIENT_ONBOARDING_URL } from "@/lib/external-links";
import { SOFTWARE_TIERS } from "@/data/a4QuotePack";

export default function PricingSection() {
  const { t } = useTranslation("services");

  const packages = [
    {
      id: 0,
      label: t("bookkeeping.pricing.pkg0.label"),
      title: t("bookkeeping.pricing.pkg0.title"),
      price: (
        <>
          €{SOFTWARE_TIERS.book}<sub>{t("bookkeeping.pricing.month")}</sub>
        </>
      ),
      desc: t("bookkeeping.pricing.pkg0.desc"),
      includes: [
        t("bookkeeping.pricing.pkg0.inc1"),
        t("bookkeeping.pricing.pkg0.inc2"),
        t("bookkeeping.pricing.pkg0.inc3"),
        t("bookkeeping.pricing.pkg0.inc4"),
        t("bookkeeping.pricing.pkg0.inc5"),
        t("bookkeeping.pricing.pkg0.inc6"),
      ].filter(Boolean),
      bestFor: t("bookkeeping.pricing.pkg0.bestFor"),
      cta: t("bookkeeping.pricing.pkg0.cta"),
      badge: t("bookkeeping.pricing.pkg0.badge"),
      pos: t("bookkeeping.pricing.pkg0.pos"),
    },
    {
      id: 1,
      label: t("bookkeeping.pricing.pkg1.label"),
      title: t("bookkeeping.pricing.pkg1.title"),
      price: (
        <>
          €{SOFTWARE_TIERS.senior}<sub>{t("bookkeeping.pricing.month")}</sub>
        </>
      ),
      desc: t("bookkeeping.pricing.pkg1.desc"),
      includes: [
        t("bookkeeping.pricing.pkg1.inc1"),
        t("bookkeeping.pricing.pkg1.inc2"),
        t("bookkeeping.pricing.pkg1.inc3"),
        t("bookkeeping.pricing.pkg1.inc4"),
        t("bookkeeping.pricing.pkg1.inc5"),
        t("bookkeeping.pricing.pkg1.inc6"),
        t("bookkeeping.pricing.pkg1.inc7"),
        t("bookkeeping.pricing.pkg1.inc8"),
        t("bookkeeping.pricing.pkg1.inc9"),
      ].filter(Boolean),
      bestFor: t("bookkeeping.pricing.pkg1.bestFor"),
      cta: t("bookkeeping.pricing.pkg1.cta"),
      badge: t("bookkeeping.pricing.pkg1.badge"),
      pos: t("bookkeeping.pricing.pkg1.pos"),
    },
    {
      id: 2,
      label: t("bookkeeping.pricing.pkg2.label"),
      title: t("bookkeeping.pricing.pkg2.title"),
      price: (
        <>
          {t("bookkeeping.pricing.quoted")}
        </>
      ),
      desc: t("bookkeeping.pricing.pkg2.desc"),
      includes: [
        t("bookkeeping.pricing.pkg2.inc1"),
        t("bookkeeping.pricing.pkg2.inc2"),
        t("bookkeeping.pricing.pkg2.inc3"),
        t("bookkeeping.pricing.pkg2.inc4"),
        t("bookkeeping.pricing.pkg2.inc5"),
        t("bookkeeping.pricing.pkg2.inc6"),
        t("bookkeeping.pricing.pkg2.inc7"),
        t("bookkeeping.pricing.pkg2.inc8"),
        t("bookkeeping.pricing.pkg2.inc9"),
      ].filter(Boolean),
      bestFor: t("bookkeeping.pricing.pkg2.bestFor"),
      cta: t("bookkeeping.pricing.pkg2.cta"),
      badge: t("bookkeeping.pricing.pkg2.badge"),
      pos: t("bookkeeping.pricing.pkg2.pos"),
    },
  ];

  const [activePkg, setActivePkg] = useState(packages[1]);
  const [animate, setAnimate] = useState(false);

  // Keep the active package in sync if translation changes
  useEffect(() => {
    setActivePkg(packages[activePkg.id]);
  }, [t, activePkg.id]);

  const handleSelectPackage = (pkg: typeof packages[0]) => {
    if (activePkg.id === pkg.id) return;
    setAnimate(true);
    setTimeout(() => {
      setActivePkg(pkg);
      setAnimate(false);
    }, 150);
  };


  return (
    <section className="pricing-wrap" id="pricing">
      <div className="pricing-inner">
        <div className="pricing-header">
          <span className="eyebrow-dark">{t("bookkeeping.pricing.eyebrow")}</span>
          <h2 className="section-h">{t("bookkeeping.pricing.title")}</h2>
          <p className="section-p">
            {t("bookkeeping.pricing.desc")}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-cards" role="tablist" aria-label="Pricing packages">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
      className={`pc ${activePkg.id === pkg.id ? "active" : ""}`}
      role="tab"
      aria-selected={activePkg.id === pkg.id}
      onClick={() => handleSelectPackage(pkg)}
      style={{
        backgroundColor: activePkg.id === pkg.id ? "var(--navy-3)" : "var(--white)",
        borderColor: activePkg.id === pkg.id ? "var(--zinc-mid)" : "var(--light-border)",
      }}
    >
              {pkg.badge ? (
                <span className="pc-badge">{pkg.badge}</span>
              ) : (
                <span className="pc-badge-placeholder"></span>
              )}
              <div className="pc-name">{pkg.label}</div>
              <div className="pc-pos">{pkg.pos}</div>
              <div className="pc-price">{pkg.price}</div>
              <div className="pc-select-dot"></div>
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        <div
          className="pricing-panel"
          id="pricingPanel"
          role="tabpanel"
          style={{
            opacity: animate ? 0 : 1,
            transform: animate ? "translateY(6px)" : "translateY(0)",
          }}
        >
          <div className="pp-top">
            <div>
              <div className="pp-name" id="ppLabel">
                {activePkg.label}
              </div>
              <div className="pp-title" id="ppTitle">
                {activePkg.title}
              </div>
              <div className="pp-desc" id="ppDesc">
                {activePkg.desc}
              </div>
            </div>
            <div className="pp-price-block">
              <div className="pp-from">{t("bookkeeping.pricing.startingFrom")}</div>
              <div className="pp-amount" id="ppPrice">
                {activePkg.price}
              </div>
            </div>
          </div>

          <div className="pp-body">
            <div>
              <div className="pp-section-title">{t("bookkeeping.pricing.whatsIncluded")}</div>
              <ul className="pp-list" id="ppIncludes">
                {activePkg.includes.map((item, idx) => (
                  <li key={idx}>
                    <span className="pp-check">
                      <Check size={12} strokeWidth={3} className="text-green-500" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="pp-best">
                <div className="pp-best-lbl">{t("bookkeeping.pricing.bestFor")}</div>
                <div className="pp-best-text" id="ppBestFor">
                  {activePkg.bestFor}
                </div>
              </div>
              <div
                className="pp-section-title"
                style={{ marginTop: 0, marginBottom: 0 }}
              ></div>
            </div>
          </div>

          <div className="pp-cta-row">
            <a href={CLIENT_ONBOARDING_URL} className="pp-btn pp-btn-primary" id="ppCta">
              {activePkg.cta}
            </a>
            <Link href="/contact" className="pp-btn pp-btn-outline">
              {t("bookkeeping.pricing.viewAll")}
            </Link>
          </div>
        </div>

        {/* Notes */}
        <div className="pricing-notes">
          <div className="pn-box">
            {t("bookkeeping.pricing.notes1")}
          </div>
          <div className="pn-box">
            {t("bookkeeping.pricing.notes2")}
          </div>
          <div className="pn-box">
            {t("bookkeeping.pricing.notes3")}
          </div>
        </div>

        {/* Final Pricing CTA */}
        <div className="pricing-cta-box" style={{ background: "var(--navy-2)" }}>
          <div className="pcta-left">
            <h3>{t("bookkeeping.pricing.ctaTitle")}</h3>
            <p>
              {t("bookkeeping.pricing.ctaDesc")}
            </p>
          </div>
          <a href={CLIENT_ONBOARDING_URL} className="pcta-btn">
            {t("bookkeeping.pricing.ctaBtn")}
          </a>
        </div>
      </div>
    </section>
  );
}
