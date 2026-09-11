export type FeedSource = {
  id: string;
  name: string;
  shortName: string;
  category: string;
  language: string;
  feed: string;
  site: string;
};

export const FALLBACK_SOURCES: FeedSource[] = [
  { id: "trt-haber", name: "TRT Haber", shortName: "TRT", category: "Haber", language: "tr", feed: "https://www.trthaber.com/manset_articles.rss", site: "https://www.trthaber.com" },
  { id: "haberturk", name: "Habertürk", shortName: "HT", category: "Haber", language: "tr", feed: "https://www.haberturk.com/rss", site: "https://www.haberturk.com" },
  { id: "sozcu", name: "Sözcü", shortName: "SÖ", category: "Haber", language: "tr", feed: "https://www.sozcu.com.tr/feeds-haberler", site: "https://www.sozcu.com.tr" },
  { id: "donanimhaber", name: "DonanımHaber", shortName: "DH", category: "Teknoloji", language: "tr", feed: "https://www.donanimhaber.com/rss/tum/", site: "https://www.donanimhaber.com" },
  { id: "webtekno", name: "Webtekno", shortName: "WT", category: "Teknoloji", language: "tr", feed: "https://www.webtekno.com/rss.xml", site: "https://www.webtekno.com" },
  { id: "webrazzi", name: "Webrazzi", shortName: "WZ", category: "Teknoloji", language: "tr", feed: "https://webrazzi.com/feed", site: "https://webrazzi.com" },
  { id: "bbc-world", name: "BBC World", shortName: "BBC", category: "Dünya", language: "en", feed: "https://feeds.bbci.co.uk/news/rss.xml", site: "https://www.bbc.com/news" },
  { id: "guardian", name: "The Guardian", shortName: "G", category: "Dünya", language: "en", feed: "https://www.theguardian.com/world/rss", site: "https://www.theguardian.com/world" }
];

export const OPML_URL = process.env.FEED_DIRECTORY_URL || "https://webisso.github.io/swipe-rss/feeds.opml";
