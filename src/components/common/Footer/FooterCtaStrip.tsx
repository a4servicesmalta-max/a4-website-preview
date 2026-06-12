"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Container, Icon } from "@/components/a4-landing/Primitives";
import { useLocalizedHref } from "@/components/a4-site/useLocalizedHref";

export default function FooterCtaStrip() {
  const { t } = useTranslation("common");
  const href = useLocalizedHref();

  return (
    <section
      className="relative z-10 mb-12 md:mb-16 bg-black border-b border-[var(--a4-hairline-dark)]"
      style={{ padding: "clamp(48px,6vw,72px) 0" }}
    >
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-10">
          <h3
            className="a4-font-display font-medium text-white m-0 max-w-[560px]"
            style={{
              fontSize: "clamp(26px,3.2vw,40px)",
              lineHeight: 1.08,
              letterSpacing: "-.02em",
              textWrap: "balance",
            }}
          >
            {t("footer.ctaStripTitle")}
          </h3>
          <Button variant="primary" size="lg" href={href("/contact")}>
            {t("footer.ctaStripButton")}{" "}
            <Icon name="arrow-right" size={18} color="#000" />
          </Button>
        </div>
      </Container>
    </section>
  );
}
