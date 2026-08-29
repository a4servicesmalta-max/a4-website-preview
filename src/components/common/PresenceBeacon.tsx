"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { QUOTE_API_BASE } from "@/lib/websiteQuotation";
import {
  buildPresenceBody,
  isValidSid,
  parseUtm,
  PRESENCE_INTERVAL_MS,
  PRESENCE_SID_KEY,
  PRESENCE_UTM_KEY,
  randomSid,
  type PresenceUtm,
} from "@/lib/presence";

// Live-visitor heartbeat: POST /public/presence on load and every 20 s while
// the tab is visible; a `leave` beacon on pagehide. Client-side route changes
// re-run the effect so the new page is reported at once. No cookies, nothing
// personal, every error swallowed — the page never blocks on this.

function read(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, val: string): boolean {
  try {
    window.sessionStorage.setItem(key, val);
    return true;
  } catch {
    return false;
  }
}

let memSid: string | null = null;
let memUtm: PresenceUtm | null = null;

function getSid(): string {
  const stored = read(PRESENCE_SID_KEY) ?? memSid;
  if (isValidSid(stored)) return stored;
  const s = randomSid();
  if (!write(PRESENCE_SID_KEY, s)) memSid = s;
  return s;
}

function getUtm(): PresenceUtm {
  const stored = read(PRESENCE_UTM_KEY);
  if (stored) {
    try {
      return (JSON.parse(stored) as PresenceUtm) || {};
    } catch {
      return {};
    }
  }
  if (memUtm) return memUtm;
  const found = parseUtm(window.location.search);
  if (Object.keys(found).length) {
    if (!write(PRESENCE_UTM_KEY, JSON.stringify(found))) memUtm = found;
  }
  return found;
}

export default function PresenceBeacon() {
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  useEffect(() => {
    if (!QUOTE_API_BASE || typeof window === "undefined") return;
    const url = `${QUOTE_API_BASE}/public/presence`;
    const utm = getUtm();
    let timer: number | null = null;

    const json = (event: "hb" | "leave") =>
      JSON.stringify(
        buildPresenceBody(
          getSid(),
          pathRef.current || "/",
          document.referrer,
          utm,
          window.location.hostname,
          event,
        ),
      );

    const heartbeat = () => {
      try {
        void fetch(url, {
          method: "POST",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
          body: json("hb"),
        }).catch(() => {});
      } catch {
        /* swallow */
      }
    };
    const leave = () => {
      try {
        const body = json("leave");
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
        } else {
          void fetch(url, {
            method: "POST",
            keepalive: true,
            headers: { "Content-Type": "application/json" },
            body,
          }).catch(() => {});
        }
      } catch {
        /* swallow */
      }
    };
    const start = () => {
      if (timer !== null) return;
      heartbeat();
      timer = window.setInterval(heartbeat, PRESENCE_INTERVAL_MS);
    };
    const stop = () => {
      if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };
    const onPageHide = () => {
      stop();
      leave();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    if (document.visibilityState !== "hidden") start();

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [pathname]);

  return null;
}
