'use client';

import { useState, useEffect } from 'react';

// TÜRKİYE VE DÜNYADAN EN STABİL HIZLI JAVASCRIPT DOSTU RSS AKIŞLARI
const HABER_KAYNAKLARI = [
  { ad: "Anadolu Ajansı", url: "https://rss2json.com", dil: "tr" },
  { ad: "TRT Haber", url: "https://rss2json.com", dil: "tr" },
  { ad: "Hürriyet", url: "https://rss2json.com", dil: "tr" },
  { ad: "Sözcü", url: "https://rss2json.com", dil: "tr" },
  { ad: "NTV Haber", url: "https://rss2json.com", dil: "tr" },
  { ad: "BBC World", url: "https://rss2json.com", dil: "en" },
  { ad: "Reuters", url: "https://rss2json.com", dil: "en" }
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
    async function saniyedeHaberCek() {
      let birlesikHaberler: any[] = [];
      for (let kaynak of HABER_KAYNAKLARI) {
        try {
          const res = await fetch(kaynak.url);
          const data = await res.json();
          if (data && data.status === 'ok') {
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
    saniyedeHaberCek();
  }, []);
  useEffect(() => {
    async function ceviriModunuUygula() {
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
        setProcessedItems(originalItems.map(item => ({ ...item, title: item.originalTitle, description: item.originalDescription, cevrildiMi: false })));
      }
    }
    ceviriModunuUygula();
  }, [ceviriAktif, originalItems]);

  const filtrelenmisHaberler = processedItems.filter(item => {
    const dE = aktifDilFiltresi === 'all' || (aktifDilFiltresi === 'tr' ? item.language === 'tr' : item.language === 'en');
    const aE = !aramaMetni || item.title.toLowerCase().includes(aramaMetni.toLowerCase()) || item.sourceName.toLowerCase().includes(aramaMetni.toLowerCase());
    return dE && aE;
  });

  if (yukleniyor) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#090d16', color: '#f8fafc' }}>
        <div style={{ width: '45px', height: '45px', border: '4px solid #1e293b', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <p style={{ fontSize: '15px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.03em' }}>Manşetler yükleniyor ve Türkçe'ye çevriliyor...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  return (
    <main style={{ backgroundColor: '#090d16', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f1f5f9', margin: 0, paddingBottom: '60px' }}>
      
      {/* ULTRA MODERN DARK HEADER */}
      <header style={{ backgroundColor: 'rgba(13, 20, 35, 0.85)', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
          <a href="/" style={{ fontSize: '20px', fontWeight: '900', color: '#fff', textDecoration: 'none', letterSpacing: '-0.02em' }}>NEXUS<span style={{ color: '#3b82f6' }}>NEWS</span></a>
          
          <div style={{ flex: '1', maxWidth: '380px' }}>
            <input placeholder="Haber veya kaynak odaklı arama..." onChange={(e) => setAramaMetni(e.target.value)} style={{ width: '100%', padding: '10px 18px', backgroundColor: '#131c2e', border: '1px solid #22314d', borderRadius: '14px', fontSize: '14px', color: '#fff', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#131c2e', padding: '4px', borderRadius: '12px' }}>
            <button onClick={() => setCeviriAktif(true)} style={{ padding: '8px 16px', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', backgroundColor: ceviriAktif ? '#3b82f6' : 'transparent', color: '#fff' }}>✨ Türkçe Çeviri</button>
            <button onClick={() => setCeviriAktif(false)} style={{ padding: '8px 16px', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', backgroundColor: !ceviriAktif ? '#22314d' : 'transparent', color: '#94a3b8' }}>Orijinal</button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{ maxWidth: '1200px', margin: '40px auto 35px', padding: '0 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '38px', fontWeight: '900', color: '#fff', margin: '0 0 12px', letterSpacing: '-0.03em' }}>Dünya ve Türkiye Gündemi</h1>
        <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '520px', margin: '0 auto 25px' }}>Tüm ulusal basın ve dünya medyasından filtrelenmiş canlı haber akış konsolu.</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <button onClick={() => setAktifDilFiltresi('all')} style={{ padding: '8px 18px', borderRadius: '12px', border: '1px solid #1e293b', cursor: 'pointer', fontSize: '13px', fontWeight: '700', backgroundColor: aktifDilFiltresi === 'all' ? '#3b82f6' : '#131c2e', color: '#fff' }}>Tümü ({filtrelenmisHaberler.length})</button>
          <button onClick={() => setAktifDilFiltresi('tr')} style={{ padding: '8px 18px', borderRadius: '12px', border: '1px solid #1e293b', cursor: 'pointer', fontSize: '13px', fontWeight: '700', backgroundColor: aktifDilFiltresi === 'tr' ? '#3b82f6' : '#131c2e', color: '#fff' }}>🇹🇷 Türkiye</button>
          <button onClick={() => setAktifDilFiltresi('en')} style={{ padding: '8px 18px', borderRadius: '12px', border: '1px solid #1e293b', cursor: 'pointer', fontSize: '13px', fontWeight: '700', backgroundColor: aktifDilFiltresi === 'en' ? '#3b82f6' : '#131c2e', color: '#fff' }}>🌍 Dünya</button>
        </div>
      </section>

      {/* MODERN DARK GRID LAYOUT */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '26px' }}>
          {filtrelenmisHaberler.slice(0, 60).map((item: any, index: number) => (
            <article key={index} onClick={() => setSeciliHaber(item)} style={{ backgroundColor: '#0f172a', borderRadius: '20px', border: '1px solid #1e293b', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s' }}>
              <img src={item.image} alt="" style={{ width: '100%', height: '190px', objectFit: 'cover' }} referrerPolicy="no-referrer" onError={(e:any)=>{e.target.src='https://unsplash.com'}} />
              <div style={{ padding: '22px', flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '3px 9px', borderRadius: '8px', textTransform: 'uppercase' }}>{item.sourceName}</span>
                    {item.cevrildiMi && <span style={{ fontSize: '11px', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>Türkçe Çeviri</span>}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 10px', lineHeight: '1.4', color: '#fff' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>{item.description ? item.description.slice(0, 110) + '...' : 'Haber özetini okumak için tıklayın.'}</p>
                </div>
                <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #1e293b', textAlign: 'right', fontSize: '13px', color: '#3b82f6', fontWeight: '700' }}>Gelişmeleri Oku →</div>
              </div>
            </article>
          ))}
        </div>
        {!filtrelenmisHaberler.length && <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Filtrelere uygun haber akışı bulunamadı.</div>}
      </section>

      {/* PREMIUM MODAL POPUP */}
      {seciliHaber && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 8, 15, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '20px' }} onClick={() => setSeciliHaber(null)}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '28px', maxWidth: '620px', width: '100%', maxHeight: '82vh', overflowY: 'auto', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'relative', width: '100%', height: '260px' }}>
              <img src={seciliHaber.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" onError={(e:any)=>{e.target.src='https://unsplash.com'}} />
              <button onClick={() => setSeciliHaber(null)} style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: '#090d16', border: '1px solid #1e293b', color: '#fff', width: '34px', height: '34px', borderRadius: '50%', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '28px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '4px 12px', borderRadius: '8px', textTransform: 'uppercase' }}>{seciliHaber.sourceName}</span>
              <h2 style={{ fontSize: '21px', fontWeight: '800', margin: '18px 0 12px', lineHeight: '1.4', color: '#fff' }}>{seciliHaber.title}</h2>
              <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.7', margin: '0 0 25px' }}>{seciliHaber.description || "Bu haber için detaylı özet metni bulunmuyor."}</p>
              <div style={{ borderTop: '1px solid #1e293b', paddingTop: '18px', display: 'flex', justifyContent: 'flex-end' }}>
                <a href={seciliHaber.link} target="_blank" rel="noreferrer" style={{ backgroundColor: '#3b82f6', color: '#fff', textDecoration: 'none', padding: '10px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: '700', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)' }}>Haber Kaynağına Git ↗</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
