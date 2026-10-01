"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // When the path or search params change, we've arrived
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (
        anchor &&
        anchor.href &&
        anchor.href.startsWith(window.location.origin) &&
        !anchor.href.includes("#") &&
        anchor.target !== "_blank" &&
        anchor.getAttribute("download") === null
      ) {
        // If it's a valid internal link navigation, start the loader
        // UNLESS it's the exact same page (which Next.js handles instantly)
        if (anchor.href !== window.location.href) {
          setLoading(true);
        }
      }
    };

    window.addEventListener("click", handleAnchorClick);
    return () => window.removeEventListener("click", handleAnchorClick);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ width: 0, opacity: 1 }}
          animate={{ 
            width: "70%", 
            transition: { duration: 15, ease: [0.1, 0.05, 0.1, 1] } 
          }}
          exit={{ 
            width: "100%", 
            opacity: 0,
            transition: { duration: 0.3 } 
          }}
          className="fixed top-0 left-0 h-[3px] z-[9999] pointer-events-none"
          style={{ background: "linear-gradient(90deg,#4F55F1 0%,#6468F3 55%,#8B8FF7 100%)", boxShadow: "0 0 12px rgba(79,85,241,.6)" }}
        />
      )}
    </AnimatePresence>
  );
}
