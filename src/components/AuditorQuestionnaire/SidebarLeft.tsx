"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import LocalizedLink from "@/components/common/LocalizedLink";
import { BODY, INDIGO, INK, SANS, kicker, pill } from "./aqStyle";

interface NavItem {
  id: string;
  name: string;
  sub: string;
  status: string;
  count: number;
}

interface SidebarLeftProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  navItems: NavItem[];
}

/** Status dot: done = indigo, attention = indigo ring, exception = ink, no queries = grey ring. */
function Dot({ status }: { status: string }) {
  const base: React.CSSProperties = { width: 10, height: 10, borderRadius: 5, flexShrink: 0 };
  if (status === "danger") return <span style={{ ...base, background: INK }} />;
  if (status === "warn") return <span style={{ ...base, border: `2px solid ${INDIGO}` }} />;
  if (status === "success") return <span style={{ ...base, background: INDIGO }} />;
  return <span style={{ ...base, border: "1.5px solid #D4D4D8" }} />;
}

export default function SidebarLeft({ activeTab, onTabChange, navItems }: SidebarLeftProps) {
  const { t } = useTranslation("auditor-questionnaire");

  return (
    <aside className="flex flex-col overflow-y-auto lg:sticky lg:top-[72px] lg:h-[calc(100vh-72px)] border-b lg:border-b-0 border-[#E4E4E7]" style={{ background: "#FAFAFA" }}>
      {/* Brand */}
      <div className="p-6 border-b border-[#E4E4E7]">
        <div style={{ ...kicker, color: INDIGO, marginBottom: 8 }}>{t("sidebarLeft.brandMark")}</div>
        <div style={{ fontFamily: SANS, fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", color: INK }}>{t("sidebarLeft.brandName")}</div>
        <div style={{ marginTop: 2, fontFamily: BODY, fontSize: 12.5, color: "#71717A" }}>{t("sidebarLeft.brandSub")}</div>
      </div>

      {/* Nav */}
      <div className="flex-1 py-4">
        <div className="px-6 py-2" style={kicker}>
          {t("sidebarLeft.sectionsLabel")}
        </div>

        <div className="flex flex-col mt-1">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? "true" : undefined}
                onClick={() => onTabChange(item.id)}
                className="flex items-center text-left gap-3 px-6 py-3 transition-colors hover:bg-[#F4F4F5] focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[rgba(79,85,241,.55)]"
                style={{ borderLeft: `2px solid ${active ? INDIGO : "transparent"}`, background: active ? "rgba(79,85,241,.06)" : undefined, cursor: "pointer" }}
              >
                <Dot status={item.status} />
                <div className="flex-1 min-w-0">
                  <div style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 600, color: active ? INDIGO : INK }}>{item.name}</div>
                  <div style={{ marginTop: 1, fontFamily: BODY, fontSize: 11.5, color: "#71717A" }}>{item.sub}</div>
                </div>
                {item.count > 0 && <span style={pill(item.status === "danger" ? "flag" : "done", { height: 22, padding: "0 8px" })}>{item.count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-[#E4E4E7] mt-auto">
        <LocalizedLink href="/accounting" className="a4-btn a4-btn-outline" style={{ height: 36, padding: "0 14px", fontSize: 13, marginBottom: 16, textDecoration: "none" }}>
          ← Back to Site
        </LocalizedLink>
        <div className="whitespace-pre-line" style={{ fontFamily: BODY, fontSize: 11.5, lineHeight: 1.55, color: "#71717A" }}>
          {t("sidebarLeft.footer")}
        </div>
      </div>
    </aside>
  );
}
