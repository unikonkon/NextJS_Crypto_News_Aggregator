import type { Metadata, Viewport } from "next";
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
  title: "💸 Crypto News - ข่าวคริปโตแบบ Real-time พร้อม AI Analysis",
  description: "เว็บไซต์รวบรวมข่าวคริปโตเคอร์เรนซีจากหลายแหล่ง พร้อมการวิเคราะห์ sentiment และ trending score โดย AI ในรูปแบบ Crypto News Theme",
  keywords: "crypto, cryptocurrency, bitcoin, ethereum, BTC, ETH, news, AI analysis, sentiment analysis, Crypto News, real-time, trending",
  authors: [{ name: "Crypto News Team" }],
  creator: "Crypto News",
  publisher: "Crypto News",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "💸 Crypto News - Crypto News Aggregator",
    description: "ข่าวคริปโตล่าสุดพร้อมการวิเคราะห์ AI แบบ Real-time",
    type: "website",
    locale: "th_TH",
    siteName: "Crypto News",
  },
  twitter: {
    card: "summary_large_image",
    title: "💸 Crypto News",
    description: "ข่าวคริปโตล่าสุดพร้อมการวิเคราะห์ AI แบบ Real-time",
    creator: "@neonfinance",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#00d9ff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0b0f' },
  ],
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0a0b0f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900`}
      >
        <div className="relative min-h-screen">
          {/* Neon Background Pattern */}
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />
          
          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
