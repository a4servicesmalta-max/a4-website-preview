import { notFound } from "next/navigation";
import { Metadata } from "next";
import "@/components/a4-landing/styles.css";
import "@/components/a4-site/site-pages.css";
import { ArticlePageContent } from "../components/ArticlePageContent";
import { getBlogBySlug, getBlogSlugs } from "@/utils/blog";

interface BlogPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getBlogSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${blog.title} | A4 Insights`,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: "article",
      publishedTime: blog.date,
      authors: [blog.author || "A4 Team"],
      tags: blog.tags || [],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
    },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  return <ArticlePageContent blog={blog} />;

  // --- Previous implementation (commented out) ---
  // import BlogTemplate from "@/components/blog/BlogTemplate";
  // const relatedBlogs = getRelatedBlogs(slug, 3);
  // return (
  //   <div className="min-h-screen">
  //     <BlogTemplate blog={blog} relatedBlogs={relatedBlogs} />
  //   </div>
  // );
}
