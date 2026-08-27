import { it, expect } from "vitest";
import { readSessionToken } from "./portal-chat";

// The backend wraps every reply in {success, data, message}; reading the token
// from the top level is the 05-Aug envelope bug that hid every chat for weeks.
it("reads the session token from the portal's response envelope", () => {
  expect(readSessionToken({ success: true, data: { sessionToken: "abc", expiresAt: "x" } })).toBe("abc");
});
it("tolerates a flat body and rejects everything else", () => {
  expect(readSessionToken({ sessionToken: "abc" })).toBe("abc");
  expect(readSessionToken({ success: true, data: null })).toBeNull();
  expect(readSessionToken(null)).toBeNull();
});
