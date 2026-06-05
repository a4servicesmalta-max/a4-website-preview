"use client";

import React from "react";
import { useTranslation } from "react-i18next";

const ONBOARDING = "https://client.a4.com.mt/onboarding";

export default function HeroAccountingMalta() {
  const { t } = useTranslation("services");
  const p = "accountingMalta.hero.";

  return (
    <div className="hero-wrap">
      <div className="hero-grid">
        <div>
          <div className="hero-tag">
            <span className="hero-tag-bar" />
            {t(`${p}tag`)}
          </div>
          <h1>
            {t(`${p}titleLine1`)}
            <br />
            <i>
              {t(`${p}titleItalic1`)}
              <br />
              {t(`${p}titleItalic2`)}
            </i>
          </h1>
          <p className="hero-sub">{t(`${p}sub`)}</p>
          <div className="hero-actions">
            <a href={ONBOARDING} className="btn-solid">
              {t(`${p}btnPrimary`)}
            </a>
            <a href="#how" className="btn-line">
              {t(`${p}btnLine`)}
            </a>
          </div>
          <p className="hero-note">{t(`${p}note`)}</p>
        </div>

        <div className="portal-wrap">
          <div className="portal-shot floating-element">
            <div className="ps-chrome">
              <div className="ps-chrome-dots">
                <div className="ps-dot" />
                <div className="ps-dot" />
                <div className="ps-dot" />
              </div>
              <span className="ps-chrome-title">{t(`${p}portalChromeTitle`)}</span>
              <div className="ps-chrome-r">
                <span className="ps-chrome-name">{t(`${p}portalUser`)}</span>
                <div className="ps-chrome-avatar">A</div>
              </div>
            </div>
            <div className="ps-body">
              <div className="ps-sidebar">
                <div className="ps-logo-sq" />
                <div className="ps-nav-icon active">
                  <svg fill="none" stroke="rgba(255,255,255,.75)" viewBox="0 0 24 24" aria-hidden>
                    <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2" />
                    <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2" />
                    <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2" />
                    <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2" />
                  </svg>
                </div>
                <div className="ps-nav-icon">
                  <svg fill="none" stroke="rgba(255,255,255,.3)" viewBox="0 0 24 24" aria-hidden>
                    <path
                      d="M9 12h6M9 16h6M9 8h6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="ps-nav-icon">
                  <svg fill="none" stroke="rgba(255,255,255,.3)" viewBox="0 0 24 24" aria-hidden>
                    <path
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="ps-nav-icon">
                  <svg fill="none" stroke="rgba(255,255,255,.3)" viewBox="0 0 24 24" aria-hidden>
                    <path
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="ps-nav-icon">
                  <svg fill="none" stroke="rgba(255,255,255,.3)" viewBox="0 0 24 24" aria-hidden>
                    <path
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      strokeWidth="2"
                    />
                    <circle cx="12" cy="12" r="3" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              <div className="ps-content">
                <div className="ps-banner">
                  <div className="ps-banner-h">{t(`${p}portalBannerGreeting`)}</div>
                  <div className="ps-banner-sub">{t(`${p}portalBannerSub`)}</div>
                </div>

                <div className="ps-cards">
                  <div className="ps-card psc-orange">
                    <div className="ps-card-label">{t(`${p}cardBooksLabel`)}</div>
                    <div className="ps-card-val">{t(`${p}cardBooksVal`)}</div>
                    <div className="ps-card-sub">{t(`${p}cardBooksSub`)}</div>
                    <div className="ps-card-btn">{t(`${p}cardBooksBtn`)}</div>
                  </div>
                  <div className="ps-card psc-blue">
                    <div className="ps-card-label">{t(`${p}cardOweLabel`)}</div>
                    <div className="ps-card-val">{t(`${p}cardOweVal`)}</div>
                    <div className="ps-card-sub">{t(`${p}cardOweSub`)}</div>
                    <div className="ps-card-btn">{t(`${p}cardOweBtn`)}</div>
                  </div>
                  <div className="ps-card psc-teal">
                    <div className="ps-card-label">{t(`${p}cardTeamLabel`)}</div>
                    <div className="ps-card-val">{t(`${p}cardTeamVal`)}</div>
                    <div className="ps-card-sub">{t(`${p}cardTeamSub`)}</div>
                    <div className="ps-card-btn">{t(`${p}cardTeamBtn`)}</div>
                  </div>
                  <div className="ps-card psc-violet">
                    <div className="ps-card-label">{t(`${p}cardBankLabel`)}</div>
                    <div className="ps-card-val">{t(`${p}cardBankVal`)}</div>
                    <div className="ps-card-sub">{t(`${p}cardBankSub`)}</div>
                    <div className="ps-card-btn">{t(`${p}cardBankBtn`)}</div>
                  </div>
                </div>

                <div className="ps-bottom">
                  <div>
                    <div className="ps-notif-head">
                      {t(`${p}notifHead`)}
                      <span>{t(`${p}notifViewAll`)}</span>
                    </div>
                    <div className="ps-notif-item">
                      <div className="ps-notif-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path
                            d="M9 12h6M9 16h6M9 8h6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="ps-notif-title">{t(`${p}notif1Title`)}</div>
                        <div className="ps-notif-sub">{t(`${p}notif1Sub`)}</div>
                      </div>
                      <div className="ps-notif-num">1</div>
                    </div>
                    <div className="ps-notif-item">
                      <div className="ps-notif-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="ps-notif-title">{t(`${p}notif2Title`)}</div>
                        <div className="ps-notif-sub">{t(`${p}notif2Sub`)}</div>
                      </div>
                      <div className="ps-notif-num">2</div>
                    </div>
                    <div className="ps-notif-item">
                      <div className="ps-notif-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="ps-notif-title">{t(`${p}notif3Title`)}</div>
                        <div className="ps-notif-sub">{t(`${p}notif3Sub`)}</div>
                      </div>
                      <div className="ps-notif-num">3</div>
                    </div>
                  </div>

                  <div className="ps-priority">
                    <div className="ps-pri-head">{t(`${p}priHead`)}</div>
                    <div className="ps-pri-item">
                      <div className="ps-pri-dot ppd-red">
                        <svg width="8" height="8" fill="none" viewBox="0 0 24 24" aria-hidden>
                          <path
                            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                            stroke="#C8353A"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span
                            className="ps-pri-name"
                            style={{ color: "rgba(255,255,255,.75)", fontSize: 9, fontWeight: 700 }}
                          >
                            {t(`${p}pri1Name`)}
                          </span>
                          <span className="ps-pri-tag ppt-red">{t(`${p}pri1Tag`)}</span>
                        </div>
                        <div className="ps-pri-sub">{t(`${p}pri1Sub`)}</div>
                      </div>
                    </div>
                    <div className="ps-pri-item">
                      <div className="ps-pri-dot ppd-amber">
                        <svg width="8" height="8" fill="none" viewBox="0 0 24 24" aria-hidden>
                          <path
                            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                            stroke="#C17D2A"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span
                            className="ps-pri-name"
                            style={{ color: "rgba(255,255,255,.75)", fontSize: 9, fontWeight: 700 }}
                          >
                            {t(`${p}pri2Name`)}
                          </span>
                          <span className="ps-pri-tag ppt-amber">{t(`${p}pri2Tag`)}</span>
                        </div>
                        <div className="ps-pri-sub">{t(`${p}pri2Sub`)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
