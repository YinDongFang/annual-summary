import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Inter, Lemonada } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lemonada = Lemonada({
  variable: "--font-lemonada",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "情侣年度报告生成器",
  description: "记录你们的美好回忆，生成专属年度报告",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${inter.variable} ${lemonada.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
