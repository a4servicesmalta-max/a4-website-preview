import { LINKEDIN_COMPANY_URL } from "@/lib/contact";
import { fetchLinkedInShowcasePosts } from "@/lib/cms";

export type LinkedInFeedPost = {
  id: string;
  title: string;
  blurb: string;
  url: string;
  thumbnail?: string;
  embed?: string;
  publishedAt?: string;
};

/** Manual fallback when no feed provider is configured. Paste embed `src` from LinkedIn → Embed this post. */
export const MANUAL_LINKEDIN_POSTS: LinkedInFeedPost[] = [
  {
    id: "activity-7478409614972108800",
    title: "Financial vs management accounts — what's the difference?",
    blurb:
      "Financial accounts look at the past — taxes and legal requirements. Management accounts give you the real-time numbers to run the business day to day.",
    url: "https://www.linkedin.com/feed/update/urn:li:activity:7478409614972108800",
    thumbnail: "/assets/linkedin/management-vs-financial-square.jpg",
  },
  {
    id: "ugcPost-7465064097143816192",
    title: "Profitable but out of cash? Why cash flow matters",
    blurb:
      "A business can be profitable on paper and still struggle to pay its bills — here's why cash flow is what really keeps you running.",
    url: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7465064097143816192",
    thumbnail: "/assets/linkedin/profitable-but-out-of-cash-square.jpg",
  },
  {
    id: "ugcPost-7466131337012326400",
    title: "Why missing invoices create bigger problems later",
    blurb:
      "Missing invoices rarely seem important — until VAT is due or an audit starts. Good document habits today save big headaches tomorrow.",
    url: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7466131337012326400",
    thumbnail: "/assets/linkedin/missing-invoices-square.jpg",
  },
];

function pickString(...values: unknown[]): string | undefined {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

function normalizeItem(raw: Record<string, unknown>, index: number): LinkedInFeedPost | null {
  const title =
    pickString(raw.title, raw.name, (raw.content as Record<string, unknown>)?.title) ?? "A4 Services on LinkedIn";
  const url =
    pickString(raw.url, raw.link, raw.permalink, raw.guid) ?? LINKEDIN_COMPANY_URL;
  const thumbnail = pickString(
    raw.thumbnail,
    raw.image,
    raw.imageUrl,
    typeof raw.enclosure === "object" && raw.enclosure !== null
      ? (raw.enclosure as { url?: string }).url
      : undefined,
    typeof raw.media === "object" && raw.media !== null
      ? pickString((raw.media as { thumbnail?: string }).thumbnail, (raw.media as { url?: string }).url)
      : undefined,
  );
  const blurb =
    pickString(raw.description, raw.summary, raw.contentSnippet, raw.content) ??
    "Watch the latest from A4 Services on LinkedIn.";
  const embed = pickString(raw.embed, raw.embedUrl);
  const publishedAt = pickString(raw.date, raw.pubDate, raw.publishedAt, raw.created_at);

  return {
    id: pickString(raw.id, raw.guid, url) ?? `feed-${index}`,
    title: title.slice(0, 140),
    blurb: blurb.replace(/<[^>]+>/g, "").slice(0, 220),
    url,
    thumbnail,
    embed,
    publishedAt,
  };
}

function parseJsonFeed(data: unknown): LinkedInFeedPost[] {
  if (!data || typeof data !== "object") return [];

  const root = data as Record<string, unknown>;
  const items = Array.isArray(root.items)
    ? root.items
    : Array.isArray(root.posts)
      ? root.posts
      : Array.isArray(root.entries)
        ? root.entries
        : Array.isArray(root.data)
          ? root.data
          : [];

  return items
    .map((item, i) => normalizeItem(item as Record<string, unknown>, i))
    .filter((p): p is LinkedInFeedPost => Boolean(p))
    .slice(0, 6);
}

function parseRssXml(xml: string): LinkedInFeedPost[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
  return items
    .map((match, i) => {
      const block = match[1];
      const get = (tag: string) => block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1]?.trim();
      const enclosure = block.match(/url="([^"]+)"/i)?.[1];
      const media = block.match(/<media:content[^>]+url="([^"]+)"/i)?.[1];
      return normalizeItem(
        {
          title: get("title"),
          link: get("link"),
          description: get("description"),
          pubDate: get("pubDate"),
          thumbnail: enclosure ?? media,
        },
        i,
      );
    })
    .filter((p): p is LinkedInFeedPost => Boolean(p))
    .slice(0, 6);
}

export async function fetchLinkedInFeedPosts(): Promise<{
  posts: LinkedInFeedPost[];
  source: "portal" | "feed" | "manual";
}> {
  // Portal-managed showcase posts (team.a4.com.mt -> Website -> LinkedIn) take
  // priority — editable without a redeploy. Falls through on empty/error.
  const portalPosts = await fetchLinkedInShowcasePosts().catch(() => []);
  if (portalPosts.length > 0) {
    return {
      posts: portalPosts.map((p) => ({
        id: p.id, title: p.title, blurb: p.blurb, url: p.url,
        thumbnail: p.thumbnail ?? undefined, embed: p.embed ?? undefined,
      })),
      source: "portal",
    };
  }

  const feedUrl = process.env.LINKEDIN_FEED_URL?.trim();

  if (!feedUrl) {
    return { posts: MANUAL_LINKEDIN_POSTS, source: "manual" };
  }

  try {
    const res = await fetch(feedUrl, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json, application/rss+xml, text/xml, */*" },
    });

    if (!res.ok) throw new Error(`Feed HTTP ${res.status}`);

    const contentType = res.headers.get("content-type") ?? "";
    const body = await res.text();

    const posts = contentType.includes("json")
      ? parseJsonFeed(JSON.parse(body))
      : parseRssXml(body);

    if (posts.length === 0) {
      return { posts: MANUAL_LINKEDIN_POSTS, source: "manual" };
    }

    return { posts, source: "feed" };
  } catch (error) {
    console.error("LinkedIn feed fetch failed:", error);
    return { posts: MANUAL_LINKEDIN_POSTS, source: "manual" };
  }
}
