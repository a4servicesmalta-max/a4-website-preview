"use client";

import { Container, Eyebrow, Icon, Reveal } from "@/components/a4-landing/Primitives";
import LocalizedLink from "@/components/common/LocalizedLink";

export function HealthCheckPromo() {
  return (
    <section style={{ background: "var(--a4-surface-soft)", padding: "clamp(56px,8vw,88px) 0" }}>
      <Container>
        <Reveal
          style={{
            position: "relative",
            overflow: "hidden",
            background: "#000",
            border: "1px solid var(--a4-hairline-dark)",
            borderRadius: "var(--a4-r-xl)",
            padding: "clamp(32px,4.5vw,52px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 28,
            flexWrap: "wrap",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              transform: "translateY(-50%)",
              width: 460,
              height: 320,
              background: "radial-gradient(50% 50% at 30% 50%, rgba(73,79,223,.22), transparent 72%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", maxWidth: 560 }}>
            <Eyebrow dark>Free accounting &amp; FS health check</Eyebrow>
            <h2
              className="a4-font-display"
              style={{
                fontWeight: 500,
                color: "#fff",
                fontSize: "clamp(26px,3.4vw,40px)",
                lineHeight: 1.06,
                letterSpacing: "-.025em",
                margin: "14px 0 0",
                textWrap: "balance",
              }}
            >
              Find out if your accounts are audit-ready.
            </h2>
            <p
              className="a4-font-body"
              style={{
                fontSize: 16.5,
                lineHeight: 1.6,
                color: "var(--a4-on-dark-mute)",
                margin: "14px 0 0",
                textWrap: "pretty",
              }}
            >
              A free 2-minute check plus a real AI review of your accounts or financial statements — no obligation.
            </p>
          </div>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <LocalizedLink
              href="/accounting-health-check"
              className="a4-font-body"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 56,
                padding: "0 32px",
                borderRadius: "var(--a4-r-full)",
                background: "#fff",
                color: "#000",
                fontWeight: 600,
                fontSize: 17,
                letterSpacing: ".24px",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Run the free check <Icon name="arrow-right" size={18} color="#000" />
            </LocalizedLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
