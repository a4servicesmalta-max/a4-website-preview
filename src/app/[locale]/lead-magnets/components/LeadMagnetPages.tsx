"use client";

import React, { useState } from "react";
import { Icon } from "@/components/a4-landing/Primitives";
import { A4Mark, LIGHT_GLOW, gradText } from "@/components/fx/primitives";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";

const SANS = "var(--a4x-display)";
const BODY = "var(--a4x-body)";
const INDIGO = "#4F55F1";
const INK = "#09090B";

const INCLUDED = [
  "Quarterly VAT filing reminders",
  "FS5 payroll & SSC monthly cycle",
  "Provisional tax instalment dates",
  "MBR annual return window",
  "Typical audited accounts & tax return deadline",
];

export function ComplianceCalendarContent() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState("");

  const download = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter your email to download the calendar.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, magnet: "compliance-calendar-2026" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Download failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "malta-compliance-deadlines-2026.ics";
      a.click();
      URL.revokeObjectURL(url);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
      setStatus("error");
    }
  };

  const strong: React.CSSProperties = { color: INK, fontWeight: 600 };

  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="Lead resource"
        title="Malta compliance deadline calendar 2026"
        sub="VAT, payroll, MBR, provisional tax and audit dates — add them to your calendar in one click."
      />
      <section style={{ position: "relative", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", background: LIGHT_GLOW, color: INK }}>
        <div className="cp-split" style={{ maxWidth: 1280, margin: "0 auto", alignItems: "start" }}>
          {/* What's included — numbered rows */}
          <div>
            <h2 style={{ margin: 0, fontFamily: SANS, fontSize: "clamp(40px,5.2vw,84px)", letterSpacing: "-0.035em", lineHeight: 1.05 }}>
              <span data-fx="rise" style={{ display: "block", fontWeight: 500 }}>
                What&apos;s
              </span>
              <span data-fx="rise" data-d="100" style={{ display: "block", fontWeight: 600, letterSpacing: "-0.04em", paddingBottom: ".08em", ...gradText }}>
                included
              </span>
            </h2>
            <ol data-fx="rise" data-d="200" style={{ margin: "clamp(32px,4vw,48px) 0 0", padding: 0, listStyle: "none" }}>
              {INCLUDED.map((item, i) => (
                <li
                  key={item}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "48px 1fr",
                    gap: 12,
                    padding: "20px 0",
                    borderTop: "1px solid #E4E4E7",
                    ...(i === INCLUDED.length - 1 ? { borderBottom: "1px solid #E4E4E7" } : null),
                  }}
                >
                  <span style={{ paddingTop: 3, fontFamily: SANS, fontSize: 16, fontWeight: 600, letterSpacing: ".02em", color: INDIGO }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontFamily: SANS, fontSize: "clamp(18px,1.6vw,22px)", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.35 }}>{item}</span>
                </li>
              ))}
            </ol>
            <p data-fx="rise" data-d="300" style={{ margin: "24px 0 0", maxWidth: 560, fontFamily: BODY, fontSize: 14.5, lineHeight: 1.6, color: "#52525B" }}>
              Dates are indicative — your company&apos;s year-end and VAT scheme may shift exact deadlines. A4 clients get a tailored compliance calendar in their portal.
            </p>
          </div>

          {/* The form as the design's document panel */}
          <form
            onSubmit={download}
            data-fx="rise"
            data-d="150"
            data-dy="80"
            style={{ position: "relative", background: "#FFFFFF", border: "1px solid #E4E4E7", borderRadius: 28, boxShadow: "0 50px 120px rgba(9,9,11,.12)", overflow: "hidden" }}
          >
            <div style={{ display: "flex", alignItems: "center", padding: "clamp(24px,3.4vw,40px) clamp(24px,3.4vw,40px) 0" }}>
              <A4Mark size={32} color={INK} />
              <span style={{ width: 1.5, height: 26, margin: "0 12px", background: INK, opacity: 0.35 }} />
              <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 500, letterSpacing: "-0.02em" }}>A4 Services</span>
            </div>
            <div style={{ padding: "28px clamp(24px,3.4vw,40px) clamp(24px,3.4vw,40px)" }}>
              <h3 style={{ margin: 0, fontFamily: SANS, fontSize: "clamp(28px,2.8vw,38px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.08 }}>Download the .ics calendar</h3>
              <p style={{ margin: "12px 0 0", fontFamily: BODY, fontSize: 15.5, lineHeight: 1.6, color: "#52525B" }}>
                Enter your work email — we&apos;ll send the file and occasional compliance tips (unsubscribe anytime).
              </p>
              <p style={{ margin: "20px 0 0", padding: "16px 18px", borderRadius: 16, background: "#F4F4F5", fontFamily: BODY, fontSize: 14, lineHeight: 1.6, color: "#52525B" }}>
                The download is a <strong style={strong}>calendar file (.ics)</strong>, not a PDF. On Windows it usually opens in <strong style={strong}>Outlook</strong> so you can import the
                deadlines — choose <strong style={strong}>Save</strong> or <strong style={strong}>Import</strong> to add them to your calendar. On Mac, use Calendar; you can also import the same
                file into Google Calendar.
              </p>
              <label htmlFor="lm-email" className="cp-label" style={{ marginTop: 26 }}>
                Work email
              </label>
              <input
                id="lm-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
                className="cp-input"
                aria-invalid={status === "error" && Boolean(error)}
                aria-describedby={error ? "lm-email-err" : undefined}
              />
              {error && (
                <p id="lm-email-err" className="cp-error" role="alert">
                  {error}
                </p>
              )}
              {status === "success" && (
                <p
                  role="status"
                  style={{ margin: "16px 0 0", padding: "16px 18px", borderRadius: 16, border: "1px solid rgba(79,85,241,.3)", background: "rgba(79,85,241,.06)", fontFamily: BODY, fontSize: 14, lineHeight: 1.6, color: INK }}
                >
                  Download started. Open <strong>malta-compliance-deadlines-2026.ics</strong> from your Downloads folder — if Outlook opens, click <strong>Save</strong> or{" "}
                  <strong>Import</strong> to add the 2026 Malta deadlines to your calendar.
                </p>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                className="a4-btn a4-btn-ink"
                style={{ width: "100%", height: 64, marginTop: 22, fontSize: 19, opacity: status === "loading" ? 0.55 : 1 }}
              >
                {status === "loading" ? "Preparing download…" : status === "success" ? "Download again" : "Download calendar"}
                <Icon name="download" size={18} color="#FFFFFF" />
              </button>
            </div>
          </form>
        </div>
      </section>
      <ServicePortalBand serviceName="MBR compliance" />
    </div>
  );
}
