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
  
  const [doviz, setDoviz] = useState({ dolar: '34.35', euro: '37.18', altin: '3.025' });
  const [havaDurumu] = useState([
    { sehir: "Kuşadası", derece: "28°C", durum: "☀️ Güneşli" },
    { sehir: "Aydın", derece: "31°C", durum: "☀️ Açık" },
    { sehir: "İstanbul", derece: "24°C", durum: "☁️ Bulutlu" },
    { sehir: "Ankara", derece: "22°C", durum: "☀️ Açık" }
  ]);

  useEffect(() => {
    async function verileriKendiSunucumuzdanCek() {
      try {
        const res = await fetch('/api/feeds');
        const data = await res.json();
        if (data) {
          setOriginalItems(data.items || []);
          setProcessedItems(data.items || []);
          if (data.doviz) setDoviz(data.doviz);
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
    async function ceviriModunuIsle() {
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
    ceviriModunuIsle();
  }, [ceviriAktif, originalItems]);

  const filtrelenmisHaberler = processedItems.filter(item => {
    const dE = aktifDilFiltresi === 'all' || (aktifDilFiltresi === 'tr' ? item.language === 'tr' : item.language === 'en');
    const aE = !aramaMetni || item.title.toLowerCase().includes(aramaMetni.toLowerCase()) || item.sourceName.toLowerCase().includes(aramaMetni.toLowerCase());
    return dE && aE;
  });

  if (yukleniyor) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#0a0f1d', color: '#f8fafc' }}>
        <div style={{ width: '45px', height: '45px', border: '4px solid #1e293b', borderTopColor: '#e11d48', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <p style={{ fontSize: '15px', fontWeight: '700', color: '#94a3b8' }}>Portal Verileri Vercel Sunucusunda Güncelleniyor...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const mansetHaberi = filtrelenmisHaberler;
  const normalHaberler = filteredHaberler = filtrelenmisHaberler.slice(1, 46);
  return (
    <main style={{ backgroundColor: '#0a0f1d', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#f1f5f9', margin: 0, paddingBottom: '60px' }}>
      
      {/* 📈 FINANS VE HAVA DURUMU BARI */}
      <div style={{ backgroundColor: '#070b14', borderBottom: '1px solid #1e293b', padding: '10px 20px', fontSize: '12px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '15px' }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>📊 CANLI PİYASALAR:</span>
          <span>Dolar: <strong style={{ color: '#10b981' }}>{doviz.dolar} TL</strong></span>
          <span>Euro: <strong style={{ color: '#10b981' }}>{doviz.euro} TL</strong></span>
          <span>Altın (Gr): <strong style={{ color: '#eab308' }}>{doviz.altin} TL</strong></span>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>☀️ HAVA DURUMU:</span>
          {havaDurumu.map((h, i) => (
            <span key={i} style={{ backgroundColor: '#131e35', padding: '3px 8px', borderRadius: '6px' }}>{h.sehir}: <strong>{h.derece}</strong> <small style={{ color: '#94a3b8' }}>{h.durum}</small></span>
          ))}
        </div>
      </div>

      <header style={{ backgroundColor: '#0d1527', borderBottom: '3px solid #e11d48', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '15px 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
          <a href="/" style={{ fontSize: '24px', fontWeight: '900', color: '#fff', textDecoration: 'none' }}>HABER<span style={{ color: '#e11d48', backgroundColor: '#fff', padding: '2px 8px', borderRadius: '6px', marginLeft: '4px' }}>MEDYA</span></a>
          <div style={{ flex: '1', maxWidth: '400px' }}>
            <input placeholder="Manşetlerde veya kaynaklarda ara..." onChange={(e) => setAramaMetni(e.target.value)} style={{ width: '100%', padding: '11px 18px', backgroundColor: '#131e35', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '14px', color: '#fff', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#131e35', padding: '4px', borderRadius: '12px' }}>
            <button onClick={() => setCeviriAktif(true)} style={{ padding: '8px 16px', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', backgroundColor: ceviriAktif ? '#e11d48' : 'transparent', color: '#fff' }}>✨ Türkçe Çeviri</button>
            <button onClick={() => setCeviriAktif(false)} style={{ padding: '8px 16px', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', backgroundColor: !ceviriAktif ? '#1e293b' : 'transparent', color: '#94a3b8' }}>Orijinal Dil</button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1300px', margin: '30px auto 0', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #1e293b', paddingBottom: '15px' }}>
          <button onClick={() => setAktifDilFiltresi('all')} style={{ padding: '8px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', backgroundColor: aktifDilFiltresi === 'all' ? '#e11d48' : '#131e35', color: '#fff' }}>Tüm Manşetler ({filtrelenmisHaberler.length})</button>
          <button onClick={() => setAktifDilFiltresi('tr')} style={{ padding: '8px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', backgroundColor: aktifDilFiltresi === 'tr' ? '#e11d48' : '#131e35', color: '#fff' }}>🇹🇷 Ulusal Basın</button>
          <button onClick={() => setAktifDilFiltresi('en')} style={{ padding: '8px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', backgroundColor: aktifDilFiltresi === 'en' ? '#e11d48' : '#131e35', color: '#fff' }}>🌍 Dünya Basını</button>
        </div>

        {mansetHaberi && !aramaMetni && (
          <section onClick={() => setSeciliHaber(mansetHaberi)} style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '24px', overflow: 'hidden', marginBottom: '40px', cursor: 'pointer' }}>
            <img src={mansetHaberi.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,15,29,1) 0%, rgba(10,15,29,0.3) 70%, transparent 100%)' }}></div>
            <div style={{ position: 'absolute', bottom: '30px', left: '30px', right: '30px' }}>
              <span style={{ backgroundColor: '#e11d48', color: '#fff', fontSize: '11px', fontWeight: '800', padding: '5px 12px', borderRadius: '6px' }}>🔥 MANŞET · {mansetHaberi.sourceName}</span>
              <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#fff', margin: '15px 0 10px' }}>{mansetHaberi.title}</h2>
              <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0 }}>{mansetHaberi.description}</p>
            </div>
          </section>
        )}

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
          {normalHaberler.map((item: any, index: number) => (
            <article key={index} onClick={() => setSeciliHaber(item)} style={{ backgroundColor: '#0d1527', borderRadius: '18px', border: '1px solid #1c2638', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
              <div style={{ position: 'relative' }}>
                <img src={item.image} alt="" style={{ width: '100%', height: '180px', objectFit: 'cover' }} referrerPolicy="no-referrer" onError={(e:any)=>{e.target.src='https://unsplash.com'}} />
                <span style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: '#e11d48', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px' }}>{item.logo} {item.sourceName}</span>
              </div>
              <div style={{ padding: '20px', flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 10px', color: '#fff', lineHeight: '1.4' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>{item.description ? item.description.slice(0, 110) + '...' : 'Okumak için tıklayın.'}</p>
                </div>
                <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #1c2638', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  {item.cevrildiMi && <span style={{ color: '#10b981', fontWeight: '700' }}>🇹🇷 Çeviri</span>}
                  <span style={{ color: '#e11d48', fontWeight: '700', marginLeft: 'auto' }}>Oku →</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>

      {seciliHaber && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 8, 17, 0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '20px' }} onClick={() => setSeciliHaber(null)}>
          <div style={{ backgroundColor: '#0d1527', border: '1px solid #1c2638', borderRadius: '24px', maxWidth: '640px', width: '100%', maxHeight: '82vh', overflowY: 'auto', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'relative', width: '100%', height: '260px' }}>
              <img src={seciliHaber.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
              <button onClick={() => setSeciliHaber(null)} style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: '#0a0f1d', border: '1px solid #1c2638', color: '#fff', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '28px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#fff', backgroundColor: '#e11d48', padding: '4px 12px', borderRadius: '6px' }}>{seciliHaber.logo} {seciliHaber.sourceName}</span>
              <h2 style={{ fontSize: '20px', fontWeight: '900', margin: '18px 0 12px', color: '#fff' }}>{seciliHaber.title}</h2>
              <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.7' }}>{seciliHaber.description}</p>
              <div style={{ borderTop: '1px solid #1c2638', paddingTop: '18px', display: 'flex', justifyContent: 'flex-end' }}>
                <a href={seciliHaber.link} target="_blank" rel="noreferrer" style={{ backgroundColor: '#e11d48', color: '#fff', textDecoration: 'none', padding: '10px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: '700' }}>Haber Kaynağına Git ↗</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
