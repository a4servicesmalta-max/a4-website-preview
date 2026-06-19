/** Official Malta Business Registry (MBR) URLs — not Indian MCA. */

/** BAROS — company search, filings, certificates (login required since Aug 2025). */
export const MBR_BAROS_URL =
  process.env.NEXT_PUBLIC_MBR_BAROS_URL?.trim() || "https://baros.mbr.mt/";

/** MBR public website — news, forms, enforcement notices. */
export const MBR_WEBSITE_URL =
  process.env.NEXT_PUBLIC_MBR_WEBSITE_URL?.trim() || "https://mbr.mt/";

export const MBR_ONLINE_FILING_URL = "https://mbr.mt/online-filing-information/";

export const MBR_CHECK_STEPS = [
  {
    id: "portal",
    icon: "globe",
    title: "Open the official MBR portal",
    body: "Go to BAROS — the Malta Business Registry’s online system at baros.mbr.mt. This is the only official source for company master data and filing status in Malta.",
    link: MBR_BAROS_URL,
    linkLabel: "Open BAROS",
  },
  {
    id: "login",
    icon: "shield-check",
    title: "Sign in (free registration)",
    body: "Since August 2025, company search requires authentication. Register free with a Malta Government CORP account, Malta e-ID, eIDAS, or Non-EU login.",
    link: MBR_ONLINE_FILING_URL,
    linkLabel: "BAROS login guide",
  },
  {
    id: "search",
    icon: "search",
    title: "Search your company",
    body: "Use Company Search and enter your exact registration number (e.g. C 61042) or exact registered name. Partial matches may not return results.",
    link: MBR_BAROS_URL,
    linkLabel: "Search on BAROS",
  },
  {
    id: "status",
    icon: "clipboard-check",
    title: "Review status & penalties",
    body: "Check whether annual returns and accounts are filed, the company is active or struck off, and whether any enforcement notices or penalties apply. Order certificates via Orders if needed.",
    link: MBR_WEBSITE_URL,
    linkLabel: "Visit mbr.mt",
  },
] as const;
