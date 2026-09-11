'use client';

import { useState, useEffect } from 'react';

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
  
  const [doviz] = useState({ dolar: '48.60', euro: '56.45', altin: '6.859' });
  const [havaDurumu] = useState([
    { sehir: "Kuşadası", derece: "28°C", durum: "☀️ Güneşli" },
    { sehir: "Aydın", derece: "31°C", durum: "☀️ Açık" },
    { sehir: "İstanbul", derece: "24°C", durum: "🌧️ Yağışlı" },
    { sehir: "Ankara", derece: "31°C", durum: "☀️ Güneşli" }
  ]);

  useEffect(() => {
    async function verileriKendiSunucumuzdanCek() {
      try {
        const res = await fetch('/api/feeds');
        const data = await res.json();
        if (data && data.items) {
          setOriginalItems(data.items);
          setProcessedItems(data.items);
        }
      } catch (e) {
        console.error("API bağlantı hatası.");
      } finally {
        setYukleniyor(false);
      }
    }
    verileriKendiSunucumuzdanCek();
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
        <div style={{ width: '45px', height: '45px', border: '4px solid #1e293b', borderTopColor: '#e11d48', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <p style={{ fontSize: '15px', fontWeight: '700', color: '#94a3b8' }}>Haber akışı Vercel sunucusunda güvenle hazırlanıyor...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const mansetHaberi = filtrelenmisHaberler[0] || null;
  const normalHaberler = filtrelenmisHaberler.slice(1, 46);
  return (
    <main style={{ backgroundColor: '#090d16', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f1f5f9', margin: 0, paddingBottom: '60px' }}>
      
      {/* CANLI FİNANS VE HAVA DURUMU ŞERİDİ */}
      <div style={{ backgroundColor: '#05080f', borderBottom: '1px solid #1e293b', padding: '10px 20px', fontSize: '12px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '15px' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontWeight: 'bold' }}>📈 CANLI BORSALAR:</span>
          <span>Dolar: <strong style={{ color: '#10b981' }}>{doviz.dolar} TL</strong></span>
          <span>Euro: <strong style={{ color: '#10b981' }}>{doviz.euro} TL</strong></span>
          <span>Altın (Gr): <strong style={{ color: '#eab308' }}>{doviz.altin} TL</strong></span>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontWeight: 'bold' }}>☀️ CANLI HAVA DURUMU:</span>
          {havaDurumu.map((h, i) => (
            <span key={i} style={{ backgroundColor: '#131c2e', padding: '3px 8px', borderRadius: '6px' }}>{h.sehir}: <strong>{h.derece}</strong> <small style={{ color: '#94a3b8' }}>{h.durum}</small></span>
          ))}
        </div>
      </div>

      {/* HEADER */}
      <header style={{ backgroundColor: '#0d1527', borderBottom: '3px solid #e11d48', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '15px 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
          <a href="/" style={{ fontSize: '24px', fontWeight: '900', color: '#fff', textDecoration: 'none' }}>HABER<span style={{ color: '#e11d48', backgroundColor: '#fff', padding: '2px 8px', borderRadius: '6px', marginLeft: '4px' }}>MEDYA</span></a>
          <div style={{ flex: '1', maxWidth: '380px' }}>
            <input placeholder="Haber veya kaynak odaklı arama..." onChange={(e) => setAramaMetni(e.target.value)} style={{ width: '100%', padding: '10px 18px', backgroundColor: '#131c2e', border: '1px solid #22314d', borderRadius: '12px', fontSize: '14px', color: '#fff', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#131c2e', padding: '4px', borderRadius: '12px' }}>
            <button onClick={() => setCeviriAktif(true)} style={{ padding: '8px 16px', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', backgroundColor: ceviriAktif ? '#e11d48' : 'transparent', color: '#fff' }}>✨ Türkçe Çeviri</button>
            <button onClick={() => setCeviriAktif(false)} style={{ padding: '8px 16px', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', backgroundColor: !ceviriAktif ? '#1e293b' : 'transparent', color: '#94a3b8' }}>Orijinal</button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1300px', margin: '30px auto 0', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #1e293b', paddingBottom: '15px' }}>
          <button onClick={() => setAktifDilFiltresi('all')} style={{ padding: '8px 18px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', backgroundColor: aktifDilFiltresi === 'all' ? '#e11d48' : '#131c2e', color: '#fff' }}>Tümü ({filtrelenmisHaberler.length})</button>
          <button onClick={() => setAktifDilFiltresi('tr')} style={{ padding: '8px 18px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', backgroundColor: aktifDilFiltresi === 'tr' ? '#e11d48' : '#131c2e', color: '#fff' }}>🇹🇷 Türkiye</button>
          <button onClick={() => setAktifDilFiltresi('en')} style={{ padding: '8px 18px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', backgroundColor: aktifDilFiltresi === 'en' ? '#e11d48' : '#131c2e', color: '#fff' }}>🌍 Dünya</button>
        </div>

        {mansetHaberi && !aramaMetni && (
          <section onClick={() => setSeciliHaber(mansetHaberi)} style={{ position: 'relative', width: '100%', height: '420px', borderRadius: '24px', overflow: 'hidden', marginBottom: '40px', cursor: 'pointer' }}>
            <img src={mansetHaberi.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,15,29,1) 0%, rgba(10,15,29,0.4) 60%, transparent 100%)' }}></div>
            <div style={{ position: 'absolute', bottom: '30px', left: '30px', right: '30px' }}>
              <span style={{ backgroundColor: '#e11d48', color: '#fff', fontSize: '12px', fontWeight: '800', padding: '5px 12px', borderRadius: '6px' }}>🔥 PORTAL MANŞET · {mansetHaberi.sourceName}</span>
              <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#fff', margin: '15px 0 10px', lineHeight: '1.3' }}>{mansetHaberi.title}</h2>
              <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0 }}>{mansetHaberi.description}</p>
            </div>
          </section>
        )}

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '24px' }}>
          {normalHaberler.map((item: any, index: number) => (
            <article key={index} onClick={() => setSeciliHaber(item)} style={{ backgroundColor: '#0f172a', borderRadius: '20px', border: '1px solid #1e293b', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
              <img src={item.image} alt="" style={{ width: '100%', height: '190px', objectFit: 'cover' }} referrerPolicy="no-referrer" onError={(e:any)=>{e.target.src='https://unsplash.com'}} />
              <div style={{ padding: '22px', flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '3px 9px', borderRadius: '8px' }}>{item.logo} {item.sourceName}</span>
                    {item.cevrildiMi && <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>✓ Türkçe Başlık</span>}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 10px', lineHeight: '1.4', color: '#fff' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', margin: 0 }}>{item.description || 'Gelişmeleri okumak için tıklayın.'}</p>
                </div>
                <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #1e293b', textAlign: 'right', fontSize: '13px', color: '#3b82f6', fontWeight: '700' }}>Gelişmeleri Oku →</div>
              </div>
            </article>
          ))}
        </section>
      </div>

      {seciliHaber && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 8, 17, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '20px' }} onClick={() => setSeciliHaber(null)}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '28px', maxWidth: '620px', width: '100%', maxHeight: '82vh', overflowY: 'auto', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'relative', width: '100%', height: '260px' }}>
              <img src={seciliHaber.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
              <button onClick={() => setSeciliHaber(null)} style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: '#090d16', border: '1px solid #1e293b', color: '#fff', width: '34px', height: '34px', borderRadius: '50%', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '28px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '4px 12px', borderRadius: '8px' }}>{seciliHaber.logo} {seciliHaber.sourceName}</span>
              <h2 style={{ fontSize: '21px', fontWeight: '800', margin: '18px 0 12px', color: '#fff' }}>{seciliHaber.title}</h2>
              <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.7', margin: '0 0 25px' }}>{seciliHaber.description}</p>
              <div style={{ borderTop: '1px solid #1e293b', paddingTop: '18px', display: 'flex', justifyContent: 'flex-end' }}>
                <a href={seciliHaber.link} target="_blank" rel="noreferrer" style={{ backgroundColor: '#e11d48', color: '#fff', textDecoration: 'none', padding: '10px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: '700' }}>Haber Kaynağına Git ↗</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
