import HomePage from "@/components/HomePage/Homepage";
import { getAllBlogs } from "@/utils/blog";
import { A4ServicesApp } from "./a4-services/components/A4ServicesApp";
import "@/components/a4-landing/styles.css";

export default function Home() {
  const recentBlogs = getAllBlogs().slice(0, 3);

  return (
    <main className="min-h-dvh w-full a4-landing-page pt-24 sm:pt-28">
      {/* <HomePage recentBlogs={recentBlogs} /> */}
      <A4ServicesApp />
    </main>
  );
}
