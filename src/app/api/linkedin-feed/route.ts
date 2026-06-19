import { NextResponse } from "next/server";
import { fetchLinkedInFeedPosts } from "@/lib/linkedin-feed";

export const revalidate = 3600;

export async function GET() {
  const { posts, source } = await fetchLinkedInFeedPosts();
  return NextResponse.json({ posts, source });
}
