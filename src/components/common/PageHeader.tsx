"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import LocalizedLink from "@/components/common/LocalizedLink";
import { servicesData } from "@/data/servicesData";
import { DARK_GRID, DriftGlow, Slab, TypeText } from "@/components/fx/primitives";
import type { TypeSegment } from "@/lib/fx/engine";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
}

const PER = 38;

/**
 * Legacy page header in the A4 hero style (prefer `PageHero` for new work):
 * dark grid, drifting indigo glow, the skewed slab, the breadcrumb trail in
 * the eyebrow slot and a typewriter title with its last word on the gradient.
 * It breaks out of any centred container so it always runs full-bleed.
 */
const PageHeader = ({ title, breadcrumbs }: PageHeaderProps) => {
  const { t } = useTranslation("common");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const text = String(title ?? "");
  const cut = text.lastIndexOf(" ");
  const segments: TypeSegment[] =
    cut > 0 ? [{ t: text.slice(0, cut + 1), c: "#FFFFFF" }, { t: text.slice(cut + 1), g: true }] : [{ t: text, g: true }];
  const size = text.length <= 24 ? "clamp(46px,7.4vw,124px)" : text.length <= 44 ? "clamp(40px,5.8vw,96px)" : "clamp(34px,4.6vw,76px)";
  const crumb: React.CSSProperties = { color: "#A1A1AA", textDecoration: "none", transition: "color .25s" };

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        minHeight: "clamp(460px, 64vh, 720px)",
        display: "flex",
        flexDirection: "column",
        color: "#FFFFFF",
        background: DARK_GRID,
        fontFamily: "var(--a4x-display)",
      }}
    >
      <DriftGlow left="28%" top="-30%" strength={0.26} />
      <div data-hero-par="" aria-hidden="true" style={{ position: "absolute", right: "-20vw", top: "18vh", width: "44vw", height: "80vh", pointerEvents: "none" }}>
        <div data-fx="slab" data-d="80" style={{ position: "absolute", inset: 0 }}>
          <Slab opacity={0.45} />
        </div>
      </div>
      <div
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
          padding: "clamp(128px,14vw,168px) clamp(20px,5vw,72px) clamp(64px,8vw,104px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "clamp(20px,2.6vw,32px)",
        }}
      >
        <nav
          aria-label="Breadcrumb"
          data-fx="rise"
          data-d="100"
          style={{ position: "relative", zIndex: 5, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 12px", fontSize: "clamp(15px,1.3vw,18px)", fontWeight: 600, letterSpacing: ".02em" }}
        >
          <span aria-hidden="true" style={{ display: "inline-block", width: 10, height: 10, borderRadius: 1, background: "#8B8FF7", transform: "skewX(-30deg)" }} />
          <LocalizedLink href="/" style={crumb} className="hover:!text-white">
            {t("pageHeader.home")}
          </LocalizedLink>
          {breadcrumbs.map((item, index) => {
            const last = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={index}>
                <span aria-hidden="true" style={{ color: "#3F3F46" }}>
                  /
                </span>
                {item.label === "Services" ? (
                  <div style={{ position: "relative" }} onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
                    <button
                      type="button"
                      aria-expanded={dropdownOpen}
                      aria-haspopup="true"
                      onClick={() => setDropdownOpen((o) => !o)}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: 0, border: 0, background: "transparent", cursor: "pointer", font: "inherit", color: dropdownOpen ? "#FFFFFF" : "#A1A1AA" }}
                    >
                      {item.label}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden="true" style={{ transform: `rotate(${dropdownOpen ? 180 : 0}deg)`, transition: "transform .3s" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {dropdownOpen ? (
                      <div style={{ position: "absolute", top: "100%", left: 0, paddingTop: 12, width: 280, zIndex: 20 }}>
                        <div
                          style={{
                            padding: 8,
                            borderRadius: 20,
                            background: "rgba(24,24,27,.96)",
                            border: "1px solid rgba(255,255,255,.1)",
                            boxShadow: "0 30px 80px rgba(0,0,0,.45)",
                            backdropFilter: "blur(14px)",
                            WebkitBackdropFilter: "blur(14px)",
                          }}
                        >
                          {servicesData.map((service) => (
                            <LocalizedLink
                              key={service.id}
                              href={`/services/${service.slug}`}
                              onClick={() => setDropdownOpen(false)}
                              className="block rounded-[14px] px-4 py-3 text-[14px] font-medium text-[#D4D4D8] no-underline transition-colors hover:bg-white/[.06] hover:text-white"
                            >
                              {service.title}
                            </LocalizedLink>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : item.href ? (
                  <LocalizedLink href={item.href} style={crumb} className="hover:!text-white">
                    {item.label}
                  </LocalizedLink>
                ) : (
                  <span aria-current={last ? "page" : undefined} style={{ color: last ? "#8B8FF7" : "#A1A1AA" }}>
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
        <h1 style={{ margin: 0, maxWidth: 1180, fontSize: size, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.04, textWrap: "balance" }}>
          <TypeText segments={segments} per={PER} d={240} caret="#8B8FF7" />
        </h1>
      </div>
    </section>
  );
};

export default PageHeader;
