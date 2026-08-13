import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { isVerified } from "@/lib/email-verify";
import { pushToPortal } from "@/lib/portal";
import { engineFetch } from "@/lib/fs-review-engine";
import { augmentWithAiCommentary } from "@/lib/ai-review";
import type { ReviewResponse } from "./types";
import { captchaGate } from "@/lib/turnstileServer";

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
    const blocked = await captchaGate(form, "fs-gap-review", req);
    if (blocked) return blocked;
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

    const endpoint = kind === "tb" ? "/api/review-tb" : "/api/review";

    const out = new FormData();
    out.append("file", file, file.name);
    out.append("deep", "true");

    // Only the engine's own /api/review returns a `quote`; read it here (once
    // the engine result is available) so the staff notification can include
    // the full basis/detail. The browser must NEVER see basis/detail — it can
    // reveal the client's previous auditor's fee — so the response we send
    // back to the client strips quote down to {fee, docKind} (or null).
    let clientPayload: Record<string, unknown> | null = null;
    let fullQuote: { fee: number; docKind: string; basis: string; detail?: unknown } | null = null;
    let engineErrorDetail = "";
    let engineStatus: number | null = null;

    // The engine ENRICHES the lead; it does not gate it. An unset URL, a dead
    // service or a timeout must never return before pushToPortal below has
    // run: by this point the visitor has confirmed their email by one-time
    // code, ticked the consent box and uploaded their own financial
    // statements, which makes this the most qualified lead on the site. It
    // used to be discarded outright whenever the engine was unavailable.
    // /api/accounting-health has always captured first; this now matches it.
    if (process.env.A4_FSREVIEW_URL) {
      try {
        const engine = await engineFetch(endpoint, out);
        engineStatus = engine.status;
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
      } catch (engineErr) {
        // Network error, DNS failure, timeout, or engineFetch's own throw.
        console.error("fs-gap-review engine unreachable:", engineErr);
      }
    } else {
      console.error("fs-gap-review: A4_FSREVIEW_URL not configured — lead captured, review skipped");
    }

    const quoteText = fullQuote
      ? `\n\nQuote (internal only — do not share fee basis with client): €${fullQuote.fee} (${fullQuote.docKind}, basis: ${fullQuote.basis})\nDetail: ${JSON.stringify(fullQuote.detail)}`
      : "";

    // Fire-and-forget — never delays the user response.
    emailLead(
      `FS/TB review request — ${name || email} (${kind.toUpperCase()})`,
      `Name: ${name}\nCompany: ${company}\nEmail: ${email}\nKind: ${kind}\nFile: ${file.name}\nEngine status: ${engineStatus ?? "unreachable — review not run, follow up manually"}` +
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
        // So staff can see at a glance whether the AI review actually ran, or
        // whether this lead needs the review doing by hand.
        engineStatus: engineStatus ?? "unreachable",
        ...(scoping ? { scoping } : {}),
        ...(fullQuote ? { quote: fullQuote } : {}),
        ...(clientPayload ? { findings: (clientPayload as unknown as ReviewResponse).findings, aiCommentary: (clientPayload as unknown as ReviewResponse).aiCommentary } : {}),
      },
    });

    if (!clientPayload) {
      // The lead is safe either way; only the on-screen result is lost.
      if (engineStatus === null) {
        return NextResponse.json(
          { error: "Our review service isn't reachable right now. We've got your file and your details — we'll come back to you with the review." },
          { status: 503 },
        );
      }
      const msg = engineStatus === 422
        ? "We couldn't read that file. For statements, try a clearer PDF; for a trial balance, try CSV or Excel."
        : (engineErrorDetail || "The review service had a problem. We've logged your request and will follow up.");
      return NextResponse.json({ error: msg }, { status: engineStatus === 422 ? 422 : 502 });
    }

    return NextResponse.json(clientPayload);
  } catch (e) {
    console.error("fs-gap-review error:", e);
    return NextResponse.json({ error: "Review failed. Please try again or book a call." }, { status: 500 });
  }
}
