"use client";

import { useEffect, useRef, useState } from "react";
import { replayFx } from "@/components/fx/FxRuntime";
import { gradText } from "@/components/fx/primitives";

/**
 * The portal tour from the A4 design: four client-portal screens behind tabs,
 * on a 3D stage that tilts flat as it scrolls in (FxRuntime data-stage),
 * cross-fading on a 5.2s cycle until the visitor picks one, with the caption
 * pill re-rising on every change.
 */

export const PORTAL_SCREENS = [
  { n: "01", title: "Every engagement", sub: "at a glance", caption: "What's done, what's in progress and what's coming up.", src: "/brand/portal/portal-dashboard.jpg", alt: "Client portal dashboard", hideNote: false },
  { n: "02", title: "Corporate services", sub: "with our CSP partners", caption: "The full package, requested and tracked in your portal.", src: "/brand/portal/portal-request.jpg", alt: "Corporate services request form", hideNote: true },
  { n: "03", title: "Upload once", sub: "in one place", caption: "Collected once, not across a year of email attachments.", src: "/brand/portal/portal-audit-engagement.jpg", alt: "Audit engagement requests", hideNote: false },
  { n: "04", title: "Ask about", sub: "your audit", caption: "Ask what's still needed, and see it in one answer.", src: "/brand/portal/portal-ask.jpg", alt: "Ask about your audit", hideNote: false },
];

const INK = "#09090B";
const INDIGO = "#4F55F1";
const MARK_S = "M302.6,2 L359,2 L355.6,10 L58.1,514 L2,514.1 L60.7,413 L4.7,412 L30.5,368 L36,359.5 L93,358.7 Z";
const MARK_F = "M394.9,2 L444.7,3 L444.7,359 L513.6,360 L482,412.6 L444.9,413 L444,514.5 L393.2,514 L393.2,418 L392,412.6 L152.4,412 Z M393,103.8 L240.2,359 L393.1,359 Z";

export function PortalShowcase() {
  const [screen, setScreen] = useState(0);
  const userPicked = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const iv = window.setInterval(() => {
      const st = stageRef.current;
      if (userPicked.current || !st) return;
      const r = st.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) setScreen((s) => (s + 1) % PORTAL_SCREENS.length);
    }, 5200);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    replayFx(pillRef.current);
  }, [screen]);

  const cur = PORTAL_SCREENS[screen];
  return (
    <>
      <div data-fx="rise" role="tablist" aria-label="Portal tour" style={{ marginTop: 56, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
        {PORTAL_SCREENS.map((p, i) => {
          const a = i === screen;
          return (
            <button
              key={p.n}
              role="tab"
              aria-selected={a}
              onClick={() => {
                userPicked.current = true;
                setScreen(i);
              }}
              style={{ height: 48, padding: "0 20px", display: "flex", alignItems: "center", gap: 10, borderRadius: 999, border: `1px solid ${a ? "#E4E4E7" : "transparent"}`, background: a ? "#FFFFFF" : "transparent", color: a ? INK : "#52525B", boxShadow: a ? "0 10px 30px rgba(9,9,11,.08)" : "none", fontSize: 15, fontWeight: 600, cursor: "pointer", transition: "background .3s, color .3s, box-shadow .3s, border-color .3s" }}
            >
              <span style={{ color: a ? INDIGO : "#A1A1AA" }}>{p.n}</span>
              {p.title}
            </button>
          );
        })}
      </div>
      <div ref={stageRef} data-stage="" data-cw="1600" data-ch="980" style={{ position: "relative", marginTop: 40, width: "100%", aspectRatio: "1600 / 980", perspective: 2200 }}>
        <div data-cam="" style={{ position: "absolute", left: 0, top: 0, width: 1600, height: 980, transformOrigin: "0 0", transform: "scale(.5)" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 18, overflow: "hidden", background: "#E5E8EA", border: "1px solid #E4E4E7", boxShadow: "0 50px 120px rgba(9,9,11,.28)" }}>
            {PORTAL_SCREENS.map((p, i) => {
              const a = i === screen;
              return (
                <div key={p.n} aria-hidden={!a} style={{ position: "absolute", left: 0, top: 40, width: 1600, height: 940, overflow: "hidden", opacity: a ? 1 : 0, transform: `translateY(${a ? 0 : 28}px)`, transition: "opacity .6s cubic-bezier(.65,0,.35,1), transform .7s cubic-bezier(.16,1,.3,1)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt={p.alt} draggable={false} loading="lazy" decoding="async" style={{ position: "absolute", left: 0, top: 0, width: 1600, height: "auto", display: "block" }} />
                  {p.hideNote ? <div style={{ position: "absolute", left: 480, top: 796, width: 640, height: 34, background: "#E5E8EA" }} /> : null}
                </div>
              );
            })}
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 40, zIndex: 2, display: "flex", alignItems: "center", gap: 8, padding: "0 18px", background: "#FAFAFA", borderBottom: "1px solid #E4E4E7" }}>
              <span style={{ width: 11, height: 11, borderRadius: 6, background: "#E4E4E7" }} />
              <span style={{ width: 11, height: 11, borderRadius: 6, background: "#E4E4E7" }} />
              <span style={{ width: 11, height: 11, borderRadius: 6, background: "#E4E4E7" }} />
              <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 10, height: 26, padding: "0 14px", borderRadius: 13, background: "#F4F4F5", fontSize: 14, fontWeight: 600, color: "#27272A", whiteSpace: "nowrap" }}>
                <svg viewBox="0 0 515.6 516.5" style={{ height: 14, width: 14, display: "block" }} aria-hidden="true">
                  <path d={MARK_S} fill={INK} />
                  <path d={MARK_F} fill={INK} fillRule="evenodd" />
                </svg>
                Your client portal<span style={{ fontWeight: 500, color: "#A1A1AA" }}>Powered by Vacei</span>
              </span>
            </div>
            <div style={{ position: "absolute", right: 24, top: 60, zIndex: 3, padding: "8px 16px", borderRadius: 999, background: "rgba(9,9,11,.78)", color: "#FFFFFF", fontSize: 18, fontWeight: 500 }}>
              Sample data · fictional companies
            </div>
          </div>
        </div>
        <div
          ref={pillRef}
          data-portal-pill=""
          data-fx="rise"
          data-d="200"
          role="status"
          aria-live="polite"
          style={{ position: "absolute", left: "clamp(10px,3vw,40px)", bottom: "clamp(-44px,-3.4vw,-20px)", zIndex: 4, maxWidth: "calc(100% - 20px)", padding: "18px 26px 20px", borderRadius: 22, background: "rgba(255,255,255,.96)", border: "1px solid #E4E4E7", boxShadow: "0 30px 80px rgba(9,9,11,.22)", color: INK }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "2px 12px" }}>
            <span style={{ fontSize: "clamp(24px,2.4vw,34px)", fontWeight: 600, letterSpacing: "-0.04em", ...gradText }}>{cur.n}</span>
            <span style={{ fontSize: "clamp(20px,2.1vw,30px)", fontWeight: 600, letterSpacing: "-0.03em" }}>{cur.title}</span>
            <span style={{ fontSize: "clamp(20px,2.1vw,30px)", fontWeight: 500, letterSpacing: "-0.03em", color: "#52525B" }}>{cur.sub}</span>
          </div>
          <div style={{ marginTop: 6, fontSize: "clamp(15px,1.3vw,18px)", fontWeight: 500, color: "#52525B" }}>{cur.caption}</div>
        </div>
      </div>
    </>
  );
}
