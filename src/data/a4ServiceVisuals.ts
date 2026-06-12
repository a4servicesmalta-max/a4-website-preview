import type { ServiceKey } from "@/data/a4ServicesSiteData";

const SERVICES_PATH = "/assets/videos/services";

/** Service offering visuals sourced from vacei-website — one unique asset per service. */
export const SERVICE_VISUALS: Record<ServiceKey, string> = {
  bookkeeping: `${SERVICES_PATH}/Accounting%20%26%20Bookkeeping_X1V1.gif`,
  outsourcing: "/assets/videos/Request%20Service_V1.2.gif",
  legal: "/assets/videos/Invite%20Advisor%20V1.2.gif",
  "vat-payroll": `${SERVICES_PATH}/V17-VAT%20Return.gif`,
  "audit-assurance": `${SERVICES_PATH}/Audit_Service_V1%281%29.gif`,
  "audit-readiness": `${SERVICES_PATH}/V16-Audit%20Rediness.gif`,
  "accounting-finance": "/assets/videos/Main%20Render.gif",
  "tax-compliance": `${SERVICES_PATH}/V11-Ai%20FS%20Review%20GIF.gif`,
  "corporate-csp": `${SERVICES_PATH}/Corporate%20%26%20CSP%20Services.gif`,
  "regulated-licensing": `${SERVICES_PATH}/CFO%20%26%20Management%20Reporting.gif`,
  "advisory-growth": "/assets/videos/Before.gif",
  "company-structure": `${SERVICES_PATH}/V10-Corporate%20Transactions.gif`,
  "liquidation-winddown": "/assets/videos/After.gif",
  "international-structures": `${SERVICES_PATH}/Internation%20Structuring.gif`,
  "group-consolidation": `${SERVICES_PATH}/Group%20%26%20Consolidate.gif`,
  "banking-payments": `${SERVICES_PATH}/V9-Banking%20%26%20Payments%20Support.gif`,
  "crypto-digital-assets": `${SERVICES_PATH}/Crypto%20Service.gif`,
  "corporate-transactions": "/assets/videos/hero-video.mp4",
};

export const SERVICE_VISUAL_FALLBACK = "/assets/videos/Main%20Render.gif";

export function getServiceVisual(serviceKey: ServiceKey): string {
  return SERVICE_VISUALS[serviceKey] ?? SERVICE_VISUAL_FALLBACK;
}

export function isVideoAsset(url: string): boolean {
  return /\.(mp4|webm|mov)(\?|#|$)/i.test(url);
}
