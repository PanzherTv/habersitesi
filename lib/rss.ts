import Parser from "rss-parser";
import { FALLBACK_SOURCES, FEED_DIRECTORY_URLS, type FeedSource } from "./sources";

export type NewsItem = {
  id: string; title: string; link: string; description: string; pubDate: string;
  timestamp: number; sourceId: string; sourceName: string; sourceShortName: string;
  category: string; language: string; image?: string;
};

type MediaItem = { $?: { url?: string }; url?: string };
type CustomItem = {
  "media:content"?: MediaItem; "media:thumbnail"?: MediaItem;
  enclosure?: { url?: string }; "content:encoded"?: string;
};

const parser = new Parser<unknown, CustomItem>({
  timeout: 8000,
  headers: { "User-Agent": "AkisNews/1.0 (+RSS reader)" },
  customFields: { item: ["media:content", "media:thumbnail", "content:encoded", "enclosure"] }
});

function stripHtml(value = "") {
  return value.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&")
    .replace(/&#39;/gi, "'").replace(/&quot;/gi, '"').replace(/\s+/g, " ").trim();
}
function getImage(item: CustomItem) {
  const media = item["media:content"], thumb = item["media:thumbnail"];
  return media?.$?.url || media?.url || thumb?.$?.url || thumb?.url || item.enclosure?.url;
}
function safeDate(value?: string) { const time = value ? Date.parse(value) : NaN; return Number.isFinite(time) ? time : 0; }
function slug(value: string) {
  return value.toLocaleLowerCase("tr-TR").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "feed";
}
function categoryName(raw: string) {
  const value = raw.replace(/^baseFeed\./, "");
  const map: Record<string, string> = {
    news: "Haber", technology: "Teknoloji", science: "Bilim", economy: "Ekonomi", sports: "Spor",
    entertainment: "Eğlence", cultureArt: "Kültür", defense: "Savunma", health: "Sağlık",
    politics: "Politika", world: "Dünya", business: "İş Dünyası", "World News": "Dünya"
  };
  return map[value] || value || "Genel";
}

function parseOpml(xml: string): FeedSource[] {
  const result: FeedSource[] = [];
  let language = "en", category = "Genel";
  for (const line of xml.split(/\r?\n/)) {
    const lang = line.match(/<outline\s+language=["']([^"']+)["']/i);
    if (lang) language = lang[1].toLowerCase();

    const parent = line.match(/<outline\s+text=["']([^"']+)["'][^>]*>\s*$/i);
    if (parent && !/type=["']rss["']/i.test(line)) category = categoryName(parent[1]);

    const feed = line.match(/<outline[^>]*type=["']rss["'][^>]*?(?:text|title)=["']([^"']+)["'][^>]*?xmlUrl=["']([^"']+)["'][^>]*\/?>(?:<\/outline>)?/i)
      || line.match(/<outline[^>]*type=["']rss["'][^>]*?xmlUrl=["']([^"']+)["'][^>]*?(?:text|title)=["']([^"']+)["'][^>]*\/?>(?:<\/outline>)?/i);
    if (!feed) continue;

    const first = feed[1], second = feed[2];
    const url = /^https?:\/\//i.test(first) ? first : second;
    const name = /^https?:\/\//i.test(first) ? second : first;
    if (!url || !/^https?:\/\//i.test(url)) continue;

    try {
      result.push({
        id: `${language}-${slug(name)}-${slug(url)}`,
        name: name.trim(), shortName: name.trim().slice(0, 4).toUpperCase(),
        category, language, feed: url.trim(), site: new URL(url.trim()).origin
      });
    } catch {}
  }
  return result;
}

async function loadDirectory(): Promise<FeedSource[]> {
  const all: FeedSource[] = [];
  for (const directoryUrl of FEED_DIRECTORY_URLS) {
    try {
      const response = await fetch(directoryUrl, {
        next: { revalidate: 3600 }, headers: { "User-Agent": "AkisNews/1.0" }, signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) continue;
      all.push(...parseOpml(await response.text()));
    } catch {}
  }

  const unique = new Map<string, FeedSource>();
  for (const source of [...FALLBACK_SOURCES, ...all]) {
    const key = source.feed.toLowerCase();
    if (!unique.has(key)) unique.set(key, source);
  }
  return [...unique.values()];
}

async function fetchSource(source: FeedSource): Promise<NewsItem[]> {
  const response = await fetch(source.feed, {
    headers: { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*", "User-Agent": "AkisNews/1.0 (+RSS reader)" },
    next: { revalidate: 300 }, signal: AbortSignal.timeout(9000)
  });
  if (!response.ok) throw new Error(`${source.name}: HTTP ${response.status}`);
  const feed = await parser.parseString(await response.text());
  return feed.items.slice(0, 12).map((item, index) => {
    const title = stripHtml(item.title || "Başlıksız haber"), link = item.link || source.site, timestamp = safeDate(item.pubDate || item.isoDate);
    return {
      id: `${source.id}-${timestamp || index}-${encodeURIComponent(link)}`,
      title, link,
      description: stripHtml(item.contentSnippet || item.content || item["content:encoded"] || ""),
      pubDate: item.pubDate || item.isoDate || "", timestamp,
      sourceId: source.id, sourceName: source.name, sourceShortName: source.shortName,
      category: source.category, language: source.language, image: getImage(item)
    };
  });
}

async function mapWithConcurrency<T, R>(items: T[], worker: (item: T) => Promise<R>, concurrency = 12) {
  const results: R[] = []; let index = 0;
  async function runner() {
    while (true) {
      const current = index++;
      if (current >= items.length) return;
      try { results[current] = await worker(items[current]); } catch {}
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, runner));
  return results.filter(Boolean);
}

export async function getNews() {
  const sources = await loadDirectory();
  const groups = await mapWithConcurrency(sources, fetchSource, 12);
  const items = groups.flat(), seen = new Set<string>();
  const deduped = items.filter((item) => {
    const normalizedTitle = item.title.toLocaleLowerCase("tr-TR").replace(/\W+/g, " ").trim();
    const key = item.link || `${item.sourceId}:${normalizedTitle}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
  deduped.sort((a, b) => b.timestamp - a.timestamp);
  return { items: deduped, sourceCount: sources.length };
}
