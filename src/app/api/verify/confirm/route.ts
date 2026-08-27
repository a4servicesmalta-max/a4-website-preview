import { NextRequest, NextResponse } from "next/server";
import { postBackend } from "@/lib/portal-verify";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { email, code, challengeToken } = ((await req.json().catch(() => ({}))) ?? {}) as {
    email?: string;
    code?: string;
    challengeToken?: string;
  };
  if (!email || !code || !challengeToken) {
    return NextResponse.json({ error: "Missing verification details." }, { status: 400 });
  }
  const r = await postBackend<{ verifiedToken?: string }>(
    "email-verify/confirm",
    { email, code: code.trim(), challengeToken },
    "Verification failed. Please try again.",
  );
  if (!r.ok) return NextResponse.json({ error: r.message }, { status: r.status });
  return NextResponse.json({ ok: true, verifiedToken: r.data.verifiedToken });
}
