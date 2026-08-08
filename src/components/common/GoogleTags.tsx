import Script from "next/script";
import {
  CONSENT_COOKIE_NAME,
  CONSENT_DEFAULT,
  CONSENT_GRANTED,
  GA4_ID,
  GADS_ID,
  TRACKING_ENABLED,
} from "@/lib/analytics";

/**
 * GA4 + Google Ads gtag.js, behind Google Consent Mode v2.
 *
 * Renders NOTHING when neither `NEXT_PUBLIC_GA4_ID` nor `NEXT_PUBLIC_GADS_ID` is
 * set — no script tag, no `dataLayer`, no `window.gtag`. Every `trackConversion`
 * call then no-ops. That is the launch-safe state until the real IDs land.
 *
 * Why one inline script rather than an inline tag plus a separate `<Script src>`:
 * Consent Mode's `default` command MUST reach the dataLayer before gtag.js runs,
 * and two sibling `<Script>` tags only give a soft ordering promise. Doing the
 * consent default and then injecting the loader inside a single script makes the
 * ordering structural. It is also the pattern the Clarity tag in the same layout
 * already uses.
 *
 * The loader is `async` and the strategy is `afterInteractive`, so this costs
 * nothing on first paint. Conversions fire on form success, long after load.
 */
export default function GoogleTags() {
  if (!TRACKING_ENABLED) return null;

  // JSON.stringify everything that crosses into script source. The IDs are also
  // regex-validated in analytics.ts, so a hostile env var cannot break out.
  const configs = [GA4_ID, GADS_ID]
    .filter(Boolean)
    .map((id) => `g('config',${JSON.stringify(id)});`)
    .join("");

  // GA4 is the better loader ID when present; either works, both get configured.
  const loaderId = GA4_ID || GADS_ID;
  const acceptedCookie = JSON.stringify(`${CONSENT_COOKIE_NAME}=accepted`);

  const inline = [
    // IIFE so the shim and the loader element never become page globals.
    "(function(){",
    "window.dataLayer=window.dataLayer||[];",
    "function g(){window.dataLayer.push(arguments);}",
    "window.gtag=g;",
    // Deny everything non-essential BEFORE the tag exists.
    `g('consent','default',${JSON.stringify(CONSENT_DEFAULT)});`,
    "g('set','ads_data_redaction',true);",
    "g('set','url_passthrough',true);",
    // Returning visitor who already accepted: lift consent straight away, so we
    // do not wait for a banner that will never be shown again.
    `try{if(document.cookie.split('; ').indexOf(${acceptedCookie})>-1){`,
    `g('consent','update',${JSON.stringify(CONSENT_GRANTED)});`,
    "g('set','ads_data_redaction',false);}}catch(e){}",
    "g('js',new Date());",
    configs,
    // Now, and only now, fetch gtag.js.
    "var s=document.createElement('script');s.async=true;",
    `s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(${JSON.stringify(loaderId)});`,
    "document.head.appendChild(s);",
    "})();",
  ].join("");

  return (
    <Script
      id="a4-google-tags"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: inline }}
    />
  );
}
