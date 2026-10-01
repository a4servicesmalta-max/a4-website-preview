"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/a4-landing/Primitives";
import { BODY, Band } from "./SectionKit";

/** Service closing CTA in the A4 style: the dark band, heading left, the white pill right. */
const ServiceCTA = () => {
  const { t } = useTranslation("services");
  return (
    <Band surface="dark" tight>
      <div data-fx="rise" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 32 }}>
        <div style={{ maxWidth: 720 }}>
          <h2 style={{ margin: 0, fontSize: "clamp(32px,3.6vw,52px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.04, color: "#FFFFFF" }}>{t("shared.ctaTitle")}</h2>
          <p style={{ margin: "14px 0 0", fontFamily: BODY, fontSize: 18, lineHeight: 1.55, color: "#A1A1AA" }}>{t("shared.ctaBody")}</p>
        </div>
        <Button variant="primary" size="lg" href="/quote#process-steps">
          {t("shared.ctaButton")}
        </Button>
      </div>
    </Band>
  );
};

export default ServiceCTA;
