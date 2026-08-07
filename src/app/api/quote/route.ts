import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { pushToPortal } from "@/lib/portal";

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
    const contentType = req.headers.get("content-type") || "";

    let name: string | undefined;
    let email: string | undefined;
    let subject: string | undefined;
    let message: string | undefined;
    let meta: any;
    let companyWebsite: string | undefined;
    let attachments: { filename: string; content: Buffer }[] = [];

    if (contentType.includes("multipart/form-data")) {
      // Handle multipart requests (homepage ProcessStepsSection with file uploads)
      const form = await req.formData();
      name = form.get("name")?.toString();
      email = form.get("email")?.toString();
      subject =
        form.get("subject")?.toString() ||
        "Homepage quote / project request";
      message = form.get("message")?.toString() || "";
      companyWebsite = form.get("company_website")?.toString();

      const metaJson = form.get("metaJson")?.toString();
      if (metaJson) {
        try {
          meta = JSON.parse(metaJson);
        } catch {
          meta = metaJson;
        }
      }

      const files = form.getAll("files") as unknown as File[];
      if (files && files.length > 0) {
        const buffers = await Promise.all(
          files.map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            return {
              filename: file.name,
              content: Buffer.from(arrayBuffer),
            };
          }),
        );
        attachments = buffers;
      }
    } else {
      // Handle existing JSON-based quote forms (e.g. /quote page)
      const body = await req.json();
      ({
        name,
        email,
        subject,
        message,
        meta,
        company_website: companyWebsite,
      } = body as {
        name?: string;
        email?: string;
        subject?: string;
        message?: string;
        meta?: any;
        company_website?: string;
      });
    }

    // Spam honeypot — mirrors vacei.com's `company_website` field: a hidden
    // input no human ever fills in (off-screen, tabindex -1, aria-hidden).
    // Bots that auto-fill every field trip it. Checked server-side (not just
    // client-side) so a direct POST that skips the browser UI is still
    // caught. Respond as if the submission succeeded — never tip off the
    // bot that it was filtered.
    if (companyWebsite && companyWebsite.trim().length > 0) {
      return NextResponse.json({ ok: true });
    }

    if (!email || !name) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 },
      );
    }

    // Portal push is primary — always capture the lead first.
    await pushToPortal({ name, email, company: meta?.companyName, phone: meta?.phone, message, service: "Quote request" + (meta?.service ? ` — ${meta.service}` : ""), source: "quote", priority: "High", meta });

    const subjectLine = subject || `New quote request from ${name}`;

    // Build nicer text + HTML body for Gmail readability
    const lines: string[] = [];
    lines.push(`Name: ${name}`);
    lines.push(`Email: ${email}`);
    lines.push("");
    lines.push("Message:");
    lines.push(message || "(no message provided)");

    if (meta) {
      lines.push("");
      lines.push("Additional details:");
      if (meta.service) lines.push(`- Service: ${meta.service}`);
      if (meta.companyStage)
        lines.push(`- Company Stage: ${meta.companyStage}`);
      if (meta.companyName)
        lines.push(`- Company Name: ${meta.companyName}`);
      if (meta.jurisdiction)
        lines.push(`- Jurisdiction: ${meta.jurisdiction}`);
      if (meta.documentStatus)
        lines.push(`- Document Status: ${meta.documentStatus}`);
      if (meta.communicationChannel) {
        lines.push(
          `- Communication Channel: ${meta.communicationChannel}`,
        );
      }
      if (meta.phone) {
        lines.push(`- Phone: ${meta.phone}`);
      }
      if (meta.updateCadence) {
        lines.push(`- Update Cadence: ${meta.updateCadence}`);
      }
      if (meta.serviceDetails) {
        lines.push("- Service Details:");
        lines.push(JSON.stringify(meta.serviceDetails, null, 2));
      }
    }

    const textBody = lines.join("\n");

    const htmlBody = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size:14px; color:#111827;">
        <h2 style="font-size:18px; margin:0 0 12px 0;">${subjectLine}</h2>
        <p style="margin:0 0 4px 0;"><strong>Name:</strong> ${name}</p>
        <p style="margin:0 0 12px 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin:0 0 6px 0;"><strong>Message</strong></p>
        <p style="white-space:pre-line; margin:0 0 12px 0;">${message || "(no message provided)"}</p>
        ${meta
        ? `<div style="margin-top:8px;">
                 <p style="margin:0 0 6px 0;"><strong>Additional details</strong></p>
                 <ul style="margin:0 0 0 16px; padding:0;">
                   ${meta.service ? `<li><strong>Service:</strong> ${meta.service}</li>` : ""}
                   ${meta.companyStage ? `<li><strong>Company Stage:</strong> ${meta.companyStage}</li>` : ""}
                   ${meta.companyName ? `<li><strong>Company Name:</strong> ${meta.companyName}</li>` : ""}
                   ${meta.jurisdiction ? `<li><strong>Jurisdiction:</strong> ${meta.jurisdiction}</li>` : ""}
                   ${meta.documentStatus ? `<li><strong>Document Status:</strong> ${meta.documentStatus}</li>` : ""}
                   ${meta.communicationChannel ? `<li><strong>Communication Channel:</strong> ${meta.communicationChannel}</li>` : ""}
                   ${meta.phone ? `<li><strong>Phone:</strong> ${meta.phone}</li>` : ""}
                   ${meta.updateCadence ? `<li><strong>Update Cadence:</strong> ${meta.updateCadence}</li>` : ""}
                 </ul>
                 ${meta.serviceDetails
          ? `<p style="margin:8px 0 4px 0;"><strong>Service Details (raw JSON)</strong></p>
                        <pre style="background:#f9fafb; padding:8px 10px; border-radius:6px; font-size:12px; white-space:pre-wrap;">${JSON.stringify(
            meta.serviceDetails,
            null,
            2,
          )}</pre>`
          : ""
        }
               </div>`
        : ""
      }
      </div>
    `;

    // Emails are best-effort — a missing/broken SMTP config must never cause a 5xx.
    try {
      const toAddress =
        process.env.QUOTE_TO_EMAIL ||
        process.env.CONTACT_TO_EMAIL ||
        process.env.SMTP_USER;
      if (toAddress) {
        const transport = getTransport();
        const fromAddress = `"A4" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;

        // Send the notification email to the internal A4 team
        await transport.sendMail({
          from: fromAddress,
          to: toAddress,
          subject: subjectLine,
          replyTo: email,
          text: textBody,
          html: htmlBody,
          attachments,
        });

        // Send the auto-responder confirmation email to the user
        const autoReplySubject = "Quote Request Received - A4";
        const autoReplyText = `Hi ${name},\n\nThank you for reaching out to us.\n\nWe have received your quote request and our team will review the details. We will get back to you within 24 hours.\n\nBest regards,\nThe A4 Team`;
        const autoReplyHtml = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size:14px; color:#111827;">
        <p>Hi ${name},</p>
        <p>Thank you for reaching out to us.</p>
        <p>We have received your quote request and our team will review the details. We will get back to you within 24 hours.</p>
        <p>Best regards,<br/>The A4 Team</p>
      </div>
    `;

        await transport.sendMail({
          from: fromAddress,
          to: email,
          subject: autoReplySubject,
          text: autoReplyText,
          html: autoReplyHtml,
        });
      }
    } catch (emailErr) {
      console.warn("Quote form email skipped (SMTP not configured or failed):", emailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Quote form error:", error);
    return NextResponse.json(
      { error: "Failed to send quote request." },
      { status: 500 },
    );
  }
}

