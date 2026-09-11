'use client';

import { useState, useEffect } from 'react';

// TÜRKİYE VE DÜNYADAN TÜM HABER KAYNAKLARI DOĞRUDAN BURADA
const HABER_KAYNAKLARI = [
  { ad: "Anadolu Ajansı", url: "https://rss2json.com", dil: "tr", kat: "Gündem" },
  { ad: "TRT Haber", url: "https://rss2json.com", dil: "tr", kat: "Gündem" },
  { ad: "Hürriyet", url: "https://rss2json.com", dil: "tr", kat: "Gündem" },
  { ad: "Sözcü", url: "https://rss2json.com", dil: "tr", kat: "Son Dakika" },
  { ad: "NTV Haber", url: "https://rss2json.com", dil: "tr", kat: "Gündem" },
  { ad: "BBC World", url: "https://rss2json.com", dil: "en", kat: "Dünya" },
  { ad: "Reuters", url: "https://rss2json.com", dil: "en", kat: "Dünya" }
];

async function googleCevir(metin: string): Promise<string> {
  if (!metin) return "";
  try {
    const res = await fetch(`https://googleapis.com{encodeURIComponent(metin)}`);
    const data = await res.json();
    return data.map((item: any) => item).join('');
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
  const [aktifDilFiltresi, setAktifDilFiltresi] = useState('all');
  const [aramaMetni, setAramaMetni] = useState('');

  useEffect(() => {
    async function tumHaberleriCek() {
      let birlesikHaberler: any[] = [];
      for (let kaynak of HABER_KAYNAKLARI) {
        try {
          const res = await fetch(kaynak.url);
          const data = await res.json();
          if (data.status === 'ok') {
            data.items.forEach((item: any) => {
              birlesikHaberler.push({
                id: item.guid || item.link,
                title: item.title || "",
                originalTitle: item.title || "",
                description: item.description ? item.description.replace(/<[^>]*>/g, '') : '',
                originalDescription: item.description ? item.description.replace(/<[^>]*>/g, '') : '',
                link: item.link,
                sourceName: kaynak.ad,
                language: kaynak.dil,
                category: kaynak.kat,
                image: item.enclosure?.link || item.thumbnail || 'https://unsplash.com',
                pubDate: item.pubDate
              });
            });
          }
        } catch (e) { console.error(e); }
      }
      birlesikHaberler.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      setOriginalItems(birlesikHaberler);
      setProcessedItems(birlesikHaberler);
      setYukleniyor(false);
    }
    tumHaberleriCek();
  }, []);
  useEffect(() => {
    async function ceviriUygula() {
      if (originalItems.length === 0) return;
      if (ceviriAktif) {
        setYukleniyor(true);
        const yeniList = await Promise.all(originalItems.map(async (item) => {
          if (item.language === 'en') {
            const yeniBaslik = await googleCevir(item.originalTitle);
            const yeniOzet = await googleCevir(item.originalDescription);
            return { ...item, title: yeniBaslik, description: yeniOzet, cevrildiMi: true };
          }
          return item;
        }));
        setProcessedItems(yeniList);
        setYukleniyor(false);
      } else {
        const orijinalList = originalItems.map(item => ({ ...item, title: item.originalTitle, description: item.originalDescription, cevrildiMi: false }));
        setProcessedItems(orijinalList);
      }
    }
    ceviriUygula();
  }, [ceviriAktif, originalItems]);

  if (yukleniyor) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>Haber akışı ve canlı çeviriler hazırlanıyor...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const filtrelenmisHaberler = processedItems.filter(item => {
    const dE = aktifDilFiltresi === 'all' || (aktifDilFiltresi === 'tr' ? item.language === 'tr' : item.language === 'en');
    const aE = !aramaMetni || item.title.toLowerCase().includes(aramaMetni.toLowerCase()) || item.sourceName.toLowerCase().includes(aramaMetni.toLowerCase());
    return dE && aE;
  });

  return (
    <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#0f172a', margin: 0, paddingBottom: '50px' }}>
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
          <a href="/" style={{ fontSize: '22px', fontWeight: '800', color: '#1e3a8a', textDecoration: 'none' }}>AKIŞ<span style={{ color: '#2563eb' }}>.</span></a>
          <div style={{ flex: '1', maxWidth: '350px' }}>
            <input placeholder="Haberlerde veya kaynaklarda ara..." onChange={(e) => setAramaMetni(e.target.value)} style={{ width: '100%', padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            <button onClick={() => setCeviriAktif(true)} style={{ padding: '6px 12px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', backgroundColor: ceviriAktif ? '#2563eb' : 'transparent', color: ceviriAktif ? '#fff' : '#475569' }}>✨ Türkçe Çevir</button>
            <button onClick={() => setCeviriAktif(false)} style={{ padding: '6px 12px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', backgroundColor: !ceviriAktif ? '#475569' : 'transparent', color: !ceviriAktif ? '#fff' : '#475569' }}>📄 Orijinal Dil</button>
          </div>
        </div>
      </header>

      <section style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 10px' }}>Dünya ve Türkiye Gündemi <span style={{ color: '#2563eb' }}>Tek Akışta</span></h1>
        <p style={{ color: '#64748b', fontSize: '15px', margin: '0 0 20px' }}>Reklamsız, sade ve anlık haber takip radarı.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <button onClick={() => setAktifDilFiltresi('all')} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: aktifDilFiltresi === 'all' ? '#1e293b' : '#fff', color: aktifDilFiltresi === 'all' ? '#fff' : '#475569' }}>Tümü ({filtrelenmisHaberler.length})</button>
          <button onClick={() => setAktifDilFiltresi('tr')} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: aktifDilFiltresi === 'tr' ? '#1e293b' : '#fff', color: aktifDilFiltresi === 'tr' ? '#fff' : '#475569' }}>🇹🇷 Türkiye Basını</button>
          <button onClick={() => setAktifDilFiltresi('en')} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: aktifDilFiltresi === 'en' ? '#1e293b' : '#fff', color: aktifDilFiltresi === 'en' ? '#fff' : '#475569' }}>🌍 Dünya Basını</button>
        </div>
      </section>
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filtrelenmisHaberler.slice(0, 60).map((item: any, index: number) => (
            <article key={index} onClick={() => setSeciliHaber(item)} style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)' }}>
              <img src={item.image} alt="" style={{ width: '100%', height: '180px', objectFit: 'cover' }} referrerPolicy="no-referrer" onError={(e:any)=>{e.target.src='https://unsplash.com'}} />
              <div style={{ padding: '20px', flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>{item.sourceName}</span>
                    {item.cevrildiMi && <span style={{ fontSize: '11px', color: '#16a34a', backgroundColor: '#f0fdf4', padding: '2px 6px', borderRadius: '6px' }}>🇹🇷 Çeviri</span>}
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 10px', lineHeight: '1.4', color: '#1e293b' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: 0 }}>{item.description ? item.description.slice(0, 100) + '...' : 'Detaylar için tıklayın.'}</p>
                </div>
                <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', textAlign: 'right', fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>Detayları Oku →</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {seciliHaber && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '20px' }} onClick={() => setSeciliHaber(null)}>
          <div style={{ backgroundColor: '#fff', borderRadius: '24px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'relative', width: '100%', height: '250px' }}>
              <img src={seciliHaber.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" onError={(e:any)=>{e.target.src='https://unsplash.com'}} />
              <button onClick={() => setSeciliHaber(null)} style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: '#fff', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '25px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '8px' }}>{seciliHaber.sourceName}</span>
              <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '15px 0 10px', lineHeight: '1.4' }}>{seciliHaber.title}</h2>
              <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6', margin: '0 0 20px' }}>{seciliHaber.description || "Bu haber için detaylı özet metni bulunmuyor."}</p>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                <a href={seciliHaber.link} target="_blank" rel="noreferrer" style={{ backgroundColor: '#2563eb', color: '#fff', textDecoration: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600' }}>Haber Kaynağına Git ↗</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
