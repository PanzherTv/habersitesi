import { getNews } from "@/lib/rss";

export const revalidate = 300;

type Props = { searchParams: Promise<{ q?: string; cat?: string; lang?: string }> };

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const q = (params.q || "").trim().toLocaleLowerCase("tr-TR");
  const cat = params.cat || "all";
  const lang = params.lang || "all";
  const { items, sourceCount } = await getNews();
  const categories = Array.from(new Set(items.map(x => x.category))).filter(Boolean).sort((a,b) => a.localeCompare(b,"tr"));
  const filtered = items.filter(item => {
    const cm = cat === "all" || item.category === cat;
    const lm = lang === "all" || (lang === "tr" ? item.language === "tr" : item.language !== "tr");
    const qm = !q || [item.title,item.description,item.sourceName].some(v => v.toLocaleLowerCase("tr-TR").includes(q));
    return cm && lm && qm;
  });
  const href = (extra: string) => `/?${[q ? `q=${encodeURIComponent(q)}` : "", lang !== "all" ? `lang=${lang}` : "", extra].filter(Boolean).join("&")}`;

  return <main>
    <header className="top">
      <a href="/" className="brand">AKIŞ<span>.</span></a>
      <form><input name="q" defaultValue={params.q || ""} placeholder="Haberlerde ara..."/><button>Ara</button></form>
      <b>● CANLI</b>
    </header>

    <section className="hero">
      <small>TÜRKİYE + DÜNYA HABER RADARI</small>
      <h1>Dünyanın gündemi<br/><i>Türkçe tek akışta.</i></h1>
      <p>Türkiye ve dünyanın farklı dillerindeki RSS/Atom haber kaynaklarını tek, hızlı ve sade bir akışta takip et.</p>
      <div><strong>{filtered.length}</strong> haber　<strong>{sourceCount}</strong> kaynak　<strong>5 dk</strong> yenileme</div>
    </section>

    <section className="feed">
      <div className="head">
        <div><small>SON GELENLER</small><h2>{q ? `“${params.q}” sonuçları` : lang === "tr" ? "Türkçe haberler" : lang === "world" ? "Dünya haberleri" : "Bugünün akışı"}</h2></div>
        <nav>
          <a className={lang === "all" ? "active" : ""} href={q ? `/?q=${encodeURIComponent(params.q || "")}` : "/"}>Tümü</a>
          <a className={lang === "tr" ? "active" : ""} href={href("lang=tr")}>🇹🇷 Türkçe</a>
          <a className={lang === "world" ? "active" : ""} href={href("lang=world")}>🌍 Dünya</a>
        </nav>
      </div>

      <div className="categories">
        {categories.slice(0,14).map(c => <a className={cat===c?"active":""} key={c} href={href(`cat=${encodeURIComponent(c)}`)}>{c}</a>)}
      </div>

      <div className="grid">
        {filtered.slice(0,60).map((item,i)=><article className={i===0?"featured":""} key={item.id}>
          {item.image?<img src={item.image} alt="" referrerPolicy="no-referrer"/>:<div className="fallback">{item.sourceShortName}</div>}
          <div>
            <small>{item.category} · {item.sourceName} · {item.language.toUpperCase()}</small>
            <h3><a href={item.link} target="_blank" rel="noreferrer">{item.title}</a></h3>
            {item.description&&<p>{item.description.slice(0,170)}{item.description.length>170?"…":""}</p>}
            <a className="source" href={item.link} target="_blank" rel="noreferrer">Kaynağa git →</a>
          </div>
        </article>)}
      </div>
      {!filtered.length&&<div className="empty">Sonuç bulunamadı.</div>}
    </section>
    <footer>AKIŞ — Türkiye + dünya RSS haber okuyucu · İçerik ve görseller ilgili yayıncılara aittir.</footer>
  </main>;
}
