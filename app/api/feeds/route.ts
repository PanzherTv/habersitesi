import { NextResponse } from "next/server";
import { getNews } from "@/lib/rss";

export const revalidate = 300;

export async function GET() {
  const data = await getNews();
  return NextResponse.json({ updatedAt: new Date().toISOString(), count: data.items.length, sourceCount: data.sourceCount, items: data.items });
}
