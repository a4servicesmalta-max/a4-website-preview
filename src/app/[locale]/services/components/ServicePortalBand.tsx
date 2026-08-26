"use client";

import { CLIENT_ONBOARDING_URL } from "@/lib/external-links";
import { Button, Container, Eyebrow, Icon, Reveal } from "@/components/a4-landing/Primitives";
import { ServicePortalMockup } from "./ServicePortalMockup";

export function ServicePortalBand({ serviceName }: { serviceName: string }) {
  return (
    <section
      className="bg-black border-t border-[var(--a4-hairline-dark)]"
      style={{ padding: "clamp(64px,9vw,104px) 0" }}
    >
      <Container>
        <div
          className="two-col grid items-center gap-12"
          style={{ gridTemplateColumns: "1fr 1.1fr" }}
        >
          <Reveal>
            <Eyebrow dark>Digital Onboarding</Eyebrow>
            <h2
              className="a4-font-display font-medium text-white mt-4"
              style={{
                fontSize: "clamp(28px,3.6vw,46px)",
                lineHeight: 1.05,
                letterSpacing: "-.025em",
                textWrap: "balance",
              }}
            >
              Watch how an engagement starts.
            </h2>
            <p
              className="a4-font-body text-[var(--a4-on-dark-mute)] mt-4 max-w-[420px]"
              style={{ fontSize: 16.5, lineHeight: 1.6, textWrap: "pretty" }}
            >
              Talk to us about {serviceName.toLowerCase()} and we open your account &mdash; then track every
              deliverable, deadline and document in the same secure workspace.
            </p>
            <div className="mt-7">
              <Button variant="primary" size="md" href={CLIENT_ONBOARDING_URL} target="_blank">
                Open the portal <Icon name="arrow-right" size={16} color="#000" />
              </Button>
            </div>
          </Reveal>
          <Reveal delay={100} style={{ display: "flex", justifyContent: "center" }}>
            <ServicePortalMockup />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
