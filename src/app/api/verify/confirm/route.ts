import { NextRequest, NextResponse } from "next/server";
import { confirmChallenge } from "@/lib/email-verify";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, code, challengeToken } = (await req.json()) as {
      email?: string;
      code?: string;
      challengeToken?: string;
    };
    if (!email || !code || !challengeToken) {
      return NextResponse.json({ error: "Missing verification details." }, { status: 400 });
    }
    const result = confirmChallenge(email, code.trim(), challengeToken);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, verifiedToken: result.verifiedToken });
  } catch (e) {
    console.error("verify/confirm error:", e);
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}
