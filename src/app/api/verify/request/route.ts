import { NextRequest, NextResponse } from "next/server";
import { postBackend } from "@/lib/portal-verify";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { email } = ((await req.json().catch(() => ({}))) ?? {}) as { email?: string };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  const r = await postBackend<{ delivered?: boolean; challengeToken?: string }>(
    "email-verify/request",
    { email },
    "Could not send a code right now. Please try again.",
  );
  if (!r.ok) return NextResponse.json({ error: r.message }, { status: r.status });
  return NextResponse.json({ ok: true, delivered: r.data.delivered === true, challengeToken: r.data.challengeToken });
}
