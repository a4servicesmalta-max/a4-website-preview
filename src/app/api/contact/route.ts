import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { pushToPortal } from "@/lib/portal";
import { captchaGate } from "@/lib/turnstileServer";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in your deployment environment."
    );
  }
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
    const blocked = await captchaGate(body, "contact", req);
    if (blocked) return blocked;
    const {
      name,
      email,
      message,
      subject,
      context,
    }: {
      name?: string;
      email?: string;
      message?: string;
      subject?: string;
      context?: string;
    } = body;

    if (!email || !message) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    // Portal push is primary — always capture the lead first.
    await pushToPortal({ name, email, message, service: "Contact form", source: "contact", priority: "Med", meta: { subject, context } });

    // Email is best-effort — a missing/broken SMTP config must never cause a 5xx.
    try {
      const toAddress = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;
      if (toAddress) {
        await getTransport().sendMail({
          from: `"A4 Website" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
          to: toAddress,
          subject: subject || `New contact from ${name || "A4 website"}`,
          replyTo: email,
          text: `
Name: ${name || "N/A"}
Email: ${email}
Context: ${context || "General contact"}

Message:
${message}
          `.trim(),
        });

        // Confirmation to the sender — without it they have no proof the message landed.
        await getTransport().sendMail({
          from: `"A4" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
          to: email,
          subject: "Message received - A4",
          text: `Hi ${name || "there"},\n\nThank you for contacting A4. We have received your message and will get back to you within 24 hours.\n\nBest regards,\nThe A4 Team`,
        });
      }
    } catch (emailErr) {
      console.warn("Contact form email skipped (SMTP not configured or failed):", emailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message." },
      { status: 500 },
    );
  }
}

