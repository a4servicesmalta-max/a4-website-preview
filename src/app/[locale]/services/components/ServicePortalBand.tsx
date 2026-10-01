"use client";

import { BOOK_A_CALL_PATH } from "@/lib/external-links";
import { Button } from "@/components/a4-landing/Primitives";
import { MUTED_GLOW, TypeText, Words } from "@/components/fx/primitives";
import { PortalShowcase } from "@/components/fx/PortalShowcase";

/**
 * "Your own portal. For every engagement." — the portal section of the A4
 * design, shared by every page that ends on how an engagement runs.
 */
export function ServicePortalBand({ serviceName }: { serviceName: string }) {
  return (
    <section
      data-sec="portal"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px) clamp(130px,15vw,210px)",
        background: MUTED_GLOW,
        color: "#09090B",
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ textAlign: "center", fontSize: "clamp(42px,6.4vw,120px)", fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.1, fontFamily: "var(--a4x-display)" }}>
          <TypeText segments={[{ t: "Your own ", c: "#09090B" }, { t: "portal.", g: true }]} per={42} style={{ display: "inline-block" }} />
          <Words d={760} style={{ fontWeight: 600 }} parts={[{ t: "For every engagement." }]} />
        </div>
        <div data-fx="rise" data-d="950" style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/a4/powered-by-vacei-ink.png" alt="Powered by Vacei" style={{ height: 32, width: "auto", display: "block" }} />
        </div>
        <PortalShowcase />
        <div
          data-fx="rise"
          style={{ marginTop: "clamp(88px,10vw,128px)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}
        >
          <p style={{ margin: 0, maxWidth: 640, fontFamily: "var(--a4x-body)", fontSize: 17, lineHeight: 1.6, color: "#52525B" }}>
            Talk to us about {serviceName.toLowerCase()} and we open your account — then every deliverable,
            deadline and document lives in the same secure workspace.
          </p>
          <Button variant="dark" size="lg" href={BOOK_A_CALL_PATH}>
            Book a call
          </Button>
        </div>
      </div>
    </section>
  );
}
