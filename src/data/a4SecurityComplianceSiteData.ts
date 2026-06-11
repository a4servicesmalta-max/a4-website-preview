export type SecurityBlock = {
  icon: string;
  t: string;
  p: string[];
};

export const SECURITY_COMPLIANCE_BLOCKS: SecurityBlock[] = [
  {
    icon: "lock",
    t: "Data security",
    p: [
      "Encryption in transit (TLS) and at rest across the platform.",
      "Role-based, least-privilege access with multi-factor authentication.",
      "Continuous monitoring, logging and regular security testing.",
    ],
  },
  {
    icon: "eye-off",
    t: "Confidentiality",
    p: [
      "Client information is treated as strictly confidential at all times.",
      "Access is limited to the team members working on your engagement.",
      "Professional confidentiality obligations bind everyone at A4.",
    ],
  },
  {
    icon: "scale",
    t: "Compliance & professional standards",
    p: [
      "Work delivered in line with applicable accounting, audit and tax standards.",
      "GDPR-aligned data handling for all personal data we process.",
      "Engagements governed by clear terms and professional ethics.",
    ],
  },
  {
    icon: "clipboard-check",
    t: "Audit & quality controls",
    p: [
      "Layered review — preparer, reviewer and partner sign-off.",
      "Standardised working papers and documented methodology.",
      "Quality controls applied consistently across every engagement.",
    ],
  },
  {
    icon: "server",
    t: "Technology & compliance",
    p: [
      "Hosted on reputable, GDPR-compliant EU infrastructure.",
      "Regular encrypted backups and tested recovery procedures.",
      "Vendor and sub-processor due diligence on the tools we use.",
    ],
  },
  {
    icon: "user-check",
    t: "Client responsibility",
    p: [
      "Keep your portal credentials private and enable MFA.",
      "Share information through the portal rather than insecure channels.",
      "Let us know promptly of any changes to authorised users.",
    ],
  },
  {
    icon: "refresh-cw",
    t: "Ongoing improvements",
    p: [
      "Security and controls are reviewed and updated continuously.",
      "We track regulatory change and adapt our processes.",
      "Feedback and incidents feed directly into improvement.",
    ],
  },
];
