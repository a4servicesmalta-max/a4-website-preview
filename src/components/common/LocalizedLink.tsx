"use client";

import Link, { type LinkProps } from "next/link";
import { forwardRef } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { isExternalHref } from "@/lib/external-links";
import { withLocale } from "@/lib/localized-path";

type Props = Omit<LinkProps, "href"> & {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const LocalizedLink = forwardRef<HTMLAnchorElement, Props>(function LocalizedLink(
  { href, children, className, style, ...rest },
  ref
) {
  if (isExternalHref(href)) {
    return (
      <a ref={ref} href={href} className={className} style={style} {...rest}>
        {children}
      </a>
    );
  }

  const locale = useLocale();
  const localized = withLocale(locale, href);
  return (
    <Link ref={ref} href={localized} className={className} style={style} {...rest}>
      {children}
    </Link>
  );
});

export default LocalizedLink;
