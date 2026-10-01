"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined") return;
      const show = window.scrollY > 200;
      setVisible(show);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-28 right-4 left-auto z-[55] flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-[rgba(9,9,11,0.88)] text-white shadow-[0_24px_60px_rgba(9,9,11,0.35)] backdrop-blur-md hover:bg-[#27272A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F55F1] focus-visible:ring-offset-2 lg:left-8 lg:right-auto"
          aria-label="Scroll to top"
          data-floating-chrome=""
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;

