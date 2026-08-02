import { NextResponse } from "next/server";
import { fetchLinkedInFeedPosts } from "@/lib/linkedin-feed";

// Portal-managed posts (team.a4.com.mt) should appear without a redeploy —
// match the rest of the CMS bridge's 2-minute window instead of the old
// hour-long cache that only suited the RSS-feed fallback path.
export const revalidate = 120;

export async function GET() {
  const { posts, source } = await fetchLinkedInFeedPosts();
  return NextResponse.json({ posts, source });
}
