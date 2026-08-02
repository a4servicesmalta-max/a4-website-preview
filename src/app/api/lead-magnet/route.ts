import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { buildComplianceCalendarIcs } from "@/lib/compliance-calendar";
import { pushToPortal } from "@/lib/portal";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
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
    const body = await req.json();
    const { email, magnet }: { email?: string; magnet?: string } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    if (magnet !== "compliance-calendar-2026") {
      return NextResponse.json({ error: "Unknown lead magnet." }, { status: 400 });
    }

    // Portal push is primary — always capture the lead first. Email is
    // best-effort: a broken SMTP config must never cost us the lead.
    await pushToPortal({ email, service: `Lead magnet: ${magnet}`, source: "lead-magnet", priority: "Low", meta: { magnet } });

    try {
      const transport = getTransport();
      const toAddress = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;
      if (transport && toAddress) {
        await transport.sendMail({
          from: `"A4 Website" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
          to: toAddress,
          subject: "Lead magnet download — Malta compliance calendar 2026",
          replyTo: email,
          text: `Email: ${email}\nMagnet: Malta compliance deadline calendar 2026`,
        });
      }
    } catch (emailErr) {
      console.warn("Lead-magnet email skipped (SMTP not configured or failed):", emailErr);
    }

    const ics = buildComplianceCalendarIcs();
    return new NextResponse(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="malta-compliance-deadlines-2026.ics"',
      },
    });
  } catch (error) {
    console.error("Lead magnet error:", error);
    return NextResponse.json({ error: "Download failed. Please try again." }, { status: 500 });
  }
}
