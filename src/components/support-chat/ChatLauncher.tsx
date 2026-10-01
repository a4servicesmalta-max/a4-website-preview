"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import TypingIndicator from "./TypingIndicator";

interface ChatLauncherProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function ChatLauncher({ onClick, disabled }: ChatLauncherProps) {
  const { t } = useTranslation("common");
  const [hover, setHover] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2">
      <AnimatePresence>
        {hover && !disabled && (
          <motion.div
            key="bubble"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2"
          >
            <TypingIndicator bubble />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        disabled={disabled}
        className="flex h-14 w-14 items-center justify-center rounded-full text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F55F1] focus-visible:ring-offset-2 disabled:opacity-70 transition-colors"
        style={{ background: "rgba(9,9,11,.92)", border: "1px solid rgba(255,255,255,.14)", boxShadow: "0 24px 60px rgba(9,9,11,.35)", backdropFilter: "blur(12px)" }}
        aria-label={t("supportChat.launcherAria")}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </motion.button>
    </div>
  );
}
