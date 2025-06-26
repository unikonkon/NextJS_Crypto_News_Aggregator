import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crypto News Aggregator - ข่าวคริปโตล่าสุดพร้อมการวิเคราะห์ AI",
  description: "รวบรวมข่าวคริปโตเคอร์เรนซีจากแหล่งต่างๆ พร้อมการวิเคราะห์ sentiment และ trending score โดย AI",
  keywords: "crypto, cryptocurrency, bitcoin, ethereum, news, AI analysis, sentiment analysis",
  openGraph: {
    title: "Crypto News Aggregator",
    description: "ข่าวคริปโตล่าสุดพร้อมการวิเคราะห์ AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypto News Aggregator",
    description: "ข่าวคริปโตล่าสุดพร้อมการวิเคราะห์ AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
