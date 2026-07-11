import { NextRequest, NextResponse } from "next/server";
import {
  defaultLocale,
  isLocale,
  LOCALE_HEADER,
  type Locale,
} from "@/lib/i18n-config";
import {
  LOCALE_COOKIE,
  resolvePreferredLocale,
} from "@/lib/locale-resolution";

const SESSION_COOKIE = "A4_session";

function getLocaleFromPath(pathname: string): Locale | null {
  const seg = pathname.split("/").filter(Boolean)[0];
  return seg && isLocale(seg) ? seg : null;
}

function resolveLocale(request: NextRequest): Locale {
  return resolvePreferredLocale({
    cookieLocale: request.cookies.get(LOCALE_COOKIE)?.value,
    acceptLanguage: request.headers.get("accept-language"),
    cfCountry:
      request.headers.get("cf-ipcountry") ??
      request.headers.get("CF-IPCountry"),
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    const res = NextResponse.next();
    return ensureSessionCookie(request, res);
  }

  if (pathname.startsWith("/assets")) {
    return ensureSessionCookie(request, NextResponse.next());
  }

  // Homepage lives at the root URL (no visible locale prefix): serve the
  // default-locale homepage via an internal rewrite so the address bar stays
  // "/", not "/en".
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(LOCALE_HEADER, defaultLocale);
    requestHeaders.set("x-pathname", "/");
    const response = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
    response.headers.set(LOCALE_HEADER, defaultLocale);
    return ensureSessionCookie(request, response);
  }

  // Collapse the bare default-locale homepage ("/en") onto the canonical root.
  if (pathname === `/${defaultLocale}` || pathname === `/${defaultLocale}/`) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return ensureSessionCookie(request, NextResponse.redirect(url, 308));
  }

  const pathLocale = getLocaleFromPath(pathname);

  if (!pathLocale) {
    const locale = resolveLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname.endsWith("/") ? pathname.slice(0, -1) : pathname}`;
    const response = NextResponse.redirect(url);
    return ensureSessionCookie(request, response);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, pathLocale);
  requestHeaders.set("x-pathname", pathname);

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set(LOCALE_HEADER, pathLocale);
  response = ensureSessionCookie(request, response);
  return response;
}

function ensureSessionCookie(request: NextRequest, response: NextResponse) {
  const existing = request.cookies.get(SESSION_COOKIE)?.value;
  if (!existing) {
    const token = crypto.randomUUID();
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}

export const config = {
  /** Include `/` explicitly — some setups skip root with a single complex negative pattern. */
  matcher: [
    "/",
    "/((?!api|_next|_vercel|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot|pdf|mp4|webm)$).*)",
  ],
};
