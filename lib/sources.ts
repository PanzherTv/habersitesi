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
  { id: "trt-haber", name: "TRT Haber", shortName: "TRT", category: "Haber", language: "tr", feed: "https://www.trthaber.com/sondakika.rss", site: "https://www.trthaber.com" },
  { id: "aa", name: "Anadolu Ajansı", shortName: "AA", category: "Haber", language: "tr", feed: "https://www.aa.com.tr/tr/rss/default?cat=guncel", site: "https://www.aa.com.tr" },
  { id: "ntv", name: "NTV", shortName: "NTV", category: "Haber", language: "tr", feed: "https://www.ntv.com.tr/rss", site: "https://www.ntv.com.tr" },
  { id: "hurriyet", name: "Hürriyet", shortName: "HÜR", category: "Haber", language: "tr", feed: "https://www.hurriyet.com.tr/rss/anasayfa", site: "https://www.hurriyet.com.tr" },
  { id: "sozcu", name: "Sözcü", shortName: "SÖZ", category: "Haber", language: "tr", feed: "https://www.sozcu.com.tr/feed/", site: "https://www.sozcu.com.tr" },
  { id: "haberturk", name: "Habertürk", shortName: "HT", category: "Haber", language: "tr", feed: "https://www.haberturk.com/rss", site: "https://www.haberturk.com" },
  { id: "cumhuriyet", name: "Cumhuriyet", shortName: "CUM", category: "Haber", language: "tr", feed: "https://www.cumhuriyet.com.tr/rss/son_dakika.xml", site: "https://www.cumhuriyet.com.tr" },
  { id: "dunya", name: "Dünya Gazetesi", shortName: "DÜN", category: "Ekonomi", language: "tr", feed: "https://www.dunya.com/service/rss", site: "https://www.dunya.com" },
  { id: "donanimhaber", name: "DonanımHaber", shortName: "DH", category: "Teknoloji", language: "tr", feed: "https://www.donanimhaber.com/rss/tum/", site: "https://www.donanimhaber.com" },
  { id: "webtekno", name: "Webtekno", shortName: "WT", category: "Teknoloji", language: "tr", feed: "https://www.webtekno.com/rss.xml", site: "https://www.webtekno.com" },
  { id: "webrazzi", name: "Webrazzi", shortName: "WZ", category: "Teknoloji", language: "tr", feed: "https://webrazzi.com/feed", site: "https://webrazzi.com" },
  { id: "bbc-tr", name: "BBC Türkçe", shortName: "BBC", category: "Dünya", language: "tr", feed: "https://feeds.bbci.co.uk/turkce/rss.xml", site: "https://www.bbc.com/turkce" },
  { id: "bbc-world", name: "BBC World", shortName: "BBC", category: "Dünya", language: "en", feed: "https://feeds.bbci.co.uk/news/rss.xml", site: "https://www.bbc.com/news" },
  { id: "guardian", name: "The Guardian", shortName: "GUA", category: "Dünya", language: "en", feed: "https://www.theguardian.com/world/rss", site: "https://www.theguardian.com/world" },
  { id: "dw", name: "Deutsche Welle", shortName: "DW", category: "Dünya", language: "en", feed: "https://rss.dw.com/rdf/rss-en-all", site: "https://www.dw.com" },
  { id: "france24", name: "France 24", shortName: "F24", category: "Dünya", language: "en", feed: "https://www.france24.com/en/rss", site: "https://www.france24.com" }
];

// Primary directory: multilingual, with Turkish + English feeds.
// Secondary directory: larger international collection by language/topic/region.
export const FEED_DIRECTORY_URLS = [
  process.env.FEED_DIRECTORY_URL || "https://webisso.github.io/swipe-rss/feeds.opml",
  process.env.GLOBAL_FEED_DIRECTORY_URL || "https://raw.githubusercontent.com/ajdelaguila/opml-news-feeds/main/dist/all-news-feeds.opml.xml"
];
