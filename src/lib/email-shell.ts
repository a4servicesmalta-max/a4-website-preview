/**
 * The A4 transactional email shell (v2, 2026-08-28).
 *
 * A dependency-free port of the portal backend's canonical `vacei-email.ejs`
 * template + `buildBrandedEmailLocals`, with the A4 brand tokens hard-wired:
 * this site only ever mails as A4, so nothing here is brand-keyed and the
 * Vacei teal ramp is deliberately absent (asserted in email-shell.test.ts).
 *
 * Structure every message shares: brand band → headline → greeting + intro →
 * OPTIONAL figure card / code box / line-item table / checklist / key-value
 * rows → primary button (+ quiet secondary link) → sign-off → footer.
 *
 * Rules carried over from the reference template:
 * - 600px table layout, every colour inlined on the element (Gmail strips
 *   <style>); the <style> block carries dark-mode overrides ONLY.
 * - No flexbox, no background images, no border-radius-dependent layout.
 * - Outfit on the headline + figure only, Inter body, JetBrains Mono for codes.
 * - Every caller-supplied string is escaped; nothing is injected raw.
 */
import fs from "node:fs";
import path from "node:path";

/* ---- A4 tokens (mirrors A4_PALETTE in the portal's outboundBrand.constant.ts) ---- */
const BAND_BG = "#09090B";
const BAND_BOTTOM = "#3F3F46";
const ACCENT = "#27272A";
const ACCENT_STRONG = "#3F3F46";
const ACCENT_SOFT = "#F4F4F5";
const ACCENT_SOFT_BORDER = "#E4E4E7";
const DARK_BG = "#09090B";
const DARK_CARD = "#18181B";
const DARK_BORDER = "#3F3F46";
const DARK_BORDER_SOFT = "#52525B";
const GROUND = "#F3F4F1";
const INK = "#151515";
const BODY = "#3B3B3B";
const MUTE = "#7A7D78";
const ROW_RULE = "#EEF0EC";

const F = "'Inter',system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const D = "'Outfit','Inter',system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const M = "'JetBrains Mono',Consolas,Menlo,monospace";

const BRAND_NAME = "A4 Services";
const BRAND_TAGLINE = "Accountants and auditors, Malta.";
const SUPPORT_EMAIL = "info@a4.com.mt";
const SITE_URL = "https://a4.com.mt";
const DEFAULT_SIGNOFF = "Kind regards, A4 Services Team";
const LOGO_WIDTH = 40;
const LOGO_WIDTH_FOOTER = 32;

/**
 * Logos are served from the public site — no bundling, no CID tracing on
 * Vercel. `a4EmailAttachments()` below is the CID alternative if a mail
 * client ever refuses remote images.
 */
export const A4_LOGO_WHITE_URL = `${SITE_URL}/assets/email/a4-logo-white.png`;
export const A4_LOGO_INK_URL = `${SITE_URL}/assets/email/a4-logo-ink.png`;

export type EmailFigure = { label: string; value: string; unit?: string; meta?: string };
export type EmailChecklist = { title?: string; items: string[] };
export type EmailLineItems = {
  labelHeading?: string;
  amountHeading?: string;
  rows: { label: string; amount: string; cadence?: string }[];
  total?: string;
  note?: string;
};
export type EmailRow = { label: string; value: string };
export type EmailCta = { label: string; url: string };

export type A4EmailInput = {
  /** Uppercase chip in the band, e.g. "Website · contact". */
  eyebrow?: string;
  headline: string;
  /** Renders "Dear <first name>," (first token only — a full name reads as a mail merge) — omitted when absent (staff mails). */
  firstName?: string;
  /** One paragraph, or several. A single string splits on blank lines. */
  intro: string | string[];
  figure?: EmailFigure;
  checklist?: EmailChecklist;
  lineItems?: EmailLineItems;
  /** Key/value table titled "Details". */
  rows?: EmailRow[];
  /** Big mono code box (verification codes). */
  code?: string;
  cta?: EmailCta;
  cta2?: EmailCta;
  /** Default "Kind regards, A4 Services Team". */
  signoff?: string;
  /** "You received this because …" footer line. */
  reason?: string;
};

