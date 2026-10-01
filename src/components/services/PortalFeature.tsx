"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, Building2, FileText, FolderUp, Home, LogOut, MessageSquare, Search, Settings, Share2, Upload } from "lucide-react";
import { Button, Icon } from "@/components/a4-landing/Primitives";
import { A4Mark, Eyebrow, LIGHT_GLOW, MUTED_GLOW } from "@/components/fx/primitives";
import { BODY, DARK_CARD, DocPanel, FrameBar, GRAD, INDIGO, INK, PERI, SANS, SECTION_PAD, StatusPill, gradTail, kicker } from "./SectionKit";

type PortalFeatureVariant = "default" | "technology" | "upload-dashboard";

interface PortalFeatureProps {
  portalImage: string;
  variant?: PortalFeatureVariant;
  // Main top card content
  sectionLabel?: string;
  heading?: string;
  description?: string;
  bulletIntro?: string;
  bulletItems?: string[];
  closingText?: string;
  ctaLabel?: string;
  ctaHref?: string;
  // Bottom-left small card
  bottomTitle?: string;
  bottomDescription?: string;
  // Quote card
  quoteText?: string;
  // Optional Workflow Detail
  workflowDetail?: {
    heading: string;
    description: string;
  };
  /** Section number for the eyebrow ("02"). */
  n?: string;
  /** Section surface; the light glow by default. */
  surface?: "light" | "muted" | "white";
}

const SURFACES = { light: LIGHT_GLOW, muted: MUTED_GLOW, white: "#FFFFFF" };

/* ── visuals ─────────────────────────────────────────────────────────────── */

function Spinner({ color = INDIGO }: { color?: string }) {
  return (
    <span
      aria-hidden="true"
      className="animate-spin"
      style={{ width: 12, height: 12, borderRadius: "50%", border: `2px solid ${color}`, borderTopColor: "transparent", display: "inline-block", flexShrink: 0 }}
    />
  );
}

