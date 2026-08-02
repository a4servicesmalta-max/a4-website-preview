import type { Locale } from "@/lib/i18n-config";
import { defaultLocale, isLocale } from "@/lib/i18n-config";

/**
 * Prefix a site path with the active locale. Handles `/`, hashes, and query strings.
 * External URLs are returned unchanged.
 */
export function withLocale(locale: Locale, path: string): string {
  if (!path) return locale === defaultLocale ? "/" : `/${locale}`;
  if (/^https?:\/\//i.test(path)) return path;
  let hash = "";
  let search = "";
  let pathname = path;
  const hashIdx = pathname.indexOf("#");
  if (hashIdx >= 0) {
    hash = pathname.slice(hashIdx);
    pathname = pathname.slice(0, hashIdx);
  }
  const qIdx = pathname.indexOf("?");
  if (qIdx >= 0) {
    search = pathname.slice(qIdx);
    pathname = pathname.slice(0, qIdx);
  }
  // Pure same-page anchor (e.g. "#apply") - stay on the current page, no locale
  // prefix. Query stays before the fragment per URL ordering.
  if (!pathname && hash) return `${search}${hash}`;
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  // Already locale-prefixed (e.g. a caller pre-localized) - strip that prefix
  // and retarget to the requested locale below. Never double-prefix, and never
  // keep a stale prefix that contradicts the locale being asked for.
  const first = pathname.split("/").filter(Boolean)[0];
  if (first && isLocale(first)) {
    const rest = pathname.slice(`/${first}`.length);
    pathname = rest === "" || rest === "/" ? "/" : rest;
  }
  // The default locale is never shown in the URL - its paths stay bare.
  if (locale === defaultLocale) {
    return `${pathname}${search}${hash}`;
  }
  if (pathname === "/") {
    return `/${locale}${search}${hash}`;
  }
  return `/${locale}${pathname}${search}${hash}`;
}

/** Pathname without leading `/{locale}` segment, for route checks (e.g. hide chrome). */
export function stripLocaleFromPathname(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length && isLocale(parts[0])) {
    const rest = parts.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}