export type A4EmailOutput = { html: string; text: string };

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Escaped, with newlines kept as <br>. */
const nl2br = (s: string) => escapeHtml(s).replace(/\r?\n/g, "<br>");

const isHttp = (s: string) => /^https?:\/\//i.test(s.trim());

/** Only http(s) URLs may become hrefs — anything else is rendered inert. */
function safeUrl(url: string): string {
  return isHttp(url) ? escapeHtml(url.trim()) : "#";
}

function introParagraphs(intro: string | string[]): string[] {
  const parts = Array.isArray(intro) ? intro : String(intro).split(/\n\n+/);
  return parts.map((p) => String(p ?? "").trim()).filter(Boolean);
}

const bodyP = (html: string) =>
  `<p class="v-body" style="margin:0 0 14px; font-size:15px; line-height:1.65; color:${BODY};">${html}</p>`;

const sectionTitle = (label: string, mb = 6) =>
  `<div class="v-mute" style="font-family:${F}; font-size:11px; letter-spacing:0.18em; text-transform:uppercase; font-weight:600; color:${MUTE}; margin-bottom:${mb}px;">${escapeHtml(label)}</div>`;

const softCard = (inner: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="v-soft" style="background-color:${ACCENT_SOFT}; border:1px solid ${ACCENT_SOFT_BORDER}; border-radius:14px;"><tr>${inner}</tr></table>`;

function renderFigure(f: EmailFigure): string {
  const unit = f.unit
    ? `<span style="font-size:16px; font-weight:500; letter-spacing:0; color:${BODY};"> ${escapeHtml(f.unit)}</span>`
    : "";
  const meta = f.meta
    ? `<div class="v-onsoft" style="margin-top:8px; font-family:${F}; font-size:12.5px; line-height:1.6; color:#5A5D58;">${nl2br(f.meta)}</div>`
    : "";
  return `
          <!-- FIGURE CARD -->
          <tr>
            <td class="v-pad" style="padding:16px 32px 4px;">
              ${softCard(`<td style="padding:20px 24px 18px;">
                    <div style="font-family:${F}; font-size:11px; letter-spacing:0.18em; text-transform:uppercase; font-weight:600; color:${ACCENT};">${escapeHtml(f.label)}</div>
                    <div class="v-fig v-onsoft" style="margin-top:6px; font-family:${D}; font-size:40px; font-weight:500; letter-spacing:-1px; line-height:1; color:${INK};">${escapeHtml(f.value)}${unit}</div>
                    ${meta}
                  </td>`)}
            </td>
          </tr>`;
}

function renderCode(code: string): string {
  return `
          <!-- VERIFICATION CODE -->
          <tr>
            <td class="v-pad" style="padding:16px 32px 4px;">
              ${softCard(`<td align="center" style="padding:24px;">
                    <div class="v-code v-onsoft" style="font-family:${M}; font-size:36px; font-weight:600; letter-spacing:0.32em; color:${INK};">${escapeHtml(code)}</div>
                  </td>`)}
            </td>
          </tr>`;
}

function renderLineItems(l: EmailLineItems): string {
  const head = (label: string, right = false) =>
    `<td${right ? ' align="right"' : ""} style="padding:11px 18px; font-family:${F}; font-size:11px; letter-spacing:0.16em; text-transform:uppercase; font-weight:600; color:${ACCENT};">${escapeHtml(label)}</td>`;
  const rows = l.rows
    .map(
      (r) => `
                <tr>
                  <td class="v-row v-body" style="padding:12px 18px; border-top:1px solid ${ROW_RULE}; font-family:${F}; font-size:14px; line-height:1.5; color:${BODY};">${escapeHtml(r.label)}</td>
                  <td class="v-row v-ink" align="right" style="padding:12px 18px; border-top:1px solid ${ROW_RULE}; font-family:${F}; font-size:14px; font-weight:600; white-space:nowrap; color:${INK};">${escapeHtml(r.amount)}${r.cadence ? ` <span class="v-mute" style="font-weight:400; color:${MUTE};">${escapeHtml(r.cadence)}</span>` : ""}</td>
                </tr>`,
    )
    .join("");
  const total = l.total
    ? `
                <tr>
                  <td class="v-ink" style="padding:14px 18px; border-top:2px solid ${INK}; font-family:${D}; font-size:16px; font-weight:500; color:${INK};">Total</td>
                  <td class="v-ink" align="right" style="padding:14px 18px; border-top:2px solid ${INK}; font-family:${D}; font-size:16px; font-weight:500; white-space:nowrap; color:${INK};">${escapeHtml(l.total)}</td>
                </tr>`
    : "";
  const note = l.note
    ? `<p class="v-mute" style="margin:10px 0 0; font-size:12.5px; line-height:1.6; color:${MUTE};">${nl2br(l.note)}</p>`
    : "";
  return `
          <!-- LINE ITEMS -->
          <tr>
            <td class="v-pad" style="padding:18px 32px 4px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${ACCENT_SOFT_BORDER}; border-radius:14px; overflow:hidden;">
                <tr class="v-soft" style="background-color:${ACCENT_SOFT};">
                  ${head(l.labelHeading || "Service")}
                  ${head(l.amountHeading || "Amount", true)}
                </tr>${rows}${total}
              </table>
              ${note}
            </td>
          </tr>`;
}

function renderChecklist(c: EmailChecklist): string {
  const items = c.items
    .map(
      (item) => `
                <tr>
                  <td style="width:22px; vertical-align:top; padding:5px 0;"><span style="display:inline-block; width:18px; height:18px; border-radius:9px; background-color:${ACCENT}; color:#FFFFFF; font-family:${F}; font-size:11px; line-height:18px; text-align:center; font-weight:700;">&#10003;</span></td>
                  <td class="v-body" style="padding:5px 0 5px 10px; font-family:${F}; font-size:14px; line-height:1.55; color:${BODY};">${nl2br(item)}</td>
                </tr>`,
    )
    .join("");
  return `
          <!-- CHECKLIST -->
          <tr>
            <td class="v-pad" style="padding:18px 32px 8px;">
              ${c.title ? sectionTitle(c.title) : ""}
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">${items}
              </table>
            </td>
          </tr>`;
}

function renderRows(rows: EmailRow[]): string {
  const body = rows
    .map((row, i) => {
      const rule = i ? `border-top:1px solid ${ROW_RULE};` : "";
      const cls = i ? " v-row" : "";
      const value = isHttp(row.value)
        ? `<a href="${safeUrl(row.value)}" class="v-link" style="color:${ACCENT_STRONG}; word-break:break-all;">${escapeHtml(row.value.trim())}</a>`
        : nl2br(row.value);
      return `
                <tr>
                  <td class="v-mute${cls}" style="width:130px; padding:10px 18px; ${rule} font-family:${F}; font-size:11px; letter-spacing:0.06em; text-transform:uppercase; color:${MUTE}; vertical-align:top;">${escapeHtml(row.label)}</td>
                  <td class="v-ink${cls}" style="padding:10px 18px; ${rule} font-family:${F}; font-size:14px; line-height:1.5; color:${INK};">${value}</td>
                </tr>`;
    })
    .join("");
  return `
          <!-- KEY / VALUE ROWS -->
          <tr>
            <td class="v-pad" style="padding:18px 32px 4px;">
              ${sectionTitle("Details", 8)}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${ACCENT_SOFT_BORDER}; border-radius:14px; overflow:hidden;">${body}
              </table>
            </td>
          </tr>`;
}

function renderCta(cta: EmailCta, cta2?: EmailCta): string {
  const url = safeUrl(cta.url);
  const second = cta2
    ? `
                  <td style="padding-left:16px; font-family:${F}; font-size:14px;"><a href="${safeUrl(cta2.url)}" class="v-link" style="color:${ACCENT_STRONG}; font-weight:600; text-decoration:underline;">${escapeHtml(cta2.label)}</a></td>`
    : "";
  return `
          <!-- PRIMARY CTA (ink, never the accent) + optional quiet secondary link -->
          <tr>
            <td class="v-pad" style="padding:22px 32px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="v-cta" bgcolor="${INK}" style="background-color:${INK}; border-radius:10px;">
                    <a href="${url}" class="v-cta-a" style="display:inline-block; padding:14px 26px; font-family:${F}; font-size:14px; font-weight:600; color:#FFFFFF; text-decoration:none;">${escapeHtml(cta.label)}</a>
                  </td>${second}
                </tr>
              </table>
              <p class="v-mute" style="margin:12px 0 0; font-size:12px; line-height:1.6; color:${MUTE};">If the button does not work, paste this link into your browser:<br><a href="${url}" class="v-link" style="color:${ACCENT_STRONG}; word-break:break-all;">${escapeHtml(cta.url.trim())}</a></p>
            </td>
          </tr>`;
}

/** "Kind regards, A4 Services Team" → ["Kind regards,", "A4 Services Team"]. */
function splitSignoff(signoff: string): [string, string] | null {
  const m = signoff.match(/^([^,\n]+,)\s*([\s\S]+)$/);
  return m ? [m[1], m[2].trim()] : null;
}

function renderSignoff(signoff: string): string {
  const parts = splitSignoff(signoff);
  const html = parts
    ? `${escapeHtml(parts[0])}<br><span class="v-ink" style="font-weight:600; color:${INK};">${nl2br(parts[1])}</span>`
    : nl2br(signoff);
  return `
          <!-- SIGN-OFF -->
          <tr>
            <td class="v-pad" style="padding:26px 32px 30px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="v-rule v-body" style="border-top:2px solid ${ACCENT}; padding-top:20px; font-family:${F}; font-size:14px; line-height:1.6; color:${BODY};">${html}</td>
                </tr>
              </table>
            </td>
          </tr>`;
}

const cleanRows = (rows?: EmailRow[]) =>
  rows?.filter((r) => r && r.label && String(r.value ?? "").trim()) ?? [];

function renderHtml(input: A4EmailInput): string {
  const headline = escapeHtml(input.headline);
  const paragraphs = introParagraphs(input.intro);
  const figure = input.figure && input.figure.label && input.figure.value ? input.figure : null;
  const checklist = input.checklist && input.checklist.items?.length ? input.checklist : null;
  const lines = input.lineItems && input.lineItems.rows?.length ? input.lineItems : null;
  const rows = cleanRows(input.rows);
  const cta = input.cta && input.cta.url && input.cta.label ? input.cta : null;
  const cta2 = input.cta2 && input.cta2.url && input.cta2.label ? input.cta2 : undefined;
  const signoff = (input.signoff ?? DEFAULT_SIGNOFF).trim();

  const eyebrow = input.eyebrow
    ? `
                  <td align="right" style="vertical-align:middle;"><span style="display:inline-block; padding:5px 12px; border-radius:999px; background-color:${ACCENT_SOFT}; border:1px solid ${ACCENT_SOFT_BORDER}; font-family:${F}; font-size:11px; letter-spacing:0.18em; text-transform:uppercase; font-weight:600; color:${ACCENT_STRONG};">${escapeHtml(input.eyebrow)}</span></td>`
    : "";

  const firstName = firstNameOf(input.firstName);
  const greeting = firstName
    ? `
              <p class="v-body" style="margin:14px 0 0; font-size:15px; line-height:1.65; color:${BODY};">Dear ${escapeHtml(firstName)},</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${headline}</title>
  <style>
    @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&family=Outfit:wght@400;500;600&display=swap");
    body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    img { line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; border: 0; height: auto; }
    table { border-collapse: collapse !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    a { text-decoration: none; }
    @media (max-width: 620px) {
      .v-pad { padding-left: 22px !important; padding-right: 22px !important; }
      .v-h { font-size: 22px !important; }
      .v-fig { font-size: 32px !important; }
      .v-code { font-size: 28px !important; letter-spacing: 0.22em !important; }
    }
    @media (prefers-color-scheme: dark) {
      .v-bg { background-color: ${DARK_BG} !important; }
      .v-card { background-color: ${DARK_CARD} !important; border-color: ${DARK_BORDER} !important; }
      .v-ink { color: #FFFFFF !important; }
      .v-body { color: rgba(255,255,255,0.82) !important; }
      .v-mute { color: rgba(255,255,255,0.55) !important; }
      .v-rule { border-top-color: ${DARK_BORDER} !important; }
      .v-soft { background-color: ${DARK_BORDER} !important; border-color: ${DARK_BORDER_SOFT} !important; }
      .v-onsoft { color: #FFFFFF !important; }
      .v-row { border-top-color: ${DARK_BORDER} !important; }
      .v-cta { background-color: #FFFFFF !important; }
      .v-cta-a { color: ${INK} !important; }
      .v-link { color: #FFFFFF !important; }
      .v-logo-light { display: none !important; }
      .v-logo-dark { display: block !important; max-height: none !important; overflow: visible !important; }
    }
  </style>
</head>
<body class="v-bg" style="margin:0; padding:0; background-color:${GROUND}; font-family:${F};">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${headline}</div>

  <table role="presentation" class="v-bg" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${GROUND};">
    <tr>
      <td align="center" style="padding:24px 12px 36px;">

        <table role="presentation" class="v-card" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:#FFFFFF; border:1px solid #E3E5E0; border-radius:16px; overflow:hidden;">

          <!-- BRAND BAND: the A4 dark canvas with the white monogram + wordmark -->
          <tr>
            <td class="v-pad" bgcolor="${BAND_BG}" style="background-color:${BAND_BG}; padding:22px 32px 20px; border-bottom:3px solid ${BAND_BOTTOM};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:middle;">
                          <img src="${A4_LOGO_WHITE_URL}" alt="${BRAND_NAME}" width="${LOGO_WIDTH}" style="display:block; width:${LOGO_WIDTH}px; max-width:${LOGO_WIDTH}px; height:auto;">
                        </td>
                        <td style="padding-left:12px; vertical-align:middle; font-family:${D}; font-size:17px; font-weight:500; letter-spacing:-0.2px; color:#FFFFFF;">${BRAND_NAME}</td>
                      </tr>
                    </table>
                  </td>${eyebrow}
                </tr>
              </table>
            </td>
          </tr>

          <!-- HEADLINE + GREETING + INTRO -->
          <tr>
            <td class="v-pad" style="padding:30px 32px 6px;">
              <h1 class="v-h v-ink" style="margin:0; font-family:${D}; font-size:26px; font-weight:500; letter-spacing:-0.4px; line-height:1.2; color:${INK};">${headline}</h1>${greeting}
              <div class="v-body" style="margin:12px 0 0; font-size:15px; line-height:1.65; color:${BODY};">
                ${paragraphs.map((p) => bodyP(nl2br(p))).join("\n                ")}
              </div>
            </td>
          </tr>
${figure ? renderFigure(figure) : ""}${input.code ? renderCode(input.code) : ""}${lines ? renderLineItems(lines) : ""}${checklist ? renderChecklist(checklist) : ""}${rows.length ? renderRows(rows) : ""}${cta ? renderCta(cta, cta2) : ""}${renderSignoff(signoff)}
        </table>

        <!-- FOOTER: outside the card, on the ground -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px;">
          <tr>
            <td class="v-pad" style="padding:22px 14px 0;">
              <img src="${A4_LOGO_INK_URL}" alt="${BRAND_NAME}" width="${LOGO_WIDTH_FOOTER}" class="v-logo-light" style="display:block; width:${LOGO_WIDTH_FOOTER}px; max-width:${LOGO_WIDTH_FOOTER}px; height:auto;">
              <img src="${A4_LOGO_WHITE_URL}" alt="${BRAND_NAME}" width="${LOGO_WIDTH_FOOTER}" class="v-logo-dark" style="display:none; width:${LOGO_WIDTH_FOOTER}px; max-width:${LOGO_WIDTH_FOOTER}px; height:auto; max-height:0; overflow:hidden;">
              <p class="v-mute" style="margin:10px 0 0; font-family:${F}; font-size:12px; line-height:1.7; color:${MUTE};">
                ${BRAND_NAME} · ${BRAND_TAGLINE}<br>
                ${input.reason ? `${escapeHtml(input.reason)}<br>` : ""}
                Questions? Reply to this email or write to <a href="mailto:${SUPPORT_EMAIL}" class="v-link" style="color:${BODY}; text-decoration:underline;">${SUPPORT_EMAIL}</a> · <a href="${SITE_URL}" class="v-link" style="color:${BODY}; text-decoration:underline;">${SITE_URL.replace(/^https?:\/\//, "")}</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Clean plain-text twin of the same content, for the `text` part. */
function renderText(input: A4EmailInput): string {
  const out: string[] = [];
  const blank = () => out.push("");
  out.push(input.headline.trim());
  blank();
  if (firstNameOf(input.firstName)) {
    out.push(`Dear ${firstNameOf(input.firstName)},`);
    blank();
  }
  for (const p of introParagraphs(input.intro)) {
    out.push(p);
    blank();
  }
  if (input.figure?.label && input.figure.value) {
    const f = input.figure;
    out.push(`${f.label}: ${f.value}${f.unit ? ` ${f.unit}` : ""}`);
    if (f.meta) out.push(f.meta);
    blank();
  }
  if (input.code) {
    out.push(`Code: ${input.code}`);
    blank();
  }
  if (input.lineItems?.rows?.length) {
    const l = input.lineItems;
    for (const r of l.rows) out.push(`- ${r.label}: ${r.amount}${r.cadence ? ` ${r.cadence}` : ""}`);
    if (l.total) out.push(`Total: ${l.total}`);
    if (l.note) out.push(l.note);
    blank();
  }
  if (input.checklist?.items?.length) {
    if (input.checklist.title) out.push(`${input.checklist.title}:`);
    for (const item of input.checklist.items) out.push(`- ${item}`);
    blank();
  }
  const rows = cleanRows(input.rows);
  if (rows.length) {
    out.push("Details:");
    for (const r of rows) {
      const v = String(r.value).trim();
      out.push(v.includes("\n") ? `${r.label}:\n${v}` : `${r.label}: ${v}`);
    }
    blank();
  }
  if (input.cta?.url && input.cta.label) {
    out.push(`${input.cta.label}: ${input.cta.url.trim()}`);
    if (input.cta2?.url && input.cta2.label) out.push(`${input.cta2.label}: ${input.cta2.url.trim()}`);
    blank();
  }
  const signoff = (input.signoff ?? DEFAULT_SIGNOFF).trim();
  const parts = splitSignoff(signoff);
  out.push(parts ? `${parts[0]}\n${parts[1]}` : signoff);
  blank();
  out.push(`${BRAND_NAME} · ${BRAND_TAGLINE}`);
  if (input.reason) out.push(input.reason);
  out.push(`Questions? Reply to this email or write to ${SUPPORT_EMAIL} · ${SITE_URL.replace(/^https?:\/\//, "")}`);
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

export function renderA4Email(input: A4EmailInput): A4EmailOutput {
  return { html: renderHtml(input), text: renderText(input) };
}

/* ---------------------------------------------------------------------------
   CID alternative. Not used by default (the shell references https URLs on
   a4.com.mt), kept for a mail client that blocks remote images. Reads lazily
   and never throws: if the PNGs were not traced into the serverless bundle
   the helper simply returns [] and the https <img src> still renders.
   ------------------------------------------------------------------------ */
export type A4EmailAttachment = { filename: string; content: Buffer; cid: string };

const LOGO_FILES: { filename: string; cid: string }[] = [
  { filename: "a4-logo-ink.png", cid: "a4-logo" },
  { filename: "a4-logo-white.png", cid: "a4-logo-dark" },
];

let cachedAttachments: A4EmailAttachment[] | null = null;

function readLogo(filename: string): Buffer | null {
  const candidates = [
    path.join(process.cwd(), "src", "assets", "email", filename),
    path.join(process.cwd(), "public", "assets", "email", filename),
    path.join(__dirname, "..", "assets", "email", filename),
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return fs.readFileSync(p);
    } catch {
      /* try the next location */
    }
  }
  return null;
}

/** nodemailer `attachments` for `cid:a4-logo` / `cid:a4-logo-dark`. */
export function a4EmailAttachments(): A4EmailAttachment[] {
  if (cachedAttachments) return cachedAttachments;
  const list: A4EmailAttachment[] = [];
  for (const { filename, cid } of LOGO_FILES) {
    const content = readLogo(filename);
    if (content) list.push({ filename, content, cid });
  }
  cachedAttachments = list;
  return list;
}

/** First token of a name; '' for blank or an email local part. */
function firstNameOf(name?: string): string {
  const first = (name ?? '').trim().split(/\s+/)[0] ?? '';
  return first && !first.includes('@') ? first : '';
}
