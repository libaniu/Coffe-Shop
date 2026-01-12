import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// PENGATURAN METADATA
export const metadata: Metadata = {
  // 1. Base URL wajib ada supaya link gambar jadi https://... (bukan relative)
  metadataBase: new URL('https://ruang-nadi-web.vercel.app'), 

  title: 'Ruang Nadi - Coffee Shop & Creative Space',
  description: 'Nikmati kopi terbaik dan suasana nyaman di Ruang Nadi.',

  openGraph: {
    title: 'Ruang Nadi - Coffee Shop & Creative Space',
    description: 'Nikmati kopi terbaik dan suasana nyaman di Ruang Nadi.',
    url: 'https://ruang-nadi-web.vercel.app',
    siteName: 'Ruang Nadi',
    locale: 'id_ID',
    type: 'website',
    // CATATAN: Bagian 'images' dihapus karena Next.js OTOMATIS 
    // mengambil dari file app/opengraph-image.png kamu.
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* SCRIPT MIDTRANS */}
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}