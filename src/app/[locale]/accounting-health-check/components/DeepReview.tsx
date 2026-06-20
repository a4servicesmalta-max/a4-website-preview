"use client";
import { useState } from "react";
import { FindingsList } from "./FindingsList";
import { Field, primaryBtn, outlineBtn, type Contact } from "./Field";
import type { ReviewResponse } from "@/app/api/fs-gap-review/types";

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
  const [kind, setKind] = useState<"fs" | "tb">("fs");
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [data, setData] = useState<ReviewResponse | null>(null);
  const [editContact, setEditContact] = useState(false);

  const showFields = !contactCaptured || editContact;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setStatus("loading"); setError("");
    const fd = new FormData();
    fd.append("file", file); fd.append("kind", kind); fd.append("consent", String(consent));
    fd.append("email", contact.email); fd.append("name", contact.name); fd.append("company", contact.company);
    try {
      const res = await fetch("/api/fs-gap-review", { method: "POST", body: fd });
      const body = await res.json();
      if (!res.ok) { setError(body.error || "Review failed."); setStatus("error"); return; }
      setData(body); setStatus("idle");
    } catch { setError("Review failed. Please try again."); setStatus("error"); }
  }

  if (data) {
    return (
      <div>
        <h3 style={{ fontFamily: "var(--a4-font-display)", fontWeight: 600 }}>{data.framework} review — {data.company}</h3>
        <p style={{ color: "var(--a4-mute)", fontSize: 14, margin: "4px 0 16px" }}>
          {data.stats.checks_run} checks · {data.stats.checks_passed} passed · {data.stats.checks_failed} flagged
        </p>
        <FindingsList findings={data.findings} />
        <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" style={primaryBtn()} onClick={() => download(data.reportBase64, data.reportName, "application/pdf")}>⬇ Download report (PDF)</button>
          {data.annotatedDocxBase64 && (
            <button type="button" style={outlineBtn} onClick={() => download(data.annotatedDocxBase64!, data.annotatedName || "review.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}>⬇ Annotated Word</button>
          )}
        </div>
      </div>
    );
  }

  const accept = kind === "tb" ? ".pdf,.csv,.xlsx,.xlsm" : ".pdf,.doc,.docx";
  const tab = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: "12px 14px", borderRadius: 10, cursor: "pointer",
    border: `1px solid ${active ? "var(--a4-primary)" : "var(--a4-hairline-light)"}`,
    background: active ? "rgba(73,79,223,.06)" : "#fff",
    color: active ? "var(--a4-primary)" : "var(--a4-ink)",
    fontWeight: active ? 600 : 500, fontSize: 14.5, fontFamily: "var(--a4-font-body)",
  });

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
      <div>
        <label style={{ fontSize: 13, color: "var(--a4-mute)", display: "block", marginBottom: 6 }}>What would you like reviewed?</label>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={() => setKind("fs")} aria-pressed={kind === "fs"} style={tab(kind === "fs")}>Financial statements</button>
          <button type="button" onClick={() => setKind("tb")} aria-pressed={kind === "tb"} style={tab(kind === "tb")}>Trial balance</button>
        </div>
      </div>

      <label
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 4, minHeight: 92, padding: "16px", borderRadius: 12, cursor: "pointer", textAlign: "center",
          border: `1.5px dashed ${file ? "var(--a4-primary)" : "var(--a4-hairline-light)"}`,
          background: file ? "rgba(73,79,223,.04)" : "var(--a4-surface-soft)",
        }}
      >
        <input type="file" accept={accept} onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
        <span style={{ fontSize: 14.5, fontWeight: 600, color: file ? "var(--a4-primary)" : "var(--a4-ink)" }}>
          {file ? file.name : `Click to upload your ${kind === "tb" ? "trial balance" : "financial statements"}`}
        </span>
        <span style={{ fontSize: 12.5, color: "var(--a4-mute)" }}>
          {kind === "tb" ? "CSV, Excel or PDF" : "PDF or Word"} · processed in memory, never stored
        </span>
      </label>

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

      <label style={{ fontSize: 13.5, display: "flex", gap: 9, alignItems: "flex-start", color: "var(--a4-body)", lineHeight: 1.5 }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required style={{ marginTop: 3, accentColor: "var(--a4-primary)", width: 16, height: 16 }} />
        I understand my file is processed to generate this review and is not stored.
      </label>

      <button type="submit" disabled={status === "loading" || !consent || !file} style={primaryBtn(status === "loading" || !consent || !file)}>
        {status === "loading" ? "Analyzing… (up to ~60s)" : "Run my review"}
      </button>
      {status === "error" && <p style={{ color: "#c2303d", fontSize: 14, margin: 0 }}>{error}</p>}
    </form>
  );
}
