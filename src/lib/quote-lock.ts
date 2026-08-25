import crypto from "crypto";

/**
 * Quote lock — once we have quoted a prospect a fee, that is the fee they see.
 *
 * The problem it solves (owner, 2026-08-25): a visitor uploads their financial
 * statements, gets a priced quote, then opens a new tab and asks for a number
 * WITHOUT uploading. The questionnaire path prices from the rate card and can
 * land somewhere else entirely, so the same company sees two different fees —
 * which reads as either sloppiness or, worse, an invitation to shop the tool
 * until it produces the cheapest number.
 *
 * Identity, in the order it is trusted (owner decision, 2026-08-25):
 *   1. VERIFIED EMAIL. The upload path already gates on `isVerified`, so this
 *      is a real, confirmed address, and it survives a new device.
 *   2. SIGNED COOKIE. Covers the literal case in the brief — a new tab shares
 *      cookies with the tab that produced the quote — and covers a visitor who
 *      has not (yet) given an email on the second surface.
 *
 * IP address is DELIBERATELY NOT USED. It collides (serviced offices,
 * co-working and mobile-carrier NAT put unrelated companies behind one public
 * address, so we would serve one prospect the fee computed for another) and it
 * misses (phone-to-wifi, dynamic allocation), and as personal data it would put
 * a retention and disclosure obligation on both sites for a signal that is
 * worse than the two above at the only job it has.
 *
 * The lock is a signed token, not a database row: the payload carries the fee
 * and rides in the cookie, so a client can present it but cannot edit it — the
 * HMAC is recomputed server-side on every read. Same construction as
 * `email-verify.ts`; the two are deliberately the same shape.
 */

/** 30 days — the owner's chosen validity, and a normal Malta sales cycle. */
export const LOCK_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const LOCK_COOKIE = "A4_quote_lock";

export type QuoteKind = "audit";

export type QuoteLock = {
  /** The quoted fee in whole euro, exactly as the prospect saw it. */
  fee: number;
  kind: QuoteKind;
  /** Verified email the quote was issued against, if we had one. */
  email: string | null;
  /** ms epoch. */
  issuedAt: number;
  expiresAt: number;
};

function secret(): string {
  return (
    process.env.QUOTE_LOCK_SECRET ||
    process.env.EMAIL_VERIFY_SECRET ||
    process.env.SMTP_PASS ||
    "a4-dev-quote-lock-secret"
  );
}

const b64url = (buf: Buffer) =>
  buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = (s: string) =>
  Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");

const normEmail = (e: string) => e.trim().toLowerCase();

function sign(payload: object): string {
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const mac = b64url(crypto.createHmac("sha256", secret()).update(body).digest());
  return `${body}.${mac}`;
}

function unsign<T>(token: string): T | null {
  if (!token || !token.includes(".")) return null;
  const [body, mac] = token.split(".");
  const expected = b64url(crypto.createHmac("sha256", secret()).update(body).digest());
  if (mac.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try {
    return JSON.parse(fromB64url(body).toString("utf8")) as T;
  } catch {
    return null;
  }
}

type Payload = { t: "ql"; f: number; k: QuoteKind; e: string | null; i: number; x: number };

/** Mint a lock token for a fee we have just quoted. */
export function issueQuoteLock(
  fee: number,
  kind: QuoteKind,
  email?: string | null,
  now: number = Date.now(),
): string {
  return sign({
    t: "ql",
    f: Math.round(fee),
    k: kind,
    e: email ? normEmail(email) : null,
    i: now,
    x: now + LOCK_TTL_MS,
  } satisfies Payload);
}

/**
 * Read a lock token. Returns null if it is missing, forged, expired, for a
 * different kind of quote, or — when `email` is supplied — was issued to a
 * DIFFERENT email. That last check is what stops a shared machine handing one
 * visitor the fee we calculated for the person who used it before them.
 */
export function readQuoteLock(
  token: string | undefined | null,
  kind: QuoteKind,
  email?: string | null,
  now: number = Date.now(),
): QuoteLock | null {
  if (!token) return null;
  const p = unsign<Payload>(token);
  if (!p || p.t !== "ql" || p.k !== kind) return null;
  if (typeof p.f !== "number" || !Number.isFinite(p.f) || p.f <= 0) return null;
  if (now > p.x) return null;
  if (email && p.e && p.e !== normEmail(email)) return null;
  return { fee: p.f, kind: p.k, email: p.e, issuedAt: p.i, expiresAt: p.x };
}

/** Cookie attributes. Not httpOnly: the estimator is a client component and
 *  reads the lock through /api/quote-lock, but keeping it readable costs
 *  nothing — the signature, not the secrecy, is what makes it trustworthy. */
export function lockCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(LOCK_TTL_MS / 1000),
  };
}
