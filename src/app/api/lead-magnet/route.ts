import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { buildComplianceCalendarIcs } from "@/lib/compliance-calendar";
import { pushToPortal } from "@/lib/portal";
import { renderA4Email } from "@/lib/email-shell";

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

    const transport = getTransport();
    const toAddress = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;

    // Portal push is primary — an SMTP throw must never cost the lead, and it
    // must never cost the visitor the .ics they came for either.
    await pushToPortal({ email, service: `Lead magnet: ${magnet}`, source: "lead-magnet", priority: "Low", meta: { magnet } });

    if (transport && toAddress) {
      try {
        const staff = renderA4Email({
          eyebrow: "Website · lead magnet",
          headline: "Lead magnet download — Malta compliance calendar 2026",
          intro: "A visitor downloaded the Malta compliance deadline calendar 2026.",
          rows: [
            { label: "Email", value: email },
            { label: "Magnet", value: "Malta compliance deadline calendar 2026" },
          ],
          cta: { label: "Open lead queue", url: "https://partner.vacei.com/dashboard/leads" },
          signoff: "Automated notification from a4.com.mt",
        });
        await transport.sendMail({
          from: `"A4 Website" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
          to: toAddress,
          subject: "Lead magnet download — Malta compliance calendar 2026",
          replyTo: email,
          text: `Email: ${email}\nMagnet: Malta compliance deadline calendar 2026`,
          html: staff.html,
        });
      } catch (mailErr) {
        console.error("lead-magnet email failed (lead already pushed):", mailErr);
      }
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
