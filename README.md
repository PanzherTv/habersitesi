# AKIŞ — Global RSS Haber Aggregator

Türkiye ve dünyadaki geniş RSS kaynaklarını tek modern Next.js haber akışında birleştirir.

## Kaynak mimarisi

Proje, tek tek yüzlerce siteyi sabit kodlamak yerine geniş bir OPML RSS dizinini dinamik olarak okur. Varsayılan dizin:

`https://webisso.github.io/swipe-rss/feeds.opml`

Dizin; Türkçe ve İngilizce dahil çok sayıda kaynak ile teknoloji, bilim, spor, ekonomi, kültür, eğlence vb. kategoriler içeriyor. Dizinden erişilemeyen durumda TRT Haber, Habertürk, Sözcü, DonanımHaber, Webtekno, Webrazzi, BBC World ve The Guardian fallback olarak kullanılır.

## Özellikler

- Dinamik OPML feed discovery
- Türkiye + dünya + teknoloji + bilim + ekonomi + spor + kültür vb.
- RSS/Atom parsing
- 12 feed eşzamanlı fetch
- Feed başına son 12 haber
- Duplicate temizleme
- 5 dk haber cache / 1 saat OPML cache
- Arama ve kategori filtreleri
- Responsive modern arayüz
- `/api/feeds` JSON endpoint
- Bir feed bozulduğunda diğerlerinin devam etmesi

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

## Özel OPML

`.env.local`:

```env
FEED_DIRECTORY_URL=https://ornek.com/feeds.opml
```

## Önemli

"Dünyadaki tüm haber siteleri" teknik olarak sabit ve tamamlanabilir bir liste değildir: yeni siteler açılır, RSS URL'leri değişir, bazı yayıncılar RSS sağlamaz veya erişimi sınırlar. Bu nedenle OPML tabanlı dinamik mimari kullanılmıştır.

Uygulama tam haber metnini kopyalamak yerine RSS meta/özet bilgisini gösterip orijinal yayına yönlendirir. Her yayıncının RSS kullanım koşulları ve telif şartları ayrıca kontrol edilmelidir.
