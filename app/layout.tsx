import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AKIŞ — Global Haber",
  description: "Türkiye ve dünyadan RSS haberlerini tek akışta takip edin."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><body>{children}</body></html>;
}
