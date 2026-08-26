import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { BookACallContent } from "./components/BookACallContent";

import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "Book a Call — A4 Services Malta",
  "Pick a time for a free call with A4 Services Limited — licensed Malta accounting and audit firm. All times shown in Malta time.",
);

export default function BookACallPage() {
  return <BookACallContent />;
}
