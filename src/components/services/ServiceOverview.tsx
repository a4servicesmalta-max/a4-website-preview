"use client";

import React, { ReactNode } from "react";
import Image from "next/image";
import { BODY, Band, gradTail } from "./SectionKit";

interface ServiceOverviewProps {
  title: string;
  description: ReactNode;
  image: string;
}

/** Service overview in the A4 style: H2 with its gradient word and the body on the left, the image panel on the right. */
const ServiceOverview = ({ title, description, image }: ServiceOverviewProps) => {
  return (
    <Band surface="light">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-[72px] items-center">
        <div>
          <h2 data-fx="rise" style={{ margin: 0, fontSize: "clamp(36px,4.4vw,68px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.03, textWrap: "balance" }}>
            {gradTail(title)}
          </h2>
          <div data-fx="rise" data-d="120" style={{ marginTop: 22, fontFamily: BODY, fontSize: 17, lineHeight: 1.6, color: "#52525B", display: "flex", flexDirection: "column", gap: 16 }}>
            {description}
          </div>
        </div>
        <div data-fx="rise" data-d="160" data-dy="70" style={{ position: "relative", borderRadius: 28, overflow: "hidden", border: "1px solid #E4E4E7", boxShadow: "0 50px 120px rgba(9,9,11,.12)", aspectRatio: "4 / 3", background: "#FAFAFA" }}>
          <Image src={image} alt={`${title} Overview`} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
        </div>
      </div>
    </Band>
  );
};

export default ServiceOverview;
