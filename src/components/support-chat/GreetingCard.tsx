"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import LocalizedLink from "@/components/common/LocalizedLink";

const HAND_WAVE_GIF = "https://cdn.livechat-static.com/api/file/lc/img/rich-greetings/handwave.gif";

interface GreetingCardProps {
  onChatNow: () => void;
  onClose: () => void;
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
          <Image
            src={HAND_WAVE_GIF}
            alt=""
            width={220}
            height={220}
            unoptimized
            loading="lazy"
            decoding="async"
            className="object-cover"
          />
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
            className="w-full py-3 px-4 rounded-full bg-[#09090B] hover:bg-[#27272A] text-white font-semibold text-sm transition-colors"
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
