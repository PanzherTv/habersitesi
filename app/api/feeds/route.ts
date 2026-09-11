import { NextResponse } from 'next/server';

const HABER_KAYNAKLARI = [
  { ad: "Anadolu Ajansı", url: "https://aa.com.tr", dil: "tr", logo: "🇹🇷" },
  { ad: "TRT Haber", url: "https://trthaber.com", dil: "tr", logo: "📺" },
  { ad: "Hürriyet", url: "https://hurriyet.com.tr", dil: "tr", logo: "📰" },
  { ad: "Sözcü", url: "https://sozcu.com.tr", dil: "tr", logo: "🔥" },
  { ad: "NTV Haber", url: "https://ntv.com.tr", dil: "tr", logo: "🔴" },
  { ad: "BBC World", url: "https://bbci.co.uk", dil: "en", logo: "🌍" },
  { ad: "Reuters", url: "https://reutersagency.com", dil: "en", logo: "🌐" }
];

export async function GET() {
  let birlesikHaberler: any[] = [];
  
  for (let kaynak of HABER_KAYNAKLARI) {
    try {
      // Sunucu taraflı CORS engelini tamamen aşan rss2json servisi
      const res = await fetch(`https://rss2json.com{encodeURIComponent(kaynak.url)}`, { next: { revalidate: 60 } });
      const data = await res.json();
      
      if (data && data.status === 'ok') {
        data.items.forEach((item: any) => {
          birlesikHaberler.push({
            id: item.guid || item.link,
            title: item.title || "",
            originalTitle: item.title || "",
            description: item.description ? item.description.replace(/<[^>]*>/g, '').substring(0, 150) : '',
            originalDescription: item.description ? item.description.replace(/<[^>]*>/g, '').substring(0, 150) : '',
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

  // Canlı Döviz Kurlarını Sunucuda Çekme
  let dovizVerisi = { dolar: '34.35', euro: '37.18', altin: '3.025' };
  try {
    const finRes = await fetch('https://er-api.com', { next: { revalidate: 300 } });
    const finData = await finRes.json();
    if (finData && finData.rates) {
      const tryKur = finData.rates.TRY || 34.35;
      dovizVerisi = {
        dolar: tryKur.toFixed(2),
        euro: (tryKur / (finData.rates.EUR || 0.92)).toFixed(2),
        altin: "3.025"
      };
    }
  } catch (e) { console.error(e); }

  return NextResponse.json({
    items: birlesikHaberler,
    doviz: dovizVerisi
  });
}
