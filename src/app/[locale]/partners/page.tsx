import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { PartnersInfoContent } from "./components/PartnersInfoContent";

export const metadata: Metadata = {
  title: "Partner With A4 | Partnership Models",
  description:
    "Explore A4 partnership opportunities, including Service Delivery, White Label Solutions, Technology Integration, and our Reseller Program.",
};

export default function PartnersPage() {
  return <PartnersInfoContent />;

  // --- Previous implementation (commented out) ---
  // import PartnersPageContent from "@/components/partners/PartnersPageContent";
  // const PartnersPage = () => {
  //   return <PartnersPageContent />;
  // };
}
