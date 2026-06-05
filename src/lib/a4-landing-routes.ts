/** Landing routes that ship their own nav/footer and should hide site chrome. */
const A4_LANDING_WITHOUT_SITE_CHROME: string[] = [];

export function isA4LandingWithoutSiteChrome(pathname: string): boolean {
  const path = pathname.replace(/\/$/, "") || "/";
  return A4_LANDING_WITHOUT_SITE_CHROME.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
}
