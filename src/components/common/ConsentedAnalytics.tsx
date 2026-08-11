"use client";

/**
 * Loads analytics and the ad tag — but only once the visitor has accepted
 * cookies.
 *
 * Previously Microsoft Clarity was injected straight from the root layout,
 * unconditionally, on every page, while the consent banner sat underneath it
 * doing nothing. Clarity does analytics and session recording, which under
 * GDPR/ePrivacy needs prior consent. Nothing here renders until
 * `readConsent() === "accepted"`, and it starts the moment the visitor clicks
 * Accept rather than waiting for the next navigation.
 *
 * The Google tag is the same gate. It stays dark until
 * NEXT_PUBLIC_GOOGLE_TAG_ID is set in the environment, so this can ship before
 * the owner has an Ads account wired up.
 */

import { useEffect, useState } from "react";
import Script from "next/script";
import { readConsent, onConsentChange } from "@/lib/consent";
import { GOOGLE_TAG_ID } from "@/lib/analytics";

const CLARITY_TAG_ID = "w8hmbtjpb8";

export default function ConsentedAnalytics() {
  // Always false on the server and on first paint: consent lives in a cookie
  // read on the client, and rendering the tags before that check would defeat
  // the gate on the very first page view — the one that matters most.
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(readConsent() === "accepted");
    return onConsentChange((value) => setAllowed(value === "accepted"));
  }, []);

  if (!allowed) return null;

  return (
    <>
      <Script
        id="clarity-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${CLARITY_TAG_ID}");`,
        }}
      />

      {GOOGLE_TAG_ID && (
        <>
          <Script
            id="google-tag-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_TAG_ID)}`}
          />
          <Script
            id="google-tag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(GOOGLE_TAG_ID)});`,
            }}
          />
        </>
      )}
    </>
  );
}
