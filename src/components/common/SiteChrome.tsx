"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import PageTransition from "@/components/common/PageTransition";
import { SmoothScroll } from "@/components/common/SmoothScroll";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import CookieConsentBanner from "@/components/common/CookieConsentBanner";
import SupportChat from "@/components/support-chat/SupportChat";
import FloatingActionDock from "@/components/common/FloatingActionDock";
import { stripLocaleFromPathname } from "@/lib/localized-path";
import { isA4LandingWithoutSiteChrome } from "@/lib/a4-landing-routes";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const barePath = stripLocaleFromPathname(pathname);
  const hideSiteNavFooter = isA4LandingWithoutSiteChrome(barePath);

  return (
    <SmoothScroll>
      {/* Site navbar — hidden on standalone A4 landing pages (they ship their own nav) */}
      {!hideSiteNavFooter && <Navbar />}
      <PageTransition>{children}</PageTransition>
      {/* Site footer — hidden on standalone A4 landing pages */}
      {!hideSiteNavFooter && <Footer />}
      <ScrollToTopButton />
      <SupportChat />
      <FloatingActionDock />
      <CookieConsentBanner />
    </SmoothScroll>
  );
}
