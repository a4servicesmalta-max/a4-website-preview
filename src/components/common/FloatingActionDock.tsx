"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Globe, Check, ChevronUp, ChevronDown } from "lucide-react";
import { BOOK_A_CALL_PATH } from "@/lib/external-links";
import { WHATSAPP_HREF } from "@/lib/contact";
import {
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  locales,
  localesForSwitcher,
  type Locale,
} from "@/lib/i18n-config";
import { stripLocaleFromPathname, withLocale } from "@/lib/localized-path";
import { cn } from "@/lib/utils";

const HIDE_ON = ["/privacy-policy", "/terms-and-conditions", "/cookie-policy"];
const DOCK_MINIMIZED_KEY = "a4-dock-minimized";

const barSpring = { type: "spring" as const, stiffness: 420, damping: 32 };
const dockSpring = { type: "spring" as const, stiffness: 380, damping: 28 };

export default function FloatingActionDock() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const pathname = usePathname();
  const dockRef = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  // Default to COLLAPSED (compact bubble) on load; only expand if the user
  // previously chose to expand it this session.
  const [minimized, setMinimized] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return sessionStorage.getItem(DOCK_MINIMIZED_KEY) !== "0";
    } catch {
      return true;
    }
  });

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  const current: Locale =
    first && locales.includes(first as Locale)
      ? (first as Locale)
      : (i18n.language as Locale);
  const bare = stripLocaleFromPathname(pathname);

  useEffect(() => {
    const path = window.location.pathname.replace(/^\/(en|fr|de|es|it|nl)(?=\/|$)/, "") || "/";
    if (HIDE_ON.some((p) => path === p || path.startsWith(`${p}/`))) return;

    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function minimizeDock() {
    setLangOpen(false);
    setHovered(null);
    setMinimized(true);
    try {
      sessionStorage.setItem(DOCK_MINIMIZED_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function expandDock() {
    setMinimized(false);
    try {
      sessionStorage.setItem(DOCK_MINIMIZED_KEY, "0");
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    if (langOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [langOpen]);

  function setLocale(next: Locale) {
    if (next === current) {
      setLangOpen(false);
      return;
    }
    const target = withLocale(next, bare === "/" ? "/" : bare);
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    setLangOpen(false);
    router.push(target);
  }

  if (!visible) return null;

  return (
    <div
      ref={dockRef}
      className="fixed z-[100] flex flex-col items-end gap-2 pointer-events-none"
      style={{
        bottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))",
        right: "max(1rem, env(safe-area-inset-right, 0px))",
      }}
      aria-label="Quick actions"
      onMouseLeave={() => setHovered(null)}
    >
      <AnimatePresence mode="wait">
        {langOpen && !minimized && (
          <motion.div
            key="lang-menu"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-auto mb-1 w-[min(14.5rem,calc(100vw-2rem))] rounded-2xl border border-white/20 bg-white/90 p-1.5 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.35)] backdrop-blur-2xl origin-bottom-right"
          >
            {localesForSwitcher.map((loc) => {
              const selected = current === loc;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocale(loc)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                    selected
                      ? "bg-black text-white"
                      : "text-slate-800 hover:bg-black/5"
                  )}
                >
                  <span>{t(`language.${loc}`)}</span>
                  {selected && <Check className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {minimized ? (
          <motion.button
            key="dock-minimized"
            type="button"
            initial={{ opacity: 0, scale: 0.72, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            transition={dockSpring}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={expandDock}
            aria-label="Open quick actions"
            className="pointer-events-auto relative flex h-[3.25rem] w-[3.25rem] items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white/10 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
          >
            <motion.span
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-[#25D366]/25"
              animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.12, 0.35] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="relative flex flex-col items-center gap-[3px]">
              <span className="h-[3px] w-5 rounded-full bg-[#25D366]" />
              <span className="h-[3px] w-5 rounded-full bg-black/70" />
              <span className="h-[3px] w-5 rounded-full bg-white/90" />
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="dock-expanded"
            layout
            initial={{ opacity: 0, scale: 0.92, x: 24 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.88, x: 16 }}
            transition={dockSpring}
            className="pointer-events-auto relative flex w-[min(17.5rem,calc(100vw-2rem))] flex-col gap-[6px] rounded-[22px] border border-white/25 bg-white/10 p-[6px] pt-3 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
          >
            <motion.button
              type="button"
              onClick={minimizeDock}
              aria-label="Minimize quick actions"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...barSpring, delay: 0.02 }}
              className="group absolute -top-2.5 left-1/2 z-10 flex h-6 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/25 bg-black/80 shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition-colors hover:bg-black"
            >
              <ChevronDown
                className="h-3.5 w-3.5 text-white/70 transition-transform duration-300 group-hover:translate-y-0.5 group-hover:text-white"
                strokeWidth={2.5}
              />
            </motion.button>
        {/* Bar 1 — WhatsApp */}
        <motion.a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          custom={0}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ ...barSpring, delay: 0.05 }}
          onMouseEnter={() => setHovered("wa")}
          onFocus={() => setHovered("wa")}
          className={cn(
            "group relative flex h-[46px] items-center gap-3 overflow-hidden rounded-[16px] px-3.5 transition-all duration-300",
            "bg-[#25D366]/90 hover:bg-[#25D366] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
          )}
          style={{ transform: hovered === "wa" ? "scale(1.02)" : undefined }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
            <WhatsAppIcon />
          </span>
          <span className="flex-1 text-[13.5px] font-semibold tracking-tight text-white">WhatsApp</span>
          <motion.span
            className="h-[3px] w-8 rounded-full bg-white/40"
            animate={{ scaleX: hovered === "wa" ? 1.2 : 0.7 }}
            transition={{ duration: 0.25 }}
          />
        </motion.a>

        {/* Bar 2 — Book a call */}
        <motion.a
          href={withLocale(current, BOOK_A_CALL_PATH)}
          custom={1}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ ...barSpring, delay: 0.1 }}
          onMouseEnter={() => setHovered("call")}
          onFocus={() => setHovered("call")}
          className={cn(
            "group relative flex h-[46px] items-center gap-3 overflow-hidden rounded-[16px] px-3.5 transition-all duration-300",
            "bg-black/85 hover:bg-black shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
          )}
          style={{ transform: hovered === "call" ? "scale(1.02)" : undefined }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-primary-blue/0 via-primary-blue/20 to-primary-blue/0 opacity-0 transition-opacity group-hover:opacity-100" />
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
            <Calendar className="h-4 w-4 text-white" strokeWidth={2} />
          </span>
          <span className="flex-1 text-[13px] font-semibold leading-tight text-white">
            <span className="sm:hidden">Book a call</span>
            <span className="hidden sm:inline">Book a free 30-min call</span>
          </span>
          <motion.span
            className="h-[3px] w-8 rounded-full bg-white/30"
            animate={{ scaleX: hovered === "call" ? 1.2 : 0.7 }}
            transition={{ duration: 0.25 }}
          />
        </motion.a>

        {/* Bar 3 — Language */}
        <motion.button
          type="button"
          custom={2}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ ...barSpring, delay: 0.15 }}
          onClick={() => setLangOpen((o) => !o)}
          onMouseEnter={() => setHovered("lang")}
          onFocus={() => setHovered("lang")}
          aria-expanded={langOpen}
          aria-haspopup="listbox"
          aria-label={`${t("language.label")} — ${t(`language.${current}`)}`}
          className={cn(
            "group relative flex h-[46px] w-full items-center gap-3 overflow-hidden rounded-[16px] px-3.5 transition-all duration-300",
            "bg-white/90 hover:bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
            langOpen && "ring-2 ring-black/10"
          )}
          style={{ transform: hovered === "lang" ? "scale(1.02)" : undefined }}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white">
            <Globe className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="flex-1 truncate text-left text-[13.5px] font-semibold text-black">
            {t(`language.${current}`)}
          </span>
          <ChevronUp
            className={cn(
              "h-4 w-4 shrink-0 text-black/50 transition-transform duration-300",
              langOpen && "rotate-180"
            )}
          />
          <motion.span
            className="absolute bottom-2 left-1/2 h-[3px] w-10 -translate-x-1/2 rounded-full bg-black/15"
            animate={{ scaleX: hovered === "lang" || langOpen ? 1.15 : 0.65 }}
            transition={{ duration: 0.25 }}
          />
        </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
