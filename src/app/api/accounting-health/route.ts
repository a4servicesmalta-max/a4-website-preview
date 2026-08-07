import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { isVerified } from "@/lib/email-verify";
import { pushToPortal } from "@/lib/portal";
import { pushLeadToPortal } from "@/lib/portal-lead";
import { engineFetch } from "@/lib/fs-review-engine";

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

    await pushToPortal({ name, email, company, message: `Uploaded ${tbFile?.name || "TB"}${glFile ? " + " + glFile.name : ""} for accounting/TB review`, service: "Accounting / trial-balance review", source: "accounting-health", priority: "High", meta: { tb: tbFile?.name || null, gl: glFile?.name || null } });

    // pushToPortal above reaches the internal ops portal, which creates no
    // WebsiteLead. This does — and it runs before any engine call, so a review
    // failure can never cost us the prospect.
    const leadWritten = await pushLeadToPortal({
      name: name || email,
      email,
      message:
        `[a4.com.mt — accounting/TB review] Uploaded ${tbFile?.name || "TB"}` +
        `${glFile ? ` + ${glFile.name}` : ""} for accounting / trial-balance review` +
        (company ? `\nCompany: ${company}` : ""),
      sourceDetail: "accounting-health",
    });

    const base = process.env.A4_ACCOUNTING_URL;

    // Primary path: the dedicated accounting-health engine (TB + GL), when hosted.
    // If it is unreachable or errors, fall through to the FS engine's TB reviewer
    // rather than failing the lead — the lead is already captured in the portal.
    if (base) {
      try {
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
        if (engine.status === 422) {
          const detail = await engine.json().catch(() => ({}));
          // Past the pushToPortal above, so the lead is with us either way —
          // tell the browser so it can say that instead of failing silently.
          return NextResponse.json({ error: detail.detail || detail.error || "We couldn't read those files. Try a clean CSV or Excel export.", leadCaptured: leadWritten }, { status: 422 });
        }
        if (engine.ok) return NextResponse.json(await engine.json());
        console.error(`accounting-health primary engine ${engine.status}; falling back to TB reviewer`);
      } catch (err) {
        console.error("accounting-health primary engine unreachable; falling back to TB reviewer:", err);
      }
    }

    // Fallback (no dedicated engine hosted): run the trial balance through the FS engine's
    // TB reviewer, which is deployed and has the Anthropic key. GL is not used in this mode.
    if (!process.env.A4_FSREVIEW_URL) return NextResponse.json({ error: "Review service not configured.", leadCaptured: leadWritten }, { status: 503 });
    if (!tbFile) return NextResponse.json({ error: "Please upload a trial balance (CSV, Excel or PDF).", leadCaptured: leadWritten }, { status: 400 });
    const out = new FormData();
    out.append("file", tbFile, tbFile.name);
    out.append("deep", "true");

    const engine = await engineFetch("/api/review-tb", out);
    await emailLead(
      `Trial-balance review request — ${name || email}`,
      `Name: ${name}\nCompany: ${company}\nEmail: ${email}\nTB: ${tbFile.name}\nGL: ${glFile?.name || "- (not used)"}\nEngine status: ${engine.status}`,
      email,
    ).catch(() => {});
    if (!engine.ok) {
      const detail = await engine.json().catch(() => ({}));
      const msg = engine.status === 422
        ? "We couldn't read that file. Try a clean CSV or Excel export."
        : (detail.detail || detail.error || "The review service had a problem.");
      return NextResponse.json({ error: msg, leadCaptured: leadWritten }, { status: engine.status === 422 ? 422 : 502 });
    }
    return NextResponse.json(await engine.json());
  } catch (e) {
    console.error("accounting-health error:", e);
    return NextResponse.json({ error: "Review failed. Please try again or book a call." }, { status: 500 });
  }
}
