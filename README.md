# AKIŞ — Türkiye + Dünya RSS Haber

Türkiye ve dünyadaki geniş RSS/Atom kaynaklarını tek modern Next.js haber akışında birleştirir. Arayüz Türkçedir.

## Kaynak mimarisi

Proje, tek tek yüzlerce siteyi sabit kodlamak yerine iki geniş OPML dizinini dinamik olarak okur:

1. `https://webisso.github.io/swipe-rss/feeds.opml` — çok dilli RSS koleksiyonu; Türkçe ve İngilizce kaynaklar ile haber, teknoloji, bilim, spor, ekonomi, kültür ve eğlence kategorileri içerir.
2. `https://raw.githubusercontent.com/hashiverse/news-feeds/main/feeds.opml` — geniş uluslararası haber koleksiyonu.

Dizinlerden biri geçici olarak erişilemezse yerleşik Türkçe + dünya fallback kaynakları kullanılır.

## Özellikler

- 🇹🇷 Türkçe arayüz
- 🇹🇷 Türkçe haber filtresi
- 🌍 Dünya haberleri filtresi
- Dinamik OPML feed discovery
- Türkiye + dünya + teknoloji + bilim + ekonomi + spor + kültür + eğlence vb.
- RSS/Atom parsing
- 12 feed eşzamanlı fetch
- Feed başına son 12 haber
- Duplicate temizleme
- 5 dk haber cache / 1 saat OPML cache
- Arama ve kategori filtreleri
- Responsive modern arayüz
- `/api/feeds` JSON endpoint
- Bir feed bozulduğunda diğerlerinin devam etmesi
- Vercel/Next.js deployment için hazır

## Kurulum

```bash
npm install
npm run dev
```

Production:

```bash
npm run build
npm start
```

## Vercel'e yayınlama

GitHub reposunu Vercel'e import ederek doğrudan deploy edebilirsin. Framework olarak Next.js otomatik algılanır; özel build ayarı gerekmez.

İsteğe bağlı environment variable:

```env
FEED_DIRECTORY_URL=https://webisso.github.io/swipe-rss/feeds.opml
GLOBAL_FEED_DIRECTORY_URL=https://raw.githubusercontent.com/hashiverse/news-feeds/main/feeds.opml
```

## Önemli

"Dünyadaki tüm haber siteleri" teknik olarak sabit ve tamamlanabilir bir liste değildir: yeni siteler açılır, RSS URL'leri değişir, bazı yayıncılar RSS sağlamaz veya erişimi sınırlar. Bu nedenle uygulama, geniş ve güncellenebilir OPML dizinlerini kullanır.

Uygulama tam haber metnini kopyalamak yerine RSS meta/özet bilgisini gösterip orijinal yayına yönlendirir. Her yayıncının RSS kullanım koşulları ve telif şartları ayrıca kontrol edilmelidir.
