"use client";

import React, { useState } from "react";
import { Icon, Reveal } from "@/components/a4-landing/Primitives";
import { getCaptchaToken } from "@/lib/turnstileClient";

export function CalendarDownloadForm() {
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
      const captchaToken = await getCaptchaToken("lead-magnet");
      const res = await fetch("/api/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captchaToken, email, magnet: "compliance-calendar-2026" }),
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
  );
}
