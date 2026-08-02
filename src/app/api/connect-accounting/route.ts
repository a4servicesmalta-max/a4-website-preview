import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { isVerified } from "@/lib/email-verify";
import { pushToPortal } from "@/lib/portal";

export const runtime = "nodejs";

const LABEL: Record<string, string> = { sage: "Sage", quickbooks: "QuickBooks", xero: "Xero" };

function emailLead(subject: string, text: string, replyTo?: string) {
  const host = process.env.SMTP_HOST, user = process.env.SMTP_USER, pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_TO_EMAIL || user;
  if (!host || !user || !pass || !to) return Promise.resolve();
  const t = nodemailer.createTransport({ host, port: Number(process.env.SMTP_PORT) || 587, secure: process.env.SMTP_SECURE === "true", auth: { user, pass } });
  return t.sendMail({ from: `"A4 Website" <${process.env.SMTP_FROM || user}>`, to, replyTo, subject, text });
}

export async function POST(req: NextRequest) {
  try {
    const { email = "", name = "", company = "", provider = "", verifiedToken = "", consent } =
      (await req.json()) as { email?: string; name?: string; company?: string; provider?: string; verifiedToken?: string; consent?: boolean | string };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    if (!LABEL[provider]) return NextResponse.json({ error: "Choose your accounting software." }, { status: 400 });
    if (consent !== true && consent !== "true") return NextResponse.json({ error: "Consent is required." }, { status: 400 });
    if (!isVerified(email, verifiedToken)) return NextResponse.json({ error: "Please confirm your email first." }, { status: 401 });

    const label = LABEL[provider];
    await pushToPortal({
      name, email, company,
      service: `Connect accounting software — ${label}`,
      source: "connect-accounting",
      priority: "High",
      message: `Wants to connect ${label} for an AI accounting-health review. A4 to initiate a secure connection and run the review.`,
      meta: { provider },
    });
    await emailLead(
      `Connect ${label} request — ${name || email}`,
      `Name: ${name}\nCompany: ${company}\nEmail: ${email}\nSoftware: ${label}\nAction: initiate secure connection + run accounting-health review.`,
      email,
    ).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("connect-accounting error:", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
