import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFile } from "fs/promises";
import path from "path";
export const euro = (n: number) => "€" + n.toLocaleString("en-MT");

/**
 * Who the quotation is for. Deliberately just the identity fields the page
 * prints — the figures arrive already priced in `QuotationPdfQuote`, because
 * this renderer must never be a second place where a fee is decided.
 */
export type QuotationPdfParty = {
  company: string;
  regNo?: string;
  name: string;
  email: string;
};

/** One printed fee line. `display` is pre-formatted ("€99 / month"). */
export type QuotationPdfLine = {
  name: string;
  hint: string;
  display: string;
};

/**
 * The priced quotation, as the caller computed it. The only supported source
 * is `evaluateA4Items` (src/lib/websiteQuotation.ts) — the same evaluator the
 * on-screen calculator and the portal backend use, so the PDF, the screen and
 * the emailed quotation are three renderings of one arithmetic.
 */
export type QuotationPdfQuote = {
  lines: QuotationPdfLine[];
  monthlyTotalEur: number;
  annualTotalEur: number;
  /** Monthlies annualised + annual + one-off — the headline figure. */
  indicativeAnnualEur: number;
  assumptions: string[];
};

const PAGE_W = 595.28; // A4 portrait, points
const PAGE_H = 841.89;

const INK = rgb(0.13, 0.13, 0.15);
const MUTE = rgb(0.42, 0.42, 0.46);
const ACCENT = rgb(0.29, 0.31, 0.87);
const HAIR = rgb(0.85, 0.85, 0.87);
const WHITE = rgb(1, 1, 1);

async function tryReadPublic(rel: string): Promise<Buffer | null> {
  try {
    return await readFile(path.join(process.cwd(), "public", rel));
  } catch {
    return null;
  }
}

