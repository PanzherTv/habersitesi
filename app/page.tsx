'use client';

import { useState, useEffect } from 'react';
import { getNews } from "@/lib/rss";

async function turkceyeCevir(metin: string): Promise<string> {
  if (!metin) return "";
  try {
    const res = await fetch(`https://googleapis.com{encodeURIComponent(metin)}`);
    const data = await res.json();
    return data.map((item: any) => item).join('');
  } catch (error) {
    return metin;
  }
}

export default function Home({ searchParams }: { searchParams: any }) {
  const [params, setParams] = useState<any>(null);
  const [originalItems, setOriginalItems] = useState<any[]>([]);
  const [processedItems, setProcessedItems] = useState<any[]>([]);
  const [sourceCount, setSourceCount] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [seciliHaber, setSeciliHaber] = useState<any>(null);
  const [ceviriAktif, setCeviriAktif] = useState(true);

  useEffect(() => {
    async function verileriGetir() {
      try {
        const resolvedParams = await searchParams;
        setParams(resolvedParams);
        const response = await fetch('/api/feeds'); 
        const data = await response.json();
        if (data && data.items) {
          setSourceCount(data.sourceCount || 0);
          setOriginalItems(data.items);
          setProcessedItems(data.items);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setYukleniyor(false);
      }
    }
    verileriGetir();
  }, [searchParams]);

  useEffect(() => {
    async function ceviriModunuUygula() {
      if (originalItems.length === 0) return;
      if (ceviriAktif) {
        setYukleniyor(true);
        const cevrilmisHaberler = await Promise.all(
          originalItems.map(async (item: any) => {
            if (item.language && item.language !== "tr") {
              const cb = await turkceyeCevir(item.title);
              const ca = await turkceyeCevir(item.description || "");
              return { ...item, title: cb, description: ca, cevrildiMi: true };
            }
            return item;
          })
        );
        setProcessedItems(cevrilmisHaberler);
        setYukleniyor(false);
      } else {
        setProcessedItems(originalItems);
      }
    }
    ceviriModunuUygula();
  }, [ceviriAktif, originalItems]);

  if (!params || yukleniyor) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', color: '#1e293b' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #cbd5e1', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ fontSize: '16px', fontWeight: '500' }}>Gündem optimize ediliyor...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const q = (params.q || "").trim().toLocaleLowerCase("tr-TR");
  const cat = params.cat || "all";
  const lang = params.lang || "all";
  const categories = Array.from(new Set(processedItems.map(x => x.category))).filter(Boolean).sort((a: any, b: any) => a.localeCompare(b, "tr"));
  
  const filtered = processedItems.filter(item => {
    const cm = cat === "all" || item.category === cat;
    const lm = lang === "all" || (lang === "tr" ? item.language === "tr" : item.language !== "tr");
    const qm = !q || [item.title, item.description, item.sourceName].some(v => v?.toLocaleLowerCase("tr-TR").includes(q));
    return cm && lm && qm;
  });

  const href = (extra: string) => `/?${[q ? `q=${encodeURIComponent(q)}` : "", lang !== "all" ? `lang=${lang}` : "", extra].filter(Boolean).join("&")}`;

  return (
    <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#0f172a', margin: 0, paddingBottom: '40px' }}>
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
          <a href="/" style={{ fontSize: '22px', fontWeight: '800', color: '#1e3a8a', textDecoration: 'none' }}>AKIŞ<span style={{ color: '#2563eb' }}>.</span></a>
          <form style={{ flex: '1', maxWidth: '400px', display: 'flex', gap: '8px' }}>
            <input name="q" defaultValue={params.q || ""} placeholder="Haberlerde ara..." style={{ width: '100%', padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '14px', outline: 'none' }} />
            <button style={{ backgroundColor: '#1e293b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Ara</button>
          </form>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            <button onClick={() => setCeviriAktif(true)} style={{ padding: '6px 12px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', backgroundColor: ceviriAktif ? '#2563eb' : 'transparent', color: ceviriAktif ? '#fff' : '#475569' }}>✨ Türkçe Çevir</button>
            <button onClick={() => setCeviriAktif(false)} style={{ padding: '6px 12px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', backgroundColor: !ceviriAktif ? '#475569' : 'transparent', color: !ceviriAktif ? '#fff' : '#475569' }}>📄 Orijinal Dil</button>
          </div>
        </div>
      </header>

      <section style={{ maxWidth: '1200px', margin: '30px auto 0', padding: '0 20px', textAlign: 'center' }}>
        <small style={{ color: '#2563eb', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '12px' }}>TÜRKİYE + DÜNYA HABER RADARI</small>
        <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', margin: '10px 0', lineHeight: '1.2' }}>Dünyanın Gündemi <br/><span style={{ color: '#2563eb', fontStyle: 'italic' }}>Tek Akışta.</span></h1>
        <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <span>🔥 <strong>{filtered.length}</strong> Aktif Haber</span>
          <span>🔌 <strong>{sourceCount}</strong> Global Kaynak</span>
        </div>
      </section>

      <section style={{ maxWidth: '1200px', margin: '40px auto 0', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{q ? `“${params.q}” Sonuçları` : lang === "tr" ? "🇹🇷 Sadece Türkçe Haberler" : lang === "world" ? "🌍 Sadece Dünya Basını" : "⚡ Bugünün Akışı"}</h2>
          <nav style={{ display: 'flex', gap: '8px' }}>
            <a href={q ? `/?q=${encodeURIComponent(params.q || "")}` : "/"} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', textDecoration: 'none', backgroundColor: lang === 'all' ? '#fff' : 'transparent', color: lang === 'all' ? '#2563eb' : '#64748b' }}>Tümü</a>
            <a href={href("lang=tr")} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', textDecoration: 'none', backgroundColor: lang === 'tr' ? '#fff' : 'transparent', color: lang === 'tr' ? '#2563eb' : '#64748b' }}>TR</a>
            <a href={href("lang=world")} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '500', textDecoration: 'none', backgroundColor: lang === 'world' ? '#fff' : 'transparent', color: lang === 'world' ? '#2563eb' : '#64748b' }}>Dünya</a>
          </nav>
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '25px' }}>
          {categories.slice(0, 14).map((c: any) => (
            <a href={href(`cat=${encodeURIComponent(c)}`)} key={c} style={{ whiteSpace: 'nowrap', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', textDecoration: 'none', backgroundColor: cat === c ? '#1e293b' : '#fff', color: cat === c ? '#fff' : '#475569', border: '1px solid #e2e8f0' }}>{c}</a>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filtered.slice(0, 60).map((item, i) => (
            <article key={item.id} onClick={() => setSeciliHaber(item)} style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
              {item.image ? (
                <img src={item.image} alt="" style={{ width: '100%', height: '190px', objectFit: 'cover' }} referrerPolicy="no-referrer" />
              ) : (
                <div style={{ width: '100%', height: '190px', backgroundColor: '#e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '700', color: '#94a3b8', fontSize: '20px' }}>{item.sourceShortName || "HABER"}</div>
              )}
              <div style={{ padding: '20px', flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>{item.sourceName}</span>
                    {item.cevrildiMi && <span style={{ fontSize: '11px', color: '#16a34a', backgroundColor: '#f0fdf4', padding: '2px 6px', borderRadius: '6px' }}>🇹🇷 Çeviri</span>}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 10px 0', lineHeight: '1.4', color: '#1e293b' }}>{item.title}</h3>
                  {item.description && <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: 0 }}>{item.description.replace(/<[^>]*>/g, '').slice(0, 120)}...</p>}
                </div>
                <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{item.category || "Genel"}</span>
                  <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>Detayları Oku →</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        {!filtered.length && <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Kriterlere uygun haber bulunamadı.</div>}
      </section>
      {seciliHaber && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: '20px' }} onClick={() => setSeciliHaber(null)}>
          <div style={{ backgroundColor: '#fff', borderRadius: '24px', maxWidth: '650px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '0', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            {seciliHaber.image && (
              <div style={{ position: 'relative', width: '100%', height: '280px' }}>
                <img src={seciliHaber.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                <button onClick={() => setSeciliHaber(null)} style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✕</button>
              </div>
            )}
            <div style={{ padding: '30px' }}>
              {!seciliHaber.image && <button onClick={() => setSeciliHaber(null)} style={{ float: 'right', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>✕</button>}
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb', backgroundColor: '#eff6ff', padding: '4px 10px', borderRadius: '8px', textTransform: 'uppercase' }}>{seciliHaber.sourceName}</span>
                <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '12px' }}>{seciliHaber.category}</span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 15px 0', lineHeight: '1.3' }}>{seciliHaber.title}</h2>
              <p style={{ fontSize: '15px', color: '#334155', lineHeight: '1.6', margin: '0 0 25px 0' }}>
                {seciliHaber.description?.replace(/<[^>]*>/g, '') || "Bu haber içeriği için bir özet metni bulunmuyor."}
              </p>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Dil: {seciliHaber.language?.toUpperCase()}</span>
                <a href={seciliHaber.link} target="_blank" rel="noreferrer" style={{ backgroundColor: '#2563eb', color: '#fff', textDecoration: 'none', padding: '10px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600' }}>
                  Haber Kaynağına Git ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '60px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
        AKIŞ — Tüm Hakları İlgili Basın Kuruluşlarına Aittir.
      </footer>
    </main>
  );
}
