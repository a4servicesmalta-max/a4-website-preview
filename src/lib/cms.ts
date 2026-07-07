/**
 * Website CMS bridge — reads portal-published content from Supabase over plain
 * PostgREST fetch (no SDK dependency). The A4 internal portal (team.a4.com.mt)
 * writes blog posts + site overrides; this site reads them with the anon key.
 * RLS exposes ONLY published posts and site_overrides to the anon role.
 *
 * Honest-degrade: if the env vars are missing or the fetch fails, every helper
 * returns empty/null and the site renders exactly as it does today.
 */

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export interface DbBlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content_md: string;
  featured_image: string | null;
  category: string | null;
  tags: string[];
  author: string;
  key_takeaways: string[];
  faq: { q: string; a: string }[];
  published_at: string | null;
}

async function rest<T>(pathAndQuery: string): Promise<T | null> {
  if (!URL_BASE || !ANON_KEY) return null;
  try {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathAndQuery}`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchPublishedPosts(): Promise<DbBlogPost[]> {
  const rows = await rest<DbBlogPost[]>(
    "blog_posts?status=eq.published&order=published_at.desc&select=slug,title,excerpt,content_md,featured_image,category,tags,author,key_takeaways,faq,published_at"
  );
  return rows ?? [];
}

export async function fetchPublishedPostBySlug(slug: string): Promise<DbBlogPost | null> {
  const rows = await rest<DbBlogPost[]>(
    `blog_posts?status=eq.published&slug=eq.${encodeURIComponent(slug)}&limit=1&select=slug,title,excerpt,content_md,featured_image,category,tags,author,key_takeaways,faq,published_at`
  );
  return rows?.[0] ?? null;
}

/** Generic site override (portal Site Editor). Returns null when unset. */
export async function fetchSiteOverride<T>(key: string): Promise<T | null> {
  const rows = await rest<{ value: T }[]>(
    `site_overrides?key=eq.${encodeURIComponent(key)}&limit=1&select=value`
  );
  return rows?.[0]?.value ?? null;
}

/** Homepage section config shape written by the portal Site Editor. */
export interface SectionConfig {
  id: string;
  visible: boolean;
}

export interface DbLinkedInPost {
  id: string;
  title: string;
  blurb: string;
  url: string;
  thumbnail: string | null;
  embed: string | null;
}

/** Portal-managed LinkedIn showcase posts (team.a4.com.mt -> Website -> LinkedIn). */
export async function fetchLinkedInShowcasePosts(): Promise<DbLinkedInPost[]> {
  const rows = await rest<DbLinkedInPost[]>(
    "linkedin_posts?order=sort.asc&select=id,title,blurb,url,thumbnail,embed"
  );
  return rows ?? [];
}
