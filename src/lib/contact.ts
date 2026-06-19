/** Shared contact details used across header, footer, contact and FAQ. */
export const CONTACT_EMAIL = "info@a4.com.mt";
export const CONTACT_EMAIL_HREF = "mailto:info@a4.com.mt";

export const CONTACT_PHONES = [
  {
    label: "Malta (main line)",
    display: "+356 2790 0007",
    href: "tel:+35627900007",
  },
  {
    label: "Malta (mobile)",
    display: "+356 7714 2418",
    href: "tel:+35677142418",
  },
] as const;

export const CONTACT_PHONES_DISPLAY = CONTACT_PHONES.map((p) => p.display).join(" • ");

export const LINKEDIN_COMPANY_URL = "https://www.linkedin.com/company/a4-servicesltd/";

/** Malta mobile on WhatsApp (digits only for wa.me). Main office line is not on WhatsApp. */
export const WHATSAPP_NUMBER = "35677142418";
export const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}`;
