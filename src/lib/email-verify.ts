import crypto from "crypto";

/**
 * Stateless, double-opt-in email verification using signed HMAC tokens.
 *
 * No database: the challenge (a hash of the 6-digit code) and the eventual
 * "verified" proof are both carried in signed tokens that the client holds and
 * sends back. The server only ever trusts a token whose HMAC it can recompute,
 * so a client cannot forge a verified email.
 *
 * Used to gate any AI-consuming endpoint (e.g. the FS / trial-balance review)
 * behind a confirmed email address, so we never spend the AI engine on an
 * unconfirmed — and possibly fake — email.
 */

const CHALLENGE_TTL_MS = 10 * 60 * 1000; // 10 minutes to enter the code
const VERIFIED_TTL_MS = 30 * 60 * 1000; // 30 minutes the confirmed email stays valid

function secret(): string {
  return (
    process.env.EMAIL_VERIFY_SECRET ||
    process.env.SMTP_PASS ||
    "a4-dev-email-verify-secret"
  );
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function sign(payload: object): string {
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const mac = b64url(crypto.createHmac("sha256", secret()).update(body).digest());
  return `${body}.${mac}`;
}

function unsign<T = Record<string, unknown>>(token: string): T | null {
  if (!token || !token.includes(".")) return null;
  const [body, mac] = token.split(".");
  const expected = b64url(crypto.createHmac("sha256", secret()).update(body).digest());
  // constant-time compare
  if (mac.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try {
    return JSON.parse(fromB64url(body).toString("utf8")) as T;
  } catch {
    return null;
  }
}

const normEmail = (e: string) => e.trim().toLowerCase();

function codeHash(code: string, email: string): string {
  return crypto.createHash("sha256").update(`${code}:${normEmail(email)}:${secret()}`).digest("hex");
}

/** Generate a 6-digit code + a signed challenge token that encodes its hash. */
export function issueChallenge(email: string): { code: string; challengeToken: string } {
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const challengeToken = sign({
    t: "ch",
    e: normEmail(email),
    h: codeHash(code, email),
    exp: Date.now() + CHALLENGE_TTL_MS,
  });
  return { code, challengeToken };
}

/** Validate the code against the challenge token; on success return a verified token. */
export function confirmChallenge(
  email: string,
  code: string,
  challengeToken: string,
): { ok: true; verifiedToken: string } | { ok: false; error: string } {
  const p = unsign<{ t: string; e: string; h: string; exp: number }>(challengeToken);
  if (!p || p.t !== "ch") return { ok: false, error: "This verification request is invalid. Please request a new code." };
  if (Date.now() > p.exp) return { ok: false, error: "That code has expired. Please request a new one." };
  if (p.e !== normEmail(email)) return { ok: false, error: "Email does not match this verification request." };
  if (codeHash(code, email) !== p.h) return { ok: false, error: "That code is incorrect. Please check and try again." };
  const verifiedToken = sign({ t: "v", e: normEmail(email), exp: Date.now() + VERIFIED_TTL_MS });
  return { ok: true, verifiedToken };
}

/** Returns true if the verified token proves this email was confirmed and is still valid. */
export function isVerified(email: string, verifiedToken: string): boolean {
  const p = unsign<{ t: string; e: string; exp: number }>(verifiedToken);
  if (!p || p.t !== "v") return false;
  if (Date.now() > p.exp) return false;
  return p.e === normEmail(email);
}
