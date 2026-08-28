"use client";

import { useEffect } from "react";
import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_MAX_AGE_SECONDS,
  encodeAttribution,
  parseAttribution,
} from "@/lib/firstTouch";

/**
 * Records the campaign that brought a visitor here, once, in a first-party
 * cookie the site's own route handlers can read when they push a lead.
 *
 * Renders nothing. Mounted once in the root layout, so it runs on every entry
 * page — including the landing pages under /lp, which is where paid traffic
 * actually arrives.
 *
 * DELIBERATELY NOT GATED ON GA/ADS CONFIG. `<GoogleTags />` renders nothing
 * until the measurement IDs are set, and this must work regardless: the cookie
 * is how the PORTAL learns which campaign produced a lead, which is a different
 * question from what Google's own tag reports, and it has to be right from the
 * first ad click rather than from whenever someone gets round to pasting IDs.
 *
 * FIRST touch: an existing cookie is never overwritten. The campaign that
 * earned the visit keeps the credit even if they come back through another link
 * before filling anything in.
 */
export default function FirstTouchAttribution() {
  useEffect(() => {
    try {
      // Already attributed this visitor — first touch wins, so stop.
      if (document.cookie.split(";").some((c) => c.trim().startsWith(`${ATTRIBUTION_COOKIE}=`))) {
        return;
      }
      const attribution = parseAttribution(window.location.search);
      if (!attribution) return; // Organic visit: nothing to record.

      document.cookie = [
        `${ATTRIBUTION_COOKIE}=${encodeAttribution(attribution)}`,
        "path=/",
        `max-age=${ATTRIBUTION_MAX_AGE_SECONDS}`,
        // Lax, not Strict: visitors arrive here by following a link from an ad
        // on another origin, and Strict would withhold the cookie on exactly
        // that navigation — the only one that matters.
        "SameSite=Lax",
        // The site is HTTPS-only in every deployed environment; localhost is
        // exempted by browsers, so dev still works.
        "Secure",
      ].join("; ");
    } catch {
      // Cookies disabled, or an exotic privacy mode. Attribution is a
      // nice-to-have and must never break a page render.
    }
  }, []);

  return null;
}
