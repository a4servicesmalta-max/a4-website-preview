import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { pushToPortal } from "@/lib/portal";
import { pushLeadToPortal, pageUrlOf } from "@/lib/portal-lead";
import { flagsForServiceSelection } from "@/lib/independence";
import { renderA4Email } from "@/lib/email-shell";

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

    // The internal ops Requests inbox. It has never created a WebsiteLead, so
    // on its own a quote request never appeared in the portal lead list.
    await pushToPortal({ name, email, company: meta?.companyName, phone: meta?.phone, message, service: "Quote request" + (meta?.service ? ` — ${meta.service}` : ""), source: "quote", priority: "High", meta });

    // The lead list the firm actually works. Carry the phone and the selected
    // services through — the form collects both and they are the whole point of
    // a quote request.
    const selected = Array.isArray(meta?.services) ? meta.services.join(", ") : meta?.service;

    // IESBA independence. Derived server-side from the services actually
    // submitted rather than trusted from the client's `meta.auditEligible`:
    // a POST that skips the browser UI must still be routed correctly, and
    // this flag decides whether A4 may ever audit this prospect.
    //
    // M1: this used to be `Array.isArray(x) ? x.map(String) : [String(x)]`,
    // which could not handle the comma-joined string two of the three real
    // clients send — the whole joined value became ONE element, exact matching
    // failed, and every such lead routed `neutral`. Including the one case the
    // rule exists for: a prospect ticking bookkeeping AND audit together.
    // `normaliseServiceSelection` (inside `flagsForServiceSelection`) splits,
    // trims and maps page labels onto the canonical ids.
    const independence = flagsForServiceSelection(
      // Prefer the plural field; fall back to the singular. Both may be a
      // joined string, an array, or a page label — the normaliser takes any.
      meta?.services ?? meta?.service ?? []
    );

    const leadWritten = await pushLeadToPortal({
      name,
      email,
      phone: meta?.phone,
      message: [
        "[a4.com.mt — quote request]",
        meta?.companyName ? `Company: ${meta.companyName}` : "",
        selected ? `Services: ${selected}` : "",
        meta?.employees ? `Employees: ${meta.employees}` : "",
        meta?.turnover ? `Turnover: ${meta.turnover}` : "",
        "",
        message || "(no message provided)",
      ].filter(Boolean).join("\n"),
      sourceDetail: "quote",
      pageUrl: pageUrlOf(req),
      independence,
    });

    // A 200 with "your quote is on its way" when nothing was recorded is the
    // worst outcome available: the prospect stops chasing and we never know.
    if (!leadWritten) {
      return NextResponse.json(
        { error: "We couldn't record your request. Please email info@a4.com.mt and we'll pick it up straight away." },
        { status: 502 },
      );
    }

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

    // Staff copy on the branded A4 shell; the plain `textBody` above stays the
    // text part. Every value is escaped by the renderer.
    const str = (v: unknown) => (v == null ? "" : typeof v === "string" ? v : String(v));
    const htmlBody = renderA4Email({
      eyebrow: "Website · quote",
      headline: subjectLine,
      intro: message || "(no message provided)",
      rows: [
        { label: "Name", value: name },
        { label: "Email", value: email },
        { label: "Phone", value: str(meta?.phone) },
        { label: "Service", value: str(meta?.service) },
        { label: "Services", value: Array.isArray(meta?.services) ? meta.services.join(", ") : str(meta?.services) },
        { label: "Company", value: str(meta?.companyName) },
        { label: "Company stage", value: str(meta?.companyStage) },
        { label: "Jurisdiction", value: str(meta?.jurisdiction) },
        { label: "Employees", value: str(meta?.employees) },
        { label: "Turnover", value: str(meta?.turnover) },
        { label: "Documents", value: str(meta?.documentStatus) },
        { label: "Channel", value: str(meta?.communicationChannel) },
        { label: "Update cadence", value: str(meta?.updateCadence) },
        { label: "Service details", value: meta?.serviceDetails ? JSON.stringify(meta.serviceDetails, null, 2) : "" },
        { label: "Attachments", value: attachments.length ? attachments.map((a) => a.filename).join(", ") : "" },
      ],
      cta: { label: "Open lead queue", url: "https://partner.vacei.com/dashboard/leads" },
      signoff: "Automated notification from a4.com.mt",
    }).html;

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
        const autoReplyHtml = renderA4Email({
          headline: "We've received your quote request",
          firstName: name,
          intro: [
            "Thank you for reaching out to A4 Services.",
            "We have received your quote request and our team will review the details. We will get back to you within 24 hours.",
          ],
          cta: { label: "Book a call", url: "https://a4.com.mt/book-a-call" },
          cta2: { label: "Free accounting health check", url: "https://a4.com.mt/accounting-health-check" },
          reason: "You received this because you requested a quote on a4.com.mt.",
        }).html;

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

