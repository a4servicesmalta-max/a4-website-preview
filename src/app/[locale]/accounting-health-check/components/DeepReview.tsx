"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FindingsList } from "./FindingsList";
import { Field, primaryBtn, outlineBtn, type Contact } from "./Field";
import { ReviewFailureNotice } from "./ReviewFailureNotice";
import { NETWORK_FAILURE, readReviewFailure, type ReviewFailure } from "@/lib/review-failure";
import type { ReviewResponse } from "@/app/api/fs-gap-review/types";

type AccountingResponse = {
  company?: string;
  score: number;
  band: string;
  narrative?: string;
  findings?: ReviewResponse["findings"];
  reportBase64?: string;
  reportName?: string;
};

type AnyResponse = ReviewResponse | AccountingResponse;

function isAccounting(d: AnyResponse): d is AccountingResponse {
  return (d as AccountingResponse).score !== undefined && (d as AccountingResponse).score !== null;
}

function download(b64: string, filename: string, mime: string) {
  const bin = atob(b64); const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([u8], { type: mime }));
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function DeepReview({
  contact,
  setContact,
  contactCaptured,
}: {
  contact: Contact;
  setContact: (c: Contact) => void;
  contactCaptured: boolean;
}) {
  const [path, setPath] = useState<"accounting" | "fs" | "connect">("accounting");
  const [file, setFile] = useState<File | null>(null);
  const [provider, setProvider] = useState<"" | "sage" | "quickbooks" | "xero">("");
  const [connectDone, setConnectDone] = useState(false);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [failure, setFailure] = useState<ReviewFailure | null>(null);
  const [data, setData] = useState<AnyResponse | null>(null);
  const [editContact, setEditContact] = useState(false);
  const { t } = useTranslation("common");

  // Email confirmation gate — the AI review only runs once the email is verified.
  const [verifiedToken, setVerifiedToken] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [vBusy, setVBusy] = useState(false);
  const [vErr, setVErr] = useState("");

  const showFields = !contactCaptured || editContact;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim());
  const verified = !!verifiedToken && verifiedEmail.toLowerCase() === contact.email.trim().toLowerCase();

  async function sendCode() {
    setVBusy(true); setVErr(""); setDevCode("");
    try {
      const r = await fetch("/api/verify/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: contact.email }) });
      const b = await r.json();
      if (!r.ok) { setVErr(b.error || "Could not send a code."); return; }
      // Server tells us whether the email actually went out — never claim "sent" when it didn't.
      if (!b.delivered && !b.devCode) { setVErr("We couldn't send the code email right now. Please try again in a few minutes, or email info@a4.com.mt."); return; }
      setChallengeToken(b.challengeToken); setCodeSent(true);
      if (b.devCode) setDevCode(b.devCode);
    } catch { setVErr("Could not send a code. Please try again."); }
    finally { setVBusy(false); }
  }

  async function confirmCode() {
    setVBusy(true); setVErr("");
    try {
      const r = await fetch("/api/verify/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: contact.email, code, challengeToken }) });
      const b = await r.json();
      if (!r.ok) { setVErr(b.error || "Verification failed."); return; }
      setVerifiedToken(b.verifiedToken); setVerifiedEmail(contact.email);
    } catch { setVErr("Verification failed. Please try again."); }
    finally { setVBusy(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (path === "connect") {
      if (!verified || !consent || !provider) return;
      setStatus("loading"); setFailure(null);
      try {
        const res = await fetch("/api/connect-accounting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: contact.email, name: contact.name, company: contact.company, provider, verifiedToken, consent: true }),
        });
        // Read the status before the body: a gateway error page is not JSON, and
        // letting res.json() throw here would report a server fault as a network one.
        if (!res.ok) { setFailure(await readReviewFailure(res)); setStatus("error"); return; }
        setConnectDone(true); setStatus("idle");
      } catch { setFailure(NETWORK_FAILURE); setStatus("error"); }
      return;
    }
    if (!verified || !file) return;
    setStatus("loading"); setFailure(null);
    const fd = new FormData();
    fd.append("email", contact.email); fd.append("name", contact.name); fd.append("company", contact.company);
    fd.append("consent", String(consent)); fd.append("verifiedToken", verifiedToken);
    const url = path === "accounting" ? "/api/accounting-health" : "/api/fs-gap-review";
    if (path === "accounting") {
      fd.append("tb", file);
    } else {
      fd.append("file", file); fd.append("kind", "fs");
    }
    try {
      const res = await fetch(url, { method: "POST", body: fd });
      if (!res.ok) { setFailure(await readReviewFailure(res)); setStatus("error"); return; }
      const body = await res.json();
      setData(body); setStatus("idle");
    } catch {
      // fetch rejected, or a 2xx body that would not parse — nothing usable came
      // back, and on a rejected fetch we cannot claim the lead reached us.
      setFailure(NETWORK_FAILURE); setStatus("error");
    }
  }

  if (data) {
    if (isAccounting(data)) {
      return (
        <div>
          <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 600 }}>Accounting health — {data.company}</h3>
          <p style={{ color: "var(--a4-mute)", fontSize: 14, margin: "4px 0 16px" }}>
            {data.score}/100 · {data.band}
          </p>
          {data.narrative && <p style={{ fontSize: 14.5, color: "var(--a4-body)", marginBottom: 16 }}>{data.narrative}</p>}
          {data.findings && <FindingsList findings={data.findings} />}
          {data.reportBase64 && data.reportName && (
            <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" style={primaryBtn()} onClick={() => download(data.reportBase64!, data.reportName!, "application/pdf")}>⬇ Download report (PDF)</button>
            </div>
          )}
        </div>
      );
    }

    const fsData = data as ReviewResponse;
    return (
      <div>
        <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 600 }}>{fsData.framework} review — {fsData.company}</h3>
        <p style={{ color: "var(--a4-mute)", fontSize: 14, margin: "4px 0 16px" }}>
          {fsData.stats.checks_run} checks · {fsData.stats.checks_passed} passed · {fsData.stats.checks_failed} flagged
        </p>
        <FindingsList findings={fsData.findings} />
        <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" style={primaryBtn()} onClick={() => download(fsData.reportBase64, fsData.reportName, "application/pdf")}>⬇ Download report (PDF)</button>
          {fsData.annotatedDocxBase64 && (
            <button type="button" style={outlineBtn} onClick={() => download(fsData.annotatedDocxBase64!, fsData.annotatedName || "review.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}>⬇ Annotated Word</button>
          )}
        </div>
      </div>
    );
  }

  if (connectDone) {
    const providerLabel: Record<string, string> = { sage: "Sage", quickbooks: "QuickBooks", xero: "Xero" };
    return (
      <div style={{ padding: "24px 0", display: "grid", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, color: "#1a7f4b", fontWeight: 700 }}>
          <span aria-hidden>✓</span> Request received
        </div>
        <p style={{ fontSize: 14.5, color: "var(--a4-body)", margin: 0, lineHeight: 1.6 }}>
          Thanks — we&apos;ll connect to <strong style={{ color: "var(--a4-ink)" }}>{providerLabel[provider] ?? provider}</strong> securely, run your accounting-health review, and email you the results.
        </p>
      </div>
    );
  }

  const tab = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: "12px 14px", borderRadius: 10, cursor: "pointer",
    border: `1px solid ${active ? "var(--a4-primary)" : "var(--a4-hairline-light)"}`,
    background: active ? "rgba(73,79,223,.06)" : "#fff",
    color: active ? "var(--a4-primary)" : "var(--a4-ink)",
    fontWeight: active ? 600 : 500, fontSize: 14.5, fontFamily: "var(--a4-font-body)",
  });

  const submitDisabled =
    path === "connect"
      ? status === "loading" || !consent || !verified || provider === ""
      : status === "loading" || !consent || !verified || !file;

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
      <div>
        <label style={{ fontSize: 13, color: "var(--a4-mute)", display: "block", marginBottom: 6 }}>What would you like reviewed?</label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={() => setPath("accounting")} aria-pressed={path === "accounting"} style={tab(path === "accounting")}>Trial balance</button>
          <button type="button" onClick={() => setPath("fs")} aria-pressed={path === "fs"} style={tab(path === "fs")}>Management accounts / FS</button>
          <button type="button" onClick={() => setPath("connect")} aria-pressed={path === "connect"} style={tab(path === "connect")}>Connect software</button>
        </div>
      </div>

      {path === "accounting" && (
        <label
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 4, minHeight: 92, padding: "16px", borderRadius: 12, cursor: "pointer", textAlign: "center",
            border: `1.5px dashed ${file ? "var(--a4-primary)" : "var(--a4-hairline-light)"}`,
            background: file ? "rgba(73,79,223,.04)" : "var(--a4-surface-soft)",
          }}
        >
          <input type="file" accept=".csv,.xlsx,.xlsm,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
          <span style={{ fontSize: 14.5, fontWeight: 600, color: file ? "var(--a4-primary)" : "var(--a4-ink)" }}>
            {file ? file.name : "Click to upload your trial balance"}
          </span>
          <span style={{ fontSize: 12.5, color: "var(--a4-mute)" }}>CSV, Excel or PDF · processed in memory, never stored</span>
        </label>
      )}

      {path === "fs" && (
        <label
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 4, minHeight: 92, padding: "16px", borderRadius: 12, cursor: "pointer", textAlign: "center",
            border: `1.5px dashed ${file ? "var(--a4-primary)" : "var(--a4-hairline-light)"}`,
            background: file ? "rgba(73,79,223,.04)" : "var(--a4-surface-soft)",
          }}
        >
          <input type="file" accept=".pdf,.doc,.docx,.xlsx,.xlsm" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
          <span style={{ fontSize: 14.5, fontWeight: 600, color: file ? "var(--a4-primary)" : "var(--a4-ink)" }}>
            {file ? file.name : "Click to upload your management accounts or financial statements"}
          </span>
          <span style={{ fontSize: 12.5, color: "var(--a4-mute)" }}>PDF, Word or Excel — management accounts or financial statements · processed in memory, never stored</span>
        </label>
      )}

      {path === "connect" && (
        <div style={{ display: "grid", gap: 10 }}>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--a4-body)", lineHeight: 1.6 }}>
            We&apos;ll connect securely and review your numbers — pick your software and confirm your email.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {(["sage", "quickbooks", "xero"] as const).map((p) => (
              <button key={p} type="button" onClick={() => setProvider(p)} aria-pressed={provider === p} style={tab(provider === p)}>
                {p === "sage" ? "Sage" : p === "quickbooks" ? "QuickBooks" : "Xero"}
              </button>
            ))}
          </div>
        </div>
      )}

      {showFields ? (
        <>
          <Field required type="email" placeholder="Work email" autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
          <Field required placeholder="Name" autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
          <Field required placeholder="Company" autoComplete="organization" value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} />
        </>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderRadius: 10, background: "var(--a4-surface-soft)", fontSize: 14 }}>
          <span style={{ color: "var(--a4-body)" }}>
            Reviewing as <strong style={{ color: "var(--a4-ink)" }}>{contact.email}</strong>{contact.company ? ` · ${contact.company}` : ""}
          </span>
          <button type="button" onClick={() => setEditContact(true)} style={{ background: "none", border: 0, color: "var(--a4-primary)", fontWeight: 600, cursor: "pointer", fontSize: 13.5, whiteSpace: "nowrap" }}>
            Use different details
          </button>
        </div>
      )}

      {!verified ? (
        <div style={{ border: "1px solid var(--a4-hairline-light)", borderRadius: 12, padding: 14, background: "var(--a4-surface-soft)", display: "grid", gap: 10 }}>
          <div style={{ fontSize: 13.5, color: "var(--a4-body)", lineHeight: 1.5 }}>
            <strong style={{ color: "var(--a4-ink)" }}>Confirm your email to run the review.</strong> We&apos;ll send a 6-digit code so your report reaches a real inbox.
          </div>
          {!codeSent ? (
            <button type="button" disabled={!emailValid || vBusy} onClick={sendCode}
              style={{ ...outlineBtn, alignSelf: "start", opacity: !emailValid || vBusy ? 0.5 : 1, cursor: !emailValid || vBusy ? "default" : "pointer" }}>
              {vBusy ? "Sending…" : "Send me a code"}
            </button>
          ) : (
            <>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Field placeholder="6-digit code" inputMode="numeric" maxLength={6} value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  style={{ maxWidth: 170, letterSpacing: "3px", fontWeight: 600 }} />
                <button type="button" disabled={code.length < 6 || vBusy} onClick={confirmCode} style={primaryBtn(code.length < 6 || vBusy)}>
                  {vBusy ? "Checking…" : "Confirm"}
                </button>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--a4-mute)" }}>
                {devCode ? `Test mode — your code is ${devCode}. ` : `Code sent to ${contact.email}. `}
                <button type="button" onClick={sendCode} disabled={vBusy} style={{ background: "none", border: 0, color: "var(--a4-primary)", cursor: "pointer", fontWeight: 600, fontSize: 12.5, padding: 0 }}>Resend</button>
              </div>
            </>
          )}
          {vErr && <p style={{ color: "#c2303d", fontSize: 13.5, margin: 0 }}>{vErr}</p>}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#1a7f4b", fontWeight: 600 }}>
          <span aria-hidden>✓</span> Email confirmed — {verifiedEmail}
        </div>
      )}

      <label style={{ fontSize: 13.5, display: "flex", gap: 9, alignItems: "flex-start", color: "var(--a4-body)", lineHeight: 1.5 }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required style={{ marginTop: 3, accentColor: "var(--a4-primary)", width: 16, height: 16 }} />
        I understand my file is processed to generate this review and is not stored.
      </label>

      <button type="submit" disabled={submitDisabled} style={primaryBtn(submitDisabled)}>
        {status === "loading"
          ? (path === "connect" ? "Sending request…" : "Analyzing… (up to ~60s)")
          : verified
            ? (path === "connect" ? "Request my review" : "Run my review")
            : "Confirm your email to run"}
      </button>
      {status === "error" && failure && (
        <ReviewFailureNotice
          failure={failure}
          title={path === "connect" ? t("reviewError.connectRequestFailed") : undefined}
        />
      )}
    </form>
  );
}
