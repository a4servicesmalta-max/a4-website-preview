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
    alternates: { canonical: `/insights/${slug}` },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: "article",
      publishedTime: blog.date,
      authors: [blog.author || "A4 Team"],
      tags: blog.tags || [],
      images: blog.featuredImage ? [blog.featuredImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      images: blog.featuredImage ? [blog.featuredImage] : undefined,
    },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blog = getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.title,
      description: blog.excerpt,
      datePublished: blog.date,
      author: { "@type": "Organization", name: blog.author || "A4 Services" },
      ...(blog.featuredImage ? { image: blog.featuredImage } : {}),
      keywords: (blog.tags || []).join(", "),
    },
  ];

  if (blog.faq?.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: blog.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  jsonLd.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "/" },
      { "@type": "ListItem", position: 2, name: "Insights", item: "/insights" },
      { "@type": "ListItem", position: 3, name: blog.title, item: `/insights/${slug}` },
    ],
  });

  return (
    <>
      {jsonLd.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
        />
      ))}
      <ArticlePageContent blog={blog} />
    </>
  );

  // --- Previous implementation (commented out) ---
  // import BlogTemplate from "@/components/blog/BlogTemplate";
  // const relatedBlogs = getRelatedBlogs(slug, 3);
  // return (
  //   <div className="min-h-screen">
  //     <BlogTemplate blog={blog} relatedBlogs={relatedBlogs} />
  //   </div>
  // );
}
