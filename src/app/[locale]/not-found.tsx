import type { Metadata } from "next";
import { NotFoundView } from "@/components/common/NotFoundView";

export const metadata: Metadata = {
  title: "Page not found | A4 Services",
  robots: { index: false, follow: true },
};

/** notFound() inside a page (e.g. retired URLs) — rendered within the site layout, nav and footer included. */
export default function LocaleNotFound() {
  return (
    <main id="main-content">
      <NotFoundView />
    </main>
  );
}
