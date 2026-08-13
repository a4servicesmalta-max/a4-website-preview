import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { pushToPortal } from "@/lib/portal";
import { captchaGate } from "@/lib/turnstileServer";

function getTransport() {
  const host = process.env.SMTP_HOST, user = process.env.SMTP_USER, pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host, port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", auth: { user, pass },
  });
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const blocked = await captchaGate(payload, "health-check", req);
    if (blocked) return blocked;
    const { email, name, company, score, band, breakdown } = payload;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }
    // Portal push is primary — always capture the lead first. Email is
    // best-effort: a broken SMTP config, or a malformed `breakdown`, must
    // never cost us the lead.
    await pushToPortal({ name, email, company, message: `Accounting health score: ${score}/100 (${band})`, service: "Accounting health quiz", source: "health-check", priority: "Med", meta: { score, band, breakdown } });

    try {
      const transport = getTransport();
      const to = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;
      // `breakdown` is attacker-controlled JSON — only map it when it really is an array.
      const rows = Array.isArray(breakdown) ? breakdown : [];
      const summary = `Score: ${score}/100 (${band})\n\n${rows.map((r: { dimension: string; finding: string }) => `• ${r.dimension}: ${r.finding}`).join("\n")}`;
      if (transport && to) {
        await transport.sendMail({
          from: `"A4 Website" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
          to, replyTo: email,
          subject: `Accounting health check — ${name || email} (${score}/100, ${band})`,
          text: `Name: ${name}\nCompany: ${company}\nEmail: ${email}\n\n${summary}`,
        });
        await transport.sendMail({
          from: `"A4 Services" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
          to: email,
          subject: `Your accounting health check — ${score}/100 (${band})`,
          text: `Hi ${name || ""},\n\nHere is your accounting health check result.\n\n${summary}\n\nWant a real review of your numbers? Reply or book a call: ${process.env.NEXT_PUBLIC_CALENDLY_BOOKING_URL || "https://a4.com.mt/contact"}\n\n— A4 Services`,
        });
      }
    } catch (emailErr) {
      console.warn("Health-check email skipped (SMTP not configured or failed):", emailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("health-check lead error:", e);
    return NextResponse.json({ error: "Could not send. Please try again." }, { status: 500 });
  }
}
