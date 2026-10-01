"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, CheckCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BODY, GRAD, INDIGO, INK, SANS } from "./aqStyle";

export default function Topbar({ progress = 0 }: { progress?: number }) {
  const { t } = useTranslation("auditor-questionnaire");
  const [modalContent, setModalContent] = useState<"export" | "save" | null>(null);

  useEffect(() => {
    if (!modalContent) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalContent(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalContent]);

  return (
    <>
      <div className="lg:sticky lg:top-[72px] z-10 bg-white border-b border-[#E4E4E7] px-5 sm:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div>
            <h1 style={{ margin: 0, fontFamily: SANS, fontSize: "clamp(24px,2.2vw,30px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15, color: INK }}>{t("topbar.title")}</h1>
            <p style={{ margin: "6px 0 0", fontFamily: BODY, fontSize: 14, lineHeight: 1.5, color: "#71717A" }}>{t("topbar.desc")}</p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button type="button" onClick={() => setModalContent("export")} className="a4-btn a4-btn-outline" style={{ height: 40, padding: "0 16px", fontSize: 14 }}>
              <Download className="w-4 h-4" aria-hidden="true" />
              {t("topbar.actions.export", "Export")}
            </button>
            <button type="button" onClick={() => setModalContent("save")} className="a4-btn a4-btn-ink" style={{ height: 40, padding: "0 18px", fontSize: 14 }}>
              <CheckCircle className="w-4 h-4" aria-hidden="true" />
              {t("topbar.actions.approveAll", "Save & Continue")}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 overflow-hidden" style={{ height: 6, borderRadius: 3, background: "#F4F4F5" }}>
            <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, borderRadius: 3, background: GRAD }} />
          </div>
          <div className="whitespace-nowrap" style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: "#52525B" }}>
            {t("topbar.progressLabel", "Overall Progress")} <span style={{ color: INDIGO }}>({progress}%)</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalContent && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(9,9,11,.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
            onClick={(e) => e.target === e.currentTarget && setModalContent(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="aq-modal-title"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-sm"
              style={{ background: "#FFFFFF", borderRadius: 28, border: "1px solid #E4E4E7", boxShadow: "0 50px 120px rgba(9,9,11,.25)", padding: 28 }}
            >
              <div className="flex justify-between items-start mb-5">
                <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(79,85,241,.1)", color: INDIGO, display: "grid", placeItems: "center" }}>
                  {modalContent === "export" ? <Download className="w-5 h-5" aria-hidden="true" /> : <CheckCircle className="w-5 h-5" aria-hidden="true" />}
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setModalContent(null)}
                  style={{ width: 36, height: 36, borderRadius: 18, display: "grid", placeItems: "center", border: "1px solid #E4E4E7", background: "#FFFFFF", color: "#52525B", cursor: "pointer" }}
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <h3 id="aq-modal-title" style={{ margin: 0, fontFamily: SANS, fontSize: 22, fontWeight: 600, letterSpacing: "-0.03em", color: INK }}>
                {modalContent === "export" ? "Export Data" : "Save & Continue"}
              </h3>
              <p style={{ margin: "10px 0 28px", fontFamily: BODY, fontSize: 15, lineHeight: 1.55, color: "#52525B" }}>
                {modalContent === "export"
                  ? "Your data export is being prepared securely. A link will be generated momentarily."
                  : "All your changes have been securely saved to the server. You can safely proceed to the next step."}
              </p>
              <div className="flex gap-2.5 justify-end">
                <button type="button" onClick={() => setModalContent(null)} className="a4-btn a4-btn-outline" style={{ height: 40, padding: "0 18px", fontSize: 14 }}>
                  Cancel
                </button>
                <button type="button" onClick={() => setModalContent(null)} className="a4-btn a4-btn-ink" style={{ height: 40, padding: "0 18px", fontSize: 14 }}>
                  {modalContent === "export" ? "Confirm Export" : "Continue"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