function TechnologyVisual() {
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    let frame: number;
    const step = () => {
      setAnalysisProgress((prev) => (prev >= 100 ? 100 : prev + 1));
      frame = window.setTimeout(step, 60);
    };
    step();
    return () => window.clearTimeout(frame);
  }, []);

  const errors = ["BS32 - Balance sheet does not reconcile", "BS14 - Missing balance sheet note", "BS19 - Total current assets mismatch", "BI02 - Inventory valuation issue"];
  const confirmed = ["GI01 - ENTITY_LEGAL_NAME — GENERAL", "GI05 - REGISTERED_OFFICE — GENERAL", "BI02 - CONTACT_PERSON — GENERAL", "BI06 - PRIMARY_BUSINESS — GENERAL"];
  const done = analysisProgress === 100;

  return (
    <DocPanel style={{ padding: "clamp(18px,2.4vw,28px)", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <span style={{ width: 40, height: 40, borderRadius: 12, background: INK, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <A4Mark size={18} />
          </span>
          <span style={{ height: 8, width: "min(160px, 30vw)", borderRadius: 4, background: "#F4F4F5" }} />
        </div>
        <StatusPill tone="indigo">
          <Spinner /> Improving
        </StatusPill>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_.9fr]" style={{ gap: 14 }}>
        <div style={{ border: "1px solid #E4E4E7", borderRadius: 20, padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 12, background: "rgba(79,85,241,.1)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Icon name="scan-text" size={18} color={INDIGO} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: "-0.01em", textDecoration: done ? "line-through" : "none", opacity: done ? 0.55 : 1 }}>
                  Analyzing Financial Statement
                </div>
                <div style={{ fontFamily: BODY, fontSize: 12.5, color: "#71717A" }}>Generate AI report on financial statements</div>
              </div>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "#F4F4F5", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${analysisProgress}%`, borderRadius: 3, background: GRAD, transition: "width .15s linear" }} />
            </div>
            <p style={{ margin: 0, fontFamily: BODY, fontSize: 12.5, lineHeight: 1.5, color: "#71717A" }}>
              Uploading financial statements, extracting engagement data, validating fields and generating AI report.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: BODY, fontSize: 12.5, color: "#71717A" }}>
            <span>Setup status</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: SANS, fontWeight: 600, color: INDIGO }}>
              {!done ? <Spinner /> : null}
              {analysisProgress}%
            </span>
          </div>
        </div>

        <div style={{ border: "1px solid #E4E4E7", borderRadius: 20, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: "-0.01em" }}>Analyze your Finance Document</div>
            <div style={{ marginTop: 2, fontFamily: BODY, fontSize: 12.5, color: "#71717A" }}>Drop your document and run advanced text recognition.</div>
          </div>
          <div style={{ flex: 1, border: "1.5px dashed #D4D4D8", borderRadius: 16, background: "#FAFAFA", padding: "14px 12px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
            <div style={{ fontFamily: BODY, fontSize: 12.5, color: "#52525B" }}>Drop your document here</div>
            <div style={{ fontFamily: BODY, fontSize: 11.5, color: "#71717A" }}>Support PDF files up to 10MB</div>
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
              <StatusPill tone="line" style={{ background: "#FFFFFF", color: INK }}>
                Choose Files
              </StatusPill>
              <StatusPill tone="ink">Analyze Document</StatusPill>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14 }}>
        {[
          { title: "Critical Errors", tone: "ink" as const, items: errors },
          { title: "Confirmed Correct Items", tone: "indigo" as const, items: confirmed },
        ].map((b) => (
          <div key={b.title} style={{ border: "1px solid #E4E4E7", borderRadius: 20, padding: "14px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{b.title}</span>
              <StatusPill tone={b.tone} style={{ height: 24, padding: "0 10px", fontSize: 12 }}>
                33
              </StatusPill>
            </div>
            {b.items.map((it) => (
              <div key={it} style={{ padding: "6px 0", borderTop: "1px solid #F4F4F5", fontFamily: BODY, fontSize: 11.5, color: "#52525B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {it}
              </div>
            ))}
          </div>
        ))}
      </div>
    </DocPanel>
  );
}

function UploadDashboardVisual() {
  const navIcons = [FileText, FolderUp, Share2, Building2, MessageSquare];
  return (
    <DocPanel style={{ display: "flex", minHeight: 520 }}>
      <div className="hidden sm:flex" style={{ width: 68, flexShrink: 0, background: INK, flexDirection: "column", alignItems: "center", padding: "22px 0", gap: 22 }}>
        <span style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,.08)", display: "grid", placeItems: "center", marginBottom: 6 }}>
          <A4Mark size={18} />
        </span>
        <span style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(139,143,247,.2)", display: "grid", placeItems: "center", color: "#FFFFFF" }}>
          <Home size={18} aria-hidden="true" />
        </span>
        {navIcons.map((I, i) => (
          <I key={i} size={18} color="#71717A" aria-hidden="true" />
        ))}
        <span style={{ marginTop: "auto", width: 34, height: 34, borderRadius: 17, background: INDIGO, color: "#FFFFFF", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600 }}>CL</span>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "0 clamp(14px,2vw,22px)", borderBottom: "1px solid #E4E4E7" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 34, padding: "0 6px 0 14px", borderRadius: 17, background: "#F4F4F5", width: "min(220px, 45%)" }}>
            <span style={{ flex: 1, fontFamily: BODY, fontSize: 12, color: "#71717A" }}>Search...</span>
            <Search size={14} color="#52525B" aria-hidden="true" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="hidden md:inline-flex">
              <StatusPill tone="line">Quick action</StatusPill>
            </span>
            <Settings size={16} color="#71717A" aria-hidden="true" />
            <Bell size={16} color="#71717A" aria-hidden="true" />
            <span className="hidden lg:flex" style={{ alignItems: "center", gap: 8, paddingLeft: 12, borderLeft: "1px solid #E4E4E7" }}>
              <span style={{ width: 28, height: 28, borderRadius: 14, background: "rgba(79,85,241,.12)", color: INDIGO, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600 }}>CL</span>
              <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                <span style={{ fontSize: 12, fontWeight: 600 }}>Cleven</span>
                <span style={{ fontFamily: BODY, fontSize: 10.5, color: "#71717A" }}>Client</span>
              </span>
              <LogOut size={15} color="#A1A1AA" aria-hidden="true" />
            </span>
          </div>
        </div>

        <div style={{ flex: 1, padding: "clamp(16px,2.4vw,26px)", display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em" }}>Welcome Back, Cleven</div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 14, border: "1px solid #E4E4E7", fontFamily: BODY, fontSize: 13 }}>
              <Icon name="alert-circle" size={16} color={INDIGO} />
              <span>
                <strong style={{ fontWeight: 600 }}>Warning:</strong> <span style={{ color: "#52525B" }}>No documents uploaded this month</span>
              </span>
            </div>
          </div>

          <div style={{ border: "1.5px dashed #D4D4D8", borderRadius: 20, padding: "26px 16px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <span style={{ width: 52, height: 52, borderRadius: 16, background: "#F4F4F5", display: "grid", placeItems: "center" }}>
              <Upload size={20} color="#52525B" aria-hidden="true" />
            </span>
            <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>Click to upload PDF</span>
            <span style={{ ...kicker, fontSize: 11 }}>Maximum size 10MB</span>
          </div>

          <div style={{ marginTop: "auto", borderRadius: 18, background: "#FAFAFA", border: "1px solid #E4E4E7", padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, paddingBottom: 10, borderBottom: "1px solid #E4E4E7" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Pending Requests</span>
              <StatusPill tone="indigo" style={{ height: 24, fontSize: 11.5 }}>
                2 Action Required
              </StatusPill>
            </div>
            {[
              { t: "Q1 VAT Return Invoices", s: "Overdue by 3 days", strong: true },
              { t: "Copy of Director's ID Proof", s: "Due in 5 days", strong: false },
            ].map((r) => (
              <div key={r.t} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, paddingTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 10, background: r.strong ? INK : "rgba(79,85,241,.1)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <FileText size={15} color={r.strong ? "#FFFFFF" : INDIGO} aria-hidden="true" />
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.t}</span>
                    <span style={{ fontFamily: BODY, fontSize: 11.5, fontWeight: r.strong ? 600 : 500, color: r.strong ? INK : "#71717A" }}>{r.s}</span>
                  </span>
                </div>
                <StatusPill tone="line" style={{ background: "#FFFFFF", color: INK, height: 30 }}>
                  Upload
                </StatusPill>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DocPanel>
  );
}

function ImageVisual({ src }: { src: string }) {
  const sample = src.startsWith("/brand/portal/");
  return (
    <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", background: "#FFFFFF", border: "1px solid #E4E4E7", boxShadow: "0 50px 120px rgba(9,9,11,.16)" }}>
      <FrameBar
        label={
          <>
            Your client portal<span style={{ fontWeight: 500, color: "#A1A1AA" }}>Powered by Vacei</span>
          </>
        }
      />
      <Image src={src} alt="Client portal" width={1600} height={940} sizes="(max-width: 1024px) 100vw, 640px" style={{ width: "100%", height: "auto", display: "block" }} />
      {sample ? (
        <span style={{ position: "absolute", right: 14, top: 54, padding: "5px 12px", borderRadius: 999, background: "rgba(9,9,11,.78)", color: "#FFFFFF", fontFamily: SANS, fontSize: 12, fontWeight: 500 }}>
          Sample data · fictional companies
        </span>
      ) : null}
    </div>
  );
}

/* ── section ─────────────────────────────────────────────────────────────── */

/**
 * "How it works" block in the A4 design language: numbered eyebrow, H2 with
 * its last word on the gradient, the lead and the scope bullets on the left;
 * a product panel on the right; then a row of cards alternating light and dark
 * (workflow detail, the portal line, the quote).
 */
const PortalFeature = ({
  portalImage,
  variant = "default",
  sectionLabel = "Our services",
  heading = "How it works",
  description = "Each review follows a structured, AI-assisted analysis flow designed to support professional financial statement reviews.",
  bulletIntro = "Upload financial statements in PDF format",
  bulletItems = [
    "Select specific review tests or run a full review",
    "Automated audit-style checks and validations",
    "Review findings and finalise with professional judgement",
  ],
  closingText = "Workflows are designed to highlight both confirmations and issues clearly, ensuring consistency, traceability, and an efficient review process.",
  ctaLabel = "Explore the client portal",
  ctaHref = "/portal/client-portal",
  bottomTitle = "AI Review",
  bottomDescription = "Documents, tasks, deadlines and communication in one place.",
  quoteText = "Good firms rely on experience. Great firms rely on structure. A4 exists to make that structure visible, auditable, and scalable.",
  workflowDetail,
  n,
  surface = "light",
}: PortalFeatureProps) => {
  const pathname = usePathname() || "";
  const here = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
  const showCta = !!ctaLabel && !!ctaHref && here !== ctaHref;

  const cards: { key: string; dark: boolean; node: React.ReactNode }[] = [];
  if (workflowDetail)
    cards.push({
      key: "wf",
      dark: false,
      node: (
        <>
          <h3 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15 }}>{workflowDetail.heading}</h3>
          <p style={{ margin: "12px 0 0", fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: "#52525B" }}>{workflowDetail.description}</p>
        </>
      ),
    });
  cards.push({
    key: "quote",
    dark: true,
    node: (
      <>
        <span aria-hidden="true" style={{ display: "block", height: 44, fontSize: 72, fontWeight: 600, lineHeight: 1, color: PERI }}>
          &ldquo;
        </span>
        <p style={{ margin: "8px 0 0", fontSize: "clamp(19px,1.6vw,22px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.4, color: "#FFFFFF", textWrap: "pretty" }}>{quoteText}</p>
      </>
    ),
  });
  cards.push({
    key: "bottom",
    dark: false,
    node: (
      <>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: INK, display: "grid", placeItems: "center" }}>
            <A4Mark size={16} />
          </span>
          <h3 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: "-0.03em" }}>{bottomTitle}</h3>
        </div>
        <p style={{ margin: "14px 0 0", fontFamily: BODY, fontSize: 16, lineHeight: 1.55, color: "#52525B" }}>{bottomDescription}</p>
      </>
    ),
  });

  return (
    <section style={{ position: "relative", overflow: "hidden", padding: SECTION_PAD, background: SURFACES[surface], color: INK, fontFamily: SANS }}>
      <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto" }}>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-14 lg:gap-[72px] items-center">
          <div>
            <Eyebrow n={n}>{sectionLabel}</Eyebrow>
            <h2 data-fx="rise" data-d="100" style={{ margin: "16px 0 0", fontSize: "clamp(36px,4.4vw,68px)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.03, textWrap: "balance" }}>
              {gradTail(heading)}
            </h2>
            {description ? (
              <p data-fx="rise" data-d="200" style={{ margin: "20px 0 0", maxWidth: 560, fontFamily: BODY, fontSize: 18, lineHeight: 1.55, color: "#52525B", textWrap: "pretty" }}>
                {description}
              </p>
            ) : null}
            <div data-fx="rise" data-d="280" style={{ marginTop: 28 }}>
              {bulletIntro ? <div style={{ marginBottom: 6, fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>{bulletIntro}</div> : null}
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {bulletItems.map((item, index) => (
                  <li
                    key={index}
                    style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid #E4E4E7", fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.4 }}
                  >
                    <span className="a4-bullet" style={{ marginTop: 7 }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {closingText ? (
              <p data-fx="rise" data-d="340" style={{ margin: "22px 0 0", maxWidth: 560, fontFamily: BODY, fontSize: 16, lineHeight: 1.6, color: "#52525B", textWrap: "pretty" }}>
                {closingText}
              </p>
            ) : null}
            {showCta ? (
              <div data-fx="rise" data-d="400" style={{ marginTop: 28 }}>
                <Button variant="outline-light" size="md" href={ctaHref}>
                  {ctaLabel}
                  <Icon name="arrow-up-right" size={17} color={INK} />
                </Button>
              </div>
            ) : null}
          </div>

          <div data-fx="rise" data-d="160" data-dy="70" style={{ minWidth: 0 }}>
            {variant === "technology" ? <TechnologyVisual /> : variant === "upload-dashboard" ? <UploadDashboardVisual /> : <ImageVisual src={portalImage} />}
          </div>
        </div>

        <div style={{ marginTop: "clamp(56px,7vw,88px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 16 }}>
          {cards.map((c, i) => (
            <div
              key={c.key}
              data-fx="rise"
              data-d={i * 80}
              className={
                c.dark
                  ? "rounded-[24px] border border-white/[.06] transition-[border-color,box-shadow] duration-300 hover:border-[rgba(139,143,247,.45)] hover:shadow-[0_24px_60px_rgba(9,9,11,.28)]"
                  : "a4-card"
              }
              style={{
                padding: 28,
                minHeight: 220,
                display: "flex",
                flexDirection: "column",
                justifyContent: c.key === "quote" ? "space-between" : "flex-start",
                ...(c.dark ? { background: DARK_CARD, color: "#FFFFFF" } : null),
              }}
            >
              {c.node}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortalFeature;
