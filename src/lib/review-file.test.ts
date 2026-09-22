import { describe, expect, it } from "vitest";
import { REVIEW_FILE_MAX_BYTES, validateAuditReviewFile } from "./review-file";

describe("validateAuditReviewFile", () => {
  it.each(["accounts.pdf", "accounts.DOC", "accounts.docx"])("accepts %s", (name) => {
    expect(validateAuditReviewFile({ name, size: 10 })).toBeNull();
  });

  it("rejects unsupported files before verification", () => {
    expect(validateAuditReviewFile({ name: "accounts.xlsx", size: 10 })).toMatch(/PDF or Word/);
  });

  it("accepts exactly 20 MB and rejects anything larger", () => {
    expect(validateAuditReviewFile({ name: "accounts.pdf", size: REVIEW_FILE_MAX_BYTES })).toBeNull();
    expect(validateAuditReviewFile({ name: "accounts.pdf", size: REVIEW_FILE_MAX_BYTES + 1 })).toMatch(/larger than 20 MB/);
  });
});
