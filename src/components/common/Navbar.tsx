"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import { ArrowRight, ArrowUpRight, Linkedin } from "lucide-react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { A4Mark, DARK_CARD, DARK_GRID } from "@/components/fx/primitives";
import { stripLocaleFromPathname } from "@/lib/localized-path";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n-config";
import { A4_SERVICES_VISIBLE } from "@/data/a4ServicesSiteData";
import { RESOURCE_CARDS } from "@/data/a4ResourcesSiteData";
import { CONTACT_EMAIL, CONTACT_EMAIL_HREF, CONTACT_PHONES, LINKEDIN_COMPANY_URL } from "@/lib/contact";
import { CLIENT_LOGIN_URL } from "@/lib/external-links";

/**
 * Site navigation in the A4 design language (the "A4 Quotation" landing):
 * a fixed 72px bar — transparent over a dark hero, ink with blur once the
 * page moves — the A4 mark + wordmark, dark-glass dropdowns, a white pill CTA,
 * and a full-screen dark menu below lg.
 */

type NavDropdownId = "platform" | "services" | "resources";
type NavLink = { id: string; label: string; href: string; dropdown?: NavDropdownId };

const HIDE_CHROME = ["/privacy-policy", "/terms-and-conditions", "/cookie-policy"];
const BAR_H = 72;
const SANS = "var(--a4x-display)";

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transform: `rotate(${open ? 180 : 0}deg)`, transition: "transform .35s cubic-bezier(.16,1,.3,1)" }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

