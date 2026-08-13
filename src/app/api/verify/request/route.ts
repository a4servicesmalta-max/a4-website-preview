import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { issueChallenge } from "@/lib/email-verify";
import { captchaGate } from "@/lib/turnstileServer";

export const runtime = "nodejs";

function getTransport() {
  const host = process.env.SMTP_HOST, user = process.env.SMTP_USER, pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as { email?: string };
    // The prime abuse target on this site: it mails a code to any address given.
    const blocked = await captchaGate(payload, "verify-request", req);
    if (blocked) return blocked;
    const { email } = payload;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const { code, challengeToken } = issueChallenge(email);
    const transport = getTransport();

    let delivered = false;
    if (transport) {
      const user = process.env.SMTP_USER!;
      await transport.sendMail({
        from: `"A4 Services" <${process.env.SMTP_FROM || user}>`,
        to: email,
        subject: `Your A4 verification code: ${code}`,
        text: `Your A4 Services verification code is ${code}.\n\nEnter it on the page to run your review. The code expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.`,
        html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1a1a1a">
<p>Your A4 Services verification code is:</p>
<p style="font-size:30px;font-weight:700;letter-spacing:4px;color:#494fdf;margin:8px 0 16px">${code}</p>
<p>Enter it on the page to run your review. The code expires in 10 minutes.</p>
<p style="color:#666;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
</div>`,
      });
      delivered = true;
    }

    // On localhost (or when explicitly enabled) echo the code so the flow is testable
    // without an SMTP server. Never echoed in a normal production build.
    const echo =
      process.env.NODE_ENV !== "production" || process.env.EMAIL_VERIFY_DEV_ECHO === "true";

    return NextResponse.json({
      ok: true,
      delivered,
      challengeToken,
      ...(echo && !delivered ? { devCode: code } : {}),
    });
  } catch (e) {
    console.error("verify/request error:", e);
    return NextResponse.json({ error: "Could not send a code right now. Please try again." }, { status: 500 });
  }
}
