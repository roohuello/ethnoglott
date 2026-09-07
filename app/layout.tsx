import type { Metadata } from "next";
import { Bricolage_Grotesque, Google_Sans_Code, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  weight: "variable",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  weight: "variable",
  subsets: ["latin"],
});

const googleSansCode = Google_Sans_Code({
  variable: "--font-google-sans-code",
  weight: "variable",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ethnoglott — Ethnic groups of the world",
  description: "Saving the world's ethnic languages before they're lost",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bricolage.variable} ${googleSansCode.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
