import type { Metadata } from "next";
import { Hanken_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Najikko Sathi Media Pvt. Ltd. | Media, Production & Right Sanchar",
  description:
    "Najikko Sathi Media Pvt. Ltd. provides truthful digital media, documentary and video production, advertising, and media training from Anamnagar, Kathmandu.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${hanken.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
