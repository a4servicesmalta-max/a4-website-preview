import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { isVerified } from "@/lib/email-verify";

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

    const base = process.env.A4_FSREVIEW_URL;
    if (!base) return NextResponse.json({ error: "Review service not configured." }, { status: 503 });
    const auth = Buffer.from(`${process.env.A4_FSREVIEW_USER || "a4"}:${process.env.A4_FSREVIEW_PASS || ""}`).toString("base64");
    const endpoint = kind === "tb" ? "/api/review-tb" : "/api/review";

    const out = new FormData();
    out.append("file", file, file.name);
    out.append("deep", "true");

    const engine = await fetch(`${base}${endpoint}`, { method: "POST", headers: { Authorization: `Basic ${auth}` }, body: out });

    await emailLead(
      `FS/TB review request — ${name || email} (${kind.toUpperCase()})`,
      `Name: ${name}\nCompany: ${company}\nEmail: ${email}\nKind: ${kind}\nFile: ${file.name}\nEngine status: ${engine.status}`,
      email,
    ).catch(() => {});

    if (!engine.ok) {
      const detail = await engine.json().catch(() => ({}));
      const msg = engine.status === 422
        ? "We couldn't read that file. For statements, try a clearer PDF; for a trial balance, try CSV or Excel."
        : (detail.detail || "The review service had a problem. We've logged your request and will follow up.");
      return NextResponse.json({ error: msg }, { status: engine.status === 422 ? 422 : 502 });
    }

    const data = await engine.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error("fs-gap-review error:", e);
    return NextResponse.json({ error: "Review failed. Please try again or book a call." }, { status: 500 });
  }
}
