import type { Metadata } from "next";
import { Cinzel, Noto_Serif_JP, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "六神ノ間 ─ Six Oracle",
  description:
    "11人のAI占い師による神秘のチャット占い。四柱推命・易経・タロット・西洋占星術など多彩な占術であなたの運命を紐解きます。",
  keywords: [
    "占い",
    "AI占い",
    "チャット占い",
    "四柱推命",
    "タロット",
    "西洋占星術",
    "易経",
    "六神ノ間",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${cinzel.variable} ${notoSerifJP.variable} ${notoSansJP.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
