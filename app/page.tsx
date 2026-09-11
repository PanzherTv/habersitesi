import { getNews } from "@/lib/rss";

export const revalidate = 300;

type Props = { searchParams: Promise<{ q?: string; cat?: string }> };

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const q = (params.q || "").trim().toLocaleLowerCase("tr-TR");
  const cat = params.cat || "all";
  const { items, sourceCount } = await getNews();
  const categories = Array.from(new Set(items.map(x => x.category))).filter(Boolean).sort((a,b) => a.localeCompare(b,"tr"));
  const filtered = items.filter(item => {
    const cm = cat === "all" || item.category === cat;
    const qm = !q || [item.title,item.description,item.sourceName].some(v => v.toLocaleLowerCase("tr-TR").includes(q));
    return cm && qm;
  });
  return <main>
    <header className="top"><a href="/" className="brand">AKIŞ<span>.</span></a><form><input name="q" defaultValue={params.q || ""} placeholder="Haberlerde ara..."/><button>Ara</button></form><b>● CANLI</b></header>
    <section className="hero"><small>TÜRKİYE + DÜNYA HABER RADARI</small><h1>Gündem tek akışta.<br/><i>Gürültü olmadan.</i></h1><p>RSS ve Atom kaynaklarından gelen haberleri tek, hızlı ve sade bir akışta takip et.</p><div><strong>{filtered.length}</strong> haber　<strong>{sourceCount}</strong> kaynak　<strong>5 dk</strong> yenileme</div></section>
    <section className="feed"><div className="head"><div><small>SON GELENLER</small><h2>{q ? `“${params.q}” sonuçları` : "Bugünün akışı"}</h2></div><nav><a className={!q && cat === "all" ? "active" : ""} href="/">Tümü</a>{categories.slice(0,10).map(c=><a className={cat===c?"active":""} key={c} href={`/?cat=${encodeURIComponent(c)}`}>{c}</a>)}</nav></div>
      <div className="grid">{filtered.slice(0,60).map((item,i)=><article className={i===0?"featured":""} key={item.id}>{item.image?<img src={item.image} alt=""/>:<div className="fallback">{item.sourceShortName}</div>}<div><small>{item.category} · {item.sourceName}</small><h3><a href={item.link} target="_blank" rel="noreferrer">{item.title}</a></h3>{item.description&&<p>{item.description.slice(0,170)}{item.description.length>170?"…":""}</p>}<a className="source" href={item.link} target="_blank" rel="noreferrer">Kaynağa git →</a></div></article>)}</div>
      {!filtered.length&&<div className="empty">Sonuç bulunamadı.</div>}
    </section>
    <footer>AKIŞ — RSS news aggregator · İçerik ve görseller ilgili yayıncılara aittir.</footer>
  </main>;
}
