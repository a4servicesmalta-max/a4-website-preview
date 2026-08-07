import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { isVerified } from "@/lib/email-verify";
import { pushToPortal } from "@/lib/portal";
import { engineFetch } from "@/lib/fs-review-engine";
import { augmentWithAiCommentary } from "@/lib/ai-review";
import type { ReviewResponse } from "./types";

export const runtime = "nodejs";
export const maxDuration = 120;

const FS_TYPES = [".pdf", ".doc", ".docx"];
const TB_TYPES = [".pdf", ".csv", ".xlsx", ".xlsm"];

function emailLead(subject: string, text: string, replyTo?: string) {
  const host = process.env.SMTP_HOST, user = process.env.SMTP_USER, pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_TO_EMAIL || user;
  if (!host || !user || !pass || !to) return Promise.resolve();
  const t = nodemailer.createTransport({ host, port: Number(process.env.SMTP_PORT) || 587, secure: process.env.SMTP_SECURE === "true", auth: { user, pass } });
  return t.sendMail({ from: `"A4 Website" <${process.env.SMTP_FROM || user}>`, to, replyTo, subject, text });
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") || "fs");
    const email = String(form.get("email") || "");
    const name = String(form.get("name") || "");
    const company = String(form.get("company") || "");
    const consent = String(form.get("consent") || "");
    const verifiedToken = String(form.get("verifiedToken") || "");
    // What the client actually saw on screen: our own quotation figures.
    const revenueBand = String(form.get("revenueBand") || "");
    const quotedFee = String(form.get("quotedFee") || "");
    // Free-text scoping context from the audit estimator (year to audit, major
    // changes, tax return, anything else) — for the scoping call, not the engine.
    const scoping = String(form.get("scoping") || "").slice(0, 2000);

    if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    if (consent !== "true") return NextResponse.json({ error: "Consent is required to process the file." }, { status: 400 });
    // Gate the AI engine behind a confirmed email — never spend a review on an unverified address.
    if (!isVerified(email, verifiedToken)) {
      return NextResponse.json({ error: "Please confirm your email before running the review." }, { status: 401 });
    }

    const lower = file.name.toLowerCase();
    const allowed = kind === "tb" ? TB_TYPES : FS_TYPES;
    if (!allowed.some((ext) => lower.endsWith(ext))) {
      return NextResponse.json({ error: `Unsupported file type for ${kind === "tb" ? "trial balance" : "financial statements"}.` }, { status: 400 });
    }
    if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 20 MB)." }, { status: 400 });

    if (!process.env.A4_FSREVIEW_URL) return NextResponse.json({ error: "Review service not configured." }, { status: 503 });
    const endpoint = kind === "tb" ? "/api/review-tb" : "/api/review";

    const out = new FormData();
    out.append("file", file, file.name);
    out.append("deep", "true");

    const engine = await engineFetch(endpoint, out);

    // Only the engine's own /api/review returns a `quote`; read it here (once
    // the engine result is available) so the staff notification can include
    // the full basis/detail. The browser must NEVER see basis/detail — it can
    // reveal the client's previous auditor's fee — so the response we send
    // back to the client strips quote down to {fee, docKind} (or null).
    let clientPayload: Record<string, unknown> | null = null;
    let fullQuote: { fee: number; docKind: string; basis: string; detail?: unknown } | null = null;
    let engineErrorDetail = "";

    if (engine.ok) {
      const data = await engine.json();
      fullQuote = data && typeof data === "object" && data.quote ? data.quote : null;
      if (data && typeof data === "object") delete data.quote; // strip defensively before spreading
      clientPayload = { ...data, quote: fullQuote ? { fee: fullQuote.fee, docKind: fullQuote.docKind } : null };
      clientPayload = await augmentWithAiCommentary(clientPayload as unknown as ReviewResponse);
    } else {
      const detail = await engine.json().catch(() => ({}));
      engineErrorDetail = detail.detail || "";
    }

    const quoteText = fullQuote
      ? `\n\nQuote (internal only — do not share fee basis with client): €${fullQuote.fee} (${fullQuote.docKind}, basis: ${fullQuote.basis})\nDetail: ${JSON.stringify(fullQuote.detail)}`
      : "";

    // Fire-and-forget — never delays the user response.
    emailLead(
      `FS/TB review request — ${name || email} (${kind.toUpperCase()})`,
      `Name: ${name}\nCompany: ${company}\nEmail: ${email}\nKind: ${kind}\nFile: ${file.name}\nEngine status: ${engine.status}` +
        (revenueBand ? `\nShown to client: €${quotedFee}/yr (quotation figures, ${revenueBand} band)` : "") +
        (scoping ? `\n\nScoping notes from the estimator:\n${scoping}` : "") +
        quoteText,
      email,
    ).catch(() => {});

    await pushToPortal({
      name,
      email,
      company,
      message: `Uploaded ${file.name} for ${kind === "tb" ? "trial balance" : "financial statements"} review`,
      service: `FS/TB review (${kind})`,
      source: "fs-review",
      priority: "High",
      meta: {
        kind,
        fileName: file.name,
        ...(scoping ? { scoping } : {}),
        ...(fullQuote ? { quote: fullQuote } : {}),
        ...(clientPayload ? { findings: (clientPayload as unknown as ReviewResponse).findings, aiCommentary: (clientPayload as unknown as ReviewResponse).aiCommentary } : {}),
      },
    });

    if (!engine.ok) {
      const msg = engine.status === 422
        ? "We couldn't read that file. For statements, try a clearer PDF; for a trial balance, try CSV or Excel."
        : (engineErrorDetail || "The review service had a problem. We've logged your request and will follow up.");
      // `leadCaptured` is reached only after pushToPortal above, so the browser
      // can honestly tell the user their details are with us. Never set it on a
      // path that returns before the portal push.
      return NextResponse.json({ error: msg, leadCaptured: true }, { status: engine.status === 422 ? 422 : 502 });
    }

    return NextResponse.json(clientPayload);
  } catch (e) {
    console.error("fs-gap-review error:", e);
    return NextResponse.json({ error: "Review failed. Please try again or book a call." }, { status: 500 });
  }
}
