"use client";

import React from "react";
import Link from "next/link";
import { BODY, Band, DocPanel, INDIGO, INK, SANS, StatusPill, gradTail } from "@/components/services/SectionKit";

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  link: string;
}

interface JobOpeningsProps {
  title?: string;
  subtitle?: string;
  applyNowText?: string;
  jobs?: Job[];
}

/** Open positions as a document: numbered rows with hairlines, meta and an Apply pill per role. */
const JobOpenings = ({ title, subtitle, applyNowText, jobs = [] }: JobOpeningsProps) => {
  return (
    <Band id="positions" surface="white">
      <div style={{ maxWidth: 820 }}>
        {title ? (
          <h2 data-fx="rise" style={{ margin: 0, fontSize: "clamp(40px,5.6vw,92px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.02 }}>
            {gradTail(title)}
          </h2>
        ) : null}
        {subtitle ? (
          <p data-fx="rise" data-d="100" style={{ margin: "20px 0 0", fontFamily: BODY, fontSize: 18, lineHeight: 1.55, color: "#52525B" }}>
            {subtitle}
          </p>
        ) : null}
      </div>

      <div data-fx="rise" data-d="160" data-dy="80" style={{ marginTop: "clamp(40px,5vw,64px)" }}>
        <DocPanel>
          {jobs.map((job, index) => (
            <div
              key={job.id}
              style={{
                display: "grid",
                gridTemplateColumns: "48px minmax(0,1fr) auto",
                alignItems: "center",
                gap: "14px 20px",
                padding: "26px clamp(20px,4vw,40px)",
                borderTop: index ? "1px solid #E4E4E7" : "none",
              }}
              className="max-sm:!grid-cols-[36px_minmax(0,1fr)]"
            >
              <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: INDIGO, alignSelf: "start", paddingTop: 6 }}>{String(index + 1).padStart(2, "0")}</span>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0, fontFamily: SANS, fontSize: "clamp(22px,2.2vw,28px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15, color: INK }}>{job.title}</h3>
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 14px", fontFamily: BODY, fontSize: 14.5, color: "#52525B" }}>
                  <span>{job.department}</span>
                  <span aria-hidden="true" style={{ width: 4, height: 4, borderRadius: 2, background: "#D4D4D8" }} />
                  <span>{job.location}</span>
                  <StatusPill tone="indigo" style={{ height: 26, fontSize: 12 }}>
                    {job.type}
                  </StatusPill>
                </div>
              </div>
              <Link href={job.link} className="a4-btn a4-btn-ink max-sm:col-start-2 max-sm:justify-self-start" style={{ height: 44, padding: "0 20px", fontSize: 15, textDecoration: "none" }}>
                {applyNowText}
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          ))}
        </DocPanel>
      </div>
    </Band>
  );
};

export default JobOpenings;
