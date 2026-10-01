"use client";
import { useTranslation } from "react-i18next";
import type { ReviewFailure } from "@/lib/review-failure";

/**
 * The visible failure state for both upload endpoints. Previously a failed
 * upload showed at most a bare one-line string, so a 502 from the review engine
 * read to the user as a dead button. This always says what happened, whether
 * their details reached us, and what happens next.
 */
export function ReviewFailureNotice({
  failure,
  title,
}: {
  failure: ReviewFailure;
  /** Override the heading when the call was not a file review (e.g. connect-software). */
  title?: string;
}) {
  const { t } = useTranslation("common");

  const isServer = failure.kind === "server";
  // A server-supplied reason is the most specific thing we can show; fall back
  // to a generic line by class of status when the body carried none.
  const reason = isServer
    ? failure.detail ||
      (failure.status >= 500
        ? t("reviewError.serverBody")
        : t("reviewError.requestBody"))
    : t("reviewError.networkBody");

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        display: "grid",
        gap: 6,
        padding: "16px 18px",
        borderRadius: 16,
        borderTop: "1px solid rgba(194,48,61,.22)",
        borderRight: "1px solid rgba(194,48,61,.22)",
        borderBottom: "1px solid rgba(194,48,61,.22)",
        borderLeft: "3px solid #c2303d",
        background: "rgba(194,48,61,.05)",
        fontFamily: "var(--a4x-body)",
      }}
    >
      <strong style={{ fontFamily: "var(--a4x-display)", fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em", color: "#c2303d" }}>
        {title ?? t("reviewError.title")}
      </strong>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#3F3F46" }}>
        {reason}
      </p>
      {/* One line, not two. It previously stacked a "we've got you" note on top
          of a "you may not be on record" note, which contradicted itself. The
          server now reports whether the lead actually landed, so say only the
          true one — and never promise follow-up we cannot deliver. */}
      {isServer && (
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#3F3F46" }}>
          {failure.leadCaptured
            ? t("reviewError.leadCaptured")
            : t("reviewError.leadNotCaptured")}
        </p>
      )}
    </div>
  );
}
