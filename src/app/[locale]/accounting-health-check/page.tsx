import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { Container } from "@/components/a4-landing/Primitives";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { pageMetadata } from "@/lib/page-metadata";
import { HealthCheckTool } from "./components/HealthCheckTool";

export const metadata: Metadata = pageMetadata(
  "Is your accounting audit-ready? — Free check",
  "Run a free 2-minute accounting health check and get a real AI review of your accounts or financial statements — flag the issues that slow down a Malta audit before they cost you.",
);

export default function AccountingHealthCheckPage() {
  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="Free tool"
        title="Is your accounting audit-ready?"
        sub="Take the free 2-minute check, then get a real AI review of your accounts or financial statements — see what would slow down a Malta audit before it does."
      />
      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(56px,8vw,96px) 0" }}>
        <Container>
          <HealthCheckTool />
        </Container>
      </section>
      <ServicePortalBand serviceName="an accounting review" />
    </div>
  );
}
