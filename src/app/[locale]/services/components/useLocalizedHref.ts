"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { withLocale } from "@/lib/localized-path";

export function useLocalizedHref() {
  const locale = useLocale();
  return (path: string) => withLocale(locale, path);
}
