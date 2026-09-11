'use client';

import { useState, useEffect } from 'react';

// TÜRKİYE VE DÜNYADAN EN STABİL HIZLI RSS KANALLARI
const KAYNAKLAR = [
  { ad: "Anadolu Ajansı", url: "https://aa.com.tr", dil: "tr", logo: "🇹🇷" },
  { ad: "TRT Haber", url: "https://trthaber.com", dil: "tr", logo: "📺" },
  { ad: "NTV", url: "https://ntv.com.tr", dil: "tr", logo: "🔴" },
  { ad: "BBC World", url: "https://bbci.co.uk", dil: "en", logo: "🇬🇧" },
  { ad: "Reuters", url: "https://reutersagency.com", dil: "en", logo: "🌐" }
];

async function googleCevir(metin: string): Promise<string> {
  if (!metin) return "";
  try {
    const res = await fetch(`https://googleapis.com{encodeURIComponent(metin)}`);
    const data = await res.json();
    return data[0].map((item: any) => item[0]).join('');
  } catch (error) {
    return metin;
  }
}
export default function Home() {
  const [originalItems, setOriginalItems] = useState<any[]>([]);
  const [processedItems, setProcessedItems] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [seciliHaber, setSeciliHaber] = useState<any>(null);
  const [ceviriAktif, setCeviriAktif] = useState(true);
  const [aktifDil, setAktifDil] = useState('all');
  const [arama, setArama] = useState('');

  useEffect(() => {
    async function guvenliHaberCek() {
      let tumHaberler: any[] = [];
      // CORS engeline takılmamak için en güvenli açık proxy yapısı
      for (let k of KAYNAKLAR) {
        try {
          const res = await fetch(`https://allorigins.win{encodeURIComponent(k.url)}`);
          const json = await res.json();
          
          // XML verisini basitçe ayrıştırma
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(json.contents, "text/xml");
          const items = xmlDoc.getElementsByTagName("item");

          for (let i = 0; i < Math.min(items.length, 12); i++) {
            const title = items[i].getElementsByTagName("title")[0]?.textContent || "";
            const link = items[i].getElementsByTagName("link")[0]?.textContent || "";
            const desc = items[i].getElementsByTagName("description")[0]?.textContent || "";
            const pubDate = items[i].getElementsByTagName("pubDate")[0]?.textContent || "";
            
            // Görsel bulma optimizasyonu
            let img = 'https://unsplash.com';
            const enclosure = items[i].getElementsByTagName("enclosure")[0];
            if (enclosure && enclosure.getAttribute("type")?.includes("image")) {
              img = enclosure.getAttribute("url") || img;
            }

            if (title) {
              tumHaberler.push({
                id: link,
                title: title,
                originalTitle: title,
                description: desc.replace(/<[^>]*>/g, '').substring(0, 180),
                originalDescription: desc.replace(/<[^>]*>/g, '').substring(0, 180),
                link: link,
                sourceName: k.ad,
                logo: k.logo,
                language: k.dil,
                image: img,
                pubDate: pubDate
              });
            }
          }
        } catch (e) {
          console.error(k.ad + " bağlantı sınırı.");
        }
      }
      
      tumHaberler.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      setOriginalItems(tumHaberler);
      setProcessedItems(tumHaberler);
      setYukleniyor(false);
    }
    guvenliHaberCek();
  }, []);
  useEffect(() => {
    async function otomatikCevir() {
      if (originalItems.length === 0) return;
      if (ceviriAktif) {
        setYukleniyor(true);
        const list = await Promise.all(originalItems.map(async (item) => {
          if (item.language === 'en') {
            const t = await googleCevir(item.originalTitle);
            const d = await googleCevir(item.originalDescription);
            return { ...item, title: t, description: d, cevrildiMi: true };
          }
          return item;
        }));
        setProcessedItems(list);
        setYukleniyor(false);
      } else {
        setProcessedItems(originalItems.map(i => ({ ...i, title: i.originalTitle, description: i.originalDescription, cevrildiMi: false })));
      }
    }
    otomatikCevir();
  }, [ceviriAktif, originalItems]);

  const filtrele = processedItems.filter(i => {
    const dM = aktifDil === 'all' || i.language === aktifDil;
    const aM = !arama || i.title.toLowerCase().includes(arama.toLowerCase()) || i.sourceName.toLowerCase().includes(arama.toLowerCase());
    return dM && aM;
  });

  if (yukleniyor) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#0f172a', color: '#f8fafc' }}>
        <div style={{ width: '45px', height: '45px', border: '4px solid #334155', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <p style={{ fontSize: '15px', fontWeight: '600', letterSpacing: '0.02em', color: '#94a3b8' }}>Güvenli kanallardan haberler yükleniyor...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  return (
    <main style={{ backgroundColor: '#0f172a', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#f1f5f9', margin: 0, paddingBottom: '60px' }}>
      {/* PREMIUM HEADER */}
      <header style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
          <a href="/" style={{ fontSize: '20px', fontWeight: '900', color: '#fff', textDecoration: 'none', letterSpacing: '-0.02em' }}>MİLLİ<span style={{ color: '#3b82f6' }}>AKIŞ</span></a>
          
          <div style={{ flex: '1', maxWidth: '380px' }}>
            <input placeholder="Gündemde akıllı arama yapın..." onChange={(e) => setArama(e.target.value)} style={{ width: '100%', padding: '10px 18px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '14px', color: '#fff', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#1e293b', padding: '4px', borderRadius: '12px' }}>
            <button onClick={() => setCeviriAktif(true)} style={{ padding: '8px 14px', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', backgroundColor: ceviriAktif ? '#3b82f6' : 'transparent', color: '#fff' }}>✨ Türkçe Yap</button>
            <button onClick={() => setCeviriAktif(false)} style={{ padding: '8px 14px', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', backgroundColor: !ceviriAktif ? '#475569' : 'transparent', color: '#94a3b8' }}>📄 Orijinal Dil</button>
          </div>
        </div>
      </header>

      {/* LUXURY FILTER HERO */}
      <section style={{ maxWidth: '1200px', margin: '40px auto 30px', padding: '0 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#fff', margin: '0 0 12px', letterSpacing: '-0.03em' }}>Global Haber Akışı</h1>
        <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '500px', margin: '0 auto 25px' }}>Türkiye ve Dünya basınından anlık ve reklamsız veri takip konsolu.</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button onClick={() => setAktifDil('all')} style={{ padding: '8px 18px', borderRadius: '12px', border: '1px solid #334155', cursor: 'pointer', fontSize: '14px', fontWeight: '600', backgroundColor: aktifDil === 'all' ? '#3b82f6' : '#1e293b', color: '#fff' }}>Hepsi ({filtrele.length})</button>
          <button onClick={() => setAktifDil('tr')} style={{ padding: '8px 18px', borderRadius: '12px', border: '1px solid #334155', cursor: 'pointer', fontSize: '14px', fontWeight: '600', backgroundColor: aktifDil === 'tr' ? '#3b82f6' : '#1e293b', color: '#fff' }}>🇹🇷 Ulusal Basın</button>
          <button onClick={() => setAktifDil('en')} style={{ padding: '8px 18px', borderRadius: '12px', border: '1px solid #334155', cursor: 'pointer', fontSize: '14px', fontWeight: '600', backgroundColor: aktifDil === 'en' ? '#3b82f6' : '#1e293b', color: '#fff' }}>🌍 Dünya Manşetleri</button>
        </div>
      </section>

      {/* MODERN KARTLAR GRİD */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '28px' }}>
          {filtrele.map((item, index) => (
            <article key={index} onClick={() => setSeciliHaber(item)} style={{ backgroundColor: '#1e293b', borderRadius: '20px', border: '1px solid #334155', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'all 0.2s' }}>
              <img src={item.image} alt="" style={{ width: '100%', height: '200px', objectFit: 'cover' }} referrerPolicy="no-referrer" onError={(e:any)=>{e.target.src='https://unsplash.com'}} />
              <div style={{ padding: '22px', flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>{item.logo} {item.sourceName}</span>
                    {item.cevrildiMi && <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>✓ Türkçe Çeviri</span>}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 10px', lineHeight: '1.4', color: '#fff' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>{item.description || 'Haber özetini okumak için tıklayın.'}</p>
                </div>
                <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #334155', textAlign: 'right', fontSize: '13px', color: '#3b82f6', fontWeight: '700' }}>Gelişmeleri Oku →</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ULTRA SMART POPUP (MODAL) */}
      {seciliHaber && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', itemsCenter: 'center', zIndex: 100, padding: '20px' }} onClick={() => setSeciliHaber(null)}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '28px', maxWidth: '640px', width: '100%', maxHeight: '85vh', overflowY: 'auto', position: 'relative', margin: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'relative', width: '100%', height: '280px' }}>
              <img src={seciliHaber.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
              <button onClick={() => setSeciliHaber(null)} style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '30px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '4px 12px', borderRadius: '8px' }}>{seciliHaber.logo} {seciliHaber.sourceName}</span>
              <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '20px 0 12px', lineHeight: '1.4', color: '#fff' }}>{seciliHaber.title}</h2>
              <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.7', margin: '0 0 25px' }}>{seciliHaber.description}</p>
              <div style={{ borderTop: '1px solid #334155', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <a href={seciliHaber.link} target="_blank" rel="noreferrer" style={{ backgroundColor: '#3b82f6', color: '#fff', textDecoration: 'none', padding: '10px 22px', borderRadius: '14px', fontSize: '13px', fontWeight: '700' }}>Haber Kaynağına Git ↗</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
