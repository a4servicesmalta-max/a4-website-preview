"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/a4-landing/Primitives";
import { FindingsList } from "./FindingsList";
import { Field, primaryBtn, outlineBtn, type Contact } from "./Field";
import { ReviewFailureNotice } from "./ReviewFailureNotice";
import { NETWORK_FAILURE, readReviewFailure, type ReviewFailure } from "@/lib/review-failure";
import type { ReviewResponse } from "@/app/api/fs-gap-review/types";
import { trackConversion } from "@/lib/analytics";

const SANS = "var(--a4x-display)";
const BODY = "var(--a4x-body)";
const INDIGO = "#4F55F1";
const INK = "#09090B";

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

const resultTitle: React.CSSProperties = { margin: 0, fontFamily: SANS, fontSize: "clamp(26px,2.8vw,36px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.1, color: INK };
const resultMeta: React.CSSProperties = { margin: "8px 0 22px", fontFamily: SANS, fontSize: 16, fontWeight: 600, letterSpacing: ".01em", color: "#52525B" };
const label: React.CSSProperties = { display: "block", margin: "0 0 10px", fontFamily: SANS, fontSize: 15, fontWeight: 600, color: "#3F3F46" };

/** Upload drop zone: the real file input covers the zone, so it stays keyboard-reachable. */
function DropZone({ file, accept, onFile, title, hint }: { file: File | null; accept: string; onFile: (f: File | null) => void; title: string; hint: string }) {
  return (
    <label
      className="cp-drop"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        minHeight: 132,
        padding: "22px 20px",
        borderRadius: 20,
        cursor: "pointer",
        textAlign: "center",
        border: `1.5px dashed ${file ? INDIGO : "#D4D4D8"}`,
        background: file ? "rgba(79,85,241,.05)" : "#FAFAFA",
        transition: "border-color .3s, background .3s",
      }}
    >
      <input type="file" accept={accept} onChange={(e) => onFile(e.target.files?.[0] || null)} />
      <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: "50%", display: "grid", placeItems: "center", background: "#FFFFFF", border: "1px solid #E4E4E7", marginBottom: 4 }}>
        <Icon name={file ? "file-check-2" : "upload-cloud"} size={19} color={INDIGO} />
      </span>
      <span style={{ fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em", color: file ? INDIGO : INK, overflowWrap: "anywhere" }}>{file ? file.name : title}</span>
      <span style={{ fontFamily: BODY, fontSize: 13, lineHeight: 1.5, color: "#71717A" }}>{hint}</span>
    </label>
  );
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
      // The engine accepted the file and the lead is recorded. Only here — a 502
      // from the review route lands on the !res.ok branch above and reports nothing.
      trackConversion("financial_upload_submit");
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
        <div data-fx="rise">
          <h3 style={resultTitle}>Accounting health — {data.company}</h3>
          <p style={resultMeta}>
            {data.score}/100 · {data.band}
          </p>
          {data.narrative && <p style={{ margin: "0 0 20px", fontFamily: BODY, fontSize: 15.5, lineHeight: 1.6, color: "#3F3F46" }}>{data.narrative}</p>}
          {data.findings && <FindingsList findings={data.findings} />}
          {data.reportBase64 && data.reportName && (
            <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" style={primaryBtn()} onClick={() => download(data.reportBase64!, data.reportName!, "application/pdf")}>
                <Icon name="download" size={17} color="#FFFFFF" /> Download report (PDF)
              </button>
            </div>
          )}
        </div>
      );
    }

    const fsData = data as ReviewResponse;
    return (
      <div data-fx="rise">
        <h3 style={resultTitle}>{fsData.framework} review — {fsData.company}</h3>
        <p style={resultMeta}>
          {fsData.stats.checks_run} checks · {fsData.stats.checks_passed} passed · {fsData.stats.checks_failed} flagged
        </p>
        <FindingsList findings={fsData.findings} />
        <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" style={primaryBtn()} onClick={() => download(fsData.reportBase64, fsData.reportName, "application/pdf")}>
            <Icon name="download" size={17} color="#FFFFFF" /> Download report (PDF)
          </button>
          {fsData.annotatedDocxBase64 && (
            <button type="button" style={outlineBtn} onClick={() => download(fsData.annotatedDocxBase64!, fsData.annotatedName || "review.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}>
              <Icon name="download" size={17} color={INK} /> Annotated Word
            </button>
          )}
        </div>
      </div>
    );
  }

  if (connectDone) {
    const providerLabel: Record<string, string> = { sage: "Sage", quickbooks: "QuickBooks", xero: "Xero" };
    return (
      <div data-fx="rise" style={{ padding: "12px 0", display: "grid", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: SANS, fontSize: 24, fontWeight: 600, letterSpacing: "-0.03em", color: INK }}>
          <span aria-hidden="true" style={{ width: 32, height: 32, borderRadius: "50%", display: "grid", placeItems: "center", background: INDIGO }}>
            <Icon name="check" size={16} color="#FFFFFF" stroke={3} />
          </span>
          Request received
        </div>
        <p style={{ margin: 0, fontFamily: BODY, fontSize: 15.5, lineHeight: 1.6, color: "#3F3F46" }}>
          Thanks — we&apos;ll connect to <strong style={{ color: INK }}>{providerLabel[provider] ?? provider}</strong> securely, run your accounting-health review, and email you the results.
        </p>
      </div>
    );
  }

  const submitDisabled =
    path === "connect"
      ? status === "loading" || !consent || !verified || provider === ""
      : status === "loading" || !consent || !verified || !file;

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 18 }}>
      <div>
        <span style={label}>What would you like reviewed?</span>
        <div className="cp-seg cp-seg-stack" role="group" aria-label="What would you like reviewed?">
          <button type="button" onClick={() => setPath("accounting")} aria-pressed={path === "accounting"}>Trial balance</button>
          <button type="button" onClick={() => setPath("fs")} aria-pressed={path === "fs"}>Management accounts / FS</button>
          <button type="button" onClick={() => setPath("connect")} aria-pressed={path === "connect"}>Connect software</button>
        </div>
      </div>

      {path === "accounting" && (
        <DropZone
          file={file}
          accept=".csv,.xlsx,.xlsm,.pdf"
          onFile={setFile}
          title="Click to upload your trial balance"
          hint="CSV, Excel or PDF · kept securely with your enquiry"
        />
      )}

      {path === "fs" && (
        <DropZone
          file={file}
          accept=".pdf,.doc,.docx,.xlsx,.xlsm"
          onFile={setFile}
          title="Click to upload your management accounts or financial statements"
          hint="PDF, Word or Excel — management accounts or financial statements · kept securely with your enquiry"
        />
      )}

      {path === "connect" && (
        <div style={{ display: "grid", gap: 12 }}>
          <p style={{ margin: 0, fontFamily: BODY, fontSize: 15, lineHeight: 1.6, color: "#3F3F46" }}>
            We&apos;ll connect securely and review your numbers — pick your software and confirm your email.
          </p>
          <div className="cp-seg cp-seg-fill" role="group" aria-label="Accounting software" style={{ alignSelf: "start", justifySelf: "start" }}>
            {(["sage", "quickbooks", "xero"] as const).map((p) => (
              <button key={p} type="button" onClick={() => setProvider(p)} aria-pressed={provider === p}>
                {p === "sage" ? "Sage" : p === "quickbooks" ? "QuickBooks" : "Xero"}
              </button>
            ))}
          </div>
        </div>
      )}

      {showFields ? (
        <div style={{ display: "grid", gap: 12 }}>
          <Field required type="email" placeholder="Work email" aria-label="Work email" autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
          <Field required placeholder="Name" aria-label="Name" autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
          <Field required placeholder="Company" aria-label="Company" autoComplete="organization" value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} />
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 18px", borderRadius: 16, background: "#F4F4F5", fontFamily: BODY, fontSize: 14.5 }}>
          <span style={{ color: "#3F3F46" }}>
            Reviewing as <strong style={{ color: INK }}>{contact.email}</strong>{contact.company ? ` · ${contact.company}` : ""}
          </span>
          <button type="button" onClick={() => setEditContact(true)} className="cp-link cp-focus" style={{ background: "none", border: 0, padding: 0, cursor: "pointer", fontSize: 14.5, whiteSpace: "nowrap" }}>
            Use different details
          </button>
        </div>
      )}

      {!verified ? (
        <div style={{ padding: "20px 22px", borderRadius: 20, border: "1px solid #E4E4E7", background: "#FAFAFA", display: "grid", gap: 14 }}>
          <div style={{ fontFamily: BODY, fontSize: 14.5, lineHeight: 1.55, color: "#3F3F46" }}>
            <strong style={{ color: INK, fontWeight: 600 }}>Confirm your email to run the review.</strong> We&apos;ll send a 6-digit code so your report reaches a real inbox.
          </div>
          {!codeSent ? (
            <button type="button" disabled={!emailValid || vBusy} onClick={sendCode}
              style={{ ...outlineBtn, height: 48, justifySelf: "start", opacity: !emailValid || vBusy ? 0.45 : 1, cursor: !emailValid || vBusy ? "default" : "pointer" }}>
              {vBusy ? "Sending…" : "Send me a code"}
            </button>
          ) : (
            <>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Field placeholder="6-digit code" aria-label="6-digit code" inputMode="numeric" maxLength={6} value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  style={{ maxWidth: 190, letterSpacing: "4px", fontWeight: 600 }} />
                <button type="button" disabled={code.length < 6 || vBusy} onClick={confirmCode} style={primaryBtn(code.length < 6 || vBusy)}>
                  {vBusy ? "Checking…" : "Confirm"}
                </button>
              </div>
              <div style={{ fontFamily: BODY, fontSize: 13, color: "#52525B" }}>
                {devCode ? `Test mode — your code is ${devCode}. ` : `Code sent to ${contact.email}. `}
                <button type="button" onClick={sendCode} disabled={vBusy} className="cp-focus" style={{ background: "none", border: 0, color: INDIGO, cursor: "pointer", fontFamily: SANS, fontWeight: 600, fontSize: 13.5, padding: 0 }}>Resend</button>
              </div>
            </>
          )}
          {vErr && <p className="cp-error" role="alert" style={{ margin: 0 }}>{vErr}</p>}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: SANS, fontSize: 16, fontWeight: 600, color: INK }}>
          <span aria-hidden="true" style={{ width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center", background: INDIGO }}>
            <Icon name="check" size={13} color="#FFFFFF" stroke={3} />
          </span>
          Email confirmed — {verifiedEmail}
        </div>
      )}

      <label style={{ display: "flex", gap: 12, alignItems: "flex-start", fontFamily: BODY, fontSize: 14, lineHeight: 1.55, color: "#3F3F46", cursor: "pointer" }}>
        <input type="checkbox" className="cp-check" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
        I understand my file is processed to generate this review and is kept securely with my enquiry. Ask us at any time and we will delete it.
      </label>

      <button type="submit" disabled={submitDisabled} style={{ ...primaryBtn(submitDisabled), width: "100%", height: 60, fontSize: 18 }}>
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
