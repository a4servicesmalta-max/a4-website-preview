"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import LocalizedLink from "@/components/common/LocalizedLink";
import { CONSENT_COOKIE_NAME, updateConsent } from "@/lib/analytics";

const COOKIE_NAME = CONSENT_COOKIE_NAME;

function hasConsent() {
  if (typeof document === "undefined") return true;
  return document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE_NAME}=`));
}

export default function CookieConsentBanner() {
  const { t } = useTranslation("common");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasConsent()) {
      setVisible(true);
    }
  }, []);

  const persistConsent = (value: "accepted" | "rejected") => {
    if (typeof document !== "undefined") {
      document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""
        }`;
    }
    // Tell Google Consent Mode, in the same breath. Until this fires, the tag
    // defaults set in GoogleTags keep ad_storage / ad_user_data /
    // ad_personalization / analytics_storage denied. No-ops when no tag is
    // configured, so the banner works with or without tracking.
    updateConsent(value);
    setVisible(false);
  };

  // Accept: record consent and grant Consent Mode storage.
  const accept = () => persistConsent("accepted");

  // Reject: persist the refusal and leave every non-essential storage denied.
  const reject = () => persistConsent("rejected");

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.25 }}
          role="region"
          aria-label={t("cookieConsent.title")}
          className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:justify-end sm:px-6 sm:pb-6"
        >
          <div
            className="max-w-lg w-full flex items-center gap-3 sm:gap-4 px-4 py-4 sm:px-5"
            style={{ borderRadius: 22, background: "rgba(24,24,27,.94)", border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 30px 80px rgba(0,0,0,.45)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", color: "#FFFFFF" }}
          >
            <div className="min-w-0 flex-1">
              <p style={{ margin: "0 0 4px", fontFamily: "var(--a4x-display)", fontSize: 15, fontWeight: 600 }}>{t("cookieConsent.title")}</p>
              <p style={{ margin: 0, fontFamily: "var(--a4x-body)", fontSize: 12.5, lineHeight: 1.5, color: "#A1A1AA" }}>{t("cookieConsent.body")}</p>
              <LocalizedLink
                href="/cookie-policy"
                style={{ display: "inline-block", marginTop: 6, fontFamily: "var(--a4x-body)", fontSize: 12, fontWeight: 600, color: "#8B8FF7", textDecoration: "underline", textUnderlineOffset: 2 }}
              >
                {t("cookieConsent.policyLink")}
              </LocalizedLink>
            </div>
            {/* Equal-weight Accept / Reject — both explicit, neither is a low-emphasis link */}
            <div className="flex w-[104px] shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-2.5">
              <button type="button" onClick={reject} className="a4-btn a4-btn-ghost" style={{ height: 44, padding: "0 18px", fontSize: 14, fontWeight: 600 }}>
                {t("cookieConsent.reject")}
              </button>
              <button type="button" onClick={accept} className="a4-btn a4-btn-light" style={{ height: 44, padding: "0 18px", fontSize: 14 }}>
                {t("cookieConsent.accept")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

