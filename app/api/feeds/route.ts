import { NextResponse } from 'next/server';

const HABER_KAYNAKLARI = [
  { ad: "Anadolu Ajansı", url: "https://aa.com.tr", dil: "tr", logo: "🇹🇷" },
  { ad: "TRT Haber", url: "https://trthaber.com", dil: "tr", logo: "📺" },
  { ad: "Hürriyet", url: "https://hurriyet.com.tr", dil: "tr", logo: "📰" },
  { ad: "Sözcü", url: "https://sozcu.com.tr", dil: "tr", logo: "🔥" },
  { ad: "NTV Haber", url: "https://ntv.com.tr", dil: "tr", logo: "🔴" },
  { ad: "Halk TV", url: "https://halktv.com.tr", dil: "tr", logo: "📣" },
  { ad: "BBC World", url: "http://bbci.co.uk", dil: "en", logo: "🌍" },
  { ad: "Reuters", url: "https://reutersagency.com", dil: "en", logo: "🌐" }
];

export async function GET() {
  let birlesikHaberler: any[] = [];
  
  for (let kaynak of HABER_KAYNAKLARI) {
    try {
      const res = await fetch(`https://rss2json.com{encodeURIComponent(kaynak.url)}`, { next: { revalidate: 60 } });
      const data = await res.json();
      
      if (data && data.status === 'ok') {
        data.items.forEach((item: any) => {
          birlesikHaberler.push({
            id: item.guid || item.link,
            title: item.title || "",
            originalTitle: item.title || "",
            description: item.description ? item.description.replace(/<[^>]*>/g, '').substring(0, 160) : '',
            originalDescription: item.description ? item.description.replace(/<[^>]*>/g, '').substring(0, 160) : '',
            link: item.link,
            sourceName: kaynak.ad,
            logo: kaynak.logo,
            language: kaynak.dil,
            image: item.enclosure?.link || item.thumbnail || 'https://unsplash.com',
            pubDate: item.pubDate || new Date().toISOString()
          });
        });
      }
    } catch (e) {
      console.error(kaynak.ad + " sunucuda çekilemedi.");
    }
  }

  birlesikHaberler.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return NextResponse.json({ items: birlesikHaberler });
}
