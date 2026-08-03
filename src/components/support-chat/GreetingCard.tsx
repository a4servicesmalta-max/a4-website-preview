"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import LocalizedLink from "@/components/common/LocalizedLink";

interface GreetingCardProps {
  onChatNow: () => void;
  onClose: () => void;
}

/**
 * The friendly wave at the top of the greeting card.
 *
 * Deliberately inline SVG rather than an image: this card renders on EVERY page
 * of the site, and the artwork it used to show was hot-linked straight from
 * `cdn.livechat-static.com` — a third-party CDN we have no integration with, no
 * contract with and no control over. That was one uncacheable cross-origin
 * request per pageview, leaking visitor IP and referrer to LiveChat, and a
 * broken card on every page the day they moved the file. Inline costs no
 * request at all and cannot 404.
 *
 * Rendered at 220×220 — the same box the old <Image> occupied — so the card
 * keeps its exact height and nothing below it shifts.
 */
function HandWave() {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      width={220}
      height={220}
      viewBox="0 0 220 220"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <circle cx="110" cy="110" r="80" fill="#FEF3C7" opacity="0.7" />
      <circle cx="110" cy="110" r="58" fill="#FDE68A" opacity="0.55" />

      <motion.g
        // `fill-box` makes the origin the group's own bounding box, so 50%/100%
        // is the wrist — the hand pivots there instead of around the viewBox.
        style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
        // Respect the OS "reduce motion" setting: the hand still reads as a
        // wave when it is held still, so we simply do not animate it.
        initial={{ rotate: reduceMotion ? 0 : -14 }}
        animate={reduceMotion ? { rotate: 0 } : { rotate: [-14, 12, -14] }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 1.5, times: [0, 0.5, 1], repeat: Infinity, repeatDelay: 0.7, ease: "easeInOut" }
        }
      >
        {/* thumb */}
        <path
          d="M88 118 L66 141"
          stroke="#E8A33D"
          strokeWidth="19"
          strokeLinecap="round"
          fill="none"
        />
        {/* four fingers */}
        <rect x="85" y="61" width="17" height="76" rx="8.5" fill="#F6B93B" />
        <rect x="104" y="55" width="17" height="82" rx="8.5" fill="#F6B93B" />
        <rect x="123" y="61" width="17" height="76" rx="8.5" fill="#F6B93B" />
        <rect x="142" y="73" width="16" height="64" rx="8" fill="#F6B93B" />
        {/* palm */}
        <rect x="83" y="103" width="76" height="59" rx="27" fill="#F6B93B" />
      </motion.g>
    </svg>
  );
}

export default function GreetingCard({ onChatNow, onClose }: GreetingCardProps) {
  const { t } = useTranslation("common");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute bottom-full left-4 mb-2 w-[340px] rounded-3xl bg-white/95 backdrop-blur-xl shadow-[0_24px_48px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] overflow-hidden"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-colors"
        aria-label={t("supportChat.closeAria")}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex justify-center p-4 bg-linear-to-b from-gray-50/80 to-white">
        <div className="relative flex items-center justify-center w-[180px] h-[180px] ">
          <HandWave />
        </div>
      </div>

      <div className="px-6 pb-6 pt-2">
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-0.5">
          {t("supportChat.greetingTitle")}
        </h3>
        <p className="text-sm text-gray-500 text-center mb-5">{t("supportChat.greetingSubtitle")}</p>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onChatNow}
            className="w-full py-3 px-4 rounded-xl bg-[#111111] hover:bg-[#222222] text-white font-medium text-sm transition-colors shadow-sm"
          >
            {t("supportChat.chatNow")}
          </button>
          <LocalizedLink
            href="/quote#process-steps"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-sm transition-colors text-center border border-gray-200/80"
          >
            {t("supportChat.getQuote")}
          </LocalizedLink>
        </div>
      </div>
    </motion.div>
  );
}
