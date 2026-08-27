import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mail = vi.hoisted(() => ({
  sendMail: vi.fn(async () => ({ messageId: "test-message" })),
  createTransport: vi.fn(),
}));

mail.createTransport.mockImplementation(() => ({ sendMail: mail.sendMail }));

vi.mock("nodemailer", () => ({
  default: { createTransport: mail.createTransport },
}));

import { POST as requestCode } from "./request/route";
import { POST as confirmCode } from "./confirm/route";
import { isVerified } from "@/lib/email-verify";

const post = (url: string, body: object) =>
  new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as never;

describe("email verification flow", () => {
  beforeEach(() => {
    mail.sendMail.mockClear();
    mail.createTransport.mockClear();
    mail.createTransport.mockImplementation(() => ({ sendMail: mail.sendMail }));
    vi.stubEnv("EMAIL_VERIFY_SECRET", "verification-test-secret");
    vi.stubEnv("SMTP_HOST", "");
    vi.stubEnv("SMTP_USER", "");
    vi.stubEnv("SMTP_PASS", "");
  });

  afterEach(() => vi.unstubAllEnvs());

  it("completes the local confirmation flow without sending an email", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const response = await requestCode(post("http://localhost/api/verify/request", { email: "Person@Example.com" }));
    const challenge = await response.json();

    expect(response.status).toBe(200);
    expect(challenge.delivered).toBe(false);
    expect(challenge.devCode).toMatch(/^\d{6}$/);
    expect(mail.sendMail).not.toHaveBeenCalled();

    const confirmed = await confirmCode(post("http://localhost/api/verify/confirm", {
      email: "person@example.com",
      code: challenge.devCode,
      challengeToken: challenge.challengeToken,
    }));
    const proof = await confirmed.json();

    expect(confirmed.status).toBe(200);
    expect(isVerified("PERSON@example.com", proof.verifiedToken)).toBe(true);
  });

  it("sends the production code and accepts that exact code", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SMTP_HOST", "smtp.example.com");
    vi.stubEnv("SMTP_USER", "mailer@example.com");
    vi.stubEnv("SMTP_PASS", "smtp-test-password");

    const response = await requestCode(post("https://a4.com.mt/api/verify/request", { email: "client@example.com" }));
    const challenge = await response.json();

    expect(response.status).toBe(200);
    expect(challenge.delivered).toBe(true);
    expect(challenge.devCode).toBeUndefined();
    expect(mail.sendMail).toHaveBeenCalledOnce();

    const message = mail.sendMail.mock.calls[0][0] as { subject: string };
    const code = message.subject.match(/\d{6}/)?.[0];
    expect(code).toMatch(/^\d{6}$/);

    const confirmed = await confirmCode(post("https://a4.com.mt/api/verify/confirm", {
      email: "client@example.com",
      code,
      challengeToken: challenge.challengeToken,
    }));
    const proof = await confirmed.json();

    expect(confirmed.status).toBe(200);
    expect(isVerified("client@example.com", proof.verifiedToken)).toBe(true);
  });

  it("rejects invalid addresses before creating or sending a challenge", async () => {
    const response = await requestCode(post("http://localhost/api/verify/request", { email: "not-an-email" }));

    expect(response.status).toBe(400);
    expect(mail.createTransport).not.toHaveBeenCalled();
    expect(mail.sendMail).not.toHaveBeenCalled();
  });
});
