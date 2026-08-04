/** Legal copy from New website (2) privacy-policy.html & terms-and-conditions.html */

type LegalSection = { h: string; p: (string | string[])[] };

export const PRIVACY_POLICY_SECTIONS: LegalSection[] = [
  {
    h: "Who we are",
    p: [
      "A4 Services Limited is the data controller for personal data processed through our website and platform. Our registered office is A4, Triq San Giljan, San Gwann, Malta. You can reach us at info@a4.com.mt.",
    ],
  },
  {
    h: "Information we collect",
    p: [
      "We collect information you provide directly and information generated as you use our services.",
      [
        "Contact details such as name, email and phone number.",
        "Business and engagement information needed to deliver services.",
        "Documents and financial records you upload to your portal.",
        "Technical data such as IP address and usage analytics.",
      ],
    ],
  },
  {
    h: "How we use your information",
    p: [
      "We process personal data to provide and administer our services, communicate with you, meet legal and regulatory obligations, secure our platform, and improve what we offer.",
      "We rely on the lawful bases of contract, legal obligation, legitimate interests and, where applicable, consent.",
    ],
  },
  {
    h: "Automated document analysis (AI)",
    p: [
      "Some of our tools — such as the free accounting health check and the financial-statements review on this website — analyse the documents you upload automatically. This processing may include the use of artificial-intelligence (AI) models operated by third-party providers (currently Anthropic), acting as our processors under contract.",
      [
        "Documents you upload to these tools are processed in memory to generate your review and are not retained after the analysis completes.",
        "The findings of the analysis (not the original document) are shared with our team so we can follow up on your request.",
        "Our AI providers are contractually prohibited from using your data to train their models.",
        "AI output is generated automatically and is indicative only — it is always subject to review by our professionals before it forms part of any engagement.",
      ],
      "By uploading a document to one of these tools and ticking the consent box, you consent to this processing. If you prefer not to use AI-assisted tools, you can contact us at info@a4.com.mt and we will review your documents manually as part of an engagement.",
    ],
  },
  {
    h: "Sharing your information",
    p: [
      "We do not sell your data. We share it only with trusted service providers who process it on our behalf under contract — including the AI providers described above — with professional partners involved in delivering your engagement, and with authorities where required by law.",
    ],
  },
  {
    h: "Data storage & security",
    p: [
      "Your data is hosted on reputable, GDPR-compliant infrastructure within the EU. It is encrypted in transit and at rest, with role-based access controls, monitoring and regular backups.",
    ],
  },
  {
    h: "Data retention",
    p: [
      "We keep personal data only as long as necessary for the purposes described, including to satisfy legal, accounting and regulatory requirements. Retention periods vary by record type and applicable law.",
    ],
  },
  {
    h: "Your rights",
    p: [
      "Subject to applicable law, you have rights to access, correct, delete, restrict or object to processing of your personal data, and to data portability.",
      [
        "Request a copy of the data we hold about you.",
        "Ask us to correct or delete your data.",
        "Withdraw consent where processing is based on consent.",
        "Lodge a complaint with the Information and Data Protection Commissioner in Malta.",
      ],
    ],
  },
  {
    h: "International transfers",
    p: [
      "Where data is transferred outside the EEA, we put appropriate safeguards in place, such as standard contractual clauses, to protect it.",
    ],
  },
  {
    h: "Changes to this policy",
    p: [
      "We may update this Privacy Policy from time to time. The latest version is always published here with the date of last update.",
    ],
  },
  {
    h: "Contact us",
    p: ["For any privacy question or to exercise your rights, email info@a4.com.mt and we'll respond promptly."],
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    h: "About these terms",
    p: [
      'These Terms & Conditions govern your use of the A4 Services website and platform, and any professional services provided by A4 Services Limited ("A4", "we", "us"). By accessing our website or engaging our services, you agree to these terms.',
      "These terms should be read together with the specific engagement letter for any services you commission, which takes precedence where there is a conflict.",
    ],
  },
  {
    h: "Our services",
    p: [
      "A4 is an accounting, audit and corporate services firm. We provide professional services through qualified personnel, supported by a secure client portal. The scope of any engagement is set out in your individual quote and engagement letter.",
      "We are not a software vendor or marketplace; the platform exists to deliver and manage the professional services we provide.",
    ],
  },
  {
    h: "Engagement & quotes",
    p: [
      "Quotes are provided based on the information you give us and the scope agreed. Services begin once you accept a quote, the engagement letter is signed and our client due-diligence (KYC) checks are completed.",
      "Fees, scope, assumptions and timelines are set out in your quote. Work outside the agreed scope may be subject to additional fees, agreed with you in advance.",
    ],
  },
  {
    h: "Your responsibilities",
    p: [
      "To deliver our services we rely on you to provide accurate, complete and timely information, and to keep your portal access secure.",
      [
        "Provide records and information when reasonably requested.",
        "Ensure information provided is accurate and complete.",
        "Keep login credentials confidential and notify us of any changes to authorised users.",
      ],
    ],
  },
  {
    h: "AI-assisted tools",
    p: [
      "Our website offers free automated tools (such as the accounting health check, financial-statements review and fee estimators) whose output is generated by software, including artificial-intelligence models operated by third-party providers processing on our behalf. By uploading a document to one of these tools you agree that it will be processed in this way, as described in our Privacy Policy.",
      "The output of these tools is indicative only. It does not constitute audit, accounting, tax or other professional advice, does not create an engagement with A4, and should not be relied upon without professional review. Any engagement is formed only through an accepted quote and signed engagement letter.",
    ],
  },
  {
    h: "Fees & payment",
    p: [
      "Fees are as set out in your quote or engagement letter. Unless otherwise agreed, invoices are payable within the stated terms. We reserve the right to suspend services where fees remain unpaid.",
    ],
  },
  {
    h: "Confidentiality",
    p: [
      "We treat your information as confidential and only disclose it where required by law, regulation or professional obligation, or with your consent. We expect the same confidentiality in return regarding our methods and materials.",
    ],
  },
  {
    h: "Liability",
    p: [
      "Our liability is limited to the extent permitted by law and as set out in your engagement letter. We are not liable for losses arising from inaccurate or incomplete information provided to us, or from circumstances beyond our reasonable control.",
    ],
  },
  {
    h: "Intellectual property",
    p: [
      "All content, software and materials on the A4 website and platform are owned by A4 or our licensors and may not be copied or reused without permission.",
    ],
  },
  {
    h: "Termination",
    p: [
      "Either party may terminate an engagement in line with the notice provisions in the engagement letter. On termination, fees for work performed up to that point remain payable.",
    ],
  },
  {
    h: "Governing law",
    p: [
      "These terms are governed by the laws of Malta, and any disputes are subject to the exclusive jurisdiction of the Maltese courts.",
    ],
  },
  {
    h: "Changes to these terms",
    p: [
      "We may update these terms from time to time. The current version is always available on this page, with the date of last update shown above.",
    ],
  },
];
