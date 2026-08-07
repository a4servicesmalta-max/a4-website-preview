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
        padding: "12px 14px",
        borderRadius: 10,
        border: "1px solid rgba(194,48,61,.28)",
        background: "rgba(194,48,61,.06)",
        fontFamily: "var(--a4-font-body)",
      }}
    >
      <strong style={{ fontSize: 14, color: "#c2303d" }}>
        {title ?? t("reviewError.title")}
      </strong>
      <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "var(--a4-body)" }}>
        {reason}
      </p>
      {isServer && failure.leadCaptured && (
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "var(--a4-body)" }}>
          {t("reviewError.leadCaptured")}
        </p>
      )}
      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: "var(--a4-mute)" }}>
        {t("reviewError.retry")}
      </p>
    </div>
  );
}