const Navbar = () => {
  const pathname = usePathname();
  const { t } = useTranslation("common");
  const barePath = stripLocaleFromPathname(pathname);
  const activeLocale: Locale = useMemo(() => {
    const seg = pathname.split("/").filter(Boolean)[0];
    return seg && isLocale(seg) ? seg : defaultLocale;
  }, [pathname]);
  const compact = activeLocale !== "en";

  const [open, setOpen] = useState<NavDropdownId | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<NavDropdownId | null>(null);
  const [solid, setSolid] = useState(false);
  const [darkTop, setDarkTop] = useState(true);
  // Tucked away while scrolling down so the scroll films play full screen; back on scroll up.
  const [tucked, setTucked] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<number | null>(null);

  // Transparent at the top only over a dark hero; anything else gets the bar.
  useEffect(() => {
    let lastY = window.scrollY || 0;
    const check = () => {
      const y = window.scrollY || 0;
      setSolid(y > 30);
      if (Math.abs(y - lastY) > 8) {
        const focusInside = !!headerRef.current?.contains(document.activeElement);
        setTucked(y > lastY && y > 240 && !focusInside);
        lastY = y;
      }
    };
    const detectHero = () => {
      const first = document.querySelector("main [data-hero], #main-content [data-hero], [data-hero]");
      setDarkTop(!!first && first.getBoundingClientRect().top < 120);
    };
    check();
    const t1 = window.setTimeout(detectHero, 0);
    const t2 = window.setTimeout(detectHero, 600);
    window.addEventListener("scroll", check, { passive: true });
    return () => {
      window.removeEventListener("scroll", check);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname]);

  // Route change closes everything.
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const links: NavLink[] = useMemo(
    () => [
      { id: "home", label: t("nav.home"), href: "/" },
      { id: "about", label: t("nav.resource.about"), href: "/about" },
      { id: "platform", label: t("nav.platform"), href: "/portal/client-portal", dropdown: "platform" },
      { id: "services", label: t("nav.services"), href: "/services", dropdown: "services" },
      { id: "partners", label: t("nav.partners"), href: "/partners" },
      { id: "pricing", label: t("nav.pricing"), href: "/pricing" },
      { id: "resources", label: t("nav.resources"), href: "/resources", dropdown: "resources" },
    ],
    [t]
  );

  const services = useMemo(
    () => A4_SERVICES_VISIBLE.map((s) => ({ id: s.key, href: `/services/${s.slug}`, label: s.name })),
    []
  );
  const resources = useMemo(
    () => RESOURCE_CARDS.filter((c) => c.href !== "/about").map((c) => ({ href: c.href, label: c.t })),
    []
  );
  const portals = useMemo(
    () => [
      { href: "/portal/client-portal", label: t("nav.portal.client") },
      { href: "/portal/accounting-portal", label: t("nav.portal.accounting") },
      { href: "/portal/audit-portal", label: t("nav.portal.audit") },
    ],
    [t]
  );

  const openNow = useCallback((id: NavDropdownId) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(id);
  }, []);
  const closeSoon = useCallback(() => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(null), 140);
  }, []);

  if (HIDE_CHROME.includes(barePath)) return null;

  const filled = solid || !darkTop || open !== null;
  const hidden = tucked && open === null && !mobileOpen;
  const isActive = (href: string) => (href === "/" ? barePath === "/" || barePath === "" : barePath.startsWith(href));

  const linkStyle = (active: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 40,
    padding: "0 2px",
    fontFamily: SANS,
    fontSize: 15,
    fontWeight: 500,
    color: active ? "#FFFFFF" : "#D4D4D8",
    background: "transparent",
    border: 0,
    cursor: "pointer",
    whiteSpace: "nowrap",
    textDecoration: "none",
    transition: "color .25s",
  });

  return (
    <>
      <header
        ref={headerRef}
        onFocus={() => setTucked(false)}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 60,
          height: BAR_H,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 clamp(16px,4vw,48px)",
          background: filled ? "rgba(9,9,11,.82)" : "rgba(9,9,11,0)",
          borderBottom: `1px solid ${filled ? "rgba(255,255,255,.08)" : "rgba(255,255,255,0)"}`,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          transform: hidden ? "translateY(-100%)" : "none",
          transition: "background .4s, border-color .4s, transform .5s cubic-bezier(.16,1,.3,1)",
          color: "#FFFFFF",
          fontFamily: SANS,
        }}
        onMouseLeave={closeSoon}
      >
        <LocalizedLink href="/" aria-label="A4 Services — home" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "#FFFFFF", flexShrink: 0 }}>
          <A4Mark size={26} />
        </LocalizedLink>
        {/* The firm/software split, above the fold: A4 is the firm, Vacei the software we build. */}
        <a
          href="https://vacei.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="A4 Services is the firm behind Vacei, the software platform"
          className="hidden xl:inline-flex"
          style={{ alignItems: "center", gap: 6, lineHeight: "28px", padding: "0 12px", borderRadius: 999, border: "1px solid rgba(255,255,255,.14)", color: "#A1A1AA", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", textDecoration: "none" }}
        >
          The firm behind <span style={{ color: "#FFFFFF" }}>Vacei</span>
          <ArrowUpRight size={13} aria-hidden="true" />
        </a>

        <nav aria-label="Main" className="hidden lg:flex" style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: compact ? 18 : 26 }}>
          {links.map((link) =>
            link.dropdown ? (
              <div key={link.id} onMouseEnter={() => openNow(link.dropdown!)} style={{ position: "relative" }}>
                <button
                  type="button"
                  aria-expanded={open === link.dropdown}
                  aria-haspopup="true"
                  onClick={() => setOpen(open === link.dropdown ? null : link.dropdown!)}
                  style={linkStyle(open === link.dropdown || isActive(link.href))}
                >
                  {link.label}
                  <Chevron open={open === link.dropdown} />
                </button>
              </div>
            ) : (
              <LocalizedLink key={link.id} href={link.href} style={linkStyle(isActive(link.href))} onMouseEnter={closeSoon}>
                {link.label}
              </LocalizedLink>
            )
          )}
        </nav>
        <div className="lg:hidden" style={{ flex: 1 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <a
            href={CLIENT_LOGIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex"
            style={{ alignItems: "center", height: 40, padding: "0 16px", borderRadius: 999, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.06)", color: "#FFFFFF", fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", textDecoration: "none" }}
          >
            {t("nav.login")}
          </a>
          <LocalizedLink
            href="/quote"
            style={{ display: "inline-flex", alignItems: "center", height: 40, padding: "0 18px", borderRadius: 999, background: "#FFFFFF", color: "#09090B", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", textDecoration: "none" }}
          >
            Get a quote
          </LocalizedLink>
          <button
            type="button"
            className="grid lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            style={{ width: 44, height: 40, placeItems: "center", borderRadius: 999, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.06)", color: "#FFFFFF", cursor: "pointer" }}
          >
            <span aria-hidden="true" style={{ position: "relative", width: 18, height: 12 }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: i * 5,
                    height: 2,
                    borderRadius: 1,
                    background: "#FFFFFF",
                    transform: mobileOpen ? (i === 0 ? "translateY(5px) rotate(45deg)" : i === 2 ? "translateY(-5px) rotate(-45deg)" : "scaleX(0)") : "none",
                    transition: "transform .35s cubic-bezier(.16,1,.3,1)",
                  }}
                />
              ))}
            </span>
          </button>
        </div>

        {/* Dropdown panel — dark glass, under the bar. */}
        {open ? (
          <div
            onMouseEnter={() => openNow(open)}
            onMouseLeave={closeSoon}
            className="hidden lg:flex"
            style={{ position: "absolute", top: BAR_H, left: 0, right: 0, justifyContent: "center", padding: "10px 16px 0", pointerEvents: "none" }}
          >
            <div
              key={open}
              style={{
                pointerEvents: "auto",
                width: "min(1040px, 100%)",
                display: "grid",
                gridTemplateColumns: "1fr 300px",
                gap: 16,
                padding: 16,
                borderRadius: 24,
                background: "rgba(24,24,27,.96)",
                border: "1px solid rgba(255,255,255,.1)",
                boxShadow: "0 40px 100px rgba(0,0,0,.45)",
                animation: "a4-drop .45s cubic-bezier(.16,1,.3,1) both",
              }}
            >
              <div style={{ padding: "10px 8px" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "0 10px 12px", fontSize: 15, fontWeight: 600, color: "#A1A1AA" }}>
                  <span style={{ color: "#8B8FF7" }}>
                    {open === "services" ? "01" : open === "platform" ? "02" : "03"}
                  </span>
                  {open === "services" ? t("nav.browseByService") : open === "platform" ? t("nav.portals") : t("nav.browseResources")}
                </div>
                <div
                  className="nav-resources-scrollbar"
                  style={{
                    display: "grid",
                    gridTemplateColumns: open === "platform" ? "1fr" : "1fr 1fr",
                    gap: 2,
                    maxHeight: "min(420px, 60vh)",
                    overflowY: "auto",
                  }}
                >
                  {(open === "services" ? services : open === "platform" ? portals : resources).map((item) => (
                    <LocalizedLink
                      key={item.href}
                      href={item.href}
                      className="a4-nav-item"
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "11px 12px", borderRadius: 12, color: "#E4E4E7", fontSize: 15, fontWeight: 500, textDecoration: "none" }}
                    >
                      <span>{item.label}</span>
                      <ArrowRight size={15} aria-hidden="true" className="a4-nav-arrow" />
                    </LocalizedLink>
                  ))}
                </div>
              </div>
              <LocalizedLink
                href={open === "services" ? "/services" : open === "platform" ? "/portal/client-portal" : "/resources"}
                style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 260, padding: 22, borderRadius: 18, background: DARK_CARD, border: "1px solid rgba(255,255,255,.08)", color: "#FFFFFF", textDecoration: "none" }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: ".02em", color: "#8B8FF7" }}>
                  {open === "services" ? t("nav.ourServices") : open === "platform" ? t("nav.securePlatform") : t("nav.resources")}
                </span>
                <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.05 }}>
                  {open === "services" ? (
                    <>
                      Every service.<br />
                      <span className="a4-grad-text">One portal.</span>
                    </>
                  ) : open === "platform" ? (
                    <>
                      Your own <span className="a4-grad-text">portal.</span>
                    </>
                  ) : (
                    <>
                      Guides, tools <span className="a4-grad-text">and answers.</span>
                    </>
                  )}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#E4E4E7" }}>
                  {open === "services" ? t("nav.viewAllServices") : open === "platform" ? t("nav.goToDashboard") : t("nav.viewResourcesHub")}
                  <ArrowRight size={15} aria-hidden="true" />
                </span>
              </LocalizedLink>
            </div>
          </div>
        ) : null}
      </header>

      {/* Full-screen menu below lg — the dark grid, big Outfit links. */}
      {mobileOpen ? (
        <div
          className="lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          style={{ position: "fixed", inset: 0, zIndex: 59, background: DARK_GRID, color: "#FFFFFF", overflowY: "auto", paddingTop: BAR_H, fontFamily: SANS, animation: "a4-fade .35s ease both" }}
        >
          <div style={{ padding: "18px clamp(20px,5vw,48px) 40px", display: "flex", flexDirection: "column" }}>
            {links.map((link, i) => (
              <div key={link.id} style={{ borderBottom: "1px solid rgba(255,255,255,.08)", animation: `a4-rise .6s cubic-bezier(.16,1,.3,1) ${60 + i * 50}ms both` }}>
                {link.dropdown ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setMobileSection(mobileSection === link.dropdown ? null : link.dropdown!)}
                      aria-expanded={mobileSection === link.dropdown}
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 0", background: "transparent", border: 0, color: "#FFFFFF", fontSize: 30, fontWeight: 600, letterSpacing: "-0.03em", cursor: "pointer", fontFamily: SANS }}
                    >
                      <span>{link.label}</span>
                      <Chevron open={mobileSection === link.dropdown} />
                    </button>
                    {mobileSection === link.dropdown ? (
                      <div style={{ display: "grid", gap: 2, paddingBottom: 16 }}>
                        {(link.dropdown === "services" ? services : link.dropdown === "platform" ? portals : resources).map((item) => (
                          <LocalizedLink key={item.href} href={item.href} onClick={() => setMobileOpen(false)} style={{ padding: "10px 0", color: "#D4D4D8", fontSize: 17, fontWeight: 500, textDecoration: "none" }}>
                            {item.label}
                          </LocalizedLink>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <LocalizedLink href={link.href} onClick={() => setMobileOpen(false)} style={{ display: "block", padding: "18px 0", color: "#FFFFFF", fontSize: 30, fontWeight: 600, letterSpacing: "-0.03em", textDecoration: "none" }}>
                    {link.label}
                  </LocalizedLink>
                )}
              </div>
            ))}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 28 }}>
              <LocalizedLink href="/quote" onClick={() => setMobileOpen(false)} className="a4-btn a4-btn-light" style={{ flex: "1 1 200px" }}>
                Get a quote
              </LocalizedLink>
              <a href={CLIENT_LOGIN_URL} target="_blank" rel="noopener noreferrer" className="a4-btn a4-btn-ghost" style={{ flex: "1 1 200px" }}>
                {t("nav.login")}
              </a>
            </div>
            <div style={{ marginTop: 36, display: "grid", gap: 8, fontFamily: "var(--a4x-body)", fontSize: 15, color: "#A1A1AA" }}>
              {CONTACT_PHONES.map((p) => (
                <a key={p.href} href={p.href} style={{ color: "#E4E4E7", textDecoration: "none" }}>
                  {p.display}
                </a>
              ))}
              <a href={CONTACT_EMAIL_HREF} style={{ color: "#E4E4E7", textDecoration: "none" }}>
                {CONTACT_EMAIL}
              </a>
              <a href={LINKEDIN_COMPANY_URL} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#E4E4E7", textDecoration: "none" }}>
                <Linkedin size={16} aria-hidden="true" /> LinkedIn
              </a>
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        @keyframes a4-drop { from { opacity: 0; transform: translateY(-8px) scale(.985); filter: blur(6px); } to { opacity: 1; transform: none; filter: none; } }
        @keyframes a4-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes a4-rise { from { opacity: 0; transform: translateY(24px); filter: blur(8px); } to { opacity: 1; transform: none; filter: none; } }
        .a4-nav-item:hover { background: rgba(255,255,255,.06); color: #FFFFFF !important; }
        .a4-nav-item .a4-nav-arrow { opacity: 0; transform: translateX(-4px); transition: opacity .25s, transform .35s cubic-bezier(.16,1,.3,1); color: #8B8FF7; }
        .a4-nav-item:hover .a4-nav-arrow { opacity: 1; transform: none; }
        header a:hover, header nav button:hover { color: #FFFFFF; }
      `}</style>
    </>
  );
};

export default Navbar;
