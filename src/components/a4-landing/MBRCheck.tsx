// @ts-nocheck
"use client";

import React from "react";
import LocalizedLink from "@/components/common/LocalizedLink";
import { Button, Icon, Container, SectionHead, Reveal } from "@/components/a4-landing/Primitives";
import { CLIENT_ONBOARDING_URL } from "@/lib/external-links";
import {
  MBR_BAROS_URL,
  MBR_WEBSITE_URL,
  MBR_CHECK_STEPS,
} from "@/lib/mbr-links";

export function MBRCheck({ variant = "homepage" }: { variant?: "homepage" | "page" }) {
  const isPage = variant === "page";

  return (
    <section
      style={{
        background: "#000",
        padding: isPage ? "clamp(48px,7vw,80px) 0" : "clamp(56px,8vw,88px) 0",
        borderTop: "1px solid var(--a4-hairline-dark)",
      }}
    >
      <Container>
        {!isPage && (
          <Reveal align="center">
            <SectionHead
              dark
              align="center"
              eyebrow="Free MBR check"
              title="Check your Malta company on the official registry"
              sub="A4 cannot access MBR records on your behalf — use the Malta Business Registry’s BAROS portal directly. We’ve mapped the steps below."
              maxWidth={660}
            />
          </Reveal>
        )}

        {!isPage && (
          <Reveal delay={40} style={{ textAlign: "center", marginTop: 16 }}>
            <LocalizedLink
              href="/mbr-check"
              className="a4-font-body text-[14px] font-semibold text-[var(--a4-primary-bright)] no-underline hover:underline"
            >
              Full step-by-step guide →
            </LocalizedLink>
          </Reveal>
        )}

        {/* Primary CTA — direct to BAROS */}
        <Reveal delay={isPage ? 0 : 60} style={{ maxWidth: 720, margin: isPage ? "0 auto" : "32px auto 0" }}>
          <div
            style={{
              background: "linear-gradient(135deg, rgba(73,79,223,.18) 0%, rgba(73,79,223,.06) 100%)",
              border: "1px solid rgba(73,79,223,.35)",
              borderRadius: "var(--a4-r-lg)",
              padding: "clamp(28px,3.5vw,40px)",
              textAlign: "center",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "var(--a4-font-body)",
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "var(--a4-primary-bright)",
              }}
            >
              <Icon name="external-link" size={14} color="var(--a4-primary-bright)" />
              Official Malta Business Registry
            </span>
            <p
              style={{
                fontFamily: "var(--a4-font-body)",
                fontSize: 15.5,
                lineHeight: 1.6,
                color: "var(--a4-on-dark-mute)",
                margin: "14px auto 0",
                maxWidth: 520,
                textWrap: "pretty",
              }}
            >
              Company master data, annual return status and enforcement notices are published on{" "}
              <strong style={{ color: "#fff", fontWeight: 600 }}>baros.mbr.mt</strong> — not through third-party
              search tools.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 24 }}>
              <Button variant="primary" size="lg" href={MBR_BAROS_URL} target="_blank" rel="noopener noreferrer">
                Check on MBR BAROS <Icon name="external-link" size={18} color="#000" />
              </Button>
              <Button variant="outline-dark" size="lg" href={MBR_WEBSITE_URL} target="_blank" rel="noopener noreferrer">
                mbr.mt
              </Button>
            </div>
            <p
              style={{
                fontFamily: "var(--a4-font-body)",
                fontSize: 12.5,
                color: "var(--a4-stone)",
                marginTop: 16,
              }}
            >
              Free login required · Opens in a new tab
            </p>
          </div>
        </Reveal>

        {/* Step cards */}
        <Reveal delay={isPage ? 40 : 100}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isPage ? "repeat(auto-fit, minmax(260px, 1fr))" : "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
              marginTop: isPage ? 40 : 32,
            }}
          >
            {MBR_CHECK_STEPS.map((step, i) => (
              <Reveal key={step.id} delay={i * 50}>
                <div
                  style={{
                    background: "var(--a4-surface-elevated)",
                    border: "1px solid var(--a4-hairline-dark)",
                    borderRadius: "var(--a4-r-lg)",
                    padding: "24px 22px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "var(--a4-r-md)",
                      background: "rgba(73,79,223,.14)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Icon name={step.icon} size={22} color="var(--a4-primary-bright)" stroke={1.75} />
                  </span>
                  <div
                    style={{
                      fontFamily: "var(--a4-font-body)",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      color: "var(--a4-stone)",
                      marginTop: 16,
                    }}
                  >
                    Step {i + 1}
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--a4-font-display)",
                      fontWeight: 500,
                      fontSize: 18,
                      color: "#fff",
                      margin: "8px 0 0",
                      letterSpacing: "-.2px",
                      textWrap: "balance",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--a4-font-body)",
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: "var(--a4-on-dark-mute)",
                      margin: "10px 0 0",
                      flex: 1,
                      textWrap: "pretty",
                    }}
                  >
                    {step.body}
                  </p>
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 16,
                      fontFamily: "var(--a4-font-body)",
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: "var(--a4-primary-bright)",
                      textDecoration: "none",
                    }}
                  >
                    {step.linkLabel}
                    <Icon name="arrow-right" size={14} color="var(--a4-primary-bright)" />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        {/* A4 conversion — overdue help */}
        <Reveal delay={isPage ? 80 : 140} style={{ marginTop: 32 }}>
          <div
            style={{
              background: "var(--a4-surface-elevated)",
              border: "1px solid var(--a4-hairline-dark)",
              borderRadius: "var(--a4-r-lg)",
              padding: "clamp(24px,3vw,32px)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
            }}
          >
            <div style={{ flex: "1 1 280px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="alert-triangle" size={20} color="var(--accent-danger)" />
                <span
                  style={{
                    fontFamily: "var(--a4-font-body)",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#fff",
                  }}
                >
                  Overdue filings or penalties on BAROS?
                </span>
              </div>
              <p
                style={{
                  fontFamily: "var(--a4-font-body)",
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: "var(--a4-on-dark-mute)",
                  margin: "10px 0 0",
                  maxWidth: 480,
                  textWrap: "pretty",
                }}
              >
                A4 can bring MBR returns, audited accounts and CFR submissions up to date — fixed quote before work
                starts.
              </p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <LocalizedLink href="/contact">
                <Button variant="primary" size="md">
                  Speak to the team <Icon name="arrow-right" size={16} color="#000" />
                </Button>
              </LocalizedLink>
              <Button variant="outline-dark" size="md" href={CLIENT_ONBOARDING_URL} target="_blank">
                Create account
              </Button>
            </div>
          </div>
        </Reveal>

        {!isPage && (
          <Reveal delay={160} style={{ textAlign: "center", marginTop: 20 }}>
            <LocalizedLink href="/compliance-calendar">
              <span className="a4-font-body text-[13.5px] font-semibold text-[var(--a4-stone)] hover:text-[var(--a4-primary-bright)]">
                Download the 2026 Malta compliance calendar →
              </span>
            </LocalizedLink>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
