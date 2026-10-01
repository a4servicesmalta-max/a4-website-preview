import type { Metadata } from "next";
import { NotFoundView } from "@/components/common/NotFoundView";

export const metadata: Metadata = {
  title: "Page not found | A4 Services",
  robots: { index: false, follow: true },
};

/** Unmatched URLs render here, outside the site layout — the view brings its own A4 lockup. */
export default function NotFound() {
  return (
    <main id="main-content">
      <NotFoundView bare />
    </main>
  );
}
