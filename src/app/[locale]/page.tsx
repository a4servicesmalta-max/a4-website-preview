import type { Metadata } from "next";
import HomePage from "@/components/HomePage/Homepage";
import { getAllBlogs } from "@/utils/blog";
import { A4ServicesApp } from "./a4-services/components/A4ServicesApp";
import { pageMetadata } from "@/lib/page-metadata";
import "@/components/a4-landing/styles.css";

export const metadata: Metadata = pageMetadata(
  "Accounting, Audit & Corporate Services in Malta",
  "A4 Services Limited — licensed Malta accounting and audit firm. Fixed monthly bookkeeping from €25/mo, VAT, payroll, audit and corporate services.",
);

export default function Home() {
  const recentBlogs = getAllBlogs().slice(0, 3);

  return (
    <main className="min-h-dvh w-full a4-landing-page pt-24 sm:pt-28">
      {/* <HomePage recentBlogs={recentBlogs} /> */}
      <A4ServicesApp />
    </main>
  );
}
