"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import LocalizedLink from "@/components/common/LocalizedLink";

const COOKIE_NAME = "A4_cookie_consent";

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
    setVisible(false);
  };

  // Accept: record consent. Non-essential scripts/cookies should only be
  // loaded once this value is "accepted".
  const accept = () => persistConsent("accepted");

  // Reject: persist the refusal and load nothing non-essential.
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
          className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 sm:pb-6"
        >
          <div className="max-w-4xl w-full rounded-2xl bg-[#111111] text-white shadow-[0_18px_50px_rgba(0,0,0,0.5)] border border-white/10 px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 text-sm sm:text-[13px] leading-relaxed">
              <p className="font-semibold mb-1">{t("cookieConsent.title")}</p>
              <p className="text-white/80">{t("cookieConsent.body")}</p>
              <LocalizedLink
                href="/cookie-policy"
                className="mt-2 inline-block text-xs font-semibold text-white/90 underline underline-offset-2 hover:text-white"
              >
                {t("cookieConsent.policyLink")}
              </LocalizedLink>
            </div>
            {/* Equal-weight Accept / Reject — both explicit, neither is a low-emphasis link */}
            <div className="flex items-center gap-2 sm:gap-3 self-stretch sm:self-auto">
              <button
                type="button"
                onClick={reject}
                className="flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm font-semibold border border-white/25 hover:bg-white/15 transition-colors"
              >
                {t("cookieConsent.reject")}
              </button>
              <button
                type="button"
                onClick={accept}
                className="flex-1 sm:flex-none min-h-[44px] px-4 py-2.5 rounded-xl bg-white text-[#111111] text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                {t("cookieConsent.accept")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

