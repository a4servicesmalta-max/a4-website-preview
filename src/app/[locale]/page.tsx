import HomePage from "@/components/HomePage/Homepage";
import { getAllBlogs } from "@/utils/blog";
import { A4ServicesApp } from "./a4-services/components/A4ServicesApp";

export default function Home() {
  const recentBlogs = getAllBlogs().slice(0, 3);

  return (
    <main className="min-h-dvh w-full bg-[#050505] ">
      {/* <HomePage recentBlogs={recentBlogs} /> */}
      <A4ServicesApp />
    </main>
  );
}
