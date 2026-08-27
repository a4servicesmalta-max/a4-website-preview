import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { checkVerified, sendAuditQuoteEmail } from "@/lib/portal-verify";
import { pushToPortal } from "@/lib/portal";
import { pushLeadToPortal } from "@/lib/portal-lead";
import { engineFetch } from "@/lib/fs-review-engine";
import { augmentWithAiCommentary } from "@/lib/ai-review";
import { issueQuoteLock, LOCK_COOKIE, lockCookieOptions } from "@/lib/quote-lock";
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
    if (!(await checkVerified(email, verifiedToken))) {
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

    // The lead is written BEFORE the engine runs, and independently of it.
    // The review is the part that fails; the prospect is the part that matters.
    // Previously this sat after the engine call, so every 502 cost us the lead.
    const leadWritten = await pushLeadToPortal({
      name: name || email,
      email,
      message:
        `[a4.com.mt — FS/TB review (${kind})] Uploaded ${file.name} for ` +
        `${kind === "tb" ? "trial balance" : "financial statements"} review` +
        (company ? `\nCompany: ${company}` : "") +
        (revenueBand ? `\nShown to client: €${quotedFee}/yr (${revenueBand} band)` : "") +
        (scoping ? `\n\nScoping notes:\n${scoping}` : ""),
      sourceDetail: "fs-review",
    });

    // A thrown engine call must not skip the error path and lose the response
    // shape — the outer catch returns a 500 with no `leadCaptured` signal.
    let engine: Response;
    try {
      engine = await engineFetch(endpoint, out);
    } catch (err) {
      console.error("fs-gap-review engine unreachable:", err);
      return NextResponse.json(
        { error: "The review service is unreachable.", leadCaptured: leadWritten },
        { status: 502 }
      );
    }

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
        : (engineErrorDetail || "The review service had a problem.");
      // Report what actually happened rather than assuming: the lead write is a
      // network call to the portal and can fail on its own. Claiming capture we
      // did not achieve is worse than admitting it — a broken button still earns
      // an email from a motivated prospect; a false promise earns silence.
      return NextResponse.json({ error: msg, leadCaptured: leadWritten }, { status: engine.status === 422 ? 422 : 502 });
    }

    // Lock the fee to this visitor. From here on the questionnaire path shows
    // this number rather than re-pricing them from the rate card, so the same
    // company cannot be quoted two different fees by the same site — and
    // cannot shop the tool by declining to upload. Bound to the verified
    // email, which we already hold at this point.
    const priced = !!fullQuote && typeof fullQuote.fee === "number" && fullQuote.fee > 0;
    // The backend emails the prospect their quote (with a booking link). Best
    // effort: a mail failure never fails the review the client is waiting on.
    const emailed = priced
      ? await sendAuditQuoteEmail({ email, verifiedToken, name, fee: fullQuote!.fee, docKind: fullQuote!.docKind })
      : false;
    const res = NextResponse.json({ ...clientPayload, emailed });
    if (priced) {
      res.cookies.set(
        LOCK_COOKIE,
        issueQuoteLock(fullQuote!.fee, "audit", email),
        lockCookieOptions(),
      );
    }
    return res;
  } catch (e) {
    console.error("fs-gap-review error:", e);
    return NextResponse.json({ error: "Review failed. Please try again or book a call." }, { status: 500 });
  }
}
