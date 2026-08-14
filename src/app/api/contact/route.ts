import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { pushToPortal } from "@/lib/portal";
import { pushLeadToPortal, pageUrlOf } from "@/lib/portal-lead";
import { flagsForServiceSelection } from "@/lib/independence";

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
    const {
      name,
      email,
      phone,
      message,
      subject,
      context,
      services,
      company_website: companyWebsite,
    }: {
      name?: string;
      email?: string;
      phone?: string;
      message?: string;
      subject?: string;
      context?: string;
      /** Service ids from src/data/serviceRequestForms.ts, when the caller knows them. */
      services?: string[];
      company_website?: string;
    } = body;

    // Spam honeypot — mirrors vacei.com's `company_website` field: a hidden
    // input no human ever fills in (off-screen, tabindex -1, aria-hidden).
    // Bots that auto-fill every field trip it. Checked server-side (not just
    // client-side) so a direct POST that skips the browser UI is still
    // caught. Respond as if the submission succeeded — never tip off the
    // bot that it was filtered.
    if (companyWebsite && companyWebsite.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    if (!email || !message) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    // Two different systems, both wanted. pushToPortal reaches the A4 *internal
    // ops* Requests inbox; it has never created a WebsiteLead, so contact
    // enquiries were invisible in the portal lead list the firm actually works.
    await pushToPortal({ name, email, phone, message, service: "Contact form", source: "contact", priority: "Med", meta: { subject, context } });

    // IESBA independence — set whenever the caller told us which service this
    // is about. Derived server-side from the service list, never trusted from
    // a client-supplied boolean. A contact form with no service selection
    // stays neutral: nothing has been asked for yet, so nothing is ruled out.
    const independence = flagsForServiceSelection(Array.isArray(services) ? services.map(String) : []);

    const leadWritten = await pushLeadToPortal({
      name: name || email,
      email,
      phone,
      message: [
        "[a4.com.mt — contact form]",
        context ? `Context: ${context}` : "",
        subject ? `Subject: ${subject}` : "",
        Array.isArray(services) && services.length ? `Services: ${services.join(", ")}` : "",
        "",
        message,
      ].filter(Boolean).join("\n"),
      sourceDetail: "contact",
      pageUrl: pageUrlOf(req),
      independence,
    });

    // Never answer 200 with "we'll reply" when nothing was recorded. A silent
    // drop is worse than a visible failure: the prospect walks away believing
    // they are in the queue, and nobody knows they were ever here.
    if (!leadWritten) {
      return NextResponse.json(
        { error: "We couldn't record your message. Please email info@a4.com.mt and we'll pick it up straight away." },
        { status: 502 },
      );
    }

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
Phone: ${phone || "N/A"}
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

