import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { LIGHT_GLOW } from "@/components/fx/primitives";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import { pageMetadata } from "@/lib/page-metadata";
import { HealthCheckTool } from "./components/HealthCheckTool";

export const metadata: Metadata = pageMetadata(
  "How audit-ready are your accounts? — Free check",
  "Get a clear accounting health score in two minutes, then a real review of your trial balance or financial statements by A4's review engine — see what would slow down a Malta audit before it costs you.",
);

export default function AccountingHealthCheckPage() {
  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="Free check"
        title="How audit-ready are your accounts?"
        sub="Get a clear score in two minutes — then a real review of your trial balance or financial statements by A4's review engine. The same technology behind our platform, pointed at your numbers: clarity on what to fix before it slows down a Malta audit."
      />
      <section style={{ position: "relative", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", background: LIGHT_GLOW, color: "#09090B" }}>
        <HealthCheckTool />
      </section>
      <ServicePortalBand serviceName="an accounting review" />
    </div>
  );
}
