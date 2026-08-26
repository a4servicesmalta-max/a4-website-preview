import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { pushToPortal } from "@/lib/portal";

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
    const { email, name, company, score, band, breakdown } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }
    const transport = getTransport();
    const to = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;
    const summary = `Score: ${score}/100 (${band})\n\n${(breakdown || []).map((r: { dimension: string; finding: string }) => `• ${r.dimension}: ${r.finding}`).join("\n")}`;

    // Portal push is primary — an SMTP throw must never cost the lead.
    await pushToPortal({ name, email, company, message: `Accounting health score: ${score}/100 (${band})`, service: "Accounting health quiz", source: "health-check", priority: "Med", meta: { score, band, breakdown } });

    if (transport && to) {
      try {
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
          text: `Hi ${name || ""},\n\nHere is your accounting health check result.\n\n${summary}\n\nWant a real review of your numbers? Reply or book a call: https://a4.com.mt/en/book-a-call\n\n— A4 Services`,
        });
      } catch (mailErr) {
        console.error("health-check email failed (lead already pushed):", mailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("health-check lead error:", e);
    return NextResponse.json({ error: "Could not send. Please try again." }, { status: 500 });
  }
}
