"use client";

import React, { useState } from "react";
import { MBRCheck } from "@/components/a4-landing/MBRCheck";
import { Button, Container, Icon, Reveal } from "@/components/a4-landing/Primitives";
import { PageHero } from "@/app/[locale]/services/components/PageHero";
import { ServicePortalBand } from "@/app/[locale]/services/components/ServicePortalBand";
import LocalizedLink from "@/components/common/LocalizedLink";
import { MBR_BAROS_URL } from "@/lib/mbr-links";

export function MbrCheckPageContent() {
  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="Malta Business Registry"
        title={
          <>
            Check MBR filing status &{" "}
            <span style={{ color: "var(--a4-primary-bright)" }}>penalties</span>
          </>
        }
        sub="Use the official Malta Business Registry (BAROS) to see your company’s registration details, annual return status and any enforcement notices — free, direct from the source."
      >
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 mt-8 w-full max-w-lg mx-auto sm:max-w-none px-1">
          <Button variant="primary" size="lg" href={MBR_BAROS_URL} target="_blank" rel="noopener noreferrer" style={{ width: "100%", maxWidth: 360 }}>
            Open MBR BAROS portal <Icon name="external-link" size={18} color="#000" />
          </Button>
          <LocalizedLink href="/compliance-calendar" className="w-full sm:w-auto" style={{ maxWidth: 360 }}>
            <Button variant="outline-dark" size="lg" style={{ width: "100%" }}>
              2026 compliance calendar
            </Button>
          </LocalizedLink>
        </div>
      </PageHero>

      <MBRCheck variant="page" />

      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(48px,6vw,72px) 0" }}>
        <Container>
          <Reveal
            style={{
              background: "var(--a4-surface-card)",
              border: "1px solid var(--a4-hairline-light)",
              borderRadius: "var(--a4-r-lg)",
              padding: "clamp(24px,3vw,36px)",
            }}
          >
            <h2
              className="a4-font-display font-medium text-[var(--a4-ink)]"
              style={{ fontSize: "clamp(22px,2.6vw,28px)" }}
            >
              Not Malta? Other registries
            </h2>
            <p className="a4-font-body text-[var(--a4-mute)] mt-3 max-w-2xl text-[15px] leading-relaxed">
              This page covers the <strong className="text-[var(--a4-ink)]">Malta Business Registry (MBR)</strong> only.
              If you need India&apos;s Ministry of Corporate Affairs (MCA) master data or ROC filing status, use the
              official MCA portal and FO Services — A4 Services Limited operates in Malta and does not provide MCA
              lookups.
            </p>
            <p className="a4-font-body text-[13px] text-[var(--a4-mute)] mt-4">
              MBR penalty enforcement and strike-off notices are published through the official registry — always verify
              there before relying on any third-party estimate.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="bg-[var(--a4-canvas-light)] border-t border-[var(--a4-hairline-light)]" style={{ padding: "0 0 clamp(48px,6vw,72px)" }}>
        <Container>
          <Reveal
            style={{
              background: "var(--a4-surface-card)",
              border: "1px solid var(--a4-hairline-light)",
              borderRadius: "var(--a4-r-lg)",
              padding: "clamp(24px,3vw,36px)",
              textAlign: "center",
            }}
          >
            <h2 className="a4-font-display font-medium text-[var(--a4-ink)]" style={{ fontSize: "clamp(22px,2.6vw,28px)" }}>
              Need help bringing filings up to date?
            </h2>
            <p className="a4-font-body text-[var(--a4-mute)] mt-3 max-w-lg mx-auto text-[15px] leading-relaxed">
              Our team handles overdue MBR returns, audited accounts and CFR submissions — fixed quotes, no surprises.
            </p>
            <div className="flex gap-3 justify-center flex-wrap mt-6">
              <LocalizedLink href="/contact">
                <Button variant="primary" size="md">
                  Speak to the team <Icon name="arrow-right" size={16} color="#000" />
                </Button>
              </LocalizedLink>
            </div>
          </Reveal>
        </Container>
      </section>

      <ServicePortalBand serviceName="MBR compliance" />
    </div>
  );
}

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

  return (
    <div className="a4-site-page">
      <PageHero
        eyebrow="Lead resource"
        title="Malta compliance deadline calendar 2026"
        sub="VAT, payroll, MBR, provisional tax and audit dates — add them to your calendar in one click."
      />
      <section className="bg-[var(--a4-canvas-light)]" style={{ padding: "clamp(56px,8vw,96px) 0" }}>
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12 items-start">
            <Reveal>
              <h2 className="a4-font-display font-medium text-[var(--a4-ink)]" style={{ fontSize: "clamp(24px,3vw,32px)" }}>
                What&apos;s included
              </h2>
              <ul className="mt-5 space-y-3 a4-font-body text-[15px] text-[var(--a4-mute)] leading-relaxed">
                <li>Quarterly VAT filing reminders</li>
                <li>FS5 payroll &amp; SSC monthly cycle</li>
                <li>Provisional tax instalment dates</li>
                <li>MBR annual return window</li>
                <li>Typical audited accounts &amp; tax return deadline</li>
              </ul>
              <p className="a4-font-body text-[13px] text-[var(--a4-mute)] mt-6">
                Dates are indicative — your company&apos;s year-end and VAT scheme may shift exact deadlines. A4 clients get a tailored compliance calendar in their portal.
              </p>
              <LocalizedLink href="/mbr-check" className="inline-flex items-center gap-1.5 mt-4 a4-font-body text-[14px] font-semibold text-[var(--a4-primary)] no-underline hover:underline">
                Check your MBR status on BAROS <Icon name="arrow-right" size={14} color="var(--a4-primary)" />
              </LocalizedLink>
            </Reveal>
            <Reveal delay={80}>
              <form
                onSubmit={download}
                style={{
                  background: "var(--a4-surface-card)",
                  border: "1px solid var(--a4-hairline-light)",
                  borderRadius: "var(--a4-r-lg)",
                  padding: "clamp(26px,3vw,40px)",
                }}
              >
                <h3 className="a4-font-display font-medium text-[var(--a4-ink)] text-[22px] mb-2">
                  Download the .ics calendar
                </h3>
                <p className="a4-font-body text-[14px] text-[var(--a4-mute)] mb-5">
                  Enter your work email — we&apos;ll send the file and occasional compliance tips (unsubscribe anytime).
                </p>
                <p className="a4-font-body text-[13px] text-[var(--a4-mute)] mb-5 rounded-[var(--a4-r-md)] border border-[var(--a4-hairline-light)] bg-[var(--a4-surface-soft)] px-3.5 py-3 leading-relaxed">
                  The download is a <strong className="text-[var(--a4-ink)]">calendar file (.ics)</strong>, not a PDF.
                  On Windows it usually opens in <strong className="text-[var(--a4-ink)]">Outlook</strong> so you can
                  import the deadlines — choose <strong className="text-[var(--a4-ink)]">Save</strong> or{" "}
                  <strong className="text-[var(--a4-ink)]">Import</strong> to add them to your calendar. On Mac, use
                  Calendar; you can also import the same file into Google Calendar.
                </p>
                <label className="a4-font-body text-[12px] font-semibold uppercase tracking-wide text-[var(--a4-mute)]">
                  Work email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full mt-2 mb-4 rounded-[var(--a4-r-md)] border border-[var(--a4-hairline-light)] bg-[var(--a4-surface-soft)] px-4 py-3 a4-font-body text-[15px] text-[var(--a4-ink)] outline-none"
                />
                {error && <p className="a4-font-body text-[13px] text-red-500 mb-3">{error}</p>}
                {status === "success" && (
                  <p
                    className="a4-font-body text-[13px] mb-3 rounded-[var(--a4-r-md)] border px-3.5 py-3 leading-relaxed"
                    style={{
                      color: "var(--a4-ink)",
                      borderColor: "rgba(73,79,223,.35)",
                      background: "rgba(73,79,223,.08)",
                    }}
                  >
                    Download started. Open <strong>malta-compliance-deadlines-2026.ics</strong> from your Downloads
                    folder — if Outlook opens, click <strong>Save</strong> or <strong>Import</strong> to add the 2026
                    Malta deadlines to your calendar.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full h-12 rounded-[var(--a4-r-full)] bg-black text-white a4-font-body text-[16px] font-semibold inline-flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50"
                >
                  {status === "loading"
                    ? "Preparing download…"
                    : status === "success"
                      ? "Download again"
                      : "Download calendar"}
                  <Icon name="download" size={16} color="#fff" />
                </button>
              </form>
            </Reveal>
          </div>
        </Container>
      </section>
      <ServicePortalBand serviceName="MBR compliance" />
    </div>
  );
}
