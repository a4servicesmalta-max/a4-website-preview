"use client";
import { useState } from "react";
import { Button } from "@/components/a4-landing/Primitives";
import { FindingsList } from "./FindingsList";
import type { ReviewResponse } from "@/app/api/fs-gap-review/types";

function download(b64: string, filename: string, mime: string) {
  const bin = atob(b64); const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([u8], { type: mime }));
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function DeepReview() {
  const [kind, setKind] = useState<"fs" | "tb">("fs");
  const [form, setForm] = useState({ email: "", name: "", company: "" });
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [data, setData] = useState<ReviewResponse | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setStatus("loading"); setError("");
    const fd = new FormData();
    fd.append("file", file); fd.append("kind", kind); fd.append("consent", String(consent));
    fd.append("email", form.email); fd.append("name", form.name); fd.append("company", form.company);
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
        <h3>{data.framework} review — {data.company}</h3>
        <p style={{ opacity: 0.7 }}>{data.stats.checks_run} checks · {data.stats.checks_passed} passed · {data.stats.checks_failed} flagged</p>
        <FindingsList findings={data.findings} />
        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button variant="primary" onClick={() => download(data.reportBase64, data.reportName, "application/pdf")}>⬇ Download report (PDF)</Button>
          {data.annotatedDocxBase64 && (
            <Button variant="outline-light" onClick={() => download(data.annotatedDocxBase64!, data.annotatedName || "review.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}>⬇ Annotated Word</Button>
          )}
        </div>
      </div>
    );
  }

  const accept = kind === "tb" ? ".pdf,.csv,.xlsx,.xlsm" : ".pdf,.doc,.docx";
  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" onClick={() => setKind("fs")} aria-pressed={kind === "fs"} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${kind === "fs" ? "var(--a4-primary)" : "var(--a4-hairline-light)"}`, background: "#fff" }}>Financial statements</button>
        <button type="button" onClick={() => setKind("tb")} aria-pressed={kind === "tb"} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${kind === "tb" ? "var(--a4-primary)" : "var(--a4-hairline-light)"}`, background: "#fff" }}>Trial balance</button>
      </div>
      <input type="file" accept={accept} onChange={(e) => setFile(e.target.files?.[0] || null)} required />
      <input required type="email" placeholder="Work email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input required placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
      <label style={{ fontSize: 13, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
        I understand my file is processed to generate this review and is not stored.
      </label>
      <button type="submit" disabled={status === "loading" || !consent} style={{ height: 48, padding: "0 26px", borderRadius: "var(--a4-r-full)", border: 0, background: "#fff", color: "#000", fontWeight: 600, letterSpacing: ".24px", cursor: status === "loading" || !consent ? "default" : "pointer", opacity: status === "loading" || !consent ? 0.6 : 1 }}>{status === "loading" ? "Analyzing… (up to ~60s)" : "Run my review"}</button>
      {status === "error" && <p style={{ color: "#c2303d" }}>{error}</p>}
    </form>
  );
}
