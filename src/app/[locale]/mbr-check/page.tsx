import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { MbrCheckPageContent } from "../lead-magnets/components/LeadMagnetPages";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata: Metadata = pageMetadata(
  "Free MBR Penalty Check — Malta Business Registry",
  "Step-by-step guide to check your Malta company filing status and penalties on the official MBR BAROS portal — baros.mbr.mt.",
);

export default function MbrCheckPage() {
  return <MbrCheckPageContent />;
}