/** Render the branded indicative-quotation PDF. Returns raw PDF bytes. */
export async function renderQuotationPdf(
  input: QuotationPdfParty,
  quote: QuotationPdfQuote,
  opts?: { onboardingUrl?: string }
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`A4 Services — Indicative quotation for ${input.company}`);
  doc.setAuthor("A4 Services Ltd");
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Background template art (Higgsfield letterhead); plain paper if missing.
  const bg = await tryReadPublic("assets/quote/quote-template-bg.png");
  if (bg) {
    const img = await doc.embedPng(bg);
    page.drawImage(img, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });
  } else {
    page.drawRectangle({ x: 0, y: PAGE_H - 64, width: PAGE_W, height: 64, color: rgb(0.1, 0.1, 0.12) });
    page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: 34, color: rgb(0.1, 0.1, 0.12) });
  }

  // Header: white A4 mark + firm identity (inside the dark band)
  const mark = await tryReadPublic("assets/a4-mark-white.png");
  if (mark) {
    const img = await doc.embedPng(mark);
    page.drawImage(img, { x: 40, y: PAGE_H - 44, width: 26, height: 26 });
  }
  page.drawText("A4 SERVICES LTD", { x: 76, y: PAGE_H - 30, size: 12.5, font: bold, color: WHITE });
  page.drawText("Accounting · Audit · Automation — Malta", { x: 76, y: PAGE_H - 42, size: 8, font, color: rgb(0.78, 0.78, 0.82) });

  let y = PAGE_H - 108;

  // Title block
  page.drawText("INDICATIVE QUOTATION", { x: 40, y, size: 22, font: bold, color: INK });
  y -= 16;
  page.drawText(
    `Prepared for ${input.company}${input.regNo ? ` (${input.regNo})` : ""} · ${new Date().toLocaleDateString("en-MT", { day: "numeric", month: "long", year: "numeric" })}`,
    { x: 40, y, size: 10, font, color: MUTE }
  );
  y -= 12;
  page.drawText(`Requested by ${input.name} · ${input.email}`, { x: 40, y, size: 10, font, color: MUTE });
  y -= 10;
  page.drawLine({ start: { x: 40, y }, end: { x: PAGE_W - 40, y }, thickness: 1, color: ACCENT });
  y -= 26;

  // Service lines
  page.drawText("SERVICE", { x: 40, y, size: 8.5, font: bold, color: MUTE });
  page.drawText("INDICATIVE FEE", { x: PAGE_W - 40 - 110, y, size: 8.5, font: bold, color: MUTE });
  y -= 8;
  page.drawLine({ start: { x: 40, y }, end: { x: PAGE_W - 40, y }, thickness: 0.6, color: HAIR });
  y -= 18;

  for (const line of quote.lines) {
    page.drawText(line.name, { x: 40, y, size: 11.5, font: bold, color: INK });
    page.drawText(line.display, { x: PAGE_W - 40 - 110, y, size: 11.5, font: bold, color: INK });
    y -= 13;
    page.drawText(line.hint, { x: 40, y, size: 9, font, color: MUTE, maxWidth: 380 });
    y -= 10;
    page.drawLine({ start: { x: 40, y }, end: { x: PAGE_W - 40, y }, thickness: 0.5, color: HAIR });
    y -= 17;
  }

  // Totals
  y -= 4;
  if (quote.monthlyTotalEur > 0) {
    page.drawText("Monthly services", { x: 40, y, size: 11, font, color: INK });
    page.drawText(`${euro(quote.monthlyTotalEur)} / month`, { x: PAGE_W - 40 - 110, y, size: 11, font: bold, color: INK });
    y -= 17;
  }
  if (quote.annualTotalEur > 0) {
    page.drawText("Annual & one-off services", { x: 40, y, size: 11, font, color: INK });
    page.drawText(`${euro(quote.annualTotalEur)} / year`, { x: PAGE_W - 40 - 110, y, size: 11, font: bold, color: INK });
    y -= 17;
  }
  y -= 4;
  page.drawRectangle({ x: 40, y: y - 26, width: PAGE_W - 80, height: 38, color: rgb(0.96, 0.96, 0.99), borderColor: ACCENT, borderWidth: 0.8 });
  page.drawText("INDICATIVE FIRST-YEAR TOTAL", { x: 52, y: y - 10, size: 10, font: bold, color: MUTE });
  page.drawText(euro(quote.indicativeAnnualEur), {
    x: PAGE_W - 40 - 150,
    y: y - 12,
    size: 15,
    font: bold,
    color: ACCENT,
  });
  y -= 50;

  // Assumptions
  page.drawText("BASIS & ASSUMPTIONS", { x: 40, y, size: 8.5, font: bold, color: MUTE });
  y -= 14;
  for (const a of quote.assumptions) {
    page.drawText(`•  ${a}`, { x: 44, y, size: 9, font, color: MUTE, maxWidth: PAGE_W - 96 });
    y -= 13;
  }
  y -= 14;

  // Next step / portal registration push
  const onboarding = opts?.onboardingUrl || "https://client.a4.com.mt";
  page.drawRectangle({ x: 40, y: y - 46, width: PAGE_W - 80, height: 58, color: rgb(0.1, 0.1, 0.12) });
  page.drawText("READY TO PROCEED?", { x: 52, y: y - 12, size: 9, font: bold, color: rgb(0.65, 0.67, 0.95) });
  page.drawText("Create your A4 Client Portal account — onboarding takes minutes and your", { x: 52, y: y - 25, size: 10, font, color: WHITE });
  page.drawText(`confirmed quote will be waiting for you:  ${onboarding}`, { x: 52, y: y - 38, size: 10, font, color: WHITE });

  // Footer identity line (in the bottom band area)
  page.drawText(
    "A4 Services Ltd · Licensed Malta accounting & audit firm · Authorised by the Malta Accountancy Board · info@a4.com.mt · a4.com.mt",
    { x: 40, y: 14, size: 7.5, font, color: bg ? WHITE : rgb(0.8, 0.8, 0.82) }
  );
  page.drawText(
    "This is an indicative estimate, not a binding offer or engagement letter. A written quote follows within 24 hours of your request.",
    { x: 40, y: y - 62, size: 8, font, color: MUTE, maxWidth: PAGE_W - 80 }
  );

  return doc.save();
}
