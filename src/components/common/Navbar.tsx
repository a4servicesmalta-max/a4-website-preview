"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import LocalizedLink from "@/components/common/LocalizedLink";

import { stripLocaleFromPathname } from "@/lib/localized-path";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n-config";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Layers,
  Linkedin,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useReduceMotion, usePerformance } from "@/contexts/ReduceMotionContext";
import { A4_SERVICES_VISIBLE } from "@/data/a4ServicesSiteData";
import { RESOURCE_CARDS } from "@/data/a4ResourcesSiteData";
import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_HREF,
  CONTACT_PHONES,
  LINKEDIN_COMPANY_URL,
} from "@/lib/contact";
import { CLIENT_LOGIN_URL, CLIENT_ONBOARDING_URL } from "@/lib/external-links";

// Logo path from assets
const Logo = "/assets/images/a4-logo-new.webp";
const LogoMarkWhite = "/assets/a4-mark-white.png";

type NavDropdownId = "platform" | "services" | "resources";

const Navbar = () => {
  const pathname = usePathname();
  const { t } = useTranslation("common");
  const barePath = stripLocaleFromPathname(pathname);

  const activeLocale: Locale = useMemo(() => {
    const seg = pathname.split("/").filter(Boolean)[0];
    return seg && isLocale(seg) ? seg : defaultLocale;
  }, [pathname]);
  const widenNavForI18n = activeLocale !== "en";
  const [portalsOpen, setPortalsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hamburgerHover, setHamburgerHover] = useState(false);
  const [isDarkBackground, setIsDarkBackground] = useState(false); // Default to light background
  const { isIPhone, isLowPerformance } = usePerformance();

  // Check if mobile screen
  const [isMobile, setIsMobile] = useState(false);

  const hideChromeRoutes = [
    "/privacy-policy",
    "/terms-and-conditions",
    "/cookie-policy",
  ];
  const shouldHideChrome = hideChromeRoutes.includes(barePath);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Detect dark/light background behind navbar on scroll
  useEffect(() => {
    const getClassName = (element: HTMLElement): string => {
      // Safely convert className to string (handles DOMTokenList, SVGAnimatedString, etc.)
      if (typeof element.className === 'string') {
        return element.className;
      }
      if (element.className && typeof element.className === 'object') {
        const classNameObj = element.className as any;
        // Handle DOMTokenList
        if ('value' in classNameObj) {
          return String(classNameObj.value);
        }
        // Handle SVGAnimatedString
        if ('baseVal' in classNameObj) {
          return String(classNameObj.baseVal);
        }
      }
      // Fallback to getAttribute
      return element.getAttribute('class') || '';
    };

    const checkBackground = (element: HTMLElement | null): boolean => {
      if (!element || element === document.body) return false;

      const bgColor = window.getComputedStyle(element).backgroundColor;
      const bgClass = getClassName(element);

      // Check for dark background classes first
      const isDarkClass = bgClass.includes('bg-hero') ||
        bgClass.includes('bg-[#000000]') ||
        bgClass.includes('bg-card') ||
        bgClass.includes('bg-gradient-container') ||
        bgClass.includes('bg-hero-dark') ||
        bgClass.includes('bg-[#111111]') ||
        bgClass.includes('bg-[#222222]') ||
        bgClass.includes('bg-[#1e1e2f]');

      if (isDarkClass) return true;

      // Check for light background classes
      const isLightClass = bgClass.includes('bg-background') ||
        bgClass.includes('bg-white') ||
        bgClass.includes('bg-section-light') ||
        bgClass.includes('bg-[#ecf0f0]') ||
        bgClass.includes('bg-[#d8e5e5]');

      if (isLightClass) return false;

      // Check background color luminance
      const rgbMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (rgbMatch && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        if (luminance < 0.5) return true; // Dark
        if (luminance > 0.7) return false; // Light
      }

      // Recursively check parent
      return checkBackground(element.parentElement);
    };

    const handleScroll = () => {
      const navbar = document.querySelector('nav');
      if (!navbar) {
        setIsDarkBackground(false);
        return;
      }

      const scrollY = window.scrollY || window.pageYOffset;

      // Homepage uses a light hero: keep nav in “dark text on light bar” until well past the hero
      if (barePath === "/" || barePath === "") {
        if (scrollY < 200) {
          setIsDarkBackground(false);
          return;
        }
      }

      // PERFORMANCE: Skip expensive background detection on iPhone/low-performance devices
      if (isIPhone || isLowPerformance) {
        // Light hero at top: use dark link text (isDarkBackground false). Past hero, allow contrast flip.
        setIsDarkBackground(scrollY >= 200);
        return;
      }

      const navbarRect = navbar.getBoundingClientRect();
      const isAtTop = scrollY < 10; // Consider "at top" if scrolled less than 10px

      // At the top of the page, check navbar's own background and body background
      if (isAtTop) {
        // Check navbar's own background first
        const navElement = navbar as HTMLElement;
        const navBgColor = window.getComputedStyle(navElement).backgroundColor;
        const navBgClass = getClassName(navElement);

        // Check if navbar has explicit light background classes
        const hasLightClass = navBgClass.includes('bg-white') ||
          navBgClass.includes('bg-background') ||
          navBgClass.includes('bg-white/');

        if (hasLightClass) {
          setIsDarkBackground(false);
          return;
        }

        // Check navbar background color luminance
        const rgbMatch = navBgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1]);
          const g = parseInt(rgbMatch[2]);
          const b = parseInt(rgbMatch[3]);
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          // If navbar background is light, use dark text
          if (luminance > 0.6) {
            setIsDarkBackground(false);
            return;
          }
        }

        // Check body background as fallback
        const bodyBgColor = window.getComputedStyle(document.body).backgroundColor;
        const bodyRgbMatch = bodyBgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (bodyRgbMatch) {
          const r = parseInt(bodyRgbMatch[1]);
          const g = parseInt(bodyRgbMatch[2]);
          const b = parseInt(bodyRgbMatch[3]);
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

          if (luminance > 0.6) {
            setIsDarkBackground(false);
            return;
          }
        }

        // Default to light background (dark text) at top
        setIsDarkBackground(false);
        return;
      }

      // When scrolled, check what's below the navbar
      const checkY = navbarRect.bottom + 20;

      // Check multiple points for better accuracy
      const checkPoints = [
        window.innerWidth / 2, // Center
        window.innerWidth * 0.25, // Left quarter
        window.innerWidth * 0.75, // Right quarter
      ];

      let darkCount = 0;
      let lightCount = 0;

      for (const checkX of checkPoints) {
        const elementAtPoint = document.elementFromPoint(checkX, checkY);

        if (!elementAtPoint) {
          lightCount++;
          continue;
        }

        // Skip navbar elements
        if ((elementAtPoint as HTMLElement).closest('nav')) {
          continue;
        }

        const isDark = checkBackground(elementAtPoint as HTMLElement);
        if (isDark) {
          darkCount++;
        } else {
          lightCount++;
        }
      }

      // Use majority vote, default to light if uncertain
      setIsDarkBackground(darkCount > lightCount);
    };

    // Throttle scroll events for performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial check - run immediately and also after a short delay to ensure DOM is ready
    handleScroll(); // Immediate check
    const initialCheck = setTimeout(() => {
      handleScroll();
    }, 100);

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      clearTimeout(initialCheck);
      window.removeEventListener('scroll', throttledHandleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [barePath, isIPhone, isLowPerformance]);

  const navLinks = useMemo(
    () => [
      {
        id: "home",
        dropdownId: undefined,
        label: t("nav.home"),
        href: "/",
        hasDropdown: false,
        isOpen: undefined,
        setIsOpen: undefined,
      },
      {
        id: "about",
        dropdownId: undefined,
        label: t("nav.resource.about"),
        href: "/about",
        hasDropdown: false,
        isOpen: undefined,
        setIsOpen: undefined,
      },
      {
        id: "platform",
        dropdownId: "platform" as NavDropdownId,
        label: t("nav.platform"),
        href: "/#platform",
        hasDropdown: true,
        isOpen: portalsOpen,
        setIsOpen: setPortalsOpen,
      },
      {
        id: "services",
        dropdownId: "services" as NavDropdownId,
        label: t("nav.services"),
        href: "/services",
        hasDropdown: true,
        isOpen: servicesOpen,
        setIsOpen: setServicesOpen,
      },
      {
        id: "partners",
        dropdownId: undefined,
        label: t("nav.partners"),
        href: "/partners",
        hasDropdown: false,
        isOpen: undefined,
        setIsOpen: undefined,
      },
      {
        id: "pricing",
        dropdownId: undefined,
        label: t("nav.pricing"),
        href: "/pricing",
        hasDropdown: false,
        isOpen: undefined,
        setIsOpen: undefined,
      },
      {
        id: "resources",
        dropdownId: "resources" as NavDropdownId,
        label: t("nav.resources"),
        href: "/resources",
        hasDropdown: true,
        isOpen: resourcesOpen,
        setIsOpen: setResourcesOpen,
      },
    ],
    [t, portalsOpen, servicesOpen, resourcesOpen]
  );

  const servicesList = useMemo(
    () =>
      A4_SERVICES_VISIBLE.map((service) => ({
        id: service.key,
        slug: service.slug,
        title: service.name,
      })),
    []
  );

  const resourceLinks = useMemo(
    () =>
      RESOURCE_CARDS.filter((card) => card.href !== "/about").map((card) => ({
        label: card.t,
        href: card.href,
      })),
    []
  );

  const portalLinks = useMemo(
    () => [
      { label: t("nav.portal.client"), href: "/portal/client-portal" },
      { label: t("nav.portal.accounting"), href: "/portal/accounting-portal" },
      { label: t("nav.portal.audit"), href: "/portal/audit-portal" },
    ],
    [t]
  );

  if (shouldHideChrome) {
    return null;
  }

  // Keep dynamic dark/light navbar on desktop, force solid white navbar on mobile.
  const useDarkNavbarTheme = !isMobile && isDarkBackground;

  return (
    <>
      <div className="flex justify-center w-full relative z-[60]">
        <nav
          className={cn(
            "fixed top-2 sm:top-4 w-full px-3 sm:px-4 lg:px-8 pointer-events-none",
            widenNavForI18n
              ? "max-w-[min(128rem,calc(100%-0.5rem))] xl:max-w-[138rem] 2xl:max-w-[148rem]"
              : "max-w-7xl"
          )}
        >
          {/* Navbar Container – sleek floating pill layout */}
          <motion.div
            initial={false}
            className={`relative pointer-events-auto w-full mx-auto rounded-full ${isMobile
              ? "bg-white border border-gray-200/80 text-black"
              : useDarkNavbarTheme
                ? `bg-white/10 ${isIPhone || isLowPerformance ? "" : "backdrop-blur-xl"} border border-white/20 text-white`
                : `bg-white/80 ${isIPhone || isLowPerformance ? "" : "backdrop-blur-xl"} border border-gray-200/60 text-black`
              } shadow-lg shadow-black/5 px-4  sm:px-6 lg:px-8 transition-all duration-300`}
          >
            <div className="flex items-center justify-between min-h-[56px] sm:min-h-[64px] lg:min-h-[80px]">
              {/* Logo - smaller on mobile */}
              <LocalizedLink href="/" className="flex items-center gap-2 shrink-0" onClick={() => setMobileMenuOpen(false)}>
                <div className="flex items-center justify-center">
                  <Image
                    src={Logo}
                    alt="A4"
                    width={100}
                    height={70}
                    className={cn(
                      "object-contain w-20 h-12 sm:w-24 sm:h-14 lg:w-[100px] lg:h-[70px] transition-all duration-300",
                      useDarkNavbarTheme ? "brightness-0 invert" : ""
                    )}
                  />
                </div>
              </LocalizedLink>

              {/* Desktop Navigation Links - Tight spacing with responsive font */}
              <div className="hidden lg:flex items-center gap-6 xl:gap-8 flex-1 justify-center px-4">
                {navLinks.map((link) => (
                  <div
                    key={link.id}
                    className="group h-full flex items-center static"
                    onMouseEnter={() =>
                      link.hasDropdown && link.setIsOpen?.(true)
                    }
                    onMouseLeave={() =>
                      link.hasDropdown && link.setIsOpen?.(false)
                    }
                  >
                    <LocalizedLink
                      href={link.href}
                      className={`${useDarkNavbarTheme ? "text-white" : "text-black"} font-normal text-[15px] ${useDarkNavbarTheme ? "hover:text-primary-blue/80" : "hover:text-primary-blue"} transition-colors flex items-center gap-1 ${link.isOpen ? (useDarkNavbarTheme ? "text-primary-blue/80" : "text-primary-blue") : ""}`}
                      onClick={(e) => {
                        if (link.hasDropdown) {
                          e.preventDefault();
                          link.setIsOpen?.(!link.isOpen);
                        }
                      }}
                    >
                      {link.label}
                      {link.hasDropdown && (
                        <motion.svg
                          animate={{ rotate: link.isOpen ? 180 : 0 }}
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </motion.svg>
                      )}
                    </LocalizedLink>

                    {/* Mega Menu Dropdown */}
                    <AnimatePresence>
                      {link.hasDropdown && link.isOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 15, scale: 0.98 }}
                          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-6 z-50 origin-top pointer-events-auto"
                        >
                          <div
                            className={cn(
                              `bg-white/95 ${isIPhone || isLowPerformance ? "" : "backdrop-blur-xl"} rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-white/60 p-6 overflow-hidden w-max flex gap-8`,
                              widenNavForI18n
                                ? "min-w-[860px] max-w-[min(94vw,98rem)]"
                                : "min-w-[650px] max-w-[90vw]"
                            )}
                          >
                            {link.dropdownId === "services" ? (
                              <>
                                <div className="flex-1 min-w-[280px]">
                                  <LocalizedLink
                                    href="/services"
                                    className="block px-4 py-3 mb-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors group/hub"
                                    onClick={() => link.setIsOpen?.(false)}
                                  >
                                    <div className="text-[15px] font-semibold text-black group-hover/hub:text-primary-blue transition-colors">
                                      {t("nav.ourServices")}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {t("nav.viewAllServices")}
                                    </div>
                                  </LocalizedLink>
                                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pl-3">
                                    {t("nav.browseByService")}
                                  </h3>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                    {servicesList.map((service) => (
                                      <LocalizedLink
                                        key={service.id}
                                        href={`/services/${service.slug}`}
                                        className="block px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group/item"
                                        onClick={() => link.setIsOpen?.(false)}
                                      >
                                        <div className="text-[14px] font-medium text-black group-hover/item:text-primary-blue transition-colors">
                                          {service.title}
                                        </div>
                                      </LocalizedLink>
                                    ))}
                                  </div>
                                </div>
                                <div className="hidden sm:flex w-[240px] lg:w-[280px] shrink-0 rounded-2xl p-6 bg-linear-to-br from-zinc-50 to-zinc-100 border border-zinc-100 flex-col justify-between relative overflow-hidden group">
                                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-zinc-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
                                  <div className="relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-zinc-600 shadow-sm mb-4">
                                      <Layers className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-[15px] font-bold text-slate-900 mb-2">{t("nav.unifiedServices")}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed mb-4">
                                      {t("nav.unifiedServicesBody")}
                                    </p>
                                  </div>
                                  <LocalizedLink href="/services" className="relative z-10 flex items-center gap-2 text-xs font-bold text-zinc-600 group-hover:gap-3 transition-all" onClick={() => link.setIsOpen?.(false)}>
                                    {t("nav.exploreMethodology")} <ArrowRight className="w-4 h-4" />
                                  </LocalizedLink>
                                </div>
                              </>
                            ) : link.dropdownId === "platform" ? (
                              <>
                                <div className="flex-1 min-w-[240px]">
                                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 pl-3">{t("nav.portals")}</h3>
                                  <div className="grid grid-cols-1 gap-1">
                                    {portalLinks.map((item) => (
                                      <LocalizedLink
                                        key={item.href}
                                        href={item.href}
                                        className="block px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group/item"
                                        onClick={() => link.setIsOpen?.(false)}
                                      >
                                        <div className="text-[15px] font-medium text-black group-hover/item:text-primary-blue transition-colors">
                                          {item.label}
                                        </div>
                                      </LocalizedLink>
                                    ))}
                                  </div>
                                </div>
                                <div className="hidden sm:flex w-[240px] lg:w-[280px] shrink-0 rounded-2xl p-6 bg-[#020410] border border-zinc-900/30 flex-col justify-between relative overflow-hidden group">
                                  <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-zinc-600/20 to-transparent blur-xl group-hover:opacity-100 opacity-50 transition-opacity duration-500 pointer-events-none" />
                                  <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-5">
                                      <div className="w-10 h-10 rounded-xl bg-zinc-600 flex items-center justify-center text-white shadow-lg shadow-zinc-500/20">
                                        <ShieldCheck className="w-5 h-5" />
                                      </div>
                                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">{t("nav.systemOk")}</span>
                                      </div>
                                    </div>
                                    <h4 className="text-[15px] font-bold text-white mb-2">{t("nav.securePlatform")}</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed mb-6">
                                      {t("nav.securePlatformBody")}
                                    </p>
                                  </div>
                                  <LocalizedLink href="/portal/client-portal" className="relative z-10 flex items-center justify-center w-full py-2.5 rounded-xl bg-zinc-600 text-white text-xs font-bold hover:bg-zinc-500 transition-colors shadow-sm" onClick={() => link.setIsOpen?.(false)}>
                                    {t("nav.goToDashboard")}
                                  </LocalizedLink>
                                </div>
                              </>
                            ) : link.dropdownId === "resources" ? (
                              <>
                                <div className="flex-1 min-w-[280px]">
                                  <LocalizedLink
                                    href="/resources"
                                    className="block px-4 py-3 mb-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors group/hub"
                                    onClick={() => link.setIsOpen?.(false)}
                                  >
                                    <div className="text-[15px] font-semibold text-black group-hover/hub:text-primary-blue transition-colors">
                                      {t("nav.resources")}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {t("nav.viewResourcesHub")}
                                    </div>
                                  </LocalizedLink>
                                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pl-3">
                                    {t("nav.browseResources")}
                                  </h3>
                                  <div className="nav-resources-scrollbar max-h-[min(380px,58vh)] overflow-y-auto overscroll-contain pr-2">
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                      {resourceLinks.map((item) => (
                                        <LocalizedLink
                                          key={item.href}
                                          href={item.href}
                                          className="block px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group/item"
                                          onClick={() => link.setIsOpen?.(false)}
                                        >
                                          <div className="text-[14px] font-medium text-black group-hover/item:text-primary-blue transition-colors">
                                            {item.label}
                                          </div>
                                        </LocalizedLink>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="hidden sm:flex w-[240px] lg:w-[280px] shrink-0 rounded-2xl p-6 bg-slate-50 border border-slate-200 flex-col justify-between group">
                                  <div>
                                    <div className="flex items-center gap-3 mb-4">
                                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                        <BookOpen className="w-5 h-5" />
                                      </div>
                                      <span className="text-[9px] font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-1 rounded-full border border-orange-100/50 hidden lg:block">{t("nav.newGuide")}</span>
                                    </div>
                                    <h4 className="text-[15px] font-bold text-slate-900 mb-2 group-hover:text-zinc-600 transition-colors">{t("nav.auditReadiness")}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed mb-6">
                                      {t("nav.auditReadinessBody")}
                                    </p>
                                  </div>
                                  <LocalizedLink href="/insights" className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-4 py-2.5 rounded-xl w-max hover:bg-slate-50 hover:text-zinc-600 transition-all shadow-sm" onClick={() => link.setIsOpen?.(false)}>
                                    {t("nav.readNow")}
                                  </LocalizedLink>
                                </div>
                              </>
                            ) : null}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Right Side Actions - Tight spacing */}
              <div className="flex items-center gap-3 lg:gap-4 shrink-0">
                <div className="hidden lg:flex items-center gap-2 xl:gap-3">

                  <a
                    href={CLIENT_LOGIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center ${useDarkNavbarTheme
                      ? "text-white/90 hover:text-white"
                      : "text-black/90 hover:text-primary-blue"
                      } font-medium text-[15px] transition-colors px-2`}
                  >
                    <span>{t("nav.login")}</span>
                  </a>

                </div>

                {/* Mobile: hamburger opens full-screen menu. Desktop: hamburger opens sidebar. */}
                <button
                  className="w-11 h-11 sm:w-12 sm:h-12 flex flex-col items-center justify-center gap-1.5 relative lg:w-10 lg:gap-1.5 rounded-lg active:bg-black/5 lg:active:bg-transparent -m-1 lg:m-0"
                  onClick={() => {
                    if (isMobile) {
                      setMobileMenuOpen(!mobileMenuOpen);
                      setSidebarOpen(false);
                    } else {
                      setSidebarOpen(!sidebarOpen);
                      setMobileMenuOpen(false);
                    }
                  }}
                  onMouseEnter={() => !isMobile && setHamburgerHover(true)}
                  onMouseLeave={() => !isMobile && setHamburgerHover(false)}
                  aria-label="Menu"
                >
                  <motion.div
                    animate={{ rotate: mobileMenuOpen ? 45 : 0, y: mobileMenuOpen ? 8 : 0 }}
                    className={`h-0.5 ${useDarkNavbarTheme ? "bg-white" : "bg-black"} w-6`}
                  />
                  <motion.div
                    animate={{ opacity: mobileMenuOpen ? 0 : 1 }}
                    className="relative w-6 h-0.5"
                  >
                    <div
                      className={`absolute left-0 h-full ${useDarkNavbarTheme ? "bg-white" : "bg-black"} transition-all duration-300 ease-out`}
                      style={{ width: !isMobile && hamburgerHover ? 24 : 16.8 }}
                    />
                  </motion.div>
                  <motion.div
                    animate={{ rotate: mobileMenuOpen ? -45 : 0, y: mobileMenuOpen ? -8 : 0 }}
                    className={`h-0.5 ${useDarkNavbarTheme ? "bg-white" : "bg-black"} w-6`}
                  />
                </button>
              </div>
            </div>

          </motion.div>
        </nav>
      </div>

      {/* Mobile full-screen overlay menu: slides in from right, over homepage, with close option */}
      <AnimatePresence>
        {mobileMenuOpen && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[65] bg-black/30 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-0 z-[70] w-full h-full lg:hidden flex flex-col bg-white shadow-2xl"
            >
              {/* Header: logo + close */}
              <div className="flex items-center justify-between shrink-0 px-4 py-4 sm:px-6 border-b border-gray-200/80">
                <LocalizedLink href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <Image
                    src={Logo}
                    alt="A4"
                    width={120}
                    height={56}
                    className="object-contain h-10 w-auto"
                  />
                </LocalizedLink>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-11 h-11 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Scrollable menu links */}
              <div className="nav-drawer-scrollbar flex-1 overflow-y-auto py-4 px-4 sm:px-6">
                {navLinks.map((link) => (
                  <div key={link.id} className="border-b border-gray-100 last:border-none">
                    <div className="flex items-center justify-between py-3">
                      <LocalizedLink
                        href={link.href}
                        className="text-black font-medium text-base hover:text-primary-blue transition-colors flex-1"
                        onClick={(e) => {
                          if (link.hasDropdown) {
                            e.preventDefault();
                            link.setIsOpen?.(!link.isOpen);
                          } else {
                            setMobileMenuOpen(false);
                          }
                        }}
                      >
                        {link.label}
                      </LocalizedLink>
                      {link.hasDropdown && (
                        <button
                          type="button"
                          onClick={() => link.setIsOpen?.(!link.isOpen)}
                          className="p-2 -mr-2 rounded-lg text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                          aria-expanded={link.isOpen}
                        >
                          <motion.svg
                            animate={{ rotate: link.isOpen ? 180 : 0 }}
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </motion.svg>
                        </button>
                      )}
                    </div>
                    <AnimatePresence>
                      {link.hasDropdown && link.isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="pl-3 pb-3 overflow-hidden"
                        >
                          <div className="rounded-xl bg-gray-50 border border-gray-200/80 p-2.5 space-y-0.5">
                            {link.dropdownId === "services" && (
                              <>
                                <LocalizedLink
                                  href="/services"
                                  className="block py-2.5 px-3 mb-1 text-sm font-semibold text-black hover:text-primary-blue rounded-lg bg-white border border-gray-200/80 transition-colors"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {t("nav.ourServices")}
                                </LocalizedLink>
                                {servicesList.map((service) => (
                                  <LocalizedLink
                                    key={service.id}
                                    href={`/services/${service.slug}`}
                                    className="block py-2.5 text-sm font-medium text-black hover:text-primary-blue rounded-lg pl-3 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    {service.title}
                                  </LocalizedLink>
                                ))}
                              </>
                            )}
                            {link.dropdownId === "platform" &&
                              portalLinks.map((item) => (
                                <LocalizedLink
                                  key={item.href}
                                  href={item.href}
                                  className="block py-2.5 text-sm font-medium text-black hover:text-primary-blue rounded-lg pl-3 transition-colors"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {item.label}
                                </LocalizedLink>
                              ))}
                            {link.dropdownId === "resources" && (
                              <>
                                <LocalizedLink
                                  href="/resources"
                                  className="block py-2.5 px-3 mb-1 text-sm font-semibold text-black hover:text-primary-blue rounded-lg bg-white border border-gray-200/80 transition-colors"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {t("nav.resources")}
                                </LocalizedLink>
                                <div className="nav-resources-scrollbar max-h-[min(320px,45vh)] overflow-y-auto overscroll-contain pl-3 pr-2">
                                  {resourceLinks.map((item) => (
                                    <LocalizedLink
                                      key={item.href}
                                      href={item.href}
                                      className="block py-2.5 text-sm font-medium text-black hover:text-primary-blue rounded-lg transition-colors"
                                      onClick={() => setMobileMenuOpen(false)}
                                    >
                                      {item.label}
                                    </LocalizedLink>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
                  <a
                    href={CLIENT_LOGIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white py-3 text-[15px] font-medium text-black transition-colors hover:border-primary-blue/40 hover:text-primary-blue"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("nav.login")}
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar Overlay & Panel - Only for desktop */}
      {sidebarOpen && !isMobile && (
        <>
          {/* Overlay with blur effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-60 ${isIPhone || isLowPerformance ? "" : "backdrop-blur-md"} bg-black/20`}
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar Panel with smooth slide animation */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-4 bottom-4 right-0 w-full lg:w-[450px] z-70 overflow-hidden"
          >
            {/* Sidebar Container with gradient background, border radius, and hidden scrollbar */}
            <div
              className="nav-sidebar-scrollbar h-full w-full rounded-l-3xl overflow-y-auto pr-1.5 sm:pr-2"
              style={{
                background:
                  "linear-gradient(135deg, var(--sidebar-bg-start) 0%, var(--sidebar-bg-end) 100%)",
              }}
            >
              <div className="p-6 lg:p-8 space-y-8 min-h-full pb-24 relative">
                {/* Header with Logo and Close Button */}
                <div className="flex items-center justify-between">
                  <LocalizedLink
                    href="/"
                    className="flex items-center gap-3"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Image
                      src={LogoMarkWhite}
                      alt="A4 Services"
                      width={44}
                      height={44}
                      className="object-contain shrink-0"
                    />
                    <span className="text-white font-medium text-lg tracking-tight">
                      A4 Services
                    </span>
                  </LocalizedLink>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="w-9 h-9 flex items-center justify-center text-white rounded-full border-2 border-primary-blue bg-black/20 hover:bg-white/10 transition-colors"
                    aria-label="Close sidebar"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Description Text */}
                <div className="text-white text-sm leading-relaxed opacity-90">
                  <p>{t("nav.sidebar.description")}</p>
                </div>

                {/* Sidebar Quick Links Section (static) */}
                <div className="space-y-4">
                  <h3 className="text-white font-bold text-lg">{t("nav.sidebar.quickActions")}</h3>
                  <div className="space-y-3">
                    <a
                      href={CLIENT_ONBOARDING_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {t("nav.sidebar.requestQuoteTitle")}
                        </p>
                        <p className="text-xs text-white/70">
                          {t("nav.sidebar.requestQuoteSubtitle")}
                        </p>
                      </div>
                      <span className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-blue">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                    </a>

                    <LocalizedLink
                      href="/services"
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/15 transition-all"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {t("nav.sidebar.exploreServicesTitle")}
                        </p>
                        <p className="text-xs text-white/70">
                          {t("nav.sidebar.exploreServicesSubtitle")}
                        </p>
                      </div>
                      <span className="ml-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-blue">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </span>
                    </LocalizedLink>
                  </div>
                </div>

                {/* Contact Info Section */}
                <div className="space-y-4">
                  <h3 className="text-white font-bold text-lg">{t("nav.sidebar.contactInfo")}</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-white text-sm mb-1 opacity-80">
                        {t("nav.sidebar.phone")}
                      </p>
                      {CONTACT_PHONES.map((phone) => (
                        <a
                          key={phone.href}
                          href={phone.href}
                          className="block text-white text-base hover:text-primary-blue transition-colors"
                        >
                          {phone.display}
                        </a>
                      ))}
                    </div>
                    <div>
                      <p className="text-white text-sm mb-1 opacity-80">
                        {t("nav.sidebar.email")}
                      </p>
                      <a
                        href={CONTACT_EMAIL_HREF}
                        className="text-white text-base hover:text-primary-blue transition-colors"
                      >
                        {CONTACT_EMAIL}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Follow Us Section */}
                <div className="space-y-4 pb-8">
                  <h3 className="text-white font-bold text-lg">{t("nav.sidebar.followUs")}</h3>
                  <div className="flex items-center gap-4">
                    <a
                      href={LINKEDIN_COMPANY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-blue text-white hover:bg-primary-zinc-hover transition-colors"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5" strokeWidth={1.75} aria-hidden />
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
};

export default Navbar;
