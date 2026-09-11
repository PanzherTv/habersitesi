// BURAK SAKINOL'UN PROJESİNDEKİ ORİJİNAL EN KARARLI HABER TOPLAMA MOTORU
export async function getNews() {
  const sources = [
    { name: "Anadolu Ajansı", url: "https://aa.com.tr", lang: "tr", cat: "Gündem", logo: "🇹🇷" },
    { name: "TRT Haber", url: "https://trthaber.com", lang: "tr", cat: "Gündem", logo: "📺" },
    { name: "Hürriyet", url: "https://hurriyet.com.tr", lang: "tr", cat: "Gündem", logo: "📰" },
    { name: "Sözcü", url: "https://sozcu.com.tr", lang: "tr", cat: "Son Dakika", logo: "🔥" },
    { name: "NTV Haber", url: "https://ntv.com.tr", lang: "tr", cat: "Gündem", logo: "🔴" },
    { name: "Halk TV", url: "https://halktv.com.tr", lang: "tr", cat: "Gündem", logo: "📣" },
    { name: "BBC World", url: "https://bbci.co.uk", lang: "en", cat: "Dünya", logo: "🌍" }
  ];

  let allItems: any[] = [];

  for (const source of sources) {
    try {
      // CORS engellerini tamamen yıkan resmi küresel RSS dağıtım köprüsü
      const res = await fetch(`https://rss2json.com{encodeURIComponent(source.url)}&api_key=oy4g3shz9rvewqqpzz9vscoxdldn66wylw3x5y1v`);
      const data = await res.json();
      
      if (data && data.status === 'ok') {
        data.items.forEach((item: any) => {
          allItems.push({
            id: item.guid || item.link,
            title: item.title || "",
            originalTitle: item.title || "",
            description: item.description ? item.description.replace(/<[^>]*>/g, '').substring(0, 150) : "",
            originalDescription: item.description ? item.description.replace(/<[^>]*>/g, '').substring(0, 150) : "",
            link: item.link,
            sourceName: source.name,
            logo: source.logo,
            language: source.lang,
            category: source.cat,
            image: item.enclosure?.link || item.thumbnail || 'https://unsplash.com',
            pubDate: item.pubDate || new Date().toISOString()
          });
        });
      }
    } catch (e) {
      console.error(`${source.name} sunucuda çekilemedi.`);
    }
  }

  // Haberleri tarihe göre yeniden eskiye sırala
  allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return {
    items: allItems,
    sourceCount: sources.length
  };
}
