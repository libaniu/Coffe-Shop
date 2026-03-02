import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ruang-nadi-web.vercel.app"),

  title: "Ruang Nadi - Coffee Shop & Creative Space",
  description: "Nikmati kopi terbaik dan suasana nyaman di Ruang Nadi.",
  keywords: [
    "kopi",
    "coffee shop",
    "cafe",
    "nongkrong",
    "ruang nadi",
    "creative space",
    "kuliner",
  ],

  openGraph: {
    title: "Ruang Nadi - Coffee Shop & Creative Space",
    description: "Nikmati kopi terbaik dan suasana nyaman di Ruang Nadi.",
    url: "https://ruang-nadi-web.vercel.app",
    siteName: "Ruang Nadi",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${poppins.variable} antialiased`}>
        {/* SCRIPT MIDTRANS (Tetap aman ditaruh di sini) */}
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
