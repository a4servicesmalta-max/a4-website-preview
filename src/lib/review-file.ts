export const REVIEW_FILE_MAX_BYTES = 20 * 1024 * 1024;

const FS_EXTENSIONS = [".pdf", ".doc", ".docx"] as const;

/** Validate an audit-review upload before asking the visitor to verify email. */
export function validateAuditReviewFile(file: Pick<File, "name" | "size">): string | null {
  const name = file.name.toLowerCase();
  if (!FS_EXTENSIONS.some((extension) => name.endsWith(extension))) {
    return "Please choose a PDF or Word document (.pdf, .doc or .docx).";
  }
  if (file.size > REVIEW_FILE_MAX_BYTES) {
    return "That file is larger than 20 MB. Please choose a smaller copy.";
  }
  return null;
}
