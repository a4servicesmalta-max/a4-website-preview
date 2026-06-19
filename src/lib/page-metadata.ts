import type { Metadata } from "next";

export const SITE_NAME = "A4 Services";

const DEFAULT_DESCRIPTION =
  "A4 Services Limited is a licensed Malta accounting, audit and corporate services firm. Internationally capable via BOKS International — one team, one secure portal.";

/** Build consistent page metadata with Malta-first positioning. */
export function pageMetadata(title: string, description = DEFAULT_DESCRIPTION): Metadata {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

export { DEFAULT_DESCRIPTION };
