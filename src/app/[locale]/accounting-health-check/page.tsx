import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { Container } from "@/components/a4-landing/Primitives";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { pageMetadata } from "@/lib/page-metadata";
import { HealthCheckTool } from "./components/HealthCheckTool";

export const metadata: Metadata = pageMetadata(
  "How audit-ready are your accounts? — Free check",
  "Get a clear accounting health score in two minutes, then a real review of your trial balance or financial statements by A4's own engine — see what would slow down a Malta audit before it costs you.",
);

export default function AccountingHealthCheckPage() {
  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="Free check"
        title="How audit-ready are your accounts?"
        sub="Get a clear score in two minutes — then a real review of your trial balance or financial statements by A4's own engine. The same technology behind our platform, pointed at your numbers: clarity on what to fix before it slows down a Malta audit."
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
