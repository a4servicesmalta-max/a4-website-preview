import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { isVerified } from "@/lib/email-verify";

export const runtime = "nodejs";
export const maxDuration = 120;

const TB_TYPES = [".csv", ".xlsx", ".xlsm", ".pdf"];
const GL_TYPES = [".csv", ".xlsx", ".xlsm"];

function emailLead(subject: string, text: string, replyTo?: string) {
  const host = process.env.SMTP_HOST, user = process.env.SMTP_USER, pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_TO_EMAIL || user;
  if (!host || !user || !pass || !to) return Promise.resolve();
  const t = nodemailer.createTransport({ host, port: Number(process.env.SMTP_PORT) || 587, secure: process.env.SMTP_SECURE === "true", auth: { user, pass } });
  return t.sendMail({ from: `"A4 Website" <${process.env.SMTP_FROM || user}>`, to, replyTo, subject, text });
}

function okType(file: File, allowed: string[]) {
  const lower = file.name.toLowerCase();
  return allowed.some((ext) => lower.endsWith(ext));
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const tb = form.get("tb");
    const gl = form.get("gl");
    const email = String(form.get("email") || "");
    const name = String(form.get("name") || "");
    const company = String(form.get("company") || "");
    const consent = String(form.get("consent") || "");
    const verifiedToken = String(form.get("verifiedToken") || "");

    const tbFile = tb instanceof File && tb.size > 0 ? tb : null;
    const glFile = gl instanceof File && gl.size > 0 ? gl : null;
    if (!tbFile && !glFile) return NextResponse.json({ error: "Upload a trial balance and/or general ledger." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    if (consent !== "true") return NextResponse.json({ error: "Consent is required to process the files." }, { status: 400 });
    if (!isVerified(email, verifiedToken)) return NextResponse.json({ error: "Please confirm your email before running the review." }, { status: 401 });
    if (tbFile && !okType(tbFile, TB_TYPES)) return NextResponse.json({ error: "Trial balance must be CSV, Excel or PDF." }, { status: 400 });
    if (glFile && !okType(glFile, GL_TYPES)) return NextResponse.json({ error: "General ledger must be CSV or Excel." }, { status: 400 });
    if ((tbFile?.size || 0) > 20 * 1024 * 1024 || (glFile?.size || 0) > 20 * 1024 * 1024)
      return NextResponse.json({ error: "File too large (max 20 MB)." }, { status: 400 });

    const base = process.env.A4_ACCOUNTING_URL;
    if (!base) return NextResponse.json({ error: "Accounting-health service not configured." }, { status: 503 });
    const auth = Buffer.from(`${process.env.A4_ACCOUNTING_USER || "a4"}:${process.env.A4_ACCOUNTING_PASS || ""}`).toString("base64");

    const out = new FormData();
    if (tbFile) out.append("tb", tbFile, tbFile.name);
    if (glFile) out.append("gl", glFile, glFile.name);
    out.append("deep", "true");

    const engine = await fetch(`${base}/api/health-review`, { method: "POST", headers: { Authorization: `Basic ${auth}` }, body: out });

    await emailLead(
      `Accounting-health request — ${name || email}`,
      `Name: ${name}\nCompany: ${company}\nEmail: ${email}\nTB: ${tbFile?.name || "-"}\nGL: ${glFile?.name || "-"}\nEngine status: ${engine.status}`,
      email,
    ).catch(() => {});

    if (!engine.ok) {
      const detail = await engine.json().catch(() => ({}));
      const msg = engine.status === 422
        ? "We couldn't read those files. Try a clean CSV or Excel export."
        : (detail.detail || detail.error || "The service had a problem. We've logged your request and will follow up.");
      return NextResponse.json({ error: msg }, { status: engine.status === 422 ? 422 : 502 });
    }
    return NextResponse.json(await engine.json());
  } catch (e) {
    console.error("accounting-health error:", e);
    return NextResponse.json({ error: "Review failed. Please try again or book a call." }, { status: 500 });
  }
}
