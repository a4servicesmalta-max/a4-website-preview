import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { pushToPortal } from "@/lib/portal";
import { pushChatToPortal } from "@/lib/portal-chat";

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
    const { name, email, issue, conversation } = body as {
      name?: string;
      email?: string;
      issue?: string;
      conversation?: ConversationEntry[];
    };

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
    if (!validateEmail(email)) {
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

    // If the chat module could not be reached the conversation must still land
    // somewhere a human looks, so fall back to the Requests inbox.
    if (!thread) {
      await pushToPortal({ name, email, message: issue, service: "Support chat", source: "support-chat", priority: "Med", meta: { conversation } });
    }

    // Email is best-effort — a missing/broken SMTP config must never cause a 5xx.
    try {
      const toAddress = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;
      if (toAddress) {
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
        });
      }
    } catch (emailErr) {
      console.warn("Support form email skipped (SMTP not configured or failed):", emailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Support API error:", error);
    return NextResponse.json(
      { error: "Failed to send support request." },
      { status: 500 }
    );
  }
}
