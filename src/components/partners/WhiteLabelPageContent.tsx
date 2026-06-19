"use client";

import LocalizedLink from "@/components/common/LocalizedLink";
import { Container, Icon, Reveal } from "@/components/a4-landing/Primitives";
import { usePagesTranslation } from "@/hooks/usePagesTranslation";
import { PartnerSubpageLayout, usePartnerSections } from "./PartnerSubpageLayout";

export default function WhiteLabelPageContent() {
  const { t } = usePagesTranslation("partners");
  const sections = usePartnerSections(t, "whiteLabel", 6);

  return (
    <PartnerSubpageLayout
      icon="palette"
      modelLabel="White-label"
      pageTitle={t("whiteLabel.pageHeader.title")}
      heroTitle={t("whiteLabel.hero.title")}
      heroDescription={t("whiteLabel.hero.description")}
      ctaLabel={t("whiteLabel.hero.cta")}
      ctaHref="/contact"
      sections={sections}
      currentHref="/partners/white-label"
    >
      <section className="bg-[var(--a4-canvas-light)] border-b border-[var(--a4-hairline-light)]" style={{ padding: "clamp(48px,6vw,72px) 0" }}>
        <Container>
          <Reveal>
            <div className="grid gap-5 md:grid-cols-2">
              {(["client", "audit"] as const).map((key, i) => (
                <Reveal
                  key={key}
                  delay={i * 80}
                  style={{
                    background: "var(--a4-surface-card)",
                    border: "1px solid var(--a4-hairline-light)",
                    borderRadius: "var(--a4-r-lg)",
                    padding: "clamp(26px,3vw,36px)",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100%",
                  }}
                >
                  <span
                    className="grid place-items-center w-12 h-12 rounded-[var(--a4-r-md)]"
                    style={{ background: "rgba(73,79,223,.1)", border: "1px solid rgba(73,79,223,.2)" }}
                  >
                    <Icon name={key === "client" ? "layout-dashboard" : "clipboard-check"} size={22} color="var(--a4-primary)" stroke={1.75} />
                  </span>
                  <h3 className="a4-font-display font-medium text-[var(--a4-ink)] mt-5" style={{ fontSize: "clamp(20px,2.4vw,24px)" }}>
                    {t(`whiteLabel.experience.${key}.title`)}
                  </h3>
                  <p className="a4-font-body text-[15px] leading-[1.6] text-[var(--a4-mute)] mt-3 flex-1" style={{ textWrap: "pretty" }}>
                    {t(`whiteLabel.experience.${key}.description`)}
                  </p>
                  <LocalizedLink
                    href={key === "client" ? "/partners/white-label/client-portal" : "/partners/white-label/audit-portal"}
                    className="inline-flex items-center gap-1.5 mt-6 a4-font-body text-[14.5px] font-semibold no-underline"
                    style={{ color: "var(--a4-link)" }}
                  >
                    {t(`whiteLabel.experience.${key}.cta`)}
                    <Icon name="arrow-right" size={15} color="var(--a4-link)" />
                  </LocalizedLink>
                </Reveal>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>
    </PartnerSubpageLayout>
  );
}
