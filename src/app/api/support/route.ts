import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { pushToPortal } from "@/lib/portal";
import { pushChatToPortal } from "@/lib/portal-chat";
import { pushLeadToPortal, provenanceOf } from "@/lib/portal-lead";
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

type ConversationEntry = { role: string; content: string };

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, issue, conversation, company_website } = body as {
      name?: string;
      email?: string;
      issue?: string;
      conversation?: ConversationEntry[];
      company_website?: string;
    };

    // Honeypot. The field is invisible and always submitted empty by a real
    // visitor, so anything in it is a bot. Drop the submission — nothing is
    // pushed to the portal and no email is sent — but answer 200 so the bot
    // learns nothing about why it failed.
    if (typeof company_website === "string" && company_website.trim()) {
      // Same shape as a real success, so the response reveals nothing.
      return NextResponse.json({ ok: true, thread: true });
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 }
      );
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }
    // Trim first: every later use trims, so validating the raw value rejected
    // an otherwise fine address that arrived with padding.
    if (!validateEmail(email.trim())) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }
    if (!issue || typeof issue !== "string" || !issue.trim()) {
      return NextResponse.json(
        { error: "Issue is required." },
        { status: 400 }
      );
    }

    const transcript =
      Array.isArray(conversation) && conversation.length > 0
        ? conversation
          .map((m) => `[${m.role}]: ${(m.content || "").trim()}`)
          .join("\n")
        : "No conversation transcript provided.";

    const sessionToken = req.cookies.get("A4_session")?.value || "N/A";

    // Primary home is the portal's Messages area: the chat becomes a real
    // thread staff can reply to, rather than a one-way form submission.
    const thread = await pushChatToPortal({
      name: name.trim(),
      email: email.trim(),
      message: issue.trim(),
      pageUrl: req.headers.get("referer") || undefined,
    });

    // The portal records the WebsiteLead itself when the chat session opens
    // (with this name and email), so only file one separately when the thread
    // could not be opened — otherwise every chat would double-lead.
    // Non-fatal, exactly like the thread push above.
    const leadWritten = thread
      ? true
      : await pushLeadToPortal({
          name: name.trim(),
          email: email.trim(),
          message: issue.trim(),
          provenance: provenanceOf(req),
        });

    // If the chat module could not be reached the conversation must still land
    // somewhere a human looks, so fall back to the Requests inbox.
    if (!thread) {
      await pushToPortal({ name, email, message: issue, service: "Support chat", source: "support-chat", priority: "Med", meta: { conversation } });
    }

    // Email is best-effort — a missing/broken SMTP config must never cause a 5xx.
    let emailSent = false;
    try {
      const toAddress = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;
      if (toAddress) {
        const staff = renderA4Email({
          eyebrow: "Website · support chat",
          headline: "Website support request",
          intro: ["Support request from the website chat.", issue.trim()],
          rows: [
            { label: "Name", value: name.trim() },
            { label: "Email", value: email.trim() },
            { label: "Session", value: sessionToken },
            { label: "Transcript", value: transcript },
          ],
          cta: { label: "Open lead queue", url: "https://partner.vacei.com/dashboard/leads" },
          signoff: "Automated notification from a4.com.mt",
        });
        await getTransport().sendMail({
          from: `"A4 Website Support" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
          to: toAddress,
          replyTo: email,
          subject: "Website Support Request",
          text: `
Support request from the website chat.

Name: ${name.trim()}
Email: ${email.trim()}
Session token: ${sessionToken}

Issue / Question:
${issue.trim()}

--- Conversation transcript ---
${transcript}
--- End transcript ---
          `.trim(),
          html: staff.html,
        });
        emailSent = true;
      }
    } catch (emailErr) {
      console.warn("Support form email skipped (SMTP not configured or failed):", emailErr);
    }

    // Only claim success if at least one channel actually captured the
    // request. Telling the visitor "we got it" when every channel failed
    // earns silence from a prospect who thinks help is coming.
    if (!thread && !leadWritten && !emailSent) {
      return NextResponse.json(
        { error: "We could not record your request just now. Please email us directly." },
        { status: 502 }
      );
    }

    // `thread` lets the widget (and a live probe) tell a real Support-inbox thread from the fallback.
    return NextResponse.json({ ok: true, thread: Boolean(thread) });
  } catch (error) {
    console.error("Support API error:", error);
    return NextResponse.json(
      { error: "Failed to send support request." },
      { status: 500 }
    );
  }
}
