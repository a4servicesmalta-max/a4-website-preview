import type { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { getAllBlogs } from "@/utils/blog";
import { InsightsContent } from "./components/InsightsContent";

export const metadata: Metadata = {
  title: "Insights | A4 - Accounting, Audit & Compliance",
  description:
    "Explore our latest insights on audit requirements, compliance, and business growth. Expert tips and updates from the A4 team.",
  openGraph: {
    title: "Insights | A4 - Accounting, Audit & Compliance",
    description: "Explore our latest insights on audit requirements, compliance, and business growth.",
    type: "website",
  },
};

export default function InsightsPage() {
  const blogs = getAllBlogs();
  return <InsightsContent blogs={blogs} />;

  // --- Previous implementation (commented out) ---
  // import BlogListing from '@/components/blog/BlogListing';
  // export default function InsightsPage() {
  //   const blogs = getAllBlogs();
  //   return (
  //     <div className="min-h-screen">
  //       <BlogListing blogs={blogs} />
  //     </div>
  //   );
  // }
}
